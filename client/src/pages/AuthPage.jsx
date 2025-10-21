import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';

export default function AuthPage() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  // Detectar la ruta y establecer el estado inicial
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsLogin(false);
    } else if (location.pathname === '/login') {
      setIsLogin(true);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo animado con gradientes y formas */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
      
      {/* Formas geométricas animadas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Patrón de puntos */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          {/* Card principal con glassmorphism */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Logo y título mejorados */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl animate-bounce-in">
                <span className="text-white font-bold text-2xl">G</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                GameZone
              </h1>
              <p className="text-gray-300 text-sm">Únete a la comunidad gaming más grande</p>
            </div>

            {/* Tabs mejorados */}
            <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                  isLogin
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                  !isLogin
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Contenido del formulario */}
            <div className="mb-6">
              {isLogin ? <LoginForm /> : <RegisterForm />}  
            </div>

            {/* Separador mejorado */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-transparent text-gray-300">O continúa con</span>
              </div>
            </div>

            {/* Botón de Riot Games mejorado */}
            <div className="text-center">
              <button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 transform hover:scale-105">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>Entrar con Riot Games</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 