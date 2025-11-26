@echo off
echo Запуск Cloudflare Tunnel для Web App...
echo.
echo Установите cloudflared если еще не установлен:
echo https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
echo.
echo После запуска скопируйте HTTPS URL и добавьте его в .env как WEB_APP_URL
echo.

cloudflared tunnel --url http://localhost:3000

