import React, { useState } from 'react';
import { usePWA, PWACapabilities } from '../hooks/usePWA';
import Button from './Button';

interface PWAInstallPromptProps {
  onClose?: () => void;
  className?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose, className = '' }) => {
  const { isInstallable, isInstalled, isOnline, installPWA, updateAvailable, updateApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installPWA();
      if (success && onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Install error:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = () => {
    updateApp();
  };

  // Não mostra nada se já estiver instalado e não houver atualizações
  if (isInstalled && !updateAvailable) {
    return null;
  }

  // Se há atualização disponível, mostra prompt de atualização
  if (updateAvailable) {
    return (
      <div className={`bg-blue-900/90 backdrop-blur-sm border border-blue-500/50 rounded-lg p-4 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">
              🔄 Atualização Disponível
            </h3>
            <p className="text-blue-100 text-sm mb-3">
              Uma nova versão do app está disponível com melhorias e correções.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              >
                Atualizar Agora
              </Button>
              {onClose && (
                <Button 
                  onClick={onClose}
                  variant="secondary"
                  className="px-4 py-2 text-sm"
                >
                  Mais Tarde
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se for instalável, mostra prompt de instalação
  if (isInstallable) {
    return (
      <div className={`bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-sm border border-purple-500/50 rounded-lg p-4 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">
              📱 Instalar Aplicativo
            </h3>
            <p className="text-purple-100 text-sm mb-3">
              Instale o Adivinhe Já! no seu dispositivo para uma experiência mais rápida e conveniente!
            </p>
            
            <div className="mb-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-purple-300 text-xs hover:text-purple-200 transition-colors"
              >
                {showDetails ? '▼' : '▶'} Ver benefícios
              </button>
              
              {showDetails && (
                <div className="mt-2 text-xs text-purple-200 space-y-1">
                  <div>✓ Acesso rápido sem abrir o navegador</div>
                  <div>✓ Funciona offline</div>
                  <div>✓ Notificações push (futuro)</div>
                  <div>✓ Interface otimizada</div>
                  <div>✓ Atualizações automáticas</div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm flex items-center gap-2"
              >
                {isInstalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Instalando...
                  </>
                ) : (
                  <>
                    📱 Instalar
                  </>
                )}
              </Button>
              {onClose && (
                <Button 
                  onClick={onClose}
                  variant="secondary"
                  className="px-4 py-2 text-sm"
                >
                  Agora Não
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Componente para mostrar status de conectividade
export const ConnectionStatus: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm z-50">
      📡 Você está offline. Algumas funcionalidades podem estar limitadas.
    </div>
  );
};

// Componente para mostrar informações do PWA
export const PWAInfo: React.FC = () => {
  const { isInstalled, isOnline } = usePWA();
  const [showInfo, setShowInfo] = useState(false);

  if (!showInfo) {
    return (
      <button
        onClick={() => setShowInfo(true)}
        className="fixed bottom-4 right-4 bg-slate-700/80 backdrop-blur-sm text-slate-300 p-2 rounded-full hover:bg-slate-600/80 transition-colors z-40"
        title="Informações do App"
      >
        ℹ️
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg p-4 max-w-xs z-50">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-slate-200">Status do App</h4>
        <button
          onClick={() => setShowInfo(false)}
          className="text-slate-400 hover:text-slate-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-300">Instalado:</span>
          <span className={isInstalled ? 'text-green-400' : 'text-red-400'}>
            {isInstalled ? '✓ Sim' : '✗ Não'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-300">Online:</span>
          <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
            {isOnline ? '✓ Sim' : '✗ Não'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-300">Service Worker:</span>
          <span className={PWACapabilities.hasServiceWorker ? 'text-green-400' : 'text-red-400'}>
            {PWACapabilities.hasServiceWorker ? '✓ Ativo' : '✗ Inativo'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-300">Cache Offline:</span>
          <span className={PWACapabilities.hasServiceWorker ? 'text-green-400' : 'text-red-400'}>
            {PWACapabilities.hasServiceWorker ? '✓ Disponível' : '✗ Indisponível'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
