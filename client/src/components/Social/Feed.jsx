import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { postAuth, deleteAuth } from '../../utils/api';

export default function Feed({ userId, isPersonalFeed = false, onNewPost, gameFilter = null }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [userId, isPersonalFeed, gameFilter]);

  // Escuchar nuevos posts
  useEffect(() => {
    if (onNewPost) {
      setPosts(prev => [onNewPost, ...prev]);
    }
  }, [onNewPost]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const endpoint = isPersonalFeed 
        ? `${API_BASE_URL}/api/social/feed/${userId}`
        : `${API_BASE_URL}/api/posts/feed`;
      
      // Agregar filtro de juego si está presente
      const gameParam = gameFilter ? `&game=${encodeURIComponent(gameFilter)}` : '';
      const response = await fetch(`${endpoint}?page=${page}&limit=10${gameParam}`);
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
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gameFilter && (
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Filtrando por: {gameFilter}</h3>
              <p className="text-sm text-gray-600">Mostrando solo publicaciones de {gameFilter}</p>
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
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {gameFilter ? `No hay publicaciones de ${gameFilter} aún` : 'No hay publicaciones aún'}
          </h3>
          <p className="text-gray-500">
            {gameFilter ? `Sé el primero en compartir algo sobre ${gameFilter}` : 'Sé el primero en compartir algo en GameZone'}
          </p>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, userId, onLike, onDelete, index }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const loadComments = async () => {
    if (comments.length > 0) return;
    
    try {
      setCommentsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comments`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || commentLoading) return;

    try {
      setCommentLoading(true);
      const response = await postAuth(`/api/posts/${post.id}/comment`, {
        user_id: userId,
        content: newComment.trim()
      });

      const data = await response.json();
      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error comentando:', error);
    } finally {
      setCommentLoading(false);
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
    <article className="card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
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
            <Link to={`/user/${post.user_id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
              {post.user?.username || 'Usuario'}
            </Link>
            {post.game_tag && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {post.game_tag}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
        </div>

        {/* Botón de eliminar (solo visible para el autor) */}
        {post.user_id === userId && (
          <button
            onClick={handleDelete}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors group"
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
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        
        {post.image_url && (
          <div className="mt-4">
            <img 
              src={post.image_url} 
              alt="Post image" 
              className="w-full max-w-md rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onError={(e) => {
                // Evitar bucle infinito: solo ocultar la imagen si falla
                e.target.onerror = null; // Remover el handler para evitar bucle
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Acciones del post */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors duration-200 group"
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
            className="flex items-center space-x-2 text-gray-500 hover:text-indigo-500 transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{comments.length}</span>
          </button>
        </div>
      </div>

      {/* Sección de comentarios */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          {/* Formulario de comentario */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {userId ? String(userId).charAt(0) : 'U'}
                </div>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  disabled={commentLoading}
                />
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
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
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
                    <div className="flex items-center space-x-2">
                      <Link to={`/user/${comment.user_id}`} className="font-medium text-gray-900 hover:text-indigo-600 transition-colors text-sm">
                        {comment.user?.username || 'Usuario'}
                      </Link>
                      <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No hay comentarios aún</p>
          )}
        </div>
      )}
    </article>
  );
}