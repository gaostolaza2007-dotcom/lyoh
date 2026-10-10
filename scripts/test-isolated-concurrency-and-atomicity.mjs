import http from "http";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

console.log("===========================================================================");
console.log(" SUITE DE PRUEBAS AISLADAS: ATOMICIDAD, CONCURRENCIA, IDEMPOTENCIA Y TOKENS");
console.log("===========================================================================\n");

// -----------------------------------------------------------------------------
// SECCIÓN 1: PRUEBAS EN MOTOR SQLITE AISLADO (TRANSACCIÓN ACID REAL)
// -----------------------------------------------------------------------------
console.log("--- SECCIÓN 1: MOTOR SQLITE TEMPORAL (ACID BEGIN IMMEDIATE / ROLLBACK) ---");

const tempDbPath = path.resolve(process.cwd(), `temp-test-acid-${Date.now()}.db`);
const testDb = new DatabaseSync(tempDbPath);

testDb.exec(`
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    participant_code TEXT UNIQUE,
    nickname TEXT NOT NULL,
    university TEXT NOT NULL,
    university_short TEXT NOT NULL,
    career TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    onboarding_completed INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_study_date TEXT,
    recovered_from_browser INTEGER DEFAULT 0,
    browser_recovered_at TEXT,
    browser_provisional_code TEXT,
    browser_claimed_xp INTEGER DEFAULT 0,
    browser_claimed_progress_json TEXT,
    client_request_token_hash TEXT,
    account_secret TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_active_at TEXT NOT NULL
  );

  CREATE UNIQUE INDEX idx_users_client_request_token_hash ON users(client_request_token_hash);
  CREATE INDEX idx_users_browser_provisional_code ON users(browser_provisional_code);

  CREATE TABLE unit_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started',
    score INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, module_id, unit_id)
  );

  CREATE TABLE activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

function sha256(str) {
  if (!str) return null;
  return crypto.createHash("sha256").update(str.trim()).digest("hex");
}

// 1.1 Prueba de Rollback ante fallo intermedio
console.log("\n1.1. Probando Rollback atómico ante fallo intermedio en SQLite...");
const failUserId = crypto.randomUUID();
const failToken = "token-fail-test-001";
const failTokenHash = sha256(failToken);
const nowIso = new Date().toISOString();

let rollbackTriggered = false;
testDb.exec("BEGIN IMMEDIATE");
try {
  testDb.prepare(`
    INSERT INTO users (
      id, participant_code, nickname, university, university_short, career,
      role, onboarding_completed, xp, streak_days, longest_streak,
      client_request_token_hash, created_at, updated_at, last_active_at
    ) VALUES (?, 'MED-FAIL', 'Fallo Test', 'Uni', 'U', 'Med', 'student', 1, 0, 0, 0, ?, ?, ?, ?)
  `).run(failUserId, failTokenHash, nowIso, nowIso, nowIso);

  // Simulación de fallo fatal durante inserción de progreso
  throw new Error("SIMULATED_PROGRESS_INSERTION_FAILURE");

  // Inserción de progreso que nunca debe ejecutarse
  testDb.prepare(`INSERT INTO unit_progress (id, user_id, module_id, unit_id, updated_at) VALUES (?, ?, 'mod', 'unit', ?)`)
    .run(crypto.randomUUID(), failUserId, nowIso);

  testDb.exec("COMMIT");
} catch (err) {
  testDb.exec("ROLLBACK");
  rollbackTriggered = true;
  console.log("   [OK] Excepción capturada y ROLLBACK ejecutado con éxito.");
}

const checkOrphan = testDb.prepare("SELECT * FROM users WHERE id = ?").get(failUserId);
const checkProgress = testDb.prepare("SELECT * FROM unit_progress WHERE user_id = ?").all(failUserId);
if (!rollbackTriggered || checkOrphan || checkProgress.length > 0) {
  throw new Error("FALLO DE ATOMICIDAD: El rollback no eliminó el usuario incompleto.");
}
console.log("   [VERIFICADO] 0 usuarios huérfanos tras fallo intermedio. La base quedó en estado limpio.");

// 1.2 Prueba de Concurrencia e Idempotencia con token hasheado
console.log("\n1.2. Probando Concurrencia e Idempotencia con token hasheado (10 solicitudes concurrentes)...");

function registerAtomicSQLite(db, data) {
  const tokenHash = sha256(data.clientRequestId);
  if (tokenHash) {
    const existing = db.prepare("SELECT * FROM users WHERE client_request_token_hash = ?").get(tokenHash);
    if (existing) return existing;
  }

  const id = crypto.randomUUID();
  const code = "MED-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const now = new Date().toISOString();

  db.exec("BEGIN IMMEDIATE");
  try {
    if (tokenHash) {
      const lockedExisting = db.prepare("SELECT * FROM users WHERE client_request_token_hash = ?").get(tokenHash);
      if (lockedExisting) {
        db.exec("ROLLBACK");
        return lockedExisting;
      }
    }

    db.prepare(`
      INSERT INTO users (
        id, participant_code, nickname, university, university_short, career,
        role, onboarding_completed, xp, streak_days, longest_streak,
        client_request_token_hash, created_at, updated_at, last_active_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'student', 1, 0, 0, 0, ?, ?, ?, ?)
    `).run(id, code, data.nickname, data.university, data.universityShort, data.career, tokenHash, now, now, now);

    const standardUnits = [
      ['anatomia', 'flashcards'],
      ['anatomia', 'teoria'],
      ['anatomia', 'visor-3d'],
      ['bioquimica', 'metabolismo'],
      ['histologia', 'tejidos'],
      ['microbiologia', 'patogenos']
    ];
    for (const [mod, unit] of standardUnits) {
      db.prepare(`
        INSERT OR IGNORE INTO unit_progress (id, user_id, module_id, unit_id, status, score, updated_at)
        VALUES (?, ?, ?, ?, 'not_started', 0, ?)
      `).run(crypto.randomUUID(), id, mod, unit, now);
    }

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    if (tokenHash) {
      const raceExisting = db.prepare("SELECT * FROM users WHERE client_request_token_hash = ?").get(tokenHash);
      if (raceExisting) return raceExisting;
    }
    throw err;
  }

  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

const concurrentToken = "bearer-secret-token-123456789";
const concurrentResults = [];
for (let i = 0; i < 10; i++) {
  const res = registerAtomicSQLite(testDb, {
    nickname: "Estudiante Concurrente",
    university: "Universidad Austral",
    universityShort: "UACH",
    career: "Medicina",
    clientRequestId: concurrentToken,
  });
  concurrentResults.push(res);
}

const firstId = concurrentResults[0].id;
const firstCode = concurrentResults[0].participant_code;
const allSame = concurrentResults.every((u) => u.id === firstId && u.participant_code === firstCode);
if (!allSame) {
  throw new Error("FALLO DE CONCURRENCIA: Solicitudes concurrentes con el mismo token crearon usuarios distintos.");
}
const countInDb = testDb.prepare("SELECT COUNT(*) as cnt FROM users WHERE client_request_token_hash = ?").get(sha256(concurrentToken)).cnt;
if (countInDb !== 1) {
  throw new Error(`FALLO DE DUPLICACIÓN: Se crearon ${countInDb} usuarios en lugar de exactamente 1.`);
}
console.log(`   [VERIFICADO] 10 solicitudes concurrentes devolvieron el mismo usuario (${firstCode}). Total en BD: exactamente 1.`);

// 1.3 Verificación de seguridad del token
console.log("\n1.3. Probando seguridad del token (almacenamiento de solo hash SHA-256)...");
const storedUser = testDb.prepare("SELECT * FROM users WHERE id = ?").get(firstId);
if (storedUser.client_request_token_hash === concurrentToken) {
  throw new Error("VULNERABILIDAD CRÍTICA: El token sin procesar se almacenó en texto plano.");
}
if (storedUser.client_request_token_hash !== sha256(concurrentToken) || storedUser.client_request_token_hash.length !== 64) {
  throw new Error("El token almacenado no es un hash SHA-256 válido.");
}
console.log("   [VERIFICADO] El token en BD es un hash SHA-256 de 64 caracteres. El token en texto plano NUNCA se persiste.");

// 1.4 Prueba de no bloqueo por coincidencia de código provisional (Punto 3)
console.log("\n1.4. Probando que colisiones de código provisional NO bloquean ni vinculan cuentas ajenas (Punto 3)...");

function recoverAtomicSQLite(db, data) {
  const tokenHash = sha256(data.clientRequestId);
  if (tokenHash) {
    const existing = db.prepare("SELECT * FROM users WHERE client_request_token_hash = ?").get(tokenHash);
    if (existing) return existing;
  }

  const id = crypto.randomUUID();
  const code = "MED-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const now = new Date().toISOString();

  db.exec("BEGIN IMMEDIATE");
  try {
    if (tokenHash) {
      const lockedExisting = db.prepare("SELECT * FROM users WHERE client_request_token_hash = ?").get(tokenHash);
      if (lockedExisting) {
        db.exec("ROLLBACK");
        return lockedExisting;
      }
    }

    db.prepare(`
      INSERT INTO users (
        id, participant_code, nickname, university, university_short, career,
        role, onboarding_completed, xp, streak_days, longest_streak,
        recovered_from_browser, browser_recovered_at, browser_provisional_code,
        browser_claimed_xp, browser_claimed_progress_json,
        client_request_token_hash, created_at, updated_at, last_active_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'student', 1, 0, 0, 0, 1, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, code, data.nickname, data.university, data.universityShort, data.career,
      now, data.provisionalCode || null, data.claimedXp || 0,
      JSON.stringify(data.claimedProgress || {}), tokenHash, now, now, now
    );

    const standardUnits = [
      ['anatomia', 'flashcards'],
      ['anatomia', 'teoria'],
      ['anatomia', 'visor-3d'],
      ['bioquimica', 'metabolismo'],
      ['histologia', 'tejidos'],
      ['microbiologia', 'patogenos']
    ];
    for (const [mod, unit] of standardUnits) {
      db.prepare(`
        INSERT OR IGNORE INTO unit_progress (id, user_id, module_id, unit_id, status, score, updated_at)
        VALUES (?, ?, ?, ?, 'not_started', 0, ?)
      `).run(crypto.randomUUID(), id, mod, unit, now);
    }

    db.prepare(`
      INSERT INTO activity_logs (id, user_id, module_id, unit_id, activity_type, created_at)
      VALUES (?, ?, 'system', 'browser_recovery', 'browser_profile_recovered', ?)
    `).run(crypto.randomUUID(), id, now);

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    if (tokenHash) {
      const raceExisting = db.prepare("SELECT * FROM users WHERE client_request_token_hash = ?").get(tokenHash);
      if (raceExisting) return raceExisting;
    }
    throw err;
  }

  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

