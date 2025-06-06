/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
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
  		animation: {
  			'card-swipe-out-left': 'swipeOutLeft 0.15s ease-in forwards',
  			'card-swipe-out-right': 'swipeOutRight 0.15s ease-in forwards',
  			'fade-in': 'fadeIn 0.2s ease-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'scale-in': 'scaleIn 0.2s ease-out',
  			'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'bounce-gentle': 'bounceGentle 0.6s ease-out',
  			'spin-slow': 'spin 2s linear infinite',
  			'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
  			'pulse-slow': 'pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			float: 'float 15s ease-in-out infinite',
  			shine: 'shine 2s infinite'
  		},
  		keyframes: {
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
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
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
  			},
  			pulseSlow: {
  				'0%, 100%': {
  					transform: 'scale(1)',
  					boxShadow: '0 0 0 0 rgba(236, 72, 153, 0.4)'
  				},
  				'50%': {
  					transform: 'scale(1.03)',
  					boxShadow: '0 0 0 15px rgba(236, 72, 153, 0)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0) rotate(0deg)'
  				},
  				'25%': {
  					transform: 'translateY(-20px) rotate(5deg)'
  				},
  				'50%': {
  					transform: 'translateY(0) rotate(0deg)'
  				},
  				'75%': {
  					transform: 'translateY(20px) rotate(-5deg)'
  				}
  			},
  			shine: {
  				'0%': {
  					left: '-100%'
  				},
  				'50%, 100%': {
  					left: '100%'
  				}
  			}
  		},
  		transitionTimingFunction: {
  			game: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  			'bounce-out': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  		},
  		transitionDuration: {
  			'50': '50ms',
  			'75': '75ms',
  			'125': '125ms',
  			'250': '250ms',
  			'400': '400ms'
  		},
  		colors: {
  			game: {
  				correct: '#4CAF50',
  				'correct-light': '#81C784',
  				'correct-dark': '#388E3C',
  				skip: '#F44336',
  				'skip-light': '#E57373',
  				'skip-dark': '#D32F2F',
  				neutral: '#9E9E9E',
  				accent: '#2196F3'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			'game-card': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  			'game-card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  			'button-active': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  			glow: '0 0 15px 5px rgba(236, 72, 153, 0.5), 0 0 30px 10px rgba(236, 72, 153, 0.3)',
  			'glow-sm': '0 0 10px 3px rgba(236, 72, 153, 0.4), 0 0 20px 6px rgba(236, 72, 153, 0.2)'
  		},
  		backdropBlur: {
  			xs: '2px',
  			game: '12px'
  		},
  		scale: {
  			'98': '.98',
  			'102': '1.02'
  		},
  		skew: {
  			'30': '30deg'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
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
        
        // Utility to hide scrollbars
        '.scrollbar-hide': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            'display': 'none'
          }
        },
        
        // Utility for shadow glow effects
        '.shadow-glow': {
          'box-shadow': theme('boxShadow.glow'),
        },
        '.shadow-glow-sm': {
          'box-shadow': theme('boxShadow.glow-sm'),
        },
      }
      
      addUtilities(newUtilities)
    },
      require("tailwindcss-animate")
],
}
