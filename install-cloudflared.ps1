# Скрипт для установки cloudflared на Windows

Write-Host "Установка cloudflared через Chocolatey..." -ForegroundColor Green

# Проверяем, установлен ли Chocolatey
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if (-not $chocoInstalled) {
    Write-Host "Chocolatey не установлен. Устанавливаем..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

Write-Host "Устанавливаем cloudflared..." -ForegroundColor Green
choco install cloudflared -y

Write-Host "`nГотово! Теперь можно запустить:" -ForegroundColor Green
Write-Host "cloudflared tunnel --url http://localhost:3000" -ForegroundColor Yellow