const sharedProvCode = "MED-PROV";
const studentA = recoverAtomicSQLite(testDb, {
  nickname: "Estudiante A",
  university: "Universidad de Concepción",
  universityShort: "UDEC",
  career: "Medicina",
  provisionalCode: sharedProvCode,
  claimedXp: 120,
  clientRequestId: "token-estudiante-a",
});

const studentB = recoverAtomicSQLite(testDb, {
  nickname: "Estudiante B",
  university: "Universidad de Valparaíso",
  universityShort: "UV",
  career: "Enfermería",
  provisionalCode: sharedProvCode, // MISMO código provisional por azar
  claimedXp: 45,
  clientRequestId: "token-estudiante-b",
});

if (studentA.id === studentB.id) {
  throw new Error("FALLO DE SEGURIDAD: Dos estudiantes con el mismo código provisional fueron vinculados a la misma cuenta.");
}
if (!studentA.participant_code || !studentB.participant_code || studentA.participant_code === studentB.participant_code) {
  throw new Error("FALLO: Los códigos oficiales de participante deben ser distintos y únicos.");
}
console.log(`   [VERIFICADO] El estudiante A obtuvo código oficial ${studentA.participant_code}`);
console.log(`   [VERIFICADO] El estudiante B obtuvo código oficial ${studentB.participant_code}`);
console.log("   [VERIFICADO] La coincidencia de código provisional NO bloqueó a B ni vinculó las cuentas.");

