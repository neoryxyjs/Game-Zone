import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { postAuth } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import Feed from '../Social/Feed';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useUser();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null); // pending, sent, received, null
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
      
      // Cargar información del usuario (PÚBLICO - no requiere autenticación)
      const userResponse = await fetch(`${API_BASE_URL}/api/profiles/${userId}`);
      const userData = await userResponse.json();
      
      if (userData.success) {
        setProfileUser(userData.profile);
      } else {
        setError('Usuario no encontrado');
      }

      // Cargar posts del usuario usando el nuevo endpoint
      const postsResponse = await fetch(`${API_BASE_URL}/api/social/user-posts/${userId}`);
      const postsData = await postsResponse.json();
      
      if (postsData.success) {
        setUserPosts(postsData.posts || []);
      }

      // Verificar si el usuario actual sigue a este usuario (PÚBLICO)
      if (currentUser && currentUser.id !== parseInt(userId)) {
        const followResponse = await fetch(`${API_BASE_URL}/api/social/following/${currentUser.id}`);
        const followData = await followResponse.json();
        
        if (followData.success) {
          const isFollowingUser = followData.following.some(follow => follow.id === parseInt(userId));
          setIsFollowing(isFollowingUser);
        }

        // Verificar estado de amistad (PÚBLICO)
        const friendResponse = await fetch(`${API_BASE_URL}/api/friends/check/${currentUser.id}/${userId}`);
        const friendData = await friendResponse.json();
        
        if (friendData.success) {
          setIsFriend(friendData.areFriends);
          
          if (friendData.pendingRequest) {
            setFriendRequestId(friendData.pendingRequest.id);
            // Determinar si la solicitud fue enviada o recibida
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
        // Actualizar el contador de seguidores
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
      }
    } catch (error) {
      console.error('Error rechazando solicitud de amistad:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Usuario no encontrado</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">El usuario que buscas no existe o ha sido eliminado.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header del perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 font-bold text-3xl">{profileUser.username?.[0]?.toUpperCase()}</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.username}</h1>
                <p className="text-gray-600 dark:text-gray-400">{profileUser.bio || 'Sin biografía'}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>📍 {profileUser.location || 'Ubicación no especificada'}</span>
                  <span>🎮 {profileUser.gaming_style || 'Estilo no especificado'}</span>
                </div>
              </div>
            </div>
            
            {currentUser && currentUser.id !== parseInt(userId) && (
              <div className="flex items-center space-x-3">
                {/* Botón de seguir */}
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>

                {/* Botón de amistad */}
                {isFriend ? (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="font-medium">Amigos</span>
                  </div>
                ) : friendRequestStatus === 'sent' ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-300 dark:border-gray-700 font-medium cursor-not-allowed"
                  >
                    Solicitud enviada
                  </button>
                ) : friendRequestStatus === 'received' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAcceptFriend(friendRequestId)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      Aceptar solicitud
                    </button>
                    <button
                      onClick={() => handleRejectFriend(friendRequestId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddFriend}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Agregar amigo</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats del usuario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userPosts.length}</div>
            <div className="text-gray-600 dark:text-gray-400">Posts</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{profileUser.followers_count || 0}</div>
            <div className="text-gray-600">Seguidores</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{profileUser.following_count || 0}</div>
            <div className="text-gray-600 dark:text-gray-400">Siguiendo</div>
          </div>
        </div>

        {/* Posts del usuario con interactividad completa */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Posts de {profileUser.username}</h2>
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
