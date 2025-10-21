import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useUser } from '../context/UserContext';

const SettingsPage = () => {
  const { user, isAuthenticated, updateUser } = useUser();
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
      const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}/settings`);
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage('');

    try {
      // Subir avatar si hay uno
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const avatarResponse = await fetch(`${API_BASE_URL}/api/profiles/${user.id}/avatar`, {
          method: 'PUT',
          body: formData
        });
        
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          if (avatarData.success) {
            updateUser({ ...user, avatar: avatarData.avatar_url });
          }
        }
      }

      // Actualizar perfil
      const profileResponse = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (profileResponse.ok) {
        setMessage('Perfil actualizado correctamente');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      setMessage('Error actualizando perfil');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso requerido</h2>
          <p className="text-gray-600">Necesitas iniciar sesión para acceder a la configuración</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Configuración
          </h1>
          <p className="text-gray-600">Personaliza tu experiencia en GameZone</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando configuración...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar de navegación */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <nav className="space-y-2">
                  <a href="#profile" className="block px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg">
                    Perfil
                  </a>
                  <a href="#account" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    Cuenta
                  </a>
                  <a href="#privacy" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    Privacidad
                  </a>
                  <a href="#notifications" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    Notificaciones
                  </a>
                </nav>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Avatar Section */}
              <div id="profile" className="card">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    👤
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Foto de Perfil</h2>
                    <p className="text-sm text-gray-500">Actualiza tu foto de perfil</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                    />
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG o GIF. Máximo 5MB.</p>
                    {avatarPreview && (
                      <div className="mt-3">
                        <img 
                          src={avatarPreview} 
                          alt="Preview" 
                          className="w-16 h-16 rounded-lg object-cover border-2 border-indigo-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del perfil */}
              <div className="card">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    📝
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                    <p className="text-sm text-gray-500">Actualiza tu información personal</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de usuario
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field"
                      placeholder="Tu nombre de usuario"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      className="input-field"
                      placeholder="Tu ubicación"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sitio web
                    </label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => handleProfileChange('website', e.target.value)}
                      className="input-field"
                      placeholder="https://tu-sitio.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estilo de juego
                    </label>
                    <select
                      value={profile.gaming_style}
                      onChange={(e) => handleProfileChange('gaming_style', e.target.value)}
                      className="input-field"
                    >
                      <option value="casual">Casual</option>
                      <option value="competitive">Competitivo</option>
                      <option value="hardcore">Hardcore</option>
                      <option value="social">Social</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    className="input-field"
                    rows="4"
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
              </div>

              {/* Estadísticas */}
              {stats && (
                <div className="card">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      📊
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Estadísticas</h2>
                      <p className="text-sm text-gray-500">Tu actividad en GameZone</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-indigo-600">{stats.posts_count || 0}</div>
                      <div className="text-sm text-gray-500">Publicaciones</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{stats.followers_count || 0}</div>
                      <div className="text-sm text-gray-500">Seguidores</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">{stats.following_count || 0}</div>
                      <div className="text-sm text-gray-500">Siguiendo</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-red-600">{stats.likes_received || 0}</div>
                      <div className="text-sm text-gray-500">Likes recibidos</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de guardar */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Guardar cambios</h3>
                    <p className="text-sm text-gray-500">Guarda todos los cambios realizados</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {message && (
                      <div className={`text-sm font-medium ${
                        message.includes('Error') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {message}
                      </div>
                    )}
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="loading-spinner mr-2"></div>
                          Guardando...
                        </div>
                      ) : (
                        'Guardar cambios'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;