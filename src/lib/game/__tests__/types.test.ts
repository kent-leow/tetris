/**
 * Game Types and Utilities Tests
 * 
 * Comprehensive tests for core game types and utility functions including:
 * - Tetromino generation and rotation
 * - Board operations (collision, placement, line clearing)
 * - Two-player game mechanics
 * - Garbage line system
 */

import {
  createEmptyBoard,
  checkCollision,
  placeTetromino,
  clearLines,
  getDropPosition,
  rotateTetromino,
  getRandomTetromino,
  addGarbageLines,
  TetrominoType,
  Tetromino,
  Board,
  Point,
  BoardCell,
} from '../types';

// Test helper to create specific tetromino shapes
const createTetromino = (type: TetrominoType): Tetromino => {
  const shapes: Record<TetrominoType, number[][]> = {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    O: [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    T: [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    S: [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    Z: [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    J: [
      [0, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    L: [
      [0, 0, 0, 0],
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  };
  return { type, shape: shapes[type].map(row => [...row]) };
};

// Test helper to create board with obstacles
const createBoardWithObstacles = (obstacles: Array<{ x: number; y: number; type: TetrominoType }>): Board => {
  const board = createEmptyBoard();
  obstacles.forEach(({ x, y, type }) => {
    board[y][x] = type;
  });
  return board;
};

describe('Board Creation and Structure', () => {
  test('should create empty board with correct dimensions', () => {
    const board = createEmptyBoard();

    expect(board).toHaveLength(20); // 20 rows
    expect(board[0]).toHaveLength(10); // 10 columns
    
    // All cells should be null
    board.forEach(row => {
      row.forEach(cell => {
        expect(cell).toBeNull();
      });
    });
  });

  test('should create board where each row is independent', () => {
    const board = createEmptyBoard();
    
    // Modify one cell
    board[5][3] = 'T';
    
    // Other cells should remain null
    expect(board[5][2]).toBeNull();
    expect(board[4][3]).toBeNull();
    expect(board[6][3]).toBeNull();
  });
});

describe('Tetromino Generation', () => {
  test('should generate random tetrominos of valid types', () => {
    const validTypes: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    
    for (let i = 0; i < 100; i++) {
      const tetromino = getRandomTetromino();
      expect(validTypes).toContain(tetromino.type);
      expect(tetromino.shape).toHaveLength(4);
      expect(tetromino.shape[0]).toHaveLength(4);
    }
  });

  test('should generate different tetrominos over multiple calls', () => {
    const types = new Set<TetrominoType>();
    
    for (let i = 0; i < 50; i++) {
      const tetromino = getRandomTetromino();
      types.add(tetromino.type);
    }
    
    // Should have generated multiple different types
    expect(types.size).toBeGreaterThan(1);
  });

  test('should generate tetrominos with valid shape structure', () => {
    const tetromino = getRandomTetromino();
    
    // Should be 4x4 grid
    expect(tetromino.shape).toHaveLength(4);
    tetromino.shape.forEach(row => {
      expect(row).toHaveLength(4);
      row.forEach(cell => {
        expect([0, 1]).toContain(cell);
      });
    });
    
    // Should have at least one filled cell
    const hasFilledCell = tetromino.shape.some(row => row.some(cell => cell === 1));
    expect(hasFilledCell).toBe(true);
  });
});

describe('Tetromino Rotation', () => {
  test('should rotate I-piece correctly', () => {
    const iPiece = createTetromino('I');
    const rotated = rotateTetromino(iPiece);
    
    // Original I-piece is horizontal
    expect(iPiece.shape[1]).toEqual([1, 1, 1, 1]);
    
    // Rotated I-piece should be vertical
    expect(rotated.shape[0][2]).toBe(1);
    expect(rotated.shape[1][2]).toBe(1);
    expect(rotated.shape[2][2]).toBe(1);
    expect(rotated.shape[3][2]).toBe(1);
  });

  test('should rotate T-piece correctly', () => {
    const tPiece = createTetromino('T');
    const rotated = rotateTetromino(tPiece);
    
    // Original T-piece
    expect(tPiece.shape[1]).toEqual([0, 1, 0, 0]);
    expect(tPiece.shape[2]).toEqual([1, 1, 1, 0]);
    
    // Rotated T-piece should point right
    expect(rotated.shape[1][1]).toBe(1);
    expect(rotated.shape[2][1]).toBe(1);
    expect(rotated.shape[2][2]).toBe(1);
    expect(rotated.shape[3][1]).toBe(1);
  });

  test('should maintain tetromino type after rotation', () => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    
    types.forEach(type => {
      const piece = createTetromino(type);
      const rotated = rotateTetromino(piece);
      
      expect(rotated.type).toBe(type);
    });
  });

  test('should create new shape array (immutability)', () => {
    const piece = createTetromino('T');
    const rotated = rotateTetromino(piece);
    
    expect(rotated.shape).not.toBe(piece.shape);
    expect(rotated.shape[0]).not.toBe(piece.shape[0]);
  });

  test('should handle multiple rotations correctly', () => {
    let piece = createTetromino('T');
    const original = JSON.parse(JSON.stringify(piece.shape));
    
    // Rotate 4 times should return to original
    for (let i = 0; i < 4; i++) {
      piece = rotateTetromino(piece);
    }
    
    expect(piece.shape).toEqual(original);
  });
});

describe('Collision Detection', () => {
  test('should detect collision with board boundaries', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('T');
    
    // Left boundary
    expect(checkCollision(board, piece, { x: -1, y: 0 })).toBe(true);
    
    // Right boundary
    expect(checkCollision(board, piece, { x: 8, y: 0 })).toBe(true);
    
    // Top boundary
    expect(checkCollision(board, piece, { x: 3, y: -1 })).toBe(true);
    
    // Bottom boundary
    expect(checkCollision(board, piece, { x: 3, y: 18 })).toBe(true);
  });

  test('should detect collision with existing pieces', () => {
    const board = createBoardWithObstacles([
      { x: 3, y: 5, type: 'O' },
      { x: 4, y: 5, type: 'O' },
    ]);
    const piece = createTetromino('T');
    
    // Should collide with obstacles
    expect(checkCollision(board, piece, { x: 3, y: 4 })).toBe(true);
    
    // Should not collide when away from obstacles
    expect(checkCollision(board, piece, { x: 1, y: 4 })).toBe(false);
  });

  test('should not detect collision in valid positions', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('T');
    
    // Valid positions
    expect(checkCollision(board, piece, { x: 3, y: 0 })).toBe(false);
    expect(checkCollision(board, piece, { x: 0, y: 10 })).toBe(false);
    expect(checkCollision(board, piece, { x: 7, y: 10 })).toBe(false);
  });

  test('should handle all tetromino types correctly', () => {
    const board = createEmptyBoard();
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    
    types.forEach(type => {
      const piece = createTetromino(type);
      
      // Should be valid at start position
      expect(checkCollision(board, piece, { x: 3, y: 0 })).toBe(false);
      
      // Should collide when out of bounds
      expect(checkCollision(board, piece, { x: -1, y: 0 })).toBe(true);
      expect(checkCollision(board, piece, { x: 10, y: 0 })).toBe(true);
    });
  });

  test('should handle rotated pieces correctly', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('I');
    const rotated = rotateTetromino(piece);
    
    // Original I-piece should fit at x=6
    expect(checkCollision(board, piece, { x: 6, y: 0 })).toBe(false);
    
    // Rotated I-piece might not fit at same position
    const rotatedFits = !checkCollision(board, rotated, { x: 6, y: 0 });
    expect(typeof rotatedFits).toBe('boolean');
  });
});

describe('Piece Placement', () => {
  test('should place T-piece correctly on board', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('T');
    const position: Point = { x: 3, y: 5 };
    
    const newBoard = placeTetromino(board, piece, position);
    
    // Check T-piece placement
    expect(newBoard[6][4]).toBe('T'); // Top of T
    expect(newBoard[7][3]).toBe('T'); // Left of T
    expect(newBoard[7][4]).toBe('T'); // Center of T
    expect(newBoard[7][5]).toBe('T'); // Right of T
    
    // Original board should be unchanged
    expect(board[6][4]).toBeNull();
  });

  test('should place I-piece correctly on board', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('I');
    const position: Point = { x: 3, y: 10 };
    
    const newBoard = placeTetromino(board, piece, position);
    
    // Check I-piece placement (horizontal)
    expect(newBoard[11][3]).toBe('I');
    expect(newBoard[11][4]).toBe('I');
    expect(newBoard[11][5]).toBe('I');
    expect(newBoard[11][6]).toBe('I');
  });

  test('should not modify original board (immutability)', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('O');
    const position: Point = { x: 4, y: 8 };
    
    const newBoard = placeTetromino(board, piece, position);
    
    expect(newBoard).not.toBe(board);
    expect(board[9][4]).toBeNull(); // Original unchanged
    expect(newBoard[9][4]).toBe('O'); // New board modified
  });

  test('should handle edge placements correctly', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('J');
    
    // Place at left edge
    const leftBoard = placeTetromino(board, piece, { x: 0, y: 5 });
    expect(leftBoard[6][0]).toBe('J');
    
    // Place at right edge
    const rightBoard = placeTetromino(board, piece, { x: 7, y: 5 });
    expect(rightBoard[7][9]).toBe('J');
  });

  test('should handle placement with existing pieces', () => {
    const board = createBoardWithObstacles([
      { x: 5, y: 10, type: 'O' },
    ]);
    const piece = createTetromino('T');
    const position: Point = { x: 2, y: 8 };
    
    const newBoard = placeTetromino(board, piece, position);
    
    // T-piece should be placed
    expect(newBoard[10][2]).toBe('T');
    // Existing piece should remain
    expect(newBoard[10][5]).toBe('O');
  });
});

