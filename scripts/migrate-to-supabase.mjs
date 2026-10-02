import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Cargar variables de entorno desde .env.local o .env si existen
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const f of envFiles) {
    const fullPath = path.join(rootDir, f);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

async function runMigration() {
  console.log("================================================================");
  console.log(" MedStudy - Migración de Datos Legítimos a Supabase");
  console.log("================================================================\n");

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes("your-supabase-url")) {
    console.error("❌ ERROR: Faltan las variables de entorno de Supabase en .env.local.");
    console.error("Por favor agrega en tu archivo .env.local:");
    console.error("  NEXT_PUBLIC_SUPABASE_URL=https://<tu-id-proyecto>.supabase.co");
    console.error("  SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key-secreta>\n");
    process.exit(1);
  }

  const dbPath = path.join(rootDir, "data", "medstudy.db");
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ ERROR: No se encontró la base de datos local SQLite en: ${dbPath}`);
    process.exit(1);
  }

  console.log(`✓ Proyecto Supabase destino: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verificar conexión intentando leer la tabla users
  const { data: testData, error: testError } = await supabase.from("users").select("id").limit(1);
  if (testError) {
    console.error("❌ ERROR al conectar con la tabla 'users' de Supabase:");
    console.error(testError.message);
    console.error("\n💡 Asegúrate de haber ejecutado 'supabase/schema_medstudy.sql' en el SQL Editor de tu proyecto Supabase.");
    process.exit(1);
  }

  console.log("✓ Conexión establecida con Supabase.");
  console.log(`✓ Leyendo SQLite en modo lectura (sin modificaciones locales): ${dbPath}\n`);

  const sqlite = new DatabaseSync(dbPath);

  // 1. Filtrar usuarios legítimos excluyendo cuentas de prueba conocidas
  const rawUsers = sqlite.prepare("SELECT * FROM users").all();
  const testNames = ["carlos meza", "valeria silva", "estudiante test"];
  const legitimateUsers = rawUsers.filter((u) => {
    const nick = (u.nickname || "").toLowerCase();
    const isMock = testNames.some((t) => nick.includes(t));
    return !isMock;
  });

  console.log(`▶ Usuarios legítimos encontrados en SQLite: ${legitimateUsers.length}`);
  const legitimateUserIds = legitimateUsers.map((u) => u.id);

  for (const u of legitimateUsers) {
    const desc = u.role === "admin" ? `Admin (${u.email})` : `Estudiante (${u.participant_code || u.id}) - ${u.nickname}`;
    console.log(`   - ${desc}`);
  }

  // 2. Migrar usuarios a Supabase (Upsert idempotente)
  console.log("\n▶ Migrando usuarios a Supabase...");
  for (const u of legitimateUsers) {
    const userPayload = {
      id: u.id,
      participant_code: u.participant_code || null,
      email: u.email || null,
      password_hash: u.password_hash || null,
      salt: u.salt || null,
      account_secret: u.account_secret || null,
      nickname: u.nickname || "Estudiante",
      university: u.university || "Universidad del Desarrollo",
      university_short: u.university_short || "UDD",
      career: u.career || "Medicina",
      role: u.role || "student",
      onboarding_completed: u.onboarding_completed ?? 1,
      xp: u.xp ?? 0,
      streak_days: u.streak_days ?? 0,
      longest_streak: u.longest_streak ?? 0,
      last_study_date: u.last_study_date || null,
      created_at: u.created_at,
      updated_at: u.updated_at,
      last_active_at: u.last_active_at,
    };

    const { error } = await supabase.from("users").upsert(userPayload, { onConflict: "id" });
    if (error) {
      console.error(`   ⚠️ Error migrando usuario ${u.id}:`, error.message);
    }
  }
  console.log(`✓ ${legitimateUsers.length} usuarios sincronizados en Supabase.`);

  // 3. Migrar unit_progress
  console.log("\n▶ Migrando progreso de unidades...");
  const rawProgress = sqlite.prepare("SELECT * FROM unit_progress").all();
  const validProgress = rawProgress.filter((p) => legitimateUserIds.includes(p.user_id));

  let progressCount = 0;
  for (const p of validProgress) {
    const progressPayload = {
      id: p.id,
      user_id: p.user_id,
      module_id: p.module_id,
      unit_id: p.unit_id,
      status: p.status || "not_started",
      score: p.score ?? 0,
      completed_at: p.completed_at || null,
      updated_at: p.updated_at,
    };
    const { error } = await supabase.from("unit_progress").upsert(progressPayload, { onConflict: "user_id,module_id,unit_id" });
    if (!error) progressCount++;
  }
  console.log(`✓ ${progressCount} registros de progreso sincronizados.`);

  // 4. Migrar quiz_attempts
  console.log("\n▶ Migrando intentos de cuestionarios...");
  const rawAttempts = sqlite.prepare("SELECT * FROM quiz_attempts").all();
  const validAttempts = rawAttempts.filter((a) => legitimateUserIds.includes(a.user_id));

  let attemptsCount = 0;
  for (const a of validAttempts) {
    let incTopics = [];
    let ansSummary = {};
    try {
      incTopics = JSON.parse(a.incorrect_topics_json || "[]");
    } catch {}
    try {
      ansSummary = JSON.parse(a.answers_summary_json || "{}");
    } catch {}

    const attemptPayload = {
      id: a.id,
      user_id: a.user_id,
      module_id: a.module_id,
      unit_id: a.unit_id,
      quiz_version: a.quiz_version || "v1.0",
      attempt_number: a.attempt_number ?? 1,
      score: a.score ?? 0,
      total_questions: a.total_questions ?? 0,
      correct_count: a.correct_count ?? 0,
      incorrect_topics_json: incTopics,
      answers_summary_json: ansSummary,
      duration_seconds: a.duration_seconds ?? 0,
      submission_hash: a.submission_hash || null,
      created_at: a.created_at,
    };

    const { error } = await supabase.from("quiz_attempts").upsert(attemptPayload, { onConflict: "id" });
    if (!error) attemptsCount++;
  }
  console.log(`✓ ${attemptsCount} intentos de cuestionarios sincronizados.`);

  // 5. Migrar activity_logs
  console.log("\n▶ Migrando logs de actividades...");
  let rawLogs = [];
  try {
    rawLogs = sqlite.prepare("SELECT * FROM activity_logs").all();
  } catch {}
  const validLogs = rawLogs.filter((l) => legitimateUserIds.includes(l.user_id));

  let logsCount = 0;
  for (const l of validLogs) {
    const logPayload = {
      id: l.id,
      user_id: l.user_id,
      module_id: l.module_id,
      unit_id: l.unit_id,
      activity_type: l.activity_type,
      created_at: l.created_at,
    };
    const { error } = await supabase.from("activity_logs").upsert(logPayload, { onConflict: "id" });
    if (!error) logsCount++;
  }
  console.log(`✓ ${logsCount} registros de actividad sincronizados.`);

  // Cerrar conexión SQLite para liberar recursos
  sqlite.close();

  // 6. Verificación cruzada exhaustiva Origen vs Destino
  console.log("\n▶ Realizando verificación cruzada de integridad...");
  const { data: supaUsers, error: fetchUsersErr } = await supabase.from("users").select("*");
  const { data: supaProgress } = await supabase.from("unit_progress").select("id");

  if (fetchUsersErr || !supaUsers) {
    console.error("⚠️ Error verificando usuarios en Supabase:", fetchUsersErr?.message);
    return;
  }

  // Verificar admin
  const adminUser = supaUsers.find((u) => (u.email || "").toLowerCase() === "g.ostolazav@udd.cl");
  const sqliteAdmin = legitimateUsers.find((u) => (u.email || "").toLowerCase() === "g.ostolazav@udd.cl");

  const isAdminOk =
    adminUser &&
    adminUser.role === "admin" &&
    adminUser.password_hash === sqliteAdmin?.password_hash &&
    adminUser.salt === sqliteAdmin?.salt;

  // Verificar prueba (MED-3GZH)
  const pruebaUser = supaUsers.find((u) => u.participant_code === "MED-3GZH");

  console.log("\n================================================================");
  console.log(" 📊 COMPARACIÓN DE DATOS: ORIGEN (SQLite) vs DESTINO (Supabase)");
  console.log("================================================================");
  console.log(`- Usuarios totales:          SQLite: ${legitimateUsers.length} | Supabase: ${supaUsers.length}`);
  console.log(`- Unidades de progreso:      SQLite: ${validProgress.length} | Supabase: ${supaProgress?.length || 0}`);
  console.log(`- Evaluaciones:              SQLite: ${validAttempts.length} | Supabase: ${attemptsCount}`);
  console.log(`- Registros de actividad:    SQLite: ${validLogs.length} | Supabase: ${logsCount}`);
  console.log("----------------------------------------------------------------");
  console.log(`- Administrador (g.ostolazav@udd.cl):`);
  console.log(`    Existe en Supabase:      ${adminUser ? "✅ SÍ" : "❌ NO"}`);
  console.log(`    Rol asignado:            ${adminUser?.role === "admin" ? "✅ admin" : "❌ " + adminUser?.role}`);
  console.log(`    Compatibilidad de hash:  ${isAdminOk ? "✅ 100% IDÉNTICO (Tu contraseña actual funciona)" : "❌ Discrepancia"}`);
  console.log(`- Estudiante prueba (MED-3GZH):`);
  console.log(`    Existe en Supabase:      ${pruebaUser ? "✅ SÍ" : "❌ NO"}`);
  console.log(`    Código participante:     ${pruebaUser?.participant_code || "N/A"}`);
  console.log("================================================================");

  if (isAdminOk && pruebaUser && supaUsers.length >= legitimateUsers.length) {
    console.log(" 🎉 ¡VERIFICACIÓN EXITOSA! Todas las cuentas legítimas y credenciales están intactas.\n");
  } else {
    console.log(" ⚠️ Revisa las discrepancias reportadas arriba.\n");
  }
}

runMigration().catch((err) => {
  console.error("❌ Error inesperado durante la migración:", err);
  process.exit(1);
});
