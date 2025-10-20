const { Pool } = require('pg');
const fs = require('fs');

// Configuración para tu base de datos local (pgAdmin)
const localPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gamezone_social',
  password: 'qwerty',
  port: 5432,
});

async function exportUsers() {
  try {
    console.log('🔄 Exporting users from local database...');
    
    // Obtener todos los usuarios
    const result = await localPool.query('SELECT * FROM users');
    const users = result.rows;
    
    console.log(`📊 Found ${users.length} users to export`);
    
    // Crear script SQL con los datos
    let sqlScript = '-- Users data migration\n';
    sqlScript += '-- Generated automatically\n\n';
    
    if (users.length > 0) {
      sqlScript += '-- Insert users data\n';
      sqlScript += 'INSERT INTO users (username, email, password, created_at) VALUES\n';
      
      const values = users.map(user => {
        const username = user.username.replace(/'/g, "''");
        const email = user.email.replace(/'/g, "''");
        const password = user.password.replace(/'/g, "''");
        const createdAt = user.created_at ? `'${user.created_at.toISOString()}'` : 'CURRENT_TIMESTAMP';
        
        return `('${username}', '${email}', '${password}', ${createdAt})`;
      });
      
      sqlScript += values.join(',\n');
      sqlScript += ';\n\n';
    }
    
    // Guardar en archivo
    fs.writeFileSync('migrations/002_insert_users_data.sql', sqlScript);
    console.log('✅ Users data exported to server/migrations/002_insert_users_data.sql');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await localPool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  exportUsers();
}

module.exports = { exportUsers };
