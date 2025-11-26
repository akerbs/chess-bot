# Альтернативы ngrok (если IP заблокирован)

Если ngrok блокирует ваш IP адрес, используйте один из этих вариантов:

## Вариант 1: Cloudflare Tunnel (рекомендуется)

**Преимущества:** Бесплатно, без регистрации, работает везде

1. **Установите cloudflared:**
   - Скачайте с https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   - Или через Chocolatey: `choco install cloudflared`

2. **Запустите Web App сервер:**
   ```bash
   npm run webapp
   ```

3. **Запустите Cloudflare Tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

4. Скопируйте HTTPS URL и добавьте в `.env`:
   ```
   WEB_APP_URL=https://ваш-url.trycloudflare.com
   ```

## Вариант 2: localtunnel

1. **Установите localtunnel:**
   ```bash
   npm install -g localtunnel
   ```

2. **Запустите Web App сервер:**
   ```bash
   npm run webapp
   ```

3. **Запустите localtunnel:**
   ```bash
   lt --port 3000
   ```

4. Скопируйте URL и добавьте в `.env`

## Вариант 3: Бесплатный хостинг (лучший для продакшена)

### Netlify (самый простой):

1. Зайдите на https://netlify.com
2. Зарегистрируйтесь (можно через GitHub)
3. Перетащите папку `webapp` в Netlify Drop
4. Скопируйте URL (например: `https://your-app.netlify.app`)
5. Добавьте в `.env`:
   ```
   WEB_APP_URL=https://your-app.netlify.app
   ```

### Vercel:

1. Зайдите на https://vercel.com
2. Зарегистрируйтесь через GitHub
3. Создайте новый проект
4. Загрузите папку `webapp`
5. Скопируйте URL и добавьте в `.env`

### GitHub Pages:

1. Создайте репозиторий на GitHub
2. Загрузите файлы из `webapp/` в репозиторий
3. Включите GitHub Pages в настройках репозитория
4. Используйте URL вида: `https://username.github.io/repository-name`

## Вариант 4: Использовать свой сервер

Если у вас есть VPS или сервер:

1. Загрузите файлы из `webapp/` на сервер
2. Настройте nginx или другой веб-сервер
3. Настройте SSL (Let's Encrypt)
4. Используйте ваш домен в `.env`

## Рекомендация

Для быстрого старта используйте **Cloudflare Tunnel** - он работает без регистрации и не блокирует IP.

Для постоянного использования лучше загрузить на **Netlify** - это бесплатно и надежно.

