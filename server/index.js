const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Configurar variables de entorno
require('./scripts/setup-env');

// ⚠️ Las migraciones deben ejecutarse manualmente en Railway
// Usar: railway run npm run migrate
// O ejecutar los scripts SQL en server/migrations/ directamente en PostgreSQL

console.log('🚀 Iniciando GameZone Social Backend...');
console.log('📊 Modo:', process.env.NODE_ENV || 'development');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const socialRoutes = require('./routes/social');
const imagesRoutes = require('./routes/images');
const profilesRoutes = require('./routes/profiles');
const onlineRoutes = require('./routes/online');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de CORS segura con lista blanca
const allowedOrigins = [
  'http://localhost:3000', // Desarrollo local
  'http://localhost:3001',
  'https://gamezone-social.vercel.app', // Producción Vercel
  'https://game-zone-8ko5.onrender.com', // Producción Render
  process.env.FRONTEND_URL, // URL dinámica desde variables de entorno
].filter(Boolean); // Eliminar valores undefined/null

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar si el origin está en la lista blanca
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS bloqueado para origin: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/online', onlineRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/', (req, res) => {
  res.send('API de GameZone Social funcionando');
});

// ⚠️ ENDPOINTS ADMINISTRATIVOS ELIMINADOS POR SEGURIDAD
// Estos endpoints son peligrosos en producción y han sido removidos.
// Para operaciones de mantenimiento, usar:
// 1. Railway CLI para ejecutar migraciones
// 2. Scripts en /server/scripts/ para operaciones de base de datos
// 3. Conexión directa a PostgreSQL para cambios de esquema

// Endpoint de test simple (solo para verificar que el servidor funciona)
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'GameZone Social API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en puerto ${PORT}`);
  console.log(`✅ Healthcheck disponible en http://localhost:${PORT}/`);
  console.log(`✅ API endpoints disponibles:`);
  console.log(`   - GET  /`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - POST /api/create-images-table`);
}); 
