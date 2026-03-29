const { query } = require('../config/database');

const getAllRoles = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM core_roles ORDER BY name ASC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({ error: 'Failed to get roles' });
  }
};

const getRoleById = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM core_roles WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({ error: 'Failed to get role' });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, description, scope, permissions } = req.body;
    
    const result = await query(
      'INSERT INTO core_roles (name, description, scope, permissions) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, scope || 'FACILITY', JSON.stringify(permissions || [])]
    );
    
    res.status(201).json({ message: 'Role created successfully', role: result.rows[0] });
  } catch (error) {
    console.error('Create role error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Role already exists' });
    }
    res.status(500).json({ error: 'Failed to create role' });
  }
};

const updateRole = async (req, res) => {
  try {
    const { name, description, scope, permissions } = req.body;
    
    const result = await query(
      `UPDATE core_roles 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           scope = COALESCE($3, scope),
           permissions = COALESCE($4::jsonb, permissions),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, description, scope, permissions ? JSON.stringify(permissions) : null, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json({ message: 'Role updated successfully', role: result.rows[0] });
  } catch (error) {
    console.error('Update role error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Role already exists' });
    }
    res.status(500).json({ error: 'Failed to update role' });
  }
};

const deleteRole = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM core_roles WHERE id = $1 AND is_system = false RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found or cannot be deleted' });
    }
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};
