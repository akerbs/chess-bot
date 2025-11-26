@echo off
echo Настройка ngrok...
ngrok config add-authtoken 360Y0D2y3kDnuYz9qbJJAwGanLb_7kSSU9dn4ELv1rtox7CzD

echo.
echo Запуск ngrok на порту 3000 (Web App сервер)...
echo После запуска скопируйте HTTPS URL и добавьте его в .env как WEB_APP_URL
echo Например: WEB_APP_URL=https://abc123.ngrok-free.app
echo.

ngrok http 3000

