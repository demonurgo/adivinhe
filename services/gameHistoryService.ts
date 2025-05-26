import { supabase } from './supabaseClient';

export interface GameSession {
  id?: string;
  score: number;
  total_words: number;
  categories: string[];
  difficulty: 'facil' | 'medio' | 'dificil';
  duration: number;
  accuracy: number; // percentage
  created_at: string;
  user_id?: string;
}

export interface GameStatistics {
  total_games: number;
  total_score: number;
  average_score: number;
  best_score: number;
  total_words_played: number;
  overall_accuracy: number;
  favorite_category: string;
  games_by_difficulty: {
    facil: number;
    medio: number;
    dificil: number;
  };
  recent_games: GameSession[];
}

// Local storage key for game history
const GAME_HISTORY_KEY = 'adivinhe_game_history';
const MAX_LOCAL_GAMES = 100; // Maximum games to store locally

/**
 * Save a game session to both Supabase and local storage
 */
export async function saveGameSession(session: Omit<GameSession, 'id' | 'created_at'>): Promise<GameSession> {
  const gameSession: GameSession = {
    ...session,
    created_at: new Date().toISOString(),
  };

  // Try to save to Supabase first
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert([gameSession])
      .select()
      .single();

    if (error) {
      console.warn('Failed to save to Supabase:', error);
      // Fall back to local storage
      saveToLocalStorage(gameSession);
      return gameSession;
    }

    // Also save to local storage as backup
    saveToLocalStorage(data);
    return data;
  } catch (error) {
    console.warn('Supabase not available, saving to local storage:', error);
    saveToLocalStorage(gameSession);
    return gameSession;
  }
}

/**
 * Get game statistics from both Supabase and local storage
 */
export async function getGameStatistics(): Promise<GameStatistics> {
  let allGames: GameSession[] = [];

  // Try to get from Supabase first
  try {
    const { data: supabaseGames, error } = await supabase
      .from('game_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && supabaseGames) {
      allGames = supabaseGames;
    }
  } catch (error) {
    console.warn('Failed to fetch from Supabase:', error);
  }

  // Get local games and merge (avoid duplicates)
  const localGames = getFromLocalStorage();
  const uniqueLocalGames = localGames.filter(
    localGame => !allGames.some(game => 
      game.created_at === localGame.created_at && 
      game.score === localGame.score
    )
  );

  allGames = [...allGames, ...uniqueLocalGames].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return calculateStatistics(allGames);
}

/**
 * Get recent game sessions
 */
export async function getRecentGames(limit: number = 10): Promise<GameSession[]> {
  const stats = await getGameStatistics();
  return stats.recent_games.slice(0, limit);
}

/**
 * Save game session to local storage
 */
function saveToLocalStorage(session: GameSession): void {
  try {
    const existing = getFromLocalStorage();
    const updated = [session, ...existing].slice(0, MAX_LOCAL_GAMES);
    localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save to local storage:', error);
  }
}

/**
 * Get game sessions from local storage
 */
function getFromLocalStorage(): GameSession[] {
  try {
    const stored = localStorage.getItem(GAME_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to read from local storage:', error);
    return [];
  }
}

/**
 * Calculate comprehensive statistics from game sessions
 */
function calculateStatistics(games: GameSession[]): GameStatistics {
  if (games.length === 0) {
    return {
      total_games: 0,
      total_score: 0,
      average_score: 0,
      best_score: 0,
      total_words_played: 0,
      overall_accuracy: 0,
      favorite_category: '',
      games_by_difficulty: {
        facil: 0,
        medio: 0,
        dificil: 0,
      },
      recent_games: [],
    };
  }

  const total_games = games.length;
  const total_score = games.reduce((sum, game) => sum + game.score, 0);
  const average_score = total_score / total_games;
  const best_score = Math.max(...games.map(game => game.score));
  const total_words_played = games.reduce((sum, game) => sum + game.total_words, 0);
  
  // Calculate overall accuracy
  const total_accuracy = games.reduce((sum, game) => sum + (game.accuracy || 0), 0);
  const overall_accuracy = total_accuracy / total_games;

  // Find favorite category
  const categoryCount: Record<string, number> = {};
  games.forEach(game => {
    game.categories.forEach(category => {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });
  const favorite_category = Object.keys(categoryCount).reduce(
    (a, b) => (categoryCount[a] || 0) > (categoryCount[b] || 0) ? a : b,
    ''
  );

  // Count games by difficulty
  const games_by_difficulty = {
    facil: games.filter(g => g.difficulty === 'facil').length,
    medio: games.filter(g => g.difficulty === 'medio').length,
    dificil: games.filter(g => g.difficulty === 'dificil').length,
  };

  return {
    total_games,
    total_score,
    average_score: Math.round(average_score * 100) / 100,
    best_score,
    total_words_played,
    overall_accuracy: Math.round(overall_accuracy * 100) / 100,
    favorite_category,
    games_by_difficulty,
    recent_games: games.slice(0, 20),
  };
}

/**
 * Clear all game history (useful for testing or reset)
 */
export async function clearGameHistory(): Promise<void> {
  try {
    // Clear from Supabase
    await supabase.from('game_sessions').delete().neq('id', '');
  } catch (error) {
    console.warn('Failed to clear Supabase history:', error);
  }

  // Clear local storage
  localStorage.removeItem(GAME_HISTORY_KEY);
}

/**
 * Export game history as JSON for backup
 */
export async function exportGameHistory(): Promise<string> {
  const stats = await getGameStatistics();
  return JSON.stringify(stats.recent_games, null, 2);
}
