
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'correct' | 'skip' | 'danger' | 'config' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  active?: boolean; // For settings buttons
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  icon,
  fullWidth = false,
  active = false,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-60 transition-all duration-200 ease-in-out flex items-center justify-center gap-2.5 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-md disabled:hover:shadow-md';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm',
    md: 'px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base',
    lg: 'px-7 py-3 text-base sm:px-8 sm:py-3.5 sm:text-lg',
    xl: 'px-8 py-3.5 text-lg sm:px-10 sm:py-4 sm:text-xl',
  };

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-400',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500',
    correct: 'bg-green-500 hover:bg-green-400 text-white focus:ring-green-300',
    skip: 'bg-amber-500 hover:bg-amber-400 text-slate-900 focus:ring-amber-300', // Darker text for amber
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-400',
    config: `border-2 ${active ? 'bg-indigo-500 border-indigo-400 text-white scale-105 shadow-xl' : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500 text-slate-200'} focus:ring-indigo-400`,
    ghost: 'bg-transparent hover:bg-slate-700/70 text-slate-300 hover:text-white focus:ring-slate-500 shadow-none hover:shadow-none',
  };

  const widthStyle = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      type="button"
      className={`${baseStyles} ${sizeStyles[size]} ${variantClasses[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5 sm:w-5 sm:h-5">{icon}</span>}
      <span className="leading-tight">{children}</span>
    </button>
  );
};

export default Button;