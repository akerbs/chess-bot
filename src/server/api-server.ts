import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { GameService } from '../services/game.service.js';
import { logger } from '../logger.js';

/**
 * Простой HTTP сервер для API Web App
 * Позволяет Web App получать состояние игры и валидные ходы
 */
export class ApiServer {
  private server: ReturnType<typeof createServer> | null = null;
  private gameService: GameService;

  constructor(gameService: GameService) {
    this.gameService = gameService;
  }

  start(port: number = 3001): void {
    this.server = createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(port, () => {
      logger.info(`API сервер запущен на порту ${port}`);
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const parsedUrl = parse(req.url || '', true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      if (path === '/api/game-state' && req.method === 'GET') {
        this.handleGetGameState(req, res, query);
      } else if (path === '/api/valid-moves' && req.method === 'GET') {
        this.handleGetValidMoves(req, res, query);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error) {
      logger.error(error, 'Ошибка при обработке API запроса');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private handleGetGameState(
    req: IncomingMessage,
    res: ServerResponse,
    query: Record<string, string | string[] | null>,
  ): void {
    const userId = query.userId;
    if (!userId || typeof userId !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'userId required' }));
      return;
    }

    const game = this.gameService.getGame(userId);
    if (!game) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Game not found' }));
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
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
  }

  private handleGetValidMoves(
    req: IncomingMessage,
    res: ServerResponse,
    query: Record<string, string | string[] | null>,
  ): void {
    const userId = query.userId;
    const square = query.square;

    if (!userId || typeof userId !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'userId required' }));
      return;
    }

    if (!square || typeof square !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'square required' }));
      return;
    }

    const game = this.gameService.getGame(userId);
    if (!game) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Game not found' }));
      return;
    }

    const moves = game.chess.getMoves(square);
    const validMoves = moves.map((m) => m.to);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ type: 'validMoves', square, moves: validMoves }));
  }
}

