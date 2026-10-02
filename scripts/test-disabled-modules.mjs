import { DatabaseSync } from "node:sqlite";
import path from "path";
import crypto from "crypto";
import { createIsolatedTestEnv } from "./test-environment.mjs";

async function runTests() {
  console.log("=================================================");
  console.log(" MedStudy - Verificación de Módulos Próximamente (ENTORNO AISLADO)");
  console.log("=================================================\n");

  const env = await createIsolatedTestEnv("test-disabled-");

  // Verificación estricta de seguridad: nunca tocar data/medstudy.db
  const realDbPath = path.resolve(process.cwd(), "data", "medstudy.db");
  if (path.resolve(env.testDbPath).toLowerCase() === realDbPath.toLowerCase()) {
    throw new Error("ABORTANDO: La base de datos de prueba coincide con la base real.");
  }

  // Comprobar recuento inicial en base real
  const realDbBefore = new DatabaseSync(realDbPath);
  const realUsersBefore = realDbBefore.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
  realDbBefore.close();

  let passes = 0;
  let failures = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passes++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failures++;
    }
  }

  try {
    const BASE_URL = env.baseUrl;

    // 1. Crear o iniciar sesión como estudiante de prueba
    console.log("--- 1. Registro de Estudiante de Prueba ---");
    const regRes = await fetch(`${BASE_URL}/api/auth/register-participant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: "Estudiante Test Modulos",
        university: "Universidad de Chile",
        universityShort: "UCH",
        career: "Medicina",
      }),
    });
    const regData = await regRes.json();
    const studentCookie = regRes.headers.get("set-cookie")?.split(";")[0] || "";

    assert(regRes.ok && Boolean(regData.user?.id), "Estudiante registrado correctamente");
    assert(Boolean(studentCookie), "Cookie de sesión de estudiante obtenida");

    // 2. Probar actualización de unidad para Anatomía (Habilitada)
    console.log("\n--- 2. Operaciones de Servidor para Módulos Habilitados ---");
    const resAnatomia = await fetch(`${BASE_URL}/api/progress/unit`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": studentCookie 
      },
      body: JSON.stringify({
        moduleId: "anatomia",
        unitId: "anatomia_flashcards",
        score: 100,
      }),
    });
    assert(resAnatomia.status === 200, `POST /api/progress/unit para Anatomía devuelve 200 (recibido: ${resAnatomia.status})`);

    // 3. Probar rechazo en servidor para Bioquímica (Deshabilitada)
    console.log("\n--- 3. Protección de Servidor contra Módulos Deshabilitados ---");
    const resBioq = await fetch(`${BASE_URL}/api/progress/unit`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": studentCookie 
      },
      body: JSON.stringify({
        moduleId: "bioquimica",
        unitId: "bioquimica_metabolismo",
        score: 80,
      }),
    });
    const bioqData = await resBioq.json();
    assert(resBioq.status === 403, `POST /api/progress/unit para Bioquímica devuelve 403 Forbidden (recibido: ${resBioq.status})`);
    assert(bioqData.error?.includes("próximamente"), `Mensaje de error descriptivo: "${bioqData.error}"`);

    // 4. Probar intento de bypass falsificando moduleId="anatomia" con unitId="bioquimica_metabolismo"
    console.log("\n--- 4. Verificación Autoritativa en el Servidor (Protección Anti-Bypass) ---");
    const resBypass = await fetch(`${BASE_URL}/api/progress/unit`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": studentCookie 
      },
      body: JSON.stringify({
        moduleId: "anatomia", // Intento engañoso
        unitId: "bioquimica_metabolismo", // Unidad real pertenece a Bioquímica
        score: 90,
      }),
    });
    assert(resBypass.status === 403, `Servidor detecta módulo autoritativo y rechaza con 403 Forbidden (recibido: ${resBypass.status})`);

    // 5. Probar evaluación de cuestionario para Histología (Deshabilitada)
    console.log("\n--- 5. Protección de Cuestionarios en Módulos Deshabilitados ---");
    const resQuizHisto = await fetch(`${BASE_URL}/api/progress/quiz`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": studentCookie 
      },
      body: JSON.stringify({
        moduleId: "histologia",
        unitId: "histologia_tejidos",
        totalQuestions: 5,
        correctCount: 4,
      }),
    });
    assert(resQuizHisto.status === 403, `POST /api/progress/quiz para Histología devuelve 403 Forbidden (recibido: ${resQuizHisto.status})`);

    // 6. Probar actividad de lectura para Histología (Deshabilitada)
    console.log("\n--- 6. Protección de Actividad de Lectura en Módulos Deshabilitados ---");
    const resActHisto = await fetch(`${BASE_URL}/api/progress/activity`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": studentCookie 
      },
      body: JSON.stringify({
        moduleId: "histologia",
        unitId: "histologia_tejidos",
        activityType: "interactive",
      }),
    });
    assert(resActHisto.status === 403, `POST /api/progress/activity para Histología devuelve 403 Forbidden (recibido: ${resActHisto.status})`);

    // 7. Simular avance histórico en la base de datos temporal
    console.log("\n--- 7. Preservación y Distinción de Avances Históricos ---");
    const testDb = new DatabaseSync(env.testDbPath);
    // Insertar un registro histórico para Bioquímica en la base temporal
    testDb.prepare(`
      INSERT INTO unit_progress (id, user_id, module_id, unit_id, status, score, completed_at, updated_at)
      VALUES (?, ?, 'bioquimica', 'bioquimica_metabolismo', 'completed', 100, datetime('now'), datetime('now'))
      ON CONFLICT(user_id, module_id, unit_id) DO UPDATE SET score = 100, status = 'completed'
    `).run(`test-hist-${Date.now()}`, regData.user.id);

    // Crear sesión de administrador válida en la base de datos temporal
    const adminUser = testDb.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
    const testAdminToken = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    testDb.prepare(`
      INSERT INTO sessions (token, user_id, role, expires_at, created_at)
      VALUES (?, ?, 'admin', ?, ?)
    `).run(testAdminToken, adminUser.id, expiresAt, now.toISOString());
    testDb.close();

    const adminCookie = `medstudy_session=${testAdminToken}`;

    // Consultar lista de participantes desde el admin
    const adminListRes = await fetch(`${BASE_URL}/api/admin/participants`, {
      headers: { "Cookie": adminCookie },
    });
    const adminListData = await adminListRes.json();
    const testStudentSummary = adminListData.participants?.find(p => p.id === regData.user.id);

    assert(Boolean(testStudentSummary), "Estudiante encontrado en panel de administración");
    assert(testStudentSummary?.total_available_units_count === 4, `Total de unidades disponibles dinámico = 4 (recibido: ${testStudentSummary?.total_available_units_count})`);
    assert(testStudentSummary?.completed_available_units_count === 1, `Unidades disponibles completadas = 1 (Anatomía) (recibido: ${testStudentSummary?.completed_available_units_count})`);
    assert(testStudentSummary?.historical_completed_units_count === 1, `Unidades históricas completadas en pausa = 1 (Bioquímica) (recibido: ${testStudentSummary?.historical_completed_units_count})`);
    assert(testStudentSummary?.completed_units_count === 2, `Total de unidades completadas preservado = 2 (recibido: ${testStudentSummary?.completed_units_count})`);

    // 8. Verificación de URLs y subrutas
    console.log("\n--- 8. Verificación de URLs Directas y Subrutas ---");
    const urlsToCheck = [
      { url: "/bioquimica", expectLock: true },
      { url: "/histologia", expectLock: true },
      { url: "/bioquimica/ruta-anidada", expectLock: true },
      { url: "/histologia/otra-subruta", expectLock: true },
      { url: "/anatomia", expectLock: false },
      { url: "/microbiologia", expectLock: false },
      { url: "/perfil", expectLock: false },
      { url: "/", expectLock: false },
    ];

    for (const item of urlsToCheck) {
      const res = await fetch(`${BASE_URL}${item.url}`);
      const text = await res.text();
      const hasLockScreen = text.includes("Este módulo estará disponible próximamente") && text.includes("Volver al inicio");

      if (item.expectLock) {
        assert(res.status === 200 && hasLockScreen, `${item.url} muestra pantalla de bloqueo con 'Volver al inicio'`);
      } else {
        assert(res.status === 200 && !hasLockScreen, `${item.url} carga normalmente y no está bloqueada`);
      }
    }

    // 9. Comprobar que la base real no fue modificada
    const realDbAfter = new DatabaseSync(realDbPath);
    const realUsersAfter = realDbAfter.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
    realDbAfter.close();
    assert(realUsersBefore === realUsersAfter, `Inmunidad de base real: usuarios antes=${realUsersBefore}, después=${realUsersAfter}`);

    console.log("\n=================================================");
    console.log(` Resultado Final: ${passes} pruebas superadas, ${failures} fallos.`);
    console.log("=================================================\n");

    if (failures > 0) {
      process.exit(1);
    }
  } finally {
    await env.cleanup();
  }
}

runTests().catch(err => {
  console.error("Error ejecutando pruebas:", err);
  process.exit(1);
});
