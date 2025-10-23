const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runAllMigrations() {
  try {
    // Migración 009: friend_requests y friendships
    console.log('🚀 Ejecutando migración 009: friend_requests y friendships...');
    const migration009Path = path.join(__dirname, '../migrations/009_create_friend_requests_table.sql');
    const sql009 = fs.readFileSync(migration009Path, 'utf8');
    await pool.query(sql009);
    console.log('✅ Migración 009 completada exitosamente');
    console.log('   - friend_requests');
    console.log('   - friendships');
    
    // Migración 010: user_profiles, user_follows, user_settings, user_stats
    console.log('\n🚀 Ejecutando migración 010: user_profiles y user_follows...');
    const migration010Path = path.join(__dirname, '../migrations/010_create_user_profiles_and_follows.sql');
    const sql010 = fs.readFileSync(migration010Path, 'utf8');
    await pool.query(sql010);
    console.log('✅ Migración 010 completada exitosamente');
    console.log('   - user_profiles');
    console.log('   - user_follows');
    console.log('   - user_settings');
    console.log('   - user_stats');
    
    console.log('\n✅ Todas las migraciones completadas exitosamente!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    await pool.end();
    process.exit(1);
  }
}

runAllMigrations();

