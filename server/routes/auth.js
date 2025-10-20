const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Verifica si el usuario o email ya existen
    const userExists = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Usuario o email ya existe' });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserta el usuario
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
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

    // Login exitoso
    res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
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

module.exports = router; 