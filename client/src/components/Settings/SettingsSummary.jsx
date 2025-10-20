import React from 'react';
import { 
  BellIcon, 
  EyeIcon, 
  MoonIcon, 
  GlobeAltIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

export default function SettingsSummary({ userSettings }) {
  const getSettingStatus = (setting) => {
    return setting ? 'Activado' : 'Desactivado';
  };

  const getLanguageName = (code) => {
    const languages = {
      'es': 'Español',
      'en': 'English',
      'pt': 'Português'
    };
    return languages[code] || code;
  };

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressWidth = (value) => {
    return `${value}%`;
  };

  // Calcular estadísticas gamer
  const calculateNotificationScore = () => {
    let score = 0;
    if (userSettings.emailNotifications) score += 25;
    if (userSettings.pushNotifications) score += 25;
    if (userSettings.gameAlerts) score += 20;
    if (userSettings.teamInvites) score += 15;
    if (userSettings.tournamentNotifications) score += 10;
    if (userSettings.streamNotifications) score += 5;
    return Math.min(score, 100);
  };

  const calculatePerformanceScore = () => {
    let score = 50;
    if (userSettings.autoSave) score += 25;
    if (userSettings.performanceMode) score += 15;
    if (userSettings.lowLatencyMode) score += 10;
    return Math.min(score, 100);
  };

  const gamerStats = {
    notifications: calculateNotificationScore(),
    privacy: userSettings.publicProfile ? 60 : 90,
    performance: calculatePerformanceScore(),
    accessibility: userSettings.darkMode ? 80 : 50,
    connectivity: userSettings.pushNotifications ? 90 : 40,
    customization: userSettings.showDetailedStats ? 85 : 60
  };

  // Contar configuraciones activas
  const activeSettings = Object.values(userSettings).filter(Boolean).length;
  const totalSettings = Object.keys(userSettings).length;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-4 text-white w-full max-w-full lg:max-w-xs lg:mx-auto overflow-hidden">
      <div className="flex items-center space-x-4 mb-8 lg:mb-6">
        <div className="w-12 h-12 lg:w-10 lg:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <CogIcon className="w-7 h-7 lg:w-6 lg:h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl lg:text-lg font-bold text-white mb-1">Panel de Control</h3>
          <p className="text-sm lg:text-xs text-gray-400">Resumen de configuraciones gamer</p>
        </div>
      </div>
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-3 mb-8 lg:mb-6">
        <div className="bg-gray-800 rounded-lg p-5 sm:p-6 lg:p-4 text-center min-h-[110px] sm:min-h-[130px] lg:min-h-[80px] flex flex-col justify-center">
          <div className="text-lg sm:text-xl lg:text-lg font-bold text-blue-400 mb-3 leading-none">
            {Math.round((activeSettings / totalSettings) * 100)}%
          </div>
          <div className="text-sm sm:text-base lg:text-xs text-gray-400 leading-tight">Configuración</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-5 sm:p-6 lg:p-4 text-center min-h-[110px] sm:min-h-[130px] lg:min-h-[80px] flex flex-col justify-center">
          <div className="text-lg sm:text-xl lg:text-lg font-bold text-green-400 mb-3 leading-none">
            {activeSettings}/{totalSettings}
          </div>
          <div className="text-sm sm:text-base lg:text-xs text-gray-400 leading-tight">Optimizado</div>
        </div>
      </div>

      {/* Barras de progreso gamer */}
      <div className="space-y-6 lg:space-y-4">
        {/* Notificaciones */}
        <div className="bg-gray-800 rounded-lg p-5 lg:p-3">
          <div className="flex items-center justify-between mb-3 lg:mb-2">
            <div className="flex items-center space-x-2">
              <BellIcon className="w-4 h-4 lg:w-4 lg:h-4 text-blue-400" />
              <span className="text-sm lg:text-xs font-medium">Notificaciones</span>
            </div>
            <span className="text-xs lg:text-xs text-gray-400">{gamerStats.notifications}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(gamerStats.notifications)}`}
              style={{ width: getProgressWidth(gamerStats.notifications) }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              {userSettings.emailNotifications ? 'Email activo' : 'Email inactivo'}
            </span>
            <span className="text-xs text-gray-400">
              {userSettings.pushNotifications ? 'Push activo' : 'Push inactivo'}
            </span>
          </div>
        </div>

        {/* Privacidad */}
        <div className="bg-gray-800 rounded-lg p-5 lg:p-3">
          <div className="flex items-center justify-between mb-3 lg:mb-2">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-4 h-4 lg:w-4 lg:h-4 text-green-400" />
              <span className="text-sm lg:text-xs font-medium">Privacidad</span>
            </div>
            <span className="text-xs lg:text-xs text-gray-400">{gamerStats.privacy}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(gamerStats.privacy)}`}
              style={{ width: getProgressWidth(gamerStats.privacy) }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              {userSettings.publicProfile ? 'Perfil público' : 'Perfil privado'}
            </span>
            <span className="text-xs text-green-400">Seguro</span>
          </div>
        </div>

        {/* Rendimiento */}
        <div className="bg-gray-800 rounded-lg p-5 lg:p-3">
          <div className="flex items-center justify-between mb-3 lg:mb-2">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-4 h-4 lg:w-4 lg:h-4 text-purple-400" />
              <span className="text-sm lg:text-xs font-medium">Rendimiento</span>
            </div>
            <span className="text-xs lg:text-xs text-gray-400">{gamerStats.performance}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(gamerStats.performance)}`}
              style={{ width: getProgressWidth(gamerStats.performance) }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              {userSettings.autoSave ? 'Auto-guardado activo' : 'Auto-guardado inactivo'}
            </span>
            <span className="text-xs text-purple-400">Optimizado</span>
          </div>
        </div>

        {/* Accesibilidad */}
        <div className="bg-gray-800 rounded-lg p-5 lg:p-3">
          <div className="flex items-center justify-between mb-3 lg:mb-2">
            <div className="flex items-center space-x-2">
              <MoonIcon className="w-4 h-4 lg:w-4 lg:h-4 text-yellow-400" />
              <span className="text-sm lg:text-xs font-medium">Accesibilidad</span>
            </div>
            <span className="text-xs lg:text-xs text-gray-400">{gamerStats.accessibility}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(gamerStats.accessibility)}`}
              style={{ width: getProgressWidth(gamerStats.accessibility) }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              {userSettings.darkMode ? 'Modo oscuro activo' : 'Modo claro activo'}
            </span>
            <span className="text-xs text-gray-400">
              {getLanguageName(userSettings.language)}
            </span>
          </div>
        </div>
      </div>

      {/* Estado general */}
      <div className="mt-10 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <WifiIcon className="w-5 h-5 text-green-400" />
            <span className="text-base font-medium">Estado del Sistema</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Online</span>
          </div>
        </div>
      </div>

      {/* Configuraciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="bg-gray-800 rounded p-3 text-center min-h-[60px] flex flex-col justify-center">
          <div className="text-xs sm:text-sm text-gray-400 mb-1">Configuraciones</div>
          <div className="text-sm sm:text-base font-bold text-white leading-none">{totalSettings}</div>
        </div>
        <div className="bg-gray-800 rounded p-3 text-center min-h-[60px] flex flex-col justify-center">
          <div className="text-xs sm:text-sm text-gray-400 mb-1">Activas</div>
          <div className="text-sm sm:text-base font-bold text-green-400 leading-none">{activeSettings}</div>
        </div>
      </div>
    </div>
  );
} 