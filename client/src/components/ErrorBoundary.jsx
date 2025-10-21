import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Icono de error */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¡Algo salió mal!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              La aplicación encontró un error inesperado. No te preocupes, tus datos están seguros.
            </p>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Recargar página
              </button>
              
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Volver al inicio
              </button>
            </div>

            {/* Detalles del error (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-gray-50 rounded-lg p-6 border border-gray-200">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-4">
                  Detalles técnicos del error (solo visible en desarrollo)
                </summary>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-red-600 mb-2">Error:</h3>
                    <pre className="text-xs bg-red-50 p-4 rounded overflow-x-auto text-red-800">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <h3 className="font-semibold text-red-600 mb-2">Stack Trace:</h3>
                      <pre className="text-xs bg-red-50 p-4 rounded overflow-x-auto text-red-800">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Enlaces útiles */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Enlaces útiles:</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <a href="/" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Inicio
                </a>
                <a href="/about" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Acerca de
                </a>
                <a href="/auth" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Iniciar sesión
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

