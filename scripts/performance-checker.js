// Script para verificar performance do app após otimizações
// Execute no console do navegador para obter métricas

class PerformanceChecker {
  constructor() {
    this.metrics = {};
    this.startTime = Date.now();
  }

  // Verifica Web Vitals
  async checkWebVitals() {
    console.log('🔍 Verificando Core Web Vitals...');
    
    try {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        console.log(`📊 LCP: ${this.metrics.lcp.toFixed(2)}ms`);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay) - simulado
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          console.log(`⚡ FID: ${this.metrics.fid.toFixed(2)}ms`);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
        console.log(`📐 CLS: ${this.metrics.cls.toFixed(4)}`);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.log('⚠️  Core Web Vitals não disponíveis neste browser');
    }
  }

  // Verifica tamanho do bundle
  checkBundleSize() {
    console.log('📦 Verificando Bundle Size...');
    
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    let totalSize = 0;
    
    scripts.forEach((script, index) => {
      const size = script.src.length; // Aproximação básica
      totalSize += size;
      console.log(`📄 Script ${index + 1}: ~${(size / 1024).toFixed(2)}KB`);
    });
    
    styles.forEach((style, index) => {
      const size = style.href.length; // Aproximação básica
      totalSize += size;
      console.log(`🎨 Style ${index + 1}: ~${(size / 1024).toFixed(2)}KB`);
    });
    
    console.log(`📊 Bundle total estimado: ~${(totalSize / 1024).toFixed(2)}KB`);
    this.metrics.bundleSize = totalSize;
  }

  // Verifica cache local
  async checkLocalCache() {
    console.log('💾 Verificando Cache Local...');
    
    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        const dbName = 'AdivinheJaLocalCache';
        
        // Tenta abrir o banco do cache
        const openDB = () => {
          return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        };
        
        try {
          const db = await openDB();
          const stores = Array.from(db.objectStoreNames);
          console.log(`✅ Cache DB encontrado: ${stores.join(', ')}`);
          
          // Conta itens no cache
          const transaction = db.transaction(['words'], 'readonly');
          const store = transaction.objectStore('words');
          const countRequest = store.count();
          
          countRequest.onsuccess = () => {
            const count = countRequest.result;
            console.log(`📊 Palavras em cache: ${count}`);
            this.metrics.cachedWords = count;
          };
          
          db.close();
        } catch (error) {
          console.log('❌ Cache DB não encontrado ou vazio');
          this.metrics.cachedWords = 0;
        }
      } else {
        console.log('❌ IndexedDB não suportado');
      }
    } catch (error) {
      console.log('⚠️  Erro ao verificar cache:', error.message);
    }
  }

  // Verifica memory usage
  checkMemoryUsage() {
    console.log('🧠 Verificando Uso de Memória...');
    
    if (performance.memory) {
      const memory = performance.memory;
      const used = memory.usedJSHeapSize / 1024 / 1024;
      const total = memory.totalJSHeapSize / 1024 / 1024;
      const limit = memory.jsHeapSizeLimit / 1024 / 1024;
      
      console.log(`📊 Memória usada: ${used.toFixed(2)}MB`);
      console.log(`📊 Memória total: ${total.toFixed(2)}MB`);
      console.log(`📊 Limite de memória: ${limit.toFixed(2)}MB`);
      
      this.metrics.memory = {
        used: used.toFixed(2),
        total: total.toFixed(2),
        usage: ((used / total) * 100).toFixed(2)
      };
    } else {
      console.log('⚠️  Memory API não disponível');
    }
  }

  // Testa velocidade de carregamento de palavras
  async testWordLoadingSpeed() {
    console.log('⚡ Testando velocidade de carregamento...');
    
    const startTime = performance.now();
    
    try {
      // Simula carregamento de palavras
      if (window.fetchWordsForCategoriesOptimized) {
        const words = await window.fetchWordsForCategoriesOptimized(['animais'], 'facil', 10);
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        console.log(`⚡ Carregamento de 10 palavras: ${loadTime.toFixed(2)}ms`);
        this.metrics.wordLoadTime = loadTime.toFixed(2);
      } else {
        console.log('⚠️  Função de carregamento não encontrada');
      }
    } catch (error) {
      console.log('❌ Erro no teste de carregamento:', error.message);
    }
  }

  // Gera relatório completo
  generateReport() {
    console.log('\n🎯 ===== RELATÓRIO DE PERFORMANCE =====');
    console.log('📅 Data:', new Date().toLocaleString());
    console.log('⏱️  Tempo de verificação:', ((Date.now() - this.startTime) / 1000).toFixed(2), 'segundos');
    console.log('\n📊 MÉTRICAS COLETADAS:');
    
    Object.entries(this.metrics).forEach(([key, value]) => {
      if (typeof value === 'object') {
        console.log(`${key}:`, value);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
    
    console.log('\n💡 RECOMENDAÇÕES:');
    
    // Recomendações baseadas nas métricas
    if (this.metrics.lcp > 2500) {
      console.log('⚠️  LCP alto - considere otimizar carregamento de imagens');
    } else if (this.metrics.lcp < 1200) {
      console.log('✅ LCP excelente!');
    }
    
    if (this.metrics.cachedWords > 50) {
      console.log('✅ Cache local bem populado!');
    } else {
      console.log('💡 Active o cache local nas configurações');
    }
    
    if (this.metrics.memory && parseFloat(this.metrics.memory.usage) > 80) {
      console.log('⚠️  Alto uso de memória - considere limpar cache');
    }
    
    console.log('\n🎉 Verificação concluída!');
    return this.metrics;
  }

  // Executa todas as verificações
  async runAllChecks() {
    console.log('🚀 Iniciando verificação completa de performance...\n');
    
    await this.checkWebVitals();
    this.checkBundleSize();
    await this.checkLocalCache();
    this.checkMemoryUsage();
    await this.testWordLoadingSpeed();
    
    setTimeout(() => {
      this.generateReport();
    }, 2000); // Aguarda métricas assíncronas
  }
}

// Cria instância global
window.performanceChecker = new PerformanceChecker();

// Função de conveniência
window.checkPerformance = () => {
  window.performanceChecker.runAllChecks();
};

console.log('🔧 Performance Checker carregado!');
console.log('💡 Execute checkPerformance() para iniciar verificação');

export { PerformanceChecker };
