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
    const timer = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(timer);
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
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      
      {/* Background subtle patterns - matching neumorphic pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-gray-300 rounded-full animate-pulse delay-500"></div>
      </div>

      <div 
        className={`
          w-full max-w-lg mx-auto rounded-3xl
          transition-all duration-500 ease-out relative z-10
          ${mounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'}
        `}
        style={{
          background: 'linear-gradient(145deg, #f0f0f3, #e6e6e9)',
          boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7)',
        }}
      >
        
        {/* Header Section */}
        <header 
          className={`
            p-5 sm:p-7 text-center transition-all duration-700 delay-200 ease-out
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-5">
            <h1 className="neumorphic-title text-2xl sm:text-3xl tracking-tight flex-1">
              Adivinhe Já!
            </h1>
            
            <div className="flex gap-3">
              {/* Statistics Button */}
              <button
                onClick={onNavigateToStatistics}
                className="p-3 rounded-xl border-none cursor-pointer group focus:outline-none transition-all duration-200"
                onMouseEnter={() => setHoveredButton('stats')}
                onMouseLeave={() => setHoveredButton(null)}
                title="Estatísticas e Histórico"
                style={{
                  background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(1px)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
              >
                <div className="text-blue-600 text-xl transition-transform duration-200 group-hover:scale-110">
                  {ChartBarIcon}
                </div>
              </button>

              {/* Configuration Button */}
              <button
                onClick={onNavigateToConfiguration}
                className="p-3 rounded-xl border-none cursor-pointer group focus:outline-none transition-all duration-200"
                onMouseEnter={() => setHoveredButton('config')}
                onMouseLeave={() => setHoveredButton(null)}
                title="Configurações"
                style={{
                  background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(1px)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
              >
                <div className="text-orange-600 text-xl transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110">
                  {CogIcon}
                </div>
              </button>
            </div>
          </div>
          
          {/* Decorative element */}
          <div 
            className="h-1 w-20 mx-auto mb-4 sm:mb-5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
            style={{
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.8)'
            }}
          ></div>
          
          <p className="neumorphic-subtitle text-sm">
            Escolha uma ou mais categorias para começar
          </p>
        </header>

        {/* Configuration Status Warning */}
        {(!apiKeyExists || !supabaseConfigured) && (
          <div 
            className={`
              mx-5 sm:mx-7 mb-3 sm:mb-4 p-2.5 sm:p-3.5 rounded-xl transition-all duration-700 delay-400 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
            style={{
              background: 'linear-gradient(145deg, #f4e4bc, #f0daa3)',
              boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.9)'
            }}
          >
            <div className="text-center">
              <h3 className="neumorphic-subtitle text-sm font-medium mb-2 text-orange-700">
                ⚠️ Configuração Incompleta
              </h3>
              <div className="text-xs text-orange-600 space-y-1">
                {!apiKeyExists && <p>• API OpenAI não configurada</p>}
                {!supabaseConfigured && <p>• Supabase não configurado</p>}
                {(apiKeyExists && !supabaseConfigured) && <p>• Usando apenas API OpenAI</p>}
                {(!apiKeyExists && supabaseConfigured) && <p>• Usando apenas Supabase</p>}
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {generalError && (
          <div 
            className={`
              mx-5 sm:mx-7 mb-3 sm:mb-4 p-2.5 sm:p-3.5 rounded-xl transition-all duration-700 delay-500 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
            style={{
              background: 'linear-gradient(145deg, #fecaca, #fed7d7)',
              boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.9)'
            }}
          >
            <p className="text-red-700 text-sm text-center">{generalError}</p>
          </div>
        )}

        {/* Content Area */}
        <div className="px-5 sm:px-7 pb-5 sm:pb-6">
          
          {/* Categories Grid */}
          <section 
            className={`
              mb-4 sm:mb-6 transition-all duration-700 delay-600 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 sm:gap-5 md:gap-6 auto-rows-fr">
              {categories.map((category: Category, index: number) => {
                const isSelected = !!selectedCategories.find((c: Category) => c.id === category.id);
                const delay = 600 + (index * 100);
                
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category)}
                    className={`
                      relative p-2 sm:p-2.5 md:p-3.5 rounded-lg sm:rounded-xl border-none cursor-pointer group focus:outline-none 
                      transition-all duration-200 flex flex-col items-center justify-center aspect-square w-full h-full
                      ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}
                    style={{
                      background: isSelected 
                        ? 'linear-gradient(145deg, #e8e8eb, #f0f0f3)'
                        : 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                      boxShadow: isSelected
                        ? 'inset 3px 3px 6px rgba(0, 0, 0, 0.15), inset -3px -3px 6px rgba(255, 255, 255, 0.8)'
                        : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
                      transitionDelay: mounted ? `${delay}ms` : '0ms'
                    }}
                    onMouseDown={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.15), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.transform = 'translateY(1px)';
                      }
                    }}
                    onMouseUp={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {/* Category Icon */}
                    {category.icon && (
                      <span className="text-base sm:text-xl md:text-2xl category-emoji mb-1 sm:mb-1.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        {category.icon}
                      </span>
                    )}
                    
                    {/* Category Name */}
                    <span className="neumorphic-subtitle text-[9px] sm:text-[11px] md:text-xs text-center leading-tight font-medium">
                      {category.name}
                    </span>

                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Play Button */}
        <div 
          className={`
            p-5 sm:p-7 transition-all duration-700 delay-1000 ease-out
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <button
            onClick={onStartGame}
            disabled={!canPlay}
            className={`
              w-full rounded-xl border-none cursor-pointer focus:outline-none 
              transition-all duration-200 font-medium
              ${!canPlay ? 'opacity-60 cursor-not-allowed' : ''}
            `}
            style={{
              background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
              boxShadow: canPlay 
                ? '6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.7)'
                : 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)',
              color: '#333333'
            }}
            onMouseEnter={(e) => {
              if (canPlay) {
                e.currentTarget.style.boxShadow = '8px 8px 16px rgba(0, 0, 0, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (canPlay) {
                e.currentTarget.style.boxShadow = '6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            onMouseDown={(e) => {
              if (canPlay) {
                e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0, 0, 0, 0.2), inset -3px -3px 6px rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            onMouseUp={(e) => {
              if (canPlay) {
                e.currentTarget.style.boxShadow = '8px 8px 16px rgba(0, 0, 0, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
          >
            {/* Inner accent button */}
            <div 
              className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg flex items-center justify-center gap-2 sm:gap-3"
              style={{
                background: canPlay 
                  ? 'linear-gradient(145deg, #4285f4, #3367d6)'
                  : 'linear-gradient(145deg, #d1d5db, #9ca3af)',
                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Play Icon */}
              <div className="relative">
                <div className={`w-6 h-6 transition-all duration-300 ${
                  !canPlay 
                    ? 'text-gray-400' 
                    : 'text-white group-hover:scale-110'
                }`}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              
              {/* Button Text */}
              <span className={`text-sm sm:text-lg font-bold tracking-wide ${
                canPlay ? 'text-white' : 'text-gray-400'
              }`}>
                {canPlay ? 'JOGAR AGORA' : 'SELECIONE CATEGORIAS'}
              </span>
              
              {/* Arrow Icon */}
              <div className="relative">
                <div className={`w-5 h-5 transition-all duration-300 ${
                  !canPlay 
                    ? 'text-gray-400' 
                    : 'text-white group-hover:translate-x-1'
                }`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectionScreen;
