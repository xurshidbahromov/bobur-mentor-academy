import { createClient } from '@supabase/supabase-js';
import { Telegraf, Markup } from 'telegraf';

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using Anon key because our RPC is SECURITY DEFINER
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Telegraf
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;
const WEB_APP_URL = 'https://bobur-mentor-academy.vercel.app/';

const MESSAGES = [
  "🎓 Oliy ta'limga kirish imkoniyatini qo'ldan boy bermang! Bugungi kunlik bonusingizni oling va darslarni davom ettiring! 🚀",
  "👀 Raqobatchilaringiz allaqachon dars qilishyapti! Bugungi tangalarni yig'ib, bilimingizni oshirish vaqti keldi.",
  "🎁 Qattiq mehnat — omad kalitidir! Platformaga kiring va bugungi sovg'angizni oling!",
  "🔥 O'z ustingizda ishlashdan to'xtamang. Ketma-ketlikni (streak) saqlab qolish uchun bugungi darsingizni bajaring!",
  "💰 Kunlik bepul tangalaringiz sizni kutmoqda! Ularni yig'ib reytingda yuqoriga ko'tariling."
];

export default async function handler(req, res) {
  // Only allow GET or POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).end();
  }

  // Security check for Vercel Cron (Optional but recommended)
  // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).end('Unauthorized');
  // }

  if (!bot || !supabase) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  try {
    // Fetch users who haven't claimed today
    const { data: users, error } = await supabase.rpc('get_users_for_daily_reminder');
    
    if (error) throw error;
    if (!users || users.length === 0) {
      return res.status(200).json({ message: 'No users to remind today.' });
    }

    let successCount = 0;

    // Send messages
    for (const user of users) {
      if (!user.telegram_id) continue;
      
      const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      const greeting = `Assalomu alaykum, <b>${user.full_name || 'do\'stim'}</b>!\n\n`;
      
      try {
        await bot.telegram.sendMessage(
          user.telegram_id,
          greeting + randomMsg,
          {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
              Markup.button.webApp('🔥 Tangalarni olish', WEB_APP_URL)
            ])
          }
        );
        successCount++;
      } catch (tgError) {
        console.error(`Failed to send reminder to ${user.telegram_id}:`, tgError.message);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Reminders sent to ${successCount}/${users.length} users.` 
    });

  } catch (err) {
    console.error('Cron Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
