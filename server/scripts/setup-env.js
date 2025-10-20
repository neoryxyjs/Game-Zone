// Script para configurar variables de entorno en Railway
console.log('🔍 Verificando variables de entorno...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('DATABASE_PUBLIC_URL:', process.env.DATABASE_PUBLIC_URL ? '✅ Configurada' : '❌ No configurada');
console.log('RIOT_API_KEY:', process.env.RIOT_API_KEY ? '✅ Configurada' : '❌ No configurada');
console.log('PORT:', process.env.PORT || 'No configurado');

// Si DATABASE_PUBLIC_URL está disponible, usarla
if (process.env.DATABASE_PUBLIC_URL && !process.env.DATABASE_URL) {
  console.log('🔄 Usando DATABASE_PUBLIC_URL como fallback');
  process.env.DATABASE_URL = process.env.DATABASE_PUBLIC_URL;
}
