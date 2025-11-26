@echo off
echo Запуск localtunnel для API сервера (порт 3001)...
echo После запуска скопируйте HTTPS URL и добавьте его в Netlify как переменную окружения API_SERVER_URL
echo.

npx localtunnel --port 3001
