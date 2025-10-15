const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('API Key cargada:', process.env.RIOT_API_KEY);

const riotRoutes = require('./routes/riot');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/riot', riotRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API de GameZone Social funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
}); 
