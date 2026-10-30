/**
 * Motor determinista de distribución y gestión de ejemplares para el
 * Simulador de Preparación Microscópica de LYOH.
 * Separado del catálogo de datos (sample-simulator-catalog.ts).
 */

import {
  SIMULATOR_CATALOG,
  SIMULATOR_AMBIENT_DETRITUS,
  SIMULATOR_LIMITS,
  SimulatorCatalogElement,
  SimulatorSpecimenVariant,
  getCatalogElementById,
} from "./sample-simulator-catalog";

export interface PlacedSpecimenInstance {
  instanceId: string;
  elementId: string;
  instanceNumber: number;
  variantIndex: number;
  variantId: string;
  /** Coordenadas en la lámina lógica de 1800 × 1350 px */
  xPx: number;
  yPx: number;
  /** Coordenadas porcentuales (0–100) respecto a la lámina */
  xPct: number;
  yPct: number;
  rotationDeg: number;
  scaleFactor: number;
  /** Dimensiones en la lámina lógica respetando la proporción original */
  widthPx: number;
  heightPx: number;
  collisionRadiusPx: number;
}

export interface AmbientDetritusInstance {
  id: string;
  assetId: string;
  cutoutSrc: string;
  xPct: number;
  yPct: number;
  widthPx: number;
  heightPx: number;
  rotationDeg: number;
  opacity: number;
}

export interface SimulatorStudentObservation {
  id: string;
  label: string;
  /** Coordenadas porcentuales (0–100) dentro de la lámina de 1800 × 1350 px */
  xPct: number;
  yPct: number;
  note: string;
  /** Ejemplar cercano opcional si el estudiante marcó sobre un objeto */
  linkedInstanceId: string | null;
}

/** Generador pseudoaleatorio determinista (Mulberry32) */
export function createSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Calcula las dimensiones en lámina conservando exactamente la relación de aspecto original */
function computeVariantDimensions(
  variant: SimulatorSpecimenVariant,
  scaleFactor: number
): { widthPx: number; heightPx: number } {
  const maxCutoutDim = Math.max(variant.cutoutWidthPx, variant.cutoutHeightPx, 1);
  const targetMax = variant.stageBaseSizePx * scaleFactor;
  const ratio = targetMax / maxCutoutDim;
  return {
    widthPx: Math.round(variant.cutoutWidthPx * ratio * 10) / 10,
    heightPx: Math.round(variant.cutoutHeightPx * ratio * 10) / 10,
  };
}

/**
 * Encuentra una posición orgánica no alineada en cuadrícula dentro de la lámina
 * de 1800 × 1350 px, procurando separación respecto a los ejemplares existentes
 * y creando zonas con agrupamiento moderado y zonas más despejadas.
 */
function findOrganicPosition(
  rng: () => number,
  existing: PlacedSpecimenInstance[],
  candidateRadius: number,
  stageW: number,
  stageH: number
): { xPx: number; yPx: number } {
  const marginX = Math.max(125, candidateRadius + 40);
  const marginY = Math.max(115, candidateRadius + 40);
  const usableW = stageW - marginX * 2;
  const usableH = stageH - marginY * 2;

  // Definir 5 atractores orgánicos desplazados del centro para evitar cuadrículas uniformes
  // y dejar zonas con menos densidad que obliguen a recorrer la preparación
  const attractors = [
    { cx: 0.24, cy: 0.28, spreadX: 0.18, spreadY: 0.19 },
    { cx: 0.52, cy: 0.46, spreadX: 0.22, spreadY: 0.21 },
    { cx: 0.76, cy: 0.31, spreadX: 0.17, spreadY: 0.18 },
    { cx: 0.31, cy: 0.73, spreadX: 0.19, spreadY: 0.17 },
    { cx: 0.72, cy: 0.71, spreadX: 0.20, spreadY: 0.18 },
  ];

  let bestX = marginX + rng() * usableW;
  let bestY = marginY + rng() * usableH;
  let bestMinClearance = -Infinity;

  const maxAttempts = 48;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let candX: number;
    let candY: number;

    if (rng() < 0.68) {
      // Distribución alrededor de un atractor orgánico (Box-Muller aproximado con suma de uniformes)
      const att = attractors[Math.floor(rng() * attractors.length)];
      const gaussX = (rng() + rng() + rng() - 1.5) * 1.15;
      const gaussY = (rng() + rng() + rng() - 1.5) * 1.15;
      const normX = Math.min(0.96, Math.max(0.04, att.cx + gaussX * att.spreadX));
      const normY = Math.min(0.96, Math.max(0.04, att.cy + gaussY * att.spreadY));
      candX = marginX + normX * usableW;
      candY = marginY + normY * usableH;
    } else {
      // Dispersión libre en toda la preparación
      candX = marginX + rng() * usableW;
      candY = marginY + rng() * usableH;
    }

    let minClearance = Infinity;
    for (const other of existing) {
      const dx = candX - other.xPx;
      const dy = candY - other.yPx;
      const dist = Math.hypot(dx, dy);
      const requiredDist = (candidateRadius + other.collisionRadiusPx) * 0.92;
      const clearance = dist - requiredDist;
      if (clearance < minClearance) {
        minClearance = clearance;
      }
    }

    if (existing.length === 0 || minClearance >= 14) {
      return { xPx: Math.round(candX), yPx: Math.round(candY) };
    }

    if (minClearance > bestMinClearance) {
      bestMinClearance = minClearance;
      bestX = candX;
      bestY = candY;
    }
  }

  return { xPx: Math.round(bestX), yPx: Math.round(bestY) };
}

