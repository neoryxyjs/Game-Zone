import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AboutPage = () => {
  const { isAuthenticated } = useUser();

  const features = [
    {
      icon: '🎮',
      title: 'Gaming Social',
      description: 'Conecta con otros jugadores y forma equipos para tus juegos favoritos'
    },
    {
      icon: '📱',
      title: 'Feed Personalizado',
      description: 'Comparte tus logros, clips y experiencias gaming con la comunidad'
    },
    {
      icon: '🏆',
      title: 'Rankings y Competencias',
      description: 'Participa en rankings, torneos y competiciones de diferentes juegos'
    },
    {
      icon: '👥',
      title: 'Equipos y Clanes',
      description: 'Crea o únete a equipos para jugar en grupo y competir juntos'
    },
    {
      icon: '🔔',
      title: 'Notificaciones en Tiempo Real',
      description: 'Mantente al día con las últimas actividades de tus amigos y equipos'
    },
    {
      icon: '⚙️',
      title: 'Personalización',
      description: 'Personaliza tu perfil, configuración y experiencia de usuario'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Usuarios Activos' },
    { number: '50+', label: 'Juegos Soportados' },
    { number: '1,000+', label: 'Equipos Creados' },
    { number: '500+', label: 'Torneos Realizados' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce-in">
            <span className="text-white font-bold text-5xl">G</span>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            GameZone
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La plataforma social gaming más completa. Conecta, compite y comparte tu pasión por los videojuegos.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary px-8 py-4 text-lg font-semibold">
                Únete Ahora
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-4 text-lg font-semibold">
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="card text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Características */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            ¿Por qué elegir GameZone?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center animate-slide-up hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Misión y Visión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="card">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
            <p className="text-gray-600 leading-relaxed">
              Crear la comunidad gaming más inclusiva y conectada del mundo, donde cada jugador pueda encontrar su lugar, 
              formar amistades duraderas y alcanzar sus metas competitivas.
            </p>
          </div>
          
          <div className="card">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Visión</h3>
            <p className="text-gray-600 leading-relaxed">
              Ser la plataforma líder en gaming social, revolucionando la forma en que los jugadores se conectan, 
              compiten y comparten experiencias en el mundo de los videojuegos.
            </p>
          </div>
        </div>

        {/* Equipo */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestro Equipo</h2>
          <p className="text-xl text-gray-600 mb-12">
            Apasionados desarrolladores y gamers trabajando para crear la mejor experiencia
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">👨‍💻</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Desarrollo</h3>
              <p className="text-gray-600">Equipo de desarrolladores full-stack</p>
            </div>
            
            <div className="card text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Diseño</h3>
              <p className="text-gray-600">Diseñadores UX/UI especializados</p>
            </div>
            
            <div className="card text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🎮</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gaming</h3>
              <p className="text-gray-600">Expertos en gaming y esports</p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="card text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Tienes alguna pregunta?</h2>
          <p className="text-gray-600 mb-6">
            Estamos aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@gamezone.com" className="btn-primary px-6 py-3">
              📧 Contactar Soporte
            </a>
            <Link to="/" className="btn-secondary px-6 py-3">
              🏠 Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
