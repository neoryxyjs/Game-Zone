import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../Notifications/NotificationManager';

export default function NewPostForm({ onAddPost }) {
  const [content, setContent] = useState('');
  const { user, isAuthenticated } = useUser();
  const { showError, showSuccess } = useNotifications();
  
  // Usar el juego del usuario actual o League of Legends por defecto
  const [game, setGame] = useState(user?.game || 'League of Legends');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showError('Debes iniciar sesión para publicar');
      return;
    }
    
    if (!content.trim()) {
      showError('El contenido no puede estar vacío');
      return;
    }
    
    const newPost = {
      id: Date.now(),
      username: user.username,
      game: game,
      rank: user.rank || 'Unranked',
      content: content,
      avatar: user.avatar,
      timestamp: 'Ahora',
      likes: 0,
      comments: 0,
      userId: user.id
    };
    
    onAddPost(newPost);
    setContent('');
    showSuccess('¡Post publicado exitosamente!');
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-6 text-center">
          <p className="text-gray-600 mb-4">Inicia sesión para publicar contenido</p>
          <button
            type="button"
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors duration-200"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-6">
        {/* User Info */}
        <div className="flex items-center mb-6">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-medium text-gray-900">{user.username}</p>
            <p className="text-sm text-gray-500">{user.rank} • {user.game}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Game Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium leading-6 text-gray-900 mb-3 block">
              Selecciona tu juego
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setGame('League of Legends')}
                className={`relative rounded-lg px-4 py-2.5 text-sm font-semibold ring-1 ring-inset transition-all duration-200 ${
                  game === 'League of Legends'
                    ? 'bg-blue-600 text-white ring-blue-600/20 shadow-sm'
                    : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
                }`}
              >
                League of Legends
              </button>
              <button
                type="button"
                onClick={() => setGame('Valorant')}
                className={`relative rounded-lg px-4 py-2.5 text-sm font-semibold ring-1 ring-inset transition-all duration-200 ${
                  game === 'Valorant'
                    ? 'bg-red-600 text-white ring-red-600/20 shadow-sm'
                    : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
                }`}
              >
                Valorant
              </button>
            </div>
          </div>
          
          {/* Text Area */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
              ¿Qué quieres compartir?
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Comparte tus experiencias, busca equipo, discute estrategias..."
              className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 resize-none"
              rows={4}
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!content.trim()}
              className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 