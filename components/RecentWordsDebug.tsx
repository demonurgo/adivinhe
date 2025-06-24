import React, { useState, useEffect } from 'react';
import { getRecentWordsStatistics, cleanupRecentWords, resetRecentWordsHistory, checkWordsHealthStatus, resetDatabaseUsageColumns } from '../services/wordService';

interface RecentWordsDebugProps {
  isVisible: boolean;
  onClose: () => void;
}

interface RecentWordsStats {
  totalRecentWords: number;
  currentSessionWords: number;
  totalSessions: number;
  cooldownHours: number;
  oldestRecentWord: Date | null;
  currentSession: {
    id: string;
    duration: number;
    categories: string[];
    difficulty: string;
  } | null;
}

const RecentWordsDebug: React.FC<RecentWordsDebugProps> = ({ isVisible, onClose }) => {
  const [stats, setStats] = useState<RecentWordsStats | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isResettingDatabase, setIsResettingDatabase] = useState(false);
  const [resetDatabaseResult, setResetDatabaseResult] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      const loadStats = () => {
        try {
          const currentStats = getRecentWordsStatistics();
          setStats(currentStats);
        } catch (error) {
          console.error('Erro ao carregar estatísticas:', error);
        }
      };

      loadStats();
      const interval = setInterval(loadStats, 2000); // Atualiza a cada 2 segundos

      return () => clearInterval(interval);
    }
  }, [isVisible, refreshKey]);

  const handleCleanup = () => {
    const removedCount = cleanupRecentWords();
    alert(`${removedCount} palavras expiradas foram removidas.`);
    setRefreshKey(prev => prev + 1);
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar todo o histórico de palavras recentes?')) {
      resetRecentWordsHistory();
      alert('Histórico resetado com sucesso!');
      setRefreshKey(prev => prev + 1);
    }
  };

  const testHealthStatus = () => {
    // Testa o status de saúde para uma categoria popular
    const healthStatus = checkWordsHealthStatus(['animais'], 'facil', 50);
    alert(`Status de Saúde:\n\nNível: ${healthStatus.riskLevel}\nPorcentagem disponível: ${healthStatus.healthPercentage.toFixed(1)}%\nBloqueadas: ${healthStatus.blockedCount}\nDeveria avisar: ${healthStatus.shouldWarnUser ? 'Sim' : 'Não'}\n\nMensagem: ${healthStatus.message}`);
  };

  const handleResetDatabaseUsage = async () => {
    // Primeira confirmação
    if (!confirm('⚠️  ATENÇÃO: Esta ação irá resetar TODAS as colunas de uso no banco de dados!\n\nIsso significa:\n• total_utilizacoes = 0 para todas as palavras\n• ultima_utilizacao = NULL para todas as palavras\n\nTodas as palavras ficarão disponíveis novamente.\n\nDeseja continuar?')) {
      return;
    }
    
    // Segunda confirmação mais séria
    if (!confirm('🚨 Última confirmação!\n\nVocê tem CERTEZA de que deseja resetar o histórico de uso de TODAS as palavras no banco de dados?\n\nEsta ação NÃO PODE ser desfeita!\n\nDigite "RESETAR" se tiver certeza:')) {
      return;
    }
    
    setIsResettingDatabase(true);
    setResetDatabaseResult(null);
    
    try {
      const result = await resetDatabaseUsageColumns();
      
      if (result.success) {
        setResetDatabaseResult(`✅ ${result.message}`);
        // Também limpa o histórico local
        resetRecentWordsHistory();
        setRefreshKey(prev => prev + 1);
      } else {
        setResetDatabaseResult(`❌ ${result.message}`);
      }
    } catch (error) {
      setResetDatabaseResult(`❌ Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsResettingDatabase(false);
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (!isVisible || !stats) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">📊 Debug: Palavras Recentes</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Estatísticas Gerais */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">📈 Estatísticas Gerais</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Palavras recentes:</span>
                <div className="font-bold text-blue-700">{stats.totalRecentWords}</div>
              </div>
              <div>
                <span className="text-gray-600">Cooldown:</span>
                <div className="font-bold text-blue-700">{stats.cooldownHours}h</div>
              </div>
              <div>
                <span className="text-gray-600">Total de sessões:</span>
                <div className="font-bold text-blue-700">{stats.totalSessions}</div>
              </div>
              <div>
                <span className="text-gray-600">Palavra mais antiga:</span>
                <div className="font-bold text-blue-700">
                  {stats.oldestRecentWord 
                    ? new Date(stats.oldestRecentWord).toLocaleString('pt-BR')
                    : 'Nenhuma'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Reset do Banco de Dados */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
            <h3 className="font-bold text-red-800 mb-3">🚨 Reset do Banco de Dados</h3>
            <div className="space-y-3">
              <div className="text-xs text-red-700 bg-red-100 p-3 rounded-lg">
                ⚠️ <strong>Ação Perigosa:</strong> Reseta as colunas <code>total_utilizacoes</code> e <code>ultima_utilizacao</code> de TODAS as palavras no banco Supabase. Todas as palavras ficarão disponíveis novamente.
              </div>
              
              {isResettingDatabase ? (
                <div className="w-full bg-red-100 text-red-800 font-medium py-2 px-4 rounded-lg text-center">
                  🔄 Resetando banco de dados...
                </div>
              ) : (
                <button
                  onClick={handleResetDatabaseUsage}
                  className="w-full bg-red-200 hover:bg-red-300 text-red-900 font-bold py-2 px-4 rounded-lg transition-colors duration-200 border-2 border-red-400"
                >
                  🗑️ Resetar Colunas de Uso no Banco
                </button>
              )}
              
              {resetDatabaseResult && (
                <div className={`text-xs p-3 rounded-lg font-medium ${
                  resetDatabaseResult.startsWith('✅') 
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {resetDatabaseResult}
                </div>
              )}
            </div>
          </div>

          {/* Sessão Atual */}
          {stats.currentSession ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
              <h3 className="font-bold text-green-800 mb-3">🎮 Sessão Atual</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <div className="font-mono text-xs text-green-700 break-all">
                    {stats.currentSession.id}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-600">Duração:</span>
                    <div className="font-bold text-green-700">
                      {formatDuration(stats.currentSession.duration)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Palavras usadas:</span>
                    <div className="font-bold text-green-700">{stats.currentSessionWords}</div>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Categorias:</span>
                  <div className="font-bold text-green-700">
                    {stats.currentSession.categories.join(', ')}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Dificuldade:</span>
                  <div className="font-bold text-green-700 capitalize">
                    {stats.currentSession.difficulty}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">💤 Nenhuma Sessão Ativa</h3>
              <p className="text-gray-600 text-sm">Inicie um jogo para ver a sessão atual.</p>
            </div>
          )}

          {/* Ações de Manutenção */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
            <h3 className="font-bold text-orange-800 mb-3">🔧 Manutenção</h3>
            <div className="space-y-3">
              <button
                onClick={testHealthStatus}
                className="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                📊 Testar Status de Saúde
              </button>
              <button
                onClick={handleCleanup}
                className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                🧹 Limpar Palavras Expiradas
              </button>
              <button
                onClick={handleReset}
                className="w-full bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                🗑️ Resetar Todo Histórico
              </button>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-2">ℹ️ Como Funciona</h3>
            <div className="text-xs text-purple-700 space-y-1">
              <p>• Palavras ficam bloqueadas por {stats.cooldownHours} horas após serem usadas</p>
              <p>• O sistema mantém histórico das últimas {stats.totalSessions} sessões</p>
              <p>• Máximo de 200 palavras recentes são mantidas em cache</p>
              <p>• Palavras expiradas são limpas automaticamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentWordsDebug;