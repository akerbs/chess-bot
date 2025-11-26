# Быстрый старт Web App

## Проблема
Если вы видите текстовую доску вместо полноценного интерфейса - Web App не настроен.

## Решение за 3 шага:

### 1. Запустите Web App сервер

В терминале выполните:
```bash
npm run webapp
```

Сервер запустится на `http://localhost:3000`

### 2. Получите публичный URL

**Если ngrok блокирует ваш IP, используйте альтернативы (см. ALTERNATIVES.md):**

**Вариант A: Cloudflare Tunnel (рекомендуется, без регистрации):**
```bash
# Установите: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
cloudflared tunnel --url http://localhost:3000
```

**Вариант B: ngrok (если работает):**
```bash
ngrok http 3000
```

**Вариант C: Бесплатный хостинг (Netlify, Vercel):**
- Загрузите папку `webapp/` на хостинг
- Используйте полученный URL

**Скопируйте HTTPS URL** (например: `https://abc123.trycloudflare.com`)

### 3. Добавьте URL в .env

Откройте файл `.env` и добавьте строку:
```
WEB_APP_URL=https://ваш-ngrok-url.ngrok-free.app
```

**Важно:** Используйте HTTPS URL от ngrok, не HTTP!

### 4. Перезапустите бота

Остановите бота (Ctrl+C) и запустите снова:
```bash
npm run dev
```

### 5. Проверьте

Отправьте `/start` боту - должна появиться кнопка **"♟️ Играть в шахматы"** вместо текстовой доски!

## Альтернатива: без ngrok

Если не хотите использовать ngrok, можете:
1. Загрузить файлы из `webapp/` на любой веб-хостинг (Netlify, Vercel, GitHub Pages)
2. Добавить URL хостинга в `.env` как `WEB_APP_URL`

## Важно

- Web App требует HTTPS (не работает с HTTP)
- URL должен быть доступен из интернета
- Оба сервера (бот и webapp) должны работать одновременно

