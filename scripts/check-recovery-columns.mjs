import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const lines = fs.readFileSync(".env.local", "utf8").split(/\r?\n/);
const env = {};
for (const l of lines) {
  const t = l.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq !== -1) {
    let v = t.substring(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[t.substring(0, eq).trim()] = v;
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.from("users").select("id, recovered_from_browser, browser_claimed_xp").limit(1);
console.log("Columns check in Supabase:", {
  columnsExist: !error,
  error: error ? error.message : null,
  data
});
