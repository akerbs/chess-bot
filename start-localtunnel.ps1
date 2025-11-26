# Скрипт для запуска localtunnel через npx (не требует изменения политики выполнения)

Write-Host "Запуск localtunnel для API сервера (порт 3001)..." -ForegroundColor Green
Write-Host "После запуска скопируйте HTTPS URL и добавьте его в Netlify как переменную окружения API_SERVER_URL" -ForegroundColor Yellow
Write-Host ""

# Запускаем localtunnel через npx (не требует глобальной установки)
npx --yes localtunnel --port 3001
