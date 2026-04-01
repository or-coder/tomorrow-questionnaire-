export interface Option  { label: string; value: string }
export interface Question {
  id: string; text: string; hint?: string
  type: 'number' | 'single' | 'multi' | 'scale'
  options?: Option[]; min?: number; max?: number; placeholder?: string
  scaleLabels?: { min: string; max: string }
  showIf?: { id: string; values: string[] }
}
export interface Section { id: string; title: string; en: string; questions: Question[] }

export const SECTIONS: Section[] = [
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
  {
    id: 'bp_digest', title: 'לחץ דם ועיכול', en: 'Blood Pressure & Digestion',
    questions: [
      { id:'qb1', text:'מה לחץ הדם הסיסטולי שלך (המספר העליון)?', type:'single',
        options:[
          {label:'תקין — מתחת ל-120',   value:'<120'},
          {label:'גבוה מעט — 120–139',  value:'120-139'},
          {label:'גבוה — 140–159',      value:'140-159'},
          {label:'גבוה מאוד — 160+',    value:'160+'},
          {label:'לא יודע / לא נמדד',   value:'unknown'},
        ]},
      { id:'qb2', text:'האם אתה מטופל בתרופות ללחץ דם?', type:'single',
        options:[
          {label:'כן, ולחץ הדם מאוזן',     value:'treated_ok'},
          {label:'כן, אך לחץ הדם לא מאוזן',value:'treated_uncontrolled'},
          {label:'לא',                     value:'no'},
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
  {
    id: 'activity', title: 'פעילות גופנית', en: 'Physical Activity (IPAQ)',
    questions: [
      { id:'q1', text:'ב-7 הימים האחרונים, כמה ימים פעילות מאומצת?', type:'number', min:0, max:7, placeholder:'0–7 ימים' },
      { id:'q2', text:'כמה דקות בשבוע (מאומצת)?', type:'number', min:0, max:2000, placeholder:'דקות' },
      { id:'q3', text:'ב-7 הימים האחרונים, כמה ימים פעילות מתונה?', type:'number', min:0, max:7, placeholder:'0–7 ימים' },
      { id:'q4', text:'כמה דקות בשבוע (מתונה)?', type:'number', min:0, max:2000, placeholder:'דקות' },
      { id:'q5', text:'ב-7 הימים האחרונים, כמה ימים הלכת?', type:'number', min:0, max:7, placeholder:'0–7 ימים' },
      { id:'q6', text:'כמה דקות בשבוע (הליכה)?', type:'number', min:0, max:2000, placeholder:'דקות' },
    ]
  },
  {
    id: 'health_behaviors', title: 'התנהגויות בריאות', en: 'Health Behaviors',
    questions: [
      { id:'q7', text:'סטטוס עישון', type:'single', options:[
        {label:'מעולם לא עישנתי',       value:'never'},
        {label:'עישנתי בעבר ← הפסקתי', value:'former'},
        {label:'מעשן/ת כיום',           value:'current'},
      ]},
      { id:'q8', text:'האם שותה יותר מ-2 משקאות ביום (גברים) / מעל 1 (נשים)?', type:'single',
        options:[{label:'כן', value:'yes'},{label:'לא', value:'no'}]},
    ]
  },
  {
    id: 'anthropometry', title: 'מדדים אנתרופומטריים', en: 'Anthropometric Measures (BMI)',
    questions: [
      { id:'q9',  text:'משקל בק"ג',  type:'number', min:30,  max:300, placeholder:'ק"ג' },
      { id:'q10', text:'גובה בס"מ',  type:'number', min:100, max:250, placeholder:'ס"מ' },
    ]
  },
  {
    id: 'nutrition', title: 'תזונה', en: 'Nutrition (24h Recall)',
    questions: [
      { id:'q11', text:'כמה ארוחות ביום?', type:'single', options:[
        {label:'1–2',value:'1-2'},{label:'3–4',value:'3-4'},{label:'5+',value:'5+'}
      ]},
      { id:'q12', text:'כמה גרם חלבון ביום (בערך)?', type:'number', min:0, max:500, placeholder:'גרם',
        hint:'חזה עוף 150ג׳ ≈ 45ג׳ | ביצה ≈ 6ג׳ | קוטג׳ ≈ 15ג׳' },
      { id:'q13', text:'כמה גרם שומן בריא ביום?', type:'number', min:0, max:300, placeholder:'גרם',
        hint:'כף שמן זית ≈ 14ג׳ | חצי אבוקדו ≈ 15ג׳ | קומץ אגוזים ≈ 14ג׳' },
      { id:'q14', text:'כמה גרם פחמימות מורכבות ביום?', type:'number', min:0, max:800, placeholder:'גרם',
        hint:'אורז מלא, קינואה, לחם מלא, בטטה. כוס אורז מבושל ≈ 45ג׳' },
    ]
  },
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
  {
    id: 'sleep', title: 'שינה', en: 'Sleep (ISI)',
    questions: [
      { id:'q16', text:'כמה שעות שינה בלילה?', type:'single', options:[
        {label:'מעל 7 שעות',       value:'>7'},
        {label:'5–7 שעות',        value:'5-7'},
        {label:'מתחת ל-5 שעות',    value:'<5'},
      ]},
      { id:'q17', text:'קושי להירדם',             type:'scale', min:0, max:4, scaleLabels:{min:'אין כלל', max:'חמור מאוד'} },
      { id:'q18', text:'קושי להישאר ישן/ה',        type:'scale', min:0, max:4, scaleLabels:{min:'אין כלל', max:'חמור מאוד'} },
      { id:'q19', text:'יקיצה מוקדמת',             type:'scale', min:0, max:4, scaleLabels:{min:'אין כלל', max:'חמור מאוד'} },
      { id:'q20', text:'שביעות רצון מהשינה',       type:'scale', min:0, max:4, scaleLabels:{min:'מאוד מרוצה', max:'מאוד לא מרוצה'} },
      { id:'q21', text:'הפרעה לתפקוד יומיומי',     type:'scale', min:0, max:4, scaleLabels:{min:'אין כלל', max:'חמור מאוד'} },
      { id:'q22', text:'האם אחרים מבחינים?',        type:'scale', min:0, max:4, scaleLabels:{min:'אין כלל', max:'חמור מאוד'} },
      { id:'q23', text:'מידת הדאגה מהשינה',         type:'scale', min:0, max:4, scaleLabels:{min:'אין כלל', max:'חמור מאוד'} },
    ]
  },
  {
    id: 'circadian', title: 'יציבות צירקדיאנית', en: 'Circadian Stability',
    questions: [
      { id:'q24', text:'כמה טיסות בינלאומיות בשנה?', type:'single', options:[
        {label:'0–4',value:'0-4'},{label:'5–9',value:'5-9'},{label:'10+',value:'10+'}
      ]},
      { id:'q25', text:'עבודה במשמרות?', type:'single', options:[
        {label:'כן',value:'yes'},{label:'לא',value:'no'}
      ]},
      { id:'q26', text:'אחידות שעות שינה (ימי שבוע vs. סוף שבוע)?', type:'single', options:[
        {label:'זהות',                value:'same'},
        {label:'שינוי שעה',           value:'1h'},
        {label:'שינוי 1–2 שעות',      value:'1-2h'},
        {label:'שינוי מעל 2 שעות',    value:'>2h'},
      ]},
      { id:'q27', text:'זמן הפסקת מסכים לפני שינה?', type:'single', options:[
        {label:'יותר משעתיים',         value:'>2h'},
        {label:'שעה–שעתיים',          value:'1-2h'},
        {label:'30 דקות–שעה',         value:'30m-1h'},
        {label:'עד 30 דקות',          value:'<30m'},
        {label:'עד הרגע שנרדמתי',     value:'none'},
      ]},
    ]
  },
  {
    id: 'qol_stress', title: 'איכות חיים ולחץ', en: 'Quality of Life & Stress (PSS-10)',
    questions: [
      { id:'q28', text:'איכות חיים כוללת', type:'single', options:[
        {label:'מצוינת',value:'excellent'},{label:'טובה מאוד',value:'very_good'},
        {label:'טובה',value:'good'},{label:'בינונית',value:'fair'},{label:'גרועה',value:'poor'},
      ]},
      { id:'q29', text:'לא יכולת לשלוט בדברים חשובים?',         type:'scale', min:0, max:4, scaleLabels:{min:'לעולם לא', max:'לעיתים קרובות מאוד'} },
      { id:'q30', text:'הרגשת ביטחון בטיפול בבעיות? ↩',          type:'scale', min:0, max:4, scaleLabels:{min:'לעולם לא', max:'לעיתים קרובות מאוד'} },
      { id:'q31', text:'הרגשת שדברים מתנהלים כרצונך? ↩',         type:'scale', min:0, max:4, scaleLabels:{min:'לעולם לא', max:'לעיתים קרובות מאוד'} },
      { id:'q32', text:'הרגשת שקשיים נערמים?',                    type:'scale', min:0, max:4, scaleLabels:{min:'לעולם לא', max:'לעיתים קרובות מאוד'} },
      { id:'q33', text:'הרגשת עצבני/לחוץ?',                       type:'scale', min:0, max:4, scaleLabels:{min:'לעולם לא', max:'לעיתים קרובות מאוד'} },
      { id:'q34', text:'התמודדת ביעילות עם שינויים? ↩',            type:'scale', min:0, max:4, scaleLabels:{min:'לעולם לא', max:'לעיתים קרובות מאוד'} },
      { id:'q35', text:'שלטת במצבים של כעס? ↩',                   type:'scale', min:0, max:4, scaleLabels:{min:'לעולם לא', max:'לעיתים קרובות מאוד'} },
      { id:'q36', text:'לא יכולת להתמודד עם כל המשימות?',          type:'scale', min:0, max:4, scaleLabels:{min:'לעולם לא', max:'לעיתים קרובות מאוד'} },
      { id:'q37', text:'כעסת על דברים מחוץ לשליטתך?',             type:'scale', min:0, max:4, scaleLabels:{min:'לעולם לא', max:'לעיתים קרובות מאוד'} },
      { id:'q38', text:'הרגשת שאתה שולט במצבים? ↩',               type:'scale', min:0, max:4, scaleLabels:{min:'לעולם לא', max:'לעיתים קרובות מאוד'} },
    ]
  },
]
