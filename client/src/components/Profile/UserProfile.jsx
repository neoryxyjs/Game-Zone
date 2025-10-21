import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { postAuth } from '../../utils/api';
import { useUser } from '../../context/UserContext';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useUser();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
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

      // Cargar posts del usuario (PÚBLICO - no requiere autenticación)
      const postsResponse = await fetch(`${API_BASE_URL}/api/social/feed/${userId}`);
      const postsData = await postsResponse.json();
      
      if (postsData.success) {
        setUserPosts(postsData.posts || []);
      }

      // Verificar si el usuario actual sigue a este usuario (PÚBLICO)
      if (currentUser && currentUser.id !== userId) {
        const followResponse = await fetch(`${API_BASE_URL}/api/social/following/${currentUser.id}`);
        const followData = await followResponse.json();
        
        if (followData.success) {
          const isFollowingUser = followData.following.some(follow => follow.id === parseInt(userId));
          setIsFollowing(isFollowingUser);
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
      const response = await postAuth('/api/social/follow', {
        user_id: currentUser.id,
        follow_user_id: userId
      });

      const data = await response.json();
      
      if (data.success) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error siguiendo usuario:', error);
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
            
            {currentUser && currentUser.id !== userId && (
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

        {/* Posts del usuario */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Posts de {profileUser.username}</h2>
          
          {userPosts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">Este usuario aún no ha publicado nada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center space-x-3 mb-3">
                    {post.user?.avatar ? (
                      <img
                        src={post.user.avatar}
                        alt={post.user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-bold text-xs">{post.user?.username?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{post.user?.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-900 dark:text-white mb-3">{post.content}</p>
                  
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post image"
                      className="w-full max-w-md rounded-lg mb-3"
                    />
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>❤️ {post.likes_count || 0}</span>
                    <span>💬 {post.comments_count || 0}</span>
                    {post.game_tag && <span>🎮 {post.game_tag}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
