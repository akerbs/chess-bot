/**
 * Утилита для отображения шахматной доски в текстовом формате
 */
export class BoardRenderer {
  private static readonly PIECE_EMOJIS: Record<string, string> = {
    'K': '♔', // белый король
    'Q': '♕', // белый ферзь
    'R': '♖', // белая ладья
    'B': '♗', // белый слон
    'N': '♘', // белый конь
    'P': '♙', // белая пешка
    'k': '♚', // черный король
    'q': '♛', // черный ферзь
    'r': '♜', // черная ладья
    'b': '♝', // черный слон
    'n': '♞', // черный конь
    'p': '♟', // черная пешка
  };

  // Unicode символы для клеток доски
  private static readonly LIGHT_SQUARE = '⬜'; // Светлая клетка (белый квадрат)
  private static readonly DARK_SQUARE = '⬛'; // Темная клетка (черный квадрат)

  /**
   * Проверить, является ли клетка светлой (для классической шахматной доски)
   */
  private static isLightSquare(rank: number, file: number): boolean {
    return (rank + file) % 2 === 0;
  }

  /**
   * Отрисовать доску в классическом формате с чередующимися клетками
   */
  static render(board: (string | null)[][], selectedSquare?: string, validMoves?: string[]): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    let result = '   ' + files.join(' ') + '\n';

    for (let rank = 0; rank < 8; rank++) {
      result += ranks[rank] + ' ';
      for (let file = 0; file < 8; file++) {
        const square = files[file] + ranks[rank];
        const piece = board[rank][file];
        const isSelected = selectedSquare === square;
        const isValidMove = validMoves?.includes(square);
        const isLight = this.isLightSquare(rank, file);

        // Определяем фон клетки
        const bgSquare = isLight ? this.LIGHT_SQUARE : this.DARK_SQUARE;

        if (piece) {
          const emoji = this.PIECE_EMOJIS[piece] || piece;
          if (isSelected) {
            result += `[${emoji}]`;
          } else if (isValidMove) {
            result += `(${emoji})`;
          } else {
            // Для фигур на темных клетках используем фон, для светлых - просто фигуру
            result += isLight ? ` ${emoji} ` : `${bgSquare}${emoji}${bgSquare}`;
          }
        } else {
          if (isSelected) {
            result += '[ ]';
          } else if (isValidMove) {
            result += '(·)';
          } else {
            result += bgSquare;
          }
        }
      }
      result += ' ' + ranks[rank] + '\n';
    }

    result += '   ' + files.join(' ') + '\n';
    return result;
  }

  /**
   * Получить эмодзи для фигуры
   */
  static getPieceEmoji(piece: string | null): string {
    if (!piece) return '·';
    return this.PIECE_EMOJIS[piece] || piece;
  }

}

