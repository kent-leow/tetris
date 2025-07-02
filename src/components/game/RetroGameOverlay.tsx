'use client';

import React from 'react';
import RetroText from '../menu/RetroText';
import RetroButton from '../menu/RetroButton';

/**
 * Retro-styled game overlay for consistent UI elements
 * Used for game start screens, pause screens, etc.
 */

interface RetroGameOverlayProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPrimaryAction?: () => void;
  primaryActionText?: string;
  onSecondaryAction?: () => void;
  secondaryActionText?: string;
  controls?: Array<{ key: string; action: string }>;
  className?: string;
}

const RetroGameOverlay: React.FC<RetroGameOverlayProps> = ({
  title,
  subtitle,
  children,
  onPrimaryAction,
  primaryActionText = "Start",
  onSecondaryAction,
  secondaryActionText = "Back",
  controls,
  className = "",
}) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${className}`}
      style={{
        background: `
          radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%),
          linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(25, 25, 112, 0.1) 100%)
        `,
      }}
    >
      <div
        className="bg-gray-900 border-2 border-cyan-400 shadow-2xl p-8 w-full max-w-lg mx-4 text-center"
        style={{
          background: `
            linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)
          `,
          boxShadow: `
            0 0 30px rgba(34, 211, 238, 0.5),
            inset 0 0 20px rgba(34, 211, 238, 0.1)
          `,
        }}
      >
        {/* Title */}
        <div className="mb-6">
          <RetroText size="3xl" variant="primary" glow scanlines>
            {title}
          </RetroText>
          {subtitle && (
            <div className="mt-2">
              <RetroText size="md" variant="secondary" glow={false} className="opacity-80">
                {subtitle}
              </RetroText>
            </div>
          )}
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
        </div>

        {/* Custom content */}
        {children && (
          <div className="mb-6">
            {children}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 mb-6">
          {onPrimaryAction && (
            <RetroButton
              onClick={onPrimaryAction}
              variant="primary"
              size="lg"
              className="w-full"
              autoFocus
            >
              {primaryActionText}
            </RetroButton>
          )}
          
          {onSecondaryAction && (
            <RetroButton
              onClick={onSecondaryAction}
              variant="secondary"
              size="md"
              className="w-full"
            >
              {secondaryActionText}
            </RetroButton>
          )}
        </div>

        {/* Controls help */}
        {controls && controls.length > 0 && (
          <div className="border-t border-cyan-400 border-opacity-30 pt-4">
            <RetroText size="sm" variant="accent" glow={false} className="mb-3">
              Controls
            </RetroText>
            <div className="grid grid-cols-1 gap-2 text-left">
              {controls.map((control, index) => (
                <div key={index} className="flex justify-between items-center">
                  <RetroText size="sm" variant="secondary" glow={false} className="font-mono">
                    {control.key}
                  </RetroText>
                  <RetroText size="sm" variant="primary" glow={false}>
                    {control.action}
                  </RetroText>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decorative scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(34, 211, 238, 0.3) 2px,
              rgba(34, 211, 238, 0.3) 4px
            )`,
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(RetroGameOverlay);
