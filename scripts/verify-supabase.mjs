import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envPath = ".env.local";
if (!fs.existsSync(envPath)) {
  console.log("No existe .env.local");
  process.exit(1);
}

const content = fs.readFileSync(envPath, "utf8");
const lines = content.split(/\r?\n/);
const env = {};

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq !== -1) {
    const key = trimmed.substring(0, eq).trim();
    let val = trimmed.substring(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";

console.log("=== ESTADO DE VARIABLES (.env.local) ===");
console.log("- NEXT_PUBLIC_SUPABASE_URL presente:", url.length > 0);
console.log("  Formato https://...supabase.co:", url.startsWith("https://") && url.includes(".supabase.co"));
console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY presente:", anonKey.length > 0);
console.log("  Longitud de caracteres:", anonKey.length);
console.log("- SUPABASE_SERVICE_ROLE_KEY presente:", serviceKey.length > 0);
console.log("  Longitud de caracteres:", serviceKey.length);

if (!url || !serviceKey) {
  console.log("\n❌ Faltan variables obligatorias.");
  process.exit(1);
}

console.log("\n=== PRUEBA DE CONEXIÓN DE SOLO LECTURA ===");

async function testConnection() {
  try {
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const tables = [
      "users",
      "sessions",
      "unit_progress",
      "quiz_attempts",
      "activity_logs",
      "login_rate_limits",
      "ranks"
    ];

    console.log("Comprobando las siete tablas:");
    for (const t of tables) {
      const { count, error, status } = await supabase.from(t).select("*", { count: "exact", head: true });
      if (error) {
        console.log(`❌ Tabla '${t}': Error [${status} ${error.code}] -> ${error.message}`);
      } else {
        console.log(`✅ Tabla '${t}': Accesible (status ${status}, total registros: ${count})`);
      }
    }

    console.log("\n=== DESGLOSE DE USUARIOS EN SUPABASE ===");
    const { count: totalUsers, error: errTotal } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: adminCount, error: errAdmin } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    const { count: studentCount, error: errStudent } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student");

    if (!errTotal) {
      console.log(`- Total usuarios en public.users: ${totalUsers}`);
      console.log(`- Administradores (role = 'admin'): ${adminCount ?? 0}`);
      console.log(`- Estudiantes (role = 'student'): ${studentCount ?? 0}`);
    } else {
      console.log("Error al consultar usuarios:", errTotal.message);
    }
  } catch (err) {
    console.error("❌ Excepción al conectar:", err.message);
  }
}

testConnection();
