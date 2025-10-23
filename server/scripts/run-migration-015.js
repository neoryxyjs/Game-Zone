const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('📊 Ejecutando migración 015: Profile Customization...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', '015_add_profile_customization.sql'),
      'utf8'
    );
    
    await client.query(sql);
    
    console.log('✅ Migración 015 completada exitosamente');
    console.log('📋 Campos agregados:');
    console.log('   - banner_url: Banner personalizado');
    console.log('   - discord_url, twitch_url, youtube_url, twitter_url: Redes sociales');
    console.log('   - favorite_games: Array de juegos favoritos');
    console.log('   - badges: Sistema de insignias');
    console.log('   - level, experience_points: Sistema de niveles');
    console.log('   - is_verified: Verificación de usuarios');
    console.log('   - profile_color: Color personalizado');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);

