# GameZone Social Backend

Backend API para GameZone Social desarrollado con Node.js, Express y PostgreSQL.

## Variables de entorno requeridas

- `DATABASE_URL`: URL de conexión a PostgreSQL (proporcionada automáticamente por Railway)
- `PORT`: Puerto del servidor (por defecto 5000)
- `RIOT_API_KEY`: API Key de Riot Games

## Endpoints

- `GET /` - Health check
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login de usuarios
- `GET /api/riot/*` - Endpoints de Riot API

## Despliegue en Railway

1. Conecta tu repositorio de GitHub a Railway
2. Railway detectará automáticamente que es un proyecto Node.js
3. Añade la variable `RIOT_API_KEY` en el dashboard de Railway
4. Railway creará automáticamente una base de datos PostgreSQL
5. El despliegue se realizará automáticamente
