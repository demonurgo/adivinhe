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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
      <div className="w-full max-w-3xl mx-auto p-5 sm:p-8 bg-sky-100/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-sky-300/50">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
            Adivinhe Já!
          </h1>
          <div className="flex gap-2">
            {canPopulateDatabase && (
              <Button 
                onClick={handleOpenPasswordModal} 
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
        
        <p className="text-sm sm:text-base mb-6 text-slate-700">Escolha uma ou mais categorias:</p>
        
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {categories.map((category: Category) => {
            const isSelected = !!selectedCategories.find((c: Category) => c.id === category.id);
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category)}
                aria-pressed={isSelected}
                className={`p-3 sm:p-4 rounded-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg flex flex-col items-center justify-center aspect-square focus:outline-none focus:ring-4 focus:ring-opacity-50
                  ${isSelected 
                    ? `${category.color || 'bg-pink-600'} ${category.textColor || 'text-white'} ring-4 ring-offset-2 ring-pink-400/80 ring-offset-sky-100 scale-105 shadow-xl` 
                    : `bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 focus:ring-slate-400`}
                `}
              >
                {category.icon && <span className={`mb-1 sm:mb-2 text-3xl sm:text-4xl category-emoji ${isSelected ? category.textColor || 'text-white' : 'text-slate-500'}`}>{category.icon}</span>}
                <span className={`font-medium text-xs sm:text-sm text-center ${isSelected ? category.textColor || 'text-white' : 'text-slate-600'}`}>{category.name}</span>
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
              onClick={handleOpenPasswordModal}
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

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 w-full max-w-sm">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Acesso Restrito</h2>
            <p className="text-sm text-slate-300 mb-1">Por favor, insira a senha para gerar palavras:</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="w-full p-2.5 rounded-md bg-slate-700 border border-slate-600 text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
              placeholder="Senha"
            />
            {passwordError && (
              <p className="text-red-400 text-xs mt-2">{passwordError}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={handlePasswordModalClose} variant="ghost" className="text-slate-300 hover:bg-slate-700">
                Cancelar
              </Button>
              <Button onClick={handlePasswordSubmit} variant="primary">
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategorySelectionScreen;