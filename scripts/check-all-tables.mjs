import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

async function checkAllTables() {
  const openApiRes = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });

  if (!openApiRes.ok) return;
  const spec = await openApiRes.json();
  const tables = ["users", "sessions", "unit_progress", "quiz_attempts", "activity_logs", "login_rate_limits", "ranks"];
  
  for (const t of tables) {
    const def = spec?.definitions?.[t];
    console.log(`\n=== TABLA: public.${t} ===`);
    if (def?.properties) {
      for (const [col, meta] of Object.entries(def.properties)) {
        console.log(`  ${col}: ${meta.format || meta.type}`);
      }
    } else {
      console.log("  (no encontrada en spec)");
    }
  }
}

checkAllTables().catch(console.error);
