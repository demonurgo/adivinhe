import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  
  const updateApp = () => {
    window.location.reload();
  };
  
  return {
    isUpdateAvailable,
    updateApp,
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    install: async () => false,
    checkForUpdates: () => {}
  };
};

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
