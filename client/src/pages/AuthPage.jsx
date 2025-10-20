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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo y título */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-3 shadow">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            GameZone
          </h1>
          <p className="text-gray-400 text-sm">Comunidad de LoL y Valorant</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-800/80 rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-all duration-300 ${
              isLogin
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-all duration-300 ${
              !isLogin
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Contenido del formulario */}
        <div>
          {isLogin ? <LoginForm /> : <RegisterForm />}  
        </div>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-gray-900 text-gray-400">O continúa con</span>
          </div>
        </div>

        {/* Botón de Riot Games */}
        <div className="text-center">
          <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-4 rounded font-medium text-sm transition-all duration-300 shadow hover:shadow-md flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span>Entrar con Riot Games</span>
          </button>
        </div>
      </div>
    </div>
  );
} 