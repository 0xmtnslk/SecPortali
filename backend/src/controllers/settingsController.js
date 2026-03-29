const { query } = require('../config/database');

// System Settings
const getSystemSettings = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM core_system_settings ORDER BY setting_key ASC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ error: 'Failed to get system settings' });
  }
};

const updateSystemSetting = async (req, res) => {
  try {
    const { setting_value } = req.body;
    
    const result = await query(
      `UPDATE core_system_settings 
       SET setting_value = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE setting_key = $2
       RETURNING *`,
      [setting_value, req.params.key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'System setting not found' });
    }
    
    res.json({ message: 'System setting updated', setting: result.rows[0] });
  } catch (error) {
    console.error('Update system setting error:', error);
    res.status(500).json({ error: 'Failed to update system setting' });
  }
};

const createSystemSetting = async (req, res) => {
  try {
    const { setting_key, setting_value, setting_type, description } = req.body;
    
    const result = await query(
      `INSERT INTO core_system_settings (setting_key, setting_value, setting_type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [setting_key, setting_value, setting_type, description]
    );
    
    res.status(201).json({ message: 'System setting created', setting: result.rows[0] });
  } catch (error) {
    console.error('Create system setting error:', error);
    res.status(500).json({ error: 'Failed to create system setting' });
  }
};

// Equipment Categories (Multi-level hierarchy)
const getEquipmentCategories = async (req, res) => {
  try {
    // Get all categories ordered by parent_id and order
    const result = await query(
      `SELECT id, name, parent_id, sort_order, created_at, updated_at
       FROM eams_asset_categories
       ORDER BY parent_id ASC NULLS FIRST, sort_order ASC, name ASC`
    );
    
    // Build hierarchical structure
    const categories = result.rows;
    const categoryMap = new Map();
    
    // First pass: create all category nodes
    categories.forEach(cat => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        parent_id: cat.parent_id,
        order: cat.sort_order,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
        children: []
      });
    });
    
    // Second pass: build hierarchy
    const rootCategories = [];
    categories.forEach(cat => {
      const node = categoryMap.get(cat.id);
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });
    
    res.json(rootCategories);
  } catch (error) {
    console.error('Get equipment categories error:', error);
    res.status(500).json({ error: 'Failed to get equipment categories' });
  }
};

const createEquipmentCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Get the maximum order value for siblings
    let maxOrder = 0;
    if (parent_id) {
      const orderResult = await query(
        `SELECT COALESCE(MAX(sort_order), 0) as max_order
         FROM eams_asset_categories
         WHERE parent_id = $1`,
        [parent_id]
      );
      maxOrder = orderResult.rows[0].max_order;
    } else {
      const orderResult = await query(
        `SELECT COALESCE(MAX(sort_order), 0) as max_order
         FROM eams_asset_categories
         WHERE parent_id IS NULL`
      );
      maxOrder = orderResult.rows[0].max_order;
    }

    const result = await query(
      `INSERT INTO eams_asset_categories (name, parent_id, sort_order)
       VALUES ($1, $2, $3)
       RETURNING id, name, parent_id, sort_order, created_at, updated_at`,
      [name.trim(), parent_id || null, maxOrder + 1]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create equipment category error:', error);
    res.status(500).json({ error: 'Failed to create equipment category' });
  }
};

const updateEquipmentCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const categoryId = req.params.id;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Check if category exists
    const existingResult = await query(
      `SELECT id FROM eams_asset_categories WHERE id = $1`,
      [categoryId]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment category not found' });
    }
    
    // Prevent circular reference
    if (parent_id && parent_id === categoryId) {
      return res.status(400).json({ error: 'Cannot set category as its own parent' });
    }
    
    // Check for circular reference in the hierarchy
    if (parent_id) {
      let currentParentId = parent_id;
      const visited = new Set([categoryId]);
      
      while (currentParentId) {
        if (visited.has(currentParentId)) {
          return res.status(400).json({ error: 'Circular reference detected in category hierarchy' });
        }
        visited.add(currentParentId);
        
        const parentResult = await query(
          `SELECT parent_id FROM eams_asset_categories WHERE id = $1`,
          [currentParentId]
        );
        
        if (parentResult.rows.length === 0) {
          break;
        }
        currentParentId = parentResult.rows[0].parent_id;
      }
    }
    
    const result = await query(
      `UPDATE eams_asset_categories
       SET name = $1,
           parent_id = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, parent_id, sort_order, created_at, updated_at`,
      [name.trim(), parent_id || null, categoryId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update equipment category error:', error);
    res.status(500).json({ error: 'Failed to update equipment category' });
  }
};

const deleteEquipmentCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category has children
    const childrenResult = await query(
      `SELECT COUNT(*) as count FROM eams_asset_categories WHERE parent_id = $1`,
      [categoryId]
    );
    
    if (parseInt(childrenResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with subcategories. Please delete subcategories first.' 
      });
    }
    
    // Check if category has assets
    const assetsResult = await query(
      `SELECT COUNT(*) as count FROM eams_assets WHERE category_id = $1`,
      [categoryId]
    );
    
    if (parseInt(assetsResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with assets. Please reassign or delete assets first.' 
      });
    }
    
    // Delete the category
    await query(
      `DELETE FROM eams_asset_categories WHERE id = $1`,
      [categoryId]
    );
    
    res.json({ message: 'Equipment category deleted successfully' });
  } catch (error) {
    console.error('Delete equipment category error:', error);
    res.status(500).json({ error: 'Failed to delete equipment category' });
  }
};

// Asset Categories
const getAssetCategories = async (req, res) => {
  try {
    const result = await query(
      `SELECT ac.*, 
              (SELECT COUNT(*) FROM eams_assets WHERE category_id = ac.id AND is_active = true) as asset_count
       FROM eams_asset_categories ac
       ORDER BY ac.name ASC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get asset categories error:', error);
    res.status(500).json({ error: 'Failed to get asset categories' });
  }
};

const getAssetCategoryById = async (req, res) => {
  try {
    const result = await query(
      `SELECT ac.*, 
              (SELECT COUNT(*) FROM eams_assets WHERE category_id = ac.id AND is_active = true) as asset_count
       FROM eams_asset_categories ac
       WHERE ac.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get asset category by ID error:', error);
    res.status(500).json({ error: 'Failed to get asset category' });
  }
};

const createAssetCategory = async (req, res) => {
  try {
    const { name, parent_id, category_type, description } = req.body;
    
    const result = await query(
      `INSERT INTO eams_asset_categories (name, parent_id, category_type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, parent_id, category_type, description]
    );
    
    res.status(201).json({ message: 'Asset category created', category: result.rows[0] });
  } catch (error) {
    console.error('Create asset category error:', error);
    res.status(500).json({ error: 'Failed to create asset category' });
  }
};

const updateAssetCategory = async (req, res) => {
  try {
    const { name, parent_id, category_type, description } = req.body;
    
    const result = await query(
      `UPDATE eams_asset_categories 
       SET name = COALESCE($1, name),
           parent_id = COALESCE($2, parent_id),
           category_type = COALESCE($3, category_type),
           description = COALESCE($4, description)
       WHERE id = $5
       RETURNING *`,
      [name, parent_id, category_type, description, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset category not found' });
    }
    
    res.json({ message: 'Asset category updated', category: result.rows[0] });
  } catch (error) {
    console.error('Update asset category error:', error);
    res.status(500).json({ error: 'Failed to update asset category' });
  }
};

const deleteAssetCategory = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM eams_asset_categories WHERE id = $1 AND is_system = false RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset category not found or cannot be deleted' });
    }
    
    res.json({ message: 'Asset category deleted successfully' });
  } catch (error) {
    console.error('Delete asset category error:', error);
    res.status(500).json({ error: 'Failed to delete asset category' });
  }
};

