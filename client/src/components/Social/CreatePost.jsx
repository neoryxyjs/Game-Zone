import React, { useState, useEffect } from 'react';
import { postAuth } from '../../utils/api';
import ImageUpload from './ImageUpload';

export default function CreatePost({ userId, onPostCreated, defaultGame = '' }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [gameTag, setGameTag] = useState(defaultGame);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Actualizar gameTag cuando cambia defaultGame
  useEffect(() => {
    if (defaultGame) {
      setGameTag(defaultGame);
    }
  }, [defaultGame]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      const response = await postAuth('/api/posts/create', {
        user_id: userId,
        content: content.trim(),
        image_id: uploadedImage ? uploadedImage.id : null,
        image_url: uploadedImage ? uploadedImage.url : (imageUrl || null),
        game_tag: gameTag || null
      });

      const data = await response.json();
      
      if (data.success) {
        setContent('');
        setImageUrl('');
        setGameTag('');
        setUploadedImage(null);
        if (onPostCreated) {
          onPostCreated(data.post);
        }
      } else {
        alert('Error creando el post: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error creando post:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-8 animate-slide-up hover:shadow-2xl transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {userId ? String(userId).charAt(0) : 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Crear publicación</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comparte tu experiencia gaming con la comunidad</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué estás jugando? Comparte tu experiencia, logros o encuentra compañeros de juego..."
            className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-smooth placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            rows="4"
            maxLength="500"
          />
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden" style={{ width: '120px' }}>
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      content.length > 450 ? 'bg-red-500' : 
                      content.length > 400 ? 'bg-yellow-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${(content.length / 500) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {content.length}/500
              </div>
            </div>
            {content.length > 400 && (
              <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                content.length > 450 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse-subtle' : 
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {content.length > 450 ? '⚠️ Casi al límite' : '⚡ Quedan pocos caracteres'}
              </div>
            )}
          </div>
        </div>

        {/* Componente de carga de imágenes */}
        <ImageUpload 
          onImageUploaded={(image) => {
            console.log('📸 Imagen recibida en CreatePost:', image);
            setUploadedImage(image);
          }}
          userId={userId}
          postId={null}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL de imagen (opcional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Juego
            </label>
            <select
              value={gameTag}
              onChange={(e) => setGameTag(e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar juego</option>
              <option value="League of Legends">League of Legends</option>
              <option value="Valorant">Valorant</option>
              <option value="CS2">Counter-Strike 2</option>
              <option value="Fortnite">Fortnite</option>
              <option value="Apex Legends">Apex Legends</option>
              <option value="Overwatch 2">Overwatch 2</option>
              <option value="Rocket League">Rocket League</option>
              <option value="Minecraft">Minecraft</option>
              <option value="Among Us">Among Us</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        {imageUrl && (
          <div className="mt-4">
            <div className="relative inline-block">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-w-xs rounded-xl shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {gameTag && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                🎮 {gameTag}
              </span>
            )}
            {uploadedImage && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                📷 Imagen adjunta
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="relative overflow-hidden btn-primary px-8 py-3 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="loading-spinner mr-2 border-white"></div>
                <span>Publicando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Publicar</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
