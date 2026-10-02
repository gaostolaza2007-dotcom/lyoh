-- ===========================================================================
-- MedStudy - Esquema Completo de Base de Datos (Supabase PostgreSQL)
-- ===========================================================================
-- Soporta:
--   ✅ Autenticación dual: OAuth Google + Correo/Contraseña
--   ✅ Onboarding obligatorio (universidad, carrera, apodo)
--   ✅ Sistema de 10 rangos universales de ciencias de la salud
--   ✅ Cálculo automático de racha de días consecutivos
--   ✅ Acumulación de XP con promoción automática de rango
--   ✅ Estado inicial estrictamente en cero para nuevos usuarios
--   ✅ Row Level Security (RLS) granular en todas las tablas
-- ===========================================================================

-- Extensión para generación de UUIDs
create extension if not exists "uuid-ossp";

-- ===========================================================================
-- 1. TABLA DE REFERENCIA: RANGOS UNIVERSALES DE CIENCIAS DE LA SALUD
-- ===========================================================================
-- Tabla estática con los 10 niveles. Se consulta para calcular el rango
-- actual del estudiante en función de su XP acumulado.

create table if not exists public.ranks (
  level       integer primary key,
  name        text    not null unique,
  min_xp      integer not null,
  max_xp      integer not null,
  description text    not null,

  constraint ranks_xp_range check (min_xp >= 0 and max_xp > min_xp)
);

-- Insertar los 10 rangos universales (idempotente con ON CONFLICT)
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

-- Lectura pública (sin escritura para usuarios normales)
alter table public.ranks enable row level security;

create policy "Lectura pública de rangos"
  on public.ranks for select
  using (true);


-- ===========================================================================
-- 2. TABLA DE PERFILES DE ESTUDIANTES
-- ===========================================================================
-- Se crea automáticamente al registrarse un usuario en auth.users
-- (vía Google OAuth o correo/contraseña). Vinculada 1:1 con auth.users.

create table if not exists public.profiles (
  -- Clave primaria = auth.users.id (UUID del proveedor Supabase Auth)
  id                    uuid references auth.users on delete cascade primary key,

  -- Datos de identidad (poblados desde Google OAuth o formulario manual)
  email                 text,
  full_name             text,
  nickname              text,
  avatar_url            text,

  -- Datos del Onboarding (universidad y carrera)
  university            text,
  university_short      text,       -- Sigla: "UDD", "PUC", "UCH", etc.
  career                text,       -- "Tecnología Médica", "Medicina", etc.
  onboarding_completed  boolean     default false,

  -- Método de autenticación utilizado
  auth_provider         text        default 'email', -- 'google', 'email'

  -- Sistema de Gamificación (Estado Inicial = CERO)
  level                 text        default 'Aspirante Clínico',
  rank_level            integer     default 1,
  xp                    integer     default 0,
  streak_days           integer     default 0,
  longest_streak        integer     default 0,  -- Récord personal de racha
  last_study_date       date,                   -- NULL hasta su primera sesión

  -- Auditoría
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,

  -- Restricciones
  constraint profiles_xp_non_negative     check (xp >= 0),
  constraint profiles_streak_non_negative check (streak_days >= 0),
  constraint profiles_rank_range          check (rank_level between 1 and 10)
);

-- Índices de rendimiento
create index if not exists idx_profiles_university
  on public.profiles(university_short);

create index if not exists idx_profiles_rank
  on public.profiles(rank_level);

create index if not exists idx_profiles_xp
  on public.profiles(xp desc);

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Los usuarios pueden ver su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Los usuarios pueden actualizar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Los usuarios pueden insertar su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);


-- ===========================================================================
-- 3. TABLA DE PROGRESO POR UNIDAD DE ESTUDIO
-- ===========================================================================
-- Registra el avance (0-100%) de cada módulo/unidad para cada usuario.