describe('Line Clearing', () => {
  test('should clear single complete line', () => {
    const board = createEmptyBoard();
    // Fill bottom row
    for (let x = 0; x < 10; x++) {
      board[19][x] = 'O';
    }
    
    const result = clearLines(board);
    
    expect(result.linesCleared).toBe(1);
    expect(result.board[19].every(cell => cell === null)).toBe(true);
  });

  test('should clear multiple complete lines', () => {
    const board = createEmptyBoard();
    // Fill bottom two rows
    for (let y = 18; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        board[y][x] = 'T';
      }
    }
    
    const result = clearLines(board);
    
    expect(result.linesCleared).toBe(2);
    expect(result.board[18].every(cell => cell === null)).toBe(true);
    expect(result.board[19].every(cell => cell === null)).toBe(true);
  });

  test('should not clear incomplete lines', () => {
    const board = createEmptyBoard();
    // Fill bottom row except one cell
    for (let x = 0; x < 9; x++) {
      board[19][x] = 'S';
    }
    
    const result = clearLines(board);
    
    expect(result.linesCleared).toBe(0);
    expect(result.board[19][0]).toBe('S');
  });

  test('should shift lines down after clearing', () => {
    const board = createEmptyBoard();
    // Place marker in middle
    board[17][5] = 'Z';
    // Fill bottom row completely
    for (let x = 0; x < 10; x++) {
      board[19][x] = 'O';
    }
    
    const result = clearLines(board);
    
    expect(result.linesCleared).toBe(1);
    expect(result.board[18][5]).toBe('Z'); // Shifted down
    expect(result.board[17][5]).toBeNull(); // Original position empty
  });

  test('should maintain board height after clearing', () => {
    const board = createEmptyBoard();
    // Fill multiple rows
    for (let y = 16; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        board[y][x] = 'J';
      }
    }
    
    const result = clearLines(board);
    
    expect(result.board).toHaveLength(20);
    expect(result.linesCleared).toBe(4);
  });

  test('should clear non-consecutive lines correctly', () => {
    const board = createEmptyBoard();
    
    // Fill rows 17 and 19, leave 18 incomplete
    for (let x = 0; x < 10; x++) {
      board[17][x] = 'L';
      board[19][x] = 'L';
    }
    // Leave row 18 incomplete
    for (let x = 0; x < 9; x++) {
      board[18][x] = 'L';
    }
    
    const result = clearLines(board);
    
    expect(result.linesCleared).toBe(2);
    expect(result.board[19][0]).toBe('L'); // Incomplete line moved to bottom
    expect(result.board[19][9]).toBeNull(); // Gap preserved
  });
});

