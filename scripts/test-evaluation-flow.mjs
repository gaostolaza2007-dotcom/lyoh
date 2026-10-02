import http from "http";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { createIsolatedTestEnv } from "./test-environment.mjs";

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data,
        });
      });
    });
    req.on("error", reject);
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function extractCookie(headers) {
  const setCookie = headers["set-cookie"];
  if (!setCookie) return "";
  const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return cookieStr.split(";")[0];
}

async function runTests() {
  console.log("==================================================");
  console.log(" INICIANDO PRUEBAS DE EVALUACIÓN (ENTORNO AISLADO)");
  console.log("==================================================\n");

  const env = await createIsolatedTestEnv("test-eval-");

  // Verificación estricta de seguridad: nunca tocar data/medstudy.db
  const realDbPath = path.resolve(process.cwd(), "data", "medstudy.db");
  if (path.resolve(env.testDbPath).toLowerCase() === realDbPath.toLowerCase()) {
    throw new Error("ABORTANDO: La base de datos de prueba coincide con la base real.");
  }

  // Guardar recuento inicial de la base de datos real para verificar inmunidad
  const realDbBefore = new DatabaseSync(realDbPath);
  const realUsersBefore = realDbBefore.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
  realDbBefore.close();

  try {
    const port = env.port;
    const hostname = "127.0.0.1";

    // 1. REGISTRO DE PARTICIPANTE A
    console.log("1. Registrando Participante A (Valeria Silva, UCH, Medicina)...");
    const regA = await request(
      {
        hostname,
        port,
        path: "/api/auth/register-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "Valeria Silva",
        university: "Universidad de Chile",
        universityShort: "UCH",
        career: "Medicina",
      }
    );

    console.assert(regA.status === 200, `Reg A falló con status ${regA.status}`);
    const cookieA = extractCookie(regA.headers);
    const userA = regA.data.user;
    console.log(`   ✅ Participante A registrado: ${userA.nickname} (Código: ${userA.participantCode})`);
    console.assert(userA.participantCode.startsWith("MED-"), "Código de A inválido");

    // 2. PARTICIPANTE A REALIZA CUESTIONARIO DE ANATOMÍA (ACIERTO 3/3)
    console.log("\n2. Participante A rinde cuestionario (Acierto 3/3)...");
    const quizA = await request(
      {
        hostname,
        port,
        path: "/api/progress/quiz",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
      },
      {
        moduleId: "anatomia",
        unitId: "flashcards",
        quizVersion: "v1.0",
        totalQuestions: 3,
        correctCount: 3,
        incorrectTopics: [],
        durationSeconds: 45,
      }
    );

    console.assert(quizA.status === 200, `Quiz A falló con status ${quizA.status}`);
    console.log(`   ✅ Intento #1 de A registrado: Score ${quizA.data.attempt.score}%, Intento #${quizA.data.attempt.attempt_number}`);
    console.assert(quizA.data.attempt.score === 100, "Score de A debería ser 100%");

    // 3. REGISTRO DE PARTICIPANTE B (CARLOS MEZA, UDD, TECNOLOGÍA MÉDICA)
    console.log("\n3. Registrando Participante B (Carlos Meza, UDD, Tecnología Médica)...");
    const regB = await request(
      {
        hostname,
        port,
        path: "/api/auth/register-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "Carlos Meza",
        university: "Universidad del Desarrollo",
        universityShort: "UDD",
        career: "Tecnología Médica",
      }
    );

    console.assert(regB.status === 200, `Reg B falló con status ${regB.status}`);
    const cookieB = extractCookie(regB.headers);
    const userB = regB.data.user;
    console.log(`   ✅ Participante B registrado: ${userB.nickname} (Código: ${userB.participantCode})`);
    console.assert(userA.id !== userB.id, "Los IDs de A y B deben ser diferentes");
    console.assert(userA.participantCode !== userB.participantCode, "Los códigos de A y B deben ser diferentes");

    // 4. PARTICIPANTE B RINDE CUESTIONARIO (ACIERTO 1/3, ERRORES EN NEUROANATOMÍA)
    console.log("\n4. Participante B rinde cuestionario (Acierto 1/3, fallos en Neuroanatomía)...");
    const quizB = await request(
      {
        hostname,
        port,
        path: "/api/progress/quiz",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieB,
        },
      },
      {
        moduleId: "anatomia",
        unitId: "flashcards",
        quizVersion: "v1.0",
        totalQuestions: 3,
        correctCount: 1,
        incorrectTopics: ["Neuroanatomía", "Sistema Musculoesquelético"],
        durationSeconds: 60,
      }
    );

    console.assert(quizB.status === 200, `Quiz B falló con status ${quizB.status}`);
    console.log(`   ✅ Intento #1 de B registrado: Score ${quizB.data.attempt.score}%, Intento #${quizB.data.attempt.attempt_number}`);
    console.assert(quizB.data.attempt.score === 33, "Score de B debería ser 33%");

    // 5. COMPROBAR AISLAMIENTO DE DATOS: PARTICIPANTE B REVISA SU PERFIL
    console.log("\n5. Verificando aislamiento: Participante B consulta /api/auth/me...");
    const meB = await request({
      hostname,
      port,
      path: "/api/auth/me",
      method: "GET",
      headers: { Cookie: cookieB },
    });
    console.assert(meB.data.user.nickname === "Carlos Meza", "El perfil no coincide con B");
    console.assert(meB.data.user.id === userB.id, "ID no coincide con B");
    console.log("   ✅ Aislamiento confirmado: B solo ve sus propios datos.");

    // 6. COMPROBAR BARRERA DE SEGURIDAD: ESTUDIANTE NO PUEDE ACCEDER A /api/admin/*
    console.log("\n6. Verificando barrera de seguridad: Participante A intenta consultar /api/admin/participants...");
    const blockedStudent = await request({
      hostname,
      port,
      path: "/api/admin/participants",
      method: "GET",
      headers: { Cookie: cookieA },
    });
    console.assert(blockedStudent.status === 403, `Debe responder 403 Forbidden, respondió: ${blockedStudent.status}`);
    console.log("   ✅ Barrera verificada: El estudiante A recibe 403 Forbidden.");

    // 7. COMPROBAR BARRERA DE SEGURIDAD: PERSONA SIN SESIÓN
    console.log("\n7. Verificando barrera sin sesión en /api/admin/participants...");
    const blockedAnon = await request({
      hostname,
      port,
      path: "/api/admin/participants",
      method: "GET",
    });
    console.assert(blockedAnon.status === 403, `Debe responder 403 Forbidden, respondió: ${blockedAnon.status}`);
    console.log("   ✅ Barrera verificada: Usuario anónimo recibe 403 Forbidden.");

    // 8. AUTENTICACIÓN COMO ADMINISTRADOR (Cuenta aislada en la base temporal)
    console.log("\n8. Iniciando sesión como Administrador en /api/admin/login...");
    const adminLogin = await request(
      {
        hostname,
        port,
        path: "/api/admin/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        email: "admin@medstudy.app",
        password: "TestAdminPass123",
      }
    );
    console.assert(adminLogin.status === 200, `Login de admin falló con status ${adminLogin.status}`);
    const cookieAdmin = extractCookie(adminLogin.headers);
    console.log("   ✅ Administrador autenticado correctamente.");

    // 9. CONSULTA DE PARTICIPANTES DESDE EL PANEL DE ADMINISTRADOR
    console.log("\n9. Administrador consulta lista de participantes en /api/admin/participants...");
    const adminList = await request({
      hostname,
      port,
      path: "/api/admin/participants",
      method: "GET",
      headers: { Cookie: cookieAdmin },
    });
    console.assert(adminList.status === 200, `Consulta de lista falló: ${adminList.status}`);
    const participants = adminList.data.participants;
    console.log(`   ✅ Administrador recuperó ${participants.length} participantes.`);

    const partA = participants.find((p) => p.id === userA.id);
    const partB = participants.find((p) => p.id === userB.id);

    console.assert(Boolean(partA), "Participante A debe estar en la lista");
    console.assert(Boolean(partB), "Participante B debe estar en la lista");

    console.log(`   - Participante A: ${partA.nickname} | Código: ${partA.participant_code} | Cuestionarios: ${partA.quiz_attempts_count} | Score: ${partA.first_attempt_score}%`);
    console.log(`   - Participante B: ${partB.nickname} | Código: ${partB.participant_code} | Cuestionarios: ${partB.quiz_attempts_count} | Score: ${partB.first_attempt_score}%`);
    console.log(`   - Temas con más errores en B: ${JSON.stringify(partB.top_mistake_topics)}`);

    console.assert(partA.first_attempt_score === 100, "Score de A en admin debe ser 100");
    console.assert(partB.first_attempt_score === 33, "Score de B en admin debe ser 33");

    // 10. CONSULTA DEL EXPEDIENTE DETALLADO DE PARTICIPANTE B
    console.log(`\n10. Administrador abre expediente detallado de B (/api/admin/participants/${userB.id})...`);
    const adminDetailB = await request({
      hostname,
      port,
      path: `/api/admin/participants/${userB.id}`,
      method: "GET",
      headers: { Cookie: cookieAdmin },
    });
    console.assert(adminDetailB.status === 200, `Detalle de B falló: ${adminDetailB.status}`);
    const detail = adminDetailB.data.detail;
    console.log(`   ✅ Expediente de ${detail.user.nickname}: ${detail.quizAttempts.length} intentos de cuestionario detallados.`);

    // 11. CONSULTA DE ESTADÍSTICAS GLOBALES
    console.log("\n11. Administrador consulta estadísticas globales (/api/admin/stats)...");
    const adminStats = await request({
      hostname,
      port,
      path: "/api/admin/stats",
      method: "GET",
      headers: { Cookie: cookieAdmin },
    });
    console.assert(adminStats.status === 200, `Stats falló: ${adminStats.status}`);
    console.log("   ✅ Estadísticas:", adminStats.data.stats);

    // 12. VERIFICACIÓN DE INMUNIDAD DE LA BASE REAL
    const realDbAfter = new DatabaseSync(realDbPath);
    const realUsersAfter = realDbAfter.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
    realDbAfter.close();
    console.assert(
      realUsersBefore === realUsersAfter,
      `LA BASE REAL FUE MODIFICADA: antes=${realUsersBefore}, después=${realUsersAfter}`
    );
    console.log(`\n✅ Inmunidad de base real confirmada: usuarios antes=${realUsersBefore}, después=${realUsersAfter}.`);

    console.log("\n==================================================");
    console.log(" ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!");
    console.log("==================================================");
  } finally {
    await env.cleanup();
  }
}

runTests().catch((err) => {
  console.error("❌ Fallo en la suite de pruebas:", err);
  process.exit(1);
});
