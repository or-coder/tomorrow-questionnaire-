-- Create submissions table
create table if not exists public.submissions (
  id                    uuid default gen_random_uuid() primary key,
  created_at            timestamptz default now(),
  name                  text not null,
  age                   text,
  gender                text,
  answers               jsonb,

  -- Domain scores
  score_activity        integer,
  score_health_behaviors integer,
  score_bmi             integer,
  score_nutrition       integer,
  score_srh             integer,
  score_sleep           integer,
  score_circadian       integer,
  score_qol             integer,
  score_stress          integer,
  score_composite       integer,

  -- Computed values
  bmi_value             numeric(5,2),
  isi_total             integer,
  pss_total             integer,
  met_total             integer,

  -- Clinical output
  flags                 jsonb default '[]',
  ai_insights           text,
  status                text default 'processing',

  -- New medical fields
  bp_systolic           text,
  bp_treated            text,
  digestion_symptoms    jsonb,
  digestion_frequency   text,
  family_history        jsonb,
  medications           text,
  prior_diagnoses       jsonb
);

-- Enable Row Level Security
alter table public.submissions enable row level security;

-- Allow inserts from anon (client-side submission)
create policy "Allow anon insert"
  on public.submissions for insert
  to anon with check (true);

-- Allow service role full access (Edge Functions)
create policy "Service role full access"
  on public.submissions for all
  to service_role using (true);

-- Allow reading own submission by id (for report page)
create policy "Allow read by id"
  on public.submissions for select
  to anon using (true);
