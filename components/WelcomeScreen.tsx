import React, { useState, useEffect } from 'react';
import Button from './Button';
import { CogIcon, ChartBarIcon } from '../constants';
// Importar a versão do aplicativo e o tipo
import versionData from '../version.json';
import { VersionData } from '../types';

// Converter o versionData para o tipo correto
const appVersion = versionData as VersionData;

interface WelcomeScreenProps {
  onStartGame: () => void;
  onNavigateToConfiguration: () => void;
  onNavigateToStatistics: () => void;
  onGenerateWords: () => void;
  apiKeyExists: boolean;
  supabaseConfigured: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartGame,
  onNavigateToConfiguration,
  onNavigateToStatistics,
  onGenerateWords,
  apiKeyExists,
  supabaseConfigured
}) => {
  const canPopulateDatabase = apiKeyExists && supabaseConfigured;
  const [mounted, setMounted] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  
  // Animate elements on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Decorative emojis for the background
  const decorativeIcons = ["🎮", "🎯", "🎪", "🎨", "🎭", "🎪", "🧩", "🎲", "🎯", "🎪"];

  // Formatar a string de versão
  const versionString = `v${appVersion.version}${appVersion.isDirty ? '*' : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {decorativeIcons.map((icon, index) => (
          <div 
            key={index}
            className="absolute text-2xl sm:text-3xl opacity-10 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          >
            {icon}
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <div 
        className={`w-full max-w-2xl mx-auto p-7 sm:p-8 bg-gradient-to-br from-sky-100/90 via-sky-50/80 to-indigo-100/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-sky-300/50 flex flex-col items-center transition-all duration-700 transform ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        {/* Decorative shape */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-300/30 to-teal-300/30 rounded-full blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4"></div>
        
        {/* Logo container with animation */}
        <div className={`relative transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-2 text-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
            Adivinhe Já!
          </h1>
          <div className="h-2 w-28 sm:w-32 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 my-2 sm:my-3 opacity-80"></div>
          <p className="text-sm sm:text-base mb-8 sm:mb-10 max-w-sm mx-auto text-slate-600 text-center">
            Desafie-se a descrever palavras e teste seu vocabulário neste jogo divertido!
          </p>
        </div>
        
        {/* Play button with enhanced animations */}
        <div className={`w-full mb-10 sm:mb-12 flex justify-center transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Button
            onClick={onStartGame}
            variant="primary"
            size="xl"
            className="px-10 sm:px-12 py-5 sm:py-6 text-xl sm:text-2xl font-bold transition-all duration-500 transform hover:scale-105 hover:shadow-glow hover:rotate-1 animate-pulse-slow relative group overflow-hidden rounded-xl border border-pink-500/30"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="group-hover:scale-110 transition-transform duration-300 tracking-wider text-white drop-shadow-md">JOGAR</span>
              <span className="relative w-7 h-7 group-hover:translate-x-1 transition-transform duration-300 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="drop-shadow-md">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-600/80 via-purple-600/80 to-blue-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></span>
            
            {/* Shine effect */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-0 left-[-100%] h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-30 group-hover:animate-shine"></div>
            </div>
            
            {/* Animated particles */}
            <div className="absolute right-8 top-1/3 transform -translate-y-1/2 w-3 h-3 bg-pink-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-100 scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
            <div className="absolute left-8 bottom-1/3 transform -translate-y-1/2 w-3 h-3 bg-purple-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-200 scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
          </Button>
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
          
          {canPopulateDatabase && (
            <div className="relative group">
              <Button 
                onClick={onGenerateWords}
                variant="secondary" 
                size="md"
                className="transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 group relative overflow-hidden px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-lg shadow-lg border border-teal-600/30"
              >
                <span className="flex items-center gap-2 sm:gap-3 relative z-10">
                  <span className="transform rotate-0 group-hover:rotate-180 transition-transform duration-700 text-xl sm:text-2xl">🔄</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600/50 to-emerald-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              </Button>
              
              {/* Animated particles */}
              <div className="absolute -right-1 -top-1 w-2 sm:w-3 h-2 sm:h-3 bg-teal-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-100 transform scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
              <div className="absolute -left-1 -bottom-1 w-2 sm:w-2 h-2 sm:h-2 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-200 transform scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none transform group-hover:translate-y-0 translate-y-2">
                Gerar novas palavras para o jogo
                <div className="absolute top-full right-4 transform border-4 border-transparent border-t-teal-600"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Game version - agora usando os dados do arquivo version.json */}
        <div className="absolute bottom-2 right-3 text-xs text-slate-400 group">
          <span>{versionString}</span>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
            Build {appVersion.build} - {appVersion.lastUpdate}
            {appVersion.lastCommit && (
              <span className="block text-slate-300 text-xs">Commit: {appVersion.lastCommit}</span>
            )}
            <div className="absolute top-full right-2 transform border-4 border-transparent border-t-slate-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 