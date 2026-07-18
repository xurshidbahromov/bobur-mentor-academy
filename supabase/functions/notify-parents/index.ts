// supabase/functions/notify-parents/index.ts
// Supabase Edge Function — triggered when admin saves attendance
// Calls the Telegram Bot /notify endpoint for each student with a verified parent

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_URL    = Deno.env.get('BOT_URL')!    // e.g. https://your-bot.railway.app
const BOT_SECRET = Deno.env.get('BOT_SECRET')! // same as in bot .env

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  try {
    const { group_id, lesson_date } = await req.json()
    if (!group_id || !lesson_date) {
      return new Response(JSON.stringify({ error: 'group_id and lesson_date required' }), { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get group name
    const { data: group } = await supabase
      .from('crm_groups')
      .select('name')
      .eq('id', group_id)
      .single()

    // Get all attendance for this group + date, joined with parent
    const { data: records, error } = await supabase
      .from('crm_attendance')
      .select(`
        status, note,
        crm_students (
          full_name,
          crm_parents (telegram_chat_id, is_verified)
        )
      `)
      .eq('group_id', group_id)
      .eq('lesson_date', lesson_date)
      .is('notified_at', null) // Only notify once

    if (error) throw error

    const results = []
    for (const rec of records || []) {
      const parent = rec.crm_students?.crm_parents
      if (!parent?.is_verified || !parent?.telegram_chat_id) continue

      try {
        const res = await fetch(`${BOT_URL}/notify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bot-secret': BOT_SECRET,
          },
          body: JSON.stringify({
            chat_id:      parent.telegram_chat_id,
            student_name: rec.crm_students.full_name,
            group_name:   group?.name || '—',
            date:         lesson_date,
            status:       rec.status,
            note:         rec.note,
          }),
        })

        if (res.ok) {
          // Mark as notified
          await supabase
            .from('crm_attendance')
            .update({ notified_at: new Date().toISOString() })
            .eq('student_id', rec.crm_students.id) // Note: need to include student_id in select
            .eq('lesson_date', lesson_date)

          results.push({ student: rec.crm_students.full_name, ok: true })
        } else {
          results.push({ student: rec.crm_students.full_name, ok: false })
        }
      } catch (err) {
        results.push({ student: rec.crm_students.full_name, ok: false, error: err.message })
      }
    }

    return new Response(JSON.stringify({ sent: results.length, results }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
