import React, { useEffect, useRef, useState } from 'react';

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  maxOpacity?: number;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 6,
  gridGap = 8,
  flickerChance = 0.4,
  color = "rgb(14, 116, 144)",
  maxOpacity = 0.4,
  className = '',
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  console.log('FlickeringGrid: Component rendered with props:', { squareSize, gridGap, flickerChance, maxOpacity });

  // Simplified grid setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.log('FlickeringGrid: Container not found');
      return;
    }

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      console.log('FlickeringGrid: Container dimensions:', rect);
      setDimensions({ width: rect.width, height: rect.height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) {
      console.log('FlickeringGrid: Canvas not ready or dimensions zero');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('FlickeringGrid: Could not get 2D context');
      return;
    }

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = dimensions.width + 'px';
    canvas.style.height = dimensions.height + 'px';
    ctx.scale(dpr, dpr);

    console.log('FlickeringGrid: Canvas initialized', { width: dimensions.width, height: dimensions.height, dpr });

    // Calculate grid
    const cols = Math.floor(dimensions.width / (squareSize + gridGap));
    const rows = Math.floor(dimensions.height / (squareSize + gridGap));
    const totalSquares = cols * rows;

    console.log('FlickeringGrid: Grid calculated', { cols, rows, totalSquares });

    // Create grid state
    const squares = new Array(totalSquares).fill(0).map(() => Math.random() * maxOpacity);

    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Update and draw squares
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const index = i * rows + j;
          
          // Update opacity
          if (Math.random() < flickerChance * deltaTime) {
            squares[index] = Math.random() * maxOpacity;
          }

          // Draw square
          const x = i * (squareSize + gridGap);
          const y = j * (squareSize + gridGap);
          const opacity = squares[index];

          ctx.fillStyle = `rgba(14, 116, 144, ${opacity})`;
          ctx.fillRect(x, y, squareSize, squareSize);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    console.log('FlickeringGrid: Starting animation');
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, squareSize, gridGap, flickerChance, maxOpacity]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${className}`}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none block"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};