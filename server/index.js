const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Configurar variables de entorno
require('./scripts/setup-env');

// Ejecutar migraciones automáticamente (no bloquea el inicio)
const { runMigrations } = require('./scripts/migrate');
// Temporalmente deshabilitado para debug
// runMigrations().catch(err => {
//   console.log('⚠️  Migraciones fallaron, continuando sin ellas:', err.message);
// });

console.log('🔧 Backend simplificado - Solo autenticación básica');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const socialRoutes = require('./routes/social');
const imagesRoutes = require('./routes/images');
const profilesRoutes = require('./routes/profiles');
// Temporalmente deshabilitado para debug
// const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de CORS más permisiva
app.use(cors({
  origin: true, // Permitir cualquier origen temporalmente
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/profiles', profilesRoutes);
// Temporalmente deshabilitado para debug
// app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
  res.send('API de GameZone Social funcionando');
});

// Endpoint de prueba para CORS
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para ejecutar migraciones manualmente
app.post('/api/migrate', async (req, res) => {
  try {
    console.log('🔄 Ejecutando migraciones manualmente...');
    await runMigrations();
    res.json({ success: true, message: 'Migraciones ejecutadas exitosamente' });
  } catch (error) {
    console.error('❌ Error en migraciones:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint simplificado para crear tabla posts
app.post('/api/create-posts-table', async (req, res) => {
  try {
    const pool = require('./db');
    
    // Crear tabla posts si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url VARCHAR(500),
        game_tag VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla post_likes si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      )
    `);
    
    // Crear tabla post_comments si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    res.json({ success: true, message: 'Tabla posts creada exitosamente' });
  } catch (error) {
    console.error('❌ Error creando tabla posts:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para agregar columna avatar a users
app.post('/api/add-avatar-column', async (req, res) => {
  try {
    const pool = require('./db');
    
    // Agregar columna avatar si no existe
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) DEFAULT NULL
    `);
    
    res.json({ success: true, message: 'Columna avatar agregada exitosamente' });
  } catch (error) {
    console.error('❌ Error agregando columna avatar:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint de prueba para comentarios
app.get('/api/test-comments/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const pool = require('./db');
    
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
  } catch (error) {
    console.error('❌ Error obteniendo comentarios:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint temporal para subir imágenes
app.post('/api/upload-image', async (req, res) => {
  try {
    // Por ahora, devolver un URL de imagen de prueba
    res.json({ 
      success: true, 
      image: {
        id: Date.now(),
        url: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Imagen+de+Prueba',
        filename: 'test-image.jpg'
      }
    });
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint temporal para configuraciones
app.get('/api/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Configuraciones por defecto
    const defaultSettings = {
      id: 1,
      user_id: parseInt(userId),
      theme: 'dark',
      notifications_enabled: true,
      email_notifications: true,
      privacy_level: 'public',
      language: 'es',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    res.json({ success: true, settings: defaultSettings });
  } catch (error) {
    console.error('❌ Error obteniendo configuraciones:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint temporal para estadísticas
app.get('/api/settings/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Estadísticas por defecto
    const defaultStats = {
      posts_count: 0,
      followers_count: 0,
      following_count: 0,
      total_likes: 0
    };
    
    res.json({ success: true, stats: defaultStats });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en puerto ${PORT}`);
  console.log(`✅ Healthcheck disponible en http://localhost:${PORT}/`);
  console.log(`✅ API endpoints disponibles:`);
  console.log(`   - GET  /`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
}); 
