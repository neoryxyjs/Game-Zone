import React, { useState, useRef } from 'react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../context/UserContext';
// import { useNotifications } from '../Notifications/NotificationManager';

const AvatarUpload = () => {
  const { user, updateAvatar } = useUser();
  // const { showSuccess, showError } = useNotifications();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      // showError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      // showError('La imagen debe ser menor a 5MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewUrl) return;

    setIsUploading(true);
    try {
      // Simular subida de archivo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar avatar
      updateAvatar(previewUrl);
      // showSuccess('Avatar actualizado correctamente');
      
      // Limpiar preview
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // showError('Error al actualizar el avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
    updateAvatar(defaultAvatar);
    // showSuccess('Avatar restaurado al predeterminado');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Avatar del Perfil</h3>
      
      <div className="flex items-center space-x-6">
        {/* Avatar actual */}
        <div className="flex-shrink-0">
          <img
            src={user?.avatar}
            alt={user?.username}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
        </div>

        {/* Controles de avatar */}
        <div className="flex-1">
          <div className="space-y-3">
            {/* Botón para subir nueva imagen */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200"
              >
                <CameraIcon className="h-4 w-4 mr-2" />
                Cambiar Avatar
              </label>
            </div>

            {/* Botón para remover avatar */}
            <button
              onClick={handleRemoveAvatar}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Restaurar Predeterminado
            </button>
          </div>

          {/* Preview de nueva imagen */}
          {previewUrl && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Nueva imagen seleccionada</p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isUploading ? 'Subiendo...' : 'Confirmar'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-4 text-xs text-gray-500">
            <p>• Formatos soportados: JPG, PNG, GIF</p>
            <p>• Tamaño máximo: 5MB</p>
            <p>• Resolución recomendada: 256x256 píxeles</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload; 