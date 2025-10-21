import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

const OnlineUsers = ({ currentUserId }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnlineUsers();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOnlineUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/online`); // Ruta corregida
      const data = await response.json();
      
      if (data.success) {
        setOnlineUsers(data.users);
      }
    } catch (error) {
      console.error('Error cargando usuarios en línea:', error);
      setOnlineUsers([]); // Evitar errores si falla
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'En línea';
      case 'away': return 'Ausente';
      default: return 'Desconectado';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Usuarios en línea</h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-800 mb-3">
        Usuarios en línea ({onlineUsers.length})
      </h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {onlineUsers.map(user => (
          <div key={user.id} className="flex items-center space-x-3">
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-sm">{user.username?.[0]?.toUpperCase()}</span>
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user.username}
              </p>
              <p className="text-sm text-gray-500">
                {getStatusText(user.status)}
              </p>
            </div>
          </div>
        ))}
        
        {onlineUsers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No hay usuarios en línea
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
