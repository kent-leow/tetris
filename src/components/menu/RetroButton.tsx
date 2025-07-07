'use client';

import React from 'react';

/**
 * Retro-styled button component with pixel-perfect styling
 * Features neon borders, hover effects, and 8-bit aesthetic
 */

interface RetroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  autoFocus?: boolean;
  tabIndex?: number;
  role?: string;
  type?: 'button' | 'submit' | 'reset';
  'aria-disabled'?: boolean;
  'aria-haspopup'?: boolean | "dialog" | "grid" | "listbox" | "menu" | "tree";
  'aria-expanded'?: boolean;
  'aria-label'?: string;
}

const variantClasses = {
  primary: {
    base: 'bg-blue-900 border-cyan-400 text-cyan-400',
    hover: 'hover:bg-cyan-900 hover:text-cyan-300 hover:border-cyan-300',
    focus: 'focus:bg-cyan-800 focus:border-cyan-200',
    disabled: 'disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-600',
  },
  secondary: {
    base: 'bg-purple-900 border-purple-400 text-purple-400',
    hover: 'hover:bg-purple-800 hover:text-purple-300 hover:border-purple-300',
    focus: 'focus:bg-purple-700 focus:border-purple-200',
    disabled: 'disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-600',
  },
  accent: {
    base: 'bg-green-900 border-green-400 text-green-400',
    hover: 'hover:bg-green-800 hover:text-green-300 hover:border-green-300',
    focus: 'focus:bg-green-700 focus:border-green-200',
    disabled: 'disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-600',
  },
  warning: {
    base: 'bg-orange-900 border-orange-400 text-orange-400',
    hover: 'hover:bg-orange-800 hover:text-orange-300 hover:border-orange-300',
    focus: 'focus:bg-orange-700 focus:border-orange-200',
    disabled: 'disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-600',
  },
};

const sizeClasses = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-6 text-base',
  lg: 'py-4 px-8 text-lg',
};

const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  autoFocus,
  tabIndex,
  role,
  type = 'button',
  'aria-disabled': ariaDisabled,
  'aria-haspopup': ariaHaspopup,
  'aria-expanded': ariaExpanded,
  'aria-label': ariaLabel,
}, ref) => {
  const variantStyle = variantClasses[variant];
  
  const baseClasses = [
    'relative',
    'font-mono font-bold tracking-wider uppercase',
    'border-2',
    'rounded-none', // Sharp corners for retro feel
    'transition-all duration-200',
    'focus:outline-none focus:ring-0',
    'transform hover:scale-105 active:scale-95',
    'cursor-pointer disabled:cursor-not-allowed',
    sizeClasses[size],
    variantStyle.base,
    variantStyle.hover,
    variantStyle.focus,
    variantStyle.disabled,
  ].join(' ');

  const glowStyle = !disabled ? {
    boxShadow: `
      0 0 10px currentColor,
      inset 0 0 10px rgba(255, 255, 255, 0.1)
    `,
    textShadow: `
      0 0 5px currentColor,
      0 0 10px currentColor
    `,
  } : {};

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      autoFocus={autoFocus}
      tabIndex={tabIndex}
      role={role}
      type={type}
      aria-disabled={ariaDisabled}
      aria-haspopup={ariaHaspopup}
      aria-expanded={ariaExpanded}
      aria-label={ariaLabel}
      style={glowStyle}
    >
      {/* Background overlay for extra glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-5 pointer-events-none" />
      
      {/* Scanline effect overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.1) 2px,
            rgba(255, 255, 255, 0.1) 4px
          )`,
        }}
      />
      
      {/* Button content */}
      <span className="relative z-10">
        {children}
      </span>
    </button>
  );
});

RetroButton.displayName = 'RetroButton';

export default React.memo(RetroButton);
