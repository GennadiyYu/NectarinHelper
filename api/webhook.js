// Explicit runtime config for Vercel
export const config = { runtime: 'nodejs20.x' };

// Serverless function for Vercel: /api/webhook
import 'dotenv/config';
import { bot, webhookPath } from '../bot.js';

const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';

// Pre-create telegraf handler once (re-used across invocations)
const handleUpdate = bot.webhookCallback(webhookPath);

export default async function handler(req, res) {
  // Only accept Telegram's secret token if configured
  if (SECRET) {
    const token = req.headers['x-telegram-bot-api-secret-token'];
    if (token !== SECRET) {
      res.status(403).json({ ok: false, error: 'Forbidden: bad secret' });
      return;
    }
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    await handleUpdate(req, res);
  } catch (e) {
    console.error('Webhook error:', e);
    res.status(500).json({ ok: false });
  }
}
