import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { getUserUnitProgress } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json({ user: null });
    }

    const unitProgress = await getUserUnitProgress(auth.user.id);

    return NextResponse.json({
      user: {
        id: auth.user.id,
        participantCode: auth.user.participant_code,
        email: auth.user.email,
        nickname: auth.user.nickname,
        university: auth.user.university,
        universityShort: auth.user.university_short,
        career: auth.user.career,
        role: auth.user.role,
        onboardingCompleted: Boolean(auth.user.onboarding_completed),
        xp: auth.user.xp,
        streakDays: auth.user.streak_days,
        longestStreak: auth.user.longest_streak,
        lastStudyDate: auth.user.last_study_date,
        createdAt: auth.user.created_at,
        unitProgress,
      },
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ user: null });
  }
}
