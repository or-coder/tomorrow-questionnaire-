import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { calculateScores } from '@/utils/scoring'
import type { Answers } from '@/utils/scoring'
 
const STEPS = [
  'מחשב ציוני דומיינים',
  'מזהה דגלים קליניים',
  'שומר נתונים',
  'שולח ל-AI לתובנות',
  'מכין דוח לרופא',
]
 
export default function LoadingPage() {
  const nav  = useNavigate()
  const loc  = useLocation()
  const ran  = useRef(false)
  const { name, age, gender, idNum, answers } = (loc.state as {
    name:string; age:string; gender:string; idNum:string; answers:Answers
  }) || {}
 
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    run()
  }, [])
 
  async function activateStep(i: number) {
    const el  = document.getElementById(`step-${i}`)
    const dot = document.getElementById(`dot-${i}`)
    if (el)  { el.style.opacity = '1'; el.style.color = 'rgba(255,255,255,.85)' }
    if (dot) { dot.style.background = '#c9a84c'; dot.style.boxShadow = '0 0 8px #c9a84c' }
    await new Promise(r => setTimeout(r, 700))
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
        name, age, gender,
        answers,
        ...scores,
        flags: flagsArr,
        bmi_value, isi_total, pss_total, met_total,
        status: 'processing',
      }).select('id').single()
 
      if (error) throw error
 
      await activateStep(3)
      supabase.functions.invoke('process-submission', { body: { submission_id: data.id } })
        .catch(console.warn)
 
      await activateStep(4)
      await new Promise(r => setTimeout(r, 600))
 
    } catch (err) {
      console.error('Error:', err)
    } finally {
      nav('/thankyou', { replace: true })
    }
  }
 
  return (
    <div style={{
      minHeight:'100vh', background:'#1a1512',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'40px 24px', textAlign:'center',
    }}>
      <div style={{
        width:64, height:64, borderRadius:'50%',
        border:'2px solid rgba(255,255,255,.1)',
        borderTopColor:'#c9a84c',
        animation:'spin 1.2s linear infinite',
        marginBottom:'40px',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <h2 style={{fontFamily:'Playfair Display,serif',color:'#fff',fontSize:'24px',fontWeight:300,marginBottom:'8px'}}>
        מעבד את הפרופיל שלך
      </h2>
      <p style={{fontFamily:'Heebo,sans-serif',color:'#6b6055',fontSize:'14px',marginBottom:'48px'}}>
        מנוע הציונים וה-AI בעבודה
      </p>
      <div style={{maxWidth:'280px',width:'100%',textAlign:'right'}}>
        {STEPS.map((step, i) => (
          <div key={i} id={`step-${i}`} style={{
            display:'flex',alignItems:'center',gap:'12px',
            padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.05)',
            opacity:.25,color:'rgba(255,255,255,.4)',transition:'all .4s',
            fontFamily:'Heebo,sans-serif',fontSize:'14px',
          }}>
            <div id={`dot-${i}`} style={{
              width:6,height:6,borderRadius:'50%',
              background:'rgba(255,255,255,.15)',flexShrink:0,transition:'all .4s',
            }} />
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}
 
