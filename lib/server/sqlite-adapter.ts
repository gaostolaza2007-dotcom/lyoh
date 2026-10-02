import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DatabaseSync } from "node:sqlite";
import { getTotalsConfig, getEnabledUnitIds } from "../modules-config";
import type { DbUser, QuizAttemptRecord, AdminParticipantSummary } from "./db-types";

export function getDbPath(): string {
  if (process.env.MEDSTUDY_DB_PATH && process.env.MEDSTUDY_DB_PATH.trim() !== "") {
    return path.resolve(process.env.MEDSTUDY_DB_PATH);
  }
  return path.join(process.cwd(), "data", "medstudy.db");
}

let dbInstance: DatabaseSync | null = null;

export function closeDb(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {}
    dbInstance = null;
  }
}

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath();
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      participant_code TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      salt TEXT,
      account_secret TEXT,
      nickname TEXT,
      university TEXT,
      university_short TEXT,
      career TEXT,
      role TEXT DEFAULT 'student',
      onboarding_completed INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_study_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS unit_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id TEXT NOT NULL,
      unit_id TEXT NOT NULL,
      status TEXT DEFAULT 'not_started',
      score INTEGER DEFAULT 0,
      completed_at TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, module_id, unit_id)
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id TEXT NOT NULL,
      unit_id TEXT NOT NULL,
      quiz_version TEXT NOT NULL,
      attempt_number INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_count INTEGER NOT NULL,
      incorrect_topics_json TEXT DEFAULT '[]',
      answers_summary_json TEXT DEFAULT '{}',
      duration_seconds INTEGER DEFAULT 0,
      submission_hash TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id TEXT NOT NULL,
      unit_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS login_rate_limits (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 1,
      blocked_until TEXT,
      last_attempt_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_unit_progress_user ON unit_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_unit ON quiz_attempts(user_id, module_id, unit_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
  `);

  dbInstance = db;
  return dbInstance;
}

export function sqliteGetUserById(id: string): DbUser | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return (row as DbUser) || null;
}

export function sqliteGetUserByCode(code: string): DbUser | null {
  const db = getDb();
  const normalized = code.trim().toUpperCase();
  const row = db.prepare("SELECT * FROM users WHERE UPPER(participant_code) = ?").get(normalized);
  return (row as DbUser) || null;
}

export function sqliteGetUserByEmail(email: string): DbUser | null {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const row = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(normalized);
  return (row as DbUser) || null;
}

function generateParticipantCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "MED-";
  for (let i = 0; i < 4; i++) {
    const idx = crypto.randomInt(0, chars.length);
    code += chars[idx];
  }
  return code;
}

export function sqliteRegisterParticipant(data: {
  nickname: string;
  university: string;
  universityShort: string;
  career: string;
  accountSecret?: string;
}): DbUser {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  let code = generateParticipantCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = db.prepare("SELECT id FROM users WHERE participant_code = ?").get(code);
    if (!existing) break;
    code = generateParticipantCode();
    attempts++;
  }

  const insert = db.prepare(`
    INSERT INTO users (
      id, participant_code, nickname, university, university_short, career,
      role, onboarding_completed, xp, streak_days, longest_streak,
      last_study_date, account_secret, created_at, updated_at, last_active_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'student', 1, 0, 0, 0, NULL, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    code,
    data.nickname.trim(),
    data.university.trim(),
    data.universityShort.trim(),
    data.career.trim(),
    data.accountSecret || null,
    now,
    now,
    now
  );

  const standardUnits = [
    { mod: "anatomia", unit: "flashcards" },
    { mod: "anatomia", unit: "teoria" },
    { mod: "anatomia", unit: "visor-3d" },
    { mod: "bioquimica", unit: "metabolismo" },
    { mod: "histologia", unit: "tejidos" },
    { mod: "microbiologia", unit: "patogenos" },
  ];

  const initProgress = db.prepare(`
    INSERT OR IGNORE INTO unit_progress (id, user_id, module_id, unit_id, status, score, updated_at)
    VALUES (?, ?, ?, ?, 'not_started', 0, ?)
  `);

  for (const u of standardUnits) {
    initProgress.run(crypto.randomUUID(), id, u.mod, u.unit, now);
  }

  return sqliteGetUserById(id)!;
}

export function sqliteUpdateParticipantProfile(
  id: string,
  data: { nickname?: string; university?: string; universityShort?: string; career?: string; accountSecret?: string }
): DbUser | null {
  const db = getDb();
  const user = sqliteGetUserById(id);
  if (!user) return null;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE users SET
      nickname = COALESCE(?, nickname),
      university = COALESCE(?, university),
      university_short = COALESCE(?, university_short),
      career = COALESCE(?, career),
      account_secret = COALESCE(?, account_secret),
      updated_at = ?,
      last_active_at = ?
    WHERE id = ?
  `).run(
    data.nickname || null,
    data.university || null,
    data.universityShort || null,
    data.career || null,
    data.accountSecret || null,
    now,
    now,
    id
  );

  return sqliteGetUserById(id);
}

export function sqliteCreateSession(userId: string, role: "student" | "admin"): string {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO sessions (token, user_id, role, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(token, userId, role, expiresAt, now.toISOString());

  return token;
}

export function sqliteGetSession(token: string): { user: DbUser; session: { token: string; role: string } } | null {
  if (!token) return null;
  const db = getDb();
  const now = new Date().toISOString();

  const row = db.prepare(`
    SELECT s.token, s.role, s.expires_at, u.*
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, now) as any;

  if (!row) return null;

  db.prepare("UPDATE users SET last_active_at = ? WHERE id = ?").run(now, row.id);

  const user: DbUser = {
    id: row.id,
    participant_code: row.participant_code,
    email: row.email,
    password_hash: row.password_hash,
    salt: row.salt,
    account_secret: row.account_secret,
    nickname: row.nickname,
    university: row.university,
    university_short: row.university_short,
    career: row.career,
    role: row.role,
    onboarding_completed: row.onboarding_completed,
    xp: row.xp,
    streak_days: row.streak_days,
    longest_streak: row.longest_streak,
    last_study_date: row.last_study_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_active_at: now,
  };

  return { user, session: { token: row.token, role: row.role } };
}

