// Configuración de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  RIOT: {
    LOGIN: `${API_BASE_URL}/api/riot/login`,
    RIOT_LOGIN: `${API_BASE_URL}/api/riot/riot-login`,
    LOL: (summonerName) => `${API_BASE_URL}/api/riot/lol/${encodeURIComponent(summonerName)}`,
  }
};

export default API_BASE_URL;
