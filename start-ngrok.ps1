# Скрипт для запуска ngrok для Web App
# Убедитесь, что ngrok установлен и доступен в PATH

Write-Host "Настройка ngrok..." -ForegroundColor Green

# Добавляем auth token
ngrok config add-authtoken 360Y0D2y3kDnuYz9qbJJAwGanLb_7kSSU9dn4ELv1rtox7CzD

Write-Host "`nЗапуск ngrok на порту 3000 (Web App сервер)..." -ForegroundColor Green
Write-Host "После запуска скопируйте HTTPS URL и добавьте его в .env как WEB_APP_URL" -ForegroundColor Yellow
Write-Host "Например: WEB_APP_URL=https://abc123.ngrok-free.app`n" -ForegroundColor Yellow

# Запускаем ngrok на порту 3000 (где работает Web App сервер)
ngrok http 3000

