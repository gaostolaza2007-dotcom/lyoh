import crypto from "crypto";
import { NextRequest } from "next/server";
import { getSession, createSession, deleteSession, DbUser } from "./db";

export { createSession, deleteSession };
export const SESSION_COOKIE_NAME = "medstudy_session";

// Cifrado de contraseñas con scrypt nativo
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString("hex");
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(hash, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Extracción del token de sesión de la petición
export function extractSessionToken(req: Request | NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const c of cookies) {
    if (c.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      return decodeURIComponent(c.substring(SESSION_COOKIE_NAME.length + 1));
    }
  }
  return null;
}

// Obtener sesión activa autenticada
export async function getAuthenticatedUser(
  req: Request | NextRequest
): Promise<{ user: DbUser; token: string } | null> {
  const token = extractSessionToken(req);
  if (!token) return null;

  const sessionData = await getSession(token);
  if (!sessionData) return null;

  return { user: sessionData.user, token: sessionData.session.token };
}

// Guardias de acceso para Route Handlers
export async function requireStudent(req: Request | NextRequest): Promise<DbUser> {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    throw new Error("UNAUTHORIZED");
  }
  return auth.user;
}

export async function requireAdmin(req: Request | NextRequest): Promise<DbUser> {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    throw new Error("UNAUTHORIZED");
  }
  if (auth.user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return auth.user;
}

// Creación de encabezados Set-Cookie seguros
export function buildSessionCookie(token: string): string {
  const isProd = process.env.NODE_ENV === "production" || process.env.NETLIFY === "true";
  const maxAge = 30 * 24 * 60 * 60; // 30 días
  const secureFlag = isProd ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secureFlag}`;
}

export function buildClearCookie(): string {
  const isProd = process.env.NODE_ENV === "production" || process.env.NETLIFY === "true";
  const secureFlag = isProd ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secureFlag}`;
}
