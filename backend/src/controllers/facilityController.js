const { query, getClient } = require('../config/database');
const csv = require('csv-parser');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

const getAllFacilities = async (req, res) => {
  try {
    const { facility_type, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = 'SELECT * FROM core_facilities WHERE is_active = true';
    const params = [];
    let paramIndex = 1;
    
    if (facility_type) {
      queryText += ` AND facility_type = $${paramIndex}`;
      params.push(facility_type);
      paramIndex++;
    }
    
    if (search) {
      queryText += ` AND (name ILIKE $${paramIndex} OR short_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    queryText += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM core_facilities WHERE is_active = true';
    const countParams = [];
    let countParamIndex = 1;
    
    if (facility_type) {
      countQuery += ` AND facility_type = $${countParamIndex}`;
      countParams.push(facility_type);
      countParamIndex++;
    }
    
    if (search) {
      countQuery += ` AND (name ILIKE $${countParamIndex} OR short_name ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    
    const countResult = await query(countQuery, countParams);
    
    res.json({
      facilities: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
    });
  } catch (error) {
    console.error('Get all facilities error:', error);
    res.status(500).json({ error: 'Failed to get facilities' });
  }
};

const getFacilityById = async (req, res) => {
  try {
    const facilityResult = await query(
      `SELECT f.*, u.first_name, u.last_name, u.email as manager_email,
              u.first_name || ' ' || u.last_name as facility_manager_name
       FROM core_facilities f
       LEFT JOIN core_users u ON f.facility_manager_id = u.id
       WHERE f.id = $1`,
      [req.params.id]
    );
    
    if (facilityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    const blocksResult = await query(
      'SELECT * FROM core_facility_blocks WHERE facility_id = $1 ORDER BY block_number ASC',
      [req.params.id]
    );
    
    res.json({
      facility: facilityResult.rows[0],
      blocks: blocksResult.rows
    });
  } catch (error) {
    console.error('Get facility by ID error:', error);
    res.status(500).json({ error: 'Failed to get facility' });
  }
};

const createFacility = async (req, res) => {
  try {
    console.log('Create facility request body:', JSON.stringify(req.body, null, 2));
    const body = req.body.facility || req.body;
    const {
      facility_code,
      name,
      short_name,
      facility_type,
      address,
      city,
      district,
      website,
      phone,
      email,
      trade_name,
      commercial_title, // Frontend name
      tax_office,
      tax_number,
      sgk_registration_number,
      nace_code,
      workplace_hazard_class,
      hazard_class, // Frontend name
      block_count,
      bed_count,
      employee_count,
      contractor_employee_count,
      facility_manager_id,
      manager_id, // Frontend name
      blocks: rawBlocks
    } = body;
    
    // Normalize field names
    const finalTradeName = (trade_name || commercial_title || '').trim() || null;
    const finalWorkplaceHazardClass = (workplace_hazard_class || hazard_class || '').trim() || null;
    const finalFacilityManagerId = (facility_manager_id || manager_id || '').trim();
    const finalBlocks = rawBlocks || req.body.blocks || [];
    
    // Process numeric and UUID fields
    const processedFacilityManagerId = (finalFacilityManagerId && finalFacilityManagerId !== '') ? finalFacilityManagerId : null;
    const processedFacilityCode = (facility_code && String(facility_code).trim() !== '') ? facility_code : null;
    const processedBedCount = (bed_count && String(bed_count).trim() !== '') ? parseInt(bed_count) : null;
    const processedEmployeeCount = (employee_count && String(employee_count).trim() !== '') ? parseInt(employee_count) : null;
    const processedContractorEmployeeCount = (contractor_employee_count && String(contractor_employee_count).trim() !== '') ? parseInt(contractor_employee_count) : null;
    const processedBlockCount = (block_count && String(block_count).trim() !== '') ? parseInt(block_count) : 1;

    // Validate required fields
    if (!name || !facility_type) {
      return res.status(400).json({ error: 'Tesis adı ve tipi gereklidir' });
    }
    
    let facilityResult;
    try {
      facilityResult = await query(
        `INSERT INTO core_facilities (
          facility_code, name, short_name, facility_type, address, city, district,
          website, phone, email, trade_name, tax_office, tax_number, 
          sgk_registration_number, nace_code, workplace_hazard_class, 
          block_count, bed_count, employee_count, contractor_employee_count, 
          facility_manager_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21::uuid)
        RETURNING *`,
        [
          processedFacilityCode, name, short_name, facility_type, address, city, district,
          website, phone, email, finalTradeName, tax_office, tax_number, 
          sgk_registration_number, nace_code, finalWorkplaceHazardClass,
          processedBlockCount, processedBedCount, processedEmployeeCount, processedContractorEmployeeCount, 
          processedFacilityManagerId
        ]
      );
    } catch (dbError) {
      console.error('Database error while creating facility:', dbError);
      return res.status(500).json({ error: 'Tesis kaydı başarısız oldu: ' + dbError.message });
    }
    
    const facilityId = facilityResult.rows[0].id;
    
    // Insert blocks if provided
    if (finalBlocks && finalBlocks.length > 0) {
      try {
        for (const block of finalBlocks) {
          const blockName = block.block_name && block.block_name.trim() !== '' ? block.block_name : `Blok ${block.block_number || 1}`;
          await query(
            `INSERT INTO core_facility_blocks (
              facility_id, block_name, block_number, building_construction_year,
              building_height, structure_height, floor_count, closed_area, closed_parking_area
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              facilityId,
              blockName,
              block.block_number || 1,
              block.building_construction_year ? parseInt(block.building_construction_year) : null,
              block.building_height ? parseFloat(block.building_height) : null,
              block.structure_height ? parseFloat(block.structure_height) : null,
              block.floor_count ? parseInt(block.floor_count) : null,
              block.closed_area ? parseFloat(block.closed_area) : null,
              block.closed_parking_area ? parseFloat(block.closed_parking_area) : null
            ]
          );
        }
      } catch (blockError) {
        console.error('Database error while creating blocks:', blockError);
        return res.status(500).json({ error: 'Blok kaydı başarısız oldu: ' + blockError.message });
      }
    }
    
    res.status(201).json({ message: 'Facility created successfully', facility: facilityResult.rows[0] });
  } catch (error) {
    console.error('Create facility error:', error);
    res.status(500).json({ error: 'Tesis oluşturma başarısız: ' + (error.message || 'Bilinmeyen hata') });
  }
};

const updateFacility = async (req, res) => {
  try {
    const body = req.body.facility || req.body;
    const {
      facility_code,
      name,
      short_name,
      facility_type,
      address,
      city,
      district,
      website,
      phone,
      email,
      trade_name,
      commercial_title,
      tax_office,
      tax_number,
      sgk_registration_number,
      nace_code,
      workplace_hazard_class,
      hazard_class,
      block_count,
      bed_count,
      employee_count,
      contractor_employee_count,
      facility_manager_id,
      manager_id,
      blocks: rawBlocks
    } = body;
    
    // Normalize field names
    const finalTradeName = (trade_name || commercial_title || '').trim() || null;
    const finalWorkplaceHazardClass = (workplace_hazard_class || hazard_class || '').trim() || null;
    const finalFacilityManagerId = (facility_manager_id || manager_id || '').trim();
    const finalBlocks = rawBlocks || req.body.blocks || [];
    
    // Process numeric and UUID fields
    const processedFacilityManagerId = (finalFacilityManagerId && finalFacilityManagerId !== '') ? finalFacilityManagerId : null;
    const processedFacilityCode = (facility_code && String(facility_code).trim() !== '') ? facility_code : null;
    const processedBedCount = (bed_count && String(bed_count).trim() !== '') ? parseInt(bed_count) : null;
    const processedEmployeeCount = (employee_count && String(employee_count).trim() !== '') ? parseInt(employee_count) : null;
    const processedContractorEmployeeCount = (contractor_employee_count && String(contractor_employee_count).trim() !== '') ? parseInt(contractor_employee_count) : null;
    const processedBlockCount = (block_count && String(block_count).trim() !== '') ? parseInt(block_count) : 1;
    
    let facilityResult;
    try {
      facilityResult = await query(
        `UPDATE core_facilities 
         SET facility_code = COALESCE($1, facility_code),
             name = COALESCE($2, name),
             short_name = COALESCE($3, short_name),
             facility_type = COALESCE($4, facility_type),
             address = COALESCE($5, address),
             city = COALESCE($6, city),
             district = COALESCE($7, district),
             website = COALESCE($8, website),
             phone = COALESCE($9, phone),
             email = COALESCE($10, email),
             trade_name = COALESCE($11, trade_name),
             tax_office = COALESCE($12, tax_office),
             tax_number = COALESCE($13, tax_number),
             sgk_registration_number = COALESCE($14, sgk_registration_number),
             nace_code = COALESCE($15, nace_code),
             workplace_hazard_class = COALESCE($16, workplace_hazard_class),
             block_count = COALESCE($17, block_count),
             bed_count = COALESCE($18, bed_count),
             employee_count = COALESCE($19, employee_count),
             contractor_employee_count = COALESCE($20, contractor_employee_count),
             facility_manager_id = $21::uuid,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $22
         RETURNING *`,
        [
          processedFacilityCode, name, short_name, facility_type, address, city, district,
          website, phone, email, finalTradeName, tax_office, tax_number, 
          sgk_registration_number, nace_code, finalWorkplaceHazardClass,
          processedBlockCount, processedBedCount, processedEmployeeCount, processedContractorEmployeeCount, 
          processedFacilityManagerId,
          req.params.id
        ]
      );
    } catch (dbError) {
      console.error('Database error while updating facility:', dbError);
      return res.status(500).json({ error: 'Tesis güncellemesi başarısız oldu: ' + dbError.message });
    }
    
    if (facilityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tesis bulunamadı' });
    }

    // Delete existing blocks and insert new ones
    try {
      await query(
        'DELETE FROM core_facility_blocks WHERE facility_id = $1',
        [req.params.id]
      );

      if (finalBlocks && finalBlocks.length > 0) {
        for (const block of finalBlocks) {
          const blockName = block.block_name && block.block_name.trim() !== '' ? block.block_name : `Blok ${block.block_number || 1}`;
          await query(
            `INSERT INTO core_facility_blocks (
              facility_id, block_name, block_number, building_construction_year,
              building_height, structure_height, floor_count, closed_area, closed_parking_area
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              req.params.id,
              blockName,
              block.block_number || 1,
              block.building_construction_year ? parseInt(block.building_construction_year) : null,
              block.building_height ? parseFloat(block.building_height) : null,
              block.structure_height ? parseFloat(block.structure_height) : null,
              block.floor_count ? parseInt(block.floor_count) : null,
              block.closed_area ? parseFloat(block.closed_area) : null,
              block.closed_parking_area ? parseFloat(block.closed_parking_area) : null
            ]
          );
        }
      }
    } catch (blockError) {
      console.error('Database error while updating blocks:', blockError);
      return res.status(500).json({ error: 'Blok güncellemesi başarısız oldu: ' + blockError.message });
    }
    
    res.json({ message: 'Facility updated successfully', facility: facilityResult.rows[0] });
  } catch (error) {
    console.error('Update facility error:', error);
    res.status(500).json({ error: 'Tesis güncellemesi başarısız: ' + (error.message || 'Bilinmeyen hata') });
  }
};

const deleteFacility = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const facilityId = req.params.id;

    // 1. Deactivate Facility
    const result = await client.query(
      'UPDATE core_facilities SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [facilityId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tesis bulunamadı' });
    }

    // 2. Deactivate Facility Blocks
    await client.query(
      'UPDATE core_facility_blocks SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE facility_id = $1',
      [facilityId]
    );

    // 3. Deactivate Areas (Mahal)
    await client.query(
      'UPDATE core_areas SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE facility_id = $1',
      [facilityId]
    );

    // 4. Deactivate Assets (Envanter)
    await client.query(
      'UPDATE eams_assets SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE facility_id = $1',
      [facilityId]
    );

    // 5. Cancel Fault Requests (Arıza Kayıtları)
    await client.query(
      "UPDATE eams_fault_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE facility_id = $1 AND status NOT IN ('completed', 'cancelled')",
      [facilityId]
    );

    // 6. Deactivate Maintenance Plans (Bakım Planları)
    // Maintenance plans are linked to assets. Since assets are deactivated, we also deactivate plans for those assets.
    await client.query(
      'UPDATE eams_maintenance_plans mp SET is_active = false, updated_at = CURRENT_TIMESTAMP FROM eams_assets a WHERE mp.asset_id = a.id AND a.facility_id = $1',
      [facilityId]
    );

    // 7. Deactivate User Roles for this facility
    // This prevents users from accessing the facility via their roles.
    // Note: user_roles doesn't have is_active, so we might need to delete them or add is_active.
    // For now, removing them is safer for consistency if the facility is "deleted".
    await client.query(
      'DELETE FROM core_user_roles WHERE facility_id = $1',
      [facilityId]
    );

    await client.query('COMMIT');
    res.json({ message: 'Tesis ve bağlı tüm veriler (mahal, envanter vb.) başarıyla silindi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete facility error:', error);
    res.status(500).json({ error: 'Tesis silme işlemi başarısız oldu' });
  } finally {
    client.release();
  }
};

const getFacilityBlocks = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM core_facility_blocks WHERE facility_id = $1 ORDER BY block_number ASC',
      [req.params.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get facility blocks error:', error);
    res.status(500).json({ error: 'Failed to get facility blocks' });
  }
};

