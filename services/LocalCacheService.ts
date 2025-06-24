// services/LocalCacheService.ts
import { getSupabaseClient, WordRow, isSupabaseConfigured } from './supabaseClient';
import RecentWordsManager from './recentWordsManager';

interface CachedWord {
  id: string;
  texto: string;
  categoria: string;
  dificuldade: string;
  total_utilizacoes: number;
  ultima_utilizacao?: string;
  cached_at: number;
  score?: number;
}

interface CacheStats {
  categoria: string;
  dificuldade: string;
  count: number;
  lastSync: number;
  version: number;
}

interface CacheConfiguration {
  CACHE_EXPIRY: number;
  MIN_WORDS_PER_CATEGORY: number;
  IDEAL_WORDS_PER_CATEGORY: number;
  MAX_WORDS_PER_CATEGORY: number;
}

export class LocalCacheService {
  private static instance: LocalCacheService;
  private dbName = 'AdivinheJaLocalCache';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;
  
  // Cache em memória para acesso instantâneo
  private memoryCache: Map<string, CachedWord[]> = new Map();
  private cacheStats: Map<string, CacheStats> = new Map();
  private isInitialized = false;
  
  private config: CacheConfiguration = {
    CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
    MIN_WORDS_PER_CATEGORY: 15,
    IDEAL_WORDS_PER_CATEGORY: 50,
    MAX_WORDS_PER_CATEGORY: 100,
  };
  
