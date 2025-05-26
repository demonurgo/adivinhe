import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configurações de build otimizadas
  build: {
    // Target moderno para melhor otimização
    target: 'esnext',
    
    // Minificação avançada
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
    },
    
    // Code splitting e chunk optimization
    rollupOptions: {
      output: {
        // Estratégia de chunk splitting
        manualChunks: {
          // Vendor chunks separados
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'gemini-vendor': ['@google/genai'],
          
          // Chunks por funcionalidade
          'game-components': [
            './components/GameScreen.tsx',
            './components/CategorySelectionScreen.tsx',
            './components/ConfigurationScreen.tsx',
          ],
          'statistics-components': [
            './components/StatisticsScreen.tsx',
            './services/gameHistoryService.ts',
          ],
          'pwa-components': [
            './components/PWAInstallPrompt.tsx',
            './hooks/usePWA.ts',
          ],
        },
        
        // Nomes de arquivo otimizados
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'index') {
            return 'js/main-[hash].js';
          }
          return 'js/[name]-[hash].js';
        },
        entryFileNames: 'js/main-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1] || '';
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'images/[name]-[hash][extname]';
          }
          
          if (/css/i.test(ext)) {
            return 'css/[name]-[hash][extname]';
          }
          
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'fonts/[name]-[hash][extname]';
          }
          
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    
    // Tamanho máximo de chunk para warnings
    chunkSizeWarningLimit: 1000,
    
    // Sourcemap apenas para desenvolvimento
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Reportar tamanho do bundle
    reportCompressedSize: true,
  },
  
  // Otimizações de desenvolvimento
  server: {
    // Pré-bundling de dependências
    force: true,
    
    // Headers para PWA em desenvolvimento
    headers: {
      'Service-Worker-Allowed': '/',
    },
  },
  
  // Configurações de preview (para testar build)
  preview: {
    headers: {
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  
  // Configurações de dependências
  optimizeDeps: {
    // Incluir dependências que devem ser pré-bundadas
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@google/genai',
    ],
    
    // Excluir dependências que não devem ser pré-bundadas
    exclude: [
      // Service worker não deve ser bundado
      '/sw.js',
    ],
  },
  
  // Configurações de assets
  assetsInclude: [
    // Incluir tipos de arquivo adicionais como assets
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.ico',
    '**/*.webp',
    '**/*.avif',
  ],
  
  // Configurações de CSS
  css: {
    // PostCSS plugins serão adicionados automaticamente pelo Tailwind
    postcss: {},
    
    // Configurações específicas do CSS
    preprocessorOptions: {
      scss: {
        // Variáveis globais se necessário
        additionalData: '',
      },
    },
  },
  
  // Definir variáveis de ambiente
  define: {
    // Substituir em tempo de build
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  
  // Configurações de resolução
  resolve: {
    alias: {
      // Aliases para imports mais limpos
      '@': resolve(__dirname, './'),
      '@components': resolve(__dirname, './components'),
      '@services': resolve(__dirname, './services'),
      '@hooks': resolve(__dirname, './hooks'),
      '@types': resolve(__dirname, './types'),
      '@constants': resolve(__dirname, './constants'),
    },
  },
  
  // Configurações de performance
  esbuild: {
    // Configurações do esbuild
    legalComments: 'none',
    
    // Drop console/debugger em produção
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  
  // Configurações experimentais
  experimental: {
    // Renderização em tempo de build (se suportado)
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `${filename}` };
      } else {
        return { relative: true };
      }
    },
  },
});
