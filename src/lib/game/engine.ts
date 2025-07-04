/**
 * Tetris Game Engine (Core Logic)
 * Implements board state, tetromino management, collision, scoring, and game loop.
 * Strictly typed, functional, and testable.
 */

import { Tetromino, TetrominoType, getRandomTetromino, rotateTetromino, Board, Point, createEmptyBoard, placeTetromino, checkCollision, clearLines, getDropPosition } from './types';

export interface GameState {
  board: Board;
  current: Tetromino;
  next: Tetromino;
  position: Point;
  score: number;
  lines: number;
  level: number;
  over: boolean;
}

export interface GameAction {
  type: 'move' | 'rotate' | 'drop' | 'tick' | 'restart';
  payload?: any;
}

/**
 * Initialize a new game state
 */
export function initGameState(): GameState {
  const board = createEmptyBoard();
  const current = getRandomTetromino();
  const next = getRandomTetromino();
  return {
    board,
    current,
    next,
    position: { x: 3, y: 0 },
    score: 0,
    lines: 0,
    level: 1,
    over: false,
  };
}

/**
 * Game reducer: applies an action to the game state
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.over && action.type !== 'restart') return state;

  switch (action.type) {
    case 'move': {
      const { dx, dy } = action.payload || { dx: 0, dy: 0 };
      const newPos = { x: state.position.x + dx, y: state.position.y + dy };
      if (!checkCollision(state.board, state.current, newPos)) {
        return { ...state, position: newPos };
      }
      return state;
    }
    case 'rotate': {
      const rotated = rotateTetromino(state.current);
      if (!checkCollision(state.board, rotated, state.position)) {
        return { ...state, current: rotated };
      }
      return state;
    }
    case 'drop': {
      // Hard drop: move piece down until collision
      const dropPos = getDropPosition(state.board, state.current, state.position);
      const placed = placeTetromino(state.board, state.current, dropPos);
      const { board: cleared, linesCleared } = clearLines(placed);
      const score = state.score + getScore(linesCleared, state.level);
      const lines = state.lines + linesCleared;
      const level = 1 + Math.floor(lines / 10);
      const current = state.next;
      const next = getRandomTetromino();
      const position = { x: 3, y: 0 };
      const over = checkCollision(cleared, current, position);
      return {
        ...state,
        board: cleared,
        current,
        next,
        position,
        score,
        lines,
        level,
        over,
      };
    }
    case 'tick': {
      // Soft drop: try to move piece down by 1
      const newPos = { x: state.position.x, y: state.position.y + 1 };
      if (!checkCollision(state.board, state.current, newPos)) {
        return { ...state, position: newPos };
      }
      // If collision, place piece and spawn next
      const placed = placeTetromino(state.board, state.current, state.position);
      const { board: cleared, linesCleared } = clearLines(placed);
      const score = state.score + getScore(linesCleared, state.level);
      const lines = state.lines + linesCleared;
      const level = 1 + Math.floor(lines / 10);
      const current = state.next;
      const next = getRandomTetromino();
      const position = { x: 3, y: 0 };
      const over = checkCollision(cleared, current, position);
      return {
        ...state,
        board: cleared,
        current,
        next,
        position,
        score,
        lines,
        level,
        over,
      };
    }
    case 'restart':
      return initGameState();
    default:
      return state;
  }
}

function getScore(lines: number, level: number): number {
  if (lines === 0) return 0;
  const base = [0, 40, 100, 300, 1200][lines] || 0;
  return base * level;
}
