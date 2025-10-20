import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
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
      
      // Cargar información del usuario
      const userResponse = await fetch(`${API_BASE_URL}/api/profiles/${userId}`);
      const userData = await userResponse.json();
      
      if (userData.success) {
        setProfileUser(userData.profile);
      } else {
        setError('Usuario no encontrado');
      }

      // Cargar posts del usuario
      const postsResponse = await fetch(`${API_BASE_URL}/api/social/feed/${userId}`);
      const postsData = await postsResponse.json();
      
      if (postsData.success) {
        setUserPosts(postsData.posts || []);
      }

      // Verificar si el usuario actual sigue a este usuario
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
      const response = await fetch(`${API_BASE_URL}/api/social/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          follow_user_id: userId
        })
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h1>
          <p className="text-gray-600 mb-6">El usuario que buscas no existe o ha sido eliminado.</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header del perfil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={profileUser.avatar || '/default-avatar.png'}
                alt={profileUser.username}
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profileUser.username}</h1>
                <p className="text-gray-600">{profileUser.bio || 'Sin biografía'}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{userPosts.length}</div>
            <div className="text-gray-600">Posts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{profileUser.followers_count || 0}</div>
            <div className="text-gray-600">Seguidores</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{profileUser.following_count || 0}</div>
            <div className="text-gray-600">Siguiendo</div>
          </div>
        </div>

        {/* Posts del usuario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Posts de {profileUser.username}</h2>
          
          {userPosts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">Este usuario aún no ha publicado nada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={post.user?.avatar || '/default-avatar.png'}
                      alt={post.user?.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{post.user?.username}</p>
                      <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-900 mb-3">{post.content}</p>
                  
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post image"
                      className="w-full max-w-md rounded-lg mb-3"
                    />
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
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
