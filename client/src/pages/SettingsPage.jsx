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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserStats(user.id);
      loadUserSettings(user.id);
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
                <img 
                  src={user.avatar || '/default-avatar.png'} 
                  alt={user.username}
                  className="w-16 h-16 rounded-full mr-4"
                />
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