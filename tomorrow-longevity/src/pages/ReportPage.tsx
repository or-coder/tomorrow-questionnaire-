import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { DOMAIN_META, calculateScores } from '@/utils/scoring'
import type { Answers, Scores, Flag } from '@/utils/scoring'
 
interface Submission {
  id: string; name: string; age: string; gender: string
  created_at: string; answers: Answers
  score_composite: number; flags: string[]; ai_insights?: string; status: string
  score_activity: number; score_health_behaviors: number; score_bmi: number
  score_nutrition: number; score_srh: number; score_sleep: number
  score_circadian: number; score_qol: number; score_stress: number
  bmi_value?: number
}
 
function riskLabel(v: number) {
  if (v >= 81) return { txt:'טוב',        bg:'#f0fff4', tc:'#276749' }  // ירוק
  if (v >= 51) return { txt:'בינוני',     bg:'#fff7ed', tc:'#c05621' }  // כתום
  return             { txt:'דורש שיפור',  bg:'#fff5f5', tc:'#991b1b' }  // אדום
}
 
export default function ReportPage() {
  const { id } = useParams<{id:string}>()
  const [sub, setSub] = useState<Submission | null>(null)
  const [localScores, setLocalScores] = useState<(Scores & {flags:Flag[]}) | null>(null)
  const [aiInsights, setAiInsights] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const radarRef  = useRef<HTMLCanvasElement>(null)
  const ringRef   = useRef<HTMLCanvasElement>(null)
  const polledRef = useRef(false)
 
  useEffect(() => { fetch() }, [id])
 
  async function fetch() {
    const { data } = await supabase.from('submissions').select('*').eq('id', id).single()
    if (data) {
      setSub(data)
      const ls = calculateScores(data.answers || {})
      setLocalScores(ls)
      if (data.ai_insights) setAiInsights(data.ai_insights)
      setLoading(false)
      if (!data.ai_insights && !polledRef.current) pollForInsights(data.id)
    }
  }
 
  async function pollForInsights(sid: string) {
    polledRef.current = true
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const { data } = await supabase.from('submissions').select('ai_insights,status').eq('id', sid).single()
      if (data?.ai_insights) { setAiInsights(data.ai_insights); break }
    }
  }
 
  useEffect(() => {
    if (!sub || !localScores) return
    drawRing(ringRef.current, sub.score_composite)
    drawRadar(radarRef.current, localScores)
  }, [sub, localScores])
 
  function drawRing(c: HTMLCanvasElement | null, score: number) {
    if (!c) return
    const ctx = c.getContext('2d')!
    const cx = 90, cy = 90, R = 72, lw = 9
    ctx.clearRect(0, 0, 180, 180)
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2)
    ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = lw; ctx.stroke()
    const g = ctx.createLinearGradient(cx-R,cy,cx+R,cy)
    g.addColorStop(0,'#c9a84c'); g.addColorStop(1,'#8b4a2f')
    ctx.beginPath(); ctx.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+(score/100)*Math.PI*2)
    ctx.strokeStyle = g; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke()
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.font = 'bold 36px Heebo,sans-serif'; ctx.fillText(String(score), cx, cy-8)
    ctx.font = '12px Heebo,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.4)'
    ctx.fillText('ציון כולל', cx, cy+12)
    const lbl = riskLabel(score)
    ctx.font = 'bold 10px Heebo,sans-serif'; ctx.fillStyle = lbl.tc
    ctx.fillText(lbl.txt, cx, cy+30)
  }
 
  function drawRadar(c: HTMLCanvasElement | null, sc: Scores) {
    if (!c) return
    const ctx = c.getContext('2d')!
    const W=380,H=320,cx=W/2,cy=H/2,R=110,n=DOMAIN_META.length
    ctx.clearRect(0,0,W,H)
    // grid
    ;[.25,.5,.75,1].forEach(r => {
      ctx.beginPath()
      DOMAIN_META.forEach((_,i) => {
        const a=(i/n)*Math.PI*2-Math.PI/2
        const x=cx+R*r*Math.cos(a),y=cy+R*r*Math.sin(a)
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
      })
      ctx.closePath(); ctx.strokeStyle=r===1?'#c4bdb4':'#d8d1c8'; ctx.lineWidth=r===1?1:.5; ctx.stroke()
    })
    // spokes
    DOMAIN_META.forEach((_,i) => {
      const a=(i/n)*Math.PI*2-Math.PI/2
      ctx.beginPath(); ctx.moveTo(cx,cy)
      ctx.lineTo(cx+R*Math.cos(a),cy+R*Math.sin(a))
      ctx.strokeStyle='#d8d1c8'; ctx.lineWidth=.5; ctx.stroke()
    })
    // data
    ctx.beginPath()
    DOMAIN_META.forEach((d,i) => {
      const v=(sc as any)[d.key]/100,a=(i/n)*Math.PI*2-Math.PI/2
      const x=cx+R*v*Math.cos(a),y=cy+R*v*Math.sin(a)
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
    })
    ctx.closePath(); ctx.fillStyle='rgba(139,74,47,.12)'; ctx.fill()
    ctx.strokeStyle='#8b4a2f'; ctx.lineWidth=2; ctx.stroke()
    // dots + labels
    DOMAIN_META.forEach((d,i) => {
      const v=(sc as any)[d.key]/100,a=(i/n)*Math.PI*2-Math.PI/2
      const x=cx+R*v*Math.cos(a),y=cy+R*v*Math.sin(a)
      ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2)
      ctx.fillStyle=d.color; ctx.fill()
      ctx.strokeStyle='#f0ebe3'; ctx.lineWidth=1.5; ctx.stroke()
      const lx=cx+(R+26)*Math.cos(a),ly=cy+(R+26)*Math.sin(a)
      ctx.fillStyle='#1a1512'; ctx.font='bold 11px Heebo,sans-serif'
      ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText(`${d.icon} ${d.label}`,lx,ly)
      ctx.font='600 10px Heebo,sans-serif'; ctx.fillStyle=d.color
      ctx.fillText(String((sc as any)[d.key]),lx,ly+14)
    })
  }
 
  function exportCSV() {
    if (!sub || !localScores) return
    const row = [
      sub.name, sub.age, sub.gender,
      sub.score_composite,
      localScores.score_activity, localScores.score_health_behaviors,
      localScores.score_bmi, localScores.score_nutrition, localScores.score_srh,
      localScores.score_sleep, localScores.score_circadian,
      localScores.score_qol, localScores.score_stress,
      localScores.bmi_value.toFixed(1),
      localScores.flags.map(f=>f.title).join(' | '),
      aiInsights.replace(/\n/g,' ').substring(0,500),
    ]
    const headers = ['שם','גיל','מין','ציון כולל','פעילות','בריאות','BMI','תזונה','SRH','שינה','צירקדיאני','QoL','לחץ','BMI ערך','דגלים','תובנות AI']
    const csv = '\uFEFF' + headers.join(',') + '\n' + row.map(v=>`"${v}"`).join(',')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}))
    a.download = `tomorrow-${sub.name}-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }
 
  if (loading) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <p className="text-white/50 font-body">טוען דוח...</p>
    </div>
  )
  if (!sub || !localScores) return null
 
  const composite = sub.score_composite
  const lbl = riskLabel(composite)
  const flags = localScores.flags
 
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <div className="bg-brand-dark px-6 py-14 text-center">
        <p className="label-caps text-brand-soft mb-2">Longevity Risk Profile</p>
        <h1 className="font-serif text-white text-3xl font-light mb-1">{sub.name}</h1>
        <p className="text-white/30 text-xs mb-10">
          {new Date(sub.created_at).toLocaleDateString('he-IL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          &nbsp;|&nbsp; ציון כולל: {composite}/100
        </p>
        <div className="flex justify-center">
          <canvas ref={ringRef} width={180} height={180} />
        </div>
      </div>
 
      <div className="max-w-3xl mx-auto px-4 py-10">
 
        {/* Domain grid */}
        <h3 className="font-serif text-xl mb-5 flex items-center gap-3">
          📊 ציוני דומיינים
          <span className="flex-1 h-px bg-brand-border" />
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {DOMAIN_META.map(d => {
            const v = (localScores as any)[d.key] as number
            const l = riskLabel(v)
            return (
              <div key={d.key} className="bg-brand-white border border-brand-border p-5"
                style={{borderTop:`3px solid ${d.color}`}}>
                <div className="text-lg mb-1">{d.icon}</div>
                <div className="text-xs tracking-wider uppercase text-brand-soft mb-1">{d.label}</div>
                <div className="font-serif text-4xl font-light mb-2" style={{color:d.color}}>{v}</div>
                <div className="h-1 bg-brand-border mb-2 overflow-hidden">
                  <div style={{width:`${v}%`,height:'100%',background:d.color,transition:'width 1s'}} />
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-sm"
                  style={{background:l.bg,color:l.tc}}>{l.txt}</span>
              </div>
            )
          })}
        </div>
 
        {/* Radar */}
        <h3 className="font-serif text-xl mb-5 flex items-center gap-3">
          🕸 מפת דומיינים
          <span className="flex-1 h-px bg-brand-border" />
        </h3>
        <div className="bg-brand-white border border-brand-border p-6 flex justify-center mb-10">
          <canvas ref={radarRef} width={380} height={320} />
        </div>
 
        {/* Flags */}
        <h3 className="font-serif text-xl mb-5 flex items-center gap-3">
          {flags.length > 0 ? `🚨 דגלים קליניים (${flags.length})` : '✅ דגלים קליניים'}
          <span className="flex-1 h-px bg-brand-border" />
        </h3>
        {flags.length === 0 ? (
          <div className="p-4 border-r-4 mb-8"
            style={{background:'#f0fff4',borderRightColor:'#276749'}}>
            <p className="text-sm font-medium" style={{color:'#276749'}}>לא זוהו דגלים קליניים — מצב תקין בכל הפרמטרים</p>
          </div>
        ) : flags.map((f,i) => (
          <div key={i} className="p-4 mb-3 border-r-4"
            style={{background:f.urgent?'#fff5f5':'#fdf8f6',borderRightColor:f.urgent?'#c53030':'#8b4a2f'}}>
            <p className="text-sm font-semibold mb-1" style={{color:f.urgent?'#c53030':'#8b4a2f'}}>{f.title}</p>
            <p className="text-xs text-brand-soft">{f.body}</p>
          </div>
        ))}
 
        {/* AI Insights */}
        <div className="bg-brand-dark overflow-hidden my-10">
          <div className="px-7 py-5 border-b border-white/5 flex items-center gap-4">
            <div className="w-9 h-9 flex items-center justify-center text-base flex-shrink-0"
              style={{background:'#c9a84c'}}>🤖</div>
            <div className="flex-1">
              <h3 className="font-serif text-white text-lg font-light mb-0.5">תובנות AI לאנמנזה</h3>
              <p className="text-xs text-brand-soft">ניתוח ממוקד לרופא המטפל</p>
            </div>
            <span className="text-xs font-bold tracking-widest border px-2 py-1"
              style={{borderColor:'rgba(201,168,76,.3)',color:'#c9a84c'}}>AI</span>
          </div>
          <div className="px-7 py-6 text-sm leading-relaxed"
            style={{color:'rgba(255,255,255,.75)',fontFamily:'Heebo,sans-serif'}}>
            {aiInsights ? (
              <div dangerouslySetInnerHTML={{__html: aiInsights
                .replace(/<h4>/g,'<h4 style="color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin:18px 0 8px;border-bottom:1px solid rgba(201,168,76,.15);padding-bottom:5px">')
              }} />
            ) : (
              <div className="flex items-center gap-3 text-white/30">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full" style={{
                      background:'#c9a84c',
                      animation:`pulse 1.3s infinite ${i*0.2}s`,
                    }} />
                  ))}
                </div>
                מנתח תשובות וממייצר תובנות קליניות...
              </div>
            )}
          </div>
        </div>
 
        {/* Action bar */}
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white"
            style={{background:'#1a1512',fontFamily:'Heebo,sans-serif'}}>
            🖨 הדפס דוח
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium border"
            style={{borderColor:'#d4cdc4',color:'#6b6055',fontFamily:'Heebo,sans-serif'}}>
            📊 ייצוא Excel
          </button>
          <a href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium border"
            style={{borderColor:'#d4cdc4',color:'#6b6055',fontFamily:'Heebo,sans-serif'}}>
            📋 Dashboard
          </a>
        </div>
      </div>
 
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
        @media print { .flex.gap-3.flex-wrap { display:none; } }
      `}</style>
    </div>
  )
}
 
