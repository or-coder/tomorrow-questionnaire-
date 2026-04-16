export default function ThankYouPage() {
  return (
    <div style={{
      minHeight:'100vh', background:'#1a1512',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'40px 24px', textAlign:'center',
    }}>
 
      {/* Logo */}
      <div style={{marginBottom:'48px'}}>
        <h1 style={{
          fontFamily:'Playfair Display,serif',
          fontSize:'clamp(40px,8vw,72px)',
          fontWeight:300, letterSpacing:'.15em',
          color:'#fff', marginBottom:'8px',
        }}>TOMORROW</h1>
        <p style={{
          fontSize:'11px', letterSpacing:'3px',
          textTransform:'uppercase', color:'#6b6055',
          fontFamily:'Heebo,sans-serif',
        }}>The science of better living</p>
      </div>
 
      {/* Check mark */}
      <div style={{
        width:'72px', height:'72px', borderRadius:'50%',
        background:'rgba(201,168,76,.15)',
        border:'2px solid #c9a84c',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'32px', marginBottom:'32px',
      }}>
        ✓
      </div>
 
      {/* Message */}
      <h2 style={{
        fontFamily:'Playfair Display,serif',
        fontSize:'clamp(22px,5vw,32px)',
        fontWeight:300, color:'#fff',
        marginBottom:'16px',
      }}>
        תודה שמילאת את השאלון
      </h2>
 
      <p style={{
        fontFamily:'Heebo,sans-serif',
        fontSize:'16px', fontWeight:300,
        color:'rgba(255,255,255,.6)',
        marginBottom:'12px', lineHeight:1.7,
        maxWidth:'400px',
      }}>
        התשובות שלך נשלחו לצוות הרפואי של טומורו.
      </p>
 
      <p style={{
        fontFamily:'Heebo,sans-serif',
        fontSize:'16px', fontWeight:300,
        color:'rgba(255,255,255,.6)',
        marginBottom:'48px', lineHeight:1.7,
        maxWidth:'400px',
      }}>
        הרופא יעבור בהקדם על התשובות.
      </p>
 
      {/* Divider */}
      <div style={{
        width:'40px', height:'1px',
        background:'rgba(201,168,76,.4)',
        marginBottom:'32px',
      }} />
 
      <p style={{
        fontFamily:'Heebo,sans-serif',
        fontSize:'13px', color:'rgba(255,255,255,.25)',
      }}>
        שאלות? צור קשר עם הצוות
      </p>
 
    </div>
  )
}
 
