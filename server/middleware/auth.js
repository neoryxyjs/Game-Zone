const jwt = require('jsonwebtoken');

// Obtener JWT_SECRET de variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;

// Verificar que existe el secreto
if (!JWT_SECRET) {
  console.error('❌ ERROR CRÍTICO: JWT_SECRET no está configurado en las variables de entorno');
  console.error('⚠️  Por favor configura JWT_SECRET en Railway antes de desplegar');
  console.error('⚠️  La autenticación NO FUNCIONARÁ hasta que lo configures');
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  USANDO SECRETO TEMPORAL - ESTO NO ES SEGURO EN PRODUCCIÓN');
  }
}

/**
 * Middleware de autenticación JWT
 * Verifica que el usuario tenga un token válido en el header Authorization
 */
const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No se proporcionó token de autorización');
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticación no proporcionado' 
      });
    }
    
    // Extraer el token (remover 'Bearer ')
    const token = authHeader.substring(7);
    console.log('🔑 Token recibido (primeros 20 chars):', token.substring(0, 20) + '...');
    console.log('🔐 JWT_SECRET configurado:', JWT_SECRET ? 'SÍ' : 'NO (usando fallback)');
    
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET || 'tu-clave-secreta-super-segura-2024');
    
    console.log('✅ Token válido para usuario:', decoded.userId, decoded.username);
    
    // Agregar información del usuario a la request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.username = decoded.username;
    
    // Continuar con la siguiente función
    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error.message);
    console.error('❌ Tipo de error:', error.name);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado. Por favor inicia sesión nuevamente' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Error de autenticación' 
    });
  }
};

/**
 * Middleware opcional - No falla si no hay token
 * Útil para endpoints que pueden funcionar con o sin autenticación
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET || 'tu-clave-secreta-super-segura-2024');
      
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.username = decoded.username;
    }
    
    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin usuario autenticado
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};

