// Script para probar el backend de Railway
const axios = require('axios');

async function testBackend() {
  const backendUrl = 'https://tu-url-de-railway.railway.app'; // Reemplaza con tu URL
  
  try {
    console.log('🔄 Probando conexión al backend...');
    
    // Probar endpoint principal
    const healthResponse = await axios.get(`${backendUrl}/`);
    console.log('✅ Backend respondiendo:', healthResponse.data);
    
    // Probar endpoint de registro
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123'
    };
    
    console.log('🔄 Probando registro...');
    const registerResponse = await axios.post(`${backendUrl}/api/auth/register`, testUser);
    console.log('✅ Registro exitoso:', registerResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
}

testBackend();
