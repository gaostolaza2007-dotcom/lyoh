import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/server/auth";
import { recordActivityDb } from "@/lib/server/db";
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
    const { moduleId, unitId, activityType } = body;

    if (!unitId || !activityType) {
      return NextResponse.json({ error: "Datos de actividad incompletos." }, { status: 400 });
    }

    const stringUnitId = String(unitId);

    // Validación autoritativa en el servidor del módulo correspondiente a la unidad
    const authoritativeModuleId = UNIT_TO_MODULE_MAP[stringUnitId] || (moduleId ? String(moduleId).toLowerCase() : null);

    if (!authoritativeModuleId) {
      return NextResponse.json({ error: "Unidad no reconocida por el servidor." }, { status: 400 });
    }

    // Comprobar si el módulo y la unidad están habilitados
    if (!isModuleEnabled(authoritativeModuleId) || !isUnitEnabled(stringUnitId)) {
      return NextResponse.json(
        { error: "Este módulo estará disponible próximamente. No se permiten actividades en módulos deshabilitados." },
        { status: 403 }
      );
    }

    await recordActivityDb(
      student.id,
      authoritativeModuleId,
      stringUnitId,
      activityType as "reading" | "interactive" | "quiz"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/progress/activity:", error);
    return NextResponse.json({ error: "Error al registrar actividad." }, { status: 500 });
  }
}
