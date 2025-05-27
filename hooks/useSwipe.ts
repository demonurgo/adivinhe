import { useState, TouchEvent as ReactTouchEvent, MouseEvent as ReactMouseEvent, useCallback, useRef } from 'react';

interface SwipeInput {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance in pixels to trigger a swipe
  velocityThreshold?: number; // Minimum velocity to trigger instant swipe
  debounceTime?: number; // Time in ms to prevent duplicate actions
}

interface SwipeOutput {
  // Touch events
  onTouchStart: (e: ReactTouchEvent<HTMLElement>) => void;
  onTouchMove: (e: ReactTouchEvent<HTMLElement>) => void;
  onTouchEnd: (e: ReactTouchEvent<HTMLElement>) => void;
  // Mouse events
  onMouseDown: (e: ReactMouseEvent<HTMLElement>) => void;
  onMouseMove: (e: ReactMouseEvent<HTMLElement>) => void;
  onMouseUp: (e: ReactMouseEvent<HTMLElement>) => void;
  onMouseLeave: (e: ReactMouseEvent<HTMLElement>) => void;
  // Drag state for visual feedback
  isDragging: boolean;
  dragOffset: number;
  isActionTriggered: boolean;
}

const useSwipe = ({ 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 30, // Reduced from 50 for faster response
  velocityThreshold = 0.5, // Pixels per millisecond
  debounceTime = 100 // Prevent duplicate actions
}: SwipeInput): SwipeOutput => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [isActionTriggered, setIsActionTriggered] = useState(false);
  
  const lastActionTimeRef = useRef<number>(0);
  const actionTriggeredRef = useRef(false);

  // Reset all states
  const resetStates = useCallback(() => {
    setTouchStartX(null);
    setTouchStartY(null);
    setTouchStartTime(null);
    setIsDragging(false);
    setIsMouseDragging(false);
    setDragOffset(0);
    setIsActionTriggered(false);
    actionTriggeredRef.current = false;
  }, []);

  // Trigger action with debounce protection
  const triggerAction = useCallback((action: 'left' | 'right') => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < debounceTime || actionTriggeredRef.current) {
      return;
    }
    
    lastActionTimeRef.current = now;
    actionTriggeredRef.current = true;
    setIsActionTriggered(true);
    
    if (action === 'left') {
      onSwipeLeft?.();
    } else {
      onSwipeRight?.();
    }
  }, [onSwipeLeft, onSwipeRight, debounceTime]);

  // Check if action should be triggered during movement
  const checkForInstantAction = useCallback((deltaX: number, deltaY: number, timeDelta: number) => {
    if (actionTriggeredRef.current) return;

    const distance = Math.abs(deltaX);
    const velocity = timeDelta > 0 ? distance / timeDelta : 0;
    
    // Trigger action if either threshold or velocity conditions are met
    const shouldTrigger = (
      (distance > threshold && Math.abs(deltaX) > Math.abs(deltaY)) || // Standard threshold
      (velocity > velocityThreshold && distance > threshold * 0.6) // Fast swipe with lower threshold
    );

    if (shouldTrigger) {
      if (deltaX < 0) {
        triggerAction('left');
      } else {
        triggerAction('right');
      }
    }
  }, [threshold, velocityThreshold, triggerAction]);

  // Touch Events (Mobile) - Optimized for responsiveness
  const onTouchStart = useCallback((e: ReactTouchEvent<HTMLElement>) => {
    if (e.targetTouches.length > 0) {
      const touch = e.targetTouches[0];
      setTouchStartX(touch.clientX);
      setTouchStartY(touch.clientY);
      setTouchStartTime(Date.now());
      setIsDragging(true);
      setDragOffset(0);
      setIsActionTriggered(false);
      actionTriggeredRef.current = false;
    }
  }, []);

  const onTouchMove = useCallback((e: ReactTouchEvent<HTMLElement>) => {
    if (touchStartX !== null && touchStartY !== null && touchStartTime !== null && e.targetTouches.length > 0) {
      const touch = e.targetTouches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const currentTime = Date.now();
      
      const deltaX = currentX - touchStartX;
      const deltaY = currentY - touchStartY;
      const timeDelta = currentTime - touchStartTime;
      
      setDragOffset(deltaX);
      
      // Check for instant action during movement
      checkForInstantAction(deltaX, deltaY, timeDelta);
    }
  }, [touchStartX, touchStartY, touchStartTime, checkForInstantAction]);

  const onTouchEnd = useCallback((e: ReactTouchEvent<HTMLElement>) => {
    if (touchStartX === null || touchStartY === null || touchStartTime === null || e.changedTouches.length === 0) {
      resetStates();
      return;
    }

    // If action was already triggered during movement, just reset
    if (actionTriggeredRef.current) {
      resetStates();
      return;
    }

    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const deltaX = endX - touchStartX;
    const deltaY = endY - touchStartY;
    const timeDelta = endTime - touchStartTime;

    // Final check on touch end
    checkForInstantAction(deltaX, deltaY, timeDelta);
    
    resetStates();
  }, [touchStartX, touchStartY, touchStartTime, checkForInstantAction, resetStates]);

  // Mouse Events (Desktop) - Same optimizations as touch
  const onMouseDown = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    e.preventDefault(); // Prevent text selection
    setTouchStartX(e.clientX);
    setTouchStartY(e.clientY);
    setTouchStartTime(Date.now());
    setIsDragging(true);
    setIsMouseDragging(true);
    setDragOffset(0);
    setIsActionTriggered(false);
    actionTriggeredRef.current = false;
  }, []);

  const onMouseMove = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (touchStartX !== null && touchStartY !== null && touchStartTime !== null && isMouseDragging) {
      e.preventDefault();
      const currentX = e.clientX;
      const currentY = e.clientY;
      const currentTime = Date.now();
      
      const deltaX = currentX - touchStartX;
      const deltaY = currentY - touchStartY;
      const timeDelta = currentTime - touchStartTime;
      
      setDragOffset(deltaX);
      
      // Check for instant action during movement
      checkForInstantAction(deltaX, deltaY, timeDelta);
    }
  }, [touchStartX, touchStartY, touchStartTime, isMouseDragging, checkForInstantAction]);

  const onMouseUp = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (touchStartX === null || touchStartY === null || touchStartTime === null || !isMouseDragging) {
      resetStates();
      return;
    }

    // If action was already triggered during movement, just reset
    if (actionTriggeredRef.current) {
      resetStates();
      return;
    }

    const endX = e.clientX;
    const endY = e.clientY;
    const endTime = Date.now();

    const deltaX = endX - touchStartX;
    const deltaY = endY - touchStartY;
    const timeDelta = endTime - touchStartTime;

    // Final check on mouse up
    checkForInstantAction(deltaX, deltaY, timeDelta);
    
    resetStates();
  }, [touchStartX, touchStartY, touchStartTime, isMouseDragging, checkForInstantAction, resetStates]);

  const onMouseLeave = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    // Reset if mouse leaves the element while dragging
    if (isMouseDragging) {
      resetStates();
    }
  }, [isMouseDragging, resetStates]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    isDragging,
    dragOffset,
    isActionTriggered,
  };
};

export default useSwipe;