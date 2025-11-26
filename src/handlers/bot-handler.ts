import type { BotPlatform, BotContext } from '../platforms/bot-platform.interface.js';
import { GameService } from '../services/game.service.js';
import { AIService } from '../services/ai.service.js';
import { BoardRenderer } from '../utils/board-renderer.js';
import { logger } from '../logger.js';
import { env } from '../config/env.js';

/**
 * Обработчик команд и логики бота
 */
export class BotHandler {
  private readonly aiService: AIService;

  constructor(
    private readonly platform: BotPlatform,
    private readonly gameService: GameService,
  ) {
    this.aiService = new AIService();
  }

  /**
   * Регистрация всех обработчиков
   */
  registerHandlers(): void {
    this.platform.onStart(async (ctx) => {
      await this.handleStart(ctx);
    });

    this.platform.onCommand('new', async (ctx) => {
      await this.handleStart(ctx);
    });

    this.platform.onCommand('board', async (ctx) => {
      await this.handleShowBoard(ctx);
    });

    this.platform.onCommand('help', async (ctx) => {
      await this.handleHelp(ctx);
    });

    this.platform.onCallbackQuery(async (ctx, data) => {
      await this.handleCallbackQuery(ctx, data);
    });

    this.platform.onWebAppData(async (ctx, data) => {
      await this.handleWebAppData(ctx, data);
    });
  }

  /**
   * Обработка команды /start
   */
  private async handleStart(ctx: BotContext): Promise<void> {
    try {
      const game = this.gameService.createGame(ctx.user.id);
      if (env.WEB_APP_URL) {
        await this.sendWebAppBoard(ctx, game);
      } else {
        // Если Web App URL не настроен, отправляем инструкцию и текстовую доску
        await this.platform.sendMessage(
          ctx.chatId,
          '⚠️ Web App не настроен. Используется текстовая версия.\n\nДля полноценного интерфейса настройте WEB_APP_URL в .env файле.',
        );
        await this.sendBoard(ctx.chatId, game, 'Новая партия началась! Вы играете белыми. Выберите фигуру для хода:');
      }
    } catch (error) {
      logger.error(error, 'Ошибка при создании игры');
      await this.platform.sendMessage(ctx.chatId, 'Произошла ошибка при создании игры. Попробуйте еще раз.');
    }
  }

