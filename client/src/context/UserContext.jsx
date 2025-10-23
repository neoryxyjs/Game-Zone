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

  // Efecto para manejar la inicialización y verificar sesión persistente
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Verificar si hay un token en localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
          console.log('🔍 Verificando sesión persistente...');
          
          // Verificar con el backend si el token es válido
          const response = await fetch(`${API_ENDPOINTS.AUTH.VERIFY || 'http://localhost:8080/api/auth/verify'}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              console.log('✅ Sesión válida encontrada:', data.user);
              console.log('🖼️ Avatar en sesión persistente:', data.user.avatar);
              // Usar el método login para configurar el usuario correctamente
              login(data.user);
            } else {
              console.log('❌ Token inválido, limpiando...');
              localStorage.removeItem('authToken');
            }
          } else {
            console.log('❌ Error verificando sesión, limpiando token...');
            localStorage.removeItem('authToken');
          }
        } else {
          console.log('ℹ️ No hay token de autenticación');
        }
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        localStorage.removeItem('authToken');
      }
    };
    
    checkAuthStatus();
  }, []);

  // Actualizar estado en línea cada minuto
  useEffect(() => {
    if (user?.id) {
      const updateOnlineStatus = async () => {
        try {
          await fetch(`${API_ENDPOINTS.BASE || 'http://localhost:8080'}/api/online/${user.id}/online`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
        } catch (error) {
          console.error('Error actualizando estado en línea:', error);
        }
      };

      // Actualizar inmediatamente y luego cada minuto
      updateOnlineStatus();
      const interval = setInterval(updateOnlineStatus, 60000); // 60 segundos

      return () => clearInterval(interval);
    }
  }, [user?.id]);

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
      console.log('🚪 Cerrando sesión...');
      
      // Limpiar estados de forma segura
      setNotifications([]);
      setFriends([]);
      setIsAuthenticated(false);
      setUser(null);
      
      // Limpiar token del localStorage
      localStorage.removeItem('authToken');
      
      // Mostrar notificación de logout
      if (window.showNotification) {
        window.showNotification('info', `¡Hasta pronto, ${username}! Vuelve pronto.`);
      }
    } catch (error) {
      console.error('Error durante logout:', error);
      // Forzar limpieza de estados en caso de error
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  const login = (userData) => {
    try {
      console.log('🔐 Login con datos del servidor:', userData);
      
      // Usar datos directamente del servidor (base de datos)
      const userWithDefaults = {
        ...userData,
        level: userData.level || 1,
        joinDate: userData.created_at ? new Date(userData.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        followers: userData.followers || 0,
        following: userData.following || 0,
        posts: userData.posts || 0,
        notifications: userData.notifications || 0,
        bio: userData.bio || '¡Nuevo jugador en GameZone!'
      };
      
      console.log('👤 Usuario configurado:', userWithDefaults);
      
      // Actualizar estados de forma segura
      setIsAuthenticated(true);
      setUser(userWithDefaults);

      // Simular notificaciones de bienvenida
      setTimeout(() => {
        if (window.showNotification) {
          window.showNotification('success', `¡Bienvenido de vuelta, ${userWithDefaults.username}!`);
        }
      }, 1000);

    } catch (error) {
      console.error('Error durante login:', error);
      throw new Error('Error al iniciar sesión');
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registrando nuevo usuario en el backend...');
      
      // Enviar datos al backend para crear el usuario en la base de datos
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('📥 Respuesta del registro:', data);
      
      if (response.ok && data.success) {
        // Guardar token en localStorage
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          console.log('✅ Token guardado en localStorage');
        }
        
        // Usar el método login para configurar el usuario correctamente
        login(data.user);
        console.log('✅ Usuario registrado y autenticado:', data.user);
        return true;
      } else {
        console.log('❌ Error en registro:', data.message);
        throw new Error(data.message || 'Error al crear la cuenta');
      }
    } catch (err) {
      console.error('❌ Error de conexión en registro:', err);
      throw err;
    }
  };

  const authenticateUser = async (email, password) => {
    try {
      console.log('🔐 Autenticando usuario...');
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('📥 Respuesta de autenticación:', data);
      
      if (response.ok && data.success) {
        // Guardar token en localStorage
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          console.log('✅ Token guardado en localStorage');
        }
        
        // Usar el método login para configurar el usuario correctamente
        login(data.user);
        console.log('✅ Usuario autenticado:', data.user);
        console.log('🖼️ Avatar del usuario:', data.user.avatar);
        return true;
      } else {
        console.log('❌ Error en autenticación:', data.message);
        return false;
      }
    } catch (err) {
      console.error('❌ Error de conexión en autenticación:', err);
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