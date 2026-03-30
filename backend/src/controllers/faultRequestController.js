const { query } = require('../config/database');

const getAllFaultRequests = async (req, res) => {
  try {
    const { facility_id, status, severity, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT fr.*,
             a.name as asset_name,
             a.asset_code,
             ar.area_name as area_name,
             f.name as facility_name,
             u.first_name || ' ' || u.last_name as requested_by_name,
             assigned.first_name || ' ' || assigned.last_name as assigned_to_name,
             c.company_name as assigned_contractor_name
      FROM eams_fault_requests fr
      LEFT JOIN eams_assets a ON fr.asset_id = a.id
      LEFT JOIN core_areas ar ON fr.area_id = ar.id
      LEFT JOIN core_facilities f ON fr.facility_id = f.id
      LEFT JOIN core_users u ON fr.requested_by = u.id
      LEFT JOIN core_users assigned ON fr.assigned_to = assigned.id
      LEFT JOIN cms_contractors c ON fr.assigned_contractor_id = c.id
      WHERE f.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // RBAC Scoping Logic
    const userRoles = req.user.roles || [];
    const isAdmin = userRoles.includes('Admin') || userRoles.includes('Sistem Yöneticisi') || userRoles.includes('Central Manager');
    const isManager = userRoles.includes('Manager') || userRoles.includes('Facility Manager') || userRoles.includes('Tesis Yöneticisi');
    const isTech = userRoles.includes('Technician') || userRoles.includes('Teknisyen');

    if (!isAdmin) {
      if (isManager) {
         queryText += ` AND fr.facility_id = $${paramIndex}`;
         params.push(req.user.facilities?.[0]);
         paramIndex++;
      } else if (isTech) {
         // Techs see facility tasks assigned to them, or pending ones they could take
         queryText += ` AND fr.facility_id = $${paramIndex}`;
         params.push(req.user.facilities?.[0]);
         paramIndex++;
      } else {
         // Standard user sees only what they requested
         queryText += ` AND fr.requested_by = $${paramIndex}`;
         params.push(req.user.id);
         paramIndex++;
      }
    } else if (facility_id) {
      queryText += ` AND fr.facility_id = $${paramIndex}`;
      params.push(facility_id);
      paramIndex++;
    }
    
    if (status) {
      queryText += ` AND fr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (severity) {
      queryText += ` AND fr.severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }
    
    queryText += ` ORDER BY fr.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    res.json({
      fault_requests: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get all fault requests error:', error);
    res.status(500).json({ error: 'Failed to get fault requests' });
  }
};

const getFaultRequestById = async (req, res) => {
  try {
    const result = await query(
      `SELECT fr.*, 
              a.name as asset_name,
              a.asset_code,
              ar.area_name as area_name,
              f.name as facility_name,
              u.first_name || ' ' || u.last_name as requested_by_name,
              assigned.first_name || ' ' || assigned.last_name as assigned_to_name,
              c.company_name as assigned_contractor_name
       FROM eams_fault_requests fr
       LEFT JOIN eams_assets a ON fr.asset_id = a.id
       LEFT JOIN core_areas ar ON fr.area_id = ar.id
       LEFT JOIN core_facilities f ON fr.facility_id = f.id
       LEFT JOIN core_users u ON fr.requested_by = u.id
       LEFT JOIN core_users assigned ON fr.assigned_to = assigned.id
       LEFT JOIN cms_contractors c ON fr.assigned_contractor_id = c.id
       WHERE fr.id = $1 AND f.is_active = true`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fault request not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get fault request by ID error:', error);
    res.status(500).json({ error: 'Failed to get fault request' });
  }
};

const createFaultRequest = async (req, res) => {
  try {
    const {
      asset_id,
      area_id,
      facility_id,
      title,
      description,
      fault_type,
      severity,
      priority
    } = req.body;
    
    // Generate request number
    const request_number = `FR-${Date.now()}`;
    
    const result = await query(
      `INSERT INTO eams_fault_requests (
        request_number, asset_id, area_id, facility_id, title, description,
        fault_type, severity, priority, requested_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING *`,
      [
        request_number, asset_id, area_id, facility_id, title, description,
        fault_type, severity, priority, req.user.id
      ]
    );
    
    res.status(201).json({ message: 'Fault request created successfully', fault_request: result.rows[0] });
  } catch (error) {
    console.error('Create fault request error:', error);
    res.status(500).json({ error: 'Failed to create fault request' });
  }
};

const updateFaultRequest = async (req, res) => {
  try {
    const {
      asset_id,
      area_id,
      facility_id,
      title,
      description,
      fault_type,
      severity,
      priority,
      estimated_cost,
      actual_cost,
      resolution_notes,
      resolution_date,
      attachments
    } = req.body;
    
    const result = await query(
      `UPDATE eams_fault_requests 
       SET asset_id = COALESCE($1, asset_id),
           area_id = COALESCE($2, area_id),
           facility_id = COALESCE($3, facility_id),
           title = COALESCE($4, title),
           description = COALESCE($5, description),
           fault_type = COALESCE($6, fault_type),
           severity = COALESCE($7, severity),
           priority = COALESCE($8, priority),
           estimated_cost = COALESCE($9, estimated_cost),
           actual_cost = COALESCE($10, actual_cost),
           resolution_notes = COALESCE($11, resolution_notes),
           resolution_date = COALESCE($12, resolution_date),
           attachments = COALESCE($13, attachments::jsonb),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        asset_id, area_id, facility_id, title, description, fault_type,
        severity, priority, estimated_cost, actual_cost, resolution_notes,
        resolution_date, attachments ? JSON.stringify(attachments) : null,
        req.params.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fault request not found' });
    }
    
    res.json({ message: 'Fault request updated successfully', fault_request: result.rows[0] });
  } catch (error) {
    console.error('Update fault request error:', error);
    res.status(500).json({ error: 'Failed to update fault request' });
  }
};

const deleteFaultRequest = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM eams_fault_requests WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fault request not found' });
    }
    
    res.json({ message: 'Fault request deleted successfully' });
  } catch (error) {
    console.error('Delete fault request error:', error);
    res.status(500).json({ error: 'Failed to delete fault request' });
  }
};

