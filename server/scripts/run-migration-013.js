const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración 013: add_comment_id_to_notifications...');
    
    const migrationPath = path.join(__dirname, '../migrations/013_add_comment_id_to_notifications.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migración 013 completada exitosamente');
    console.log('   - Columna comment_id agregada a notifications');
  } catch (error) {
    console.error('❌ Error ejecutando migración 013:', error);
    throw error;
  }
}

runMigration().catch(err => {
  console.error('❌ Migración 013 falló:', err);
  process.exit(1);
});

