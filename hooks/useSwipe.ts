import { useState, TouchEvent as ReactTouchEvent, MouseEvent as ReactMouseEvent } from 'react';

interface SwipeInput {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance in pixels to trigger a swipe
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
}

const useSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeInput): SwipeOutput => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMouseDragging, setIsMouseDragging] = useState(false);

  // Touch Events (Mobile)
  const onTouchStart = (e: ReactTouchEvent<HTMLElement>) => {
    if (e.targetTouches.length > 0) {
      setTouchStartX(e.targetTouches[0].clientX);
      setTouchStartY(e.targetTouches[0].clientY);
      setIsDragging(true);
      setDragOffset(0);
    }
  };

  const onTouchMove = (e: ReactTouchEvent<HTMLElement>) => {
    if (touchStartX !== null && e.targetTouches.length > 0) {
      const currentX = e.targetTouches[0].clientX;
      const deltaX = currentX - touchStartX;
      setDragOffset(deltaX);
    }
  };

  const onTouchEnd = (e: ReactTouchEvent<HTMLElement>) => {
    if (touchStartX === null || touchStartY === null || e.changedTouches.length === 0) {
      setTouchStartX(null);
      setTouchStartY(null);
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const deltaX = endX - touchStartX;
    const deltaY = endY - touchStartY;

    // Determine if the swipe is primarily horizontal and exceeds the threshold
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }

    // Reset states
    setTouchStartX(null);
    setTouchStartY(null);
    setIsDragging(false);
    setDragOffset(0);
  };

  // Mouse Events (Desktop)
  const onMouseDown = (e: ReactMouseEvent<HTMLElement>) => {
    e.preventDefault(); // Prevent text selection
    setTouchStartX(e.clientX);
    setTouchStartY(e.clientY);
    setIsDragging(true);
    setIsMouseDragging(true);
    setDragOffset(0);
  };

  const onMouseMove = (e: ReactMouseEvent<HTMLElement>) => {
    if (touchStartX !== null && isMouseDragging) {
      e.preventDefault();
      const currentX = e.clientX;
      const deltaX = currentX - touchStartX;
      setDragOffset(deltaX);
    }
  };

  const onMouseUp = (e: ReactMouseEvent<HTMLElement>) => {
    if (touchStartX === null || touchStartY === null || !isMouseDragging) {
      setTouchStartX(null);
      setTouchStartY(null);
      setIsDragging(false);
      setIsMouseDragging(false);
      setDragOffset(0);
      return;
    }

    const endX = e.clientX;
    const endY = e.clientY;

    const deltaX = endX - touchStartX;
    const deltaY = endY - touchStartY;

    // Determine if the swipe is primarily horizontal and exceeds the threshold
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }

    // Reset states
    setTouchStartX(null);
    setTouchStartY(null);
    setIsDragging(false);
    setIsMouseDragging(false);
    setDragOffset(0);
  };

  const onMouseLeave = (e: ReactMouseEvent<HTMLElement>) => {
    // Reset if mouse leaves the element while dragging
    if (isMouseDragging) {
      setTouchStartX(null);
      setTouchStartY(null);
      setIsDragging(false);
      setIsMouseDragging(false);
      setDragOffset(0);
    }
  };

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
  };
};

export default useSwipe;