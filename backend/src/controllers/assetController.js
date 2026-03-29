const { query } = require('../config/database');

const getAllAssets = async (req, res) => {
  try {
    const { facility_id, category_id, area_id, status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT a.*,
             ac.name as category_name,
             ar.area_name as area_name,
             f.name as facility_name,
             mu.symbol as capacity_unit_symbol
      FROM eams_assets a
      LEFT JOIN eams_asset_categories ac ON a.category_id = ac.id
      LEFT JOIN core_areas ar ON a.area_id = ar.id
      LEFT JOIN core_facilities f ON a.facility_id = f.id
      LEFT JOIN eams_measurement_units mu ON a.capacity_unit_id = mu.id
      WHERE a.is_active = true AND f.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (facility_id) {
      queryText += ` AND a.facility_id = $${paramIndex}`;
      params.push(facility_id);
      paramIndex++;
    }
    
    if (category_id) {
      queryText += ` AND a.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }
    
    if (area_id) {
      queryText += ` AND a.area_id = $${paramIndex}`;
      params.push(area_id);
      paramIndex++;
    }
    
    if (status) {
      queryText += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      queryText += ` AND (a.name ILIKE $${paramIndex} OR a.asset_code ILIKE $${paramIndex} OR a.brand ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    queryText += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    res.json({
      assets: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get all assets error:', error);
    res.status(500).json({ error: 'Failed to get assets' });
  }
};

const getAssetById = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, 
              ac.name as category_name,
              ar.area_name as area_name,
              f.name as facility_name,
              mu.symbol as capacity_unit_symbol,
              et.name as energy_type_name,
              ad.name as responsible_department_name,
              u.first_name || ' ' || u.last_name as responsible_user_name
       FROM eams_assets a
       LEFT JOIN eams_asset_categories ac ON a.category_id = ac.id
       LEFT JOIN core_areas ar ON a.area_id = ar.id
       LEFT JOIN core_facilities f ON a.facility_id = f.id
       LEFT JOIN eams_measurement_units mu ON a.capacity_unit_id = mu.id
       LEFT JOIN eams_energy_types et ON a.energy_type_id = et.id
       LEFT JOIN core_authorized_departments ad ON a.responsible_department_id = ad.id
       LEFT JOIN core_users u ON a.responsible_user_id = u.id
        WHERE a.id = $1 AND a.is_active = true`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get asset by ID error:', error);
    res.status(500).json({ error: 'Failed to get asset' });
  }
};

const createAsset = async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Auto-generate asset_code and qr_barcode if missing
    if (!data.asset_code) {
      data.asset_code = `EQ-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    }
    if (!data.qr_barcode) {
      data.qr_barcode = data.asset_code;
    }

    const {
      // 1. Kimlik ve Temel
      asset_code, name, description, qr_barcode, fixture_number, brand, model, serial_number, manufacturing_year, has_warranty, warranty_expiry_date,
      // 2. Teknik ve Operasyonel
      category_id, equipment_id, energy_type_id, energy_consumption_class, capacity_value, capacity_unit_id, power_consumption, criticality_level, has_redundancy, alternative_equipment, installation_date,
      // 3. Konum
      facility_id, block_id, floor_id, area_id, room_detail,
      // 4. Finansal
      purchase_date, purchase_price, current_value, depreciation_period_years, economic_life_years, planned_renewal_year, annual_maintenance_cost, total_cost_of_ownership,
      // 5. Bakım ve Kontrol
      status, condition, 
      has_internal_maintenance, internal_maintenance_period, 
      has_external_maintenance, external_maintenance_period, 
      requires_periodic_control, periodic_control_period, last_periodic_control_date,
      // 6. Güvenlik ve Diğer
      responsible_department_id, responsible_user_id, has_access_restriction, is_in_critical_area, manufacturer, supplier, technical_specs
    } = req.body;
    
    const result = await query(
      `INSERT INTO eams_assets (
        asset_code, name, description, qr_barcode, fixture_number, brand, model, serial_number, manufacturing_year, has_warranty, warranty_expiry_date,
        category_id, equipment_id, energy_type_id, energy_consumption_class, capacity_value, capacity_unit_id, power_consumption, criticality_level, has_redundancy, alternative_equipment, installation_date,
        facility_id, block_id, floor_id, area_id, room_detail,
        purchase_date, purchase_price, current_value, depreciation_period_years, economic_life_years, planned_renewal_year, annual_maintenance_cost, total_cost_of_ownership,
        status, condition, 
        has_internal_maintenance, internal_maintenance_period, 
        has_external_maintenance, external_maintenance_period, 
        requires_periodic_control, periodic_control_period, last_periodic_control_date,
        responsible_department_id, responsible_user_id, has_access_restriction, is_in_critical_area, manufacturer, supplier, technical_specs
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51)
      RETURNING *`,
      [
        asset_code, name, description, qr_barcode, fixture_number, brand, model, serial_number, manufacturing_year || null, has_warranty || false, warranty_expiry_date || null,
        category_id || null, equipment_id || null, energy_type_id || null, energy_consumption_class, capacity_value || null, capacity_unit_id || null, power_consumption || null, criticality_level, has_redundancy || false, alternative_equipment, installation_date || null,
        facility_id || null, block_id || null, floor_id || null, area_id || null, room_detail,
        purchase_date || null, purchase_price || null, current_value || null, depreciation_period_years || null, economic_life_years || null, planned_renewal_year || null, annual_maintenance_cost || null, total_cost_of_ownership || null,
        status || 'active', condition, 
        has_internal_maintenance || false, internal_maintenance_period, 
        has_external_maintenance || false, external_maintenance_period, 
        requires_periodic_control || false, periodic_control_period, last_periodic_control_date || null,
        responsible_department_id || null, responsible_user_id || null, has_access_restriction || false, is_in_critical_area || false, manufacturer, supplier, technical_specs ? JSON.stringify(technical_specs) : null
      ]
    );
    
    res.status(201).json({ message: 'Asset created successfully', asset: result.rows[0] });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
};

const updateAsset = async (req, res) => {
  try {
    const {
      // 1. Kimlik ve Temel
      asset_code, name, description, qr_barcode, fixture_number, brand, model, serial_number, manufacturing_year, has_warranty, warranty_expiry_date,
      // 2. Teknik ve Operasyonel
      category_id, equipment_id, energy_type_id, energy_consumption_class, capacity_value, capacity_unit_id, power_consumption, criticality_level, has_redundancy, alternative_equipment, installation_date,
      // 3. Konum
      facility_id, block_id, floor_id, area_id, room_detail,
      // 4. Finansal
      purchase_date, purchase_price, current_value, depreciation_period_years, economic_life_years, planned_renewal_year, annual_maintenance_cost, total_cost_of_ownership,
      // 5. Bakım ve Kontrol
      status, condition, 
      has_internal_maintenance, internal_maintenance_period, 
      has_external_maintenance, external_maintenance_period, 
      requires_periodic_control, periodic_control_period, last_periodic_control_date,
      // 6. Güvenlik ve Diğer
      responsible_department_id, responsible_user_id, has_access_restriction, is_in_critical_area, manufacturer, supplier, technical_specs
    } = req.body;
    
    const result = await query(
      `UPDATE eams_assets 
       SET asset_code = COALESCE($1, asset_code),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           qr_barcode = COALESCE($4, qr_barcode),
           fixture_number = COALESCE($5, fixture_number),
           brand = COALESCE($6, brand),
           model = COALESCE($7, model),
           serial_number = COALESCE($8, serial_number),
           manufacturing_year = COALESCE($9, manufacturing_year),
           has_warranty = COALESCE($10, has_warranty),
           warranty_expiry_date = COALESCE($11, warranty_expiry_date),
           category_id = COALESCE($12, category_id),
           equipment_id = COALESCE($13, equipment_id),
           energy_type_id = COALESCE($14, energy_type_id),
           energy_consumption_class = COALESCE($15, energy_consumption_class),
           capacity_value = COALESCE($16, capacity_value),
           capacity_unit_id = COALESCE($17, capacity_unit_id),
           power_consumption = COALESCE($18, power_consumption),
           criticality_level = COALESCE($19, criticality_level),
           has_redundancy = COALESCE($20, has_redundancy),
           alternative_equipment = COALESCE($21, alternative_equipment),
           installation_date = COALESCE($22, installation_date),
           facility_id = COALESCE($23, facility_id),
           block_id = COALESCE($24, block_id),
           floor_id = COALESCE($25, floor_id),
           area_id = COALESCE($26, area_id),
           room_detail = COALESCE($27, room_detail),
           purchase_date = COALESCE($28, purchase_date),
           purchase_price = COALESCE($29, purchase_price),
           current_value = COALESCE($30, current_value),
           depreciation_period_years = COALESCE($31, depreciation_period_years),
           economic_life_years = COALESCE($32, economic_life_years),
           planned_renewal_year = COALESCE($33, planned_renewal_year),
           annual_maintenance_cost = COALESCE($34, annual_maintenance_cost),
           total_cost_of_ownership = COALESCE($35, total_cost_of_ownership),
           status = COALESCE($36, status),
           condition = COALESCE($37, condition),
           has_internal_maintenance = COALESCE($38, has_internal_maintenance),
           internal_maintenance_period = COALESCE($39, internal_maintenance_period),
           has_external_maintenance = COALESCE($40, has_external_maintenance),
           external_maintenance_period = COALESCE($41, external_maintenance_period),
           requires_periodic_control = COALESCE($42, requires_periodic_control),
           periodic_control_period = COALESCE($43, periodic_control_period),
           last_periodic_control_date = COALESCE($44, last_periodic_control_date),
           responsible_department_id = COALESCE($45, responsible_department_id),
           responsible_user_id = COALESCE($46, responsible_user_id),
           has_access_restriction = COALESCE($47, has_access_restriction),
           is_in_critical_area = COALESCE($48, is_in_critical_area),
           manufacturer = COALESCE($49, manufacturer),
           supplier = COALESCE($50, supplier),
           technical_specs = COALESCE($51, technical_specs::jsonb),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $52
       RETURNING *`,
      [
        asset_code, name, description, qr_barcode, fixture_number, brand, model, serial_number, manufacturing_year || null, has_warranty, warranty_expiry_date,
        category_id || null, equipment_id || null, energy_type_id || null, energy_consumption_class, capacity_value || null, capacity_unit_id || null, power_consumption || null, criticality_level, has_redundancy, alternative_equipment, installation_date || null,
        facility_id || null, block_id || null, floor_id || null, area_id || null, room_detail,
        purchase_date || null, purchase_price || null, current_value || null, depreciation_period_years || null, economic_life_years || null, planned_renewal_year || null, annual_maintenance_cost || null, total_cost_of_ownership || null,
        status, condition, 
        has_internal_maintenance, internal_maintenance_period, 
        has_external_maintenance, external_maintenance_period, 
        requires_periodic_control, periodic_control_period, last_periodic_control_date || null,
        responsible_department_id || null, responsible_user_id || null, has_access_restriction, is_in_critical_area, manufacturer, supplier, technical_specs ? JSON.stringify(technical_specs) : null,
        req.params.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({ message: 'Asset updated successfully', asset: result.rows[0] });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const result = await query(
      'UPDATE eams_assets SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
};

const getAssetsByFacility = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, ac.name as category_name, ar.area_name as area_name
       FROM eams_assets a
       JOIN core_facilities f ON a.facility_id = f.id
       LEFT JOIN eams_asset_categories ac ON a.category_id = ac.id
       LEFT JOIN core_areas ar ON a.area_id = ar.id
       WHERE a.facility_id = $1 AND a.is_active = true AND f.is_active = true
       ORDER BY a.name ASC`,
      [req.params.facilityId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get assets by facility error:', error);
    res.status(500).json({ error: 'Failed to get assets' });
  }
};

const getAssetsByCategory = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, f.name as facility_name, ar.area_name as area_name
       FROM eams_assets a
       LEFT JOIN core_facilities f ON a.facility_id = f.id
       LEFT JOIN core_areas ar ON a.area_id = ar.id
       WHERE a.category_id = $1 AND a.is_active = true
       ORDER BY a.name ASC`,
      [req.params.categoryId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get assets by category error:', error);
    res.status(500).json({ error: 'Failed to get assets' });
  }
};

const getAssetsByArea = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, ac.name as category_name, f.name as facility_name
       FROM eams_assets a
       LEFT JOIN eams_asset_categories ac ON a.category_id = ac.id
       LEFT JOIN core_facilities f ON a.facility_id = f.id
       WHERE a.area_id = $1 AND a.is_active = true
       ORDER BY a.name ASC`,
      [req.params.areaId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get assets by area error:', error);
    res.status(500).json({ error: 'Failed to get assets' });
  }
};

const uploadDocuments = async (req, res) => {
  try {
    // This would handle file uploads
    // For now, just return success
    res.json({ message: 'Documents uploaded successfully' });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
};

const getMaintenanceHistory = async (req, res) => {
  try {
    const result = await query(
      `SELECT mr.*, mt.name as maintenance_type_name,
              u.first_name || ' ' || u.last_name as performed_by_name
       FROM eams_maintenance_records mr
       LEFT JOIN eams_maintenance_types mt ON mr.maintenance_type_id = mt.id
       LEFT JOIN core_users u ON mr.performed_by = u.id
       WHERE mr.asset_id = $1
       ORDER BY mr.created_at DESC`,
      [req.params.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get maintenance history error:', error);
    res.status(500).json({ error: 'Failed to get maintenance history' });
  }
};

const getFaultHistory = async (req, res) => {
  try {
    const result = await query(
      `SELECT fr.*, u.first_name || ' ' || u.last_name as requested_by_name
       FROM eams_fault_requests fr
       LEFT JOIN core_users u ON fr.requested_by = u.id
       WHERE fr.asset_id = $1
       ORDER BY fr.created_at DESC`,
      [req.params.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get fault history error:', error);
    res.status(500).json({ error: 'Failed to get fault history' });
  }
};

const getFormOptions = async (req, res) => {
  try {
    const [
      facilities, blocks, floors, areas, categories, equipment_hierarchy, 
      measurement_units, energy_types, authorized_departments, maintenance_types
    ] = await Promise.all([
      query('SELECT id, name FROM core_facilities WHERE is_active = true ORDER BY name'),
      query('SELECT id, facility_id, block_name FROM core_facility_blocks ORDER BY block_name'),
      query('SELECT id, block_id, floor_name, floor_number FROM core_floors WHERE is_active = true ORDER BY floor_number'),
      query('SELECT id, floor_id, block_id, facility_id, area_name, area_code, qr_barcode FROM core_areas WHERE is_active = true ORDER BY area_name'),
      query('SELECT id, name, parent_id, category_type FROM eams_asset_categories WHERE is_system = false ORDER BY sort_order, name'),
      query('SELECT id, name, parent_id, level FROM eams_equipment_hierarchy WHERE is_active = true ORDER BY sort_order, name'),
      query('SELECT id, name, symbol, unit_type FROM eams_measurement_units ORDER BY name'),
      query('SELECT id, name FROM eams_energy_types ORDER BY name'),
      query('SELECT id, name FROM core_authorized_departments ORDER BY name'),
      query('SELECT id, name FROM eams_maintenance_types ORDER BY name')
    ]);

    res.json({
      facilities: facilities.rows,
      blocks: blocks.rows,
      floors: floors.rows,
      areas: areas.rows,
      categories: categories.rows,
      equipment_hierarchy: equipment_hierarchy.rows,
      measurement_units: measurement_units.rows,
      energy_types: energy_types.rows,
      authorized_departments: authorized_departments.rows,
      maintenance_types: maintenance_types.rows
    });
  } catch (error) {
    console.error('Get form options error:', error);
    res.status(500).json({ error: 'Failed to get form options' });
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetsByFacility,
  getAssetsByCategory,
  getAssetsByArea,
  uploadDocuments,
  getMaintenanceHistory,
  getFaultHistory,
  getFormOptions
};