// Measurement Units
const getMeasurementUnits = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM eams_measurement_units ORDER BY unit_type ASC, name ASC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get measurement units error:', error);
    res.status(500).json({ error: 'Failed to get measurement units' });
  }
};

const getMeasurementUnitById = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM eams_measurement_units WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Measurement unit not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get measurement unit by ID error:', error);
    res.status(500).json({ error: 'Failed to get measurement unit' });
  }
};

const createMeasurementUnit = async (req, res) => {
  try {
    const { name, symbol, unit_type, description } = req.body;
    
    const result = await query(
      `INSERT INTO eams_measurement_units (name, symbol, unit_type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, symbol, unit_type, description]
    );
    
    res.status(201).json({ message: 'Measurement unit created', unit: result.rows[0] });
  } catch (error) {
    console.error('Create measurement unit error:', error);
    res.status(500).json({ error: 'Failed to create measurement unit' });
  }
};

const updateMeasurementUnit = async (req, res) => {
  try {
    const { name, symbol, unit_type, description } = req.body;
    
    const result = await query(
      `UPDATE eams_measurement_units 
       SET name = COALESCE($1, name),
           symbol = COALESCE($2, symbol),
           unit_type = COALESCE($3, unit_type),
           description = COALESCE($4, description)
       WHERE id = $5
       RETURNING *`,
      [name, symbol, unit_type, description, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Measurement unit not found' });
    }
    
    res.json({ message: 'Measurement unit updated', unit: result.rows[0] });
  } catch (error) {
    console.error('Update measurement unit error:', error);
    res.status(500).json({ error: 'Failed to update measurement unit' });
  }
};

const deleteMeasurementUnit = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM eams_measurement_units WHERE id = $1 AND is_system = false RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Measurement unit not found or cannot be deleted' });
    }
    
    res.json({ message: 'Measurement unit deleted successfully' });
  } catch (error) {
    console.error('Delete measurement unit error:', error);
    res.status(500).json({ error: 'Failed to delete measurement unit' });
  }
};

// Energy Types
const getEnergyTypes = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM eams_energy_types ORDER BY name ASC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get energy types error:', error);
    res.status(500).json({ error: 'Failed to get energy types' });
  }
};

const getEnergyTypeById = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM eams_energy_types WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Energy type not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get energy type by ID error:', error);
    res.status(500).json({ error: 'Failed to get energy type' });
  }
};

const createEnergyType = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const result = await query(
      `INSERT INTO eams_energy_types (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name, description]
    );
    
    res.status(201).json({ message: 'Energy type created', energy_type: result.rows[0] });
  } catch (error) {
    console.error('Create energy type error:', error);
    res.status(500).json({ error: 'Failed to create energy type' });
  }
};

