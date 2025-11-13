// Explicit runtime for Vercel Function
export const config = { runtime: 'nodejs' };

import 'dotenv/config';
import { bot, webhookPath } from '../bot.js';

const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';

// Create handler once and reuse
const handleUpdate = bot.webhookCallback(webhookPath);

export default async function handler(req, res) {
  if (SECRET) {
    const token = req.headers['x-telegram-bot-api-secret-token'];
    if (token !== SECRET) {
      res.status(403).json({ ok: false, error: 'Forbidden: bad secret' });
      return;
    }
  }

  if (req.method !== 'POST') {
    // показываем понятный ответ при GET для диагностики
    res.status(405).json({ ok: false, error: 'Method Not Allowed. Use POST from Telegram.' });
    return;
  }

  try {
    await handleUpdate(req, res);
  } catch (e) {
    console.error('Webhook error:', e);
    res.status(500).json({ ok: false });
  }
}
