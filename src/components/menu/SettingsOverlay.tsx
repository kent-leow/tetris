'use client';

import React, { useCallback } from 'react';
import { useSettingsStore } from '../../lib/settings/store';
import RetroButton from './RetroButton';
import RetroText from './RetroText';

interface SettingsOverlayProps {
  /** Whether the settings overlay is open */
  open: boolean;
  /** Callback when the overlay should be closed */
  onClose: () => void;
}

/**
 * SettingsOverlay component displays a modal for game settings.
 * Includes volume controls and assistant toggle.
 * Accessible via keyboard and screen reader.
 */
const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ open, onClose }) => {
  const {
    musicVolume,
    sfxVolume,
    assistantEnabled,
    setMusicVolume,
    setSfxVolume,
    setAssistantEnabled,
    resetSettings,
  } = useSettingsStore();

  const handleMusicVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setMusicVolume(value);
  }, [setMusicVolume]);

  const handleSfxVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setSfxVolume(value);
  }, [setSfxVolume]);

  const handleAssistantToggle = useCallback(() => {
    setAssistantEnabled(!assistantEnabled);
  }, [assistantEnabled, setAssistantEnabled]);

  const handleReset = useCallback(() => {
    resetSettings();
  }, [resetSettings]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      aria-describedby="settings-description"
    >
      <div
        className="bg-gray-900 border-2 border-cyan-400 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2>
            <RetroText
              size="2xl"
              variant="primary"
              glow
              scanlines
              className="mb-2"
            >
              Settings
            </RetroText>
          </h2>
          <p>
            <RetroText
              size="sm"
              variant="secondary"
              className="opacity-80"
            >
              Customize your game experience
            </RetroText>
          </p>
        </div>

        {/* Settings Controls */}
        <div className="space-y-6">
          {/* Music Volume */}
          <div className="space-y-2">
            <label htmlFor="music-volume">
              <RetroText size="lg" variant="secondary" className="block">
                Music Volume
              </RetroText>
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="music-volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                className="flex-1 h-2 bg-gray-700 rounded-none appearance-none slider-thumb"
                style={{
                  background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${musicVolume * 100}%, #374151 ${musicVolume * 100}%, #374151 100%)`,
                }}
                aria-label={`Music volume: ${Math.round(musicVolume * 100)}%`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(musicVolume * 100)}
              />
              <RetroText size="sm" variant="accent" className="w-12 text-right">
                {Math.round(musicVolume * 100)}%
              </RetroText>
            </div>
          </div>

          {/* Sound Effects Volume */}
          <div className="space-y-2">
            <label htmlFor="sfx-volume">
              <RetroText size="lg" variant="secondary" className="block">
                Sound Effects Volume
              </RetroText>
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="sfx-volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sfxVolume}
                onChange={handleSfxVolumeChange}
                className="flex-1 h-2 bg-gray-700 rounded-none appearance-none slider-thumb"
                style={{
                  background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${sfxVolume * 100}%, #374151 ${sfxVolume * 100}%, #374151 100%)`,
                }}
                aria-label={`Sound effects volume: ${Math.round(sfxVolume * 100)}%`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sfxVolume * 100)}
              />
              <RetroText size="sm" variant="accent" className="w-12 text-right">
                {Math.round(sfxVolume * 100)}%
              </RetroText>
            </div>
          </div>

          {/* Drop Assistant Toggle */}
          <div className="space-y-2">
            <RetroText size="lg" variant="secondary" className="block">
              Drop Assistant
            </RetroText>
            <div className="flex items-center justify-between">
              <RetroText size="sm" variant="secondary" className="opacity-80">
                Show where pieces will land
              </RetroText>
              <button
                onClick={handleAssistantToggle}
                className={`relative w-12 h-6 border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                  assistantEnabled 
                    ? 'bg-cyan-400 border-cyan-400' 
                    : 'bg-gray-700 border-gray-600'
                }`}
                style={{
                  boxShadow: assistantEnabled ? '0 0 10px rgba(34, 211, 238, 0.5)' : 'none',
                }}
                aria-label={`Drop assistant: ${assistantEnabled ? 'enabled' : 'disabled'}`}
                aria-pressed={assistantEnabled}
                role="switch"
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white transition-transform duration-200 ${
                    assistantEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <RetroButton
            onClick={handleReset}
            variant="accent"
            size="md"
            className="w-full"
          >
            Reset to Defaults
          </RetroButton>
          
          <RetroButton
            onClick={onClose}
            variant="primary"
            size="md"
            className="w-full"
            autoFocus
          >
            Close
          </RetroButton>
        </div>

        {/* Keyboard Instructions */}
        <div className="mt-4 text-center">
          <RetroText size="sm" variant="secondary" className="opacity-60">
            Press ESC to close • Tab to navigate
          </RetroText>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #22d3ee;
          border: 2px solid #0891b2;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #22d3ee;
          border: 2px solid #0891b2;
          cursor: pointer;
          border-radius: 0;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }
        .slider-thumb:focus::-webkit-slider-thumb {
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.8);
        }
        .slider-thumb:focus::-moz-range-thumb {
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.8);
        }
      `}</style>
    </div>
  );
};

export default SettingsOverlay;
