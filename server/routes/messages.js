const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Obtener conversaciones del usuario (lista de personas con las que ha chateado)
router.get('/conversations/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (other_user_id)
        other_user_id,
        u.username,
        u.avatar,
        last_message,
        last_message_time,
        unread_count
      FROM (
        SELECT 
          CASE 
            WHEN sender_id = $1 THEN receiver_id 
            ELSE sender_id 
          END as other_user_id,
          content as last_message,
          created_at as last_message_time,
          (
            SELECT COUNT(*) 
            FROM messages 
            WHERE sender_id = CASE 
              WHEN m.sender_id = $1 THEN m.receiver_id 
              ELSE m.sender_id 
            END
            AND receiver_id = $1 
            AND is_read = FALSE
          ) as unread_count
        FROM messages m
        WHERE sender_id = $1 OR receiver_id = $1
        ORDER BY created_at DESC
      ) conversations
      JOIN users u ON u.id = conversations.other_user_id
      ORDER BY other_user_id, last_message_time DESC
    `, [userId]);
    
    res.json({ success: true, conversations: result.rows });
  } catch (err) {
    console.error('Error obteniendo conversaciones:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener mensajes entre dos usuarios
router.get('/conversation/:userId1/:userId2', authMiddleware, async (req, res) => {
  const { userId1, userId2 } = req.params;
  const { limit = 50, offset = 0 } = req.query;
  
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        u.username as sender_username,
        u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
    `, [userId1, userId2, limit, offset]);
    
    res.json({ 
      success: true, 
      messages: result.rows.reverse() // Invertir para que estén en orden cronológico
    });
  } catch (err) {
    console.error('Error obteniendo mensajes:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Enviar mensaje
router.post('/send', authMiddleware, async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'El mensaje no puede estar vacío' });
  }
  
  try {
    const result = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [sender_id, receiver_id, content.trim()]);
    
    // Crear notificación para el receptor
    await pool.query(`
      INSERT INTO notifications (user_id, from_user_id, type, message, is_read)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      receiver_id,
      sender_id,
      'message',
      'Te ha enviado un mensaje',
      false
    ]);
    
    res.json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error('Error enviando mensaje:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Marcar mensaje(s) como leído(s)
router.post('/mark-read', authMiddleware, async (req, res) => {
  const { message_ids, user_id, sender_id } = req.body;
  
  try {
    let result;
    
    if (message_ids && Array.isArray(message_ids)) {
      // Marcar mensajes específicos como leídos
      result = await pool.query(`
        UPDATE messages 
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE id = ANY($1) AND receiver_id = $2 AND is_read = FALSE
        RETURNING *
      `, [message_ids, user_id]);
    } else if (sender_id) {
      // Marcar todos los mensajes de un remitente como leídos
      result = await pool.query(`
        UPDATE messages 
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
        RETURNING *
      `, [sender_id, user_id]);
    } else {
      return res.status(400).json({ success: false, message: 'Faltan parámetros' });
    }
    
    res.json({ 
      success: true, 
      updated_count: result.rowCount,
      messages: result.rows 
    });
  } catch (err) {
    console.error('Error marcando mensajes como leídos:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener cantidad de mensajes no leídos
router.get('/unread/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as unread_count
      FROM messages
      WHERE receiver_id = $1 AND is_read = FALSE
    `, [userId]);
    
    res.json({ 
      success: true, 
      unread_count: parseInt(result.rows[0].unread_count) 
    });
  } catch (err) {
    console.error('Error obteniendo mensajes no leídos:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Eliminar mensaje
router.delete('/:messageId', authMiddleware, async (req, res) => {
  const { messageId } = req.params;
  const { userId } = req.body;
  
  try {
    // Verificar que el usuario sea el remitente del mensaje
    const result = await pool.query(`
      DELETE FROM messages
      WHERE id = $1 AND sender_id = $2
      RETURNING *
    `, [messageId, userId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mensaje no encontrado o no tienes permiso para eliminarlo' 
      });
    }
    
    res.json({ success: true, message: 'Mensaje eliminado' });
  } catch (err) {
    console.error('Error eliminando mensaje:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

