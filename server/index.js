const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Configurar variables de entorno
require('./scripts/setup-env');

// Ejecutar migraciones automáticamente (no bloquea el inicio)
const { runMigrations } = require('./scripts/migrate');
runMigrations().catch(err => {
  console.log('⚠️  Migraciones fallaron, continuando sin ellas:', err.message);
});

console.log('API Key cargada:', process.env.RIOT_API_KEY);

const riotRoutes = require('./routes/riot');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: [
    'https://game-zone-9nf6g9r64-neoryxyjs-projects.vercel.app',
    'https://game-zone-zeta-eight.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json());

// Rutas
app.use('/api/riot', riotRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API de GameZone Social funcionando');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en puerto ${PORT}`);
  console.log(`✅ Healthcheck disponible en http://localhost:${PORT}/`);
  console.log(`✅ API endpoints disponibles:`);
  console.log(`   - GET  /`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - POST /api/riot/login`);
}); 
