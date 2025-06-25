import React, { useState, useEffect } from 'react';
import { Difficulty, TimeOption } from '../types';
import Button from './Button';
import DatabasePopulator from './DatabasePopulator';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseClient';
import LocalCacheService from '../services/LocalCacheService';

interface ConfigurationScreenProps {
  currentDuration: number;
  currentDifficulty: Difficulty;
  onSave: (newDuration: number, newDifficulty: Difficulty) => void;
  timeOptions: TimeOption[];
  difficulties: Difficulty[];
  apiKeyExists?: boolean;
  supabaseConfigured?: boolean;
}

interface DatabaseStats {
  totalWords: number;
  byCategory: { [key: string]: number };
  byDifficulty: { [key: string]: number };
  loading: boolean;
}

interface CacheInfo {
  isEnabled: boolean;
  totalCachedWords: number;
  cacheStats: { [key: string]: any };
  caching: boolean;
}

const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({
  currentDuration,
  currentDifficulty,
  onSave,
  timeOptions,
  difficulties,
  apiKeyExists = false,
  supabaseConfigured = false,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(currentDuration);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(currentDifficulty);
  const [mounted, setMounted] = useState(false);
  const [showDatabasePopulator, setShowDatabasePopulator] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [dbStats, setDbStats] = useState<DatabaseStats>({
    totalWords: 0,
    byCategory: {},
    byDifficulty: {},
    loading: true
  });
  
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({
    isEnabled: false,
    totalCachedWords: 0,
    cacheStats: {},
    caching: false
  });
  
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    loadDatabaseStats();
    initializeCache();
  }, []);

  const canPopulateDatabase = apiKeyExists && supabaseConfigured;

  const loadDatabaseStats = async () => {
    if (!isSupabaseConfigured()) {
      setDbStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      // Busca o total de palavras
      const { count: totalCount } = await supabase
        .from('palavras')
        .select('*', { count: 'exact', head: true });

      // Primeiro, tenta usar a função RPC otimizada
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('get_complete_word_stats');
      
      if (!rpcError && rpcResult) {
        console.log('📊 Usando RPC para estatísticas:', rpcResult);
        setDbStats({
          totalWords: rpcResult.total_words || 0,
          byCategory: rpcResult.by_category || {},
          byDifficulty: rpcResult.by_difficulty || {},
          loading: false
        });
        return;
      }
      
      console.log('⚠️  RPC não disponível, usando consulta manual');
      
      // Busca todos os dados necessários em uma única consulta
      const { data: allData, error: fetchError } = await supabase
        .from('palavras')
        .select('categoria, dificuldade')
        .limit(50000); // Aumenta o limite para garantir que busque todos os registros

      if (fetchError) {
        console.error('Erro ao buscar dados:', fetchError);
        setDbStats(prev => ({ ...prev, loading: false }));
        return;
      }

      // Processa os dados localmente
      const categoryCount: { [key: string]: number } = {};
      const difficultyCount: { [key: string]: number } = {};

      if (allData) {
        allData.forEach(row => {
          // Contagem por categoria
          categoryCount[row.categoria] = (categoryCount[row.categoria] || 0) + 1;
          
          // Contagem por dificuldade - garantindo que todas as dificuldades sejam contadas
          difficultyCount[row.dificuldade] = (difficultyCount[row.dificuldade] || 0) + 1;
        });
      }

      // Debug: log para verificar os dados
      console.log('📊 Estatísticas do banco:');
      console.log('- Total de palavras:', totalCount);
      console.log('- Por dificuldade:', difficultyCount);
      console.log('- Por categoria:', categoryCount);

      setDbStats({
        totalWords: totalCount || 0,
        byCategory: categoryCount,
        byDifficulty: difficultyCount,
        loading: false
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setDbStats(prev => ({ ...prev, loading: false }));
    }
  };

  const testDatabaseDirectly = async () => {
    if (!isSupabaseConfigured()) {
      setTestResults('Supabase não configurado');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      // Primeiro, tenta usar a função RPC otimizada
      const { data: rpcStats, error: rpcError } = await supabase
        .rpc('get_complete_word_stats');
      
      if (!rpcError && rpcStats) {
        setTestResults(`RPC Stats: ${JSON.stringify(rpcStats, null, 2)}`);
        return;
      }
      
      // Se RPC falhar, faz consulta manual direta
      const { data: manualCount } = await supabase
        .from('palavras')
        .select('dificuldade')
        .limit(50000); // Busca mais registros para garantir que pegue todos
        
      if (manualCount) {
        const counts = { facil: 0, medio: 0, dificil: 0, outros: 0 };
        const uniqueValues = new Set();
        
        manualCount.forEach(row => {
          uniqueValues.add(row.dificuldade);
          if (row.dificuldade === 'facil') counts.facil++;
          else if (row.dificuldade === 'medio') counts.medio++;
          else if (row.dificuldade === 'dificil') counts.dificil++;
          else counts.outros++;
        });
        
        setTestResults(
          `Teste Manual (${manualCount.length} registros): \n` +
          `Fácil: ${counts.facil}, Médio: ${counts.medio}, Difícil: ${counts.dificil}\n` +
          `Outros: ${counts.outros}\n` +
          `Valores únicos: ${Array.from(uniqueValues).join(', ')}`
        );
      }
      
    } catch (error) {
      setTestResults(`Erro: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  const initializeCache = async () => {
    try {
      const cacheService = LocalCacheService.getInstance();
      const isEnabled = await cacheService.initialize();
      
      const stats = cacheService.getCacheStats();
      const totalWords = cacheService.getTotalCachedWords();
      
      setCacheInfo({
        isEnabled,
        totalCachedWords: totalWords,
        cacheStats: stats,
        caching: false
      });
    } catch (error) {
      console.error('Erro ao inicializar cache:', error);
    }
  };

  const cacheWordsLocally = async () => {
    if (!isSupabaseConfigured()) {
      alert('Supabase não está configurado!');
      return;
    }

    setCacheInfo(prev => ({ ...prev, caching: true }));

    try {
      const cacheService = LocalCacheService.getInstance();
      
      const categories = [
        'pessoas-famosas', 'lugares', 'animais', 'objetos', 
        'filmes-series', 'musica', 'comidas-bebidas', 
        'esportes', 'profissoes', 'natureza'
      ];
      
      const difficulties = ['facil', 'medio', 'dificil'];
      
      await cacheService.preloadWords(categories, difficulties);
      
      const stats = cacheService.getCacheStats();
      const totalWords = cacheService.getTotalCachedWords();
      
      setCacheInfo(prev => ({
        ...prev,
        totalCachedWords: totalWords,
        cacheStats: stats,
        caching: false
      }));
      
      alert(`✅ Cache atualizado! ${totalWords} palavras foram armazenadas localmente.`);
      
    } catch (error) {
      console.error('Erro ao fazer cache das palavras:', error);
      setCacheInfo(prev => ({ ...prev, caching: false }));
      alert('❌ Erro ao fazer cache das palavras. Tente novamente.');
    }
  };

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
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
    if (passwordInput === adminPassword) {
      setShowPasswordModal(false);
      setShowDatabasePopulator(true);
      setPasswordError(null);
    } else {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
    setPasswordInput('');
  };

  const handleSave = () => {
    onSave(selectedDuration, selectedDifficulty);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('pt-BR');
  };

  return (
    <div className="config-screen-layout">
      
      {/* Main container - Layout otimizado para configurações */}
      <div className={`config-screen-layout w-full max-w-sm mx-auto transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header Fixo - Sempre visível no topo */}
        <div className="config-header-fixed bg-white/10 border-b border-white/20 px-4 py-4">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900 mb-1 drop-shadow-md">Configurações</h1>
            <p className="text-xs text-gray-700 drop-shadow-sm">Personalize sua experiência</p>
          </div>
          
          {/* Action Buttons - Compacto */}
          <div className="flex gap-2 mt-3">
            <button
            onClick={() => setShowStatsModal(true)}
            className="flex-1 bg-blue-200/40 hover:bg-blue-200/60 border border-blue-300/50 rounded-lg p-2 transition-all duration-200"
            type="button"
            >
            <div className="text-center">
            <div className="text-sm mb-1">📊</div>
            <div className="text-[10px] font-medium text-blue-900 drop-shadow-sm">
            {dbStats.loading ? 'Carregando' : formatNumber(dbStats.totalWords)}
            </div>
            </div>
            </button>
              
              <button
                onClick={testDatabaseDirectly}
                className="flex-1 bg-yellow-200/40 hover:bg-yellow-200/60 border border-yellow-300/50 rounded-lg p-2 transition-all duration-200"
                type="button"
                title="Teste direto do banco"
              >
                <div className="text-center">
                  <div className="text-sm mb-1">🔍</div>
                  <div className="text-[10px] font-medium text-yellow-900 drop-shadow-sm">
                    Teste
                  </div>
                </div>
              </button>

            <button
              onClick={cacheWordsLocally}
              disabled={cacheInfo.caching || !isSupabaseConfigured()}
              className={`flex-1 rounded-lg p-2 border transition-all duration-200 ${
                cacheInfo.caching 
                  ? 'bg-gray-200/40 border-gray-300/50 cursor-not-allowed' 
                  : 'bg-green-200/40 hover:bg-green-200/60 border-green-300/50'
              } ${!isSupabaseConfigured() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <div className="text-sm mb-1">
                  {cacheInfo.caching ? '⏳' : '💾'}
                </div>
                <div className="text-[10px] font-medium text-green-900 drop-shadow-sm">
                  {cacheInfo.totalCachedWords > 0 ? formatNumber(cacheInfo.totalCachedWords) : 'Cache'}
                </div>
              </div>
            </button>

            {canPopulateDatabase && (
              <button
                onClick={handleOpenPasswordModal}
                className="flex-1 bg-purple-200/40 hover:bg-purple-200/60 border border-purple-300/50 rounded-lg p-2 transition-all duration-200"
                type="button"
              >
                <div className="text-center">
                  <div className="text-sm mb-1">🤖</div>
                  <div className="text-[10px] font-medium text-purple-900 drop-shadow-sm">Gerar</div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Content - Área rolável entre header e footer */}
        <div className="config-content-scrollable px-4 py-3 space-y-6">
          
          {/* Time Duration Section */}
          <section>
            <div className="mb-3">
              <h2 className="text-base font-medium text-gray-900 mb-1 drop-shadow-md">Duração do Jogo</h2>
              <p className="text-xs text-gray-700 drop-shadow-sm">Escolha quanto tempo você quer jogar</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {timeOptions.map((option) => {
                const isSelected = selectedDuration === option.value;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-400/60 bg-blue-300/50' 
                        : 'border-gray-400/30 bg-gray-200/20 hover:border-gray-400/50 hover:bg-gray-200/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">
                        {option.value <= 60 ? '⚡' : option.value <= 90 ? '⏰' : '🕐'}
                      </div>
                      <div className={`text-xs font-medium mb-1 drop-shadow-sm ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {option.name}
                      </div>
                      <div className={`text-[10px] drop-shadow-sm ${
                        isSelected ? 'text-blue-800' : 'text-gray-700'
                      }`}>
                        {option.value}s
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        <span className="text-[10px]">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Difficulty Section */}
          <section>
            <div className="mb-3">
              <h2 className="text-base font-medium text-gray-900 mb-1 drop-shadow-md">Nível de Dificuldade</h2>
              <p className="text-xs text-gray-700 drop-shadow-sm">Selecione o desafio ideal para você</p>
            </div>
            
            <div className="space-y-2">
              {difficulties.map((level) => {
                const isSelected = selectedDifficulty.id === level.id;
                const difficultyIcons: { [key: string]: string } = { 
                  facil: '🌱', 
                  medio: '🔥', 
                  dificil: '💎' 
                };
                
                const difficultyColors: { [key: string]: string } = { 
                  facil: isSelected ? 'border-green-400/60 bg-green-300/50' : 'border-gray-400/30 bg-gray-200/20 hover:border-gray-400/50',
                  medio: isSelected ? 'border-orange-400/60 bg-orange-300/50' : 'border-gray-400/30 bg-gray-200/20 hover:border-gray-400/50',
                  dificil: isSelected ? 'border-purple-400/60 bg-purple-300/50' : 'border-gray-400/30 bg-gray-200/20 hover:border-gray-400/50'
                };
                
                return (
                  <button
                    key={level.id}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`relative w-full p-3 rounded-lg border-2 transition-all duration-200 hover:bg-gray-200/30 ${difficultyColors[level.id] || 'border-gray-400/30 bg-gray-200/20'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl">
                        {difficultyIcons[level.id] || '⭐'}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900 drop-shadow-sm">
                          {level.name}
                        </div>
                        <div className={`text-xs drop-shadow-sm ${
                          isSelected ? 'text-gray-800' : 'text-gray-700'
                        }`}>
                          Nível {level.name.toLowerCase()}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center">
                          <span className="text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer Fixo - Botão sempre visível na parte inferior */}
        <div className="config-footer-fixed bg-white/10 border-t border-white/20 p-4">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600/70 hover:bg-blue-700/70 text-white font-medium py-3 rounded-lg transition-all duration-200 border border-blue-500/30 drop-shadow-md"
          >
            Salvar e Voltar
          </button>
        </div>
      </div>

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 rounded-lg w-full max-w-sm max-h-[85vh] border border-gray-400/30 flex flex-col">
            <div className="sticky top-0 bg-white/80 p-4 border-b border-gray-400/30 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 drop-shadow-md">Estatísticas</h2>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="config-content-scrollable p-4">
              {dbStats.loading ? (
                <div className="text-center py-6">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-gray-800 drop-shadow-md text-sm">Carregando...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="backdrop-blur-md bg-gray-200/20 p-3 rounded-lg border border-gray-400/20">
                    <h3 className="text-xs font-medium text-gray-900 mb-2 drop-shadow-sm">Total Geral</h3>
                    <p className="text-lg font-semibold text-gray-900 drop-shadow-sm">{formatNumber(dbStats.totalWords)} palavras</p>
                    <div className="text-[10px] text-gray-600 mt-1 drop-shadow-sm">
                      Soma: {formatNumber((dbStats.byDifficulty.facil || 0) + (dbStats.byDifficulty.medio || 0) + (dbStats.byDifficulty.dificil || 0))}
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-md bg-gray-200/20 p-3 rounded-lg border border-gray-400/20">
                    <h3 className="text-xs font-medium text-gray-900 mb-2 drop-shadow-sm">Por Dificuldade</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 flex items-center gap-1 drop-shadow-sm text-xs">
                          <span>🌱</span> Fácil
                        </span>
                        <span className="font-medium text-gray-900 drop-shadow-sm text-xs">{formatNumber(dbStats.byDifficulty.facil || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 flex items-center gap-1 drop-shadow-sm text-xs">
                          <span>🔥</span> Médio
                        </span>
                        <span className="font-medium text-gray-900 drop-shadow-sm text-xs">{formatNumber(dbStats.byDifficulty.medio || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 flex items-center gap-1 drop-shadow-sm text-xs">
                          <span>💎</span> Difícil
                        </span>
                        <span className="font-medium text-gray-900 drop-shadow-sm text-xs">{formatNumber(dbStats.byDifficulty.dificil || 0)}</span>
                      </div>
                      {/* Debug info - remove depois de testar */}
                      {Object.keys(dbStats.byDifficulty).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-400/20">
                          <div className="text-[10px] text-gray-600 drop-shadow-sm">
                            Debug: {JSON.stringify(dbStats.byDifficulty)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {testResults && (
                    <div className="backdrop-blur-md bg-yellow-200/20 p-3 rounded-lg border border-yellow-400/20">
                      <h3 className="text-xs font-medium text-gray-900 mb-2 drop-shadow-sm">Teste Direto</h3>
                      <div className="text-[10px] text-gray-800 drop-shadow-sm">
                        {testResults}
                      </div>
                    </div>
                  )}
                  
                  <div className="backdrop-blur-md bg-gray-200/20 p-3 rounded-lg border border-gray-400/20">
                    <h3 className="text-xs font-medium text-gray-900 mb-2 drop-shadow-sm">Cache Local</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 drop-shadow-sm text-xs">Status</span>
                        <span className={`font-medium drop-shadow-sm text-xs ${cacheInfo.isEnabled ? 'text-green-800' : 'text-red-800'}`}>
                          {cacheInfo.isEnabled ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 drop-shadow-sm text-xs">Palavras em cache</span>
                        <span className="font-medium text-gray-900 drop-shadow-sm text-xs">{formatNumber(cacheInfo.totalCachedWords)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
            <div className="p-4 border-t border-gray-400/20">
              <button 
                onClick={() => setShowStatsModal(false)} 
                className="w-full bg-blue-600/60 hover:bg-blue-700/60 backdrop-blur-sm text-white font-medium py-2 rounded-lg transition-all duration-200 border border-blue-500/20 drop-shadow-md text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDatabasePopulator && (
        <DatabasePopulator onClose={() => setShowDatabasePopulator(false)} />
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-black/20 p-5 rounded-lg w-full max-w-sm border border-gray-400/20">
            <h2 className="text-lg font-medium text-gray-900 mb-3 drop-shadow-md">Acesso Restrito</h2>
            <p className="text-sm text-gray-800 mb-4 drop-shadow-sm">Digite a senha para gerar palavras com IA:</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="w-full p-3 backdrop-blur-md bg-gray-200/30 border border-gray-400/30 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 outline-none transition-all duration-200 text-gray-900 placeholder-gray-700"
              placeholder="Senha de administrador"
            />
            {passwordError && (
              <p className="text-red-800 text-sm mt-3 drop-shadow-sm">{passwordError}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button 
                onClick={handlePasswordModalClose} 
                className="flex-1 px-4 py-2 text-gray-800 backdrop-blur-md bg-gray-200/20 hover:bg-gray-200/30 border border-gray-400/20 rounded-lg transition-all duration-200 drop-shadow-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handlePasswordSubmit} 
                className="flex-1 px-4 py-2 bg-blue-600/60 hover:bg-blue-700/60 backdrop-blur-sm text-white rounded-lg transition-all duration-200 border border-blue-500/20 drop-shadow-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationScreen;
