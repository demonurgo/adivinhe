import React, { useEffect, useCallback, useState, useRef } from 'react';
import TimerDisplay from './TimerDisplay';
import useSwipe from '../hooks/useSwipe';
import LoadingSpinner from './LoadingSpinner';

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
  const wordCardRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp]);

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
    if (timeLeft <= 0 || !hasWords || !wordToDisplay) return;

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
    }, 300); // Match animation duration
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
    dragOffset 
  } = useSwipe({
    onSwipeLeft: () => handleSwipeAction('skip'),
    onSwipeRight: () => handleSwipeAction('correct'),
    threshold: 50, // Minimum swipe distance
  });

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (timeLeft <= 0 || !hasWords || !wordToDisplay) return;

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

  // Get visual feedback styling
  const getDragFeedbackStyling = () => {
    if (!isDragging || dragOffset === 0) return '';
    
    const opacity = Math.min(Math.abs(dragOffset) / 100, 0.5); // Max 50% opacity
    if (dragOffset < -30) {
      // Dragging left (skip) - red background
      return `rgba(239, 68, 68, ${opacity})`;
    } else if (dragOffset > 30) {
      // Dragging right (correct) - green background
      return `rgba(34, 197, 94, ${opacity})`;
    }
    return '';
  };

  // Get icon for drag feedback
  const getDragIcon = () => {
    if (!isDragging || Math.abs(dragOffset) < 30) return null;
    
    if (dragOffset < -30) {
      return (
        <div className="absolute top-4 right-4 text-red-400 text-6xl opacity-70 pointer-events-none">
          ✖️
        </div>
      );
    } else if (dragOffset > 30) {
      return (
        <div className="absolute top-4 left-4 text-green-400 text-6xl opacity-70 pointer-events-none">
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
          className={`relative w-full bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl text-center min-h-[150px] sm:min-h-[200px] flex items-center justify-center cursor-grab active:cursor-grabbing ${cardAnimationClass}`}
          style={{
            ...(isDragging && dragOffset !== 0 ? {
              transform: `translateX(${dragOffset}px) rotate(${(dragOffset / 10) * 0.5}deg)`,
              transition: 'none',
              backgroundColor: dragFeedback ? dragFeedback : undefined
            } : {}),
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
          
          {/* Drag feedback icon */}
          {getDragIcon()}
          
          <p className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-bold text-white break-words select-none">
            {wordToDisplay}
          </p>
        </div>

        {/* Fallback buttons that appear after 5 seconds */}
        {showFallbackButtons && !swipeDirection && (
          <div className="absolute -bottom-16 left-0 right-0 flex justify-between px-4 animate-fade-in">
            <button
              onClick={() => handleSwipeAction('skip')}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-colors"
            >
              ← Pular
            </button>
            <button
              onClick={() => handleSwipeAction('correct')}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-colors"
            >
              Correto →
            </button>
          </div>
        )}
      </div>
    );
  } else if (isFetchingMoreWords) {
    wordAreaContent = (
      <div className="flex flex-col items-center justify-center min-h-[150px] sm:min-h-[200px] text-center p-4">
        <LoadingSpinner size="md" />
        <p className="text-xl sm:text-2xl font-semibold text-indigo-300 mt-4">
          Buscando mais desafios...
        </p>
      </div>
    );
  } else {
     wordAreaContent = (
      <div className="flex items-center justify-center min-h-[150px] sm:min-h-[200px] text-center p-4">
        <p className="text-xl sm:text-2xl font-semibold text-slate-500">
          Aguardando o tempo acabar... ⏳
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 flex flex-col justify-between min-h-[85vh] sm:min-h-[580px] md:min-h-[620px]">
      <div className="w-full">
        <TimerDisplay timeLeft={timeLeft} duration={duration} />
      </div>

      <div className="my-auto flex flex-col items-center justify-center flex-grow relative">
        {wordAreaContent}
        
        {hasWords && wordToDisplay && !swipeDirection && !isDragging && !showFallbackButtons && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-slate-500 text-xs sm:text-sm select-none opacity-70">
            <span>&larr; Pular</span>
            <span>Correto &rarr;</span>
          </div>
        )}
        
        {/* Instructions */}
        {hasWords && wordToDisplay && !swipeDirection && !isDragging && !showFallbackButtons && (
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-slate-400 text-xs opacity-60">
              🖱️ Arraste com mouse • 👆 Swipe • ⌨️ Use setas ← →
            </p>
          </div>
        )}
      </div>
      
      <div className="h-10 sm:h-12 mt-4"> 
        {timeLeft > 0 && !hasWords && !isFetchingMoreWords && (
             <p className="text-center text-sm text-slate-400">Sem mais palavras no momento.</p>
        )}
      </div>
    </div>
  );
};

export default GameScreen;