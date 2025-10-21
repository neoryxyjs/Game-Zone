const express = require('express');
const router = express.Router();
const pool = require('../db');

// Actualizar estado en línea del usuario
router.post('/:userId/online', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Actualizar timestamp de última actividad
    await pool.query(
      'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
    
    res.json({ success: true, message: 'Estado en línea actualizado' });
  } catch (error) {
    console.error('Error actualizando estado en línea:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener usuarios en línea
router.get('/', async (req, res) => {
  try {
    // Usuarios que estuvieron activos en los últimos 5 minutos
    const result = await pool.query(`
      SELECT 
        id, 
        username, 
        avatar, 
        last_seen,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_seen)) as seconds_ago
      FROM users 
      WHERE last_seen > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
      ORDER BY last_seen DESC
      LIMIT 50
    `);
    
    const onlineUsers = result.rows.map(user => ({
      ...user,
      is_online: user.seconds_ago < 300, // 5 minutos
      status: user.seconds_ago < 60 ? 'online' : 'away'
    }));
    
    res.json({ success: true, users: onlineUsers });
  } catch (error) {
    console.error('Error obteniendo usuarios en línea:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener estado de un usuario específico
router.get('/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        id, 
        username, 
        avatar, 
        last_seen,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_seen)) as seconds_ago
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    const user = result.rows[0];
    const isOnline = user.seconds_ago < 300; // 5 minutos
    
    res.json({ 
      success: true, 
      user: {
        ...user,
        is_online: isOnline,
        status: user.seconds_ago < 60 ? 'online' : isOnline ? 'away' : 'offline'
      }
    });
  } catch (error) {
    console.error('Error obteniendo estado del usuario:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
