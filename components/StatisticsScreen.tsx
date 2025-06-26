import React, { useState, useEffect } from 'react';
import { GameStatistics, GameSession, getGameStatistics } from '../services/gameHistoryService';
import { AVAILABLE_CATEGORIES } from '../constants';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface StatisticsScreenProps {
  onBack: () => void;
}

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ onBack }) => {
  const [statistics, setStatistics] = useState<GameStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadStatistics();
    const timer = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getGameStatistics();
      setStatistics(stats);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return '🌱';
      case 'medio': return '🔥';
      case 'dificil': return '💎';
      default: return '⭐';
    }
  };

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      default: return difficulty;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = AVAILABLE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('pt-BR');
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="statistics-container">
        {/* Background subtle patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-gray-300 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="min-h-screen w-full flex items-center justify-center p-6 relative z-10">
          <div 
            className="w-full max-w-md mx-auto p-8 rounded-3xl"
            style={{
              background: 'linear-gradient(145deg, #f0f0f3, #e6e6e9)',
              boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7)',
            }}
          >
            <div className="text-center">
              <div className="mb-6">
                <LoadingSpinner />
              </div>
              <h2 className="neumorphic-title text-xl">Carregando estatísticas...</h2>
              <p className="neumorphic-subtitle text-sm mt-2">Aguarde um momento</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="statistics-container">
        {/* Background subtle patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-gray-300 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="min-h-screen w-full flex items-center justify-center p-6 relative z-10">
          <div 
            className="w-full max-w-md mx-auto p-8 rounded-3xl"
            style={{
              background: 'linear-gradient(145deg, #f0f0f3, #e6e6e9)',
              boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7)',
            }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="neumorphic-title text-xl mb-4">Erro</h2>
              <p className="neumorphic-subtitle text-sm mb-6">{error}</p>
              
              <div className="flex gap-3">
                <button
                  onClick={loadStatistics}
                  className="flex-1 py-3 rounded-xl border-none cursor-pointer focus:outline-none transition-all duration-200 font-medium text-white"
                  style={{
                    background: 'linear-gradient(145deg, #ef4444, #dc2626)',
                    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.7)'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.7)';
                  }}
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={onBack}
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
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className="statistics-container">
      {/* Background subtle patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-gray-300 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="min-h-screen w-full flex items-center justify-center p-6 relative z-10">
        <div 
          className={`
            w-full max-w-md mx-auto rounded-3xl
            transition-all duration-500 ease-out
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
            <div className="flex justify-between items-center mb-4">
              <h1 className="neumorphic-title text-4xl tracking-tight">📊</h1>
              
              {/* Back Button */}
              <button
                onClick={onBack}
                className="p-3 rounded-xl border-none cursor-pointer focus:outline-none transition-all duration-200"
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
                <span className="neumorphic-subtitle text-lg">←</span>
              </button>
            </div>
            
            <h1 className="neumorphic-title text-3xl mb-2 tracking-tight">
              Estatísticas
            </h1>
            
            {/* Decorative element */}
            <div 
              className="h-1 w-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
              style={{
                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.8)'
              }}
            ></div>
            
            <p className="neumorphic-subtitle text-sm">
              Seu desempenho e histórico de jogos
            </p>
          </header>

          {/* Tab Navigation */}
          <div 
            className={`
              px-8 mb-6 transition-all duration-700 delay-400 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 px-4 rounded-xl border-none cursor-pointer focus:outline-none transition-all duration-200 font-medium`}
                style={{
                  background: activeTab === 'overview' 
                    ? 'linear-gradient(145deg, #e8e8eb, #f0f0f3)'
                    : 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                  boxShadow: activeTab === 'overview'
                    ? 'inset 3px 3px 6px rgba(0, 0, 0, 0.15), inset -3px -3px 6px rgba(255, 255, 255, 0.8)'
                    : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
                  color: '#333333'
                }}
                onMouseDown={(e) => {
                  if (activeTab !== 'overview') {
                    e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.15), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                  }
                }}
                onMouseUp={(e) => {
                  if (activeTab !== 'overview') {
                    e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)';
                  }
                }}
              >
                Resumo
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 px-4 rounded-xl border-none cursor-pointer focus:outline-none transition-all duration-200 font-medium`}
                style={{
                  background: activeTab === 'history' 
                    ? 'linear-gradient(145deg, #e8e8eb, #f0f0f3)'
                    : 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                  boxShadow: activeTab === 'history'
                    ? 'inset 3px 3px 6px rgba(0, 0, 0, 0.15), inset -3px -3px 6px rgba(255, 255, 255, 0.8)'
                    : '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)',
                  color: '#333333'
                }}
                onMouseDown={(e) => {
                  if (activeTab !== 'history') {
                    e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.15), inset -2px -2px 4px rgba(255, 255, 255, 0.8)';
                  }
                }}
                onMouseUp={(e) => {
                  if (activeTab !== 'history') {
                    e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)';
                  }
                }}
              >
                Histórico
              </button>
            </div>
          </div>

          {/* Content Scrollable Area */}
          <div className="px-8 pb-8 max-h-96 overflow-y-auto scrollbar-hide">
            
            {activeTab === 'overview' ? (
              <div 
                className={`
                  transition-all duration-700 delay-600 ease-out
                  ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
              >
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Total Games */}
                  <div 
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: 'linear-gradient(145deg, #e8e8eb, #f0f0f3)',
                      boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <div className="text-2xl mb-2">🎮</div>
                    <div className="neumorphic-title text-xl font-bold mb-1">
                      {formatNumber(statistics.total_games)}
                    </div>
                    <div className="neumorphic-caption text-xs">Jogos Totais</div>
                  </div>

                  {/* Best Score */}
                  <div 
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: 'linear-gradient(145deg, #e8e8eb, #f0f0f3)',
                      boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="neumorphic-title text-xl font-bold mb-1">
                      {formatNumber(statistics.best_score)}
                    </div>
                    <div className="neumorphic-caption text-xs">Melhor Score</div>
                  </div>

                  {/* Average Score */}
                  <div 
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: 'linear-gradient(145deg, #e8e8eb, #f0f0f3)',
                      boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="neumorphic-title text-xl font-bold mb-1">
                      {statistics.average_score}
                    </div>
                    <div className="neumorphic-caption text-xs">Média</div>
                  </div>

                  {/* Accuracy */}
                  <div 
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: 'linear-gradient(145deg, #e8e8eb, #f0f0f3)',
                      boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="neumorphic-title text-xl font-bold mb-1">
                      {statistics.overall_accuracy}%
                    </div>
                    <div className="neumorphic-caption text-xs">Precisão</div>
                  </div>
                </div>

                {/* Difficulty Distribution */}
                <div 
                  className="p-5 rounded-xl mb-6"
                  style={{
                    background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                    boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <h3 className="neumorphic-title text-lg font-semibold mb-4 text-center">
                    Jogos por Dificuldade
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌱</span>
                        <span className="neumorphic-subtitle text-sm">Fácil</span>
                      </div>
                      <div 
                        className="px-3 py-1 rounded-lg"
                        style={{
                          background: 'linear-gradient(145deg, #dcfce7, #bbf7d0)',
                          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        <span className="neumorphic-title text-sm font-bold">
                          {formatNumber(statistics.games_by_difficulty.facil || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔥</span>
                        <span className="neumorphic-subtitle text-sm">Médio</span>
                      </div>
                      <div 
                        className="px-3 py-1 rounded-lg"
                        style={{
                          background: 'linear-gradient(145deg, #fef3c7, #fde68a)',
                          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        <span className="neumorphic-title text-sm font-bold">
                          {formatNumber(statistics.games_by_difficulty.medio || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💎</span>
                        <span className="neumorphic-subtitle text-sm">Difícil</span>
                      </div>
                      <div 
                        className="px-3 py-1 rounded-lg"
                        style={{
                          background: 'linear-gradient(145deg, #fecaca, #fca5a5)',
                          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        <span className="neumorphic-title text-sm font-bold">
                          {formatNumber(statistics.games_by_difficulty.dificil || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div 
                  className="p-5 rounded-xl"
                  style={{
                    background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                    boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <h3 className="neumorphic-title text-lg font-semibold mb-4 text-center">
                    Outras Estatísticas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="neumorphic-subtitle text-sm">Total de Palavras</span>
                      <span className="neumorphic-title text-sm font-bold">
                        {formatNumber(statistics.total_words_played)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="neumorphic-subtitle text-sm">Pontuação Total</span>
                      <span className="neumorphic-title text-sm font-bold">
                        {formatNumber(statistics.total_score)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="neumorphic-subtitle text-sm">Categoria Favorita</span>
                      <span className="neumorphic-title text-sm font-bold text-blue-600">
                        {getCategoryName(statistics.favorite_category)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* History Tab */
              <div 
                className={`
                  transition-all duration-700 delay-600 ease-out
                  ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
              >
                <h3 className="neumorphic-title text-lg font-semibold mb-4 text-center">
                  Últimos Jogos
                </h3>
                {statistics.recent_games.length === 0 ? (
                  <div 
                    className="text-center py-8 rounded-xl"
                    style={{
                      background: 'linear-gradient(145deg, #e8e8eb, #f0f0f3)',
                      boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <div className="text-4xl mb-4">🎯</div>
                    <p className="neumorphic-title text-base mb-2">Nenhum jogo encontrado</p>
                    <p className="neumorphic-subtitle text-sm">
                      Jogue algumas partidas para ver seu histórico aqui!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statistics.recent_games.map((game, index) => (
                      <div
                        key={`${game.created_at}-${index}`}
                        className="p-4 rounded-xl"
                        style={{
                          background: 'linear-gradient(145deg, #f5f5f7, #e8e8eb)',
                          boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="px-3 py-1 rounded-lg"
                              style={{
                                background: 'linear-gradient(145deg, #4285f4, #3367d6)',
                                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.8)'
                              }}
                            >
                              <span className="text-white text-xs font-bold">
                                {game.score} pts
                              </span>
                            </div>
                            <div 
                              className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                              style={{
                                background: 'linear-gradient(145deg, #e8e8eb, #f0f0f3)',
                                boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
                              }}
                            >
                              <span>{getDifficultyIcon(game.difficulty)}</span>
                            </div>
                          </div>
                          <div className="neumorphic-caption text-xs">
                            {formatDate(game.created_at)}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="neumorphic-subtitle text-xs">
                            <span className="font-medium">Categorias:</span> {game.categories.map(getCategoryName).join(', ')}
                          </div>
                          <div className="neumorphic-subtitle text-xs">
                            <span className="font-medium">Precisão:</span> {game.accuracy}% • 
                            <span className="font-medium"> Duração:</span> {Math.floor(game.duration / 60)}min
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsScreen;