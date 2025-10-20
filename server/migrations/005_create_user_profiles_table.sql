-- Crear tabla para perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    birth_date DATE,
    gender VARCHAR(20),
    favorite_games TEXT[], -- Array de juegos favoritos
    gaming_style VARCHAR(50), -- casual, competitive, professional
    availability VARCHAR(50), -- always, evenings, weekends, etc
    looking_for_team BOOLEAN DEFAULT false,
    streaming_platform VARCHAR(50),
    streaming_url VARCHAR(255),
    social_links JSONB, -- Para enlaces de redes sociales
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Crear tabla para configuraciones de usuario
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'es',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    privacy_level VARCHAR(20) DEFAULT 'public',
    show_online_status BOOLEAN DEFAULT true,
    show_activity BOOLEAN DEFAULT true,
    allow_friend_requests BOOLEAN DEFAULT true,
    allow_messages BOOLEAN DEFAULT true,
    auto_save BOOLEAN DEFAULT true,
    performance_mode BOOLEAN DEFAULT false,
    low_latency_mode BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Crear tabla para estadísticas de usuario
CREATE TABLE IF NOT EXISTS user_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    posts_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    comments_made INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    hours_played INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
