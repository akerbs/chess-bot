import { ChessService, Move } from './chess.service.js';

/**
 * Сервис для искусственного интеллекта бота
 */
export class AIService {
  /**
   * Выбрать лучший ход для бота
   * Использует простой алгоритм: выбирает случайный валидный ход
   * В будущем можно улучшить до мини-макс алгоритма
   */
  getBestMove(chess: ChessService): Move | null {
    const moves = chess.getMoves();
    if (moves.length === 0) {
      return null;
    }

    // Простой алгоритм: выбираем случайный ход
    // Можно улучшить, добавив оценку позиции
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  /**
   * Оценить позицию (простая эвристика)
   * Положительное значение - лучше для белых, отрицательное - для черных
   */
  private evaluatePosition(chess: ChessService): number {
    const pieceValues: Record<string, number> = {
      'p': 1,
      'n': 3,
      'b': 3,
      'r': 5,
      'q': 9,
      'k': 0,
    };

    const board = chess.getBoard();
    let score = 0;

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece) {
          const value = pieceValues[piece.toLowerCase()] || 0;
          if (piece === piece.toUpperCase()) {
            // Белая фигура
            score += value;
          } else {
            // Черная фигура
            score -= value;
          }
        }
      }
    }

    return score;
  }
}

