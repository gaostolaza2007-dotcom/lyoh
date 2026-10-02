import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminGlobalStatsDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    try {
      await requireAdmin(req);
    } catch {
      return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
    }

    const stats = await getAdminGlobalStatsDb();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error in /api/admin/stats:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas globales." }, { status: 500 });
  }
}
