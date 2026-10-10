import http from "http";
import { URL } from "url";

// Estado en memoria del mock aislado de Supabase
const mockUsers = new Map();
const mockUnitProgress = new Map();
let simulateMissingProvenanceColumns = false;
let simulateUnitProgressFailure = false;
let deletedUserIds = [];

// Servidor Mock de PostgREST / Supabase
const mockServer = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  let body = "";

  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    let parsedBody = null;
    try {
      if (body) parsedBody = JSON.parse(body);
    } catch {}

    // 1. GET /rest/v1/users
    if (req.method === "GET" && pathname === "/rest/v1/users") {
      const codeEq = parsedUrl.searchParams.get("participant_code");
      const clientReqIdEq = parsedUrl.searchParams.get("client_request_id");
      const provCodeEq = parsedUrl.searchParams.get("browser_provisional_code");
      const idEq = parsedUrl.searchParams.get("id");

      let found = null;
      for (const u of mockUsers.values()) {
        if (codeEq && codeEq.replace("eq.", "") === u.participant_code) found = u;
        if (clientReqIdEq && clientReqIdEq.replace("eq.", "") === u.client_request_id) found = u;
        if (provCodeEq && provCodeEq.replace("eq.", "") === u.browser_provisional_code) found = u;
        if (idEq && idEq.replace("eq.", "") === u.id) found = u;
      }

      res.setHeader("Content-Type", "application/json");
      if (req.headers.accept?.includes("application/vnd.pgrst.object+json")) {
        if (!found) {
          res.writeHead(406); // PGRST116: no rows returned
          return res.end(JSON.stringify({ code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" }));
        }
        res.writeHead(200);
        return res.end(JSON.stringify(found));
      }

      res.writeHead(200);
      return res.end(JSON.stringify(found ? [found] : []));
    }

    // 2. POST /rest/v1/users
    if (req.method === "POST" && pathname === "/rest/v1/users") {
      if (simulateMissingProvenanceColumns) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(400);
        return res.end(JSON.stringify({
          code: "PGRST204",
          message: "Could not find the 'recovered_from_browser' column of 'users' in the schema cache",
          details: null,
          hint: null
        }));
      }

      const payload = Array.isArray(parsedBody) ? parsedBody[0] : parsedBody;
      mockUsers.set(payload.id, payload);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(201);
      return res.end(JSON.stringify(payload));
    }

    // 3. POST /rest/v1/unit_progress
    if (req.method === "POST" && pathname === "/rest/v1/unit_progress") {
      if (simulateUnitProgressFailure) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(500);
        return res.end(JSON.stringify({ message: "Simulated foreign key or database constraint failure" }));
      }

      const rows = Array.isArray(parsedBody) ? parsedBody : [parsedBody];
      for (const r of rows) {
        mockUnitProgress.set(`${r.user_id}_${r.module_id}_${r.unit_id}`, r);
      }

      res.setHeader("Content-Type", "application/json");
      res.writeHead(201);
      return res.end(JSON.stringify(rows));
    }

    // 4. DELETE /rest/v1/users (Rollback)
    if (req.method === "DELETE" && pathname === "/rest/v1/users") {
      const idEq = parsedUrl.searchParams.get("id");
      if (idEq) {
        const id = idEq.replace("eq.", "");
        mockUsers.delete(id);
        deletedUserIds.push(id);
      }
      res.writeHead(204);
      return res.end();
    }

    // 5. POST /rest/v1/activity_logs
    if (req.method === "POST" && pathname === "/rest/v1/activity_logs") {
      res.writeHead(201);
      return res.end(JSON.stringify({}));
    }

    res.writeHead(404);
    res.end();
  });
});

