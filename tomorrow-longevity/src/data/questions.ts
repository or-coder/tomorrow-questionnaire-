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
          {label:'כן, ולחץ הדם מאוזן',      value:'treated_ok'},
          {label:'כן, אך לחץ הדם לא מאוזן', value:'treated_uncontrolled'},
          {label:'לא',                      value:'no'},
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
    // FIX 1+2: הסבר ברור + hint מפורט לכל שאלה
    id: 'activity', title: 'פעילות גופנית', en: 'Physical Activity (IPAQ)',
    questions: [
      {
        id:'q1',
        text:'כמה ימים בשבוע ביצעת פעילות מאומצת?',
        hint:'פעילות מאומצת = נשימה כבדה ומאמץ גדול. לדוגמה: ריצה, שחייה מהירה, אופניים בעלייה, אימון כושר אינטנסיבי (HIIT), כדורסל, כדורגל.',
        type:'number', min:0, max:7, placeholder:'מספר ימים (0–7)'
      },
      {
        id:'q2',
        text:'כמה דקות סך הכל בשבוע (פעילות מאומצת)?',
        hint:'לדוגמה: רצת 30 דקות פעמיים השבוע = 60 דקות סך הכל.',
        type:'number', min:0, max:2000, placeholder:'דקות בשבוע'
      },
      {
        id:'q3',
        text:'כמה ימים בשבוע ביצעת פעילות מתונה?',
        hint:'פעילות מתונה = מאמץ בינוני, נשימה מעט מהירה אך אפשר לדבר. לדוגמה: הליכה מהירה, יוגה, פילאטס, אופניים בשטח שטוח, שחייה רגועה.',
        type:'number', min:0, max:7, placeholder:'מספר ימים (0–7)'
      },
      {
        id:'q4',
        text:'כמה דקות סך הכל בשבוע (פעילות מתונה)?',
        hint:'לדוגמה: הלכת 45 דקות שלוש פעמים = 135 דקות סך הכל.',
        type:'number', min:0, max:2000, placeholder:'דקות בשבוע'
      },
      {
        id:'q5',
        text:'כמה ימים בשבוע הלכת לפחות 10 דקות ברצף?',
        hint:'כולל הליכה לעבודה, קניות, טיול — כל עוד היה לפחות 10 דקות רצופות.',
        type:'number', min:0, max:7, placeholder:'מספר ימים (0–7)'
      },
      {
        id:'q6',
        text:'כמה דקות סך הכל בשבוע הלכת?',
        type:'number', min:0, max:2000, placeholder:'דקות בשבוע'
      },
    ]
  },
  {
    id: 'health_behaviors', title: 'התנהגויות בריאות', en: 'Health Behaviors',
    questions: [
      { id:'q7', text:'סטטוס עישון', type:'single', options:[
        {label:'מעולם לא עישנתי',       value:'never'},
        {label:'עישנתי בעבר, הפסקתי',  value:'former'},
        {label:'מעשן/ת כיום',           value:'current'},
      ]},
      {
        // FIX 3: ציון מפורש שמדובר באלכוהול
        id:'q8',
        text:'צריכת אלכוהול — האם אתה שותה יותר מהמומלץ?',
        hint:'גברים: יותר מ-2 משקאות ביום (או 14 בשבוע). נשים: יותר מ-1 משקה ביום (או 7 בשבוע). משקה = כוס יין, פחית בירה, או שוט.',
        type:'single', options:[
          {label:'לא, בתוך הגבולות המומלצים', value:'no'},
          {label:'כן, שותה יותר מהמומלץ',     value:'yes'},
        ]
      },
    ]
  },
  {
    id: 'anthropometry', title: 'מדדים אנתרופומטריים', en: 'Anthropometric Measures (BMI)',
    questions: [
      { id:'q9',  text:'משקל בק"ג',  type:'number', min:30,  max:300, placeholder:'לדוגמה: 75' },
      { id:'q10', text:'גובה בס"מ',  type:'number', min:100, max:250, placeholder:'לדוגמה: 175' },
    ]
  },
  {
    id: 'nutrition', title: 'תזונה', en: 'Nutrition (24h Recall)',
    questions: [
      { id:'q11', text:'כמה ארוחות ביום?', type:'single', options:[
        {label:'1–2',value:'1-2'},{label:'3–4',value:'3-4'},{label:'5 ומעלה',value:'5+'}
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
      { id:'q16', text:'כמה שעות שינה בלילה בממוצע?', type:'single', options:[
        {label:'מעל 7 שעות',       value:'>7'},
        {label:'5–7 שעות',        value:'5-7'},
        {label:'מתחת ל-5 שעות',    value:'<5'},
      ]},
      // FIX 5+6: סקאלות מסכים/לא מסכים, הצד "הבריא" תמיד שמאל (0)
      { id:'q17', text:'אני מתקשה להירדם בלילה', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q18', text:'אני מתעורר/ת באמצע הלילה ומתקשה לחזור לישון', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q19', text:'אני מתעורר/ת מוקדם מדי בבוקר', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q20', text:'אני מרוצה מדפוס השינה שלי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q21', text:'בעיות השינה שלי משפיעות לרעה על התפקוד היומיומי שלי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q22', text:'אחרים מבחינים בבעיות השינה שלי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
      { id:'q23', text:'בעיות השינה שלי מדאיגות אותי', type:'scale', min:0, max:4,
        scaleLabels:{ min:'לא מסכים כלל', max:'מסכים מאוד' } },
    ]
  },
  {
    id: 'circadian', title: 'יציבות צירקדיאנית', en: 'Circadian Stability',
    questions: [
      { id:'q24', text:'כמה טיסות בינלאומיות (עם הפרש שעות) ביצעת בשנה האחרונה?', type:'single', options:[
        {label:'0–4 טיסות',    value:'0-4'},
        {label:'5–9 טיסות',   value:'5-9'},
        {label:'10+ טיסות',   value:'10+'},
      ]},
      { id:'q25', text:'האם אתה עובד במשמרות לילה?', type:'single', options:[
        {label:'לא',value:'no'},{label:'כן',value:'yes'},
      ]},
      { id:'q26', text:'שעות השינה והיקיצה שלי זהות בין ימי חול לסוף שבוע', type:'single', options:[
        {label:'כן, זהות לחלוטין',    value:'same'},
        {label:'הפרש של עד שעה',      value:'1h'},
        {label:'הפרש של 1–2 שעות',    value:'1-2h'},
        {label:'הפרש של מעל 2 שעות',  value:'>2h'},
      ]},
      { id:'q27', text:'כמה זמן לפני השינה אני מפסיק להשתמש במסכים (טלפון, מחשב, טלוויזיה)?', type:'single', options:[
        {label:'יותר משעתיים לפני השינה',  value:'>2h'},
        {label:'שעה עד שעתיים לפני',       value:'1-2h'},
        {label:'חצי שעה עד שעה לפני',      value:'30m-1h'},
        {label:'עד חצי שעה לפני',          value:'<30m'},
        {label:'עד הרגע שנרדמתי',          value:'none'},
      ]},
    ]
  },
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
      // FIX 5+6: PSS-10 — ניסוח "אני מרגיש..." + סקאלה אחידה
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
]
