// services/recentWordsManager.ts
// Gerenciador para prevenir repetição de palavras em sessões consecutivas

interface RecentWord {
  texto: string;
  categoria: string;
  dificuldade: string;
  usedAt: number; // timestamp
  sessionId?: string;
}

interface SessionInfo {
  sessionId: string;
  startTime: number;
  categories: string[];
  difficulty: string;
  wordsUsed: RecentWord[];
}

class RecentWordsManager {
  private static instance: RecentWordsManager;
  private readonly STORAGE_KEY = 'adivinhe_recent_words';
  private readonly SESSION_KEY = 'adivinhe_current_session';
  private readonly COOLDOWN_HOURS = 2; // Tempo em horas que uma palavra fica "bloqueada"
  private readonly MAX_RECENT_WORDS = 200; // Máximo de palavras recentes para manter
  private readonly MAX_SESSIONS = 10; // Máximo de sessões para manter histórico

  private recentWords: RecentWord[] = [];
  private sessions: SessionInfo[] = [];
  private currentSession: SessionInfo | null = null;

  public static getInstance(): RecentWordsManager {
    if (!RecentWordsManager.instance) {
      RecentWordsManager.instance = new RecentWordsManager();
    }
    return RecentWordsManager.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.cleanupExpiredWords();
  }

  /**
   * Inicia uma nova sessão de jogo
   */
  public startNewSession(categories: string[], difficulty: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      categories,
      difficulty,
      wordsUsed: []
    };

