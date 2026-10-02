import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase-admin";
import { getTotalsConfig, getEnabledUnitIds } from "../modules-config";
import type {
  DbUser,
  QuizAttemptRecord,
  AdminParticipantSummary,
  AdminParticipantDetail,
  AdminGlobalStats,
  RateLimitResult,
} from "./db-types";

// ===========================================================================
// LECTURA DE USUARIOS
// ===========================================================================

export async function supabaseGetUserById(id: string): Promise<DbUser | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as DbUser;
}

export async function supabaseGetUserByCode(code: string): Promise<DbUser | null> {
  const supabase = getSupabaseAdmin();
  const normalized = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("participant_code", normalized)
    .maybeSingle();

  if (error || !data) return null;
  return data as DbUser;
}

export async function supabaseGetUserByEmail(email: string): Promise<DbUser | null> {
  const supabase = getSupabaseAdmin();
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("email", normalized)
    .maybeSingle();

  if (error || !data) return null;
  return data as DbUser;
}

// ===========================================================================
// REGISTRO Y GESTIÓN DE PARTICIPANTES
// ===========================================================================

function generateParticipantCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "MED-";
  for (let i = 0; i < 4; i++) {
    const idx = crypto.randomInt(0, chars.length);
    code += chars[idx];
  }
  return code;
}

export async function supabaseRegisterParticipant(data: {
  nickname: string;
  university: string;
  universityShort: string;
  career: string;
  accountSecret?: string;
}): Promise<DbUser> {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  let code = generateParticipantCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("participant_code", code)
      .maybeSingle();
    if (!existing) break;
    code = generateParticipantCode();
    attempts++;
  }

  const { data: insertedUser, error: insertError } = await supabase
    .from("users")
    .insert({
      id,
      participant_code: code,
      nickname: data.nickname.trim(),
      university: data.university.trim(),
      university_short: data.universityShort.trim(),
      career: data.career.trim(),
      role: "student",
      onboarding_completed: 1,
      xp: 0,
      streak_days: 0,
      longest_streak: 0,
      account_secret: data.accountSecret || null,
      created_at: now,
      updated_at: now,
      last_active_at: now,
    })
    .select()
    .single();

  if (insertError || !insertedUser) {
    throw new Error(`Error al registrar participante en Supabase: ${insertError?.message || "desconocido"}`);
  }

  const standardUnits = [
    { mod: "anatomia", unit: "flashcards" },
    { mod: "anatomia", unit: "teoria" },
    { mod: "anatomia", unit: "visor-3d" },
    { mod: "bioquimica", unit: "metabolismo" },
    { mod: "histologia", unit: "tejidos" },
    { mod: "microbiologia", unit: "patogenos" },
  ];

  const progressRows = standardUnits.map((u) => ({
    id: crypto.randomUUID(),
    user_id: id,
    module_id: u.mod,
    unit_id: u.unit,
    status: "not_started",
    score: 0,
    updated_at: now,
  }));

  await supabase.from("unit_progress").upsert(progressRows, {
    onConflict: "user_id,module_id,unit_id",
    ignoreDuplicates: true,
  });

  return insertedUser as DbUser;
}

export async function supabaseUpdateParticipantProfile(
  id: string,
  data: {
    nickname?: string;
    university?: string;
    universityShort?: string;
    career?: string;
    accountSecret?: string;
  }
): Promise<DbUser | null> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const updatePayload: Record<string, any> = {
    updated_at: now,
    last_active_at: now,
  };

  if (data.nickname !== undefined) updatePayload.nickname = data.nickname;
  if (data.university !== undefined) updatePayload.university = data.university;
  if (data.universityShort !== undefined) updatePayload.university_short = data.universityShort;
  if (data.career !== undefined) updatePayload.career = data.career;
  if (data.accountSecret !== undefined) updatePayload.account_secret = data.accountSecret;

  const { data: updated, error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) return null;
  return updated as DbUser;
}

// ===========================================================================
// SESIONES
// ===========================================================================

