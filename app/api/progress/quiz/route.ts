import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/server/auth";
import { recordQuizAttemptDb, getUserUnitProgress } from "@/lib/server/db";
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
    const {
      moduleId,
      unitId,
      quizVersion,
      totalQuestions,
      correctCount,
      incorrectTopics,
      answersSummary,
      durationSeconds,
    } = body;

    if (!unitId || typeof totalQuestions !== "number" || typeof correctCount !== "number") {
      return NextResponse.json({ error: "Datos de cuestionario incompletos." }, { status: 400 });
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
        { error: "Este módulo estará disponible próximamente. No se permiten evaluaciones en módulos deshabilitados." },
        { status: 403 }
      );
    }

    const result = await recordQuizAttemptDb({
      userId: student.id,
      moduleId: authoritativeModuleId,
      unitId: stringUnitId,
      quizVersion: String(quizVersion || "v1.0"),
      totalQuestions: Number(totalQuestions),
      correctCount: Number(correctCount),
      incorrectTopics: Array.isArray(incorrectTopics) ? incorrectTopics : [],
      answersSummary: answersSummary || {},
      durationSeconds: Number(durationSeconds || 0),
    });

    const updatedProgress = await getUserUnitProgress(student.id);

    return NextResponse.json({
      success: true,
      attempt: result.attempt,
      isDuplicate: result.isDuplicate,
      newXp: result.newXp,
      unitProgress: updatedProgress,
    });
  } catch (error) {
    console.error("Error in /api/progress/quiz:", error);
    return NextResponse.json({ error: "Error al registrar evaluación." }, { status: 500 });
  }
}
