import { NextRequest, NextResponse } from "next/server";
import { recoverBrowserProfile, getUserUnitProgress, checkAndIncrementRateLimit } from "@/lib/server/db";
import { createSession, buildSessionCookie } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limit = await checkAndIncrementRateLimit(`recover_ip:${ip}`, 10, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes de recuperación iniciadas. Por favor intenta más tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      nickname,
      university,
      universityShort,
      career,
      provisionalCode,
      claimedXp,
      claimedProgress,
      clientRequestId,
    } = body;

    if (!nickname || typeof nickname !== "string" || !nickname.trim()) {
      return NextResponse.json({ error: "El nombre o apodo es obligatorio para la recuperación." }, { status: 400 });
    }
    if (!university || typeof university !== "string" || !university.trim()) {
      return NextResponse.json({ error: "La universidad es obligatoria." }, { status: 400 });
    }
    if (!career || typeof career !== "string" || !career.trim()) {
      return NextResponse.json({ error: "La carrera es obligatoria." }, { status: 400 });
    }

    const participant = await recoverBrowserProfile({
      nickname: nickname.trim(),
      university: university.trim(),
      universityShort: typeof universityShort === "string" ? universityShort.trim() : "UDD",
      career: career.trim(),
      provisionalCode: typeof provisionalCode === "string" ? provisionalCode.trim() : undefined,
      claimedXp: typeof claimedXp === "number" ? claimedXp : undefined,
      claimedProgress: claimedProgress && typeof claimedProgress === "object" ? claimedProgress : undefined,
      clientRequestId: typeof clientRequestId === "string" ? clientRequestId.trim() : undefined,
    });

    let token: string | null = null;
    try {
      token = await createSession(participant.id, "student");
    } catch (sessionErr: any) {
      console.error("[recover-browser-profile] Error creating session, retrying once:", sessionErr?.message);
      try {
        token = await createSession(participant.id, "student");
      } catch (retryErr: any) {
        console.error("[recover-browser-profile] Retry creating session failed:", retryErr?.message);
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
        role: "student",
        onboardingCompleted: true,
        xp: participant.xp, // Verified official XP is 0
        streakDays: participant.streak_days,
        longestStreak: participant.longest_streak,
        lastStudyDate: participant.last_study_date,
        createdAt: participant.created_at,
        recoveredFromBrowser: true,
        browserProvisionalCode: participant.browser_provisional_code || provisionalCode || null,
        browserClaimedXp: participant.browser_claimed_xp ?? (typeof claimedXp === "number" ? claimedXp : 0),
        unitProgress,
      },
      assignedCode: participant.participant_code,
      message: "Tu cuenta oficial ha sido creada exitosamente con un código verificado por el servidor.",
    });

    if (token) {
      const cookieHeader = buildSessionCookie(token);
      response.headers.set("Set-Cookie", cookieHeader);
    }

    return response;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[api/auth/recover-browser-profile] Recovery error:", errorMsg);

    if (errorMsg.includes("Configuración de Supabase no encontrada")) {
      return NextResponse.json(
        { error: "El servicio de base de datos no está configurado en producción. Por favor contacta al administrador." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "No fue posible completar la recuperación en el servidor. Por favor intenta nuevamente." },
      { status: 500 }
    );
  }
}
