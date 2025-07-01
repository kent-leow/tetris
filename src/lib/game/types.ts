/**
 * Tetris Types and Utilities
 * Defines Tetromino shapes, board, and utility functions.
 */

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Point {
  x: number;
  y: number;
}

export type BoardCell = TetrominoType | null;
export type Board = BoardCell[][]; // 20 rows x 10 cols

export interface Tetromino {
  type: TetrominoType;
  shape: number[][]; // 4x4 grid
}

const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
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

export function getRandomTetromino(): Tetromino {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const type = types[Math.floor(Math.random() * types.length)];
  return { type, shape: TETROMINO_SHAPES[type].map(row => [...row]) };
}

export function rotateTetromino(t: Tetromino): Tetromino {
  // Standard 90-degree clockwise rotation for 4x4 matrix
  const N = t.shape.length;
  const shape = Array.from({ length: N }, (_, y) =>
    Array.from({ length: N }, (_, x) => t.shape[N - x - 1][y])
  );
  return { ...t, shape };
}

export function createEmptyBoard(): Board {
  return Array.from({ length: 20 }, () => Array(10).fill(null));
}

export function checkCollision(board: Board, tetromino: Tetromino, pos: Point): boolean {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (tetromino.shape[y][x]) {
        const bx = pos.x + x;
        const by = pos.y + y;
        if (bx < 0 || bx >= 10 || by < 0 || by >= 20) return true;
        if (board[by][bx]) return true;
      }
    }
  }
  return false;
}

export function placeTetromino(board: Board, tetromino: Tetromino, pos: Point): Board {
  const newBoard = board.map(row => [...row]);
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (tetromino.shape[y][x]) {
        const bx = pos.x + x;
        const by = pos.y + y;
        if (by >= 0 && by < 20 && bx >= 0 && bx < 10) {
          newBoard[by][bx] = tetromino.type;
        }
      }
    }
  }
  return newBoard;
}

export function clearLines(board: Board): { board: Board; linesCleared: number } {
  const newBoard = board.filter(row => row.some(cell => !cell));
  const linesCleared = 20 - newBoard.length;
  while (newBoard.length < 20) {
    newBoard.unshift(Array(10).fill(null));
  }
  return { board: newBoard, linesCleared };
}

export function getDropPosition(board: Board, tetromino: Tetromino, pos: Point): Point {
  let dropY = pos.y;
  while (!checkCollision(board, tetromino, { x: pos.x, y: dropY + 1 })) {
    dropY++;
  }
  return { x: pos.x, y: dropY };
}
