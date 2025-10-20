import { useNotificationContext } from './NotificationProvider';

// Hook de notificaciones básico para desarrollo
export function useNotifications() {
  const { show } = useNotificationContext();
  return {
    showSuccess: (msg) => show('success', msg),
    showError: (msg) => show('error', msg),
    showInfo: (msg) => show('info', msg), // Notificación informativa
  };
}