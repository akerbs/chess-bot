import { Chess } from 'chess.js';

export type Color = 'w' | 'b';
export type Square = string;
export type Move = {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
};

/**
 * Сервис для работы с шахматной логикой
 */
export class ChessService {
  private game: Chess;

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  /**
   * Получить текущую позицию в формате FEN
   */
  getFen(): string {
    return this.game.fen();
  }

  /**
   * Получить текущую позицию в формате PGN
   */
  getPgn(): string {
    return this.game.pgn();
  }

  /**
   * Получить текущую доску (массив фигур)
   * Преобразует объекты фигур в строковый формат (например, 'P' для белой пешки, 'p' для черной)
   */
  getBoard(): (string | null)[][] {
    const board = this.game.board();
    return board.map((rank) =>
      rank.map((square) => {
        if (!square) return null;
        // square имеет тип { type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color: 'w' | 'b' }
        const piece = square.type;
        const color = square.color;
        // Преобразуем в строку: заглавная буква для белых, строчная для черных
        return color === 'w' ? piece.toUpperCase() : piece.toLowerCase();
      }),
    );
  }

  /**
   * Получить цвет текущего игрока
   */
  getTurn(): Color {
    return this.game.turn();
  }

  /**
   * Проверить, закончена ли игра
   */
  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  /**
   * Проверить, закончена ли игра ничьей
   */
  isDraw(): boolean {
    return this.game.isDraw();
  }

  /**
   * Проверить, закончена ли игра матом
   */
  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  /**
   * Проверить, есть ли шах
   */
  isCheck(): boolean {
    return this.game.isCheck();
  }

  /**
   * Проверить, закончена ли игра патом
   */
  isStalemate(): boolean {
    return this.game.isStalemate();
  }

  /**
   * Получить все возможные ходы для фигуры на указанной клетке
   */
  getMoves(from?: Square): Move[] {
    if (from) {
      return this.game.moves({ square: from, verbose: true }).map((move) => ({
        from: move.from,
        to: move.to,
        promotion: move.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      }));
    }
    return this.game.moves({ verbose: true }).map((move) => ({
      from: move.from,
      to: move.to,
      promotion: move.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    }));
  }

  /**
   * Сделать ход
   */
  makeMove(move: Move): boolean {
    try {
      const result = this.game.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      return result !== null;
    } catch {
      return false;
    }
  }

  /**
   * Проверить, является ли ход валидным
   */
  isMoveValid(move: Move): boolean {
    try {
      const moves = this.getMoves(move.from);
      return moves.some((m) => m.from === move.from && m.to === move.to);
    } catch {
      return false;
    }
  }

  /**
   * Получить историю ходов
   */
  getHistory(): string[] {
    return this.game.history();
  }

  /**
   * Сбросить игру в начальную позицию
   */
  reset(): void {
    this.game.reset();
  }

  /**
   * Загрузить позицию из FEN
   */
  loadFen(fen: string): void {
    this.game.load(fen);
  }
}

