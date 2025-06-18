import React, { useState } from 'react';
import { populateDatabaseWithWords } from '../services/databasePopulator';
import LoadingSpinner from './LoadingSpinner';

interface DatabasePopulatorProps {
  onClose: () => void;
}

const DatabasePopulator: React.FC<DatabasePopulatorProps> = ({ onClose }) => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ success: number; errors: number; duplicates: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Popular Banco de Dados
        </h2>
        
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
  );
};

export default DatabasePopulator;