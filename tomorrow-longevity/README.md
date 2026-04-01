# TOMORROW — Longevity Diagnostic System

שאלון אבחון דיגיטלי + מנוע ציונים + AI לרפואת לונג׳ביטי.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (DB + Edge Functions + Auth)
- **AI:** Claude API (claude-sonnet-4-20250514)
- **Deploy:** Vercel

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/or-coder/tomorrow-questionnaire-
cd tomorrow-questionnaire-
npm install
```

### 2. Environment Variables
צור קובץ `.env`:
```
VITE_SUPABASE_URL=https://jykbmpuqyblufdadxcts.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key
```

### 3. Supabase Migration
הרץ את ה-SQL ב-Supabase SQL Editor:
```
supabase/migrations/001_create_submissions.sql
```

### 4. Edge Function Secrets
ב-Supabase → Project Settings → Edge Functions → Secrets:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 5. Deploy Edge Function
```bash
npx supabase functions deploy process-submission
```

### 6. Run Locally
```bash
npm run dev
```

### 7. Deploy to Vercel
```bash
npx vercel
```

## Screens
- `/` — Cover page (client entry)
- `/questionnaire` — 10-section questionnaire
- `/loading` — Processing screen
- `/report/:id` — Client report with AI insights
- `/dashboard` — Doctor dashboard (password: `tomorrow2025`)

## Dashboard Password
לשינוי הסיסמה: ערוך `src/pages/DashboardPage.tsx` שורה 8.
