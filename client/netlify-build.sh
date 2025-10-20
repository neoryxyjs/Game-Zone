#!/bin/bash

# Script de build optimizado para Netlify
echo "🚀 Iniciando build para Netlify..."

# Configurar variables de entorno
export CI=false
export GENERATE_SOURCEMAP=false
export NODE_OPTIONS="--max_old_space_size=4096"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Ejecutar build
echo "🔨 Ejecutando build..."
npm run build

echo "✅ Build completado"
