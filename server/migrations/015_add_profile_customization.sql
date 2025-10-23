-- Agregar campos de personalización a user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS discord_url TEXT,
ADD COLUMN IF NOT EXISTS twitch_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS favorite_games TEXT[], -- Array de juegos favoritos
ADD COLUMN IF NOT EXISTS badges TEXT[], -- Array de badges: verified, pro, streamer, etc
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_color VARCHAR(7) DEFAULT '#6366f1', -- Color personalizado del perfil
ADD COLUMN IF NOT EXISTS banner_position_x DECIMAL(5,2) DEFAULT 0, -- Posición X del banner en porcentaje
ADD COLUMN IF NOT EXISTS banner_position_y DECIMAL(5,2) DEFAULT 0, -- Posición Y del banner en porcentaje
ADD COLUMN IF NOT EXISTS banner_scale DECIMAL(3,2) DEFAULT 1; -- Escala/zoom del banner (1.0 - 3.0)

-- Crear índice para búsquedas de badges
CREATE INDEX IF NOT EXISTS idx_user_profiles_badges ON user_profiles USING GIN (badges);

-- Comentarios para documentación
COMMENT ON COLUMN user_profiles.banner_url IS 'URL de la imagen de portada del perfil';
COMMENT ON COLUMN user_profiles.favorite_games IS 'Array de nombres de juegos favoritos del usuario';
COMMENT ON COLUMN user_profiles.badges IS 'Array de badges: verified, pro_gamer, streamer, content_creator, early_adopter';
COMMENT ON COLUMN user_profiles.level IS 'Nivel del usuario basado en actividad';
COMMENT ON COLUMN user_profiles.experience_points IS 'Puntos de experiencia ganados por actividad';
COMMENT ON COLUMN user_profiles.profile_color IS 'Color hexadecimal personalizado para el perfil';

