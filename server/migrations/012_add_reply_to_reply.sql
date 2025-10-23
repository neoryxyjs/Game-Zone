-- Agregar columna para permitir responder a respuestas
ALTER TABLE comment_replies 
ADD COLUMN IF NOT EXISTS reply_to_reply_id INTEGER REFERENCES comment_replies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS reply_to_username VARCHAR(255);

-- Índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_comment_replies_reply_to_reply_id ON comment_replies(reply_to_reply_id);

