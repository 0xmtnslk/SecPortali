const { query } = require('../config/database');
const DxfParser = require('dxf-parser');
const fs = require('fs');
const path = require('path');

// Get all floors for a block
const getFloorsByBlock = async (req, res) => {
  try {
    const { blockId } = req.params;
    
    const result = await query(
      `SELECT * FROM core_floors 
       WHERE block_id = $1 AND is_active = true 
       ORDER BY sort_order ASC, floor_number ASC`,
      [blockId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get floors by block error:', error);
    res.status(500).json({ error: 'Failed to get floors' });
  }
};

// Get all floors for a facility
const getFloorsByFacility = async (req, res) => {
  try {
    const { facilityId } = req.params;

    const result = await query(
      `SELECT f.*, fb.block_name, fb.facility_id
       FROM core_floors f
       JOIN core_facility_blocks fb ON f.block_id = fb.id
       WHERE fb.facility_id = $1 AND f.is_active = true
       ORDER BY fb.block_name ASC, f.sort_order ASC, f.floor_number ASC`,
      [facilityId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get floors by facility error:', error);
    res.status(500).json({ error: 'Failed to get floors' });
  }
};

// Get floor by ID
const getFloorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT f.*, fb.block_name, fb.facility_id
       FROM core_floors f
       JOIN core_facility_blocks fb ON f.block_id = fb.id
       WHERE f.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get floor by id error:', error);
    res.status(500).json({ error: 'Failed to get floor' });
  }
};

// Create new floor
const createFloor = async (req, res) => {
  try {
    const { block_id, floor_name, floor_number, sort_order } = req.body;
    
    if (!block_id || !floor_name || floor_number === undefined) {
      return res.status(400).json({ error: 'Block ID, floor name and floor number are required' });
    }
    
    const result = await query(
      `INSERT INTO core_floors (block_id, floor_name, floor_number, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [block_id, floor_name, floor_number, sort_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create floor error:', error);
    res.status(500).json({ error: 'Failed to create floor' });
  }
};

// Update floor
const updateFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const { floor_name, floor_number, sort_order, is_active } = req.body;
    
    const result = await query(
      `UPDATE core_floors 
       SET floor_name = COALESCE($1, floor_name),
           floor_number = COALESCE($2, floor_number),
           sort_order = COALESCE($3, sort_order),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [floor_name, floor_number, sort_order, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update floor error:', error);
    res.status(500).json({ error: 'Failed to update floor' });
  }
};

// Delete floor
const deleteFloor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if floor has areas
    const areasCheck = await query(
      'SELECT COUNT(*) as count FROM core_areas WHERE floor_id = $1',
      [id]
    );
    
    if (parseInt(areasCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete floor with associated areas' });
    }
    
    const result = await query(
      'DELETE FROM core_floors WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    res.json({ message: 'Floor deleted successfully' });
  } catch (error) {
    console.error('Delete floor error:', error);
    res.status(500).json({ error: 'Failed to delete floor' });
  }
};

// Upload DXF file
const uploadDxf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    console.log('DXF Upload: File content preview:', fileContent.substring(0, 500));

    // Parse DXF file
    const parser = new DxfParser();
    let dxfData;

    try {
      dxfData = parser.parseSync(fileContent);
      console.log('DXF Upload: Parsed data keys:', Object.keys(dxfData));
      console.log('DXF Upload: Entities count:', dxfData.entities?.length);
      console.log('DXF Upload: First entity:', dxfData.entities?.[0]);
    } catch (parseError) {
      console.error('DXF parse error:', parseError);
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Invalid DXF file format' });
    }

    // Extract entities for mapping
    const entities = extractEntities(dxfData);
    console.log('DXF Upload: Extracted entities count:', entities.length);
    console.log('DXF Upload: Extracted entities:', JSON.stringify(entities, null, 2));

    // Save parsed data
    const result = await query(
      `UPDATE core_floors
       SET dxf_file_path = $1,
           dxf_parsed_data = $2,
           dxf_uploaded_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [filePath, JSON.stringify({ entities, header: dxfData.header }), id]
    );

    if (result.rows.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(404).json({ error: 'Floor not found' });
    }

    res.json({
      message: 'DXF file uploaded and parsed successfully',
      floor: result.rows[0],
      entities: entities
    });
  } catch (error) {
    console.error('Upload DXF error:', error);
    res.status(500).json({ error: 'Failed to upload DXF file' });
  }
};

// Extract entities from DXF data
const extractEntities = (dxfData) => {
  const entities = [];

  if (!dxfData.entities) return entities;

  dxfData.entities.forEach((entity, index) => {
    const baseEntity = {
      id: index,
      type: entity.type,
      layer: entity.layer || entity.layerName || '0'
    };

    switch (entity.type) {
      case 'LWPOLYLINE':
      case 'POLYLINE':
        // dxf-parser farklı vertex formatları kullanabilir
        let vertices = [];

        console.log('LWPOLYLINE entity:', JSON.stringify(entity, null, 2));

        if (entity.vertices && Array.isArray(entity.vertices)) {
          vertices = entity.vertices.map(v => ({
            x: v.x !== undefined ? v.x : (v.X !== undefined ? v.X : 0),
            y: v.y !== undefined ? v.y : (v.Y !== undefined ? v.Y : 0)
          }));
        } else if (entity.points && Array.isArray(entity.points)) {
          vertices = entity.points.map(p => ({
            x: p.x !== undefined ? p.x : (p.X !== undefined ? p.X : 0),
            y: p.y !== undefined ? p.y : (p.Y !== undefined ? p.Y : 0)
          }));
        } else if (entity.controlPoints && Array.isArray(entity.controlPoints)) {
          vertices = entity.controlPoints.map(p => ({
            x: p.x !== undefined ? p.x : (p.X !== undefined ? p.X : 0),
            y: p.y !== undefined ? p.y : (p.Y !== undefined ? p.Y : 0)
          }));
        }

        console.log('Extracted vertices:', vertices);

        // LWPOLYLINE için shape flag kontrolü (70 grup kodu)
        // 1 = closed, 0 = open
        const isClosed = entity.shape === true || entity.closed === true || false;

        entities.push({
          ...baseEntity,
          vertices: vertices,
          isClosed: isClosed
        });
        break;
      case 'LINE':
        const lineStart = entity.vertices?.[0] || entity.start || {};
        const lineEnd = entity.vertices?.[1] || entity.end || {};

        entities.push({
          ...baseEntity,
          start: { x: lineStart.x, y: lineStart.y },
          end: { x: lineEnd.x, y: lineEnd.y }
        });
        break;
      case 'CIRCLE':
        entities.push({
          ...baseEntity,
          center: { x: entity.center?.x, y: entity.center?.y },
          radius: entity.radius
        });
        break;
      case 'ARC':
        entities.push({
          ...baseEntity,
          center: { x: entity.center?.x, y: entity.center?.y },
          radius: entity.radius,
          startAngle: entity.startAngle,
          endAngle: entity.endAngle
        });
        break;
      case 'TEXT':
      case 'MTEXT':
        entities.push({
          ...baseEntity,
          text: entity.text || entity.string || '',
          position: {
            x: entity.position?.x || entity.startPoint?.x || 0,
            y: entity.position?.y || entity.startPoint?.y || 0
          },
          height: entity.textHeight || entity.height || 1
        });
        break;
      case 'INSERT':
        entities.push({
          ...baseEntity,
          name: entity.name || entity.blockName || '',
          position: { x: entity.position?.x || 0, y: entity.position?.y || 0 }
        });
        break;
    }
  });

  return entities;
};

// Get DXF data for floor
const getDxfData = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT dxf_parsed_data FROM core_floors WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    if (!result.rows[0].dxf_parsed_data) {
      return res.status(404).json({ error: 'No DXF data found for this floor' });
    }
    
    res.json(result.rows[0].dxf_parsed_data);
  } catch (error) {
    console.error('Get DXF data error:', error);
    res.status(500).json({ error: 'Failed to get DXF data' });
  }
};

// Delete DXF file
const deleteDxf = async (req, res) => {
  try {
    const { id } = req.params;
    
    const floorResult = await query(
      'SELECT dxf_file_path FROM core_floors WHERE id = $1',
      [id]
    );
    
    if (floorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    const filePath = floorResult.rows[0].dxf_file_path;
    
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await query(
      `UPDATE core_floors 
       SET dxf_file_path = NULL,
           dxf_parsed_data = NULL,
           dxf_uploaded_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
    
    res.json({ message: 'DXF file deleted successfully' });
  } catch (error) {
    console.error('Delete DXF error:', error);
    res.status(500).json({ error: 'Failed to delete DXF file' });
  }
};

module.exports = {
  getFloorsByBlock,
  getFloorsByFacility,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
  uploadDxf,
  getDxfData,
  deleteDxf,
  extractEntities
};