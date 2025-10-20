#!/usr/bin/env node

// Script de build optimizado para Netlify
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Netlify...');

try {
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
  } else {
    throw new Error('❌ Build falló - directorio build no encontrado');
  }

} catch (error) {
  console.error('❌ Error en el build:', error.message);
  process.exit(1);
}
