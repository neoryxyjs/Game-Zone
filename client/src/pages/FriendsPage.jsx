import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import FriendsManager from '../components/Friends/FriendsManager';

export default function FriendsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadFriendsData();
  }, [user]);

  const loadFriendsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('🔍 Cargando datos para user ID:', user.id);
      
      // Cargar amigos
      const friendsResponse = await fetch(`${API_BASE_URL}/api/friends/list/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const friendsData = await friendsResponse.json();
      console.log('👥 Amigos:', friendsData);

      // Cargar solicitudes recibidas
      const receivedResponse = await fetch(`${API_BASE_URL}/api/friends/requests/received/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const receivedData = await receivedResponse.json();
      console.log('📥 Solicitudes recibidas:', receivedData);

      // Cargar solicitudes enviadas
      const sentResponse = await fetch(`${API_BASE_URL}/api/friends/requests/sent/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const sentData = await sentResponse.json();
      console.log('📤 Solicitudes enviadas:', sentData);

      if (friendsData.success) {
        setFriends(friendsData.friends || []);
      }
      if (receivedData.success) {
        setPendingRequests(receivedData.requests || []);
        console.log('✅ Solicitudes pendientes seteadas:', receivedData.requests);
      }
      if (sentData.success) {
        setSentRequests(sentData.requests || []);
      }
    } catch (error) {
      console.error('❌ Error cargando datos de amigos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/friends/accept/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Recargar datos
        loadFriendsData();
      } else {
        alert(data.message || 'Error al aceptar solicitud');
      }
    } catch (error) {
      console.error('Error aceptando solicitud:', error);
      alert('Error al aceptar solicitud');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/friends/reject/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Recargar datos
        loadFriendsData();
      } else {
        alert(data.message || 'Error al rechazar solicitud');
      }
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      alert('Error al rechazar solicitud');
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar a este amigo?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/friends/remove/${friendshipId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Recargar datos
        loadFriendsData();
      } else {
        alert(data.message || 'Error al eliminar amigo');
      }
    } catch (error) {
      console.error('Error eliminando amigo:', error);
      alert('Error al eliminar amigo');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/friends/reject/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Recargar datos
        loadFriendsData();
      } else {
        alert(data.message || 'Error al cancelar solicitud');
      }
    } catch (error) {
      console.error('Error cancelando solicitud:', error);
      alert('Error al cancelar solicitud');
    }
  };

  const handleSendMessage = (friendId) => {
    navigate(`/messages?user=${friendId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Amigos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona tus amistades y solicitudes</p>
        </div>

        <FriendsManager
          friends={friends}
          pendingRequests={pendingRequests}
          sentRequests={sentRequests}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onRemoveFriend={handleRemoveFriend}
          onCancelRequest={handleCancelRequest}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