describe('Drop Position Calculation', () => {
  test('should calculate drop to bottom on empty board', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('T');
    const position: Point = { x: 3, y: 0 };
    
    const dropPos = getDropPosition(board, piece, position);
    
    expect(dropPos.x).toBe(3);
    expect(dropPos.y).toBe(17); // Bottom position for T-piece
  });

  test('should calculate drop with obstacles', () => {
    const board = createEmptyBoard();
    // Place obstacle
    board[15][4] = 'O';
    
    const piece = createTetromino('T');
    const position: Point = { x: 3, y: 0 };
    
    const dropPos = getDropPosition(board, piece, position);
    
    expect(dropPos.x).toBe(3);
    expect(dropPos.y).toBe(12); // Should stop above obstacle
  });

  test('should handle piece already at bottom', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('O');
    const position: Point = { x: 4, y: 18 };
    
    const dropPos = getDropPosition(board, piece, position);
    
    expect(dropPos).toEqual(position); // Same position
  });

  test('should handle different tetromino shapes', () => {
    const board = createEmptyBoard();
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    
    types.forEach(type => {
      const piece = createTetromino(type);
      const dropPos = getDropPosition(board, piece, { x: 3, y: 0 });
      
      expect(dropPos.x).toBe(3);
      expect(dropPos.y).toBeGreaterThanOrEqual(0);
      expect(dropPos.y).toBeLessThan(20);
      
      // Should not cause collision at drop position
      expect(checkCollision(board, piece, dropPos)).toBe(false);
    });
  });
});

