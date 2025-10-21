const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Crear un nuevo post (requiere autenticación)
router.post('/create', authMiddleware, async (req, res) => {
  const { user_id, content, image_url, image_id, game_tag } = req.body;
  
  try {
    // Si hay image_id, usarlo; si no, usar image_url (compatibilidad)
    const query = image_id 
      ? 'INSERT INTO posts (user_id, content, image_id, game_tag) VALUES ($1, $2, $3, $4) RETURNING *'
      : 'INSERT INTO posts (user_id, content, image_url, game_tag) VALUES ($1, $2, $3, $4) RETURNING *';
    
    const params = image_id 
      ? [user_id, content, image_id, game_tag]
      : [user_id, content, image_url, game_tag];
    
    const result = await pool.query(query, params);
    
    // Obtener información del usuario
    const userResult = await pool.query(
      'SELECT id, username, avatar FROM users WHERE id = $1',
      [user_id]
    );
    
    // Si hay image_id, obtener la URL de la imagen desde user_images
    let imageUrl = result.rows[0].image_url;
    if (result.rows[0].image_id) {
      const imageResult = await pool.query(
        'SELECT file_path FROM user_images WHERE id = $1',
        [result.rows[0].image_id]
      );
      if (imageResult.rows.length > 0) {
        // Usar la URL de Cloudinary directamente
        imageUrl = imageResult.rows[0].file_path;
      }
    }
    
    const post = {
      ...result.rows[0],
      image_url: imageUrl, // Asegurar que siempre haya una URL
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
  const { page = 1, limit = 20, game } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    // Construir query con filtro opcional de juego
    let query = `
      SELECT 
        p.*,
        u.username,
        u.avatar,
        ui.file_path as image_file_path,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT pc.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN user_images ui ON p.image_id = ui.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN post_comments pc ON p.id = pc.post_id
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Agregar filtro de juego si está presente
    if (game) {
      query += ` WHERE p.game_tag = $${paramIndex}`;
      params.push(game);
      paramIndex++;
    }
    
    query += `
      GROUP BY p.id, u.username, u.avatar, ui.file_path
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Transformar los datos para incluir el objeto user y la URL de la imagen
    const posts = result.rows.map(row => {
      let imageUrl = row.image_url; // URL directa si existe
      
      // Si hay image_id y file_path (URL de Cloudinary), usarla
      if (row.image_id && row.image_file_path) {
        imageUrl = row.image_file_path; // URL completa de Cloudinary
      }
      
      return {
        ...row,
        image_url: imageUrl,
        user: {
          id: row.user_id,
          username: row.username,
          avatar: row.avatar
        }
      };
    });
    
    res.json({ success: true, posts });
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
        ui.file_path as image_file_path,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT pc.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN user_images ui ON p.image_id = ui.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN post_comments pc ON p.id = pc.post_id
      WHERE p.user_id = $1
      GROUP BY p.id, u.username, u.avatar, ui.file_path
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    // Transformar los datos para incluir el objeto user y la URL de la imagen
    const posts = result.rows.map(row => {
      let imageUrl = row.image_url; // URL directa si existe
      
      // Si hay image_id y file_path (URL de Cloudinary), usarla
      if (row.image_id && row.image_file_path) {
        imageUrl = row.image_file_path; // URL completa de Cloudinary
      }
      
      return {
        ...row,
        image_url: imageUrl,
        user: {
          id: row.user_id,
          username: row.username,
          avatar: row.avatar
        }
      };
    });
    
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dar like a un post (requiere autenticación)
router.post('/:postId/like', authMiddleware, async (req, res) => {
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

// Comentar en un post (requiere autenticación)
router.post('/:postId/comment', authMiddleware, async (req, res) => {
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
    
    // Obtener información del autor del post
    const postResult = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [postId]
    );
    
    const comment = {
      ...result.rows[0],
      user: userResult.rows[0]
    };
    
    // Crear notificación para el autor del post (si no es el mismo usuario)
    if (postResult.rows[0] && postResult.rows[0].user_id !== user_id) {
      try {
        await pool.query(`
          INSERT INTO notifications (user_id, from_user_id, type, message, post_id, is_read)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          postResult.rows[0].user_id, // Autor del post
          user_id, // Usuario que comenta
          'comment',
          `${userResult.rows[0].username} comentó en tu post`,
          postId,
          false
        ]);
      } catch (notifError) {
        console.error('Error creando notificación:', notifError);
        // No fallar el comentario si la notificación falla
      }
    }
    
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
    
    // Transformar los datos para incluir el objeto user
    const comments = result.rows.map(row => ({
      ...row,
      user: {
        id: row.user_id,
        username: row.username,
        avatar: row.avatar
      }
    }));
    
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Eliminar un post (requiere autenticación)
router.delete('/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { user_id } = req.body;
  
  try {
    // Verificar que el post existe y pertenece al usuario
    const postResult = await pool.query(
      'SELECT user_id, image_id FROM posts WHERE id = $1',
      [postId]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post no encontrado' });
    }
    
    const post = postResult.rows[0];
    
    // Verificar que el usuario es el dueño del post
    if (post.user_id !== parseInt(user_id)) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este post' });
    }
    
    // Eliminar comentarios del post
    await pool.query('DELETE FROM post_comments WHERE post_id = $1', [postId]);
    
    // Eliminar likes del post
    await pool.query('DELETE FROM post_likes WHERE post_id = $1', [postId]);
    
    // Si el post tiene una imagen asociada, marcarla como inactiva (no la eliminamos de Cloudinary)
    if (post.image_id) {
      await pool.query('UPDATE user_images SET is_active = false WHERE id = $1', [post.image_id]);
    }
    
    // Eliminar el post
    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    
    res.json({ success: true, message: 'Post eliminado correctamente' });
  } catch (err) {
    console.error('Error eliminando post:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
