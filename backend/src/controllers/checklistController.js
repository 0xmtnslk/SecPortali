const { query } = require('../config/database');
const checklistService = require('../services/checklistService');

/**
 * Checklist Settings Controller
 * Handles all HTTP requests for checklist template and assignment rule management
 */

// ============================================================================
// CHECKLIST TEMPLATES
// ============================================================================

/**
 * Get all checklist templates with optional filtering
 */
const getAllChecklistTemplates = async (req, res) => {
  try {
    const { checklist_type, is_active, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT ct.*,
             COUNT(DISTINCT ci.id) as item_count
      FROM cms_checklist_templates ct
      LEFT JOIN cms_checklist_items ci ON ct.id = ci.template_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (checklist_type) {
      queryText += ` AND ct.checklist_type = $${paramIndex}`;
      params.push(checklist_type);
      paramIndex++;
    }
    
    if (is_active !== undefined) {
      queryText += ` AND ct.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }
    
    queryText += ` GROUP BY ct.id ORDER BY ct.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    res.json({
      templates: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get all checklist templates error:', error);
    res.status(500).json({ error: 'Failed to get checklist templates' });
  }
};

/**
 * Get a checklist template by ID with its items
 */
const getChecklistTemplateById = async (req, res) => {
  try {
    const templateResult = await query(
      'SELECT * FROM cms_checklist_templates WHERE id = $1',
      [req.params.id]
    );
    
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist template not found' });
    }
    
    const template = templateResult.rows[0];
    
    // Get items for this template
    const itemsResult = await query(
      `SELECT * FROM cms_checklist_items 
       WHERE template_id = $1 
       ORDER BY order_index ASC`,
      [req.params.id]
    );
    
    template.items = itemsResult.rows;
    
    res.json(template);
  } catch (error) {
    console.error('Get checklist template by ID error:', error);
    res.status(500).json({ error: 'Failed to get checklist template' });
  }
};

/**
 * Create a new checklist template
 */
const createChecklistTemplate = async (req, res) => {
  try {
    const { name, description, checklist_type, is_active, items } = req.body;
    
    if (!name || !checklist_type) {
      return res.status(400).json({ error: 'Name and checklist_type are required' });
    }
    
    // Create template
    const templateResult = await query(
      `INSERT INTO cms_checklist_templates (name, description, checklist_type, is_active)
       VALUES ($1, $2, $3, COALESCE($4, true))
       RETURNING *`,
      [name, description, checklist_type, is_active]
    );
    
    const template = templateResult.rows[0];
    
    // Create items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await query(
          `INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
           VALUES ($1, $2, $3, $4, COALESCE($5, true), $6, $7)`,
          [
            template.id,
            item.order_index || 0,
            item.question,
            item.item_type,
            item.is_required,
            item.options ? JSON.stringify(item.options) : null,
            item.validation_rules ? JSON.stringify(item.validation_rules) : null
          ]
        );
      }
    }
    
    res.status(201).json({ message: 'Checklist template created successfully', template });
  } catch (error) {
    console.error('Create checklist template error:', error);
    res.status(500).json({ error: 'Failed to create checklist template' });
  }
};

/**
 * Update a checklist template
 */
