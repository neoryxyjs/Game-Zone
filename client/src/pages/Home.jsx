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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section para usuarios autenticados */}
        <div className="mb-12 animate-slide-up">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-left">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ¡Hola, {user?.username}!
                </h1>
                <p className="text-gray-600">Bienvenido de vuelta a GameZone</p>
              </div>
            </div>
            
            {/* Stats rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-indigo-600">12</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-green-600">45</div>
                <div className="text-sm text-gray-600">Seguidores</div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-purple-600">23</div>
                <div className="text-sm text-gray-600">Siguiendo</div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-orange-600">156</div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
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

        {/* Tabs de navegación mejorados */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white/50 backdrop-blur-sm rounded-xl p-1 shadow-lg max-w-2xl mx-auto">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'feed'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              🏠 Feed General
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'personal'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              📝 Mis Posts
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'discover'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              🔍 Descubrir
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'following'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              👥 Siguiendo
            </button>
          </nav>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-3">
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
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Descubrir Jugadores</h2>
                <UserSearch currentUserId={user.id} />
              </div>
            )}

            {activeTab === 'following' && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Siguiendo</h2>
                <FollowingList userId={user.id} />
              </div>
            )}
          </div>

          {/* Sidebar mejorada */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Widget de bienvenida */}
              <div className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">👋</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">¡Bienvenido!</h3>
                    <p className="text-sm text-gray-500">Comparte tu experiencia</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Únete a la conversación y comparte tus logros gaming con la comunidad.
                </p>
                <button className="w-full btn-primary py-2 text-sm">
                  Crear mi primer post
                </button>
              </div>

              {/* Usuarios en línea */}
              <OnlineUsers currentUserId={user.id} />
              
              {/* Widget de juegos populares */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Juegos Populares</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">🎮</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">League of Legends</div>
                      <div className="text-sm text-gray-500">1,234 jugadores activos</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">🔫</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Valorant</div>
                      <div className="text-sm text-gray-500">856 jugadores activos</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">🏗️</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Fortnite</div>
                      <div className="text-sm text-gray-500">567 jugadores activos</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget de eventos */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Próximos Eventos</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <div className="font-medium text-indigo-900 text-sm">Torneo LoL</div>
                    <div className="text-xs text-indigo-600">Mañana 20:00</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900 text-sm">Stream Valorant</div>
                    <div className="text-xs text-green-600">Hoy 18:00</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-900 text-sm">Q&A Gaming</div>
                    <div className="text-xs text-purple-600">Viernes 19:00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 