import React, { useState, useEffect } from 'react';
import Button from './Button';
import { CogIcon, ChartBarIcon } from '../constants';
// Importar a versão do aplicativo e o tipo
import versionData from '../version.json';
import { VersionData } from '../types';
import { HyperText } from './magicui/hyper-text';
import DatabasePopulator from './DatabasePopulator';
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
  const [showDatabasePopulator, setShowDatabasePopulator] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Animate elements on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenPasswordModal = () => {
    setPasswordInput('');
    setPasswordError(null);
    setShowPasswordModal(true);
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordInput('');
    setPasswordError(null);
  };

  const handlePasswordSubmit = () => {
    // TODO: Use a more secure way to store and check the password
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'; // Fallback for safety, ensure VITE_ADMIN_PASSWORD is set
    if (passwordInput === adminPassword) {
      setShowPasswordModal(false);
      setShowDatabasePopulator(true);
      setPasswordError(null);
    } else {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
    setPasswordInput('');
  };

  // Decorative emojis for the background
  // Decorative emojis for the background - Expanded collection
  const decorativeIcons = [
    "🎮", "🎯", "🎪", "🎨", "🎭", "🧩", "🎲", "🎵", "🎬", "🎤",
    "📚", "📖", "✨", "🌟", "💫", "🎊", "🎉", "🏆", "🎖️", "🏅",
    "🎈", "🎁", "🎀", "🌈", "⭐", "💎", "🔮", "🎺", "🎻", "🎸",
    "🎹", "🥁", "🎼", "🎶", "🎙️", "🎧", "📝", "✏️", "🖊️", "📐",
    "📏", "🖍️", "🖌️", "🖼️", "📋", "🎪", "🎯", "🎮", "🎨", "🎭"
  ];

  // Generate more decorative elements for better visual coverage
  const generateDecorations = () => {
    const elements = [];
    const numElements = 40; // Increased from 10 to 40 for more visual density
    
    for (let i = 0; i < numElements; i++) {
      const icon = decorativeIcons[Math.floor(Math.random() * decorativeIcons.length)];
      elements.push({
        id: i,
        icon,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 25,
        size: Math.random() * 0.6 + 0.7 // Random size between 0.7 and 1.3
      });
    }
    return elements;
  };

  const [decorations] = useState(() => generateDecorations());

  // Formatar a string de versão
  const versionString = `v${appVersion.version}${appVersion.isDirty ? '*' : ''}`;

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background particles removed for better performance */}
      
      {/* Main content container */}
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div 
          className={`w-full max-w-2xl mx-auto p-7 sm:p-8 bg-gradient-to-br from-sky-100/90 via-sky-50/80 to-indigo-100/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-sky-300/50 flex flex-col items-center transition-all duration-700 transform ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
        >
        {/* Decorative shape */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-300/30 to-teal-300/30 rounded-full blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4"></div>
        
        {/* Logo container with animation */}
        <div className={`relative transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <HyperText  className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-center mb-2 text-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 tracking-wide drop-shadow-lg"
            duration={1000}
            delay={500}
            startOnView={true}
            animateOnHover={true}
            as="h1"
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
                  <span className="text-2xl sm:text-4xl font-black tracking-wider text-white drop-shadow-2xl group-hover:scale-105 transition-transform duration-500">
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
          
          {canPopulateDatabase && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Generate Words Button Clicked!'); // Debug log
                handleOpenPasswordModal();
              }}
              className="relative group cursor-pointer bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-[2px] rounded-2xl shadow-2xl hover:shadow-emerald-500/30 transition-all duration-700 hover:scale-110 hover:rotate-1 w-[130px] h-[55px] border-0 outline-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50"
              type="button"
              title="Gerar palavras com IA"
            >
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden w-full h-full flex items-center justify-center">
                {/* Animated circuit pattern background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-2 left-2 w-1 h-4 bg-emerald-400 rounded-full opacity-60 group-hover:animate-pulse"></div>
                  <div className="absolute top-1 right-3 w-1 h-1 bg-cyan-400 rounded-full group-hover:animate-ping"></div>
                  <div className="absolute bottom-2 left-4 w-1 h-1 bg-teal-400 rounded-full group-hover:animate-bounce"></div>
                  <div className="absolute bottom-1 right-2 w-1 h-3 bg-emerald-400 rounded-full opacity-70 group-hover:animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-white rounded-full group-hover:animate-ping"></div>
                </div>
                
                {/* Sweep animation */}
                <div className="absolute top-0 left-[-100%] h-full w-1/2 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent group-hover:left-full transition-all duration-1000 ease-out transform skew-x-12 pointer-events-none"></div>
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-center w-full h-full pointer-events-none">
                  {/* Generation Button Text - Centralized */}
                  <div className="text-center relative w-full px-2 pointer-events-none">
                    <span className="text-[3px] sm:text-[4px] md:text-[5px] font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors duration-500 pointer-events-none whitespace-nowrap">
                      AI GEN
                    </span>
                  </div>
                </div>
                
                {/* Glowing border */}
                <div className="absolute inset-0 rounded-2xl border border-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                {/* Pulsing core */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse pointer-events-none"></div>
              </div>
              
              {/* Enhanced tooltip */}
              <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none transform group-hover:translate-y-0 translate-y-2 shadow-lg border border-emerald-400/20 z-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                  <span>Expandir base de dados com IA</span>
                </div>
                <div className="absolute top-full right-4 transform border-4 border-transparent border-t-emerald-600"></div>
              </div>
            </button>
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

      {showDatabasePopulator && (
        <DatabasePopulator onClose={() => setShowDatabasePopulator(false)} />
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-2xl border border-slate-700 w-full max-w-sm transform transition-all duration-300 animate-scale-in">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Acesso Restrito</h2>
            <p className="text-sm text-slate-300 mb-1">Por favor, insira a senha para gerar palavras:</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="w-full p-2.5 rounded-md bg-slate-700 border border-slate-600 text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-300"
              placeholder="Senha"
            />
            {passwordError && (
              <p className="text-red-400 text-xs mt-2 animate-fade-in">{passwordError}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button 
                onClick={handlePasswordModalClose} 
                variant="ghost" 
                className="text-slate-300 hover:bg-slate-700 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handlePasswordSubmit} 
                variant="primary"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-glow-sm"
              >
                <span className="flex items-center gap-1">
                  Confirmar 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
