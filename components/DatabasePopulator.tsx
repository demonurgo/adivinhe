import React, { useState } from 'react';
import { populateDatabaseWithWords } from '../services/databasePopulator';
import LoadingSpinner from './LoadingSpinner';
import RecentWordsDebug from './RecentWordsDebug';
import { resetDatabaseUsageColumns } from '../services/wordService';

interface DatabasePopulatorProps {
  onClose: () => void;
}

const DatabasePopulator: React.FC<DatabasePopulatorProps> = ({ onClose }) => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ success: number; errors: number; duplicates: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [isResettingDatabase, setIsResettingDatabase] = useState(false);
  const [resetResult, setResetResult] = useState<string | null>(null);

  const handlePopulateDatabase = async () => {
    setIsPopulating(true);
    setProgress(0);
    setProgressMessage('Iniciando...');
    setResult(null);
    setError(null);

    try {
      const result = await populateDatabaseWithWords((message, progressPercent) => {
        setProgressMessage(message);
        setProgress(progressPercent);
      });
      
      setResult(result);
      setProgressMessage('Concluído com sucesso!');
    } catch (err) {
      console.error('Erro ao popular banco:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsPopulating(false);
    }
  };

  const handleResetDatabaseUsage = async () => {
    if (!confirm('⚠️  Esta ação irá resetar as colunas de uso (total_utilizacoes e ultima_utilizacao) de TODAS as palavras no banco!\n\nTodas as palavras ficarão disponíveis novamente.\n\nDeseja continuar?')) {
      return;
    }
    
    setIsResettingDatabase(true);
    setResetResult(null);
    
    try {
      const result = await resetDatabaseUsageColumns();
      setResetResult(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
    } catch (error) {
      setResetResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsResettingDatabase(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            Popular Banco de Dados
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDebug(true)}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded transition-colors"
              title="Debug: Palavras Recentes"
            >
              📊 Debug
            </button>
            <button
              onClick={handleResetDatabaseUsage}
              className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors"
              title="Resetar colunas de uso do banco"
              disabled={isResettingDatabase}
            >
              {isResettingDatabase ? '🔄' : '🗑️'} Reset
            </button>
          </div>
        </div>
        
        {!isPopulating && !result && !error && (
          <div className="text-center">
            <p className="text-slate-300 mb-6">
              Esta ação irá gerar centenas de palavras para todas as categorias e dificuldades usando a IA OpenAI.
              <br /><br />
              <strong>Detalhes:</strong>
              <br />• 10 categorias × 3 dificuldades × ~50 palavras
              <br />• Total estimado: ~1.500 palavras
              <br />• Palavras duplicadas serão ignoradas
              <br />• Tempo estimado: 3-5 minutos
            </p>
            
            {/* Resultado do Reset do Banco */}
            {resetResult && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                resetResult.startsWith('✅') 
                  ? 'bg-green-900/80 text-green-300 border border-green-600/40'
                  : 'bg-red-900/80 text-red-300 border border-red-600/40'
              }`}>
                {resetResult}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handlePopulateDatabase}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Iniciar Geração
              </button>
              <button
                onClick={onClose}
                className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {isPopulating && (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <div className="mt-4">
              <div className="bg-slate-700 rounded-full h-3 mb-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-slate-300">{Math.round(progress)}% concluído</p>
              <p className="text-xs text-slate-400 mt-2">{progressMessage}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="text-center">
            <div className="text-green-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Geração Concluída!</h3>
            <div className="bg-slate-700 rounded-lg p-4 mb-4 text-sm space-y-2">
              <div className="flex justify-between text-green-400">
                <span>✅ Palavras novas inseridas:</span>
                <span className="font-bold">{result.success}</span>
              </div>
              {result.duplicates > 0 && (
                <div className="flex justify-between text-yellow-400">
                  <span>⚠️ Duplicadas ignoradas:</span>
                  <span className="font-bold">{result.duplicates}</span>
                </div>
              )}
              {result.errors > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>❌ Erros encontrados:</span>
                  <span className="font-bold">{result.errors}</span>
                </div>
              )}
              <hr className="border-slate-600 my-2" />
              <div className="flex justify-between text-blue-400 font-semibold">
                <span>📊 Total processado:</span>
                <span>{result.success + result.duplicates}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              As palavras foram distribuídas com sistema de aleatoriedade inteligente para evitar repetições no jogo.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Erro na Geração</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handlePopulateDatabase}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                Tentar Novamente
              </button>
              <button
                onClick={onClose}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    
    <RecentWordsDebug 
      isVisible={showDebug}
      onClose={() => setShowDebug(false)}
    />
    </>
  );
};

export default DatabasePopulator;