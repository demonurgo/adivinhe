
import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4',
  };
  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-slate-100 border-t-transparent`}
        style={{ borderTopColor: 'transparent' }} // Ensure compatibility
      ></div>
    </div>
  );
};

export default LoadingSpinner;