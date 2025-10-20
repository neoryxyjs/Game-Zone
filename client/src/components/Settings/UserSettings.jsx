import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

const UserSettings = ({ userId, onSettingsUpdated }) => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications_enabled: true,
    email_notifications: true,
    privacy_level: 'public',
    language: 'es'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}`);
      const data = await response.json();
      
      if (data.success && data.profile && data.profile.settings) {
        setSettings(data.profile.settings);
      } else {
        // Usar configuraciones por defecto si no existen
        setSettings({
          theme: 'dark',
          notifications_enabled: true,
          email_notifications: true,
          privacy_level: 'public',
          language: 'es'
        });
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
      // Usar configuraciones por defecto si hay error
      setSettings({
        theme: 'dark',
        notifications_enabled: true,
        email_notifications: true,
        privacy_level: 'public',
        language: 'es'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Configuraciones guardadas correctamente');
        if (onSettingsUpdated) {
          onSettingsUpdated(data.settings);
        }
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="spinner"></div>
          <span className="ml-2">Cargando configuraciones...</span>
        </div>
      </div>
    );
  }

  return (
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
            <option value="auto">Automático</option>
          </select>
        </div>

        {/* Notificaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notificaciones
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) => handleChange('notifications_enabled', e.target.checked)}
                className="mr-3"
              />
              <span>Habilitar notificaciones</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => handleChange('email_notifications', e.target.checked)}
                className="mr-3"
              />
              <span>Notificaciones por email</span>
            </label>
          </div>
        </div>

        {/* Privacidad */}
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
            <option value="pt">Português</option>
          </select>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Configuraciones'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-top: 2px solid #3182ce;
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

export default UserSettings;
