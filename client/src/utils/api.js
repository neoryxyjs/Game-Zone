// Utilidad para hacer peticiones autenticadas a la API
import { API_BASE_URL } from '../config/api';

/**
 * Manejar errores HTTP y redirigir a páginas de error
 */
const handleHttpError = (response) => {
  if (!response.ok) {
    switch (response.status) {
      case 403:
        window.location.href = '/error/403';
        throw new Error('Acceso denegado');
      case 404:
        // No redirigir automáticamente en 404, dejar que el componente lo maneje
        throw new Error('Recurso no encontrado');
      case 500:
      case 502:
      case 503:
        window.location.href = '/error/500';
        throw new Error('Error del servidor');
      case 401:
        // Token expirado o inválido
        localStorage.removeItem('authToken');
        if (window.location.pathname !== '/auth' && window.location.pathname !== '/login') {
          window.location.href = '/auth';
        }
        throw new Error('No autenticado');
      default:
        if (response.status >= 500) {
          window.location.href = '/error/500';
        }
        throw new Error(`Error HTTP ${response.status}`);
    }
  }
  return response;
};

/**
 * Obtener el token JWT del localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Crear headers con autenticación JWT
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Petición GET autenticada
 */
export const fetchAuth = async (endpoint, options = {}) => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    
    return handleHttpError(response);
  } catch (error) {
    console.error('Error en fetchAuth:', error);
    throw error;
  }
};

/**
 * Petición POST autenticada
 */
export const postAuth = async (endpoint, data = {}, options = {}) => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
    
    return handleHttpError(response);
  } catch (error) {
    console.error('Error en postAuth:', error);
    throw error;
  }
};

/**
 * Petición PUT autenticada
 */
export const putAuth = async (endpoint, data = {}, options = {}) => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
    
    return handleHttpError(response);
  } catch (error) {
    console.error('Error en putAuth:', error);
    throw error;
  }
};

/**
 * Petición DELETE autenticada
 */
export const deleteAuth = async (endpoint, options = {}) => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });
    
    return handleHttpError(response);
  } catch (error) {
    console.error('Error en deleteAuth:', error);
    throw error;
  }
};

/**
 * Upload de archivo con autenticación
 */
export const uploadFileAuth = async (endpoint, formData, options = {}) => {
  try {
    const token = getAuthToken();
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        ...options.headers,
      },
      body: formData,
      ...options,
    });
    
    return handleHttpError(response);
  } catch (error) {
    console.error('Error en uploadFileAuth:', error);
    throw error;
  }
};

