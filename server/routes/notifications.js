const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Obtener notificaciones de un usuario (requiere autenticación)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // Intentar obtener notificaciones, si la tabla no existe retornar array vacío
    try {
      const result = await pool.query(`
        SELECT 
          n.*,
          COALESCE(u.username, 'Usuario desconocido') as from_username,
          u.avatar as from_avatar,
          p.content as post_content,
          COALESCE(n.post_id, p.id) as post_id
        FROM notifications n
        LEFT JOIN users u ON n.from_user_id = u.id
        LEFT JOIN posts p ON n.post_id = p.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);
      
      res.json({ success: true, notifications: result.rows || [] });
    } catch (notifErr) {
      // Si la tabla notifications no existe, retornar array vacío en lugar de error
      console.log('Tabla notifications no disponible:', notifErr.message);
      res.json({ success: true, notifications: [] });
    }
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ success: false, error: error.message, notifications: [] });
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

// Crear notificación simple (para compatibilidad)
router.post('/create', async (req, res) => {
  try {
    const { user_id, type, message, is_read = false } = req.body;
    
    const result = await pool.query(`
      INSERT INTO notifications (user_id, type, message, is_read)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [user_id, type, message, is_read]);
    
    res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Error creando notificación simple:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Marcar notificación como leída (requiere autenticación)
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    let result;
    try {
      // Intentar actualizar con read_at (si existe la columna)
      result = await pool.query(`
        UPDATE notifications 
        SET is_read = true, read_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [notificationId]);
    } catch (colErr) {
      // Fallback sin read_at si la columna no existe
      console.log('Columna read_at no existe, usando query simple');
      result = await pool.query(`
        UPDATE notifications 
        SET is_read = true
        WHERE id = $1
        RETURNING *
      `, [notificationId]);
    }
    
    res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Marcar todas las notificaciones como leídas (requiere autenticación)
router.put('/:userId/read-all', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    try {
      // Intentar actualizar con read_at (si existe la columna)
      await pool.query(`
        UPDATE notifications 
        SET is_read = true, read_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_read = false
      `, [userId]);
    } catch (colErr) {
      // Fallback sin read_at si la columna no existe
      console.log('Columna read_at no existe, usando query simple');
      await pool.query(`
        UPDATE notifications 
        SET is_read = true
        WHERE user_id = $1 AND is_read = false
      `, [userId]);
    }
    
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error marcando notificaciones como leídas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener contador de notificaciones no leídas (requiere autenticación)
router.get('/:userId/unread-count', authMiddleware, async (req, res) => {
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
