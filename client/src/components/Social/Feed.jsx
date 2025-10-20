import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

export default function Feed({ userId, isPersonalFeed = false }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [userId, isPersonalFeed]);

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
      
      const data = await response.json();
      if (data.success) {
        // Actualizar el estado local
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: data.liked 
                  ? post.likes_count + 1 
                  : post.likes_count - 1 
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error dando like:', error);
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

function PostCard({ post, currentUserId, onLike }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

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
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: currentUserId, 
          content: newComment 
        })
      });
      
      const data = await response.json();
      if (data.success && data.comment) {
        setComments(prev => [...prev, data.comment]);
        setNewComment('');
      } else {
        console.error('Error comentando:', data.error || 'Error desconocido');
        alert('Error al comentar: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error comentando:', error);
      alert('Error de conexión al comentar');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header del post */}
      <div className="flex items-center space-x-3 mb-4">
        <img 
          src={post.avatar || '/default-avatar.png'} 
          alt={post.username}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h3 className="font-semibold text-gray-900">{post.username}</h3>
          <p className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
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
          <span>{post.comments_count}</span>
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
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3">
                    <img 
                      src={comment.user?.avatar || '/default-avatar.png'} 
                      alt={comment.user?.username || 'Usuario'}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="font-semibold text-sm">{comment.user?.username || 'Usuario'}</p>
                        <p className="text-gray-800">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))
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
