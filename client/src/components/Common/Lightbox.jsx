import React, { useEffect } from 'react';

export default function Lightbox({ src, type = 'image', onClose }) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevenir scroll del body cuando el lightbox está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200 group"
        aria-label="Cerrar"
      >
        <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Contenedor del media */}
      <div 
        className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'video' ? (
          <video
            src={src}
            controls
            autoPlay
            className="w-full h-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          >
            Tu navegador no soporta el tag de video.
          </video>
        ) : (
          <img
            src={src}
            alt="Imagen en pantalla completa"
            className="w-full h-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
          />
        )}
      </div>

      {/* Indicador de cerrar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm flex items-center space-x-2">
        <span>Presiona ESC o haz clic fuera para cerrar</span>
      </div>
    </div>
  );
}

