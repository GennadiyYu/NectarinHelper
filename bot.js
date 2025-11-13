import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import dayjs from 'dayjs';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('BOT_TOKEN is required');

const ADMIN_IDS = (process.env.ADMIN_IDS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(Number);

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'Nectarinlove2022';

// JSON DB
const adapter = new JSONFile('./db.json');
const db = new Low(adapter, { users: {} });
await db.read();
db.data ||= { users: {} };

function getUser(id) {
  const key = String(id);
  if (!db.data.users[key]) {
    db.data.users[key] = {
      id: Number(id),
      authorized: false,
      joinedAt: null,
      username: null,
    };
  }
  return db.data.users[key];
}

function isAdmin(id) {
  return ADMIN_IDS.includes(Number(id));
}

async function saveDB() { await db.write(); }

// Initialize bot
export const bot = new Telegraf(BOT_TOKEN);

// Middleware: store minimal profile
bot.use(async (ctx, next) => {
  if (ctx.from) {
    const u = getUser(ctx.from.id);
    u.username = ctx.from.username || u.username;
    await saveDB();
  }
  await next();
});

// Guard: only /start /help /login /me for unauthorized
const ALLOW = new Set(['start', 'help', 'login', 'me']);
bot.use(async (ctx, next) => {
  const user = ctx.from ? getUser(ctx.from.id) : null;
  const isAuthed = user?.authorized;
  const text = ctx.message?.text || '';
  const cmd = text.startsWith('/') ? text.slice(1).split(' ')[0] : '';

  if (isAuthed || ALLOW.has(cmd)) return next();

  if (ctx.chat?.type === 'private') {
    await ctx.reply('🚪 Вход только по паролю. Введите: `/login <пароль>`', { parse_mode: 'Markdown' });
  }
  // do not call next()
});

// Commands
bot.start(async (ctx) => {
  const user = getUser(ctx.from.id);
  if (user.authorized) {
    return ctx.reply('✅ Вы уже вошли! Можете писать сообщения.');
  } else {
    return ctx.reply(
      '👋 Привет! Чтобы войти, введите пароль: `\n/login ' + MASTER_PASSWORD + '`',
      { parse_mode: 'Markdown' }
    );
  }
});

bot.command('help', (ctx) => {
  ctx.reply('ℹ️ Команды:\n/start — начать\n/login <пароль> — вход\n/me — статус');
});

bot.command('me', (ctx) => {
  const u = getUser(ctx.from.id);
  ctx.reply(
    '👤 ID: ' + u.id + '\n' +
    'Авторизован: ' + u.authorized + '\n' +
    (u.joinedAt ? 'Вошёл: ' + dayjs(u.joinedAt).format('YYYY-MM-DD HH:mm') : '')
  );
});

bot.command('login', async (ctx) => {
  const password = (ctx.message.text || '').split(' ')[1];
  if (!password) return ctx.reply('Введите пароль: `/login <пароль>`', { parse_mode: 'Markdown' });

  if (password === MASTER_PASSWORD) {
    const u = getUser(ctx.from.id);
    u.authorized = true;
    u.joinedAt = new Date().toISOString();
    await saveDB();
    return ctx.reply('✅ Успешный вход! Теперь можете писать сообщения.');
  } else {
    return ctx.reply('❌ Неверный пароль.');
  }
});

// Protected echo handler (replace with your logic)
bot.hears(/.*/s, async (ctx) => {
  await ctx.reply('🎯 Ваше сообщение получено. Здесь может быть любая логика бота.');
});

// Polling for local dev if USE_POLLING=true
if (process.env.USE_POLLING === 'true') {
  bot.launch().then(() => console.log('Bot started in polling mode'));
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

// Export webhook handler path (must match the Serverless endpoint)
export const webhookPath = '/api/webhook';
