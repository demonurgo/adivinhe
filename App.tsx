import React, { useState, useCallback, useEffect } from 'react';
import { GameScreenState, Category, Difficulty, TimeOption } from './types';
import { AVAILABLE_CATEGORIES, GAME_DURATION_SECONDS, DIFFICULTIES, TIME_OPTIONS } from './constants';
import CategorySelectionScreen from './components/CategorySelectionScreen';
import ConfigurationScreen from './components/ConfigurationScreen';
import GameScreen from './components/GameScreen';
import ScoreScreen from './components/ScoreScreen';
import StatisticsScreen from './components/StatisticsScreen';
import LoadingSpinner from './components/LoadingSpinner';
import PWAInstallPrompt from './components/PWAInstallPromptSimple';
import WelcomeScreen from './components/WelcomeScreen';
import { fetchWordsForCategories } from './services/wordService'; 
import { isSupabaseConfigured as checkSupabaseConfig } from './services/supabaseClient';
import { saveGameSession } from './services/gameHistoryService';
import { usePWA, useOnlineStatus } from './hooks/usePWASimple';

// Log environment variables for debugging
console.log("VITE_GEMINI_API_KEY configured:", !!import.meta.env.VITE_GEMINI_API_KEY);
console.log("VITE_SUPABASE_ANON_KEY configured:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log("Supabase URL:", "https://ldujhtwxnbwqbchhchcf.supabase.co");

const INITIAL_WORDS_COUNT = 40;
const MORE_WORDS_COUNT = 25;
const WORDS_FETCH_THRESHOLD = 10;

const App: React.FC = () => {
  // PWA Hooks
  const { isUpdateAvailable, updateApp } = usePWA();
  const isOnline = useOnlineStatus();
  
  const [currentScreen, setCurrentScreen] = useState<GameScreenState>(GameScreenState.Welcome);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyExists, setApiKeyExists] = useState<boolean>(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean>(false);
  const [isFetchingMoreWords, setIsFetchingMoreWords] = useState<boolean>(false);
  const [gameId, setGameId] = useState<number>(0);
  
  // Game session tracking
  const [totalWordsShown, setTotalWordsShown] = useState<number>(0);
  const [skippedWords, setSkippedWords] = useState<number>(0);

  // Game Settings
  const [gameDuration, setGameDuration] = useState<number>(GAME_DURATION_SECONDS);
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES.find(d => d.id === 'medio') || DIFFICULTIES[1]);

  // Effect para controlar scroll apenas durante o jogo
  useEffect(() => {
    const body = document.body;
    const root = document.getElementById('root');
    
    if (currentScreen === GameScreenState.Playing) {
      // Adicionar classes para bloquear scroll durante o jogo
      body.classList.add('game-screen-active');
      if (root) root.classList.add('game-screen-active');
    } else {
      // Remover classes para permitir scroll nas outras telas
      body.classList.remove('game-screen-active');
      if (root) root.classList.remove('game-screen-active');
    }
    
    // Cleanup function
    return () => {
      body.classList.remove('game-screen-active');
      if (root) root.classList.remove('game-screen-active');
    };
  }, [currentScreen]);

  useEffect(() => {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY; 
    if (geminiApiKey) {
      setApiKeyExists(true);
      setError(prevError => {
        if (prevError && prevError.includes("VITE_GEMINI_API_KEY")) {
            const parts = prevError.split('. ').filter(part => !part.includes("VITE_GEMINI_API_KEY"));
            return parts.length > 0 ? parts.join('. ') + '.' : null;
        }
        return prevError;
      });
    } else {
       console.warn("VITE_GEMINI_API_KEY environment variable not found. Gemini API calls for word generation will fail if Supabase has no words.");
       setError(prevError => {
        const newError = "Chave de API (VITE_GEMINI_API_KEY) do Gemini não configurada.";
        return prevError && !prevError.includes(newError) ? prevError + " " + newError : newError;
       });
    }

    const supabaseIsConfigured = checkSupabaseConfig();
    setSupabaseConfigured(supabaseIsConfigured);

    if (supabaseIsConfigured) {
      setError(prevError => {
        if (prevError && prevError.includes("Supabase")) {
            const parts = prevError.split('. ').filter(part => !part.includes("Supabase"));
            return parts.length > 0 ? parts.join('. ') + '.' : null;
        }
        return prevError;
      });
    } else {
      const supabaseError = "Configuração do Supabase incompleta. Verifique a variável VITE_SUPABASE_ANON_KEY.";
      console.warn(supabaseError);
      setError(prevError => {
        return prevError && !prevError.includes("Supabase") ? prevError + " " + supabaseError : supabaseError;
      });
    }
  }, []);

  const loadMoreWords = useCallback(async () => {
    if (isFetchingMoreWords || !selectedCategories.length || (!apiKeyExists && !supabaseConfigured)) return;

    console.log("Fetching more words with difficulty:", difficulty.id);
    setIsFetchingMoreWords(true);
    try {
      const categoryIds = selectedCategories.map(c => c.id);
      const newFetchedWords = await fetchWordsForCategories(categoryIds, difficulty.id, MORE_WORDS_COUNT);
      
      setWords(prevWords => {
        const uniqueNewWords = newFetchedWords.filter(nw => !prevWords.includes(nw));
        return [...prevWords, ...uniqueNewWords];
      });

    } catch (err) {
      console.error("Error fetching more words:", err);
      if (err instanceof Error) {
        setError(`Erro ao buscar mais palavras: ${err.message}`);
      } else {
         setError("Erro desconhecido ao buscar mais palavras.");
      }
    } finally {
      setIsFetchingMoreWords(false);
    }
  }, [selectedCategories, apiKeyExists, supabaseConfigured, isFetchingMoreWords, difficulty]);

  const handleCategoriesSelect = (categories: Category[]) => {
    setSelectedCategories(categories);
     if (error && error.includes("selecione pelo menos uma categoria")) {
        setError(null); 
     }
  };

  const handleNavigateToConfiguration = () => {
    setCurrentScreen(GameScreenState.Configuration);
  };

  const handleNavigateToStatistics = () => {
    setCurrentScreen(GameScreenState.Statistics);
  };

  const handleConfigurationSave = (newDuration: number, newDifficulty: Difficulty) => {
    setGameDuration(newDuration);
    setDifficulty(newDifficulty);
    setCurrentScreen(GameScreenState.CategorySelection);
  };

  const handleStartGame = useCallback(async () => {
    if (selectedCategories.length === 0) {
      setError("Por favor, selecione pelo menos uma categoria.");
      return;
    }
    if (!apiKeyExists && !supabaseConfigured) {
      const currentConfigError = [];
      if (!apiKeyExists) currentConfigError.push("Chave de API (VITE_GEMINI_API_KEY) do Gemini não configurada.");
      if (!supabaseConfigured) currentConfigError.push("Configuração do Supabase incompleta.");
      setError(`Não é possível buscar palavras. ${currentConfigError.join(' ')}`);
      return;
    }

    setCurrentScreen(GameScreenState.LoadingWords);
    setError(prevError => (prevError && (prevError.includes("VITE_GEMINI_API_KEY") || prevError.includes("Supabase"))) ? prevError : null);

    try {
      const categoryIds = selectedCategories.map(c => c.id);
      console.log(`Fetching initial words for categories: ${categoryIds.join(', ')} with difficulty: ${difficulty.id}`);
      const fetchedWords = await fetchWordsForCategories(categoryIds, difficulty.id, INITIAL_WORDS_COUNT);
      
      if (fetchedWords.length === 0) {
         if (!error || (!error.includes("VITE_GEMINI_API_KEY") && !error.includes("Supabase"))) { 
          setError("Não foi possível buscar palavras. Tente categorias diferentes, ajuste a dificuldade, ou verifique as configurações.");
        }
        setCurrentScreen(GameScreenState.CategorySelection);
        return;
      }

      const shuffledWords = [...fetchedWords].sort(() => Math.random() - 0.5);
      setWords(shuffledWords);
      setCurrentWordIndex(0);
      setScore(0);
      setTotalWordsShown(0);
      setSkippedWords(0);
      setGameId(prevId => prevId + 1); 
      setCurrentScreen(GameScreenState.Playing);
    } catch (err) {
      console.error("Error starting game:",err);
      if (err instanceof Error) {
         if (!error || (!error.includes("VITE_GEMINI_API_KEY") && !error.includes("Supabase"))) {
            setError(`Erro ao iniciar o jogo: ${err.message}`);
         }
      } else {
         if (!error || (!error.includes("VITE_GEMINI_API_KEY") && !error.includes("Supabase"))) {
            setError("Ocorreu um erro desconhecido ao buscar palavras.");
         }
      }
      setCurrentScreen(GameScreenState.CategorySelection);
    }
  }, [selectedCategories, apiKeyExists, supabaseConfigured, difficulty, error]);

  const advanceWord = useCallback(() => {
    const nextIndex = currentWordIndex + 1;
    setCurrentWordIndex(nextIndex);
    setTotalWordsShown(prev => prev + 1);

    if (words.length > 0 && words.length - nextIndex < WORDS_FETCH_THRESHOLD && !isFetchingMoreWords) {
        loadMoreWords();
    }
  }, [currentWordIndex, words, isFetchingMoreWords, loadMoreWords]);

  const handleCorrect = useCallback(() => {
    setScore(prevScore => prevScore + 1);
    advanceWord();
  }, [advanceWord]);

  const handleSkip = useCallback(() => {
    setSkippedWords(prev => prev + 1);
    advanceWord();
  }, [advanceWord]);

  const handleTimeUp = useCallback(async () => {
    // Save game session
    try {
      const accuracy = totalWordsShown > 0 ? (score / totalWordsShown) * 100 : 0;
      await saveGameSession({
        score,
        total_words: totalWordsShown,
        categories: selectedCategories.map(c => c.id),
        difficulty: difficulty.id,
        duration: gameDuration,
        accuracy: Math.round(accuracy * 100) / 100
      });
    } catch (error) {
      console.warn('Failed to save game session:', error);
    }
    
    setCurrentScreen(GameScreenState.Score);
  }, [score, totalWordsShown, selectedCategories, difficulty, gameDuration]);

  const handlePlayAgain = useCallback(() => {
    setWords([]);
    setCurrentWordIndex(0);
    setScore(0);
    setTotalWordsShown(0);
    setSkippedWords(0);
    setError(prevError => (prevError && (prevError.includes("VITE_GEMINI_API_KEY") || prevError.includes("Supabase"))) ? prevError : null);
    setCurrentScreen(GameScreenState.CategorySelection);
  }, []);

  const handleNavigateToCategories = () => {
    setCurrentScreen(GameScreenState.CategorySelection);
  };

  const handlePasswordModal = () => {
    // Save the previous screen to return to after database population
    const previousScreen = currentScreen;
    
    // Navigate to category selection where the password modal is handled
    setCurrentScreen(GameScreenState.CategorySelection);
    
    // Use a timeout to ensure the screen has changed before trying to access DOM
    setTimeout(() => {
      // Find and click the "Gerar Palavras" button programmatically
      const generateWordsBtn = document.querySelector('[title="Gerar palavras para o banco de dados"]');
      if (generateWordsBtn instanceof HTMLElement) {
        generateWordsBtn.click();
      }
    }, 100);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case GameScreenState.Welcome:
        return (
          <WelcomeScreen
            onStartGame={handleNavigateToCategories}
            onNavigateToConfiguration={handleNavigateToConfiguration}
            onNavigateToStatistics={handleNavigateToStatistics}
            onGenerateWords={handlePasswordModal}
            apiKeyExists={apiKeyExists}
            supabaseConfigured={supabaseConfigured}
          />
        );
      case GameScreenState.CategorySelection:
        return (
          <CategorySelectionScreen
            categories={AVAILABLE_CATEGORIES}
            selectedCategories={selectedCategories}
            onSelectCategory={handleCategoriesSelect}
            onStartGame={handleStartGame}
            onNavigateToConfiguration={handleNavigateToConfiguration}
            onNavigateToStatistics={handleNavigateToStatistics}
            error={error}
            apiKeyExists={apiKeyExists}
            supabaseConfigured={supabaseConfigured}
          />
        );
      case GameScreenState.Configuration:
        return (
          <ConfigurationScreen
            currentDuration={gameDuration}
            currentDifficulty={difficulty}
            onSave={handleConfigurationSave}
            timeOptions={TIME_OPTIONS}
            difficulties={DIFFICULTIES}
          />
        );
      case GameScreenState.LoadingWords:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-slate-100 p-4">
            <LoadingSpinner />
            <p className="mt-6 text-2xl font-semibold">Buscando palavras {difficulty.name.toLowerCase()}...</p>
            {error && (error.includes("VITE_GEMINI_API_KEY") || error.includes("Supabase")) &&
              <p className="mt-4 text-yellow-300 bg-yellow-900/70 p-3 rounded-lg text-sm shadow-md">{error}</p>
            }
             {error && (!error.includes("VITE_GEMINI_API_KEY") && !error.includes("Supabase")) &&
              <p className="mt-4 text-red-300 bg-red-900/70 p-3 rounded-lg text-sm shadow-md">{error}</p>
            }
          </div>
        );
      case GameScreenState.Playing:
        const wordForGameScreen = currentWordIndex < words.length ? words[currentWordIndex] : null;
        const hasWordsCurrently = currentWordIndex < words.length;

        return (
          <GameScreen
            key={gameId} 
            wordToDisplay={wordForGameScreen}
            onCorrect={handleCorrect}
            onSkip={handleSkip}
            onTimeUp={handleTimeUp}
            duration={gameDuration}
            isFetchingMoreWords={isFetchingMoreWords}
            hasWords={hasWordsCurrently}
          />
        );
      case GameScreenState.Score:
        const accuracy = totalWordsShown > 0 ? (score / totalWordsShown) * 100 : 0;
        return (
          <ScoreScreen 
            score={score} 
            totalWords={totalWordsShown}
            skippedWords={skippedWords}
            accuracy={accuracy}
            onPlayAgain={handlePlayAgain} 
          />
        );
      case GameScreenState.Statistics:
        return <StatisticsScreen onBack={() => setCurrentScreen(GameScreenState.CategorySelection)} />;
      default:
        return <p className="text-xl text-red-400">Estado desconhecido do jogo. Por favor, recarregue.</p>;
    }
  };

  return (
    <div className="min-h-screen min-h-[100vh] min-h-[100dvh] w-full h-full flex flex-col items-center justify-center p-4 overflow-y-auto no-overscroll scrollbar-hide">
      {/* Status de conectividade */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white text-center py-2 px-4 text-sm z-40">
          📵 Modo offline - Algumas funcionalidades podem estar limitadas
        </div>
      )}
      
      {/* Notificação de atualização disponível */}
      {isUpdateAvailable && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 px-4 text-sm z-40">
          🆕 Nova versão disponível! 
          <button 
            onClick={updateApp}
            className="ml-2 underline hover:no-underline"
          >
            Atualizar agora
          </button>
        </div>
      )}
      
      {renderScreen()}
      
      {/* Prompt de instalação PWA */}
      <PWAInstallPrompt />
    </div>
  );
};

export default App;