export async function supabaseCreateSession(userId: string, role: "student" | "admin"): Promise<string> {
  const supabase = getSupabaseAdmin();
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("sessions").insert({
    token,
    user_id: userId,
    role,
    expires_at: expiresAt,
    created_at: now.toISOString(),
  });

  if (error) {
    throw new Error(`Error al crear sesión en Supabase: ${error.message}`);
  }

  return token;
}

export async function supabaseGetSession(
  token: string
): Promise<{ user: DbUser; session: { token: string; role: string } } | null> {
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select("token, role, expires_at, users (*)")
    .eq("token", token)
    .gt("expires_at", now)
    .maybeSingle();

  if (error || !data || !data.users) return null;

  const userRecord = Array.isArray(data.users) ? data.users[0] : data.users;
  if (!userRecord) return null;

  // Actualizar last_active_at en segundo plano
  await supabase.from("users").update({ last_active_at: now }).eq("id", userRecord.id);

  const user: DbUser = {
    ...userRecord,
    last_active_at: now,
  };

  return { user, session: { token: data.token, role: data.role } };
}

export async function supabaseDeleteSession(token: string): Promise<void> {
  if (!token) return;
  const supabase = getSupabaseAdmin();
  await supabase.from("sessions").delete().eq("token", token);
}

// ===========================================================================
// PROGRESO DE UNIDADES
// ===========================================================================

export async function supabaseGetUserUnitProgress(userId: string): Promise<Record<string, number>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("unit_progress")
    .select("module_id, unit_id, score")
    .eq("user_id", userId);

  const map: Record<string, number> = {
    "anatomia_flashcards": 0,
    "anatomia_teoria": 0,
    "anatomia_visor-3d": 0,
    "bioquimica_metabolismo": 0,
    "histologia_tejidos": 0,
    "microbiologia_patogenos": 0,
  };

  if (!error && data) {
    for (const r of data) {
      map[`${r.module_id}_${r.unit_id}`] = r.score || 0;
    }
  }

  return map;
}

export async function supabaseUpdateUnitProgressDb(
  userId: string,
  moduleId: string,
  unitId: string,
  score: number
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const validScore = Math.max(0, Math.min(100, Math.round(score)));

  // Consultar progreso existente para mantener la mejor puntuación
  const { data: existing } = await supabase
    .from("unit_progress")
    .select("score, completed_at")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .eq("unit_id", unitId)
    .maybeSingle();

  const prevScore = existing?.score || 0;
  const finalScore = Math.max(prevScore, validScore);
  const status = finalScore >= 100 ? "completed" : finalScore > 0 ? "in_progress" : "not_started";
  const completedAt = finalScore >= 100 ? (existing?.completed_at || now) : null;

  await supabase.from("unit_progress").upsert(
    {
      user_id: userId,
      module_id: moduleId,
      unit_id: unitId,
      score: finalScore,
      status,
      completed_at: completedAt,
      updated_at: now,
    },
    { onConflict: "user_id,module_id,unit_id" }
  );

  await supabase.from("users").update({ last_active_at: now }).eq("id", userId);
}

// ===========================================================================
// EXPERIENCIA (XP) Y RACHA
// ===========================================================================

export async function supabaseAddXpDb(userId: string, amount: number): Promise<number> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const user = await supabaseGetUserById(userId);
  if (!user) return 0;

  const newXp = (user.xp || 0) + amount;
  const newStreak = user.streak_days === 0 ? 1 : user.streak_days;

  await supabase
    .from("users")
    .update({
      xp: newXp,
      streak_days: newStreak,
      last_study_date: today,
      last_active_at: now,
    })
    .eq("id", userId);

  return newXp;
}

// ===========================================================================
// EVALUACIONES Y CUESTIONARIOS
// ===========================================================================