export function sqliteDeleteSession(token: string): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function sqliteGetUserUnitProgress(userId: string): Record<string, number> {
  const db = getDb();
  const rows = db.prepare("SELECT module_id, unit_id, score FROM unit_progress WHERE user_id = ?").all(userId) as any[];
  const map: Record<string, number> = {
    "anatomia_flashcards": 0,
    "anatomia_teoria": 0,
    "anatomia_visor-3d": 0,
    "bioquimica_metabolismo": 0,
    "histologia_tejidos": 0,
    "microbiologia_patogenos": 0,
  };
  for (const r of rows) {
    map[`${r.module_id}_${r.unit_id}`] = r.score || 0;
  }
  return map;
}

export function sqliteUpdateUnitProgressDb(
  userId: string,
  moduleId: string,
  unitId: string,
  score: number
): void {
  const db = getDb();
  const now = new Date().toISOString();
  const validScore = Math.max(0, Math.min(100, Math.round(score)));
  const status = validScore >= 100 ? "completed" : validScore > 0 ? "in_progress" : "not_started";
  const completedAt = validScore >= 100 ? now : null;

  db.prepare(`
    INSERT INTO unit_progress (id, user_id, module_id, unit_id, status, score, completed_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, module_id, unit_id) DO UPDATE SET
      score = MAX(unit_progress.score, excluded.score),
      status = CASE WHEN MAX(unit_progress.score, excluded.score) >= 100 THEN 'completed'
                    WHEN MAX(unit_progress.score, excluded.score) > 0 THEN 'in_progress'
                    ELSE 'not_started' END,
      completed_at = CASE WHEN MAX(unit_progress.score, excluded.score) >= 100 THEN COALESCE(unit_progress.completed_at, excluded.completed_at)
                          ELSE NULL END,
      updated_at = excluded.updated_at
  `).run(crypto.randomUUID(), userId, moduleId, unitId, status, validScore, completedAt, now);

  db.prepare("UPDATE users SET last_active_at = ? WHERE id = ?").run(now, userId);
}

export function sqliteAddXpDb(userId: string, amount: number): number {
  const db = getDb();
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const user = sqliteGetUserById(userId);
  if (!user) return 0;

  const newXp = (user.xp || 0) + amount;
  const newStreak = user.streak_days === 0 ? 1 : user.streak_days;

  db.prepare(`
    UPDATE users SET
      xp = ?,
      streak_days = ?,
      last_study_date = ?,
      last_active_at = ?
    WHERE id = ?
  `).run(newXp, newStreak, today, now, userId);

  return newXp;
}

