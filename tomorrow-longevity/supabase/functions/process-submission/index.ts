import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { submission_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Fetch submission
    const { data: sub, error } = await supabase
      .from('submissions').select('*').eq('id', submission_id).single()
    if (error || !sub) throw new Error('Submission not found')

    const a = sub.answers || {}

    // 2. Build Claude prompt
    const prompt = buildPrompt(a, sub)

    // 3. Call Claude API
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const aiData = await aiRes.json()
    const insights = aiData.content?.[0]?.text || ''

    // 4. Update submission with insights
    await supabase.from('submissions').update({
      ai_insights: insights,
      status: 'complete',
    }).eq('id', submission_id)

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function buildPrompt(a: Record<string, unknown>, sub: Record<string, unknown>) {
  const get = (k: string) => String(a[k] || '')
  const num = (k: string) => Number(a[k]) || 0
  const arr = (k: string) => Array.isArray(a[k]) ? (a[k] as string[]).join(', ') : ''

  const bmi = (num('q10') > 0)
    ? (num('q9') / Math.pow(num('q10')/100, 2)).toFixed(1)
    : 'לא ידוע'
  const met = Math.round(num('q2')*8 + num('q4')*4 + num('q6')*3.3)
  const isi = [17,18,19,20,21,22,23].reduce((s,i) => s + num(`q${i}`), 0)

  return `אתה רופא מומחה ברפואת לונג׳ביטי ורפואה מונעת.
כתוב בעברית בלבד. שפה קלינית ותמציתית. אל תחזור על הציונים.

## פרטי הלקוח
שם: ${sub.name} | גיל: ${sub.age} | מין: ${sub.gender === 'male' ? 'זכר' : 'נקבה'}

## ציוני דומיינים
פעילות גופנית: ${sub.score_activity}/100 (MET-min/שבוע: ${met})
התנהגויות בריאות: ${sub.score_health_behaviors}/100
BMI: ${sub.score_bmi}/100 (ערך: ${bmi})
תזונה: ${sub.score_nutrition}/100
בריאות עצמית: ${sub.score_srh}/100
שינה: ${sub.score_sleep}/100 (ISI: ${isi}/28)
צירקדיאני: ${sub.score_circadian}/100
איכות חיים: ${sub.score_qol}/100
לחץ: ${sub.score_stress}/100
ציון כולל: ${sub.score_composite}/100

## דגלים שזוהו
${(sub.flags as string[]).length > 0 ? (sub.flags as string[]).join('\n') : 'ללא דגלים'}

## תשובות מפתח
עישון: ${get('q7')} | אלכוהול מוגזם: ${get('q8')}
שעות שינה: ${get('q16')} | ISI סה״כ: ${isi}/28
לחץ דם: ${get('qb1')} | מטופל ב-BP: ${get('qb2')}
בעיות עיכול: ${arr('qb3')} | תפקוד עיכול: ${get('qb4')}
היסטוריה משפחתית: ${arr('qm1')}
תרופות קבועות: ${get('qm2')}
אבחנות עבר: ${arr('qm3')}
פעילות מאומצת: ${num('q2')} דק׳/שבוע | מתונה: ${num('q4')} | הליכה: ${num('q6')}
ארוחות ביום: ${get('q11')}
בריאות עצמית: ${get('q15')} | איכות חיים: ${get('q28')}

## פורמט התשובה הנדרש (5 חלקים בדיוק, עם כותרות h4):

<h4>🎯 נושאי מיקוד לאנמנזה</h4>
[3–4 נושאים ספציפיים לחקירה עמוקה — עם הסבר קצר לכל אחד]

<h4>🔴 בירור דגלים קליניים</h4>
[שאלות ספציפיות לכל דגל שזוהה — אם אין, כתוב "לא זוהו דגלים"]

<h4>🧬 השערות קליניות להערכה</h4>
[2–3 תהליכים פתופיזיולוגיים לשקול על בסיס הממצאים]

<h4>💡 Life Coaching — מה לחקור</h4>
[מטרות, מוטיבציה, חסמים — על בסיס תשובות הלקוח]

<h4>📋 בדיקות נוספות מומלצות</h4>
[ספציפי בלבד — לא כללי. על בסיס הממצאים]`
}
