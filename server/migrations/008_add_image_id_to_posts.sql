-- Migración para agregar referencia de imagen a posts
-- Esto permite asociar posts con imágenes de la tabla user_images

-- Agregar columna image_id a posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_id INTEGER REFERENCES user_images(id) ON DELETE SET NULL;

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_posts_image_id ON posts(image_id);

-- Comentarios para documentación
COMMENT ON COLUMN posts.image_id IS 'ID de la imagen asociada al post (referencia a user_images)';

