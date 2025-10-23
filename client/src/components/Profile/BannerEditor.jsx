import React, { useState, useRef, useEffect } from 'react';

export default function BannerEditor({ imageSrc, onSave, onCancel }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Limitar el arrastre para que no se salga demasiado
    const container = containerRef.current;
    const image = imageRef.current;
    
    if (container && image) {
      const maxX = 0;
      const minX = container.offsetWidth - (image.offsetWidth * scale);
      const maxY = 0;
      const minY = container.offsetHeight - (image.offsetHeight * scale);

      setPosition({
        x: Math.max(Math.min(newX, maxX), minX),
        y: Math.max(Math.min(newY, maxY), minY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    const container = containerRef.current;
    const image = imageRef.current;
    
    if (container && image) {
      const maxX = 0;
      const minX = container.offsetWidth - (image.offsetWidth * scale);
      const maxY = 0;
      const minY = container.offsetHeight - (image.offsetHeight * scale);

      setPosition({
        x: Math.max(Math.min(newX, maxX), minX),
        y: Math.max(Math.min(newY, maxY), minY)
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, scale]);

  const handleSave = () => {
    // Calcular porcentajes para que sea responsive
    const container = containerRef.current;
    const image = imageRef.current;
    
    if (container && image) {
      const percentX = (position.x / container.offsetWidth) * 100;
      const percentY = (position.y / container.offsetHeight) * 100;
      
      onSave({
        x: percentX,
        y: percentY,
        scale: scale
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ajustar Banner
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Arrastra la imagen para reposicionarla y usa el control deslizante para hacer zoom
          </p>
        </div>

        {/* Editor Area */}
        <div className="p-6">
          <div
            ref={containerRef}
            className="relative w-full h-64 md:h-80 bg-gray-900 rounded-xl overflow-hidden cursor-move select-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Banner"
              className="absolute pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'top left',
                width: '100%',
                height: 'auto',
                minHeight: '100%',
                objectFit: 'cover'
              }}
              draggable="false"
            />
            
            {/* Overlay para mostrar área visible */}
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/30"></div>
            
            {/* Instrucciones */}
            {!isDragging && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm pointer-events-none">
                ✋ Arrastra para mover
              </div>
            )}
          </div>

          {/* Controles de Zoom */}
          <div className="mt-6 space-y-3">
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
                Zoom
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.round(scale * 100)}%</span>
            </label>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setScale(Math.max(1, scale - 0.1))}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((scale - 1) / 2) * 100}%, #e5e7eb ${((scale - 1) / 2) * 100}%, #e5e7eb 100%)`
                }}
              />
              
              <button
                onClick={() => setScale(Math.min(3, scale + 0.1))}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Arrastra para reposicionar • Usa el control deslizante para acercar o alejar
            </p>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setPosition({ x: 0, y: 0 });
                setScale(1);
              }}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
            >
              🔄 Restablecer
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all shadow-lg shadow-indigo-500/50"
              >
                ✓ Guardar Banner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

