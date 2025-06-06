// hooks/useLocalCache.ts
import { useState, useEffect, useCallback } from 'react';
import { initializeCache, preloadWordsForGame, getCacheStatistics, clearExpiredCache } from '../services/wordService';
import { AVAILABLE_CATEGORIES } from '../constants';

interface CacheStatus {
  isInitialized: boolean;
  isPreloading: boolean;
  totalCachedWords: number;
  error: string | null;
  lastUpdate: number;
}

export const useLocalCache = () => {
  const [status, setStatus] = useState<CacheStatus>({
    isInitialized: false,
    isPreloading: false,
    totalCachedWords: 0,
    error: null,
    lastUpdate: 0
  });

  // Inicializa o cache
  const initialize = useCallback(async () => {
    try {
      console.log('🚀 Initializing local cache...');
      const success = await initializeCache();
      
      if (success) {
        const stats = getCacheStatistics();
        setStatus(prev => ({
          ...prev,
          isInitialized: true,
          totalCachedWords: stats.totalWords,
          error: null,
          lastUpdate: Date.now()
        }));
        console.log('✅ Cache initialized successfully');
      } else {
        throw new Error('Failed to initialize cache');
      }
    } catch (error) {
      console.error('❌ Cache initialization failed:', error);
      setStatus(prev => ({
        ...prev,
        isInitialized: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  // Precarrega palavras para todas as categorias
  const preloadAllCategories = useCallback(async () => {
    if (!status.isInitialized) {
      console.warn('Cache not initialized, cannot preload');
      return;
    }

    setStatus(prev => ({ ...prev, isPreloading: true }));
    
    try {
      console.log('🔄 Starting background preload...');
      const categories = AVAILABLE_CATEGORIES.map(cat => cat.id);
      await preloadWordsForGame(categories);
      
      const stats = getCacheStatistics();
      setStatus(prev => ({
        ...prev,
        isPreloading: false,
        totalCachedWords: stats.totalWords,
        lastUpdate: Date.now()
      }));
      
      console.log('✅ Background preload completed');
    } catch (error) {
      console.error('❌ Preload failed:', error);
      setStatus(prev => ({
        ...prev,
        isPreloading: false,
        error: error instanceof Error ? error.message : 'Preload failed'
      }));
    }
  }, [status.isInitialized]);

  // Precarrega palavras para categorias específicas
  const preloadCategories = useCallback(async (categoryIds: string[]) => {
    if (!status.isInitialized) {
      console.warn('Cache not initialized, cannot preload');
      return;
    }

    try {
      console.log(`🔄 Preloading categories: ${categoryIds.join(', ')}`);
      await preloadWordsForGame(categoryIds);
      
      const stats = getCacheStatistics();
      setStatus(prev => ({
        ...prev,
        totalCachedWords: stats.totalWords,
        lastUpdate: Date.now()
      }));
      
      console.log('✅ Category preload completed');
    } catch (error) {
      console.error('❌ Category preload failed:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Category preload failed'
      }));
    }
  }, [status.isInitialized]);

  // Limpa cache expirado
  const cleanExpiredCache = useCallback(async () => {
    try {
      await clearExpiredCache();
      const stats = getCacheStatistics();
      setStatus(prev => ({
        ...prev,
        totalCachedWords: stats.totalWords,
        lastUpdate: Date.now()
      }));
      console.log('🧹 Expired cache cleaned');
    } catch (error) {
      console.error('❌ Cache cleanup failed:', error);
    }
  }, []);

  // Atualiza estatísticas
  const refreshStats = useCallback(() => {
    if (status.isInitialized) {
      const stats = getCacheStatistics();
      setStatus(prev => ({
        ...prev,
        totalCachedWords: stats.totalWords,
        lastUpdate: Date.now()
      }));
    }
  }, [status.isInitialized]);

  // Efeito para inicialização automática
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Efeito para limpeza periódica do cache (a cada hora)
  useEffect(() => {
    if (!status.isInitialized) return;

    const interval = setInterval(() => {
      cleanExpiredCache();
    }, 60 * 60 * 1000); // 1 hora

    return () => clearInterval(interval);
  }, [status.isInitialized, cleanExpiredCache]);

  return {
    status,
    initialize,
    preloadAllCategories,
    preloadCategories,
    cleanExpiredCache,
    refreshStats,
    
    // Estados derivados para conveniência
    isReady: status.isInitialized && !status.isPreloading,
    hasWords: status.totalCachedWords > 0,
    isWorking: status.isPreloading,
    hasError: !!status.error
  };
};

export default useLocalCache;