create table if not exists public.unit_progress (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  module_id   text not null,  -- 'anatomia', 'bioquimica', 'histologia', 'microbiologia'
  unit_id     text not null,  -- 'flashcards', 'teoria', 'visor-3d', 'metabolismo', etc.
  status      text default 'not_started'
              check (status in ('not_started', 'in_progress', 'completed')),
  score       integer default 0 check (score between 0 and 100),
  completed_at timestamptz,
  updated_at  timestamptz default now() not null,

  unique(user_id, module_id, unit_id)
);

-- Índice para consultas de progreso por usuario
create index if not exists idx_unit_progress_user
  on public.unit_progress(user_id);

-- Row Level Security
alter table public.unit_progress enable row level security;

create policy "Los usuarios pueden ver su propio progreso"
  on public.unit_progress for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden insertar su propio progreso"
  on public.unit_progress for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar su propio progreso"
  on public.unit_progress for update
  using (auth.uid() = user_id);


-- ===========================================================================
-- 4. TABLA DE SESIONES DE ESTUDIO (Historial y Cálculo de Racha)
-- ===========================================================================
-- Cada vez que un usuario estudia, se registra una sesión. Se utiliza
-- para calcular la racha de días consecutivos y asignar XP.

create table if not exists public.study_sessions (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  module_id   text not null,
  unit_id     text not null,
  xp_earned   integer default 0 check (xp_earned >= 0),
  duration_seconds integer default 0,  -- Duración de la sesión en segundos
  study_date  date default current_date not null,
  created_at  timestamptz default now() not null
);

-- Índices para consultas de historial y racha
create index if not exists idx_sessions_user_date
  on public.study_sessions(user_id, study_date desc);

-- Row Level Security
alter table public.study_sessions enable row level security;

create policy "Los usuarios pueden ver sus propias sesiones"
  on public.study_sessions for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden registrar sus propias sesiones"
  on public.study_sessions for insert
  with check (auth.uid() = user_id);


-- ===========================================================================
-- 5. FUNCIÓN: CALCULAR RANGO SEGÚN XP
-- ===========================================================================
-- Retorna el nivel y nombre del rango que corresponde a un valor de XP dado.

create or replace function public.get_rank_for_xp(p_xp integer)
returns table(rank_level integer, rank_name text, rank_max_xp integer)
language sql stable as $$
  select r.level, r.name, r.max_xp
  from public.ranks r
  where r.min_xp <= p_xp
  order by r.level desc
  limit 1;
$$;


-- ===========================================================================
-- 6. FUNCIÓN: REGISTRAR SESIÓN DE ESTUDIO Y ACTUALIZAR RACHA + XP + RANGO
-- ===========================================================================
-- Función principal que el frontend llama al completar una actividad.
-- Maneja en una sola transacción:
--   1. Insertar la sesión de estudio
--   2. Calcular la racha de días consecutivos
--   3. Sumar XP al perfil
--   4. Promover de rango si corresponde
--   5. Actualizar progreso de la unidad

create or replace function public.record_study_session(
  p_user_id         uuid,
  p_module_id       text,
  p_unit_id         text,
  p_xp_earned       integer default 10,
  p_duration_seconds integer default 0,
  p_unit_score      integer default null  -- null = no actualizar score
)
returns jsonb
language plpgsql security definer as $$
declare
  v_today           date := current_date;
  v_last_study      date;
  v_current_streak  integer;
  v_new_streak      integer;
  v_new_xp          integer;
  v_new_rank_level  integer;
  v_new_rank_name   text;
  v_longest_streak  integer;
