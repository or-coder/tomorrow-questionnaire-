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
  if (v >= 85) return '#276749'
  if (v >= 70) return '#3f6212'
  if (v >= 55) return '#92400e'
  if (v >= 40) return '#9a3412'
  return '#991b1b'
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
                      <button onClick={() => nav(`/report/${r.id}`)}
                        className="text-xs px-3 py-1.5 border transition-colors hover:border-brand-accent hover:text-brand-accent"
                        style={{borderColor:'#d4cdc4',color:'#6b6055'}}>
                        פתח דוח
                      </button>
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
