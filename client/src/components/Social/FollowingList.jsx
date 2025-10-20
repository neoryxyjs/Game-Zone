import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

export default function FollowingList({ currentUserId }) {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [activeTab, setActiveTab] = useState('following');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios que sigue
      const followingResponse = await fetch(`${API_BASE_URL}/api/social/following/${currentUserId}`);
      const followingData = await followingResponse.json();
      
      // Cargar seguidores
      const followersResponse = await fetch(`${API_BASE_URL}/api/social/followers/${currentUserId}`);
      const followersData = await followersResponse.json();
      
      if (followingData.success) {
        setFollowing(followingData.following);
      }
      
      if (followersData.success) {
        setFollowers(followersData.followers);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/social/unfollow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          follower_id: currentUserId,
          following_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Dejaste de seguir al usuario');
        loadData(); // Refrescar datos
      } else {
        alert(data.message || 'Error');
      }
    } catch (error) {
      console.error('Error dejando de seguir:', error);
      alert('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Red Social
        </h2>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('following')}
            className={`py-2 px-4 rounded-lg ${
              activeTab === 'following'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Siguiendo ({following.length})
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`py-2 px-4 rounded-lg ${
              activeTab === 'followers'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Seguidores ({followers.length})
          </button>
        </div>

        {/* Lista de usuarios */}
        <div className="space-y-3">
          {activeTab === 'following' && (
            <>
              {following.length > 0 ? (
                following.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <Link to={`/user/${user.id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-bold">{user.username?.[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600">{user.username}</h3>
                        <p className="text-sm text-gray-600">
                          Siguiendo desde {new Date(user.followed_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleUnfollow(user.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Dejar de seguir
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No sigues a ningún usuario aún
                </p>
              )}
            </>
          )}

          {activeTab === 'followers' && (
            <>
              {followers.length > 0 ? (
                followers.map(user => (
                  <div key={user.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-bold">{user.username?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.username}</h3>
                      <p className="text-sm text-gray-600">
                        Te sigue desde {new Date(user.followed_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aún no tienes seguidores
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