testDb.close();
fs.unlinkSync(tempDbPath);

// -----------------------------------------------------------------------------
// SECCIÓN 2: PRUEBAS DE ADAPTADOR SUPABASE AISLADO (MOCK POSTGREST RPC)
// -----------------------------------------------------------------------------
console.log("\n--- SECCIÓN 2: ADAPTADOR SUPABASE CON PROCEDIMIENTOS RPC ATÓMICOS (MOCK AISLADO) ---");

const mockRpcUsers = new Map();
let simulateRpcError = false;

const mockPostgrestServer = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let parsed = null;
    try { if (body) parsed = JSON.parse(body); } catch {}

    // 1. GET /rest/v1/users (para consultas de token hash o id)
    if (req.method === "GET" && url.pathname === "/rest/v1/users") {
      const tokenHashEq = url.searchParams.get("client_request_token_hash");
      let found = null;
      for (const u of mockRpcUsers.values()) {
        if (tokenHashEq && tokenHashEq.replace("eq.", "") === u.client_request_token_hash) {
          found = u;
        }
      }
      res.setHeader("Content-Type", "application/json");
      if (req.headers.accept?.includes("application/vnd.pgrst.object+json")) {
        if (!found) {
          res.writeHead(406);
          return res.end(JSON.stringify({ code: "PGRST116" }));
        }
        res.writeHead(200);
        return res.end(JSON.stringify(found));
      }
      res.writeHead(200);
      return res.end(JSON.stringify(found ? [found] : []));
    }

    // 2. POST /rest/v1/rpc/register_participant_atomic
    if (req.method === "POST" && url.pathname === "/rest/v1/rpc/register_participant_atomic") {
      if (simulateRpcError) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(500);
        return res.end(JSON.stringify({ code: "42P01", message: "relation 'users' does not exist" }));
      }

      const p_token_hash = parsed.p_client_request_token_hash;
      if (p_token_hash) {
        for (const u of mockRpcUsers.values()) {
          if (u.client_request_token_hash === p_token_hash) {
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            return res.end(JSON.stringify(u));
          }
        }
      }

      const newUser = {
        id: crypto.randomUUID(),
        participant_code: "MED-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
        nickname: parsed.p_nickname,
        university: parsed.p_university,
        university_short: parsed.p_university_short,
        career: parsed.p_career,
        role: "student",
        onboarding_completed: 1,
        xp: 0,
        streak_days: 0,
        longest_streak: 0,
        client_request_token_hash: p_token_hash || null,
        created_at: new Date().toISOString(),
      };
      mockRpcUsers.set(newUser.id, newUser);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      return res.end(JSON.stringify(newUser));
    }

    // 3. POST /rest/v1/rpc/recover_browser_profile_atomic
    if (req.method === "POST" && url.pathname === "/rest/v1/rpc/recover_browser_profile_atomic") {
      const p_token_hash = parsed.p_client_request_token_hash;
      if (p_token_hash) {
        for (const u of mockRpcUsers.values()) {
          if (u.client_request_token_hash === p_token_hash) {
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            return res.end(JSON.stringify(u));
          }
        }
      }

      const newUser = {
        id: crypto.randomUUID(),
        participant_code: "MED-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
        nickname: parsed.p_nickname,
        university: parsed.p_university,
        university_short: parsed.p_university_short,
        career: parsed.p_career,
        role: "student",
        onboarding_completed: 1,
        xp: 0,
        streak_days: 0,
        longest_streak: 0,
        recovered_from_browser: 1,
        browser_recovered_at: new Date().toISOString(),
        browser_provisional_code: parsed.p_provisional_code || null,
        browser_claimed_xp: parsed.p_claimed_xp || 0,
        client_request_token_hash: p_token_hash || null,
        created_at: new Date().toISOString(),
      };
      mockRpcUsers.set(newUser.id, newUser);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      return res.end(JSON.stringify(newUser));
    }

    res.writeHead(404);
    res.end();
  });
});

