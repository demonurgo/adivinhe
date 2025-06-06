import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import Button from './Button';
import { CogIcon, ChartBarIcon } from '../constants';
import DatabasePopulator from './DatabasePopulator';
import { HyperText } from './magicui/hyper-text';
import { SparklesText } from './magicui/sparkles-text';
import { MorphingText } from './magicui/morphing-text';

interface CategorySelectionScreenProps {
  categories: Category[];
  selectedCategories: Category[];
  onSelectCategory: (categories: Category[]) => void;
  onStartGame: () => void;
  onNavigateToConfiguration: () => void;
  onNavigateToStatistics: () => void;
  error?: string | null;
  apiKeyExists: boolean;
  supabaseConfigured: boolean; 
}

const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({
  categories,
  selectedCategories,
  onSelectCategory,
  onStartGame,
  onNavigateToConfiguration,
  onNavigateToStatistics,
  error,
  apiKeyExists,
  supabaseConfigured
}) => {
  const [showDatabasePopulator, setShowDatabasePopulator] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleCategory = (category: Category) => {
    const isSelected = selectedCategories.find((c: Category) => c.id === category.id);
    if (isSelected) {
      onSelectCategory(selectedCategories.filter((c: Category) => c.id !== category.id));
    } else {
      onSelectCategory([...selectedCategories, category]);
    }
  };

  const canPlay = (apiKeyExists || supabaseConfigured) && selectedCategories.length > 0;
  const canPopulateDatabase = apiKeyExists && supabaseConfigured;

  const generalError = error && !error.toLowerCase().includes("vite_gemini_api_key") && !error.toLowerCase().includes("vite_supabase_anon_key") ? error : null;
  const configError = error && (error.toLowerCase().includes("vite_gemini_api_key") || error.toLowerCase().includes("vite_supabase_anon_key")) ? error : null;

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

  return (
    <>
      <div className={`w-full max-w-3xl mx-auto p-5 sm:p-6 md:p-8 bg-gradient-to-br from-sky-100/90 via-sky-50/80 to-indigo-100/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-sky-300/50 transition-all duration-500 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <HyperText 
            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent py-0 tracking-wide drop-shadow-lg"
            duration={1000}
            delay={500}
            startOnView={true}
            animateOnHover={true}
            as="h1"
          >
            Adivinhe Já!
          </HyperText>
          <div className="flex gap-4 sm:gap-5">
            {canPopulateDatabase && (
              <div className="relative group hidden sm:block">
                {/* Desktop Generate Words Button - Fixed Sizing */}
                <div 
                  onClick={handleOpenPasswordModal}
                  className="relative cursor-pointer overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-[2px] rounded-xl shadow-2xl group-hover:shadow-purple-500/30 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-1 w-[120px] h-[50px]"
                >
                  <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-xl overflow-hidden backdrop-blur-sm w-full h-full flex items-center justify-center">
                    {/* Holographic grid pattern */}
                    <div className="absolute inset-0 opacity-15">
                      <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-1 left-1 w-1 h-1 bg-violet-400 rounded-full group-hover:animate-ping"></div>
                        <div className="absolute top-2 right-2 w-0.5 h-2 bg-purple-400 rounded-full group-hover:animate-pulse"></div>
                        <div className="absolute bottom-1 left-3 w-1 h-1 bg-indigo-400 rounded-full group-hover:animate-bounce"></div>
                        <div className="absolute bottom-2 right-1 w-0.5 h-1 bg-violet-400 rounded-full group-hover:animate-pulse"></div>
                        {/* Grid lines */}
                        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-400/20 to-transparent"></div>
                        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-indigo-400/20 to-transparent"></div>
                      </div>
                    </div>
                    
                    {/* Energy sweep */}
                    <div className="absolute top-0 left-[-100%] h-full w-1/2 bg-gradient-to-r from-transparent via-purple-400/25 to-transparent group-hover:left-full transition-all duration-900 ease-out transform skew-x-12"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-center gap-2 px-2">
                      {/* Neural network icon */}
                      <div className="relative flex-shrink-0">
                        <div className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-45">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="7" cy="7" r="2" opacity="0.8"/>
                            <circle cx="17" cy="7" r="2" opacity="0.8"/>
                            <circle cx="12" cy="12" r="2.5" opacity="1"/>
                            <circle cx="7" cy="17" r="2" opacity="0.8"/>
                            <circle cx="17" cy="17" r="2" opacity="0.8"/>
                            <path d="M9 7L10.5 10.5M15 7L13.5 10.5M10.5 13.5L9 17M13.5 13.5L15 17M9.5 9L10.5 10.5M14.5 9L13.5 10.5" stroke="currentColor" strokeWidth="1" opacity="0.6" fill="none"/>
                          </svg>
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500 delay-200"></div>
                      </div>
                      
                      {/* MorphingText - Fixed container */}
                      <div className="flex-1 text-center relative min-w-0 max-w-[60px]">
                        <MorphingText 
                          className="text-[9px] font-bold text-purple-300 group-hover:text-purple-200 transition-colors duration-500 h-3 w-full leading-none"
                          texts={[
                            "AI FORGE",
                            "NEURAL NET",
                            "BRAIN GEN", 
                            "DEEP LEARN",
                            "WORD LAB"
                          ]}
                        />
                      </div>
                      
                      {/* Quantum processing icon */}
                      <div className="relative flex-shrink-0">
                        <div className="w-3 h-3 text-indigo-400 group-hover:text-indigo-300 transition-all duration-500 group-hover:scale-110 group-hover:rotate-90">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="3" opacity="0.4"/>
                            <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                            <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
                          </svg>
                        </div>
                        <div className="absolute -bottom-0.5 -left-0.5 w-0.5 h-0.5 bg-indigo-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500 delay-300"></div>
                      </div>
                    </div>
                    
                    {/* Holographic border */}
                    <div className="absolute inset-0 rounded-xl border border-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Central energy core */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
                  </div>
                </div>
                
                {/* Outer energy field */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 scale-110 group-hover:scale-125 blur-xl transition-all duration-700"></div>
                
                {/* Data stream particles */}
                <div className="absolute -top-1 left-1 w-0.5 h-0.5 bg-violet-300 rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-float-up transition-all duration-500 delay-100"></div>
                <div className="absolute -bottom-1 right-2 w-0.5 h-0.5 bg-purple-300 rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-float-up transition-all duration-500 delay-200"></div>
                <div className="absolute top-0 -right-1 w-0.5 h-0.5 bg-indigo-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float-up transition-all duration-500 delay-150"></div>
                
                {/* Enhanced tooltip */}
                <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none transform group-hover:translate-y-0 translate-y-2 shadow-lg border border-purple-400/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></span>
                    <span>Ativar geração neural de palavras</span>
                  </div>
                  <div className="absolute top-full right-4 transform border-4 border-transparent border-t-purple-600"></div>
                </div>
              </div>
            )}
            
            {/* Statistics Button with enhanced animations */}
            <div className="relative group">
              <Button 
                onClick={onNavigateToStatistics} 
                variant="ghost" 
                size="md"
                className="p-2 rounded-full bg-gradient-to-br from-indigo-100/50 to-blue-100/50 hover:from-indigo-200/70 hover:to-blue-300/70 transition-all duration-500 group-hover:shadow-lg transform group-hover:scale-110 active:scale-95 relative z-10 group-hover:rotate-3"
                aria-label="Histórico e Estatísticas"
                title="Ver histórico de partidas"
                onMouseEnter={() => setHoveredButton('stats')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span className="text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300 transform group-hover:scale-110">
                  {ChartBarIcon}
                </span>
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 scale-0 group-hover:scale-100"></span>
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
                className="p-2 rounded-full bg-gradient-to-br from-amber-100/50 to-orange-100/50 hover:from-amber-200/70 hover:to-orange-300/70 transition-all duration-500 group-hover:shadow-lg transform group-hover:scale-110 active:scale-95 relative z-10 group-hover:-rotate-3"
                aria-label="Configurações"
                onMouseEnter={() => setHoveredButton('config')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span className="text-amber-600 group-hover:text-amber-800 transition-colors duration-300 transform group-hover:rotate-90" style={{ transitionProperty: 'transform, color', transitionDuration: '0.5s' }}>
                  {CogIcon}
                </span>
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 scale-0 group-hover:scale-100"></span>
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
        
        <p className="text-xs sm:text-sm mb-3 text-slate-700">Escolha uma ou mais categorias:</p>
        
        {(!apiKeyExists || !supabaseConfigured) && (
           <div className="mb-3 p-2 sm:p-3 bg-yellow-800/80 border border-yellow-600 text-yellow-100 text-xs rounded-lg shadow-md">
              <strong>Atenção:</strong>
              {!apiKeyExists && <p className="line-clamp-2">- API Gemini não configurada</p>}
              {!supabaseConfigured && <p className="line-clamp-2">- Supabase não configurado</p>}
              {(apiKeyExists && !supabaseConfigured) && <p className="line-clamp-2">Usando apenas API Gemini</p>}
              {(!apiKeyExists && supabaseConfigured) && <p className="line-clamp-2">Usando apenas Supabase</p>}
              {(!apiKeyExists && !supabaseConfigured) && <p className="line-clamp-2">Configuração incompleta</p>}
          </div>
        )}

        {generalError && (
          <p className="text-red-300 bg-red-900/70 p-2 sm:p-3 rounded-lg mb-3 text-xs shadow-md line-clamp-2">{generalError}</p>
        )}
         {configError && (!apiKeyExists || !supabaseConfigured) && ( 
           <p className="text-yellow-300 bg-yellow-900/70 p-2 sm:p-3 rounded-lg mb-3 text-xs shadow-md line-clamp-2">{configError}</p>
         )}

        <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {categories.map((category: Category, index: number) => {
            const isSelected = !!selectedCategories.find((c: Category) => c.id === category.id);
            const delay = 150 + (index * 50);
            
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category)}
                role="button"
                data-pressed={isSelected}
                className={`p-2 sm:p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-md flex flex-col items-center justify-center aspect-square focus:outline-none focus:ring-2 focus:ring-opacity-50 group relative overflow-hidden
                  ${isSelected 
                    ? `${category.color || 'bg-pink-600'} ${category.textColor || 'text-white'} ring-2 ring-offset-1 ring-pink-400/80 ring-offset-sky-100 scale-105 shadow-lg` 
                    : `bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 focus:ring-slate-400`}
                `}
                style={{
                  transition: mounted ? `all 0.3s ease, opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` : 'all 0.3s ease',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                {/* Animated background on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${isSelected ? 'from-white to-white/0' : 'from-pink-300/50 via-purple-300/30 to-blue-300/40'}`}></div>
                
                {category.icon && <span className={`text-xl sm:text-2xl md:text-3xl category-emoji ${isSelected ? category.textColor || 'text-white' : 'text-slate-500'} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>{category.icon}</span>}
                <span className={`font-medium text-xs sm:text-xs text-center leading-tight mt-1 ${isSelected ? category.textColor || 'text-white' : 'text-slate-600'} transition-all duration-300`}>{category.name}</span>
                
                {/* Subtle pulse effect for selected categories */}
                {isSelected && (
                  <div className="absolute inset-0 bg-white opacity-0 animate-pulse-fast"></div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className={`space-y-3 px-2 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="relative group" onClick={onStartGame}>
            {/* Main button */}
            <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer ${
              !canPlay 
                ? 'bg-slate-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 group-hover:from-violet-500 group-hover:via-purple-500 group-hover:to-indigo-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-purple-500/25'
            }`}>
              {/* Glass morphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 backdrop-blur-sm"></div>
              
              {/* Animated background pattern */}
              {canPlay && (
                <>
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent group-hover:animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent group-hover:animate-pulse animation-delay-300"></div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent group-hover:animate-pulse animation-delay-150"></div>
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-green-400 to-transparent group-hover:animate-pulse animation-delay-450"></div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute top-3 left-6 w-2 h-2 bg-cyan-300 rounded-full opacity-60 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500 delay-100"></div>
                  <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-pink-300 rounded-full opacity-50 group-hover:opacity-90 group-hover:animate-ping transition-all duration-500 delay-200"></div>
                  <div className="absolute bottom-3 left-8 w-1 h-1 bg-yellow-300 rounded-full opacity-70 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 delay-150"></div>
                  <div className="absolute bottom-4 right-6 w-2 h-2 bg-green-300 rounded-full opacity-40 group-hover:opacity-80 group-hover:animate-bounce transition-all duration-500 delay-300"></div>
                </>
              )}
              
              {/* Sweep animation */}
              {canPlay && (
                <div className="absolute top-0 left-[-100%] h-full w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:left-full transition-all duration-700 ease-out transform rotate-12"></div>
              )}
              
              {/* Content container */}
              <div className="relative z-10 px-8 py-4 sm:py-5">
                <div className="flex items-center justify-center gap-3 group-hover:gap-4 transition-all duration-300">
                  {/* Play icon */}
                  <div className="relative">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
                      !canPlay 
                        ? 'text-slate-400' 
                        : 'text-white group-hover:scale-110 group-hover:rotate-90'
                    }`}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    {canPlay && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500 delay-200"></div>
                    )}
                  </div>
                  
                  {/* SparklesText */}
                  <div className="flex-1 text-center">
                    {canPlay ? (
                      <SparklesText 
                        className="text-lg sm:text-2xl font-bold tracking-wide text-white drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                        colors={{ first: '#06B6D4', second: '#8B5CF6' }}
                        sparklesCount={10}
                      >
                        JOGAR AGORA
                      </SparklesText>
                    ) : (
                      <span className="text-lg sm:text-2xl font-bold tracking-wide text-slate-400">
                        SELECIONE CATEGORIAS
                      </span>
                    )}
                  </div>
                  
                  {/* Arrow icon */}
                  <div className="relative">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 ${
                      !canPlay 
                        ? 'text-slate-400' 
                        : 'text-white group-hover:translate-x-1 group-hover:scale-110'
                    }`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                    {canPlay && (
                      <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                    )}
                  </div>
                </div>
                
                {/* Progress bar animation */}
                {canPlay && (
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                )}
              </div>
              
              {/* Inner border glow */}
              {canPlay && (
                <div className="absolute inset-0 rounded-2xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              )}
            </div>
            
            {/* Outer glow effect */}
            {canPlay && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-15 scale-105 group-hover:scale-110 blur-xl transition-all duration-700"></div>
            )}
            
            {/* Click feedback */}
            {canPlay && (
              <div className="absolute inset-0 rounded-2xl bg-white/10 scale-100 group-active:scale-95 transition-transform duration-150"></div>
            )}
          </div>
          
          {canPopulateDatabase && (
            <div className="relative group sm:hidden">
              {/* Mobile Generate Words Button - Fixed Sizing */}
              <div
                onClick={handleOpenPasswordModal}
                className="relative cursor-pointer overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 p-[3px] rounded-2xl shadow-2xl group-hover:shadow-cyan-500/30 transition-all duration-700 group-hover:scale-105 w-full max-w-[280px] h-[70px] mx-auto"
              >
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden w-full h-full flex items-center justify-center">
                  {/* Cyberpunk grid background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>
                    {/* Matrix-style elements */}
                    <div className="absolute top-2 left-3 w-1 h-3 bg-cyan-400 rounded-full opacity-60 group-hover:animate-pulse"></div>
                    <div className="absolute top-3 right-4 w-1 h-1 bg-blue-400 rounded-full group-hover:animate-ping"></div>
                    <div className="absolute bottom-2 left-5 w-1 h-2 bg-purple-400 rounded-full group-hover:animate-bounce"></div>
                    <div className="absolute bottom-3 right-2 w-1 h-1 bg-cyan-400 rounded-full group-hover:animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-white rounded-full group-hover:animate-ping"></div>
                    {/* Digital grid lines */}
                    <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent"></div>
                    <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400/15 to-transparent"></div>
                    <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/15 to-transparent"></div>
                  </div>
                  
                  {/* Digital sweep */}
                  <div className="absolute top-0 left-[-100%] h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent group-hover:left-full transition-all duration-1000 ease-out transform skew-x-12"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-center gap-3 px-4">
                    {/* Quantum processor icon */}
                    <div className="relative flex-shrink-0">
                      <div className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-180">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                          <rect x="6" y="6" width="12" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
                          <circle cx="12" cy="12" r="3" opacity="0.8"/>
                          <circle cx="8" cy="8" r="1" opacity="0.5"/>
                          <circle cx="16" cy="8" r="1" opacity="0.5"/>
                          <circle cx="8" cy="16" r="1" opacity="0.5"/>
                          <circle cx="16" cy="16" r="1" opacity="0.5"/>
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500 delay-200"></div>
                    </div>
                    
                    {/* MorphingText - Fixed container */}
                    <div className="flex-1 text-center relative min-w-0 max-w-[120px]">
                      <MorphingText 
                        className="text-sm font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors duration-500 h-5 w-full leading-none"
                        texts={[
                          "CYBER GEN",
                          "MATRIX AI",
                          "NEON CODE", 
                          "TECH FORGE",
                          "DIGIT LAB"
                        ]}
                      />
                    </div>
                    
                    {/* Data stream icon */}
                    <div className="relative flex-shrink-0">
                      <div className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-90">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" opacity="0.6"/>
                          <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
                          <circle cx="7" cy="11" r="1" opacity="0.7"/>
                          <circle cx="12" cy="11" r="1" opacity="0.7"/>
                          <circle cx="17" cy="11" r="1" opacity="0.7"/>
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500 delay-300"></div>
                    </div>
                  </div>
                  
                  {/* Digital border */}
                  <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Central processing core */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
                  
                  {/* Progress indicator */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 w-0 group-hover:w-full transition-all duration-1000 ease-out rounded-b-2xl"></div>
                </div>
              </div>
              
              {/* Outer energy field */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 scale-105 group-hover:scale-115 blur-xl transition-all duration-700"></div>
              
              {/* Floating data particles */}
              <div className="absolute -top-2 left-4 w-1 h-1 bg-cyan-300 rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-float-up transition-all duration-500 delay-100"></div>
              <div className="absolute -bottom-2 right-5 w-1 h-1 bg-purple-300 rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-float-up transition-all duration-500 delay-200"></div>
              <div className="absolute top-1 -right-2 w-0.5 h-0.5 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float-up transition-all duration-500 delay-150"></div>
              <div className="absolute bottom-1 -left-2 w-0.5 h-0.5 bg-cyan-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float-up transition-all duration-500 delay-250"></div>
            </div>
          )}
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
    </>
  );
};

export default CategorySelectionScreen;