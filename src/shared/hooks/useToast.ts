import { useUIStore } from '@store';

/**
 * Hook for showing toast messages
 */
export const useToast = () => {
  const { showToast, hideToast } = useUIStore();

  const success = (message: string) => {
    showToast(message, 'success');
    setTimeout(hideToast, 3000);
  };

  const error = (message: string) => {
    showToast(message, 'error');
    setTimeout(hideToast, 4000);
  };

  const info = (message: string) => {
    showToast(message, 'info');
    setTimeout(hideToast, 3000);
  };

  const warning = (message: string) => {
    showToast(message, 'warning');
    setTimeout(hideToast, 3000);
  };

  return {
    success,
    error,
    info,
    warning,
    hideToast,
  };
};

