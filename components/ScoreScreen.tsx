
import React from 'react';
import Button from './Button';

interface ScoreScreenProps {
  score: number;
  totalWords: number;
  skippedWords: number;
  accuracy: number;
  onPlayAgain: () => void;
}

const ScoreScreen: React.FC<ScoreScreenProps> = ({ score, totalWords, skippedWords, accuracy, onPlayAgain }) => {
  const getScoreMessage = () => {
    if (score === 0) return "Sem acertos? Tente de novo com outras categorias ou dificuldade! 🤔";
    if (score <= 5) return "Bom começo! Continue praticando! 👍";
    if (score <= 10) return "Muito bem! Você está afiado! 🎉";
    if (score <= 15) return "Impressionante! Um verdadeiro mestre das palavras! 🏆";
    return "Pontuação Lendária! Você é imbatível! 🤩✨";
  }

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-10 bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/50 text-center">
      <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gradient bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
        Fim de Jogo!
      </h2>
      <p className="text-lg sm:text-xl mb-2 text-slate-300">Sua pontuação:</p>
      <p 
        className="text-7xl sm:text-8xl md:text-9xl font-black my-6 text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500"
        style={{ textShadow: '0 0 15px rgba(252, 211, 77, 0.3), 0 0 30px rgba(249, 115, 22, 0.2)'}}
      >
        {score}
      </p>
      <p className="text-md sm:text-lg mb-6 text-slate-300 px-4">{getScoreMessage()}</p>
      
      {/* Game Statistics */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-6 space-y-3">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Estatísticas da Partida</h3>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{score}</div>
            <div className="text-xs text-slate-300">Acertos</div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400">{skippedWords}</div>
            <div className="text-xs text-slate-300">Descartadas</div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{totalWords}</div>
            <div className="text-xs text-slate-300">Total de Palavras</div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">{accuracy.toFixed(1)}%</div>
            <div className="text-xs text-slate-300">Precisão</div>
          </div>
        </div>
      </div>
      
      <Button onClick={onPlayAgain} variant="primary" size="xl" fullWidth>
        Jogar Novamente
      </Button>
    </div>
  );
};

export default ScoreScreen;