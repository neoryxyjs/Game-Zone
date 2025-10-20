const express = require('express');
const router = express.Router();
const pool = require('../db');

// Crear un nuevo post
router.post('/create', async (req, res) => {
  const { user_id, content, image_url, game_tag } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO posts (user_id, content, image_url, game_tag) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, content, image_url, game_tag]
    );
    
    // Obtener información del usuario
    const userResult = await pool.query(
      'SELECT id, username, avatar FROM users WHERE id = $1',
      [user_id]
    );
    
    const post = {
      ...result.rows[0],
      user: userResult.rows[0],
      likes_count: 0,
      comments_count: 0
    };
    
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener feed público (posts de todos los usuarios)
router.get('/feed', async (req, res) => {
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
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN post_comments pc ON p.id = pc.post_id
      GROUP BY p.id, u.username, u.avatar
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json({ success: true, posts: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener posts de un usuario específico
router.get('/user/:userId', async (req, res) => {
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
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN post_comments pc ON p.id = pc.post_id
      WHERE p.user_id = $1
      GROUP BY p.id, u.username, u.avatar
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    res.json({ success: true, posts: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dar like a un post
router.post('/:postId/like', async (req, res) => {
  const { postId } = req.params;
  const { user_id } = req.body;
  
  try {
    // Verificar si ya existe el like
    const existingLike = await pool.query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, user_id]
    );
    
    if (existingLike.rows.length > 0) {
      // Quitar like
      await pool.query(
        'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, user_id]
      );
      res.json({ success: true, liked: false });
    } else {
      // Agregar like
      await pool.query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
        [postId, user_id]
      );
      res.json({ success: true, liked: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Comentar en un post
router.post('/:postId/comment', async (req, res) => {
  const { postId } = req.params;
  const { user_id, content } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, user_id, content]
    );
    
    // Obtener información del usuario que comenta
    const userResult = await pool.query(
      'SELECT username, avatar FROM users WHERE id = $1',
      [user_id]
    );
    
    const comment = {
      ...result.rows[0],
      user: userResult.rows[0]
    };
    
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener comentarios de un post
router.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        pc.*,
        u.username,
        u.avatar
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.post_id = $1
      ORDER BY pc.created_at ASC
    `, [postId]);
    
    res.json({ success: true, comments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
