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
  score_social?: number; score_mindfulness?: number; score_cognition?: number
  bmi_value?: number; isi_total?: number; pss_total?: number; met_total?: number
  answers?: Record<string, unknown>
}
 
// ── Question map: id → label ──────────────────────────────────────────────
const QUESTION_LABELS: Record<string, string> = {
  qm1: 'היסטוריה משפחתית', qm2: 'תרופות מרשם', qm2_other: 'פירוט תרופות', qm3: 'אבחנות עבר',
  qb_diagnosed: 'אובחן ביל"ד?', qb2: 'טיפול ביל"ד', qb1: 'לחץ דם סיסטולי', qb3: 'תסמיני עיכול', qb4: 'תפקוד מערכת עיכול',
  q_hi_days: 'עצימות גבוהה — ימים/שבוע', q_hi_min: 'עצימות גבוהה — דקות/שבוע',
  q_walk_days: 'הליכה — ימים/שבוע', q_walk_min: 'הליכה — דקות/שבוע',
  q_mind_days: 'יוגה/פילאטס — ימים/שבוע', q_mind_min: 'יוגה/פילאטס — דקות/שבוע',
  q_strength_days: 'אימוני כוח — ימים/שבוע', q_strength_min: 'אימוני כוח — דקות/שבוע',
  q7: 'עישון', q8: 'אלכוהול',
  q9: 'משקל (ק"ג)', q10: 'גובה (ס"מ)',
  q11: 'מספר ארוחות ביום',
  n_wd_morning: 'חול — בוקר', n_wd_snack1: 'חול — ביניים א\'', n_wd_lunch: 'חול — צהריים',
  n_wd_snack2: 'חול — ביניים ב\'', n_wd_dinner: 'חול — ערב', n_wd_before_sleep: 'חול — לפני שינה',
  n_we_morning: 'שבוע — בוקר', n_we_snack1: 'שבוע — ביניים א\'', n_we_lunch: 'שבוע — צהריים',
  n_we_snack2: 'שבוע — ביניים ב\'', n_we_dinner: 'שבוע — ערב', n_we_before_sleep: 'שבוע — לפני שינה',
  q15: 'מצב בריאותי כללי',
  q16: 'שעות שינה', q17: 'קושי להירדם', q18: 'התעוררות בלילה', q19: 'קיצה מוקדמת',
  q20: 'שביעות רצון משינה', q21: 'השפעה על תפקוד', q22: 'אחרים מבחינים', q23: 'שינה מטרידה',
  q24: 'טיסות בינלאומיות', q25: 'משמרות לילה', q26: 'סדירות שעות שינה', q27: 'מסכים לפני שינה',
  q28: 'איכות חיים כללית',
  q29:'שליטה בחיים', q30:'ביטחון עצמי', q31:'דברים מתנהלים', q32:'קשיים נערמים',
  q33:'עצבני ולחוץ', q34:'מתמודד עם שינויים', q35:'שולט בכעס', q36:'עומס משימות',
  q37:'כעס על דברים', q38:'שליטה כללית',
  qs1: 'חברים קרובים', qs2: 'תדירות מפגשים חברתיים', qs3: 'תמיכה חברתית',
  qmf1: 'תרגול מיינדפולנס', qmf2: 'משך מיינדפולנס',
  qc1: 'שפות שוטפות', qc2: 'למידה פעילה',
  qe1: 'מטרות מהתהליך', qe2: 'מכשולים', qe3: 'טווח ציפיות',
  wh_menstrual_status: 'מצב מחזור', wh_gyneco_history: 'היסטוריה גינקולוגית',
  wh_hormonal_meds: 'תרופות הורמונליות', wh_clotting: 'היסטוריית קרישה',
  wh_screening: 'בדיקות סקר', wh_pregnancy_history: 'היסטוריית הריון',
  wh_fertility: 'פוריות', wh_period_pain: 'כאב במחזור', wh_bleeding: 'כמות דימום',
  wh_meno_symptoms: 'תסמיני גיל המעבר', wh_cycle_changes: 'שינויים במחזור',
  wh_years_since_meno: 'שנים מאז מנופאוזה', wh_osteo_symptoms: 'תסמיני אוסטאופורוזיס',
  wh_cardio_risk: 'סיכון קרדיו לאחר מנופאוזה',
}
 