const addBlock = async (req, res) => {
  try {
    const {
      block_name,
      block_number,
      building_construction_year,
      building_height,
      structure_height,
      floor_count,
      closed_area,
      closed_parking_area
    } = req.body;
    
    const result = await query(
      `INSERT INTO core_facility_blocks (
        facility_id, block_name, block_number, building_construction_year,
        building_height, structure_height, floor_count, closed_area, closed_parking_area
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        req.params.id, block_name, block_number, building_construction_year,
        building_height, structure_height, floor_count, closed_area, closed_parking_area
      ]
    );
    
    res.status(201).json({ message: 'Block added successfully', block: result.rows[0] });
  } catch (error) {
    console.error('Add block error:', error);
    res.status(500).json({ error: 'Failed to add block' });
  }
};

const updateBlock = async (req, res) => {
  try {
    const {
      block_name,
      block_number,
      building_construction_year,
      building_height,
      structure_height,
      floor_count,
      closed_area,
      closed_parking_area
    } = req.body;
    
    const result = await query(
      `UPDATE core_facility_blocks
       SET block_name = COALESCE($1, block_name),
           block_number = COALESCE($2, block_number),
           building_construction_year = COALESCE($3, building_construction_year),
           building_height = COALESCE($4, building_height),
           structure_height = COALESCE($5, structure_height),
           floor_count = COALESCE($6, floor_count),
           closed_area = COALESCE($7, closed_area),
           closed_parking_area = COALESCE($8, closed_parking_area),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        block_name, block_number, building_construction_year, building_height,
        structure_height, floor_count, closed_area, closed_parking_area,
        req.params.blockId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Block not found' });
    }
    
    res.json({ message: 'Block updated successfully', block: result.rows[0] });
  } catch (error) {
    console.error('Update block error:', error);
    res.status(500).json({ error: 'Failed to update block' });
  }
};

