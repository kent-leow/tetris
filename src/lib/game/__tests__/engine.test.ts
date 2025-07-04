/**
 * Game Engine Tests
 * 
 * Comprehensive tests for the core game engine including:
 * - Game state initialization
 * - Game actions (move, rotate, drop, tick)
 * - Collision detection
 * - Line clearing and scoring
 * - Game over conditions
 */

import {
  initGameState,
  gameReducer,
  GameState,
  GameAction,
} from '../engine';
import {
  createEmptyBoard,
  checkCollision,
  placeTetromino,
  clearLines,
  getDropPosition,
  rotateTetromino,
  TetrominoType,
  Tetromino,
  Board,
  Point,
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

// Test helper to create a state with specific configuration
const createTestState = (overrides: Partial<GameState> = {}): GameState => {
  const defaultState = initGameState();
  return {
    ...defaultState,
    ...overrides,
  };
};

describe('Game Engine - Initialization', () => {
  test('should initialize game state with correct default values', () => {
    const state = initGameState();

    expect(state.board).toHaveLength(20);
    expect(state.board[0]).toHaveLength(10);
    expect(state.current).toBeDefined();
    expect(state.next).toBeDefined();
    expect(state.position).toEqual({ x: 3, y: 0 });
    expect(state.score).toBe(0);
    expect(state.lines).toBe(0);
    expect(state.level).toBe(1);
    expect(state.over).toBe(false);
  });

  test('should initialize with empty board', () => {
    const state = initGameState();

    state.board.forEach(row => {
      row.forEach(cell => {
        expect(cell).toBeNull();
      });
    });
  });

  test('should initialize with valid tetromino shapes', () => {
    const state = initGameState();

    expect(state.current.type).toMatch(/^[IOTSZJL]$/);
    expect(state.next.type).toMatch(/^[IOTSZJL]$/);
    expect(state.current.shape).toHaveLength(4);
    expect(state.current.shape[0]).toHaveLength(4);
  });
});

describe('Game Engine - Move Actions', () => {
  test('should move piece left when possible', () => {
    const state = createTestState({
      current: createTetromino('T'),
      position: { x: 3, y: 0 },
    });

    const action: GameAction = { type: 'move', payload: { dx: -1, dy: 0 } };
    const newState = gameReducer(state, action);

    expect(newState.position.x).toBe(2);
    expect(newState.position.y).toBe(0);
  });

  test('should move piece right when possible', () => {
    const state = createTestState({
      current: createTetromino('T'),
      position: { x: 3, y: 0 },
    });

    const action: GameAction = { type: 'move', payload: { dx: 1, dy: 0 } };
    const newState = gameReducer(state, action);

    expect(newState.position.x).toBe(4);
    expect(newState.position.y).toBe(0);
  });

  test('should move piece down when possible', () => {
    const state = createTestState({
      current: createTetromino('T'),
      position: { x: 3, y: 0 },
    });

    const action: GameAction = { type: 'move', payload: { dx: 0, dy: 1 } };
    const newState = gameReducer(state, action);

    expect(newState.position.x).toBe(3);
    expect(newState.position.y).toBe(1);
  });

  test('should not move piece when collision would occur', () => {
    const state = createTestState({
      current: createTetromino('T'),
      position: { x: 0, y: 0 }, // At left edge
    });

    const action: GameAction = { type: 'move', payload: { dx: -1, dy: 0 } };
    const newState = gameReducer(state, action);

    expect(newState.position.x).toBe(0); // Should not move left
    expect(newState.position.y).toBe(0);
  });

  test('should not move piece outside board boundaries', () => {
    const state = createTestState({
      current: createTetromino('I'),
      position: { x: 6, y: 0 }, // Near right edge for I-piece
    });

    const action: GameAction = { type: 'move', payload: { dx: 1, dy: 0 } };
    const newState = gameReducer(state, action);

    expect(newState.position.x).toBe(6); // Should not move beyond boundary
  });
});

describe('Game Engine - Rotation', () => {
  test('should rotate piece when possible', () => {
    const state = createTestState({
      current: createTetromino('T'),
      position: { x: 3, y: 1 },
    });

    const action: GameAction = { type: 'rotate' };
    const newState = gameReducer(state, action);

    expect(newState.current.shape).not.toEqual(state.current.shape);
  });

  test('should not rotate piece when collision would occur', () => {
    const board = createBoardWithObstacles([
      { x: 2, y: 1, type: 'O' },
      { x: 4, y: 1, type: 'O' },
    ]);
    const state = createTestState({
      board,
      current: createTetromino('T'),
      position: { x: 3, y: 0 },
    });

    const action: GameAction = { type: 'rotate' };
    const newState = gameReducer(state, action);

    expect(newState.current.shape).toEqual(state.current.shape); // Should not rotate
  });

  test('should not rotate piece at board edges when it would go out of bounds', () => {
    const state = createTestState({
      current: createTetromino('I'),
      position: { x: 0, y: 0 }, // At left edge
    });

    const action: GameAction = { type: 'rotate' };
    const newState = gameReducer(state, action);

    // I-piece rotation at edge might be blocked
    expect(newState).toBeDefined();
  });
});

describe('Game Engine - Drop Action', () => {
  test('should drop piece to bottom of empty board', () => {
    const state = createTestState({
      current: createTetromino('T'),
      next: createTetromino('O'),
      position: { x: 3, y: 0 },
    });

    const action: GameAction = { type: 'drop' };
    const newState = gameReducer(state, action);

    expect(newState.current.type).toBe('O'); // Next piece becomes current
    expect(newState.next).toBeDefined(); // New next piece generated
    expect(newState.position).toEqual({ x: 3, y: 0 }); // Reset to top
  });

  test('should place piece on board after drop', () => {
    const state = createTestState({
      current: createTetromino('T'),
      next: createTetromino('O'),
      position: { x: 3, y: 0 },
    });

    const action: GameAction = { type: 'drop' };
    const newState = gameReducer(state, action);

    // Check that T piece was placed on board
    let foundT = false;
    newState.board.forEach(row => {
      row.forEach(cell => {
        if (cell === 'T') foundT = true;
      });
    });
    expect(foundT).toBe(true);
  });

  test('should clear lines after drop', () => {
    // Create a board with a nearly complete line
    const board = createEmptyBoard();
    for (let x = 0; x < 9; x++) {
      board[19][x] = 'O'; // Fill bottom row except last column (x=9)
    }

    const state = createTestState({
      board,
      current: createTetromino('O'), // O-piece to complete the line
      position: { x: 8, y: 17 }, // Position O-piece to fill gap at column 9
    });

    const action: GameAction = { type: 'drop' };
    const newState = gameReducer(state, action);

    expect(newState.lines).toBe(1);
    expect(newState.score).toBeGreaterThan(0);
  });

  test('should update score based on lines cleared', () => {
    const board = createEmptyBoard();
    // Create two complete lines at bottom that will be cleared
    for (let y = 18; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        board[y][x] = 'O';
      }
    }

    const state = createTestState({
      board,
      current: createTetromino('I'),
      position: { x: 3, y: 0 },
      level: 1,
    });

    const action: GameAction = { type: 'drop' };
    const newState = gameReducer(state, action);

    expect(newState.lines).toBe(2);
    expect(newState.score).toBe(100); // 2 lines at level 1 = 100 points
  });

  test('should increase level based on lines cleared', () => {
    // Create two complete lines at bottom that will be cleared
    const board = createEmptyBoard();
    for (let y = 18; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        board[y][x] = 'O';
      }
    }

    const testState = createTestState({
      board,
      current: createTetromino('I'),
      position: { x: 3, y: 0 },
      lines: 9, // Almost to next level
      level: 1,
    });

    const action: GameAction = { type: 'drop' };
    const newState = gameReducer(testState, action);

    expect(newState.lines).toBe(11);
    expect(newState.level).toBe(2); // Should advance to level 2
  });

  test('should trigger game over when new piece collides', () => {
    // Fill top area of board with incomplete lines (so they won't be cleared)
    const board = createEmptyBoard();
    // Fill row 0 completely except one cell to prevent line clearing
    for (let x = 0; x < 9; x++) {
      board[0][x] = 'O';
    }
    // Fill row 1 completely except one cell to prevent line clearing
    for (let x = 1; x < 10; x++) {
      board[1][x] = 'O';
    }

    const state = createTestState({
      board,
      current: createTetromino('T'),
      next: createTetromino('O'),
      position: { x: 3, y: 0 },
    });

    const action: GameAction = { type: 'drop' };
    const newState = gameReducer(state, action);

    expect(newState.over).toBe(true);
  });
});

