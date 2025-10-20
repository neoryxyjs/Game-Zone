const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pool = require('../db');

// Configurar multer para subir avatares
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.params.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Obtener perfil completo de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Obtener información básica del usuario
    const userResult = await pool.query(
      'SELECT id, username, email, avatar, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // Obtener perfil del usuario
    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    // Obtener configuraciones del usuario
    const settingsResult = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    // Obtener estadísticas del usuario
    const statsResult = await pool.query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [userId]
    );
    
    const profile = {
      user: userResult.rows[0],
      profile: profileResult.rows[0] || null,
      settings: settingsResult.rows[0] || null,
      stats: statsResult.rows[0] || null
    };
    
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar perfil de usuario
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, location, website, birth_date, gender, favorite_games, gaming_style, availability, looking_for_team, streaming_platform, streaming_url, social_links } = req.body;
    
    // Verificar si existe el perfil
    const existingProfile = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    let result;
    if (existingProfile.rows.length === 0) {
      // Crear nuevo perfil
      result = await pool.query(
        'INSERT INTO user_profiles (user_id, bio, location, website, birth_date, gender, favorite_games, gaming_style, availability, looking_for_team, streaming_platform, streaming_url, social_links) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
        [userId, bio, location, website, birth_date, gender, favorite_games, gaming_style, availability, looking_for_team, streaming_platform, streaming_url, social_links]
      );
    } else {
      // Actualizar perfil existente
      result = await pool.query(
        'UPDATE user_profiles SET bio = $1, location = $2, website = $3, birth_date = $4, gender = $5, favorite_games = $6, gaming_style = $7, availability = $8, looking_for_team = $9, streaming_platform = $10, streaming_url = $11, social_links = $12, updated_at = CURRENT_TIMESTAMP WHERE user_id = $13 RETURNING *',
        [bio, location, website, birth_date, gender, favorite_games, gaming_style, availability, looking_for_team, streaming_platform, streaming_url, social_links, userId]
      );
    }
    
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar configuraciones de usuario
router.put('/:userId/settings', async (req, res) => {
  try {
    const { userId } = req.params;
    const { theme, language, notifications_enabled, email_notifications, push_notifications, privacy_level, show_online_status, show_activity, allow_friend_requests, allow_messages, auto_save, performance_mode, low_latency_mode } = req.body;
    
    // Verificar si existen configuraciones
    const existingSettings = await pool.query(
      'SELECT id FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    let result;
    if (existingSettings.rows.length === 0) {
      // Crear nuevas configuraciones
      result = await pool.query(
        'INSERT INTO user_settings (user_id, theme, language, notifications_enabled, email_notifications, push_notifications, privacy_level, show_online_status, show_activity, allow_friend_requests, allow_messages, auto_save, performance_mode, low_latency_mode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
        [userId, theme, language, notifications_enabled, email_notifications, push_notifications, privacy_level, show_online_status, show_activity, allow_friend_requests, allow_messages, auto_save, performance_mode, low_latency_mode]
      );
    } else {
      // Actualizar configuraciones existentes
      result = await pool.query(
        'UPDATE user_settings SET theme = $1, language = $2, notifications_enabled = $3, email_notifications = $4, push_notifications = $5, privacy_level = $6, show_online_status = $7, show_activity = $8, allow_friend_requests = $9, allow_messages = $10, auto_save = $11, performance_mode = $12, low_latency_mode = $13, updated_at = CURRENT_TIMESTAMP WHERE user_id = $14 RETURNING *',
        [theme, language, notifications_enabled, email_notifications, push_notifications, privacy_level, show_online_status, show_activity, allow_friend_requests, allow_messages, auto_save, performance_mode, low_latency_mode, userId]
      );
    }
    
    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando configuraciones:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener estadísticas de usuario
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      // Crear estadísticas por defecto si no existen
      const defaultStats = await pool.query(
        'INSERT INTO user_stats (user_id) VALUES ($1) RETURNING *',
        [userId]
      );
      return res.json({ success: true, stats: defaultStats.rows[0] });
    }
    
    res.json({ success: true, stats: result.rows[0] });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar avatar de usuario (archivo)
router.put('/:userId/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó archivo de avatar' });
    }
    
    // Crear URL del avatar
    const avatarUrl = `${req.protocol}://${req.get('host')}/api/profiles/avatar/${req.file.filename}`;
    
    const result = await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, username, avatar',
      [avatarUrl, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    res.json({ success: true, user: result.rows[0], avatar_url: avatarUrl });
  } catch (error) {
    console.error('Error actualizando avatar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Servir archivos de avatar
router.get('/avatar/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/avatars', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Avatar no encontrado' });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error sirviendo avatar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
