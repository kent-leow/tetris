'use client';

import React from 'react';
import AnimatedBackground from '../menu/AnimatedBackground';

/**
 * Retro-styled layout wrapper for game pages
 * Provides consistent retro aesthetic across all game modes
 */

interface RetroGameLayoutProps {
  children: React.ReactNode;
  title?: string;
  showAnimatedBg?: boolean;
}

const RetroGameLayout: React.FC<RetroGameLayoutProps> = ({ 
  children, 
  showAnimatedBg = false 
}) => {
  return (
    <div 
      className="relative w-screen h-screen overflow-hidden"
      style={{
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      {/* Animated background (optional, lighter for gameplay) */}
      {showAnimatedBg && (
        <div className="opacity-20">
          <AnimatedBackground />
        </div>
      )}
      
      {/* Static retro background for gameplay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(25, 25, 112, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a15 0%, #111122 25%, #0f1419 50%, #0a0a15 100%)
          `,
        }}
      />
      
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Scanline overlay for retro effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0, 255, 0, 0.1) 3px,
            rgba(0, 255, 0, 0.1) 6px
          )`,
        }}
      />
      
      {/* Content */}
      <div 
        className="relative z-10 w-full h-full overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default React.memo(RetroGameLayout);
