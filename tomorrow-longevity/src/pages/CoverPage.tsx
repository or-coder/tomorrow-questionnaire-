import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DOMAINS = ['פעילות גופנית','התנהגויות בריאות','BMI','תזונה','בריאות עצמית','שינה ומקצב יממתי','איכות חיים ולחץ']

export default function CoverPage() {
  const nav = useNavigate()
  const [name,   setName]   = useState('')
  const [age,    setAge]    = useState('')
  const [gender, setGender] = useState('')

  const canStart = name.trim() && age.trim() && gender

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-6 text-center py-16">

      {/* Logo */}
      <div className="mb-14">
        <h1 className="font-serif text-white tracking-[.18em]" style={{fontSize:'clamp(48px,10vw,88px)',fontWeight:300}}>
          TOMORROW
        </h1>
        <p className="label-caps text-brand-soft tracking-[.3em] mt-2">The science of better living</p>
      </div>

      <h2 className="text-white font-body font-light mb-10" style={{fontSize:'clamp(20px,4vw,28px)'}}>
        שאלון אבחון TOMORROW
      </h2>

      {/* Domain pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-lg">
        {DOMAINS.map(d => (
          <span key={d} className="px-4 py-1.5 text-xs font-body border"
            style={{borderColor:'rgba(255,255,255,.18)',color:'rgba(255,255,255,.5)'}}>
            {d}
          </span>
        ))}
      </div>

      {/* Form */}
      <div className="w-full max-w-sm space-y-3 mb-10">
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="שם מלא"
          className="w-full px-4 py-3 font-body text-sm bg-transparent border text-white placeholder:text-white/30 outline-none focus:border-brand-accent transition-colors"
          style={{borderColor:'rgba(255,255,255,.2)'}}
        />
        <input
          type="number" value={age} onChange={e => setAge(e.target.value)}
          placeholder="גיל" min={10} max={120}
          className="w-full px-4 py-3 font-body text-sm bg-transparent border text-white placeholder:text-white/30 outline-none focus:border-brand-accent transition-colors"
          style={{borderColor:'rgba(255,255,255,.2)'}}
        />
        <div className="flex gap-3">
          {[{l:'זכר',v:'male'},{l:'נקבה',v:'female'}].map(g => (
            <button key={g.v} onClick={() => setGender(g.v)}
              className="flex-1 px-4 py-3 font-body text-sm border transition-all"
              style={{
                borderColor: gender===g.v ? '#8b4a2f' : 'rgba(255,255,255,.2)',
                background:  gender===g.v ? '#8b4a2f' : 'transparent',
                color:       gender===g.v ? '#fff' : 'rgba(255,255,255,.5)',
              }}>
              {g.l}
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={!canStart}
        onClick={() => nav('/questionnaire', {state:{name,age,gender}})}
        className="px-14 py-3.5 font-body text-sm tracking-widest transition-opacity"
        style={{background: canStart?'#8b4a2f':'rgba(255,255,255,.15)', color:'#fff', opacity: canStart?1:.5, cursor: canStart?'pointer':'not-allowed'}}>
        התחל שאלון
      </button>

      <p className="mt-6 text-xs font-body" style={{color:'rgba(255,255,255,.2)'}}>
        ⏱ כ-15–20 דקות &nbsp;|&nbsp; 🔒 מידע מוגן
      </p>
    </div>
  )
}
