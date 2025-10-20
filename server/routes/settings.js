const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener configuraciones del usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Crear configuraciones por defecto si no existen
      const defaultSettings = await pool.query(
        'INSERT INTO user_settings (user_id, theme, notifications_enabled, email_notifications, privacy_level, language) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, 'dark', true, true, 'public', 'es']
      );
      
      return res.json({ success: true, settings: defaultSettings.rows[0] });
    }

    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo configuraciones' });
  }
});

// Actualizar configuraciones del usuario
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { theme, notifications_enabled, email_notifications, privacy_level, language } = req.body;
    
    // Verificar si existen configuraciones
    const existingSettings = await pool.query(
      'SELECT id FROM user_settings WHERE user_id = $1',
      [userId]
    );

    let result;
    if (existingSettings.rows.length === 0) {
      // Crear nuevas configuraciones
      result = await pool.query(
        'INSERT INTO user_settings (user_id, theme, notifications_enabled, email_notifications, privacy_level, language) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, theme, notifications_enabled, email_notifications, privacy_level, language]
      );
    } else {
      // Actualizar configuraciones existentes
      result = await pool.query(
        'UPDATE user_settings SET theme = $1, notifications_enabled = $2, email_notifications = $3, privacy_level = $4, language = $5, updated_at = CURRENT_TIMESTAMP WHERE user_id = $6 RETURNING *',
        [theme, notifications_enabled, email_notifications, privacy_level, language, userId]
      );
    }

    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando configuraciones:', error);
    res.status(500).json({ success: false, message: 'Error actualizando configuraciones' });
  }
});

// Actualizar avatar del usuario
router.put('/:userId/avatar', async (req, res) => {
  try {
    const { userId } = req.params;
    const { avatar_url } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, username, avatar',
      [avatar_url, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando avatar:', error);
    res.status(500).json({ success: false, message: 'Error actualizando avatar' });
  }
});

// Obtener estadísticas del usuario
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE user_id = $1) as posts_count,
        (SELECT COUNT(*) FROM user_follows WHERE following_id = $1) as followers_count,
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = $1) as following_count,
        (SELECT COUNT(*) FROM post_likes pl JOIN posts p ON pl.post_id = p.id WHERE p.user_id = $1) as total_likes
    `, [userId]);

    res.json({ success: true, stats: stats.rows[0] });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo estadísticas' });
  }
});

module.exports = router;
