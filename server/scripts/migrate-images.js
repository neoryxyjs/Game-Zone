const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gamezone'
});

async function runImageMigration() {
  try {
    console.log('🔄 Iniciando migración de tabla de imágenes...');
    
    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, '../migrations/007_create_user_images_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Ejecutar la migración
    await pool.query(sql);
    
    console.log('✅ Migración de tabla de imágenes completada exitosamente');
    
    // Verificar que la tabla se creó correctamente
    const result = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_images' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de la tabla user_images:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error ejecutando migración de imágenes:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runImageMigration()
    .then(() => {
      console.log('🎉 Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en migración:', error);
      process.exit(1);
    });
}

module.exports = { runImageMigration };