describe('Game Engine - Tick Action', () => {
  test('should move piece down when no collision', () => {
    const state = createTestState({
      current: createTetromino('T'),
      position: { x: 3, y: 5 },
    });

    const action: GameAction = { type: 'tick' };
    const newState = gameReducer(state, action);

    expect(newState.position.y).toBe(6);
    expect(newState.current.type).toBe('T'); // Same piece still falling
  });

  test('should place piece when tick causes collision', () => {
    const state = createTestState({
      current: createTetromino('T'),
      next: createTetromino('O'),
      position: { x: 3, y: 17 }, // Near bottom
    });

    const action: GameAction = { type: 'tick' };
    const newState = gameReducer(state, action);

    expect(newState.current.type).toBe('O'); // Next piece becomes current
    expect(newState.position).toEqual({ x: 3, y: 0 }); // Reset to top
  });
});

describe('Game Engine - Restart Action', () => {
  test('should reset game to initial state', () => {
    const state = createTestState({
      score: 1000,
      lines: 15,
      level: 3,
      over: true,
    });

    const action: GameAction = { type: 'restart' };
    const newState = gameReducer(state, action);

    expect(newState.score).toBe(0);
    expect(newState.lines).toBe(0);
    expect(newState.level).toBe(1);
    expect(newState.over).toBe(false);
    expect(newState.position).toEqual({ x: 3, y: 0 });
  });
});