  /**
   * Показать текущую доску
   */
  private async handleShowBoard(ctx: BotContext): Promise<void> {
    try {
      const game = this.gameService.getGame(ctx.user.id);
      if (!game) {
        await this.platform.sendMessage(ctx.chatId, 'У вас нет активной игры. Используйте /start для начала новой партии.');
        return;
      }

      await this.sendBoard(ctx.chatId, game, 'Текущая позиция:');
    } catch (error) {
      logger.error(error, 'Ошибка при отображении доски');
      await this.platform.sendMessage(ctx.chatId, 'Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Показать справку
   */
  private async handleHelp(ctx: BotContext): Promise<void> {
    const helpText = `
🎮 *Шахматный бот*

*Команды:*
/start - Начать новую партию
/new - Начать новую партию
/board - Показать текущую доску
/help - Показать эту справку

*Как играть:*
1. Нажмите на клетку с фигурой, которой хотите походить
2. Затем нажмите на клетку, куда хотите походить
3. Бот автоматически сделает свой ход

*Правила:*
• Вы играете белыми
• Бот играет черными
• Все ходы проверяются по правилам шахмат
`;

    await this.platform.sendMessage(ctx.chatId, helpText, { parseMode: 'Markdown' });
  }

  /**
   * Обработка callback query (нажатие на кнопку)
   */
  private async handleCallbackQuery(ctx: BotContext, data: string): Promise<void> {
    try {
      // Обработка специальных команд
      if (data === 'new_game') {
        await this.handleStart(ctx);
        return;
      }

      if (data === 'clear_selection') {
        const game = this.gameService.getGame(ctx.user.id);
        if (game) {
          this.gameService.clearSelection(ctx.user.id);
          await this.sendBoard(ctx.chatId, game, 'Выбор отменен. Выберите фигуру для хода:');
        }
        return;
      }

      const game = this.gameService.getGame(ctx.user.id);
      if (!game) {
        await this.platform.sendMessage(ctx.chatId, 'У вас нет активной игры. Используйте /start для начала новой партии.');
        return;
      }

      // Проверяем, не закончена ли игра
      if (game.chess.isGameOver()) {
        await this.handleGameOver(ctx, game);
        return;
      }

      // Проверяем, чей сейчас ход
      if (game.chess.getTurn() === 'b') {
        await this.platform.sendMessage(ctx.chatId, 'Сейчас ход бота. Подождите...');
        return;
      }

      const square = data;

      if (game.waitingForTarget) {
        // Пользователь выбирает целевую клетку
        const result = this.gameService.makeMove(ctx.user.id, square);
        if (!result.success) {
          await this.platform.sendMessage(ctx.chatId, '❌ Неверный ход! Попробуйте еще раз.');
          await this.sendBoard(ctx.chatId, game, 'Выберите фигуру для хода:');
          return;
        }

        // Ход сделан, обновляем доску
        await this.sendBoard(ctx.chatId, game, `✅ Ход: ${result.move?.from} → ${result.move?.to}`);

        // Проверяем, не закончена ли игра
        if (game.chess.isGameOver()) {
          await this.handleGameOver(ctx, game);
          return;
        }

        // Ход бота
        await this.makeBotMove(ctx, game);
      } else {
        // Пользователь выбирает фигуру для хода
        // Если уже выбрана другая фигура, сбрасываем выбор
        if (game.selectedSquare && game.selectedSquare !== square) {
          this.gameService.clearSelection(ctx.user.id);
        }

        const success = this.gameService.selectSquare(ctx.user.id, square);
        if (!success) {
          await this.platform.sendMessage(ctx.chatId, '❌ На этой клетке нет вашей фигуры или нет возможных ходов. Выберите другую клетку.');
          await this.sendBoard(ctx.chatId, game, 'Выберите фигуру для хода:');
          return;
        }

        const validMoves = this.gameService.getValidMoves(ctx.user.id);
        await this.sendBoard(ctx.chatId, game, `Выбрана клетка ${square}. Выберите целевую клетку:`, validMoves);
      }
    } catch (error) {
      logger.error(error, 'Ошибка при обработке callback query');
      await this.platform.sendMessage(ctx.chatId, 'Произошла ошибка. Попробуйте еще раз.');
    }
  }

  /**
   * Сделать ход бота
   */
  private async makeBotMove(ctx: BotContext, game: ReturnType<typeof this.gameService.getGame>): Promise<void> {
    if (!game) return;

    // Небольшая задержка для реалистичности
    await new Promise((resolve) => setTimeout(resolve, 500));

    const botMove = this.aiService.getBestMove(game.chess);
    if (!botMove) {
      await this.platform.sendMessage(ctx.chatId, 'Бот не может сделать ход.');
      return;
    }

    const success = game.chess.makeMove(botMove);
    if (success) {
      game.lastMove = botMove;
      await this.sendBoard(ctx.chatId, game, `🤖 Ход бота: ${botMove.from} → ${botMove.to}`);

      // Проверяем, не закончена ли игра
      if (game.chess.isGameOver()) {
        await this.handleGameOver(ctx, game);
      } else {
        await this.sendBoard(ctx.chatId, game, 'Ваш ход. Выберите фигуру:');
      }
    }
  }

  /**
   * Обработка окончания игры
   */
  private async handleGameOver(ctx: BotContext, game: ReturnType<typeof this.gameService.getGame>): Promise<void> {
    if (!game) return;

    let message = '';

    if (game.chess.isCheckmate()) {
      const winner = game.chess.getTurn() === 'w' ? 'Черные (бот)' : 'Белые (вы)';
      message = `🏆 Игра окончена! Победили ${winner}!`;
    } else if (game.chess.isStalemate()) {
      message = '🤝 Ничья! Пат.';
    } else if (game.chess.isDraw()) {
      message = '🤝 Ничья!';
    } else {
      message = 'Игра окончена.';
    }

    await this.sendBoard(ctx.chatId, game, message);
    await this.platform.sendMessage(
      ctx.chatId,
      'Используйте /start для начала новой партии.',
    );
  }

  /**
   * Отправить доску пользователю
   */
  private async sendBoard(
    chatId: string | number,
    game: ReturnType<typeof this.gameService.getGame>,
    message?: string,
    validMoves?: string[],
  ): Promise<void> {
    if (!game) return;

    const board = game.chess.getBoard();
    const boardText = BoardRenderer.render(board, game.selectedSquare, validMoves);
    const statusText = this.getStatusText(game);

    let fullMessage = '';
    if (message) {
      fullMessage += message + '\n\n';
    }
    fullMessage += '```\n' + boardText + '```\n\n';
    fullMessage += statusText;

    const keyboard = this.createBoardKeyboard(game.selectedSquare, validMoves);

    await this.platform.sendMessage(chatId, fullMessage, {
      parseMode: 'Markdown',
      inlineKeyboard: keyboard,
    });
  }

  /**
   * Создать клавиатуру с доской
   */
  private createBoardKeyboard(selectedSquare?: string, validMoves?: string[]): Array<Array<{ text: string; callbackData: string }>> {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const keyboard: Array<Array<{ text: string; callbackData: string }>> = [];

    // Добавляем кнопки для каждой клетки
    for (let rank = 0; rank < 8; rank++) {
      const row: Array<{ text: string; callbackData: string }> = [];
      for (let file = 0; file < 8; file++) {
        const square = files[file] + ranks[rank];
        let label = square;

        if (selectedSquare === square) {
          label = `[${square}]`;
        } else if (validMoves?.includes(square)) {
          label = `(${square})`;
        }

        row.push({
          text: label,
          callbackData: square,
        });
      }
      keyboard.push(row);
    }

    // Добавляем кнопки управления
    keyboard.push([
      { text: '🔄 Новая игра', callbackData: 'new_game' },
      { text: '❌ Отменить выбор', callbackData: 'clear_selection' },
    ]);

    return keyboard;
  }

  /**
   * Получить текст статуса игры
   */
  private getStatusText(game: ReturnType<typeof this.gameService.getGame>): string {
    if (!game) return '';

    const turn = game.chess.getTurn() === 'w' ? 'Белые' : 'Черные';
    let status = `Ход: ${turn}`;

    if (game.chess.isCheck()) {
      status += ' ⚠️ Шах!';
    }

    if (game.chess.isGameOver()) {
      if (game.chess.isCheckmate()) {
        status = '🏆 Мат!';
      } else if (game.chess.isStalemate()) {
        status = '🤝 Пат';
      } else if (game.chess.isDraw()) {
        status = '🤝 Ничья';
      }
    }

    return status;
  }

  /**
   * Отправить Web App с доской
   */
  private async sendWebAppBoard(
    ctx: BotContext,
    game: ReturnType<typeof this.gameService.getGame>,
  ): Promise<void> {
    if (!game || !env.WEB_APP_URL) {
      logger.warn('Web App URL не настроен, используем текстовую версию');
      return;
    }

    const webAppUrl = `${env.WEB_APP_URL}?userId=${ctx.user.id}`;
    
    logger.info(`Отправка Web App для пользователя ${ctx.user.id}, URL: ${webAppUrl}`);
    
    await this.platform.sendMessage(ctx.chatId, '🎮', {
      inlineKeyboard: [[
        {
          text: '♟️ Играть в шахматы',
          webApp: { url: webAppUrl },
        },
      ]],
    });
  }

  /**
   * Обработка данных от Web App
   */
  private async handleWebAppData(ctx: BotContext, data: string): Promise<void> {
    try {
      const payload = JSON.parse(data);
      
      switch (payload.type) {
        case 'move':
          await this.handleWebAppMove(ctx, payload.from, payload.to);
          break;
        case 'getState':
          // Отправляем состояние через answerWebAppQuery если это callback query
          // Иначе состояние будет получено через периодический polling
          await this.sendGameStateToWebApp(ctx);
          break;
        case 'newGame':
          await this.handleStart(ctx);
          break;
        case 'getValidMoves':
          await this.sendValidMovesToWebApp(ctx, payload.square);
          break;
        default:
          logger.warn(`Неизвестный тип сообщения от Web App: ${payload.type}`);
      }
    } catch (error) {
      logger.error(error, 'Ошибка при обработке данных от Web App');
    }
  }

  /**
   * Обработка хода от Web App
   */
  private async handleWebAppMove(ctx: BotContext, from: string, to: string): Promise<void> {
    const game = this.gameService.getGame(ctx.user.id);
    if (!game) {
      await this.sendGameStateToWebApp(ctx, 'Игра не найдена. Используйте /start для начала новой партии.');
      return;
    }

    if (game.chess.getTurn() === 'b') {
      await this.sendGameStateToWebApp(ctx, 'Сейчас ход бота. Подождите...');
      return;
    }

    const move = { from, to };
    if (!game.chess.isMoveValid(move)) {
      await this.sendGameStateToWebApp(ctx, 'Неверный ход!');
      return;
    }

    const success = game.chess.makeMove(move);
    if (!success) {
      await this.sendGameStateToWebApp(ctx, 'Неверный ход!');
      return;
    }

    game.lastMove = move;

    // Состояние автоматически обновится через polling в Web App
    // Не нужно отправлять через sendGameStateToWebApp

    // Если игра не окончена, делаем ход бота
    if (!game.chess.isGameOver()) {
      setTimeout(async () => {
        await this.makeBotMove(ctx, game);
      }, 500);
    } else {
      await this.handleGameOver(ctx, game);
    }
  }

  /**
   * Отправить состояние игры в Web App
   * Используем answerWebAppQuery для отправки данных обратно в Web App
   */
  private async sendGameStateToWebApp(ctx: BotContext, errorMessage?: string): Promise<void> {
    const game = this.gameService.getGame(ctx.user.id);
    if (!game) {
      return;
    }

    const board = game.chess.getBoard();
    const state = {
      type: 'gameState',
      board: board,
      isWhiteTurn: game.chess.getTurn() === 'w',
      isGameOver: game.chess.isGameOver(),
      isCheck: game.chess.isCheck(),
      isCheckmate: game.chess.isCheckmate(),
      isStalemate: game.chess.isStalemate(),
      lastMove: game.lastMove,
      error: errorMessage,
    };

    // В Telegram Web App данные можно отправить обратно через answerWebAppQuery
    // Но для этого нужен query_id, который доступен только в callback query
    // Для getState используем другой механизм - Web App будет получать состояние через polling
    // Здесь просто логируем, что состояние запрошено
    logger.debug(`Состояние игры запрошено для пользователя ${ctx.user.id}`);
  }

  /**
   * Отправить возможные ходы в Web App
   */
  private async sendValidMovesToWebApp(ctx: BotContext, square: string): Promise<void> {
    const game = this.gameService.getGame(ctx.user.id);
    if (!game) {
      return;
    }

    const moves = game.chess.getMoves(square);
    const validMoves = moves.map((m) => m.to);

    await this.platform.sendMessage(
      ctx.chatId,
      `\`\`\`json\n${JSON.stringify({ type: 'validMoves', square, moves: validMoves })}\n\`\`\``,
      { parseMode: 'Markdown' },
    );
  }
}

