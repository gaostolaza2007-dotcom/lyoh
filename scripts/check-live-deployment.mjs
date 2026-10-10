import https from "https";

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    }).on("error", err => resolve({ error: err.message }));
  });
}

async function inspectNetlify() {
  console.log("=== INSPECCIONANDO DESPLIEGUE ACTIVO EN NETLIFY ===");
  console.log("URL: https://lyoh.netlify.app/\n");

  const page = await checkUrl("https://lyoh.netlify.app/");
  console.log("Status HTTP:", page.statusCode);
  console.log("Encabezados relevantes:");
  console.log("  x-nf-request-id:", page.headers["x-nf-request-id"]);
  console.log("  age:", page.headers["age"]);
  console.log("  date:", page.headers["date"]);
  console.log("  etag:", page.headers["etag"]);

  // Extract Next.js BUILD_ID
  const buildIdMatch = page.body.match(/\/static\/([^/]+)\/_buildManifest\.js/);
  const buildId = buildIdMatch ? buildIdMatch[1] : null;
  console.log("\nNext.js Build ID detectado en producción:", buildId);

  // Look for chunk hashes
  const scriptRegex = /src="(\/_next\/static\/chunks\/[^"]+)"/g;
  let match;
  const chunks = [];
  while ((match = scriptRegex.exec(page.body)) !== null) {
    chunks.push(match[1]);
  }

  console.log("Chunks JavaScript cargados por la página principal:");
  chunks.forEach(c => console.log("  -", c));

  // Inspect onboarding page in production
  console.log("\nInspeccionando /onboarding en https://lyoh.netlify.app/onboarding ...");
  const onboarding = await checkUrl("https://lyoh.netlify.app/onboarding");
  console.log("Status /onboarding:", onboarding.statusCode);

  const onboardingChunks = [];
  while ((match = scriptRegex.exec(onboarding.body)) !== null) {
    onboardingChunks.push(match[1]);
  }
  console.log("Chunks en /onboarding:");
  onboardingChunks.forEach(c => console.log("  -", c));

  // Fetch the main app chunk or onboarding chunk to check if fallback code is present in production bundle
  console.log("\nBuscando presencia del fallback local ('fallbackCode' o 'MED-' + Math.random) en los chunks públicos de producción...");
  let fallbackFoundInChunk = false;
  for (const chunkPath of [...new Set([...chunks, ...onboardingChunks])]) {
    const chunkUrl = `https://lyoh.netlify.app${chunkPath}`;
    const chunkRes = await checkUrl(chunkUrl);
    if (typeof chunkRes.body === "string") {
      if (chunkRes.body.includes("fallbackCode") || chunkRes.body.includes('MED-"') || (chunkRes.body.includes("Math.random") && chunkRes.body.includes("36"))) {
        console.log(`  ⚠️ ENCONTRADO patrón de fallback local en: ${chunkPath}`);
        fallbackFoundInChunk = true;
      }
      if (chunkRes.body.includes("Agentes Infecciosos") || chunkRes.body.includes("agentes-infecciosos")) {
        console.log(`  ℹ️ Encontrado texto de agentes infecciosos en: ${chunkPath}`);
      }
    }
  }

  console.log("\nResultado de auditoría del código publicado:");
  console.log("¿La versión activa en Netlify contiene el fallback de registro ficticio?:", fallbackFoundInChunk ? "SÍ (CONFIRMADO)" : "NO");
}

inspectNetlify();
