import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

export default function Feed({ userId, isPersonalFeed = false, onNewPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [userId, isPersonalFeed]);

  // Escuchar nuevos posts
  useEffect(() => {
    if (onNewPost) {
      // Agregar el nuevo post al inicio del feed
      setPosts(prev => [onNewPost, ...prev]);
    }
  }, [onNewPost]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const endpoint = isPersonalFeed 
        ? `${API_BASE_URL}/api/social/feed/${userId}`
        : `${API_BASE_URL}/api/posts/feed`;
      
      const response = await fetch(`${endpoint}?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        if (page === 1) {
          setPosts(data.posts);
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
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Actualizar el estado local de forma segura
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
      } else {
        console.warn('No se pudo dar like:', data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error dando like:', error);
      console.warn('Error de conexión al dar like');
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUserId={userId}
            onLike={handleLike}
            onCommentAdded={() => {
              // Actualizar el contador de comentarios en el post
              setPosts(prev => prev.map(p => 
                p.id === post.id 
                  ? { ...p, comments_count: (p.comments_count || 0) + 1 }
                  : p
              ));
            }}
          />
        ))}
      
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Cargar más'}
        </button>
      )}
    </div>
  );
}

function PostCard({ post, currentUserId, onLike, onCommentAdded }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comments`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments || []);
      } else {
        console.error('Error cargando comentarios:', data.error);
        setComments([]);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevenir propagación del evento
    
    if (!newComment.trim()) {
      console.warn('Comentario vacío');
      return;
    }
    
    if (!currentUserId) {
      console.error('❌ currentUserId no está definido:', currentUserId);
      console.warn('No se puede comentar sin usuario autenticado');
      return;
    }

    try {
      console.log('Enviando comentario...', { postId: post.id, userId: currentUserId, content: newComment.trim() });
      
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: currentUserId, 
          content: newComment.trim() 
        })
      });
      
      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos del comentario:', data);
      
      if (data.success && data.comment) {
        // Agregar el comentario con datos seguros
        const newCommentData = {
          id: data.comment.id || Date.now(),
          content: data.comment.content,
          created_at: data.comment.created_at || new Date().toISOString(),
          user: {
            id: currentUserId,
            username: data.comment.user?.username || 'Usuario',
            avatar: data.comment.user?.avatar
          }
        };
        setComments(prev => [...prev, newCommentData]);
        setNewComment('');
        
        // Actualizar el contador de comentarios
        setCommentsCount(prev => prev + 1);
        
        // Notificar al componente padre si es necesario
        if (onCommentAdded) {
          onCommentAdded(post.id);
        }
        
        console.log('✅ Comentario agregado exitosamente');
      } else {
        console.error('❌ Error comentando:', data.error || 'Error desconocido');
        // Mostrar error sin alert
        console.warn('No se pudo comentar:', data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('❌ Error comentando:', error);
      // Mostrar error sin alert
      console.warn('Error de conexión al comentar');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header del post */}
      <div className="flex items-center space-x-3 mb-4">
        <Link to={`/user/${post.user_id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                 {post.avatar ? (
                   <img 
                     src={post.avatar} 
                     alt={post.username}
                     className="w-10 h-10 rounded-full object-cover"
                   />
                 ) : (
                   <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                     <span className="text-gray-600 font-bold text-sm">{post.username?.[0]?.toUpperCase()}</span>
                   </div>
                 )}
          <div>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600">{post.username}</h3>
            <p className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </Link>
        {post.game_tag && (
          <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {post.game_tag}
          </span>
        )}
      </div>

      {/* Contenido del post */}
      <div className="mb-4">
        <p className="text-gray-800">{post.content}</p>
        {post.image_url && (
          <img 
            src={post.image_url} 
            alt="Post image"
            className="mt-3 rounded-lg max-w-full h-auto"
          />
        )}
      </div>

      {/* Acciones del post */}
      <div className="flex items-center space-x-6 text-gray-500">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center space-x-1 hover:text-red-500"
        >
          <span>❤️</span>
          <span>{post.likes_count}</span>
        </button>
        
        <button
          onClick={() => {
            setShowComments(!showComments);
            if (!showComments && comments.length === 0) {
              loadComments();
            }
          }}
          className="flex items-center space-x-1 hover:text-blue-500"
        >
          <span>💬</span>
          <span>{commentsCount}</span>
        </button>
      </div>

      {/* Comentarios */}
      {showComments && (
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Comentarios</h4>
            <button
              onClick={() => setShowComments(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕ Cerrar
            </button>
          </div>
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleComment(e);
                  }
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={(e) => {
                  e.preventDefault();
                  handleComment(e);
                }}
              >
                Comentar
              </button>
            </div>
          </form>

          {loadingComments ? (
            <div className="text-center py-2">Cargando comentarios...</div>
          ) : (
            <div className="space-y-3">
              {comments && comments.length > 0 ? (
                comments.map(comment => {
                  // Validar que el comentario tenga datos válidos
                  if (!comment || !comment.id) {
                    return null;
                  }
                  
                  return (
                    <div key={comment.id} className="flex space-x-3">
                      <Link to={`/user/${comment.user?.id}`} className="flex-shrink-0">
                        {comment.user?.avatar ? (
                          <img 
                            src={comment.user.avatar} 
                            alt={comment.user.username || 'Usuario'}
                            className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-bold text-xs">{comment.user?.username?.[0]?.toUpperCase()}</span>
                          </div>
                        )}
                      </Link>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <Link 
                            to={`/user/${comment.user?.id}`}
                            className="font-semibold text-sm hover:text-blue-600 transition-colors"
                          >
                            {comment.user?.username || 'Usuario'}
                          </Link>
                          <p className="text-gray-800">
                            {comment.content || 'Comentario sin contenido'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {comment.created_at 
                            ? new Date(comment.created_at).toLocaleDateString('es-ES')
                            : 'Ahora'
                          }
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
