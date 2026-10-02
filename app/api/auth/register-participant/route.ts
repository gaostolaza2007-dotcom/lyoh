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
    const { nickname, university, universityShort, career, accountSecret } = body;

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
    });

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
        onboardingCompleted: true,
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
    console.error("Error in /api/auth/register-participant:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al registrar el participante." },
      { status: 500 }
    );
  }
}
