import { ChessService, Move } from './chess.service.js';

export interface GameState {
  chess: ChessService;
  selectedSquare?: string;
  waitingForTarget: boolean;
  lastMove?: Move;
}

/**
 * Сервис для управления играми пользователей
 */
export class GameService {
  private games: Map<string, GameState> = new Map();

  /**
   * Создать новую игру для пользователя
   */
  createGame(userId: string | number): GameState {
    const chess = new ChessService();
    const gameState: GameState = {
      chess,
      waitingForTarget: false,
    };
    this.games.set(String(userId), gameState);
    return gameState;
  }

  /**
   * Получить игру пользователя
   */
  getGame(userId: string | number): GameState | undefined {
    return this.games.get(String(userId));
  }

  /**
   * Удалить игру пользователя
   */
  deleteGame(userId: string | number): void {
    this.games.delete(String(userId));
  }

  /**
   * Выбрать клетку для хода
   */
  selectSquare(userId: string | number, square: string): boolean {
    const game = this.getGame(userId);
    if (!game) return false;

    const moves = game.chess.getMoves(square);
    if (moves.length === 0) {
      return false;
    }

    game.selectedSquare = square;
    game.waitingForTarget = true;
    return true;
  }

  /**
   * Сделать ход
   */
  makeMove(userId: string | number, to: string): { success: boolean; move?: Move } {
    const game = this.getGame(userId);
    if (!game || !game.selectedSquare || !game.waitingForTarget) {
      return { success: false };
    }

    const move: Move = {
      from: game.selectedSquare,
      to,
    };

    if (!game.chess.isMoveValid(move)) {
      return { success: false };
    }

    const success = game.chess.makeMove(move);
    if (success) {
      game.lastMove = move;
      game.selectedSquare = undefined;
      game.waitingForTarget = false;
      return { success: true, move };
    }

    return { success: false };
  }

  /**
   * Отменить выбор клетки
   */
  clearSelection(userId: string | number): void {
    const game = this.getGame(userId);
    if (game) {
      game.selectedSquare = undefined;
      game.waitingForTarget = false;
    }
  }

  /**
   * Получить все валидные ходы для выбранной клетки
   */
  getValidMoves(userId: string | number): string[] {
    const game = this.getGame(userId);
    if (!game || !game.selectedSquare) {
      return [];
    }

    const moves = game.chess.getMoves(game.selectedSquare);
    return moves.map((move) => move.to);
  }
}

