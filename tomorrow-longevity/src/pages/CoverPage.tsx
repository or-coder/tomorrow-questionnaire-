import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { TomorrowLogo } from '@/TomorrowLogo'
 
export default function CoverPage() {
  const nav = useNavigate()
  const [name,    setName]    = useState('')
  const [age,     setAge]     = useState('')
  const [gender,  setGender]  = useState('')
  const [idNum,   setIdNum]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [attempted, setAttempted] = useState(false)
 
  const missingFields = []
  if (!name.trim())              missingFields.push('שם מלא')
  if (!age.trim())               missingFields.push('גיל')
  if (idNum.trim().length < 5)   missingFields.push('תעודת זהות')
  if (!gender)                   missingFields.push('מין')
  const canStart = missingFields.length === 0
 
  async function handleStart() {
    setAttempted(true)
    if (!canStart) return
    setLoading(true)
    setError('')
    try {
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
      nav('/questionnaire', { state: { name, age, gender, idNum } })
    }
    setLoading(false)
  }
 
  const S: Record<string, React.CSSProperties> = {
    page: {
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
    },
    inner: {
      position: 'relative',
      zIndex: 1,
      width: '100%',
      maxWidth: '420px',
    },
    logoWrap: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '52px',
    },
    eyebrow: {
      fontFamily: 'var(--font-body)',
      fontSize: '10px',
      letterSpacing: '3.5px',
      textTransform: 'uppercase' as const,
      color: 'var(--muted-stone)',
      marginBottom: '18px',
    },
    headline: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(30px, 5vw, 48px)',
      fontWeight: 400,
      color: 'var(--soft-white)',
      lineHeight: 1.18,
      marginBottom: '18px',
      letterSpacing: '-0.01em',
    },
    headlineEm: {
      fontStyle: 'italic',
      color: 'var(--mineral)',
    },
    body: {
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      fontWeight: 300,
      color: 'var(--muted-stone)',
      lineHeight: 1.75,
      marginBottom: '40px',
      maxWidth: '340px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    metaRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      marginBottom: '44px',
    },
    metaItem: { textAlign: 'center' as const },
    metaNum: {
      fontFamily: 'var(--font-display)',
      fontSize: '26px',
      color: 'var(--soft-white)',
      display: 'block',
      lineHeight: 1,
      marginBottom: '4px',
    },
    metaLabel: {
      fontFamily: 'var(--font-body)',
      fontSize: '10px',
      letterSpacing: '2px',
      textTransform: 'uppercase' as const,
      color: 'var(--warm-taupe)',
    },
    metaSep: {
      width: '1px',
      background: 'rgba(187,177,164,.2)',
      alignSelf: 'stretch',
    },
    divider: {
      width: '1px',
      height: '40px',
      background: 'linear-gradient(to bottom, rgba(187,177,164,.2), transparent)',
      margin: '0 auto 36px',
    },
    formSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
      marginBottom: '10px',
    },
    genderRow: { display: 'flex', gap: '8px' },
    validationMsg: {
      fontFamily: 'var(--font-body)',
      fontSize: '12px',
      color: 'rgba(220,130,130,.85)',
      marginTop: '6px',
      textAlign: 'right' as const,
      minHeight: '18px',
    },
    disclaimer: {
      marginTop: '18px',
      fontFamily: 'var(--font-body)',
      fontSize: '11px',
      color: 'rgba(187,177,164,.25)',
      lineHeight: 1.6,
    },
  }
 
  const inputErr = (field: boolean) => ({
    ...{} as React.CSSProperties,
    borderColor: attempted && field ? 'rgba(220,80,80,.55)' : undefined,
  })
 
  return (
    <div style={S.page} className="grain-overlay">
      {/* Subtle vertical line decoration */}
      <div style={{
        position: 'absolute', top: '10%', bottom: '10%', left: '50%',
        width: '1px',
        background: 'linear-gradient(to bottom, transparent, rgba(218,225,204,.08), transparent)',
        pointerEvents: 'none',
      }} />
 
      <div style={S.inner} className="anim-in">
 
        {/* Logo */}
        <div style={S.logoWrap}>
          <TomorrowLogo color="var(--soft-white)" height={20} />
        </div>
 
        <p style={S.eyebrow}>Longevity Assessment</p>
 
        <h1 style={S.headline}>
          Understanding your<br />
          <em style={S.headlineEm}>biological profile</em>
        </h1>
 
        <p style={S.body}>
          שאלון אבחון מקיף המנתח 12 תחומי בריאות ומחזיר פרופיל אישי — בסיס לתוכנית אריכות ימים מדויקת.
        </p>
 
        {/* Stats */}
        <div style={S.metaRow}>
          <div style={S.metaItem}>
            <span style={S.metaNum}>12</span>
            <span style={S.metaLabel}>תחומי בריאות</span>
          </div>
          <div style={S.metaSep} />
          <div style={S.metaItem}>
            <span style={S.metaNum}>15'</span>
            <span style={S.metaLabel}>משך השאלון</span>
          </div>
          <div style={S.metaSep} />
          <div style={S.metaItem}>
            <span style={S.metaNum}>100%</span>
            <span style={S.metaLabel}>מוגן ופרטי</span>
          </div>
        </div>
 
        <div style={S.divider} />
 
        {/* Form */}
        <div style={S.formSection}>
          <div>
            <label className="field-label" style={{ color: 'var(--muted-stone)' }}>שם מלא</label>
            <input
              className="dark-input"
              placeholder="ישראל ישראלי"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputErr(!name.trim())}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label className="field-label" style={{ color: 'var(--muted-stone)' }}>גיל</label>
              <input
                className="dark-input"
                type="number" min={18} max={100}
                placeholder="42"
                value={age}
                onChange={e => setAge(e.target.value)}
                style={inputErr(!age.trim())}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label className="field-label" style={{ color: 'var(--muted-stone)' }}>תעודת זהות</label>
              <input
                className="dark-input"
                placeholder="000000000"
                maxLength={9}
                value={idNum}
                onChange={e => setIdNum(e.target.value)}
                style={{ ...inputErr(idNum.trim().length < 5), direction: 'ltr', textAlign: 'right' }}
              />
            </div>
          </div>
          <div>
            <label className="field-label" style={{ color: 'var(--muted-stone)' }}>מין</label>
            <div style={S.genderRow}>
              {[{l:'זכר',v:'male'},{l:'נקבה',v:'female'}].map(g => (
                <button
                  key={g.v}
                  className={`gender-btn${gender===g.v ? ' selected' : ''}`}
                  onClick={() => setGender(g.v)}
                >
                  {g.l}
                </button>
              ))}
            </div>
          </div>
        </div>
 
        {/* Validation */}
        {attempted && missingFields.length > 0 && (
          <p style={S.validationMsg}>יש למלא: {missingFields.join(', ')}</p>
        )}
        {error && (
          <div style={{
            background: 'rgba(185,28,28,.12)', border: '1px solid rgba(185,28,28,.35)',
            padding: '12px 16px', margin: '10px 0',
            color: '#fca5a5', fontFamily: 'var(--font-body)', fontSize: '13px',
            lineHeight: 1.6, textAlign: 'right',
          }}>
            {error}
          </div>
        )}
 
        {/* CTA */}
        <button
          className="btn-primary"
          style={{ marginTop: '20px' }}
          disabled={loading}
          onClick={handleStart}
        >
          {loading ? 'בודק...' : 'התחל הערכה'}
          {!loading && <span style={{ fontSize: '16px' }}>←</span>}
        </button>
 
        <p style={S.disclaimer}>
          המידע מועבר בצורה מוצפנת ומשמש את צוות TOMORROW בלבד
        </p>
      </div>
    </div>
  )
}
 
