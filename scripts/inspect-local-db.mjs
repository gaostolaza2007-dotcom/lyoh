import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/medstudy.db");
const users = db.prepare("SELECT id, role, nickname, email, participant_code, university, career, xp, streak_days, longest_streak, onboarding_completed, created_at FROM users").all();

console.log("=== USUARIOS EN SQLITE LOCAL (data/medstudy.db) ===");
console.log("Total usuarios encontrados:", users.length);

users.forEach((u, i) => {
  console.log(`[${i+1}] ${u.nickname} (${u.participant_code || u.email}):\n    created_at:     ${u.created_at}\n    updated_at:     ${u.updated_at}\n    last_active_at: ${u.last_active_at}`);
});

const allSessions = db.prepare("SELECT token, user_id, role, created_at, expires_at FROM sessions ORDER BY created_at DESC").all();
console.log("\n=== FECHAS DE SESIONES EN SQLITE ===");
allSessions.forEach(s => {
  const u = users.find(x => x.id === s.user_id);
  console.log(`- Token ${s.token.substring(0, 8)}... (${u?.nickname || s.user_id}): created_at=${s.created_at} | expires_at=${s.expires_at}`);
});

const progress = db.prepare("SELECT user_id, COUNT(*) as cnt, SUM(score) as totalScore FROM unit_progress GROUP BY user_id").all();
console.log("\n=== PROGRESO ASOCIADO EN SQLITE ===");
progress.forEach(p => {
  const user = users.find(u => u.id === p.user_id);
  console.log(`- ${user ? user.nickname : p.user_id}: ${p.cnt} unidades, Puntaje acumulado: ${p.totalScore}`);
});

const sessions = db.prepare("SELECT user_id, COUNT(*) as cnt FROM sessions GROUP BY user_id").all();
console.log("\n=== SESIONES EN SQLITE ===");
sessions.forEach(s => {
  const user = users.find(u => u.id === s.user_id);
  console.log(`- ${user ? user.nickname : s.user_id}: ${s.cnt} sesiones`);
});

const rawSessions = db.prepare("SELECT token, user_id, role, expires_at FROM sessions").all();
console.log("Detalle sesiones:", rawSessions.map(s => ({
  user: users.find(u => u.id === s.user_id)?.nickname || s.user_id.substring(0, 8),
  role: s.role,
  active: new Date(s.expires_at) > new Date()
})));

const attempts = db.prepare("SELECT COUNT(*) as cnt FROM quiz_attempts").get();
console.log("\n=== EVALUACIONES EN SQLITE ===");
console.log("Total quiz_attempts:", attempts.cnt);

db.close();
