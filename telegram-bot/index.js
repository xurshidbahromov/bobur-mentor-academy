// Bobur Mentor Academy — CRM Telegram Bot
// Parent registration + attendance notifications
// Run: node index.js (or deploy to Railway/Render)

require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const express     = require('express')
const { createClient } = require('@supabase/supabase-js')

// ── Config ─────────────────────────────────────────────
const BOT_TOKEN    = process.env.BOT_TOKEN
const WEBHOOK_URL  = process.env.WEBHOOK_URL  // e.g. https://your-bot.railway.app
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY // Service role — bypasses RLS

if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[Bot] Missing env vars. Check .env file.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const bot      = new TelegramBot(BOT_TOKEN)
const app      = express()

app.use(express.json())

// ── Webhook setup ──────────────────────────────────────
if (WEBHOOK_URL) {
  bot.setWebHook(`${WEBHOOK_URL}/webhook/${BOT_TOKEN}`)
  app.post(`/webhook/${BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
  })
  console.log(`[Bot] Webhook set: ${WEBHOOK_URL}/webhook/${BOT_TOKEN}`)
} else {
  // Fallback: long polling (for local dev)
  bot.startPolling()
  console.log('[Bot] Polling mode (local dev)')
}

// ── State: tracks each user's registration step ───────
const userState = {} // { chatId: { step, phone } }

// ── /start ─────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id
  userState[chatId] = null

  // Check if already registered
  const { data: existing } = await supabase
    .from('crm_parents')
    .select('*, crm_students(full_name, crm_groups(name))')
    .eq('telegram_chat_id', chatId)
    .eq('is_verified', true)
    .limit(1)
    .maybeSingle()

  if (existing) {
    return bot.sendMessage(chatId,
      `👋 Xush kelibsiz, ${msg.from.first_name}!\n\n` +
      `📚 *${existing.crm_students?.full_name}* (${existing.crm_students?.crm_groups?.name}) ning ota-onasi sifatida ro'yxatdansiz.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: '📊 Farzandim davomati' }],
            [{ text: '📋 Guruh ma\'lumotlari' }],
          ],
          resize_keyboard: true,
        }
      }
    )
  }

  bot.sendMessage(chatId,
    `👋 Assalomu alaykum, *${msg.from.first_name}*!\n\n` +
    `🏫 Bobur Mentor Academy CRM botiga xush kelibsiz.\n\n` +
    `Bu bot orqali farzandingizning davomat holatini kuzatib borishingiz mumkin.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [{ text: '👨‍👩‍👧 Ota-ona sifatida bog\'lanish' }],
        ],
        resize_keyboard: true,
      }
    }
  )
})

// ── Register flow ──────────────────────────────────────
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text   = msg.text

  // ── Step 1: Start registration ──
  if (text === "👨‍👩‍👧 Ota-ona sifatida bog'lanish") {
    userState[chatId] = { step: 'awaiting_phone' }
    return bot.sendMessage(chatId,
      '📱 Iltimos, telefon raqamingizni yuboring.\n\n' +
      'Quyidagi tugmani bosing — raqam avtomatik yuboriladi:',
      {
        reply_markup: {
          keyboard: [[{ text: '📱 Raqamni ulashish', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        }
      }
    )
  }

  // ── Attendance view ──
  if (text === '📊 Farzandim davomati') {
    return handleAttendanceView(chatId)
  }

  // ── Group info ──
  if (text === "📋 Guruh ma'lumotlari") {
    return handleGroupInfo(chatId)
  }
})

// ── Contact (phone) received ──────────────────────────
bot.on('contact', async (msg) => {
  const chatId  = msg.chat.id
  const contact = msg.contact
  const state   = userState[chatId]

  if (!state || state.step !== 'awaiting_phone') return

  // Normalize phone: +998901234567 or 998901234567
  const rawPhone = contact.phone_number
  const phone    = normalizePhone(rawPhone)

  console.log(`[Bot] Phone received: ${phone} for chatId: ${chatId}`)

  // Look up in crm_parents by phone
  const { data: parent, error } = await supabase
    .from('crm_parents')
    .select('*, crm_students(id, full_name, crm_groups(name, schedule_days, start_time))')
    .or(`phone.eq.${phone},phone.eq.${rawPhone},phone.eq.+${rawPhone}`)
    .eq('is_verified', false)
    .limit(1)
    .maybeSingle()

  if (error || !parent) {
    userState[chatId] = null
    return bot.sendMessage(chatId,
      '❌ *Kechirasiz, bu raqam tizimda topilmadi.*\n\n' +
      'Iltimos, mentorga murojaat qiling va raqamingiz qo\'shilganiga ishonch hosil qiling.',
      {
        parse_mode: 'Markdown',
        reply_markup: { keyboard: [[{ text: "👨‍👩‍👧 Ota-ona sifatida bog'lanish" }]], resize_keyboard: true }
      }
    )
  }

  const student = parent.crm_students
  userState[chatId] = { step: 'awaiting_confirm', parentId: parent.id, phone, student }

  bot.sendMessage(chatId,
    `✅ *Quyidagi o'quvchi topildi:*\n\n` +
    `👦 *${student.full_name}*\n` +
    `📚 Guruh: ${student.crm_groups?.name || '—'}\n` +
    `📅 Dars kunlari: ${student.crm_groups?.schedule_days?.join(', ') || '—'}\n` +
    `🕐 Vaqt: ${student.crm_groups?.start_time || '—'}\n\n` +
    `Bu siz farzandingiz ekanligini tasdiqlaysizmi?`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [{ text: '✅ Ha, mening farzandim' }],
          [{ text: '❌ Yo\'q, boshqa raqam' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      }
    }
  )
})

