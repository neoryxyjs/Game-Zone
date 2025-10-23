import React, { useState } from 'react';
import { uploadFileAuth } from '../../utils/api';

const ImageUpload = ({ onImageUploaded, postId, userId }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo (ahora incluye videos)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPEG, PNG, GIF, WebP) o videos (MP4, MOV, AVI, WebM)');
      return;
    }

    // Validar tamaño (10MB para imágenes, 50MB para videos)
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Máximo ${isVideo ? '50MB para videos' : '10MB para imágenes'}`);
      return;
    }

    setError(null);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Subir imagen
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError(null);

    try {
      console.log('📸 Subiendo imagen de post con autenticación:', file);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('user_id', userId);
      formData.append('image_type', 'post');
      formData.append('is_video', file.type.startsWith('video/'));

      console.log('📤 Enviando a: /api/profiles/upload-post-image');

      const response = await uploadFileAuth('/api/profiles/upload-post-image', formData);

      console.log('📥 Respuesta del servidor:', response.status, response.statusText);

      // Leer el body una sola vez
      let data;
      try {
        data = await response.json();
        console.log('📦 Datos recibidos:', data);
      } catch (parseError) {
        console.error('❌ Error al parsear respuesta:', parseError);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        const errorText = data.message || data.error || response.statusText || 'Error desconocido';
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error subiendo archivo: ${errorText}`);
      }

      // Verificar que los datos sean válidos
      if (data.success && data.image) {
        onImageUploaded(data.image);
        setPreview(null);
        console.log('✅ Archivo subido exitosamente a Cloudinary:', data.image);
      } else {
        const errorMsg = data.message || data.error || 'Error subiendo archivo';
        console.error('❌ Respuesta no exitosa:', data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error subiendo archivo:', error);
      const errorMessage = error.message || 'Error de conexión al subir archivo';
      setError(errorMessage);
      alert(`Error al subir: ${errorMessage}`); // Mostrar alerta al usuario
    } finally {
      setUploading(false);
    }
  };

  const removePreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="image-upload">
      <div className="upload-area">
        <input
          type="file"
          id="image-upload"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        <label 
          htmlFor="image-upload" 
          className={`upload-button ${uploading ? 'uploading' : ''}`}
        >
          {uploading ? (
            <div className="uploading-spinner">
              <div className="spinner"></div>
              <span className="uploading-text">Subiendo...</span>
              <div className="upload-progress"></div>
            </div>
          ) : (
            <div className="upload-content">
              <div className="upload-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="upload-text">Subir imagen/video</span>
              <span className="upload-hint">o arrastra aquí</span>
            </div>
          )}
        </label>
      </div>

      {preview && (
        <div className="image-preview animate-scale-in">
          <div className="preview-container">
            {preview.startsWith('data:video') ? (
              <video src={preview} controls className="preview-video" />
            ) : (
              <img src={preview} alt="Preview" className="preview-image" />
            )}
            <button 
              type="button" 
              onClick={removePreview}
              className="remove-preview"
              disabled={uploading}
              title="Eliminar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message animate-notification-slide">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        .image-upload {
          margin: 10px 0;
        }

        .upload-area {
          display: flex;
          justify-content: center;
          margin: 10px 0;
        }

        .upload-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 32px;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 200px;
          position: relative;
          overflow: hidden;
        }

        .upload-button:hover {
          border-color: #6366f1;
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .upload-button.uploading {
          cursor: not-allowed;
          opacity: 0.8;
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #64748b;
        }

        .upload-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 10px;
          color: white;
          transition: transform 0.3s ease;
        }

        .upload-button:hover .upload-icon {
          transform: translateY(-4px);
        }

        .upload-text {
          font-weight: 600;
          color: #334155;
        }

        .upload-hint {
          font-size: 12px;
          color: #94a3b8;
        }

        .uploading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e0e7ff;
          border-top: 3px solid #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .uploading-text {
          font-weight: 600;
          color: #6366f1;
        }

        .upload-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
          animation: progress 1.5s ease-in-out infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .image-preview {
          position: relative;
          display: inline-block;
          margin: 16px 0;
        }

        .preview-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .preview-container:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .preview-image,
        .preview-video {
          max-width: 300px;
          max-height: 300px;
          border-radius: 12px;
          object-fit: cover;
          display: block;
        }

        .remove-preview {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.95);
          color: white;
          border: 2px solid white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }

        .remove-preview:hover {
          background: #dc2626;
          transform: scale(1.1) rotate(90deg);
        }

        .remove-preview:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          font-size: 14px;
          margin-top: 12px;
          border-radius: 8px;
          border-left: 4px solid #dc2626;
          font-weight: 500;
        }

        .error-message svg {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
