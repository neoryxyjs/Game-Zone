// Configuración de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://game-zone-production-6354.up.railway.app' 
    : 'http://localhost:8080');

// FORZAR URL CORRECTA EN PRODUCCIÓN
const PRODUCTION_API_URL = 'https://game-zone-production-6354.up.railway.app';
const FINAL_API_URL = process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : API_BASE_URL;

// Debug: Mostrar la URL que se está usando
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 FINAL_API_URL:', FINAL_API_URL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${FINAL_API_URL}/api/auth/login`,
    REGISTER: `${FINAL_API_URL}/api/auth/register`,
  }
};

export default API_BASE_URL;
