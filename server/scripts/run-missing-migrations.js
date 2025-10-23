const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function runMissingMigrations() {
  try {
    console.log('🔍 Verificando migraciones faltantes...\n');
    
    const migrations = [
      { file: '009_create_friend_requests_table.sql', name: 'Friend Requests & Friendships' },
      { file: '014_create_messages_table.sql', name: 'Messages' },
      { file: '015_add_profile_customization.sql', name: 'Profile Customization' }
    ];

    for (const migration of migrations) {
      try {
        console.log(`📝 Ejecutando migración: ${migration.name}...`);
        
        const migrationPath = path.join(__dirname, '../migrations', migration.file);
        
        if (!fs.existsSync(migrationPath)) {
          console.log(`⚠️  Archivo no encontrado: ${migration.file}`);
          continue;
        }
        
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        await pool.query(migrationSQL);
        
        console.log(`✅ ${migration.name} - Completada\n`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  ${migration.name} - Ya existe, saltando...\n`);
        } else {
          console.error(`❌ Error en ${migration.name}:`, error.message, '\n');
        }
      }
    }
    
    // Verificar tablas creadas
    console.log('📊 Verificando tablas...\n');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('friend_requests', 'friendships', 'messages', 'user_profiles')
      ORDER BY table_name;
    `);
    
    console.log('Tablas encontradas:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    console.log('\n✅ Migraciones completadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMissingMigrations();

