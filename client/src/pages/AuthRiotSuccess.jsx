import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { API_ENDPOINTS } from '../config/api';

export default function AuthRiotSuccess() {
  const [params] = useSearchParams();
  const { login } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const riotId = params.get('riotId');
    const username = params.get('username');
    if (riotId && username) {
      fetch(API_ENDPOINTS.RIOT.RIOT_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riotId, username }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            login(data.user); // Guarda el usuario en el contexto
            navigate('/profile');
          } else {
            navigate('/login');
          }
        });
    }
  }, [params, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">¡Iniciando sesión con Riot!</h1>
        <p className="text-gray-600">Redirigiendo a tu perfil...</p>
      </div>
    </div>
  );
} 