// ── Confirm or deny ────────────────────────────────────
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text   = msg.text
  const state  = userState[chatId]

  if (!state || state.step !== 'awaiting_confirm') return

  if (text === '✅ Ha, mening farzandim') {
    // Save telegram_chat_id and mark as verified for ALL children with this phone
    const { error } = await supabase
      .from('crm_parents')
      .update({ telegram_chat_id: chatId, is_verified: true, verified_at: new Date().toISOString() })
      .eq('phone', state.phone)

    userState[chatId] = null

    if (error) {
      return bot.sendMessage(chatId, '⚠️ Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.')
    }

    bot.sendMessage(chatId,
      `🎉 *Muvaffaqiyatli ro'yxatdan o'tdingiz!*\n\n` +
      `Endi *${state.student.full_name}* ning davomat holati haqida avtomatik xabar olasiz.\n\n` +
      `📊 Davomat tarixini ko'rish uchun quyidagi tugmani bosing:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: '📊 Farzandim davomati' }],
            [{ text: '📋 Guruh ma\'lumotlari' }],
          ],
          resize_keyboard: true,
        }
      }
    )
  } else if (text === "❌ Yo'q, boshqa raqam") {
    userState[chatId] = { step: 'awaiting_phone' }
    bot.sendMessage(chatId,
      '📱 Iltimos, boshqa raqamni yuboring:',
      {
        reply_markup: {
          keyboard: [[{ text: '📱 Raqamni ulashish', request_contact: true }]],
          resize_keyboard: true,
        }
      }
    )
  }
})

// ── Attendance view ────────────────────────────────────
async function handleAttendanceView(chatId) {
  const { data: parent } = await supabase
    .from('crm_parents')
    .select('student_id')
    .eq('telegram_chat_id', chatId)
    .eq('is_verified', true)
    .single()

  if (!parent) {
    return bot.sendMessage(chatId, "❌ Siz hali ro'yxatdan o'tmagansiz.")
  }

  const { data: records } = await supabase
    .from('crm_attendance')
    .select('lesson_date, status, note')
    .eq('student_id', parent.student_id)
    .order('lesson_date', { ascending: false })
    .limit(20)

  if (!records || records.length === 0) {
    return bot.sendMessage(chatId, '📊 Hozircha davomat ma\'lumotlari yo\'q.')
  }

  const counts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const STATUS_EMOJI = { present: '✅', absent: '❌', late: '⏰', excused: '📝' }
  const STATUS_LABEL = { present: 'Keldi', absent: 'Kelmadi', late: 'Kech keldi', excused: 'Sababli' }

  const recent = records.slice(0, 10).map(r =>
    `${STATUS_EMOJI[r.status]} ${formatDate(r.lesson_date)}${r.note ? ` _(${r.note})_` : ''}`
  ).join('\n')

  const { data: student } = await supabase
    .from('crm_students')
    .select('full_name')
    .eq('id', parent.student_id)
    .single()

  const msg =
    `📊 *${student?.full_name} — Davomat statistikasi*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `✅ Keldi: *${counts.present || 0}* kun\n` +
    `❌ Kelmadi: *${counts.absent || 0}* kun\n` +
    `⏰ Kech keldi: *${counts.late || 0}* kun\n` +
    `📝 Sababli: *${counts.excused || 0}* kun\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `*So'nggi darslar:*\n${recent}`

  bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' })
}

// ── Group info ─────────────────────────────────────────
async function handleGroupInfo(chatId) {
  const { data: parent } = await supabase
    .from('crm_parents')
    .select('crm_students(full_name, crm_groups(name, schedule_days, start_time, end_time))')
    .eq('telegram_chat_id', chatId)
    .eq('is_verified', true)
    .single()

  if (!parent) return bot.sendMessage(chatId, "❌ Siz hali ro'yxatdan o'tmagansiz.")

  const g = parent.crm_students?.crm_groups
  const msg =
    `📚 *Guruh ma'lumotlari*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🏫 Guruh: *${g?.name || '—'}*\n` +
    `👦 O'quvchi: *${parent.crm_students?.full_name || '—'}*\n` +
    `📅 Kunlar: ${g?.schedule_days?.join(', ') || '—'}\n` +
    `🕐 Vaqt: ${g?.start_time || '—'}${g?.end_time ? ` — ${g.end_time}` : ''}\n`

  bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' })
}

// ── Exported: sendNotification (called from Edge Function) ─
// POST /notify  { chat_id, student_name, group_name, date, status, note }
app.post('/notify', async (req, res) => {
  const secret = req.headers['x-bot-secret']
  if (secret !== process.env.BOT_SECRET) return res.status(401).json({ error: 'Unauthorized' })

  const { chat_id, student_name, group_name, date, status, note } = req.body
  const STATUS_EMOJI = { present: '✅', absent: '❌', late: '⏰', excused: '📝' }
  const STATUS_LABEL = { present: 'Keldi', absent: 'Kelmadi', late: 'Kech keldi', excused: 'Sababli' }

  const text =
    `📚 *Bobur Mentor Academy*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📅 ${formatDate(date)}\n` +
    `👦 *${student_name}*\n` +
    `📍 ${group_name}\n\n` +
    `Bugungi dars: *${STATUS_EMOJI[status]} ${STATUS_LABEL[status]}*` +
    (note ? `\n📝 _${note}_` : '') +
    `\n\n_Bobur Mentor Academy CRM_`

  try {
    await bot.sendMessage(chat_id, text, { parse_mode: 'Markdown' })
    res.json({ ok: true })
  } catch (err) {
    console.error('[Bot] Send error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── Helpers ────────────────────────────────────────────
function normalizePhone(phone) {
  let p = phone.replace(/\D/g, '')
  if (p.startsWith('998')) p = '+' + p
  else if (p.startsWith('9') && p.length === 9) p = '+998' + p
  else if (!p.startsWith('+')) p = '+' + p
  return p
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const months = ['Yan','Fev','Mar','Apr','May','Iyun','Iyul','Avg','Sen','Okt','Noy','Dek']
  const days   = ['Yak','Dush','Sesh','Chor','Pay','Juma','Shan']
  return `${d.getDate()}-${months[d.getMonth()]} (${days[d.getDay()]})`
}

// ── Start server ───────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`[Bot] Server running on port ${PORT}`))
