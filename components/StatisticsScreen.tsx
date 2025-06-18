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

  useEffect(() => {
    loadStatistics();
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'bg-green-500/20 text-green-300';
      case 'medio': return 'bg-yellow-500/20 text-yellow-300';
      case 'dificil': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = AVAILABLE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-100 p-4">
        <LoadingSpinner />
        <p className="mt-6 text-2xl font-semibold">Carregando estatísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-100 p-4">
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-300 mb-4">Erro</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={loadStatistics} className="bg-red-600 hover:bg-red-700">
              Tentar Novamente
            </Button>
            <Button onClick={onBack} variant="secondary">
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className="internal-scroll-container w-full flex flex-col items-center text-slate-100 p-3">
      <div className="w-full max-w-lg h-full flex flex-col">
        {/* Header - Compacto */}
        <div className="flex justify-between items-center mb-4 flex-none">
          <h1 style={{color: '#3b82f6'}} className="text-xl font-bold">📊 Estatísticas</h1>
          <Button onClick={onBack} variant="secondary" className="text-sm px-3 py-1">
            ← Voltar
          </Button>
        </div>

        {/* Tabs - Compacto */}
        <div className="flex border-b border-slate-600 mb-4 flex-none">
          <button
            style={{color: '#3b82f6'}}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 opacity-100'
                : 'opacity-70 hover:opacity-100'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Visão Geral
          </button>
          <button
            style={{color: '#3b82f6'}}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 opacity-100'
                : 'opacity-70 hover:opacity-100'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Histórico
          </button>
        </div>

        {/* Content - Com scroll interno */}
        <div className="flex-1 overflow-y-auto allow-scroll">
          {activeTab === 'overview' ? (
            <div className="space-y-4">
              {/* Summary Cards - Compacto */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-400">{statistics.total_games}</div>
                  <div className="text-slate-100 text-xs">Jogos Totais</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-400">{statistics.best_score}</div>
                  <div className="text-slate-100 text-xs">Melhor Score</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-yellow-400">{statistics.average_score}</div>
                  <div className="text-slate-100 text-xs">Média</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-400">{statistics.overall_accuracy}%</div>
                  <div className="text-slate-100 text-xs">Precisão</div>
                </div>
              </div>

              {/* Additional Stats - Compacto */}
              <div className="space-y-3">
                {/* Difficulty Distribution */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                  <h3 style={{color: '#3b82f6'}} className="text-base font-semibold mb-3">Jogos por Dificuldade</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-green-300 text-sm">🌱 Fácil</span>
                      <span className="font-semibold text-white text-sm">{statistics.games_by_difficulty.facil}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-300 text-sm">🔥 Médio</span>
                      <span className="font-semibold text-white text-sm">{statistics.games_by_difficulty.medio}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-300 text-sm">💎 Difícil</span>
                      <span className="font-semibold text-white text-sm">{statistics.games_by_difficulty.dificil}</span>
                    </div>
                  </div>
                </div>

                {/* Other Stats */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                  <h3 style={{color: '#3b82f6'}} className="text-base font-semibold mb-3">Outras Estatísticas</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Total de Palavras</span>
                      <span className="font-semibold text-white text-sm">{statistics.total_words_played}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Pontuação Total</span>
                      <span className="font-semibold text-white text-sm">{statistics.total_score}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Categoria Favorita</span>
                      <span className="font-semibold text-blue-300 text-sm">
                        {getCategoryName(statistics.favorite_category)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* History Tab - Compacto */
            <div className="space-y-3">
              <h3 style={{color: '#3b82f6'}} className="text-base font-semibold">Últimos Jogos</h3>
              {statistics.recent_games.length === 0 ? (
                <div className="text-center py-8 bg-slate-800/50 rounded-lg">
                  <p className="text-base text-white">Nenhum jogo encontrado</p>
                  <p className="text-slate-200 text-sm">Jogue algumas partidas para ver seu histórico aqui!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {statistics.recent_games.map((game, index) => (
                    <div
                      key={`${game.created_at}-${index}`}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-blue-300">
                            {game.score} pts
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                            {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-200">
                          {formatDate(game.created_at)}
                        </div>
                      </div>
                      <div className="text-xs text-white">
                        <div className="truncate">Categorias: {game.categories.map(getCategoryName).join(', ')}</div>
                        <div>Precisão: {game.accuracy}% • Duração: {Math.floor(game.duration / 60)}min</div>
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
  );
};

export default StatisticsScreen;
