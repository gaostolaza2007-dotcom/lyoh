import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminParticipantsListDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    try {
      await requireAdmin(req);
    } catch {
      return NextResponse.json({ error: "Acceso no autorizado al panel administrativo." }, { status: 403 });
    }

    const participants = await getAdminParticipantsListDb();
    return NextResponse.json({ participants });
  } catch (error) {
    console.error("Error in /api/admin/participants:", error);
    return NextResponse.json({ error: "Error al obtener participantes." }, { status: 500 });
  }
}
