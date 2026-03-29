const { query } = require('../config/database');

/**
 * Checklist Service
 * Handles all business logic for checklist management and assignment
 */

/**
 * Get applicable checklists for a work order based on asset and maintenance type
 * This is the core business logic for checklist assignment
 * 
 * @param {UUID} assetId - The asset ID
 * @param {string} maintenanceType - The maintenance type (e.g., 'ISG', 'Aylık Bakım')
 * @returns {Promise<Array>} - Array of applicable templates with their items
 */
const getApplicableChecklistsForWorkOrder = async (assetId, maintenanceType) => {
  try {
    // Step 1: Get the asset's category
    const assetResult = await query(
      'SELECT category_id FROM eams_assets WHERE id = $1',
      [assetId]
    );
    
    if (assetResult.rows.length === 0) {
      throw new Error('Asset not found');
    }
    
    const assetCategoryId = assetResult.rows[0].category_id;
    
    // Step 2: Get applicable assignment rules in priority order
    // Priority levels: ASSET (1) > CATEGORY (2) > GLOBAL (3)
    const rulesResult = await query(
      `
      SELECT car.*, ct.name as template_name, ct.checklist_type, ct.description
      FROM cms_checklist_assignment_rules car
      JOIN cms_checklist_templates ct ON car.template_id = ct.id
      WHERE car.is_active = true
        AND ct.is_active = true
        AND (car.maintenance_type = $1 OR car.maintenance_type = 'ALL')
        AND (
          (car.scope_type = 'ASSET' AND car.asset_id = $2)
          OR (car.scope_type = 'CATEGORY' AND car.category_id = $3)
          OR (car.scope_type = 'GLOBAL')
        )
      ORDER BY car.priority ASC, car.scope_type ASC
      `,
      [maintenanceType, assetId, assetCategoryId]
    );
    
    // Step 3: Deduplicate templates by priority (keep highest priority rule for each template)
    const templateMap = new Map();
    for (const rule of rulesResult.rows) {
      if (!templateMap.has(rule.template_id)) {
        templateMap.set(rule.template_id, rule);
      }
    }
    
    const uniqueTemplates = Array.from(templateMap.values());
    
    // Step 4: For each template, get its items and create the full structure
    const templatesWithItems = [];
    for (const template of uniqueTemplates) {
      const itemsResult = await query(
        `
        SELECT id, order_index, question, item_type, is_required, options, validation_rules
        FROM cms_checklist_items
        WHERE template_id = $1
        ORDER BY order_index ASC
        `,
        [template.template_id]
      );
      
      templatesWithItems.push({
        template_id: template.template_id,
        template_name: template.template_name,
        checklist_type: template.checklist_type,
        description: template.description,
        items: itemsResult.rows
      });
    }
    
    return templatesWithItems;
  } catch (error) {
    console.error('Error getting applicable checklists:', error);
    throw error;
  }
};

/**
 * Generate work order checklists for a maintenance record
 * Creates checklist instances with snapshots
 * 
 * @param {UUID} workOrderId - The maintenance record ID
 * @param {UUID} assetId - The asset ID
 * @param {string} maintenanceType - The maintenance type
 * @returns {Promise<Array>} - Array of created work order checklists
 */
const generateWorkOrderChecklists = async (workOrderId, assetId, maintenanceType) => {
  try {
    // Get applicable templates
    const templates = await getApplicableChecklistsForWorkOrder(assetId, maintenanceType);
    
    if (templates.length === 0) {
      return [];
    }
    
    // Create work order checklist instances with snapshots
    const createdChecklists = [];
    for (const template of templates) {
      // Create snapshot of template and items
      const snapshot = {
        template: {
          id: template.template_id,
          name: template.template_name,
          checklist_type: template.checklist_type,
          description: template.description
        },
        items: template.items
      };
      
      const result = await query(
        `
        INSERT INTO cms_work_order_checklists (work_order_id, template_id, asset_id, status, snapshot)
        VALUES ($1, $2, $3, 'PENDING', $4)
        RETURNING *
        `,
        [workOrderId, template.template_id, assetId, JSON.stringify(snapshot)]
      );
      
      createdChecklists.push(result.rows[0]);
    }
    
    return createdChecklists;
  } catch (error) {
    console.error('Error generating work order checklists:', error);
    throw error;
  }
};

