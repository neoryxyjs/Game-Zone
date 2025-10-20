import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AvatarEditor from '../components/Profile/AvatarEditor';
import AvatarUpload from '../components/Profile/AvatarUpload';
import NotificationCenter from '../components/Notifications/NotificationCenter';
import FriendsManager from '../components/Friends/FriendsManager';
import GamerProfileHeader from '../components/Profile/GamerProfileHeader';
import SummonerSearch from '../components/Profile/SummonerSearch';

export default function ProfilePage() {
  const { user, notifications, friends, updateUser, updateAvatar, markNotificationAsRead, addFriend, removeFriend } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Riot linking state
  const [riotSummonerName, setRiotSummonerName] = useState(user.riotSummonerName || '');
  const [riotStats, setRiotStats] = useState(null);
  const [riotMatches, setRiotMatches] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [linkError, setLinkError] = useState('');

  const [gameStats] = useState({
    leagueOfLegends: {
      rank: 'Diamond II',
      winRate: '68%',
      gamesPlayed: 1247,
      mainRole: 'ADC',
      mainChampions: ['Jinx', 'Kai\'Sa', 'Vayne'],
      seasonWins: 847,
      seasonLosses: 400
    },
    valorant: {
      rank: 'Platinum III',
      winRate: '62%',
      gamesPlayed: 456,
      mainRole: 'Duelist',
      mainAgents: ['Jett', 'Phoenix', 'Reyna'],
      seasonWins: 283,
      seasonLosses: 173
    }
  });

  useEffect(() => {
    if (user.riotSummonerName) {
      console.log('Consultando datos de Riot para:', user.riotSummonerName);
      setLoadingStats(true);
      setLinkError('');
      fetch(API_ENDPOINTS.RIOT.LOL(user.riotSummonerName))
        .then(res => {
          console.log('Respuesta del servidor:', res.status);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Datos recibidos de Riot:', data);
          setRiotStats(data);
          setLoadingStats(false);
        })
        .catch((error) => {
          console.error('Error al obtener datos de Riot:', error);
          setLoadingStats(false);
          setLinkError(`Error: ${error.message}`);
        });
    } else {
      setRiotStats(null);
      setRiotMatches([]);
    }
  }, [user.riotSummonerName]);

  // Enlazar cuenta
  const handleLinkRiot = (e) => {
    e.preventDefault();
    if (!riotSummonerName) return;
    updateUser({ riotSummonerName });
  };

  // Desenlazar cuenta
  const handleUnlinkRiot = () => {
    updateUser({ riotSummonerName: '' });
    setRiotSummonerName('');
    setRiotStats(null);
    setRiotMatches([]);
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'comment':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'like':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'friend':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del Perfil */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <GamerProfileHeader user={user} />
          <div className="px-6 pb-6">
            {/* Enlazar/Desenlazar Riot */}
            <div className="my-4">
              {!user.riotSummonerName ? (
                <SummonerSearch
                  onSelect={(summonerName) => updateUser({ riotSummonerName: summonerName })}
                  showLinkButton={true}
                />
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    Cuenta Riot enlazada: {user.riotSummonerName}
                  </span>
                  <button
                    onClick={handleUnlinkRiot}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium text-xs"
                  >
                    Desenlazar
                  </button>
                </div>
              )}
            </div>

            {/* Estadísticas reales de Riot */}
            {loadingStats && user.riotSummonerName && (
              <div className="text-center text-blue-600 my-4">Cargando estadísticas de Riot...</div>
            )}
            {linkError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
                <strong>Error:</strong> {linkError}
                <br />
                <small>Verifica que tu API Key de Riot esté configurada y que el nombre de invocador sea correcto.</small>
              </div>
            )}
            {riotStats && riotStats.summoner && (
              <div className="bg-gray-900 rounded-lg p-4 my-4 text-white shadow">
                <div className="flex items-center gap-4">
                  <img src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/${riotStats.summoner.profileIconId}.png`} alt="icon" className="w-16 h-16 rounded-full border-2 border-blue-500" />
                  <div>
                    <div className="text-lg font-bold">{riotStats.summoner.name}</div>
                    <div className="text-sm text-gray-300">Nivel: {riotStats.summoner.summonerLevel}</div>
                    {riotStats.ranked && riotStats.ranked.length > 0 && (
                      <div className="mt-1">
                        <span className="font-semibold text-yellow-400">{riotStats.ranked[0].tier} {riotStats.ranked[0].rank}</span>
                        <span className="ml-2 text-gray-400">LP: {riotStats.ranked[0].leaguePoints}</span>
                        <span className="ml-2 text-green-400">Victorias: {riotStats.ranked[0].wins}</span>
                        <span className="ml-2 text-red-400">Derrotas: {riotStats.ranked[0].losses}</span>
                      </div>
                    )}
                    {(!riotStats.ranked || riotStats.ranked.length === 0) && (
                      <div className="mt-1 text-gray-400">Sin datos de ranked</div>
                    )}
                  </div>
                </div>
                {/* Debug info */}
                <div className="mt-4 p-2 bg-gray-800 rounded text-xs">
                  <div>Debug: Datos recibidos correctamente</div>
                  <div>Summoner ID: {riotStats.summoner.id}</div>
                  <div>PUUID: {riotStats.summoner.puuid}</div>
                </div>
              </div>
            )}
            {user.riotSummonerName && !loadingStats && !riotStats && !linkError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded my-4">
                <strong>Estado:</strong> Cuenta enlazada pero sin datos de estadísticas.
                <br />
                <small>Esto puede indicar que el invocador no tiene partidas ranked o hay un problema con la API.</small>
              </div>
            )}

            {/* Estadísticas rápidas */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{user.followers}</div>
                <div className="text-gray-600">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{user.following}</div>
                <div className="text-gray-600">Siguiendo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{user.posts}</div>
                <div className="text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{user.notifications}</div>
                <div className="text-gray-600">Notificaciones</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Resumen', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
                { id: 'stats', name: 'Estadísticas', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { id: 'friends', name: 'Amigos', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
                { id: 'notifications', name: 'Notificaciones', icon: 'M15 17h5l-5 5v-5zM4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de las tabs */}
        <div className="mt-8">
          <div>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Actividad reciente */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Publicaste un nuevo post sobre League of Legends</span>
                      <span className="text-xs text-gray-400">2h</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Comentaste en el post de ValorantPro</span>
                      <span className="text-xs text-gray-400">4h</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Ganaste una partida en Diamond II</span>
                      <span className="text-xs text-gray-400">6h</span>
                    </div>
                  </div>
                </div>

                {/* Logros recientes */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Logros Recientes</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Diamond Master</div>
                        <div className="text-sm text-gray-600">Alcanzaste Diamond II</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Win Streak</div>
                        <div className="text-sm text-gray-600">5 victorias consecutivas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-8">
                <AvatarUpload />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* League of Legends Stats */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">League of Legends</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rank</span>
                        <span className="font-semibold text-blue-600">{gameStats.leagueOfLegends.rank}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Win Rate</span>
                        <span className="font-semibold text-green-600">{gameStats.leagueOfLegends.winRate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Partidas</span>
                        <span className="font-semibold">{gameStats.leagueOfLegends.gamesPlayed}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rol Principal</span>
                        <span className="font-semibold">{gameStats.leagueOfLegends.mainRole}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Campeones Principales</h4>
                      <div className="flex space-x-2">
                        {gameStats.leagueOfLegends.mainChampions.map((champion, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {champion}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Valorant Stats */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Valorant</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rank</span>
                        <span className="font-semibold text-red-600">{gameStats.valorant.rank}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Win Rate</span>
                        <span className="font-semibold text-green-600">{gameStats.valorant.winRate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Partidas</span>
                        <span className="font-semibold">{gameStats.valorant.gamesPlayed}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rol Principal</span>
                        <span className="font-semibold">{gameStats.valorant.mainRole}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Agentes Principales</h4>
                      <div className="flex space-x-2">
                        {gameStats.valorant.mainAgents.map((agent, index) => (
                          <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                            {agent}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'friends' && (
              <FriendsManager 
                friends={friends}
                onAddFriend={addFriend}
                onRemoveFriend={removeFriend}
              />
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                  <button 
                    onClick={() => setShowNotifications(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver todas
                  </button>
                </div>
                
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border ${
                        notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showAvatarEditor && (
        <AvatarEditor
          currentAvatar={user.avatar}
          onAvatarChange={updateAvatar}
          onClose={() => setShowAvatarEditor(false)}
        />
      )}

      {showNotifications && (
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
} 