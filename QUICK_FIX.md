# Быстрое решение проблемы с localtunnel

## Проблема
PowerShell блокирует выполнение скриптов (политика Restricted).

## Решение: Используйте npx (не требует изменения политики)

Вместо установки `localtunnel` глобально, используйте `npx`:

```bash
npx localtunnel --port 3001
```

Или используйте готовый скрипт:

**Windows (CMD):**
```bash
start-localtunnel.bat
```

**PowerShell:**
```powershell
.\start-localtunnel.ps1
```

## Альтернатива: Временно изменить политику (только для текущей сессии)

Если хотите использовать `lt` напрямую:

```powershell
# Только для текущей сессии PowerShell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Теперь можно использовать
lt --port 3001
```

## Что делать после запуска туннеля:

1. Скопируйте HTTPS URL (например: `https://xyz.loca.lt`)
2. В Netlify: Site settings → Environment variables
3. Добавьте:
   - Key: `API_SERVER_URL`
   - Value: ваш URL от localtunnel
4. Пересоберите сайт на Netlify

## Для локального тестирования

Если тестируете локально, ничего настраивать не нужно - Web App автоматически использует `localhost:3001`.


