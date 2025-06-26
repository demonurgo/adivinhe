import React, { useState, useEffect } from 'react';
import Button from './Button';
import { CogIcon, ChartBarIcon, APP_VERSION } from '../constants';

interface WelcomeScreenProps {
  onStartGame: () => void;
  onNavigateToConfiguration: () => void;
  onNavigateToStatistics: () => void;
  apiKeyExists: boolean;
  supabaseConfigured: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartGame,
  onNavigateToConfiguration,
  onNavigateToStatistics,
  apiKeyExists,
  supabaseConfigured
}) => {
  const [mounted, setMounted] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Animate elements on mount with staggered timing
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Function to handle button press with neumorphic animation
  const handleButtonPress = (buttonType: string, callback: () => void) => {
    if (isNavigating) return; // Prevent multiple clicks
    
    setIsNavigating(true);
    setPressedButton(buttonType);
    
    // Animate button press (inward) then navigate
    setTimeout(() => {
      setPressedButton(null);
      setIsNavigating(false);
      callback();
    }, 300); // 300ms for the press animation
  };

  // Format version string
  const versionString = `v${APP_VERSION.version}${APP_VERSION.isDirty ? '*' : ''}`;

  // Check if game can be started
  const canStartGame = apiKeyExists || supabaseConfigured;

  return (
    <div className="welcome-container">
      {/* Background subtle patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-gray-300 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="min-h-screen w-full flex items-center justify-center p-6 relative z-10">
        <div 
          className={`
            w-full max-w-md mx-auto p-8 rounded-3xl
            transition-all duration-500 ease-out
            ${mounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'}
          `}
          style={{
            background: 'linear-gradient(145deg, #f0f0f3, #e6e6e9)',
            boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7)',
          }}
        >
          
          {/* Header Section */}
          <header className="text-center mb-10">
            <div 
              className={`
                transition-all duration-700 delay-200 ease-out
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
            >
              <h1 className="neumorphic-title text-4xl mb-4 tracking-tight">
                Adivinhe Já!
              </h1>
              
              {/* Decorative element */}
              <div 
                className="h-1 w-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                style={{
                  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.8)'
                }}
              ></div>
              

            </div>
          </header>

          {/* Main Play Button */}
          <div 
            className={`
              mb-8 transition-all duration-700 delay-400 ease-out flex justify-center
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            <button
              onClick={() => canStartGame && handleButtonPress('play', onStartGame)}
              disabled={!canStartGame || isNavigating}
              className={`
                p-4 rounded-full border-none cursor-pointer
                transition-all duration-200 ease-out
                focus:outline-none
                disabled:opacity-60 disabled:cursor-not-allowed
                group relative overflow-hidden
                ${isNavigating ? 'pointer-events-none' : ''}
              `}
              style={{
                background: 'transparent'
              }}
            >
              {/* Play icon with neumorphic effect */}
              <div 
                className={`
                  flex items-center justify-center w-16 h-16 rounded-full text-white
                  transition-all duration-300 ease-out
                  ${!canStartGame ? 'opacity-60' : ''}
                  ${pressedButton === 'play' ? 'scale-95' : ''}
                `}
                style={{
                  background: canStartGame 
                    ? 'linear-gradient(145deg, #f5f5f7, #e8e8eb)' 
                    : 'linear-gradient(145deg, #ebebed, #d4d4d6)',
                  boxShadow: pressedButton === 'play' && canStartGame
                    ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.2), inset -4px -4px 8px rgba(255, 255, 255, 0.8)'
                    : canStartGame 
                      ? '6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.7)'
                      : 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)',
                  transform: pressedButton === 'play' ? 'translateY(2px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (canStartGame && !isNavigating && pressedButton !== 'play') {
                    e.currentTarget.style.boxShadow = '8px 8px 16px rgba(0, 0, 0, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canStartGame && !isNavigating && pressedButton !== 'play') {
                    e.currentTarget.style.boxShadow = '6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }
                }}
              >
                {/* Inner play icon */}
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ease-out`}
                  style={{
                    background: 'linear-gradient(145deg, #5b9bd5, #4285f4)',
                    boxShadow: pressedButton === 'play' 
                      ? 'inset 2px 2px 4px rgba(0, 0, 0, 0.4), inset -1px -1px 2px rgba(255, 255, 255, 0.2)'
                      : '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5 text-white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Secondary Actions */}
          <div 
            className={`
              flex justify-center gap-6 mb-8 transition-all duration-700 delay-600 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            
            {/* Statistics Button */}
            <button
              onClick={() => handleButtonPress('stats', onNavigateToStatistics)}
              disabled={isNavigating}
              className={`
                border-none cursor-pointer group focus:outline-none transition-all duration-300 p-4 rounded-xl
                ${isNavigating ? 'pointer-events-none' : ''}
                ${pressedButton === 'stats' ? 'scale-95' : ''}
              `}
              onMouseEnter={() => !isNavigating && setHoveredButton('stats')}
              onMouseLeave={() => setHoveredButton(null)}
              title="Estatísticas e Histórico"
              style={{
                background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                boxShadow: pressedButton === 'stats'
                  ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.2), inset -4px -4px 8px rgba(255, 255, 255, 0.8)'
                  : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
                transform: pressedButton === 'stats' ? 'translateY(2px)' : 'translateY(0)',
                opacity: isNavigating && pressedButton !== 'stats' ? 0.7 : 1
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-blue-600 text-xl">
                  {ChartBarIcon}
                </div>
              </div>
            </button>

            {/* Configuration Button */}
            <button
              onClick={() => handleButtonPress('config', onNavigateToConfiguration)}
              disabled={isNavigating}
              className={`
                border-none cursor-pointer group focus:outline-none transition-all duration-300 p-4 rounded-xl
                ${isNavigating ? 'pointer-events-none' : ''}
                ${pressedButton === 'config' ? 'scale-95' : ''}
              `}
              onMouseEnter={() => !isNavigating && setHoveredButton('config')}
              onMouseLeave={() => setHoveredButton(null)}
              title="Configurações"
              style={{
                background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                boxShadow: pressedButton === 'config'
                  ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.2), inset -4px -4px 8px rgba(255, 255, 255, 0.8)'
                  : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
                transform: pressedButton === 'config' ? 'translateY(2px)' : 'translateY(0)',
                opacity: isNavigating && pressedButton !== 'config' ? 0.7 : 1
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-orange-600 text-xl">
                  {CogIcon}
                </div>
              </div>
            </button>
          </div>

          {/* Configuration Status */}
          <div 
            className={`
              p-4 rounded-xl mb-6 transition-all duration-700 delay-700 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              ${isNavigating ? 'opacity-50' : ''}
            `}
            style={{
              background: 'linear-gradient(145deg, #e8e8eb, #f0f0f3)',
              boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.8)',
            }}
          >
            <div className="text-center">
              <h3 className="neumorphic-subtitle text-sm font-medium mb-3">
                Status das Configurações
              </h3>
              
              <div className="flex justify-center gap-6">
                {/* API Status */}
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-300`}
                    style={{
                      background: apiKeyExists 
                        ? 'linear-gradient(145deg, #4ade80, #22c55e)' 
                        : 'linear-gradient(145deg, #d1d5db, #9ca3af)',
                      boxShadow: apiKeyExists
                        ? '2px 2px 4px rgba(0, 0, 0, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.8), 0 0 6px rgba(34, 197, 94, 0.4)'
                        : '1px 1px 2px rgba(0, 0, 0, 0.1), -1px -1px 2px rgba(255, 255, 255, 0.8)'
                    }}
                  ></div>
                  <span className="neumorphic-caption text-xs">OpenAI API</span>
                </div>
                
                {/* Database Status */}
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-300`}
                    style={{
                      background: supabaseConfigured 
                        ? 'linear-gradient(145deg, #4ade80, #22c55e)' 
                        : 'linear-gradient(145deg, #d1d5db, #9ca3af)',
                      boxShadow: supabaseConfigured
                        ? '2px 2px 4px rgba(0, 0, 0, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.8), 0 0 6px rgba(34, 197, 94, 0.4)'
                        : '1px 1px 2px rgba(0, 0, 0, 0.1), -1px -1px 2px rgba(255, 255, 255, 0.8)'
                    }}
                  ></div>
                  <span className="neumorphic-caption text-xs">Supabase DB</span>
                </div>
              </div>
              
              {!canStartGame && !isNavigating && (
                <div 
                  className="mt-3 p-2 rounded-lg text-xs text-orange-700"
                  style={{
                    background: 'linear-gradient(145deg, #f4e4bc, #f0daa3)',
                    boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.9)'
                  }}
                >
                  ⚠️ Configure pelo menos uma fonte de palavras para jogar
                </div>
              )}
              
              {isNavigating && (
                <div 
                  className="mt-3 p-2 rounded-lg text-xs text-blue-700 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(145deg, #e0f2fe, #b3e5fc)',
                    boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
                  Carregando...
                </div>
              )}
            </div>
          </div>

          {/* Version Info */}
          <footer 
            className={`
              text-center transition-all duration-700 delay-800 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              ${isNavigating ? 'opacity-30' : ''}
            `}
          >
            <div className="neumorphic-caption text-xs group cursor-default">
              <span className={`transition-colors duration-200 ${!isNavigating ? 'group-hover:text-gray-600' : ''}`}>
                {versionString}
              </span>
              {APP_VERSION.build && !isNavigating && (
                <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Build {APP_VERSION.build}
                  {APP_VERSION.lastUpdate && ` • ${APP_VERSION.lastUpdate}`}
                </div>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
