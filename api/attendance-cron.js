// api/attendance-cron.js
// Vercel Cron — har 5 daqiqada ishlaydi
// Dars tugashiga 15 daqiqa qolganida admin(lar)ga davomat eslatmasini yuboradi

import { createClient } from '@supabase/supabase-js';
import { Telegraf } from 'telegraf';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
const bot = process.env.BOT_TOKEN ? new Telegraf(process.env.BOT_TOKEN) : null;

// Admin Telegram IDlari — bot.js dagi bilan bir xil
const ADMIN_TG_IDS = ['2064830631', '930430910'];

const ADMIN_URL = 'https://bobur-mentor-academy.vercel.app/admin/attendance';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).end();
  }

  if (!bot || !supabase) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  try {
    // Davomat eslatmasi kerak bo'lgan guruhlarni olish
    // RPC qaytaradi: group_id, group_name, end_time, attendance_count, student_count
    const { data: groups, error } = await supabase.rpc('get_groups_needing_reminder');

    if (error) throw error;

    if (!groups || groups.length === 0) {
      return res.status(200).json({ message: 'No reminders needed right now.', checked_at: new Date().toISOString() });
    }

    let sentCount = 0;

    for (const group of groups) {
      const alreadyFull =
        Number(group.attendance_count) >= Number(group.student_count) &&
        Number(group.student_count) > 0;

      // Agar davomat to'liq olingan bo'lsa — eslatma yuborma, faqat db ga belgilab qo'y
      if (alreadyFull) {
        await supabase.from('attendance_reminders').upsert({
          group_id: group.group_id,
          reminder_date: new Date().toISOString().split('T')[0],
        }, { onConflict: 'group_id,reminder_date' });
        continue;
      }

      const missing = Number(group.student_count) - Number(group.attendance_count);
      const today = new Date().toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const message =
        `⏰ <b>Davomat eslatmasi!</b>\n\n` +
        `📚 Guruh: <b>${group.group_name}</b>\n` +
        `📅 Sana: ${today}\n` +
        `⏱ Dars tugash vaqti: <b>${group.end_time}</b>\n\n` +
        (Number(group.attendance_count) === 0
          ? `❗ Bugungi davomat hali <b>olinmagan</b>.`
          : `⚠️ <b>${missing}</b> ta o'quvchining davomati belgilanmagan.`) +
        `\n\n👉 <a href="${ADMIN_URL}">Admin panelga o'tish</a>`;

      // Barcha adminlarga yuborish
      for (const adminId of ADMIN_TG_IDS) {
        try {
          await bot.telegram.sendMessage(adminId, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          });
          sentCount++;
        } catch (tgErr) {
          console.error(`Failed to send to admin ${adminId}:`, tgErr.message);
        }
      }

      // Eslatma yuborilganini belgilaymiz (bugun yana yuborilmasin)
      await supabase.from('attendance_reminders').upsert({
        group_id: group.group_id,
        reminder_date: new Date().toISOString().split('T')[0],
      }, { onConflict: 'group_id,reminder_date' });
    }

    return res.status(200).json({
      success: true,
      groups_reminded: groups.length,
      messages_sent: sentCount,
    });

  } catch (err) {
    console.error('Attendance cron error:', err);
    return res.status(500).json({ error: err.message });
  }
}
