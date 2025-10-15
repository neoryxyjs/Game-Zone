import React, { useState } from 'react';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ArrowPathRoundedSquareIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function PostItem({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const getGameColor = (game) => {
    return game === 'League of Legends' ? 'bg-blue-600' : 'bg-red-600';
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-6">
        {/* User Header */}
        <div className="flex items-start space-x-3 mb-4">
          <img
            src={post.avatar}
            alt={post.username}
            className="h-10 w-10 rounded-full ring-1 ring-gray-900/5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {post.username}
              </h3>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white ${getGameColor(post.game)}`}>
                {post.game === 'League of Legends' ? 'LoL' : 'Valorant'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="font-medium">{post.rank}</span>
              <span>•</span>
              <span>{post.timestamp}</span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-900 text-base leading-relaxed">{post.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className={`group flex items-center space-x-2 text-sm font-medium transition-colors duration-200 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              {isLiked ? (
                <HeartIconSolid className="h-4 w-4" />
              ) : (
                <HeartIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span>{likeCount}</span>
            </button>
            
            <button className="group flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors duration-200">
              <ChatBubbleLeftIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span>{post.comments}</span>
            </button>
            
            <button className="group flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-green-500 transition-colors duration-200">
              <ArrowPathRoundedSquareIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Compartir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 