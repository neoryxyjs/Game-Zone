import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Feed from '../components/Social/Feed';
import CreatePost from '../components/Social/CreatePost';
import OnlineUsers from '../components/Social/OnlineUsers';

const GamePage = ({ title, game }) => {
  const { user, isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState(null);

  const handlePostCreated = (post) => {
    setNewPost(post);
  };

  const gameInfo = {
    lol: {
      icon: '🎮',
      color: 'from-blue-500 to-purple-500',
      description: 'El MOBA más popular del mundo',
      features: ['Rankings', 'Builds', 'Pro Players', 'Tournaments'],
      tag: 'League of Legends'
    },
    valorant: {
      icon: '🔫',
      color: 'from-red-500 to-orange-500',
      description: 'FPS táctico de Riot Games',
      features: ['Agents', 'Maps', 'Weapons', 'Esports'],
      tag: 'Valorant'
    }
  };

  const currentGame = gameInfo[game] || gameInfo.lol;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce-in">
            <span className="text-white font-bold text-3xl">{currentGame.icon}</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {currentGame.description}
          </p>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <p className="text-gray-600 mb-4">Inicia sesión para acceder al contenido de {title}</p>
            <Link to="/login" className="btn-primary px-8 py-3 text-lg font-semibold inline-block">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header del juego */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center space-x-6 mb-6">
            <div className={`w-20 h-20 bg-gradient-to-r ${currentGame.color} rounded-2xl flex items-center justify-center shadow-xl`}>
              <span className="text-white text-3xl">{currentGame.icon}</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-gray-600 text-lg">{currentGame.description}</p>
            </div>
          </div>

          {/* Features del juego */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {currentGame.features.map((feature, index) => (
              <div key={index} className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-2xl mb-2">{currentGame.icon}</div>
                <div className="font-semibold text-gray-900">{feature}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white/50 backdrop-blur-sm rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'feed'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Feed de {title}
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Crear Post
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'players'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Jugadores Online
            </button>
          </nav>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {activeTab === 'feed' && (
              <Feed 
                userId={user?.id} 
                isPersonalFeed={false} 
                onNewPost={newPost} 
                gameFilter={currentGame.tag}
              />
            )}
            {activeTab === 'create' && (
              <CreatePost 
                userId={user?.id} 
                onPostCreated={handlePostCreated}
                defaultGame={currentGame.tag}
              />
            )}
            {activeTab === 'players' && (
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Jugadores de {title}</h3>
                <OnlineUsers />
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de {title}</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Últimas noticias</h4>
                  <p className="text-sm text-gray-600">Mantente al día con las últimas actualizaciones del juego</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Eventos</h4>
                  <p className="text-sm text-gray-600">Participa en torneos y eventos especiales</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Comunidad</h4>
                  <p className="text-sm text-gray-600">Conecta con otros jugadores</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
