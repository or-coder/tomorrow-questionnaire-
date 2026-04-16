import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
 
const DOMAINS = ['פעילות גופנית','התנהגויות בריאות','BMI','תזונה','בריאות עצמית','שינה ומקצב יממתי','איכות חיים ולחץ']
 
export default function CoverPage() {
  const nav = useNavigate()
  const [name,   setName]   = useState('')
  const [age,    setAge]    = useState('')
  const [gender, setGender] = useState('')
  const [idNum,  setIdNum]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,  setError]  = useState('')
 
  const canStart = name.trim() && age.trim() && gender && idNum.trim().length >= 5
 
  async function handleStart() {
    if (!canStart) return
    setLoading(true)
    setError('')
 
    try {
      // בדוק אם ת.ז כבר מילאה שאלון
      const { data } = await supabase
        .from('submissions')
        .select('id, created_at, name')
        .eq('id_number', idNum.trim())
        .maybeSingle()
 
      if (data) {
        const date = new Date(data.created_at).toLocaleDateString('he-IL')
        setError(`ת.ז זו כבר מילאה את השאלון בתאריך ${date}. אנא פנה לצוות TOMORROW לפרטים נוספים.`)
        setLoading(false)
        return
      }
 
      nav('/questionnaire', { state: { name, age, gender, idNum } })
    } catch {
      // אם אין עמודת id_number עדיין — תמשיך בלי בדיקה
      nav('/questionnaire', { state: { name, age, gender, idNum } })
    }
 
    setLoading(false)
  }
 
  return (
    <div style={{
      minHeight:'100vh', background:'#1a1512',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'60px 24px', textAlign:'center',
    }}>
 
      {/* Logo */}
      <div style={{marginBottom:'48px'}}>
        <h1 style={{
          fontFamily:'Playfair Display,serif',
          fontSize:'clamp(48px,10vw,88px)',
          fontWeight:300, letterSpacing:'.18em',
          color:'#fff', marginBottom:'6px',
        }}>TOMORROW</h1>
        <p style={{
          fontSize:'11px', letterSpacing:'3px',
          textTransform:'uppercase', color:'#6b6055',
          fontFamily:'Heebo,sans-serif',
        }}>The science of better living</p>
      </div>
 
      <h2 style={{
        fontFamily:'Heebo,sans-serif', fontWeight:300,
        fontSize:'clamp(20px,4vw,28px)', color:'#fff',
        marginBottom:'40px',
      }}>
        שאלון אבחון TOMORROW
      </h2>
 
      {/* Domain pills */}
      <div style={{
        display:'flex', flexWrap:'wrap',
        justifyContent:'center', gap:'8px',
        marginBottom:'48px', maxWidth:'500px',
      }}>
        {DOMAINS.map(d => (
          <span key={d} style={{
            padding:'6px 16px', fontSize:'12px',
            border:'1px solid rgba(255,255,255,.18)',
            color:'rgba(255,255,255,.5)',
            fontFamily:'Heebo,sans-serif',
          }}>{d}</span>
        ))}
      </div>
 
      {/* Form */}
      <div style={{width:'100%', maxWidth:'360px', display:'flex', flexDirection:'column', gap:'12px', marginBottom:'28px'}}>
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="שם מלא"
          style={{
            width:'100%', padding:'14px 16px',
            fontFamily:'Heebo,sans-serif', fontSize:'14px',
            background:'transparent',
            border:'1px solid rgba(255,255,255,.2)',
            color:'#fff', outline:'none',
            direction:'rtl',
          }}
        />
        <input
          type="number" value={age} onChange={e => setAge(e.target.value)}
          placeholder="גיל" min={10} max={120}
          style={{
            width:'100%', padding:'14px 16px',
            fontFamily:'Heebo,sans-serif', fontSize:'14px',
            background:'transparent',
            border:'1px solid rgba(255,255,255,.2)',
            color:'#fff', outline:'none',
            direction:'rtl',
          }}
        />
        <input
          value={idNum} onChange={e => setIdNum(e.target.value)}
          placeholder="מספר תעודת זהות"
          maxLength={9}
          style={{
            width:'100%', padding:'14px 16px',
            fontFamily:'Heebo,sans-serif', fontSize:'14px',
            background:'transparent',
            border:'1px solid rgba(255,255,255,.2)',
            color:'#fff', outline:'none',
            direction:'ltr', textAlign:'right',
          }}
        />
        <div style={{display:'flex', gap:'10px'}}>
          {[{l:'זכר',v:'male'},{l:'נקבה',v:'female'}].map(g => (
            <button key={g.v} onClick={() => setGender(g.v)}
              style={{
                flex:1, padding:'14px',
                fontFamily:'Heebo,sans-serif', fontSize:'14px',
                border:'1px solid ' + (gender===g.v ? '#8b4a2f' : 'rgba(255,255,255,.2)'),
                background: gender===g.v ? '#8b4a2f' : 'transparent',
                color: gender===g.v ? '#fff' : 'rgba(255,255,255,.5)',
                cursor:'pointer', transition:'all .2s',
              }}>
              {g.l}
            </button>
          ))}
        </div>
      </div>
 
      {/* Error message */}
      {error && (
        <div style={{
          maxWidth:'360px', width:'100%',
          padding:'14px 16px', marginBottom:'16px',
          background:'rgba(185,28,28,.15)',
          border:'1px solid rgba(185,28,28,.4)',
          color:'#fca5a5',
          fontFamily:'Heebo,sans-serif', fontSize:'13px',
          lineHeight:1.6,
        }}>
          {error}
        </div>
      )}
 
      <button
        disabled={!canStart || loading}
        onClick={handleStart}
        style={{
          padding:'14px 56px',
          fontFamily:'Heebo,sans-serif', fontSize:'14px',
          letterSpacing:'1px',
          background: canStart && !loading ? '#8b4a2f' : 'rgba(255,255,255,.15)',
          color:'#fff', border:'none',
          cursor: canStart && !loading ? 'pointer' : 'not-allowed',
          opacity: canStart && !loading ? 1 : 0.5,
          transition:'all .2s',
        }}>
        {loading ? 'בודק...' : 'התחל שאלון'}
      </button>
 
      <p style={{
        marginTop:'20px', fontSize:'11px',
        color:'rgba(255,255,255,.2)',
        fontFamily:'Heebo,sans-serif',
      }}>
        ⏱ כ-15–20 דקות &nbsp;|&nbsp; 🔒 מידע מוגן
      </p>
    </div>
  )
}
 