export async function supabaseRecordQuizAttemptDb(data: {
  userId: string;
  moduleId: string;
  unitId: string;
  quizVersion: string;
  totalQuestions: number;
  correctCount: number;
  incorrectTopics: string[];
  answersSummary?: any;
  durationSeconds?: number;
}): Promise<{ attempt: QuizAttemptRecord; isDuplicate: boolean; newXp: number }> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const total = Math.max(1, data.totalQuestions);
  const correct = Math.max(0, Math.min(total, data.correctCount));
  const serverScore = Math.round((correct / total) * 100);

  const windowTime = Math.floor(Date.now() / 15000);
  const submissionHash = crypto
    .createHash("sha256")
    .update(`${data.userId}_${data.moduleId}_${data.unitId}_${correct}_${total}_${windowTime}`)
    .digest("hex");

  const { data: existingAttempt } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("submission_hash", submissionHash)
    .eq("user_id", data.userId)
    .maybeSingle();

  if (existingAttempt) {
    const user = await supabaseGetUserById(data.userId);
    const incTopics = typeof existingAttempt.incorrect_topics_json === "string"
      ? existingAttempt.incorrect_topics_json
      : JSON.stringify(existingAttempt.incorrect_topics_json || []);
    const ansSummary = typeof existingAttempt.answers_summary_json === "string"
      ? existingAttempt.answers_summary_json
      : JSON.stringify(existingAttempt.answers_summary_json || {});

    return {
      attempt: {
        ...existingAttempt,
        incorrect_topics_json: incTopics,
        answers_summary_json: ansSummary,
      } as QuizAttemptRecord,
      isDuplicate: true,
      newXp: user?.xp || 0,
    };
  }

  const { count } = await supabase
    .from("quiz_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", data.userId)
    .eq("module_id", data.moduleId)
    .eq("unit_id", data.unitId);

  const attemptNumber = (count || 0) + 1;
  const id = crypto.randomUUID();
  const incorrectJson = JSON.stringify(data.incorrectTopics || []);
  const answersJson = JSON.stringify(data.answersSummary || {});
  const duration = Math.max(0, Math.round(data.durationSeconds || 0));

  const { data: insertedAttempt, error } = await supabase
    .from("quiz_attempts")
    .insert({
      id,
      user_id: data.userId,
      module_id: data.moduleId,
      unit_id: data.unitId,
      quiz_version: data.quizVersion || "v1.0",
      attempt_number: attemptNumber,
      score: serverScore,
      total_questions: total,
      correct_count: correct,
      incorrect_topics_json: data.incorrectTopics || [],
      answers_summary_json: data.answersSummary || {},
      duration_seconds: duration,
      submission_hash: submissionHash,
      created_at: now,
    })
    .select()
    .single();

  if (error || !insertedAttempt) {
    throw new Error(`Error al registrar intento de evaluación: ${error?.message || "desconocido"}`);
  }

  await supabaseUpdateUnitProgressDb(data.userId, data.moduleId, data.unitId, serverScore);
  const xpAwarded = Math.max(10, Math.round(correct * 5));
  const newXp = await supabaseAddXpDb(data.userId, xpAwarded);

  const attempt: QuizAttemptRecord = {
    id,
    user_id: data.userId,
    module_id: data.moduleId,
    unit_id: data.unitId,
    quiz_version: data.quizVersion || "v1.0",
    attempt_number: attemptNumber,
    score: serverScore,
    total_questions: total,
    correct_count: correct,
    incorrect_topics_json: incorrectJson,
    answers_summary_json: answersJson,
    duration_seconds: duration,
    submission_hash: submissionHash,
    created_at: now,
  };

  return { attempt, isDuplicate: false, newXp };
}

// ===========================================================================
// REGISTRO DE ACTIVIDAD
// ===========================================================================

export async function supabaseRecordActivityDb(
  userId: string,
  moduleId: string,
  unitId: string,
  activityType: "reading" | "interactive" | "quiz"
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  await supabase.from("activity_logs").insert({
    id: crypto.randomUUID(),
    user_id: userId,
    module_id: moduleId,
    unit_id: unitId,
    activity_type: activityType,
    created_at: now,
  });

  await supabase.from("users").update({ last_active_at: now }).eq("id", userId);
}

// ===========================================================================
// PANEL DE ADMINISTRADOR
// ===========================================================================