begin
  -- 1. Insertar la sesión de estudio
  insert into public.study_sessions (user_id, module_id, unit_id, xp_earned, duration_seconds, study_date)
  values (p_user_id, p_module_id, p_unit_id, p_xp_earned, p_duration_seconds, v_today);

  -- 2. Obtener estado actual del perfil
  select last_study_date, streak_days, xp, longest_streak
  into v_last_study, v_current_streak, v_new_xp, v_longest_streak
  from public.profiles
  where id = p_user_id
  for update;  -- Lock para evitar race conditions

  -- 3. Calcular nueva racha
  if v_last_study is null then
    -- Primera sesión de estudio del usuario
    v_new_streak := 1;
  elsif v_last_study = v_today then
    -- Ya estudió hoy, racha no cambia
    v_new_streak := v_current_streak;
  elsif v_last_study = v_today - interval '1 day' then
    -- Estudió ayer → racha continúa
    v_new_streak := v_current_streak + 1;
  else
    -- Se rompió la racha → reinicia en 1
    v_new_streak := 1;
  end if;

  -- 4. Actualizar récord personal de racha
  if v_new_streak > v_longest_streak then
    v_longest_streak := v_new_streak;
  end if;

  -- 5. Sumar XP
  v_new_xp := v_new_xp + p_xp_earned;

  -- 6. Calcular nuevo rango según XP actualizado
  select rank_level, rank_name
  into v_new_rank_level, v_new_rank_name
  from public.get_rank_for_xp(v_new_xp);

  -- 7. Actualizar perfil con todos los campos
  update public.profiles
  set
    xp              = v_new_xp,
    streak_days     = v_new_streak,
    longest_streak  = v_longest_streak,
    last_study_date = v_today,
    level           = v_new_rank_name,
    rank_level      = v_new_rank_level,
    updated_at      = now()
  where id = p_user_id;

  -- 8. Actualizar progreso de la unidad (si se proporcionó score)
  if p_unit_score is not null then
    insert into public.unit_progress (user_id, module_id, unit_id, status, score, updated_at)
    values (
      p_user_id,
      p_module_id,
      p_unit_id,
      case when p_unit_score >= 100 then 'completed'
           when p_unit_score > 0    then 'in_progress'
           else 'not_started' end,
      p_unit_score,
      now()
    )
    on conflict (user_id, module_id, unit_id)
    do update set
      score      = greatest(public.unit_progress.score, excluded.score),
      status     = case when greatest(public.unit_progress.score, excluded.score) >= 100 then 'completed'
                        when greatest(public.unit_progress.score, excluded.score) > 0    then 'in_progress'
                        else 'not_started' end,
      completed_at = case when greatest(public.unit_progress.score, excluded.score) >= 100
                          then coalesce(public.unit_progress.completed_at, now())
                          else null end,
      updated_at = now();
  end if;

  -- 9. Retornar el estado actualizado como JSON
  return jsonb_build_object(
    'xp',             v_new_xp,
    'streak_days',    v_new_streak,
    'longest_streak', v_longest_streak,
    'rank_level',     v_new_rank_level,
    'rank_name',      v_new_rank_name,
    'xp_earned',      p_xp_earned,
    'study_date',     v_today
  );
end;
$$;


-- ===========================================================================
-- 7. TRIGGER: INICIALIZACIÓN AUTOMÁTICA DE NUEVO USUARIO (INICIO EN CERO)
-- ===========================================================================
-- Se ejecuta automáticamente al insertarse un registro en auth.users
-- (tanto por Google OAuth como por correo/contraseña).

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_provider text;
begin
  -- Determinar el proveedor de autenticación
  v_provider := coalesce(new.raw_app_meta_data->>'provider', 'email');

  -- 1. Crear perfil con estado ESTRICTAMENTE EN CERO
  insert into public.profiles (
    id,
    email,
    full_name,
    nickname,
    avatar_url,
    auth_provider,
    level,
    rank_level,
    xp,
    streak_days,
    longest_streak,
    last_study_date,
    onboarding_completed
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      'Estudiante de Salud'
    ),
    coalesce(
      new.raw_user_meta_data->>'given_name',
      split_part(
        coalesce(new.raw_user_meta_data->>'name', 'Estudiante'), ' ', 1
      )
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      ''
    ),
    v_provider,
    'Aspirante Clínico',  -- Rango inicial fijo
    1,                     -- Nivel 1
    0,                     -- 0 XP
    0,                     -- 0 días de racha
    0,                     -- 0 récord de racha
    null,                  -- NULL = nunca ha estudiado
    false                  -- Debe completar onboarding
  );

  -- 2. Inicializar todas las unidades médicas en 0% (not_started)
  insert into public.unit_progress (user_id, module_id, unit_id, status, score) values
    (new.id, 'anatomia',      'flashcards',   'not_started', 0),
    (new.id, 'anatomia',      'teoria',       'not_started', 0),
    (new.id, 'anatomia',      'visor-3d',     'not_started', 0),
    (new.id, 'bioquimica',    'metabolismo',  'not_started', 0),
    (new.id, 'histologia',    'tejidos',      'not_started', 0),
    (new.id, 'microbiologia', 'patogenos',    'not_started', 0);

  return new;
