import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../Notifications/NotificationManager';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    game: 'League of Legends',
    rank: 'Bronze',
    riotId: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useUser();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      showError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // Solo enviamos los campos que existen en la base de datos
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) {
        showSuccess(`¡Bienvenido a GameZone, ${formData.username}!`);
        navigate('/');
      } else {
        setError(data.message || 'Error al registrar usuario');
        showError(data.message || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      showError('Error de conexión con el servidor');
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <div>
        <label htmlFor="username" className="block text-xs font-medium text-gray-300 mb-1">
          Nombre de usuario
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-purple-500 text-sm"
          placeholder="Tu nombre de usuario"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-purple-500 text-sm"
          placeholder="tu@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-purple-500 text-sm"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-300 mb-1">
          Confirmar contraseña
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-purple-500 text-sm"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label htmlFor="game" className="block text-xs font-medium text-gray-300 mb-1">
          Juego principal
        </label>
        <select
          id="game"
          name="game"
          value={formData.game}
          onChange={handleChange}
          className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-purple-500 text-sm"
        >
          <option value="League of Legends">League of Legends</option>
          <option value="Valorant">Valorant</option>
        </select>
      </div>
      <div>
        <label htmlFor="rank" className="block text-xs font-medium text-gray-300 mb-1">
          Rango
        </label>
        <select
          id="rank"
          name="rank"
          value={formData.rank}
          onChange={handleChange}
          className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-purple-500 text-sm"
        >
          <option value="Bronze">Bronze</option>
          <option value="Silver">Silver</option>
          <option value="Gold">Gold</option>
          <option value="Platinum">Platinum</option>
          <option value="Diamond">Diamond</option>
          <option value="Master">Master</option>
          <option value="Grandmaster">Grandmaster</option>
          <option value="Challenger">Challenger</option>
        </select>
      </div>
      <div>
        <label htmlFor="riotId" className="block text-xs font-medium text-gray-300 mb-1">
          Riot ID (nombre de invocador)
          <span className="text-gray-400 ml-1">(opcional)</span>
        </label>
        <input
          type="text"
          id="riotId"
          name="riotId"
          value={formData.riotId}
          onChange={handleChange}
          className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-purple-500 text-sm"
          placeholder="Ej: Faker, TheShy, etc."
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Registrando...' : 'Registrarse'}
      </button>
      {/* Riot Games login temporalmente deshabilitado */}
    </form>
  );
}