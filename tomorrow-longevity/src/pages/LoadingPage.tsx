import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { calculateScores } from '@/utils/scoring'
import type { Answers } from '@/utils/scoring'
import { TomorrowLogo } from '@/TomorrowLogo'
 
const STEPS = [
  'מחשב ציוני דומיינים',
  'מזהה דגלים קליניים',
  'שומר נתונים בצורה מוצפנת',
  'שולח ל-AI לתובנות',
  'מכין דוח מקצועי',
]
 
export default function LoadingPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const ran = useRef(false)
  const { name, age, gender, idNum, answers } = (loc.state as {
    name:string; age:string; gender:string; idNum:string; answers:Answers
  }) || {}
 
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    run()
  }, [])
 
  async function activateStep(i: number) {
    // mark previous as done
    if (i > 0) {
      const prev = document.getElementById(`step-${i-1}`)
      const dot  = document.getElementById(`dot-${i-1}`)
      if (prev) prev.setAttribute('data-state', 'done')
      if (dot)  { dot.style.background = 'var(--evergreen)'; dot.style.animation = 'none' }
    }
    const el  = document.getElementById(`step-${i}`)
    const dot = document.getElementById(`dot-${i}`)
    if (el)  el.setAttribute('data-state', 'active')
    if (dot) { dot.style.background = 'var(--mineral)'; dot.style.animation = 'stepPulse 1.2s ease-in-out infinite' }
    await new Promise(r => setTimeout(r, 800))
  }
 
  async function run() {
    try {
      await activateStep(0)
      const result = calculateScores(answers || {})
      const { flags, bmi_value, isi_total, pss_total, met_total, ...scores } = result
 
      await activateStep(1)
      const flagsArr = flags.map((f: {title:string}) => f.title)
 
      await activateStep(2)
      const { data, error } = await supabase.from('submissions').insert({
        name, age, gender, answers, ...scores,
        flags: flagsArr, bmi_value, isi_total, pss_total, met_total,
        status: 'processing',
      }).select('id').single()
      if (error) throw error
 
      await activateStep(3)
      supabase.functions.invoke('process-submission', { body: { submission_id: data.id } })
        .catch(console.warn)
 
      await activateStep(4)
      // mark last step done
      const last = document.getElementById(`step-${STEPS.length-1}`)
      const dot  = document.getElementById(`dot-${STEPS.length-1}`)
      if (last) last.setAttribute('data-state', 'done')
      if (dot)  { dot.style.background = 'var(--evergreen)'; dot.style.animation = 'none' }
 
      await new Promise(r => setTimeout(r, 700))
    } catch (err) {
      console.error('Error:', err)
    } finally {
      nav('/thankyou', { replace: true })
    }
  }
 
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--soft-black)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }} className="grain-overlay anim-in">
 
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
 
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
          <TomorrowLogo color="var(--soft-white)" height={16} style={{ opacity: 0.45 }} />
        </div>
 
        {/* Breathing rings */}
        <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 48px' }}>
          {[0, 16, 32].map((inset, i) => (
            <div key={i} style={{
              position: 'absolute', inset,
              borderRadius: '50%',
              border: `1px solid rgba(218,225,204,${0.12 + i * 0.1})`,
              animation: `ringBreath 3s ease-in-out infinite ${i * 0.4}s`,
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 44,
            borderRadius: '50%',
            background: 'var(--evergreen)',
            animation: 'ringBreath 3s ease-in-out infinite 1.2s',
          }} />
        </div>
 
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 4vw, 34px)',
          fontWeight: 400,
          color: 'var(--soft-white)',
          marginBottom: '10px',
        }}>
          מנתח את הפרופיל הביולוגי שלך
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--muted-stone)',
          marginBottom: '48px',
          lineHeight: 1.6,
        }}>
          מנוע ה-AI של TOMORROW מעבד את נתוניך
        </p>
 
        {/* Steps */}
        <div style={{ width: '100%', textAlign: 'right' }}>
          <style>{`
            [data-state="active"] { color: rgba(252,252,252,.88) !important; }
            [data-state="done"]   { color: rgba(218,225,204,.6) !important; }
          `}</style>
          {STEPS.map((step, i) => (
            <div
              key={i}
              id={`step-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '11px 0',
                borderBottom: '1px solid rgba(255,255,255,.05)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'rgba(252,252,252,.2)',
                transition: 'color 0.5s',
              }}
            >
              <div
                id={`dot-${i}`}
                style={{
                  width: 5, height: 5,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.1)',
                  flexShrink: 0,
                  transition: 'background 0.5s',
                }}
              />
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
 
