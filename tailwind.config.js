/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Animações customizadas para o jogo
      animation: {
        // Animações de swipe mais rápidas
        'card-swipe-out-left': 'swipeOutLeft 0.15s ease-in forwards',
        'card-swipe-out-right': 'swipeOutRight 0.15s ease-in forwards',
        
        // Animações de entrada
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        
        // Animações de feedback
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        
        // Animações de loading
        'spin-slow': 'spin 2s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      
      keyframes: {
        // Swipe animations - mais rápidas e suaves
        swipeOutLeft: {
          '0%': { 
            transform: 'translateX(0) rotate(0deg)',
            opacity: '1' 
          },
          '100%': { 
            transform: 'translateX(-100vw) rotate(-20deg)',
            opacity: '0' 
          }
        },
        swipeOutRight: {
          '0%': { 
            transform: 'translateX(0) rotate(0deg)',
            opacity: '1' 
          },
          '100%': { 
            transform: 'translateX(100vw) rotate(20deg)',
            opacity: '0' 
          }
        },
        
        // Animações de entrada
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { 
            transform: 'translateY(20px)',
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1' 
          }
        },
        scaleIn: {
          '0%': { 
            transform: 'scale(0.9)',
            opacity: '0' 
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1' 
          }
        },
        
        // Bounce suave
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': {
            transform: 'translate3d(0,0,0)'
          },
          '40%, 43%': {
            transform: 'translate3d(0, -10px, 0)'
          },
          '70%': {
            transform: 'translate3d(0, -5px, 0)'
          },
          '90%': {
            transform: 'translate3d(0, -2px, 0)'
          }
        }
      },
      
      // Transições customizadas
      transitionTimingFunction: {
        'game': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'bounce-out': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      // Durações de transição otimizadas para jogos
      transitionDuration: {
        '50': '50ms',
        '75': '75ms',
        '125': '125ms',
        '250': '250ms',
        '400': '400ms',
      },
      
      // Cores customizadas para feedback visual
      colors: {
        game: {
          'correct': '#22c55e',
          'correct-light': '#86efac',
          'correct-dark': '#16a34a',
          'skip': '#ef4444',
          'skip-light': '#fca5a5',
          'skip-dark': '#dc2626',
          'neutral': '#64748b',
          'accent': '#6366f1',
        }
      },
      
      // Shadows otimizadas para performance
      boxShadow: {
        'game-card': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'game-card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'button-active': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      
      // Configurações de blur otimizadas
      backdropBlur: {
        'xs': '2px',
        'game': '12px',
      },
      
      // Configurações de escala para feedback visual
      scale: {
        '98': '.98',
        '102': '1.02',
      }
    },
  },
  plugins: [
    // Plugin para adicionar utilitários customizados
    function({ addUtilities, addVariant, theme }) {
      // Adicionar variant para landscape
      addVariant('landscape', '@media (orientation: landscape)');
      addVariant('landscape-mobile', '@media (orientation: landscape) and (max-width: 1024px) and (max-height: 500px)');
      
      const newUtilities = {
        // Utilitários para performance de animações
        '.gpu-acceleration': {
          'transform': 'translateZ(0)',
          'will-change': 'transform',
        },
        '.smooth-drag': {
          'user-select': 'none',
          '-webkit-user-drag': 'none',
          'touch-action': 'pan-y',
          'will-change': 'transform',
        },
        '.game-transition': {
          'transition-timing-function': theme('transitionTimingFunction.game'),
        },
        
        // Utilitários para feedback visual rápido
        '.feedback-correct': {
          'background-color': 'rgba(34, 197, 94, 0.2)',
          'border-color': theme('colors.game.correct'),
        },
        '.feedback-skip': {
          'background-color': 'rgba(239, 68, 68, 0.2)',
          'border-color': theme('colors.game.skip'),
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
}
