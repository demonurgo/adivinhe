import React, { useState, useEffect } from 'react';

interface WordRepetitionWarningProps {
  riskLevel: 'baixo' | 'moderado' | 'alto' | 'critico';
  message: string;
  healthPercentage: number;
  isVisible: boolean;
  onClose: () => void;
  onChangeCategory: () => void;
}

const WordRepetitionWarning: React.FC<WordRepetitionWarningProps> = ({ 
  riskLevel, 
  message, 
  healthPercentage,
  isVisible, 
  onClose,
  onChangeCategory 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getWarningStyles = () => {
    switch (riskLevel) {
      case 'critico':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          border: 'border-red-400',
          text: 'text-white',
          icon: '🚨',
          progressColor: 'bg-red-300'
        };
      case 'alto':
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
          border: 'border-orange-400',
          text: 'text-white',
          icon: '⚠️',
          progressColor: 'bg-orange-300'
        };
      case 'moderado':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
          border: 'border-yellow-400',
          text: 'text-white',
          icon: '💡',
          progressColor: 'bg-yellow-300'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          border: 'border-blue-400',
          text: 'text-white',
          icon: 'ℹ️',
          progressColor: 'bg-blue-300'
        };
    }
  };

  const styles = getWarningStyles();

  return (
    <div 
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 transform ${
        mounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className={`${styles.bg} ${styles.text} rounded-xl shadow-2xl border ${styles.border} backdrop-blur-sm`}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="text-2xl flex-shrink-0">{styles.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-1">
                  {riskLevel === 'critico' && 'Palavras Quase Esgotadas!'}
                  {riskLevel === 'alto' && 'Poucas Palavras Restantes'}
                  {riskLevel === 'moderado' && 'Atenção: Possível Repetição'}
                </h3>
                <p className="text-xs opacity-90 leading-relaxed">{message}</p>
                
                {/* Barra de progresso */}
                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>Palavras disponíveis</span>
                    <span className="font-bold">{Math.round(healthPercentage)}%</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${styles.progressColor} transition-all duration-500 ease-out`}
                      style={{ width: `${healthPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1"
                title="Fechar aviso"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Botão de ação */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={onChangeCategory}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1"
            >
              <span>🔄</span>
              <span>Trocar Categoria</span>
            </button>
            
            <button
              onClick={onClose}
              className="bg-black/20 hover:bg-black/30 text-white text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200"
            >
              Continuar Assim
            </button>
          </div>
        </div>
        
        {/* Animação de pulse para casos críticos */}
        {riskLevel === 'critico' && (
          <div className="absolute inset-0 rounded-xl bg-red-400/20 animate-pulse pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default WordRepetitionWarning;