import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { postAuth } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import Feed from '../Social/Feed';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useUser();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [friendRequestId, setFriendRequestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      const userResponse = await fetch(`${API_BASE_URL}/api/profiles/${userId}`);
      const userData = await userResponse.json();
      
      if (userData.success) {
        setProfileUser(userData.profile);
      } else {
        setError('Usuario no encontrado');
      }

      if (currentUser && currentUser.id !== parseInt(userId)) {
        const followResponse = await fetch(`${API_BASE_URL}/api/social/following/${currentUser.id}`);
        const followData = await followResponse.json();
        
        if (followData.success) {
          const isFollowingUser = followData.following.some(follow => follow.id === parseInt(userId));
          setIsFollowing(isFollowingUser);
        }

        const friendResponse = await fetch(`${API_BASE_URL}/api/friends/check/${currentUser.id}/${userId}`);
        const friendData = await friendResponse.json();
        
        if (friendData.success) {
          setIsFriend(friendData.areFriends);
          
          if (friendData.pendingRequest) {
            setFriendRequestId(friendData.pendingRequest.id);
            if (friendData.pendingRequest.sender_id === parseInt(currentUser.id)) {
              setFriendRequestStatus('sent');
            } else {
              setFriendRequestStatus('received');
            }
          } else {
            setFriendRequestStatus(null);
            setFriendRequestId(null);
          }
        }
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setError('Error cargando el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      const endpoint = isFollowing ? '/api/social/unfollow' : '/api/social/follow';
      const response = await postAuth(endpoint, {
        follower_id: currentUser.id,
        following_id: parseInt(userId)
      });

      const data = await response.json();
      
      if (data.success) {
        setIsFollowing(!isFollowing);
        setProfileUser(prev => ({
          ...prev,
          followers_count: isFollowing ? prev.followers_count - 1 : prev.followers_count + 1
        }));
      }
    } catch (error) {
      console.error('Error siguiendo/dejando de seguir usuario:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!currentUser) return;

    try {
      const response = await postAuth('/api/friends/request', {
        sender_id: currentUser.id,
        receiver_id: parseInt(userId)
      });

      const data = await response.json();
      
      if (data.success) {
        setFriendRequestStatus('sent');
      }
    } catch (error) {
      console.error('Error enviando solicitud de amistad:', error);
    }
  };

  const handleAcceptFriend = async (requestId) => {
    if (!currentUser) return;

    try {
      const response = await postAuth(`/api/friends/accept/${requestId}`, {});
      const data = await response.json();
      
      if (data.success) {
        setIsFriend(true);
        setFriendRequestStatus(null);
      }
    } catch (error) {
      console.error('Error aceptando solicitud de amistad:', error);
    }
  };

  const handleRejectFriend = async (requestId) => {
    if (!currentUser) return;

    try {
      const response = await postAuth(`/api/friends/reject/${requestId}`, {});
      const data = await response.json();
      
      if (data.success) {
        setFriendRequestStatus(null);
        setFriendRequestId(null);
      }
    } catch (error) {
      console.error('Error rechazando solicitud de amistad:', error);
    }
  };

  const handleSendMessage = () => {
    navigate('/messages', { state: { selectedUser: { friend_id: parseInt(userId), username: profileUser.username, avatar: profileUser.avatar } } });
  };

  // Badge Component
  const Badge = ({ type }) => {
    const badges = {
      verified: { icon: '✓', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30', label: 'Verificado' },
      pro_gamer: { icon: '🎮', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30', label: 'Pro Gamer' },
      streamer: { icon: '📺', color: 'text-red-500 bg-red-100 dark:bg-red-900/30', label: 'Streamer' },
      content_creator: { icon: '🎬', color: 'text-green-500 bg-green-100 dark:bg-green-900/30', label: 'Creador' },
      early_adopter: { icon: '⭐', color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30', label: 'Early Adopter' }
    };

    const badge = badges[type];
    if (!badge) return null;

    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`} title={badge.label}>
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-16">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Usuario no encontrado</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">El usuario que buscas no existe o ha sido eliminado.</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Banner del perfil */}
      <div className="relative">
        {profileUser.banner_url ? (
          <div className="w-full h-64 md:h-80 lg:h-96 relative overflow-hidden">
            <img
              src={profileUser.banner_url}
              alt="Banner"
              className={`w-full h-full ${
                profileUser.banner_position === 'top' ? 'object-top' :
                profileUser.banner_position === 'bottom' ? 'object-bottom' :
                'object-center'
              } object-cover`}
            />
            {/* Overlay mejorado para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
            {/* Overlay adicional en la parte inferior para el avatar */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
          </div>
        ) : (
          <div 
            className="w-full h-64 md:h-80 lg:h-96 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${profileUser.profile_color || '#6366f1'} 0%, #8b5cf6 100%)` }}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full blur-3xl"></div>
              </div>
            </div>
            {/* Overlay para gradiente */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar y header */}
        <div className="relative -mt-20 sm:-mt-24 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="relative">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.username}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-2xl">
                  <span className="text-white font-bold text-5xl">{profileUser.username?.[0]?.toUpperCase()}</span>
                </div>
              )}
              {profileUser.is_verified && (
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {/* Nivel badge */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
                <span className="text-white font-bold text-sm">Nv. {profileUser.level || 1}</span>
              </div>
            </div>

            {/* Info y acciones */}
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white inline-block drop-shadow-lg">
                  {profileUser.username}
                </h1>
              </div>
              
              {/* Badges */}
              {profileUser.badges && profileUser.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
                  {profileUser.badges.map((badge, index) => (
                    <Badge key={index} type={badge} />
                  ))}
                </div>
              )}

              <p className="text-gray-100 dark:text-gray-200 mb-3 max-w-2xl font-medium drop-shadow-md">
                {profileUser.bio || 'Sin biografía'}
              </p>

              <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm text-gray-200 dark:text-gray-300 mb-4 drop-shadow-md">
                {profileUser.location && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profileUser.location}
                  </span>
                )}
                {profileUser.gaming_style && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {profileUser.gaming_style}
                  </span>
                )}
              </div>

              {/* Links sociales */}
              {(profileUser.discord_url || profileUser.twitch_url || profileUser.youtube_url || profileUser.twitter_url) && (
                <div className="flex gap-2 justify-center sm:justify-start mb-4">
                  {profileUser.discord_url && (
                    <a href={profileUser.discord_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors" title="Discord">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                    </a>
                  )}
                  {profileUser.twitch_url && (
                    <a href={profileUser.twitch_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors" title="Twitch">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                    </a>
                  )}
                  {profileUser.youtube_url && (
                    <a href={profileUser.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="YouTube">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  )}
                  {profileUser.twitter_url && (
                    <a href={profileUser.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors" title="Twitter/X">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  )}
                </div>
              )}

              {/* Botones de acción */}
              {currentUser && currentUser.id !== parseInt(userId) && (
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {/* Botón de seguir */}
                  <button
                    onClick={handleFollow}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                      isFollowing
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/50'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Siguiendo</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Seguir</span>
                      </>
                    )}
                  </button>

                  {/* Botón de amistad */}
                  {isFriend ? (
                    <div className="flex items-center space-x-2 px-5 py-2.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border-2 border-green-200 dark:border-green-800">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span className="font-semibold">Amigos</span>
                    </div>
                  ) : friendRequestStatus === 'sent' ? (
                    <button
                      disabled
                      className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg border-2 border-gray-300 dark:border-gray-700 font-medium cursor-not-allowed"
                    >
                      Solicitud enviada
                    </button>
                  ) : friendRequestStatus === 'received' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptFriend(friendRequestId)}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-lg shadow-green-500/50"
                      >
                        Aceptar solicitud
                      </button>
                      <button
                        onClick={() => handleRejectFriend(friendRequestId)}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddFriend}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition-all shadow-lg shadow-purple-500/50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Agregar amigo</span>
                    </button>
                  )}

                  {/* Botón de mensaje */}
                  <button
                    onClick={handleSendMessage}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all border-2 border-gray-200 dark:border-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Mensaje</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats mejoradas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {profileUser.posts_count || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Posts</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {profileUser.followers_count || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Seguidores</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {profileUser.following_count || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Siguiendo</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {profileUser.likes_received || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Likes</div>
          </div>
        </div>

        {/* Juegos favoritos */}
        {profileUser.favorite_games && profileUser.favorite_games.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Juegos Favoritos
            </h3>
            <div className="flex flex-wrap gap-2">
              {profileUser.favorite_games.map((game, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium border border-indigo-200 dark:border-indigo-800"
                >
                  🎮 {game}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Posts del usuario */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg className="w-7 h-7 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Posts de {profileUser.username}
          </h2>
          <Feed 
            isPersonalFeed={false} 
            userId={userId}
            customEndpoint={`/api/social/user-posts/${userId}`}
          />
        </div>
      </div>
    </div>
  );
}