/**
 * Calculate compliance status based on response value and validation rules
 * 
 * @param {string} itemType - The type of checklist item
 * @param {Object} responseValue - The response value
 * @param {Object} validationRules - The validation rules for the item
 * @returns {boolean|null} - Compliance status or null if not applicable
 */
const calculateCompliance = (itemType, responseValue, validationRules) => {
  if (!responseValue || typeof responseValue !== 'object') {
    return null;
  }
  
  const value = responseValue.value;
  
  switch (itemType) {
    case 'boolean':
      // Boolean: true = compliant, false = non-compliant
      return value === true;
      
    case 'numeric':
      // Numeric: check min/max if validation rules exist
      if (validationRules && (validationRules.min !== undefined || validationRules.max !== undefined)) {
        const min = validationRules.min !== undefined ? parseFloat(validationRules.min) : -Infinity;
        const max = validationRules.max !== undefined ? parseFloat(validationRules.max) : Infinity;
        const numValue = parseFloat(value);
        return numValue >= min && numValue <= max;
      }
      return null;
      
    case 'select':
      // Select: check if value is in non_compliant_values list
      if (validationRules && validationRules.non_compliant_values && Array.isArray(validationRules.non_compliant_values)) {
        return !validationRules.non_compliant_values.includes(value);
      }
      return null;
      
    case 'text':
    case 'photo':
    default:
      // Text and photo types don't have automatic compliance checks
      return null;
  }
};

/**
 * Save checklist response
 * 
 * @param {UUID} workOrderChecklistId - The work order checklist ID
 * @param {UUID} itemId - The checklist item ID
 * @param {Object} responseValue - The response value
 * @param {string} notes - Optional notes
 * @param {UUID} respondedBy - The user ID responding
 * @returns {Promise<Object>} - The created response
 */
