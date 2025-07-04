import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import WordRepetitionWarning from './components/WordRepetitionWarning';
import { fetchWordsForCategoriesOptimized, startGameSession, endGameSession, checkWordsHealthStatus } from './services/wordService'; 
import { isSupabaseConfigured as checkSupabaseConfig } from './services/supabaseClient';
import { saveGameSession } from './services/gameHistoryService';
import { usePWA, useOnlineStatus } from './hooks/usePWASimple';
import useLocalCache from './hooks/useLocalCache';

// Environment check (development only)
// const logEnvironmentOnce = (() => {
//   let logged = false;
//   return () => {
//     if (!logged && process.env.NODE_ENV === 'development') {
//       console.log("🔧 Environment Check:");
//       console.log("- VITE_OPENAI_API_KEY:", !!import.meta.env.VITE_OPENAI_API_KEY ? "✅ Configured" : "❌ Missing");
//       console.log("- VITE_SUPABASE_ANON_KEY:", !!import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Configured" : "❌ Missing");
//       console.log("- Supabase URL: https://ldujhtwxnbwqbchhchcf.supabase.co");
//       logged = true;
//     }
//   };
// })();

// Constants for word fetching
const INITIAL_WORDS_COUNT = 40;
const MORE_WORDS_COUNT = 25;
const WORDS_FETCH_THRESHOLD = 10;

