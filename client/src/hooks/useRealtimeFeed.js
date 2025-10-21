import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config/api';

export const useRealtimeFeed = (userId, gameFilter = null, enabled = true) => {
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [latestPostId, setLatestPostId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  const intervalRef = useRef(null);

  const checkForNewPosts = useCallback(async () => {
    if (!enabled || !latestPostId) return;

    try {
      const gameParam = gameFilter ? `&game=${encodeURIComponent(gameFilter)}` : '';
      const response = await fetch(
        `${API_BASE_URL}/api/posts/feed?page=1&limit=1${gameParam}`
      );
      const data = await response.json();

      if (data.success && data.posts && data.posts.length > 0) {
        const newestPost = data.posts[0];
        
        // Si hay un post más nuevo que el último que vimos
        if (newestPost.id > latestPostId) {
          setNewPostsCount(prev => prev + 1);
          setNotificationData({
            username: newestPost.user?.username || 'Alguien',
            content: newestPost.content?.substring(0, 50) + '...',
            game_tag: newestPost.game_tag,
            avatar: newestPost.user?.avatar
          });
          setShowNotification(true);
          
          // Ocultar notificación después de 5 segundos
          setTimeout(() => {
            setShowNotification(false);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error verificando nuevos posts:', error);
    }
  }, [latestPostId, gameFilter, enabled]);

  // Iniciar polling cada 30 segundos
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(checkForNewPosts, 30000); // 30 segundos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkForNewPosts, enabled]);

  const updateLatestPostId = (postId) => {
    if (!latestPostId || postId > latestPostId) {
      setLatestPostId(postId);
    }
  };

  const resetNewPostsCount = () => {
    setNewPostsCount(0);
  };

  const dismissNotification = () => {
    setShowNotification(false);
  };

  return {
    newPostsCount,
    showNotification,
    notificationData,
    updateLatestPostId,
    resetNewPostsCount,
    dismissNotification
  };
};