export function sqliteRecordQuizAttemptDb(data: {
  userId: string;
  moduleId: string;
  unitId: string;
  quizVersion: string;
  totalQuestions: number;
  correctCount: number;
  incorrectTopics: string[];
  answersSummary?: any;
  durationSeconds?: number;
}): { attempt: QuizAttemptRecord; isDuplicate: boolean; newXp: number } {
  const db = getDb();
  const now = new Date().toISOString();

  const total = Math.max(1, data.totalQuestions);
  const correct = Math.max(0, Math.min(total, data.correctCount));
  const serverScore = Math.round((correct / total) * 100);

  const windowTime = Math.floor(Date.now() / 15000);
  const submissionHash = crypto
    .createHash("sha256")
    .update(`${data.userId}_${data.moduleId}_${data.unitId}_${correct}_${total}_${windowTime}`)
    .digest("hex");

  const existingAttempt = db.prepare(
    "SELECT * FROM quiz_attempts WHERE submission_hash = ? AND user_id = ?"
  ).get(submissionHash, data.userId) as any;

  if (existingAttempt) {
    const user = sqliteGetUserById(data.userId);
    return {
      attempt: existingAttempt as QuizAttemptRecord,
      isDuplicate: true,
      newXp: user?.xp || 0,
    };
  }

  const countRow = db.prepare(
    "SELECT COUNT(*) as cnt FROM quiz_attempts WHERE user_id = ? AND module_id = ? AND unit_id = ?"
  ).get(data.userId, data.moduleId, data.unitId) as any;
  const attemptNumber = (countRow?.cnt || 0) + 1;

  const id = crypto.randomUUID();
  const incorrectJson = JSON.stringify(data.incorrectTopics || []);
  const answersJson = JSON.stringify(data.answersSummary || {});
  const duration = Math.max(0, Math.round(data.durationSeconds || 0));

  db.prepare(`
    INSERT INTO quiz_attempts (
      id, user_id, module_id, unit_id, quiz_version, attempt_number,
      score, total_questions, correct_count, incorrect_topics_json,
      answers_summary_json, duration_seconds, submission_hash, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.userId,
    data.moduleId,
    data.unitId,
    data.quizVersion || "v1.0",
    attemptNumber,
    serverScore,
    total,
    correct,
    incorrectJson,
    answersJson,
    duration,
    submissionHash,
    now
  );

  sqliteUpdateUnitProgressDb(data.userId, data.moduleId, data.unitId, serverScore);
  const xpAwarded = Math.max(10, Math.round(correct * 5));
  const newXp = sqliteAddXpDb(data.userId, xpAwarded);

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

export function sqliteRecordActivityDb(
  userId: string,
  moduleId: string,
  unitId: string,
  activityType: "reading" | "interactive" | "quiz"
): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO activity_logs (id, user_id, module_id, unit_id, activity_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), userId, moduleId, unitId, activityType, now);

  db.prepare("UPDATE users SET last_active_at = ? WHERE id = ?").run(now, userId);
}

export function sqliteGetAdminParticipantsListDb(): AdminParticipantSummary[] {
  const db = getDb();
  const students = db.prepare(`
    SELECT * FROM users WHERE role = 'student' ORDER BY created_at DESC
  `).all() as DbUser[];

  const { totalUnitsCount, enabledUnitsCount } = getTotalsConfig();
  const enabledUnitIds = getEnabledUnitIds();

  return students.map((s) => {
    const userUnits = db.prepare(`
      SELECT module_id, unit_id, score FROM unit_progress WHERE user_id = ?
    `).all(s.id) as { module_id: string; unit_id: string; score: number }[];

    const completedTotal = userUnits.filter((u) => u.score >= 100).length;
    const completedAvailable = userUnits.filter(
      (u) => enabledUnitIds.includes(u.unit_id) && u.score >= 100
    ).length;
    const historicalCompleted = userUnits.filter(
      (u) => !enabledUnitIds.includes(u.unit_id) && u.score >= 100
    ).length;

    const attempts = db.prepare(`
      SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY created_at ASC
    `).all(s.id) as QuizAttemptRecord[];

    const firstScore = attempts.length > 0 ? attempts[0].score : null;
    const latestScore = attempts.length > 0 ? attempts[attempts.length - 1].score : null;

    const topicCount: Record<string, number> = {};
    for (const a of attempts) {
      try {
        const topics = JSON.parse(a.incorrect_topics_json || "[]");
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

export function sqliteGetAdminParticipantDetailDb(userId: string) {
  const db = getDb();
  const user = sqliteGetUserById(userId);
  if (!user || user.role !== "student") return null;

  const unitProgress = db.prepare(`
    SELECT * FROM unit_progress WHERE user_id = ? ORDER BY module_id, unit_id
  `).all(userId) as any[];

  const quizAttempts = db.prepare(`
    SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC
  `).all(userId) as QuizAttemptRecord[];

  const activityLogs = db.prepare(`
    SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(userId) as any[];

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
    unitProgress,
    quizAttempts,
    activityLogs,
  };
}