const App: React.FC = () => {
  // Environment logging disabled for production
  // useEffect(() => {
  //   logEnvironmentOnce();
  // }, []);

  // PWA and connectivity hooks
  const { isUpdateAvailable, updateApp } = usePWA();
  const isOnline = useOnlineStatus();
  
  // Cache hook
  const { 
    status: cacheStatus, 
    preloadCategories, 
    isReady: cacheReady,
    hasWords: cacheHasWords,
    refreshStats
  } = useLocalCache();
  
  // Core game state
  const [currentScreen, setCurrentScreen] = useState<GameScreenState>(GameScreenState.Welcome);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingMoreWords, setIsFetchingMoreWords] = useState<boolean>(false);
  const [gameId, setGameId] = useState<number>(0);
  
  // Game session tracking
  const [totalWordsShown, setTotalWordsShown] = useState<number>(0);
  const [skippedWords, setSkippedWords] = useState<number>(0);

  // Word repetition warning state
  const [wordRepetitionWarning, setWordRepetitionWarning] = useState<{
    isVisible: boolean;
    riskLevel: 'baixo' | 'moderado' | 'alto' | 'critico';
    message: string;
    healthPercentage: number;
  } | null>(null);

  // Game settings
  const [gameDuration, setGameDuration] = useState<number>(GAME_DURATION_SECONDS);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    DIFFICULTIES.find(d => d.id === 'medio') || DIFFICULTIES[1]
  );

  // Configuration state - memoized for performance
  const { apiKeyExists, supabaseConfigured } = useMemo(() => {
    const apiKey = !!import.meta.env.VITE_OPENAI_API_KEY;
    const supabase = checkSupabaseConfig();
    return { apiKeyExists: apiKey, supabaseConfigured: supabase };
  }, []);

  // Can start game check - memoized
  const canStartGame = useMemo(() => {
    return apiKeyExists || supabaseConfigured || cacheHasWords;
  }, [apiKeyExists, supabaseConfigured, cacheHasWords]);

  // Error management with better logic
  useEffect(() => {
    if (!apiKeyExists && !supabaseConfigured && !cacheHasWords) {
      setError("Nenhuma fonte de palavras disponível. Configure OpenAI, Supabase ou ative o cache local.");
    } else if (error && (
      error.includes("VITE_OPENAI_API_KEY") || 
      error.includes("Supabase") ||
      error.includes("fonte de palavras")
    )) {
      setError(null);
    }
  }, [apiKeyExists, supabaseConfigured, cacheHasWords, error]);

  // Mobile viewport height fix - optimized
  useEffect(() => {
    // Mobile viewport height fix
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Set initial viewport height
    setViewportHeight();
    
    // Update on resize and orientation change
    const handleResize = () => {
      setViewportHeight();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Optimized word loading with cache priority
  const loadMoreWords = useCallback(async () => {
    if (isFetchingMoreWords || !selectedCategories.length || !canStartGame) return;

    console.log("🔄 Loading more words (difficulty:", difficulty.id, ")");
    setIsFetchingMoreWords(true);
    
    try {
      const categoryIds = selectedCategories.map(c => c.id);
      const newWords = await fetchWordsForCategoriesOptimized(categoryIds, difficulty.id, MORE_WORDS_COUNT);
      
      if (newWords.length > 0) {
        setWords(prevWords => {
          const uniqueNewWords = newWords.filter(word => !prevWords.includes(word));
          const updatedWords = [...prevWords, ...uniqueNewWords];
          console.log(`📦 Added ${uniqueNewWords.length} unique words (total: ${updatedWords.length})`);
          return updatedWords;
        });
        
        // Refresh cache stats if words were loaded
        refreshStats();
      }
    } catch (err) {
      console.error("❌ Error loading more words:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao buscar mais palavras";
      setError(`Erro ao buscar mais palavras: ${errorMessage}`);
    } finally {
      setIsFetchingMoreWords(false);
    }
  }, [selectedCategories, canStartGame, isFetchingMoreWords, difficulty, refreshStats]);

  // Categories selection with smart preloading
  const handleCategoriesSelect = useCallback((categories: Category[]) => {
    setSelectedCategories(categories);
    
    // Clear category-related errors
    if (error?.includes("selecione pelo menos uma categoria")) {
      setError(null);
    }
    
    // Smart preloading based on cache readiness
    if (categories.length > 0 && cacheReady) {
      const categoryIds = categories.map(c => c.id);
      preloadCategories(categoryIds).catch(err => 
        console.warn('⚠️  Background preload failed:', err)
      );
    }
  }, [error, cacheReady, preloadCategories]);

  // Navigation handlers - optimized
  const navigateToScreen = useCallback((screen: GameScreenState) => {
    setCurrentScreen(screen);
  }, []);

  const handleNavigateToConfiguration = useCallback(() => 
    navigateToScreen(GameScreenState.Configuration), [navigateToScreen]);
  
  const handleNavigateToStatistics = useCallback(() => 
    navigateToScreen(GameScreenState.Statistics), [navigateToScreen]);
  
  const handleNavigateToCategories = useCallback(() => 
    navigateToScreen(GameScreenState.CategorySelection), [navigateToScreen]);

  // Check words health and show warning if needed
  const checkAndShowRepetitionWarning = useCallback(() => {
    if (selectedCategories.length === 0 || currentScreen !== GameScreenState.Playing) {
      return;
    }

    const categoryIds = selectedCategories.map(c => c.id);
    const healthStatus = checkWordsHealthStatus(categoryIds, difficulty.id, 150);
    
    if (healthStatus.shouldWarnUser && !wordRepetitionWarning?.isVisible) {
      setWordRepetitionWarning({
        isVisible: true,
        riskLevel: healthStatus.riskLevel,
        message: healthStatus.message,
        healthPercentage: healthStatus.healthPercentage
      });
      console.log(`⚠️  Word repetition warning: ${healthStatus.riskLevel} (${healthStatus.healthPercentage.toFixed(1)}%)`);
    }
  }, [selectedCategories, difficulty, currentScreen, wordRepetitionWarning]);

  // Close repetition warning
  const handleCloseRepetitionWarning = useCallback(() => {
    setWordRepetitionWarning(prev => prev ? { ...prev, isVisible: false } : null);
  }, []);

  // Configuration save with validation
  const handleConfigurationSave = useCallback((newDuration: number, newDifficulty: Difficulty) => {
    setGameDuration(newDuration);
    setDifficulty(newDifficulty);
    setCurrentScreen(GameScreenState.CategorySelection);
    console.log(`⚙️  Settings updated: ${newDuration}s, ${newDifficulty.name}`);
  }, []);

  // Optimized game start logic
  const handleStartGame = useCallback(async () => {
    // Validation
    if (selectedCategories.length === 0) {
      setError("Por favor, selecione pelo menos uma categoria.");
      return;
    }
    
    if (!canStartGame) {
      setError("Não é possível iniciar o jogo. Configure uma fonte de palavras ou ative o cache local.");
      return;
    }

    setCurrentScreen(GameScreenState.LoadingWords);
    setError(null);

    try {
      const categoryIds = selectedCategories.map(c => c.id);
      console.log(`🎮 Starting game: ${categoryIds.join(', ')} | ${difficulty.id} | ${gameDuration}s`);
      
      // Inicia uma nova sessão para rastreamento de palavras recentes
      const sessionId = startGameSession(categoryIds, difficulty.id);
      console.log(`🔄 Session started: ${sessionId}`);
      
      const fetchedWords = await fetchWordsForCategoriesOptimized(categoryIds, difficulty.id, INITIAL_WORDS_COUNT);
      
      if (fetchedWords.length === 0) {
        throw new Error("Nenhuma palavra encontrada para essas categorias e dificuldade. Tente outras opções.");
      }

      // Optimized shuffle
      const shuffledWords = fetchedWords.sort(() => Math.random() - 0.5);
      
      // Reset game state
      setWords(shuffledWords);
      setCurrentWordIndex(0);
      setScore(0);
      setTotalWordsShown(0);
      setSkippedWords(0);
      setGameId(prevId => prevId + 1);
      
      setCurrentScreen(GameScreenState.Playing);
      console.log(`✅ Game started with ${shuffledWords.length} words`);
      
      // Refresh cache stats after successful load
      refreshStats();
      
    } catch (err) {
      console.error("❌ Game start failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao iniciar o jogo";
      setError(errorMessage);
      setCurrentScreen(GameScreenState.CategorySelection);
    }
  }, [selectedCategories, canStartGame, difficulty, gameDuration, refreshStats]);

  // Word advancement with smart prefetching
  const advanceWord = useCallback(() => {
    const nextIndex = currentWordIndex + 1;
    setCurrentWordIndex(nextIndex);
    setTotalWordsShown(prev => prev + 1);

    // Smart prefetching threshold
    const remainingWords = words.length - nextIndex;
    if (remainingWords < WORDS_FETCH_THRESHOLD && !isFetchingMoreWords) {
      console.log(`🔄 Prefetching more words (${remainingWords} remaining)`);
      loadMoreWords();
    }
  }, [currentWordIndex, words.length, isFetchingMoreWords, loadMoreWords]);

  // Game actions - optimized
  const handleCorrect = useCallback(() => {
    setScore(prevScore => prevScore + 1);
    advanceWord();
    
    // Verifica status das palavras após cada ação
    setTimeout(checkAndShowRepetitionWarning, 100);
  }, [advanceWord, checkAndShowRepetitionWarning]);

  const handleSkip = useCallback(() => {
    setSkippedWords(prev => prev + 1);
    advanceWord();
    
    // Verifica status das palavras após cada ação
    setTimeout(checkAndShowRepetitionWarning, 100);
  }, [advanceWord, checkAndShowRepetitionWarning]);

  // Game end with session saving
  const handleTimeUp = useCallback(async () => {
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
      console.log(`💾 Game session saved: ${score}/${totalWordsShown} (${accuracy.toFixed(1)}%)`);
    } catch (error) {
      console.warn('⚠️  Failed to save game session:', error);
    }
    
    // Finaliza a sessão de palavras recentes
    endGameSession();
    console.log('🏁 Game session ended');
    
    setCurrentScreen(GameScreenState.Score);
  }, [score, totalWordsShown, selectedCategories, difficulty, gameDuration]);

  // Play again with state reset
  const handlePlayAgain = useCallback(() => {
    setWords([]);
    setCurrentWordIndex(0);
    setScore(0);
    setTotalWordsShown(0);
    setSkippedWords(0);
    setError(null);
    setWordRepetitionWarning(null); // Limpa avisos de repetição
    setCurrentScreen(GameScreenState.CategorySelection);
    console.log("🔄 Game reset for new session");
  }, []);

  // Handle change category from warning
  const handleChangeCategoryFromWarning = useCallback(() => {
    // Fecha o aviso primeiro
    setWordRepetitionWarning(null);
    // Finaliza a sessão atual
    endGameSession();
    // Reinicia o jogo
    handlePlayAgain();
  }, [handlePlayAgain]);

  // Memoized derived values for performance
  const gameConfiguration = useMemo(() => {
    const timeOption = TIME_OPTIONS.find(t => t.value === gameDuration);
    return {
      timeDisplay: timeOption ? timeOption.name : `${gameDuration}s`,
      difficultyName: difficulty.name
    };
  }, [gameDuration, difficulty]);

  const currentWord = useMemo(() => {
    return currentWordIndex < words.length ? words[currentWordIndex] : null;
  }, [currentWordIndex, words]);

  const gameStats = useMemo(() => {
    const accuracy = totalWordsShown > 0 ? (score / totalWordsShown) * 100 : 0;
    return { accuracy };
  }, [score, totalWordsShown]);

  // Efeito para verificar status das palavras periodicamente durante o jogo
  useEffect(() => {
    if (currentScreen === GameScreenState.Playing && selectedCategories.length > 0) {
      // Verificação inicial
      const initialCheck = setTimeout(checkAndShowRepetitionWarning, 2000);
      
      // Verificação periódica a cada 30 segundos
      const interval = setInterval(checkAndShowRepetitionWarning, 30000);
      
      return () => {
        clearTimeout(initialCheck);
        clearInterval(interval);
      };
    }
  }, [currentScreen, selectedCategories, checkAndShowRepetitionWarning]);

  // Screen renderer with optimized loading states
  const renderScreen = () => {
    switch (currentScreen) {
      case GameScreenState.Welcome:
        return (
          <WelcomeScreen
            onStartGame={handleNavigateToCategories}
            onNavigateToConfiguration={handleNavigateToConfiguration}
            onNavigateToStatistics={handleNavigateToStatistics}
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
            apiKeyExists={apiKeyExists}
            supabaseConfigured={supabaseConfigured}
          />
        );

      case GameScreenState.LoadingWords:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-slate-100 p-4">
            <LoadingSpinner size="lg" />
            
            <div className="mt-8 text-center">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-lg">
                {cacheStatus.isInitialized && cacheHasWords ? "Carregando palavras..." : "Buscando palavras..."}
              </h2>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
              <div className="flex flex-col items-center bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 shadow-xl">
                <div className="text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide">
                  Dificuldade
                </div>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">
                  {gameConfiguration.difficultyName}
                </div>
              </div>
              
              <div className="flex flex-col items-center bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 shadow-xl">
                <div className="text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide">
                  Tempo da Partida
                </div>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 drop-shadow-sm">
                  {gameConfiguration.timeDisplay}
                </div>
              </div>
            </div>
            
            {cacheStatus.isInitialized && (
              <div className="mt-6 text-sm text-slate-300 bg-slate-800/60 backdrop-blur-sm border border-slate-600/40 p-4 rounded-xl shadow-lg">
                📦 Cache: {cacheStatus.totalCachedWords} palavras locais
                {cacheStatus.isPreloading && " • Atualizando..."}
              </div>
            )}
            
            {error && (
              <p className={`mt-4 p-4 rounded-xl text-sm shadow-lg ${
                error.includes("VITE_OPENAI_API_KEY") || error.includes("Supabase") 
                  ? "text-yellow-300 bg-yellow-900/80 border border-yellow-600/40" 
                  : "text-red-300 bg-red-900/80 border border-red-600/40"
              } backdrop-blur-sm`}>
                {error}
              </p>
            )}
          </div>
        );

      case GameScreenState.Playing:
        return (
          <GameScreen
            key={gameId}
            wordToDisplay={currentWord}
            onCorrect={handleCorrect}
            onSkip={handleSkip}
            onTimeUp={handleTimeUp}
            duration={gameDuration}
            isFetchingMoreWords={isFetchingMoreWords}
            hasWords={currentWordIndex < words.length}
          />
        );

      case GameScreenState.Score:
        return (
          <ScoreScreen 
            score={score} 
            totalWords={totalWordsShown}
            skippedWords={skippedWords}
            accuracy={gameStats.accuracy}
            onPlayAgain={handlePlayAgain} 
          />
        );

      case GameScreenState.Statistics:
        return (
          <StatisticsScreen 
            onBack={handleNavigateToCategories} 
          />
        );

      default:
        return (
          <div className="text-xl text-red-400 text-center p-8">
            Estado desconhecido do jogo. 
            <button 
              onClick={handleNavigateToCategories}
              className="block mt-4 text-blue-400 underline hover:no-underline"
            >
              Voltar ao início
            </button>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
        {/* Connectivity status */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white text-center py-2 px-4 text-sm z-40">
            📵 Modo offline
            {cacheHasWords && " • Cache ativo"}
          </div>
        )}
        
        {/* Update notification */}
        {isUpdateAvailable && (
          <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 px-4 text-sm z-40">
            🆕 Nova versão disponível! 
            <button 
              onClick={updateApp}
              className="ml-2 underline hover:no-underline"
            >
              Atualizar
            </button>
          </div>
        )}
        
        {renderScreen()}
        
        {/* Word Repetition Warning */}
        {wordRepetitionWarning && (
          <WordRepetitionWarning
            riskLevel={wordRepetitionWarning.riskLevel}
            message={wordRepetitionWarning.message}
            healthPercentage={wordRepetitionWarning.healthPercentage}
            isVisible={wordRepetitionWarning.isVisible}
            onClose={handleCloseRepetitionWarning}
            onChangeCategory={handleChangeCategoryFromWarning}
          />
        )}
        
        {/* PWA Install prompt */}
        <PWAInstallPrompt />
    </div>
  );
};

export default App;
