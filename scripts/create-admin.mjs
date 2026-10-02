import readline from "readline";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "..", "data", "medstudy.db");

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

function promptPassword(promptText) {
  return new Promise((resolve) => {
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === "function") {
      process.stdout.write(promptText);
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
      rl.question(promptText, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  console.log("\n=================================================");
  console.log(" MedStudy - Configuración Segura de Administrador");
  console.log("=================================================\n");

  const args = process.argv.slice(2);
  let email = args[0];

  if (!email) {
    const inputEmail = await promptText("Correo del Administrador [g.ostolazav@udd.cl]: ");
    email = inputEmail || "g.ostolazav@udd.cl";
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Conectar a SQLite
  const db = new DatabaseSync(DB_FILE);
  db.exec("PRAGMA journal_mode = WAL;");

  // Asegurar que las tablas existan
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      participant_code TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      salt TEXT,
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
  `);

  // Verificar si la cuenta ya existe
  const existing = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(normalizedEmail);

  if (existing) {
    console.log(`\nℹ️  La cuenta '${normalizedEmail}' ya existe en la base de datos.`);
    console.log(`    Nombre actual: ${existing.nickname || "Sin nombre"}`);
    console.log(`    Rol actual: ${existing.role}`);
    const confirm = await promptText("\n¿Deseas actualizar la contraseña de esta cuenta y confirmar su rol de administrador? (s/n): ");
    if (
      confirm.toLowerCase() !== "s" &&
      confirm.toLowerCase() !== "si" &&
      confirm.toLowerCase() !== "y" &&
      confirm.toLowerCase() !== "yes"
    ) {
      console.log("\n❌ Operación cancelada. La cuenta y su contraseña NO fueron modificadas.\n");
      process.exit(0);
    }
  } else {
    console.log(`\nℹ️  Se creará una nueva cuenta de administrador para: '${normalizedEmail}'`);
  }

  // Solicitar contraseña de forma privada
  let password = "";
  let confirmPass = "";

  while (true) {
    password = await promptPassword("Introduce la nueva contraseña (los caracteres no se mostrarán en texto claro): ");
    if (!password || password.length < 6) {
      console.log("⚠️  La contraseña debe tener al menos 6 caracteres. Intenta de nuevo.\n");
      continue;
    }

    confirmPass = await promptPassword("Confirma la nueva contraseña: ");
    if (password !== confirmPass) {
      console.log("⚠️  Las contraseñas no coinciden. Intenta de nuevo.\n");
      continue;
    }

    break;
  }

  // Nombre visible
  let name = args[1];
  if (!name && !existing) {
    const inputName = await promptText("Nombre o identificador visible [Administrador UDD]: ");
    name = inputName || "Administrador UDD";
  }

  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE users SET
        password_hash = ?,
        salt = ?,
        nickname = COALESCE(?, nickname),
        role = 'admin',
        updated_at = ?
      WHERE id = ?
    `).run(hash, salt, name || existing.nickname, now, existing.id);
    console.log(`\n✅ Contraseña actualizada y rol de ADMINISTRADOR asignado a '${normalizedEmail}'.`);
  } else {
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (
        id, email, password_hash, salt, nickname, university, university_short,
        career, role, onboarding_completed, xp, streak_days, longest_streak,
        created_at, updated_at, last_active_at
      ) VALUES (?, ?, ?, ?, ?, 'Universidad del Desarrollo', 'UDD', 'Docencia e Investigación', 'admin', 1, 0, 0, 0, ?, ?, ?)
    `).run(id, normalizedEmail, hash, salt, name || "Administrador UDD", now, now, now);
    console.log(`\n✅ Nueva cuenta de ADMINISTRADOR creada exitosamente para: '${normalizedEmail}'`);
  }

  console.log("\n-------------------------------------------------");
  console.log("🔐 Acceso configurado con éxito.");
  console.log("1. Abre tu navegador en: http://localhost:3000/admin/login");
  console.log(`2. Correo: ${normalizedEmail}`);
  console.log("3. Contraseña: La que acabas de ingresar");
  console.log("-------------------------------------------------\n");
}

main().catch((err) => {
  console.error("Error al configurar administrador:", err);
  process.exit(1);
});
