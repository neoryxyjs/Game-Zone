const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../db');

// Clave secreta para JWT (en producción debería estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura-2024';

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Verifica si el usuario o email ya existen
    const userExists = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Usuario o email ya existe' });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserta el usuario y obtiene sus datos
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, avatar, created_at',
      [username, email, hashedPassword]
    );
    
    const newUser = result.rows[0];
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        username: newUser.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token válido por 7 días
    );
    
    res.status(201).json({ 
      success: true,
      message: 'Usuario registrado correctamente',
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        created_at: newUser.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Buscar usuario por email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    const user = userResult.rows[0];

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token válido por 7 días
    );

    // Login exitoso
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        created_at: user.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Actualizar username
router.put('/update-username', async (req, res) => {
  try {
    const { userId, username } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }
    
    // Verificar si el username ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [username, userId]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'El username ya está en uso' });
    }
    
    // Actualizar username
    const result = await pool.query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email',
      [username, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando username:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para verificar token y obtener información del usuario
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Obtener información actualizada del usuario
    const userResult = await pool.query(
      'SELECT id, username, email, avatar, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    const user = userResult.rows[0];
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        created_at: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Error verificando token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado' });
    }
    
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

module.exports = router; 