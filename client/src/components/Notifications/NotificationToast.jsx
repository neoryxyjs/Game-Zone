import React from 'react';

export default function NotificationToast({ type = 'info', message, onClose }) {
  const color =
    type === 'success'
      ? 'bg-green-600 border-green-400'
      : type === 'error'
      ? 'bg-red-600 border-red-400'
      : 'bg-purple-700 border-purple-400';

  return (
    <div
      className={`flex items-center justify-between w-80 max-w-full p-4 mb-3 rounded-lg shadow-lg border-l-4 text-white animate-slide-in-bottom-right ${color}`}
      style={{ minWidth: '250px' }}
    >
      <span className="flex-1 text-sm pr-2">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}

// Animación Tailwind personalizada (agregar en tailwind.config.js):
// 'slide-in-bottom-right': {
//   '0%': { transform: 'translateY(100%) translateX(100%)', opacity: 0 },
//   '100%': { transform: 'translateY(0) translateX(0)', opacity: 1 },
// }, 