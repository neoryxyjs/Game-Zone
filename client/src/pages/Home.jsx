import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import CreatePost from '../components/Social/CreatePost';
import Feed from '../components/Social/Feed';
import UserSearch from '../components/Social/UserSearch';
import FollowingList from '../components/Social/FollowingList';
import OnlineUsers from '../components/Social/OnlineUsers';

export default function Home() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState(null);
  const [error, setError] = useState(null);

  const handlePostCreated = (post) => {
    setNewPost(post);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a GameZone
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Inicia sesión para ver el feed de la comunidad
          </p>
          <div className="space-x-4">
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Iniciar Sesión
            </a>
            <a
              href="/register"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Registrarse
            </a>
          </div>
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
                Feed de la Comunidad
              </h1>
              <p className="text-gray-600">
                Descubre lo que está pasando en la comunidad gaming
              </p>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs de navegación */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('feed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Feed General
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mis Posts
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'discover'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Descubrir
            </button>
          </nav>
        </div>

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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usuarios en línea */}
            <OnlineUsers currentUserId={user.id} />
            
            {/* Lista de seguidos */}
            <FollowingList userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
} 