import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configuraciones por defecto
  const [userSettings, setUserSettings] = useState({
    emailNotifications: true,
    publicProfile: true,
    darkMode: false,
    language: 'es',
    autoSave: true,
    pushNotifications: true,
    showDetailedStats: true,
    gameAlerts: true,
    teamInvites: true,
    tournamentNotifications: false,
    streamNotifications: true,
    performanceMode: false,
    lowLatencyMode: true
  });

  // Efecto para manejar la inicialización
  useEffect(() => {
    // El usuario se maneja a través de la autenticación del backend
    // No necesitamos localStorage
  }, []);

  const [notifications, setNotifications] = useState([]);

  const [friends, setFriends] = useState([]);

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  const updateAvatar = (newAvatar) => {
    const updatedUser = { ...user, avatar: newAvatar };
    setUser(updatedUser);
  };

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...userSettings, ...newSettings };
    setUserSettings(updatedSettings);
  };

  const toggleSetting = (settingKey) => {
    const updatedSettings = { 
      ...userSettings, 
      [settingKey]: !userSettings[settingKey] 
    };
    setUserSettings(updatedSettings);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const addFriend = (username) => {
    // Simular agregar un nuevo amigo
    const newFriend = {
      id: Date.now(),
      username: username,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      status: 'online',
      game: 'League of Legends',
      rank: 'Gold I'
    };
    setFriends(prev => [...prev, newFriend]);
  };

  const removeFriend = (friendId) => {
    setFriends(prev => prev.filter(friend => friend.id !== friendId));
  };

  const logout = () => {
    try {
      const username = user?.username || 'Usuario';
      
      // Limpiar estados de forma segura
      setNotifications([]);
      setFriends([]);
      setIsAuthenticated(false);
      setUser(null);
      
      // Mostrar notificación de logout
      if (window.showNotification) {
        window.showNotification('info', `¡Hasta pronto, ${username}! Vuelve pronto.`);
      }
    } catch (error) {
      console.error('Error durante logout:', error);
      // Forzar limpieza de estados en caso de error
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = (userData) => {
    try {
      const userWithDefaults = {
        ...userData,
        id: userData.id || Date.now(),
        level: userData.level || 1,
        joinDate: userData.joinDate || new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        followers: userData.followers || 0,
        following: userData.following || 0,
        posts: userData.posts || 0,
        notifications: userData.notifications || 0,
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: userData.bio || '¡Nuevo jugador en GameZone!'
      };
      
      // Actualizar estados de forma segura
      setIsAuthenticated(true);
      setUser(userWithDefaults);

      // Simular notificaciones de bienvenida
      setTimeout(() => {
        if (window.showNotification) {
          window.showNotification('success', `¡Bienvenido de vuelta, ${userWithDefaults.username}!`);
        }
      }, 1000);

      // Simular notificaciones de actividad reciente
      setTimeout(() => {
        if (window.showNotification) {
          window.showNotification('info', 'Tienes 3 nuevos mensajes y 2 solicitudes de amistad');
        }
      }, 3000);

    } catch (error) {
      console.error('Error durante login:', error);
      throw new Error('Error al iniciar sesión');
    }
  };

  const register = (userData) => {
    // Crear nuevo usuario
    const newUser = {
      ...userData,
      id: Date.now(),
      level: 1,
      joinDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      followers: 0,
      following: 0,
      posts: 0,
      notifications: 0,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      bio: userData.bio || '¡Nuevo jugador en GameZone!'
    };
    
    // Iniciar sesión automáticamente
    login(newUser);
  };

  const authenticateUser = async (email, password) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    userSettings,
    notifications,
    friends,
    updateUser,
    updateAvatar,
    updateSettings,
    toggleSetting,
    logout,
    login,
    register,
    authenticateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 