end;
$$ language plpgsql security definer;

-- Crear trigger (idempotente)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ===========================================================================
-- 8. FUNCIÓN: ACTUALIZAR TIMESTAMP DE updated_at AUTOMÁTICAMENTE
-- ===========================================================================

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Aplicar a profiles
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- Aplicar a unit_progress
drop trigger if exists set_unit_progress_updated_at on public.unit_progress;
create trigger set_unit_progress_updated_at
  before update on public.unit_progress
  for each row execute procedure public.update_updated_at();


-- ===========================================================================
-- 9. VISTA: RESUMEN COMPLETO DE PERFIL + RANGO + PROGRESO
-- ===========================================================================
-- Útil para el Dashboard y la página de Perfil del frontend.

create or replace view public.profile_summary as
select
  p.id,
  p.email,
  p.full_name,
  p.nickname,
  p.avatar_url,
  p.university,
  p.university_short,
  p.career,
  p.auth_provider,
  p.onboarding_completed,
  p.xp,
  p.rank_level,
  p.level           as rank_name,
  p.streak_days,
  p.longest_streak,
  p.last_study_date,
  r.max_xp          as xp_to_next_level,
  r.description      as rank_description,
  p.created_at,
  -- Calcular porcentaje de progreso dentro del rango actual
  case when r.max_xp - r.min_xp > 0
    then round(((p.xp - r.min_xp)::numeric / (r.max_xp - r.min_xp)::numeric) * 100, 1)
    else 100
  end as rank_progress_pct
from public.profiles p
left join public.ranks r on r.level = p.rank_level;


-- ===========================================================================
-- 10. TABLA DE INTENTOS DE CUESTIONARIOS (EVALUACIÓN DOCENTE)
-- ===========================================================================

-- Añadir columna de rol y código de participante a profiles si no existen
alter table public.profiles add column if not exists role text default 'student';
alter table public.profiles add column if not exists participant_code text;

create table if not exists public.quiz_attempts (
  id                    uuid default uuid_generate_v4() primary key,
  user_id               uuid references public.profiles(id) on delete cascade not null,
  module_id             text not null,
  unit_id               text not null,
  quiz_version          text default 'v1.0' not null,
  attempt_number        integer default 1 not null,
  score                 integer not null check (score between 0 and 100),
  total_questions       integer not null,
  correct_count         integer not null,
  incorrect_topics_json jsonb default '[]'::jsonb,
  answers_summary_json  jsonb default '{}'::jsonb,
  duration_seconds      integer default 0,
  submission_hash       text,
  created_at            timestamptz default now() not null
);

create index if not exists idx_quiz_attempts_user_unit
  on public.quiz_attempts(user_id, module_id, unit_id);

alter table public.quiz_attempts enable row level security;

-- Los estudiantes solo pueden ver e insertar sus propios intentos
create policy "Estudiantes ven sus propios intentos"
  on public.quiz_attempts for select
  using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Estudiantes insertan sus propios intentos"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- Los administradores pueden consultar todos los perfiles e intentos
create policy "Administradores pueden ver todos los perfiles"
  on public.profiles for select
  using (auth.uid() = id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ===========================================================================
-- FIN DEL ESQUEMA
-- ===========================================================================