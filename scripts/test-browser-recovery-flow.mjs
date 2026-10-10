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

async function runRecoveryTests() {
  console.log("=================================================================");
  console.log(" SUITE DE PRUEBAS: RECUPERACIÓN DE EXPEDIENTES Y SEGURIDAD LOCAL ");
  console.log("=================================================================\n");

  const env = await createIsolatedTestEnv("test-recovery-");

  const realDbPath = path.resolve(process.cwd(), "data", "medstudy.db");
  if (path.resolve(env.testDbPath).toLowerCase() === realDbPath.toLowerCase()) {
    throw new Error("ABORTANDO: La base de prueba coincide con la base real.");
  }

  const realDbBefore = new DatabaseSync(realDbPath);
  const realUsersBefore = realDbBefore.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
  realDbBefore.close();

  try {
    const port = env.port;
    const hostname = "127.0.0.1";

    // 1. Probar que un código local falso no puede autenticarse
    console.log("1. Verificando que un código provisional/falso no puede iniciar sesión...");
    const fakeLogin = await request(
      {
        hostname,
        port,
        path: "/api/auth/login-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { participantCode: "MED-FAKE" }
    );
    if (fakeLogin.status === 401 || fakeLogin.status === 404) {
      console.log("   [OK] Código inexistente rechazado correctamente (status: " + fakeLogin.status + ")");
    } else {
      throw new Error(`Fallo: Se esperaba 401 o 404, recibido ${fakeLogin.status}`);
    }

    // 2. Probar recuperación explícita con datos no confiables desde el navegador
    console.log("\n2. Ejecutando recuperación explícita de perfil del navegador...");
    const maliciousPayload = {
      nickname: "Estudiante Recuperado",
      university: "Universidad del Desarrollo",
      universityShort: "UDD",
      career: "Medicina",
      role: "admin", // Intento de escalar privilegios desde el cliente
      claimedXp: 3500, // XP autodeclarado en cliente
      provisionalCode: "MED-PROV",
      claimedProgress: { microbiologia_patogenos: 100, anatomia_flashcards: 80 },
    };

    const recoverRes = await request(
      {
        hostname,
        port,
        path: "/api/auth/recover-browser-profile",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      maliciousPayload
    );

    if (recoverRes.status !== 200) {
      throw new Error(`Fallo en recuperación: status ${recoverRes.status}, error: ${JSON.stringify(recoverRes.data)}`);
    }

    const recData = recoverRes.data;
    const cookie = extractCookie(recoverRes.headers);

    console.log("   [OK] Endpoint respondió 200 con nuevo código asignado:", recData.assignedCode);

    // 3. Verificaciones de seguridad sobre los datos guardados
    console.log("\n3. Verificando reglas de seguridad del perfil recuperado:");
    if (recData.user.role !== "student") {
      throw new Error(`Vulnerabilidad de seguridad: el rol asignado fue '${recData.user.role}', DEBE ser 'student'`);
    }
    console.log("   [OK] Rol forzado estrictamente a 'student' (ignora rol enviado por cliente)");

    if (recData.assignedCode === "MED-PROV") {
      throw new Error("Vulnerabilidad: el servidor aceptó el código provisional en lugar de generar uno nuevo");
    }
    if (!recData.assignedCode.startsWith("MED-") || recData.assignedCode.length !== 8) {
      throw new Error(`Código inválido generado por el servidor: ${recData.assignedCode}`);
    }
    console.log("   [OK] Código nuevo generado por servidor:", recData.assignedCode, "(distinto de provisional)");

    if (recData.user.xp !== 0) {
      throw new Error(`Fallo de procedencia: el XP oficial verificado es ${recData.user.xp}, DEBE ser 0`);
    }
    console.log("   [OK] XP oficial verificado inicia estrictamente en 0 (no se acreditan notas sin verificar)");

    if (recData.user.browserClaimedXp !== 3500) {
      throw new Error(`Fallo: browserClaimedXp esperado 3500, recibido ${recData.user.browserClaimedXp}`);
    }
    console.log("   [OK] XP autodeclarado preservado en campo separado 'browserClaimedXp':", recData.user.browserClaimedXp);

    if (!cookie) {
      throw new Error("Fallo: La recuperación no emitió la cookie de sesión.");
    }
    console.log("   [OK] Cookie de sesión emitida tras recuperación");

    // 4. Verificar sesión autenticada con /api/auth/me
    console.log("\n4. Verificando persistencia de sesión con /api/auth/me...");
    const meRes = await request({
      hostname,
      port,
      path: "/api/auth/me",
      method: "GET",
      headers: { Cookie: cookie },
    });

    if (meRes.status !== 200 || !meRes.data?.user) {
      throw new Error(`Fallo al validar sesión: status ${meRes.status}`);
    }
    console.log("   [OK] /api/auth/me reconoce al usuario autenticado con código:", meRes.data.user.participantCode);

    // 5. Iniciar sesión posterior con el código generado
    console.log("\n5. Verificando inicio de sesión posterior con el código asignado...");
    const loginRes = await request(
      {
        hostname,
        port,
        path: "/api/auth/login-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { participantCode: recData.assignedCode }
    );

    if (loginRes.status !== 200 || !loginRes.data?.user) {
      throw new Error(`Fallo al iniciar sesión posterior: status ${loginRes.status}`);
    }
    console.log("   [OK] Inicio de sesión posterior con nuevo código confirmado exitosamente");

    // 6. Verificar persistencia e integridad en la base de datos aislada
    console.log("\n6. Verificando registro en la base de datos aislada...");
    const testDb = new DatabaseSync(env.testDbPath);
    const dbUser = testDb.prepare("SELECT * FROM users WHERE participant_code = ?").get(recData.assignedCode);

    if (!dbUser) {
      throw new Error("El usuario no existe en la base de datos.");
    }
    if (dbUser.recovered_from_browser !== 1) {
      throw new Error(`recovered_from_browser esperado 1, recibido ${dbUser.recovered_from_browser}`);
    }
    if (dbUser.browser_claimed_xp !== 3500) {
      throw new Error(`browser_claimed_xp esperado 3500, recibido ${dbUser.browser_claimed_xp}`);
    }
    if (dbUser.browser_provisional_code !== "MED-PROV") {
      throw new Error(`browser_provisional_code esperado 'MED-PROV', recibido ${dbUser.browser_provisional_code}`);
    }
    testDb.close();
    console.log("   [OK] Registro en BD contiene metadatos de procedencia completos:");
    console.log("        - recovered_from_browser: 1");
    console.log("        - browser_provisional_code: MED-PROV");
    console.log("        - browser_claimed_xp: 3500");
    console.log("        - official xp: 0");

    // 7. Verificar que la base de datos real NUNCA fue tocada
    console.log("\n7. Comprobando aislamiento de la base de datos real...");
    const realDbAfter = new DatabaseSync(realDbPath);
    const realUsersAfter = realDbAfter.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
    realDbAfter.close();

    if (realUsersAfter !== realUsersBefore) {
      throw new Error(`VIOLACIÓN DE AISLAMIENTO: Usuarios en BD real cambiaron de ${realUsersBefore} a ${realUsersAfter}`);
    }
    console.log(`   [OK] Base real intacta: ${realUsersBefore} usuarios antes y después de la prueba`);

    console.log("\n=================================================================");
    console.log(" TODAS LAS PRUEBAS DE RECUPERACIÓN Y SEGURIDAD PASARON CON ÉXITO ");
    console.log("=================================================================\n");
  } finally {
    await env.cleanup();
  }
}

runRecoveryTests().catch((err) => {
  console.error("\n[ERROR EN PRUEBAS]", err);
  process.exit(1);
});
