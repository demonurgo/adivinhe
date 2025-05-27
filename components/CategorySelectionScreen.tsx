import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import Button from './Button';
import { CogIcon, ChartBarIcon } from '../constants';
import DatabasePopulator from './DatabasePopulator';

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
      <div className={`w-full max-w-3xl mx-auto p-6 sm:p-8 md:p-10 bg-gradient-to-br from-sky-100/90 via-sky-50/80 to-indigo-100/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-sky-300/50 transition-all duration-500 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
            Adivinhe Já!
          </h1>
          <div className="flex gap-3">
            {canPopulateDatabase && (
              <div className="relative group hidden sm:block">
                <Button 
                  onClick={handleOpenPasswordModal} 
                  variant="secondary" 
                  size="sm"
                  className="text-xs relative overflow-hidden transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white hover:shadow-md"
                  title="Gerar palavras para o banco de dados"
                >
                  <span className="relative z-10 flex items-center gap-1">
                    <span className="transform group-hover:rotate-180 transition-transform duration-700">🔄</span>
                    Gerar Palavras
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-600/50 to-emerald-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
                </Button>
                
                {/* Animated particles */}
                <div className="absolute -right-1 -top-1 w-2 h-2 bg-teal-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-100 transform scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
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
        
        <p className="text-sm sm:text-base mb-6 text-slate-700">Escolha uma ou mais categorias:</p>
        
        {(!apiKeyExists || !supabaseConfigured) && (
           <div className="mb-6 p-4 bg-yellow-800/80 border border-yellow-600 text-yellow-100 text-sm rounded-lg shadow-md">
              <strong>Atenção:</strong>
              {!apiKeyExists && <p>- A chave da API do Gemini não foi configurada (<code>VITE_GEMINI_API_KEY</code>). A geração de novas palavras pode não funcionar.</p>}
              {!supabaseConfigured && <p>- A configuração do Supabase não foi encontrada ou está incorreta. O armazenamento e busca de palavras no banco de dados não funcionarão.</p>}
              {(apiKeyExists && !supabaseConfigured) && <p>O jogo usará apenas a API Gemini para palavras (Supabase não configurado corretamente).</p>}
              {(!apiKeyExists && supabaseConfigured) && <p>O jogo usará apenas o banco de dados Supabase para palavras (API Gemini não configurada). Novas palavras não serão geradas dinamicamente.</p>}
              {(!apiKeyExists && !supabaseConfigured) && <p>O jogo não poderá buscar palavras (API Gemini e Supabase não configurados corretamente).</p>}
          </div>
        )}

        {generalError && (
          <p className="text-red-300 bg-red-900/70 p-4 rounded-lg mb-6 text-sm shadow-md">{generalError}</p>
        )}
         {configError && (!apiKeyExists || !supabaseConfigured) && ( 
           <p className="text-yellow-300 bg-yellow-900/70 p-4 rounded-lg mb-6 text-sm shadow-md">{configError}</p>
         )}

        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {categories.map((category: Category, index: number) => {
            const isSelected = !!selectedCategories.find((c: Category) => c.id === category.id);
            const delay = 150 + (index * 50);
            
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category)}
                aria-pressed={isSelected ? "true" : "false"}
                className={`p-3 sm:p-4 rounded-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg flex flex-col items-center justify-center aspect-square focus:outline-none focus:ring-4 focus:ring-opacity-50 group relative overflow-hidden
                  ${isSelected 
                    ? `${category.color || 'bg-pink-600'} ${category.textColor || 'text-white'} ring-4 ring-offset-2 ring-pink-400/80 ring-offset-sky-100 scale-105 shadow-xl` 
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
                
                {category.icon && <span className={`mb-1 sm:mb-2 text-3xl sm:text-4xl category-emoji ${isSelected ? category.textColor || 'text-white' : 'text-slate-500'} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>{category.icon}</span>}
                <span className={`font-medium text-xs sm:text-sm text-center ${isSelected ? category.textColor || 'text-white' : 'text-slate-600'} transition-all duration-300`}>{category.name}</span>
                
                {/* Subtle pulse effect for selected categories */}
                {isSelected && (
                  <div className="absolute inset-0 bg-white opacity-0 animate-pulse-fast"></div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className={`space-y-4 px-2 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="relative group">
            <Button
              onClick={onStartGame}
              disabled={!canPlay}
              variant="primary"
              size="xl"
              fullWidth
              className="disabled:bg-slate-700 disabled:hover:bg-slate-700 disabled:text-slate-500 relative overflow-hidden group transition-all duration-500 transform hover:scale-102 hover:shadow-glow hover:rotate-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"
            >
              <span className="relative z-10 flex items-center justify-center gap-3 group-hover:gap-4 transition-all duration-300 text-lg sm:text-xl font-bold">
                <span className="transform group-hover:scale-105 transition-transform duration-300">Jogar Agora!</span>
                <span className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-700/80 via-pink-700/80 to-orange-700/80 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-md"></span>
              
              {/* Animated particles */}
              {canPlay && (
                <>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-pink-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-100 scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
                  <div className="absolute right-8 top-1/3 transform -translate-y-1/2 w-2 h-2 bg-purple-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-200 scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
                </>
              )}
            </Button>
          </div>
          
          {canPopulateDatabase && (
            <div className="relative group sm:hidden">
              <Button
                onClick={handleOpenPasswordModal}
                variant="secondary"
                size="lg"
                fullWidth
                className="relative overflow-hidden transition-all duration-300 transform hover:scale-102 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="transform rotate-0 group-hover:rotate-180 transition-transform duration-700">🔄</span>
                  <span>Gerar Mais Palavras para o Banco</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600/50 to-emerald-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              </Button>
              
              {/* Animated particles */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-teal-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-100 scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-200 scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
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