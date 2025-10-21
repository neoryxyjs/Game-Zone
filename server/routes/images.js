const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const pool = require('../db');
const cloudinary = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/auth');

// ⚠️ IMPORTANTE: Ahora usamos SOLO Cloudinary para almacenamiento
// Railway tiene filesystem efímero, las imágenes locales se borran en cada deploy

// Configurar multer para almacenamiento temporal en memoria
// Los archivos se suben a Cloudinary y luego se eliminan de memoria
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// Subir imagen usando Cloudinary (requiere autenticación)
router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó ninguna imagen' });
    }

    const { user_id, image_type = 'post' } = req.body;
    
    console.log('📸 Subiendo imagen a Cloudinary...');
    
    // Subir a Cloudinary usando buffer (multer memoryStorage)
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `gamezone/${image_type}s`,
          public_id: `${image_type}-${user_id}-${Date.now()}`,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });
    
    const cloudinaryResult = await uploadPromise;
    const imageUrl = cloudinaryResult.secure_url;
    
    console.log('✅ Imagen subida a Cloudinary:', imageUrl);
    
    // Guardar información de la imagen en la base de datos
    const result = await pool.query(`
      INSERT INTO user_images (user_id, filename, original_name, file_path, file_size, mime_type, image_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, filename, original_name, file_path as url, file_size, mime_type, image_type
    `, [
      user_id,
      cloudinaryResult.public_id,
      req.file.originalname,
      imageUrl,
      req.file.size,
      req.file.mimetype,
      image_type
    ]);

    res.json({
      success: true,
      image: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error);
    res.status(500).json({ success: false, message: 'Error subiendo imagen', error: error.message });
  }
});

// Obtener información de imagen por ID
// Nota: Las imágenes se sirven directamente desde Cloudinary
router.get('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const result = await pool.query(
      'SELECT id, filename, original_name, file_path as url, file_size, mime_type, image_type, created_at FROM user_images WHERE id = $1 AND is_active = true',
      [imageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    // Redirigir a la URL de Cloudinary
    res.redirect(result.rows[0].url);
  } catch (error) {
    console.error('Error obteniendo imagen:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo imagen' });
  }
});

// Eliminar imagen (requiere autenticación)
router.delete('/:imageId', authMiddleware, async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Usar req.userId del middleware de autenticación
    const userId = req.userId;

    // Verificar que el usuario es el propietario de la imagen
    const result = await pool.query(
      'SELECT * FROM user_images WHERE id = $1 AND user_id = $2 AND is_active = true',
      [imageId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada o no tienes permisos' });
    }

    const image = result.rows[0];

    // Eliminar de Cloudinary (el filename es el public_id)
    try {
      await cloudinary.uploader.destroy(image.filename);
      console.log('✅ Imagen eliminada de Cloudinary:', image.filename);
    } catch (cloudinaryError) {
      console.warn('⚠️  Error eliminando de Cloudinary:', cloudinaryError.message);
      // Continuar aunque falle Cloudinary
    }

    // Marcar como inactiva en la base de datos (soft delete)
    await pool.query('UPDATE user_images SET is_active = false WHERE id = $1', [imageId]);

    res.json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando imagen:', error);
    res.status(500).json({ success: false, message: 'Error eliminando imagen' });
  }
});

module.exports = router;
