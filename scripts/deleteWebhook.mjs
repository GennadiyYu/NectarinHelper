/* Delete Telegram webhook */
import 'dotenv/config';

const token = process.env.BOT_TOKEN;
if (!token) throw new Error('BOT_TOKEN is required');

const api = `https://api.telegram.org/bot${token}/deleteWebhook`;
const resp = await fetch(api, { method: 'POST' });
const data = await resp.json();
console.log('deleteWebhook response:', data);
