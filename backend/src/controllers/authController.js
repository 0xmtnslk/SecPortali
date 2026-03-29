const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const generateToken = (user) => {
  return jwt.sign(
    {
        id: user.id,
        email: user.email,
        roles: user.role_names || [],
        facilities: user.facilities,
        permissions: user.permissions || [],
        scopes: user.scopes || []
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
    { expiresIn: '24h' }
  );
};

const register = async (req, res) => {
  try {
    const { oracle_id, first_name, last_name, email, phone, unit, position, employee_id, password } = req.body;
    
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM core_users WHERE email = $1 OR oracle_id = $2',
      [email, oracle_id]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Insert user
    const result = await query(
      `INSERT INTO core_users (oracle_id, first_name, last_name, email, phone, unit, position, employee_id, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, oracle_id, first_name, last_name, email, phone, unit, position, employee_id, is_active`,
      [oracle_id, first_name, last_name, email, phone, unit, position, employee_id, password_hash]
    );
    
    const user = result.rows[0];
    
    // Assign default 'User' role
    const roleResult = await query('SELECT id FROM core_roles WHERE name = $1', ['User']);
    if (roleResult.rows.length > 0) {
      await query(
        'INSERT INTO core_user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $1)',
        [user.id, roleResult.rows[0].id]
      );
    }
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      user: {
        id: user.id,
        oracle_id: user.oracle_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with roles, permissions and scopes
    const result = await query(
      `SELECT u.*, 
              ARRAY_AGG(DISTINCT r.name) as role_names,
              ARRAY_AGG(DISTINCT ur.facility_id) as facilities,
              (SELECT jsonb_agg(DISTINCT p) FROM core_roles r2 JOIN core_user_roles ur2 ON r2.id = ur2.role_id, jsonb_array_elements(r2.permissions) p WHERE ur2.user_id = u.id) as permissions,
              ARRAY_AGG(DISTINCT r.scope) as scopes
       FROM core_users u
       LEFT JOIN core_user_roles ur ON u.id = ur.user_id
       LEFT JOIN core_roles r ON ur.role_id = r.id
       WHERE u.email = $1 AND u.is_active = true
       GROUP BY u.id`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    if (user.password_hash) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user.id,
        oracle_id: user.oracle_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        unit: user.unit,
        position: user.position,
        employee_id: user.employee_id,
        profile_photo: user.profile_photo,
        roles: user.role_names,
        facilities: user.facilities,
        permissions: user.permissions || [],
        scopes: user.scopes || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.*, 
              ARRAY_AGG(DISTINCT r.name) as role_names,
              ARRAY_AGG(DISTINCT ur.facility_id) as facilities,
              (SELECT jsonb_agg(DISTINCT p) FROM core_roles r2 JOIN core_user_roles ur2 ON r2.id = ur2.role_id, jsonb_array_elements(r2.permissions) p WHERE ur2.user_id = u.id) as permissions,
              ARRAY_AGG(DISTINCT r.scope) as scopes
       FROM core_users u
       LEFT JOIN core_user_roles ur ON u.id = ur.user_id
       LEFT JOIN core_roles r ON ur.role_id = r.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      id: user.id,
      oracle_id: user.oracle_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      unit: user.unit,
      position: user.position,
      employee_id: user.employee_id,
      profile_photo: user.profile_photo,
      roles: user.role_names,
      facilities: user.facilities,
      permissions: user.permissions || [],
      scopes: user.scopes || []
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const { first_name, last_name, phone, profile_photo } = req.body;
    
    const result = await query(
      `UPDATE core_users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           profile_photo = COALESCE($4, profile_photo),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, oracle_id, first_name, last_name, email, phone, unit, position, employee_id, profile_photo`,
      [first_name, last_name, phone, profile_photo, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    // Get current user
    const userResult = await query('SELECT password_hash FROM core_users WHERE id = $1', [req.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const new_password_hash = await bcrypt.hash(new_password, 10);
    
    // Update password
    await query(
      'UPDATE core_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [new_password_hash, req.user.id]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const result = await query('SELECT id, email FROM core_users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If the email exists, a reset link will be sent' });
    }
    
    // In production, send email with reset token
    // For now, just return success
    res.json({ message: 'If the email exists, a reset link will be sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    
    // Verify token and update password
    // In production, implement proper token verification
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword
};
