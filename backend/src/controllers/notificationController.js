const { query } = require('../config/database');

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT * FROM core_notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    
    // Get unread count
    const unreadResult = await query(
      'SELECT COUNT(*) as count FROM core_notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    
    res.json({
      notifications: result.rows,
      unread_count: parseInt(unreadResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};

const getUnreadNotifications = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM core_notifications 
       WHERE user_id = $1 AND is_read = false
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({ error: 'Failed to get unread notifications' });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM core_notifications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({ error: 'Failed to get notification' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const result = await query(
      `UPDATE core_notifications 
       SET is_read = true, 
           read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification: result.rows[0] });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await query(
      `UPDATE core_notifications 
       SET is_read = true, 
           read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM core_notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

const getNotificationSettings = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM core_notification_settings WHERE user_id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      // Create default settings if not exist
      const defaultSettings = await query(
        `INSERT INTO core_notification_settings (user_id) 
         VALUES ($1) 
         RETURNING *`,
        [req.user.id]
      );
      return res.json(defaultSettings.rows[0]);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Failed to get notification settings' });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const {
      email_notifications,
      sms_notifications,
      push_notifications,
      maintenance_reminders,
      fault_request_notifications,
      system_notifications,
      contractor_notifications
    } = req.body;
    
    const result = await query(
      `UPDATE core_notification_settings 
       SET email_notifications = COALESCE($1, email_notifications),
           sms_notifications = COALESCE($2, sms_notifications),
           push_notifications = COALESCE($3, push_notifications),
           maintenance_reminders = COALESCE($4, maintenance_reminders),
           fault_request_notifications = COALESCE($5, fault_request_notifications),
           system_notifications = COALESCE($6, system_notifications),
           contractor_notifications = COALESCE($7, contractor_notifications),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $8
       RETURNING *`,
      [
        email_notifications, sms_notifications, push_notifications,
        maintenance_reminders, fault_request_notifications,
        system_notifications, contractor_notifications,
        req.user.id
      ]
    );
    
    if (result.rows.length === 0) {
      // Create settings if not exist
      const newSettings = await query(
        `INSERT INTO core_notification_settings (
          user_id, email_notifications, sms_notifications, push_notifications,
          maintenance_reminders, fault_request_notifications,
          system_notifications, contractor_notifications
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          req.user.id,
          email_notifications, sms_notifications, push_notifications,
          maintenance_reminders, fault_request_notifications,
          system_notifications, contractor_notifications
        ]
      );
      return res.json({ message: 'Notification settings created', settings: newSettings.rows[0] });
    }
    
    res.json({ message: 'Notification settings updated', settings: result.rows[0] });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
};

module.exports = {
  getNotifications,
  getUnreadNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings
};
