const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Seguir a un usuario (requiere autenticación)
router.post('/follow', authMiddleware, async (req, res) => {
  const { follower_id, following_id } = req.body;
  
  try {
    // Verificar si ya existe la relación
    const existingFollow = await pool.query(
      'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
      [follower_id, following_id]
    );
    
    if (existingFollow.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya sigues a este usuario' });
    }
    
    // Crear la relación de seguimiento
    await pool.query(
      'INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2)',
      [follower_id, following_id]
    );
    
    res.json({ success: true, message: 'Usuario seguido exitosamente' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dejar de seguir a un usuario (requiere autenticación)
router.post('/unfollow', authMiddleware, async (req, res) => {
  const { follower_id, following_id } = req.body;
  
  try {
    await pool.query(
      'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
      [follower_id, following_id]
    );
    
    res.json({ success: true, message: 'Dejaste de seguir al usuario' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener seguidores de un usuario
router.get('/followers/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        uf.created_at as followed_at
      FROM user_follows uf
      JOIN users u ON uf.follower_id = u.id
      WHERE uf.following_id = $1
      ORDER BY uf.created_at DESC
    `, [userId]);
    
    res.json({ success: true, followers: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener usuarios que sigue un usuario
router.get('/following/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        uf.created_at as followed_at
      FROM user_follows uf
      JOIN users u ON uf.following_id = u.id
      WHERE uf.follower_id = $1
      ORDER BY uf.created_at DESC
    `, [userId]);
    
    res.json({ success: true, following: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener feed personalizado (posts de usuarios seguidos)
router.get('/feed/:userId', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        u.username,
        u.avatar,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT pc.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN user_follows uf ON p.user_id = uf.following_id AND uf.follower_id = $1
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN post_comments pc ON p.id = pc.post_id
      WHERE uf.follower_id = $1 OR p.user_id = $1
      GROUP BY p.id, u.username, u.avatar
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    res.json({ success: true, posts: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Buscar usuarios
router.get('/search/users', async (req, res) => {
  const { q } = req.query;
  
  try {
    const result = await pool.query(`
      SELECT 
        id,
        username,
        avatar,
        game,
        rank
      FROM users 
      WHERE username ILIKE $1 OR game ILIKE $1
      ORDER BY username
      LIMIT 20
    `, [`%${q}%`]);
    
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener perfil público de un usuario
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Obtener información del usuario
    const userResult = await pool.query(`
      SELECT 
        id,
        username,
        avatar,
        game,
        rank,
        riotSummonerName,
        created_at
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // Obtener estadísticas
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE user_id = $1) as posts_count,
        (SELECT COUNT(*) FROM user_follows WHERE following_id = $1) as followers_count,
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = $1) as following_count
    `, [userId]);
    
    const profile = {
      ...userResult.rows[0],
      stats: statsResult.rows[0]
    };
    
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
