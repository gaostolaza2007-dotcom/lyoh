import fs from "fs";
import path from "path";
import readline from "readline";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

function promptText(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function promptPassword(question) {
  return new Promise((resolve) => {
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === "function") {
      process.stdout.write(question);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      let password = "";
      const onData = (chunk) => {
        const str = chunk.toString();
        for (let i = 0; i < str.length; i++) {
          const char = str[i];
          if (char === "\r" || char === "\n" || char === "\u0004") {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener("data", onData);
            process.stdout.write("\n");
            return resolve(password);
          } else if (char === "\u0003") {
            process.stdout.write("\nOperación cancelada.\n");
            process.exit(1);
          } else if (char === "\b" || char === "\x7f" || char === "\x08") {
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write("\b \b");
            }
          } else if (char.charCodeAt(0) >= 32) {
            password += char;
            process.stdout.write("*");
          }
        }
      };
      process.stdin.on("data", onData);
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  console.log("================================================================");
  console.log(" MedStudy - Crear o Restablecer Administrador en Supabase");
  console.log("================================================================\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ ERROR: Variables de entorno de Supabase no encontradas.");
    console.error("Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local\n");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = (await promptText("Correo institucional del administrador: ")).toLowerCase();
  if (!email || !email.includes("@")) {
    console.error("❌ Correo inválido.");
    process.exit(1);
  }

  const name = (await promptText("Nombre completo (deja vacío para 'Administrador MedStudy'): ")) || "Administrador MedStudy";
  const password = await promptPassword("Nueva contraseña de acceso (mínimo 8 caracteres): ");

  if (!password || password.length < 8) {
    console.error("❌ La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const confirm = await promptPassword("Confirma la contraseña: ");
  if (password !== confirm) {
    console.error("❌ Las contraseñas no coinciden.");
    process.exit(1);
  }

  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();

  // Consultar si ya existe
  const { data: existing } = await supabase.from("users").select("id").ilike("email", email).maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("users")
      .update({
        password_hash: hash,
        salt,
        nickname: name,
        role: "admin",
        updated_at: now,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("❌ Error al actualizar administrador:", error.message);
      process.exit(1);
    }
    console.log(`\n✅ Contraseña actualizada correctamente para el administrador: ${email}`);
  } else {
    const { error } = await supabase.from("users").insert({
      id: crypto.randomUUID(),
      email,
      password_hash: hash,
      salt,
      nickname: name,
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
    });

    if (error) {
      console.error("❌ Error al registrar administrador:", error.message);
      process.exit(1);
    }
    console.log(`\n✅ Nuevo administrador creado exitosamente: ${email}`);
  }

  console.log("Acceso listo para iniciar sesión en /admin/login con este correo y contraseña.\n");
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});
