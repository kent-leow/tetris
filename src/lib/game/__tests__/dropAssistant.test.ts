/**
 * Drop Assistant Tests
 * 
 * Comprehensive tests for the drop assistant feature that shows where tetrominos will land.
 * This feature helps players visualize piece placement for more precise gameplay.
 */

import { 
  getDropPosition, 
  createEmptyBoard, 
  checkCollision, 
  placeTetromino,
  getRandomTetromino,
  rotateTetromino,
  Board,
  Tetromino,
  Point,
  TetrominoType
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

// Test helper to create a board with specific obstacles
const createBoardWithObstacles = (obstacles: Array<{ x: number; y: number; type: TetrominoType }>): Board => {
  const board = createEmptyBoard();
  obstacles.forEach(({ x, y, type }) => {
    board[y][x] = type;
  });
  return board;
};

describe('Drop Assistant - Basic Functionality', () => {
  test('should calculate correct drop position for I-piece on empty board', () => {
    const board = createEmptyBoard();
    const iPiece = createTetromino('I');
    const startPos: Point = { x: 3, y: 0 };
    
    const dropPos = getDropPosition(board, iPiece, startPos);
    
    expect(dropPos.x).toBe(3);
    expect(dropPos.y).toBe(18); // Should be at row 18 (bottom minus piece height)
  });

  test('should calculate drop position with existing pieces on board', () => {
    const board = createBoardWithObstacles([
      { x: 3, y: 19, type: 'O' },
      { x: 4, y: 19, type: 'O' },
      { x: 5, y: 19, type: 'O' },
      { x: 6, y: 19, type: 'O' },
    ]);
    const iPiece = createTetromino('I');
    const startPos: Point = { x: 3, y: 0 };
    
    const dropPos = getDropPosition(board, iPiece, startPos);
    
    expect(dropPos.x).toBe(3);
    expect(dropPos.y).toBe(17); // Should stop one row above the obstacles
  });

  test('should calculate drop position for all tetromino shapes', () => {
    const board = createEmptyBoard();
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    
    types.forEach(type => {
      const piece = createTetromino(type);
      const startPos: Point = { x: 3, y: 0 };
      
      const dropPos = getDropPosition(board, piece, startPos);
      
      expect(dropPos.x).toBe(3);
      expect(dropPos.y).toBeGreaterThanOrEqual(0);
      expect(dropPos.y).toBeLessThan(20);
      expect(checkCollision(board, piece, dropPos)).toBe(false);
      expect(checkCollision(board, piece, { x: dropPos.x, y: dropPos.y + 1 })).toBe(true);
    });
  });

  test('should handle edge cases and board boundaries', () => {
    const board = createEmptyBoard();
    const iPiece = createTetromino('I');
    
    // Test left edge
    const leftEdgePos = getDropPosition(board, iPiece, { x: 0, y: 0 });
    expect(leftEdgePos.x).toBe(0);
    expect(checkCollision(board, iPiece, leftEdgePos)).toBe(false);
    
    // Test right edge
    const rightEdgePos = getDropPosition(board, iPiece, { x: 6, y: 0 });
    expect(rightEdgePos.x).toBe(6);
    expect(checkCollision(board, iPiece, rightEdgePos)).toBe(false);
  });

  test('should update drop position as piece moves horizontally', () => {
    const board = createBoardWithObstacles([
      { x: 5, y: 19, type: 'O' }, // Obstacle on the right side
    ]);
    const iPiece = createTetromino('I');
    
    const leftDropPos = getDropPosition(board, iPiece, { x: 1, y: 5 });
    const rightDropPos = getDropPosition(board, iPiece, { x: 5, y: 5 });
    
    expect(leftDropPos.y).toBe(18); // No obstacle, drops to bottom
    expect(rightDropPos.y).toBe(17); // Obstacle present, stops earlier
  });

  test('should update drop position when piece rotates', () => {
    const board = createEmptyBoard();
    const iPiece = createTetromino('I');
    const rotatedI = rotateTetromino(iPiece);
    const startPos: Point = { x: 3, y: 0 };
    
    const originalDropPos = getDropPosition(board, iPiece, startPos);
    const rotatedDropPos = getDropPosition(board, rotatedI, startPos);
    
    // Rotated I-piece should have different drop position due to different shape
    expect(originalDropPos.y).not.toBe(rotatedDropPos.y);
  });
});

describe('Drop Assistant - Performance', () => {
  test('should calculate drop position efficiently', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('T');
    const startPos: Point = { x: 3, y: 0 };
    
    const startTime = performance.now();
    for (let i = 0; i < 1000; i++) {
      getDropPosition(board, piece, startPos);
    }
    const endTime = performance.now();
    
    const averageTime = (endTime - startTime) / 1000;
    expect(averageTime).toBeLessThan(1); // Should be less than 1ms per calculation
  });

  test('should handle complex board configurations efficiently', () => {
    // Create a complex board with many obstacles
    const obstacles = [];
    for (let y = 10; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        if (Math.random() > 0.5) {
          obstacles.push({ x, y, type: 'O' as TetrominoType });
        }
      }
    }
    const board = createBoardWithObstacles(obstacles);
    const piece = createTetromino('T');
    
    const startTime = performance.now();
    getDropPosition(board, piece, { x: 3, y: 0 });
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(10); // Should complete quickly even with complex board
  });
});

