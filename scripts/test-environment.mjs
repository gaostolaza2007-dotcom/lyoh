import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import http from "http";
import { spawn, execSync } from "child_process";
import { DatabaseSync } from "node:sqlite";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

let portCounter = 3080;
function getNextTestPort() {
  portCounter++;
  if (portCounter > 3150) portCounter = 3080;
  return portCounter;
}

export async function createIsolatedTestEnv(prefix = "medstudy-test-") {
  // 1. Directorio temporal único por ejecución
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const testDbPath = path.join(tempDir, "test.db");
  const realDbPath = path.resolve(process.cwd(), "data", "medstudy.db");

  // 2. Abortar estrictamente si la ruta coincide con la real
  if (path.resolve(testDbPath).toLowerCase() === realDbPath.toLowerCase()) {
    throw new Error(`ABORTANDO: La base de prueba coincide con la base real: ${testDbPath}`);
  }

  // 3. Inicializar esquema en la base de datos temporal
  const db = new DatabaseSync(testDbPath);
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
      key TEXT UNIQUE,
      attempts INTEGER DEFAULT 1 NOT NULL,
      blocked_until TEXT,
      last_attempt_at TEXT NOT NULL
    );
  `);

  // Crear administrador de prueba dentro de la base de prueba aislada
  const { hash, salt } = hashPassword("TestAdminPass123");
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO users (
      id, email, password_hash, salt, nickname, university, university_short,
      career, role, onboarding_completed, xp, streak_days, longest_streak,
      created_at, updated_at, last_active_at
    ) VALUES (?, 'admin@medstudy.app', ?, ?, 'Admin Test', 'UDD', 'UDD', 'Investigación', 'admin', 1, 0, 0, 0, ?, ?, ?)
  `).run(crypto.randomUUID(), hash, salt, now, now, now);

  db.close();

  // 4. Iniciar servidor Next.js de prueba en puerto separado
  const port = getNextTestPort();
  const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

  console.log(`[TEST-ENV] Directorio temporal: ${tempDir}`);
  console.log(`[TEST-ENV] Base temporal: ${testDbPath}`);
  console.log(`[TEST-ENV] Iniciando servidor de pruebas en puerto ${port}...`);

  const serverProcess = spawn(
    process.execPath,
    [nextBin, "dev", "-p", String(port), "-H", "127.0.0.1"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(port),
        MEDSTUDY_DB_PATH: testDbPath,
        NEXT_DIST_DIR: ".next_test",
        NEXT_PUBLIC_SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
      },
      stdio: "pipe",
    }
  );

  let isReady = false;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout esperando a que el servidor de prueba en 127.0.0.1:${port} inicie.`));
    }, 25000);

    serverProcess.stdout?.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("Ready in")) {
        if (!isReady) {
          isReady = true;
          clearTimeout(timeout);
          resolve();
        }
      }
    });

    serverProcess.stderr?.on("data", (data) => {
      const errStr = data.toString();
      if (!errStr.includes("serverComponentsExternalPackages")) {
        console.error("[TEST-SERVER STDERR]", errStr);
      }
    });

    serverProcess.on("exit", (code) => {
      if (!isReady) {
        clearTimeout(timeout);
        reject(new Error(`El servidor de prueba salió prematuramente con código ${code}`));
      }
    });
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[TEST-ENV] Servidor de pruebas listo en ${baseUrl}\n`);

  async function cleanup() {
    console.log("\n[TEST-ENV] Limpiando entorno de prueba...");
    if (serverProcess && serverProcess.pid) {
      try {
        if (process.platform === "win32") {
          execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: "ignore" });
        } else {
          serverProcess.kill("SIGKILL");
        }
      } catch {}
    }

    // Esperar a que el proceso libere los archivos antes de borrar
    await new Promise((r) => setTimeout(r, 1000));

    try {
      fs.rmSync(tempDir, { recursive: true, force: true, maxRetries: 3 });
      console.log(`[TEST-ENV] Directorio temporal eliminado: ${tempDir}`);
    } catch (e) {
      console.warn(`[TEST-ENV] Advertencia al eliminar directorio temporal: ${e.message}`);
    }

    const testDistPath = path.join(process.cwd(), ".next_test");
    if (fs.existsSync(testDistPath)) {
      try {
        fs.rmSync(testDistPath, { recursive: true, force: true, maxRetries: 3 });
        console.log("[TEST-ENV] Directorio de compilación .next_test eliminado.");
      } catch {}
    }
  }

  return {
    tempDir,
    testDbPath,
    port,
    baseUrl,
    cleanup,
  };
}
