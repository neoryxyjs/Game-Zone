import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

export default function UserSearch({ currentUserId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/social/search/users?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error buscando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchUsers(searchTerm);
  };

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/social/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          follower_id: currentUserId,
          following_id: userId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Usuario seguido exitosamente');
        searchUsers(searchTerm); // Refrescar resultados
      } else {
        alert(data.message || 'Error siguiendo al usuario');
      }
    } catch (error) {
      console.error('Error siguiendo usuario:', error);
      alert('Error de conexión');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Descubrir Usuarios
        </h2>
        
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre de usuario o juego..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {users.length > 0 && (
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <Link to={`/user/${user.id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <img 
                    src={user.avatar || '/default-avatar.png'} 
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600">{user.username}</h3>
                    <p className="text-sm text-gray-600">{user.game} - {user.rank}</p>
                  </div>
                </Link>
                <button
                  onClick={() => handleFollow(user.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Seguir
                </button>
              </div>
            ))}
          </div>
        )}

        {searchTerm && users.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-4">
            No se encontraron usuarios con ese término
          </p>
        )}
      </div>
    </div>
  );
}
