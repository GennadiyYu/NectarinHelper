/* Set Telegram webhook with optional secret token */
import 'dotenv/config';

const token = process.env.BOT_TOKEN;
const url = process.env.TELEGRAM_WEBHOOK_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET || '';

if (!token) throw new Error('BOT_TOKEN is required');
if (!url) throw new Error('TELEGRAM_WEBHOOK_URL is required');

const api = `https://api.telegram.org/bot${token}/setWebhook`;

const params = new URLSearchParams();
params.set('url', url);
if (secret) params.set('secret_token', secret);

const resp = await fetch(api, { method: 'POST', body: params });
const data = await resp.json();
console.log('setWebhook response:', data);
