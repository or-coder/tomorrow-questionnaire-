export type Answers = Record<string, string | number | string[]>
 
export interface Scores {
  score_activity: number; score_health_behaviors: number; score_bmi: number
  score_nutrition: number; score_srh: number; score_sleep: number
  score_circadian: number; score_qol: number; score_stress: number
  score_social: number; score_mindfulness: number; score_cognition: number
  score_composite: number; bmi_value: number; isi_total: number
  pss_total: number; met_total: number
}
export interface Flag { title: string; body: string; urgent: boolean }
 
const n = (a: Answers, k: string) => Number(a[k]) || 0
const s = (a: Answers, k: string) => String(a[k] || '')
const arr = (a: Answers, k: string): string[] =>
  Array.isArray(a[k]) ? (a[k] as string[]) : []
 
// ── 1. ACTIVITY ────────────────────────────────────────────
// MET values: vigorous=8, walking/low=3.3, yoga/recovery=2.5, strength=5
function calcActivity(a: Answers): { score: number; met: number } {
  const met =
    n(a,'q_hi_min')       * 8   +
    n(a,'q_walk_min')     * 3.3 +
    n(a,'q_mind_min')     * 2.5 +
    n(a,'q_strength_min') * 5
 
  let score = 0
  if (met >= 3000) score = 100
  else if (met >= 2521) score = 90
  else if (met >= 2041) score = 80
  else if (met >= 1561) score = 70
  else if (met >= 1081) score = 60
  else if (met >= 600)  score = 50
 
  // Bonus for variety (doing 3+ types of activity)
  const types = [
    n(a,'q_hi_days') > 0,
    n(a,'q_walk_days') > 0,
    n(a,'q_mind_days') > 0,
    n(a,'q_strength_days') > 0,
  ].filter(Boolean).length
  if (types >= 3 && score > 0) score = Math.min(100, score + 10)
 
  return { score, met: Math.round(met) }
}
 
// ── 2. HEALTH BEHAVIORS ────────────────────────────────────
function calcHealth(a: Answers): number {
  const smoke = s(a,'q7')==='never' ? 100 : s(a,'q7')==='former' ? 50 : 0
  const alc   = s(a,'q8')==='no' ? 100 : s(a,'q8')==='occasional' ? 75 : 0
  return (smoke + alc) / 2
}
 
// ── 3. BMI ─────────────────────────────────────────────────
function getBMI(a: Answers): number {
  const w = n(a,'q9'), h = n(a,'q10') / 100
  return (h > 0 && w > 0) ? w / (h * h) : 0
}
function calcBMI(a: Answers): number {
  const bmi = getBMI(a)
  if (bmi === 0) return 50
  if (bmi >= 20 && bmi <= 27) return 100
  if (bmi >= 18.5 && bmi < 20) return 70
  if (bmi > 27 && bmi <= 30) return 70
  if (bmi > 30 && bmi <= 35) return 40
  return 0
}
 
// ── 4. NUTRITION ───────────────────────────────────────────
// Now based on meals count only (free-text meals go to AI for analysis)
function calcNutrition(a: Answers): number {
  const meals = s(a,'q11') === '3-4' ? 100 : s(a,'q11') === '5+' ? 80 : 40
  return meals
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
 
// ── 10. SOCIAL ─────────────────────────────────────────────
function calcSocial(a: Answers): number {
  const friends = ({  '0':0, '1-2':50, '3-5':80, '6+':100 })[s(a,'qs1')] ?? 50
  const freq    = ({ rarely:0, once:50, '2-3':80, daily:100 })[s(a,'qs2')] ?? 50
  const support = ({ low:0, medium:50, high:100 })[s(a,'qs3')] ?? 50
  return (friends + freq + support) / 3
}
 
// ── 11. MINDFULNESS ────────────────────────────────────────
function calcMindfulness(a: Answers): number {
  const freq = ({ never:0, rarely:30, sometimes:65, daily:100 })[s(a,'qmf1')] ?? 0
  if (freq === 0) return 0
  const dur  = ({ '<5':25, '5-15':60, '15-30':85, '>30':100 })[s(a,'qmf2')] ?? 50
  return (freq + dur) / 2
}
 
// ── 12. COGNITION ──────────────────────────────────────────
function calcCognition(a: Answers): number {
  const langs  = ({ '1':25, '2':60, '3':85, '4+':100 })[s(a,'qc1')] ?? 25
  const learn  = ({ no:0, sometimes:50, yes:100 })[s(a,'qc2')] ?? 0
  return (langs + learn) / 2
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
 
  // Social isolation
  if (s(a,'qs3') === 'low') flags.push({ title:'בדידות חברתית', body:'גורם סיכון לאריכות ימים', urgent:false })
 
  // Inactivity
  if (scores.met_total < 300) flags.push({ title:'אורח חיים יושבני', body:'MET שבועי נמוך מאוד', urgent:false })
 
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
    score_social:           Math.round(calcSocial(answers)),
    score_mindfulness:      Math.round(calcMindfulness(answers)),
    score_cognition:        Math.round(calcCognition(answers)),
    score_composite: 0,
    bmi_value, isi_total: sleep.isi, pss_total: stress.pss, met_total: activity.met,
  }
 
  const vals = [
    scores.score_activity, scores.score_health_behaviors, scores.score_bmi,
    scores.score_nutrition, scores.score_srh, scores.score_sleep,
    scores.score_circadian, scores.score_qol, scores.score_stress,
    scores.score_social, scores.score_mindfulness, scores.score_cognition,
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
  { key:'score_social',           label:'חיי חברה',          icon:'👥', color:'#2563eb' },
  { key:'score_mindfulness',      label:'מיינדפולנס',        icon:'🧘', color:'#7c3aed' },
  { key:'score_cognition',        label:'קוגניציה',          icon:'💡', color:'#b45309' },
] as const
 
