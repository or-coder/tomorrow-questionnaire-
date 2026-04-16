import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
 
const PASS = 'tomorrow2025'
 
interface Row {
  id: string; name: string; age: string; gender: string
  created_at: string; score_composite: number
  flags: string[]; status: string; ai_insights?: string
  score_activity: number; score_health_behaviors: number; score_bmi: number
  score_nutrition: number; score_srh: number; score_sleep: number
  score_circadian: number; score_qol: number; score_stress: number
  bmi_value?: number
}
 
function riskColor(v: number) {
  if (v >= 81) return '#276749'  // ירוק
  if (v >= 51) return '#c05621'  // כתום
  return '#991b1b'               // אדום
}
 
export default function DashboardPage() {
  const nav = useNavigate()
  const [authed, setAuthed]   = useState(false)
  const [pass,   setPass]     = useState('')
  const [rows,   setRows]     = useState<Row[]>([])
  const [filter, setFilter]   = useState('')
  const [from,   setFrom]     = useState('')
  const [to,     setTo]       = useState('')
  const [loading, setLoading] = useState(false)
 
  function login() {
    if (pass === PASS) { setAuthed(true); fetchAll() }
    else alert('סיסמה שגויה')
  }
 
  async function fetchAll() {
    setLoading(true)
    const { data } = await supabase.from('submissions')
      .select('*').order('created_at', {ascending:false})
    setRows(data || [])
    setLoading(false)
  }
 
  const filtered = rows.filter(r => {
    const nameMatch = !filter || r.name.includes(filter)
    const dateMatch = (!from || r.created_at >= from) && (!to || r.created_at <= to + 'T23:59:59')
    return nameMatch && dateMatch
  })
 
  function exportDetailedCSV(row: Row) {
    // אקסל מפורט — שאלה שאלה עם התשובות
    const answers = row.answers as Record<string, unknown> || {}
    const questions: Array<{section: string, question: string, answer: string}> = [
      // רקע רפואי
      { section:'רקע רפואי', question:'היסטוריה משפחתית', answer: Array.isArray(answers.qm1) ? (answers.qm1 as string[]).join(', ') : String(answers.qm1 || '') },
      { section:'רקע רפואי', question:'תרופות קבועות', answer: String(answers.qm2 || '') },
      { section:'רקע רפואי', question:'אבחנות עבר', answer: Array.isArray(answers.qm3) ? (answers.qm3 as string[]).join(', ') : String(answers.qm3 || '') },
      // לחץ דם ועיכול
      { section:'לחץ דם ועיכול', question:'לחץ דם סיסטולי', answer: String(answers.qb1 || '') },
      { section:'לחץ דם ועיכול', question:'טיפול ב-BP', answer: String(answers.qb2 || '') },
      { section:'לחץ דם ועיכול', question:'תסמיני עיכול', answer: Array.isArray(answers.qb3) ? (answers.qb3 as string[]).join(', ') : String(answers.qb3 || '') },
      { section:'לחץ דם ועיכול', question:'תפקוד עיכול', answer: String(answers.qb4 || '') },
      // פעילות גופנית
      { section:'פעילות גופנית', question:'ימי פעילות מאומצת', answer: String(answers.q1 || '') },
      { section:'פעילות גופנית', question:'דקות מאומצת/שבוע', answer: String(answers.q2 || '') },
      { section:'פעילות גופנית', question:'ימי פעילות מתונה', answer: String(answers.q3 || '') },
      { section:'פעילות גופנית', question:'דקות מתונה/שבוע', answer: String(answers.q4 || '') },
      { section:'פעילות גופנית', question:'ימי הליכה', answer: String(answers.q5 || '') },
      { section:'פעילות גופנית', question:'דקות הליכה/שבוע', answer: String(answers.q6 || '') },
      // התנהגויות בריאות
      { section:'התנהגויות בריאות', question:'עישון', answer: String(answers.q7 || '') },
      { section:'התנהגויות בריאות', question:'אלכוהול', answer: String(answers.q8 || '') },
      // מדדים
      { section:'מדדים', question:'משקל (ק"ג)', answer: String(answers.q9 || '') },
      { section:'מדדים', question:'גובה (ס"מ)', answer: String(answers.q10 || '') },
      { section:'מדדים', question:'BMI מחושב', answer: String(row.bmi_value?.toFixed(1) || '') },
      // תזונה
      { section:'תזונה', question:'ארוחות ביום', answer: String(answers.q11 || '') },
      { section:'תזונה', question:'חלבון (גרם)', answer: String(answers.q12 || '') },
      { section:'תזונה', question:'שומן בריא (גרם)', answer: String(answers.q13 || '') },
      { section:'תזונה', question:'פחמימות מורכבות (גרם)', answer: String(answers.q14 || '') },
      // בריאות עצמית
      { section:'בריאות עצמית', question:'תפיסת בריאות כללית', answer: String(answers.q15 || '') },
      // שינה
      { section:'שינה', question:'שעות שינה', answer: String(answers.q16 || '') },
      { section:'שינה', question:'קושי להירדם (0-4)', answer: String(answers.q17 || '') },
      { section:'שינה', question:'קושי להישאר ישן (0-4)', answer: String(answers.q18 || '') },
      { section:'שינה', question:'יקיצה מוקדמת (0-4)', answer: String(answers.q19 || '') },
      { section:'שינה', question:'שביעות רצון מהשינה (0-4)', answer: String(answers.q20 || '') },
      { section:'שינה', question:'הפרעה לתפקוד (0-4)', answer: String(answers.q21 || '') },
      { section:'שינה', question:'אחרים מבחינים (0-4)', answer: String(answers.q22 || '') },
      { section:'שינה', question:'דאגה מהשינה (0-4)', answer: String(answers.q23 || '') },
      { section:'שינה', question:'ISI סה"כ', answer: String(row.isi_total || '') },
      // צירקדיאני
      { section:'צירקדיאני', question:'טיסות בינלאומיות', answer: String(answers.q24 || '') },
      { section:'צירקדיאני', question:'עבודת משמרות', answer: String(answers.q25 || '') },
      { section:'צירקדיאני', question:'אחידות שינה', answer: String(answers.q26 || '') },
      { section:'צירקדיאני', question:'מסכים לפני שינה', answer: String(answers.q27 || '') },
      // איכות חיים ולחץ
      { section:'איכות חיים ולחץ', question:'איכות חיים כוללת', answer: String(answers.q28 || '') },
      { section:'איכות חיים ולחץ', question:'PSS1 - שליטה בחיים (0-4)', answer: String(answers.q29 || '') },
      { section:'איכות חיים ולחץ', question:'PSS2 - ביטחון עצמי (0-4)', answer: String(answers.q30 || '') },
      { section:'איכות חיים ולחץ', question:'PSS3 - דברים כרצוני (0-4)', answer: String(answers.q31 || '') },
      { section:'איכות חיים ולחץ', question:'PSS4 - קשיים נערמים (0-4)', answer: String(answers.q32 || '') },
      { section:'איכות חיים ולחץ', question:'PSS5 - עצבנות/לחץ (0-4)', answer: String(answers.q33 || '') },
      { section:'איכות חיים ולחץ', question:'PSS6 - התמודדות עם שינויים (0-4)', answer: String(answers.q34 || '') },
      { section:'איכות חיים ולחץ', question:'PSS7 - שליטה בכעס (0-4)', answer: String(answers.q35 || '') },
      { section:'איכות חיים ולחץ', question:'PSS8 - עומס משימות (0-4)', answer: String(answers.q36 || '') },
      { section:'איכות חיים ולחץ', question:'PSS9 - כעס על נסיבות (0-4)', answer: String(answers.q37 || '') },
      { section:'איכות חיים ולחץ', question:'PSS10 - תחושת שליטה (0-4)', answer: String(answers.q38 || '') },
      { section:'איכות חיים ולחץ', question:'PSS סה"כ', answer: String(row.pss_total || '') },
    ]
 
    const headers = ['קטגוריה', 'שאלה', 'תשובה']
    const metaRows = [
      ['"פרטי לקוח"', `"${row.name}"`, ''],
      ['"תאריך"', `"${new Date(row.created_at).toLocaleDateString('he-IL')}"`, ''],
      ['"גיל"', `"${row.age}"`, ''],
      ['"מין"', `"${row.gender === 'male' ? 'זכר' : 'נקבה'}"`, ''],
      ['', '', ''],
      ['"ציונות"', '"דומיין"', '"ציון"'],
      ['"ציון כולל"', '', `"${row.score_composite}"`],
      ['"פעילות גופנית"', '', `"${row.score_activity}"`],
      ['"התנהגויות בריאות"', '', `"${row.score_health_behaviors}"`],
      ['"BMI"', '', `"${row.score_bmi}"`],
      ['"תזונה"', '', `"${row.score_nutrition}"`],
      ['"בריאות עצמית"', '', `"${row.score_srh}"`],
      ['"שינה"', '', `"${row.score_sleep}"`],
      ['"צירקדיאני"', '', `"${row.score_circadian}"`],
      ['"איכות חיים"', '', `"${row.score_qol}"`],
      ['"לחץ"', '', `"${row.score_stress}"`],
      ['', '', ''],
      ['"דגלים"', `"${(row.flags || []).join(' | ')}"`, ''],
      ['', '', ''],
      headers.map(h => `"${h}"`).join(','),
    ]
 
    const dataRows = questions.map(q =>
      [`"${q.section}"`, `"${q.question}"`, `"${q.answer}"`].join(',')
    )
 
    const csv = '﻿' + metaRows.map(r => Array.isArray(r) ? r.join(',') : r).join('
') + '
' + dataRows.join('
')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8;'}))
    a.download = `tomorrow-${row.name}-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }
 
  function exportCSV() {
    const headers = ['תאריך','שם','גיל','מין','ציון כולל','פעילות','בריאות','BMI',
      'תזונה','SRH','שינה','צירקדיאני','QoL','לחץ','דגלים','תובנות AI']
    const rows2 = filtered.map(r => [
      new Date(r.created_at).toLocaleDateString('he-IL'),
      r.name, r.age, r.gender === 'male' ? 'זכר' : 'נקבה',
      r.score_composite,
      r.score_activity, r.score_health_behaviors, r.score_bmi,
      r.score_nutrition, r.score_srh, r.score_sleep,
      r.score_circadian, r.score_qol, r.score_stress,
      (r.flags || []).join(' | '),
      (r.ai_insights || '').replace(/\n/g,' ').substring(0,300),
    ].map(v => `"${v}"`).join(','))
    const csv = '\uFEFF' + headers.join(',') + '\n' + rows2.join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}))
    a.download = `tomorrow-clients-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }
 
  if (!authed) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-white text-3xl font-light mb-2">TOMORROW</h1>
        <p className="label-caps text-brand-soft mb-10">Doctor Dashboard</p>
        <input type="password" placeholder="סיסמה" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          className="w-full px-4 py-3 text-sm bg-transparent border text-white placeholder:text-white/30 outline-none mb-4"
          style={{borderColor:'rgba(255,255,255,.2)',fontFamily:'Heebo,sans-serif'}}
        />
        <button onClick={login} className="w-full py-3 text-sm font-medium text-white"
          style={{background:'#8b4a2f',fontFamily:'Heebo,sans-serif'}}>
          כניסה
        </button>
      </div>
    </div>
  )
 
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-brand-dark px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-white text-xl">TOMORROW</h1>
          <p className="label-caps text-brand-soft text-xs">Dashboard רופא</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-sm">{filtered.length} לקוחות</span>
          <button onClick={exportCSV}
            className="px-4 py-2 text-xs font-medium border"
            style={{borderColor:'rgba(201,168,76,.4)',color:'#c9a84c',fontFamily:'Heebo,sans-serif'}}>
            📊 ייצוא Excel
          </button>
          <button onClick={fetchAll}
            className="px-4 py-2 text-xs font-medium border"
            style={{borderColor:'rgba(255,255,255,.15)',color:'rgba(255,255,255,.5)',fontFamily:'Heebo,sans-serif'}}>
            ↻ רענן
          </button>
        </div>
      </div>
 
      <div className="max-w-6xl mx-auto px-4 py-8">
 
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input placeholder="חיפוש לפי שם..." value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border outline-none"
            style={{borderColor:'#d4cdc4',background:'#faf7f3',fontFamily:'Heebo,sans-serif',minWidth:200}}
          />
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-4 py-2.5 text-sm border outline-none"
            style={{borderColor:'#d4cdc4',background:'#faf7f3',fontFamily:'Heebo,sans-serif'}}
          />
          <span className="self-center text-brand-soft text-sm">עד</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-4 py-2.5 text-sm border outline-none"
            style={{borderColor:'#d4cdc4',background:'#faf7f3',fontFamily:'Heebo,sans-serif'}}
          />
          {(filter||from||to) && (
            <button onClick={() => {setFilter('');setFrom('');setTo('')}}
              className="px-3 py-2 text-xs text-brand-soft border border-brand-border">
              נקה
            </button>
          )}
        </div>
 
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label:'סה״כ לקוחות',  val: rows.length },
            { label:'ממוצע ציון',    val: rows.length ? Math.round(rows.reduce((s,r)=>s+r.score_composite,0)/rows.length) : '--' },
            { label:'עם דגלים',     val: rows.filter(r=>(r.flags||[]).length>0).length },
            { label:'ממתינים',      val: rows.filter(r=>r.status==='processing').length },
          ].map(s => (
            <div key={s.label} className="bg-brand-white border border-brand-border p-4">
              <div className="font-serif text-3xl font-light text-brand-dark mb-1">{s.val}</div>
              <div className="text-xs label-caps text-brand-soft">{s.label}</div>
            </div>
          ))}
        </div>
 
        {/* Table */}
        {loading ? (
          <p className="text-center text-brand-soft py-12">טוען...</p>
        ) : (
          <div className="bg-brand-white border border-brand-border overflow-hidden">
            <table className="w-full" style={{direction:'rtl',fontFamily:'Heebo,sans-serif'}}>
              <thead>
                <tr className="bg-brand-dark text-white">
                  {['תאריך','שם','גיל','ציון כולל','דגלים','סטטוס',''].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-medium tracking-wider opacity-70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-brand-soft text-sm">אין תוצאות</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id} className="border-t border-brand-border hover:bg-brand-surface transition-colors"
                    style={{background: i%2===0?'#faf7f3':'#f0ebe3'}}>
                    <td className="px-4 py-3 text-xs text-brand-soft">
                      {new Date(r.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-sm text-brand-soft">{r.age}</td>
                    <td className="px-4 py-3">
                      <span className="font-serif text-2xl font-light" style={{color:riskColor(r.score_composite)}}>
                        {r.score_composite}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(r.flags||[]).length > 0 ? (
                        <span className="text-xs px-2 py-1 font-medium"
                          style={{background:'#fff5f5',color:'#c53030'}}>
                          {(r.flags||[]).length} דגלים
                        </span>
                      ) : (
                        <span className="text-xs text-brand-soft">ללא</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1"
                        style={{
                          background: r.status==='complete' ? '#f0fff4' : '#fffbeb',
                          color:      r.status==='complete' ? '#276749' : '#92400e',
                        }}>
                        {r.status==='complete' ? 'הושלם' : 'בעיבוד'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div style={{display:'flex',gap:'6px'}}>
                        <button onClick={() => nav(`/report/${r.id}`)}
                          className="text-xs px-3 py-1.5 border transition-colors"
                          style={{borderColor:'#d4cdc4',color:'#6b6055',fontFamily:'Heebo,sans-serif'}}>
                          פתח דוח
                        </button>
                        <button onClick={() => exportDetailedCSV(r)}
                          className="text-xs px-3 py-1.5 border transition-colors"
                          style={{borderColor:'#c9a84c',color:'#b8822a',fontFamily:'Heebo,sans-serif'}}>
                          📋 Excel מפורט
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
 
