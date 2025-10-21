import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';

const ImageUpload = ({ onImageUploaded, postId, userId }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 5MB');
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
      console.log('📸 Subiendo imagen de post:', file);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('user_id', userId);
      formData.append('post_id', postId);

      console.log('📤 Enviando a:', `${API_BASE_URL}/api/profiles/upload-post-image`);

      const response = await fetch(`${API_BASE_URL}/api/profiles/upload-post-image`, {
        method: 'POST',
        body: formData
      });

      console.log('📥 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error subiendo imagen: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Datos de la imagen:', data);

      if (data.success && data.image) {
        onImageUploaded(data.image);
        setPreview(null);
        console.log('✅ Imagen subida exitosamente:', data.image);
      } else {
        console.error('❌ Respuesta de imagen no exitosa:', data);
        setError(data.message || 'Error subiendo imagen');
      }
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
      setError('Error de conexión al subir imagen');
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
          accept="image/*"
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
              <span>Subiendo...</span>
            </div>
          ) : (
            <div className="upload-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Subir imagen</span>
            </div>
          )}
        </label>
      </div>

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          <button 
            type="button" 
            onClick={removePreview}
            className="remove-preview"
            disabled={uploading}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
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
          padding: 12px 24px;
          border: 2px dashed #4a5568;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 150px;
        }

        .upload-button:hover {
          border-color: #3182ce;
          background: #f7fafc;
        }

        .upload-button.uploading {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .uploading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-top: 2px solid #3182ce;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .image-preview {
          position: relative;
          display: inline-block;
          margin: 10px 0;
        }

        .image-preview img {
          max-width: 200px;
          max-height: 200px;
          border-radius: 8px;
          object-fit: cover;
        }

        .remove-preview {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e53e3e;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .remove-preview:hover {
          background: #c53030;
        }

        .error-message {
          color: #e53e3e;
          font-size: 14px;
          margin-top: 8px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