const deleteBlock = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM core_facility_blocks WHERE id = $1 RETURNING id',
      [req.params.blockId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Block not found' });
    }
    
    res.json({ message: 'Block deleted successfully' });
  } catch (error) {
    console.error('Delete block error:', error);
    res.status(500).json({ error: 'Failed to delete block' });
  }
};

const getFacilityStatistics = async (req, res) => {
  try {
    const facilityId = req.params.id;
    
    // Get asset count
    const assetResult = await query(
      'SELECT COUNT(*) as count FROM eams_assets WHERE facility_id = $1 AND is_active = true',
      [facilityId]
    );
    
    // Get maintenance records count
    const maintenanceResult = await query(
      'SELECT COUNT(*) as count FROM eams_maintenance_records mr JOIN eams_maintenance_plans mp ON mr.maintenance_plan_id = mp.id WHERE mp.facility_id = $1',
      [facilityId]
    );
    
    // Get fault requests count
    const faultResult = await query(
      'SELECT COUNT(*) as count FROM eams_fault_requests WHERE facility_id = $1',
      [facilityId]
    );
    
    // Get areas count
    const areaResult = await query(
      'SELECT COUNT(*) as count FROM core_areas WHERE facility_id = $1',
      [facilityId]
    );
    
    res.json({
      assets: parseInt(assetResult.rows[0].count),
      maintenance_records: parseInt(maintenanceResult.rows[0].count),
      fault_requests: parseInt(faultResult.rows[0].count),
      areas: parseInt(areaResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get facility statistics error:', error);
    res.status(500).json({ error: 'Failed to get facility statistics' });
  }
};

const importFacilitiesFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const facilities = [];
    const blocks = [];
    
    // Parse CSV file
    const results = await new Promise((resolve, reject) => {
      const results = [];
      const stream = fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });

    // Process each row
    for (const row of results) {
      // Skip empty rows
      if (!row['Tesis Adı']) continue;

      // Create facility
      const facilityData = {
        facility_code: row['Tesis ID'] || null,
        name: row['Tesis Adı'],
        short_name: row['Tesis Kısa Adı'] || null,
        facility_type: row['Tesis Tipi'],
        address: row['Adres'] || null,
        city: row['İl'] || null,
        district: row['İlçe'] || null,
        website: row['Web Sitesi'] || null,
        phone: row['Telefon'] || null,
        email: row['E-posta'] || null,
        trade_name: row['Ticari Unvan'] || null,
        sgk_registration_number: row['SGK Sicil Numarası'] || null,
        nace_code: row['Nace Kodu'] || null,
        workplace_hazard_class: row['İşyeri Tehlike Sınıfı'] || null,
        block_count: row['Blok Sayısı'] ? parseInt(row['Blok Sayısı']) : 1,
        building_construction_year: row['Bina Yapım Yılı'] ? parseInt(row['Bina Yapım Yılı']) : null,
        building_height: row['Bina Yüksekliği'] ? parseFloat(row['Bina Yüksekliği']) : null,
        structure_height: row['Yapı Yüksekliği'] ? parseFloat(row['Yapı Yüksekliği']) : null,
        floor_count: row['Kat Sayısı'] ? parseInt(row['Kat Sayısı']) : null,
        closed_area: row['Kapalı Alan'] ? parseFloat(row['Kapalı Alan']) : null,
        closed_parking_area: row['Kapalı Otopark Alanı'] ? parseFloat(row['Kapalı Otopark Alanı']) : null,
        bed_count: row['Yatak Sayısı'] ? parseInt(row['Yatak Sayısı']) : null,
        employee_count: row['Çalışan Sayısı'] ? parseInt(row['Çalışan Sayısı']) : null,
        contractor_employee_count: row['Taşeron Çalışan Sayısı'] ? parseInt(row['Taşeron Çalışan Sayısı']) : null,
        facility_manager_id: null // Will need to look up user by name
      };

      facilities.push(facilityData);

      // If blocks are specified in the CSV
      if (row['Blok Adı']) {
        const blockNames = row['Blok Adı'].split(';');
        const blockNumbers = row['Blok Numarası'] ? row['Blok Numarası'].split(';') : [];
        const buildingYears = row['Bina Yapım Yılı'] ? row['Bina Yapım Yılı'].split(';') : [];
        const buildingHeights = row['Bina Yüksekliği'] ? row['Bina Yüksekliği'].split(';') : [];
        const structureHeights = row['Yapı Yüksekliği'] ? row['Yapı Yüksekliği'].split(';') : [];
        const floorCounts = row['Kat Sayısı'] ? row['Kat Sayısı'].split(';') : [];
        const closedAreas = row['Kapalı Alan'] ? row['Kapalı Alan'].split(';') : [];
        const parkingAreas = row['Kapalı Otopark Alanı'] ? row['Kapalı Otopark Alanı'].split(';') : [];

        blockNames.forEach((blockName, index) => {
          blocks.push({
            block_name: blockName.trim(),
            block_number: blockNumbers[index] ? parseInt(blockNumbers[index]) : index + 1,
            building_construction_year: buildingYears[index] ? parseInt(buildingYears[index]) : null,
            building_height: buildingHeights[index] ? parseFloat(buildingHeights[index]) : null,
            structure_height: structureHeights[index] ? parseFloat(structureHeights[index]) : null,
            floor_count: floorCounts[index] ? parseInt(floorCounts[index]) : null,
            closed_area: closedAreas[index] ? parseFloat(closedAreas[index]) : null,
            closed_parking_area: parkingAreas[index] ? parseFloat(parkingAreas[index]) : null
          });
        });
      }
    }

    // Insert facilities
    const insertedFacilities = [];
    for (const facility of facilities) {
      const result = await query(
        `INSERT INTO core_facilities (
          facility_code, name, short_name, facility_type, address, city, district,
          website, phone, email, trade_name, sgk_registration_number, nace_code,
          workplace_hazard_class, block_count, building_construction_year, building_height,
          structure_height, floor_count, closed_area, closed_parking_area, bed_count,
          employee_count, contractor_employee_count, facility_manager_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        RETURNING *`,
        [
          facility.facility_code, facility.name, facility.short_name, facility.facility_type,
          facility.address, facility.city, facility.district, facility.website, facility.phone,
          facility.email, facility.trade_name, facility.sgk_registration_number, facility.nace_code,
          facility.workplace_hazard_class, facility.block_count, facility.building_construction_year,
          facility.building_height, facility.structure_height, facility.floor_count,
          facility.closed_area, facility.closed_parking_area, facility.bed_count,
          facility.employee_count, facility.contractor_employee_count, facility.facility_manager_id
        ]
      );
      insertedFacilities.push(result.rows[0]);
    }

    // Insert blocks for each facility
    let blockIndex = 0;
    for (const facility of insertedFacilities) {
      const facilityBlocks = blocks.filter((_, index) => {
        const belongsToFacility = Math.floor(index / facility.block_count) === insertedFacilities.indexOf(facility);
        return belongsToFacility;
      });

      for (const block of facilityBlocks) {
        await query(
          `INSERT INTO core_facility_blocks (
            facility_id, block_name, block_number, building_construction_year,
            building_height, structure_height, floor_count, closed_area, closed_parking_area
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            facility.id, block.block_name, block.block_number, block.building_construction_year,
            block.building_height, block.structure_height, block.floor_count,
            block.closed_area, block.closed_parking_area
          ]
        );
      }
    }

    // Delete uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(201).json({
      message: 'Facilities imported successfully',
      imported: facilities.length,
      facilities: insertedFacilities
    });
  } catch (error) {
    console.error('Import facilities error:', error);
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to import facilities', details: error.message });
  }
};

const exportFacilitiesToCSV = async (req, res) => {
  try {
    const result = await query(
      `SELECT
        f.*,
        u.first_name || ' ' || u.last_name as facility_manager_name
       FROM core_facilities f
       LEFT JOIN core_users u ON f.facility_manager_id = u.id
       WHERE f.is_active = true
       ORDER BY f.name ASC`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No facilities found' });
    }

    // Get blocks for each facility
    const facilitiesWithBlocks = await Promise.all(
      result.rows.map(async (facility) => {
        const blocksResult = await query(
          'SELECT * FROM core_facility_blocks WHERE facility_id = $1 ORDER BY block_number ASC',
          [facility.id]
        );
        
        const blockNames = blocksResult.rows.map(b => b.block_name).join('; ');
        const blockNumbers = blocksResult.rows.map(b => b.block_number).join('; ');
        const buildingYears = blocksResult.rows.map(b => b.building_construction_year).join('; ');
        const buildingHeights = blocksResult.rows.map(b => b.building_height).join('; ');
        const structureHeights = blocksResult.rows.map(b => b.structure_height).join('; ');
        const floorCounts = blocksResult.rows.map(b => b.floor_count).join('; ');
        const closedAreas = blocksResult.rows.map(b => b.closed_area).join('; ');
        const parkingAreas = blocksResult.rows.map(b => b.closed_parking_area).join('; ');

        return {
          'Tesis ID': facility.facility_code,
          'Tesis Adı': facility.name,
          'Tesis Kısa Adı': facility.short_name,
          'Tesis Tipi': facility.facility_type,
          'Adres': facility.address,
          'İl': facility.city,
          'İlçe': facility.district,
          'Web Sitesi': facility.website,
          'Telefon': facility.phone,
          'E-posta': facility.email,
          'Ticari Unvan': facility.trade_name,
          'SGK Sicil Numarası': facility.sgk_registration_number,
          'Nace Kodu': facility.nace_code,
          'İşyeri Tehlike Sınıfı': facility.workplace_hazard_class,
          'Blok Sayısı': facility.block_count,
          'Bina Yapım Yılı': facility.building_construction_year,
          'Bina Yüksekliği': facility.building_height,
          'Yapı Yüksekliği': facility.structure_height,
          'Kat Sayısı': facility.floor_count,
          'Kapalı Alan': facility.closed_area,
          'Kapalı Otopark Alanı': facility.closed_parking_area,
          'Yatak Sayısı': facility.bed_count,
          'Çalışan Sayısı': facility.employee_count,
          'Taşeron Çalışan Sayısı': facility.contractor_employee_count,
          'Tesis Yöneticisi': facility.facility_manager_name,
          'Blok Adı': blockNames,
          'Blok Numarası': blockNumbers,
          'Bina Yapım Yılı (Blok)': buildingYears,
          'Bina Yüksekliği (Blok)': buildingHeights,
          'Yapı Yüksekliği (Blok)': structureHeights,
          'Kat Sayısı (Blok)': floorCounts,
          'Kapalı Alan (Blok)': closedAreas,
          'Kapalı Otopark Alanı (Blok)': parkingAreas
        };
      })
    );

    // Convert to CSV
    const csvOutput = stringify(facilitiesWithBlocks, {
      header: true,
      delimiter: ',',
      quoted: true,
      quoted_empty: true
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="tesisler_export.csv"');
    
    // Add BOM for Excel UTF-8 compatibility
    res.send('\uFEFF' + csvOutput);
  } catch (error) {
    console.error('Export facilities error:', error);
    res.status(500).json({ error: 'Failed to export facilities' });
  }
};

module.exports = {
  getAllFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  getFacilityBlocks,
  addBlock,
  updateBlock,
  deleteBlock,
  getFacilityStatistics,
  importFacilitiesFromCSV,
  exportFacilitiesToCSV
};
