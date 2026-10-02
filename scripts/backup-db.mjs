import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "medstudy.db");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");

if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, "-");
const backupFileName = `medstudy_backup_${timestamp}.db`;
const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

console.log("=== Creando respaldo consistente de MedStudy ===");
console.log("Origen:", DB_FILE);
console.log("Destino:", backupFilePath);

// Abrir conexión a la base de datos origen
const db = new DatabaseSync(DB_FILE);

// 1. Ejecutar checkpoint WAL para asegurar que todas las páginas de journal queden volcadas
console.log("Ejecutando PRAGMA wal_checkpoint(TRUNCATE)...");
db.exec("PRAGMA wal_checkpoint(TRUNCATE);");

// 2. Usar VACUUM INTO para generar una copia limpia, compacta y consistente sin depender de copiar archivos en caliente
console.log("Generando archivo de respaldo mediante VACUUM INTO...");
const normalizedBackupPath = backupFilePath.replace(/\\/g, "/");
db.exec(`VACUUM INTO '${normalizedBackupPath}';`);

db.close();

// 3. Abrir el archivo de respaldo para verificar integridad
console.log("Verificando integridad del archivo de respaldo...");
const backupDb = new DatabaseSync(backupFilePath);
const integrityResult = backupDb.prepare("PRAGMA integrity_check;").all();
console.log("Resultado de integrity_check:", integrityResult);

const isOk = Array.isArray(integrityResult) && integrityResult.length === 1 && integrityResult[0].integrity_check === "ok";
if (!isOk) {
  backupDb.close();
  throw new Error("La verificación de integridad del respaldo falló: " + JSON.stringify(integrityResult));
}

// 4. Contar registros del respaldo para comprobar contenido
const usersCount = backupDb.prepare("SELECT COUNT(*) as cnt FROM users;").get();
const sessionsCount = backupDb.prepare("SELECT COUNT(*) as cnt FROM sessions;").get();
const unitProgressCount = backupDb.prepare("SELECT COUNT(*) as cnt FROM unit_progress;").get();
const quizAttemptsCount = backupDb.prepare("SELECT COUNT(*) as cnt FROM quiz_attempts;").get();

console.log("Conteo de registros en el respaldo:", {
  users: usersCount?.cnt,
  sessions: sessionsCount?.cnt,
  unitProgress: unitProgressCount?.cnt,
  quizAttempts: quizAttemptsCount?.cnt,
});

backupDb.close();

const stats = fs.statSync(backupFilePath);
console.log(`✅ Respaldo creado exitosamente (${stats.size} bytes).`);
console.log("Ruta absoluta del respaldo:", backupFilePath);
