# Инструкция по загрузке проекта на GitHub

## Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на https://github.com
2. Нажмите кнопку **"+"** в правом верхнем углу → **"New repository"**
3. Заполните:
   - **Repository name**: `chess-bot` (или любое другое имя)
   - **Description**: "Telegram Chess Bot with Web App"
   - Выберите **Public** или **Private**
   - **НЕ** создавайте README, .gitignore или license (у нас уже есть)
4. Нажмите **"Create repository"**

## Шаг 2: Подключите локальный репозиторий к GitHub

После создания репозитория GitHub покажет инструкции. Выполните команды:

```bash
cd chess-bot

# Добавьте remote (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/chess-bot.git

# Или если используете SSH:
# git remote add origin git@github.com:YOUR_USERNAME/chess-bot.git

# Переименуйте ветку в main (если нужно)
git branch -M main

# Загрузите код на GitHub
git push -u origin main
```

## Шаг 3: Проверка

Зайдите на ваш репозиторий на GitHub - все файлы должны быть там!

## Важно

Файл `.env` с токенами **НЕ** будет загружен (он в .gitignore).
Не забудьте добавить `.env` локально после клонирования репозитория.

## Дополнительно

Если хотите подключить Netlify к GitHub для автоматического деплоя:

1. В Netlify: **Site settings** → **Build & deploy** → **Continuous Deployment**
2. Подключите GitHub
3. Выберите репозиторий `chess-bot`
4. Настройки:
   - **Base directory**: `webapp`
   - **Build command**: (оставьте пустым)
   - **Publish directory**: `webapp`
5. Сохраните

Теперь при каждом push в GitHub Netlify автоматически обновит Web App!

