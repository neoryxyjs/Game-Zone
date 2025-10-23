import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { putAuth, uploadFileAuth } from '../../utils/api';
import { useUser } from '../../context/UserContext';

export default function ProfileEditor() {
  const { user, updateUser } = useUser();
  const [profile, setProfile] = useState({
    bio: '',
    location: '',
    banner_url: '',
    discord_url: '',
    twitch_url: '',
    youtube_url: '',
    twitter_url: '',
    favorite_games: [],
    profile_color: '#6366f1'
  });
  const [newGame, setNewGame] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
      const data = await response.json();
      
      if (data.success && data.profile) {
        setProfile({
          bio: data.profile.bio || '',
          location: data.profile.location || '',
          banner_url: data.profile.banner_url || '',
          discord_url: data.profile.discord_url || '',
          twitch_url: data.profile.twitch_url || '',
          youtube_url: data.profile.youtube_url || '',
          twitter_url: data.profile.twitter_url || '',
          favorite_games: data.profile.favorite_games || [],
          profile_color: data.profile.profile_color || '#6366f1'
        });
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setBannerPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAddGame = () => {
    if (newGame.trim() && !profile.favorite_games.includes(newGame.trim())) {
      setProfile(prev => ({
        ...prev,
        favorite_games: [...prev.favorite_games, newGame.trim()]
      }));
      setNewGame('');
    }
  };

  const handleRemoveGame = (game) => {
    setProfile(prev => ({
      ...prev,
      favorite_games: prev.favorite_games.filter(g => g !== game)
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage('');

    try {
      // Subir banner si hay uno nuevo
      if (bannerFile) {
        const formData = new FormData();
        formData.append('image', bannerFile);
        formData.append('user_id', user.id);
        formData.append('is_video', 'false');
        
        const bannerResponse = await uploadFileAuth(
          '/api/profiles/upload-post-image',
          formData,
          { method: 'POST' }
        );
        
        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json();
          if (bannerData.success) {
            profile.banner_url = bannerData.image.url;
          }
        }
      }

      // Actualizar perfil con la personalización
      const response = await putAuth(`/api/profiles/${user.id}/customization`, profile);
      const data = await response.json();

      if (data.success) {
        setMessage('✅ Perfil actualizado correctamente');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Error actualizando perfil');
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      setMessage('❌ Error actualizando perfil');
    } finally {
      setSaving(false);
    }
  };

  const popularGames = [
    'League of Legends', 'Valorant', 'CS:GO', 'Dota 2', 'Overwatch 2',
    'Fortnite', 'Apex Legends', 'Rocket League', 'Minecraft', 'Genshin Impact'
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            🖼️
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Banner de Perfil</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza tu banner de perfil</p>
          </div>
        </div>

        <div className="space-y-4">
          {(bannerPreview || profile.banner_url) && (
            <div className="relative">
              <img
                src={bannerPreview || profile.banner_url}
                alt="Banner"
                className="w-full h-48 object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 dark:file:bg-purple-900/20 file:text-purple-700 dark:file:text-purple-400 hover:file:bg-purple-100 dark:hover:file:bg-purple-900/40 transition-colors"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG o GIF. Recomendado 1500x500px.</p>
        </div>
      </div>

      {/* Color del perfil */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            🎨
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Color de Perfil</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Elige tu color personalizado</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="color"
            value={profile.profile_color}
            onChange={(e) => handleChange('profile_color', e.target.value)}
            className="w-16 h-16 rounded-xl cursor-pointer border-4 border-gray-200 dark:border-gray-700"
          />
          <div className="flex-1">
            <input
              type="text"
              value={profile.profile_color}
              onChange={(e) => handleChange('profile_color', e.target.value)}
              className="input-field font-mono"
              placeholder="#6366f1"
            />
          </div>
          <div 
            className="w-16 h-16 rounded-xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${profile.profile_color} 0%, #8b5cf6 100%)` }}
          ></div>
        </div>
      </div>

      {/* Bio y ubicación */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            📝
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información Personal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cuéntanos sobre ti</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Biografía
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="input-field"
              rows="4"
              placeholder="Cuéntanos sobre ti, tus juegos favoritos, tu estilo de juego..."
              maxLength={500}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {profile.bio.length}/500 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📍 Ubicación
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="input-field"
              placeholder="Ciudad, País"
            />
          </div>
        </div>
      </div>

      {/* Links Sociales */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            🔗
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Redes Sociales</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Conecta tus redes sociales</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <span className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs mr-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              </span>
              Discord
            </label>
            <input
              type="url"
              value={profile.discord_url}
              onChange={(e) => handleChange('discord_url', e.target.value)}
              className="input-field"
              placeholder="https://discord.gg/tu-servidor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <span className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs mr-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
              </span>
              Twitch
            </label>
            <input
              type="url"
              value={profile.twitch_url}
              onChange={(e) => handleChange('twitch_url', e.target.value)}
              className="input-field"
              placeholder="https://twitch.tv/tu-canal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <span className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs mr-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </span>
              YouTube
            </label>
            <input
              type="url"
              value={profile.youtube_url}
              onChange={(e) => handleChange('youtube_url', e.target.value)}
              className="input-field"
              placeholder="https://youtube.com/@tu-canal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <span className="w-6 h-6 bg-sky-500 rounded-lg flex items-center justify-center text-white text-xs mr-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </span>
              Twitter / X
            </label>
            <input
              type="url"
              value={profile.twitter_url}
              onChange={(e) => handleChange('twitter_url', e.target.value)}
              className="input-field"
              placeholder="https://twitter.com/tu-usuario"
            />
          </div>
        </div>
      </div>

      {/* Juegos Favoritos */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            🎮
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Juegos Favoritos</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Selecciona tus juegos favoritos</p>
          </div>
        </div>

        {/* Juegos actuales */}
        {profile.favorite_games.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {profile.favorite_games.map((game, index) => (
              <div
                key={index}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium border border-indigo-200 dark:border-indigo-800"
              >
                <span>🎮 {game}</span>
                <button
                  onClick={() => handleRemoveGame(game)}
                  className="text-indigo-500 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Agregar nuevo juego */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newGame}
            onChange={(e) => setNewGame(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddGame()}
            className="input-field flex-1"
            placeholder="Escribe el nombre del juego..."
          />
          <button
            onClick={handleAddGame}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors"
          >
            + Agregar
          </button>
        </div>

        {/* Juegos populares */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Juegos Populares:</p>
          <div className="flex flex-wrap gap-2">
            {popularGames.filter(game => !profile.favorite_games.includes(game)).map((game) => (
              <button
                key={game}
                onClick={() => setProfile(prev => ({ ...prev, favorite_games: [...prev.favorite_games, game] }))}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
              >
                {game}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="card sticky bottom-4 shadow-2xl border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">¿Listo para guardar?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tus cambios se aplicarán a tu perfil</p>
          </div>
          <div className="flex items-center space-x-4">
            {message && (
              <div className="text-sm font-medium">
                {message}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/50"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Guardando...
                </div>
              ) : (
                '💾 Guardar Cambios'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

