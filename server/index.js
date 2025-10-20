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
// Temporalmente deshabilitado para debug
// const imagesRoutes = require('./routes/images');
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
// Temporalmente deshabilitado para debug
// app.use('/api/images', imagesRoutes);
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

app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en puerto ${PORT}`);
  console.log(`✅ Healthcheck disponible en http://localhost:${PORT}/`);
  console.log(`✅ API endpoints disponibles:`);
  console.log(`   - GET  /`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
}); 