    console.log(`🎮 Nova sessão iniciada: ${sessionId} (${categories.join(', ')}, ${difficulty})`);
    this.saveToStorage();
    return sessionId;
  }

  /**
   * Marca uma palavra como usada na sessão atual
   */
  public markWordAsUsed(texto: string, categoria: string, dificuldade: string): void {
    const now = Date.now();
    const recentWord: RecentWord = {
      texto,
      categoria,
      dificuldade,
      usedAt: now,
      sessionId: this.currentSession?.sessionId
    };

    // Adiciona à lista de palavras recentes
    this.recentWords.push(recentWord);

    // Adiciona à sessão atual se existir
    if (this.currentSession) {
      this.currentSession.wordsUsed.push(recentWord);
    }

    // Limita o tamanho da lista
    if (this.recentWords.length > this.MAX_RECENT_WORDS) {
      this.recentWords = this.recentWords.slice(-this.MAX_RECENT_WORDS);
    }

    this.saveToStorage();
    console.log(`📝 Palavra marcada como usada: "${texto}" (${categoria}/${dificuldade})`);
  }

  /**
   * Finaliza a sessão atual
   */
  public endCurrentSession(): void {
    if (this.currentSession) {
      this.sessions.push({ ...this.currentSession });
      
      // Limita o número de sessões
      if (this.sessions.length > this.MAX_SESSIONS) {
        this.sessions = this.sessions.slice(-this.MAX_SESSIONS);
      }
      
      console.log(`🏁 Sessão finalizada: ${this.currentSession.sessionId} (${this.currentSession.wordsUsed.length} palavras usadas)`);
      this.currentSession = null;
      this.saveToStorage();
    }
  }

  /**
   * Verifica se uma palavra foi usada recentemente
   */
  public isWordRecentlyUsed(texto: string, categoria: string, dificuldade: string): boolean {
    const now = Date.now();
    const cooldownMs = this.COOLDOWN_HOURS * 60 * 60 * 1000;

    const recentlyUsed = this.recentWords.some(word => 
      word.texto.toLowerCase() === texto.toLowerCase() &&
      word.categoria === categoria &&
      word.dificuldade === dificuldade &&
      (now - word.usedAt) < cooldownMs
    );

    if (recentlyUsed) {
      console.log(`⚠️  Palavra "${texto}" foi usada recentemente, bloqueada por cooldown`);
    }

    return recentlyUsed;
  }

  /**
   * Filtra uma lista de palavras removendo as que foram usadas recentemente
   */
  public filterRecentWords(words: Array<{texto: string, categoria: string, dificuldade: string}>): Array<{texto: string, categoria: string, dificuldade: string}> {
    const filtered = words.filter(word => 
      !this.isWordRecentlyUsed(word.texto, word.categoria, word.dificuldade)
    );

    const removedCount = words.length - filtered.length;
    if (removedCount > 0) {
      console.log(`🚫 Filtradas ${removedCount} palavras recentemente usadas de ${words.length} palavras`);
    }

    return filtered;
  }

  /**
   * Obtem palavras da sessão atual (para debugging)
   */
  public getCurrentSessionWords(): RecentWord[] {
    return this.currentSession?.wordsUsed || [];
  }

  /**
   * Obtem todas as palavras recentes não expiradas
   */
  public getRecentWords(): RecentWord[] {
    const now = Date.now();
    const cooldownMs = this.COOLDOWN_HOURS * 60 * 60 * 1000;
    
    return this.recentWords.filter(word => (now - word.usedAt) < cooldownMs);
  }

  /**
   * Calcula a "saúde" das palavras disponíveis para uma categoria/dificuldade
   * Retorna informações sobre quantas palavras estão bloqueadas
   */
  public getWordsHealthStatus(
    categories: string[], 
    difficulty: string, 
    totalAvailableWords: number = 100
  ): {
    healthPercentage: number;
    blockedCount: number;
    totalRecentWords: number;
    riskLevel: 'baixo' | 'moderado' | 'alto' | 'critico';
    shouldWarnUser: boolean;
    message: string;
  } {
    const now = Date.now();
    const cooldownMs = this.COOLDOWN_HOURS * 60 * 60 * 1000;
    
    // Conta palavras bloqueadas para as categorias/dificuldade específicas
    const blockedWords = this.recentWords.filter(word => 
      categories.includes(word.categoria) &&
      word.dificuldade === difficulty &&
      (now - word.usedAt) < cooldownMs
    );
    
    const blockedCount = blockedWords.length;
    const healthPercentage = Math.max(0, Math.min(100, ((totalAvailableWords - blockedCount) / totalAvailableWords) * 100));
    
    let riskLevel: 'baixo' | 'moderado' | 'alto' | 'critico' = 'baixo';
    let shouldWarnUser = false;
    let message = '';
    
    if (healthPercentage <= 5) {
      riskLevel = 'critico';
      shouldWarnUser = true;
      message = 'Quase todas as palavras foram usadas recentemente! Troque de categoria para evitar repetições.';
    } else if (healthPercentage <= 15) {
      riskLevel = 'alto';
      shouldWarnUser = true;
      message = 'Poucas palavras novas restantes. Considere trocar de categoria ou dificuldade.';
    } else if (healthPercentage <= 30) {
      riskLevel = 'moderado';
      shouldWarnUser = true;
      message = 'As palavras podem começar a se repetir em breve. Que tal tentar outra categoria?';
    }
    
    return {
      healthPercentage,
      blockedCount,
      totalRecentWords: this.recentWords.length,
      riskLevel,
      shouldWarnUser,
      message
    };
  }

  /**
   * Obtem estatísticas do gerenciador
   */
  public getStatistics() {
    const recentWords = this.getRecentWords();
    const currentSessionWords = this.getCurrentSessionWords();
    
    return {
      totalRecentWords: recentWords.length,
      currentSessionWords: currentSessionWords.length,
      totalSessions: this.sessions.length,
      cooldownHours: this.COOLDOWN_HOURS,
      oldestRecentWord: recentWords.length > 0 ? 
        new Date(Math.min(...recentWords.map(w => w.usedAt))) : null,
      currentSession: this.currentSession ? {
        id: this.currentSession.sessionId,
        duration: Date.now() - this.currentSession.startTime,
        categories: this.currentSession.categories,
        difficulty: this.currentSession.difficulty
      } : null
    };
  }

  /**
   * Limpa palavras expiradas
   */
  public cleanupExpiredWords(): number {
    const now = Date.now();
    const cooldownMs = this.COOLDOWN_HOURS * 60 * 60 * 1000;
    
    const initialCount = this.recentWords.length;
    this.recentWords = this.recentWords.filter(word => (now - word.usedAt) < cooldownMs);
    
    const removedCount = initialCount - this.recentWords.length;
    if (removedCount > 0) {
      console.log(`🧹 Limpeza: ${removedCount} palavras expiradas removidas`);
      this.saveToStorage();
    }
    
    return removedCount;
  }

  /**
   * Reset completo (para debugging/desenvolvimento)
   */
  public resetAll(): void {
    this.recentWords = [];
    this.sessions = [];
    this.currentSession = null;
    this.saveToStorage();
    console.log("🔄 Reset completo do gerenciador de palavras recentes");
  }

  /**
   * Força limpeza de palavras específicas (para debugging)
   */
  public removeWordFromRecent(texto: string): boolean {
    const initialLength = this.recentWords.length;
    this.recentWords = this.recentWords.filter(word => 
      word.texto.toLowerCase() !== texto.toLowerCase()
    );
    
    const removed = initialLength !== this.recentWords.length;
    if (removed) {
      this.saveToStorage();
      console.log(`🗑️  Palavra "${texto}" removida das palavras recentes`);
    }
    
    return removed;
  }

  /**
   * Carrega dados do localStorage
   */
  private loadFromStorage(): void {
    try {
      const recentWordsData = localStorage.getItem(this.STORAGE_KEY);
      if (recentWordsData) {
        this.recentWords = JSON.parse(recentWordsData);
      }

      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (sessionData) {
        const sessionInfo = JSON.parse(sessionData);
        this.sessions = sessionInfo.sessions || [];
        this.currentSession = sessionInfo.currentSession || null;
      }

      console.log(`📦 Carregadas ${this.recentWords.length} palavras recentes do localStorage`);
    } catch (error) {
      console.warn("⚠️  Erro ao carregar dados do localStorage:", error);
      this.recentWords = [];
      this.sessions = [];
      this.currentSession = null;
    }
  }

  /**
   * Salva dados no localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.recentWords));
      localStorage.setItem(this.SESSION_KEY, JSON.stringify({
        sessions: this.sessions,
        currentSession: this.currentSession
      }));
    } catch (error) {
      console.warn("⚠️  Erro ao salvar no localStorage:", error);
    }
  }
}

export default RecentWordsManager;