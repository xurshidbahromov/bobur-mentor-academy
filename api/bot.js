import { Telegraf, Markup } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;

// Initialize bot only if token exists (prevents crashing if env is missing)
const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;

// URL of the deployed Mini App
const WEB_APP_URL = 'https://bobur-mentor-academy.vercel.app/';

if (bot) {
  bot.start((ctx) => {
    ctx.reply(
      `Assalomu alaykum, <b>${ctx.from.first_name}</b>! 👋\n\n<b>Bobur Mentor Academy</b> platformasiga xush kelibsiz.\nDasturlash bo'yicha bilimlaringizni oshirish uchun quyidagi tugmani bosib platformamizga kiring:`,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          Markup.button.webApp('🚀 Platformaga kirish', WEB_APP_URL)
        ])
      }
    );
  });

  bot.help((ctx) => {
    ctx.reply('Savollaringiz bo\'lsa yoki yordam kerak bo\'lsa, bizga murojaat qiling!');
  });
}

export default async function handler(req, res) {
  // Add basic security checking or log
  if (req.method !== 'POST') {
    return res.status(200).send('Bobur Mentor Academy Telegram Bot API is running.');
  }

  if (!bot) {
    console.error("BOT_TOKEN is not set.");
    return res.status(500).send('Bot misconfigured');
  }

  try {
    // Process the incoming update from Telegram
    await bot.handleUpdate(req.body);
    // Respond back to Telegram that the update was received
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling update:', error);
    res.status(500).send('Internal Server Error');
  }
}
