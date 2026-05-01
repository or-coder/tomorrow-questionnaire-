export interface Option  { label: string; value: string }
export interface Question {
  id: string; text: string; hint?: string
  type: 'number' | 'single' | 'multi' | 'scale' | 'text'
  options?: Option[]; min?: number; max?: number; placeholder?: string
  scaleLabels?: { min: string; max: string }
  showIf?: { id: string; values: string[] }
}
export interface Section { id: string; title: string; en: string; questions: Question[] }
 
export const SECTIONS: Section[] = [
  // ─── 1. רקע רפואי ───────────────────────────────────────
  {
    id: 'medical_bg', title: 'רקע רפואי', en: 'Medical Background',
    questions: [
      { id:'qm1', text:'האם יש לך היסטוריה משפחתית של אחד מהבאים?', type:'multi',
        options:[
          {label:'מחלת לב / אוטם לפני גיל 60', value:'heart'},
          {label:'שבץ מוחי',                    value:'stroke'},
          {label:'סוכרת סוג 2',                 value:'diabetes'},
          {label:'סרטן',                        value:'cancer'},
          {label:'אלצהיימר / דמנציה',            value:'dementia'},
          {label:'יתר לחץ דם מוקדם',             value:'hypertension'},
          {label:'אין היסטוריה משפחתית ידועה',   value:'none'},
        ]},
      { id:'qm2', text:'האם אתה נוטל תרופות מרשם באופן קבוע?', type:'single',
        options:[
          {label:'לא',                          value:'no'},
          {label:'כן — לב / לחץ דם',            value:'cardio'},
          {label:'כן — סוכרת',                  value:'diabetes'},
          {label:'כן — כולסטרול (סטטין)',        value:'statin'},
          {label:'כן — נפש / דיכאון / חרדה',    value:'psych'},
          {label:'כן — אחר',                    value:'other'},
        ]},
      { id:'qm2_other', text:'אילו תרופות?', type:'text',
        placeholder:'שם התרופה / מטרת הטיפול',
        showIf:{ id:'qm2', values:['other'] } },
      { id:'qm3', text:'האם אובחנת בעבר באחד מהבאים?', type:'multi',
        options:[
          {label:'יתר לחץ דם',                   value:'hbp'},
          {label:'סוכרת סוג 2',                  value:'diabetes'},
          {label:'מחלת לב',                      value:'heart'},
          {label:'כולסטרול גבוה',                 value:'cholesterol'},
          {label:'תת/יתר פעילות בלוטת תריס',     value:'thyroid'},
          {label:'מחלה אוטואימונית',              value:'autoimmune'},
          {label:'לא אובחנתי באף מהנ״ל',          value:'none'},
        ]},
    ]
  },
 
  // ─── 2. לחץ דם ועיכול ──────────────────────────────────
  {
    id: 'bp_digest', title: 'לחץ דם ועיכול', en: 'Blood Pressure & Digestion',
    questions: [
      { id:'qb_diagnosed', text:'האם אובחנת ביתר לחץ דם (הִיפֶּרטֶנְסִיָּה)?', type:'single',
        options:[
          {label:'כן, אובחנתי', value:'yes'},
          {label:'לא',          value:'no'},
        ]},
      { id:'qb2', text:'האם אתה מטופל כיום בתרופות ללחץ דם?', type:'single',
        showIf:{ id:'qb_diagnosed', values:['yes'] },
        options:[
          {label:'כן, ולחץ הדם מאוזן',      value:'treated_ok'},
          {label:'כן, אך לחץ הדם לא מאוזן', value:'treated_uncontrolled'},
          {label:'לא מטופל',                 value:'no'},
        ]},
      { id:'qb1', text:'מה לחץ הדם הסיסטולי שלך (המספר העליון)?', type:'single',
        hint:'אם אינך יודע/ת את המספר המדויק, בחר/י הערכה כללית.',
        options:[
          {label:'תקין — מתחת ל-120',   value:'<120'},
          {label:'גבוה מעט — 120–139',  value:'120-139'},
          {label:'גבוה — 140–159',      value:'140-159'},
          {label:'גבוה מאוד — 160+',    value:'160+'},
          {label:'לא יודע / לא נמדד',   value:'unknown'},
        ]},
      { id:'qb3', text:'האם חווית אחד מהבאים בחצי השנה האחרונה?', type:'multi',
        options:[
          {label:'נפיחות / גזים / אי-נוחות', value:'bloating'},
          {label:'עצירות',                   value:'constipation'},
          {label:'שלשולים תכופים',           value:'diarrhea'},
          {label:'צרבת / חומצה',             value:'reflux'},
          {label:'ירידה בתיאבון ללא הסבר',   value:'appetite_loss'},
          {label:'בחילות',                   value:'nausea'},
          {label:'לא חוויתי אף מהנ״ל',       value:'none'},
        ]},
      { id:'qb4', text:'כיצד תתאר את תפקוד מערכת העיכול שלך?', type:'single',
        options:[
          {label:'תקין ורגיל',              value:'normal'},
          {label:'לסירוגין — בעיות קלות',   value:'occasional'},
          {label:'תכוף — כמה פעמים בשבוע', value:'frequent'},
          {label:'כרוני — כמעט כל יום',     value:'chronic'},
        ]},
    ]
  },
 
  // ─── 3. פעילות גופנית (מחודש) ──────────────────────────
  {
    id: 'activity', title: 'פעילות גופנית', en: 'Physical Activity',
    questions: [
      {
        id:'q_hi_days',
        text:'פעילות עצימות גבוהה — כמה ימים בשבוע?',
        hint:'ריצה, שחייה מהירה, HIIT, כדורגל/כדורסל, אופניים בעלייה — נשימה כבדה, קשה לדבר.',
        type:'number', min:0, max:7, placeholder:'ימים (0–7)'
      },
      {
        id:'q_hi_min',
        text:'פעילות עצימות גבוהה — כמה דקות סה"כ בשבוע?',
        hint:'לדוגמה: רצת 30 דקות × 3 פעמים = 90 דקות.',
        type:'number', min:0, max:2000, placeholder:'דקות בשבוע'
      },
      {
        id:'q_walk_days',
        text:'הליכה ופעילות עצימות נמוכה — כמה ימים בשבוע?',
        hint:'הליכה רגילה, שחייה רגועה, אופניים בשטח שטוח — ניתן לנהל שיחה בזמן הפעילות.',
        type:'number', min:0, max:7, placeholder:'ימים (0–7)'
      },
      {
        id:'q_walk_min',
        text:'הליכה ופעילות עצימות נמוכה — כמה דקות סה"כ בשבוע?',
        hint:'לדוגמה: הלכת 40 דקות × 4 פעמים = 160 דקות.',
        type:'number', min:0, max:2000, placeholder:'דקות בשבוע'
      },
      {
        id:'q_mind_days',
        text:'יוגה, פילאטס, מתיחות, מדיטציה בתנועה — כמה ימים בשבוע?',
        hint:'פעילות המשלבת נשימה, גמישות ומודעות לגוף.',
        type:'number', min:0, max:7, placeholder:'ימים (0–7)'
      },
      {
        id:'q_mind_min',
        text:'יוגה / פילאטס / התאוששות — כמה דקות סה"כ בשבוע?',
        type:'number', min:0, max:2000, placeholder:'דקות בשבוע'
      },
      {
        id:'q_strength_days',
        text:'אימוני כוח — כמה ימים בשבוע?',
        hint:'משקולות, TRX, כושר פונקציונלי, CrossFit — אימון המפתח שרירים.',
        type:'number', min:0, max:7, placeholder:'ימים (0–7)'
      },
      {
        id:'q_strength_min',
        text:'אימוני כוח — כמה דקות סה"כ בשבוע?',
        type:'number', min:0, max:2000, placeholder:'דקות בשבוע'
      },
    ]
  },
 
  // ─── 4. התנהגויות בריאות ───────────────────────────────
  {
    id: 'health_behaviors', title: 'התנהגויות בריאות', en: 'Health Behaviors',
    questions: [
      { id:'q7', text:'סטטוס עישון', type:'single', options:[
        {label:'מעולם לא עישנתי',       value:'never'},
        {label:'עישנתי בעבר, הפסקתי',  value:'former'},
        {label:'מעשן/ת כיום',           value:'current'},
      ]},
      {
        id:'q8',
        text:'כמה משקאות אלכוהוליים אתה שותה בממוצע ביום?',
        hint:'משקה = כוס יין (150מ"ל) / פחית בירה / שוט של משקה חריף',
        type:'single', options:[
          {label:'לא שותה אלכוהול כלל',  value:'no'},
          {label:'מדי פעם',              value:'occasional'},
          {label:'1–2 משקאות ביום',      value:'1-2'},
          {label:'3 ומעלה ביום',         value:'yes'},
        ]
      },
    ]
  },
 
  // ─── 5. מדדים אנתרופומטריים ─────────────────────────────
  {
    id: 'anthropometry', title: 'מדדים אנתרופומטריים', en: 'Anthropometric Measures (BMI)',
    questions: [
      { id:'q9',  text:'משקל בק"ג',  type:'number', min:30,  max:300, placeholder:'לדוגמה: 75' },
      { id:'q10', text:'גובה בס"מ',  type:'number', min:100, max:250, placeholder:'לדוגמה: 175' },
    ]
  },
 
  // ─── 6. תזונה (מחודש — תיאור ארוחות) ──────────────────
  {
    id: 'nutrition', title: 'תזונה', en: 'Nutrition',
    questions: [
      {
        id:'q11', text:'כמה ארוחות ביום?', type:'single', options:[
          {label:'1–2',value:'1-2'},{label:'3–4',value:'3-4'},{label:'5 ומעלה',value:'5+'}
        ]
      },
      {
        id:'n_wd_morning',
        text:'יום חול — ארוחת בוקר',
        hint:'תאר מה אתה אוכל בדרך כלל בבוקר בימות השבוע.',
        type:'text', placeholder:'לדוגמה: ביצים מקושקשות, לחם מחיטה מלאה, קפה...'
      },
      {
        id:'n_wd_snack1',
        text:'יום חול — ביניים (לפני הצהריים)',
        hint:'אם לא אוכל ביניים, כתוב "לא".',
        type:'text', placeholder:'לדוגמה: יוגורט ופרי, או "לא"'
      },
      {
        id:'n_wd_lunch',
        text:'יום חול — ארוחת צהריים',
        type:'text', placeholder:'לדוגמה: עוף עם אורז ומרק ירקות...'
      },
      {
        id:'n_wd_snack2',
        text:'יום חול — ביניים (אחה"צ)',
        type:'text', placeholder:'לדוגמה: קומץ אגוזים, קפה, או "לא"'
      },
      {
        id:'n_wd_dinner',
        text:'יום חול — ארוחת ערב',
        type:'text', placeholder:'לדוגמה: סלמון, ירקות מאודים, סלט...'
      },
      {
        id:'n_wd_before_sleep',
        text:'יום חול — לפני שינה',
        hint:'אם לא אוכל כלום לפני שינה, כתוב "לא".',
        type:'text', placeholder:'לדוגמה: שוקו חם, גבינה, או "לא"'
      },
      {
        id:'n_we_morning',
        text:'סוף שבוע — ארוחת בוקר',
        hint:'תאר מה אתה אוכל בדרך כלל בבוקר של שישי/שבת.',
        type:'text', placeholder:'לדוגמה: בראנץ\' עם ביצים, חלה, ממרחים...'
      },
      {
        id:'n_we_snack1',
        text:'סוף שבוע — ביניים',
        type:'text', placeholder:'לדוגמה: פרי, חטיף, או "לא"'
      },
      {
        id:'n_we_lunch',
        text:'סוף שבוע — ארוחת צהריים',
        type:'text', placeholder:'לדוגמה: ארוחה משפחתית, פסטה, בשר...'
      },
      {
        id:'n_we_snack2',
        text:'סוף שבוע — ביניים (אחה"צ)',
        type:'text', placeholder:'לדוגמה: עוגה, פרי, קפה, או "לא"'
      },
      {
        id:'n_we_dinner',
        text:'סוף שבוע — ארוחת ערב',
        type:'text', placeholder:'לדוגמה: גריל, סלטים, לחם...'
      },
      {
        id:'n_we_before_sleep',
        text:'סוף שבוע — לפני שינה',
        type:'text', placeholder:'לדוגמה: גלידה, שוקו, או "לא"'
      },
    ]
  },
 
  // ─── 7. תפיסת בריאות עצמית ─────────────────────────────
  {
    id: 'srh', title: 'תפיסת בריאות עצמית', en: 'Self-Rated Health',
    questions: [
      { id:'q15', text:'כיצד היית מגדיר/ה את מצבך הבריאותי?', type:'single', options:[
        {label:'מצוין',    value:'excellent'},
        {label:'טוב מאוד', value:'very_good'},
        {label:'טוב',      value:'good'},
        {label:'בינוני',   value:'fair'},
        {label:'גרוע',     value:'poor'},
      ]},
    ]
  },
 
  // ─── 8. שינה ────────────────────────────────────────────
  {
    id: 'sleep', title: 'שינה', en: 'Sleep (ISI)',
    questions: [
      { id:'q16', text:'כמה שעות שינה בלילה בממוצע?', type:'single', options:[
        {label:'מעל 7 שעות',    value:'>7'},
        {label:'5–7 שעות',     value:'5-7'},
        {label:'מתחת ל-5 שעות', value:'<5'},
      ]},
      { id:'q17', text:'אני מתקשה להירדם בלילה', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q18', text:'אני מתעורר/ת באמצע הלילה ומתקשה לחזור לישון', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q19', text:'אני מתעורר/ת מוקדם מדי בבוקר - קיצה מוקדמת', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q20', text:'אני מרוצה מדפוס השינה שלי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q21', text:'בעיות השינה שלי משפיעות לרעה על התפקוד היומיומי שלי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q22', text:'אחרים מבחינים בבעיות השינה שלי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q23', text:'בעיות השינה מטרידות אותי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
    ]
  },
 
  // ─── 9. יציבות צירקדיאנית ──────────────────────────────
  {
    id: 'circadian', title: 'יציבות צירקדיאנית', en: 'Circadian Stability',
    questions: [
      { id:'q24', text:'כמה טיסות בינלאומיות (עם הפרש שעות) ביצעת בשנה האחרונה?', type:'single', options:[
        {label:'0–4 טיסות',  value:'0-4'},
        {label:'5–9 טיסות',  value:'5-9'},
        {label:'10+ טיסות',  value:'10+'},
      ]},
      { id:'q25', text:'האם אתה עובד במשמרות לילה?', type:'single', options:[
        {label:'לא',value:'no'},{label:'כן',value:'yes'},
      ]},
      { id:'q26', text:'שעות השינה והיקיצה שלי זהות בין ימי חול לסוף שבוע', type:'single', options:[
        {label:'כן, זהות לחלוטין',   value:'same'},
        {label:'הפרש של עד שעה',     value:'1h'},
        {label:'הפרש של 1–2 שעות',   value:'1-2h'},
        {label:'הפרש של מעל 2 שעות', value:'>2h'},
      ]},
      { id:'q27', text:'כמה זמן לפני השינה אני מפסיק להשתמש במסכים?', type:'single', options:[
        {label:'יותר משעתיים לפני השינה', value:'>2h'},
        {label:'שעה עד שעתיים לפני',      value:'1-2h'},
        {label:'חצי שעה עד שעה לפני',     value:'30m-1h'},
        {label:'עד חצי שעה לפני',         value:'<30m'},
        {label:'עד הרגע שנרדמתי',         value:'none'},
      ]},
    ]
  },
 
  // ─── 10. איכות חיים ולחץ ───────────────────────────────
  {
    id: 'qol_stress', title: 'איכות חיים ולחץ', en: 'Quality of Life & Stress (PSS-10)',
    questions: [
      { id:'q28', text:'באופן כללי, איכות חיי היא:', type:'single', options:[
        {label:'מצוינת',    value:'excellent'},
        {label:'טובה מאוד', value:'very_good'},
        {label:'טובה',      value:'good'},
        {label:'בינונית',   value:'fair'},
        {label:'גרועה',     value:'poor'},
      ]},
      { id:'q29', text:'אני מרגיש שאיני שולט בדברים החשובים בחיי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q30', text:'אני מרגיש ביטחון ביכולתי לטפל בבעיות האישיות שלי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q31', text:'הדברים מתנהלים כרצוני', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q32', text:'אני מרגיש שהקשיים נערמים עד שאיני יכול להתגבר עליהם', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q33', text:'אני מרגיש עצבני ולחוץ', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q34', text:'אני מתמודד ביעילות עם שינויים חשובים בחיי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q35', text:'אני מצליח לשלוט במצבים שמעוררים בי כעס', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q36', text:'אני מרגיש שאיני מסוגל להתמודד עם כל המשימות המוטלות עלי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q37', text:'אני מרגיש כעס על דברים שקרו ומחוץ לשליטתי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q38', text:'אני מרגיש שאני שולט במצבים בחיי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
    ]
  },
 
  // ─── 11. חיי חברה ──────────────────────────────────────
  {
    id: 'social', title: 'חיי חברה', en: 'Social Life',
    questions: [
      {
        id:'qs1',
        text:'כמה חברים קרובים יש לך? (אנשים שתוכל לפנות אליהם בעת קושי)',
        type:'single', options:[
          {label:'אין / כמעט אין',  value:'0'},
          {label:'1–2',             value:'1-2'},
          {label:'3–5',             value:'3-5'},
          {label:'6 ומעלה',         value:'6+'},
        ]
      },
      {
        id:'qs2',
        text:'כמה פעמים בשבוע אתה נפגש / מדבר עם חברים או משפחה?',
        hint:'פגישה פיזית או שיחה משמעותית — לא כולל הודעות קצרות.',
        type:'single', options:[
          {label:'כמעט לא',          value:'rarely'},
          {label:'פעם בשבוע',        value:'once'},
          {label:'2–3 פעמים בשבוע',  value:'2-3'},
          {label:'כל יום',           value:'daily'},
        ]
      },
      {
        id:'qs3',
        text:'האם אתה מרגיש שיש לך תמיכה חברתית מספקת?',
        type:'single', options:[
          {label:'כן, הרבה תמיכה',           value:'high'},
          {label:'בינוני — יש אבל לא מספיק', value:'medium'},
          {label:'לא, אני מרגיש בדידות',     value:'low'},
        ]
      },
    ]
  },
 
  // ─── 12. מיינדפולנס ─────────────────────────────────────
  {
    id: 'mindfulness', title: 'מיינדפולנס ורוגע', en: 'Mindfulness & Recovery',
    questions: [
      {
        id:'qmf1',
        text:'האם אתה מתרגל פעילויות מיינדפולנס / הרפיה?',
        hint:'מדיטציה, נשימות מודעות, יוגה מדיטטיבית, תפילה מרגיעה, סקן גוף וכו\'.',
        type:'single', options:[
          {label:'לא',                         value:'never'},
          {label:'לפעמים (פחות מפעם בשבוע)',    value:'rarely'},
          {label:'כמה פעמים בשבוע',            value:'sometimes'},
          {label:'כל יום',                     value:'daily'},
        ]
      },
      {
        id:'qmf2',
        text:'כמה דקות בממוצע לכל פעילות מיינדפולנס?',
        type:'single',
        showIf:{ id:'qmf1', values:['rarely','sometimes','daily'] },
        options:[
          {label:'עד 5 דקות',   value:'<5'},
          {label:'5–15 דקות',  value:'5-15'},
          {label:'15–30 דקות', value:'15-30'},
          {label:'מעל 30 דקות',value:'>30'},
        ]
      },
    ]
  },
 
  // ─── 13. קוגניציה ושפות ─────────────────────────────────
  {
    id: 'cognition', title: 'קוגניציה ולמידה', en: 'Cognition & Learning',
    questions: [
      {
        id:'qc1',
        text:'כמה שפות אתה דובר ברמה שוטפת?',
        hint:'שפה שוטפת = מסוגל לנהל שיחה מורכבת.',
        type:'single', options:[
          {label:'שפה אחת',  value:'1'},
          {label:'שתי שפות', value:'2'},
          {label:'שלוש שפות',value:'3'},
          {label:'ארבע+',    value:'4+'},
        ]
      },
      {
        id:'qc2',
        text:'האם אתה לומד משהו חדש באופן פעיל? (קורס, כלי נגינה, שפה, תחביב)',
        type:'single', options:[
          {label:'לא',                 value:'no'},
          {label:'לפעמים, לא בקביעות', value:'sometimes'},
          {label:'כן, באופן קבוע',     value:'yes'},
        ]
      },
    ]
  },
 
  // ─── 14. ציפיות ומטרות ──────────────────────────────────
  {
    id: 'expectations', title: 'ציפיות ומטרות', en: 'Expectations & Goals',
    questions: [
      {
        id:'qe1',
        text:'מה המטרה העיקרית שלך מהתהליך עם TOMORROW?',
        type:'multi', options:[
          {label:'שיפור הבריאות הכללית',    value:'general_health'},
          {label:'ירידה במשקל',             value:'weight_loss'},
          {label:'שיפור רמת האנרגיה',        value:'energy'},
          {label:'שיפור שינה',              value:'sleep'},
          {label:'הפחתת לחץ ועייפות נפשית',  value:'stress'},
          {label:'שיפור ביצועים ספורטיביים',  value:'performance'},
          {label:'מניעת מחלות / אריכות ימים', value:'longevity'},
          {label:'אחר',                     value:'other'},
        ]
      },
      {
        id:'qe2',
        text:'מה הכי מפריע לך לאורח חיים בריא כרגע?',
        type:'multi', options:[
          {label:'חוסר זמן',             value:'time'},
          {label:'חוסר מוטיבציה',        value:'motivation'},
          {label:'עלות',                 value:'cost'},
          {label:'לחץ / עומס בעבודה',    value:'work_stress'},
          {label:'בעיות בריאות',         value:'health_issues'},
          {label:'קושי לבצע שינויים',    value:'change'},
          {label:'אין מכשולים מיוחדים',  value:'none'},
        ]
      },
      {
        id:'qe3',
        text:'באיזה טווח זמן אתה מצפה לראות שינוי משמעותי?',
        type:'single', options:[
          {label:'חודש',       value:'1m'},
          {label:'3 חודשים',   value:'3m'},
          {label:'חצי שנה',    value:'6m'},
          {label:'שנה ומעלה',  value:'1y+'},
        ]
      },
    ]
  },
 
  // ─── 15. בריאות האישה (מוצג רק לנשים) ──────────────────
  // הסקציה מסוננת ב-QuestionnairePage לפי gender === 'female'
  {
    id: 'womens_health', title: 'בריאות האישה', en: "Women's Health",
    questions: [
 
      // ── א. בסיס — כולן ────────────────────────────────────
 
      {
        id:'wh_menstrual_status',
        text:'מה מצב המחזור החודשי שלך כיום?',
        hint:'בחרי את האפשרות שמתארת אותך הכי טוב.',
        type:'single', options:[
          {label:'יש לי מחזור סדיר ורגיל',                          value:'regular'},
          {label:'יש לי מחזור אך הוא לא סדיר',                     value:'irregular'},
          {label:'אין לי מחזור בגלל התקן הורמונלי / גלולות',        value:'no_period_hormonal'},
          {label:'המחזור השתנה / נעשה לא סדיר בשנים האחרונות',       value:'perimenopause'},
          {label:'המחזור הפסיק לחלוטין (יותר מ-12 חודש)',            value:'menopause'},
          {label:'אין לי מחזור מסיבה אחרת',                        value:'amenorrhea'},
        ]
      },
 
      {
        id:'wh_gyneco_history',
        text:'האם אובחנת באחד מהמצבים הגינקולוגיים הבאים?',
        type:'multi', options:[
          {label:'PCOS (תסמונת שחלות פוליציסטיות)',   value:'pcos'},
          {label:'אנדומטריוזיס',                      value:'endo'},
          {label:'פיברומיומות (שרירנים)',              value:'fibroids'},
          {label:'ציסטות שחלה',                       value:'cysts'},
          {label:'אי-סדירות הורמונלית אחרת',          value:'hormonal'},
          {label:'לא אובחנתי באף מהנ"ל',              value:'none'},
        ]
      },
 
      {
        id:'wh_hormonal_meds',
        text:'האם את נוטלת / נטלת בעבר תרופות הורמונליות?',
        type:'multi', options:[
          {label:'גלולות למניעת הריון (כיום)',         value:'pill_current'},
          {label:'גלולות בעבר (לא כיום)',              value:'pill_past'},
          {label:'התקן הורמונלי (מירנה וכד\')',        value:'iud_hormonal'},
          {label:'טיפול הורמונלי חלופי HRT (כיום)',    value:'hrt_current'},
          {label:'טיפול הורמונלי חלופי HRT (בעבר)',    value:'hrt_past'},
          {label:'לא נטלתי',                           value:'none'},
        ]
      },
 
      {
        id:'wh_clotting',
        text:'האם יש לך היסטוריה של בעיות קרישה?',
        hint:'רלוונטי במיוחד לנשים הנוטלות הורמונים.',
        type:'multi', options:[
          {label:'קריש דם בורידים (DVT)',              value:'dvt'},
          {label:'תסחיף ריאתי (PE)',                   value:'pe'},
          {label:'בעיית קרישה גנטית (Factor V וכד\')', value:'genetic'},
          {label:'הפלות חוזרות (3 ומעלה)',             value:'recurrent_loss'},
          {label:'אין היסטוריה ידועה',                 value:'none'},
        ]
      },
 
      {
        id:'wh_screening',
        text:'מתי בוצעו בדיקות הסקר האחרונות שלך?',
        hint:'סמני את כל הרלוונטי.',
        type:'multi', options:[
          {label:'ממוגרפיה — עד שנה',                  value:'mammo_1y'},
          {label:'ממוגרפיה — 1–3 שנים',                value:'mammo_3y'},
          {label:'ממוגרפיה — מעל 3 שנים / לא בוצע',    value:'mammo_none'},
          {label:'פאפ סמיר — עד שנה',                  value:'pap_1y'},
          {label:'פאפ סמיר — 1–3 שנים',                value:'pap_3y'},
          {label:'פאפ סמיר — מעל 3 שנים / לא בוצע',    value:'pap_none'},
          {label:'DEXA (צפיפות עצם) — בוצע',           value:'dexa_done'},
          {label:'DEXA — לא בוצע',                     value:'dexa_none'},
        ]
      },
 
      // ── ב. שנות הפוריות — גיל 18–45 ──────────────────────
      // מסוננות ב-QuestionnairePage לפי age <= 45
 
      {
        id:'wh_pregnancy_history',
        text:'היסטוריית הריון',
        hint:'גיל 18–45',
        type:'single', options:[
          {label:'מעולם לא הייתי בהריון',              value:'never'},
          {label:'הריון אחד או יותר שהסתיים בלידה',    value:'birth'},
          {label:'הפלה אחת או יותר (ספונטנית)',        value:'miscarriage'},
          {label:'הפלה מלאכותית',                      value:'termination'},
          {label:'שילוב של האמור לעיל',                value:'mixed'},
        ]
      },
 
      {
        id:'wh_fertility',
        text:'האם נתקלת בקשיי פוריות?',
        hint:'גיל 18–45',
        type:'single', options:[
          {label:'לא ניסיתי להרות',                    value:'not_trying'},
          {label:'ניסיתי והרתי ללא קושי',              value:'no_issue'},
          {label:'קשיי פוריות — מטופלת / מטופלת בעבר', value:'treated'},
          {label:'קשיי פוריות — לא מטופלת',            value:'untreated'},
        ]
      },
 
      {
        id:'wh_period_pain',
        text:'כיצד תתארי את הכאב במהלך המחזור?',
        hint:'גיל 18–45',
        type:'single', options:[
          {label:'ללא כאב',                            value:'none'},
          {label:'כאב קל — לא מפריע לתפקוד',          value:'mild'},
          {label:'כאב בינוני — לוקחת משככי כאבים',     value:'moderate'},
          {label:'כאב חמור — מפריע לתפקוד היומיומי',   value:'severe'},
        ]
      },
 
      {
        id:'wh_bleeding',
        text:'כמות הדימום במחזור',
        hint:'גיל 18–45',
        type:'single', options:[
          {label:'קל',     value:'light'},
          {label:'בינוני', value:'moderate'},
          {label:'כבד',    value:'heavy'},
          {label:'משתנה',  value:'variable'},
        ]
      },
 
      // ── ג. פרי-מנופאוזה — גיל 45–55 ──────────────────────
 
      {
        id:'wh_meno_symptoms',
        text:'אילו תסמיני גיל המעבר את חווה?',
        hint:'גיל 45–55',
        type:'multi', options:[
          {label:'גלי חום',                            value:'hot_flashes'},
          {label:'הזעות לילה',                         value:'night_sweats'},
          {label:'שינויים במצב רוח / עצבנות',          value:'mood'},
          {label:'קשיי שינה',                          value:'sleep'},
          {label:'יובש בנרתיק / כאב ביחסים',          value:'vaginal_dry'},
          {label:'ירידה בחשק המיני',                   value:'libido'},
          {label:'ערפל מוחי / קשיי ריכוז',             value:'brain_fog'},
          {label:'אינני חווה תסמינים',                  value:'none'},
        ]
      },
 
      {
        id:'wh_cycle_changes',
        text:'כיצד השתנה המחזור בשנה האחרונה?',
        hint:'גיל 45–55',
        type:'single', options:[
          {label:'לא השתנה',                           value:'same'},
          {label:'הפך לא סדיר',                        value:'irregular'},
          {label:'דימום כבד יותר',                     value:'heavier'},
          {label:'דימום קל יותר / נדיר',               value:'lighter'},
          {label:'הפסיק לחלוטין (מעל 12 חודש)',        value:'stopped'},
        ]
      },
 
      // ── ד. פוסט-מנופאוזה — גיל 55+ ───────────────────────
 
      {
        id:'wh_years_since_meno',
        text:'כמה שנים עברו מאז הפסקת המחזור?',
        hint:'גיל 55+',
        type:'single', options:[
          {label:'פחות משנה',    value:'<1'},
          {label:'1–5 שנים',    value:'1-5'},
          {label:'5–10 שנים',   value:'5-10'},
          {label:'מעל 10 שנים', value:'>10'},
        ]
      },
 
      {
        id:'wh_osteo_symptoms',
        text:'האם חווית אחד מהבאים?',
        hint:'גיל 55+ — סימני אוסטאופורוזיס',
        type:'multi', options:[
          {label:'שבר מעצם שברירית (מנפילה קלה)',       value:'fracture'},
          {label:'כאבי גב תחתון / עמוד שדרה',          value:'back_pain'},
          {label:'ירידה בגובה (יותר מס"מ אחד)',         value:'height_loss'},
          {label:'אינני חווה אף מהנ"ל',                 value:'none'},
        ]
      },
 
      {
        id:'wh_cardio_risk',
        text:'האם הרופא/ה ציין/ה סיכון קרדיו-מטבולי מוגבר לאחר גיל המעבר?',
        hint:'גיל 55+ — הסיכון לב וכלי דם עולה לאחר מנופאוזה',
        type:'single', options:[
          {label:'כן, ניתן ייעוץ / טיפול',             value:'yes_treated'},
          {label:'כן, אך לא טופלתי',                   value:'yes_untreated'},
          {label:'לא צוין',                            value:'no'},
          {label:'לא יודעת',                           value:'unknown'},
        ]
      },
 
    ]
  },
]
 
