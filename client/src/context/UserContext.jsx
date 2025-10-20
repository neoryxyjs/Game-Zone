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

  // Obtener configuraciones del localStorage
  const getInitialSettings = () => {
    const savedSettings = localStorage.getItem('gamezone_settings');
    return savedSettings ? JSON.parse(savedSettings) : {
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
    };
  };

  const [userSettings, setUserSettings] = useState(getInitialSettings);

  // Efecto para manejar la inicialización de manera segura
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('gamezone_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error al cargar usuario del localStorage:', error);
      localStorage.removeItem('gamezone_user');
    }
  }, []);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'comment',
      message: 'DragonSlayer99 comentó en tu post',
      time: '2 min',
      read: false
    },
    {
      id: 2,
      type: 'like',
      message: 'ValorantPro le dio like a tu post',
      time: '15 min',
      read: false
    },
    {
      id: 3,
      type: 'friend',
      message: 'MidLaneCarry te envió una solicitud de amistad',
      time: '1 hora',
      read: true
    }
  ]);

  const [friends, setFriends] = useState([
    {
      id: 1,
      username: 'ValorantPro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      status: 'online',
      game: 'Valorant',
      rank: 'Immortal 2'
    },
    {
      id: 2,
      username: 'MidLaneCarry',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      status: 'offline',
      game: 'League of Legends',
      rank: 'Master'
    },
    {
      id: 3,
      username: 'SupportMain',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      status: 'in-game',
      game: 'League of Legends',
      rank: 'Diamond IV'
    }
  ]);

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('gamezone_user', JSON.stringify(updatedUser));
    
    // También actualizar en la lista de usuarios para persistencia
    const existingUsers = JSON.parse(localStorage.getItem('gamezone_users') || '[]');
    const updatedUsers = existingUsers.map(u => 
      u.id === user.id ? { ...u, ...updates } : u
    );
    localStorage.setItem('gamezone_users', JSON.stringify(updatedUsers));
  };

  const updateAvatar = (newAvatar) => {
    const updatedUser = { ...user, avatar: newAvatar };
    setUser(updatedUser);
    localStorage.setItem('gamezone_user', JSON.stringify(updatedUser));
    
    // También actualizar en la lista de usuarios para persistencia
    const existingUsers = JSON.parse(localStorage.getItem('gamezone_users') || '[]');
    const updatedUsers = existingUsers.map(u => 
      u.id === user.id ? { ...u, avatar: newAvatar } : u
    );
    localStorage.setItem('gamezone_users', JSON.stringify(updatedUsers));
  };

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...userSettings, ...newSettings };
    setUserSettings(updatedSettings);
    localStorage.setItem('gamezone_settings', JSON.stringify(updatedSettings));
  };

  const toggleSetting = (settingKey) => {
    const updatedSettings = { 
      ...userSettings, 
      [settingKey]: !userSettings[settingKey] 
    };
    setUserSettings(updatedSettings);
    localStorage.setItem('gamezone_settings', JSON.stringify(updatedSettings));
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
      
      // Limpiar localStorage primero
      localStorage.removeItem('gamezone_user');
      localStorage.removeItem('gamezone_notifications');
      localStorage.removeItem('gamezone_friends');
      // Note: We keep gamezone_settings so they persist across sessions
      
      // Limpiar estados de forma segura
      setNotifications([]);
      setFriends([]);
      setIsAuthenticated(false);
      setUser(null);
      
      // Mostrar notificación de logout
      if (window.showNotification) {
        window.showNotification('info', `¡Hasta pronto, ${username}! Vuelve pronto.`);
      }
      
      // No resetear userSettings para mantener las preferencias del usuario
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
      
      // Guardar en localStorage primero
      localStorage.setItem('gamezone_user', JSON.stringify(userWithDefaults));
      
      // Actualizar estados de forma segura
      setIsAuthenticated(true);
      setUser(userWithDefaults);

      // Simular notificaciones de bienvenida
      setTimeout(() => {
        // Esta función será llamada desde el componente que use el contexto
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
    // Verificar si el usuario ya existe
    const existingUsers = JSON.parse(localStorage.getItem('gamezone_users') || '[]');
    const userExists = existingUsers.find(u => u.email === userData.email || u.username === userData.username);
    
    if (userExists) {
      throw new Error('El usuario ya existe');
    }

    // Agregar nuevo usuario a la lista
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

    // Guardar en localStorage primero
    existingUsers.push(newUser);
    localStorage.setItem('gamezone_users', JSON.stringify(existingUsers));
    
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
    markNotificationAsRead,
    addFriend,
    removeFriend,
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