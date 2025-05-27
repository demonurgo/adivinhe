import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/ldujhtwxnbwqbchhchcf\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}`;
              },
            },
          },
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gemini-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Adivinhe Já! - Jogo de Charadas',
        short_name: 'AdivinheJá',
        description: 'Jogo interativo de adivinhação de palavras por categorias com IA integrada',
        theme_color: '#3b82f6',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        categories: ['games', 'entertainment'],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Jogo Rápido',
            short_name: 'Rápido',
            description: 'Iniciar um jogo rápido com configurações padrão',
            url: '/?quick=true',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192'
              }
            ]
          }
        ],
        screenshots: [
          {
            src: 'screenshot-mobile.png',
            sizes: '375x667',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Jogo em dispositivo móvel'
          },
          {
            src: 'screenshot-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Jogo em desktop'
          }
        ]
      },
    })
  ],
  
  // Configurações de build otimizadas
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
    },
    
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'gemini-vendor': ['@google/genai'],
          'game-components': [
            './components/GameScreen.tsx',
            './components/CategorySelectionScreen.tsx',
            './components/ConfigurationScreen.tsx',
          ],
        },
        
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
    
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV === 'development',
    reportCompressedSize: true,
  },
  
  server: {
    force: true,
    headers: {
      'Service-Worker-Allowed': '/',
    },
  },
  
  preview: {
    headers: {
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@google/genai',
    ],
  },
  
  assetsInclude: [
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.ico',
    '**/*.webp',
    '**/*.avif',
  ],
  
  css: {
    postcss: {},
  },
  
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@components': resolve(__dirname, './components'),
      '@services': resolve(__dirname, './services'),
      '@hooks': resolve(__dirname, './hooks'),
      '@types': resolve(__dirname, './types'),
      '@constants': resolve(__dirname, './constants'),
    },
  },
  
  esbuild: {
    legalComments: 'none',
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
