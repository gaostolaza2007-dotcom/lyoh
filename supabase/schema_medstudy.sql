-- ===========================================================================
-- MedStudy - Esquema Completo para Producción en Supabase (PostgreSQL)
-- Compatible con Códigos de Participante, Panel de Administrador y RLS Estricto
-- ===========================================================================

-- 1. EXTENSIÓN PARA GENERACIÓN DE UUID
create extension if not exists "pgcrypto";

-- ===========================================================================
-- 2. TABLA DE USUARIOS Y PARTICIPANTES
-- ===========================================================================
create table if not exists public.users (
  id                    uuid default gen_random_uuid() primary key,
  participant_code      text unique,
  email                 text unique,
  password_hash         text,
  salt                  text,
  account_secret        text,       -- Secreto o PIN de seguridad del participante
  nickname              text not null,
  university            text not null,
  university_short      text default 'UDD',
  career                text not null,
  role                  text not null default 'student' check (role in ('student', 'admin')),
  onboarding_completed  integer default 1,
  xp                    integer default 0 check (xp >= 0),
  streak_days           integer default 0 check (streak_days >= 0),
  longest_streak        integer default 0 check (longest_streak >= 0),
  last_study_date       date,
  created_at            timestamptz default now() not null,
  updated_at            timestamptz default now() not null,
  last_active_at        timestamptz default now() not null
);

create index if not exists idx_users_participant_code on public.users(participant_code);
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);

-- ===========================================================================
-- 3. TABLA DE SESIONES (Tokens seguros con expiración)
-- ===========================================================================
create table if not exists public.sessions (
  token       text primary key,
  user_id     uuid not null references public.users(id) on delete cascade,
  role        text not null check (role in ('student', 'admin')),
  expires_at  timestamptz not null,
  created_at  timestamptz default now() not null
);

create index if not exists idx_sessions_user on public.sessions(user_id);
create index if not exists idx_sessions_expires on public.sessions(expires_at);

-- ===========================================================================
-- 4. TABLA DE PROGRESO DE UNIDADES
-- ===========================================================================
create table if not exists public.unit_progress (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid not null references public.users(id) on delete cascade,
  module_id     text not null,
  unit_id       text not null,
  status        text default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  score         integer default 0 check (score between 0 and 100),
  completed_at  timestamptz,
  updated_at    timestamptz default now() not null,
  unique(user_id, module_id, unit_id)
);

create index if not exists idx_unit_progress_user on public.unit_progress(user_id);
create index if not exists idx_unit_progress_module_unit on public.unit_progress(module_id, unit_id);

-- ===========================================================================
-- 5. TABLA DE INTENTOS DE CUESTIONARIOS (EVALUACIÓN DOCENTE)
-- ===========================================================================
create table if not exists public.quiz_attempts (
  id                    uuid default gen_random_uuid() primary key,
  user_id               uuid not null references public.users(id) on delete cascade,
  module_id             text not null,
  unit_id               text not null,
  quiz_version          text default 'v1.0' not null,
  attempt_number        integer not null default 1,
  score                 integer not null check (score between 0 and 100),
  total_questions       integer not null,
  correct_count         integer not null,
  incorrect_topics_json jsonb default '[]'::jsonb,
  answers_summary_json  jsonb default '{}'::jsonb,
  duration_seconds      integer default 0,
  submission_hash       text,
  created_at            timestamptz default now() not null
);

create index if not exists idx_quiz_attempts_user_unit on public.quiz_attempts(user_id, module_id, unit_id);
create index if not exists idx_quiz_attempts_created on public.quiz_attempts(created_at desc);

-- ===========================================================================
-- 6. TABLA DE REGISTRO DE ACTIVIDADES (Lectura, visor 3D, etc.)
-- ===========================================================================
create table if not exists public.activity_logs (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid not null references public.users(id) on delete cascade,
  module_id     text not null,
  unit_id       text not null,
  activity_type text not null,
  created_at    timestamptz default now() not null
);

create index if not exists idx_activity_logs_user on public.activity_logs(user_id);

-- ===========================================================================
-- 7. TABLA DE CONTROL DE INTENTOS DE ACCESO (ANTI-BRUTEFORCE)
-- ===========================================================================
create table if not exists public.login_rate_limits (
  id              uuid default gen_random_uuid() primary key,
  key             text not null unique,       -- ej. "ip:192.168.1.1" o "code:MED-XXXX"
  attempts        integer default 1 not null,
  blocked_until   timestamptz,
  last_attempt_at timestamptz default now() not null
);

create index if not exists idx_rate_limits_key on public.login_rate_limits(key);

-- ===========================================================================
-- 8. TABLA DE RANGOS UNIVERSALES DE CIENCIAS DE LA SALUD
-- ===========================================================================
create table if not exists public.ranks (
  level       integer primary key,
  name        text not null unique,
  min_xp      integer not null,
  max_xp      integer not null,
  description text not null
);

insert into public.ranks (level, name, min_xp, max_xp, description)
values
  (1,  'Aspirante Clínico',              0,    100,  'Iniciación en las ciencias biomédicas y terminología de la salud.'),
  (2,  'Estudiante de Ciencias Básicas', 100,  250,  'Comprensión fundamental de anatomía, bioquímica y morfología.'),
  (3,  'Explorador Fisiológico',         250,  450,  'Análisis del funcionamiento sistémico, homeostático e histológico.'),
  (4,  'Analista de la Salud',           450,  700,  'Integración de mecanismos patogénicos, agentes microbianos y respuestas corporales.'),
  (5,  'Asistente Clínico',             700,  1000, 'Aplicación de conocimientos preclínicos en escenarios simulados.'),
  (6,  'Interno en Rotación',           1000, 1400, 'Práctica activa y consolidación de competencias asistenciales.'),
  (7,  'Profesional en Formación',      1400, 1900, 'Dominio avanzado de razonamiento diagnóstico y protocolos terapéuticos.'),
  (8,  'Especialista Diagnóstico',      1900, 2500, 'Resolución de casos clínicos complejos y juicio crítico interdisciplinario.'),
  (9,  'Maestro de la Salud',           2500, 3200, 'Excelencia asistencial, liderazgo en equipos y docencia médica.'),
  (10, 'Erudito Clínico',               3200, 5000, 'Cumbre del saber biomédico y sabiduría clínica integral.')
on conflict (level) do nothing;

-- ===========================================================================
-- 9. SEGURIDAD Y ROW LEVEL SECURITY (RLS)
-- ===========================================================================
-- Habilitamos RLS en todas las tablas para bloquear el acceso directo anónimo
-- por la API REST pública de Supabase. El backend de Next.js opera con
-- SUPABASE_SERVICE_ROLE_KEY validando estrictamente sesión y permisos en cada endpoint.

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.unit_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.activity_logs enable row level security;
alter table public.login_rate_limits enable row level security;
alter table public.ranks enable row level security;

-- Política de lectura pública únicamente para la tabla estática de rangos
create policy "Lectura pública de rangos" on public.ranks for select using (true);

-- ===========================================================================
-- FIN DEL ESQUEMA MEDSTUDY PARA SUPABASE
-- ===========================================================================
