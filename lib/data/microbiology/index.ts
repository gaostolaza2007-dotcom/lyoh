import { Microbe, MicrobeTaxonomy, MicrobeReference, ReferenceLink } from "./types";
import { VIRUS_CARDS } from "./viruses";
import { BACTERIA_CARDS } from "./bacteria";
import { FUNGI_CARDS } from "./fungi";
import { PARASITE_CARDS } from "./parasites";
import { MICROBIOLOGY_REFERENCES } from "./references";

export type { Microbe, MicrobeTaxonomy, MicrobeReference, ReferenceLink };
export { MICROBIOLOGY_REFERENCES };

export const MICROBIOLOGY_DATA: Microbe[] = [
  ...VIRUS_CARDS,
  ...BACTERIA_CARDS,
  ...FUNGI_CARDS,
  ...PARASITE_CARDS,
];

/**
 * Normaliza un texto para búsqueda insensible a mayúsculas, minúsculas,
 * espacios superfluos y acentos/tildes diacríticas.
 */
export function normalizeSearch(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Función de búsqueda especializada en el catálogo de microbiología.
 */
export function matchesMicrobeSearch(microbe: Microbe, rawQuery: string): boolean {
  const q = normalizeSearch(rawQuery);
  if (!q) return true;

  if (normalizeSearch(microbe.name).includes(q)) return true;
  if (normalizeSearch(microbe.pdfId).includes(q)) return true;
  if (microbe.aliases && microbe.aliases.some((a) => normalizeSearch(a).includes(q))) return true;
  if (normalizeSearch(microbe.stainOrGenetics).includes(q)) return true;
  if (normalizeSearch(microbe.clinicalPresentation).includes(q)) return true;
  if (normalizeSearch(microbe.transmission).includes(q)) return true;
  if (normalizeSearch(microbe.firstLineTreatment).includes(q)) return true;
  if (normalizeSearch(microbe.examPearl).includes(q)) return true;
  if (microbe.virulenceFactors.some((vf) => normalizeSearch(vf).includes(q))) return true;
  if (microbe.typeBadge && normalizeSearch(microbe.typeBadge).includes(q)) return true;

  return false;
}
