import { NextRequest, NextResponse } from "next/server";
import { extractSessionToken, buildClearCookie } from "@/lib/server/auth";
import { deleteSession } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const token = extractSessionToken(req);
    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.headers.set("Set-Cookie", buildClearCookie());
    return response;
  } catch (error) {
    console.error("Error in /api/auth/logout:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
