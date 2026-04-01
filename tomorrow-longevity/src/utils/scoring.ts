export type Answers = Record<string, string | number | string[]>

export interface Scores {
  score_activity: number; score_health_behaviors: number; score_bmi: number
  score_nutrition: number; score_srh: number; score_sleep: number
  score_circadian: number; score_qol: number; score_stress: number
  score_composite: number; bmi_value: number; isi_total: number
  pss_total: number; met_total: number
}
export interface Flag { title: string; body: string; urgent: boolean }

const n = (a: Answers, k: string) => Number(a[k]) || 0
const s = (a: Answers, k: string) => String(a[k] || '')
const arr = (a: Answers, k: string): string[] =>
  Array.isArray(a[k]) ? (a[k] as string[]) : []

// ── 1. ACTIVITY (IPAQ MET-min) ─────────────────────────────
function calcActivity(a: Answers): { score: number; met: number } {
  const met = n(a,'q2')*8 + n(a,'q4')*4 + n(a,'q6')*3.3
  let score = 0
  if (met >= 3000) score = 100
  else if (met >= 2521) score = 90
  else if (met >= 2041) score = 80
  else if (met >= 1561) score = 70
  else if (met >= 1081) score = 60
  else if (met >= 600)  score = 50
  return { score, met: Math.round(met) }
}

// ── 2. HEALTH BEHAVIORS ────────────────────────────────────
function calcHealth(a: Answers): number {
  const smoke = s(a,'q7')==='never' ? 100 : s(a,'q7')==='former' ? 50 : 0
  const alc   = s(a,'q8')==='no' ? 100 : 0
  return (smoke + alc) / 2
}

// ── 3. BMI ─────────────────────────────────────────────────
function getBMI(a: Answers): number {
  const w = n(a,'q9'), h = n(a,'q10') / 100
  return (h > 0 && w > 0) ? w / (h * h) : 0
}
function calcBMI(a: Answers): number {
  const bmi = getBMI(a)
  return (bmi >= 20 && bmi <= 27) ? 100 : 0
}

// ── 4. NUTRITION ───────────────────────────────────────────
function calcNutrition(a: Answers): number {
  const meals = s(a,'q11') === '3-4' ? 100 : 0
  const p = n(a,'q12'); const prot  = p>=80?100:p>=50?66:p>=20?33:0
  const f = n(a,'q13'); const fat   = (f>=40&&f<=100)?100:f>=20?50:0
  const c = n(a,'q14'); const carbs = c>=150?100:c>=80?66:c>=30?33:0
  return (meals + (prot+fat+carbs)/3) / 2
}

// ── 5. SRH ─────────────────────────────────────────────────
function calcSRH(a: Answers): number {
  const m: Record<string,number> = {excellent:100,very_good:75,good:50,fair:25,poor:0}
  return m[s(a,'q15')] ?? 50
}

// ── 6. SLEEP (ISI + hours) ─────────────────────────────────
function calcSleep(a: Answers): { score: number; isi: number } {
  const hrs = ({'>7':100,'5-7':50,'<5':0})[s(a,'q16')] ?? 0
  const isi = n(a,'q17')+n(a,'q18')+n(a,'q19')+n(a,'q20')+n(a,'q21')+n(a,'q22')+n(a,'q23')
  const isiScore = isi<=7?100:isi<=14?66:isi<=21?33:0
  return { score: (hrs + isiScore) / 2, isi }
}

// ── 7. CIRCADIAN ───────────────────────────────────────────
function calcCircadian(a: Answers): number {
  const fl = ({'0-4':100,'5-9':50,'10+':0})[s(a,'q24')] ?? 50
  const sh = s(a,'q25')==='no' ? 100 : 0
  const co = ({same:100,'1h':100,'1-2h':50,'>2h':0})[s(a,'q26')] ?? 50
  const sc = ({'>2h':100,'1-2h':75,'30m-1h':25,'<30m':0,'none':0})[s(a,'q27')] ?? 50
  return (fl + sh + co + sc) / 4
}

// ── 8. QOL ─────────────────────────────────────────────────
function calcQOL(a: Answers): number {
  const m: Record<string,number> = {excellent:100,very_good:75,good:50,fair:25,poor:0}
  return m[s(a,'q28')] ?? 50
}

// ── 9. STRESS (PSS-10) ─────────────────────────────────────
function calcStress(a: Answers): { score: number; pss: number } {
  const rev = ['q30','q31','q34','q35','q38']
  const ks  = ['q29','q30','q31','q32','q33','q34','q35','q36','q37','q38']
  let pss = 0
  ks.forEach(k => { pss += rev.includes(k) ? 4 - n(a,k) : n(a,k) })
  return { score: ((40 - pss) / 40) * 100, pss }
}

