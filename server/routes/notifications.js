const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener notificaciones de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await pool.query(`
      SELECT 
        n.*,
        u.username as from_username,
        u.avatar as from_avatar,
        p.content as post_content,
        p.id as post_id
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      LEFT JOIN posts p ON n.post_id = p.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    res.json({ success: true, notifications: result.rows });
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crear notificación
router.post('/', async (req, res) => {
  try {
    const { user_id, from_user_id, type, message, post_id, is_read = false } = req.body;
    
    const result = await pool.query(`
      INSERT INTO notifications (user_id, from_user_id, type, message, post_id, is_read)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [user_id, from_user_id, type, message, post_id, is_read]);
    
    res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Error creando notificación:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Marcar notificación como leída
router.put('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const result = await pool.query(`
      UPDATE notifications 
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [notificationId]);
    
    res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Marcar todas las notificaciones como leídas
router.put('/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await pool.query(`
      UPDATE notifications 
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
    `, [userId]);
    
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error marcando notificaciones como leídas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener contador de notificaciones no leídas
router.get('/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT COUNT(*) as unread_count
      FROM notifications 
      WHERE user_id = $1 AND is_read = false
    `, [userId]);
    
    res.json({ success: true, unread_count: parseInt(result.rows[0].unread_count) });
  } catch (error) {
    console.error('Error obteniendo contador de notificaciones:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
