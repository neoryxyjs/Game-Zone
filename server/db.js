const { Pool } = require('pg');

// Para producción en Railway, usa DATABASE_URL o DATABASE_PUBLIC_URL
// Para desarrollo local, usa la configuración manual
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
const connectionConfig = connectionString
  ? {
      connectionString: connectionString,
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