export function sqliteGetAdminGlobalStatsDb() {
  const db = getDb();
  const studentsCount = (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'student'").get() as any)?.cnt || 0;
  const attemptsCount = (db.prepare("SELECT COUNT(*) as cnt FROM quiz_attempts").get() as any)?.cnt || 0;

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const activeRecently = (db.prepare(
    "SELECT COUNT(*) as cnt FROM users WHERE role = 'student' AND last_active_at >= ?"
  ).get(oneDayAgo) as any)?.cnt || 0;

  const avgScore = (db.prepare("SELECT AVG(score) as avg_score FROM quiz_attempts").get() as any)?.avg_score;

  return {
    totalStudents: studentsCount,
    activeLast24h: activeRecently,
    totalQuizAttempts: attemptsCount,
    averageQuizScore: avgScore !== null && avgScore !== undefined ? Math.round(avgScore) : null,
  };
}

export function sqliteCreateOrUpdateAdminDb(data: {
  email: string;
  passwordHash: string;
  salt: string;
  name?: string;
}): DbUser {
  const db = getDb();
  const now = new Date().toISOString();
  const normalizedEmail = data.email.trim().toLowerCase();

  const existing = sqliteGetUserByEmail(normalizedEmail);

  if (existing) {
    db.prepare(`
      UPDATE users SET
        password_hash = ?,
        salt = ?,
        nickname = COALESCE(?, nickname),
        role = 'admin',
        updated_at = ?
      WHERE id = ?
    `).run(data.passwordHash, data.salt, data.name || null, now, existing.id);
    return sqliteGetUserById(existing.id)!;
  } else {
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (
        id, email, password_hash, salt, nickname, university, university_short,
        career, role, onboarding_completed, xp, streak_days, longest_streak,
        created_at, updated_at, last_active_at
      ) VALUES (?, ?, ?, ?, ?, 'Administración Central', 'ADMIN', 'Responsable del Proyecto', 'admin', 1, 0, 0, 0, ?, ?, ?)
    `).run(id, normalizedEmail, data.passwordHash, data.salt, data.name || "Administrador MedStudy", now, now, now);
    return sqliteGetUserById(id)!;
  }
}

export function sqliteCheckAndIncrementRateLimit(
  key: string,
  maxAttempts: number = 5,
  lockoutMinutes: number = 15
): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  const db = getDb();
  const now = new Date();
  const nowIso = now.toISOString();

  const record = db.prepare("SELECT * FROM login_rate_limits WHERE key = ?").get(key) as any;

  if (record && record.blocked_until) {
    const blockedUntil = new Date(record.blocked_until);
    if (blockedUntil > now) {
      const retryAfterSeconds = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000);
      return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
    }
  }

  if (!record) {
    db.prepare(`
      INSERT INTO login_rate_limits (id, key, attempts, last_attempt_at)
      VALUES (?, ?, 1, ?)
    `).run(crypto.randomUUID(), key, nowIso);
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }

  const lastAttempt = new Date(record.last_attempt_at);
  const diffMinutes = (now.getTime() - lastAttempt.getTime()) / (60 * 1000);

  if (diffMinutes > lockoutMinutes) {
    db.prepare(`
      UPDATE login_rate_limits SET attempts = 1, blocked_until = NULL, last_attempt_at = ? WHERE key = ?
    `).run(nowIso, key);
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }

  const nextAttempts = record.attempts + 1;
  if (nextAttempts >= maxAttempts) {
    const blockedUntil = new Date(now.getTime() + lockoutMinutes * 60 * 1000).toISOString();
    db.prepare(`
      UPDATE login_rate_limits SET attempts = ?, blocked_until = ?, last_attempt_at = ? WHERE key = ?
    `).run(nextAttempts, blockedUntil, nowIso, key);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds: lockoutMinutes * 60 };
  }

  db.prepare(`
    UPDATE login_rate_limits SET attempts = ?, last_attempt_at = ? WHERE key = ?
  `).run(nextAttempts, nowIso, key);

  return { allowed: true, remainingAttempts: maxAttempts - nextAttempts };
}
