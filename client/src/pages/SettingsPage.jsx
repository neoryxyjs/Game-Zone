import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useUser } from '../context/UserContext';

const SettingsPage = () => {
  const { user, isAuthenticated } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications_enabled: true,
    email_notifications: true,
    privacy_level: 'public',
    language: 'es'
  });
  const [profile, setProfile] = useState({
    bio: '',
    location: '',
    website: '',
    gaming_style: 'casual',
    favorite_games: []
  });
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserStats(user.id);
      loadUserSettings(user.id);
      loadUserProfile(user.id);
      setUsername(user.username || '');
    }
    setLoading(false);
  }, [isAuthenticated, user]);

  const loadUserStats = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('Error cargando estadísticas:', data.error);
        setStats({
          posts_count: 0,
          followers_count: 0,
          following_count: 0,
          likes_received: 0
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setStats({
        posts_count: 0,
        followers_count: 0,
        following_count: 0,
        likes_received: 0
      });
    }
  };

  const loadUserSettings = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}`);
      const data = await response.json();
      
      if (data.success && data.profile && data.profile.settings) {
        setSettings(data.profile.settings);
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}`);
      const data = await response.json();
      
      if (data.success && data.profile && data.profile.profile) {
        setProfile(data.profile.profile);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Configuraciones guardadas correctamente');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error guardando configuraciones');
      }
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
      setMessage('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      
      // Actualizar username si cambió
      if (username !== user.username) {
        const usernameResponse = await fetch(`${API_BASE_URL}/api/auth/update-username`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            username: username 
          })
        });
        
        if (!usernameResponse.ok) {
          throw new Error('Error actualizando username');
        }
      }
      
      // Subir avatar si hay uno nuevo
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const avatarResponse = await fetch(`${API_BASE_URL}/api/profiles/${user.id}/avatar`, {
          method: 'PUT',
          body: formData
        });
        
        if (!avatarResponse.ok) {
          throw new Error('Error subiendo avatar');
        }
        
        const avatarData = await avatarResponse.json();
        if (avatarData.success && avatarData.avatar_url) {
          // Actualizar el avatar en el contexto del usuario
          updateUser({ avatar: avatarData.avatar_url });
        }
      }
      
      // Actualizar perfil
      const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Perfil actualizado correctamente');
        setTimeout(() => setMessage(''), 3000);
        setAvatarFile(null);
        setAvatarPreview(null);
        // Actualizar el contexto del usuario
        if (username !== user.username) {
          // Aquí podrías actualizar el contexto del usuario
          window.location.reload(); // Recarga simple para actualizar el username
        }
      } else {
        setMessage('Error actualizando perfil');
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      setMessage('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Inicia sesión para acceder a las configuraciones
          </h1>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Configuraciones
          </h1>
          <p className="text-gray-600">
            Personaliza tu experiencia en GameZone Social
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Estadísticas del usuario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Tu Perfil</h3>
              <div className="flex items-center mb-4">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                    <span className="text-gray-600 font-bold text-xl">{user.username?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <h4 className="font-medium">{user.username}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              
              {stats && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Posts:</span>
                    <span className="font-medium">{stats.posts_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Seguidores:</span>
                    <span className="font-medium">{stats.followers_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Siguiendo:</span>
                    <span className="font-medium">{stats.following_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Likes recibidos:</span>
                    <span className="font-medium">{stats.likes_received}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navegación */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Navegación</h3>
              <div className="space-y-2">
                <a 
                  href="/social" 
                  className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  ← Volver al Feed
                </a>
                <a 
                  href="/profile" 
                  className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Ver Perfil
                </a>
              </div>
            </div>
          </div>

          {/* Configuraciones principales */}
          <div className="lg:col-span-2">
            {/* Personalización del Perfil */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Personalizar Perfil</h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.includes('correctamente') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-6">
                {/* Apodo/Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apodo/Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tu apodo en GameZone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este será tu nombre visible en la red social
                  </p>
                </div>

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto de Perfil
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {(avatarPreview || user.avatar) ? (
                        <img 
                          src={avatarPreview || user.avatar} 
                          alt="Avatar" 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-bold text-2xl">{user.username?.[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      {avatarPreview && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        Cambiar Foto
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, GIF (máx. 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Cuéntanos sobre ti..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    placeholder="Ciudad, País"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Sitio Web */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => handleProfileChange('website', e.target.value)}
                    placeholder="https://tu-sitio.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Estilo de Gaming */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estilo de Gaming
                  </label>
                  <select
                    value={profile.gaming_style}
                    onChange={(e) => handleProfileChange('gaming_style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="casual">Casual</option>
                    <option value="competitive">Competitivo</option>
                    <option value="professional">Profesional</option>
                    <option value="streamer">Streamer</option>
                  </select>
                </div>

                {/* Juegos Favoritos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Juegos Favoritos
                  </label>
                  <input
                    type="text"
                    value={profile.favorite_games.join(', ')}
                    onChange={(e) => handleProfileChange('favorite_games', e.target.value.split(', ').filter(game => game.trim()))}
                    placeholder="League of Legends, Valorant, CS2..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separa los juegos con comas
                  </p>
                </div>

                {/* Botón Guardar Perfil */}
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Perfil'}
                </button>
              </div>
            </div>

            {/* Configuraciones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Configuraciones</h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.includes('correctamente') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-6">
                {/* Tema */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dark">Oscuro</option>
                    <option value="light">Claro</option>
                  </select>
                </div>

                {/* Notificaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Notificaciones
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications_enabled}
                        onChange={(e) => handleChange('notifications_enabled', e.target.checked)}
                        className="mr-2"
                      />
                      Habilitar notificaciones
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.email_notifications}
                        onChange={(e) => handleChange('email_notifications', e.target.checked)}
                        className="mr-2"
                      />
                      Notificaciones por email
                    </label>
                  </div>
                </div>

                {/* Nivel de Privacidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de Privacidad
                  </label>
                  <select
                    value={settings.privacy_level}
                    onChange={(e) => handleChange('privacy_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Público</option>
                    <option value="friends">Solo Amigos</option>
                    <option value="private">Privado</option>
                  </select>
                </div>

                {/* Idioma */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Botón Guardar */}
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Configuraciones'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3182ce;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;