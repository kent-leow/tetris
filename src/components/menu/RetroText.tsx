'use client';

import React from 'react';

/**
 * Retro-styled typography component with pixel font effects
 * Features neon glow, scanlines, and 8-bit styling
 */

interface RetroTextProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'warning';
  glow?: boolean;
  scanlines?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg', 
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
};

const variantClasses = {
  primary: 'text-cyan-400',
  secondary: 'text-green-400', 
  accent: 'text-yellow-400',
  warning: 'text-red-400',
};

const RetroText: React.FC<RetroTextProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  glow = true,
  scanlines = false,
  className = '',
}) => {
  const baseClasses = [
    'font-mono font-bold tracking-wider',
    sizeClasses[size],
    variantClasses[variant],
  ];

  const glowStyle = glow ? {
    textShadow: `
      0 0 5px currentColor,
      0 0 10px currentColor,
      0 0 15px currentColor,
      0 0 20px currentColor
    `,
  } : {};

  const scanlinesOverlay = scanlines && (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 1px,
          rgba(0, 0, 0, 0.3) 1px,
          rgba(0, 0, 0, 0.3) 2px
        )`,
      }}
    />
  );

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className={baseClasses.join(' ')}
        style={{
          ...glowStyle,
          fontFamily: 'monospace, "Courier New", Courier',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {children}
      </span>
      {scanlinesOverlay}
    </div>
  );
};

export default React.memo(RetroText);
