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
      
      <Button onClick={onPlayAgain} variant="primary" size="xl" fullWidth 
        className="py-3 sm:py-4 text-base sm:text-xl font-bold rounded-xl border border-pink-500/30 relative overflow-hidden group transition-all duration-500 transform hover:scale-102 hover:shadow-glow hover:rotate-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600">
        <span className="relative z-10 flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-300">
          <span className="transform group-hover:scale-110 transition-transform duration-300 tracking-wider text-white drop-shadow-md">JOGAR</span>
          <span className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="drop-shadow-md">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-purple-700/80 via-pink-700/80 to-orange-700/80 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-md"></span>
        
        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-[-100%] h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-30 group-hover:animate-shine"></div>
        </div>
        
        {/* Animated particles */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-pink-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-100 scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
        <div className="absolute right-8 top-1/3 transform -translate-y-1/2 w-2 h-2 bg-purple-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-200 scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
      </Button>
    </div>
  );
};

export default ScoreScreen;