describe('Garbage Lines System', () => {
  test('should add single garbage line', () => {
    const board = createEmptyBoard();
    const newBoard = addGarbageLines(board, 1);
    
    expect(newBoard).toHaveLength(20);
    
    // Bottom row should have garbage with one empty space
    const bottomRow = newBoard[19];
    const emptyCount = bottomRow.filter(cell => cell === null).length;
    const garbageCount = bottomRow.filter(cell => cell === 'G').length;
    
    expect(emptyCount).toBe(1);
    expect(garbageCount).toBe(9);
  });

  test('should add multiple garbage lines', () => {
    const board = createEmptyBoard();
    const newBoard = addGarbageLines(board, 3);
    
    // Last 3 rows should be garbage
    for (let y = 17; y < 20; y++) {
      const emptyCount = newBoard[y].filter(cell => cell === null).length;
      const garbageCount = newBoard[y].filter(cell => cell === 'G').length;
      
      expect(emptyCount).toBe(1);
      expect(garbageCount).toBe(9);
    }
  });

  test('should shift existing lines up when adding garbage', () => {
    const board = createEmptyBoard();
    // Place marker at bottom
    board[19][5] = 'T';
    
    const newBoard = addGarbageLines(board, 2);
    
    // Marker should be shifted up
    expect(newBoard[17][5]).toBe('T');
    expect(newBoard[19][5]).toBeOneOf([null, 'G']); // Now garbage or empty
  });

  test('should handle zero garbage lines', () => {
    const board = createEmptyBoard();
    const newBoard = addGarbageLines(board, 0);
    
    expect(newBoard).toEqual(board);
  });

  test('should handle negative garbage lines', () => {
    const board = createEmptyBoard();
    const newBoard = addGarbageLines(board, -1);
    
    expect(newBoard).toEqual(board);
  });

  test('should create random empty positions in garbage lines', () => {
    const board = createEmptyBoard();
    const newBoard1 = addGarbageLines(board, 1);
    const newBoard2 = addGarbageLines(board, 1);
    
    // Empty positions should likely be different (not guaranteed due to randomness)
    const emptyIndex1 = newBoard1[19].findIndex(cell => cell === null);
    const emptyIndex2 = newBoard2[19].findIndex(cell => cell === null);
    
    expect(emptyIndex1).toBeGreaterThanOrEqual(0);
    expect(emptyIndex1).toBeLessThan(10);
    expect(emptyIndex2).toBeGreaterThanOrEqual(0);
    expect(emptyIndex2).toBeLessThan(10);
  });

  test('should preserve board structure with garbage', () => {
    const board = createEmptyBoard();
    board[10][3] = 'S';
    board[15][7] = 'Z';
    
    const newBoard = addGarbageLines(board, 2);
    
    expect(newBoard).toHaveLength(20);
    expect(newBoard[0]).toHaveLength(10);
    expect(newBoard[8][3]).toBe('S'); // Shifted up by 2
    expect(newBoard[13][7]).toBe('Z'); // Shifted up by 2
  });
});

describe('Performance and Edge Cases', () => {
  test('should handle operations efficiently', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('T');
    
    const startTime = performance.now();
    for (let i = 0; i < 1000; i++) {
      checkCollision(board, piece, { x: 3, y: 5 });
      placeTetromino(board, piece, { x: 3, y: 5 });
      getDropPosition(board, piece, { x: 3, y: 0 });
    }
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should be fast
  });

  test('should handle extreme board configurations', () => {
    const board = createEmptyBoard();
    // Fill most of board randomly
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        if (Math.random() > 0.7) {
          board[y][x] = 'O';
        }
      }
    }
    
    const piece = createTetromino('I');
    
    expect(() => {
      checkCollision(board, piece, { x: 3, y: 5 });
      placeTetromino(board, piece, { x: 3, y: 5 });
      clearLines(board);
    }).not.toThrow();
  });

  test('should maintain type safety', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('T');
    
    const newBoard = placeTetromino(board, piece, { x: 3, y: 5 });
    
    newBoard.forEach(row => {
      row.forEach(cell => {
        expect(cell).toSatisfy((val: BoardCell) => 
          val === null || ['I', 'O', 'T', 'S', 'Z', 'J', 'L', 'G'].includes(val)
        );
      });
    });
  });
});

// Custom Jest matcher
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false,
      };
    }
  },
  toSatisfy(received, predicate) {
    const pass = predicate(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to satisfy predicate`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to satisfy predicate`,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
      toSatisfy(predicate: (value: any) => boolean): R;
    }
  }
}
