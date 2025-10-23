const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Enviar solicitud de amistad (requiere autenticación)
router.post('/request', authMiddleware, async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  
  console.log('📨 Solicitud de amistad:', { sender_id, receiver_id });
  
  try {
    // Validar que ambos IDs sean números
    if (!sender_id || !receiver_id || isNaN(sender_id) || isNaN(receiver_id)) {
      console.error('❌ IDs inválidos:', { sender_id, receiver_id });
      return res.status(400).json({ success: false, message: 'IDs de usuario inválidos' });
    }

    // Verificar que no estén intentando enviarse a sí mismos
    if (parseInt(sender_id) === parseInt(receiver_id)) {
      return res.status(400).json({ success: false, message: 'No puedes enviarte solicitud a ti mismo' });
    }

    console.log('🔍 Verificando solicitud existente...');
    // Verificar si ya existe una solicitud pendiente
    const existingRequest = await pool.query(
      'SELECT id, status FROM friend_requests WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)',
      [sender_id, receiver_id]
    );
    
    if (existingRequest.rows.length > 0) {
      console.log('ℹ️  Solicitud existente encontrada:', existingRequest.rows[0]);
      if (existingRequest.rows[0].status === 'pending') {
        return res.status(400).json({ success: false, message: 'Ya existe una solicitud pendiente' });
      }
      // Si fue rechazada, permitir reenviar
      if (existingRequest.rows[0].status === 'rejected') {
        await pool.query(
          'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['pending', existingRequest.rows[0].id]
        );
        return res.json({ success: true, message: 'Solicitud reenviada' });
      }
    }

    console.log('🔍 Verificando si ya son amigos...');
    // Verificar si ya son amigos - Simplificado para evitar problemas con LEAST/GREATEST
    const userId1 = Math.min(parseInt(sender_id), parseInt(receiver_id));
    const userId2 = Math.max(parseInt(sender_id), parseInt(receiver_id));
    
    const areFriends = await pool.query(
      'SELECT id FROM friendships WHERE user_id_1 = $1 AND user_id_2 = $2',
      [userId1, userId2]
    );

    if (areFriends.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya son amigos' });
    }
    
    console.log('✅ Creando solicitud de amistad...');
    // Crear solicitud de amistad
    const result = await pool.query(
      'INSERT INTO friend_requests (sender_id, receiver_id) VALUES ($1, $2) RETURNING *',
      [sender_id, receiver_id]
    );

    console.log('✅ Creando notificación...');
    // Crear notificación para el receptor
    await pool.query(`
      INSERT INTO notifications (user_id, from_user_id, type, message, is_read)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      receiver_id,
      sender_id,
      'friend_request',
      'Te ha enviado una solicitud de amistad',
      false
    ]);
    
    console.log('✅ Solicitud de amistad enviada exitosamente');
    res.json({ success: true, request: result.rows[0] });
  } catch (err) {
    console.error('❌ Error enviando solicitud de amistad:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ success: false, error: err.message, details: process.env.NODE_ENV === 'production' ? undefined : err.stack });
  }
});

// Aceptar solicitud de amistad (requiere autenticación)
router.post('/accept/:requestId', authMiddleware, async (req, res) => {
  const { requestId } = req.params;
  
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Obtener la solicitud
      const requestResult = await client.query(
        'SELECT * FROM friend_requests WHERE id = $1 AND status = $2',
        [requestId, 'pending']
      );

      if (requestResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Solicitud no encontrada o ya procesada' });
      }

      const request = requestResult.rows[0];

      // Actualizar estado de la solicitud
      await client.query(
        'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['accepted', requestId]
      );

      // Crear amistad bidireccional
      const userId1 = Math.min(request.sender_id, request.receiver_id);
      const userId2 = Math.max(request.sender_id, request.receiver_id);

      await client.query(
        'INSERT INTO friendships (user_id_1, user_id_2) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId1, userId2]
      );

      // Crear notificación para el sender
      await client.query(`
        INSERT INTO notifications (user_id, from_user_id, type, message, is_read)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        request.sender_id,
        request.receiver_id,
        'friend_accept',
        'Aceptó tu solicitud de amistad',
        false
      ]);

      await client.query('COMMIT');
      res.json({ success: true, message: 'Solicitud aceptada' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error aceptando solicitud:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rechazar solicitud de amistad (requiere autenticación)
router.post('/reject/:requestId', authMiddleware, async (req, res) => {
  const { requestId } = req.params;
  
  try {
    const result = await pool.query(
      'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND status = $3 RETURNING *',
      ['rejected', requestId, 'pending']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }
    
    res.json({ success: true, message: 'Solicitud rechazada' });
  } catch (err) {
    console.error('Error rechazando solicitud:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener solicitudes pendientes (recibidas) (requiere autenticación)
router.get('/requests/pending/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        fr.id,
        fr.sender_id,
        fr.receiver_id,
        fr.created_at,
        u.username as sender_username,
        u.avatar as sender_avatar
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = $1 AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `, [userId]);
    
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    console.error('Error obteniendo solicitudes:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Alias para requests/received (mismo que pending)
router.get('/requests/received/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        fr.id,
        fr.sender_id,
        fr.receiver_id,
        fr.created_at,
        u.username as sender_username,
        u.avatar as sender_avatar
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = $1 AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `, [userId]);
    
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    console.error('Error obteniendo solicitudes recibidas:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener solicitudes enviadas (requiere autenticación)
router.get('/requests/sent/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        fr.id,
        fr.sender_id,
        fr.receiver_id,
        fr.status,
        fr.created_at,
        u.username as receiver_username,
        u.avatar as receiver_avatar
      FROM friend_requests fr
      JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = $1 AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `, [userId]);
    
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    console.error('Error obteniendo solicitudes enviadas:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener lista de amigos (requiere autenticación)
router.get('/list/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        f.created_at as friends_since
      FROM friendships f
      JOIN users u ON (CASE 
        WHEN f.user_id_1 = $1 THEN f.user_id_2
        ELSE f.user_id_1
      END) = u.id
      WHERE f.user_id_1 = $1 OR f.user_id_2 = $1
      ORDER BY f.created_at DESC
    `, [userId]);
    
    res.json({ success: true, friends: result.rows });
  } catch (err) {
    console.error('Error obteniendo amigos:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Eliminar amigo (requiere autenticación)
router.delete('/remove', authMiddleware, async (req, res) => {
  const { user_id_1, user_id_2 } = req.body;
  
  try {
    const userId1 = Math.min(user_id_1, user_id_2);
    const userId2 = Math.max(user_id_1, user_id_2);

    await pool.query(
      'DELETE FROM friendships WHERE user_id_1 = $1 AND user_id_2 = $2',
      [userId1, userId2]
    );
    
    res.json({ success: true, message: 'Amistad eliminada' });
  } catch (err) {
    console.error('Error eliminando amistad:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verificar si dos usuarios son amigos
router.get('/check/:userId1/:userId2', async (req, res) => {
  const { userId1, userId2 } = req.params;
  
  try {
    const id1 = Math.min(parseInt(userId1), parseInt(userId2));
    const id2 = Math.max(parseInt(userId1), parseInt(userId2));

    const result = await pool.query(
      'SELECT id FROM friendships WHERE user_id_1 = $1 AND user_id_2 = $2',
      [id1, id2]
    );
    
    const areFriends = result.rows.length > 0;
    
    // Si no son amigos, verificar si hay solicitud pendiente
    let pendingRequest = null;
    if (!areFriends) {
      const requestResult = await pool.query(
        'SELECT id, sender_id, receiver_id, status FROM friend_requests WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)) AND status = $3',
        [userId1, userId2, 'pending']
      );
      pendingRequest = requestResult.rows[0] || null;
    }

    res.json({ 
      success: true, 
      areFriends,
      pendingRequest
    });
  } catch (err) {
    console.error('Error verificando amistad:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

