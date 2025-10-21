# 🔐 Arquitectura de Autenticación - Rutas Públicas vs Protegidas

## 📋 Principio Fundamental

**Regla de Oro:**
- **Ver/Leer contenido** = PÚBLICO (sin autenticación)
- **Crear/Modificar/Eliminar** = PROTEGIDO (con autenticación JWT)

---

## 🌐 RUTAS PÚBLICAS (Sin Autenticación)

### Frontend: Usar `fetch()` normal
```javascript
import { API_BASE_URL } from '../../config/api';

const response = await fetch(`${API_BASE_URL}/api/endpoint`);
```

### Lista de Endpoints Públicos:

#### 1. **Perfiles de Usuarios**
```javascript
GET /api/profiles/:userId
```
- ✅ Cualquiera puede ver el perfil de un usuario
- Retorna: usuario, perfil, settings, stats

#### 2. **Posts/Feed**
```javascript
GET /api/posts/feed
GET /api/social/feed/:userId
```
- ✅ Cualquiera puede ver posts públicos
- ✅ Cualquiera puede ver posts de un usuario específico

#### 3. **Seguidores y Seguidos**
```javascript
GET /api/social/followers/:userId
GET /api/social/following/:userId
```
- ✅ Cualquiera puede ver quién sigue a quién
- Información pública como en redes sociales

#### 4. **Búsqueda de Usuarios**
```javascript
GET /api/social/search/users?q=query
```
- ✅ Búsqueda pública de usuarios
- Sin autenticación requerida

#### 5. **Usuarios en Línea**
```javascript
GET /api/online
```
- ✅ Lista pública de usuarios activos

#### 6. **Autenticación**
```javascript
POST /api/auth/register
POST /api/auth/login
```
- ✅ Endpoints de login/registro son públicos

---

## 🔒 RUTAS PROTEGIDAS (Con Autenticación JWT)

### Frontend: Usar funciones autenticadas
```javascript
import { postAuth, putAuth, deleteAuth, uploadFileAuth } from '../../utils/api';

const response = await postAuth('/api/endpoint', data);
```

### Lista de Endpoints Protegidos:

#### 1. **Crear/Modificar Posts**
```javascript
POST /api/posts                    // Crear post
PUT /api/posts/:postId            // Editar post
DELETE /api/posts/:postId         // Eliminar post
POST /api/posts/:postId/like      // Like en post
POST /api/posts/:postId/comment   // Comentar post
```
- 🔒 Requiere JWT
- Backend valida con `authMiddleware`

#### 2. **Seguir/Dejar de Seguir**
```javascript
POST /api/social/follow           // Seguir usuario
POST /api/social/unfollow         // Dejar de seguir
```
- 🔒 Requiere JWT
- Solo usuarios autenticados pueden seguir

#### 3. **Modificar Perfil**
```javascript
PUT /api/profiles/:userId                    // Actualizar perfil
PUT /api/profiles/:userId/settings           // Actualizar settings
PUT /api/profiles/:userId/avatar             // Cambiar avatar
POST /api/profiles/upload-post-image         // Subir imagen de post
```
- 🔒 Requiere JWT
- Solo el dueño puede modificar su perfil

#### 4. **Notificaciones**
```javascript
GET /api/notifications/:userId               // Leer notificaciones
POST /api/notifications/create               // Crear notificación
PUT /api/notifications/:notificationId/read  // Marcar como leída
```
- 🔒 Requiere JWT
- Datos privados del usuario

#### 5. **Imágenes**
```javascript
POST /api/images                  // Subir imagen
DELETE /api/images/:imageId       // Eliminar imagen
```
- 🔒 Requiere JWT
- Solo el dueño puede eliminar sus imágenes

---

## 🎯 Implementación en el Código

### Frontend - Componentes

#### UserProfile.jsx ✅
```javascript
// PÚBLICO - Ver perfil de otros
const userResponse = await fetch(`${API_BASE_URL}/api/profiles/${userId}`);

// PROTEGIDO - Seguir usuario
const response = await postAuth('/api/social/follow', { ... });
```

#### FollowingList.jsx ✅
```javascript
// PÚBLICO - Ver seguidores/seguidos
const response = await fetch(`${API_BASE_URL}/api/social/following/${userId}`);

// PROTEGIDO - Dejar de seguir
const response = await postAuth('/api/social/unfollow', { ... });
```

#### UserSearch.jsx ✅
```javascript
// PÚBLICO - Buscar usuarios
const response = await fetch(`${API_BASE_URL}/api/social/search/users?q=${query}`);

// PROTEGIDO - Seguir usuario
const response = await postAuth('/api/social/follow', { ... });
```

#### Feed.jsx ✅
```javascript
// PÚBLICO - Cargar posts
const response = await fetch(`${API_BASE_URL}/api/posts/feed`);

// PROTEGIDO - Like, comentar, eliminar
const response = await postAuth(`/api/posts/${postId}/like`, { ... });
const response = await deleteAuth(`/api/posts/${postId}`);
```

#### CreatePost.jsx ✅
```javascript
// PROTEGIDO - Crear post
const response = await postAuth('/api/posts', { ... });
```

#### ImageUpload.jsx ✅
```javascript
// PROTEGIDO - Subir imagen
const response = await uploadFileAuth('/api/profiles/upload-post-image', formData);
```

