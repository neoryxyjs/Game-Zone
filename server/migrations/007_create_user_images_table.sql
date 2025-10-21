-- Migración para crear tabla de imágenes de usuarios
-- Esta tabla almacena todas las imágenes subidas por los usuarios

CREATE TABLE IF NOT EXISTS user_images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    image_type VARCHAR(50) NOT NULL DEFAULT 'avatar', -- 'avatar', 'post', 'profile', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_images_type ON user_images(image_type);
CREATE INDEX IF NOT EXISTS idx_user_images_active ON user_images(is_active);

-- Comentarios para documentación
COMMENT ON TABLE user_images IS 'Tabla para almacenar información de imágenes subidas por usuarios';
COMMENT ON COLUMN user_images.user_id IS 'ID del usuario propietario de la imagen';
COMMENT ON COLUMN user_images.filename IS 'Nombre del archivo en el servidor';
COMMENT ON COLUMN user_images.original_name IS 'Nombre original del archivo subido';
COMMENT ON COLUMN user_images.file_path IS 'Ruta completa del archivo en el servidor';
COMMENT ON COLUMN user_images.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN user_images.mime_type IS 'Tipo MIME del archivo (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN user_images.image_type IS 'Tipo de imagen: avatar, post, profile, etc.';
COMMENT ON COLUMN user_images.is_active IS 'Si la imagen está activa (no eliminada)';
