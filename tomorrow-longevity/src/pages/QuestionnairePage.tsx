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
    const without = cur.filter(v => v === 'none' ? false : true)
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
      <div key={q.id} className="q-card">
        <p className="text-sm font-medium mb-2 text-brand-dark">{q.text}</p>
        {q.hint && <p className="text-xs text-brand-soft mb-3 leading-relaxed">{q.hint}</p>}
        <input type="number" min={q.min} max={q.max} placeholder={q.placeholder}
          value={val !== undefined ? String(val) : ''}
          onChange={e => set(q.id, e.target.value === '' ? '' : Number(e.target.value))}
          className="px-4 py-2.5 text-sm border outline-none transition-colors w-48"
          style={{borderColor:'#d4cdc4',background:'transparent',fontFamily:'Heebo,sans-serif'}}
          onFocus={e => e.target.style.borderColor='#8b4a2f'}
          onBlur={e  => e.target.style.borderColor='#d4cdc4'}
        />
      </div>
    )

    if (q.type === 'single') return (
      <div key={q.id} className="q-card">
        <p className="text-sm font-medium mb-4 text-brand-dark">{q.text}</p>
        <div className="space-y-2">
          {q.options!.map(o => (
            <button key={o.value} onClick={() => set(q.id, o.value)}
              className={`opt-btn ${val === o.value ? 'active' : ''}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    )

    if (q.type === 'multi') {
      const cur = (val as string[]) || []
      return (
        <div key={q.id} className="q-card">
          <p className="text-sm font-medium mb-1 text-brand-dark">{q.text}</p>
          <p className="text-xs text-brand-soft mb-4">ניתן לסמן יותר מאחד</p>
          <div className="space-y-2">
            {q.options!.map(o => {
              const isNone = o.value === 'none'
              const sel = cur.includes(o.value)
              return (
                <button key={o.value} onClick={() => toggleMulti(q.id, o.value, isNone)}
                  className="w-full text-right px-4 py-3 text-sm border transition-all flex items-center gap-3"
                  style={{
                    borderColor:      sel ? '#8b4a2f' : '#d4cdc4',
                    borderRightWidth: sel ? '4px' : '1px',
                    background:       sel ? 'rgba(139,74,47,.06)' : 'transparent',
                    fontFamily:       'Heebo,sans-serif',
                  }}>
                  <span className="w-5 h-5 border flex-shrink-0 flex items-center justify-center text-xs"
                    style={{borderColor: sel?'#8b4a2f':'#d4cdc4', background: sel?'#8b4a2f':'transparent', color:'#fff'}}>
                    {sel ? '✓' : ''}
                  </span>
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (q.type === 'scale') return (
      <div key={q.id} className="q-card">
        <p className="text-sm font-medium mb-4 text-brand-dark">{q.text}</p>
        <div className="flex items-center gap-3" style={{direction:'ltr'}}>
          <span className="text-xs text-brand-soft text-left w-20 leading-tight">{q.scaleLabels?.min}</span>
          <div className="flex gap-2 flex-1 justify-center">
            {[0,1,2,3,4].map(n => (
              <button key={n} onClick={() => set(q.id, n)}
                className="w-10 h-10 text-sm border transition-all"
                style={{
                  borderColor: val===n ? '#8b4a2f' : '#d4cdc4',
                  background:  val===n ? '#8b4a2f' : 'transparent',
                  color:       val===n ? '#fff'    : '#1a1512',
                  fontFamily:  'Heebo,sans-serif',
                }}>
                {n}
              </button>
            ))}
          </div>
          <span className="text-xs text-brand-soft text-right w-20 leading-tight">{q.scaleLabels?.max}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Progress */}
      <div className="fixed top-0 right-0 left-0 h-[2px] bg-brand-surface z-50">
        <div className="h-full transition-all duration-500" style={{width:`${pct}%`,background:'#8b4a2f'}} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pt-10">
        {/* Section header */}
        <div className="bg-brand-dark p-7 mb-6">
          <p className="label-caps text-brand-soft mb-3">{secIdx+1} / {total}</p>
          <h2 className="font-serif text-white text-2xl mb-1">{sec.title}</h2>
          <p className="text-xs text-brand-soft">{sec.en}</p>
        </div>

        {sec.questions.map(q => renderQ(q))}

        {/* Nav */}
        <div className="flex gap-3 mt-8">
          {secIdx > 0 && (
            <button onClick={goBack} className="btn-secondary flex-1">◄ חזרה</button>
          )}
          <button onClick={goNext}
            className="flex-1 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
            style={{background:'#8b4a2f', fontFamily:'Heebo,sans-serif'}}>
            {secIdx === total-1 ? '✓ שלח שאלון' : 'הבא ►'}
          </button>
        </div>
      </div>
    </div>
  )
}
