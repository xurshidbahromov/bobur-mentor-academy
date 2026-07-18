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
    
    let isParent = false;
    if (supabase) {
      const { data } = await supabase.from('crm_parents').select('id').eq('telegram_chat_id', ctx.from.id).eq('is_verified', true).limit(1).maybeSingle();
      if (data) isParent = true;
    }

    const keyboardButtons = [
      ['👤 Profil', '🎁 Taklifnoma']
    ];

    if (isParent) {
      keyboardButtons.push(['📊 Farzandim davomati', '📋 Guruh ma\'lumotlari']);
    } else {
      keyboardButtons.push(['👨‍👩‍👧 Ota-ona sifatida ro\'yxatdan o\'tish']);
    }

    keyboardButtons.push(['ℹ️ Yordam']);

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
        return ctx.reply(
          "Siz hali platformaga kirmagansiz yoki profilingiz Telegramingizga ulanmagan.\n\nIltimos, quyidagi tugma orqali platformaga kiring:",
          {
            ...Markup.inlineKeyboard([
              [Markup.button.webApp("🚀 Platformaga kirish", WEB_APP_URL)]
            ])
          }
        );
      }

      const p = profile[0];
      const coins = p.coins ?? 0;
      const xp = p.xp ?? 0;
      const streak = p.streak_count ?? 0;
      const longestStreak = p.longest_streak ?? 0;
      const fullName = p.full_name || ctx.from.first_name || 'Kiritilmagan';

      const msg = `👤 <b>Sizning Profilingiz</b>\n\n` +
                  `Ism: <b>${fullName}</b>\n` +
                  `Tangalar: <b>${coins} 🪙</b>\n` +
                  `XP: <b>${xp} ⚡</b>\n` +
                  `Streak: <b>${streak} 🔥</b>\n` +
                  `Eng uzun streak: <b>${longestStreak} 🏆</b>`;
                  
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

      const s = stats || {};
      const msg = `📊 <b>Platforma Statistikasi</b>\n\n` +
                  `👤 Jami o'quvchilar: <b>${s.total_users ?? 0}</b>\n` +
                  `🔥 Bugun qo'shilganlar: <b>${s.today_new_users ?? 0}</b>\n` +
                  `🪙 Tarqatilgan tangalar: <b>${s.total_coins ?? 0}</b>\n` +
                  `⚡ Jami XP: <b>${s.total_xp ?? 0}</b>`;
                  
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
      `👨‍👩‍👧 Ota-ona sifatida ro'yxatdan o'tish - Farzandingiz davomatini kuzatish\n` +
      `/stats - Platforma statistikasi (Faqat Adminlar uchun)`
    );
  };
  bot.help(handleHelp);
  bot.hears('ℹ️ Yordam', handleHelp);

  // ── 5. Ota-ona ro'yxatdan o'tish va funksiyalar ──
  bot.hears('👨‍👩‍👧 Ota-ona sifatida ro\'yxatdan o\'tish', async (ctx) => {
    ctx.reply(
      '📱 Iltimos, telefon raqamingizni tasdiqlash uchun pastdagi "Raqamni ulashish" tugmasini bosing:',
      Markup.keyboard([
        [Markup.button.contactRequest('📱 Raqamni ulashish')]
      ]).resize().oneTime()
    );
  });

  bot.on('contact', async (ctx) => {
    if (!supabase) return ctx.reply("❌ Tizimda xatolik.");
    const contact = ctx.message.contact;
    const tgId = ctx.from.id;
    
    let p = contact.phone_number.replace(/\\D/g, '');
    if (p.startsWith('998')) p = '+' + p;
    else if (p.startsWith('9') && p.length === 9) p = '+998' + p;
    else if (!p.startsWith('+')) p = '+' + p;

    const { data: parents, error } = await supabase
      .from('crm_parents')
      .select('*, crm_students(full_name)')
      .or(`phone.eq.${p},phone.eq.${contact.phone_number},phone.eq.+${contact.phone_number}`);

    if (error || !parents || parents.length === 0) {
      return ctx.reply("❌ Kechirasiz, bu raqam tizimda topilmadi.\nIltimos mentorga murojaat qiling va farzandingizga raqamingiz to'g'ri kiritilganiga ishonch hosil qiling.", 
        Markup.keyboard([['👨‍👩‍👧 Ota-ona sifatida ro\'yxatdan o\'tish'], ['👤 Profil', '🎁 Taklifnoma'], ['ℹ️ Yordam']]).resize()
      );
    }

    const { error: updateErr } = await supabase
      .from('crm_parents')
      .update({ telegram_chat_id: tgId, is_verified: true, verified_at: new Date().toISOString() })
      .in('id', parents.map(pr => pr.id));

    if (updateErr) {
      return ctx.reply("⚠️ Xatolik yuz berdi. Qayta urinib ko'ring.");
    }

    const studentNames = parents.map(pr => `👦 ${pr.crm_students?.full_name}`).join('\n');
    
    const kb = [
      ['👤 Profil', '🎁 Taklifnoma'],
      ['📊 Farzandim davomati', '📋 Guruh ma\'lumotlari'],
      ['ℹ️ Yordam']
    ];
    if (ADMIN_TG_IDS.includes(String(tgId))) kb.push(['📊 Statistika']);

    ctx.reply(`🎉 Muvaffaqiyatli ro'yxatdan o'tdingiz!\n\nQuyidagi o'quvchilar profiliga ulandingiz:\n${studentNames}`, 
      Markup.keyboard(kb).resize()
    );
  });

  bot.hears('📊 Farzandim davomati', async (ctx) => {
    if (!supabase) return;
    const tgId = ctx.from.id;
    const { data: parents } = await supabase.from('crm_parents').select('student_id, crm_students(full_name)').eq('telegram_chat_id', tgId).eq('is_verified', true);
    
    if (!parents || parents.length === 0) return ctx.reply("Siz ota-ona sifatida tasdiqlanmagansiz.");

    for (let p of parents) {
      const { data: records } = await supabase.from('crm_attendance').select('lesson_date, status, note').eq('student_id', p.student_id).order('lesson_date', { ascending: false }).limit(10);
      const counts = (records||[]).reduce((acc, r) => { acc[r.status] = (acc[r.status]||0)+1; return acc }, {});
      const STATUS_EMOJI = { present: '✅', absent: '❌', late: '⏰', excused: '📝' };
      const recent = (records||[]).map(r => `${STATUS_EMOJI[r.status]} ${r.lesson_date}${r.note ? ` (${r.note})` : ''}`).join('\n');
      
      let msg = `📊 <b>${p.crm_students?.full_name} — Davomat statistikasi</b>\n\n` +
        `✅ Keldi: <b>${counts.present||0}</b> kun\n❌ Kelmadi: <b>${counts.absent||0}</b> kun\n\n<b>So'nggi darslar:</b>\n${recent || "Ma'lumot yo'q"}`;
      await ctx.reply(msg, { parse_mode: 'HTML' });
    }
  });

  bot.hears('📋 Guruh ma\'lumotlari', async (ctx) => {
    if (!supabase) return;
    const tgId = ctx.from.id;
    const { data: parents } = await supabase.from('crm_parents').select('crm_students(full_name, crm_groups(name, schedule_days, start_time))').eq('telegram_chat_id', tgId).eq('is_verified', true);
    if (!parents || parents.length === 0) return ctx.reply("Topilmadi.");

    for (let p of parents) {
      const g = p.crm_students?.crm_groups;
      let msg = `📚 <b>Guruh ma'lumotlari</b>\n\n👦 O'quvchi: <b>${p.crm_students?.full_name}</b>\n🏫 Guruh: <b>${g?.name || '—'}</b>\n📅 Kunlar: ${g?.schedule_days?.join(', ') || '—'}\n🕐 Vaqt: ${g?.start_time || '—'}`;
      await ctx.reply(msg, { parse_mode: 'HTML' });
    }
  });
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