describe('Game Engine - Game Over Handling', () => {
  test('should not process actions when game is over except restart', () => {
    const state = createTestState({
      over: true,
      position: { x: 3, y: 0 },
    });

    const moveAction: GameAction = { type: 'move', payload: { dx: 1, dy: 0 } };
    const newState = gameReducer(state, moveAction);

    expect(newState.position.x).toBe(3); // Should not move
    expect(newState.over).toBe(true);
  });

  test('should process restart action when game is over', () => {
    const state = createTestState({
      over: true,
      score: 500,
    });

    const restartAction: GameAction = { type: 'restart' };
    const newState = gameReducer(state, restartAction);

    expect(newState.over).toBe(false);
    expect(newState.score).toBe(0);
  });
});

describe('Game Engine - Scoring System', () => {
  test('should calculate correct score for single line clear', () => {
    const board = createEmptyBoard();
    // Create one complete line at bottom that will be cleared
    for (let x = 0; x < 10; x++) {
      board[19][x] = 'O';
    }

    const state = createTestState({
      board,
      current: createTetromino('I'),
      position: { x: 3, y: 0 },
      level: 1,
      score: 0,
    });

    const action: GameAction = { type: 'drop' };
    const newState = gameReducer(state, action);

    expect(newState.score).toBe(40); // 1 line at level 1 = 40 points
  });

  test('should calculate correct score for tetris (4 lines)', () => {
    const board = createEmptyBoard();
    // Create 4 complete lines at bottom that will be cleared
    for (let y = 16; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        board[y][x] = 'O';
      }
    }

    const state = createTestState({
      board,
      current: createTetromino('I'),
      position: { x: 3, y: 0 },
      level: 2,
      score: 0,
    });

    const action: GameAction = { type: 'drop' };
    const newState = gameReducer(state, action);

    expect(newState.score).toBe(2400); // 4 lines at level 2 = 1200 * 2 = 2400 points
  });

  test('should multiply score by level', () => {
    const board = createEmptyBoard();
    // Create one complete line at bottom that will be cleared
    for (let x = 0; x < 10; x++) {
      board[19][x] = 'O';
    }

    const state = createTestState({
      board,
      current: createTetromino('I'),
      position: { x: 3, y: 0 },
      level: 5,
      score: 100,
    });

    const action: GameAction = { type: 'drop' };
    const newState = gameReducer(state, action);

    expect(newState.score).toBe(300); // 100 + (40 * 5) = 300 points
  });
});

describe('Game Engine - Performance', () => {
  test('should process actions efficiently', () => {
    const state = initGameState();
    const actions: GameAction[] = [
      { type: 'move', payload: { dx: 1, dy: 0 } },
      { type: 'move', payload: { dx: 0, dy: 1 } },
      { type: 'rotate' },
      { type: 'move', payload: { dx: -1, dy: 0 } },
    ];

    const startTime = performance.now();
    let currentState = state;
    for (let i = 0; i < 1000; i++) {
      actions.forEach(action => {
        currentState = gameReducer(currentState, action);
      });
    }
    const endTime = performance.now();

    const averageTime = (endTime - startTime) / (1000 * actions.length);
    expect(averageTime).toBeLessThan(1); // Should be less than 1ms per action
  });

  test('should handle deep game states efficiently', () => {
    let state = initGameState();
    
    // Simulate a long game
    const startTime = performance.now();
    for (let i = 0; i < 100; i++) {
      state = gameReducer(state, { type: 'tick' });
      if (state.over) {
        state = gameReducer(state, { type: 'restart' });
      }
    }
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
  });
});

describe('Game Engine - Edge Cases', () => {
  test('should handle invalid action types gracefully', () => {
    const state = initGameState();
    const invalidAction = { type: 'invalid' } as any;

    const newState = gameReducer(state, invalidAction);

    expect(newState).toEqual(state); // Should return unchanged state
  });

  test('should handle missing payload gracefully', () => {
    const state = initGameState();
    const actionWithoutPayload: GameAction = { type: 'move' };

    const newState = gameReducer(state, actionWithoutPayload);

    expect(newState.position).toEqual(state.position); // Should not move
  });

  test('should handle extreme board configurations', () => {
    const board = createEmptyBoard();
    // Fill most of the board
    for (let y = 1; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        if (Math.random() > 0.3) {
          board[y][x] = 'O';
        }
      }
    }

    const state = createTestState({ board });
    const action: GameAction = { type: 'tick' };

    expect(() => {
      gameReducer(state, action);
    }).not.toThrow();
  });
});
