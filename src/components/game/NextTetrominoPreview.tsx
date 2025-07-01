import React from 'react';
import { Tetromino } from '../../lib/game/types';

/**
 * NextTetrominoPreview
 * Visual preview of the next tetromino (4x4 grid), matching single player style.
 */
const NextTetrominoPreview: React.FC<{ tetromino: Tetromino }> = ({ tetromino }) => (
  <div className="flex flex-col items-center">
    <div className="text-sm mb-1">Next</div>
    <div className="grid grid-rows-4 grid-cols-4 gap-[1px] bg-gray-700 rounded">
      {tetromino.shape.flat().map((cell: number, i: number) => (
        <div
          key={i}
          className={`w-5 h-5 ${cell ? `tetromino-${tetromino.type}` : 'bg-gray-900'} border border-gray-800`}
        />
      ))}
    </div>
  </div>
);

export default NextTetrominoPreview;