const SECTION_GROUPS: { title: string; keys: string[] }[] = [
  { title: 'רקע רפואי', keys: ['qm1','qm2','qm2_other','qm3'] },
  { title: 'לחץ דם ועיכול', keys: ['qb_diagnosed','qb2','qb1','qb3','qb4'] },
  { title: 'פעילות גופנית', keys: ['q_hi_days','q_hi_min','q_walk_days','q_walk_min','q_mind_days','q_mind_min','q_strength_days','q_strength_min'] },
  { title: 'התנהגויות בריאות', keys: ['q7','q8'] },
  { title: 'מדדים (BMI)', keys: ['q9','q10'] },
  { title: 'תזונה', keys: ['q11','n_wd_morning','n_wd_snack1','n_wd_lunch','n_wd_snack2','n_wd_dinner','n_wd_before_sleep','n_we_morning','n_we_snack1','n_we_lunch','n_we_snack2','n_we_dinner','n_we_before_sleep'] },
  { title: 'בריאות עצמית', keys: ['q15'] },
  { title: 'שינה (ISI)', keys: ['q16','q17','q18','q19','q20','q21','q22','q23'] },
  { title: 'יציבות צירקדיאנית', keys: ['q24','q25','q26','q27'] },
  { title: 'לחץ ואיכות חיים (PSS-10)', keys: ['q28','q29','q30','q31','q32','q33','q34','q35','q36','q37','q38'] },
  { title: 'חיי חברה', keys: ['qs1','qs2','qs3'] },
  { title: 'מיינדפולנס', keys: ['qmf1','qmf2'] },
  { title: 'קוגניציה ולמידה', keys: ['qc1','qc2'] },
  { title: 'ציפיות ומטרות', keys: ['qe1','qe2','qe3'] },
  { title: 'בריאות האישה', keys: ['wh_menstrual_status','wh_gyneco_history','wh_hormonal_meds','wh_clotting','wh_screening','wh_pregnancy_history','wh_fertility','wh_period_pain','wh_bleeding','wh_meno_symptoms','wh_cycle_changes','wh_years_since_meno','wh_osteo_symptoms','wh_cardio_risk'] },
]
 
function formatAnswer(val: unknown): string {
  if (val === undefined || val === null || val === '') return '—'
  if (Array.isArray(val)) return val.join(', ')
  return String(val)
}
 
function riskColor(v: number) {
  if (v >= 85) return '#23352B'
  if (v >= 70) return '#3a5c35'
  if (v >= 55) return '#766A60'
  if (v >= 40) return '#9a3412'
  return '#991b1b'
}
 
