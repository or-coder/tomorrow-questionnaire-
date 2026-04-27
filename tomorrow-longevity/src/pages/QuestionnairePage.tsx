import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SECTIONS, type Question } from '@/data/questions'
import type { Answers } from '@/utils/scoring'
 
// Section icon mapping
const SECTION_ICONS: Record<string, string> = {
  medical_bg:       '🩺',
  bp_digest:        '💉',
  activity:         '🏃',
  health_behaviors: '🫀',
  anthropometry:    '⚖️',
  nutrition:        '🥗',
  srh:              '💬',
  sleep:            '😴',
  circadian:        '🌙',
  qol_stress:       '🧠',
  social:           '👥',
  mindfulness:      '🧘',
  cognition:        '💡',
  expectations:     '🎯',
  womens_health:    '🌸',
}
 
// Questions in womens_health that are age-gated
// hint field encodes the age range for display filtering
const WOMENS_AGE_GATES: Record<string, { min?: number; max?: number }> = {
  wh_pregnancy_history: { max: 45 },
  wh_fertility:         { max: 45 },
  wh_period_pain:       { max: 45 },
  wh_bleeding:          { max: 45 },
  wh_meno_symptoms:     { min: 42, max: 58 },
  wh_cycle_changes:     { min: 42, max: 58 },
  wh_years_since_meno:  { min: 52 },
  wh_osteo_symptoms:    { min: 52 },
  wh_cardio_risk:       { min: 52 },
}
 
