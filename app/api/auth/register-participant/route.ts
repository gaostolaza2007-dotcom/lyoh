import { NextRequest, NextResponse } from "next/server";
import { registerParticipant, getUserUnitProgress, checkAndIncrementRateLimit } from "@/lib/server/db";
import { createSession, buildSessionCookie } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const regLimit = await checkAndIncrementRateLimit(`register_ip:${ip}`, 10, 60);
    if (!regLimit.allowed) {
      return NextResponse.json(
        { error: "Demasiados registros iniciados recientemente. Por favor intenta más tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { nickname, university, universityShort, career, accountSecret, clientRequestId } = body;

    if (!nickname || typeof nickname !== "string" || !nickname.trim()) {
      return NextResponse.json({ error: "El nombre o apodo es obligatorio." }, { status: 400 });
    }
    if (!university || typeof university !== "string" || !university.trim()) {
      return NextResponse.json({ error: "La universidad es obligatoria." }, { status: 400 });
    }
    if (!career || typeof career !== "string" || !career.trim()) {
      return NextResponse.json({ error: "La carrera es obligatoria." }, { status: 400 });
    }

    const participant = await registerParticipant({
      nickname: nickname.trim(),
      university: university.trim(),
      universityShort: (universityShort || "UDD").trim(),
      career: career.trim(),
      accountSecret: typeof accountSecret === "string" ? accountSecret.trim() : undefined,
      clientRequestId: typeof clientRequestId === "string" ? clientRequestId.trim() : undefined,
    });

    let token: string | null = null;
    try {
      token = await createSession(participant.id, "student");
    } catch (sessionErr: any) {
      console.error("[register-participant] Error creating initial session, retrying once:", sessionErr?.message);
      try {
        token = await createSession(participant.id, "student");
      } catch (retryErr: any) {
        console.error("[register-participant] Retry creating session also failed:", retryErr?.message);
      }
    }

    const unitProgress = await getUserUnitProgress(participant.id).catch(() => ({}));

    const response = NextResponse.json({
      user: {
        id: participant.id,
        participantCode: participant.participant_code,
        nickname: participant.nickname,
        university: participant.university,
        universityShort: participant.university_short,
        career: participant.career,
        role: participant.role,
        onboardingCompleted: true,
        xp: participant.xp,
        streakDays: participant.streak_days,
        longestStreak: participant.longest_streak,
        lastStudyDate: participant.last_study_date,
        createdAt: participant.created_at,
        unitProgress,
      },
      ...(!token ? { sessionWarning: "Expediente registrado, pero debes ingresar con tu código asignado para iniciar sesión." } : {}),
    });

    if (token) {
      const cookieHeader = buildSessionCookie(token);
      response.headers.set("Set-Cookie", cookieHeader);
    }

    return response;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[api/auth/register-participant] Registration error:", errorMsg);

    if (errorMsg.includes("Configuración de Supabase no encontrada")) {
      return NextResponse.json(
        { error: "El servicio de base de datos no está configurado en el servidor de producción. Por favor, contacta al administrador." },
        { status: 503 }
      );
    }

    if (errorMsg.includes("Demasiados registros")) {
      return NextResponse.json(
        { error: errorMsg },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Ocurrió un error al registrar el expediente en el servidor. Por favor intenta nuevamente." },
      { status: 500 }
    );
  }
}