const updateChecklistTemplate = async (req, res) => {
  try {
    const { name, description, checklist_type, is_active } = req.body;
    
    const result = await query(
      `UPDATE cms_checklist_templates
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           checklist_type = COALESCE($3, checklist_type),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, description, checklist_type, is_active, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist template not found' });
    }
    
    res.json({ message: 'Checklist template updated successfully', template: result.rows[0] });
  } catch (error) {
    console.error('Update checklist template error:', error);
    res.status(500).json({ error: 'Failed to update checklist template' });
  }
};

/**
 * Delete (deactivate) a checklist template
 */
const deleteChecklistTemplate = async (req, res) => {
  try {
    const result = await query(
      'UPDATE cms_checklist_templates SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist template not found' });
    }
    
    res.json({ message: 'Checklist template deleted successfully' });
  } catch (error) {
    console.error('Delete checklist template error:', error);
    res.status(500).json({ error: 'Failed to delete checklist template' });
  }
};

// ============================================================================
// CHECKLIST ITEMS
// ============================================================================

/**
 * Add an item to a checklist template
 */
const addChecklistItem = async (req, res) => {
  try {
    const { order_index, question, item_type, is_required, options, validation_rules } = req.body;
    
    if (!question || !item_type) {
      return res.status(400).json({ error: 'Question and item_type are required' });
    }
    
    const result = await query(
      `INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
       VALUES ($1, $2, $3, $4, COALESCE($5, true), $6, $7)
       RETURNING *`,
      [
        req.params.id,
        order_index || 0,
        question,
        item_type,
        is_required,
        options ? JSON.stringify(options) : null,
        validation_rules ? JSON.stringify(validation_rules) : null
      ]
    );
    
    res.status(201).json({ message: 'Checklist item added successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Add checklist item error:', error);
    res.status(500).json({ error: 'Failed to add checklist item' });
  }
};

/**
 * Update a checklist item
 */
const updateChecklistItem = async (req, res) => {
  try {
    const { order_index, question, item_type, is_required, options, validation_rules } = req.body;
    
    const result = await query(
      `UPDATE cms_checklist_items
       SET order_index = COALESCE($1, order_index),
           question = COALESCE($2, question),
           item_type = COALESCE($3, item_type),
           is_required = COALESCE($4, is_required),
           options = COALESCE($5, options::jsonb),
           validation_rules = COALESCE($6, validation_rules::jsonb)
       WHERE id = $7
       RETURNING *`,
      [
        order_index,
        question,
        item_type,
        is_required,
        options ? JSON.stringify(options) : null,
        validation_rules ? JSON.stringify(validation_rules) : null,
        req.params.itemId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }
    
    res.json({ message: 'Checklist item updated successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Update checklist item error:', error);
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
};

/**
 * Delete a checklist item
 */
const deleteChecklistItem = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM cms_checklist_items WHERE id = $1 RETURNING id',
      [req.params.itemId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }
    
    res.json({ message: 'Checklist item deleted successfully' });
  } catch (error) {
    console.error('Delete checklist item error:', error);
    res.status(500).json({ error: 'Failed to delete checklist item' });
  }
};

/**
 * Reorder checklist items
 */
const reorderChecklistItems = async (req, res) => {
  try {
    const { items } = req.body; // Array of {id, order_index}
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    
    for (const item of items) {
      await query(
        'UPDATE cms_checklist_items SET order_index = $1 WHERE id = $2',
        [item.order_index, item.id]
      );
    }
    
    res.json({ message: 'Checklist items reordered successfully' });
  } catch (error) {
    console.error('Reorder checklist items error:', error);
    res.status(500).json({ error: 'Failed to reorder checklist items' });
  }
};

// ============================================================================
// CHECKLIST ASSIGNMENT RULES
// ============================================================================

/**
 * Get all assignment rules with optional filtering
 */
const getAllAssignmentRules = async (req, res) => {
  try {
    const { template_id, scope_type, maintenance_type, is_active } = req.query;
    
    let queryText = `
      SELECT car.*,
             ct.name as template_name,
             ct.checklist_type,
             a.name as asset_name,
             a.asset_code,
             ac.name as category_name
      FROM cms_checklist_assignment_rules car
      JOIN cms_checklist_templates ct ON car.template_id = ct.id
      LEFT JOIN eams_assets a ON car.asset_id = a.id
      LEFT JOIN eams_asset_categories ac ON car.category_id = ac.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (template_id) {
      queryText += ` AND car.template_id = $${paramIndex}`;
      params.push(template_id);
      paramIndex++;
    }
    
    if (scope_type) {
      queryText += ` AND car.scope_type = $${paramIndex}`;
      params.push(scope_type);
      paramIndex++;
    }
    
    if (maintenance_type) {
      queryText += ` AND car.maintenance_type = $${paramIndex}`;
      params.push(maintenance_type);
      paramIndex++;
    }
    
    if (is_active !== undefined) {
      queryText += ` AND car.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }
    
    queryText += ` ORDER BY car.priority ASC, car.created_at DESC`;
    
    const result = await query(queryText, params);
    
    res.json({ rules: result.rows });
  } catch (error) {
    console.error('Get all assignment rules error:', error);
    res.status(500).json({ error: 'Failed to get assignment rules' });
  }
};

/**
 * Create a new assignment rule
 */
const createAssignmentRule = async (req, res) => {
  try {
    const { template_id, priority, scope_type, asset_id, category_id, maintenance_type, is_active } = req.body;
    
    if (!template_id || !scope_type || !maintenance_type) {
      return res.status(400).json({ error: 'template_id, scope_type, and maintenance_type are required' });
    }
    
    // Validate scope constraints
    if (scope_type === 'ASSET' && !asset_id) {
      return res.status(400).json({ error: 'asset_id is required for ASSET scope' });
    }
    if (scope_type === 'CATEGORY' && !category_id) {
      return res.status(400).json({ error: 'category_id is required for CATEGORY scope' });
    }
    if (scope_type === 'GLOBAL' && (asset_id || category_id)) {
      return res.status(400).json({ error: 'asset_id and category_id must be null for GLOBAL scope' });
    }
    
    const result = await query(
      `INSERT INTO cms_checklist_assignment_rules (template_id, priority, scope_type, asset_id, category_id, maintenance_type, is_active)
       VALUES ($1, COALESCE($2, 1), $3, $4, $5, $6, COALESCE($7, true))
       RETURNING *`,
      [template_id, priority, scope_type, asset_id || null, category_id || null, maintenance_type, is_active]
    );
    
    res.status(201).json({ message: 'Assignment rule created successfully', rule: result.rows[0] });
  } catch (error) {
    console.error('Create assignment rule error:', error);
    res.status(500).json({ error: 'Failed to create assignment rule' });
  }
};

/**
 * Delete an assignment rule
 */
const deleteAssignmentRule = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM cms_checklist_assignment_rules WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment rule not found' });
    }
    
    res.json({ message: 'Assignment rule deleted successfully' });
  } catch (error) {
    console.error('Delete assignment rule error:', error);
    res.status(500).json({ error: 'Failed to delete assignment rule' });
  }
};

/**
 * Preview applicable checklists for an asset and maintenance type
 */
const previewApplicableChecklists = async (req, res) => {
  try {
    const { assetId, maintenanceType } = req.query;
    
    if (!assetId || !maintenanceType) {
      return res.status(400).json({ error: 'assetId and maintenanceType are required' });
    }
    
    const templates = await checklistService.getApplicableChecklistsForWorkOrder(assetId, maintenanceType);
    
    res.json({ templates });
  } catch (error) {
    console.error('Preview applicable checklists error:', error);
    res.status(500).json({ error: 'Failed to preview applicable checklists' });
  }
};

// ============================================================================
// WORK ORDER CHECKLISTS (Integration with Maintenance)
// ============================================================================

/**
 * Generate checklists for a maintenance record
 */
const generateWorkOrderChecklists = async (req, res) => {
  try {
    const workOrderId = req.params.id;
    
    // Get the maintenance record to get asset_id and maintenance_type
    const maintenanceResult = await query(
      `SELECT mr.asset_id, mt.name as maintenance_type
       FROM eams_maintenance_records mr
       LEFT JOIN eams_maintenance_types mt ON mr.maintenance_type_id = mt.id
       WHERE mr.id = $1`,
      [workOrderId]
    );
    
    if (maintenanceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    
    const { asset_id, maintenance_type } = maintenanceResult.rows[0];
    
    if (!maintenance_type) {
      return res.status(400).json({ error: 'Maintenance type not found for this record' });
    }
    
    const checklists = await checklistService.generateWorkOrderChecklists(
      workOrderId,
      asset_id,
      maintenance_type
    );
    
    res.json({ message: 'Checklists generated successfully', checklists });
  } catch (error) {
    console.error('Generate work order checklists error:', error);
    res.status(500).json({ error: 'Failed to generate work order checklists' });
  }
};

/**
 * Get all checklists for a maintenance record
 */
const getWorkOrderChecklists = async (req, res) => {
  try {
    const checklists = await checklistService.getWorkOrderChecklists(req.params.id);
    res.json({ checklists });
  } catch (error) {
    console.error('Get work order checklists error:', error);
    res.status(500).json({ error: 'Failed to get work order checklists' });
  }
};

/**
 * Get checklist summary for a maintenance record
 */
const getWorkOrderChecklistSummary = async (req, res) => {
  try {
    const summary = await checklistService.getChecklistSummary(req.params.id);
    res.json(summary);
  } catch (error) {
    console.error('Get work order checklist summary error:', error);
    res.status(500).json({ error: 'Failed to get checklist summary' });
  }
};

/**
 * Save checklist responses
 */
const saveChecklistResponses = async (req, res) => {
  try {
    const { responses } = req.body; // Array of {item_id, response_value, notes}
    const workOrderId = req.params.id;
    const checklistId = req.params.checklistId;
    const userId = req.user.id;
    
    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'Responses array is required' });
    }
    
    const savedResponses = [];
    for (const response of responses) {
      const saved = await checklistService.saveChecklistResponse(
        checklistId,
        response.item_id,
        response.response_value,
        response.notes,
        userId
      );
      savedResponses.push(saved);
    }
    
    res.status(201).json({ message: 'Responses saved successfully', responses: savedResponses });
  } catch (error) {
    console.error('Save checklist responses error:', error);
    res.status(500).json({ error: 'Failed to save checklist responses' });
  }
};

/**
 * Update checklist status
 */
const updateChecklistStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const checklist = await checklistService.updateChecklistStatus(req.params.checklistId, status);
    res.json({ message: 'Checklist status updated successfully', checklist });
  } catch (error) {
    console.error('Update checklist status error:', error);
    res.status(500).json({ error: 'Failed to update checklist status' });
  }
};

module.exports = {
  // Template endpoints
  getAllChecklistTemplates,
  getChecklistTemplateById,
  createChecklistTemplate,
  updateChecklistTemplate,
  deleteChecklistTemplate,
  
  // Item endpoints
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
  
  // Assignment rule endpoints
  getAllAssignmentRules,
  createAssignmentRule,
  deleteAssignmentRule,
  previewApplicableChecklists,
  
  // Work order checklist endpoints
  generateWorkOrderChecklists,
  getWorkOrderChecklists,
  getWorkOrderChecklistSummary,
  saveChecklistResponses,
  updateChecklistStatus
};
