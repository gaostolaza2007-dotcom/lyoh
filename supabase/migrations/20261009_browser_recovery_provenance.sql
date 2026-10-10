-- ===========================================================================
-- MedStudy - Migración Definitiva: Trazabilidad, Idempotencia y Transacciones Atómicas
-- No elimina datos, comprueba y asegura tipos reales, y otorga permisos mínimos específicos.
-- ===========================================================================

BEGIN;

-- 1. Verificación y normalización de tipos de columnas en public.users
DO $$
BEGIN
  -- recovered_from_browser: integer (0 = registro estándar, 1 = recuperado de navegador)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'recovered_from_browser') THEN
    ALTER TABLE public.users ADD COLUMN recovered_from_browser integer DEFAULT 0;
  ELSE
    ALTER TABLE public.users ALTER COLUMN recovered_from_browser TYPE integer USING recovered_from_browser::integer;
    ALTER TABLE public.users ALTER COLUMN recovered_from_browser SET DEFAULT 0;
  END IF;

  -- browser_recovered_at: timestamptz
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'browser_recovered_at') THEN
    ALTER TABLE public.users ADD COLUMN browser_recovered_at timestamptz DEFAULT NULL;
  ELSE
    ALTER TABLE public.users ALTER COLUMN browser_recovered_at TYPE timestamptz USING browser_recovered_at::timestamptz;
  END IF;

  -- browser_provisional_code: text (solo metadato, no es identificador único ni vinculante)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'browser_provisional_code') THEN
    ALTER TABLE public.users ADD COLUMN browser_provisional_code text DEFAULT NULL;
  ELSE
    ALTER TABLE public.users ALTER COLUMN browser_provisional_code TYPE text;
  END IF;

  -- browser_claimed_xp: integer (avance autodeclarado en cliente, separado del XP oficial)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'browser_claimed_xp') THEN
    ALTER TABLE public.users ADD COLUMN browser_claimed_xp integer DEFAULT 0;
  ELSE
    ALTER TABLE public.users ALTER COLUMN browser_claimed_xp TYPE integer USING browser_claimed_xp::integer;
    ALTER TABLE public.users ALTER COLUMN browser_claimed_xp SET DEFAULT 0;
  END IF;

  -- browser_claimed_progress_json: jsonb
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'browser_claimed_progress_json') THEN
    ALTER TABLE public.users ADD COLUMN browser_claimed_progress_json jsonb DEFAULT '{}'::jsonb;
  ELSE
    ALTER TABLE public.users ALTER COLUMN browser_claimed_progress_json TYPE jsonb USING browser_claimed_progress_json::jsonb;
    ALTER TABLE public.users ALTER COLUMN browser_claimed_progress_json SET DEFAULT '{}'::jsonb;
  END IF;

  -- client_request_token_hash: text (hash SHA-256 del token seguro del cliente para reintentos atómicos)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'client_request_token_hash') THEN
    ALTER TABLE public.users ADD COLUMN client_request_token_hash text DEFAULT NULL;
  ELSE
    ALTER TABLE public.users ALTER COLUMN client_request_token_hash TYPE text;
  END IF;
END $$;

-- 2. Índices para control de concurrencia e idempotencia
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_client_request_token_hash 
  ON public.users (client_request_token_hash) 
  WHERE client_request_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_browser_provisional_code 
  ON public.users (browser_provisional_code) 
  WHERE browser_provisional_code IS NOT NULL;

-- 3. Funciones de transacción atómica real (ACID a nivel de motor PostgreSQL)

-- 3.1. Registro de participante atómico
CREATE OR REPLACE FUNCTION public.register_participant_atomic(
  p_nickname text,
  p_university text,
  p_university_short text,
  p_career text,
  p_account_secret text DEFAULT NULL,
  p_client_request_token_hash text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing users%ROWTYPE;
  v_user_id uuid;
  v_code text;
  v_chars text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_now timestamptz := clock_timestamp();
  v_attempts int := 0;
  v_standard_units text[][] := ARRAY[
    ['anatomia', 'flashcards'],
    ['anatomia', 'teoria'],
    ['anatomia', 'visor-3d'],
    ['bioquimica', 'metabolismo'],
    ['histologia', 'tejidos'],
    ['microbiologia', 'patogenos']
  ];
  v_u text[];
BEGIN
  -- Idempotencia: si ya existe un usuario con este hash de token, devolverlo sin duplicar
  IF p_client_request_token_hash IS NOT NULL AND trim(p_client_request_token_hash) <> '' THEN
    SELECT * INTO v_existing FROM users WHERE client_request_token_hash = trim(p_client_request_token_hash);
    IF FOUND THEN
      RETURN to_jsonb(v_existing);
    END IF;
  END IF;

  -- Generar código único MED-XXXX
  v_user_id := gen_random_uuid();
  LOOP
    v_code := 'MED-';
    FOR i IN 1..4 LOOP
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE participant_code = v_code);
    v_attempts := v_attempts + 1;
    IF v_attempts > 20 THEN
      RAISE EXCEPTION 'No fue posible generar un código único de participante';
    END IF;
  END LOOP;

  -- Inserción atómica del usuario protegida contra condiciones de carrera
  BEGIN
    INSERT INTO users (
      id, participant_code, nickname, university, university_short, career,
      role, onboarding_completed, xp, streak_days, longest_streak,
      account_secret, client_request_token_hash,
      created_at, updated_at, last_active_at
    ) VALUES (
      v_user_id, v_code, trim(p_nickname), trim(p_university), trim(coalesce(p_university_short, 'UDD')), trim(p_career),
      'student', 1, 0, 0, 0,
      p_account_secret, p_client_request_token_hash,
      v_now, v_now, v_now
    ) RETURNING * INTO v_existing;
  EXCEPTION WHEN unique_violation THEN
    IF p_client_request_token_hash IS NOT NULL AND trim(p_client_request_token_hash) <> '' THEN
      SELECT * INTO v_existing FROM users WHERE client_request_token_hash = trim(p_client_request_token_hash);
      IF FOUND THEN
        RETURN to_jsonb(v_existing);
      END IF;
    END IF;
    RAISE;
  END;

  -- Inserción atómica de las unidades en unit_progress
  FOREACH v_u SLICE 1 IN ARRAY v_standard_units LOOP
    INSERT INTO unit_progress (id, user_id, module_id, unit_id, status, score, updated_at)
    VALUES (gen_random_uuid(), v_user_id, v_u[1], v_u[2], 'not_started', 0, v_now)
    ON CONFLICT (user_id, module_id, unit_id) DO NOTHING;
  END LOOP;

  RETURN to_jsonb(v_existing);
