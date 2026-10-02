import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createOrUpdateAdminDb, checkAndIncrementRateLimit } from "@/lib/server/db";
import { verifyPassword, hashPassword, createSession, buildSessionCookie } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = await checkAndIncrementRateLimit(`admin_ip:${ip}`, 5, 15);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Demasiados intentos fallidos. Intente de nuevo en ${rateCheck.retryAfterSeconds || 900} segundos.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Ingresa correo y contraseña." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Soporte para sincronización automática si están configuradas ADMIN_EMAIL y ADMIN_PASSWORD
    const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD;

    if (envAdminEmail && envAdminPassword && normalizedEmail === envAdminEmail && password === envAdminPassword) {
      const { hash, salt } = hashPassword(envAdminPassword);
      const adminUser = await createOrUpdateAdminDb({
        email: envAdminEmail,
        passwordHash: hash,
        salt,
        name: "Administrador MedStudy",
      });

      const token = await createSession(adminUser.id, "admin");
      const cookieHeader = buildSessionCookie(token);

      const response = NextResponse.json({
        success: true,
        user: { email: adminUser.email, nickname: adminUser.nickname, role: "admin" },
      });
      response.headers.set("Set-Cookie", cookieHeader);
      return response;
    }

    // Comprobación estándar contra base de datos
    const user = await getUserByEmail(normalizedEmail);

    if (!user || user.role !== "admin" || !user.password_hash || !user.salt) {
      return NextResponse.json(
        { error: "Credenciales de administrador inválidas." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales de administrador inválidas." },
        { status: 401 }
      );
    }

    const token = await createSession(user.id, "admin");
    const cookieHeader = buildSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      user: { email: user.email, nickname: user.nickname, role: "admin" },
    });

    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (error) {
    console.error("Error in /api/admin/login:", error);
    return NextResponse.json({ error: "Error interno al iniciar sesión." }, { status: 500 });
  }
}
