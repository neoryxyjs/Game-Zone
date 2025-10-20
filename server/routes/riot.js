const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// Endpoint para League of Legends y Riot ID global
router.get('/lol/:summonerName', async (req, res) => {
  let { summonerName } = req.params;
  console.log('Consultando Riot API para:', summonerName);
  console.log('API Key configurada:', !!process.env.RIOT_API_KEY);

  if (!process.env.RIOT_API_KEY) {
    return res.status(500).json({
      error: 'API Key de Riot no configurada',
      details: 'Agrega RIOT_API_KEY en tu archivo .env'
    });
  }

  try {
    let summoner = null;
    // Si el nombre contiene #, usar Account-V1
    if (summonerName.includes('#')) {
      const [gameName, tagLine] = summonerName.split('#');
      console.log('Usando Account-V1 para', gameName, tagLine);
      // 1. Buscar por gameName y tagLine
      const accountRes = await axios.get(
        `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
      );
      const account = accountRes.data;
      // 2. Buscar datos de LoL por puuid
      const summonerRes = await axios.get(
        `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
        { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
      );
      summoner = summonerRes.data;
    } else {
      // Flujo clásico: buscar por nombre de invocador de LoL
      const summonerRes = await axios.get(
        `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
        { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
      );
      summoner = summonerRes.data;
    }
    // Obtener estadísticas de ranked
    const rankedRes = await axios.get(
      `https://la2.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
      { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
    );
    const ranked = rankedRes.data;
    res.json({ summoner, ranked });
  } catch (err) {
    console.error('Error en Riot API:', err.response?.status, err.response?.data || err.message);
    if (err.response?.status === 404) {
      return res.status(404).json({
        error: 'Invocador no encontrado',
        details: `No se encontró el invocador "${summonerName}" en la región LA2 o con ese Riot ID.`
      });
    }
    if (err.response?.status === 403) {
      return res.status(403).json({
        error: 'API Key inválida',
        details: 'Tu API Key de Riot no es válida o ha expirado'
      });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit excedido',
        details: 'Has excedido el límite de consultas a la API de Riot'
      });
    }
    res.status(500).json({
      error: 'Error al consultar Riot API',
      details: err.response?.data?.status?.message || err.message
    });
  }
});

// Endpoint para iniciar login con Riot Games
router.get('/login', (req, res) => {
  const redirect = `https://auth.riotgames.com/authorize?client_id=${process.env.RIOT_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.RIOT_REDIRECT_URI)}&response_type=code&scope=openid`;
  res.redirect(redirect);
});

// Callback de Riot Games OAuth2
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    // Intercambiar el código por un access token
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', process.env.RIOT_REDIRECT_URI);
    params.append('client_id', process.env.RIOT_CLIENT_ID);
    params.append('client_secret', process.env.RIOT_CLIENT_SECRET);

    const tokenRes = await axios.post('https://auth.riotgames.com/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { access_token } = tokenRes.data;

    // Obtener el perfil del usuario (incluye el sub, que es el Riot ID único)
    const userRes = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const puuid = userRes.data.sub;

    // Obtener el nombre de invocador real usando el puuid
    const summonerRes = await axios.get(
      `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': process.env.RIOT_API_KEY } }
    );
    const summonerName = summonerRes.data.name;

    // Redirigir al frontend con el Riot ID y el nombre de invocador
    res.redirect(`http://localhost:3000/auth/riot-success?riotId=${puuid}&username=${encodeURIComponent(summonerName)}`);
  } catch (err) {
    res.status(400).json({ error: 'No se pudo autenticar con Riot', details: err.message });
  }
});

module.exports = router; 