const updateEnergyType = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const result = await query(
      `UPDATE eams_energy_types 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [name, description, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Energy type not found' });
    }
    
    res.json({ message: 'Energy type updated', energy_type: result.rows[0] });
  } catch (error) {
    console.error('Update energy type error:', error);
    res.status(500).json({ error: 'Failed to update energy type' });
  }
};

const deleteEnergyType = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM eams_energy_types WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Energy type not found' });
    }
    
    res.json({ message: 'Energy type deleted successfully' });
  } catch (error) {
    console.error('Delete energy type error:', error);
    res.status(500).json({ error: 'Failed to delete energy type' });
  }
};

// Equipment Hierarchy (4-level tree structure)
const getEquipmentHierarchy = async (req, res) => {
  try {
    const { parentId } = req.query;
    
    let queryText;
    let params = [];
    
    if (parentId) {
      // Get specific branch
      queryText = `
        SELECT eh.*,
               (SELECT COUNT(*) FROM eams_equipment_hierarchy WHERE parent_id = eh.id) as child_count
        FROM eams_equipment_hierarchy eh
        WHERE eh.id = $1 OR eh.parent_id = $1
        ORDER BY eh.level ASC, eh.sort_order ASC, eh.name ASC
      `;
      params = [parentId];
    } else {
      // Get entire hierarchy
      queryText = `
        SELECT eh.*,
               (SELECT COUNT(*) FROM eams_equipment_hierarchy WHERE parent_id = eh.id) as child_count
        FROM eams_equipment_hierarchy eh
        WHERE eh.is_active = true
        ORDER BY eh.parent_id ASC NULLS FIRST, eh.sort_order ASC, eh.name ASC
      `;
    }
    
    const result = await query(queryText, params);
    
    // Build hierarchical structure
    const hierarchy = result.rows;
    const hierarchyMap = new Map();
    
    // First pass: create all nodes
    hierarchy.forEach(node => {
      hierarchyMap.set(node.id, {
        id: node.id,
        name: node.name,
        parent_id: node.parent_id,
        level: node.level,
        sort_order: node.sort_order,
        is_active: node.is_active,
        child_count: node.child_count,
        created_at: node.created_at,
        updated_at: node.updated_at,
        children: []
      });
    });
    
    // Second pass: build hierarchy
    const rootNodes = [];
    hierarchy.forEach(node => {
      const treeNode = hierarchyMap.get(node.id);
      if (node.parent_id) {
        const parent = hierarchyMap.get(node.parent_id);
        if (parent) {
          parent.children.push(treeNode);
        }
      } else {
        rootNodes.push(treeNode);
      }
    });
    
    res.json(rootNodes);
  } catch (error) {
    console.error('Get equipment hierarchy error:', error);
    res.status(500).json({ error: 'Failed to get equipment hierarchy' });
  }
};

const getEquipmentHierarchyById = async (req, res) => {
  try {
    const result = await query(
      `SELECT eh.*,
              (SELECT COUNT(*) FROM eams_equipment_hierarchy WHERE parent_id = eh.id) as child_count
       FROM eams_equipment_hierarchy eh
       WHERE eh.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment hierarchy node not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get equipment hierarchy by ID error:', error);
    res.status(500).json({ error: 'Failed to get equipment hierarchy node' });
  }
};