export default function QuestionnairePage() {
  const nav = useNavigate()
  const { name, age, gender, idNum } = (useLocation().state as {name:string;age:string;gender:string;idNum:string}) || {}
  const ageNum = Number(age) || 0
  const [secIdx, setSecIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [showError, setShowError] = useState(false)
 
  // Filter sections: womens_health only for female
  const ACTIVE_SECTIONS = SECTIONS.filter(s =>
    s.id !== 'womens_health' || gender === 'female'
  )
 
  const sec   = ACTIVE_SECTIONS[secIdx]
  const total = ACTIVE_SECTIONS.length
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
 
  const isAnswered = (q: Question): boolean => {
    if (!shouldShow(q)) return true
    const val = answers[q.id]
    if (q.type === 'number') return val !== undefined && val !== '' && Number(val) >= 0
    if (q.type === 'single') return !!val
    if (q.type === 'multi')  return Array.isArray(val) && val.length > 0
    if (q.type === 'scale')  return val !== undefined && val !== ''
    if (q.type === 'text')   return typeof val === 'string' && val.trim().length > 0
    return true
  }
 
  // For womens_health, filter questions by age
  const getActiveQuestions = (section: typeof sec) => {
    if (section.id !== 'womens_health') return section.questions
    return section.questions.filter(q => {
      const gate = WOMENS_AGE_GATES[q.id]
      if (!gate) return true
      if (gate.min !== undefined && ageNum < gate.min) return false
      if (gate.max !== undefined && ageNum > gate.max) return false
      return true
    })
  }
 
  const allAnswered = () => getActiveQuestions(sec).every(q => isAnswered(q))
 
  const goNext = () => {
    if (!allAnswered()) { setShowError(true); window.scrollTo(0,0); return }
    setShowError(false)
    if (secIdx < total - 1) { setSecIdx(s => s+1); window.scrollTo(0,0) }
    else nav('/loading', {state: {name, age, gender, idNum, answers}})
  }
  const goBack = () => { if (secIdx > 0) { setSecIdx(s => s-1); window.scrollTo(0,0) } }
 
  // ── Nutrition section: group into weekday / weekend ──────
  const isNutritionText = (id: string) => id.startsWith('n_wd_') || id.startsWith('n_we_')
  const MEAL_LABELS: Record<string, string> = {
    morning:      'ארוחת בוקר',
    snack1:       'ביניים (לפני הצהריים)',
    lunch:        'ארוחת צהריים',
    snack2:       'ביניים (אחה"צ)',
    dinner:       'ארוחת ערב',
    before_sleep: 'לפני שינה',
  }
 
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
 
    if (q.type === 'text') return (
      <div key={q.id} style={{
        background:'#faf7f3', border:'1px solid #d4cdc4',
        padding:'20px', marginBottom:'12px',
      }}>
        <p style={{fontSize:'14px',fontWeight:500,marginBottom:'8px',color:'#1a1512',fontFamily:'Heebo,sans-serif'}}>{q.text}</p>
        {q.hint && <p style={{fontSize:'12px',color:'#6b6055',marginBottom:'12px',lineHeight:1.5,fontFamily:'Heebo,sans-serif'}}>{q.hint}</p>}
        <textarea
          placeholder={q.placeholder}
          value={typeof val === 'string' ? val : ''}
          onChange={e => set(q.id, e.target.value)}
          rows={2}
          style={{
            width:'100%', padding:'10px 14px',
            fontSize:'14px', lineHeight:1.6,
            border:'1px solid #d4cdc4', outline:'none',
            background:'transparent', fontFamily:'Heebo,sans-serif',
            direction:'rtl', resize:'vertical',
            color:'#1a1512', boxSizing:'border-box',
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
        <div style={{width:'100%'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
            <span style={{fontSize:'11px',color:'#6b6055',fontFamily:'Heebo,sans-serif',textAlign:'right'}}>
              {q.scaleLabels?.min}
            </span>
            <span style={{fontSize:'11px',color:'#6b6055',fontFamily:'Heebo,sans-serif',textAlign:'left'}}>
              {q.scaleLabels?.max}
            </span>
          </div>
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
 
  // Special rendering for nutrition section — group into weekday/weekend blocks
  const renderNutritionSection = () => {
    const mealQ = sec.questions.find(q => q.id === 'q11')
    const wdQuestions = sec.questions.filter(q => q.id.startsWith('n_wd_'))
    const weQuestions = sec.questions.filter(q => q.id.startsWith('n_we_'))
 
    return (
      <>
        {mealQ && renderQ(mealQ)}
 
        {/* Weekday block */}
        <div style={{
          border:'1px solid #d4cdc4', marginBottom:'16px', overflow:'hidden',
        }}>
          <div style={{
            background:'#1a1512', padding:'12px 20px',
            display:'flex', alignItems:'center', gap:'10px',
          }}>
            <span style={{fontSize:'16px'}}>📅</span>
            <div>
              <p style={{color:'#fff',fontFamily:'Heebo,sans-serif',fontSize:'14px',fontWeight:500,marginBottom:'2px'}}>יום חול — תפריט טיפוסי</p>
              <p style={{color:'#6b6055',fontFamily:'Heebo,sans-serif',fontSize:'11px'}}>תאר מה אתה אוכל בדרך כלל</p>
            </div>
          </div>
          <div style={{padding:'16px', background:'#faf7f3', display:'flex', flexDirection:'column', gap:'10px'}}>
            {wdQuestions.map(q => {
              const mealKey = q.id.replace('n_wd_', '')
              const label = MEAL_LABELS[mealKey] || q.text
              const val = answers[q.id]
              return (
                <div key={q.id}>
                  <p style={{fontSize:'13px',fontWeight:600,color:'#6b6055',marginBottom:'4px',fontFamily:'Heebo,sans-serif',letterSpacing:'.5px'}}>
                    {label}
                  </p>
                  {q.hint && <p style={{fontSize:'11px',color:'#9b8f84',marginBottom:'4px',fontFamily:'Heebo,sans-serif'}}>{q.hint}</p>}
                  <textarea
                    placeholder={q.placeholder}
                    value={typeof val === 'string' ? val : ''}
                    onChange={e => set(q.id, e.target.value)}
                    rows={2}
                    style={{
                      width:'100%', padding:'8px 12px',
                      fontSize:'13px', lineHeight:1.5,
                      border:'1px solid #d4cdc4', outline:'none',
                      background:'#fff', fontFamily:'Heebo,sans-serif',
                      direction:'rtl', resize:'vertical',
                      color:'#1a1512', boxSizing:'border-box',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
 
        {/* Weekend block */}
        <div style={{
          border:'1px solid #d4cdc4', marginBottom:'16px', overflow:'hidden',
        }}>
          <div style={{
            background:'#2d1f0e', padding:'12px 20px',
            display:'flex', alignItems:'center', gap:'10px',
          }}>
            <span style={{fontSize:'16px'}}>🌅</span>
            <div>
              <p style={{color:'#fff',fontFamily:'Heebo,sans-serif',fontSize:'14px',fontWeight:500,marginBottom:'2px'}}>סוף שבוע — תפריט טיפוסי</p>
              <p style={{color:'#6b6055',fontFamily:'Heebo,sans-serif',fontSize:'11px'}}>שישי / שבת</p>
            </div>
          </div>
          <div style={{padding:'16px', background:'#faf7f3', display:'flex', flexDirection:'column', gap:'10px'}}>
            {weQuestions.map(q => {
              const mealKey = q.id.replace('n_we_', '')
              const label = MEAL_LABELS[mealKey] || q.text
              const val = answers[q.id]
              return (
                <div key={q.id}>
                  <p style={{fontSize:'13px',fontWeight:600,color:'#6b6055',marginBottom:'4px',fontFamily:'Heebo,sans-serif',letterSpacing:'.5px'}}>
                    {label}
                  </p>
                  {q.hint && <p style={{fontSize:'11px',color:'#9b8f84',marginBottom:'4px',fontFamily:'Heebo,sans-serif'}}>{q.hint}</p>}
                  <textarea
                    placeholder={q.placeholder}
                    value={typeof val === 'string' ? val : ''}
                    onChange={e => set(q.id, e.target.value)}
                    rows={2}
                    style={{
                      width:'100%', padding:'8px 12px',
                      fontSize:'13px', lineHeight:1.5,
                      border:'1px solid #d4cdc4', outline:'none',
                      background:'#fff', fontFamily:'Heebo,sans-serif',
                      direction:'rtl', resize:'vertical',
                      color:'#1a1512', boxSizing:'border-box',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }
 
  // Special rendering for women's health — age-filtered questions with visual grouping
  const renderWomensHealthSection = () => {
    const activeQs = getActiveQuestions(sec)
 
    const AGE_GROUP_LABEL =
      ageNum <= 45 ? `שאלון מותאם לגיל ${ageNum} — שנות הפוריות` :
      ageNum <= 58 ? `שאלון מותאם לגיל ${ageNum} — גיל המעבר` :
                    `שאלון מותאם לגיל ${ageNum} — לאחר גיל המעבר`
 
    return (
      <>
        {/* Age group badge */}
        <div style={{
          background:'rgba(236,72,153,.08)', border:'1px solid rgba(236,72,153,.25)',
          padding:'10px 16px', marginBottom:'20px',
          display:'flex', alignItems:'center', gap:'10px',
        }}>
          <span style={{fontSize:'18px'}}>🌸</span>
          <p style={{
            fontFamily:'Heebo,sans-serif', fontSize:'13px',
            color:'#9d174d', fontWeight:500,
          }}>{AGE_GROUP_LABEL}</p>
        </div>
 
        {activeQs.map(q => renderQ(q))}
      </>
    )
  }
 
  // Special rendering for activity section — 4 clear category blocks
  const renderActivitySection = () => {
    const categories = [
      {
        icon:'🔥', title:'עצימות גבוהה',
        subtitle:'ריצה, HIIT, כדורגל, אופניים בעלייה',
        color:'#b84040',
        daysId:'q_hi_days', minId:'q_hi_min',
      },
      {
        icon:'🚶', title:'הליכה ועצימות נמוכה',
        subtitle:'הליכה, שחייה רגועה, אופניים בשטח שטוח',
        color:'#4a8c5c',
        daysId:'q_walk_days', minId:'q_walk_min',
      },
      {
        icon:'🧘', title:'יוגה, פילאטס והתאוששות',
        subtitle:'פעילות גמישות, נשימה ומודעות לגוף',
        color:'#6b46c1',
        daysId:'q_mind_days', minId:'q_mind_min',
      },
      {
        icon:'💪', title:'אימוני כוח',
        subtitle:'משקולות, TRX, כושר פונקציונלי, CrossFit',
        color:'#c05621',
        daysId:'q_strength_days', minId:'q_strength_min',
      },
    ]
 
    return categories.map(cat => (
      <div key={cat.daysId} style={{
        border:'1px solid #d4cdc4', marginBottom:'12px', overflow:'hidden',
      }}>
        {/* Category header */}
        <div style={{
          background:'#1a1512', padding:'12px 20px',
          display:'flex', alignItems:'center', gap:'12px',
          borderRight:`4px solid ${cat.color}`,
        }}>
          <span style={{fontSize:'20px'}}>{cat.icon}</span>
          <div>
            <p style={{color:'#fff',fontFamily:'Heebo,sans-serif',fontSize:'14px',fontWeight:600,marginBottom:'2px'}}>{cat.title}</p>
            <p style={{color:'#6b6055',fontFamily:'Heebo,sans-serif',fontSize:'11px'}}>{cat.subtitle}</p>
          </div>
        </div>
        {/* Inputs */}
        <div style={{
          padding:'16px', background:'#faf7f3',
          display:'flex', gap:'16px', flexWrap:'wrap',
        }}>
          {/* Days */}
          <div style={{flex:1, minWidth:'120px'}}>
            <p style={{fontSize:'12px',color:'#6b6055',marginBottom:'6px',fontFamily:'Heebo,sans-serif',fontWeight:500}}>ימים בשבוע</p>
            <input
              type="number" min={0} max={7} placeholder="0–7"
              value={answers[cat.daysId] !== undefined ? String(answers[cat.daysId]) : ''}
              onChange={e => set(cat.daysId, e.target.value === '' ? '' : Number(e.target.value))}
              style={{
                padding:'10px 14px', fontSize:'18px', fontWeight:600,
                border:`1px solid ${answers[cat.daysId] !== undefined && answers[cat.daysId] !== '' ? cat.color : '#d4cdc4'}`,
                outline:'none', background:'transparent', fontFamily:'Heebo,sans-serif',
                width:'100%', direction:'ltr', textAlign:'center',
                WebkitAppearance:'none', boxSizing:'border-box',
                color: cat.color,
              }}
            />
          </div>
          {/* Minutes */}
          <div style={{flex:2, minWidth:'160px'}}>
            <p style={{fontSize:'12px',color:'#6b6055',marginBottom:'6px',fontFamily:'Heebo,sans-serif',fontWeight:500}}>דקות סה"כ בשבוע</p>
            <input
              type="number" min={0} max={2000} placeholder="לדוגמה: 90"
              value={answers[cat.minId] !== undefined ? String(answers[cat.minId]) : ''}
              onChange={e => set(cat.minId, e.target.value === '' ? '' : Number(e.target.value))}
              style={{
                padding:'10px 14px', fontSize:'18px', fontWeight:600,
                border:`1px solid ${answers[cat.minId] !== undefined && answers[cat.minId] !== '' ? cat.color : '#d4cdc4'}`,
                outline:'none', background:'transparent', fontFamily:'Heebo,sans-serif',
                width:'100%', direction:'ltr', textAlign:'center',
                WebkitAppearance:'none', boxSizing:'border-box',
                color: cat.color,
              }}
            />
          </div>
        </div>
      </div>
    ))
  }
 
  return (
    <div style={{minHeight:'100vh',background:'#f0ebe3',overflowX:'hidden'}}>
 
      {/* Progress bar */}
      <div style={{position:'fixed',top:0,right:0,left:0,height:'3px',background:'#e8e2d9',zIndex:50}}>
        <div style={{height:'100%',width:`${pct}%`,background:'#8b4a2f',transition:'width .5s'}} />
      </div>
 
      <div style={{
        maxWidth:'680px', margin:'0 auto',
        padding:'20px 16px 80px',
        boxSizing:'border-box', width:'100%',
      }}>
 
        {/* Section header */}
        <div style={{background:'#1a1512',padding:'24px',marginBottom:'20px'}}>
          <p style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#6b6055',marginBottom:'10px',fontFamily:'Heebo,sans-serif'}}>
            {secIdx+1} / {total}
          </p>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <span style={{fontSize:'24px'}}>{SECTION_ICONS[sec.id] || '📋'}</span>
            <div>
              <h2 style={{fontFamily:'Playfair Display,serif',color:'#fff',fontSize:'22px',fontWeight:400,marginBottom:'2px'}}>
                {sec.title}
              </h2>
              <p style={{fontSize:'11px',color:'#6b6055',fontFamily:'Heebo,sans-serif'}}>{sec.en}</p>
            </div>
          </div>
        </div>
 
        {/* Validation error */}
        {showError && (
          <div style={{
            background:'rgba(185,28,28,.1)', border:'1px solid rgba(185,28,28,.3)',
            padding:'12px 16px', marginBottom:'16px',
            color:'#c53030', fontFamily:'Heebo,sans-serif', fontSize:'13px',
            textAlign:'right',
          }}>
            יש לענות על כל השאלות לפני המעבר לשלב הבא
          </div>
        )}
 
        {/* Questions — special layout per section */}
        {sec.id === 'activity'
          ? renderActivitySection()
          : sec.id === 'nutrition'
          ? renderNutritionSection()
          : sec.id === 'womens_health'
          ? renderWomensHealthSection()
          : sec.questions.map(q => renderQ(q))
        }
 
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
 
