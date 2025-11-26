# Простая настройка Web App (без установки программ)

Если не хотите устанавливать cloudflared или ngrok, используйте бесплатный хостинг:

## Вариант: Netlify (самый простой, 2 минуты)

### Шаг 1: Зайдите на Netlify
1. Откройте https://netlify.com
2. Нажмите "Sign up" (можно через GitHub - самый быстрый способ)

### Шаг 2: Загрузите Web App
1. После регистрации нажмите "Add new site" → "Deploy manually"
2. Перетащите папку `webapp` в окно браузера
3. Дождитесь загрузки (несколько секунд)

### Шаг 3: Скопируйте URL
1. Netlify автоматически создаст URL вида: `https://random-name-123.netlify.app`
2. Скопируйте этот URL

### Шаг 4: Добавьте в .env
Откройте файл `.env` и добавьте:
```
WEB_APP_URL=https://ваш-url.netlify.app
```

### Шаг 5: Готово!
Перезапустите бота и отправьте `/start` - появится кнопка "♟️ Играть в шахматы"!

---

## Альтернатива: Установить cloudflared

Если все же хотите использовать туннель:

### Через Chocolatey:
```powershell
# Установите Chocolatey (если еще не установлен)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Установите cloudflared
choco install cloudflared -y
```

### Или вручную:
1. Скачайте cloudflared: https://github.com/cloudflare/cloudflared/releases
2. Распакуйте архив
3. Добавьте папку в PATH или запускайте из папки

---

## Рекомендация

**Используйте Netlify** - это самый простой способ, не требует установки программ и работает постоянно (не нужно запускать туннель каждый раз).

