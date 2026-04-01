import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { calculateScores } from '@/utils/scoring'
import type { Answers } from '@/utils/scoring'

const STEPS = [
  'מחשב ציוני דומיינים',
  'מזהה דגלים קליניים',
  'שומר ב-Supabase',
  'שולח ל-AI לתובנות',
  'מכין דוח לרופא',
]

export default function LoadingPage() {
  const nav  = useNavigate()
  const loc  = useLocation()
  const ran  = useRef(false)
  const { name, age, gender, answers } = (loc.state as {name:string;age:string;gender:string;answers:Answers}) || {}

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    run()
  }, [])

  async function activateStep(i: number) {
    const el = document.getElementById(`step-${i}`)
    if (el) { el.style.opacity = '1'; el.style.color = 'rgba(255,255,255,.85)' }
    const dot = document.getElementById(`dot-${i}`)
    if (dot) { dot.style.background = '#c9a84c'; dot.style.boxShadow = '0 0 8px #c9a84c' }
    await new Promise(r => setTimeout(r, 600))
  }

  async function run() {
    try {
      await activateStep(0)
      const result = calculateScores(answers || {})
      const { flags, bmi_value, isi_total, pss_total, met_total, ...scores } = result

      await activateStep(1)
      const flagsArr = flags.map(f => f.title)

      await activateStep(2)
      const { data, error } = await supabase.from('submissions').insert({
        name, age, gender,
        answers,
        ...scores,
        flags: flagsArr,
        bmi_value, isi_total, pss_total, met_total,
        status: 'processing',
      }).select('id').single()

      if (error) throw error
      const id = data.id

      await activateStep(3)
      // Trigger edge function (non-blocking)
      supabase.functions.invoke('process-submission', { body: { submission_id: id } })
        .catch(console.warn)

      await activateStep(4)
      await new Promise(r => setTimeout(r, 500))
      nav(`/report/${id}`, { replace: true })

    } catch (err) {
      console.error(err)
      // Even on error, navigate to a basic report
      nav('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-6 text-center">
      {/* Ring */}
      <div className="mb-10" style={{
        width:64, height:64, borderRadius:'50%',
        border:'2px solid rgba(255,255,255,.1)',
        borderTopColor:'#c9a84c',
        animation:'spin 1.2s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <h2 className="font-serif text-white text-2xl font-light mb-2">מעבד את הפרופיל שלך</h2>
      <p className="text-brand-soft text-sm mb-12">מנוע הציונים וה-AI בעבודה</p>

      <div className="max-w-xs w-full text-right space-y-0">
        {STEPS.map((step, i) => (
          <div key={i} id={`step-${i}`} className="flex items-center gap-3 py-3 border-b"
            style={{borderColor:'rgba(255,255,255,.05)', opacity:.25, color:'rgba(255,255,255,.4)', transition:'all .4s'}}>
            <div id={`dot-${i}`} style={{
              width:6, height:6, borderRadius:'50%',
              background:'rgba(255,255,255,.15)', flexShrink:0, transition:'all .4s',
            }} />
            <span className="text-sm font-body">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
