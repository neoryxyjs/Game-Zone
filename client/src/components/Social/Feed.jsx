import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { postAuth, deleteAuth } from '../../utils/api';
import Lightbox from '../Common/Lightbox';

export default function Feed({ userId, isPersonalFeed = false, onNewPost, gameFilter = null, customEndpoint = null }) {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPostsAvailable, setNewPostsAvailable] = useState(0);
  const [lastPostId, setLastPostId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const pollingIntervalRef = useRef(null);
  const navigationHandledRef = useRef(false);

  useEffect(() => {
    loadPosts();
  }, [userId, isPersonalFeed, gameFilter]);

  // Escuchar nuevos posts
  useEffect(() => {
    if (onNewPost) {
      setPosts(prev => [onNewPost, ...prev]);
      setLastPostId(onNewPost.id);
    }
  }, [onNewPost]);

  // Polling para detectar nuevos posts cada 15 segundos
  useEffect(() => {
    if (!isPersonalFeed && posts.length > 0) {
      pollingIntervalRef.current = setInterval(checkForNewPosts, 15000);
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [posts.length, isPersonalFeed, lastPostId]);

  // Resetear flag cuando cambia la URL
  useEffect(() => {
    navigationHandledRef.current = false;
  }, [location.search]);

  // Manejar navegación desde notificaciones
  useEffect(() => {
    console.log('🔍 Navegación: loading=', loading, 'posts=', posts.length, 'location=', location.search);
    
    if (loading || posts.length === 0) {
      console.log('⏳ Esperando... loading o posts vacíos');
      return;
    }

    const params = new URLSearchParams(location.search);
    const postId = params.get('post');
    const commentId = params.get('comment');

    console.log('📍 Query params:', { postId, commentId });

    if (postId && !navigationHandledRef.current) {
      console.log('✅ Navegando al post:', postId);
      navigationHandledRef.current = true;

      // Esperar a que el DOM esté listo
      setTimeout(() => {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        console.log('🎯 Post encontrado:', !!postElement);
        
        if (postElement) {
          // Scroll al post
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Highlight del post
          postElement.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50');
          setTimeout(() => {
            postElement.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50');
          }, 2000);

          // SIEMPRE abrir comentarios si viene de una notificación (independiente de commentId)
          console.log('💬 Buscando botón de comentarios...');
          const toggleButton = postElement.querySelector('[data-toggle-comments]');
          console.log('🔘 Botón encontrado:', !!toggleButton, 'abierto:', toggleButton?.classList.contains('comments-open'));
          
          if (toggleButton && !toggleButton.classList.contains('comments-open')) {
            console.log('🖱️ Haciendo click en comentarios...');
            toggleButton.click();
            
            // Si hay commentId específico, hacer scroll a ese comentario
            if (commentId) {
              setTimeout(() => {
                const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                console.log('💬 Comentario encontrado:', !!commentElement);
                
                if (commentElement) {
                  commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  
                  // Highlight del comentario
                  commentElement.classList.add('ring-2', 'ring-yellow-500', 'ring-opacity-50', 'bg-yellow-50', 'dark:bg-yellow-900/20');
                  setTimeout(() => {
                    commentElement.classList.remove('ring-2', 'ring-yellow-500', 'ring-opacity-50', 'bg-yellow-50', 'dark:bg-yellow-900/20');
                  }, 3000);
                } else {
                  console.log('⚠️ Comentario no encontrado, pero comentarios abiertos');
                }
              }, 1500);
            } else {
              console.log('ℹ️ Sin comment_id específico, solo abriendo comentarios');
            }
          } else if (toggleButton?.classList.contains('comments-open')) {
            // Si ya están abiertos y hay commentId, hacer scroll
            console.log('✅ Comentarios ya abiertos');
            if (commentId) {
              setTimeout(() => {
                const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                if (commentElement) {
                  commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  commentElement.classList.add('ring-2', 'ring-yellow-500', 'ring-opacity-50', 'bg-yellow-50', 'dark:bg-yellow-900/20');
                  setTimeout(() => {
                    commentElement.classList.remove('ring-2', 'ring-yellow-500', 'ring-opacity-50', 'bg-yellow-50', 'dark:bg-yellow-900/20');
                  }, 3000);
                }
              }, 500);
            }
          }
        } else {
          console.log('❌ Post no encontrado en el DOM');
        }
      }, 500);
    }
  }, [loading, posts, location.search]);

  const checkForNewPosts = async () => {
    if (!lastPostId) return;
    
    try {
      const endpoint = isPersonalFeed 
        ? `${API_BASE_URL}/api/social/feed/${userId}`
        : `${API_BASE_URL}/api/posts/feed`;
      
      const gameParam = gameFilter ? `&game=${encodeURIComponent(gameFilter)}` : '';
      const response = await fetch(`${endpoint}?page=1&limit=5${gameParam}`);
      const data = await response.json();
      
      if (data.success && data.posts) {
        const newPosts = data.posts.filter(post => post.id > lastPostId);
        if (newPosts.length > 0) {
          setNewPostsAvailable(newPosts.length);
        }
      }
    } catch (error) {
      console.error('Error verificando nuevos posts:', error);
    }
  };

  const loadNewPosts = async () => {
    setRefreshing(true);
    try {
      const endpoint = isPersonalFeed 
        ? `${API_BASE_URL}/api/social/feed/${userId}`
        : `${API_BASE_URL}/api/posts/feed`;
      
      const gameParam = gameFilter ? `&game=${encodeURIComponent(gameFilter)}` : '';
      const response = await fetch(`${endpoint}?page=1&limit=10${gameParam}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
        if (data.posts.length > 0) {
          setLastPostId(data.posts[0].id);
        }
        setNewPostsAvailable(0);
      }
    } catch (error) {
      console.error('Error cargando nuevos posts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const endpoint = customEndpoint 
        ? `${API_BASE_URL}${customEndpoint}`
        : isPersonalFeed 
          ? `${API_BASE_URL}/api/social/feed/${userId}`
          : `${API_BASE_URL}/api/posts/feed`;
      
      // Agregar filtro de juego si está presente
      const gameParam = gameFilter ? `&game=${encodeURIComponent(gameFilter)}` : '';
      const response = await fetch(`${endpoint}?page=${page}&limit=10${gameParam}`);
      const data = await response.json();
      
      if (data.success) {
        if (page === 1) {
          setPosts(data.posts);
          if (data.posts.length > 0) {
            setLastPostId(data.posts[0].id);
          }
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.posts.length === 10);
      }
    } catch (error) {
      console.error('Error cargando posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      loadPosts();
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await postAuth(`/api/posts/${postId}/like`, {
        user_id: userId
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: data.liked 
                ? (post.likes_count || 0) + 1 
                : Math.max(0, (post.likes_count || 0) - 1)
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error dando like:', error);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <SkeletonPost />
        <SkeletonPost />
        <SkeletonPost />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de nuevos posts disponibles */}
      {newPostsAvailable > 0 && (
        <div className="animate-notification-slide">
          <button
            onClick={loadNewPosts}
            disabled={refreshing}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {refreshing ? (
              <>
                <div className="loading-spinner border-white"></div>
                <span>Cargando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <span>{newPostsAvailable} {newPostsAvailable === 1 ? 'nueva publicación' : 'nuevas publicaciones'} disponible{newPostsAvailable === 1 ? '' : 's'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {gameFilter && (
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-l-4 border-indigo-500">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Filtrando por: {gameFilter}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mostrando solo publicaciones de {gameFilter}</p>
            </div>
          </div>
        </div>
      )}
      
      {posts.map((post, index) => (
        <PostCard 
          key={post.id} 
          post={post} 
          userId={userId}
          onLike={handleLike}
          onDelete={handleDeletePost}
          index={index}
        />
      ))}
      
      {hasMore && (
        <div className="text-center py-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-secondary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="loading-spinner mr-2"></div>
                Cargando más...
              </div>
            ) : (
              'Cargar más publicaciones'
            )}
          </button>
        </div>
      )}
      
      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {gameFilter ? `No hay publicaciones de ${gameFilter} aún` : 'No hay publicaciones aún'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {gameFilter ? `Sé el primero en compartir algo sobre ${gameFilter}` : 'Sé el primero en compartir algo en GameZone'}
          </p>
        </div>
      )}
    </div>
  );
}

// Componente de skeleton loader para posts
function SkeletonPost() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
      <div className="flex items-center space-x-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );
}

function PostCard({ post, userId, onLike, onDelete, index }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [commentsCount, setCommentsCount] = useState(parseInt(post.comments_count) || 0);
  const [replyingTo, setReplyingTo] = useState(null); // ID del comentario al que se está respondiendo
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null); // Para el lightbox
  const [lightboxType, setLightboxType] = useState('image'); // 'image' o 'video'
  const pollingCommentsRef = useRef(null);

  // Auto-actualización de comentarios cuando están abiertos
  useEffect(() => {
    if (showComments) {
      pollingCommentsRef.current = setInterval(loadCommentsUpdate, 10000); // Cada 10 segundos
      return () => {
        if (pollingCommentsRef.current) {
          clearInterval(pollingCommentsRef.current);
        }
      };
    }
  }, [showComments, post.id]);

  const loadComments = async () => {
    if (comments.length > 0) return;
    
    try {
      setCommentsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comments`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments || []);
        setCommentsCount(data.comments?.length || 0);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadCommentsUpdate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comments`);
      const data = await response.json();
      
      if (data.success) {
        // Solo actualizar si hay nuevos comentarios
        if (data.comments?.length !== comments.length) {
          setComments(data.comments || []);
          setCommentsCount(data.comments?.length || 0);
        }
      }
    } catch (error) {
      console.error('Error actualizando comentarios:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || commentLoading) return;

    try {
      setCommentLoading(true);
      setIsTyping(false);
      const response = await postAuth(`/api/posts/${post.id}/comment`, {
        user_id: userId,
        content: newComment.trim()
      });

      const data = await response.json();
      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setCommentsCount(prev => prev + 1);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error comentando:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleReply = async (e, commentId, replyToReplyId = null, replyToUsername = null) => {
    e.preventDefault();
    if (!replyContent.trim() || replyLoading) return;

    try {
      setReplyLoading(true);
      const response = await postAuth(`/api/posts/${post.id}/comments/${commentId}/reply`, {
        user_id: userId,
        content: replyContent.trim(),
        reply_to_reply_id: replyToReplyId,
        reply_to_username: replyToUsername
      });

      const data = await response.json();
      if (data.success) {
        // Actualizar el comentario con la nueva respuesta
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data.reply],
              replies_count: (comment.replies_count || 0) + 1
            };
          }
          return comment;
        }));
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error respondiendo:', error);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      return;
    }

    try {
      const response = await deleteAuth(`/api/posts/${post.id}`);

      const data = await response.json();
      if (data.success) {
        // Llamar a la función onDelete del componente padre
        if (onDelete) {
          onDelete(post.id);
        }
      } else {
        alert(data.message || 'Error al eliminar el post');
      }
    } catch (error) {
      console.error('Error eliminando post:', error);
      alert('Error al eliminar el post');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <article 
      className="card animate-slide-up" 
      style={{ animationDelay: `${index * 0.1}s` }}
      data-post-id={post.id}
    >
      {/* Header del post */}
      <div className="flex items-start space-x-3 mb-4">
        <Link to={`/user/${post.user_id}`} className="flex-shrink-0">
          {post.user?.avatar ? (
            <img 
              src={post.user.avatar} 
              alt={post.user.username} 
              className="avatar"
            />
          ) : (
            <div className="avatar bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {post.user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Link to={`/user/${post.user_id}`} className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {post.user?.username || 'Usuario'}
            </Link>
            {post.game_tag && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {post.game_tag}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.created_at)}</p>
        </div>

        {/* Botón de eliminar (solo visible para el autor) */}
        {post.user_id === userId && (
          <button
            onClick={handleDelete}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors group"
            title="Eliminar post"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Contenido del post */}
      <div className="mb-4">
        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        
        {post.image_url && (
          <div className="mt-4">
            {post.image_url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
              <div className="relative group">
                <video 
                  src={post.image_url} 
                  controls
                  className="w-full max-w-md rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                >
                  Tu navegador no soporta el tag de video.
                </video>
                <button
                  onClick={() => {
                    setLightboxMedia(post.image_url);
                    setLightboxType('video');
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Ver en pantalla completa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative group">
                <img 
                  src={post.image_url} 
                  alt="Post image" 
                  className="w-full max-w-md rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => {
                    setLightboxMedia(post.image_url);
                    setLightboxType('image');
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                  <div className="bg-white/90 dark:bg-gray-900/90 p-2 rounded-full">
                    <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Acciones del post */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">{post.likes_count || 0}</span>
          </button>
          
          <button 
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments) loadComments();
            }}
            data-toggle-comments
            className={`flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors duration-200 group ${showComments ? 'comments-open' : ''}`}
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{commentsCount || comments.length}</span>
          </button>
        </div>
      </div>

      {/* Sección de comentarios */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          {/* Formulario de comentario */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {userId ? String(userId).charAt(0) : 'U'}
                </div>
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Escribe un comentario..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-smooth"
                  disabled={commentLoading}
                />
                {isTyping && !commentLoading && (
                  <div className="absolute -bottom-5 left-0 text-xs text-indigo-500 flex items-center space-x-1 animate-pulse-subtle">
                    <span className="inline-block w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="inline-block w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="inline-block w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!newComment.trim() || commentLoading}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Comentar'
                )}
              </button>
            </div>
          </form>

          {/* Lista de comentarios */}
          {commentsLoading ? (
            <div className="flex justify-center py-4">
              <div className="loading-spinner"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-3" data-comment-id={comment.id}>
                  {/* Comentario principal */}
                  <div className="flex space-x-3">
                    <Link to={`/user/${comment.user_id}`} className="flex-shrink-0">
                      {comment.user?.avatar ? (
                        <img 
                          src={comment.user.avatar} 
                          alt={comment.user.username} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {comment.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                        <Link to={`/user/${comment.user_id}`} className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm">
                          {comment.user?.username || 'Usuario'}
                        </Link>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{comment.content}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 ml-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</span>
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                          Responder
                        </button>
                        {comment.replies_count > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.replies_count} {comment.replies_count === 1 ? 'respuesta' : 'respuestas'}
                          </span>
                        )}
                      </div>

                      {/* Formulario de respuesta */}
                      {replyingTo === comment.id && (
                        <form onSubmit={(e) => handleReply(e, comment.id)} className="mt-3 ml-4">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`Responder a ${comment.user?.username}...`}
                              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              autoFocus
                              disabled={replyLoading}
                            />
                            <button
                              type="submit"
                              disabled={!replyContent.trim() || replyLoading}
                              className="btn-primary px-3 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {replyLoading ? '...' : 'Enviar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Respuestas anidadas */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-2">
                              <Link to={`/user/${reply.user_id}`} className="flex-shrink-0">
                                {reply.user?.avatar ? (
                                  <img 
                                    src={reply.user.avatar} 
                                    alt={reply.user.username} 
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {reply.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                )}
                              </Link>
                              <div className="flex-1">
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-3 py-2">
                                  <Link to={`/user/${reply.user_id}`} className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs">
                                    {reply.user?.username || 'Usuario'}
                                  </Link>
                                  {reply.reply_to_username && (
                                    <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-1">
                                      → {reply.reply_to_username}
                                    </span>
                                  )}
                                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{reply.content}</p>
                                </div>
                                <div className="flex items-center space-x-3 ml-3 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(reply.created_at)}</span>
                                  <button
                                    onClick={() => {
                                      setReplyingTo(`reply-${reply.id}`);
                                      setReplyContent('');
                                    }}
                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                  >
                                    Responder
                                  </button>
                                </div>

                                {/* Formulario para responder a una respuesta */}
                                {replyingTo === `reply-${reply.id}` && (
                                  <form onSubmit={(e) => handleReply(e, comment.id, reply.id, reply.user?.username)} className="mt-2 ml-3">
                                    <div className="flex space-x-2">
                                      <input
                                        type="text"
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder={`Responder a ${reply.user?.username}...`}
                                        className="flex-1 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        autoFocus
                                        disabled={replyLoading}
                                      />
                                      <button
                                        type="submit"
                                        disabled={!replyContent.trim() || replyLoading}
                                        className="btn-primary px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {replyLoading ? '...' : 'Enviar'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyingTo(null);
                                          setReplyContent('');
                                        }}
                                        className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No hay comentarios aún</p>
          )}
        </div>
      )}
      {/* Lightbox para ver imágenes/videos en grande */}
      {lightboxMedia && (
        <Lightbox
          src={lightboxMedia}
          type={lightboxType}
          onClose={() => setLightboxMedia(null)}
        />
      )}
    </article>
  );
}