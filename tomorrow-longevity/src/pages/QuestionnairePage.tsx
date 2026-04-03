import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SECTIONS, type Question } from '@/data/questions'
import type { Answers } from '@/utils/scoring'
 
export default function QuestionnairePage() {
  const nav = useNavigate()
  const { name, age, gender } = (useLocation().state as {name:string;age:string;gender:string}) || {}
  const [secIdx, setSecIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
 
  const sec   = SECTIONS[secIdx]
  const total = SECTIONS.length
  const pct   = ((secIdx + 1) / total) * 100
 
  const set = (id: string, val: string | number | string[]) =>
    setAnswers(prev => ({...prev, [id]: val}))
 
  const toggleMulti = (id: string, val: string, isNone: boolean) => {
    const cur = (answers[id] as string[]) || []
    if (isNone) { set(id, [val]); return }
    const without = cur.filter(v => v !== 'none')
    const exists  = without.includes(val)
    set(id, exists ? without.filter(v => v !== val) : [...without, val])
  }
 
  const shouldShow = (q: Question) => {
    if (!q.showIf) return true
    const dep = answers[q.showIf.id]
    return q.showIf.values.includes(String(dep))
  }
 
  const goNext = () => {
    if (secIdx < total - 1) { setSecIdx(s => s+1); window.scrollTo(0,0) }
    else nav('/loading', {state: {name, age, gender, answers}})
  }
  const goBack = () => { if (secIdx > 0) { setSecIdx(s => s-1); window.scrollTo(0,0) } }
 
  const renderQ = (q: Question) => {
    if (!shouldShow(q)) return null
    const val = answers[q.id]
 
    if (q.type === 'number') return (
      <div key={q.id} style={{
        background:'#faf7f3', border:'1px solid #d4cdc4',
        padding:'20px', marginBottom:'12px',
      }}>
        <p style={{fontSize:'14px',fontWeight:500,marginBottom:'8px',color:'#1a1512',fontFamily:'Heebo,sans-serif'}}>{q.text}</p>
        {q.hint && <p style={{fontSize:'12px',color:'#6b6055',marginBottom:'12px',lineHeight:1.6,fontFamily:'Heebo,sans-serif'}}>{q.hint}</p>}
        <input
          type="number" min={q.min} max={q.max} placeholder={q.placeholder}
          value={val !== undefined ? String(val) : ''}
          onChange={e => set(q.id, e.target.value === '' ? '' : Number(e.target.value))}
          style={{
            padding:'10px 14px', fontSize:'16px',
            border:'1px solid #d4cdc4', outline:'none',
            background:'transparent', fontFamily:'Heebo,sans-serif',
            width:'160px', direction:'ltr', textAlign:'right',
            WebkitAppearance:'none',
          }}
        />
      </div>
    )
 
    if (q.type === 'single') return (
      <div key={q.id} style={{
        background:'#faf7f3', border:'1px solid #d4cdc4',
        padding:'20px', marginBottom:'12px',
      }}>
        <p style={{fontSize:'14px',fontWeight:500,marginBottom:'16px',color:'#1a1512',fontFamily:'Heebo,sans-serif'}}>{q.text}</p>
        {q.hint && <p style={{fontSize:'12px',color:'#6b6055',marginBottom:'12px',lineHeight:1.6,fontFamily:'Heebo,sans-serif'}}>{q.hint}</p>}
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {q.options!.map(o => (
            <button key={o.value} onClick={() => set(q.id, o.value)}
              style={{
                width:'100%', textAlign:'right',
                padding:'12px 16px', fontSize:'14px',
                border: val===o.value ? '1px solid #8b4a2f' : '1px solid #d4cdc4',
                borderRightWidth: val===o.value ? '4px' : '1px',
                background: val===o.value ? 'rgba(139,74,47,.06)' : 'transparent',
                fontWeight: val===o.value ? 500 : 400,
                color:'#1a1512', fontFamily:'Heebo,sans-serif',
                cursor:'pointer', transition:'all .15s',
              }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    )
 
    if (q.type === 'multi') {
      const cur = (val as string[]) || []
      return (
        <div key={q.id} style={{
          background:'#faf7f3', border:'1px solid #d4cdc4',
          padding:'20px', marginBottom:'12px',
        }}>
          <p style={{fontSize:'14px',fontWeight:500,marginBottom:'4px',color:'#1a1512',fontFamily:'Heebo,sans-serif'}}>{q.text}</p>
          <p style={{fontSize:'12px',color:'#6b6055',marginBottom:'14px',fontFamily:'Heebo,sans-serif'}}>ניתן לסמן יותר מאחד</p>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {q.options!.map(o => {
              const isNone = o.value === 'none'
              const sel = cur.includes(o.value)
              return (
                <button key={o.value}
                  onClick={() => toggleMulti(q.id, o.value, isNone)}
                  style={{
                    width:'100%', textAlign:'right',
                    padding:'12px 16px', fontSize:'14px',
                    border: sel ? '1px solid #8b4a2f' : '1px solid #d4cdc4',
                    borderRightWidth: sel ? '4px' : '1px',
                    background: sel ? 'rgba(139,74,47,.06)' : 'transparent',
                    color:'#1a1512', fontFamily:'Heebo,sans-serif',
                    cursor:'pointer', display:'flex',
                    alignItems:'center', gap:'12px',
                  }}>
                  {/* FIX 4: checkbox ללא אייקון — רק ריבוע פשוט */}
                  <span style={{
                    width:'18px', height:'18px', flexShrink:0,
                    border: sel ? '2px solid #8b4a2f' : '1px solid #d4cdc4',
                    background: sel ? '#8b4a2f' : 'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'11px', color:'#fff', fontWeight:700,
                  }}>
                    {sel ? '✓' : ''}
                  </span>
                  <span>{o.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )
    }
 
    if (q.type === 'scale') return (
      <div key={q.id} style={{
        background:'#faf7f3', border:'1px solid #d4cdc4',
        padding:'20px', marginBottom:'12px',
      }}>
        <p style={{fontSize:'14px',fontWeight:500,marginBottom:'16px',color:'#1a1512',fontFamily:'Heebo,sans-serif'}}>{q.text}</p>
        {/* FIX 2: מותאם לנייד — כפתורים גדולים, ללא overflow */}
        <div style={{width:'100%'}}>
          {/* תוויות */}
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
            <span style={{fontSize:'11px',color:'#6b6055',fontFamily:'Heebo,sans-serif',textAlign:'right'}}>
              {q.scaleLabels?.min}
            </span>
            <span style={{fontSize:'11px',color:'#6b6055',fontFamily:'Heebo,sans-serif',textAlign:'left'}}>
              {q.scaleLabels?.max}
            </span>
          </div>
          {/* כפתורים — 0 מימין, 4 משמאל, כיוון RTL */}
          <div style={{display:'flex',gap:'6px',direction:'rtl'}}>
            {[0,1,2,3,4].map(n => (
              <button key={n} onClick={() => set(q.id, n)}
                style={{
                  flex:1, paddingTop:'12px', paddingBottom:'12px',
                  fontSize:'15px', fontWeight:500,
                  border: val===n ? '2px solid #8b4a2f' : '1px solid #d4cdc4',
                  background: val===n ? '#8b4a2f' : 'transparent',
                  color: val===n ? '#fff' : '#1a1512',
                  fontFamily:'Heebo,sans-serif',
                  cursor:'pointer', transition:'all .15s',
                  minWidth:0,
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }
 
  return (
    // FIX 2: overflow-x:hidden מונע קפיצה הצידה בנייד
    <div style={{minHeight:'100vh',background:'#f0ebe3',overflowX:'hidden'}}>
 
      {/* Progress bar */}
      <div style={{position:'fixed',top:0,right:0,left:0,height:'2px',background:'#e8e2d9',zIndex:50}}>
        <div style={{height:'100%',width:`${pct}%`,background:'#8b4a2f',transition:'width .5s'}} />
      </div>
 
      {/* FIX 2: max-width + padding נכון לנייד */}
      <div style={{
        maxWidth:'680px', margin:'0 auto',
        padding:'12px 16px 80px',
        paddingTop:'20px',
        boxSizing:'border-box', width:'100%',
      }}>
 
        {/* Section header */}
        <div style={{background:'#1a1512',padding:'24px',marginBottom:'20px'}}>
          {/* FIX 4: ללא אייקון — רק מספר וכותרת */}
          <p style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#6b6055',marginBottom:'10px',fontFamily:'Heebo,sans-serif'}}>
            {secIdx+1} / {total}
          </p>
          <h2 style={{fontFamily:'Playfair Display,serif',color:'#fff',fontSize:'22px',fontWeight:400,marginBottom:'4px'}}>
            {sec.title}
          </h2>
          <p style={{fontSize:'11px',color:'#6b6055',fontFamily:'Heebo,sans-serif'}}>{sec.en}</p>
        </div>
 
        {sec.questions.map(q => renderQ(q))}
 
        {/* Navigation */}
        <div style={{display:'flex',gap:'10px',marginTop:'24px'}}>
          {secIdx > 0 && (
            <button onClick={goBack}
              style={{
                flex:1, padding:'14px',
                fontSize:'14px', fontFamily:'Heebo,sans-serif',
                background:'transparent',
                border:'1px solid #d4cdc4', color:'#6b6055',
                cursor:'pointer',
              }}>
              חזרה
            </button>
          )}
          <button onClick={goNext}
            style={{
              flex:2, padding:'14px',
              fontSize:'14px', fontFamily:'Heebo,sans-serif',
              background:'#8b4a2f', color:'#fff',
              border:'none', cursor:'pointer',
            }}>
            {secIdx === total-1 ? 'שלח שאלון' : 'הבא'}
          </button>
        </div>
      </div>
    </div>
  )
}
 
