const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración 011: comment_replies...');
    
    const migrationPath = path.join(__dirname, '../migrations/011_create_comment_replies.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migración 011 completada exitosamente');
    console.log('   - comment_replies');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración 011:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();

