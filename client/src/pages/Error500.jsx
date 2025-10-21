import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Error500() {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-orange-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Número de error */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 animate-pulse">
            500
          </h1>
        </div>

        {/* Icono decorativo */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Mensaje */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Oops! Error del servidor
        </h2>
        <p className="text-gray-600 mb-8">
          Algo salió mal en nuestro servidor. Estamos trabajando para solucionarlo. Por favor, intenta de nuevo en unos momentos.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleReload}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Recargar página
          </button>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Ir al inicio
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Si el problema persiste, puedes intentar:
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✓ Limpiar el caché del navegador</li>
            <li>✓ Verificar tu conexión a internet</li>
            <li>✓ Intentar más tarde</li>
          </ul>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/" className="text-yellow-600 hover:text-yellow-700 hover:underline">
              Inicio
            </Link>
            <Link to="/about" className="text-yellow-600 hover:text-yellow-700 hover:underline">
              Acerca de
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