async function runSupabaseAdapterTests() {
  console.log("=================================================================");
  console.log(" PARTE 2: PRUEBAS AISLADAS DEL ADAPTADOR SUPABASE / POSTGRESQL   ");
  console.log("=================================================================\n");

  const MOCK_PORT = 3097;
  await new Promise((resolve) => mockServer.listen(MOCK_PORT, resolve));
  console.log(`[MOCK SUPABASE] Servidor PostgREST aislado escuchando en http://127.0.0.1:${MOCK_PORT}`);

  // Configurar variables para que supabase-admin apunte al mock local aislado
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${MOCK_PORT}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role-key-for-isolated-tests";

  try {
    const {
      supabaseRegisterParticipant,
      supabaseRecoverBrowserProfile,
      supabaseGetUserByClientRequestId
    } = await import("../lib/server/supabase-adapter.ts");

    // TEST 1: Registro legítimo y verificación de idempotencia en Supabase
    console.log("\n1. Probando registro de participante e idempotencia en Supabase...");
    const regReqId = "supa-req-001";
    const user1 = await supabaseRegisterParticipant({
      nickname: "Valeria Soto",
      university: "Universidad Austral de Chile",
      universityShort: "UACh",
      career: "Tecnología Médica",
      clientRequestId: regReqId,
    });

    if (!user1 || !user1.participant_code) {
      throw new Error("Fallo en registro inicial de Supabase.");
    }
    console.log("   [OK] Usuario creado en Supabase con código:", user1.participant_code);

    // Reintento con el mismo clientRequestId
    const user1Retry = await supabaseRegisterParticipant({
      nickname: "Valeria Soto",
      university: "Universidad Austral de Chile",
      universityShort: "UACh",
      career: "Tecnología Médica",
      clientRequestId: regReqId,
    });

    if (user1Retry.id !== user1.id || user1Retry.participant_code !== user1.participant_code) {
      throw new Error("Fallo de idempotencia en Supabase: se generó otro usuario en el reintento");
    }
    console.log("   [OK] Idempotencia en Supabase verificada: devuelve el mismo usuario sin duplicar.");

    // TEST 2: Rechazo si falta la migración SQL (NO crear cuenta básica)
    console.log("\n2. Probando rechazo estricto si faltan columnas de procedencia en Supabase...");
    simulateMissingProvenanceColumns = true;
    let failedWithoutFallback = false;
    try {
      await supabaseRecoverBrowserProfile({
        nickname: "Estudiante Prueba",
        university: "UDD",
        universityShort: "UDD",
        career: "Medicina",
        claimedXp: 1000,
        provisionalCode: "MED-TEST",
        clientRequestId: "supa-fail-test",
      });
    } catch (err) {
      if (err.message.includes("columnas de procedencia requeridas") || err.message.includes("migración SQL")) {
        failedWithoutFallback = true;
        console.log("   [OK] Error claro arrojado sin crear cuenta básica:", err.message);
      } else {
        throw new Error(`Mensaje inesperado: ${err.message}`);
      }
    }

    if (!failedWithoutFallback) {
      throw new Error("FALLO DE SEGURIDAD: supabaseRecoverBrowserProfile debió fallar y no crear cuentas sin procedencia.");
    }
    simulateMissingProvenanceColumns = false;

    // TEST 3: Recuperación legítima con procedencia e idempotencia
    console.log("\n3. Probando recuperación legítima con procedencia e idempotencia en Supabase...");
    const recReqId = "supa-rec-002";
    const recUser = await supabaseRecoverBrowserProfile({
      nickname: "Felipe Morales",
      university: "Pontificia Universidad Católica",
      universityShort: "PUC",
      career: "Medicina",
      claimedXp: 2200,
      provisionalCode: "MED-OLD1",
      clientRequestId: recReqId,
    });

    if (recUser.recovered_from_browser !== 1 || recUser.xp !== 0 || recUser.browser_claimed_xp !== 2200) {
      throw new Error("Metadatos de procedencia incorrectos en el adaptador Supabase.");
    }
    console.log("   [OK] Recuperación exitosa en Supabase con código nuevo:", recUser.participant_code);
    console.log("        - recovered_from_browser:", recUser.recovered_from_browser);
    console.log("        - official xp:", recUser.xp);
    console.log("        - browser_claimed_xp:", recUser.browser_claimed_xp);

    // Reintento de la misma recuperación
    const recUserRetry = await supabaseRecoverBrowserProfile({
      nickname: "Felipe Morales",
      university: "PUC",
      universityShort: "PUC",
      career: "Medicina",
      claimedXp: 2200,
      provisionalCode: "MED-OLD1",
      clientRequestId: recReqId,
    });

    if (recUserRetry.id !== recUser.id || recUserRetry.participant_code !== recUser.participant_code) {
      throw new Error("Fallo de idempotencia en recuperación de Supabase.");
    }
    console.log("   [OK] Reintento de recuperación en Supabase devuelve el mismo registro sin duplicados.");

    // TEST 4: Bloqueo de acceso a cuenta ajena (otro cliente intentando reutilizar el código provisional)
    console.log("\n4. Probando que otro cliente NO puede apropiarse del código provisional ajeno...");
    let hijackBlocked = false;
    try {
      await supabaseRecoverBrowserProfile({
        nickname: "Atacante Ajeno",
        university: "PUC",
        universityShort: "PUC",
        career: "Medicina",
        claimedXp: 0,
        provisionalCode: "MED-OLD1",
        clientRequestId: "hacker-diff-client-id",
      });
    } catch (err) {
      if (err.message.includes("ya ha sido recuperado")) {
        hijackBlocked = true;
        console.log("   [OK] Intento de acceso ajeno bloqueado correctamente:", err.message);
      } else {
        throw new Error(`Mensaje inesperado al bloquear atacante: ${err.message}`);
      }
    }

    if (!hijackBlocked) {
      throw new Error("VULNERABILIDAD: Se permitió acceder a cuenta ajena por código provisional.");
    }

    // TEST 5: Prueba de Rollback si falla unit_progress (no dejar cuentas a medias)
    console.log("\n5. Probando Rollback atómico en Supabase si falla unit_progress...");
    simulateUnitProgressFailure = true;
    deletedUserIds = [];
    let rollbackSucceeded = false;

    try {
      await supabaseRegisterParticipant({
        nickname: "Usuario Que Falla",
        university: "UDD",
        universityShort: "UDD",
        career: "Medicina",
        clientRequestId: "rollback-test-id",
      });
    } catch (err) {
      if (err.message.includes("Error al inicializar progreso")) {
        rollbackSucceeded = true;
        console.log("   [OK] Inserción falló y arrojó error esperado:", err.message);
      }
    }

    if (!rollbackSucceeded || deletedUserIds.length === 0) {
      throw new Error("FALLO DE ROLLBACK: El usuario no fue eliminado al fallar el progreso.");
    }
    console.log("   [OK] Rollback confirmado: Se ejecutó DELETE en Supabase para el usuario fallido:", deletedUserIds[0]);

    console.log("\n=================================================================");
    console.log(" PARTE 2 SUPERADA: ADAPTADOR SUPABASE AISLADO VERIFICADO AL 100% ");
    console.log("=================================================================\n");
  } finally {
    mockServer.close();
  }
}

runSupabaseAdapterTests().catch((err) => {
  console.error("[ERROR EN PRUEBAS DE SUPABASE ADAPTER]", err);
  process.exit(1);
});
