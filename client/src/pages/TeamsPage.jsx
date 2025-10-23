import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const TeamsPage = () => {
  const { user, isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState('all');

  const mockTeams = [
    {
      id: 1,
      name: 'Team Alpha',
      game: 'League of Legends',
      members: 5,
      rank: 'Diamond+',
      description: 'Equipo competitivo buscando jugadores experimentados',
      game_icon: '🎮',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 2,
      name: 'Valorant Elite',
      game: 'Valorant',
      members: 4,
      rank: 'Immortal+',
      description: 'Equipo profesional de Valorant',
      game_icon: '🔫',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 3,
      name: 'CS2 Warriors',
      game: 'Counter-Strike 2',
      members: 5,
      rank: 'Global Elite',
      description: 'Equipo de CS2 con experiencia en torneos',
      game_icon: '💥',
      color: 'from-gray-500 to-yellow-500'
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce-in">
            <span className="text-white font-bold text-3xl">👥</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Equipos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Encuentra tu equipo perfecto y compite en torneos
          </p>
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Inicia sesión para ver los equipos</p>
            <a href="/login" className="btn-primary px-8 py-3 text-lg font-semibold">
              Iniciar Sesión
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl">👥</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Equipos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Encuentra tu equipo perfecto</p>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
              }`}
            >
              Todos los Equipos
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
              }`}
            >
              Crear Equipo
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'my'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
              }`}
            >
              Mis Equipos
            </button>
          </nav>
        </div>

        {/* Contenido */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTeams.map((team, index) => (
              <div key={team.id} className="card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${team.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-xl">{team.game_icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{team.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{team.game}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">{team.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">{team.members}</span> miembros
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Rank: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{team.rank}</span>
                  </div>
                </div>
                
                <button className="w-full btn-primary py-2">
                  Unirse al Equipo
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Crear Nuevo Equipo</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Equipo
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej: Team Alpha"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Juego
                  </label>
                  <select className="input-field">
                    <option value="">Seleccionar juego</option>
                    <option value="lol">League of Legends</option>
                    <option value="valorant">Valorant</option>
                    <option value="cs2">Counter-Strike 2</option>
                    <option value="fortnite">Fortnite</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    className="input-field"
                    rows="4"
                    placeholder="Describe tu equipo..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rango Mínimo Requerido
                  </label>
                  <select className="input-field">
                    <option value="">Seleccionar rango</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                    <option value="master">Master</option>
                    <option value="challenger">Challenger</option>
                  </select>
                </div>
                
                <button type="submit" className="w-full btn-primary py-3">
                  Crear Equipo
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'my' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tienes equipos aún</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Únete a un equipo o crea el tuyo propio</p>
            <button
              onClick={() => setActiveTab('create')}
              className="btn-primary px-6 py-3"
            >
              Crear Mi Primer Equipo
            </button>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">24</div>
            <div className="text-gray-600 dark:text-gray-400">Equipos Activos</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">156</div>
            <div className="text-gray-600 dark:text-gray-400">Miembros Totales</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">8</div>
            <div className="text-gray-600 dark:text-gray-400">Torneos Activos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
