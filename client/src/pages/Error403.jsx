import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function Error403() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Número de error */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 animate-pulse">
            403
          </h1>
        </div>

        {/* Icono decorativo */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
            <ShieldExclamationIcon className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Mensaje */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Acceso denegado
        </h2>
        <p className="text-gray-600 mb-8">
          No tienes permisos para acceder a esta página. Si crees que esto es un error, inicia sesión o contacta al administrador.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver atrás
          </button>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Ir al inicio
          </Link>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">¿Necesitas acceso?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/auth" className="text-red-600 hover:text-red-700 hover:underline">
              Iniciar sesión
            </Link>
            <Link to="/register" className="text-red-600 hover:text-red-700 hover:underline">
              Registrarse
            </Link>
            <Link to="/about" className="text-red-600 hover:text-red-700 hover:underline">
              Más información
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

