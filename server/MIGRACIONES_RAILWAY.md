# Ejecutar Migraciones en Railway

## Pasos para ejecutar las migraciones

### Opción 1: Desde Railway CLI

```bash
# Instalar Railway CLI si no lo tienes
npm install -g @railway/cli

# Login a Railway
railway login

# Conectarte a tu proyecto
railway link

# Ejecutar migración 009 (friend_requests y friendships)
railway run npm run migrate:009

# Ejecutar migración 010 (user_profiles, user_follows, user_settings, user_stats)
railway run npm run migrate:010

# O ejecutar ambas a la vez
railway run npm run migrate:all
```

### Opción 2: Desde la interfaz web de Railway

1. Ve a tu proyecto en Railway
2. Ve a la pestaña "Settings"
3. En "Service Settings", busca "Custom Start Command"
4. Temporalmente cambia el comando a: `npm run migrate:all && npm start`
5. Guarda y espera a que se ejecute
6. Luego regresa el comando a: `npm start`

### Opción 3: Conectarse directamente a PostgreSQL

1. Obtén las credenciales de PostgreSQL desde Railway
2. Conéctate usando psql o cualquier cliente de PostgreSQL
3. Ejecuta los archivos SQL manualmente:
   - `server/migrations/009_create_friend_requests_table.sql`
   - `server/migrations/010_create_user_profiles_and_follows.sql`

## Tablas que se crearán

### Migración 009:
- `friend_requests` - Solicitudes de amistad
- `friendships` - Amistades establecidas

### Migración 010:
- `user_profiles` - Perfiles extendidos de usuarios
- `user_follows` - Relaciones de seguimiento entre usuarios
- `user_settings` - Configuraciones de usuario
- `user_stats` - Estadísticas de usuario

## Verificar que las migraciones se ejecutaron

Conéctate a tu base de datos y ejecuta:

```sql
-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Contar registros en cada tabla nueva
SELECT 
  (SELECT COUNT(*) FROM user_profiles) as profiles,
  (SELECT COUNT(*) FROM user_follows) as follows,
  (SELECT COUNT(*) FROM friend_requests) as requests,
  (SELECT COUNT(*) FROM friendships) as friendships,
  (SELECT COUNT(*) FROM user_settings) as settings,
  (SELECT COUNT(*) FROM user_stats) as stats;
```

## Solución de problemas

Si las tablas ya existen, las migraciones no harán nada (tienen `CREATE TABLE IF NOT EXISTS`).

Si hay errores, revisa los logs de Railway o ejecuta las migraciones manualmente.