#### SettingsPage.jsx ✅
```javascript
// PROTEGIDO - Actualizar perfil y avatar
const response = await putAuth(`/api/profiles/${userId}`, data);
const response = await uploadFileAuth(`/api/profiles/${userId}/avatar`, formData, 'PUT');
```

#### RealTimeNotifications.jsx ✅
```javascript
// PROTEGIDO - Notificaciones privadas del usuario
const response = await fetchAuth(`/api/notifications/${user.id}`);
const response = await putAuth(`/api/notifications/${id}/read`, {});
```

---

### Backend - Rutas Protegidas

#### routes/posts.js
```javascript
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => { ... });          // Crear
router.put('/:postId', authMiddleware, async (req, res) => { ... });    // Editar
router.delete('/:postId', authMiddleware, async (req, res) => { ... }); // Eliminar
router.post('/:postId/like', authMiddleware, async (req, res) => { ... });
```

#### routes/social.js
```javascript
router.post('/follow', authMiddleware, async (req, res) => { ... });
router.post('/unfollow', authMiddleware, async (req, res) => { ... });

// PÚBLICO - Sin authMiddleware
router.get('/followers/:userId', async (req, res) => { ... });
router.get('/following/:userId', async (req, res) => { ... });
router.get('/feed/:userId', async (req, res) => { ... });
router.get('/search/users', async (req, res) => { ... });
```

#### routes/profiles.js
```javascript
// PÚBLICO - Ver perfil
router.get('/:userId', async (req, res) => { ... });

// PROTEGIDO - Modificar perfil
router.put('/:userId', authMiddleware, async (req, res) => { ... });
router.put('/:userId/settings', authMiddleware, async (req, res) => { ... });
router.put('/:userId/avatar', authMiddleware, upload.single('avatar'), async (req, res) => { ... });
router.post('/upload-post-image', authMiddleware, upload.single('image'), async (req, res) => { ... });
```

#### routes/notifications.js
```javascript
// TODAS PROTEGIDAS - Datos privados
router.get('/:userId', authMiddleware, async (req, res) => { ... });
router.put('/:notificationId/read', authMiddleware, async (req, res) => { ... });
router.get('/:userId/unread-count', authMiddleware, async (req, res) => { ... });
```

---

## ✅ Ventajas de Esta Arquitectura

### 1. **UX Mejorada**
- ✅ Cualquiera puede explorar perfiles sin registrarse
- ✅ Los visitantes pueden ver contenido antes de crear cuenta
- ✅ Similar a Twitter, Instagram, Facebook

### 2. **Seguridad**
- ✅ Solo usuarios autenticados pueden crear/modificar
- ✅ JWT valida identidad en acciones sensibles
- ✅ No se exponen datos privados (notificaciones, settings)

### 3. **SEO Amigable**
- ✅ Perfiles y posts son indexables por buscadores
- ✅ Mejor descubrimiento de contenido

### 4. **Escalabilidad**
- ✅ Rutas públicas pueden usar caché (CDN)
- ✅ Menos carga en validación de tokens
- ✅ Mejor performance general

---

## 🔍 Cómo Identificar el Tipo de Ruta

### ❓ Pregúntate:

1. **¿Esta acción MODIFICA datos?**
   - ✅ SÍ → Protegida (POST/PUT/DELETE con authMiddleware)
   - ❌ NO → Probablemente pública

2. **¿Esta acción es PERSONAL/PRIVADA?**
   - ✅ SÍ → Protegida (notificaciones, settings personales)
   - ❌ NO → Pública (perfiles, posts públicos)

3. **¿Necesito saber QUIÉN está haciendo esta acción?**
   - ✅ SÍ → Protegida (necesitas `req.userId` del token)
   - ❌ NO → Pública

---

## 🚨 Errores Comunes CORREGIDOS

### ❌ ANTES (Incorrecto):
```javascript
// Error: Ver perfil requería autenticación
const response = await fetchAuth(`/api/profiles/${userId}`);
// Resultado: 401 Unauthorized al ver otros perfiles
```

### ✅ AHORA (Correcto):
```javascript
// Ver perfil es PÚBLICO
const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}`);

// Seguir usuario es PROTEGIDO
const response = await postAuth('/api/social/follow', { ... });
```

---

## 📊 Resumen de Cambios

### Componentes Modificados:
1. ✅ **UserProfile.jsx** - Ver perfiles ahora público
2. ✅ **FollowingList.jsx** - Ver seguidores/seguidos ahora público
3. ✅ **UserSearch.jsx** - Búsqueda ahora pública
4. ✅ **Feed.jsx** - Ya estaba correcto
5. ✅ **OnlineUsers.jsx** - Ya estaba correcto
6. ✅ **CreatePost.jsx** - Protegido (correcto)
7. ✅ **ImageUpload.jsx** - Protegido (correcto)
8. ✅ **SettingsPage.jsx** - Protegido (correcto)
9. ✅ **RealTimeNotifications.jsx** - Protegido (correcto)

---

## 🎉 Resultado Final

**Ahora puedes:**
- ✅ Ver perfiles de otros usuarios sin error 401
- ✅ Explorar posts sin estar autenticado
- ✅ Buscar usuarios libremente
- ✅ Ver seguidores/seguidos de cualquier usuario
- 🔒 Solo las ACCIONES requieren autenticación

**Sistema completamente funcional y con la arquitectura correcta** 🚀

---

**Fecha:** 21 de Octubre, 2025  
**Commit:** `Fix CRITICO: Separar rutas publicas de rutas autenticadas`

