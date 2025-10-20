const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pool = require('../db');

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
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

// Subir imagen
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó ninguna imagen' });
    }

    const { user_id, post_id } = req.body;
    
    // Guardar información de la imagen en la base de datos
    const result = await pool.query(
      'INSERT INTO images (user_id, post_id, filename, original_name, file_path, file_size, mime_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        user_id,
        post_id,
        req.file.filename,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype
      ]
    );

    // URL pública de la imagen
    const imageUrl = `/api/images/${result.rows[0].id}`;

    res.json({
      success: true,
      image: {
        id: result.rows[0].id,
        filename: result.rows[0].filename,
        original_name: result.rows[0].original_name,
        url: imageUrl,
        size: result.rows[0].file_size,
        mime_type: result.rows[0].mime_type
      }
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({ success: false, message: 'Error subiendo imagen' });
  }
});

// Obtener imagen por ID
router.get('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM images WHERE id = $1',
      [imageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    const image = result.rows[0];
    const imagePath = path.join(__dirname, '../uploads', image.filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ success: false, message: 'Archivo de imagen no encontrado' });
    }

    res.setHeader('Content-Type', image.mime_type);
    res.setHeader('Content-Length', image.file_size);
    res.sendFile(path.resolve(imagePath));
  } catch (error) {
    console.error('Error obteniendo imagen:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo imagen' });
  }
});

// Eliminar imagen
router.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { user_id } = req.body;

    // Verificar que el usuario es el propietario de la imagen
    const result = await pool.query(
      'SELECT * FROM images WHERE id = $1 AND user_id = $2',
      [imageId, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada o no tienes permisos' });
    }

    const image = result.rows[0];
    const imagePath = path.join(__dirname, '../uploads', image.filename);

    // Eliminar archivo del sistema de archivos
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Eliminar registro de la base de datos
    await pool.query('DELETE FROM images WHERE id = $1', [imageId]);

    res.json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({ success: false, message: 'Error eliminando imagen' });
  }
});

module.exports = router;
