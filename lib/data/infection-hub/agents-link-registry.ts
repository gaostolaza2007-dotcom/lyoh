import { MICROBIOLOGY_DATA, Microbe } from "@/lib/data/microbiology";

/**
 * REGISTRO UNIFICADO DE ENLACES A AGENTES MICROBIOLÓGICOS
 * 
 * Centraliza la vinculación de patógenos y comensales hacia su ficha clínica
 * oficial en el catálogo de Microbiología (/agentes-infecciosos/microbiologia),
 * evitando suposiciones erróneas, enlaces desfasados o conversiones espurias
 * de géneros en especies.
 */

export interface AgentReference {
  stableId: string;
  pdfId: string;
  name: string;
  taxonomy: string;
  href: string;
}

export type AgentResolutionStatus = "exact_card" | "group_example" | "pending";

export interface AgentResolution {
  status: AgentResolutionStatus;
  agent?: Microbe;
  groupLabel?: string;
  href?: string;
  pdfId?: string;
  name?: string;
  catalogId?: string;
}

// Mapas indexados por ID estable, pdfId y nombre normalizado exacto
const AGENTS_BY_ID = new Map<string, Microbe>();
const AGENTS_BY_PDF_ID = new Map<string, Microbe>();
const AGENTS_BY_NORMALIZED_NAME = new Map<string, Microbe>();

export function normalizeAgentName(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/["“”'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Inicializar índices en memoria con MICROBIOLOGY_DATA
MICROBIOLOGY_DATA.forEach((microbe) => {
  AGENTS_BY_ID.set(microbe.id.toLowerCase(), microbe);
  if (microbe.pdfId) {
    AGENTS_BY_PDF_ID.set(microbe.pdfId.toUpperCase(), microbe);
  }
  AGENTS_BY_NORMALIZED_NAME.set(normalizeAgentName(microbe.name), microbe);
  if (microbe.aliases) {
    microbe.aliases.forEach((alias) => {
      AGENTS_BY_NORMALIZED_NAME.set(normalizeAgentName(alias), microbe);
    });
  }
});

// Ejemplos verificados de especies del catálogo para géneros/grupos reconocidos
// Solo cuando la relación taxonómica es correcta y está documentada.
const GROUP_REPRESENTATIVES: Record<string, { catalogCode: string; groupName: string }> = {
  "staphylococcus (coagulasa negativos)": { catalogCode: "B04", groupName: "Estafilococos coagulasa negativos" },
  "staphylococcus coagulasa negativos": { catalogCode: "B04", groupName: "Estafilococos coagulasa negativos" },
  "estafilococos coagulasa negativos": { catalogCode: "B04", groupName: "Estafilococos coagulasa negativos" },
  "staphylococcus spp.": { catalogCode: "B04", groupName: "Staphylococcus" },
  "streptococcus spp.": { catalogCode: "B01", groupName: "Streptococcus" },
  "enterococcus spp.": { catalogCode: "B08", groupName: "Enterococcus" },
  "klebsiella spp.": { catalogCode: "B11", groupName: "Klebsiella" },
  "proteus spp.": { catalogCode: "B14", groupName: "Proteus" },
  "pseudomonas spp.": { catalogCode: "B02", groupName: "Pseudomonas" },
  "salmonella spp.": { catalogCode: "B16", groupName: "Salmonella" },
  "salmonella enterica": { catalogCode: "B16", groupName: "Salmonella enterica" },
  "acinetobacter spp.": { catalogCode: "B13", groupName: "Acinetobacter" },
  "candida spp.": { catalogCode: "H03", groupName: "Candida" },
  "aspergillus spp.": { catalogCode: "H09", groupName: "Aspergillus" },
  "plasmodium spp.": { catalogCode: "P01", groupName: "Plasmodium" },
  "cryptococcus spp.": { catalogCode: "H01", groupName: "Cryptococcus" }
};

/**
 * Busca un agente microbiológico exacto por su identificador estable (id o pdfId) o por su nombre científico.
 * NO utiliza coincidencias difusas ni contención de subcadenas para evitar falsos positivos.
 */
export function findAgent(identifierOrName?: string | null): Microbe | undefined {
  if (!identifierOrName) return undefined;
  
  const trimmed = identifierOrName.trim();
  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();

  // 1. Buscar por id interno exacto (ej. "micro-1", "b03", "v26")
  if (AGENTS_BY_ID.has(lower)) {
    return AGENTS_BY_ID.get(lower);
  }

  // 2. Buscar por pdfId (ej. "B01", "B32", "V26", "H03", "P02")
  if (AGENTS_BY_PDF_ID.has(upper)) {
    return AGENTS_BY_PDF_ID.get(upper);
  }

  // 3. Buscar por nombre normalizado exacto o alias registrado
  const normalized = normalizeAgentName(trimmed);
  if (AGENTS_BY_NORMALIZED_NAME.has(normalized)) {
    return AGENTS_BY_NORMALIZED_NAME.get(normalized);
  }

  return undefined;
}

/**
 * Resuelve la relación de un nombre o identificador con el catálogo:
 * - exact_card: Ficha individual existente en el catálogo oficial de 140 agentes.
 * - group_example: Género o grupo que cuenta con un ejemplo verificado de especie.
 * - pending: No presente en el catálogo o pendiente de ficha independiente.
 */
export function resolveAgentLink(identifierOrName?: string | null): AgentResolution {
  if (!identifierOrName) {
    return { status: "pending", groupLabel: "Ficha pendiente" };
  }

  // 1. Verificar coincidencia exacta con el catálogo
  const exact = findAgent(identifierOrName);
  if (exact) {
    return {
      status: "exact_card",
      agent: exact,
      catalogId: exact.id,
      pdfId: exact.pdfId,
      name: exact.name,
      href: `/agentes-infecciosos/microbiologia?id=${encodeURIComponent(exact.id)}`
    };
  }

  // 2. Verificar si corresponde a un grupo con especie de ejemplo verificada
  const normalized = normalizeAgentName(identifierOrName);
  const groupMatch = GROUP_REPRESENTATIVES[normalized];
  if (groupMatch) {
    const exampleAgent = findAgent(groupMatch.catalogCode);
    if (exampleAgent) {
      return {
        status: "group_example",
        agent: exampleAgent,
        catalogId: exampleAgent.id,
        pdfId: exampleAgent.pdfId,
        name: exampleAgent.name,
        groupLabel: `Ejemplo de especie del grupo: ${exampleAgent.name} (${exampleAgent.pdfId})`,
        href: `/agentes-infecciosos/microbiologia?id=${encodeURIComponent(exampleAgent.id)}`
      };
    }
  }

  // 3. Sin ficha ni ejemplo verificado en el catálogo actual
  return {
    status: "pending",
    groupLabel: "Ficha pendiente"
  };
}

/**
 * Devuelve la URL canónica hacia la ficha del agente en el catálogo de Microbiología,
 * o undefined si no existe ficha directa ni ejemplo del grupo.
 */
export function getAgentCatalogHref(identifierOrName: string): string | undefined {
  const resolution = resolveAgentLink(identifierOrName);
  return resolution.href;
}

/**
 * Devuelve una referencia rápida con metadatos del agente para visualización en badges o enlaces.
 */
export function getAgentReference(identifierOrName: string): AgentReference | undefined {
  const agent = findAgent(identifierOrName);
  if (!agent) return undefined;

  return {
    stableId: agent.id,
    pdfId: agent.pdfId,
    name: agent.name,
    taxonomy: agent.taxonomy,
    href: `/agentes-infecciosos/microbiologia?id=${encodeURIComponent(agent.id)}`
  };
}
