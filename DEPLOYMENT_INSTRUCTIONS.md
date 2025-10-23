# 📋 Instrucciones de Despliegue - GameZone Social

## 🚀 Deploy en Railway

### Primer Deploy o cuando hay nuevas migraciones:

1. **Ejecutar migraciones manualmente:**
   ```bash
   npm run migrate:missing
   ```

2. **Verificar que se crearon las tablas:**
   Las migraciones crean estas tablas:
   - `friend_requests` - Solicitudes de amistad
   - `friendships` - Relaciones de amistad
   - `messages` - Mensajes privados

3. **Reiniciar el servicio** (si es necesario)

---

## 🔧 Comandos Disponibles

### Migraciones:
- `npm run migrate:missing` - Ejecuta migraciones 009 y 014 (amigos y mensajes)
- `npm run migrate:009` - Solo friend_requests y friendships
- `npm run migrate:014` - Solo messages
- `npm run migrate:all` - Todas las migraciones

### Servidor:
- `npm start` - Inicia servidor (ejecuta migraciones automáticamente)
- `npm run dev` - Desarrollo (sin migraciones automáticas)

---

## ⚠️ Errores Comunes

### Error 500 en `/api/friends/request`
**Causa:** Tabla `friendships` no existe  
**Solución:** Ejecutar `npm run migrate:missing`

### Error 401 en endpoints protegidos
**Causa:** Token de autenticación no válido  
**Solución:** Cerrar sesión y volver a iniciar sesión

---

## 📊 Verificar Estado de la Base de Datos

Conéctate a PostgreSQL y ejecuta:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('friend_requests', 'friendships', 'messages');
```

Deberías ver las 3 tablas listadas.

