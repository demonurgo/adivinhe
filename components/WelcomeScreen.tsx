import React, { useState, useEffect } from 'react';
import Button from './Button';
import { CogIcon, ChartBarIcon, APP_VERSION } from '../constants';
import { HyperText } from './magicui/hyper-text';

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
  
  // Animate elements on mount
  useEffect(() => {
    setMounted(true);
  }, []);


  // Formatar a string de versão
  const versionString = `v${APP_VERSION.version}${APP_VERSION.isDirty ? '*' : ''}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
        <div 
          className={`w-full max-w-2xl mx-auto p-7 sm:p-8 bg-gradient-to-br from-sky-100/95 via-sky-50/90 to-indigo-100/95 rounded-3xl shadow-2xl border border-sky-300/50 flex flex-col items-center transition-all duration-700 transform ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
        >
        {/* Decorative shape */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-300/30 to-teal-300/30 rounded-full blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4"></div>
        
        {/* Logo container with animation */}
        <div className={`relative transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <HyperText  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-2 text-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 tracking-wide drop-shadow-lg"
            duration={1000}
            delay={500}
            startOnView={true}
            animateOnHover={true}
            as="h1"
            style={{ fontFamily: 'Comfortaa, sans-serif' }}
            >
            Adivinhe Já!  
          </HyperText>
          <div className="h-2 w-28 sm:w-32 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 my-2 sm:my-3 opacity-80"></div>
          <p className="text-sm sm:text-base mb-8 sm:mb-10 max-w-sm mx-auto text-slate-600 text-center">
            Desafie-se a descrever palavras e teste seu vocabulário neste jogo divertido!
          </p>
        </div>
        
        {/* Play button with enhanced animations */}
        <div className={`w-full mb-10 sm:mb-12 flex justify-center transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="relative group cursor-pointer" onClick={onStartGame}>
            {/* Main button container */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-[3px] rounded-3xl shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-500 group-hover:scale-105">
              <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl px-12 sm:px-16 py-6 sm:py-8 overflow-hidden">
                {/* Animated background layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700/50 via-pink-700/50 to-orange-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
                
                {/* Floating particles */}
                <div className="absolute top-4 left-8 w-2 h-2 bg-yellow-300 rounded-full opacity-60 group-hover:animate-bounce group-hover:opacity-100 transition-all duration-500 delay-100"></div>
                <div className="absolute top-6 right-12 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-50 group-hover:animate-ping group-hover:opacity-90 transition-all duration-500 delay-200"></div>
                <div className="absolute bottom-4 left-12 w-2.5 h-2.5 bg-pink-300 rounded-full opacity-40 group-hover:animate-pulse group-hover:opacity-80 transition-all duration-500 delay-300"></div>
                <div className="absolute bottom-6 right-8 w-1 h-1 bg-white rounded-full opacity-70 group-hover:animate-ping group-hover:opacity-100 transition-all duration-500 delay-150"></div>
                
                {/* Shine effect */}
                <div className="absolute top-0 left-[-100%] h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000 ease-out"></div>
                
                {/* Main content */}
                <div className="relative z-10 flex items-center justify-center gap-4 group-hover:gap-6 transition-all duration-300">
                  {/* Game controller icon */}
                  <div className="relative">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 text-white/90 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                        <path d="M8 8h8v8H8V8zm2 6h4v-4h-4v4z"/>
                        <circle cx="12" cy="12" r="2"/>
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500 delay-200"></div>
                  </div>
                  
                  {/* Play Button Text */}
                  <span className="text-xl sm:text-3xl font-black tracking-wider text-white drop-shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    JOGAR
                  </span>
                  
                  {/* Arrow icon */}
                  <div className="relative">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 text-white/90 group-hover:text-white transition-all duration-500 group-hover:translate-x-2 group-hover:scale-110">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                  </div>
                </div>
                
                {/* Border glow effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
            
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 opacity-0 group-hover:opacity-20 scale-110 group-hover:scale-125 blur-xl transition-all duration-700"></div>
            
            {/* Click ripple effect */}
            <div className="absolute inset-0 rounded-3xl bg-white/10 scale-0 group-active:scale-95 transition-transform duration-150"></div>
          </div>
        </div>

        {/* Footer navigation with enhanced animations */}
        <div className={`w-full mt-auto flex justify-between items-center transition-all duration-1000 delay-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex gap-5 relative">
            {/* Statistics Button with enhanced animations */}
            <div className="relative group">
              <Button 
                onClick={onNavigateToStatistics}
                variant="ghost" 
                size="md"
                className="p-3 rounded-full bg-gradient-to-br from-indigo-100/50 to-blue-100/50 hover:from-indigo-200/70 hover:to-blue-300/70 transition-all duration-500 group-hover:shadow-lg transform group-hover:scale-110 active:scale-95 relative z-10 group-hover:rotate-3"
                aria-label="Histórico e Estatísticas"
                title="Ver histórico de partidas"
                onMouseEnter={() => setHoveredButton('stats')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span className="text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300 transform group-hover:scale-110 group-active:scale-90">
                  {ChartBarIcon}
                </span>
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 scale-0 group-hover:scale-100"></span>
              </Button>
              
              {/* Tooltip */}
              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none ${hoveredButton === 'stats' ? 'translate-y-0 scale-100' : 'translate-y-2 scale-90'}`}>
                Estatísticas e Histórico
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-indigo-600"></div>
              </div>
              
              {/* Animated ring */}
              <div className="absolute inset-0 border-2 border-indigo-400/0 group-hover:border-indigo-400/30 rounded-full transition-all duration-500 group-hover:scale-125 group-hover:rotate-12"></div>
            </div>
            
            {/* Configuration Button with enhanced animations */}
            <div className="relative group">
              <Button 
                onClick={onNavigateToConfiguration}
                variant="ghost" 
                size="md"
                className="p-3 rounded-full bg-gradient-to-br from-amber-100/50 to-orange-100/50 hover:from-amber-200/70 hover:to-orange-300/70 transition-all duration-500 group-hover:shadow-lg transform group-hover:scale-110 active:scale-95 relative z-10 group-hover:-rotate-3"
                aria-label="Configurações"
                title="Configurações"
                onMouseEnter={() => setHoveredButton('config')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span className="text-amber-600 group-hover:text-amber-800 transition-colors duration-300 transform group-hover:rotate-90 group-hover:scale-110 group-active:scale-90" style={{ transitionProperty: 'transform, color', transitionDuration: '0.5s' }}>
                  {CogIcon}
                </span>
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 scale-0 group-hover:scale-100"></span>
              </Button>
              
              {/* Tooltip */}
              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none ${hoveredButton === 'config' ? 'translate-y-0 scale-100' : 'translate-y-2 scale-90'}`}>
                Configurações do Jogo
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-amber-600"></div>
              </div>
              
              {/* Animated ring */}
              <div className="absolute inset-0 border-2 border-amber-400/0 group-hover:border-amber-400/30 rounded-full transition-all duration-500 group-hover:scale-125 group-hover:-rotate-12"></div>
            </div>
          </div>
          

        </div>
        
        {/* Game version - usando dados das constantes */}
        <div className="absolute bottom-2 right-3 text-xs text-slate-400 group">
          <span>{versionString}</span>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
            Build {APP_VERSION.build} - {APP_VERSION.lastUpdate}
            {APP_VERSION.lastCommit && (
              <span className="block text-slate-300 text-xs">Commit: {APP_VERSION.lastCommit}</span>
            )}
            <div className="absolute top-full right-2 transform border-4 border-transparent border-t-slate-700"></div>
          </div>
        </div>
        </div>
    </div>
  );
};

export default WelcomeScreen;
