
import React from 'react';

interface TimerDisplayProps {
  timeLeft: number;
  duration: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, duration }) => {
  // Round to ensure we display whole seconds even though timer runs at 100ms
  const displayTime = Math.ceil(timeLeft);
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const percentage = duration > 0 ? Math.max(0, (timeLeft / duration) * 100) : 0;

  let barColor = 'bg-green-500'; // Emerald-like green
  if (percentage <= 25) {
    barColor = 'bg-red-500'; // Softer red
  } else if (percentage <= 50) {
    barColor = 'bg-yellow-500'; // Amber-like yellow
  }

  return (
    <div className="w-full my-4 select-none">
      <div className="text-center text-5xl sm:text-6xl font-bold text-slate-100 tabular-nums mb-3 tracking-tight">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2.5 sm:h-3 overflow-hidden shadow-inner border border-slate-600/50">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-100 ease-linear shadow-md`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={displayTime}
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-label="Tempo restante"
        ></div>
      </div>
    </div>
  );
};

export default TimerDisplay;