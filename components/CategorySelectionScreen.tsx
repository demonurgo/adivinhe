import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import Button from './Button';
import { CogIcon, ChartBarIcon } from '../constants';
import { HyperText } from './magicui/hyper-text';

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

  const generalError = error && !error.toLowerCase().includes("vite_openai_api_key") && !error.toLowerCase().includes("vite_supabase_anon_key") ? error : null;
  const configError = error && (error.toLowerCase().includes("vite_openai_api_key") || error.toLowerCase().includes("vite_supabase_anon_key")) ? error : null;

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Enhanced animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background particles removed for better performance */}
      </div>
      
      {/* Main content container */}
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className={`w-full max-w-3xl mx-auto p-5 sm:p-6 md:p-8 bg-gradient-to-br from-sky-100/90 via-sky-50/80 to-indigo-100/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-sky-300/50 transition-all duration-500 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <HyperText 
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent py-0 tracking-wide drop-shadow-lg"
            duration={1000}
            delay={500}
            startOnView={true}
            animateOnHover={true}
            as="h1"
            style={{ fontFamily: 'Comfortaa, sans-serif' }}
          >
            Adivinhe Já!
          </HyperText>
          <div className="flex gap-4 sm:gap-5">
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
        
        <p className="text-xs mb-3 text-slate-700">Escolha uma ou mais categorias:</p>
        
        {(!apiKeyExists || !supabaseConfigured) && (
           <div className="mb-3 p-2 sm:p-3 bg-yellow-800/80 border border-yellow-600 text-yellow-100 text-xs rounded-lg shadow-md">
              <strong>Atenção:</strong>
              {!apiKeyExists && <p className="line-clamp-2">- API OpenAI não configurada</p>}
              {!supabaseConfigured && <p className="line-clamp-2">- Supabase não configurado</p>}
              {(apiKeyExists && !supabaseConfigured) && <p className="line-clamp-2">Usando apenas API OpenAI</p>}
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
                
                {category.icon && <span className={`text-lg sm:text-xl md:text-2xl category-emoji ${isSelected ? category.textColor || 'text-white' : 'text-slate-500'} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>{category.icon}</span>}
                <span className={`font-medium text-xs text-center leading-tight mt-1 ${isSelected ? category.textColor || 'text-white' : 'text-slate-600'} transition-all duration-300`}>{category.name}</span>
                
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
                  
                  {/* Play Button Text */}
                  <div className="flex-1 text-center">
                    {canPlay ? (
                      <span className="text-base sm:text-xl font-bold tracking-wide text-white drop-shadow-lg group-hover:scale-105 transition-transform duration-500">
                        JOGAR AGORA
                      </span>
                    ) : (
                      <span className="text-base sm:text-xl font-bold tracking-wide text-slate-400">
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
          
        </div>
        </div>
      </div>

    </div>
  );
};

export default CategorySelectionScreen;