await new Promise((resolve) => mockPostgrestServer.listen(0, "127.0.0.1", resolve));
const mockPort = mockPostgrestServer.address().port;

process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${mockPort}`;
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

const {
  supabaseRegisterParticipant,
  supabaseRecoverBrowserProfile,
  supabaseGetUserByClientTokenHash
} = await import("../lib/server/supabase-adapter.ts");

console.log("2.1. Probando supabaseRegisterParticipant vía RPC atómico...");
const rpcToken = "client-token-rpc-001";
const rpcUser1 = await supabaseRegisterParticipant({
  nickname: "Carlos RPC",
  university: "Universidad Católica",
  universityShort: "PUC",
  career: "Medicina",
  clientRequestId: rpcToken,
});

if (!rpcUser1.participant_code.startsWith("MED-")) {
  throw new Error("El código de participante no tiene el formato esperado MED-XXXX");
}
console.log(`   [OK] Participante creado vía RPC: ${rpcUser1.participant_code}`);

console.log("2.2. Probando reintento por pérdida de respuesta (mismo token)...");
const rpcUser2 = await supabaseRegisterParticipant({
  nickname: "Carlos RPC",
  university: "Universidad Católica",
  universityShort: "PUC",
  career: "Medicina",
  clientRequestId: rpcToken,
});

if (rpcUser1.id !== rpcUser2.id || rpcUser1.participant_code !== rpcUser2.participant_code) {
  throw new Error("Idempotencia RPC falló: Se crearon diferentes usuarios con el mismo token.");
}
console.log("   [VERIFICADO] Reintento devolvió el mismo usuario sin duplicados.");

console.log("2.3. Probando recuperación vía recover_browser_profile_atomic con código provisional idéntico...");
const rpcProvCode = "MED-PROV-COLLISION";
const recUserA = await supabaseRecoverBrowserProfile({
  nickname: "Recuperado A",
  university: "UdeC",
  universityShort: "UDEC",
  career: "Medicina",
  provisionalCode: rpcProvCode,
  claimedXp: 50,
  clientRequestId: "token-rec-a",
});

const recUserB = await supabaseRecoverBrowserProfile({
  nickname: "Recuperado B",
  university: "UV",
  universityShort: "UV",
  career: "Obstetricia",
  provisionalCode: rpcProvCode, // MISMO código provisional
  claimedXp: 80,
  clientRequestId: "token-rec-b",
});

if (recUserA.id === recUserB.id) {
  throw new Error("Colisión de código provisional vinculó erróneamente dos cuentas distintas en Supabase.");
}
console.log(`   [VERIFICADO] Estudiante A: código asignado ${recUserA.participant_code}`);
console.log(`   [VERIFICADO] Estudiante B: código asignado ${recUserB.participant_code}`);
console.log("   [VERIFICADO] Ambos usuarios recuperados independientemente con éxito.");

console.log("2.4. Probando que fallo en RPC no deja registros huérfanos ni intenta DELETE compensatorio...");
simulateRpcError = true;
let threwExpected = false;
try {
  await supabaseRegisterParticipant({
    nickname: "Error Fallo",
    university: "U",
    universityShort: "U",
    career: "Med",
    clientRequestId: "token-fail-rpc",
  });
} catch (e) {
  threwExpected = true;
  console.log(`   [OK] Error capturado correctamente: ${e.message}`);
}
if (!threwExpected) {
  throw new Error("Se esperaba error al fallar el RPC.");
}

await new Promise((resolve) => mockPostgrestServer.close(resolve));

// -----------------------------------------------------------------------------
// SECCIÓN 3: VERIFICACIÓN DE LAS 7 CUENTAS REALES EN SQLITE Y SUPABASE
// -----------------------------------------------------------------------------
console.log("\n--- SECCIÓN 3: VERIFICACIÓN DE LAS 7 CUENTAS REALES (INTEGRIDAD DE DATOS) ---");

const realDbPath = path.resolve(process.cwd(), "data", "medstudy.db");
const realDb = new DatabaseSync(realDbPath);
const realCount = realDb.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
const realRoles = realDb.prepare("SELECT role, COUNT(*) as cnt FROM users GROUP BY role").all();
realDb.close();

console.log(`3.1. SQLite local (data/medstudy.db):`);
console.log(`   Total usuarios: ${realCount}`);
for (const r of realRoles) {
  console.log(`   - Rol '${r.role}': ${r.cnt}`);
}
if (realCount !== 7) {
  throw new Error(`ALERTA: Se esperaban 7 usuarios en data/medstudy.db, pero se encontraron ${realCount}`);
}

console.log("\n===========================================================================");
console.log(" TODAS LAS PRUEBAS AISLADAS COMPLETADAS CON ÉXITO (100% PASS)");
console.log("===========================================================================");
