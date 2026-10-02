import { NextRequest, NextResponse } from "next/server";
import { getUserByCode, getUserUnitProgress, checkAndIncrementRateLimit } from "@/lib/server/db";
import { createSession, buildSessionCookie } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const body = await req.json();
    const { participantCode } = body;

    if (!participantCode || typeof participantCode !== "string") {
      return NextResponse.json({ error: "Ingresa tu código de participante." }, { status: 400 });
    }

    const normalizedCode = participantCode.trim().toUpperCase();

    // 1. Protección contra ataques de fuerza bruta por IP y por código
    const ipLimit = await checkAndIncrementRateLimit(`login_ip:${ip}`, 15, 15);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: `Demasiados intentos de acceso desde esta conexión. Espera ${ipLimit.retryAfterSeconds || 900} segundos.` },
        { status: 429 }
      );
    }

    const codeLimit = await checkAndIncrementRateLimit(`login_code:${normalizedCode}`, 5, 15);
    if (!codeLimit.allowed) {
      return NextResponse.json(
        { error: `Código temporalmente bloqueado por demasiados intentos erróneos. Espera ${codeLimit.retryAfterSeconds || 900} segundos.` },
        { status: 429 }
      );
    }

    const participant = await getUserByCode(normalizedCode);
    if (!participant || participant.role !== "student") {
      return NextResponse.json(
        { error: "No se encontró ningún participante con ese código." },
        { status: 404 }
      );
    }

    const token = await createSession(participant.id, "student");
    const cookieHeader = buildSessionCookie(token);

    const unitProgress = await getUserUnitProgress(participant.id);

    const response = NextResponse.json({
      user: {
        id: participant.id,
        participantCode: participant.participant_code,
        nickname: participant.nickname,
        university: participant.university,
        universityShort: participant.university_short,
        career: participant.career,
        role: participant.role,
        onboardingCompleted: Boolean(participant.onboarding_completed),
        xp: participant.xp,
        streakDays: participant.streak_days,
        longestStreak: participant.longest_streak,
        lastStudyDate: participant.last_study_date,
        createdAt: participant.created_at,
        unitProgress,
      },
    });

    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (error) {
    console.error("Error in /api/auth/login-participant:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión con el código." },
      { status: 500 }
    );
  }
}
