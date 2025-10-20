import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { API_BASE_URL } from '../../config/api';

export default function CommentNotification({ postId, onNewComment }) {
  const { user } = useUser();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Simular notificación cuando hay un nuevo comentario
  useEffect(() => {
    if (onNewComment) {
      setNotificationMessage('¡Nuevo comentario en tu post!');
      setShowNotification(true);
      
      // Auto-ocultar después de 3 segundos
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [onNewComment]);

  // Crear notificación en el backend
  const createNotification = async (type, message, targetUserId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: targetUserId,
          type: type,
          message: message,
          is_read: false
        })
      });
      
      if (response.ok) {
        console.log('Notificación creada:', message);
      }
    } catch (error) {
      console.error('Error creando notificación:', error);
    }
  };

  // Notificar al autor del post cuando alguien comenta
  const notifyPostAuthor = async (commenterName, postAuthorId) => {
    if (postAuthorId !== user?.id) { // No notificar a sí mismo
      await createNotification(
        'comment',
        `${commenterName} comentó en tu post`,
        postAuthorId
      );
    }
  };

  return (
    <>
      {/* Notificación flotante estilo Facebook */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notificationMessage}</p>
                <p className="text-xs text-gray-500">Hace unos segundos</p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Función helper para notificar comentarios
export const notifyComment = async (commenterName, postAuthorId, postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: postAuthorId,
        type: 'comment',
        message: `${commenterName} comentó en tu post`,
        is_read: false
      })
    });
    
    if (response.ok) {
      console.log('✅ Notificación de comentario enviada');
    }
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
  }
};
