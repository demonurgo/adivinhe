// components/CacheStatusIndicator.tsx
import React from 'react';
import useLocalCache from '../hooks/useLocalCache';

interface CacheStatusIndicatorProps {
  showDetailed?: boolean;
  className?: string;
}

const CacheStatusIndicator: React.FC<CacheStatusIndicatorProps> = ({ 
  showDetailed = false, 
  className = '' 
}) => {
  const { status, isReady, hasWords, isWorking } = useLocalCache();

  if (!status.isInitialized) {
    return null;
  }

  const getStatusIcon = () => {
    if (isWorking) return '🔄';
    if (hasWords && isReady) return '✅';
    if (status.error) return '❌';
    return '📦';
  };

  const getStatusText = () => {
    if (isWorking) return 'Carregando cache...';
    if (hasWords && isReady) return `${status.totalCachedWords} palavras`;
    if (status.error) return 'Erro no cache';
    return 'Cache vazio';
  };

  if (!showDetailed) {
    return (
      <div className={`inline-flex items-center gap-2 text-sm ${className}`}>
        <span>{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className={`p-3 bg-slate-800/50 rounded-lg text-sm ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{getStatusIcon()}</span>
        <span className="font-semibold">Cache Local</span>
      </div>
      
      <div className="space-y-1 text-slate-300">
        <div>Palavras: {status.totalCachedWords}</div>
        <div>Status: {getStatusText()}</div>
        {status.lastUpdate > 0 && (
          <div>
            Atualizado: {new Date(status.lastUpdate).toLocaleTimeString()}
          </div>
        )}
        {status.error && (
          <div className="text-red-400 text-xs mt-2">
            Erro: {status.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheStatusIndicator;