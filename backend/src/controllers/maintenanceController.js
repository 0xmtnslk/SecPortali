const { query } = require('../config/database');
const checklistService = require('../services/checklistService');

const getAllMaintenancePlans = async (req, res) => {
  try {
    const { asset_id, facility_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT mp.*, 
             a.name as asset_name,
             a.asset_code,
             mt.name as maintenance_type_name,
             u.first_name || ' ' || u.last_name as responsible_user_name,
             ad.name as responsible_department_name,
             c.company_name as contractor_name
      FROM eams_maintenance_plans mp
      LEFT JOIN eams_assets a ON mp.asset_id = a.id
      LEFT JOIN eams_maintenance_types mt ON mp.maintenance_type_id = mt.id
      LEFT JOIN core_users u ON mp.responsible_user_id = u.id
      LEFT JOIN core_authorized_departments ad ON mp.responsible_department_id = ad.id
      LEFT JOIN cms_contractors c ON mp.contractor_id = c.id
      WHERE mp.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (asset_id) {
      queryText += ` AND mp.asset_id = $${paramIndex}`;
      params.push(asset_id);
      paramIndex++;
    }
    
    if (facility_id) {
      queryText += ` AND a.facility_id = $${paramIndex}`;
      params.push(facility_id);
      paramIndex++;
    }
    
    if (status) {
      queryText += ` AND mp.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    queryText += ` ORDER BY mp.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    res.json({
      maintenance_plans: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get all maintenance plans error:', error);
    res.status(500).json({ error: 'Failed to get maintenance plans' });
  }
};

const getMaintenancePlanById = async (req, res) => {
  try {
    const result = await query(
      `SELECT mp.*, 
              a.name as asset_name,
              a.asset_code,
              mt.name as maintenance_type_name,
              u.first_name || ' ' || u.last_name as responsible_user_name,
              ad.name as responsible_department_name,
              c.company_name as contractor_name
       FROM eams_maintenance_plans mp
       LEFT JOIN eams_assets a ON mp.asset_id = a.id
       LEFT JOIN eams_maintenance_types mt ON mp.maintenance_type_id = mt.id
       LEFT JOIN core_users u ON mp.responsible_user_id = u.id
       LEFT JOIN core_authorized_departments ad ON mp.responsible_department_id = ad.id
       LEFT JOIN cms_contractors c ON mp.contractor_id = c.id
       WHERE mp.id = $1 AND mp.is_active = true`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance plan not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get maintenance plan by ID error:', error);
    res.status(500).json({ error: 'Failed to get maintenance plan' });
  }
};

const createMaintenancePlan = async (req, res) => {
  try {
    const {
      asset_id,
      maintenance_type_id,
      plan_name,
      description,
      frequency,
      frequency_value,
      duration_hours,
      priority,
      start_date,
      end_date,
      responsible_user_id,
      responsible_department_id,
      contractor_id
    } = req.body;
    
    const result = await query(
      `INSERT INTO eams_maintenance_plans (
        asset_id, maintenance_type_id, plan_name, description, frequency,
        frequency_value, duration_hours, priority, start_date, end_date,
        responsible_user_id, responsible_department_id, contractor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        asset_id, maintenance_type_id, plan_name, description, frequency,
        frequency_value, duration_hours, priority, start_date, end_date,
        responsible_user_id, responsible_department_id, contractor_id
      ]
    );
    
    res.status(201).json({ message: 'Maintenance plan created successfully', maintenance_plan: result.rows[0] });
  } catch (error) {
    console.error('Create maintenance plan error:', error);
    res.status(500).json({ error: 'Failed to create maintenance plan' });
  }
};

const updateMaintenancePlan = async (req, res) => {
  try {
    const {
      asset_id,
      maintenance_type_id,
      plan_name,
      description,
      frequency,
      frequency_value,
      duration_hours,
      priority,
      start_date,
      end_date,
      responsible_user_id,
      responsible_department_id,
      contractor_id,
      is_active
    } = req.body;
    
    const result = await query(
      `UPDATE eams_maintenance_plans 
       SET asset_id = COALESCE($1, asset_id),
           maintenance_type_id = COALESCE($2, maintenance_type_id),
           plan_name = COALESCE($3, plan_name),
           description = COALESCE($4, description),
           frequency = COALESCE($5, frequency),
           frequency_value = COALESCE($6, frequency_value),
           duration_hours = COALESCE($7, duration_hours),
           priority = COALESCE($8, priority),
           start_date = COALESCE($9, start_date),
           end_date = COALESCE($10, end_date),
           responsible_user_id = COALESCE($11, responsible_user_id),
           responsible_department_id = COALESCE($12, responsible_department_id),
           contractor_id = COALESCE($13, contractor_id),
           is_active = COALESCE($14, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $15
       RETURNING *`,
      [
        asset_id, maintenance_type_id, plan_name, description, frequency,
        frequency_value, duration_hours, priority, start_date, end_date,
        responsible_user_id, responsible_department_id, contractor_id,
        is_active, req.params.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance plan not found' });
    }
    
    res.json({ message: 'Maintenance plan updated successfully', maintenance_plan: result.rows[0] });
  } catch (error) {
    console.error('Update maintenance plan error:', error);
    res.status(500).json({ error: 'Failed to update maintenance plan' });
  }
};

const deleteMaintenancePlan = async (req, res) => {
  try {
    const result = await query(
      'UPDATE eams_maintenance_plans SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance plan not found' });
    }
    
    res.json({ message: 'Maintenance plan deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance plan error:', error);
    res.status(500).json({ error: 'Failed to delete maintenance plan' });
  }
};

const getAllMaintenanceRecords = async (req, res) => {
  try {
    const { asset_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT mr.*, 
             a.name as asset_name,
             a.asset_code,
             mt.name as maintenance_type_name,
             u.first_name || ' ' || u.last_name as performed_by_name,
             c.company_name as performed_by_contractor_name
      FROM eams_maintenance_records mr
      LEFT JOIN eams_assets a ON mr.asset_id = a.id
      LEFT JOIN eams_maintenance_types mt ON mr.maintenance_type_id = mt.id
      LEFT JOIN core_users u ON mr.performed_by = u.id
      LEFT JOIN cms_contractors c ON mr.performed_by_contractor_id = c.id
      WHERE a.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (asset_id) {
      queryText += ` AND mr.asset_id = $${paramIndex}`;
      params.push(asset_id);
      paramIndex++;
    }
    
    if (status) {
      queryText += ` AND mr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    queryText += ` ORDER BY mr.scheduled_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    res.json({
      maintenance_records: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get all maintenance records error:', error);
    res.status(500).json({ error: 'Failed to get maintenance records' });
  }
};

const getMaintenanceRecordById = async (req, res) => {
  try {
    const result = await query(
      `SELECT mr.*, 
              a.name as asset_name,
              a.asset_code,
              mt.name as maintenance_type_name,
              u.first_name || ' ' || u.last_name as performed_by_name,
              c.company_name as performed_by_contractor_name
       FROM eams_maintenance_records mr
       LEFT JOIN eams_assets a ON mr.asset_id = a.id
       LEFT JOIN eams_maintenance_types mt ON mr.maintenance_type_id = mt.id
       LEFT JOIN core_users u ON mr.performed_by = u.id
       LEFT JOIN cms_contractors c ON mr.performed_by_contractor_id = c.id
       WHERE mr.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get maintenance record by ID error:', error);
    res.status(500).json({ error: 'Failed to get maintenance record' });
  }
};

const createMaintenanceRecord = async (req, res) => {
  try {
    const {
      maintenance_plan_id,
      asset_id,
      maintenance_type_id,
      scheduled_date,
      priority,
      description,
      performed_by,
      performed_by_contractor_id
    } = req.body;
    
    const result = await query(
      `INSERT INTO eams_maintenance_records (
        maintenance_plan_id, asset_id, maintenance_type_id, scheduled_date,
        priority, description, performed_by, performed_by_contractor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        maintenance_plan_id, asset_id, maintenance_type_id, scheduled_date,
        priority, description, performed_by, performed_by_contractor_id
      ]
    );
    
    const maintenanceRecord = result.rows[0];
    
    // Automatically generate checklists for this maintenance record
    // Get maintenance type name
    const maintenanceTypeResult = await query(
      'SELECT name FROM eams_maintenance_types WHERE id = $1',
      [maintenance_type_id]
    );
    
    if (maintenanceTypeResult.rows.length > 0) {
      const maintenanceType = maintenanceTypeResult.rows[0].name;
      
      try {
        // Generate checklists based on asset and maintenance type
        const checklists = await checklistService.generateWorkOrderChecklists(
          maintenanceRecord.id,
          asset_id,
          maintenanceType
        );
        
        maintenanceRecord.generated_checklists = checklists.length;
      } catch (checklistError) {
        // Log error but don't fail the maintenance record creation
        console.error('Error generating checklists:', checklistError);
        maintenanceRecord.generated_checklists = 0;
      }
    }
    
    res.status(201).json({ message: 'Maintenance record created successfully', maintenance_record: maintenanceRecord });
  } catch (error) {
    console.error('Create maintenance record error:', error);
    res.status(500).json({ error: 'Failed to create maintenance record' });
  }
};

const updateMaintenanceRecord = async (req, res) => {
  try {
    const {
      start_time,
      end_time,
      performed_by,
      performed_by_contractor_id,
      status,
      description,
      work_performed,
      materials_used,
      cost,
      findings,
      recommendations,
      next_maintenance_date,
      attachments
    } = req.body;
    
    const result = await query(
      `UPDATE eams_maintenance_records 
       SET start_time = COALESCE($1, start_time),
           end_time = COALESCE($2, end_time),
           performed_by = COALESCE($3, performed_by),
           performed_by_contractor_id = COALESCE($4, performed_by_contractor_id),
           status = COALESCE($5, status),
           description = COALESCE($6, description),
           work_performed = COALESCE($7, work_performed),
           materials_used = COALESCE($8, materials_used::jsonb),
           cost = COALESCE($9, cost),
           findings = COALESCE($10, findings),
           recommendations = COALESCE($11, recommendations),
           next_maintenance_date = COALESCE($12, next_maintenance_date),
           attachments = COALESCE($13, attachments::jsonb),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        start_time, end_time, performed_by, performed_by_contractor_id,
        status, description, work_performed,
        materials_used ? JSON.stringify(materials_used) : null,
        cost, findings, recommendations, next_maintenance_date,
        attachments ? JSON.stringify(attachments) : null,
        req.params.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    
    res.json({ message: 'Maintenance record updated successfully', maintenance_record: result.rows[0] });
  } catch (error) {
    console.error('Update maintenance record error:', error);
    res.status(500).json({ error: 'Failed to update maintenance record' });
  }
};

const deleteMaintenanceRecord = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM eams_maintenance_records WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    
    res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance record error:', error);
    res.status(500).json({ error: 'Failed to delete maintenance record' });
  }
};

const getMaintenanceRecordsByAsset = async (req, res) => {
  try {
    const result = await query(
      `SELECT mr.*, mt.name as maintenance_type_name,
              u.first_name || ' ' || u.last_name as performed_by_name
       FROM eams_maintenance_records mr
       LEFT JOIN eams_maintenance_types mt ON mr.maintenance_type_id = mt.id
       LEFT JOIN core_users u ON mr.performed_by = u.id
       WHERE mr.asset_id = $1
       ORDER BY mr.scheduled_date DESC`,
      [req.params.assetId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get maintenance records by asset error:', error);
    res.status(500).json({ error: 'Failed to get maintenance records' });
  }
};

const getUpcomingMaintenance = async (req, res) => {
  try {
    const result = await query(
      `SELECT mr.*, 
              a.name as asset_name,
              a.asset_code,
              mt.name as maintenance_type_name,
              f.name as facility_name
       FROM eams_maintenance_records mr
       LEFT JOIN eams_assets a ON mr.asset_id = a.id
       LEFT JOIN eams_maintenance_types mt ON mr.maintenance_type_id = mt.id
       LEFT JOIN core_facilities f ON a.facility_id = f.id
       WHERE mr.status = 'pending' AND mr.scheduled_date >= CURRENT_DATE
       ORDER BY mr.scheduled_date ASC
       LIMIT 50`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get upcoming maintenance error:', error);
    res.status(500).json({ error: 'Failed to get upcoming maintenance' });
  }
};

const getOverdueMaintenance = async (req, res) => {
  try {
    const result = await query(
      `SELECT mr.*, 
              a.name as asset_name,
              a.asset_code,
              mt.name as maintenance_type_name,
              f.name as facility_name
       FROM eams_maintenance_records mr
       LEFT JOIN eams_assets a ON mr.asset_id = a.id
       LEFT JOIN eams_maintenance_types mt ON mr.maintenance_type_id = mt.id
       LEFT JOIN core_facilities f ON a.facility_id = f.id
       WHERE mr.status = 'pending' AND mr.scheduled_date < CURRENT_DATE
       ORDER BY mr.scheduled_date ASC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get overdue maintenance error:', error);
    res.status(500).json({ error: 'Failed to get overdue maintenance' });
  }
};

const completeMaintenance = async (req, res) => {
  try {
    const { work_performed, materials_used, cost, findings, recommendations, next_maintenance_date } = req.body;
    
    const result = await query(
      `UPDATE eams_maintenance_records 
       SET status = 'completed',
           end_time = CURRENT_TIMESTAMP,
           work_performed = COALESCE($1, work_performed),
           materials_used = COALESCE($2, materials_used::jsonb),
           cost = COALESCE($3, cost),
           findings = COALESCE($4, findings),
           recommendations = COALESCE($5, recommendations),
           next_maintenance_date = COALESCE($6, next_maintenance_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        work_performed,
        materials_used ? JSON.stringify(materials_used) : null,
        cost, findings, recommendations, next_maintenance_date,
        req.params.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    
    res.json({ message: 'Maintenance completed successfully', maintenance_record: result.rows[0] });
  } catch (error) {
    console.error('Complete maintenance error:', error);
    res.status(500).json({ error: 'Failed to complete maintenance' });
  }
};

const getMaintenanceStatistics = async (req, res) => {
  try {
    // Get total maintenance records
    const totalResult = await query('SELECT COUNT(*) as count FROM eams_maintenance_records');
    
    // Get pending maintenance
    const pendingResult = await query("SELECT COUNT(*) as count FROM eams_maintenance_records WHERE status = 'pending'");
    
    // Get completed maintenance
    const completedResult = await query("SELECT COUNT(*) as count FROM eams_maintenance_records WHERE status = 'completed'");
    
    // Get overdue maintenance
    const overdueResult = await query("SELECT COUNT(*) as count FROM eams_maintenance_records WHERE status = 'pending' AND scheduled_date < CURRENT_DATE");
    
    res.json({
      total: parseInt(totalResult.rows[0].count),
      pending: parseInt(pendingResult.rows[0].count),
      completed: parseInt(completedResult.rows[0].count),
      overdue: parseInt(overdueResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get maintenance statistics error:', error);
    res.status(500).json({ error: 'Failed to get maintenance statistics' });
  }
};

module.exports = {
  getAllMaintenancePlans,
  getMaintenancePlanById,
  createMaintenancePlan,
  updateMaintenancePlan,
  deleteMaintenancePlan,
  getAllMaintenanceRecords,
  getMaintenanceRecordById,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceRecordsByAsset,
  getUpcomingMaintenance,
  getOverdueMaintenance,
  completeMaintenance,
  getMaintenanceStatistics
};
