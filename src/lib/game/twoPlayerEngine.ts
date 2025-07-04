export type { TwoPlayerGameState } from './types';
import {
  PlayerState,
  TwoPlayerGameState,
  getRandomTetromino,
  createEmptyBoard,
  checkCollision,
  placeTetromino,
  clearLines,
  addGarbageLines,
  rotateTetromino,
  getDropPosition,
} from './types';

/**
 * Initialize a two-player game state
 */
export function initTwoPlayerGameState(): TwoPlayerGameState {
  const player: PlayerState = {
    board: createEmptyBoard(),
    current: getRandomTetromino(),
    next: getRandomTetromino(),
    position: { x: 3, y: 0 },
    score: 0,
    lines: 0,
    level: 1,
    over: false,
    garbageQueue: 0,
  };
  return {
    players: [
      { ...player },
      { ...player },
    ],
    winner: null,
    started: false,
  };
}

/**
 * Two-player game reducer
 * Handles actions for both players, garbage, and win/lose logic
 */
export type TwoPlayerAction =
  | { type: 'move'; player: 0 | 1; dx: number; dy: number }
  | { type: 'rotate'; player: 0 | 1 }
  | { type: 'drop'; player: 0 | 1 }
  | { type: 'tick'; player: 0 | 1 }
  | { type: 'restart' }
  | { type: 'addGarbage'; player: 0 | 1; lines: number };

export function twoPlayerGameReducer(state: TwoPlayerGameState, action: TwoPlayerAction): TwoPlayerGameState {
  if (state.winner && action.type !== 'restart') return state;
  const players = [...state.players] as [PlayerState, PlayerState];
  const p = action.type === 'restart' ? null : action.player;

  switch (action.type) {
    case 'move': {
      if (p === null) return state;
      const player = { ...players[p] };
      const newPos = { x: player.position.x + action.dx, y: player.position.y + action.dy };
      if (!checkCollision(player.board, player.current, newPos)) {
        player.position = newPos;
        players[p] = player;
        return { ...state, players: players as [PlayerState, PlayerState] };
      }
      return state;
    }
    case 'rotate': {
      if (p === null) return state;
      const player = { ...players[p] };
      const rotated = rotateTetromino(player.current);
      if (!checkCollision(player.board, rotated, player.position)) {
        player.current = rotated;
        players[p] = player;
        return { ...state, players: players as [PlayerState, PlayerState] };
      }
      return state;
    }
    case 'drop': {
      if (p === null) return state;
      const player = { ...players[p] };
      // Apply pending garbage before drop
      if (player.garbageQueue > 0) {
        player.board = addGarbageLines(player.board, player.garbageQueue);
        player.garbageQueue = 0;
      }
      const dropPos = getDropPosition(player.board, player.current, player.position);
      const placed = placeTetromino(player.board, player.current, dropPos);
      const { board: cleared, linesCleared } = clearLines(placed);
      const prevLines = player.lines;
      const lines = player.lines + linesCleared;
      const score = player.score + getScore(linesCleared, player.level);
      const level = 1 + Math.floor(lines / 10);
      const next = player.next;
      const current = getRandomTetromino();
      const position = { x: 3, y: 0 };
      const over = checkCollision(cleared, next, position);
      const newPlayers = [...players] as [PlayerState, PlayerState];
      // Opponent level up every 5 lines cleared by this player
      const opponent = p === 0 ? 1 : 0;
      let opponentLevel = newPlayers[opponent].level;
      if (linesCleared > 0) {
        const prevMilestone = Math.floor(prevLines / 5);
        const newMilestone = Math.floor(lines / 5);
        if (newMilestone > prevMilestone) {
          opponentLevel += newMilestone - prevMilestone;
        }
      }
      newPlayers[p] = {
        ...player,
        board: cleared,
        current: next,
        next: current,
        position,
        score,
        lines,
        level,
        over,
        garbageQueue: 0,
      };
      newPlayers[opponent] = {
        ...newPlayers[opponent],
        level: opponentLevel,
      };
      if (linesCleared >= 2) {
        newPlayers[opponent] = {
          ...newPlayers[opponent],
          garbageQueue: newPlayers[opponent].garbageQueue + (linesCleared - 1),
        };
      }
      // Win/lose detection
      let winner: 1 | 2 | null = null;
      if (newPlayers[0].over && !newPlayers[1].over) winner = 2;
      if (newPlayers[1].over && !newPlayers[0].over) winner = 1;
      if (newPlayers[0].over && newPlayers[1].over) winner = null;
      return { ...state, players: newPlayers as [PlayerState, PlayerState], winner };
    }
    case 'tick': {
      if (p === null) return state;
      const player = { ...players[p] };
      // Apply pending garbage before tick
      if (player.garbageQueue > 0) {
        player.board = addGarbageLines(player.board, player.garbageQueue);
        player.garbageQueue = 0;
      }
      const newPos = { x: player.position.x, y: player.position.y + 1 };
      if (!checkCollision(player.board, player.current, newPos)) {
        player.position = newPos;
        players[p] = player;
        return { ...state, players: players as [PlayerState, PlayerState] };
      }
      // Place piece
      const placed = placeTetromino(player.board, player.current, player.position);
      const { board: cleared, linesCleared } = clearLines(placed);
      const score = player.score + getScore(linesCleared, player.level);
      const lines = player.lines + linesCleared;
      const level = 1 + Math.floor(lines / 10);
      const next = player.next;
      const current = getRandomTetromino();
      const position = { x: 3, y: 0 };
      const over = checkCollision(cleared, next, position);
      const newPlayers = [...players] as [PlayerState, PlayerState];
      newPlayers[p] = {
        ...player,
        board: cleared,
        current: next,
        next: current,
        position,
        score,
        lines,
        level,
        over,
        garbageQueue: 0,
      };
      // Garbage: if cleared >= 2, send to opponent
      if (linesCleared >= 2) {
        const opponent = p === 0 ? 1 : 0;
        newPlayers[opponent] = {
          ...newPlayers[opponent],
          garbageQueue: newPlayers[opponent].garbageQueue + (linesCleared - 1),
        };
      }
      // Win/lose detection
      let winner: 1 | 2 | null = null;
      if (newPlayers[0].over && !newPlayers[1].over) winner = 2;
      if (newPlayers[1].over && !newPlayers[0].over) winner = 1;
      if (newPlayers[0].over && newPlayers[1].over) winner = null;
      return { ...state, players: newPlayers as [PlayerState, PlayerState], winner };
    }
    case 'addGarbage': {
      if (p === null) return state;
      const player = { ...players[p] };
      player.garbageQueue += action.lines;
      players[p] = player;
      return { ...state, players: players as [PlayerState, PlayerState] };
    }
    case 'restart':
      return initTwoPlayerGameState();
    default:
      return state;
  }
}

function getScore(lines: number, level: number): number {
  if (lines === 0) return 0;
  const base = [0, 40, 100, 300, 1200][lines] || 0;
  return base * level;
}
