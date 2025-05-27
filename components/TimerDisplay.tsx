import React, { useState, useEffect } from 'react';

interface TimerDisplayProps {
  timeLeft: number;
  duration: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, duration }) => {
  const [mounted, setMounted] = useState(false);
  
  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Round to ensure we display whole seconds even though timer runs at 100ms
  const displayTime = Math.ceil(timeLeft);
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const percentage = duration > 0 ? Math.max(0, (timeLeft / duration) * 100) : 0;

  let barColor = 'bg-gradient-to-r from-green-500 to-emerald-500'; // Emerald-like green
  let pulseClass = '';
  
  if (percentage <= 25) {
    barColor = 'bg-gradient-to-r from-red-500 to-rose-500'; // Softer red
    pulseClass = 'animate-pulse-fast';
  } else if (percentage <= 50) {
    barColor = 'bg-gradient-to-r from-yellow-500 to-amber-500'; // Amber-like yellow
  }

  return (
    <div className={`w-full my-4 select-none landscape:my-2 transition-all duration-500 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className={`text-center text-5xl sm:text-6xl font-bold tabular-nums mb-3 tracking-tight landscape:text-4xl landscape:mb-2 text-gradient bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 ${percentage <= 25 ? 'from-red-500 via-rose-500 to-pink-500' : ''}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="w-full bg-white/50 backdrop-blur-sm rounded-full h-2.5 sm:h-3 overflow-hidden shadow-inner border border-sky-200/50 landscape:h-2 scrollbar-hide">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-100 ease-linear shadow-md ${pulseClass}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-label="Tempo restante"
        >
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-white/20 opacity-0 animate-pulse-slow"></div>
        </div>
      </div>
      
      {/* Time indicators */}
      <div className="flex justify-between mt-1 text-xs text-slate-500">
        <span className={`transition-opacity duration-300 ${percentage <= 50 ? 'opacity-60' : 'opacity-30'}`}>
          {Math.floor(duration / 2 / 60)}:{String((duration / 2) % 60).padStart(2, '0')}
        </span>
        <span className={`transition-opacity duration-300 ${percentage <= 25 ? 'opacity-60' : 'opacity-30'}`}>
          {Math.floor(duration / 4 / 60)}:{String((duration / 4) % 60).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default TimerDisplay;