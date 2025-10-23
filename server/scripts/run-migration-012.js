const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración 012: reply_to_reply...');
    
    const migrationPath = path.join(__dirname, '../migrations/012_add_reply_to_reply.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migración 012 completada exitosamente');
    console.log('   - Agregada columna reply_to_reply_id a comment_replies');
    console.log('   - Agregada columna reply_to_username a comment_replies');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración 012:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();

