import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import { UserProvider, useUser } from './context/UserContext';
import { useNotifications } from './components/Notifications/NotificationManager';
import { NotificationProvider } from './components/Notifications/NotificationProvider';
import './App.css';

// Componente wrapper para manejar notificaciones
const AppContent = () => {
  const { showSuccess, showError, showInfo } = useNotifications();
  const { isAuthenticated, user } = useUser();

  // Configurar notificaciones globales
  useEffect(() => {
    window.showNotification = (type, message, title) => {
      switch (type) {
        case 'success':
          showSuccess(message, title);
          break;
        case 'error':
          showError(message, title);
          break;
        case 'info':
          showInfo(message, title);
          break;
        default:
          showInfo(message, title);
      }
    };

    return () => {
      delete window.showNotification;
    };
  }, [showSuccess, showError, showInfo]);

  // Simular notificaciones de actividad
  useEffect(() => {
    if (isAuthenticated && user) {
      // Simular notificaciones periódicas
      const interval = setInterval(() => {
        const notifications = [
          { type: 'info', message: 'Nuevo post de DragonSlayer99', title: 'Actividad' },
          { type: 'success', message: '¡Has subido de nivel!', title: 'Progreso' },
          { type: 'info', message: 'ValorantPro está en línea', title: 'Amigos' }
        ];
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        window.showNotification(randomNotification.type, randomNotification.message, randomNotification.title);
      }, 30000); // Cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/lol" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">League of Legends</h1><p className="mt-4">Página en construcción</p></div>} />
          <Route path="/valorant" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Valorant</h1><p className="mt-4">Página en construcción</p></div>} />
          <Route path="/rankings" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Rankings</h1><p className="mt-4">Página en construcción</p></div>} />
          <Route path="/teams" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Equipos</h1><p className="mt-4">Página en construcción</p></div>} />
          <Route path="/about" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Sobre Nosotros</h1><p className="mt-4">Página en construcción</p></div>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">404 - Página no encontrada</h1><p className="mt-4">La página que buscas no existe</p></div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <NotificationProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </NotificationProvider>
  );
}

export default App;
