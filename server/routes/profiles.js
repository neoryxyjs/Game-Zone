const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pool = require('../db');
const cloudinary = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/auth');

// Configurar multer para subir avatares (solo imágenes)
const avatarStorage = multer.diskStorage({
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

const avatarUpload = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Configurar multer para posts (imágenes y videos)
const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/posts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `post-${uniqueSuffix}${ext}`);
  }
});

const postUpload = multer({ 
  storage: postStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB para videos
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP) o videos (MP4, MOV, AVI, WebM)'), false);
    }
  }
});

// Buscar usuarios por nombre (PÚBLICO)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, users: [] });
    }
    
    const searchTerm = `%${q.trim()}%`;
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.username, 
        u.avatar, 
        up.bio,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
        (SELECT COUNT(*) FROM user_follows WHERE following_id = u.id) as followers_count
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE LOWER(u.username) LIKE LOWER($1)
      ORDER BY 
        (SELECT COUNT(*) FROM user_follows WHERE following_id = u.id) DESC,
        u.username ASC
      LIMIT 10
    `, [searchTerm]);
    
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener perfil completo de un usuario (PÚBLICO)
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
    
    // Obtener estadísticas REALES del usuario
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE user_id = $1) as posts_count,
        (SELECT COUNT(*) FROM user_follows WHERE following_id = $1) as followers_count,
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = $1) as following_count,
        (SELECT COUNT(*) FROM post_likes WHERE user_id = $1) as likes_given_count,
        (SELECT COUNT(*) FROM post_likes pl JOIN posts p ON pl.post_id = p.id WHERE p.user_id = $1) as likes_received_count
    `, [userId]);
    
    const user = userResult.rows[0];
    const profileData = profileResult.rows[0];
    const stats = statsResult.rows[0];
    
    const profile = {
      ...user,
      bio: profileData?.bio || '',
      location: profileData?.location || '',
      gaming_style: profileData?.gaming_style || '',
      banner_url: profileData?.banner_url || null,
      discord_url: profileData?.discord_url || null,
      twitch_url: profileData?.twitch_url || null,
      youtube_url: profileData?.youtube_url || null,
      twitter_url: profileData?.twitter_url || null,
      favorite_games: profileData?.favorite_games || [],
      badges: profileData?.badges || [],
      level: profileData?.level || 1,
      experience_points: profileData?.experience_points || 0,
      is_verified: profileData?.is_verified || false,
      profile_color: profileData?.profile_color || '#6366f1',
      followers_count: parseInt(stats.followers_count) || 0,
      following_count: parseInt(stats.following_count) || 0,
      posts_count: parseInt(stats.posts_count) || 0,
      likes_given: parseInt(stats.likes_given_count) || 0,
      likes_received: parseInt(stats.likes_received_count) || 0
    };
    
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar perfil de usuario (requiere autenticación)
router.put('/:userId', authMiddleware, async (req, res) => {
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

// Actualizar banner y personalización del perfil (requiere autenticación)
router.put('/:userId/customization', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      banner_url, 
      discord_url, 
      twitch_url, 
      youtube_url, 
      twitter_url, 
      favorite_games,
      profile_color,
      bio,
      location
    } = req.body;
    
    // Verificar si existe el perfil
    const existingProfile = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    let result;
    if (existingProfile.rows.length === 0) {
      // Crear nuevo perfil con los campos
      result = await pool.query(`
        INSERT INTO user_profiles (
          user_id, bio, location, banner_url, discord_url, twitch_url, 
          youtube_url, twitter_url, favorite_games, profile_color
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
      `, [
        userId, bio, location, banner_url, discord_url, twitch_url, 
        youtube_url, twitter_url, favorite_games, profile_color
      ]);
    } else {
      // Actualizar perfil existente solo con los campos proporcionados
      const updates = [];
      const values = [];
      let paramCounter = 1;
      
      if (bio !== undefined) {
        updates.push(`bio = $${paramCounter++}`);
        values.push(bio);
      }
      if (location !== undefined) {
        updates.push(`location = $${paramCounter++}`);
        values.push(location);
      }
      if (banner_url !== undefined) {
        updates.push(`banner_url = $${paramCounter++}`);
        values.push(banner_url);
      }
      if (discord_url !== undefined) {
        updates.push(`discord_url = $${paramCounter++}`);
        values.push(discord_url);
      }
      if (twitch_url !== undefined) {
        updates.push(`twitch_url = $${paramCounter++}`);
        values.push(twitch_url);
      }
      if (youtube_url !== undefined) {
        updates.push(`youtube_url = $${paramCounter++}`);
        values.push(youtube_url);
      }
      if (twitter_url !== undefined) {
        updates.push(`twitter_url = $${paramCounter++}`);
        values.push(twitter_url);
      }
      if (favorite_games !== undefined) {
        updates.push(`favorite_games = $${paramCounter++}`);
        values.push(favorite_games);
      }
      if (profile_color !== undefined) {
        updates.push(`profile_color = $${paramCounter++}`);
        values.push(profile_color);
      }
      
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);
      
      result = await pool.query(
        `UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = $${paramCounter} RETURNING *`,
        values
      );
    }
    
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando personalización del perfil:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener configuraciones de usuario
router.get('/:userId/settings', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      // Crear configuraciones por defecto si no existen
      const defaultSettings = await pool.query(
        'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
        [userId]
      );
      return res.json({ success: true, settings: defaultSettings.rows[0] });
    }
    
    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar configuraciones de usuario (requiere autenticación)
router.put('/:userId/settings', authMiddleware, async (req, res) => {
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

// Actualizar avatar de usuario (archivo) - Usando Cloudinary (requiere autenticación)
router.put('/:userId/avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('📸 Avatar upload request:', { userId, file: req.file });
    
    if (!req.file) {
      console.log('❌ No file provided');
      return res.status(400).json({ success: false, message: 'No se proporcionó archivo de avatar' });
    }
    
    console.log('📁 File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    // Subir a Cloudinary
    console.log('☁️ Subiendo a Cloudinary...');
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'gamezone/avatars',
      public_id: `avatar-${userId}-${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    const avatarUrl = cloudinaryResult.secure_url;
    console.log('✅ Avatar subido a Cloudinary:', avatarUrl);
    
    // Eliminar archivo temporal local
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Iniciar transacción
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Desactivar avatares anteriores del usuario
      await client.query(
        'UPDATE user_images SET is_active = false WHERE user_id = $1 AND image_type = $2',
        [userId, 'avatar']
      );
      
      // Insertar nueva imagen en user_images con URL de Cloudinary
      const imageResult = await client.query(`
        INSERT INTO user_images (user_id, filename, original_name, file_path, file_size, mime_type, image_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, filename
      `, [
        userId,
        cloudinaryResult.public_id,
        req.file.originalname,
        avatarUrl,
        req.file.size,
        req.file.mimetype,
        'avatar'
      ]);
      
      // Actualizar avatar en tabla users
      const userResult = await client.query(
        'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, username, avatar',
        [avatarUrl, userId]
      );
      
      if (userResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      await client.query('COMMIT');
      
      console.log('✅ Avatar updated successfully:', {
        user: userResult.rows[0],
        image: imageResult.rows[0]
      });
      
      res.json({ 
        success: true, 
        user: userResult.rows[0], 
        avatar_url: avatarUrl,
        image_id: imageResult.rows[0].id
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error actualizando avatar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Servir archivos de avatar
router.get('/avatar/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/avatars', filename);
    
    console.log('🖼️ Serving avatar:', { filename, filePath });
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Avatar file not found:', filePath);
      return res.status(404).json({ success: false, message: 'Avatar no encontrado' });
    }
    
    console.log('✅ Avatar file found, serving:', filePath);
    res.sendFile(filePath);
  } catch (error) {
    console.error('❌ Error sirviendo avatar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Servir imágenes de posts
router.get('/post-image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/avatars', filename); // Usamos la misma carpeta por ahora
    
    console.log('🖼️ Serving post image:', { filename, filePath });
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Post image file not found:', filePath);
      return res.status(404).json({ success: false, message: 'Imagen de post no encontrada' });
    }
    
    console.log('✅ Post image file found, serving:', filePath);
    res.sendFile(filePath);
  } catch (error) {
    console.error('❌ Error sirviendo imagen de post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener imágenes de un usuario
router.get('/:userId/images', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'all' } = req.query;
    
    let query = `
      SELECT id, filename, original_name, file_size, mime_type, image_type, created_at
      FROM user_images 
      WHERE user_id = $1 AND is_active = true
    `;
    let params = [userId];
    
    if (type !== 'all') {
      query += ' AND image_type = $2';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      images: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error obteniendo imágenes del usuario:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para subir imágenes/videos de posts - Usando Cloudinary (requiere autenticación)
router.post('/upload-post-image', authMiddleware, postUpload.single('image'), async (req, res) => {
  try {
    const { user_id, post_id, is_video } = req.body;
    const isVideo = is_video === 'true' || is_video === true;
    
    console.log('📸 Post media upload request:', { user_id, post_id, isVideo, file: req.file });
    
    if (!req.file) {
      console.log('❌ No file provided');
      return res.status(400).json({ success: false, message: 'No se proporcionó archivo' });
    }
    
    console.log('📁 File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      isVideo: isVideo
    });
    
    // Verificar que el archivo existe
    if (!req.file.path) {
      console.error('❌ Error: req.file.path is undefined');
      return res.status(400).json({ success: false, message: 'Error: ruta de archivo no válida' });
    }
    
    // Subir a Cloudinary (soporta imágenes y videos)
    console.log(`☁️ Subiendo ${isVideo ? 'video' : 'imagen'} de post a Cloudinary...`);
    console.log('📂 Ruta del archivo:', req.file.path);
    
    const uploadOptions = {
      folder: 'gamezone/posts',
      public_id: `post-${user_id}-${Date.now()}`,
      resource_type: isVideo ? 'video' : 'image'
    };
    
    // Añadir transformaciones solo para imágenes
    if (!isVideo) {
      uploadOptions.transformation = [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ];
    } else {
      // Para videos, limitamos el tamaño y añadimos formato automático
      uploadOptions.eager = [
        { width: 1280, height: 720, crop: 'limit', video_codec: 'auto', audio_codec: 'auto' }
      ];
      uploadOptions.eager_async = true;
      uploadOptions.chunk_size = 6000000; // 6MB chunks para videos grandes
    }
    
    console.log('⚙️ Upload options:', uploadOptions);
    
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, uploadOptions);
    
    const mediaUrl = cloudinaryResult.secure_url;
    console.log(`✅ ${isVideo ? 'Video' : 'Imagen'} de post subida a Cloudinary:`, mediaUrl);
    
    // Eliminar archivo temporal local
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Iniciar transacción
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insertar imagen en user_images con URL de Cloudinary
      const imageResult = await client.query(`
        INSERT INTO user_images (user_id, filename, original_name, file_path, file_size, mime_type, image_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, filename
      `, [
        user_id,
        cloudinaryResult.public_id,
        req.file.originalname,
        mediaUrl,
        req.file.size,
        req.file.mimetype,
        'post'
      ]);
      
      await client.query('COMMIT');
      
      console.log(`✅ Post ${isVideo ? 'video' : 'image'} uploaded successfully:`, imageResult.rows[0]);
      
      res.json({ 
        success: true, 
        image: {
          id: imageResult.rows[0].id,
          filename: imageResult.rows[0].filename,
          url: mediaUrl
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error subiendo imagen/video de post:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Devolver mensaje de error detallado
    const errorMessage = error.message || 'Error desconocido al subir archivo';
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Endpoint de prueba para verificar que el sistema funciona
router.get('/test-avatar', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Sistema de avatares funcionando',
    uploadsDir: path.join(__dirname, '../uploads/avatars'),
    exists: fs.existsSync(path.join(__dirname, '../uploads/avatars'))
  });
});

module.exports = router;
