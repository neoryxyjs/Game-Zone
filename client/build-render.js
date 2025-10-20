#!/usr/bin/env node

// Script de build optimizado para Render
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Render...');

try {
  // Configurar variables de entorno
  process.env.NODE_ENV = 'production';
  process.env.GENERATE_SOURCEMAP = 'false';
  process.env.CI = 'false';

  // Instalar dependencias
  console.log('📦 Instalando dependencias...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname) });

  // Ejecutar build
  console.log('🔨 Ejecutando build...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname) });

  // Verificar que el build se completó
  const buildPath = path.join(__dirname, 'build');
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build completado exitosamente');
    console.log('📁 Archivos generados en:', buildPath);
    
    // Listar archivos generados
    const files = fs.readdirSync(buildPath);
    console.log('📄 Archivos generados:', files.length);
  } else {
    throw new Error('❌ Build falló - directorio build no encontrado');
  }

} catch (error) {
  console.error('❌ Error en el build:', error.message);
  process.exit(1);
}
