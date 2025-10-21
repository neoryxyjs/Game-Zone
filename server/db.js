const { Pool } = require('pg');

// Para producción en Railway, usa DATABASE_URL o DATABASE_PUBLIC_URL
// Para desarrollo local, usa variables de entorno
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

let connectionConfig;

if (connectionString) {
  // Configuración para Railway/producción con DATABASE_URL
  connectionConfig = {
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  // Configuración para desarrollo local con variables de entorno
  connectionConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'gamezone_social',
    password: process.env.DB_PASSWORD, // ⚠️ IMPORTANTE: Definir en .env
    port: parseInt(process.env.DB_PORT || '5432'),
  };
  
  // Validar que la contraseña esté configurada en desarrollo
  if (!process.env.DB_PASSWORD) {
    console.warn('⚠️  ADVERTENCIA: DB_PASSWORD no está configurada en las variables de entorno');
    console.warn('⚠️  Por favor crea un archivo .env con las credenciales de tu base de datos local');
  }
}

// Configurar pool con límites para Railway
const pool = new Pool({
  ...connectionConfig,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
  connectionTimeoutMillis: 2000, // Timeout de conexión
});

// Probar la conexión
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.stack);
  } else {
    console.log('✅ Conectado a PostgreSQL');
    release();
  }
});

module.exports = pool;