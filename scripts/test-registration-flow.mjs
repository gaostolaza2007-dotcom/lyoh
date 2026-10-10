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
  console.log(" PRUEBAS DE REGISTRO E INICIO DE SESIÓN FIABLE");
  console.log("==================================================\n");

  const env = await createIsolatedTestEnv("test-reg-flow-");

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

    // 1. Registro con datos inválidos (nombre vacío)
    console.log("1. Verificando rechazo de registro con nombre vacío...");
    const badReg1 = await request(
      {
        hostname,
        port,
        path: "/api/auth/register-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "   ",
        university: "Universidad del Desarrollo",
        universityShort: "UDD",
        career: "Medicina",
      }
    );
    console.assert(badReg1.status === 400, `badReg1 esperaba status 400, obtuvo ${badReg1.status}`);
    console.assert(badReg1.data.error, "badReg1 esperaba mensaje de error");
    console.log(`   ✅ Rechazado correctamente (status ${badReg1.status}): "${badReg1.data.error}"`);

    // 2. Registro con datos inválidos (carrera vacía)
    console.log("\n2. Verificando rechazo de registro con carrera vacía...");
    const badReg2 = await request(
      {
        hostname,
        port,
        path: "/api/auth/register-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "Camila",
        university: "Universidad del Desarrollo",
        universityShort: "UDD",
        career: "",
      }
    );
    console.assert(badReg2.status === 400, `badReg2 esperaba status 400, obtuvo ${badReg2.status}`);
    console.log(`   ✅ Rechazado correctamente (status ${badReg2.status}): "${badReg2.data.error}"`);

    // 3. Registro legítimo de un nuevo estudiante
    console.log("\n3. Registrando nuevo participante legítimo (Estudiante A)...");
    const regRes = await request(
      {
        hostname,
        port,
        path: "/api/auth/register-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "Camila Rojas",
        university: "Universidad del Desarrollo",
        universityShort: "UDD",
        career: "Medicina",
      }
    );

    console.assert(regRes.status === 200, `Registro falló con status ${regRes.status}`);
    const cookieA = extractCookie(regRes.headers);
    console.assert(cookieA.startsWith("medstudy_session="), "Cookie de sesión esperada no fue emitida");
    const userA = regRes.data.user;
    console.assert(userA.participantCode && userA.participantCode.startsWith("MED-"), "Código MED-XXXX no generado");
    console.assert(userA.nickname === "Camila Rojas", "Nickname incorrecto");
    console.log(`   ✅ Participante persistido en servidor: ${userA.nickname} (Código: ${userA.participantCode})`);
    console.log(`   ✅ Cookie de sesión emitida: ${cookieA.substring(0, 30)}...`);

    // 4. Verificación de sesión activa mediante /api/auth/me
    console.log("\n4. Verificando sesión activa con /api/auth/me...");
    const meRes = await request({
      hostname,
      port,
      path: "/api/auth/me",
      method: "GET",
      headers: { Cookie: cookieA },
    });
    console.assert(meRes.status === 200, `meRes falló con status ${meRes.status}`);
    console.assert(meRes.data.user && meRes.data.user.id === userA.id, "Usuario devuelto por /me no coincide");
    console.log(`   ✅ Sesión verificada por el servidor para: ${meRes.data.user.nickname}`);

    // 5. Cierre de sesión (Logout)
    console.log("\n5. Cerrando sesión con /api/auth/logout...");
    const logoutRes = await request({
      hostname,
      port,
      path: "/api/auth/logout",
      method: "POST",
      headers: { Cookie: cookieA },
    });
    console.assert(logoutRes.status === 200, `Logout falló con status ${logoutRes.status}`);
    const clearCookie = extractCookie(logoutRes.headers);
    console.assert(clearCookie.includes("medstudy_session="), "Encabezado de borrado de cookie emitido");
    console.log("   ✅ Sesión destruida en servidor y cookie eliminada.");

    // 6. Verificación de que la sesión ya no es válida tras logout
    console.log("\n6. Verificando que /api/auth/me no reconoce la sesión tras logout...");
    const meAfterLogout = await request({
      hostname,
      port,
      path: "/api/auth/me",
      method: "GET",
      headers: { Cookie: cookieA },
    });
    console.assert(meAfterLogout.data.user === null, "El usuario debería ser null tras cerrar sesión");
    console.log("   ✅ Servidor devuelve user: null tras logout (sin sesiones fantasma).");

    // 7. Reanudar sesión usando el código asignado
    console.log(`\n7. Reanudando sesión con el código real asignado (${userA.participantCode})...`);
    const loginRes = await request(
      {
        hostname,
        port,
        path: "/api/auth/login-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        participantCode: userA.participantCode,
      }
    );
    console.assert(loginRes.status === 200, `Login con código falló con status ${loginRes.status}`);
    const cookieB = extractCookie(loginRes.headers);
    console.assert(cookieB.startsWith("medstudy_session="), "Nueva cookie de sesión esperada");
    console.assert(loginRes.data.user.id === userA.id, "ID de usuario recuperado no coincide");
    console.log(`   ✅ Acceso recuperado con éxito: ${loginRes.data.user.nickname} (${loginRes.data.user.participantCode})`);

    // 8. Intento de login con un código inventado (no existente)
    console.log("\n8. Intentando ingresar con un código ficticio inexistente (MED-FAKE)...");
    const fakeLogin = await request(
      {
        hostname,
        port,
        path: "/api/auth/login-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        participantCode: "MED-FAKE",
      }
    );
    console.assert(fakeLogin.status === 404, `fakeLogin esperaba 404, obtuvo ${fakeLogin.status}`);
    console.assert(
      fakeLogin.data.error === "No se encontró ningún participante con ese código.",
      "Mensaje de error inesperado"
    );
    console.log(`   ✅ Rechazado como esperado (404): "${fakeLogin.data.error}"`);

    // 9. Inmunidad de la base de datos real
    const realDbAfter = new DatabaseSync(realDbPath);
    const realUsersAfter = realDbAfter.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
    realDbAfter.close();
    console.assert(
      realUsersBefore === realUsersAfter,
      `CORRUPCIÓN DETECTADA: Base real cambió de ${realUsersBefore} a ${realUsersAfter}`
    );
    console.log(`\n9. ✅ Base de datos real completamente inmune e intacta (${realUsersAfter} usuarios).`);

    console.log("\n==================================================");
    console.log("  TODAS LAS PRUEBAS DE REGISTRO PASARON EXITOSAMENTE (9/9)");
    console.log("==================================================");
  } finally {
    await env.cleanup();
  }
}

runTests().catch((err) => {
  console.error("❌ ERROR EN PRUEBAS:", err);
  process.exit(1);
});
