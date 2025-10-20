import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import CreatePost from '../components/Social/CreatePost';
import Feed from '../components/Social/Feed';
import UserSearch from '../components/Social/UserSearch';
import FollowingList from '../components/Social/FollowingList';
import OnlineUsers from '../components/Social/OnlineUsers';
import RealTimeNotifications from '../components/Notifications/RealTimeNotifications';

export default function SocialPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState(null);
  const [error, setError] = useState(null);

  const handlePostCreated = (post) => {
    setNewPost(post);
    setError(null);
    // No refrescar automáticamente - el feed se actualizará solo
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inicia sesión para acceder a la red social
          </h2>
          <p className="text-gray-600">
            Necesitas estar logueado para ver el contenido social
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Red Social GameZone
              </h1>
              <p className="text-gray-600">
                Conecta con otros gamers y comparte tu experiencia
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <RealTimeNotifications />
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('feed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Feed Público
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Mi Feed
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'discover'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Descubrir
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'following'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Siguiendo
            </button>
          </nav>
        </div>

        {/* Mensaje de error global */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2">
            {activeTab === 'feed' && (
              <>
                <CreatePost userId={user.id} onPostCreated={handlePostCreated} onError={handleError} />
                <Feed userId={user.id} isPersonalFeed={false} onNewPost={newPost} onError={handleError} />
              </>
            )}
            
            {activeTab === 'personal' && (
              <>
                <CreatePost userId={user.id} onPostCreated={handlePostCreated} onError={handleError} />
                <Feed userId={user.id} isPersonalFeed={true} onNewPost={newPost} onError={handleError} />
              </>
            )}
            
            {activeTab === 'discover' && (
              <UserSearch currentUserId={user.id} />
            )}
            
            {activeTab === 'following' && (
              <FollowingList currentUserId={user.id} />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Usuarios en línea */}
            <OnlineUsers currentUserId={user.id} />
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estadísticas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seguidores</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Siguiendo</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Juegos Populares
              </h3>
              <div className="space-y-2">
                {['League of Legends', 'Valorant', 'CS2', 'Fortnite', 'Apex Legends'].map(game => (
                  <div key={game} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm">{game}</span>
                    <span className="text-xs text-gray-500">🔥</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
