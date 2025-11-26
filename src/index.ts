import "dotenv/config";
import { env } from "./config/env.js";
import { TelegramBotAdapter } from "./platforms/telegram-bot.adapter.js";
import { BotHandler } from "./handlers/bot-handler.js";
import { logger } from "./logger.js";
import { ApiServer } from "./server/api-server.js";
import { GameService } from "./services/game.service.js";

async function bootstrap() {
  logger.info("Инициализация шахматного бота...");

  const platform = new TelegramBotAdapter(env.BOT_TOKEN);
  const gameService = new GameService();
  const handler = new BotHandler(platform, gameService);
  handler.registerHandlers();

  // Запускаем API сервер для Web App
  const apiServer = new ApiServer(gameService);
  apiServer.start(3001);

  logger.info("Экземпляр бота создан, запускаю подключение...");

  try {
    await platform.launch();
    logger.info("✅ Шахматный бот запущен и готов к работе!");
  } catch (error) {
    logger.error(error, "Ошибка при запуске бота");
    throw error;
  }

  process.once("SIGINT", () => {
    logger.info("Получен SIGINT, останавливаю бота...");
    apiServer.stop();
    platform.stop("SIGINT");
  });
  process.once("SIGTERM", () => {
    logger.info("Получен SIGTERM, останавливаю бота...");
    apiServer.stop();
    platform.stop("SIGTERM");
  });
}

bootstrap().catch((error) => {
  logger.error(error, "Критическая ошибка при запуске бота");
  process.exit(1);
});

