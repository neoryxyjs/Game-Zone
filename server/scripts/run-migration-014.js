const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Ejecutando migración 014: Crear tabla de mensajes privados...');
    
    const migrationPath = path.join(__dirname, '../migrations/014_create_messages_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migración 014 ejecutada exitosamente');
    console.log('Tabla "messages" creada con éxito');
    
    // Verificar la tabla creada
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'messages'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nColumnas de la tabla messages:');
    console.table(result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

runMigration();

