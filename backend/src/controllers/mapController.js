const { query } = require('../config/database');

// Tesisin katları ve mahallerinin durum bilgisi
const getFacilityMapStatus = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { floor_id } = req.query;

    // Tesis bilgilerini al
    const facilityResult = await query(
      'SELECT * FROM core_facilities WHERE id = $1',
      [facilityId]
    );

    if (facilityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    // Katları al
    let floorsQuery = `
      SELECT f.*, fb.block_name
      FROM core_floors f
      JOIN core_facility_blocks fb ON f.block_id = fb.id
      WHERE fb.facility_id = $1
      ORDER BY fb.block_name ASC, f.floor_number ASC
    `;
    const floorsResult = await query(floorsQuery, [facilityId]);

    // Mahalleri ve varlık durumlarını al
    let areasQuery = `
      SELECT 
        a.*,
        at.name as area_type_name,
        at.category as area_type_category,
        fb.block_name,
        fl.floor_name,
        fl.floor_number,
        COUNT(DISTINCT asst.id) as asset_count,
        COUNT(DISTINCT CASE WHEN asst.status = 'active' THEN asst.id END) as active_assets,
        COUNT(DISTINCT CASE WHEN asst.status = 'maintenance' THEN asst.id END) as maintenance_assets,
        COUNT(DISTINCT CASE WHEN asst.status = 'fault' THEN asst.id END) as fault_assets,
        COUNT(DISTINCT CASE WHEN fr.status IN ('open', 'in_progress') THEN fr.id END) as open_faults
      FROM core_areas a
      LEFT JOIN core_area_types at ON a.area_type_id = at.id
      LEFT JOIN core_facility_blocks fb ON a.block_id = fb.id
      LEFT JOIN core_floors fl ON a.floor_id = fl.id
      LEFT JOIN eams_assets asst ON asst.area_id = a.id
      LEFT JOIN eams_fault_requests fr ON fr.asset_id = asst.id
      WHERE a.facility_id = $1
    `;

    const queryParams = [facilityId];

    if (floor_id) {
      areasQuery += ` AND a.floor_id = $2`;
      queryParams.push(floor_id);
    }

    areasQuery += `
      GROUP BY a.id, at.name, at.category, fb.block_name, fl.floor_name, fl.floor_number
      ORDER BY fl.floor_number ASC, a.area_name ASC
    `;

    const areasResult = await query(areasQuery, queryParams);

    // Mahalleri katlara göre grupla
    const areasByFloor = {};
    areasResult.rows.forEach(area => {
      const floorId = area.floor_id || 'unassigned';
      if (!areasByFloor[floorId]) {
        areasByFloor[floorId] = [];
      }
      areasByFloor[floorId].push({
        ...area,
        // Durum rengi belirle
        status_color: getStatusColor(area),
        status_text: getStatusText(area)
      });
    });

    res.json({
      facility: facilityResult.rows[0],
      floors: floorsResult.rows,
      areas_by_floor: areasByFloor,
      total_areas: areasResult.rows.length,
      mapped_areas: areasResult.rows.filter(a => a.is_mapped).length
    });
  } catch (error) {
    console.error('Get facility map status error:', error);
    res.status(500).json({ error: 'Failed to get facility map status' });
  }
};

