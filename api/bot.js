import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;
const WEB_APP_URL = 'https://bobur-mentor-academy.vercel.app/';
const ADMIN_TG_IDS = ['2064830631', '930430910']; // Admin Telegram IDs

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (bot) {
  // ── 1. /start ──
  bot.start(async (ctx) => {
    const isAdmin = ADMIN_TG_IDS.includes(String(ctx.from.id));
    const keyboardButtons = [
      ['👤 Profil', '🎁 Taklifnoma'],
      ['ℹ️ Yordam']
    ];

    // Faqat adminlarga Statistika tugmasini qo'shamiz
    if (isAdmin) {
      keyboardButtons.push(['📊 Statistika']);
    }

    // 1. Doimiy klaviaturani o'rnatish
    await ctx.reply(
      "Asosiy menyu aktivlashtirildi 👇", 
      Markup.keyboard(keyboardButtons).resize()
    );

    // 2. Asosiy e'tiborni tortuvchi xabar va Inline Tugma
    await ctx.reply(
      `Assalomu alaykum, <b>${ctx.from.first_name}</b>! 👋\n\n<b>Bobur Mentor Academy</b> platformasiga xush kelibsiz.\n\nDarslarni davom ettirish va bilimlaringizni oshirish uchun pastdagi tugmani bosing:`,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp("🚀 O'QISHNI BOSHLASH", WEB_APP_URL)]
        ])
      }
    );
  });

  // ── 2. /profile va "👤 Profil" tugmasi ──
  const handleProfile = async (ctx) => {
    if (!supabase) return ctx.reply("❌ Tizimda xatolik (Baza ulanmagan).");
    const tgId = String(ctx.from.id);
    
    try {
      const { data: profile, error } = await supabase.rpc('get_profile_by_telegram_id', { p_tg_id: tgId });
      
      if (error) throw error;
      if (!profile || profile.length === 0) {
        return ctx.reply("Siz hali platformaga kirmagansiz yoki profilingiz Telegramingizga ulanmagan. Iltimos, '🚀 Platformaga kirish' tugmasi orqali platformaga kiring.");
      }

      const p = profile[0];
      const msg = `👤 <b>Sizning Profilingiz</b>\n\n` +
                  `Ism: <b>${p.full_name || 'Kiritilmagan'}</b>\n` +
                  `Tangalar: <b>${p.coins} 🪙</b>\n` +
                  `Streak: <b>${p.streak_count} 🔥</b>\n` +
                  `Eng uzun streak: <b>${p.longest_streak} 🏆</b>`;
                  
      ctx.reply(msg, { parse_mode: 'HTML' });
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Ma'lumotlarni olishda xatolik yuz berdi.");
    }
  };
  bot.command('profile', handleProfile);
  bot.hears('👤 Profil', handleProfile);

  // ── 3. /referral va "🎁 Taklifnoma" tugmasi ──
  const handleReferral = async (ctx) => {
    if (!supabase) return;
    const tgId = String(ctx.from.id);
    
    try {
      const { data: profile, error } = await supabase.rpc('get_profile_by_telegram_id', { p_tg_id: tgId });
      if (error || !profile || profile.length === 0) {
        return ctx.reply("Referral link olish uchun avval platformaga kiring.");
      }
      
      const userId = profile[0].id;
      const shareText = encodeURIComponent(`Men "Bobur Mentor Academy" platformasida bilim olyapman! 🎉\n\nQuyidagi ssilka orqali o'tib, o'qishni boshla va bonuslarga ega bo'l!`);
      const referralLink = `https://t.me/share/url?url=${WEB_APP_URL}?startapp=ref_${userId}&text=${shareText}`;

      ctx.reply(
        `🎁 <b>Do'stlarni taklif qilish</b>\n\n` +
        `Sizning shaxsiy ssilkangiz:\n<code>${WEB_APP_URL}?startapp=ref_${userId}</code>\n\n` +
        `Yoki quyidagi tugmani bosib darhol do'stlaringizga ulashing:`,
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            Markup.button.url("↗️ Do'stlarga yuborish", referralLink)
          ])
        }
      );
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Xatolik yuz berdi.");
    }
  };
  bot.command('referral', handleReferral);
  bot.hears('🎁 Taklifnoma', handleReferral);

  // ── 4. /stats va "📊 Statistika" tugmasi (Faqat Admin) ──
  const handleStats = async (ctx) => {
    if (!ADMIN_TG_IDS.includes(String(ctx.from.id))) {
      return ctx.reply("Sizda bu buyruqni ishlatish huquqi yo'q.");
    }

    if (!supabase) return ctx.reply("❌ Tizim xatosi (Supabase).");

    try {
      const { data: stats, error } = await supabase.rpc('get_bot_stats');
      if (error) throw error;

      const msg = `📊 <b>Platforma Statistikasi</b>\n\n` +
                  `👤 Jami o'quvchilar: <b>${stats.total_users}</b>\n` +
                  `🔥 Bugun qo'shilganlar: <b>${stats.today_new_users}</b>\n` +
                  `🪙 Tarqatilgan tangalar: <b>${stats.total_coins}</b>`;
                  
      ctx.reply(msg, { parse_mode: 'HTML' });
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Statistika olinmadi.");
    }
  };
  bot.command('stats', handleStats);
  bot.hears('📊 Statistika', handleStats);

  const handleHelp = (ctx) => {
    ctx.reply(
      `Mavjud tugmalar va buyruqlar:\n` +
      `👤 Profil - Shaxsiy ma'lumotlar va tangalar\n` +
      `🎁 Taklifnoma - Do'stlarni taklif qilish\n` +
      `/stats - Platforma statistikasi (Faqat Adminlar uchun)`
    );
  };
  bot.help(handleHelp);
  bot.hears('ℹ️ Yordam', handleHelp);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Bot is running');
  }

  if (!bot) {
    console.error("BOT_TOKEN missing.");
    return res.status(500).send('Misconfigured');
  }

  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).send('Error');
  }
}
