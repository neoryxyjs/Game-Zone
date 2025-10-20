// Configuración de la API - URL fija para producción
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://game-zone-production-6354.up.railway.app'
  : (process.env.REACT_APP_API_URL || 'http://localhost:8080');

// Debug: Mostrar la URL que se está usando
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  }
};

export default API_BASE_URL;
