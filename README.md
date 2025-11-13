# Nectarin Helper — Full (Webhook + Health + Static)

Готовый Telegram-бот с **единым паролем** и **вебхуком** для Vercel.
Стек: Telegraf v4 + LowDB. Добавлены `/api/health` и статическая `index.html`.

## Быстрый старт (локально)

```bash
npm i
cp .env.example .env
# заполни BOT_TOKEN, MASTER_PASSWORD и т.д.
npm run dev
```

## Деплой на Vercel

1. Создай проект и залей файлы. В корне должна быть папка `api/`.
2. В Project Settings → General:
   - Framework Preset: **Other**
   - Root Directory: **корень** с этими файлами
   - Build Command: пусто
   - Output Directory: пусто
3. В Project Settings → Environment Variables добавь:
   - `BOT_TOKEN`
   - `MASTER_PASSWORD` (например `Nectarinlove2022`)
   - `ADMIN_IDS` (опционально)
   - `TELEGRAM_WEBHOOK_SECRET`
   - `TELEGRAM_WEBHOOK_URL` = `https://<project>.vercel.app/api/webhook`
4. Задеплой.
5. Установи вебхук один раз:
   ```bash
   npm run set-webhook
   ```
6. Проверяй:
   - `GET /api/health` → 200 OK
   - `GET /` → статика отдается
   - `GET https://api.telegram.org/bot<ТОКЕН>/getWebhookInfo`

## Тест вебхука вручную (curl)

```bash
curl -i -X POST "https://<project>.vercel.app/api/webhook"   -H "Content-Type: application/json"   -H "X-Telegram-Bot-Api-Secret-Token: <секрет>"   --data '{"update_id":1,"message":{"message_id":1,"date":0,"from":{"id":123,"is_bot":false,"first_name":"Test"},"chat":{"id":123,"type":"private"},"text":"/start"}}'
```

## Примечания безопасности
- Не публикуй реальный `BOT_TOKEN` в публичных местах. При утечке — у BotFather сделай `/revoke` и обнови токен в Vercel, затем заново `setWebhook`.
