import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';

export default function CreatePost({ userId, onPostCreated }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [gameTag, setGameTag] = useState('');
  const [loading, setLoading] = useState(false);

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
          image_url: imageUrl || null,
          game_tag: gameTag || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setContent('');
        setImageUrl('');
        setGameTag('');
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué estás jugando? Comparte tu experiencia..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
            maxLength="500"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {content.length}/500
          </div>
        </div>

        <div className="flex space-x-4">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL de imagen (opcional)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={gameTag}
            onChange={(e) => setGameTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {imageUrl && (
          <div className="mt-3">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="max-w-xs rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}
