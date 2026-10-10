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

async function runIdempotencyTests() {
  console.log("=================================================================");
  console.log(" PARTE 1: PRUEBAS DE IDEMPOTENCIA Y PROTECCIÓN DE CUENTAS AJENAS ");
  console.log("=================================================================\n");

  const env = await createIsolatedTestEnv("test-idemp-");

  const realDbPath = path.resolve(process.cwd(), "data", "medstudy.db");
  const realDbBefore = new DatabaseSync(realDbPath);
  const realUsersBefore = realDbBefore.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
  realDbBefore.close();

  try {
    const port = env.port;
    const hostname = "127.0.0.1";

    // 1. Registro con clientRequestId
    console.log("1. Registrando participante con clientRequestId...");
    const regReqId = "req-test-uuid-001";
    const reg1 = await request(
      {
        hostname,
        port,
        path: "/api/auth/register-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "Ana García",
        university: "Universidad de Chile",
        universityShort: "UCH",
        career: "Medicina",
        clientRequestId: regReqId,
      }
    );

    if (reg1.status !== 200 || !reg1.data?.user?.participantCode) {
      throw new Error(`Fallo en registro inicial: status ${reg1.status}, data: ${JSON.stringify(reg1.data)}`);
    }
    const user1Code = reg1.data.user.participantCode;
    const user1Id = reg1.data.user.id;
    console.log("   [OK] Usuario registrado con código:", user1Code);

    // 2. Simulación de respuesta perdida / reintento con el mismo clientRequestId
    console.log("\n2. Simulando reintento por pérdida de respuesta (mismo clientRequestId)...");
    const reg2 = await request(
      {
        hostname,
        port,
        path: "/api/auth/register-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "Ana García",
        university: "Universidad de Chile",
        universityShort: "UCH",
        career: "Medicina",
        clientRequestId: regReqId,
      }
    );

    if (reg2.status !== 200 || !reg2.data?.user?.participantCode) {
      throw new Error(`Fallo en reintento: status ${reg2.status}, data: ${JSON.stringify(reg2.data)}`);
    }

    if (reg2.data.user.participantCode !== user1Code || reg2.data.user.id !== user1Id) {
      throw new Error(`Violación de idempotencia: Se generó un nuevo usuario (${reg2.data.user.participantCode}) en lugar de devolver el existente (${user1Code})`);
    }
    console.log("   [OK] Reintento devuelve exactamente el mismo código y usuario:", reg2.data.user.participantCode);

    // Comprobar que en la BD solo existe 1 registro y no 2
    const testDb = new DatabaseSync(env.testDbPath);
    const countAna = testDb.prepare("SELECT COUNT(*) as cnt FROM users WHERE nickname = 'Ana García'").get().cnt;
    if (countAna !== 1) {
      throw new Error(`Fallo: Se encontraron ${countAna} usuarios para 'Ana García' en lugar de 1`);
    }
    console.log("   [OK] Conteo en base de datos verificado: exactamente 1 registro creado.");

    // 3. Intento de ataque/reutilización de clientRequestId con datos distintos
    console.log("\n3. Verificando rechazo si un atacante intenta usar el clientRequestId con otro nombre...");
    const attackReg = await request(
      {
        hostname,
        port,
        path: "/api/auth/register-participant",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "Atacante Falso",
        university: "Otra Universidad",
        universityShort: "OTRA",
        career: "Enfermería",
        clientRequestId: regReqId,
      }
    );

    if (attackReg.status >= 400) {
      console.log("   [OK] Solicitud conflictiva rechazada correctamente (status:", attackReg.status, ")");
    } else {
      throw new Error("Vulnerabilidad: Se permitió reutilizar un clientRequestId con datos distintos");
    }

    // 4. Recuperación de perfil con clientRequestId y provisionalCode
    console.log("\n4. Ejecutando recuperación con clientRequestId y provisionalCode...");
    const recReqId = "rec-test-uuid-002";
    const provCode = "MED-X999";
    const rec1 = await request(
      {
        hostname,
        port,
        path: "/api/auth/recover-browser-profile",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "Carlos Méndez",
        university: "Universidad de Concepción",
        universityShort: "UdeC",
        career: "Kinesiología",
        claimedXp: 1800,
        provisionalCode: provCode,
        clientRequestId: recReqId,
      }
    );

    if (rec1.status !== 200 || !rec1.data?.assignedCode) {
      throw new Error(`Fallo en recuperación inicial: status ${rec1.status}, data: ${JSON.stringify(rec1.data)}`);
    }
    const rec1Code = rec1.data.assignedCode;
    console.log("   [OK] Perfil recuperado con nuevo código asignado:", rec1Code);

    // 5. Simular reintento de la misma recuperación
    console.log("\n5. Simulando reintento de recuperación por respuesta perdida...");
    const rec2 = await request(
      {
        hostname,
        port,
        path: "/api/auth/recover-browser-profile",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "Carlos Méndez",
        university: "Universidad de Concepción",
        universityShort: "UdeC",
        career: "Kinesiología",
        claimedXp: 1800,
        provisionalCode: provCode,
        clientRequestId: recReqId,
      }
    );

    if (rec2.status !== 200 || rec2.data?.assignedCode !== rec1Code) {
      throw new Error(`Violación de idempotencia en recuperación: se esperaba código ${rec1Code}, recibido ${rec2.data?.assignedCode}`);
    }
    console.log("   [OK] Reintento de recuperación devuelve el mismo usuario y código:", rec2.data.assignedCode);

    // 6. Proteger contra acceso a cuentas ajenas:
    // Otro cliente intenta reclamar el mismo provisionalCode con un clientRequestId distinto
    console.log("\n6. Verificando que otro usuario NO puede apropiarse del código provisional ajeno...");
    const hijackRec = await request(
      {
        hostname,
        port,
        path: "/api/auth/recover-browser-profile",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        nickname: "Tercero No Autorizado",
        university: "Universidad de Concepción",
        universityShort: "UdeC",
        career: "Kinesiología",
        claimedXp: 0,
        provisionalCode: provCode, // Intento de reclamar el mismo código provisional
        clientRequestId: "hacker-request-id-999",
      }
    );

    if (hijackRec.status >= 400) {
      console.log("   [OK] Intento de reclamar código provisional ajeno bloqueado (status:", hijackRec.status, ")");
    } else {
      throw new Error("Vulnerabilidad de seguridad: Se permitió apropiarse de un código provisional ya recuperado");
    }

    testDb.close();

    // 7. Base real intacta
    const realDbAfter = new DatabaseSync(realDbPath);
    const realUsersAfter = realDbAfter.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
    realDbAfter.close();

    if (realUsersAfter !== realUsersBefore) {
      throw new Error(`VIOLACIÓN: La base real fue modificada (${realUsersBefore} -> ${realUsersAfter})`);
    }
    console.log("\n   [OK] Base real completamente intacta (7 usuarios).");

    console.log("\n=================================================================");
    console.log(" PARTE 1 SUPERADA: IDEMPOTENCIA Y PROTECCIÓN DE CUENTAS 100% OK ");
    console.log("=================================================================\n");
  } finally {
    await env.cleanup();
  }
}

runIdempotencyTests().catch((err) => {
  console.error("[ERROR EN PRUEBAS DE IDEMPOTENCIA]", err);
  process.exit(1);
});
