import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce-in">
              <span className="text-white font-bold text-3xl">G</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Bienvenido a GameZone
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Únete a la comunidad gaming más grande. Conecta con jugadores, comparte tus logros y descubre nuevos juegos.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/login"
              className="btn-primary px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="btn-secondary px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
            >
              Registrarse
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">🎮</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Juega</h3>
              <p className="text-gray-600">Conecta con otros jugadores y forma equipos</p>
            </div>
            
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparte</h3>
              <p className="text-gray-600">Publica tus logros y experiencias gaming</p>
            </div>
            
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Compite</h3>
              <p className="text-gray-600">Participa en torneos y rankings</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Feed de la Comunidad
              </h1>
              <p className="text-gray-600 text-lg">
                Descubre lo que está pasando en la comunidad gaming
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Bienvenido,</p>
                <p className="font-semibold text-gray-900">{user?.username}</p>
              </div>
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
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