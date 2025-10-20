// Script para verificar variables de entorno
console.log('🔍 Verificando variables de entorno...');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ Faltante');
console.log('RIOT_API_KEY:', process.env.RIOT_API_KEY ? '✅ Configurada' : '❌ Faltante');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Verificar conexión a base de datos
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  pool.connect((err, client, release) => {
    if (err) {
      console.error('❌ Error conectando a la base de datos:', err.message);
    } else {
      console.log('✅ Conexión a base de datos exitosa');
      release();
    }
  });
}
