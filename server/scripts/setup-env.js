// Script para configurar variables de entorno en Railway
console.log('🔍 Verificando variables de entorno...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('DATABASE_PUBLIC_URL:', process.env.DATABASE_PUBLIC_URL ? '✅ Configurada' : '❌ No configurada');
console.log('PORT:', process.env.PORT || 'No configurado');

// Forzar el uso de DATABASE_PUBLIC_URL si está disponible
if (process.env.DATABASE_PUBLIC_URL) {
  console.log('🔄 Configurando DATABASE_URL con DATABASE_PUBLIC_URL');
  process.env.DATABASE_URL = process.env.DATABASE_PUBLIC_URL;
  console.log('✅ DATABASE_URL configurada:', process.env.DATABASE_URL ? 'Sí' : 'No');
} else {
  console.log('❌ DATABASE_PUBLIC_URL no está disponible');
}