describe('Drop Assistant - Edge Cases', () => {
  test('should handle piece that cannot drop further', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('O');
    const bottomPos: Point = { x: 3, y: 18 };
    
    const dropPos = getDropPosition(board, piece, bottomPos);
    
    expect(dropPos).toEqual(bottomPos); // Should return same position if already at bottom
  });

  test('should handle piece at invalid starting position', () => {
    const board = createEmptyBoard();
    // Fill the top row to create collision at starting position
    for (let x = 0; x < 10; x++) {
      board[1][x] = 'O';
    }
    const piece = createTetromino('O');
    const blockedPos: Point = { x: 3, y: 0 };
    
    // Should still calculate a valid drop position without throwing
    expect(() => {
      getDropPosition(board, piece, blockedPos);
    }).not.toThrow();
  });

  test('should handle full board scenario', () => {
    const board = createEmptyBoard();
    // Fill most of the board
    for (let y = 2; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        board[y][x] = 'O';
      }
    }
    const piece = createTetromino('I');
    const startPos: Point = { x: 3, y: 0 };
    
    const dropPos = getDropPosition(board, piece, startPos);
    
    expect(dropPos.y).toBe(0); // Should stay at top if board is full
  });
});

describe('Drop Assistant - All Tetromino Types and Rotations', () => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  
  types.forEach(type => {
    test(`should handle ${type} piece in all rotations`, () => {
      const board = createEmptyBoard();
      let piece = createTetromino(type);
      const startPos: Point = { x: 3, y: 0 };
      
      // Test all 4 rotations
      for (let rotation = 0; rotation < 4; rotation++) {
        const dropPos = getDropPosition(board, piece, startPos);
        
        expect(dropPos.x).toBe(3);
        expect(dropPos.y).toBeGreaterThanOrEqual(0);
        expect(dropPos.y).toBeLessThan(20);
        expect(checkCollision(board, piece, dropPos)).toBe(false);
        
        piece = rotateTetromino(piece);
      }
    });
  });
});

describe('Drop Assistant - Integration with Game Mechanics', () => {
  test('should work correctly with piece placement', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('T');
    const startPos: Point = { x: 3, y: 0 };
    
    const dropPos = getDropPosition(board, piece, startPos);
    const boardWithPiece = placeTetromino(board, piece, dropPos);
    
    // Verify piece was placed correctly at the drop position
    expect(boardWithPiece[dropPos.y + 1][dropPos.x + 1]).toBe('T'); // T-piece center
    expect(boardWithPiece[dropPos.y + 2][dropPos.x]).toBe('T'); // T-piece left
    expect(boardWithPiece[dropPos.y + 2][dropPos.x + 1]).toBe('T'); // T-piece center bottom
    expect(boardWithPiece[dropPos.y + 2][dropPos.x + 2]).toBe('T'); // T-piece right
  });

  test('should provide consistent results with collision detection', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('L');
    const startPos: Point = { x: 4, y: 5 };
    
    const dropPos = getDropPosition(board, piece, startPos);
    
    // The drop position should not cause collision
    expect(checkCollision(board, piece, dropPos)).toBe(false);
    
    // One position lower should cause collision
    expect(checkCollision(board, piece, { x: dropPos.x, y: dropPos.y + 1 })).toBe(true);
  });
});

describe('Drop Assistant - Boundary Conditions', () => {
  test('should handle piece near left boundary', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('J');
    
    const dropPos = getDropPosition(board, piece, { x: 0, y: 0 });
    
    expect(dropPos.x).toBe(0);
    expect(checkCollision(board, piece, dropPos)).toBe(false);
  });

  test('should handle piece near right boundary', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('L');
    
    const dropPos = getDropPosition(board, piece, { x: 7, y: 0 });
    
    expect(dropPos.x).toBe(7);
    expect(checkCollision(board, piece, dropPos)).toBe(false);
  });

  test('should handle very tall obstacles', () => {
    const board = createEmptyBoard();
    // Create a tall obstacle
    for (let y = 5; y < 20; y++) {
      board[y][4] = 'I';
      board[y][5] = 'I';
    }
    
    const piece = createTetromino('O');
    const dropPos = getDropPosition(board, piece, { x: 4, y: 0 });
    
    expect(dropPos.y).toBe(3); // Should stop above the tall obstacle
  });
});
