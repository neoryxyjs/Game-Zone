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

app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en puerto ${PORT}`);
  console.log(`✅ Healthcheck disponible en http://localhost:${PORT}/`);
  console.log(`✅ API endpoints disponibles:`);
  console.log(`   - GET  /`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
}); 
