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
    <div className="config-screen-container min-h-screen w-full flex items-center justify-center p-6 relative">
      
      {/* Background subtle patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-gray-300 rounded-full animate-pulse delay-500"></div>
      </div>

      <div 
        className={`
          w-full max-w-md mx-auto rounded-3xl
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
            p-8 text-center transition-all duration-700 delay-200 ease-out
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <h1 className="neumorphic-title text-4xl mb-4 tracking-tight">
            Configurações
          </h1>
          
          {/* Decorative element */}
          <div 
            className="h-1 w-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
            style={{
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.8)'
            }}
          ></div>
          
          <p className="neumorphic-subtitle text-sm">
            Personalize sua experiência de jogo
          </p>
        </header>

        {/* Quick Stats Row */}
        <div 
          className={`
            px-8 mb-6 transition-all duration-700 delay-400 ease-out
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <div className="grid grid-cols-4 gap-2">
            
            {/* Database Stats Button */}
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-3 rounded-xl border-none cursor-pointer group focus:outline-none transition-all duration-200"
              style={{
                background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(1px)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="text-center">
                <div className="text-blue-600 text-lg mb-1">📊</div>
                <div className="neumorphic-caption text-xs">
                  {dbStats.loading ? '...' : formatNumber(dbStats.totalWords)}
                </div>
              </div>
            </button>

            {/* Test Button */}
            <button
              onClick={testDatabaseDirectly}
              className="p-3 rounded-xl border-none cursor-pointer group focus:outline-none transition-all duration-200"
              style={{
                background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(1px)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="text-center">
                <div className="text-yellow-600 text-lg mb-1">🔍</div>
                <div className="neumorphic-caption text-xs">Teste</div>
              </div>
            </button>

            {/* Cache Button */}
            <button
              onClick={cacheWordsLocally}
              disabled={cacheInfo.caching || !isSupabaseConfigured()}
              className="p-3 rounded-xl border-none cursor-pointer group focus:outline-none transition-all duration-200"
              style={{
                background: (cacheInfo.caching || !isSupabaseConfigured()) 
                  ? 'linear-gradient(145deg, #e8e8eb, #d4d4d6)' 
                  : 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                boxShadow: (cacheInfo.caching || !isSupabaseConfigured()) 
                  ? 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
                  : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
                opacity: (cacheInfo.caching || !isSupabaseConfigured()) ? 0.6 : 1
              }}
              onMouseDown={(e) => {
                if (!cacheInfo.caching && isSupabaseConfigured()) {
                  e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(1px)';
                }
              }}
              onMouseUp={(e) => {
                if (!cacheInfo.caching && isSupabaseConfigured()) {
                  e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div className="text-center">
                <div className="text-green-600 text-lg mb-1">
                  {cacheInfo.caching ? '⏳' : '💾'}
                </div>
                <div className="neumorphic-caption text-xs">
                  {cacheInfo.totalCachedWords > 0 ? formatNumber(cacheInfo.totalCachedWords) : 'Cache'}
                </div>
              </div>
            </button>

            {/* Generate Button */}
            {canPopulateDatabase && (
              <button
                onClick={handleOpenPasswordModal}
                className="p-3 rounded-xl border-none cursor-pointer group focus:outline-none transition-all duration-200"
                style={{
                  background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(1px)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="text-center">
                  <div className="text-purple-600 text-lg mb-1">🤖</div>
                  <div className="neumorphic-caption text-xs">Gerar</div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="px-8 pb-6 max-h-96 overflow-y-auto scrollbar-hide">
          
          {/* Time Duration Section */}
          <section 
            className={`
              mb-8 transition-all duration-700 delay-600 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            <div className="mb-4">
              <h2 className="neumorphic-title text-lg mb-2">Duração do Jogo</h2>
              <p className="neumorphic-subtitle text-sm">Escolha quanto tempo você quer jogar</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {timeOptions.map((option) => {
                const isSelected = selectedDuration === option.value;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedDuration(option.value)}
                    className="relative p-4 rounded-xl border-none cursor-pointer group focus:outline-none transition-all duration-200"
                    style={{
                      background: isSelected 
                        ? 'linear-gradient(145deg, #e8e8eb, #f0f0f3)'
                        : 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                      boxShadow: isSelected
                        ? 'inset 3px 3px 6px rgba(0, 0, 0, 0.15), inset -3px -3px 6px rgba(255, 255, 255, 0.8)'
                        : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)'
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
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {option.value <= 60 ? '⚡' : option.value <= 90 ? '⏰' : '🕐'}
                      </div>
                      <div className="neumorphic-subtitle text-sm font-medium mb-1">
                        {option.name}
                      </div>
                      <div className="neumorphic-caption text-xs">
                        {option.value}s
                      </div>
                    </div>
                    {isSelected && (
                      <div 
                        className="absolute top-2 right-2 w-5 h-5 text-white rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(145deg, #4285f4, #3367d6)',
                          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        <span className="text-xs">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Difficulty Section */}
          <section 
            className={`
              mb-8 transition-all duration-700 delay-800 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            <div className="mb-4">
              <h2 className="neumorphic-title text-lg mb-2">Nível de Dificuldade</h2>
              <p className="neumorphic-subtitle text-sm">Selecione o desafio ideal para você</p>
            </div>
            
            <div className="space-y-3">
              {difficulties.map((level) => {
                const isSelected = selectedDifficulty.id === level.id;
                const difficultyIcons: { [key: string]: string } = { 
                  facil: '🌱', 
                  medio: '🔥', 
                  dificil: '💎' 
                };
                
                return (
                  <button
                    key={level.id}
                    onClick={() => setSelectedDifficulty(level)}
                    className="relative w-full p-4 rounded-xl border-none cursor-pointer group focus:outline-none transition-all duration-200"
                    style={{
                      background: isSelected 
                        ? 'linear-gradient(145deg, #e8e8eb, #f0f0f3)'
                        : 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                      boxShadow: isSelected
                        ? 'inset 3px 3px 6px rgba(0, 0, 0, 0.15), inset -3px -3px 6px rgba(255, 255, 255, 0.8)'
                        : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)'
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
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {difficultyIcons[level.id] || '⭐'}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="neumorphic-subtitle text-base font-medium">
                          {level.name}
                        </div>
                        <div className="neumorphic-caption text-sm">
                          Nível {level.name.toLowerCase()}
                        </div>
                      </div>
                      {isSelected && (
                        <div 
                          className="w-6 h-6 text-white rounded-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(145deg, #4285f4, #3367d6)',
                            boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.8)'
                          }}
                        >
                          <span className="text-sm">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Save Button */}
        <div 
          className={`
            p-8 transition-all duration-700 delay-1000 ease-out
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <button
            onClick={handleSave}
            className="w-full p-4 rounded-xl border-none cursor-pointer focus:outline-none transition-all duration-200 font-medium"
            style={{
              background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
              boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.7)',
              color: '#333333'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '8px 8px 16px rgba(0, 0, 0, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0, 0, 0, 0.2), inset -3px -3px 6px rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = '8px 8px 16px rgba(0, 0, 0, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
          >
            {/* Inner blue accent */}
            <div 
              className="w-full py-3 px-6 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #4285f4, #3367d6)',
                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(255, 255, 255, 0.1)'
              }}
            >
              <span className="text-white text-lg font-medium tracking-wide">
                Salvar e Voltar
              </span>
            </div>
          </button>
        </div>
      </div>



      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="w-full max-w-sm rounded-2xl flex flex-col max-h-[85vh]"
            style={{
              background: 'linear-gradient(145deg, #f0f0f3, #e6e6e9)',
              boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8)',
            }}
          >
            <div className="p-6 border-b border-gray-300/20">
              <div className="flex justify-between items-center">
                <h2 className="neumorphic-title text-xl">Estatísticas</h2>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="p-2 rounded-full border-none cursor-pointer focus:outline-none transition-all duration-200"
                  style={{
                    background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                    boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.8)'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0, 0, 0, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.8)';
                  }}
                >
                  <span className="neumorphic-subtitle text-lg">✕</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {dbStats.loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="neumorphic-subtitle">Carregando...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    className="p-4 rounded-xl"
                    style={{
                      background: 'linear-gradient(145deg, #e8e8eb, #f0f0f3)',
                      boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <h3 className="neumorphic-subtitle text-sm font-medium mb-3">Total Geral</h3>
                    <p className="neumorphic-title text-lg font-semibold">{formatNumber(dbStats.totalWords)} palavras</p>
                    <div className="neumorphic-caption text-xs mt-2">
                      Soma: {formatNumber((dbStats.byDifficulty.facil || 0) + (dbStats.byDifficulty.medio || 0) + (dbStats.byDifficulty.dificil || 0))}
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 rounded-xl"
                    style={{
                      background: 'linear-gradient(145deg, #e8e8eb, #f0f0f3)',
                      boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <h3 className="neumorphic-subtitle text-sm font-medium mb-3">Por Dificuldade</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="neumorphic-subtitle flex items-center gap-2 text-sm">
                          <span>🌱</span> Fácil
                        </span>
                        <span className="neumorphic-title font-medium text-sm">{formatNumber(dbStats.byDifficulty.facil || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="neumorphic-subtitle flex items-center gap-2 text-sm">
                          <span>🔥</span> Médio
                        </span>
                        <span className="neumorphic-title font-medium text-sm">{formatNumber(dbStats.byDifficulty.medio || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="neumorphic-subtitle flex items-center gap-2 text-sm">
                          <span>💎</span> Difícil
                        </span>
                        <span className="neumorphic-title font-medium text-sm">{formatNumber(dbStats.byDifficulty.dificil || 0)}</span>
                      </div>
                      {Object.keys(dbStats.byDifficulty).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300/30">
                          <div className="neumorphic-caption text-xs">
                            Debug: {JSON.stringify(dbStats.byDifficulty)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {testResults && (
                    <div 
                      className="p-4 rounded-xl"
                      style={{
                        background: 'linear-gradient(145deg, #fef3cd, #fcf4dd)',
                        boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      <h3 className="neumorphic-subtitle text-sm font-medium mb-3">Teste Direto</h3>
                      <div className="neumorphic-caption text-xs">
                        {testResults}
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className="p-4 rounded-xl"
                    style={{
                      background: 'linear-gradient(145deg, #e8e8eb, #f0f0f3)',
                      boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <h3 className="neumorphic-subtitle text-sm font-medium mb-3">Cache Local</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="neumorphic-subtitle text-sm">Status</span>
                        <span className={`font-medium text-sm ${cacheInfo.isEnabled ? 'text-green-700' : 'text-red-700'}`}>
                          {cacheInfo.isEnabled ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="neumorphic-subtitle text-sm">Palavras em cache</span>
                        <span className="neumorphic-title font-medium text-sm">{formatNumber(cacheInfo.totalCachedWords)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-300/20">
              <button 
                onClick={() => setShowStatsModal(false)} 
                className="w-full py-3 rounded-xl border-none cursor-pointer focus:outline-none transition-all duration-200 font-medium text-white"
                style={{
                  background: 'linear-gradient(145deg, #4285f4, #3367d6)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.7)'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.1)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.7)';
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Populator */}
      {showDatabasePopulator && (
        <DatabasePopulator onClose={() => setShowDatabasePopulator(false)} />
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="w-full max-w-sm p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, #f0f0f3, #e6e6e9)',
              boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8)',
            }}
          >
            <h2 className="neumorphic-title text-xl mb-4">Acesso Restrito</h2>
            <p className="neumorphic-subtitle text-sm mb-6">Digite a senha para gerar palavras com IA:</p>
            
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="w-full p-4 rounded-xl border-none outline-none transition-all duration-200 mb-4"
              style={{
                background: 'linear-gradient(145deg, #e8e8eb, #f5f5f7)',
                boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.8)',
                color: '#333333'
              }}
              placeholder="Senha de administrador"
            />
            
            {passwordError && (
              <p className="text-red-700 text-sm mb-4">{passwordError}</p>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={handlePasswordModalClose} 
                className="flex-1 py-3 rounded-xl border-none cursor-pointer focus:outline-none transition-all duration-200"
                style={{
                  background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
                  color: '#666666'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.15), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)';
                }}
              >
                Cancelar
              </button>
              
              <button 
                onClick={handlePasswordSubmit} 
                className="flex-1 py-3 rounded-xl border-none cursor-pointer focus:outline-none transition-all duration-200 font-medium text-white"
                style={{
                  background: 'linear-gradient(145deg, #4285f4, #3367d6)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.7)'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.1)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.7)';
                }}
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
