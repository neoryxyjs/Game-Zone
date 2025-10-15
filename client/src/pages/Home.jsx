import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NewPostForm from '../components/Forum/NewPostForm';
import PostList from '../components/Forum/PostList';

export default function Home() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: 'DragonSlayer99',
      game: 'League of Legends',
      rank: 'Diamond II',
      content: '¿Alguien quiere hacer duo en ranked? Estoy en promos a Diamond I y necesito un buen support. Preferiblemente alguien que juegue Thresh o Leona.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      timestamp: '2 horas',
      likes: 12,
      comments: 5
    },
    {
      id: 2,
      username: 'ValorantPro',
      game: 'Valorant',
      rank: 'Immortal 2',
      content: 'Nuevo meta con Chamber está OP. ¿Qué opinan? Creo que necesita un nerf urgente en su utilidad.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      timestamp: '4 horas',
      likes: 8,
      comments: 3
    },
    {
      id: 3,
      username: 'MidLaneCarry',
      game: 'League of Legends',
      rank: 'Master',
      content: 'Acabo de conseguir mi promoción a Master! Después de 3 años jugando finalmente lo logré. Gracias a todos los que me apoyaron.',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      timestamp: '6 horas',
      likes: 25,
      comments: 12
    }
  ]);

  const addPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Bienvenido a <span className="text-yellow-300">GameZone</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              La comunidad definitiva para jugadores de League of Legends y Valorant. 
              Conecta, compite y crece con otros gamers apasionados.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <button
                onClick={() => {
                  document.getElementById('posts').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
                className="group inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-lg font-semibold text-blue-600 shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Ver Posts
                <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white hover:text-blue-600 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Unirse
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="posts" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">2,847</div>
            <div className="text-gray-600">Jugadores Activos</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">156</div>
            <div className="text-gray-600">Posts Hoy</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600">89</div>
            <div className="text-gray-600">Equipos Formados</div>
          </div>
        </div>

        {/* New Post Form */}
        <div className="mb-8">
          <NewPostForm onAddPost={addPost} />
        </div>
        
        {/* Posts */}
        <div className="space-y-6">
          <PostList posts={posts} />
        </div>
      </div>
    </div>
  );
} 