const assignFaultRequest = async (req, res) => {
  try {
    const { assigned_to, assigned_contractor_id } = req.body;
    
    const result = await query(
      `UPDATE eams_fault_requests 
       SET assigned_to = COALESCE($1, assigned_to),
           assigned_contractor_id = COALESCE($2, assigned_contractor_id),
           status = 'assigned',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [assigned_to, assigned_contractor_id, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fault request not found' });
    }
    
    res.json({ message: 'Fault request assigned successfully', fault_request: result.rows[0] });
  } catch (error) {
    console.error('Assign fault request error:', error);
    res.status(500).json({ error: 'Failed to assign fault request' });
  }
};

const completeFaultRequest = async (req, res) => {
  try {
    const { resolution_notes, actual_cost } = req.body;
    
    const result = await query(
      `UPDATE eams_fault_requests 
       SET status = 'completed',
           resolution_notes = COALESCE($1, resolution_notes),
           actual_cost = COALESCE($2, actual_cost),
           resolution_date = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [resolution_notes, actual_cost, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fault request not found' });
    }
    
    res.json({ message: 'Fault request completed successfully', fault_request: result.rows[0] });
  } catch (error) {
    console.error('Complete fault request error:', error);
    res.status(500).json({ error: 'Failed to complete fault request' });
  }
};

const cancelFaultRequest = async (req, res) => {
  try {
    const result = await query(
      `UPDATE eams_fault_requests 
       SET status = 'cancelled',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fault request not found' });
    }
    
    res.json({ message: 'Fault request cancelled successfully', fault_request: result.rows[0] });
  } catch (error) {
    console.error('Cancel fault request error:', error);
    res.status(500).json({ error: 'Failed to cancel fault request' });
  }
};

const getFaultRequestsByFacility = async (req, res) => {
  try {
    const result = await query(
      `SELECT fr.*, 
              a.name as asset_name,
              u.first_name || ' ' || u.last_name as requested_by_name
       FROM eams_fault_requests fr
        JOIN core_facilities f ON fr.facility_id = f.id
        LEFT JOIN eams_assets a ON fr.asset_id = a.id
        LEFT JOIN core_users u ON fr.requested_by = u.id
        WHERE fr.facility_id = $1 AND f.is_active = true
        ORDER BY fr.created_at DESC`,
      [req.params.facilityId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get fault requests by facility error:', error);
    res.status(500).json({ error: 'Failed to get fault requests' });
  }
};

const getFaultRequestsByAsset = async (req, res) => {
  try {
    const result = await query(
      `SELECT fr.*, 
              u.first_name || ' ' || u.last_name as requested_by_name
       FROM eams_fault_requests fr
        JOIN eams_assets a ON fr.asset_id = a.id
        JOIN core_facilities f ON a.facility_id = f.id
        LEFT JOIN core_users u ON fr.requested_by = u.id
        WHERE fr.asset_id = $1 AND f.is_active = true
        ORDER BY fr.created_at DESC`,
      [req.params.assetId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get fault requests by asset error:', error);
    res.status(500).json({ error: 'Failed to get fault requests' });
  }
};

const getFaultRequestsByUser = async (req, res) => {
  try {
    const result = await query(
      `SELECT fr.*, 
              a.name as asset_name,
              f.name as facility_name
       FROM eams_fault_requests fr
        JOIN core_facilities f ON fr.facility_id = f.id
        LEFT JOIN eams_assets a ON fr.asset_id = a.id
        WHERE fr.requested_by = $1 AND f.is_active = true
        ORDER BY fr.created_at DESC`,
      [req.params.userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get fault requests by user error:', error);
    res.status(500).json({ error: 'Failed to get fault requests' });
  }
};

const getFaultRequestsByStatus = async (req, res) => {
  try {
    const result = await query(
      `SELECT fr.*, 
              a.name as asset_name,
              f.name as facility_name,
              u.first_name || ' ' || u.last_name as requested_by_name
       FROM eams_fault_requests fr
        JOIN core_facilities f ON fr.facility_id = f.id
        LEFT JOIN eams_assets a ON fr.asset_id = a.id
        LEFT JOIN core_users u ON fr.requested_by = u.id
        WHERE fr.status = $1 AND f.is_active = true
        ORDER BY fr.created_at DESC`,
      [req.params.status]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get fault requests by status error:', error);
    res.status(500).json({ error: 'Failed to get fault requests' });
  }
};

const addComment = async (req, res) => {
  try {
    const { comment, attachments } = req.body;
    
    const result = await query(
      `INSERT INTO eams_fault_request_comments (fault_request_id, user_id, comment, attachments)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, req.user.id, comment, attachments ? JSON.stringify(attachments) : null]
    );
    
    res.status(201).json({ message: 'Comment added successfully', comment: result.rows[0] });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

const getComments = async (req, res) => {
  try {
    const result = await query(
      `SELECT frc.*, u.first_name || ' ' || u.last_name as user_name
       FROM eams_fault_request_comments frc
       LEFT JOIN core_users u ON frc.user_id = u.id
       WHERE frc.fault_request_id = $1
       ORDER BY frc.created_at ASC`,
      [req.params.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
};

const getFaultRequestStatistics = async (req, res) => {
  try {
    // Scoping
    const userRoles = req.user.roles || [];
    const isAdmin = userRoles.includes('Admin') || userRoles.includes('Sistem Yöneticisi') || userRoles.includes('Central Manager');
    const facilityCondition = isAdmin ? '' : `AND facility_id = '${req.user.facilities?.[0] || '00000000-0000-0000-0000-000000000000'}'`;
    const userCondition = (isAdmin || userRoles.includes('Manager') || userRoles.includes('Tesis Yöneticisi') || userRoles.includes('Technician') || userRoles.includes('Teknisyen')) ? '' : `AND requested_by = '${req.user.id}'`;

    const baseWhere = `
      INNER JOIN core_facilities f ON eams_fault_requests.facility_id = f.id 
      WHERE f.is_active = true ${facilityCondition} ${userCondition}`;

    // Get total fault requests
    const totalResult = await query(`SELECT COUNT(*) as count FROM eams_fault_requests ${baseWhere}`);
    
    // Get pending fault requests
    const pendingResult = await query(`SELECT COUNT(*) as count FROM eams_fault_requests ${baseWhere} AND status = 'pending'`);
    
    // Get assigned fault requests
    const assignedResult = await query(`SELECT COUNT(*) as count FROM eams_fault_requests ${baseWhere} AND status = 'assigned'`);
    
    // Get in progress fault requests
    const inProgressResult = await query(`SELECT COUNT(*) as count FROM eams_fault_requests ${baseWhere} AND status = 'in_progress'`);
    
    // Get completed fault requests
    const completedResult = await query(`SELECT COUNT(*) as count FROM eams_fault_requests ${baseWhere} AND status = 'completed'`);
    
    // Get critical severity fault requests
    const criticalResult = await query(`SELECT COUNT(*) as count FROM eams_fault_requests ${baseWhere} AND severity = 'critical' AND status NOT IN ('completed', 'cancelled')`);
    
    res.json({
      total: parseInt(totalResult.rows[0].count),
      pending: parseInt(pendingResult.rows[0].count),
      assigned: parseInt(assignedResult.rows[0].count),
      in_progress: parseInt(inProgressResult.rows[0].count),
      completed: parseInt(completedResult.rows[0].count),
      critical: parseInt(criticalResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get fault request statistics error:', error);
    res.status(500).json({ error: 'Failed to get fault request statistics' });
  }
};

module.exports = {
  getAllFaultRequests,
  getFaultRequestById,
  createFaultRequest,
  updateFaultRequest,
  deleteFaultRequest,
  assignFaultRequest,
  completeFaultRequest,
  cancelFaultRequest,
  getFaultRequestsByFacility,
  getFaultRequestsByAsset,
  getFaultRequestsByUser,
  getFaultRequestsByStatus,
  addComment,
  getComments,
  getFaultRequestStatistics
};
