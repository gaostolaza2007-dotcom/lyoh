import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/server/auth";
import { updateUnitProgressDb, getUserUnitProgress } from "@/lib/server/db";
import { UNIT_TO_MODULE_MAP, isModuleEnabled, isUnitEnabled } from "@/lib/modules-config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let student;
    try {
      student = await requireStudent(req);
    } catch {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const { moduleId, unitId, score } = body;

    if (!unitId || typeof score !== "number") {
      return NextResponse.json({ error: "Datos de unidad inválidos." }, { status: 400 });
    }

    const stringUnitId = String(unitId);

    // Verificación autoritativa en el servidor:
    // Determinar el módulo real según el inventario del servidor, sin confiar solo en el cliente
    const authoritativeModuleId = UNIT_TO_MODULE_MAP[stringUnitId] || (moduleId ? String(moduleId).toLowerCase() : null);

    if (!authoritativeModuleId) {
      return NextResponse.json({ error: "Unidad no reconocida por el servidor." }, { status: 400 });
    }

    // Comprobar si el módulo y la unidad están habilitados
    if (!isModuleEnabled(authoritativeModuleId) || !isUnitEnabled(stringUnitId)) {
      return NextResponse.json(
        { error: "Este módulo estará disponible próximamente. No se permiten actualizaciones de progreso." },
        { status: 403 }
      );
    }

    await updateUnitProgressDb(student.id, authoritativeModuleId, stringUnitId, score);
    const updated = await getUserUnitProgress(student.id);

    return NextResponse.json({ success: true, unitProgress: updated });
  } catch (error) {
    console.error("Error in /api/progress/unit:", error);
    return NextResponse.json({ error: "Error al actualizar progreso." }, { status: 500 });
  }
}
