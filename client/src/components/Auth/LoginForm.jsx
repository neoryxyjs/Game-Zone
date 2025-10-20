import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../Notifications/NotificationManager';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authenticateUser } = useUser();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await authenticateUser(formData.email, formData.password);
      if (success) {
        showSuccess('¡Sesión iniciada correctamente!');
        navigate('/');
      } else {
        setError('Email o contraseña incorrectos');
        showError('Credenciales incorrectas');
      }
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-gray-300 mb-1">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-gray-700/50 text-white rounded pl-8 pr-3 py-2 border border-gray-600/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-400 text-sm"
            placeholder="tu@email.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-semibold text-gray-300 mb-1">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full bg-gray-700/50 text-white rounded pl-8 pr-3 py-2 border border-gray-600/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-400 text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
          />
          <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-400">
            Recordarme
          </label>
        </div>
        <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors duration-200">
          ¿Olvidaste tu contraseña?
        </a>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 px-4 rounded font-semibold text-sm transition-all duration-300 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
        {/* Riot Games login temporalmente deshabilitado */}
      </form>
  );
}