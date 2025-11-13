# Nectarin Auth Bot — Webhook (Vercel)

Бот Telegram с **единым паролем** и **вебхуком** для Vercel. Основа — Telegraf v4 + LowDB.

## Фичи
- Вход по паролю (`/login <пароль>`), мастер-пароль задаётся в переменной окружения.
- Неавторизованные видят только подсказку для входа.
- Webhook-функция `/api/webhook` с проверкой `X-Telegram-Bot-Api-Secret-Token`.
- Поддержка локального запуска в режиме polling (`npm run dev`).

## Быстрый старт (локально)

```bash
npm i
cp .env.example .env
# укажи BOT_TOKEN и MASTER_PASSWORD при необходимости
npm run dev
```

## Деплой на Vercel

1. Создай новый проект, импортируй этот репозиторий/архив.
2. В **Project Settings → Environment Variables** добавь:
   - `BOT_TOKEN` — токен бота
   - `MASTER_PASSWORD` — например `Nectarinlove2022`
   - `ADMIN_IDS` — через запятую (опционально)
   - `TELEGRAM_WEBHOOK_SECRET` — любая строка (рекомендуется)
   - `TELEGRAM_WEBHOOK_URL` — полный URL вебхука (например `https://<project>.vercel.app/api/webhook`)
3. Задеплой проект.
4. Установи вебхук (один раз):
   ```bash
   npm run set-webhook
   ```
   Скрипт использует `TELEGRAM_WEBHOOK_URL` и `TELEGRAM_WEBHOOK_SECRET`.
5. Готово. Telegram начнёт слать обновления на `/api/webhook`.

## Проверка

- Запусти бота в Telegram `/start`.
- Введи пароль:
  ```
  /login Nectarinlove2022
  ```

## Смена режима

- **Webhook (Vercel)** — по умолчанию. Ничего дополнительно запускать не нужно.
- **Polling (локально)** — запускается если `USE_POLLING=true` (см. `npm run dev`).

## Структура

```
api/webhook.js         # серверлес-функция (вебхук)
bot.js                 # логика бота (экспорт bot + webhookPath)
scripts/setWebhook.mjs # установка вебхука
scripts/deleteWebhook.mjs
.vercel.json           # (опциональная) настройка рантайма
.env.example           # образец переменных окружения
db.json                # появится автоматически (LowDB)
```

## Примечания безопасности
- Обязательно укажи `TELEGRAM_WEBHOOK_SECRET` и установи вебхук со `secret_token` — так Telegram будет присылать заголовок, а функция отвергнет чужие запросы.
- Не коммить реальные `.env` с токенами в публичные репозитории.

---
## Troubleshooting (Vercel)
- Ошибка вида **"Function Runtimes must have a valid version"** обычно появляется из-за легаси-конфига (`now.json` или старого `vercel.json` с `builds`).
- В этом патче `vercel.json` удалён, а рантайм задаётся прямо в `api/webhook.js`:
  ```js
  export const config = { runtime: 'nodejs20.x' };
  ```
- Проверь в корне проекта и в настройках Vercel, что нет других конфигов (`now.json`, старый `vercel.json`), которые могут конфликтовать.
- Если используешь монорепозиторий, убедись, что проект направлен в папку с этим `api/`.
