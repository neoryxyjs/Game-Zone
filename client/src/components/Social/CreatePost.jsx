import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import ImageUpload from './ImageUpload';

export default function CreatePost({ userId, onPostCreated }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [gameTag, setGameTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/posts/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          content: content.trim(),
          image_url: uploadedImage ? uploadedImage.url : (imageUrl || null),
          game_tag: gameTag || null
        })
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
    <div className="card mb-8 animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {userId ? String(userId).charAt(0) : 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Crear publicación</h3>
            <p className="text-sm text-gray-500">Comparte tu experiencia gaming</p>
          </div>
        </div>

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué estás jugando? Comparte tu experiencia..."
            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-400"
            rows="4"
            maxLength="500"
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              {content.length}/500 caracteres
            </div>
            <div className={`text-sm font-medium ${
              content.length > 450 ? 'text-red-500' : 
              content.length > 400 ? 'text-yellow-500' : 'text-gray-500'
            }`}>
              {content.length > 450 ? 'Casi al límite' : 
               content.length > 400 ? 'Quedan pocos caracteres' : ''}
            </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            {gameTag && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {gameTag}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="btn-primary px-8 py-2.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="loading-spinner mr-2"></div>
                Publicando...
              </div>
            ) : (
              'Publicar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