// ── FLAGS ──────────────────────────────────────────────────
export function computeFlags(a: Answers, scores: Scores): Flag[] {
  const flags: Flag[] = []
  const bmi = scores.bmi_value

  // Sleep
  if (n(a,'q17') >= 3)        flags.push({ title:'קושי חמור להירדם', body:'ISI ≥3 — הפניה לבדיקת שינה', urgent:false })
  if (scores.isi_total >= 15) flags.push({ title:'הפרעת שינה — ISI ≥15', body:`סכום ISI: ${scores.isi_total}/28`, urgent:false })
  if (scores.score_sleep < 40) flags.push({ title:'ציון שינה קריטי', body:`ציון: ${scores.score_sleep}/100`, urgent:false })

  // Stress
  if (scores.pss_total >= 27) flags.push({ title:'לחץ גבוה — PSS ≥27', body:`ציון PSS: ${scores.pss_total}/40`, urgent:false })

  // Lifestyle
  if (s(a,'q7') === 'current') flags.push({ title:'עישון פעיל', body:'גורם סיכון מרכזי', urgent:false })

  // BMI
  if (bmi > 30)              flags.push({ title:`השמנה — BMI ${bmi.toFixed(1)}`, body:'בירור קרדיו-מטבולי', urgent:false })
  if (bmi > 0 && bmi < 18.5) flags.push({ title:`תת-משקל — BMI ${bmi.toFixed(1)}`, body:'יש לברר', urgent:false })

  // Blood pressure
  const bp = s(a,'qb1')
  if (bp === '160+')    flags.push({ title:'⚠️ לחץ דם גבוה מאוד — 160+', body:'בירור קרדיולוגי דחוף', urgent:true })
  if (bp === '140-159') flags.push({ title:'לחץ דם גבוה — 140–159', body:'Stage 2 hypertension', urgent:false })
  if (s(a,'qb2') === 'treated_uncontrolled') flags.push({ title:'לחץ דם לא מאוזן תחת טיפול', body:'התאמת טיפול נדרשת', urgent:false })

  // Digestion
  if (arr(a,'qb3').includes('appetite_loss')) flags.push({ title:'ירידה בתיאבון ללא הסבר', body:'לברר תהליך מחלתי', urgent:false })
  if (s(a,'qb4') === 'chronic')               flags.push({ title:'הפרעות עיכול כרוניות', body:'IBS / מחלת מעי?', urgent:false })

  // Family history
  if (arr(a,'qm1').includes('heart'))    flags.push({ title:'היסטוריה משפחתית — מחלת לב', body:'בן משפחה <60 — סיכון גבוה', urgent:false })
  if (arr(a,'qm1').includes('dementia')) flags.push({ title:'היסטוריה משפחתית — דמנציה', body:'הערכה קוגניטיבית מומלצת', urgent:false })

  // Medications
  if (s(a,'qm2') === 'psych') flags.push({ title:'תרופות פסיכיאטריות', body:'לשקול בהקשר ממצאי לחץ ושינה', urgent:false })

  return flags
}

// ── MAIN ───────────────────────────────────────────────────
export function calculateScores(answers: Answers): Scores & { flags: Flag[] } {
  const activity   = calcActivity(answers)
  const sleep      = calcSleep(answers)
  const stress     = calcStress(answers)
  const bmi_value  = getBMI(answers)

  const scores: Scores = {
    score_activity:         Math.round(activity.score),
    score_health_behaviors: Math.round(calcHealth(answers)),
    score_bmi:              Math.round(calcBMI(answers)),
    score_nutrition:        Math.round(calcNutrition(answers)),
    score_srh:              Math.round(calcSRH(answers)),
    score_sleep:            Math.round(sleep.score),
    score_circadian:        Math.round(calcCircadian(answers)),
    score_qol:              Math.round(calcQOL(answers)),
    score_stress:           Math.round(stress.score),
    score_composite: 0,
    bmi_value, isi_total: sleep.isi, pss_total: stress.pss, met_total: activity.met,
  }

  const vals = [
    scores.score_activity, scores.score_health_behaviors, scores.score_bmi,
    scores.score_nutrition, scores.score_srh, scores.score_sleep,
    scores.score_circadian, scores.score_qol, scores.score_stress,
  ]
  scores.score_composite = Math.round(vals.reduce((s,v) => s+v, 0) / vals.length)

  const flags = computeFlags(answers, scores)
  return { ...scores, flags }
}

export const DOMAIN_META = [
  { key:'score_activity',         label:'פעילות גופנית',    icon:'🏃', color:'#4a8c5c' },
  { key:'score_health_behaviors', label:'התנהגויות בריאות',  icon:'🫀', color:'#b84040' },
  { key:'score_bmi',              label:'BMI',              icon:'⚖️',  color:'#c05621' },
  { key:'score_nutrition',        label:'תזונה',            icon:'🥗', color:'#b8822a' },
  { key:'score_srh',              label:'בריאות עצמית',      icon:'💬', color:'#2b6cb0' },
  { key:'score_sleep',            label:'שינה',             icon:'😴', color:'#2c7a7b' },
  { key:'score_circadian',        label:'צירקדיאני',         icon:'🌙', color:'#6b46c1' },
  { key:'score_qol',              label:'איכות חיים',        icon:'🌿', color:'#276749' },
  { key:'score_stress',           label:'לחץ',              icon:'🧠', color:'#97266d' },
] as const
