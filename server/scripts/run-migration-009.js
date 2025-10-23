const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración 009: friend_requests y friendships...');
    
    const migrationPath = path.join(__dirname, '../migrations/009_create_friend_requests_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migración 009 completada exitosamente');
    console.log('✅ Tablas creadas:');
    console.log('   - friend_requests');
    console.log('   - friendships');
  } catch (error) {
    console.error('❌ Error ejecutando migración 009:', error);
    throw error;
  }
}

runMigration().catch(err => {
  console.error('❌ Migración 009 falló:', err);
  process.exit(1);
});