const createEquipmentHierarchy = async (req, res) => {
  try {
    const { name, parent_id, level, sort_order } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (level === undefined || level === null) {
      return res.status(400).json({ error: 'Level is required' });
    }
    
    if (level < 0 || level > 3) {
      return res.status(400).json({ error: 'Level must be between 0 and 3' });
    }
    
    // Validate parent_id and level relationship
    if (parent_id) {
      const parentResult = await query(
        'SELECT level FROM eams_equipment_hierarchy WHERE id = $1',
        [parent_id]
      );
      
      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent node not found' });
      }
      
      const parentLevel = parentResult.rows[0].level;
      if (level !== parentLevel + 1) {
        return res.status(400).json({ 
          error: `Level must be ${parentLevel + 1} (parent level + 1)` 
        });
      }
    } else if (level !== 0) {
      return res.status(400).json({ error: 'Root nodes must have level 0' });
    }
    
    // Determine sort_order if not provided
    let sortOrder = sort_order;
    if (sortOrder === undefined || sortOrder === null) {
      let maxOrderResult;
      if (parent_id) {
        maxOrderResult = await query(
          'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM eams_equipment_hierarchy WHERE parent_id = $1',
          [parent_id]
        );
      } else {
        maxOrderResult = await query(
          'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM eams_equipment_hierarchy WHERE parent_id IS NULL'
        );
      }
      sortOrder = maxOrderResult.rows[0].max_order + 1;
    }
    
    const result = await query(
      `INSERT INTO eams_equipment_hierarchy (name, parent_id, level, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), parent_id || null, level, sortOrder]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create equipment hierarchy error:', error);
    res.status(500).json({ error: 'Failed to create equipment hierarchy node' });
  }
};

const updateEquipmentHierarchy = async (req, res) => {
  try {
    const { name, parent_id, sort_order } = req.body;
    const nodeId = req.params.id;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Check if node exists
    const existingResult = await query(
      'SELECT id, level FROM eams_equipment_hierarchy WHERE id = $1',
      [nodeId]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment hierarchy node not found' });
    }
    
    const currentLevel = existingResult.rows[0].level;
    
    // Validate parent_id if provided
    if (parent_id) {
      // Prevent circular reference
      if (parent_id === nodeId) {
        return res.status(400).json({ error: 'Cannot set node as its own parent' });
      }
      
      const parentResult = await query(
        'SELECT level FROM eams_equipment_hierarchy WHERE id = $1',
        [parent_id]
      );
      
      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent node not found' });
      }
      
      const parentLevel = parentResult.rows[0].level;
      if (currentLevel !== parentLevel + 1) {
        return res.status(400).json({ 
          error: `Cannot move node to parent with level ${parentLevel}. Node level ${currentLevel} requires parent level ${currentLevel - 1}` 
        });
      }
      
      // Check for circular reference in the hierarchy
      let currentParentId = parent_id;
      const visited = new Set([nodeId]);
      
      while (currentParentId) {
        if (visited.has(currentParentId)) {
          return res.status(400).json({ error: 'Circular reference detected in hierarchy' });
        }
        visited.add(currentParentId);
        
        const checkParentResult = await query(
          'SELECT parent_id FROM eams_equipment_hierarchy WHERE id = $1',
          [currentParentId]
        );
        
        if (checkParentResult.rows.length === 0) {
          break;
        }
        currentParentId = checkParentResult.rows[0].parent_id;
      }
    } else if (currentLevel !== 0) {
      return res.status(400).json({ error: 'Non-root nodes must have a parent' });
    }
    
    const result = await query(
      `UPDATE eams_equipment_hierarchy
       SET name = $1,
           parent_id = COALESCE($2, parent_id),
           sort_order = COALESCE($3, sort_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name.trim(), parent_id, sort_order, nodeId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update equipment hierarchy error:', error);
    res.status(500).json({ error: 'Failed to update equipment hierarchy node' });
  }
};

const deleteEquipmentHierarchy = async (req, res) => {
  try {
    const nodeId = req.params.id;
    
    // Check if node has children
    const childrenResult = await query(
      'SELECT COUNT(*) as count FROM eams_equipment_hierarchy WHERE parent_id = $1',
      [nodeId]
    );
    
    if (parseInt(childrenResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete node with children. Please delete or move children first.' 
      });
    }
    
    // Delete the node
    await query(
      'DELETE FROM eams_equipment_hierarchy WHERE id = $1',
      [nodeId]
    );
    
    res.json({ message: 'Equipment hierarchy node deleted successfully' });
  } catch (error) {
    console.error('Delete equipment hierarchy error:', error);
    res.status(500).json({ error: 'Failed to delete equipment hierarchy node' });
  }
};

