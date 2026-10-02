import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdminInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== "" &&
    process.env.SUPABASE_SERVICE_ROLE_KEY.trim() !== "" &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-url")
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) return supabaseAdminInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey || !isSupabaseConfigured()) {
    const isProd = process.env.NODE_ENV === "production" || process.env.NETLIFY === "true";
    const envMsg = isProd
      ? "Configuración faltante en Netlify: Configure NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en las variables de entorno de producción."
      : "Variables de entorno de Supabase no configuradas. Configure NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local para usar Supabase.";
    throw new Error(envMsg);
  }

  supabaseAdminInstance = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdminInstance;
}