const saveChecklistResponse = async (workOrderChecklistId, itemId, responseValue, notes, respondedBy) => {
  try {
    // Get the item details to calculate compliance
    const itemResult = await query(
      `
      SELECT item_type, validation_rules
      FROM cms_checklist_items
      WHERE id = $1
      `,
      [itemId]
    );
    
    if (itemResult.rows.length === 0) {
      throw new Error('Checklist item not found');
    }
    
    const item = itemResult.rows[0];
    const isCompliant = calculateCompliance(item.item_type, responseValue, item.validation_rules);
    
    const result = await query(
      `
      INSERT INTO cms_checklist_responses (work_order_checklist_id, item_id, response_value, is_compliant, notes, responded_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        workOrderChecklistId,
        itemId,
        JSON.stringify(responseValue),
        isCompliant,
        notes || null,
        respondedBy
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving checklist response:', error);
    throw error;
  }
};

/**
 * Get checklist summary for a work order
 * 
 * @param {UUID} workOrderId - The maintenance record ID
 * @returns {Promise<Object>} - Summary statistics
 */
const getChecklistSummary = async (workOrderId) => {
  try {
    // Get all checklists for the work order
    const checklistsResult = await query(
      `
      SELECT woc.*, 
             COUNT(DISTINCT cr.id) as total_responses,
             COUNT(DISTINCT CASE WHEN cr.is_compliant = false THEN cr.id END) as non_compliant_count,
             COUNT(DISTINCT CASE WHEN cr.is_compliant = true THEN cr.id END) as compliant_count
      FROM cms_work_order_checklists woc
      LEFT JOIN cms_checklist_responses cr ON woc.id = cr.work_order_checklist_id
      WHERE woc.work_order_id = $1
      GROUP BY woc.id
      `,
      [workOrderId]
    );
    
    if (checklistsResult.rows.length === 0) {
      return {
        total_checklists: 0,
        completed_checklists: 0,
        pending_checklists: 0,
        total_items: 0,
        completed_items: 0,
        non_compliant_items: 0,
        compliant_items: 0,
        completion_rate: 0,
        has_critical_violations: false
      };
    }
    
    // Get total items from snapshots
    let totalItems = 0;
    for (const checklist of checklistsResult.rows) {
      if (checklist.snapshot && checklist.snapshot.items) {
        totalItems += checklist.snapshot.items.length;
      }
    }
    
    const completedChecklists = checklistsResult.rows.filter(c => c.status === 'COMPLETED').length;
    const pendingChecklists = checklistsResult.rows.filter(c => c.status === 'PENDING').length;
    const inProgressChecklists = checklistsResult.rows.filter(c => c.status === 'IN_PROGRESS').length;
    
    const totalResponses = checklistsResult.rows.reduce((sum, c) => sum + parseInt(c.total_responses || 0), 0);
    const nonCompliantCount = checklistsResult.rows.reduce((sum, c) => sum + parseInt(c.non_compliant_count || 0), 0);
    const compliantCount = checklistsResult.rows.reduce((sum, c) => sum + parseInt(c.compliant_count || 0), 0);
    
    const completionRate = totalItems > 0 ? (totalResponses / totalItems) * 100 : 0;
    const hasCriticalViolations = nonCompliantCount > 0;
    
    return {
      total_checklists: checklistsResult.rows.length,
      completed_checklists: completedChecklists,
      in_progress_checklists: inProgressChecklists,
      pending_checklists: pendingChecklists,
      total_items: totalItems,
      completed_items: totalResponses,
      non_compliant_items: nonCompliantCount,
      compliant_items: compliantCount,
      completion_rate: Math.round(completionRate * 100) / 100,
      has_critical_violations: hasCriticalViolations
    };
  } catch (error) {
    console.error('Error getting checklist summary:', error);
    throw error;
  }
};

/**
 * Get work order checklists with responses
 * 
 * @param {UUID} workOrderId - The maintenance record ID
 * @returns {Promise<Array>} - Array of checklists with responses
 */
const getWorkOrderChecklists = async (workOrderId) => {
  try {
    const checklistsResult = await query(
      `
      SELECT woc.*
      FROM cms_work_order_checklists woc
      WHERE woc.work_order_id = $1
      ORDER BY woc.created_at ASC
      `,
      [workOrderId]
    );
    
    const checklistsWithResponses = [];
    for (const checklist of checklistsResult.rows) {
      const responsesResult = await query(
        `
        SELECT cr.*, ci.question, ci.item_type, ci.is_required
        FROM cms_checklist_responses cr
        JOIN cms_checklist_items ci ON cr.item_id = ci.id
        WHERE cr.work_order_checklist_id = $1
        ORDER BY ci.order_index ASC
        `,
        [checklist.id]
      );
      
      checklistsWithResponses.push({
        ...checklist,
        responses: responsesResult.rows
      });
    }
    
    return checklistsWithResponses;
  } catch (error) {
    console.error('Error getting work order checklists:', error);
    throw error;
  }
};

/**
 * Update work order checklist status
 * 
 * @param {UUID} checklistId - The checklist ID
 * @param {string} status - The new status
 * @returns {Promise<Object>} - The updated checklist
 */
const updateChecklistStatus = async (checklistId, status) => {
  try {
    const result = await query(
      `
      UPDATE cms_work_order_checklists
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, checklistId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Checklist not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating checklist status:', error);
    throw error;
  }
};

module.exports = {
  getApplicableChecklistsForWorkOrder,
  generateWorkOrderChecklists,
  saveChecklistResponse,
  getChecklistSummary,
  getWorkOrderChecklists,
  updateChecklistStatus,
  calculateCompliance
};