const S = {
  page: { minHeight: '100vh', background: 'var(--off-white)', fontFamily: 'var(--font-body)' } as React.CSSProperties,
  header: { background: 'var(--soft-black)', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  modal: { position: 'fixed' as const, inset: 0, background: 'rgba(31,29,27,.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' as const },
  modalInner: { background: 'var(--off-white)', width: '100%', maxWidth: '760px', marginTop: '20px', marginBottom: '40px', position: 'relative' as const },
}
 
export default function DashboardPage() {
  const nav = useNavigate()
  const [authed,   setAuthed]   = useState(false)
  const [pass,     setPass]     = useState('')
  const [rows,     setRows]     = useState<Row[]>([])
  const [filter,   setFilter]   = useState('')
  const [from,     setFrom]     = useState('')
  const [to,       setTo]       = useState('')
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<Row | null>(null)
  const [tab,      setTab]      = useState<'scores' | 'answers'>('scores')
 
  function login() {
    if (pass === PASS) { setAuthed(true); fetchAll() }
    else alert('סיסמה שגויה')
  }
 
  async function fetchAll() {
    setLoading(true)
    const { data } = await supabase.from('submissions')
      .select('*').order('created_at', { ascending: false })
    setRows(data || [])
    setLoading(false)
  }
 
  const filtered = rows.filter(r => {
    const nameMatch = !filter || r.name.includes(filter)
    const dateMatch = (!from || r.created_at >= from) && (!to || r.created_at <= to + 'T23:59:59')
    return nameMatch && dateMatch
  })
 
  function exportCSV() {
    const headers = ['תאריך','שם','גיל','מין','ציון כולל','פעילות','בריאות','BMI','תזונה','SRH','שינה','צירקדיאני','QoL','לחץ','דגלים']
    const rows2 = filtered.map(r => [
      new Date(r.created_at).toLocaleDateString('he-IL'),
      r.name, r.age, r.gender === 'male' ? 'זכר' : 'נקבה',
      r.score_composite, r.score_activity, r.score_health_behaviors, r.score_bmi,
      r.score_nutrition, r.score_srh, r.score_sleep, r.score_circadian, r.score_qol, r.score_stress,
      (r.flags || []).join(' | '),
    ].map(v => `"${v}"`).join(','))
    const csv = '\uFEFF' + headers.join(',') + '\n' + rows2.join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `tomorrow-clients-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }
 
  // ── Login screen ───────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: 'var(--soft-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }} className="grain-overlay">
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '340px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--soft-white)', letterSpacing: '.15em', fontWeight: 300 }}>TOMORROW</span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted-stone)', marginBottom: '32px' }}>Doctor Dashboard</p>
        <input
          type="password" placeholder="סיסמה" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          className="dark-input" style={{ marginBottom: '12px', textAlign: 'center' }}
        />
        <button className="btn-primary" onClick={login}>כניסה</button>
      </div>
    </div>
  )
 
  // ── Dashboard ──────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
 
      {/* Header */}
      <div style={S.header}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', color: 'var(--soft-white)', fontSize: '20px', fontWeight: 400, marginBottom: '2px' }}>TOMORROW</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--muted-stone)' }}>Doctor Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,.3)', fontSize: '13px' }}>{filtered.length} לקוחות</span>
          <button onClick={exportCSV} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(218,225,204,.25)', color: 'var(--mineral)', fontFamily: 'var(--font-body)', fontSize: '12px', cursor: 'pointer' }}>ייצוא CSV</button>
          <button onClick={fetchAll} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-body)', fontSize: '12px', cursor: 'pointer' }}>↻ רענן</button>
        </div>
      </div>
 
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
 
        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
          <input placeholder="חיפוש לפי שם..." value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding: '10px 16px', fontSize: '13px', border: '1px solid rgba(54,51,48,.15)', background: 'rgba(255,255,255,.7)', fontFamily: 'var(--font-body)', outline: 'none', minWidth: 200, direction: 'rtl' }} />
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(54,51,48,.15)', background: 'rgba(255,255,255,.7)', fontFamily: 'var(--font-body)', outline: 'none' }} />
          <span style={{ alignSelf: 'center', fontSize: '13px', color: 'var(--warm-taupe)' }}>עד</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(54,51,48,.15)', background: 'rgba(255,255,255,.7)', fontFamily: 'var(--font-body)', outline: 'none' }} />
          {(filter || from || to) && (
            <button onClick={() => { setFilter(''); setFrom(''); setTo('') }}
              style={{ padding: '10px 14px', fontSize: '12px', border: '1px solid rgba(54,51,48,.15)', background: 'transparent', color: 'var(--warm-taupe)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
              נקה
            </button>
          )}
        </div>
 
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'סה"כ לקוחות', val: rows.length },
            { label: 'ממוצע ציון', val: rows.length ? Math.round(rows.reduce((s, r) => s + (r.score_composite || 0), 0) / rows.length) : '—' },
            { label: 'עם דגלים', val: rows.filter(r => (r.flags || []).length > 0).length },
            { label: 'ממתינים', val: rows.filter(r => r.status === 'processing').length },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.7)', border: '1px solid rgba(54,51,48,.1)', padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, color: 'var(--soft-black)', lineHeight: 1, marginBottom: '6px' }}>{s.val}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted-stone)' }}>{s.label}</div>
            </div>
          ))}
        </div>
 
        {/* Table */}
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--warm-taupe)', padding: '48px', fontFamily: 'var(--font-body)' }}>טוען...</p>
        ) : (
          <div style={{ background: 'rgba(255,255,255,.7)', border: '1px solid rgba(54,51,48,.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', direction: 'rtl', fontFamily: 'var(--font-body)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--soft-black)' }}>
                  {['תאריך', 'שם', 'גיל', 'מין', 'ציון כולל', 'דגלים', 'סטטוס', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '10px', fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(252,252,252,.5)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--warm-taupe)', fontSize: '14px' }}>אין תוצאות</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: '1px solid rgba(54,51,48,.08)', background: i % 2 === 0 ? 'rgba(255,255,255,.5)' : 'transparent', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(35,53,43,.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,.5)' : 'transparent')}>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--warm-taupe)' }}>{new Date(r.created_at).toLocaleDateString('he-IL')}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>{r.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--warm-taupe)' }}>{r.age}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--warm-taupe)' }}>{r.gender === 'male' ? 'זכר' : 'נקבה'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: riskColor(r.score_composite) }}>{r.score_composite}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {(r.flags || []).length > 0
                        ? <span style={{ fontSize: '11px', padding: '3px 10px', background: 'rgba(185,28,28,.08)', color: '#c53030', border: '1px solid rgba(185,28,28,.15)' }}>{(r.flags || []).length} דגלים</span>
                        : <span style={{ fontSize: '12px', color: 'var(--muted-stone)' }}>ללא</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', background: r.status === 'complete' ? 'rgba(35,53,43,.08)' : 'rgba(118,106,96,.08)', color: r.status === 'complete' ? 'var(--evergreen)' : 'var(--warm-taupe)', border: `1px solid ${r.status === 'complete' ? 'rgba(35,53,43,.2)' : 'rgba(118,106,96,.2)'}` }}>
                        {r.status === 'complete' ? 'הושלם' : 'בעיבוד'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => { setSelected(r); setTab('answers') }}
                          style={{ fontSize: '11px', padding: '5px 12px', border: '1px solid rgba(54,51,48,.18)', background: 'transparent', color: 'var(--warm-taupe)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .15s' }}
                          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--evergreen)'; (e.target as HTMLElement).style.color = 'var(--evergreen)' }}
                          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(54,51,48,.18)'; (e.target as HTMLElement).style.color = 'var(--warm-taupe)' }}>
                          תשובות
                        </button>
                        <button
                          onClick={() => nav(`/report/${r.id}`)}
                          style={{ fontSize: '11px', padding: '5px 12px', border: '1px solid rgba(54,51,48,.18)', background: 'transparent', color: 'var(--warm-taupe)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .15s' }}
                          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--evergreen)'; (e.target as HTMLElement).style.color = 'var(--evergreen)' }}
                          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(54,51,48,.18)'; (e.target as HTMLElement).style.color = 'var(--warm-taupe)' }}>
                          דוח
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
 
      {/* ── Client detail modal ── */}
      {selected && (
        <div style={S.modal} onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div style={S.modalInner}>
 
            {/* Modal header */}
            <div style={{ background: 'var(--soft-black)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', color: 'var(--soft-white)', fontSize: '20px', marginBottom: '2px' }}>{selected.name}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-stone)' }}>
                  גיל {selected.age} · {selected.gender === 'male' ? 'זכר' : 'נקבה'} · {new Date(selected.created_at).toLocaleDateString('he-IL')}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
 
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(54,51,48,.1)', background: 'rgba(255,255,255,.5)' }}>
              {([['answers', 'תשובות מלאות'], ['scores', 'ציונים ודגלים']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  style={{ padding: '13px 22px', fontFamily: 'var(--font-body)', fontSize: '13px', background: 'transparent', border: 'none', borderBottom: tab === key ? '2px solid var(--evergreen)' : '2px solid transparent', color: tab === key ? 'var(--evergreen)' : 'var(--warm-taupe)', cursor: 'pointer', fontWeight: tab === key ? 500 : 400, marginBottom: '-1px' }}>
                  {label}
                </button>
              ))}
            </div>
 
            {/* Tab: Answers */}
            {tab === 'answers' && (
              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                {!selected.answers || Object.keys(selected.answers).length === 0 ? (
                  <p style={{ color: 'var(--warm-taupe)', fontFamily: 'var(--font-body)', fontSize: '14px', textAlign: 'center', padding: '32px' }}>אין נתוני תשובות לפרופיל זה</p>
                ) : (
                  SECTION_GROUPS.map(group => {
                    const relevantKeys = group.keys.filter(k => selected.answers![k] !== undefined && selected.answers![k] !== '')
                    if (relevantKeys.length === 0) return null
                    return (
                      <div key={group.title} style={{ marginBottom: '24px' }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--muted-stone)', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(54,51,48,.08)' }}>
                          {group.title}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {relevantKeys.map(k => (
                            <div key={k} style={{ display: 'flex', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,.6)', border: '1px solid rgba(54,51,48,.07)' }}>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--warm-taupe)', minWidth: '180px', flexShrink: 0, lineHeight: 1.5 }}>
                                {QUESTION_LABELS[k] || k}
                              </span>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--soft-black)', fontWeight: 400, lineHeight: 1.5, flex: 1 }}>
                                {formatAnswer(selected.answers![k])}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
 
            {/* Tab: Scores */}
            {tab === 'scores' && (
              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
 
                {/* Composite score */}
                <div style={{ textAlign: 'center', marginBottom: '28px', padding: '20px', background: 'rgba(255,255,255,.6)', border: '1px solid rgba(54,51,48,.08)' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted-stone)', marginBottom: '8px' }}>ציון כולל</p>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '56px', fontWeight: 400, color: riskColor(selected.score_composite), lineHeight: 1 }}>{selected.score_composite}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--muted-stone)' }}>/100</span>
                </div>
 
                {/* Domain scores */}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--muted-stone)', marginBottom: '12px' }}>ציוני דומיינים</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                  {[
                    ['פעילות גופנית', selected.score_activity],
                    ['התנהגויות בריאות', selected.score_health_behaviors],
                    ['BMI', selected.score_bmi],
                    ['תזונה', selected.score_nutrition],
                    ['בריאות עצמית', selected.score_srh],
                    ['שינה', selected.score_sleep],
                    ['צירקדיאני', selected.score_circadian],
                    ['איכות חיים', selected.score_qol],
                    ['לחץ', selected.score_stress],
                    ['חיי חברה', selected.score_social],
                    ['מיינדפולנס', selected.score_mindfulness],
                    ['קוגניציה', selected.score_cognition],
                  ].filter(([, v]) => v !== undefined && v !== null).map(([label, score]) => (
                    <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,.6)', border: '1px solid rgba(54,51,48,.07)' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--soft-black)', minWidth: '140px' }}>{label as string}</span>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(54,51,48,.1)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: `${score}%`, background: riskColor(score as number), transition: 'width .5s' }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: riskColor(score as number), minWidth: '36px', textAlign: 'left' }}>{score}</span>
                    </div>
                  ))}
                </div>
 
                {/* Flags */}
                {(selected.flags || []).length > 0 && (
                  <>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--muted-stone)', marginBottom: '12px' }}>דגלים קליניים</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                      {(selected.flags || []).map((f, i) => (
                        <div key={i} style={{ padding: '10px 14px', background: 'rgba(185,28,28,.05)', border: '1px solid rgba(185,28,28,.15)', fontFamily: 'var(--font-body)', fontSize: '13px', color: '#a03030' }}>{f}</div>
                      ))}
                    </div>
                  </>
                )}
 
                {/* AI insights */}
                {selected.ai_insights && (
                  <>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--muted-stone)', marginBottom: '12px' }}>תובנות AI</p>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,.6)', border: '1px solid rgba(54,51,48,.08)', fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 1.75, color: 'var(--soft-black)', whiteSpace: 'pre-wrap' }}>
                      {selected.ai_insights}
                    </div>
                  </>
                )}
              </div>
            )}
 
          </div>
        </div>
      )}
    </div>
  )
}
 
