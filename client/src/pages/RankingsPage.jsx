import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const RankingsPage = () => {
  const { user, isAuthenticated } = useUser();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState('lol');

  const games = [
    { id: 'lol', name: 'League of Legends', icon: '🎮', color: 'from-blue-500 to-purple-500' },
    { id: 'valorant', name: 'Valorant', icon: '🔫', color: 'from-red-500 to-orange-500' },
    { id: 'cs2', name: 'Counter-Strike 2', icon: '💥', color: 'from-gray-500 to-yellow-500' },
    { id: 'fortnite', name: 'Fortnite', icon: '🏗️', color: 'from-green-500 to-blue-500' }
  ];

  const mockRankings = [
    { rank: 1, username: 'ProGamer123', points: 2450, game: 'lol', rank_name: 'Challenger' },
    { rank: 2, username: 'ElitePlayer', points: 2380, game: 'lol', rank_name: 'Grandmaster' },
    { rank: 3, username: 'MasterGamer', points: 2320, game: 'lol', rank_name: 'Master' },
    { rank: 4, username: 'DiamondKing', points: 2250, game: 'lol', rank_name: 'Diamond' },
    { rank: 5, username: 'PlatinumPro', points: 2180, game: 'lol', rank_name: 'Platinum' }
  ];

  useEffect(() => {
    // Simular carga de rankings
    setTimeout(() => {
      setRankings(mockRankings);
      setLoading(false);
    }, 1000);
  }, [selectedGame]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce-in">
            <span className="text-white font-bold text-3xl">🏆</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Rankings
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Descubre los mejores jugadores de la comunidad
          </p>
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Inicia sesión para ver los rankings</p>
            <a href="/login" className="btn-primary px-8 py-3 text-lg font-semibold">
              Iniciar Sesión
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl">🏆</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Rankings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Los mejores jugadores de la comunidad</p>
            </div>
          </div>
        </div>

        {/* Selector de juegos */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  selectedGame === game.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <div className="text-2xl mb-2">{game.icon}</div>
                <div className="font-semibold text-sm">{game.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rankings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Top Jugadores - {games.find(g => g.id === selectedGame)?.name}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Actualizado hace 5 minutos
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Cargando rankings...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rankings.map((player, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      player.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      player.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                      player.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                      'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}>
                      {player.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{player.username}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{player.rank_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">{player.points} pts</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Puntos</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">1,234</div>
            <div className="text-gray-600 dark:text-gray-400">Jugadores activos</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">567</div>
            <div className="text-gray-600 dark:text-gray-400">Partidas jugadas hoy</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">89</div>
            <div className="text-gray-600 dark:text-gray-400">Nuevos jugadores</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingsPage;