  public static getInstance(): LocalCacheService {
    if (!LocalCacheService.instance) {
      LocalCacheService.instance = new LocalCacheService();
    }
    return LocalCacheService.instance;
  }
  
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      await this.initIndexedDB();
      await this.loadMemoryCache();
      this.isInitialized = true;
      console.log('✅ LocalCacheService initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize LocalCacheService:', error);
      return false;
    }
  }
  
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store para palavras
        if (!db.objectStoreNames.contains('words')) {
          const wordsStore = db.createObjectStore('words', { keyPath: 'id' });
          wordsStore.createIndex('categoria_dificuldade', ['categoria', 'dificuldade']);
          wordsStore.createIndex('categoria', 'categoria');
          wordsStore.createIndex('cached_at', 'cached_at');
          wordsStore.createIndex('score', 'score');
        }
        
        // Store para estatísticas de cache
        if (!db.objectStoreNames.contains('cache_stats')) {
          db.createObjectStore('cache_stats', { keyPath: ['categoria', 'dificuldade'] });
        }
        
        // Store para configurações
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }
      };
    });
  }
  
  private async loadMemoryCache(): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['words', 'cache_stats'], 'readonly');
    
    try {
      // Carrega palavras
      const wordsStore = transaction.objectStore('words');
      const wordsRequest = wordsStore.getAll();
      
      const words = await new Promise<CachedWord[]>((resolve, reject) => {
        wordsRequest.onsuccess = () => resolve(wordsRequest.result);
        wordsRequest.onerror = () => reject(wordsRequest.error);
      });
      
      // Organiza por categoria_dificuldade
      words.forEach(word => {
        const key = `${word.categoria}_${word.dificuldade}`;
        if (!this.memoryCache.has(key)) {
          this.memoryCache.set(key, []);
        }
        this.memoryCache.get(key)!.push(word);
      });
      
      // Carrega estatísticas
      const statsStore = transaction.objectStore('cache_stats');
      const statsRequest = statsStore.getAll();
      
      const stats = await new Promise<CacheStats[]>((resolve, reject) => {
        statsRequest.onsuccess = () => resolve(statsRequest.result);
        statsRequest.onerror = () => reject(statsRequest.error);
      });
      
      stats.forEach(stat => {
        const key = `${stat.categoria}_${stat.dificuldade}`;
        this.cacheStats.set(key, stat);
      });
      
      console.log(`📦 Loaded ${words.length} words into memory cache from IndexedDB`);
      
    } catch (error) {
      console.error('Error loading memory cache:', error);
    }
  }
  
  // Método principal: busca palavras local-first com filtro de repetição
  async getWords(
    categorias: string[], 
    dificuldade: string, 
    quantidade: number = 10
  ): Promise<CachedWord[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const recentWordsManager = RecentWordsManager.getInstance();
    const todasPalavras: CachedWord[] = [];
    
    // Coleta palavras de todas as categorias solicitadas
    for (const categoria of categorias) {
      const key = `${categoria}_${dificuldade}`;
      
      if (await this.hasEnoughWords(categoria, dificuldade)) {
        // Busca do cache local
        const palavrasCategoria = this.memoryCache.get(key) || [];
        todasPalavras.push(...palavrasCategoria);
      } else {
        // Cache miss - busca do Supabase e armazena
        console.log(`🔄 Cache miss para ${categoria}/${dificuldade}, buscando do Supabase...`);
        const palavrasBuscadas = await this.fetchAndCache(categoria, dificuldade);
        todasPalavras.push(...palavrasBuscadas);
      }
    }
    
    // Filtra palavras recentemente usadas
    const palavrasNaoRecentes = recentWordsManager.filterRecentWords(
      todasPalavras.map(p => ({ texto: p.texto, categoria: p.categoria, dificuldade: p.dificuldade }))
    );
    
    // Reconstroi a lista com as palavras filtradas
    const palavrasFiltradas = todasPalavras.filter(palavra => 
      palavrasNaoRecentes.some(nr => nr.texto === palavra.texto && nr.categoria === palavra.categoria)
    );
    
    if (palavrasFiltradas.length < quantidade) {
      console.log(`⚠️  Cache com poucas palavras não-recentes: ${palavrasFiltradas.length}/${quantidade}`);
    }
    
    // Aplica aleatoriedade inteligente
    return this.selectRandomWords(palavrasFiltradas, quantidade);
  }
  
  private async hasEnoughWords(categoria: string, dificuldade: string): Promise<boolean> {
    const key = `${categoria}_${dificuldade}`;
    const cachedWords = this.memoryCache.get(key) || [];
    
    // Verifica quantidade mínima
    if (cachedWords.length < this.config.MIN_WORDS_PER_CATEGORY) {
      return false;
    }
    
    // Verifica se o cache não expirou
    const stats = this.cacheStats.get(key);
    if (!stats || Date.now() - stats.lastSync > this.config.CACHE_EXPIRY) {
      return false;
    }
    
    return true;
  }
  
  private async fetchAndCache(categoria: string, dificuldade: string): Promise<CachedWord[]> {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot fetch words');
      return [];
    }
    
    try {
      const fetchLimit = this.config.IDEAL_WORDS_PER_CATEGORY;
      
      const { data, error } = await supabase
        .from('palavras')
        .select('id, texto, ultima_utilizacao, total_utilizacoes')
        .eq('dificuldade', dificuldade)
        .eq('categoria', categoria)
        .order('total_utilizacoes', { ascending: true })
        .order('ultima_utilizacao', { ascending: true, nullsFirst: true })
        .limit(fetchLimit);
      
      if (error) {
        console.error('Error fetching from Supabase:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.warn(`No words found for ${categoria}/${dificuldade}`);
        return [];
      }
      
      // Converte para CachedWord e armazena
      const cachedWords: CachedWord[] = data.map(word => ({
        id: word.id,
        texto: word.texto,
        categoria,
        dificuldade,
        total_utilizacoes: word.total_utilizacoes || 0,
        ultima_utilizacao: word.ultima_utilizacao,
        cached_at: Date.now()
      }));
      
      // Armazena no cache
      await this.storeWordsInCache(categoria, dificuldade, cachedWords);
      
      // Atualiza memória
      const key = `${categoria}_${dificuldade}`;
      this.memoryCache.set(key, cachedWords);
      
      console.log(`💾 Cached ${cachedWords.length} words for ${categoria}/${dificuldade}`);
      
      return cachedWords;
      
    } catch (error) {
      console.error('Error in fetchAndCache:', error);
      return [];
    }
  }
  
  private async storeWordsInCache(categoria: string, dificuldade: string, words: CachedWord[]): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['words', 'cache_stats'], 'readwrite');
    
    try {
      const wordsStore = transaction.objectStore('words');
      const statsStore = transaction.objectStore('cache_stats');
      
      // Remove palavras antigas dessa categoria/dificuldade
      const index = wordsStore.index('categoria_dificuldade');
      const oldWordsRequest = index.getAll([categoria, dificuldade]);
      
      oldWordsRequest.onsuccess = () => {
        const oldWords = oldWordsRequest.result;
        oldWords.forEach(word => {
          wordsStore.delete(word.id);
        });
        
        // Adiciona novas palavras
        words.forEach(word => {
          wordsStore.put(word);
        });
        
        // Atualiza estatísticas
        const stats: CacheStats = {
          categoria,
          dificuldade,
          count: words.length,
          lastSync: Date.now(),
          version: 1
        };
        
        statsStore.put(stats);
        this.cacheStats.set(`${categoria}_${dificuldade}`, stats);
      };
      
    } catch (error) {
      console.error('Error storing words in cache:', error);
    }
  }
  
  private selectRandomWords(palavras: CachedWord[], quantidade: number): CachedWord[] {
    if (palavras.length === 0) return [];
    
    const now = Date.now();
    
    // Calcula scores para aleatoriedade inteligente
    const palavrasComScore = palavras.map(palavra => {
      let score = 100; // Score base
      
      // Penaliza palavras muito usadas
      score -= palavra.total_utilizacoes * 5;
      
      // Penaliza palavras usadas recentemente
      if (palavra.ultima_utilizacao) {
        const lastUsed = new Date(palavra.ultima_utilizacao).getTime();
        const hoursSinceLastUse = (now - lastUsed) / (1000 * 60 * 60);
        
        if (hoursSinceLastUse < 24) score -= 30;
        else if (hoursSinceLastUse < 168) score -= 10;
      }
      
      return {
        ...palavra,
        score: Math.max(score, 1) // Score mínimo 1
      };
    });
    
    // Seleciona com peso baseado no score
    const selected: CachedWord[] = [];
    const available = [...palavrasComScore];
    
    for (let i = 0; i < quantidade && available.length > 0; i++) {
      const totalScore = available.reduce((sum, p) => sum + p.score!, 0);
      let random = Math.random() * totalScore;
      
      let selectedIndex = 0;
      for (let j = 0; j < available.length; j++) {
        random -= available[j].score!;
        if (random <= 0) {
          selectedIndex = j;
          break;
        }
      }
      
      selected.push(available[selectedIndex]);
      available.splice(selectedIndex, 1);
    }
    
    return selected;
  }
  
  // Marca palavra como utilizada
  async markWordAsUsed(wordId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const recentWordsManager = RecentWordsManager.getInstance();
    
    if (!supabase || !isSupabaseConfigured()) return;
    
    try {
      const now = new Date().toISOString();
      
      // Primeiro busca a palavra completa
      const { data: currentWord } = await supabase
        .from('palavras')
        .select('id, texto, categoria, dificuldade, total_utilizacoes')
        .eq('id', wordId)
        .single();
      
      if (!currentWord) {
        console.warn(`Palavra com ID ${wordId} não encontrada`);
        return;
      }
      
      // Incrementa o total
      const newTotal = (currentWord.total_utilizacoes || 0) + 1;
      
      await supabase
        .from('palavras')
        .update({
          ultima_utilizacao: now,
          total_utilizacoes: newTotal,
          updated_at: now
        })
        .eq('id', wordId);
      
      // Marca no gerenciador de palavras recentes
      recentWordsManager.markWordAsUsed(
        currentWord.texto, 
        currentWord.categoria, 
        currentWord.dificuldade
      );
      
      // Atualiza cache em memória
      for (const [key, words] of this.memoryCache.entries()) {
        const wordIndex = words.findIndex(w => w.id === wordId);
        if (wordIndex !== -1) {
          words[wordIndex].ultima_utilizacao = now;
          words[wordIndex].total_utilizacoes += 1;
          break;
        }
      }
      
    } catch (error) {
      console.error('Error marking word as used:', error);
    }
  }
  
  // Precarrega palavras para melhor performance
  async preloadWords(categorias: string[], dificuldades: string[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log('🚀 Starting preload of words...');
    
    for (const categoria of categorias) {
      for (const dificuldade of dificuldades) {
        if (!(await this.hasEnoughWords(categoria, dificuldade))) {
          await this.fetchAndCache(categoria, dificuldade);
          // Pequena pausa para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    
    console.log('✅ Preload completed');
  }
  
  // Limpa cache expirado
  async clearExpiredCache(): Promise<void> {
    if (!this.db) return;
    
    const expiredTime = Date.now() - this.config.CACHE_EXPIRY;
    const transaction = this.db.transaction(['words'], 'readwrite');
    const store = transaction.objectStore('words');
    const index = store.index('cached_at');
    
    const request = index.openCursor(IDBKeyRange.upperBound(expiredTime));
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }
  
  // Estatísticas do cache
  getCacheStats(): { [key: string]: CacheStats } {
    const stats: { [key: string]: CacheStats } = {};
    for (const [key, stat] of this.cacheStats.entries()) {
      stats[key] = stat;
    }
    return stats;
  }
  
  // Tamanho total do cache
  getTotalCachedWords(): number {
    let total = 0;
    for (const words of this.memoryCache.values()) {
      total += words.length;
    }
    return total;
  }
}

export default LocalCacheService;