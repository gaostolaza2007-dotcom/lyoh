import fs from "fs";

// Leer variables de .env.local
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

async function checkColumns() {
  console.log("=== INSPECCIONANDO ESQUEMA DE SUPABASE ===");
  
  // 1. Obtener una fila de users para ver los campos devueltos
  const res = await fetch(`${url}/rest/v1/users?limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!res.ok) {
    console.error("Error al consultar users:", res.status, await res.text());
    return;
  }

  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    console.log(`Columnas presentes actualmente en public.users (${Object.keys(data[0]).length} columnas):`);
    for (const [k, v] of Object.entries(data[0])) {
      console.log(` - ${k}: tipo js=${typeof v}, valor muestra=${v === null ? "null" : typeof v === "object" ? JSON.stringify(v) : String(v).slice(0, 40)}`);
    }
  } else {
    console.log("Tabla users no tiene filas o devolvió:", data);
  }

  // 2. Comprobar si OpenAPI / swagger expone las definiciones completas de columnas y tipos PostgreSQL
  console.log("\nConsultando esquema OpenAPI (/rest/v1/?apikey=...)...");
  const openApiRes = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (openApiRes.ok) {
    const spec = await openApiRes.json();
    const usersDef = spec?.definitions?.users;
    if (usersDef && usersDef.properties) {
      console.log("\nDefinición exacta de tipos en public.users según PostgREST:");
      for (const [colName, colMeta] of Object.entries(usersDef.properties)) {
        console.log(` - ${colName}: type=${colMeta.type}, format=${colMeta.format || "none"}, description=${colMeta.description || ""}`);
      }
    } else {
      console.log("No se encontró definición para users en OpenAPI spec.");
    }
  } else {
    console.log("No se pudo obtener OpenAPI spec:", openApiRes.status);
  }
}

checkColumns().catch(console.error);
