'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { TetrominoType, getRandomTetromino } from '../../lib/game/types';

/**
 * Animated background component for retro-style falling tetromino blocks
 * Features multiple depth layers with parallax effect, blur, and scaling
 */

interface AnimatedBlock {
  id: string;
  type: TetrominoType;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  layer: number; // 0 = far, 3 = near
  opacity: number;
  scale: number;
  rotationSpeed: number;
}

interface LayerConfig {
  blur: number;
  opacity: number;
  speed: number;
  scale: number;
  spawnRate: number; // blocks per second
}

const LAYER_CONFIGS: LayerConfig[] = [
  // Far layer (layer 0)
  { blur: 8, opacity: 0.2, speed: 0.3, scale: 0.4, spawnRate: 0.5 },
  // Mid-far layer (layer 1)
  { blur: 4, opacity: 0.4, speed: 0.5, scale: 0.6, spawnRate: 0.7 },
  // Mid-near layer (layer 2)
  { blur: 2, opacity: 0.6, speed: 0.8, scale: 0.8, spawnRate: 0.9 },
  // Near layer (layer 3)
  { blur: 0, opacity: 0.8, speed: 1.2, scale: 1.0, spawnRate: 1.1 },
];

const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#00f5ff', // Cyan
  O: '#ffed4e', // Yellow
  T: '#a855f7', // Purple
  S: '#22c55e', // Green
  Z: '#ef4444', // Red
  J: '#3b82f6', // Blue
  L: '#f97316', // Orange
};

const AnimatedBackground: React.FC = () => {
  const [blocks, setBlocks] = useState<AnimatedBlock[]>([]);
  const lastSpawnTimeRef = useRef<Record<number, number>>({});

  /**
   * Creates a new animated block at a random position
   */
  const createBlock = useCallback((layer: number): AnimatedBlock => {
    const config = LAYER_CONFIGS[layer];
    const tetromino = getRandomTetromino();
    
    return {
      id: `${Date.now()}-${Math.random()}`,
      type: tetromino.type,
      x: Math.random() * 100, // Percentage of screen width
      y: -10, // Start above screen
      rotation: Math.random() * 360,
      speed: config.speed * (0.8 + Math.random() * 0.4), // ±20% variation
      layer,
      opacity: config.opacity * (0.8 + Math.random() * 0.4),
      scale: config.scale * (0.8 + Math.random() * 0.4),
      rotationSpeed: (Math.random() - 0.5) * 2, // -1 to 1 degrees per frame
    };
  }, []);

  /**
   * Renders a tetromino block as a simple geometric shape
   */
  const renderTetrominoBlock = useCallback((type: TetrominoType, block: AnimatedBlock): React.ReactElement => {
    const baseSize = 16; // Smaller base size for better performance
    const size = baseSize * block.scale;
    
    // Simple block representation for performance
    return (
      <div
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: 'currentColor',
          border: '1px solid currentColor',
        }}
      />
    );
  }, []);

  /**
   * Renders a single animated block
   */
  const renderBlock = useCallback((block: AnimatedBlock) => {
    const config = LAYER_CONFIGS[block.layer];
    
    return (
      <div
        key={block.id}
        className="absolute pointer-events-none"
        style={{
          left: `${block.x}%`,
          top: `${block.y}px`,
          transform: `scale(${block.scale}) rotate(${block.rotation}deg)`,
          opacity: block.opacity,
          filter: `blur(${config.blur}px)`,
          color: TETROMINO_COLORS[block.type],
          zIndex: block.layer,
          textShadow: '0 0 10px currentColor',
        }}
      >
        {renderTetrominoBlock(block.type, block)}
      </div>
    );
  }, [renderTetrominoBlock]);

  /**
   * Animation loop for updating block positions
   */
  const animate = useCallback(() => {
    const now = Date.now();

    setBlocks((prevBlocks: AnimatedBlock[]) => {
      // Spawn new blocks based on spawn rates
      const newBlocks = [...prevBlocks];
      
      LAYER_CONFIGS.forEach((config, layer) => {
        const lastSpawn = lastSpawnTimeRef.current[layer] || 0;
        const timeSinceSpawn = now - lastSpawn;
        const spawnInterval = 1000 / config.spawnRate; // Convert to milliseconds

        if (timeSinceSpawn >= spawnInterval) {
          newBlocks.push(createBlock(layer));
          lastSpawnTimeRef.current[layer] = now;
        }
      });

      // Update existing blocks and filter out off-screen ones
      return newBlocks
        .map(block => ({
          ...block,
          y: block.y + block.speed,
          rotation: block.rotation + block.rotationSpeed,
        }))
        .filter(block => block.y < window.innerHeight + 100); // Remove blocks that are off-screen
    });
  }, [createBlock]);

  /**
   * Start animation on mount
   */
  useEffect(() => {
    // Initialize spawn times
    LAYER_CONFIGS.forEach((_, layer) => {
      lastSpawnTimeRef.current[layer] = Date.now();
    });

    const intervalId = setInterval(animate, 32); // ~30fps for better performance

    return () => {
      clearInterval(intervalId);
    };
  }, [animate]);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(138, 43, 226, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(25, 25, 112, 0.4) 0%, transparent 50%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 100%)
        `,
      }}
      aria-hidden="true"
    >
      {/* Animated blocks */}
      {blocks.map(renderBlock)}
      
      {/* Scanline overlay for retro effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.1) 2px,
            rgba(0, 255, 0, 0.1) 4px
          )`,
        }}
      />
    </div>
  );
};

export default React.memo(AnimatedBackground);