END;
$$;

-- 3.2. Recuperación de perfil atómica
CREATE OR REPLACE FUNCTION public.recover_browser_profile_atomic(
  p_nickname text,
  p_university text,
  p_university_short text,
  p_career text,
  p_provisional_code text DEFAULT NULL,
  p_claimed_xp int DEFAULT 0,
  p_claimed_progress jsonb DEFAULT '{}'::jsonb,
  p_client_request_token_hash text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing users%ROWTYPE;
  v_user_id uuid;
  v_code text;
  v_chars text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_now timestamptz := clock_timestamp();
  v_attempts int := 0;
  v_standard_units text[][] := ARRAY[
    ['anatomia', 'flashcards'],
    ['anatomia', 'teoria'],
    ['anatomia', 'visor-3d'],
    ['bioquimica', 'metabolismo'],
    ['histologia', 'tejidos'],
    ['microbiologia', 'patogenos']
  ];
  v_u text[];
BEGIN
  -- Idempotencia: si ya existe un usuario con este hash de token, devolverlo
  IF p_client_request_token_hash IS NOT NULL AND trim(p_client_request_token_hash) <> '' THEN
    SELECT * INTO v_existing FROM users WHERE client_request_token_hash = trim(p_client_request_token_hash);
    IF FOUND THEN
      RETURN to_jsonb(v_existing);
    END IF;
  END IF;

  -- Generar código único verificado por el servidor
  v_user_id := gen_random_uuid();
  LOOP
    v_code := 'MED-';
    FOR i IN 1..4 LOOP
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE participant_code = v_code);
    v_attempts := v_attempts + 1;
    IF v_attempts > 20 THEN
      RAISE EXCEPTION 'No fue posible generar un código único de participante';
    END IF;
  END LOOP;

  -- Inserción atómica del usuario con procedencia separada protegida contra carreras
  BEGIN
    INSERT INTO users (
      id, participant_code, nickname, university, university_short, career,
      role, onboarding_completed, xp, streak_days, longest_streak,
      recovered_from_browser, browser_recovered_at, browser_provisional_code,
      browser_claimed_xp, browser_claimed_progress_json,
      client_request_token_hash,
      created_at, updated_at, last_active_at
    ) VALUES (
      v_user_id, v_code, trim(p_nickname), trim(p_university), trim(coalesce(p_university_short, 'UDD')), trim(p_career),
      'student', 1, 0, 0, 0,
      1, v_now, trim(p_provisional_code), coalesce(p_claimed_xp, 0), coalesce(p_claimed_progress, '{}'::jsonb),
      p_client_request_token_hash,
      v_now, v_now, v_now
    ) RETURNING * INTO v_existing;
  EXCEPTION WHEN unique_violation THEN
    IF p_client_request_token_hash IS NOT NULL AND trim(p_client_request_token_hash) <> '' THEN
      SELECT * INTO v_existing FROM users WHERE client_request_token_hash = trim(p_client_request_token_hash);
      IF FOUND THEN
        RETURN to_jsonb(v_existing);
      END IF;
    END IF;
    RAISE;
  END;

  -- Inserción atómica de las unidades en unit_progress
  FOREACH v_u SLICE 1 IN ARRAY v_standard_units LOOP
    INSERT INTO unit_progress (id, user_id, module_id, unit_id, status, score, updated_at)
    VALUES (gen_random_uuid(), v_user_id, v_u[1], v_u[2], 'not_started', 0, v_now)
    ON CONFLICT (user_id, module_id, unit_id) DO NOTHING;
  END LOOP;

  -- Auditoría interna
  INSERT INTO activity_logs (id, user_id, module_id, unit_id, activity_type, created_at)
  VALUES (gen_random_uuid(), v_user_id, 'system', 'browser_recovery', 'browser_profile_recovered', v_now);

  RETURN to_jsonb(v_existing);
END;
$$;

-- 4. Permisos mínimos y específicos para service_role (sin GRANT ALL genérico)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.unit_progress TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quiz_attempts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.activity_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.login_rate_limits TO service_role;
GRANT SELECT ON TABLE public.ranks TO service_role;

-- Revocación explícita para PUBLIC, anon y authenticated para evitar cualquier ejecución directa o intermedia
REVOKE EXECUTE ON FUNCTION public.register_participant_atomic(text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recover_browser_profile_atomic(text, text, text, text, text, int, jsonb, text) FROM PUBLIC, anon, authenticated;

-- Concesión de ejecución estrictamente reservada a service_role
GRANT EXECUTE ON FUNCTION public.register_participant_atomic(text, text, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.recover_browser_profile_atomic(text, text, text, text, text, int, jsonb, text) TO service_role;

COMMIT;