export async function supabaseGetAdminParticipantsListDb(): Promise<AdminParticipantSummary[]> {
  const supabase = getSupabaseAdmin();

  const { data: students, error: studentsError } = await supabase
    .from("users")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (studentsError || !students) return [];

  const { totalUnitsCount, enabledUnitsCount } = getTotalsConfig();
  const enabledUnitIds = getEnabledUnitIds();

  // Consultar progreso e intentos en paralelo para evitar N+1 requests
  const [{ data: allProgress }, { data: allAttempts }] = await Promise.all([
    supabase.from("unit_progress").select("user_id, module_id, unit_id, score"),
    supabase.from("quiz_attempts").select("*").order("created_at", { ascending: true }),
  ]);

  const progressByUser = new Map<string, { module_id: string; unit_id: string; score: number }[]>();
  for (const p of allProgress || []) {
    const list = progressByUser.get(p.user_id) || [];
    list.push(p);
    progressByUser.set(p.user_id, list);
  }

  const attemptsByUser = new Map<string, any[]>();
  for (const a of allAttempts || []) {
    const list = attemptsByUser.get(a.user_id) || [];
    list.push(a);
    attemptsByUser.set(a.user_id, list);
  }

  return students.map((s) => {
    const userUnits = progressByUser.get(s.id) || [];
    const completedTotal = userUnits.filter((u) => (u.score || 0) >= 100).length;
    const completedAvailable = userUnits.filter(
      (u) => enabledUnitIds.includes(u.unit_id) && (u.score || 0) >= 100
    ).length;
    const historicalCompleted = userUnits.filter(
      (u) => !enabledUnitIds.includes(u.unit_id) && (u.score || 0) >= 100
    ).length;

    const attempts = attemptsByUser.get(s.id) || [];
    const firstScore = attempts.length > 0 ? attempts[0].score : null;
    const latestScore = attempts.length > 0 ? attempts[attempts.length - 1].score : null;

    const topicCount: Record<string, number> = {};
    for (const a of attempts) {
      try {
        let topics = a.incorrect_topics_json;
        if (typeof topics === "string") {
          topics = JSON.parse(topics);
        }
        if (Array.isArray(topics)) {
          for (const t of topics) {
            if (typeof t === "string" && t.trim()) {
              topicCount[t] = (topicCount[t] || 0) + 1;
            }
          }
        }
      } catch {}
    }

    const sortedTopics = Object.entries(topicCount)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      id: s.id,
      participant_code: s.participant_code || "Sin código",
      nickname: s.nickname || "Sin apodo",
      university: s.university || "Sin universidad",
      university_short: s.university_short || "N/A",
      career: s.career || "Sin carrera",
      created_at: s.created_at,
      last_active_at: s.last_active_at,
      completed_units_count: completedTotal,
      total_units_count: totalUnitsCount,
      completed_available_units_count: completedAvailable,
      total_available_units_count: enabledUnitsCount,
      historical_completed_units_count: historicalCompleted,
      quiz_attempts_count: attempts.length,
      first_attempt_score: firstScore,
      latest_attempt_score: latestScore,
      top_mistake_topics: sortedTopics,
    };
  });
}

export async function supabaseGetAdminParticipantDetailDb(userId: string): Promise<AdminParticipantDetail | null> {
  const user = await supabaseGetUserById(userId);
  if (!user || user.role !== "student") return null;

  const supabase = getSupabaseAdmin();
  const [{ data: unitProgress }, { data: quizAttempts }, { data: activityLogs }] = await Promise.all([
    supabase.from("unit_progress").select("*").eq("user_id", userId).order("module_id").order("unit_id"),
    supabase.from("quiz_attempts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("activity_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
  ]);

  const formattedAttempts: QuizAttemptRecord[] = (quizAttempts || []).map((a) => ({
    ...a,
    incorrect_topics_json: typeof a.incorrect_topics_json === "string" ? a.incorrect_topics_json : JSON.stringify(a.incorrect_topics_json || []),
    answers_summary_json: typeof a.answers_summary_json === "string" ? a.answers_summary_json : JSON.stringify(a.answers_summary_json || {}),
  }));

  return {
    user: {
      id: user.id,
      participant_code: user.participant_code,
      nickname: user.nickname,
      university: user.university,
      university_short: user.university_short,
      career: user.career,
      xp: user.xp,
      streak_days: user.streak_days,
      created_at: user.created_at,
      last_active_at: user.last_active_at,
    },
    unitProgress: unitProgress || [],
    quizAttempts: formattedAttempts,
    activityLogs: activityLogs || [],
  };
}

export async function supabaseGetAdminGlobalStatsDb(): Promise<AdminGlobalStats> {
  const supabase = getSupabaseAdmin();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: studentsCount },
    { count: attemptsCount },
    { count: activeRecently },
    { data: attempts },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("quiz_attempts").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "student").gte("last_active_at", oneDayAgo),
    supabase.from("quiz_attempts").select("score"),
  ]);

  const avgScore =
    attempts && attempts.length > 0
      ? Math.round(attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / attempts.length)
      : null;

  return {
    totalStudents: studentsCount || 0,
    activeLast24h: activeRecently || 0,
    totalQuizAttempts: attemptsCount || 0,
    averageQuizScore: avgScore,
  };
}

