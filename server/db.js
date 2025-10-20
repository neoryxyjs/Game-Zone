const { Pool } = require('pg');

// Para producción en Railway, usa DATABASE_URL de las variables de entorno
// Para desarrollo local, usa la configuración manual
const connectionConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      user: 'postgres',
      host: 'localhost',
      database: 'gamezone_social', 
      password: 'qwerty',
      port: 5432,
    };

const pool = new Pool(connectionConfig);

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