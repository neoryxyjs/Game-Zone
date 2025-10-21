// Utilidad para hacer peticiones autenticadas a la API
import { API_BASE_URL } from '../config/api';

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
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  
  return response;
};

/**
 * Petición POST autenticada
 */
export const postAuth = async (endpoint, data = {}, options = {}) => {
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
  
  return response;
};

/**
 * Petición PUT autenticada
 */
export const putAuth = async (endpoint, data = {}, options = {}) => {
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
  
  return response;
};

/**
 * Petición DELETE autenticada
 */
export const deleteAuth = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  });
  
  return response;
};

/**
 * Upload de archivo con autenticación
 */
export const uploadFileAuth = async (endpoint, formData, options = {}) => {
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
  
  return response;
};