/**
 * Crea un único ejemplar nuevo de `elementId` sin alterar la posición ni
 * orientación de los ejemplares ya existentes en la preparación.
 */
export function createSingleSpecimenInstance(
  element: SimulatorCatalogElement,
  existingInstances: PlacedSpecimenInstance[],
  seed: number,
  serialCounter: number
): PlacedSpecimenInstance {
  const stageW = SIMULATOR_LIMITS.STAGE_WIDTH_PX;
  const stageH = SIMULATOR_LIMITS.STAGE_HEIGHT_PX;

  const existingOfType = existingInstances.filter((i) => i.elementId === element.id);
  const instanceNumber = existingOfType.length + 1;

  // Ciclar entre las variantes fotográficas reales disponibles (ej. var1, var2, var3)
  const variantIndex = (instanceNumber - 1) % element.variants.length;
  const variant = element.variants[variantIndex];

  const rng = createSeededRng(seed + serialCounter * 7919 + instanceNumber * 104729);
  const [minScale, maxScale] = element.scaleJitterRange;
  const scaleFactor =
    Math.round((minScale + rng() * (maxScale - minScale)) * 1000) / 1000;

  // Rotación moderada para formas con orientación diagnóstica o rotación completa natural
  const rotationDeg = Math.round((rng() * 340 - 170) * 10) / 10;
  const { widthPx, heightPx } = computeVariantDimensions(variant, scaleFactor);
  const effectiveRadius = Math.round(element.collisionRadiusPx * scaleFactor);

  const { xPx, yPx } = findOrganicPosition(
    rng,
    existingInstances,
    effectiveRadius,
    stageW,
    stageH
  );

  return {
    instanceId: `${element.id}-inst-${serialCounter}`,
    elementId: element.id,
    instanceNumber,
    variantIndex,
    variantId: variant.variantId,
    xPx,
    yPx,
    xPct: Math.round((xPx / stageW) * 10000) / 100,
    yPct: Math.round((yPx / stageH) * 10000) / 100,
    rotationDeg,
    scaleFactor,
    widthPx,
    heightPx,
    collisionRadiusPx: effectiveRadius,
  };
}

/**
 * Genera una distribución inicial o redistribuida completa conservando las
 * cantidades indicadas por tipo de elemento.
 */
export function generatePreparationFromCounts(
  countsByElementId: Record<string, number>,
  seed: number
): { instances: PlacedSpecimenInstance[]; nextSerial: number } {
  const instances: PlacedSpecimenInstance[] = [];
  let serial = 1;

  // Ordenar intercalando tipos para que la distribución mezcle orgánicamente los elementos
  const elementIds = SIMULATOR_CATALOG.map((el) => el.id);
  const maxCount = Math.max(0, ...Object.values(countsByElementId));

  for (let round = 0; round < maxCount; round++) {
    for (const elId of elementIds) {
      const targetCount = countsByElementId[elId] || 0;
      if (round < targetCount) {
        const element = getCatalogElementById(elId);
        if (!element) continue;
        if (instances.length >= SIMULATOR_LIMITS.MAX_TOTAL_ELEMENTS) break;
        const inst = createSingleSpecimenInstance(
          element,
          instances,
          seed + round * 313,
          serial++
        );
        instances.push(inst);
      }
    }
  }

  return { instances, nextSerial: serial };
}

/**
 * Genera los elementos ambientales de sedimento coprológico real (detritus)
 * que dan contexto alrededor de los huevos y artefactos en toda la lámina.
 */
export function generateAmbientDetritusLayer(seed: number): AmbientDetritusInstance[] {
  const rng = createSeededRng(seed ^ 0x9e3779b9);
  const ambient: AmbientDetritusInstance[] = [];
  const totalDetritus = 16;

  for (let i = 0; i < totalDetritus; i++) {
    const asset = SIMULATOR_AMBIENT_DETRITUS[i % SIMULATOR_AMBIENT_DETRITUS.length];
    const scale = 0.72 + rng() * 0.52;
    const widthPx = Math.round(asset.stageBaseSizePx * scale);
    const heightPx = Math.round(asset.stageBaseSizePx * scale * 0.85);
    const xPct = Math.round((6 + rng() * 88) * 100) / 100;
    const yPct = Math.round((7 + rng() * 86) * 100) / 100;
    const rotationDeg = Math.round(rng() * 360);
    const opacity = Math.round((0.46 + rng() * 0.28) * 100) / 100;

    ambient.push({
      id: `ambient-detritus-${i + 1}`,
      assetId: asset.id,
      cutoutSrc: asset.cutoutSrc,
      xPct,
      yPct,
      widthPx,
      heightPx,
      rotationDeg,
      opacity,
    });
  }

  return ambient;
}

/** Configuración inicial predeterminada rica y equilibrada para el simulador */
export function getDefaultInitialCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const el of SIMULATOR_CATALOG) {
    counts[el.id] = el.defaultInitialCount;
  }
  return counts;
}

/** Cuenta cuántos ejemplares hay por cada tipo en la lista actual */
export function countInstancesByElement(
  instances: PlacedSpecimenInstance[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const el of SIMULATOR_CATALOG) {
    counts[el.id] = 0;
  }
  for (const inst of instances) {
    counts[inst.elementId] = (counts[inst.elementId] || 0) + 1;
  }
  return counts;
}
