import React, { useState } from 'react';
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

  const toggleCategory = (category: Category) => {
    const isSelected = selectedCategories.find(c => c.id === category.id);
    if (isSelected) {
      onSelectCategory(selectedCategories.filter(c => c.id !== category.id));
    } else {
      onSelectCategory([...selectedCategories, category]);
    }
  };

  const canPlay = (apiKeyExists || supabaseConfigured) && selectedCategories.length > 0;
  const canPopulateDatabase = apiKeyExists && supabaseConfigured;

  const generalError = error && !error.toLowerCase().includes("vite_gemini_api_key") && !error.toLowerCase().includes("vite_supabase_anon_key") ? error : null;
  const configError = error && (error.toLowerCase().includes("vite_gemini_api_key") || error.toLowerCase().includes("vite_supabase_anon_key")) ? error : null;

  return (
    <>
      <div className="w-full max-w-3xl mx-auto p-5 sm:p-8 bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/50 allow-scroll">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
            Adivinhe Já!
          </h1>
          <div className="flex gap-2">
            {canPopulateDatabase && (
              <Button 
                onClick={() => setShowDatabasePopulator(true)} 
                variant="secondary" 
                size="sm"
                className="text-xs hidden sm:inline-flex"
                title="Gerar palavras para o banco de dados"
              >
                Gerar Palavras
              </Button>
            )}
            <Button 
              onClick={onNavigateToStatistics} 
              variant="ghost" 
              size="md"
              className="p-2 rounded-full"
              aria-label="Histórico e Estatísticas"
              title="Ver histórico de partidas"
            >
              {ChartBarIcon}
            </Button>
            <Button 
              onClick={onNavigateToConfiguration} 
              variant="ghost" 
              size="md"
              className="p-2 rounded-full"
              aria-label="Configurações"
            >
              {CogIcon}
            </Button>
          </div>
        </div>
        
        <p className="text-sm sm:text-base mb-6 text-slate-300">Escolha uma ou mais categorias:</p>
        
        {(!apiKeyExists || !supabaseConfigured) && (
           <div className="mb-6 p-3 bg-yellow-800/80 border border-yellow-600 text-yellow-100 text-sm rounded-lg shadow-md">
              <strong>Atenção:</strong>
              {!apiKeyExists && <p>- A chave da API do Gemini não foi configurada (<code>VITE_GEMINI_API_KEY</code>). A geração de novas palavras pode não funcionar.</p>}
              {!supabaseConfigured && <p>- A configuração do Supabase não foi encontrada ou está incorreta. O armazenamento e busca de palavras no banco de dados não funcionarão.</p>}
              {(apiKeyExists && !supabaseConfigured) && <p>O jogo usará apenas a API Gemini para palavras (Supabase não configurado corretamente).</p>}
              {(!apiKeyExists && supabaseConfigured) && <p>O jogo usará apenas o banco de dados Supabase para palavras (API Gemini não configurada). Novas palavras não serão geradas dinamicamente.</p>}
              {(!apiKeyExists && !supabaseConfigured) && <p>O jogo não poderá buscar palavras (API Gemini e Supabase não configurados corretamente).</p>}
          </div>
        )}

        {generalError && (
          <p className="text-red-300 bg-red-900/70 p-3 rounded-lg mb-6 text-sm shadow-md">{generalError}</p>
        )}
         {configError && (!apiKeyExists || !supabaseConfigured) && ( 
           <p className="text-yellow-300 bg-yellow-900/70 p-3 rounded-lg mb-6 text-sm shadow-md">{configError}</p>
         )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {categories.map(category => {
            const isSelected = !!selectedCategories.find(c => c.id === category.id);
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category)}
                aria-pressed={isSelected}
                className={`p-3 sm:p-4 rounded-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg flex flex-col items-center justify-center aspect-square focus:outline-none focus:ring-4 focus:ring-opacity-50
                  ${isSelected 
                    ? `${category.color || 'bg-pink-600'} ${category.textColor || 'text-white'} ring-4 ring-offset-2 ring-pink-400/80 ring-offset-slate-900 scale-105 shadow-xl` 
                    : `bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 focus:ring-slate-600`}
                `}
              >
                {category.icon && <span className={`mb-1 sm:mb-2 text-3xl sm:text-4xl category-emoji ${isSelected ? category.textColor || 'text-white' : 'text-slate-400'}`}>{category.icon}</span>}
                <span className={`font-medium text-xs sm:text-sm text-center ${isSelected ? category.textColor || 'text-white' : 'text-slate-200'}`}>{category.name}</span>
              </button>
            );
          })}
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={onStartGame}
            disabled={!canPlay}
            variant="primary"
            size="xl"
            fullWidth
            className="disabled:bg-slate-700 disabled:hover:bg-slate-700 disabled:text-slate-500"
          >
            Jogar Agora!
          </Button>
          
          {canPopulateDatabase && (
            <Button
              onClick={() => setShowDatabasePopulator(true)}
              variant="secondary"
              size="lg"
              fullWidth
              className="sm:hidden" // Show only on mobile when hidden above
            >
              🔄 Gerar Mais Palavras para o Banco
            </Button>
          )}
        </div>
      </div>

      {showDatabasePopulator && (
        <DatabasePopulator onClose={() => setShowDatabasePopulator(false)} />
      )}
    </>
  );
};

export default CategorySelectionScreen;