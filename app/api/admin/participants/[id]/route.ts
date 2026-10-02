import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminParticipantDetailDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    try {
      await requireAdmin(req);
    } catch {
      return NextResponse.json({ error: "Acceso no autorizado al panel administrativo." }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID de participante requerido." }, { status: 400 });
    }

    const detail = await getAdminParticipantDetailDb(id);
    if (!detail) {
      return NextResponse.json({ error: "Participante no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ detail });
  } catch (error) {
    console.error("Error in /api/admin/participants/[id]:", error);
    return NextResponse.json({ error: "Error al obtener detalle del participante." }, { status: 500 });
  }
}
