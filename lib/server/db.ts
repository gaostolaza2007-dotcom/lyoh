import { isSupabaseConfigured } from "./supabase-admin";
import * as supabaseAdapter from "./supabase-adapter";
import type {
  DbUser,
  QuizAttemptRecord,
  AdminParticipantSummary,
  AdminParticipantDetail,
  AdminGlobalStats,
  RateLimitResult,
} from "./db-types";

export type {
  DbUser,
  QuizAttemptRecord,
  AdminParticipantSummary,
  AdminParticipantDetail,
  AdminGlobalStats,
  RateLimitResult,
};

const isProd = process.env.NODE_ENV === "production" || process.env.NETLIFY === "true";

async function getBackend() {
  if (isSupabaseConfigured()) {
    return { isSupabase: true as const, supabase: supabaseAdapter };
  }

  if (isProd) {
    throw new Error(
      "Configuración de Supabase no encontrada en entorno de producción (Netlify). Configure NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el panel de Netlify."
    );
  }

  // En desarrollo local offline (sin variables de Supabase), cargar adaptador SQLite bajo demanda
  const sqlite = await import("./sqlite-adapter");
  return { isSupabase: false as const, sqlite };
}

// ===========================================================================
// MÉTODOS DE BASE DE DATOS (UNIFICADOS Y ASÍNCRONOS)
// ===========================================================================

export async function getUserById(id: string): Promise<DbUser | null> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseGetUserById(id);
  }
  return backend.sqlite.sqliteGetUserById(id);
}

export async function getUserByCode(code: string): Promise<DbUser | null> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseGetUserByCode(code);
  }
  return backend.sqlite.sqliteGetUserByCode(code);
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseGetUserByEmail(email);
  }
  return backend.sqlite.sqliteGetUserByEmail(email);
}

export async function registerParticipant(data: {
  nickname: string;
  university: string;
  universityShort: string;
  career: string;
  accountSecret?: string;
}): Promise<DbUser> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseRegisterParticipant(data);
  }
  return backend.sqlite.sqliteRegisterParticipant(data);
}

export async function updateParticipantProfile(
  id: string,
  data: {
    nickname?: string;
    university?: string;
    universityShort?: string;
    career?: string;
    accountSecret?: string;
  }
): Promise<DbUser | null> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseUpdateParticipantProfile(id, data);
  }
  return backend.sqlite.sqliteUpdateParticipantProfile(id, data);
}

export async function createSession(userId: string, role: "student" | "admin"): Promise<string> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseCreateSession(userId, role);
  }
  return backend.sqlite.sqliteCreateSession(userId, role);
}

export async function getSession(
  token: string
): Promise<{ user: DbUser; session: { token: string; role: string } } | null> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseGetSession(token);
  }
  return backend.sqlite.sqliteGetSession(token);
}

export async function deleteSession(token: string): Promise<void> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseDeleteSession(token);
  }
  return backend.sqlite.sqliteDeleteSession(token);
}

export async function getUserUnitProgress(userId: string): Promise<Record<string, number>> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseGetUserUnitProgress(userId);
  }
  return backend.sqlite.sqliteGetUserUnitProgress(userId);
}

export async function updateUnitProgressDb(
  userId: string,
  moduleId: string,
  unitId: string,
  score: number
): Promise<void> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseUpdateUnitProgressDb(userId, moduleId, unitId, score);
  }
  return backend.sqlite.sqliteUpdateUnitProgressDb(userId, moduleId, unitId, score);
}

export async function addXpDb(userId: string, amount: number): Promise<number> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseAddXpDb(userId, amount);
  }
  return backend.sqlite.sqliteAddXpDb(userId, amount);
}

export async function recordQuizAttemptDb(data: {
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
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseRecordQuizAttemptDb(data);
  }
  return backend.sqlite.sqliteRecordQuizAttemptDb(data);
}

export async function recordActivityDb(
  userId: string,
  moduleId: string,
  unitId: string,
  activityType: "reading" | "interactive" | "quiz"
): Promise<void> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseRecordActivityDb(userId, moduleId, unitId, activityType);
  }
  return backend.sqlite.sqliteRecordActivityDb(userId, moduleId, unitId, activityType);
}

export async function getAdminParticipantsListDb(): Promise<AdminParticipantSummary[]> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseGetAdminParticipantsListDb();
  }
  return backend.sqlite.sqliteGetAdminParticipantsListDb();
}

export async function getAdminParticipantDetailDb(userId: string): Promise<AdminParticipantDetail | null> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseGetAdminParticipantDetailDb(userId);
  }
  return backend.sqlite.sqliteGetAdminParticipantDetailDb(userId);
}

export async function getAdminGlobalStatsDb(): Promise<AdminGlobalStats> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseGetAdminGlobalStatsDb();
  }
  return backend.sqlite.sqliteGetAdminGlobalStatsDb();
}

export async function createOrUpdateAdminDb(data: {
  email: string;
  passwordHash: string;
  salt: string;
  name?: string;
}): Promise<DbUser> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseCreateOrUpdateAdminDb(data);
  }
  return backend.sqlite.sqliteCreateOrUpdateAdminDb(data);
}

export async function checkAndIncrementRateLimit(
  key: string,
  maxAttempts: number = 5,
  lockoutMinutes: number = 15
): Promise<RateLimitResult> {
  const backend = await getBackend();
  if (backend.isSupabase) {
    return backend.supabase.supabaseCheckAndIncrementRateLimit(key, maxAttempts, lockoutMinutes);
  }
  return backend.sqlite.sqliteCheckAndIncrementRateLimit(key, maxAttempts, lockoutMinutes);
}
