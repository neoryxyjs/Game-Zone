const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración 010: user_profiles y user_follows...');
    
    const migrationPath = path.join(__dirname, '../migrations/010_create_user_profiles_and_follows.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migración 010 completada exitosamente');
    console.log('✅ Tablas creadas:');
    console.log('   - user_profiles');
    console.log('   - user_follows');
    console.log('   - user_settings');
    console.log('   - user_stats');
  } catch (error) {
    console.error('❌ Error ejecutando migración 010:', error);
    throw error;
  }
}

runMigration().catch(err => {
  console.error('❌ Migración 010 falló:', err);
  process.exit(1);
});