export async function supabaseCreateOrUpdateAdminDb(data: {
  email: string;
  passwordHash: string;
  salt: string;
  name?: string;
}): Promise<DbUser> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const normalizedEmail = data.email.trim().toLowerCase();

  const existing = await supabaseGetUserByEmail(normalizedEmail);

  if (existing) {
    const { data: updated, error } = await supabase
      .from("users")
      .update({
        password_hash: data.passwordHash,
        salt: data.salt,
        nickname: data.name || existing.nickname,
        role: "admin",
        updated_at: now,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Error al actualizar administrador en Supabase: ${error?.message}`);
    }
    return updated as DbUser;
  } else {
    const id = crypto.randomUUID();
    const { data: inserted, error } = await supabase
      .from("users")
      .insert({
        id,
        email: normalizedEmail,
        password_hash: data.passwordHash,
        salt: data.salt,
        nickname: data.name || "Administrador MedStudy",
        university: "Administración Central",
        university_short: "ADMIN",
        career: "Responsable del Proyecto",
        role: "admin",
        onboarding_completed: 1,
        xp: 0,
        streak_days: 0,
        longest_streak: 0,
        created_at: now,
        updated_at: now,
        last_active_at: now,
      })
      .select()
      .single();

    if (error || !inserted) {
      throw new Error(`Error al crear administrador en Supabase: ${error?.message}`);
    }
    return inserted as DbUser;
  }
}

// ===========================================================================
// CONTROL DE RATE LIMIT (PROTECCIÓN ANTI-BRUTEFORCE)
// ===========================================================================

export async function supabaseCheckAndIncrementRateLimit(
  key: string,
  maxAttempts: number = 5,
  lockoutMinutes: number = 15
): Promise<RateLimitResult> {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const nowIso = now.toISOString();

  const { data: record } = await supabase
    .from("login_rate_limits")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (record && record.blocked_until) {
    const blockedUntil = new Date(record.blocked_until);
    if (blockedUntil > now) {
      const retryAfterSeconds = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000);
      return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
    }
  }

  if (!record) {
    await supabase.from("login_rate_limits").insert({
      id: crypto.randomUUID(),
      key,
      attempts: 1,
      last_attempt_at: nowIso,
    });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }

  const lastAttempt = new Date(record.last_attempt_at);
  const diffMinutes = (now.getTime() - lastAttempt.getTime()) / (60 * 1000);

  if (diffMinutes > lockoutMinutes) {
    await supabase
      .from("login_rate_limits")
      .update({ attempts: 1, blocked_until: null, last_attempt_at: nowIso })
      .eq("key", key);
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }

  const nextAttempts = (record.attempts || 0) + 1;
  if (nextAttempts >= maxAttempts) {
    const blockedUntil = new Date(now.getTime() + lockoutMinutes * 60 * 1000).toISOString();
    await supabase
      .from("login_rate_limits")
      .update({ attempts: nextAttempts, blocked_until: blockedUntil, last_attempt_at: nowIso })
      .eq("key", key);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds: lockoutMinutes * 60 };
  }

  await supabase
    .from("login_rate_limits")
    .update({ attempts: nextAttempts, last_attempt_at: nowIso })
    .eq("key", key);

  return { allowed: true, remainingAttempts: maxAttempts - nextAttempts };
}
