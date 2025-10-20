import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AvatarEditor from '../components/Profile/AvatarEditor';
import SettingsSummary from '../components/Settings/SettingsSummary';
import AvatarUpload from '../components/Profile/AvatarUpload';

export default function SettingsPage() {
  const { user, userSettings, updateUser, updateAvatar, updateSettings, toggleSetting, logout } = useUser();
  const navigate = useNavigate();
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    game: user?.game || 'League of Legends',
    rank: user?.rank || 'Bronze'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      updateUser(formData);
      setMessage('Perfil actualizado correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Necesitas iniciar sesión para acceder a esta página</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2 lg:text-lg">Gestiona tu cuenta y preferencias</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
              <div className="text-center mb-6 lg:mb-8">
                <div className="relative inline-block">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-gray-200"
                  />
                  <button
                    onClick={() => setShowAvatarEditor(true)}
                    className="absolute -bottom-2 -right-2 lg:-bottom-3 lg:-right-3 bg-blue-600 text-white p-2 lg:p-3 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mt-4">{user.username}</h2>
                <p className="text-gray-600 text-sm lg:text-base">{user.email}</p>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-blue-600">{user.level}</div>
                  <div className="text-gray-600 text-sm lg:text-base">Nivel</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-purple-600">{user.posts}</div>
                  <div className="text-gray-600 text-sm lg:text-base">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-green-600">{user.followers}</div>
                  <div className="text-gray-600 text-sm lg:text-base">Seguidores</div>
                </div>
              </div>

                             <div className="mt-6 lg:mt-8 pt-6 border-t border-gray-200">
                 <button
                   onClick={handleLogout}
                   className="w-full bg-red-600 text-white py-3 lg:py-4 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm lg:text-base font-medium"
                 >
                   Cerrar Sesión
                 </button>
               </div>

               {/* Settings Summary */}
               <div className="mt-6 lg:mt-8">
                 <SettingsSummary userSettings={userSettings} />
               </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6 lg:mb-8">Editar Perfil</h3>

              {/* Avatar Upload en configuración */}
              <div className="mb-8">
                <AvatarUpload />
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.includes('Error') 
                    ? 'bg-red-100 border border-red-200 text-red-700' 
                    : 'bg-green-100 border border-green-200 text-green-700'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de usuario
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="game" className="block text-sm font-medium text-gray-700 mb-2">
                      Juego principal
                    </label>
                    <select
                      id="game"
                      name="game"
                      value={formData.game}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="League of Legends">League of Legends</option>
                      <option value="Valorant">Valorant</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-2">
                      Rango
                    </label>
                    <select
                      id="rank"
                      name="rank"
                      value={formData.rank}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>

                         {/* Account Settings */}
             <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración de Cuenta</h3>
               
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                   <div>
                     <h4 className="font-medium text-gray-900">Notificaciones por email</h4>
                     <p className="text-sm text-gray-600">Recibe notificaciones cuando alguien comente en tus posts</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input 
                       type="checkbox" 
                       className="sr-only peer" 
                       checked={userSettings.emailNotifications}
                       onChange={() => toggleSetting('emailNotifications')}
                     />
                     <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 ${
                       userSettings.emailNotifications ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200'
                     } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                   </label>
                 </div>

                 <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                   <div>
                     <h4 className="font-medium text-gray-900">Perfil público</h4>
                     <p className="text-sm text-gray-600">Permite que otros usuarios vean tu perfil</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input 
                       type="checkbox" 
                       className="sr-only peer" 
                       checked={userSettings.publicProfile}
                       onChange={() => toggleSetting('publicProfile')}
                     />
                     <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 ${
                       userSettings.publicProfile ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200'
                     } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                   </label>
                 </div>

                 <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                   <div>
                     <h4 className="font-medium text-gray-900">Modo oscuro</h4>
                     <p className="text-sm text-gray-600">Cambia el tema de la aplicación a modo oscuro</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input 
                       type="checkbox" 
                       className="sr-only peer" 
                       checked={userSettings.darkMode}
                       onChange={() => toggleSetting('darkMode')}
                     />
                     <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 ${
                       userSettings.darkMode ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200'
                     } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                   </label>
                 </div>

                 <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                   <div>
                     <h4 className="font-medium text-gray-900">Guardado automático</h4>
                     <p className="text-sm text-gray-600">Guarda automáticamente los cambios en tu perfil</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input 
                       type="checkbox" 
                       className="sr-only peer" 
                       checked={userSettings.autoSave}
                       onChange={() => toggleSetting('autoSave')}
                     />
                     <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 ${
                       userSettings.autoSave ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200'
                     } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                   </label>
                 </div>
               </div>

               {/* Additional Settings */}
               <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuraciones Adicionales</h3>
                 
                 <div className="space-y-4">
                   <div>
                     <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                       Idioma
                     </label>
                     <select
                       id="language"
                       value={userSettings.language}
                       onChange={(e) => updateSettings({ language: e.target.value })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     >
                       <option value="es">Español</option>
                       <option value="en">English</option>
                       <option value="pt">Português</option>
                     </select>
                   </div>

                   <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                     <div>
                       <h4 className="font-medium text-gray-900">Mostrar estadísticas detalladas</h4>
                       <p className="text-sm text-gray-600">Muestra información detallada en tu perfil</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                       <input 
                         type="checkbox" 
                         className="sr-only peer" 
                         checked={userSettings.showDetailedStats || false}
                         onChange={() => toggleSetting('showDetailedStats')}
                       />
                       <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 ${
                         (userSettings.showDetailedStats || false) ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200'
                       } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                     </label>
                   </div>

                   <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                     <div>
                       <h4 className="font-medium text-gray-900">Notificaciones push</h4>
                       <p className="text-sm text-gray-600">Recibe notificaciones en tiempo real</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                       <input 
                         type="checkbox" 
                         className="sr-only peer" 
                         checked={userSettings.pushNotifications || false}
                         onChange={() => toggleSetting('pushNotifications')}
                       />
                       <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 ${
                         (userSettings.pushNotifications || false) ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200'
                       } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                     </label>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Avatar Editor Modal */}
      {showAvatarEditor && (
        <AvatarEditor
          currentAvatar={user.avatar}
          onAvatarChange={updateAvatar}
          onClose={() => setShowAvatarEditor(false)}
        />
      )}
    </div>
  );
} 