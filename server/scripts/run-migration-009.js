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
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

runMigration();

