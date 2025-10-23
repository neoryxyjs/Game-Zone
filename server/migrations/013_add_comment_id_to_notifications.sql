-- Agregar columna comment_id a notifications para poder navegar directamente al comentario
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE;

-- Índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_notifications_comment_id ON notifications(comment_id);

