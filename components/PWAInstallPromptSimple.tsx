import React, { useState, useEffect } from 'react';
import Button from './Button';

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('PWA instalado!');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Erro na instalação:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-dismissed', 'true');
  };

  if (!showPrompt || sessionStorage.getItem('pwa-dismissed') === 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-center gap-3">
        <div className="text-2xl">📱</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Instalar App</h3>
          <p className="text-xs text-slate-300">Adicione à sua tela inicial!</p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button onClick={handleInstall} variant="primary" size="sm" className="flex-1 text-xs">
          Instalar
        </Button>
        <Button onClick={handleDismiss} variant="ghost" size="sm" className="text-xs">
          ✕
        </Button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
