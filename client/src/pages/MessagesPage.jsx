import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config/api';
import ChatWindow from '../components/Messages/ChatWindow';

export default function MessagesPage() {
  const { user } = useUser();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
      // Actualizar conversaciones cada 10 segundos
      const interval = setInterval(loadConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/conversations/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          <div className="flex h-full">
            {/* Lista de conversaciones */}
            <div className={`${showChat ? 'hidden lg:block' : 'block'} w-full lg:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mensajes</h2>
              </div>

              {/* Lista */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay mensajes</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Agrega amigos y empieza a chatear
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.other_user_id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                        selectedConversation?.other_user_id === conv.other_user_id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {conv.avatar ? (
                          <img
                            src={conv.avatar}
                            alt={conv.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {conv.username?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        {conv.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{conv.unread_count}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold truncate ${
                            conv.unread_count > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {conv.username}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {formatTime(conv.last_message_time)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${
                          conv.unread_count > 0 ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          {conv.last_message}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Ventana de chat */}
            <div className={`${showChat ? 'block' : 'hidden lg:block'} flex-1`}>
              <ChatWindow 
                conversation={selectedConversation} 
                onClose={() => setShowChat(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

