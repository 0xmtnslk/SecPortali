const { query } = require('../config/database');

const getAllContractors = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM cms_contractor_facilities WHERE contractor_id = c.id) as facility_count,
             (SELECT COUNT(*) FROM cms_contractor_employees WHERE contractor_id = c.id AND is_active = true) as employee_count
      FROM cms_contractors c
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      queryText += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      queryText += ` AND (c.company_name ILIKE $${paramIndex} OR c.contact_person ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    queryText += ` ORDER BY c.company_name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM cms_contractors c WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;
    
    if (status) {
      countQuery += ` AND c.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    
    if (search) {
      countQuery += ` AND (c.company_name ILIKE $${countParamIndex} OR c.contact_person ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    
    const countResult = await query(countQuery, countParams);
    
    res.json({
      contractors: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
    });
  } catch (error) {
    console.error('Get all contractors error:', error);
    res.status(500).json({ error: 'Failed to get contractors' });
  }
};

const getContractorById = async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM cms_contractor_facilities WHERE contractor_id = c.id) as facility_count,
              (SELECT COUNT(*) FROM cms_contractor_employees WHERE contractor_id = c.id AND is_active = true) as employee_count
       FROM cms_contractors c
       WHERE c.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get contractor by ID error:', error);
    res.status(500).json({ error: 'Failed to get contractor' });
  }
};

