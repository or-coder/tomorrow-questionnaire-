import { TomorrowLogo } from '@/TomorrowLogo'
 
export default function ThankYouPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--off-white)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      textAlign: 'center',
    }} className="anim-in">
 
      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '56px' }}>
        <TomorrowLogo color="var(--soft-black)" height={18} style={{ opacity: 0.45 }} />
      </div>
 
      {/* Check mark */}
      <div style={{
        width: 72, height: 72,
        borderRadius: '50%',
        border: '1px solid var(--evergreen)',
        background: 'rgba(35,53,43,.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 10,
          borderRadius: '50%',
          background: 'rgba(35,53,43,.05)',
        }} />
        <svg width="24" height="18" viewBox="0 0 24 18" fill="none" style={{ position: 'relative', zIndex: 1 }}>
          <path d="M2 9L9 16L22 2" stroke="var(--evergreen)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
 
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        letterSpacing: '3.5px',
        textTransform: 'uppercase',
        color: 'var(--muted-stone)',
        marginBottom: '16px',
      }}>
        Assessment Complete
      </p>
 
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(26px, 4vw, 42px)',
        fontWeight: 400,
        color: 'var(--soft-black)',
        marginBottom: '16px',
        letterSpacing: '-0.01em',
        lineHeight: 1.18,
      }}>
        תודה שהשקעת<br />
        ב<em style={{ fontStyle: 'italic', color: 'var(--warm-taupe)' }}>עצמך</em>
      </h2>
 
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '15px',
        fontWeight: 300,
        color: 'var(--warm-taupe)',
        lineHeight: 1.75,
        maxWidth: '360px',
        marginBottom: '44px',
      }}>
        תשובותיך התקבלו ועוברות כעת עיבוד על ידי צוות TOMORROW.<br />
        הרופא יפנה אליך בהקדם עם תובנות מותאמות אישית.
      </p>
 
      {/* Divider */}
      <div style={{
        width: 1,
        height: 48,
        background: 'linear-gradient(to bottom, rgba(54,51,48,.2), transparent)',
        marginBottom: '32px',
      }} />
 
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: 'rgba(118,106,96,.35)',
      }}>
        TOMORROW — Movement Group
      </p>
    </div>
  )
}
 