// Katın DXF verisi ve mahalleri
const getFloorMapData = async (req, res) => {
  try {
    const { floorId } = req.params;

    // Kat bilgilerini al
    const floorResult = await query(
      `SELECT f.*, fb.block_name, fb.facility_id, fac.name as facility_name
       FROM core_floors f
       JOIN core_facility_blocks fb ON f.block_id = fb.id
       JOIN core_facilities fac ON fb.facility_id = fac.id
       WHERE f.id = $1`,
      [floorId]
    );

    if (floorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    const floor = floorResult.rows[0];
    console.log('MapController: Floor dxf_parsed_data:', floor.dxf_parsed_data);
    console.log('MapController: Floor dxf_parsed_data type:', typeof floor.dxf_parsed_data);

    // Parse dxf_parsed_data JSONB field
    let dxfData = null;
    if (floor.dxf_parsed_data) {
      if (typeof floor.dxf_parsed_data === 'string') {
        try {
          dxfData = JSON.parse(floor.dxf_parsed_data);
        } catch (e) {
          console.error('Failed to parse dxf_parsed_data string:', e);
          dxfData = floor.dxf_parsed_data;
        }
      } else {
        dxfData = floor.dxf_parsed_data;
      }
    }
    console.log('MapController: Parsed dxfData:', dxfData);
    console.log('MapController: dxfData entities count:', dxfData?.entities?.length);

    // Katın mahallerini al
    const areasResult = await query(
      `SELECT
        a.*,
        at.name as area_type_name,
        COUNT(DISTINCT asst.id) as asset_count,
        json_agg(DISTINCT jsonb_build_object(
          'id', asst.id,
          'name', asst.name,
          'status', asst.status,
          'location_x', asst.location_x,
          'location_y', asst.location_y,
          'map_marker_color', asst.map_marker_color
        )) FILTER (WHERE asst.id IS NOT NULL) as assets
      FROM core_areas a
      LEFT JOIN core_area_types at ON a.area_type_id = at.id
      LEFT JOIN eams_assets asst ON asst.area_id = a.id
      WHERE a.floor_id = $1
      GROUP BY a.id, at.name
      ORDER BY a.area_name ASC`,
      [floorId]
    );

    res.json({
      floor: floor,
      dxf_data: dxfData,
      areas: areasResult.rows.map(area => ({
        ...area,
        status_color: getStatusColor(area),
        assets: area.assets || []
      }))
    });
  } catch (error) {
    console.error('Get floor map data error:', error);
    res.status(500).json({ error: 'Failed to get floor map data' });
  }
};

// Mahal eşleştirme (DXF entity ile)
const mapAreaToEntity = async (req, res) => {
  try {
    const { areaId } = req.params;
    const { geometry, center_x, center_y, dxf_entity_id } = req.body;

    const result = await query(
      `UPDATE core_areas
       SET geometry = $1,
           center_x = $2,
           center_y = $3,
           dxf_entity_id = $4,
           map_color = COALESCE($5, map_color),
           is_mapped = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        geometry ? JSON.stringify(geometry) : null,
        center_x,
        center_y,
        dxf_entity_id,
        req.body.map_color,
        areaId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Area not found' });
    }

    res.json({
      message: 'Area mapped successfully',
      area: result.rows[0]
    });
  } catch (error) {
    console.error('Map area to entity error:', error);
    res.status(500).json({ error: 'Failed to map area' });
  }
};

// Varlık konumunu güncelle
const updateAssetLocation = async (req, res) => {
  try {
    const { assetId } = req.params;
    const { location_x, location_y, map_marker_color } = req.body;

    const result = await query(
      `UPDATE eams_assets
       SET location_x = COALESCE($1, location_x),
           location_y = COALESCE($2, location_y),
           map_marker_color = COALESCE($3, map_marker_color),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [location_x, location_y, map_marker_color, assetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({
      message: 'Asset location updated successfully',
      asset: result.rows[0]
    });
  } catch (error) {
    console.error('Update asset location error:', error);
    res.status(500).json({ error: 'Failed to update asset location' });
  }
};

// Yardımcı fonksiyonlar
function getStatusColor(area) {
  if (area.fault_assets > 0 || area.open_faults > 0) return '#ef4444'; // Kırmızı
  if (area.maintenance_assets > 0) return '#eab308'; // Sarı
  if (area.active_assets > 0) return '#22c55e'; // Yeşil
  return '#9ca3af'; // Gri
}

function getStatusText(area) {
  if (area.fault_assets > 0 || area.open_faults > 0) return 'Arızalı';
  if (area.maintenance_assets > 0) return 'Bakımda';
  if (area.active_assets > 0) return 'Aktif';
  return 'Boş';
}

module.exports = {
  getFacilityMapStatus,
  getFloorMapData,
  mapAreaToEntity,
  updateAssetLocation
};