import { useEffect, useState } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAHookReturn {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  installPWA: () => Promise<boolean>;
  updateAvailable: boolean;
  updateApp: () => void;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
  }
}

export function usePWA(): PWAHookReturn {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Verifica se o app já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkIfInstalled();

    // Registra o service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          setServiceWorkerRegistration(registration);

          // Verifica por atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Escuta mensagens do service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SW_UPDATE_AVAILABLE') {
              setUpdateAvailable(true);
            }
          });

          console.log('[PWA] Service Worker registered successfully');
        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();

    // Escuta eventos de instalação
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    // Escuta eventos de app instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      console.log('[PWA] App was installed');
    };

    // Escuta mudanças no status online/offline
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    const handleOfflineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    if (!installPrompt) {
      return false;
    }

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setInstallPrompt(null);
        setIsInstallable(false);
        return true;
      } else {
        console.log('[PWA] User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Error during installation:', error);
      return false;
    }
  };

  const updateApp = () => {
    if (serviceWorkerRegistration?.waiting) {
      serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recarrega a página após a atualização
      serviceWorkerRegistration.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  return {
    isInstalled,
    isInstallable,
    isOnline,
    installPWA,
    updateAvailable,
    updateApp,
  };
}

// Hook para cache de recursos específicos
export function usePWACache() {
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'caching' | 'cached' | 'error'>('idle');

  const cacheResources = async (urls: string[]): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    setCacheStatus('caching');

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (registration.active) {
        const messageChannel = new MessageChannel();
        
        return new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            if (event.data.success) {
              setCacheStatus('cached');
              resolve(true);
            } else {
              setCacheStatus('error');
              resolve(false);
            }
          };

          registration.active!.postMessage(
            { type: 'CACHE_URLS', urls },
            [messageChannel.port2]
          );
        });
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Cache error:', error);
      setCacheStatus('error');
      return false;
    }
  };

  return {
    cacheStatus,
    cacheResources,
  };
}

// Utilitário para detectar capacidades PWA
export const PWACapabilities = {
  hasServiceWorker: 'serviceWorker' in navigator,
  hasNotifications: 'Notification' in window,
  hasPushManager: 'PushManager' in window,
  hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
  hasWebShare: 'share' in navigator,
  hasWebShareTarget: 'getInstalledRelatedApps' in navigator,
  isStandalone: window.matchMedia('(display-mode: standalone)').matches,
  isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
};

// Utilitário para notificações
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

// Utilitário para compartilhamento
export async function shareContent(data: ShareData): Promise<boolean> {
  if ('share' in navigator) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('[PWA] Share error:', error);
      return false;
    }
  }
  
  // Fallback para compartilhamento manual
  if (data.url) {
    try {
      await navigator.clipboard.writeText(data.url);
      return true;
    } catch (error) {
      console.error('[PWA] Clipboard error:', error);
      return false;
    }
  }
  
  return false;
}