const createContractor = async (req, res) => {
  try {
    const {
      company_name,
      company_code,
      contact_person,
      email,
      phone,
      address,
      city,
      district,
      tax_number,
      tax_office,
      trade_registration_number,
      company_type,
      specialization,
      employee_count,
      contract_start_date,
      contract_end_date,
      contract_value
    } = req.body;
    
    const result = await query(
      `INSERT INTO cms_contractors (
        company_name, company_code, contact_person, email, phone, address,
        city, district, tax_number, tax_office, trade_registration_number,
        company_type, specialization, employee_count, contract_start_date,
        contract_end_date, contract_value
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        company_name, company_code, contact_person, email, phone, address,
        city, district, tax_number, tax_office, trade_registration_number,
        company_type, specialization, employee_count, contract_start_date,
        contract_end_date, contract_value
      ]
    );
    
    res.status(201).json({ message: 'Contractor created successfully', contractor: result.rows[0] });
  } catch (error) {
    console.error('Create contractor error:', error);
    res.status(500).json({ error: 'Failed to create contractor' });
  }
};

const updateContractor = async (req, res) => {
  try {
    const {
      company_name,
      company_code,
      contact_person,
      email,
      phone,
      address,
      city,
      district,
      tax_number,
      tax_office,
      trade_registration_number,
      company_type,
      specialization,
      employee_count,
      contract_start_date,
      contract_end_date,
      contract_value,
      status
    } = req.body;
    
    const result = await query(
      `UPDATE cms_contractors 
       SET company_name = COALESCE($1, company_name),
           company_code = COALESCE($2, company_code),
           contact_person = COALESCE($3, contact_person),
           email = COALESCE($4, email),
           phone = COALESCE($5, phone),
           address = COALESCE($6, address),
           city = COALESCE($7, city),
           district = COALESCE($8, district),
           tax_number = COALESCE($9, tax_number),
           tax_office = COALESCE($10, tax_office),
           trade_registration_number = COALESCE($11, trade_registration_number),
           company_type = COALESCE($12, company_type),
           specialization = COALESCE($13, specialization),
           employee_count = COALESCE($14, employee_count),
           contract_start_date = COALESCE($15, contract_start_date),
           contract_end_date = COALESCE($16, contract_end_date),
           contract_value = COALESCE($17, contract_value),
           status = COALESCE($18, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $19
       RETURNING *`,
      [
        company_name, company_code, contact_person, email, phone, address,
        city, district, tax_number, tax_office, trade_registration_number,
        company_type, specialization, employee_count, contract_start_date,
        contract_end_date, contract_value, status, req.params.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    res.json({ message: 'Contractor updated successfully', contractor: result.rows[0] });
  } catch (error) {
    console.error('Update contractor error:', error);
    res.status(500).json({ error: 'Failed to update contractor' });
  }
};

const deleteContractor = async (req, res) => {
  try {
    const result = await query(
      'UPDATE cms_contractors SET is_active = false, status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      ['terminated', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    res.json({ message: 'Contractor deleted successfully' });
  } catch (error) {
    console.error('Delete contractor error:', error);
    res.status(500).json({ error: 'Failed to delete contractor' });
  }
};

const getContractorFacilities = async (req, res) => {
  try {
    const result = await query(
      `SELECT cf.*, f.name as facility_name, f.short_name as facility_short_name
       FROM cms_contractor_facilities cf
       LEFT JOIN core_facilities f ON cf.facility_id = f.id
       WHERE cf.contractor_id = $1
       ORDER BY f.name ASC`,
      [req.params.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get contractor facilities error:', error);
    res.status(500).json({ error: 'Failed to get contractor facilities' });
  }
};

const assignToFacility = async (req, res) => {
  try {
    const { services } = req.body;
    
    const result = await query(
      `INSERT INTO cms_contractor_facilities (contractor_id, facility_id, services)
       VALUES ($1, $2, $3)
       ON CONFLICT (contractor_id, facility_id) DO UPDATE
       SET services = $3
       RETURNING *`,
      [req.params.id, req.params.facilityId, services ? JSON.stringify(services) : null]
    );
    
    res.status(201).json({ message: 'Contractor assigned to facility', assignment: result.rows[0] });
  } catch (error) {
    console.error('Assign to facility error:', error);
    res.status(500).json({ error: 'Failed to assign contractor to facility' });
  }
};

const removeFromFacility = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM cms_contractor_facilities WHERE contractor_id = $1 AND facility_id = $2 RETURNING id',
      [req.params.id, req.params.facilityId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json({ message: 'Contractor removed from facility' });
  } catch (error) {
    console.error('Remove from facility error:', error);
    res.status(500).json({ error: 'Failed to remove contractor from facility' });
  }
};

const getContractorEmployees = async (req, res) => {
  try {
    const result = await query(
      `SELECT ce.*, f.name as facility_name
       FROM cms_contractor_employees ce
       LEFT JOIN core_facilities f ON ce.facility_id = f.id
       WHERE ce.contractor_id = $1 AND ce.is_active = true
       ORDER BY ce.first_name ASC, ce.last_name ASC`,
      [req.params.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get contractor employees error:', error);
    res.status(500).json({ error: 'Failed to get contractor employees' });
  }
};

const addEmployee = async (req, res) => {
  try {
    const {
      facility_id,
      first_name,
      last_name,
      email,
      phone,
      position,
      employee_id,
      specialization,
      certifications
    } = req.body;
    
    const result = await query(
      `INSERT INTO cms_contractor_employees (
        contractor_id, facility_id, first_name, last_name, email, phone,
        position, employee_id, specialization, certifications
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        req.params.id, facility_id, first_name, last_name, email, phone,
        position, employee_id, specialization,
        certifications ? JSON.stringify(certifications) : null
      ]
    );
    
    res.status(201).json({ message: 'Employee added successfully', employee: result.rows[0] });
  } catch (error) {
    console.error('Add employee error:', error);
    res.status(500).json({ error: 'Failed to add employee' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const {
      facility_id,
      first_name,
      last_name,
      email,
      phone,
      position,
      employee_id,
      specialization,
      certifications,
      is_active
    } = req.body;
    
    const result = await query(
      `UPDATE cms_contractor_employees 
       SET facility_id = COALESCE($1, facility_id),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           email = COALESCE($4, email),
           phone = COALESCE($5, phone),
           position = COALESCE($6, position),
           employee_id = COALESCE($7, employee_id),
           specialization = COALESCE($8, specialization),
           certifications = COALESCE($9, certifications::jsonb),
           is_active = COALESCE($10, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        facility_id, first_name, last_name, email, phone, position,
        employee_id, specialization,
        certifications ? JSON.stringify(certifications) : null,
        is_active, req.params.employeeId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee updated successfully', employee: result.rows[0] });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const result = await query(
      'UPDATE cms_contractor_employees SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [req.params.employeeId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};

const getContractorStatistics = async (req, res) => {
  try {
    const contractorId = req.params.id;
    
    // Get total facilities
    const facilityResult = await query(
      'SELECT COUNT(*) as count FROM cms_contractor_facilities WHERE contractor_id = $1',
      [contractorId]
    );
    
    // Get total employees
    const employeeResult = await query(
      'SELECT COUNT(*) as count FROM cms_contractor_employees WHERE contractor_id = $1 AND is_active = true',
      [contractorId]
    );
    
    // Get assigned maintenance plans
    const maintenanceResult = await query(
      'SELECT COUNT(*) as count FROM eams_maintenance_plans WHERE contractor_id = $1 AND is_active = true',
      [contractorId]
    );
    
    // Get assigned fault requests
    const faultResult = await query(
      "SELECT COUNT(*) as count FROM eams_fault_requests WHERE assigned_contractor_id = $1 AND status NOT IN ('completed', 'cancelled')",
      [contractorId]
    );
    
    // Get completed fault requests
    const completedFaultResult = await query(
      "SELECT COUNT(*) as count FROM eams_fault_requests WHERE assigned_contractor_id = $1 AND status = 'completed'",
      [contractorId]
    );
    
    res.json({
      facilities: parseInt(facilityResult.rows[0].count),
      employees: parseInt(employeeResult.rows[0].count),
      maintenance_plans: parseInt(maintenanceResult.rows[0].count),
      active_fault_requests: parseInt(faultResult.rows[0].count),
      completed_fault_requests: parseInt(completedFaultResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get contractor statistics error:', error);
    res.status(500).json({ error: 'Failed to get contractor statistics' });
  }
};

module.exports = {
  getAllContractors,
  getContractorById,
  createContractor,
  updateContractor,
  deleteContractor,
  getContractorFacilities,
  assignToFacility,
  removeFromFacility,
  getContractorEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getContractorStatistics
};
