import React, { useEffect, useCallback, useState, useRef } from 'react';
import TimerDisplay from './TimerDisplay';
import useSwipe from '../hooks/useSwipe';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';

interface GameScreenProps {
  wordToDisplay: string | null;
  onCorrect: () => void;
  onSkip: () => void;
  onTimeUp: () => void;
  duration: number;
  isFetchingMoreWords: boolean;
  hasWords: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  wordToDisplay, 
  onCorrect, 
  onSkip, 
  onTimeUp, 
  duration,
  isFetchingMoreWords,
  hasWords
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showFallbackButtons, setShowFallbackButtons] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wordCardRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Timer refs for robust timing
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartTimeRef = useRef<number>(Date.now());
  const gameDurationRef = useRef<number>(duration);
  const isGameActiveRef = useRef<boolean>(true);

  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Robust timer implementation that doesn't pause during animations or actions
  useEffect(() => {
    // Initialize game start time and duration only once
    gameStartTimeRef.current = Date.now();
    gameDurationRef.current = duration;
    isGameActiveRef.current = true;
    setTimeLeft(duration);

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Create a completely independent timer that runs regardless of any game actions
    timerRef.current = setInterval(() => {
      // Check if game is still active using ref (not state)
      if (!isGameActiveRef.current) {
        return;
      }

      const now = Date.now();
      const elapsed = Math.floor((now - gameStartTimeRef.current) / 1000);
      const remaining = Math.max(0, gameDurationRef.current - elapsed);
      
      // Update time left state
      setTimeLeft(remaining);
      
      // Check if time is up
      if (remaining <= 0) {
        isGameActiveRef.current = false;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Call onTimeUp only once
        timeUpCallbackRef.current();
      }
    }, 100); // Update every 100ms for smooth display

    // Cleanup function - only clear timer, don't reset refs
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []); // Empty dependency array - timer should NEVER restart during game

  // Separate effect to handle duration changes (only when component mounts or duration prop changes)
  useEffect(() => {
    if (timerRef.current) {
      // If timer is already running, don't restart it
      return;
    }
    
    // Update duration ref if component receives new duration
    gameDurationRef.current = duration;
  }, [duration]);

  // Effect to handle timeUp callback changes without restarting timer
  const timeUpCallbackRef = useRef(onTimeUp);
  useEffect(() => {
    timeUpCallbackRef.current = onTimeUp;
  }, [onTimeUp]);

  // Show fallback buttons after 5 seconds if no interaction
  useEffect(() => {
    if (hasWords && wordToDisplay && timeLeft > 0) {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
      fallbackTimeoutRef.current = setTimeout(() => {
        setShowFallbackButtons(true);
      }, 5000);
    }
    
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, [hasWords, wordToDisplay, timeLeft]);

  const handleSwipeAction = useCallback((action: 'correct' | 'skip') => {
    if (timeLeft <= 0 || !hasWords || !wordToDisplay || !isGameActiveRef.current) return;

    setSwipeDirection(action === 'correct' ? 'right' : 'left');
    setShowFallbackButtons(false); // Hide buttons when action is taken

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(() => {
      if (action === 'correct') onCorrect();
      else onSkip();
      setSwipeDirection(null); // Reset for next word
    }, 150); // Reduced for faster gameplay
  }, [timeLeft, hasWords, wordToDisplay, onCorrect, onSkip]);

  const { 
    onTouchStart, 
    onTouchMove, 
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    isDragging,
    dragOffset,
    isActionTriggered
  } = useSwipe({
    onSwipeLeft: () => handleSwipeAction('skip'),
    onSwipeRight: () => handleSwipeAction('correct'),
    threshold: 80, // Increased from 30 for less sensitivity
    velocityThreshold: 0.3, // Reduced for requiring more deliberate swipes
    debounceTime: 150, // Slightly increased to prevent duplicate actions
  });

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (timeLeft <= 0 || !hasWords || !wordToDisplay || !isGameActiveRef.current) return;

      if (event.key === 'ArrowRight') {
        handleSwipeAction('correct');
      } else if (event.key === 'ArrowLeft') {
        handleSwipeAction('skip');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipeAction, timeLeft, hasWords, wordToDisplay]);

  // Reset animation class when word changes
  useEffect(() => {
    if (wordCardRef.current) {
      wordCardRef.current.className = wordCardRef.current.className.replace(/animate-card-swipe-out-\w+/g, '');
    }
    setShowFallbackButtons(false); // Reset fallback buttons for new word
  }, [wordToDisplay]);

  // Get visual feedback styling - Adjusted for new threshold
  const getDragFeedbackStyling = () => {
    if (!isDragging || dragOffset === 0) return '';
    
    const opacity = Math.min(Math.abs(dragOffset) / 120, 0.6); // Increased distance requirement
    if (dragOffset < -40) { // Increased threshold from -20 to -40
      // Dragging left (skip) - red background
      return `rgba(239, 68, 68, ${opacity})`;
    } else if (dragOffset > 40) { // Increased threshold from 20 to 40
      // Dragging right (correct) - green background
      return `rgba(34, 197, 94, ${opacity})`;
    }
    return '';
  };

  // Get icon for drag feedback - Adjusted for new threshold
  const getDragIcon = () => {
    if (!isDragging || Math.abs(dragOffset) < 40) return null; // Increased threshold from 20 to 40
    
    const iconOpacity = Math.min(Math.abs(dragOffset) / 100, 1); // Adjusted for smoother progression
    
    if (dragOffset < -40) {
      return (
        <div className="absolute top-4 right-4 text-red-400 text-6xl pointer-events-none transition-opacity duration-75" style={{ opacity: iconOpacity }}>
          ✖️
        </div>
      );
    } else if (dragOffset > 40) {
      return (
        <div className="absolute top-4 left-4 text-green-400 text-6xl pointer-events-none transition-opacity duration-75" style={{ opacity: iconOpacity }}>
          ✅
        </div>
      );
    }
    return null;
  };

  let wordAreaContent;
  let cardAnimationClass = '';
  if (swipeDirection === 'left') cardAnimationClass = 'animate-card-swipe-out-left';
  if (swipeDirection === 'right') cardAnimationClass = 'animate-card-swipe-out-right';

  if (hasWords && wordToDisplay) {
    const dragFeedback = getDragFeedbackStyling();
    
    wordAreaContent = (
      <div className="relative w-full">
        <div 
          ref={wordCardRef}
          className={`relative w-full bg-gradient-to-br from-white/95 to-white/90 p-6 sm:p-8 rounded-2xl shadow-lg text-center min-h-[150px] sm:min-h-[200px] flex items-center justify-center cursor-grab active:cursor-grabbing landscape:min-h-[120px] landscape:p-4 ${cardAnimationClass} border border-slate-200/50 backdrop-blur-sm`}
          style={{
            ...(isDragging && dragOffset !== 0 ? {
              transform: `translateX(${dragOffset}px) rotate(${(dragOffset / 8) * 0.3}deg)`, // Reduced rotation for smoother feel
              transition: 'none',
              backgroundColor: dragFeedback ? dragFeedback : undefined,
              scale: Math.max(0.98, 1 - Math.abs(dragOffset) / 800) // Subtle scale effect
            } : {
              transition: 'transform 0.2s ease-out' // Smooth return to position
            }),
            touchAction: 'pan-y',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          {/* Drag feedback background overlay */}
          {isDragging && dragFeedback && (
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ backgroundColor: dragFeedback }}
            />
          )}
          
          {/* Animated background shapes */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-xl -z-10"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-blue-300/20 to-teal-300/20 rounded-full blur-xl -z-10"></div>
          
          {/* Drag feedback icon */}
          {getDragIcon()}
          
          <p className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 break-words select-none landscape:text-2xl landscape:sm:text-3xl">
            {wordToDisplay}
          </p>
        </div>

        {/* Fallback buttons that appear after 5 seconds */}
        {showFallbackButtons && !swipeDirection && (
          <div className="absolute -bottom-16 left-0 right-0 flex justify-between px-4 animate-fade-in landscape:-bottom-12">
            <div className="relative group">
              <Button
                onClick={() => handleSwipeAction('skip')}
                variant="skip"
                size="md"
                className="shadow-lg relative overflow-hidden transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-glow-sm active:scale-95 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
                  <span>Pular</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-red-600/50 to-red-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              </Button>
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-100 scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
            </div>
            
            <div className="relative group">
              <Button
                onClick={() => handleSwipeAction('correct')}
                variant="correct"
                size="md"
                className="shadow-lg relative overflow-hidden transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-glow-sm active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Correto</span>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-green-600/50 to-emerald-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              </Button>
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-300 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-300 delay-100 scale-0 group-hover:scale-100 group-hover:animate-ping-slow"></div>
            </div>
          </div>
        )}
      </div>
    );
  } else if (isFetchingMoreWords) {
    wordAreaContent = (
      <div className="flex flex-col items-center justify-center min-h-[150px] sm:min-h-[200px] text-center p-4 landscape:min-h-[120px] bg-gradient-to-br from-white/80 to-white/70 rounded-2xl shadow-lg border border-slate-200/50 backdrop-blur-sm">
        <LoadingSpinner size="md" />
        <p className="text-xl sm:text-2xl font-semibold text-gradient bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 mt-4 landscape:text-lg landscape:mt-2">
          Buscando mais desafios...
        </p>
      </div>
    );
  } else {
     wordAreaContent = (
      <div className="flex items-center justify-center min-h-[150px] sm:min-h-[200px] text-center p-4 landscape:min-h-[120px] bg-gradient-to-br from-white/80 to-white/70 rounded-2xl shadow-lg border border-slate-200/50 backdrop-blur-sm">
        <p className="text-xl sm:text-2xl font-semibold text-gradient bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 landscape:text-lg">
          Aguardando o tempo acabar... ⏳
        </p>
      </div>
    );
  }
  
  return (
    <div className={`w-full max-w-3xl mx-auto p-5 sm:p-8 bg-gradient-to-br from-sky-100/90 via-sky-50/80 to-indigo-100/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-sky-300/50 flex flex-col justify-between min-h-[85vh] sm:min-h-[580px] md:min-h-[620px] landscape:max-w-none landscape:h-[90vh] landscape:flex-row landscape:max-h-[90vh] landscape:w-[95vw] transition-all duration-500 transform ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-300/20 to-teal-300/20 rounded-full blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4"></div>
      
      <div className={`w-full landscape:w-auto landscape:flex-shrink-0 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <TimerDisplay timeLeft={timeLeft} duration={duration} />
      </div>

      <div className={`my-auto flex flex-col items-center justify-center flex-grow relative landscape:flex-1 landscape:mx-8 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {wordAreaContent}
        
        {hasWords && wordToDisplay && !swipeDirection && !isDragging && !showFallbackButtons && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-slate-600 text-xs sm:text-sm select-none opacity-70 landscape:bottom-4">
            <span className="flex items-center gap-1 text-red-500/70">
              <span className="transform transition-transform duration-300">←</span> Pular
            </span>
            <span className="flex items-center gap-1 text-green-500/70">
              Correto <span className="transform transition-transform duration-300">→</span>
            </span>
          </div>
        )}
        
        {/* Instructions */}
        {hasWords && wordToDisplay && !swipeDirection && !isDragging && !showFallbackButtons && (
          <div className="absolute bottom-8 left-0 right-0 text-center landscape:bottom-12">
            <p className="text-slate-600 text-xs opacity-60 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full inline-block">
              🖱️ Arraste com mouse • 👆 Swipe • ⌨️ Use setas ← →
            </p>
          </div>
        )}
      </div>
      
      <div className={`h-10 sm:h-12 mt-4 landscape:w-auto landscape:flex-shrink-0 landscape:mt-0 transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}> 
        {timeLeft > 0 && !hasWords && !isFetchingMoreWords && (
             <p className="text-center text-sm text-slate-600 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full inline-block">Sem mais palavras no momento.</p>
        )}
      </div>
    </div>
  );
};

export default GameScreen;