const moveEquipmentHierarchy = async (req, res) => {
  try {
    const { new_parent_id, new_sort_order } = req.body;
    const nodeId = req.params.id;
    
    // Check if node exists
    const existingResult = await query(
      'SELECT id, level FROM eams_equipment_hierarchy WHERE id = $1',
      [nodeId]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment hierarchy node not found' });
    }
    
    const currentLevel = existingResult.rows[0].level;
    
    // Validate new_parent_id if provided
    if (new_parent_id) {
      // Prevent circular reference
      if (new_parent_id === nodeId) {
        return res.status(400).json({ error: 'Cannot set node as its own parent' });
      }
      
      const parentResult = await query(
        'SELECT level FROM eams_equipment_hierarchy WHERE id = $1',
        [new_parent_id]
      );
      
      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent node not found' });
      }
      
      const parentLevel = parentResult.rows[0].level;
      if (currentLevel !== parentLevel + 1) {
        return res.status(400).json({ 
          error: `Cannot move node to parent with level ${parentLevel}. Node level ${currentLevel} requires parent level ${currentLevel - 1}` 
        });
      }
      
      // Check for circular reference in the hierarchy
      let currentParentId = new_parent_id;
      const visited = new Set([nodeId]);
      
      while (currentParentId) {
        if (visited.has(currentParentId)) {
          return res.status(400).json({ error: 'Circular reference detected in hierarchy' });
        }
        visited.add(currentParentId);
        
        const checkParentResult = await query(
          'SELECT parent_id FROM eams_equipment_hierarchy WHERE id = $1',
          [currentParentId]
        );
        
        if (checkParentResult.rows.length === 0) {
          break;
        }
        currentParentId = checkParentResult.rows[0].parent_id;
      }
    } else if (currentLevel !== 0) {
      return res.status(400).json({ error: 'Non-root nodes must have a parent' });
    }
    
    const result = await query(
      `UPDATE eams_equipment_hierarchy
       SET parent_id = $1,
           sort_order = COALESCE($2, sort_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [new_parent_id || null, new_sort_order, nodeId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Move equipment hierarchy error:', error);
    res.status(500).json({ error: 'Failed to move equipment hierarchy node' });
  }
};

// Authorized Departments
const getAuthorizedDepartments = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM core_authorized_departments ORDER BY name ASC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get authorized departments error:', error);
    res.status(500).json({ error: 'Failed to get authorized departments' });
  }
};

const getAuthorizedDepartmentById = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM core_authorized_departments WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Authorized department not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get authorized department by ID error:', error);
    res.status(500).json({ error: 'Failed to get authorized department' });
  }
};

const createAuthorizedDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const result = await query(
      `INSERT INTO core_authorized_departments (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name, description]
    );
    
    res.status(201).json({ message: 'Authorized department created', department: result.rows[0] });
  } catch (error) {
    console.error('Create authorized department error:', error);
    res.status(500).json({ error: 'Failed to create authorized department' });
  }
};

const updateAuthorizedDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const result = await query(
      `UPDATE core_authorized_departments 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [name, description, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Authorized department not found' });
    }
    
    res.json({ message: 'Authorized department updated', department: result.rows[0] });
  } catch (error) {
    console.error('Update authorized department error:', error);
    res.status(500).json({ error: 'Failed to update authorized department' });
  }
};

const deleteAuthorizedDepartment = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM core_authorized_departments WHERE id = $1 AND is_system = false RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Authorized department not found or cannot be deleted' });
    }
    
    res.json({ message: 'Authorized department deleted successfully' });
  } catch (error) {
    console.error('Delete authorized department error:', error);
    res.status(500).json({ error: 'Failed to delete authorized department' });
  }
};

// Maintenance Types
const getMaintenanceTypes = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM eams_maintenance_types ORDER BY name ASC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get maintenance types error:', error);
    res.status(500).json({ error: 'Failed to get maintenance types' });
  }
};

const getMaintenanceTypeById = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM eams_maintenance_types WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance type not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get maintenance type by ID error:', error);
    res.status(500).json({ error: 'Failed to get maintenance type' });
  }
};

const createMaintenanceType = async (req, res) => {
  try {
    const { name, description, is_periodic } = req.body;
    
    const result = await query(
      `INSERT INTO eams_maintenance_types (name, description, is_periodic)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, is_periodic]
    );
    
    res.status(201).json({ message: 'Maintenance type created', maintenance_type: result.rows[0] });
  } catch (error) {
    console.error('Create maintenance type error:', error);
    res.status(500).json({ error: 'Failed to create maintenance type' });
  }
};

const updateMaintenanceType = async (req, res) => {
  try {
    const { name, description, is_periodic } = req.body;
    
    const result = await query(
      `UPDATE eams_maintenance_types 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_periodic = COALESCE($3, is_periodic)
       WHERE id = $4
       RETURNING *`,
      [name, description, is_periodic, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance type not found' });
    }
    
    res.json({ message: 'Maintenance type updated', maintenance_type: result.rows[0] });
  } catch (error) {
    console.error('Update maintenance type error:', error);
    res.status(500).json({ error: 'Failed to update maintenance type' });
  }
};

const deleteMaintenanceType = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM eams_maintenance_types WHERE id = $1 AND is_system = false RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance type not found or cannot be deleted' });
    }
    
    res.json({ message: 'Maintenance type deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance type error:', error);
    res.status(500).json({ error: 'Failed to delete maintenance type' });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSetting,
  createSystemSetting,
  getEquipmentCategories,
  createEquipmentCategory,
  updateEquipmentCategory,
  deleteEquipmentCategory,
  getAssetCategories,
  getAssetCategoryById,
  createAssetCategory,
  updateAssetCategory,
  deleteAssetCategory,
  getMeasurementUnits,
  getMeasurementUnitById,
  createMeasurementUnit,
  updateMeasurementUnit,
  deleteMeasurementUnit,
  getEnergyTypes,
  getEnergyTypeById,
  createEnergyType,
  updateEnergyType,
  deleteEnergyType,
  getAuthorizedDepartments,
  getAuthorizedDepartmentById,
  createAuthorizedDepartment,
  updateAuthorizedDepartment,
  deleteAuthorizedDepartment,
  getMaintenanceTypes,
  getMaintenanceTypeById,
  createMaintenanceType,
  updateMaintenanceType,
  deleteMaintenanceType,
  // Equipment Hierarchy
  getEquipmentHierarchy,
  getEquipmentHierarchyById,
  createEquipmentHierarchy,
  updateEquipmentHierarchy,
  deleteEquipmentHierarchy,
  moveEquipmentHierarchy
};
