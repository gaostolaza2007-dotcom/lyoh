"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Layers,
  Sparkles,
  Microscope,
  Eye,
  EyeOff,
  Focus,
  Maximize2,
  RotateCcw,
  Play,
  Pause,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Scissors,
  Activity,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
} from "lucide-react";

/**
 * Visor 3D Hiperrealista Diferencial para las especies humanas de Plasmodium:
 * - P03: Plasmodium vivax (trofozoíto ameboide en reticulocito agrandado con puntos de Schüffner, esquizonte de 12–24 merozoítos, gametocito esférico e hipnozoíto hepático)
 * - P04: Plasmodium ovale (eritrocito ovalado y fimbriado/desflecado con puntos de James, trofozoíto compacto, esquizonte de 6–14 merozoítos e hipnozoíto hepático)
 * - P05: Plasmodium malariae (trofozoíto ecuatorial «en banda» en eritrocito senescente normo/microcítico con puntos de Ziemann, esquizonte «en margarita» de 6–12 merozoítos con pigmento central grueso y anillo «en ojo de pájaro»)
 *
 * Referencias primarias:
 * - CDC DPDx - Malaria (Plasmodium vivax, P. ovale, P. malariae): https://www.cdc.gov/dpdx/malaria/index.html
 * - Guías Clínicas MINSAL / ISP Chile: Diagnóstico de Malaria
 */
export type PlasmodiumSpeciesCode = "p03" | "p04" | "p05";
export type PlasmodiumDiffShaderMode = 0 | 1 | 2 | 3;

export interface PlasmodiumDiffRegionInfo {
  id: string;
  number: number;
  name: string;
  shortLabel: string;
  badge: string;
  scale: string;
  regionCode: number;
  colorBio: string;
  colorStain: string;
  localAnchor: [number, number, number];
  labelOffset: [number, number];
  camGoal: {
    position: [number, number, number];
    target: [number, number, number];
  };
  defaultTranslucency?: number;
  defaultCutPercent?: number;
  summary: string;
  microscopyNote: string;
  reconstruction3DNote: string;
}

export interface PlasmodiumDiffStageMeta {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  dimensionsNote: string;
  scaleBarLabel: string;
  scaleBarWorldUnits: number;
  translucencyLabel: string;
  translucencyHint: string;
  defaultTranslucency: number;
  defaultCutPercent: number;
  hasMovement: boolean;
  defaultCamera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  focusCamera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  focusButtonLabel: string;
  fullButtonLabel: string;
  overviewSummary: string;
  regions: PlasmodiumDiffRegionInfo[];
}

function clampJS(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function vec3Sub(a: number[], b: number[]): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vec3Cross(a: number[], b: number[]): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function vec3Norm(a: number[]): [number, number, number] {
  const len = Math.hypot(a[0], a[1], a[2]);
  if (len < 1e-8) return [0, 1, 0];
  return [a[0] / len, a[1] / len, a[2] / len];
}

/**
 * Añade un elipsoide o merozoíto piriforme 3D al BufferGeometry
 */
function appendMalariaEllipsoid(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  cx: number,
  cy: number,
  cz: number,
  rx: number,
  ry: number,
  rz: number,
  rotY: number,
  rotZ: number,
  metaZ: number,
  regionId: number,
  latBands = 16,
  lonBands = 22,
  pyriformTaper = 0.0
) {
  const baseVertex = positions.length / 3;
  const cY = Math.cos(rotY);
  const sY = Math.sin(rotY);
  const cZ = Math.cos(rotZ);
  const sZ = Math.sin(rotZ);

  for (let lat = 0; lat <= latBands; lat++) {
    const v = lat / latBands;
    const theta = v * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const taper =
      pyriformTaper > 0.0
        ? 1.0 - pyriformTaper * Math.pow(Math.max(0.0, cosTheta), 1.4)
        : 1.0;

    for (let lon = 0; lon <= lonBands; lon++) {
      const u = lon / lonBands;
      const phi = u * Math.PI * 2.0;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const lx = rx * cosTheta;
      const ly = ry * sinTheta * sinPhi * taper;
      const lz = rz * sinTheta * cosPhi * taper;

      const x1 = lx * cZ - ly * sZ;
      const y1 = lx * sZ + ly * cZ;
      const z1 = lz;

      const wx = cx + x1 * cY + z1 * sY;
      const wy = cy + y1;
      const wz = cz - x1 * sY + z1 * cY;

      const nx0 = cosTheta / Math.max(0.01, rx);
      const ny0 = (sinTheta * sinPhi) / Math.max(0.01, ry * taper);
      const nz0 = (sinTheta * cosPhi) / Math.max(0.01, rz * taper);

      const nx1 = nx0 * cZ - ny0 * sZ;
      const ny1 = nx0 * sZ + ny0 * cZ;
      const nz1 = nz0;

      const nwx = nx1 * cY + nz1 * sY;
      const nwy = ny1;
      const nwz = -nx1 * sY + nz1 * cY;
      const nVec = vec3Norm([nwx, nwy, nwz]);

      positions.push(wx, wy, wz);
      normals.push(nVec[0], nVec[1], nVec[2]);
      meta1.push(u, v, metaZ, regionId);
    }
  }

  const stride = lonBands + 1;
  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < lonBands; lon++) {
      const a = baseVertex + lat * stride + lon;
      const b = a + stride;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, c, b, d);
    }
  }
}

/**
 * Añade un tubo orgánico 3D a lo largo de una polilínea (para seudópodos ameboides, citoplasma en banda, anillos y canalículos)
 */
function appendMalariaTube(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  pathPoints: [number, number, number][],
  radii: number[],
  metaZ: number,
  regionId: number,
  radialSegments = 16,
  flattenY = 1.0
) {
  if (pathPoints.length < 2) return;
  const baseVertex = positions.length / 3;
  const nPts = pathPoints.length;

  for (let i = 0; i < nPts; i++) {
    const u = i / (nPts - 1);
    const p = pathPoints[i];
    const r = radii[i];

    const pPrev = pathPoints[Math.max(0, i - 1)];
    const pNext = pathPoints[Math.min(nPts - 1, i + 1)];
    const tang = vec3Norm(vec3Sub(pNext, pPrev));

    const upHint: [number, number, number] =
      Math.abs(tang[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const binorm = vec3Norm(vec3Cross(tang, upHint));
    const norm = vec3Norm(vec3Cross(binorm, tang));

    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments;
      const ang = v * Math.PI * 2.0;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);

      const nx = norm[0] * ca + binorm[0] * sa;
      const ny = (norm[1] * ca + binorm[1] * sa) * flattenY;
      const nz = norm[2] * ca + binorm[2] * sa;
      const nUnit = vec3Norm([nx, ny / Math.max(0.2, flattenY), nz]);

      positions.push(p[0] + r * nx, p[1] + r * ny, p[2] + r * nz);
      normals.push(nUnit[0], nUnit[1], nUnit[2]);
      meta1.push(u, v, metaZ, regionId);
    }
  }

  const stride = radialSegments + 1;
  for (let i = 0; i < nPts - 1; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = baseVertex + i * stride + j;
      const b = a + stride;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, c, b, d);
    }
  }
}

/**
 * Evalúa la superficie 3D del eritrocito hospedador según la especie:
 * - "vivax_reticulocyte": Reticulocito agrandado (1.5–2×), flexible y ligeramente lobulado/deformado
 * - "ovale_fimbriated": Eritrocito elongado OVALADO con extremos fimbriados / desflecados («en flecos» patognomónicos de P. ovale)
 * - "malariae_normocytic": Eritrocito maduro/senescente normocítico a microcítico (~6.8 µm) de perfil bicóncavo simétrico
 */
function evaluateErythrocyteHostSurface(
  u: number, // 0..1 radial-meridional (0 = centro superior, 0.5 = borde ecuatorial, 1.0 = centro inferior)
  v: number, // 0..1 ángulo azimutal alrededor del disco (0..2PI)
  hostType: "vivax_reticulocyte" | "ovale_fimbriated" | "malariae_normocytic",
  distendFactor = 0.0 // 0 = disco bicóncavo normal, 1 = abombado por esquizonte/gametocito maduro
): {
  pos: [number, number, number];
  stippleMask: number;
} {
  const theta = u * Math.PI; // 0 (polo +Y) -> PI/2 (ecuador) -> PI (polo -Y)
  const phi = v * Math.PI * 2.0;
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);

  let rx = 2.65;
  let rz = 2.65;
  let baseThickness = 0.72;
  let fimbriaMod = 1.0;

  if (hostType === "vivax_reticulocyte") {
    // Reticulocito agrandado (1.5x-1.8x) y ameboide/flexible
    const deform =
      1.0 +
      0.065 * Math.cos(phi * 2.0 + 0.4) +
      0.045 * Math.sin(phi * 3.0 - 0.5);
    rx = 3.25 * deform;
    rz = 3.05 * deform;
    baseThickness = 0.84;
  } else if (hostType === "ovale_fimbriated") {
    // Eritrocito ovalado elongado con prolongaciones fimbriadas/desflecadas en ambos polos X
    rx = 3.42;
    rz = 2.28;
    baseThickness = 0.78;
    // Fimbrias (puntas dentadas/desflecadas en los polos cosP cerca de +1 y -1)
    const poleProximity = Math.pow(Math.abs(cosP), 2.6);
    const spikes =
      0.14 * Math.pow(Math.max(0.0, Math.cos(phi * 18.0)), 2.2) +
      0.09 * Math.pow(Math.max(0.0, Math.sin(phi * 26.0 + 0.8)), 2.0);
    fimbriaMod = 1.0 + poleProximity * spikes * Math.pow(sinT, 1.4);
  } else {
    // P. malariae: eritrocito maduro o ligeramente microcítico (~6.5-7.2 µm)
    rx = 2.48;
    rz = 2.48;
    baseThickness = 0.68;
  }

  const rNorm = sinT; // 0 en el centro del disco, 1 en el borde periférico
  // Perfil bicóncavo clásico de Evans & Fung: depresión central y toro periférico redondeado
  const biconcaveProfile =
    0.34 + 1.18 * (rNorm * rNorm) - 0.66 * Math.pow(rNorm, 4.0);
  const effectiveProfile =
    biconcaveProfile * (1.0 - 0.58 * distendFactor) + 0.68 * distendFactor;

  const x = rx * rNorm * cosP * fimbriaMod;
  const z = rz * rNorm * sinP * fimbriaMod;
  const y = baseThickness * cosT * effectiveProfile;

  // Patrón de punteado submembranoso (Schüffner / James / Ziemann)
  const stippleWave =
    Math.sin(x * 7.5 + z * 5.2) * Math.cos(z * 8.1 - x * 6.4);
  const stippleMask = clampJS((stippleWave - 0.25) * 1.4, 0.0, 1.0);

  return {
    pos: [x, y, z],
    stippleMask,
  };
}

/**
 * Añade las granulaciones eritrocitarias 3D (puntos de Schüffner en P. vivax, puntos de James en P. ovale o puntos de Ziemann en P. malariae)
 */
function appendErythrocyteStippling3D(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  hostType: "vivax_reticulocyte" | "ovale_fimbriated" | "malariae_normocytic",
  distendFactor: number,
  regionId: number
) {
  const count =
    hostType === "vivax_reticulocyte"
      ? 68
      : hostType === "ovale_fimbriated"
      ? 52
      : 28;
  const dotRadius =
    hostType === "vivax_reticulocyte"
      ? 0.058
      : hostType === "ovale_fimbriated"
      ? 0.072 // Los puntos de James en P. ovale son más gruesos y oscuros que los de Schüffner
      : 0.044; // Puntos de Ziemann finos y tenues en P. malariae

  // Distribución en espiral áurea sobre ambas caras submembranosas del eritrocito
  const goldenAngle = Math.PI * (3.0 - Math.sqrt(5.0));
  for (let i = 0; i < count; i++) {
    const frac = (i + 0.5) / count;
    const rFrac = 0.22 + 0.72 * Math.sqrt(frac);
    const phi = i * goldenAngle;
    const v = ((phi % (Math.PI * 2.0)) + Math.PI * 2.0) / (Math.PI * 2.0);
    const topSide = i % 2 === 0;
    const u = topSide
      ? (Math.asin(clampJS(rFrac, 0.05, 0.98)) / Math.PI)
      : 1.0 - (Math.asin(clampJS(rFrac, 0.05, 0.98)) / Math.PI);

    const surf = evaluateErythrocyteHostSurface(u, v, hostType, distendFactor);
    const [sx, sy, sz] = surf.pos;

    appendMalariaEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      sx * 0.94,
      sy * 0.84,
      sz * 0.94,
      dotRadius,
      dotRadius * 0.72,
      dotRadius,
      phi,
      0.0,
      hostType === "ovale_fimbriated" ? 0.92 : 0.75,
      regionId,
      6,
      8
    );
  }
}

/**
 * Añade la membrana bicóncava (u ovalada fimbriada) del eritrocito hospedador al final del buffer de índices
 */
function appendErythrocyteHostShell(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  hostType: "vivax_reticulocyte" | "ovale_fimbriated" | "malariae_normocytic",
  distendFactor: number,
  regionId: number
) {
  const uSegs = 56;
  const vSegs = 80;
  const eps = 0.004;
  const baseVertex = positions.length / 3;

  for (let i = 0; i <= uSegs; i++) {
    const u = i / uSegs;
    for (let j = 0; j <= vSegs; j++) {
      const v = j / vSegs;
      const c = evaluateErythrocyteHostSurface(u, v, hostType, distendFactor);
      const u1 = evaluateErythrocyteHostSurface(
        Math.min(1.0, u + eps),
        v,
        hostType,
        distendFactor
      );
      const u0 = evaluateErythrocyteHostSurface(
        Math.max(0.0, u - eps),
        v,
        hostType,
        distendFactor
      );
      const v1 = evaluateErythrocyteHostSurface(
        u,
        v + eps,
        hostType,
        distendFactor
      );
      const v0 = evaluateErythrocyteHostSurface(
        u,
        v - eps,
        hostType,
        distendFactor
      );

      const tU = vec3Sub(u1.pos, u0.pos);
      const tV = vec3Sub(v1.pos, v0.pos);
      let norm = vec3Norm(vec3Cross(tV, tU));
      if (u < 0.5 && norm[1] < 0) norm = [-norm[0], -norm[1], -norm[2]];
      if (u > 0.5 && norm[1] > 0) norm = [-norm[0], -norm[1], -norm[2]];

      positions.push(c.pos[0], c.pos[1], c.pos[2]);
      normals.push(norm[0], norm[1], norm[2]);
      meta1.push(u, v, c.stippleMask, regionId);
    }
  }

  const stride = vSegs + 1;
  // Emitir mitad inferior primero (u >= 0.5) y mitad superior translúcida al final (u < 0.5)
  for (let i = Math.floor(uSegs / 2); i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const a = baseVertex + i * stride + j;
      const b = a + stride;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, c, b, d);
    }
  }
  for (let i = 0; i < Math.floor(uSegs / 2); i++) {
    for (let j = 0; j < vSegs; j++) {
      const a = baseVertex + i * stride + j;
      const b = a + stride;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, c, b, d);
    }
  }
}

/**
 * Construye un hepatocito humano poligonal en 3D alojando un hipnozoíto durmiente (con vacuola parasitófora UIS4+ y núcleo)
 */
function buildHepaticHypnozoiteScene(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  species: "p03" | "p04"
) {
  // 1. Organelos internos del Hipnozoíto durmiente (rId = 2 = citoplasma/PVM, rId = 3 = núcleo del hipnozoíto, rId = 4 = apicoplasto/roptrias)
  const hypX = 0.88;
  const hypY = 0.08;
  const hypZ = 0.24;

  // Núcleo único compacto de cromatina del hipnozoíto durmiente (rId = 3)
  appendMalariaEllipsoid(
    positions,
    normals,
    meta1,
    indices,
    hypX + 0.18,
    hypY + 0.06,
    hypZ + 0.10,
    0.26,
    0.22,
    0.24,
    0.2,
    0.1,
    0.92,
    3.0,
    14,
    18
  );

  // Apicoplasto y mitocondria tubular quiescente del hipnozoíto (rId = 4)
  appendMalariaTube(
    positions,
    normals,
    meta1,
    indices,
    [
      [hypX - 0.34, hypY - 0.08, hypZ - 0.16],
      [hypX - 0.12, hypY + 0.12, hypZ - 0.22],
      [hypX + 0.16, hypY - 0.10, hypZ - 0.18],
    ],
    [0.08, 0.095, 0.075],
    0.82,
    4.0,
    10
  );

  // Cuerpo citoplasmático esférico-ovalado del Hipnozoíto (~4.5–5 µm, rId = 2)
  appendMalariaEllipsoid(
    positions,
    normals,
    meta1,
    indices,
    hypX,
    hypY,
    hypZ,
    0.68,
    0.58,
    0.64,
    0.0,
    0.0,
    0.65,
    2.0,
    20,
    26
  );

  // Prominencia membranosa de la vacuola parasitófora (PVM positiva para UIS4, rId = 5)
  appendMalariaEllipsoid(
    positions,
    normals,
    meta1,
    indices,
    hypX,
    hypY,
    hypZ,
    0.82,
    0.70,
    0.78,
    0.0,
    0.0,
    0.28,
    5.0,
    20,
    26
  );

  // 2. Núcleo eucariótico grande del Hepatocito humano con nucléolo prominente y mitocondrias hepáticas (rId = 6)
  const hepNucX = -1.18;
  const hepNucY = 0.02;
  const hepNucZ = -0.28;
  // Nucléolo hepatocitario
  appendMalariaEllipsoid(
    positions,
    normals,
    meta1,
    indices,
    hepNucX + 0.15,
    hepNucY + 0.05,
    hepNucZ + 0.12,
    0.32,
    0.28,
    0.30,
    0.0,
    0.0,
    0.96,
    6.0,
    12,
    16
  );
  // Núcleo vesicular del hepatocito
  appendMalariaEllipsoid(
    positions,
    normals,
    meta1,
    indices,
    hepNucX,
    hepNucY,
    hepNucZ,
    0.96,
    0.76,
    0.92,
    0.1,
    0.05,
    0.52,
    6.0,
    18,
    24
  );

  // Mitocondrias y gránulos de glucógeno del citoplasma hepático (rId = 4)
  const mitoCoords: [number, number, number][] = [
    [-0.35, -0.42, 1.15],
    [0.25, -0.38, -1.25],
    [1.65, -0.28, -0.78],
    [-1.75, -0.32, 0.95],
    [0.12, 0.45, 1.28],
  ];
  for (const [mx, my, mz] of mitoCoords) {
    appendMalariaEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      mx,
      my,
      mz,
      0.24,
      0.14,
      0.16,
      mx,
      mz,
      0.45,
      4.0,
      10,
      12
    );
  }

  // 3. Membrana poligonal hexagonal del Hepatocito humano (rId = 1, emitida al final para transparencia y corte histológico)
  const uSegs = 48;
  const vSegs = 72;
  const baseV = positions.length / 3;
  for (let i = 0; i <= uSegs; i++) {
    const u = i / uSegs;
    const theta = u * Math.PI;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    for (let j = 0; j <= vSegs; j++) {
      const v = j / vSegs;
      const phi = v * Math.PI * 2.0;
      // Contorno hexagonal redondeado típico de un hepatocito en los cordones de Remak
      const hexMod =
        1.0 +
        0.065 * Math.cos(phi * 6.0 + (species === "p04" ? 0.5 : 0.0));
      const rHoriz = 3.15 * Math.pow(sinT, 0.82) * hexMod;
      const wx = rHoriz * Math.cos(phi);
      const wz = rHoriz * Math.sin(phi) * 0.92;
      const wy = 1.38 * Math.sign(cosT) * Math.pow(Math.abs(cosT), 0.78);

      const nVec = vec3Norm([
        Math.cos(phi) * sinT,
        cosT * 1.6,
        Math.sin(phi) * sinT,
      ]);
      positions.push(wx, wy, wz);
      normals.push(nVec[0], nVec[1], nVec[2]);
      meta1.push(u, v, 0.25, 1.0);
    }
  }

  const stride = vSegs + 1;
  // Mitad basal primero y bóveda apical translúcida al final
  for (let i = Math.floor(uSegs / 2); i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const a = baseV + i * stride + j;
      const b = a + stride;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, c, b, d);
    }
  }
  for (let i = 0; i < Math.floor(uSegs / 2); i++) {
    for (let j = 0; j < vSegs; j++) {
      const a = baseV + i * stride + j;
      const b = a + stride;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, c, b, d);
    }
  }
}

/**
 * Construye la geometría 3D completa para cada especie (P03 P. vivax, P04 P. ovale, P05 P. malariae) y estadio
 * Códigos de región (rId):
 * 1 = Eritrocito / Hepatocito hospedador
 * 2 = Citoplasma del parásito (trofozoíto ameboide, en banda, en anillo o gametocito)
 * 3 = Cromatina nuclear del parásito (rojo rubí / magenta en Giemsa)
 * 4 = Vacuola digestiva y cristales de pigmento malárico (hemozoína pardo-dorada o negra)
 * 5 = Granulaciones eritrocitarias (Schüffner en P. vivax, James en P. ovale, Ziemann en P. malariae) o PVM UIS4+
 * 6 = Merozoítos piriformes 3D individuales (en esquizontes) o Núcleo del hepatocito
 */
function buildPlasmodiumDifferentialGeometry(
  species: PlasmodiumSpeciesCode,
  stageId: string
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const meta1: number[] = [];
  const indices: number[] = [];

  const hostType: "vivax_reticulocyte" | "ovale_fimbriated" | "malariae_normocytic" =
    species === "p03"
      ? "vivax_reticulocyte"
      : species === "p04"
      ? "ovale_fimbriated"
      : "malariae_normocytic";

  // ===========================================================================
  // CASO ESPECIAL: HIPNOZOÍTO HEPÁTICO EN HEPATOCITO (Estadio 4 de P. vivax y P. ovale)
  // ===========================================================================
  if (stageId === "hepatic_hypnozoite" && (species === "p03" || species === "p04")) {
    buildHepaticHypnozoiteScene(positions, normals, meta1, indices, species);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute("aMeta1", new THREE.Float32BufferAttribute(meta1, 4));
    geo.setIndex(indices);
    geo.computeBoundingSphere();
    return geo;
  }

  // ===========================================================================
  // ESTADIO 1: TROFOZOÍTO CARACTERÍSTICO DE CADA ESPECIE
  // - P03 (P. vivax): Trofozoíto marcadamente AMEBOIDE con seudópodos extendidos y puntos de Schüffner
  // - P04 (P. ovale): Trofozoíto COMPACTO no ameboide con gran masa de cromatina en eritrocito ovalado fimbriado con puntos de James
  // - P05 (P. malariae): Trofozoíto ECUATORIAL «EN BANDA» de borde a borde con pigmento negro grueso
  // ===========================================================================
  if (stageId === "trophozoite_stage") {
    // 1. Punteado eritrocitario submembranoso (Schüffner / James / Ziemann, rId = 5)
    appendErythrocyteStippling3D(
      positions,
      normals,
      meta1,
      indices,
      hostType,
      0.15,
      5.0
    );

    if (species === "p03") {
      // --- P. VIVAX: TROFOZOÍTO AMEBOIDE MULTILOBULADO ---
      // Vacuola digestiva central translúcida + bastoncillos finos de hemozoína pardo-dorada (rId = 4)
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        0.15,
        0.04,
        0.05,
        0.55,
        0.24,
        0.48,
        0.0,
        0.0,
        0.35,
        4.0,
        14,
        18
      );
      const hemozoinCoords: [number, number, number][] = [
        [-0.55, 0.08, 0.42],
        [0.68, 0.06, -0.35],
        [0.42, 0.09, 0.65],
        [-0.38, 0.05, -0.58],
        [0.95, 0.04, 0.22],
      ];
      for (const [hx, hy, hz] of hemozoinCoords) {
        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          hx,
          hy,
          hz,
          0.11,
          0.05,
          0.06,
          hx * 2.0,
          0.2,
          0.95,
          4.0,
          8,
          10
        );
      }

      // Gran masa de cromatina nuclear excéntrica rojo-magenta (rId = 3)
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        -0.78,
        0.10,
        0.18,
        0.38,
        0.24,
        0.34,
        0.25,
        0.08,
        0.92,
        3.0,
        16,
        20
      );

      // Brazos seudopódicos ameboides interconectados (rId = 2)
      appendMalariaTube(
        positions,
        normals,
        meta1,
        indices,
        [
          [-1.55, 0.02, -0.55],
          [-0.85, 0.06, 0.12],
          [-0.10, 0.08, 0.68],
          [0.75, 0.05, 0.42],
          [1.48, 0.02, -0.28],
        ],
        [0.14, 0.34, 0.30, 0.32, 0.15],
        0.65,
        2.0,
        16,
        0.58
      );
      appendMalariaTube(
        positions,
        normals,
        meta1,
        indices,
        [
          [-0.72, 0.04, 0.24],
          [-0.22, 0.06, -0.62],
          [0.58, 0.05, -0.52],
          [1.15, 0.03, 0.55],
        ],
        [0.26, 0.28, 0.26, 0.12],
        0.65,
        2.0,
        14,
        0.58
      );
      appendMalariaTube(
        positions,
        normals,
        meta1,
        indices,
        [
          [-0.08, 0.06, 0.65],
          [-0.45, 0.04, 1.32],
          [-0.95, 0.02, 1.48],
        ],
        [0.24, 0.18, 0.09],
        0.65,
        2.0,
        12,
        0.58
      );
    } else if (species === "p04") {
      // --- P. OVALE: TROFOZOÍTO COMPACTO ROBUSTO EN ERITROCITO OVALADO FIMBRIADO ---
      // Vacuola pequeña y gránulos de hemozoína pardo-oscuros (rId = 4)
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        0.18,
        0.06,
        0.04,
        0.38,
        0.22,
        0.34,
        0.0,
        0.0,
        0.35,
        4.0,
        14,
        18
      );
      const ovalePigment: [number, number, number][] = [
        [0.52, 0.08, 0.28],
        [0.62, 0.07, -0.18],
        [0.35, 0.09, -0.38],
        [-0.15, 0.08, 0.44],
      ];
      for (const [px, py, pz] of ovalePigment) {
        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          px,
          py,
          pz,
          0.11,
          0.08,
          0.09,
          0.3,
          0.1,
          0.95,
          4.0,
          10,
          12
        );
      }

      // Masa de cromatina nuclear grande y prominente (rId = 3)
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        -0.46,
        0.11,
        0.08,
        0.44,
        0.28,
        0.38,
        0.15,
        0.0,
        0.92,
        3.0,
        16,
        20
      );

      // Cuerpo citoplasmático compacto y redondeado-ovalado sin seudópodos largos (rId = 2)
      appendMalariaTube(
        positions,
        normals,
        meta1,
        indices,
        [
          [-0.52, 0.04, 0.05],
          [-0.12, 0.05, 0.48],
          [0.52, 0.05, 0.36],
          [0.72, 0.05, -0.12],
          [0.24, 0.05, -0.48],
          [-0.42, 0.04, -0.32],
          [-0.52, 0.04, 0.05],
        ],
        [0.34, 0.38, 0.42, 0.40, 0.38, 0.34, 0.34],
        0.65,
        2.0,
        16,
        0.62
      );
    } else {
      // --- P. MALARIAE: TROFOZOÍTO ECUATORIAL «EN BANDA» DE BORDE A BORDE ---
      // Cúmulos gruesos de pigmento hemozoínico negro-parduzco a lo largo del margen de la banda (rId = 4)
      const bandPigment: [number, number, number][] = [
        [-1.35, 0.12, 0.28],
        [-0.75, 0.14, 0.32],
        [-0.15, 0.15, 0.26],
        [0.45, 0.14, 0.30],
        [1.05, 0.13, 0.25],
        [1.52, 0.11, 0.18],
        [-0.45, 0.12, -0.28],
        [0.65, 0.12, -0.26],
      ];
      for (const [bx, by, bz] of bandPigment) {
        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          bx,
          by,
          bz,
          0.14,
          0.09,
          0.12,
          bx,
          0.1,
          0.96,
          4.0,
          10,
          12
        );
      }

      // Banda alargada de cromatina nuclear a lo largo del margen anterior de la cinta (rId = 3)
      appendMalariaTube(
        positions,
        normals,
        meta1,
        indices,
        [
          [-1.25, 0.12, -0.22],
          [-0.45, 0.15, -0.26],
          [0.35, 0.15, -0.22],
          [1.05, 0.12, -0.16],
        ],
        [0.14, 0.22, 0.21, 0.13],
        0.92,
        3.0,
        14,
        0.68
      );

      // Cinta citoplasmática ecuatorial («forma en banda o en barra») que cruza todo el diámetro del eritrocito (rId = 2)
      appendMalariaTube(
        positions,
        normals,
        meta1,
        indices,
        [
          [-2.18, 0.02, 0.0],
          [-1.15, 0.04, 0.02],
          [0.0, 0.05, 0.0],
          [1.15, 0.04, -0.02],
          [2.18, 0.02, 0.0],
        ],
        [0.52, 0.64, 0.68, 0.64, 0.52],
        0.68,
        2.0,
        20,
        0.44
      );
    }

    // Emitir la membrana del eritrocito hospedador al final (rId = 1)
    appendErythrocyteHostShell(
      positions,
      normals,
      meta1,
      indices,
      hostType,
      0.15,
      1.0
    );
  } else if (stageId === "schizont_stage") {
    // ===========================================================================
    // ESTADIO 2: ESQUIZONTE MADURO CON MEROZOÍTOS 3D INDIVIDUALES
    // - P03 (P. vivax): 16 (12–24) merozoítos en mórula con masa de pigmento pardo-dorado
    // - P04 (P. ovale): 8 (6–14) merozoítos grandes en eritrocito ovalado fimbriado con puntos de James
    // - P05 (P. malariae): 8–10 (6–12) merozoítos en roseta simétrica «en cabeza de margarita» alrededor del pigmento negro central
    // ===========================================================================
    appendErythrocyteStippling3D(
      positions,
      normals,
      meta1,
      indices,
      hostType,
      0.48,
      5.0
    );

    // 1. Masa central coalescente de cristales de hemozoína (pigmento malárico, rId = 4)
    const centralClusterCount = species === "p05" ? 12 : 9;
    for (let k = 0; k < centralClusterCount; k++) {
      const ang = (k / centralClusterCount) * Math.PI * 2.0;
      const rad = k === 0 ? 0.0 : 0.18 + (k % 2) * 0.08;
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        Math.cos(ang) * rad,
        (k % 3 - 1) * 0.06,
        Math.sin(ang) * rad,
        0.16,
        0.13,
        0.15,
        ang,
        0.2,
        0.96,
        4.0,
        10,
        12
      );
    }

    // 2. Merozoítos piriformes 3D individuales (rId = 6 para el cuerpo + complejo apical, rId = 3 para el núcleo de cada merozoíto)
    if (species === "p05") {
      // --- P. MALARIAE: ESQUIZONTE «EN MARGARITA / ROSETA» (9 pétalos simétricos) ---
      const nPetals = 9;
      for (let i = 0; i < nPetals; i++) {
        const ang = (i / nPetals) * Math.PI * 2.0;
        const rCenter = 1.08;
        const mx = Math.cos(ang) * rCenter;
        const mz = Math.sin(ang) * rCenter;

        // Núcleo de cromatina de cada merozoíto (rId = 3)
        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          Math.cos(ang) * (rCenter + 0.14),
          0.08,
          Math.sin(ang) * (rCenter + 0.14),
          0.20,
          0.16,
          0.18,
          -ang,
          0.0,
          0.92,
          3.0,
          10,
          12
        );

        // Cuerpo piriforme del merozoíto apuntando hacia el centro (rId = 6)
        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          mx,
          0.0,
          mz,
          0.48,
          0.26,
          0.30,
          -ang + Math.PI,
          0.0,
          0.68,
          6.0,
          14,
          18,
          0.38
        );
      }
    } else if (species === "p04") {
      // --- P. OVALE: ESQUIZONTE DE 8 MEROZOÍTOS GRANDES EN ERITROCITO OVALADO FIMBRIADO ---
      const nMero = 8;
      for (let i = 0; i < nMero; i++) {
        const ang = (i / nMero) * Math.PI * 2.0 + 0.2;
        const rxRing = 1.24;
        const rzRing = 0.96;
        const mx = Math.cos(ang) * rxRing;
        const mz = Math.sin(ang) * rzRing;
        const my = ((i % 2) - 0.5) * 0.12;

        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          mx * 1.1,
          my + 0.08,
          mz * 1.1,
          0.22,
          0.17,
          0.19,
          -ang,
          0.0,
          0.92,
          3.0,
          10,
          12
        );

        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          mx,
          my,
          mz,
          0.48,
          0.28,
          0.34,
          -ang + Math.PI,
          0.0,
          0.68,
          6.0,
          14,
          18,
          0.32
        );
      }
    } else {
      // --- P. VIVAX: ESQUIZONTE MADURO DE 16 MEROZOÍTOS (12–24) EN MÓRULA DENSA ---
      // Anillo externo de 10 merozoítos + anillo intermedio de 6 merozoítos
      for (let i = 0; i < 16; i++) {
        const isInner = i >= 10;
        const idxInRing = isInner ? i - 10 : i;
        const totalInRing = isInner ? 6 : 10;
        const ang =
          (idxInRing / totalInRing) * Math.PI * 2.0 + (isInner ? 0.35 : 0.0);
        const rad = isInner ? 0.86 : 1.65;
        const mx = Math.cos(ang) * rad;
        const mz = Math.sin(ang) * rad * 0.94;
        const my = isInner ? (idxInRing % 2 === 0 ? 0.18 : -0.16) : (idxInRing % 2 === 0 ? 0.06 : -0.06);

        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          mx * 1.06,
          my + 0.07,
          mz * 1.06,
          0.18,
          0.14,
          0.16,
          -ang,
          0.0,
          0.92,
          3.0,
          10,
          12
        );

        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          mx,
          my,
          mz,
          0.42,
          0.25,
          0.28,
          -ang + Math.PI,
          0.0,
          0.68,
          6.0,
          12,
          16,
          0.34
        );
      }
    }

    // Membrana de la vacuola parasitófora que envuelve el esquizonte (rId = 2)
    const pvmR = species === "p03" ? 2.18 : species === "p04" ? 1.82 : 1.64;
    appendMalariaEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      0.0,
      0.0,
      0.0,
      pvmR,
      0.48,
      pvmR * (species === "p04" ? 0.82 : 0.96),
      0.0,
      0.0,
      0.24,
      2.0,
      20,
      28
    );

    // Membrana del eritrocito hospedador al final (rId = 1)
    appendErythrocyteHostShell(
      positions,
      normals,
      meta1,
      indices,
      hostType,
      0.48,
      1.0
    );
  } else {
    // ===========================================================================
    // ESTADIO 3 / 4: GAMETOCITO ESFÉRICO/OVALADO COMPACTO + TROFOZOÍTO EN ANILLO
    // (A diferencia de P. falciparum en media luna, P. vivax, P. ovale y P. malariae tienen gametocitos REDONDOS/OVALADOS)
    // ===========================================================================
    const isQuartanStage4 = species === "p05" && stageId === "quartan_cycle_stage";

    appendErythrocyteStippling3D(
      positions,
      normals,
      meta1,
      indices,
      hostType,
      0.38,
      5.0
    );

    if (isQuartanStage4) {
      // --- P. MALARIAE ESTADIO 4: ANILLO «EN OJO DE PÁJARO» (BIRD'S-EYE RING) + TROFOZOÍTO EN CESTA ---
      // Punto de cromatina central dentro de la vacuola («ojo de pájaro» característico de P. malariae, rId = 3)
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        -0.65,
        0.08,
        0.0,
        0.26,
        0.20,
        0.24,
        0.0,
        0.0,
        0.95,
        3.0,
        14,
        18
      );
      // Vacuola clara alrededor del núcleo en ojo de pájaro (rId = 4)
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        -0.65,
        0.02,
        0.0,
        0.58,
        0.22,
        0.54,
        0.0,
        0.0,
        0.32,
        4.0,
        14,
        18
      );
      // Anillo citoplasmático grueso y compacto alrededor del ojo de pájaro (rId = 2)
      const ringPts: [number, number, number][] = [];
      const ringR: number[] = [];
      for (let k = 0; k <= 24; k++) {
        const a = (k / 24) * Math.PI * 2.0;
        ringPts.push([
          -0.65 + Math.cos(a) * 0.64,
          0.04,
          Math.sin(a) * 0.60,
        ]);
        ringR.push(0.18 + 0.05 * Math.sin(a));
      }
      appendMalariaTube(
        positions,
        normals,
        meta1,
        indices,
        ringPts,
        ringR,
        0.72,
        2.0,
        14,
        0.65
      );

      // Segundo parásito intracelular o forma en «cesta/canasta» con gránulos de hemozoína oscuros (rId = 6 / 4)
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        0.92,
        0.09,
        -0.28,
        0.28,
        0.20,
        0.22,
        0.3,
        0.0,
        0.94,
        3.0,
        12,
        16
      );
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        0.92,
        0.03,
        0.08,
        0.65,
        0.26,
        0.58,
        0.0,
        0.0,
        0.68,
        6.0,
        16,
        20
      );
      for (const [gx, gz] of [
        [0.72, 0.35],
        [1.15, 0.28],
        [0.98, 0.45],
      ]) {
        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          gx,
          0.11,
          gz,
          0.12,
          0.08,
          0.10,
          0.0,
          0.0,
          0.96,
          4.0,
          8,
          10
        );
      }
    } else {
      // --- GAMETOCITO ESFÉRICO / OVALADO COMPACTO QUE LLENA CASI TODO EL ERITROCITO ---
      const gamR = species === "p03" ? 2.15 : species === "p04" ? 1.82 : 1.62;

      // Gránulos dispersos de pigmento malárico (hemozoína) distribuidos por el citoplasma del gametocito (rId = 4)
      const nGranules = 18;
      const gAngle = Math.PI * (3.0 - Math.sqrt(5.0));
      for (let g = 0; g < nGranules; g++) {
        const rr = 0.35 + 0.58 * Math.sqrt((g + 0.5) / nGranules) * gamR;
        const a = g * gAngle;
        appendMalariaEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          Math.cos(a) * rr,
          ((g % 3) - 1) * 0.08,
          Math.sin(a) * rr * 0.88,
          species === "p05" ? 0.13 : 0.10,
          0.06,
          species === "p05" ? 0.11 : 0.07,
          a,
          0.1,
          0.96,
          4.0,
          8,
          10
        );
      }

      // Gran masa excéntrica de cromatina nuclear del macrogametocito (rId = 3)
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        -gamR * 0.42,
        0.10,
        gamR * 0.22,
        0.58,
        0.32,
        0.48,
        0.35,
        0.05,
        0.92,
        3.0,
        16,
        22
      );

      // Halo perinuclear / zona cromatínica clara (rId = 6)
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        -gamR * 0.42,
        0.08,
        gamR * 0.22,
        0.72,
        0.35,
        0.60,
        0.35,
        0.05,
        0.45,
        6.0,
        16,
        20
      );

      // Cuerpo esférico-ovalado macizo del gametocito (rId = 2)
      appendMalariaEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        0.0,
        0.0,
        0.0,
        gamR,
        0.46,
        gamR * (species === "p04" ? 0.80 : 0.95),
        0.0,
        0.0,
        0.65,
        2.0,
        24,
        32
      );
    }

    appendErythrocyteHostShell(
      positions,
      normals,
      meta1,
      indices,
      hostType,
      0.38,
      1.0
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("aMeta1", new THREE.Float32BufferAttribute(meta1, 4));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * Shaders GLSL hiperrealistas con perturbación analítica de normales (sin #extension)
 */
const PLASMODIUM_DIFF_VERTEX_SHADER = `
  attribute vec4 aMeta1;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  varying vec3 vNormal;
  varying vec2 vUV;
  varying float vMask;
  varying float vRegionId;

  uniform float uTime;
  uniform float uMovement;

  void main() {
    vec3 pos = position;
    vec3 norm = normal;
    float rId = aMeta1.w;

    if (uMovement > 0.01) {
      // Oscilación reológica suave del eritrocito y motilidad ameboide/citoplasmática intracelular
      float wave = sin(uTime * 2.2 + pos.x * 1.1 + pos.z * 0.9) * 0.032 * uMovement;
      pos.y += wave;
      if (rId > 1.5 && rId < 6.5) {
        pos.x += cos(uTime * 2.6 + pos.z * 1.8) * 0.022 * uMovement;
        pos.z += sin(uTime * 2.4 + pos.x * 1.8) * 0.022 * uMovement;
      }
    }

    vLocalPos = pos;
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPosition.xyz;
    vNormal = normalize(normalMatrix * norm);
    vUV = aMeta1.xy;
    vMask = aMeta1.z;
    vRegionId = aMeta1.w;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const PLASMODIUM_DIFF_FRAGMENT_SHADER = `
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  varying vec3 vNormal;
  varying vec2 vUV;
  varying float vMask;
  varying float vRegionId;

  uniform float uTranslucency;
  uniform float uCutPercent;
  uniform int uShaderMode;
  uniform int uSelectedRegion;
  uniform int uSpeciesIndex; // 0 = vivax, 1 = ovale, 2 = malariae

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3D(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(
        mix(hash31(i + vec3(0, 0, 0)), hash31(i + vec3(1, 0, 0)), f.x),
        mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x),
        f.y
      ),
      mix(
        mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x),
        mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x),
        f.y
      ),
      f.z
    );
  }

  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise3D(p);
      p = p * 2.05 + vec3(5.3, 11.7, 3.9);
      a *= 0.5;
    }
    return v;
  }

  vec3 perturbMalariaNormalAnalytical(vec3 N, vec3 pos, float rId) {
    vec3 up = abs(N.y) < 0.92 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 T = normalize(cross(up, N));
    vec3 B = normalize(cross(N, T));

    float freq = (rId == 1.0) ? 9.0 : 18.0;
    float amp = (rId == 1.0) ? 0.08 : 0.14;
    float dU = cos(pos.x * freq + pos.z * freq * 0.7) * amp;
    float dV = sin(pos.z * freq - pos.x * freq * 0.7) * amp;
    return normalize(N - (T * dU + B * dV));
  }

  void main() {
    float rId = floor(vRegionId + 0.5);

    // --- CORTE HISTOLÓGICO / SECCIÓN 3D ---
    // Al aumentar uCutPercent, abrimos la membrana superior del eritrocito/hepatocito (rId == 1 con vLocalPos.y > 0.0)
    // y la envoltura superior de la vacuola parasitófora para dejar completamente expuestos los merozoítos 3D,
    // la cromatina nuclear, los cristales de hemozoína y el hipnozoíto.
    if (uCutPercent > 0.01) {
      float cutY = mix(1.45, -0.05, uCutPercent);
      float cutZ = mix(3.40, -0.40, uCutPercent);
      bool isHostTop = (rId == 1.0) && (vLocalPos.y > -0.02);
      bool isPVMTop = (rId == 2.0 || rId == 5.0) && (vMask < 0.32) && (vLocalPos.y > 0.02);

      if (isHostTop && (vLocalPos.y > cutY || vLocalPos.z > cutZ)) {
        discard;
      }
      if (isPVMTop && (vLocalPos.y > cutY - 0.05 || vLocalPos.z > cutZ)) {
        discard;
      }
    }

    vec3 geomN = normalize(gl_FrontFacing ? vNormal : -vNormal);
    vec3 N = perturbMalariaNormalAnalytical(geomN, vLocalPos, rId);
    vec3 V = normalize(cameraPosition - vWorldPos);

    vec3 L1 = normalize(vec3(0.45, 0.85, 0.50));
    vec3 L2 = normalize(vec3(-0.60, -0.35, 0.58));
    float diff1 = max(dot(N, L1), 0.0);
    float diff2 = max(dot(N, L2), 0.0) * 0.38;
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.5);
    float sss = pow(clamp(dot(V, -L1 + N * 0.4), 0.0, 1.0), 2.2);
    vec3 H1 = normalize(L1 + V);

    float nVal = fbm3(vLocalPos * 5.5);

    vec3 baseCol = vec3(0.85, 0.25, 0.28);
    float rough = 0.28;
    float alpha = 0.96;

    if (rId == 1.0) {
      // 1. Eritrocito / Hepatocito hospedador
      vec3 rbcRed = uSpeciesIndex == 0
        ? vec3(0.88, 0.34, 0.36) // Reticulocito ligeramente policromatófilo en P. vivax
        : uSpeciesIndex == 1
        ? vec3(0.86, 0.28, 0.32) // Eritrocito ovalado fimbriado en P. ovale
        : vec3(0.82, 0.20, 0.24); // Eritrocito normo/microcítico denso en P. malariae

      // Punteado sutil en la membrana cuando vMask > 0.5
      if (uSpeciesIndex < 2) {
        rbcRed = mix(rbcRed, vec3(0.95, 0.48, 0.58), vMask * 0.25);
      }
      baseCol = rbcRed * (0.92 + 0.14 * nVal);
      rough = 0.24;
      bool isTop = vLocalPos.y > -0.02;
      alpha = isTop
        ? clamp(0.82 - uTranslucency * 0.58 + fresnel * 0.26, 0.16, 0.94)
        : clamp(0.90 - uTranslucency * 0.35, 0.45, 0.96);
    } else if (rId == 2.0) {
      // 2. Citoplasma basófilo azul celeste del parásito (trofozoíto / gametocito / PVM)
      baseCol = mix(vec3(0.20, 0.56, 0.88), vec3(0.12, 0.40, 0.74), nVal);
      rough = 0.26;
      alpha = vMask < 0.32
        ? clamp(0.56 - uTranslucency * 0.30 + fresnel * 0.25, 0.18, 0.80)
        : 0.97;
    } else if (rId == 3.0) {
      // 3. Cromatina nuclear rojo rubí / magenta intenso
      baseCol = mix(vec3(0.82, 0.10, 0.34), vec3(0.56, 0.05, 0.24), nVal);
      rough = 0.18;
      alpha = 0.99;
    } else if (rId == 4.0) {
      // 4. Vacuola digestiva o cristales de pigmento malárico (hemozoína)
      if (vMask > 0.85) {
        // Cristales de hemozoína: dorado-ámbar fino en P. vivax vs. negro-caoba grueso en P. malariae
        baseCol = uSpeciesIndex == 2
          ? mix(vec3(0.18, 0.11, 0.05), vec3(0.08, 0.05, 0.02), nVal)
          : mix(vec3(0.55, 0.38, 0.12), vec3(0.32, 0.20, 0.06), nVal);
        rough = 0.16;
        alpha = 0.99;
      } else {
        // Vacuola digestiva o mitocondrias
        baseCol = vec3(0.76, 0.88, 0.96);
        rough = 0.20;
        alpha = 0.68;
      }
    } else if (rId == 5.0) {
      // 5. Granulaciones de Schüffner (P. vivax), puntos de James (P. ovale) o Ziemann (P. malariae)
      baseCol = uSpeciesIndex == 1
        ? vec3(0.84, 0.16, 0.42) // James: más oscuros y gruesos
        : uSpeciesIndex == 0
        ? vec3(0.95, 0.32, 0.48) // Schüffner: rosado-ladrillo eosinofílico fino
        : vec3(0.78, 0.36, 0.44); // Ziemann
      rough = 0.24;
      alpha = vMask < 0.35 ? 0.52 : 0.95;
    } else if (rId == 6.0) {
      // 6. Merozoítos piriformes 3D individuales o núcleo hepatocitario
      baseCol = mix(vec3(0.26, 0.64, 0.92), vec3(0.16, 0.44, 0.78), nVal);
      rough = 0.22;
      alpha = 0.98;
    }

    float spec = pow(max(dot(N, H1), 0.0), 48.0) * (1.0 - rough * 0.5);
    vec3 finalRGB = baseCol;

    if (uShaderMode == 0) {
      // Modo 0: Biológico 3D con dispersión subsuperficial (SSS hemoglobínico)
      vec3 amb = baseCol * 0.36;
      vec3 diff = baseCol * (diff1 * 0.84 + diff2 * 0.38);
      vec3 sssCol = baseCol * vec3(1.15, 0.55, 0.45) * sss * 0.48;
      finalRGB = amb + diff + sssCol + vec3(spec * 0.55) + baseCol * fresnel * 0.28;
    } else if (uShaderMode == 1) {
      // Modo 1: Tinción de Giemsa en Frotis Fino (Fondo blanco cálido #faf7f2)
      vec3 giemsaCol = baseCol;
      if (rId == 1.0) {
        // Eritrocito rosado-salmón pálido típico de Giemsa (más azulado/policromatófilo en reticulocito de P. vivax)
        giemsaCol = uSpeciesIndex == 0
          ? vec3(0.88, 0.68, 0.76)
          : vec3(0.90, 0.66, 0.70);
        alpha = clamp(0.32 + fresnel * 0.45 - uTranslucency * 0.18, 0.16, 0.78);
      } else if (rId == 2.0 || rId == 6.0) {
        // Citoplasma azul cobalto-celeste basófilo de Giemsa
        giemsaCol = vec3(0.22, 0.46, 0.82);
      } else if (rId == 3.0) {
        // Cromatina nuclear púrpura-rubí intenso de Romanowsky-Giemsa
        giemsaCol = vec3(0.62, 0.06, 0.30);
      } else if (rId == 5.0) {
        // Punteado de Schüffner / James en rojo-rosado azurofílico
        giemsaCol = vec3(0.82, 0.22, 0.42);
      }
      finalRGB = giemsaCol * (0.52 + 0.50 * diff1) + vec3(spec * 0.22);
    } else if (uShaderMode == 2) {
      // Modo 2: SEM (Microscopía Electrónica de Barrido)
      float sem = 0.20 + 0.36 * diff1 + 0.55 * fresnel + 0.12 * nVal;
      finalRGB = vec3(sem) * vec3(0.90, 0.94, 0.98);
      alpha = (rId == 1.0 && vLocalPos.y > -0.02) ? clamp(0.92 - uTranslucency * 0.65, 0.25, 0.96) : 0.99;
    } else {
      // Modo 3: Rayos X / Fluorescencia diferencial
      vec3 xCol = vec3(0.25, 0.70, 0.95);
      if (rId == 3.0) xCol = vec3(1.0, 0.25, 0.55);
      else if (rId == 4.0) xCol = vec3(1.0, 0.82, 0.20);
      else if (rId == 5.0) xCol = vec3(0.95, 0.45, 0.80);
      else if (rId == 6.0 || rId == 2.0) xCol = vec3(0.20, 0.95, 0.78);
      finalRGB = xCol * (0.30 + 0.82 * fresnel + 0.28 * diff1);
      alpha = (rId == 1.0) ? clamp(0.15 + fresnel * 0.45, 0.12, 0.60) : 0.94;
    }

    if (uSelectedRegion > 0) {
      if (int(rId) == uSelectedRegion) {
        finalRGB = mix(finalRGB, finalRGB * 1.28 + vec3(0.08, 0.18, 0.24), 0.42);
      } else {
        finalRGB *= 0.66;
      }
    }

    gl_FragColor = vec4(clamp(finalRGB, 0.0, 1.0), alpha);
  }
`;

/**
 * Catálogo de estadios y regiones para P03 (P. vivax), P04 (P. ovale) y P05 (P. malariae)
 */
export const PLASMODIUM_SPECIES_DATA: Record<
  PlasmodiumSpeciesCode,
  {
    scientificName: string;
    keyTable: [string, string][];
    stages: PlasmodiumDiffStageMeta[];
  }
> = {
  p03: {
    scientificName: "Plasmodium vivax",
    keyTable: [
      ["Eritrocito:", "Agrandado 1.5–2× (reticulocito)"],
      ["Punteado:", "Granulaciones de Schüffner (+)"],
      ["Trofozoíto / Esquizonte:", "Ameboide / 12–24 merozoítos"],
      ["Recaídas hepáticas:", "Sí (Hipnozoítos → Primaquina)"],
    ],
    stages: [
      {
        id: "trophozoite_stage",
        name: "Trofozoíto ameboide en reticulocito agrandado con puntos de Schüffner",
        shortName: "Trofozoíto ameboide",
        subtitle:
          "Reticulocito agrandado (1.5–2×, ~10–11 µm) y deformable, tapizado de granulaciones de Schüffner con trofozoíto seudopódico",
        dimensionsNote: "Reticulocito agrandado: ~10–11 µm · Trofozoíto ameboide: ~5–7 µm",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 2.2,
        translucencyLabel: "Transparencia del reticulocito",
        translucencyHint:
          "Ajusta la transparencia o activa el «Corte Histológico» para inspeccionar los seudópodos ameboides y los puntos de Schüffner",
        defaultTranslucency: 54,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.2, 6.4], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [0.2, 3.2, 3.8], target: [0.0, 0.05, 0.0] },
        focusButtonLabel: "Enfocar Trofozoíto Ameboide",
        fullButtonLabel: "Ver Reticulocito Completo",
        overviewSummary:
          "Plasmodium vivax invade selectivamente reticulocitos jóvenes (mediante el receptor del antígeno grupal Duffy / DARC), provocando que la célula hospedadora aumente 1.5 a 2 veces su tamaño normal y se vuelva pálida y deformable. Su trofozoíto en crecimiento emite largos brazos seudopódicos («vivax» = vivaz/activo en movimiento ameboide) y la membrana eritrocitaria desarrolla las clásicas granulaciones de Schüffner.",
        regions: [
          {
            id: "pv-retic",
            number: 1,
            name: "Reticulocito hospedador agrandado (1.5–2×) y deformable",
            shortLabel: "Reticulocito agrandado",
            badge: "Tropismo Duffy+",
            scale: "10–11 µm",
            regionCode: 1,
            colorBio: "#e11d48",
            colorStain: "#db2777",
            localAnchor: [-2.45, 0.35, 0.85],
            labelOffset: [-95, -45],
            camGoal: { position: [-1.8, 4.8, 5.8], target: [0.0, 0.0, 0.0] },
            summary:
              "Glóbulo rojo joven (reticulocito CD71+ / Duffy+) notablemente hipertrofiado y de contorno ameboide flexible, en contraste con el eritrocito normocítico rígido de P. falciparum.",
            microscopyNote:
              "La ausencia del antígeno Duffy (fenotipo Fy(a-b-), predominante en África occidental) confiere resistencia natural clásica a la invasión eritrocitaria por P. vivax.",
            reconstruction3DNote:
              "Modelado con diámetro 1.5× mayor y contorno ligeramente lobulado por la deformabilidad del reticulocito.",
          },
          {
            id: "pv-amoeboid",
            number: 2,
            name: "Citoplasma ameboide multilobulado con seudópodos",
            shortLabel: "Citoplasma ameboide",
            badge: "Morfología clave",
            scale: "5–7 µm",
            regionCode: 2,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [0.75, 0.12, 0.42],
            labelOffset: [90, -50],
            camGoal: { position: [0.8, 2.8, 3.4], target: [0.2, 0.05, 0.1] },
            defaultTranslucency: 68,
            defaultCutPercent: 52,
            summary:
              "El citoplasma basófilo del trofozoíto se proyecta en múltiples cordones y lazos seudopódicos a través del estroma eritrocitario.",
            microscopyNote:
              "En el frotis fino teñido con Giemsa parece fragmentado en varios lazos azules interconectados alrededor de una gran vacuola digestiva.",
            reconstruction3DNote:
              "Al pulsar esta región se abre la hemimembrana superior en el Corte Histológico para ver la red 3D de seudópodos.",
          },
          {
            id: "pv-chromatin",
            number: 3,
            name: "Masa grande de cromatina nuclear excéntrica",
            shortLabel: "Cromatina nuclear",
            badge: "Núcleo",
            scale: "1.2–1.6 µm",
            regionCode: 3,
            colorBio: "#f43f5e",
            colorStain: "#9d174d",
            localAnchor: [-0.78, 0.15, 0.18],
            labelOffset: [-95, 50],
            camGoal: { position: [-0.9, 2.4, 2.8], target: [-0.75, 0.1, 0.15] },
            defaultTranslucency: 68,
            defaultCutPercent: 52,
            summary:
              "Corpúsculo nuclear compacto y voluminoso de cromatina rojo-magenta situado en uno de los lóbulos principales del trofozoíto.",
            microscopyNote:
              "Mucho más grande y único que los pequeños puntos dobles de cromatina en «auriculares» de P. falciparum.",
            reconstruction3DNote:
              "Cuerpo ovoide rubí-magenta asentado en la confluencia de los brazos ameboides.",
          },
          {
            id: "pv-schuffner",
            number: 4,
            name: "Granulaciones de Schüffner (complejos cavéola-vesícula)",
            shortLabel: "Puntos de Schüffner",
            badge: "Patognomónico",
            scale: "Punteado fino difuso",
            regionCode: 5,
            colorBio: "#fb7185",
            colorStain: "#be185d",
            localAnchor: [1.85, 0.28, -1.35],
            labelOffset: [95, 45],
            camGoal: { position: [2.2, 3.4, 3.8], target: [0.8, 0.1, -0.5] },
            summary:
              "Fino punteado eosinofílico rosado-ladrillo distribuido uniformemente por todo el eritrocito parasitado, correspondiente ultraestructuralmente a complejos de cavéola-vesícula inducidos por el parásito en la membrana.",
            microscopyNote:
              "Presentes en P. vivax y P. ovale (en este último llamados puntos de James), pero AUSENTES en P. falciparum y P. malariae.",
            reconstruction3DNote:
              "68 micro-gránulos submembranosos tridimensionales repartidos en espiral áurea.",
          },
          {
            id: "pv-hemozoin",
            number: 5,
            name: "Vacuola digestiva y bastoncillos finos de hemozoína",
            shortLabel: "Vacuola y Hemozoína",
            badge: "Pigmento malárico",
            scale: "Cristales pardo-dorados",
            regionCode: 4,
            colorBio: "#eab308",
            colorStain: "#854d0e",
            localAnchor: [0.15, 0.08, 0.05],
            labelOffset: [80, 60],
            camGoal: { position: [0.2, 2.5, 2.9], target: [0.15, 0.05, 0.05] },
            defaultCutPercent: 55,
            summary:
              "Vacuola alimentaria central acompañada de finos gránulos y bastoncillos de hemozoína de color pardo-amarillento o dorado producto de la cristalización del grupo hemo.",
            microscopyNote:
              "El pigmento de P. vivax es fino y pardo-dorado, a diferencia del pigmento negro y grueso de P. malariae.",
            reconstruction3DNote:
              "Visible en el interior de los lazos citoplasmáticos al activar el corte histológico.",
          },
        ],
      },
      {
        id: "schizont_stage",
        name: "Esquizonte maduro (12–24 merozoítos) con pigmento coalescente",
        shortName: "Esquizonte (12–24 merozoítos)",
        subtitle:
          "Mórula esquizogónica que llena el reticulocito agrandado con 16 merozoítos piriformes 3D y masa central de hemozoína",
        dimensionsNote: "Contiene 12 a 24 merozoítos (promedio 16) en reticulocito de ~11 µm",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 2.2,
        translucencyLabel: "Transparencia del reticulocito y PVM",
        translucencyHint:
          "Activa el «Corte Histológico / Sección 3D» para abrir la célula y contar los 16 merozoítos 3D individuales en su interior",
        defaultTranslucency: 58,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.2, 6.4], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [0.0, 3.0, 3.6], target: [0.0, 0.0, 0.0] },
        focusButtonLabel: "Abrir Esquizonte (16 Merozoítos)",
        fullButtonLabel: "Vista general",
        overviewSummary:
          "Tras 48 horas de ciclo eritrocitario (fiebre terciana benigna), el esquizonte maduro de Plasmodium vivax ocupa casi la totalidad del reticulocito hipertrofiado. Contiene de 12 a 24 merozoítos (típicamente 16), un número diagnóstico superior al de P. ovale (6–14) y P. malariae (6–12). A diferencia de P. falciparum (cuyos esquizontes se secuestran en capilares profundos), los esquizontes de P. vivax circulan libremente en sangre periférica.",
        regions: [
          {
            id: "pvs-merozoites",
            number: 1,
            name: "16 Merozoítos piriformes 3D individuales (rango 12–24)",
            shortLabel: "16 Merozoítos 3D",
            badge: "Criterio numérico",
            scale: "1.5 µm cada merozoíto",
            regionCode: 6,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [1.55, 0.08, 0.45],
            labelOffset: [95, -50],
            camGoal: { position: [0.6, 3.2, 3.6], target: [0.2, 0.0, 0.0] },
            defaultTranslucency: 72,
            defaultCutPercent: 58,
            summary:
              "Cada merozoíto es una célula invasiva piriforme polarizada dotada de su complejo apical (roptrias y micronemas) y su propio núcleo haploide.",
            microscopyNote:
              "Contar ≥12 merozoítos dentro de un eritrocito agrandado con puntos de Schüffner confirma P. vivax frente a P. ovale y P. malariae.",
            reconstruction3DNote:
              "Dispuestos en doble corona tridimensional (10 periféricos + 6 internos) visibles al activar el Corte Histológico.",
          },
          {
            id: "pvs-nuclei",
            number: 2,
            name: "Núcleos hijos de cromatina en cada merozoíto",
            shortLabel: "Núcleos de merozoítos",
            badge: "Esquizogonia",
            scale: "16 puntos de cromatina",
            regionCode: 3,
            colorBio: "#f43f5e",
            colorStain: "#9d174d",
            localAnchor: [-0.85, 0.22, 0.25],
            labelOffset: [-95, -45],
            camGoal: { position: [-0.5, 2.8, 3.2], target: [-0.2, 0.05, 0.0] },
            defaultTranslucency: 72,
            defaultCutPercent: 58,
            summary:
              "Cuatro rondas de mitosis cerrada (esquizogonia) generan los 16 núcleos hijos antes de la citocinesis sincrónica.",
            microscopyNote:
              "En Giemsa se observan como un racimo de gránulos púrpura-rubí rodeados por una esfera de citoplasma azul.",
            reconstruction3DNote:
              "Cada uno de los 16 merozoítos porta su núcleo esférico individual en su polo basal.",
          },
          {
            id: "pvs-hemozoin",
            number: 3,
            name: "Masa central coalescente de pigmento malárico (hemozoína)",
            shortLabel: "Hemozoína central",
            badge: "Liberación pirógena",
            scale: "Masa pardo-dorada",
            regionCode: 4,
            colorBio: "#eab308",
            colorStain: "#854d0e",
            localAnchor: [0.0, 0.08, 0.0],
            labelOffset: [-85, 55],
            camGoal: { position: [0.0, 2.5, 2.8], target: [0.0, 0.0, 0.0] },
            defaultCutPercent: 58,
            summary:
              "Al completarse la maduración del esquizonte, todo el pigmento malárico se concentra en una o dos masas compactas centrales.",
            microscopyNote:
              "Cuando el esquizonte estalla cada 48 h, la liberación masiva de hemozoína y GPI activa TLR9/inflammasoma en macrófagos, desencadenando el paroxismo febril terciano (escalofrío, fiebre alta y diaforesis).",
            reconstruction3DNote:
              "Agrupación central de cristales birrefringentes en el corazón de la mórula.",
          },
          {
            id: "pvs-schuffner",
            number: 4,
            name: "Borde periférico con granulaciones de Schüffner",
            shortLabel: "Borde con Schüffner",
            badge: "Estroma residual",
            scale: "Anillo periférico",
            regionCode: 5,
            colorBio: "#fb7185",
            colorStain: "#be185d",
            localAnchor: [2.45, 0.18, -1.25],
            labelOffset: [95, 50],
            camGoal: { position: [2.4, 3.6, 4.2], target: [0.8, 0.0, -0.4] },
            summary:
              "El margen libre del reticulocito alrededor del esquizonte muestra un denso punteado de Schüffner.",
            microscopyNote:
              "Signo crucial para no confundir el esquizonte con otras especies cuando ocupa casi todo el glóbulo rojo.",
            reconstruction3DNote:
              "Visible en la periferia del disco celular.",
          },
        ],
      },
      {
        id: "gametocyte_stage",
        name: "Macrogametocito esférico compacto (No falciforme)",
        shortName: "Gametocito esférico",
        subtitle:
          "Gametocito redondo-ovalado grande que llena el reticulocito agrandado con cromatina excéntrica (diferencia frente a la media luna de P. falciparum)",
        dimensionsNote: "Gametocito esférico de ~9–10 µm dentro de reticulocito con Schüffner",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 2.2,
        translucencyLabel: "Transparencia del reticulocito",
        translucencyHint:
          "Observa la forma esférica/ovalada maciza del gametocito (nunca en banana/media luna como P. falciparum)",
        defaultTranslucency: 54,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.2, 6.4], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [-0.8, 3.0, 3.6], target: [-0.3, 0.05, 0.0] },
        focusButtonLabel: "Enfocar Cromatina y Pigmento",
        fullButtonLabel: "Vista general",
        overviewSummary:
          "A diferencia de los gametocitos en forma de media luna o banana exclusivos de Plasmodium falciparum, los gametocitos de P. vivax son grandes cuerpos REDONDOS u OVALADOS compactos que llenan casi por completo el reticulocito agrandado y carecen de vacuola digestiva. Aparecen tempranamente en sangre periférica (desde los primeros días de síntomas), lo que permite la transmisión al mosquito Anopheles incluso antes del diagnóstico clínico.",
        regions: [
          {
            id: "pvg-body",
            number: 1,
            name: "Cuerpo esférico-ovalado macizo del gametocito",
            shortLabel: "Gametocito redondo",
            badge: "Forma sexual",
            scale: "9–10 µm",
            regionCode: 2,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [0.85, 0.35, 0.55],
            labelOffset: [95, -50],
            camGoal: { position: [0.8, 3.6, 4.4], target: [0.0, 0.0, 0.0] },
            summary:
              "Citoplasma abundante y homogéneo (azul intenso en el macrogametocito femenino; azul pálido-rosado en el microgametocito masculino) sin vacuola clara.",
            microscopyNote:
              "Regla de oro del frotis sanguíneo: Gametocito en banana = P. falciparum; Gametocito redondo grande con puntos de Schüffner = P. vivax / P. ovale.",
            reconstruction3DNote:
              "Volumen elipsoidal macizo que distiende el centro del reticulocito.",
          },
          {
            id: "pvg-chromatin",
            number: 2,
            name: "Masa única excéntrica de cromatina nuclear",
            shortLabel: "Cromatina excéntrica",
            badge: "Núcleo sexual",
            scale: "Compacta en ♀ / Difusa en ♂",
            regionCode: 3,
            colorBio: "#f43f5e",
            colorStain: "#9d174d",
            localAnchor: [-0.90, 0.14, 0.45],
            labelOffset: [-100, -45],
            camGoal: { position: [-1.1, 2.6, 3.2], target: [-0.8, 0.1, 0.3] },
            defaultCutPercent: 52,
            summary:
              "Núcleo único bien delimitado situado cerca del margen lateral del gametocito, rodeado por un halo perinuclear claro.",
            microscopyNote:
              "El hecho de poseer un solo núcleo con pigmento disperso permite distinguirlo de un esquizonte maduro (que tiene múltiples núcleos y pigmento concentrado).",
            reconstruction3DNote:
              "Expuesto en 3D con su halo claro perinuclear al activar el Corte Histológico.",
          },
          {
            id: "pvg-pigment",
            number: 3,
            name: "Gránulos finos de hemozoína dispersos por el citoplasma",
            shortLabel: "Hemozoína dispersa",
            badge: "Distribución difusa",
            scale: "Bastoncillos finos",
            regionCode: 4,
            colorBio: "#eab308",
            colorStain: "#854d0e",
            localAnchor: [0.65, 0.12, -0.55],
            labelOffset: [90, 50],
            camGoal: { position: [0.8, 2.8, 3.4], target: [0.3, 0.05, -0.2] },
            defaultCutPercent: 52,
            summary:
              "Numerosos cristales finos de pigmento malárico pardo-dorado repartidos en corona por todo el citoplasma.",
            microscopyNote:
              "A diferencia del esquizonte (donde la hemozoína se agrupa en un bloque único), en el gametocito el pigmento permanece esparcido.",
            reconstruction3DNote:
              "18 corpúsculos cristalinos distribuidos dentro del citoplasma del gametocito.",
          },
        ],
      },
      {
        id: "hepatic_hypnozoite",
        name: "Hipnozoíto hepático durmiente en hepatocito (Causa de recaídas)",
        shortName: "Hipnozoíto hepático",
        subtitle:
          "Estadio latente uninucleado (~4.5–5 µm) dentro de un hepatocito humano con membrana vacuolar UIS4+; exige cura radical con primaquina o tafenoquina",
        dimensionsNote: "Hepatocito poligonal: ~25–30 µm · Hipnozoíto latente: ~4.5–5 µm",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 1.5,
        translucencyLabel: "Transparencia del hepatocito",
        translucencyHint:
          "Activa el «Corte Histológico» para seccionar el hepatocito y la vacuola parasitófora UIS4+ exponiendo el hipnozoíto durmiente",
        defaultTranslucency: 56,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.4, 6.8], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [0.9, 2.6, 3.4], target: [0.88, 0.08, 0.24] },
        focusButtonLabel: "Enfocar Hipnozoíto Latente",
        fullButtonLabel: "Ver Hepatocito Completo",
        overviewSummary:
          "Tras la picadura del mosquito Anopheles, parte de los esporozoítos de P. vivax que invaden los hepatocitos no pasan inmediatamente a esquizogonia tisular, sino que se detienen como HIPNOZOÍTOS («parásitos durmientes» descubiertos por Krotoski). Permanecen metabólicamente latentes durante semanas, meses o años y su reactivación produce las recaídas clínicas. Los esquizonticidas sanguíneos (cloroquina, ACT) NO actúan sobre el hipnozoíto: la cura radical exige primaquina o tafenoquina previa verificación de actividad normal de G6PD.",
        regions: [
          {
            id: "pvh-hypnozoite",
            number: 1,
            name: "Hipnozoíto uninucleado latente (~4.5–5 µm)",
            shortLabel: "Hipnozoíto durmiente",
            badge: "Diana de Primaquina",
            scale: "4.5–5.0 µm",
            regionCode: 2,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [0.88, 0.28, 0.24],
            labelOffset: [95, -50],
            camGoal: { position: [1.0, 2.5, 3.2], target: [0.88, 0.08, 0.24] },
            defaultTranslucency: 72,
            defaultCutPercent: 56,
            summary:
              "Pequeño cuerpo esférico-ovalado uninucleado con apicoplasto y mitocondria ramificada, desprovisto de pigmento hemozoínico (ya que no digiere hemoglobina).",
            microscopyNote:
              "Exclusivo de P. vivax y P. ovale. P. falciparum y P. malariae NO forman hipnozoítos.",
            reconstruction3DNote:
              "Al seleccionar esta región se abre el hepatocito y la vacuola parasitófora para mostrar el núcleo y apicoplasto del hipnozoíto en 3D.",
          },
          {
            id: "pvh-pvm",
            number: 2,
            name: "Membrana de la vacuola parasitófora (PVM UIS4+)",
            shortLabel: "Vacuola (PVM UIS4+)",
            badge: "Interfaz hepática",
            scale: "Envoltura modificada",
            regionCode: 5,
            colorBio: "#fb7185",
            colorStain: "#be185d",
            localAnchor: [1.55, 0.12, 0.65],
            labelOffset: [95, 50],
            camGoal: { position: [1.4, 2.8, 3.6], target: [0.88, 0.08, 0.24] },
            summary:
              "Membrana especializada enriquecida en la proteína parasitaria UIS4 que aísla al hipnozoíto de los lisosomas del hepatocito y capta lípidos del hospedador.",
            microscopyNote:
              "La tinción por inmunofluorescencia frente a UIS4 y la banda de actina F del hospedador permiten identificar hipnozoítos en modelos hepatocitarios humanos.",
            reconstruction3DNote:
              "Cápsula translúcida rosada que envuelve al hipnozoíto dentro del citoplasma hepático.",
          },
          {
            id: "pvh-hepatocyte",
            number: 3,
            name: "Hepatocito humano poligonal y núcleo con nucléolo",
            shortLabel: "Hepatocito y Núcleo",
            badge: "Fase exoeritrocitaria",
            scale: "25–30 µm",
            regionCode: 6,
            colorBio: "#60a5fa",
            colorStain: "#4f46e5",
            localAnchor: [-1.18, 0.35, -0.28],
            labelOffset: [-100, -45],
            camGoal: { position: [-1.2, 4.2, 5.2], target: [-0.4, 0.0, 0.0] },
            summary:
              "Célula parenquimatosa hepática de contorno hexagonal con gran núcleo eucariótico vesicular y nucléolo central.",
            microscopyNote:
              "Recuerda evaluar siempre la enzima Glucosa-6-Fosfato Deshidrogenasa (G6PD) antes de administrar primaquina o tafenoquina para evitar hemólisis oxidativa grave.",
            reconstruction3DNote:
              "Modelado con simetría hexagonal de cordón hepático, núcleo con nucléolo y mitocondrias citoplasmáticas.",
          },
        ],
      },
    ],
  },
  p04: {
    scientificName: "Plasmodium ovale",
    keyTable: [
      ["Eritrocito:", "Ovalado y con bordes fimbriados"],
      ["Punteado:", "Puntos de James (gruesos/oscuros)"],
      ["Esquizonte:", "6–14 merozoítos (promedio 8)"],
      ["Recaídas hepáticas:", "Sí (Hipnozoítos en curtisi/wallikeri)"],
    ],
    stages: [
      {
        id: "trophozoite_stage",
        name: "Trofozoíto compacto en eritrocito ovalado y fimbriado con puntos de James",
        shortName: "Eritrocito oval fimbriado",
        subtitle:
          "Glóbulo rojo elongado ovalado con polos desflecados («en flecos» o fimbriados), punteado grueso de James y trofozoíto compacto en cometa",
        dimensionsNote: "Eritrocito oval fimbriado: ~9–10 × 6.5 µm · Trofozoíto compacto: ~3.5 µm",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 2.2,
        translucencyLabel: "Transparencia del eritrocito fimbriado",
        translucencyHint:
          "Observa las prolongaciones desflecadas (fimbrias) en ambos polos del eritrocito ovalado y los gruesos puntos de James",
        defaultTranslucency: 54,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.2, 6.4], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [0.0, 3.2, 3.8], target: [0.0, 0.05, 0.0] },
        focusButtonLabel: "Enfocar Trofozoíto y Fimbrias",
        fullButtonLabel: "Ver Eritrocito Oval Completo",
        overviewSummary:
          "El complejo Plasmodium ovale comprende dos especies crípticas simpátricas genéticamente distintas pero morfológicamente idénticas: P. ovale curtisi y P. ovale wallikeri. Su sello diagnóstico en el frotis sanguíneo es la deformación del eritrocito hospedador hacia una silueta OVALADA con uno o ambos extremos desflecados o dentados («fimbriados»), acompañado de las granulaciones de James (más gruesas y oscuras que las de P. vivax) y un trofozoíto compacto no ameboide.",
        regions: [
          {
            id: "po-fimbriated-rbc",
            number: 1,
            name: "Eritrocito ovalado con extremos fimbriados / desflecados",
            shortLabel: "Polos fimbriados",
            badge: "Signo patognomónico",
            scale: "9–10 × 6.5 µm",
            regionCode: 1,
            colorBio: "#e11d48",
            colorStain: "#db2777",
            localAnchor: [3.15, 0.08, 0.15],
            labelOffset: [95, -45],
            camGoal: { position: [2.6, 3.6, 4.2], target: [1.4, 0.0, 0.0] },
            summary:
              "Deformación elíptica u oval del eritrocito parasitado cuyas puntas polares se estiran formando proyecciones irregulares en flecos o dientes de sierra (fimbrias).",
            microscopyNote:
              "Al extender el frotis fino, la menor elasticidad del eritrocito infectado por P. ovale hace que adopte forma de huevo o cometa con bordes fimbriados en el 20–40% de las células parasitadas.",
            reconstruction3DNote:
              "Geometría elíptica con modulación armónica polar que recrea las fimbrias en 3D.",
          },
          {
            id: "po-compact-troph",
            number: 2,
            name: "Trofozoíto compacto robusto (No ameboide) y gran núcleo",
            shortLabel: "Trofozoíto compacto",
            badge: "Diferencial vs P. vivax",
            scale: "3.0–4.0 µm",
            regionCode: 2,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [0.35, 0.12, 0.35],
            labelOffset: [-85, -55],
            camGoal: { position: [0.2, 2.8, 3.2], target: [0.0, 0.05, 0.0] },
            defaultTranslucency: 68,
            defaultCutPercent: 52,
            summary:
              "A diferencia del trofozoíto ameboide multilobulado de P. vivax, el trofozoíto de P. ovale mantiene un contorno redondeado-ovalado firme y compacto con una gran masa de cromatina.",
            microscopyNote:
              "Esta morfología compacta junto con los puntos de James evita confundirlo con P. vivax.",
            reconstruction3DNote:
              "Activa el Corte Histológico para examinar el anillo/trofozoíto robusto y su gran masa nuclear rubí.",
          },
          {
            id: "po-james-dots",
            number: 3,
            name: "Granulaciones de James (punteado de Schüffner grueso y oscuro)",
            shortLabel: "Puntos de James",
            badge: "Punteado intenso",
            scale: "Gránulos de 0.3–0.5 µm",
            regionCode: 5,
            colorBio: "#f43f5e",
            colorStain: "#9d174d",
            localAnchor: [-1.85, 0.24, 0.85],
            labelOffset: [-100, 50],
            camGoal: { position: [-1.8, 3.4, 3.8], target: [-0.8, 0.1, 0.2] },
            summary:
              "Punteado eosinofílico-púrpura que aparece desde la fase de anillo temprano y cuyos gránulos son más grandes, numerosos y oscuros que los de P. vivax.",
            microscopyNote:
              "En Giemsa resaltan con extraordinaria nitidez incluso en trofozoítos jóvenes.",
            reconstruction3DNote:
              "52 gránulos submembranosos de mayor calibre distribuidos en ambas caras del eritrocito ovalado.",
          },
        ],
      },
      {
        id: "schizont_stage",
        name: "Esquizonte maduro (6–14 merozoítos) en eritrocito fimbriado",
        shortName: "Esquizonte (6–14 merozoítos)",
        subtitle:
          "Roseta laxa de 8 merozoítos grandes (rango 6–14, la mitad que P. vivax) alrededor de pigmento pardo oscuro en glóbulo rojo ovalado fimbriado",
        dimensionsNote: "Contiene 6 a 14 merozoítos (promedio 8) en eritrocito ovalado con puntos de James",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 2.2,
        translucencyLabel: "Transparencia del eritrocito",
        translucencyHint:
          "Activa el «Corte Histológico» para observar los 8 merozoítos grandes (la mitad del número que presenta P. vivax)",
        defaultTranslucency: 58,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.2, 6.4], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [0.0, 3.0, 3.6], target: [0.0, 0.0, 0.0] },
        focusButtonLabel: "Abrir Esquizonte (8 Merozoítos)",
        fullButtonLabel: "Vista general",
        overviewSummary:
          "El esquizonte maduro de Plasmodium ovale contiene únicamente de 6 a 14 merozoítos grandes (con un promedio clásico de 8 núcleos), ocupando alrededor de dos tercios del eritrocito ovalado y fimbriado. Este recuento bajo de merozoítos rodeados por un intenso punteado de James es decisivo para diferenciarlo de P. vivax (que alberga 12–24 merozoítos) y de P. malariae (que carece de punteado de James y no deforma ni agranda el eritrocito).",
        regions: [
          {
            id: "pos-merozoites",
            number: 1,
            name: "8 Merozoítos grandes en corona (rango 6–14)",
            shortLabel: "8 Merozoítos grandes",
            badge: "Diferencial numérico",
            scale: "6–14 merozoítos",
            regionCode: 6,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [1.24, 0.10, 0.45],
            labelOffset: [95, -50],
            camGoal: { position: [0.5, 3.0, 3.5], target: [0.0, 0.0, 0.0] },
            defaultTranslucency: 72,
            defaultCutPercent: 58,
            summary:
              "Ocho merozoítos piriformes voluminosos dispuestos alrededor del pigmento central.",
            microscopyNote:
              "Mientras tiene el mismo número de merozoítos que P. malariae (~8), la presencia del eritrocito ovalado fimbriado con puntos de James descarta de inmediato P. malariae.",
            reconstruction3DNote:
              "Expuestos en 3D con sus núcleos individuales al activar el Corte Histológico.",
          },
          {
            id: "pos-pigment",
            number: 2,
            name: "Cúmulo central de pigmento malárico pardo oscuro",
            shortLabel: "Pigmento central",
            badge: "Hemozoína",
            scale: "Masa central",
            regionCode: 4,
            colorBio: "#eab308",
            colorStain: "#854d0e",
            localAnchor: [0.0, 0.08, 0.0],
            labelOffset: [-85, 55],
            camGoal: { position: [0.0, 2.5, 2.9], target: [0.0, 0.0, 0.0] },
            defaultCutPercent: 58,
            summary:
              "Gránulos de hemozoína de tono marrón más oscuro y grueso que los de P. vivax concentrados en el centro del esquizonte.",
            microscopyNote:
              "Visible en el centro de la roseta esquizogónica.",
            reconstruction3DNote:
              "Agrupación cristalina en el centro de los 8 merozoítos.",
          },
          {
            id: "pos-fimbriae",
            number: 3,
            name: "Márgenes polares fimbriados con puntos de James",
            shortLabel: "Fimbrias y Puntos de James",
            badge: "Célula hospedadora",
            scale: "Polos desflecados",
            regionCode: 5,
            colorBio: "#fb7185",
            colorStain: "#be185d",
            localAnchor: [-2.85, 0.12, 0.25],
            labelOffset: [-100, -45],
            camGoal: { position: [-2.4, 3.6, 4.2], target: [-1.2, 0.0, 0.0] },
            summary:
              "El tercio periférico libre del eritrocito exhibe claramente las fimbrias polares y las gruesas granulaciones de James.",
            microscopyNote:
              "Criterio morfológico de confirmación en microscopía óptica con Giemsa.",
            reconstruction3DNote:
              "Modelado en los polos izquierdo y derecho del eritrocito.",
          },
        ],
      },
      {
        id: "gametocyte_stage",
        name: "Gametocito redondo-ovalado en eritrocito fimbriado",
        shortName: "Gametocito ovalado",
        subtitle:
          "Gametocito compacto con masa de cromatina excéntrica y gránulos de hemozoína dentro de un eritrocito ovalado con puntos de James",
        dimensionsNote: "Gametocito de ~8–9 µm en eritrocito ovalado fimbriado",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 2.2,
        translucencyLabel: "Transparencia del eritrocito",
        translucencyHint:
          "Ajusta la transparencia o el corte histológico para ver la masa de cromatina excéntrica y los gránulos de pigmento",
        defaultTranslucency: 54,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.2, 6.4], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [-0.6, 3.0, 3.6], target: [-0.2, 0.05, 0.0] },
        focusButtonLabel: "Enfocar Gametocito",
        fullButtonLabel: "Vista general",
        overviewSummary:
          "El gametocito maduro de Plasmodium ovale es redondo a ovalado, ligeramente más pequeño que el de P. vivax, y se aloja en un eritrocito ovalado o fimbriado ribeteado por prominentes granulaciones de James.",
        regions: [
          {
            id: "pog-body",
            number: 1,
            name: "Gametocito redondo-ovalado compacto",
            shortLabel: "Gametocito ovalado",
            badge: "Fase sexual",
            scale: "8–9 µm",
            regionCode: 2,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [0.65, 0.32, 0.35],
            labelOffset: [90, -50],
            camGoal: { position: [0.6, 3.4, 4.0], target: [0.0, 0.0, 0.0] },
            summary:
              "Cuerpo sexual compacto de citoplasma azul basófilo y núcleo excéntrico único.",
            microscopyNote:
              "Se distingue del gametocito de P. vivax por su menor tamaño y por la forma ovalada/fimbriada del eritrocito hospedador.",
            reconstruction3DNote:
              "Alojado dentro de la cavidad del eritrocito fimbriado.",
          },
          {
            id: "pog-chromatin",
            number: 2,
            name: "Masa excéntrica de cromatina nuclear",
            shortLabel: "Núcleo excéntrico",
            badge: "Cromatina",
            scale: "Compacta",
            regionCode: 3,
            colorBio: "#f43f5e",
            colorStain: "#9d174d",
            localAnchor: [-0.76, 0.14, 0.38],
            labelOffset: [-95, -45],
            camGoal: { position: [-0.9, 2.6, 3.2], target: [-0.6, 0.1, 0.2] },
            defaultCutPercent: 52,
            summary:
              "Núcleo único voluminoso teñido de rojo-púrpura intenso con halo perinuclear.",
            microscopyNote:
              "Visible en la periferia del gametocito.",
            reconstruction3DNote:
              "Expuesto al activar el Corte Histológico.",
          },
        ],
      },
      {
        id: "hepatic_hypnozoite",
        name: "Hipnozoíto hepático durmiente (P. ovale curtisi y P. ovale wallikeri)",
        shortName: "Hipnozoíto hepático",
        subtitle:
          "Estadio exoeritrocitario latente en hepatocito humano compartido con P. vivax; requiere tratamiento antirrecaída con primaquina tras evaluar G6PD",
        dimensionsNote: "Hipnozoíto latente: ~4.5 µm en hepatocito de 25–30 µm",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 1.5,
        translucencyLabel: "Transparencia del hepatocito",
        translucencyHint:
          "Activa el «Corte Histológico» para ver el hipnozoíto durmiente en el interior del hepatocito",
        defaultTranslucency: 56,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.4, 6.8], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [0.9, 2.6, 3.4], target: [0.88, 0.08, 0.24] },
        focusButtonLabel: "Enfocar Hipnozoíto",
        fullButtonLabel: "Ver Hepatocito Completo",
        overviewSummary:
          "Tanto Plasmodium ovale curtisi como Plasmodium ovale wallikeri forman hipnozoítos durmientes en el hígado humano (con diferentes tiempos de latencia entre ambas subespecies). Por ello, al igual que en P. vivax, la erradicación completa (cura radical) requiere asociar primaquina tras descartar deficiencia de G6PD.",
        regions: [
          {
            id: "poh-hypnozoite",
            number: 1,
            name: "Hipnozoíto latente intrahepatocitario",
            shortLabel: "Hipnozoíto latente",
            badge: "Recaída hepática",
            scale: "4.5 µm",
            regionCode: 2,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [0.88, 0.28, 0.24],
            labelOffset: [95, -50],
            camGoal: { position: [1.0, 2.5, 3.2], target: [0.88, 0.08, 0.24] },
            defaultTranslucency: 72,
            defaultCutPercent: 56,
            summary:
              "Forma uninucleada quiescente rodeada por su membrana vacuolar parasitófora dentro del hepatocito.",
            microscopyNote:
              "No confundir una recaída verdadera por hipnozoítos (P. vivax y P. ovale) con una recrudescencia eritrocitaria por persistencia en sangre (P. malariae y P. falciparum).",
            reconstruction3DNote:
              "Secciona el hepatocito con el Corte Histológico para ver el núcleo y el apicoplasto del hipnozoíto.",
          },
          {
            id: "poh-hepatocyte",
            number: 2,
            name: "Hepatocito hospedador y núcleo vesicular",
            shortLabel: "Hepatocito humano",
            badge: "Parénquima hepático",
            scale: "25–30 µm",
            regionCode: 6,
            colorBio: "#60a5fa",
            colorStain: "#4f46e5",
            localAnchor: [-1.18, 0.35, -0.28],
            labelOffset: [-100, -45],
            camGoal: { position: [-1.2, 4.2, 5.2], target: [-0.4, 0.0, 0.0] },
            summary:
              "Hepatocito poligonal de los cordones hepáticos que alberga la fase exoeritrocitaria.",
            microscopyNote:
              "La primaquina está contraindicada en el embarazo y en el déficit grave de G6PD.",
            reconstruction3DNote:
              "Incluye núcleo vesicular, nucléolo y mitocondrias.",
          },
        ],
      },
    ],
  },
  p05: {
    scientificName: "Plasmodium malariae",
    keyTable: [
      ["Eritrocito:", "Normocítico o microcítico (senescente)"],
      ["Trofozoíto típico:", "Forma ecuatorial «en banda»"],
      ["Esquizonte:", "En «margarita / roseta» (6–12 merozoítos)"],
      ["Ciclo / Hipnozoítos:", "72 h (Cuartana) / SIN hipnozoítos"],
    ],
    stages: [
      {
        id: "trophozoite_stage",
        name: "Trofozoíto ecuatorial «en banda» con pigmento negro grueso",
        shortName: "Trofozoíto «en banda»",
        subtitle:
          "Cinta citoplasmática ecuatorial de borde a borde en eritrocito normocítico/microcítico sin puntos de Schüffner, con hemozoína negra gruesa",
        dimensionsNote: "Eritrocito senescente: ~6.5–7.2 µm · Banda ecuatorial: ~6.5 × 2.2 µm",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 2.4,
        translucencyLabel: "Transparencia del eritrocito",
        translucencyHint:
          "Activa el «Corte Histológico» para ver cómo el trofozoíto «en banda» atraviesa ecuatorialmente el glóbulo rojo de lado a lado",
        defaultTranslucency: 54,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.0, 6.0], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [0.0, 3.0, 3.5], target: [0.0, 0.05, 0.0] },
        focusButtonLabel: "Enfocar «Forma en Banda»",
        fullButtonLabel: "Ver Eritrocito Completo",
        overviewSummary:
          "Plasmodium malariae invade selectivamente eritrocitos maduros o senescentes (normocíticos o ligeramente microcíticos), que NO se agrandan ni presentan granulaciones de Schüffner. Su hallazgo microscópico patognomónico es el trofozoíto «en banda» (band form): el parásito se extiende como una cinta o barra transversal de borde a borde a través del ecuador del eritrocito, con cromatina alargada y abundantes gránulos gruesos de pigmento hemozoínico negro-parduzco.",
        regions: [
          {
            id: "pm-band-cyto",
            number: 1,
            name: "Trofozoíto ecuatorial «en banda» o «en barra»",
            shortLabel: "Trofozoíto «en banda»",
            badge: "Patognomónico",
            scale: "6.5 × 2.2 µm",
            regionCode: 2,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [0.0, 0.12, 0.0],
            labelOffset: [85, -55],
            camGoal: { position: [0.0, 2.8, 3.4], target: [0.0, 0.05, 0.0] },
            defaultTranslucency: 68,
            defaultCutPercent: 54,
            summary:
              "Cinta citoplasmática compacta y rectangular que cruza ecuatorialmente todo el diámetro del glóbulo rojo sin dejar vacuola aparente.",
            microscopyNote:
              "Las formas en banda son exclusivas de P. malariae en los frotis sanguíneos humanos.",
            reconstruction3DNote:
              "Modelada como una banda transversal continua anclada de un margen ecuatorial al opuesto.",
          },
          {
            id: "pm-ribbon-chromatin",
            number: 2,
            name: "Cromatina nuclear alargada marginal",
            shortLabel: "Cromatina en cinta",
            badge: "Núcleo en barra",
            scale: "Trazo lineal rubí",
            regionCode: 3,
            colorBio: "#f43f5e",
            colorStain: "#9d174d",
            localAnchor: [-0.45, 0.18, -0.26],
            labelOffset: [-95, -45],
            camGoal: { position: [-0.4, 2.5, 3.0], target: [-0.2, 0.1, -0.1] },
            defaultCutPercent: 54,
            summary:
              "La cromatina nuclear suele disponerse como una franja alargada a lo largo de uno de los bordes de la banda citoplasmática.",
            microscopyNote:
              "En Giemsa se tiñe de rojo-púrpura denso bordeando la banda azul.",
            reconstruction3DNote:
              "Cordón cromatínico a lo largo del margen anterior de la banda.",
          },
          {
            id: "pm-coarse-pigment",
            number: 3,
            name: "Gránulos gruesos y tempranos de hemozoína negro-parduzca",
            shortLabel: "Hemozoína negra gruesa",
            badge: "Pigmento abundante",
            scale: "Gránulos oscuros",
            regionCode: 4,
            colorBio: "#eab308",
            colorStain: "#713f12",
            localAnchor: [0.85, 0.16, 0.28],
            labelOffset: [95, 50],
            camGoal: { position: [0.8, 2.6, 3.1], target: [0.4, 0.1, 0.15] },
            defaultCutPercent: 54,
            summary:
              "Plasmodium malariae produce el pigmento malárico más grueso, oscuro (marrón-negruzco) y precoz de todas las especies humanas de Plasmodium.",
            microscopyNote:
              "Los gránulos oscuros suelen alinearse en el borde opuesto al núcleo dentro de la banda.",
            reconstruction3DNote:
              "8 agregados cristalinos oscuros alineados en la superficie de la banda.",
          },
          {
            id: "pm-senescent-rbc",
            number: 4,
            name: "Eritrocito senescente normocítico/microcítico con puntos de Ziemann",
            shortLabel: "Eritrocito no agrandado",
            badge: "Sin Schüffner",
            scale: "6.5–7.2 µm",
            regionCode: 1,
            colorBio: "#e11d48",
            colorStain: "#db2777",
            localAnchor: [-2.15, 0.25, 0.65],
            labelOffset: [-100, 45],
            camGoal: { position: [-1.8, 4.4, 5.4], target: [0.0, 0.0, 0.0] },
            summary:
              "Glóbulo rojo maduro o envejecido de tamaño normal o ligeramente reducido, que explica por qué la parasitemia de P. malariae suele ser baja (<1%).",
            microscopyNote:
              "Carece de puntos de Schüffner; solo con tinciones prolongadas pueden observarse finísimos puntos de Ziemann.",
            reconstruction3DNote:
              "Disco bicóncavo compacto de menor diámetro que el de P. vivax.",
          },
        ],
      },
      {
        id: "schizont_stage",
        name: "Esquizonte maduro «en margarita / roseta» (6–12 merozoítos)",
        shortName: "Esquizonte «en margarita»",
        subtitle:
          "Disposición simétrica en flor de margarita (daisy-head) de 8–10 merozoítos como pétalos alrededor de un núcleo central de pigmento negro grueso",
        dimensionsNote: "Contiene 6 a 12 merozoítos (promedio 8–10) en roseta simétrica",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 2.4,
        translucencyLabel: "Transparencia del eritrocito",
        translucencyHint:
          "Activa el «Corte Histológico» para ver en 3D los pétalos de merozoítos dispuestos como una flor de margarita alrededor del pigmento central",
        defaultTranslucency: 58,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.0, 6.0], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [0.0, 2.8, 3.3], target: [0.0, 0.0, 0.0] },
        focusButtonLabel: "Abrir «Flor de Margarita»",
        fullButtonLabel: "Vista general",
        overviewSummary:
          "El esquizonte maduro de Plasmodium malariae presenta una arquitectura geométrica inconfundible llamada «en cabeza de margarita» (daisy-head) o «en roseta»: de 6 a 12 merozoítos (habitualmente 8 a 10) se disponen regularmente en un anillo simétrico como los pétalos de una flor alrededor de una masa central compacta de hemozoína negro-parduzca. Su ruptura sincrónica cada 72 horas origina la fiebre cuartana.",
        regions: [
          {
            id: "pms-daisy-petals",
            number: 1,
            name: "Roseta simétrica de 8–10 merozoítos («pétalos de margarita»)",
            shortLabel: "Pétalos de merozoítos",
            badge: "Esquizonte en margarita",
            scale: "6–12 merozoítos",
            regionCode: 6,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [1.08, 0.08, 0.35],
            labelOffset: [95, -50],
            camGoal: { position: [0.4, 2.8, 3.3], target: [0.0, 0.0, 0.0] },
            defaultTranslucency: 74,
            defaultCutPercent: 58,
            summary:
              "Merozoítos piriformes orientados radialmente con sus polos apicales convergiendo hacia el centro del eritrocito.",
            microscopyNote:
              "Imagen clásica de examen: eritrocito normocítico sin Schüffner con 8–10 merozoítos en flor de margarita alrededor del pigmento central = P. malariae.",
            reconstruction3DNote:
              "9 merozoítos piriformes 3D dispuestos en simetría radial perfecta.",
          },
          {
            id: "pms-black-core",
            number: 2,
            name: "Botón central denso de hemozoína negro-parduzca",
            shortLabel: "Centro de hemozoína",
            badge: "Núcleo de la flor",
            scale: "Masa central negra",
            regionCode: 4,
            colorBio: "#eab308",
            colorStain: "#713f12",
            localAnchor: [0.0, 0.08, 0.0],
            labelOffset: [-90, 55],
            camGoal: { position: [0.0, 2.4, 2.7], target: [0.0, 0.0, 0.0] },
            defaultCutPercent: 58,
            summary:
              "Bloque denso de cristales oscuros de pigmento malárico que forma el botón central de la margarita.",
            microscopyNote:
              "Se libera al plasma cada 72 horas (ciclo cuartano).",
            reconstruction3DNote:
              "Expuesto en el centro exacto de la corona de merozoítos.",
          },
        ],
      },
      {
        id: "gametocyte_stage",
        name: "Gametocito compacto rico en pigmento negro grueso",
        shortName: "Gametocito compacto",
        subtitle:
          "Gametocito redondo-ovalado pequeño que llena el eritrocito normocítico con abundantes gránulos oscuros de hemozoína",
        dimensionsNote: "Gametocito redondo de ~6.5–7 µm sin puntos de Schüffner",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 2.4,
        translucencyLabel: "Transparencia del eritrocito",
        translucencyHint:
          "Observa el gametocito redondo pequeño con gruesos gránulos negros en un eritrocito no agrandado",
        defaultTranslucency: 54,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.0, 6.0], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [-0.5, 2.8, 3.4], target: [-0.2, 0.05, 0.0] },
        focusButtonLabel: "Enfocar Gametocito",
        fullButtonLabel: "Vista general",
        overviewSummary:
          "El gametocito de Plasmodium malariae es redondo y compacto, pero mucho más pequeño que el de P. vivax debido a que habita un eritrocito no agrandado y carente de puntos de Schüffner. Destaca por sus gránulos muy gruesos y oscuros de hemozoína dispersos por el citoplasma.",
        regions: [
          {
            id: "pmg-body",
            number: 1,
            name: "Gametocito esférico pequeño con cromatina excéntrica",
            shortLabel: "Gametocito esférico",
            badge: "Forma sexual",
            scale: "6.5–7.0 µm",
            regionCode: 2,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [0.55, 0.28, 0.35],
            labelOffset: [90, -50],
            camGoal: { position: [0.5, 3.2, 3.8], target: [0.0, 0.0, 0.0] },
            summary:
              "Ocupa casi todo el eritrocito senescente sin agrandarlo.",
            microscopyNote:
              "Su abundancia de pigmento negro grueso y la ausencia de puntos de Schüffner lo distinguen de P. vivax y P. ovale.",
            reconstruction3DNote:
              "Activa el Corte Histológico para ver el núcleo excéntrico y los cristales oscuros internos.",
          },
          {
            id: "pmg-pigment",
            number: 2,
            name: "Abundantes gránulos negros de hemozoína",
            shortLabel: "Pigmento negro grueso",
            badge: "Hemozoína densa",
            scale: "Cristales oscuros",
            regionCode: 4,
            colorBio: "#eab308",
            colorStain: "#713f12",
            localAnchor: [-0.45, 0.14, -0.45],
            labelOffset: [-95, 50],
            camGoal: { position: [-0.6, 2.6, 3.1], target: [-0.2, 0.05, -0.2] },
            defaultCutPercent: 54,
            summary:
              "Cristales de hemozoína particularmente oscuros y prominentes repartidos en el citoplasma.",
            microscopyNote:
              "Rasgo constante en todas las formas maduras de P. malariae.",
            reconstruction3DNote:
              "18 agregados oscuros distribuidos en el interior del gametocito.",
          },
        ],
      },
      {
        id: "quartan_cycle_stage",
        name: "Anillo «en ojo de pájaro» y Forma «en canasta» (Recrudescencia y Nefropatía)",
        shortName: "Anillo «Ojo de pájaro»",
        subtitle:
          "Trofozoíto anular robusto con punto de cromatina central dentro de la vacuola («bird's-eye») y forma en canasta; persiste décadas en sangre sin hipnozoítos",
        dimensionsNote: "Anillo «ojo de pájaro»: ~2.2–2.8 µm · Ciclo cuartano de 72 h",
        scaleBarLabel: "5 µm",
        scaleBarWorldUnits: 2.4,
        translucencyLabel: "Transparencia del eritrocito",
        translucencyHint:
          "Activa el «Corte Histológico» para ver el punto de cromatina situado en el centro exacto de la vacuola («ojo de pájaro»)",
        defaultTranslucency: 56,
        defaultCutPercent: 0,
        hasMovement: true,
        defaultCamera: { position: [0.0, 5.0, 6.0], target: [0.0, 0.0, 0.0] },
        focusCamera: { position: [-0.6, 2.8, 3.3], target: [-0.65, 0.05, 0.0] },
        focusButtonLabel: "Enfocar «Ojo de Pájaro»",
        fullButtonLabel: "Vista general",
        overviewSummary:
          "Los trofozoítos jóvenes de Plasmodium malariae forman anillos gruesos y densos donde el punto de cromatina suele ubicarse en el interior de la vacuola («anillo en ojo de pájaro» o bird's-eye ring) o desplazarse junto con el pigmento («forma en canasta» o basket form). IMPORTANTE: P. malariae NO forma hipnozoítos hepáticos, pero puede persistir en la sangre en niveles submicroscópicos durante 20 a 40+ años (recrudescencia) y depositar inmunocomplejos en el glomérulo renal causando síndrome nefrótico (nefropatía malárica cuartana).",
        regions: [
          {
            id: "pmq-birdseye",
            number: 1,
            name: "Anillo «en ojo de pájaro» (cromatina central intravaquolar)",
            shortLabel: "Anillo «Ojo de pájaro»",
            badge: "Morfología CDC DPDx",
            scale: "2.2–2.8 µm",
            regionCode: 3,
            colorBio: "#f43f5e",
            colorStain: "#9d174d",
            localAnchor: [-0.65, 0.12, 0.0],
            labelOffset: [-95, -50],
            camGoal: { position: [-0.65, 2.6, 3.0], target: [-0.65, 0.05, 0.0] },
            defaultTranslucency: 70,
            defaultCutPercent: 55,
            summary:
              "Anillo citoplasmático grueso y azul intenso cuya masa de cromatina parece suspendida en el centro del espacio vacuolar claro, evocando la pupila del ojo de un ave.",
            microscopyNote:
              "Altamente orientador de P. malariae en frotis fino.",
            reconstruction3DNote:
              "Núcleo central rodeado por la cavidad vacuolar y el anillo citoplasmático robusto.",
          },
          {
            id: "pmq-basket",
            number: 2,
            name: "Trofozoíto «en canasta» con gránulos de hemozoína",
            shortLabel: "Forma «en canasta»",
            badge: "Persistencia crónica",
            scale: "Sin hipnozoítos",
            regionCode: 6,
            colorBio: "#38bdf8",
            colorStain: "#2563eb",
            localAnchor: [0.92, 0.12, 0.08],
            labelOffset: [95, 50],
            camGoal: { position: [0.9, 2.6, 3.1], target: [0.92, 0.05, 0.08] },
            defaultCutPercent: 55,
            summary:
              "La persistencia crónica de parasitemia de bajo grado genera estimulación antigénica continua e inmunocomplejos circulantes IgG/IgM-C3 que se depositan en la membrana basal glomerular.",
            microscopyNote:
              "A diferencia de P. vivax y P. ovale, P. malariae se cura con tratamiento esquizonticida sanguíneo (cloroquina o ACT) sin necesidad de primaquina.",
            reconstruction3DNote:
              "Muestra la transición entre anillo grueso y trofozoíto en canasta con pigmento.",
          },
        ],
      },
    ],
  },
};

interface PlasmodiumDifferential3DViewerProps {
  speciesCode: PlasmodiumSpeciesCode;
  onClose?: () => void;
}

export function PlasmodiumDifferential3DViewer({
  speciesCode,
  onClose,
}: PlasmodiumDifferential3DViewerProps) {
  const speciesData =
    PLASMODIUM_SPECIES_DATA[speciesCode] || PLASMODIUM_SPECIES_DATA.p03;
  const stages = speciesData.stages;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasHolderRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [activeStageId, setActiveStageId] = useState<string>(stages[0].id);
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [shaderMode, setShaderMode] = useState<PlasmodiumDiffShaderMode>(0);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const stageMeta =
    stages.find((s) => s.id === activeStageId) || stages[0];
  const selectedRegion =
    stageMeta.regions.find((r) => r.id === selectedRegionId) || null;

  const [translucency, setTranslucency] = useState<number>(
    stageMeta.defaultTranslucency
  );
  const [cutPercent, setCutPercent] = useState<number>(
    stageMeta.defaultCutPercent
  );
  const [movePercent, setMovePercent] = useState<number>(55);

  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [mobileTouchInteractive, setMobileTouchInteractive] =
    useState<boolean>(false);
  const [mobileControlsOpen, setMobileControlsOpen] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const [projectedPins, setProjectedPins] = useState<
    Record<
      string,
      {
        anchorX: number;
        anchorY: number;
        labelX: number;
        labelY: number;
        visible: boolean;
      }
    >
  >({});
  const [scaleBarPx, setScaleBarPx] = useState<number>(68);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const simTimeRef = useRef<number>(0);

  const camTransitionRef = useRef<{
    active: boolean;
    goalPos: THREE.Vector3;
    goalTarget: THREE.Vector3;
  }>({
    active: false,
    goalPos: new THREE.Vector3(...stages[0].defaultCamera.position),
    goalTarget: new THREE.Vector3(...stages[0].defaultCamera.target),
  });

  const stageMetaRef = useRef<PlasmodiumDiffStageMeta>(stageMeta);
  stageMetaRef.current = stageMeta;
  const movePercentRef = useRef<number>(movePercent);
  movePercentRef.current = movePercent;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsStageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const syncUniforms = useCallback(() => {
    const scene = sceneRef.current;
    const mat = materialRef.current;
    if (!scene || !mat) return;

    scene.background = new THREE.Color(
      shaderMode === 1 ? 0xfaf7f2 : shaderMode === 2 ? 0x0b0e14 : 0x070b14
    );

    const activeReg =
      stageMeta.regions.find((r) => r.id === selectedRegionId) || null;
    mat.uniforms.uTranslucency.value = translucency / 100.0;
    mat.uniforms.uCutPercent.value = cutPercent / 100.0;
    mat.uniforms.uShaderMode.value = shaderMode;
    mat.uniforms.uSelectedRegion.value = activeReg ? activeReg.regionCode : 0;
    mat.uniforms.uSpeciesIndex.value =
      speciesCode === "p03" ? 0 : speciesCode === "p04" ? 1 : 2;
  }, [
    stageMeta,
    shaderMode,
    translucency,
    cutPercent,
    selectedRegionId,
    speciesCode,
  ]);

  useEffect(() => {
    syncUniforms();
  }, [syncUniforms]);

  useEffect(() => {
    const holder = canvasHolderRef.current;
    if (!holder) return;

    holder.innerHTML = "";
    const width = holder.clientWidth || 840;
    const height = holder.clientHeight || 540;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch (err) {
      console.error("WebGL initialization failed:", err);
      setWebglError(
        "No se pudo inicializar WebGL en este navegador. Se muestra la descripción morfológica."
      );
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    holder.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    sceneRef.current = scene;

    const initMeta = stages[0];
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(...initMeta.defaultCamera.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.8;
    controls.maxDistance = 16.0;
    controls.target.set(...initMeta.defaultCamera.target);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.15;
    controlsRef.current = controls;

    const stopCamTransition = () => {
      camTransitionRef.current.active = false;
    };
    controls.addEventListener("start", stopCamTransition);

    const material = new THREE.ShaderMaterial({
      vertexShader: PLASMODIUM_DIFF_VERTEX_SHADER,
      fragmentShader: PLASMODIUM_DIFF_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uMovement: { value: 0.55 },
        uTranslucency: { value: initMeta.defaultTranslucency / 100.0 },
        uCutPercent: { value: initMeta.defaultCutPercent / 100.0 },
        uShaderMode: { value: 0 },
        uSelectedRegion: { value: 0 },
        uSpeciesIndex: {
          value: speciesCode === "p03" ? 0 : speciesCode === "p04" ? 1 : 2,
        },
      },
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    const initialGeo = buildPlasmodiumDifferentialGeometry(
      speciesCode,
      initMeta.id
    );
    const mesh = new THREE.Mesh(initialGeo, material);
    scene.add(mesh);
    meshRef.current = mesh;

    let lastNow = performance.now();
    let frameCount = 0;

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const dt = Math.min(0.05, (now - lastNow) * 0.001);
      lastNow = now;

      const moveScale = movePercentRef.current / 100.0;
      simTimeRef.current += dt * (0.2 + 1.2 * moveScale);

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = simTimeRef.current;
        materialRef.current.uniforms.uMovement.value = moveScale;
      }

      if (camTransitionRef.current.active) {
        camera.position.lerp(camTransitionRef.current.goalPos, 0.11);
        controls.target.lerp(camTransitionRef.current.goalTarget, 0.11);
        if (
          camera.position.distanceTo(camTransitionRef.current.goalPos) < 0.02 &&
          controls.target.distanceTo(camTransitionRef.current.goalTarget) < 0.02
        ) {
          camTransitionRef.current.active = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      frameCount++;
      if (frameCount % 2 === 0 && holder) {
        const w = holder.clientWidth;
        const h = holder.clientHeight;
        if (w > 0 && h > 0) {
          const currentStage = stageMetaRef.current;
          const rawPins: Array<{
            id: string;
            anchorX: number;
            anchorY: number;
            labelX: number;
            labelY: number;
            visible: boolean;
          }> = [];

          currentStage.regions.forEach((reg) => {
            const worldPt = new THREE.Vector3(...reg.localAnchor);
            const proj = worldPt.clone().project(camera);
            const inFront = proj.z >= -1 && proj.z <= 1;
            const ax = (proj.x * 0.5 + 0.5) * w;
            const ay = (-(proj.y * 0.5) + 0.5) * h;

            const padX = Math.min(115, w * 0.24);
            const padTop = 64;
            const padBot = 54;
            const lx = Math.max(
              padX,
              Math.min(w - padX, ax + reg.labelOffset[0])
            );
            const ly = Math.max(
              padTop,
              Math.min(h - padBot, ay + reg.labelOffset[1])
            );

            rawPins.push({
              id: reg.id,
              anchorX: ax,
              anchorY: ay,
              labelX: lx,
              labelY: ly,
              visible:
                inFront && ax > 20 && ax < w - 20 && ay > 20 && ay < h - 20,
            });
          });

          for (let iter = 0; iter < 4; iter++) {
            for (let i = 0; i < rawPins.length; i++) {
              for (let j = i + 1; j < rawPins.length; j++) {
                const a = rawPins[i];
                const b = rawPins[j];
                if (!a.visible || !b.visible) continue;
                const dx = Math.abs(a.labelX - b.labelX);
                const dy = Math.abs(a.labelY - b.labelY);
                if (dx < 145 && dy < 30) {
                  const push = (30 - dy) * 0.55;
                  if (a.labelY <= b.labelY) {
                    a.labelY = Math.max(62, a.labelY - push);
                    b.labelY = Math.min(h - 52, b.labelY + push);
                  } else {
                    b.labelY = Math.max(62, b.labelY - push);
                    a.labelY = Math.min(h - 52, a.labelY + push);
                  }
                }
              }
            }
          }

          const nextPins: Record<
            string,
            {
              anchorX: number;
              anchorY: number;
              labelX: number;
              labelY: number;
              visible: boolean;
            }
          > = {};
          rawPins.forEach((p) => {
            nextPins[p.id] = p;
          });
          setProjectedPins(nextPins);

          const dist = camera.position.distanceTo(controls.target);
          const vFovRad = (camera.fov * Math.PI) / 180;
          const visibleWorldHeight = 2 * Math.tan(vFovRad / 2) * dist;
          const pxPerUnit = h / Math.max(visibleWorldHeight, 0.001);
          const rawPx = pxPerUnit * currentStage.scaleBarWorldUnits;
          setScaleBarPx(Math.round(clampJS(rawPx, 38, 125)));
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!holder || !rendererRef.current || !cameraRef.current) return;
      const newW = holder.clientWidth || 840;
      const newH = holder.clientHeight || 540;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.removeEventListener("start", stopCamTransition);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
      }
      material.dispose();
      controls.dispose();
      renderer.dispose();
      if (holder) holder.innerHTML = "";
    };
  }, [speciesCode, stages]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  useEffect(() => {
    if (!meshRef.current) return;
    const oldGeo = meshRef.current.geometry;
    const nextGeo = buildPlasmodiumDifferentialGeometry(
      speciesCode,
      activeStageId
    );
    meshRef.current.geometry = nextGeo;
    oldGeo.dispose();
  }, [speciesCode, activeStageId]);

  const handleSelectRegion = useCallback((regionId: string | null) => {
    setSelectedRegionId((prev) => {
      const nextId = prev === regionId ? null : regionId;
      const currentStage = stageMetaRef.current;
      if (nextId) {
        const reg = currentStage.regions.find((r) => r.id === nextId);
        if (reg) {
          setIsFocused(true);
          if (reg.defaultTranslucency !== undefined) {
            setTranslucency(reg.defaultTranslucency);
          }
          if (reg.defaultCutPercent !== undefined) {
            setCutPercent(reg.defaultCutPercent);
          }
          camTransitionRef.current = {
            active: true,
            goalPos: new THREE.Vector3(...reg.camGoal.position),
            goalTarget: new THREE.Vector3(...reg.camGoal.target),
          };
        }
      } else {
        setIsFocused(false);
        camTransitionRef.current = {
          active: true,
          goalPos: new THREE.Vector3(...currentStage.defaultCamera.position),
          goalTarget: new THREE.Vector3(...currentStage.defaultCamera.target),
        };
      }
      return nextId;
    });
  }, []);

  const handleQuickFocus = () => {
    setSelectedRegionId(null);
    setIsFocused(true);
    setCutPercent(55);
    setTranslucency(68);
    const cam = stageMeta.focusCamera;
    camTransitionRef.current = {
      active: true,
      goalPos: new THREE.Vector3(...cam.position),
      goalTarget: new THREE.Vector3(...cam.target),
    };
  };

  const handleViewFull = () => {
    setSelectedRegionId(null);
    setIsFocused(false);
    const cam = stageMeta.defaultCamera;
    camTransitionRef.current = {
      active: true,
      goalPos: new THREE.Vector3(...cam.position),
      goalTarget: new THREE.Vector3(...cam.target),
    };
  };

  const handleSwitchStage = useCallback(
    (newStageId: string) => {
      setIsStageDropdownOpen(false);
      if (newStageId === activeStageId) return;
      const meta = stages.find((s) => s.id === newStageId) || stages[0];
      setActiveStageId(newStageId);
      setSelectedRegionId(null);
      setIsFocused(false);
      setCutPercent(meta.defaultCutPercent);
      setTranslucency(meta.defaultTranslucency);

      camTransitionRef.current = {
        active: true,
        goalPos: new THREE.Vector3(...meta.defaultCamera.position),
        goalTarget: new THREE.Vector3(...meta.defaultCamera.target),
      };
    },
    [activeStageId, stages]
  );

  const handleZoom = (factor: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    camTransitionRef.current.active = false;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    const nextLen = Math.max(1.8, Math.min(16.0, dir.length() * factor));
    cam.position.copy(target).add(dir.normalize().multiplyScalar(nextLen));
    controlsRef.current.update();
  };

  const isWarmLightBg = shaderMode === 1;

  return (
    <div className="space-y-3">
      {/* 1. VISOR 3D PROTAGONISTA */}
      <div
        ref={viewportRef}
        className={`relative w-full h-[58vh] min-h-[430px] max-h-[670px] rounded-2xl overflow-hidden border shadow-2xl select-none transition-colors duration-300 ${
          isWarmLightBg
            ? "border-amber-300/60 bg-[#faf7f2]"
            : "border-slate-700/80 bg-[#070b14]"
        }`}
      >
        <div
          ref={canvasHolderRef}
          className={`w-full h-full ${
            mobileTouchInteractive ? "touch-none" : "touch-pan-y md:touch-none"
          }`}
        />

        {webglError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center z-40">
            <p className="text-sm text-amber-300 font-semibold mb-2">
              {webglError}
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              {stageMeta.overviewSummary}
            </p>
          </div>
        )}

        {/* CAPA DE MARCADORES ANATÓMICOS 2D */}
        {showMarkers && !webglError && (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
              {stageMeta.regions.map((reg) => {
                const pin = projectedPins[reg.id];
                if (!pin || !pin.visible) return null;
                const isSelected = selectedRegionId === reg.id;
                const strokeCol = isSelected
                  ? "#fb7185"
                  : isWarmLightBg
                  ? "rgba(71, 85, 105, 0.75)"
                  : "rgba(148, 163, 184, 0.65)";

                return (
                  <g key={`line-${reg.id}`}>
                    <line
                      x1={pin.anchorX}
                      y1={pin.anchorY}
                      x2={pin.labelX}
                      y2={pin.labelY}
                      stroke={strokeCol}
                      strokeWidth={isSelected ? "2" : "1.25"}
                      strokeDasharray={isSelected ? undefined : "3 2"}
                    />
                    <circle
                      cx={pin.anchorX}
                      cy={pin.anchorY}
                      r={isSelected ? 4.5 : 3.5}
                      fill={isWarmLightBg ? reg.colorStain : reg.colorBio}
                      stroke={isWarmLightBg ? "#334155" : "#ffffff"}
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              {stageMeta.regions.map((reg, idx) => {
                const pin = projectedPins[reg.id];
                if (!pin || !pin.visible) return null;
                const isSelected = selectedRegionId === reg.id;
                const dotColor = isWarmLightBg ? reg.colorStain : reg.colorBio;

                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRegion(reg.id);
                    }}
                    style={{
                      left: `${pin.labelX}px`,
                      top: `${pin.labelY}px`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 shadow-lg border backdrop-blur-md ${
                      isSelected
                        ? "bg-rose-600 text-white border-rose-300 scale-105 ring-4 ring-rose-500/30 z-30"
                        : isWarmLightBg
                        ? "bg-slate-900/90 text-slate-100 border-slate-700 hover:bg-slate-900"
                        : "bg-slate-950/85 text-slate-100 border-slate-700/80 hover:border-cyan-400/70"
                    }`}
                  >
                    <span
                      style={{
                        backgroundColor: isSelected ? "#ffffff" : dotColor,
                      }}
                      className="w-2 h-2 rounded-full shrink-0"
                    />
                    <span className="whitespace-nowrap">
                      {idx + 1}. {reg.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* BARRA SUPERIOR COMPACTA */}
        <header className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsStageDropdownOpen((prev) => !prev)}
                aria-expanded={isStageDropdownOpen}
                aria-haspopup="listbox"
                className="rounded-xl bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 text-xs font-bold text-white shadow-lg flex items-center gap-2 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Elegir forma:</span>
                <span className="text-cyan-300">{stageMeta.shortName}</span>
                {isStageDropdownOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-cyan-300" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-300" />
                )}
              </button>

              {isStageDropdownOpen && (
                <div
                  role="listbox"
                  aria-label={`Elegir estadio de ${speciesData.scientificName}`}
                  className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1.5"
                >
                  <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Formas evolutivas de {speciesData.scientificName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsStageDropdownOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {stages.map((item) => {
                    const isCurrent = activeStageId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => handleSwitchStage(item.id)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 border ${
                          isCurrent
                            ? "bg-cyan-500/20 border-cyan-400/50 text-white"
                            : "bg-slate-900/60 hover:bg-slate-900 border-transparent text-slate-300"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white">
                            {item.name}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {item.dimensionsNote}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="p-1 rounded-full bg-cyan-500/30 text-cyan-300 shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 p-0.5 flex items-center gap-0.5 shadow-lg">
              <button
                type="button"
                onClick={handleQuickFocus}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  isFocused
                    ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/40"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Focus className="w-3.5 h-3.5 text-cyan-400" />
                <span>{stageMeta.focusButtonLabel}</span>
              </button>
              <button
                type="button"
                onClick={handleViewFull}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  !isFocused && !selectedRegionId
                    ? "bg-slate-800 text-white border border-slate-600/60"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
                <span>{stageMeta.fullButtonLabel}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 p-0.5 flex items-center gap-0.5 shadow-lg">
              <button
                type="button"
                onClick={() => setShaderMode(0)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  shaderMode === 0
                    ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Biológico</span>
              </button>
              <button
                type="button"
                onClick={() => setShaderMode(1)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  shaderMode === 1
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Microscope className="w-3 h-3" />
                <span>Tinción Giemsa</span>
              </button>
              <button
                type="button"
                onClick={() => setShaderMode(2)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  shaderMode === 2
                    ? "bg-slate-200 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                SEM
              </button>
              <button
                type="button"
                onClick={() => setShaderMode(3)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  shaderMode === 3
                    ? "bg-cyan-400 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Rayos X
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMarkers((prev) => !prev)}
              className={`rounded-xl backdrop-blur-md border px-3 py-1.5 text-[11px] font-bold shadow-lg flex items-center gap-1.5 transition-all ${
                showMarkers
                  ? "bg-slate-950/90 text-cyan-300 border-cyan-500/50 hover:bg-slate-900"
                  : "bg-slate-950/85 text-slate-300 border-slate-700/80 hover:text-white"
              }`}
            >
              {showMarkers ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
              <span>
                {showMarkers ? "Ocultar marcadores" : "Mostrar marcadores"}
              </span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-950/85 hover:bg-rose-950/80 backdrop-blur-md border border-slate-700/80 hover:border-rose-500/50 p-1.5 text-slate-300 hover:text-rose-200 shadow-lg transition-all"
                title="Cerrar visor 3D"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* BARRA INFERIOR COMPACTA */}
        <footer className="absolute bottom-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/70 px-3 py-1.5 text-[11px] text-slate-200 flex items-center gap-2 pointer-events-auto shadow-lg">
            <span className="font-semibold text-amber-300">
              Reconstrucción 3D educativa; no sustituye la observación
              microscópica.
            </span>
            <span className="hidden xl:inline text-slate-400">
              ·{" "}
              {shaderMode === 1
                ? "Tinción de Giemsa: fondo de frotis (#faf7f2) con cromatina púrpura-rubí, citoplasma azul y punteado diferencial."
                : shaderMode === 2
                ? "SEM: topografía de la membrana eritrocitaria (reticulocito / fimbrias / normocito)."
                : shaderMode === 3
                ? "Rayos X: resalta núcleos de merozoítos, hemozoína e hipnozoítos."
                : `Modo Biológico 3D de ${speciesData.scientificName}.`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => setMobileTouchInteractive((prev) => !prev)}
              className={`md:hidden px-2.5 py-1.5 rounded-xl text-[11px] font-bold border backdrop-blur-md flex items-center gap-1 shadow-lg ${
                mobileTouchInteractive
                  ? "bg-emerald-600/90 text-white border-emerald-400"
                  : "bg-slate-950/90 text-cyan-300 border-cyan-500/50"
              }`}
            >
              {mobileTouchInteractive ? (
                <>
                  <Unlock className="w-3 h-3" />
                  <span>Giro activo</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  <span>Activar giro 3D</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/70 p-1 shadow-lg">
              <button
                type="button"
                onClick={() => handleZoom(0.8)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-200"
                title="Acercar (Zoom +)"
              >
                <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(1.25)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-200"
                title="Alejar (Zoom -)"
              >
                <ZoomOut className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                type="button"
                onClick={handleViewFull}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-200"
                title="Restablecer cámara"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                type="button"
                onClick={() => setIsAutoRotating((prev) => !prev)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 ${
                  isAutoRotating
                    ? "bg-emerald-500/25 text-emerald-300"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Autorrotación opcional"
              >
                {isAutoRotating ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                <span>Giro</span>
              </button>
            </div>

            <div
              className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/70 px-2.5 py-1.5 flex items-center gap-2 shadow-lg"
              title="Escala geométrica correspondiente al estadio activo"
            >
              <span className="text-[11px] font-mono font-bold text-cyan-300">
                {stageMeta.scaleBarLabel}
              </span>
              <div
                style={{ width: `${scaleBarPx}px` }}
                className="h-1.5 border-x-2 border-b-2 border-cyan-400 transition-all duration-150"
              />
            </div>
          </div>
        </footer>
      </div>

      {/* 2. PANEL DE CONTROLES Y REGIONES ANATÓMICAS FUERA DEL LIENZO */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 space-y-3.5">
        <div className="flex md:hidden items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleQuickFocus}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1"
            >
              <Focus className="w-3.5 h-3.5" />
              <span>{stageMeta.focusButtonLabel}</span>
            </button>
            <button
              type="button"
              onClick={handleViewFull}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs font-semibold"
            >
              Ver completo
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileControlsOpen((prev) => !prev)}
            aria-expanded={mobileControlsOpen}
            className="px-3 py-1.5 rounded-xl bg-slate-950 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>
              {mobileControlsOpen ? "Ocultar controles" : "Translucidez y corte"}
            </span>
            {mobileControlsOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div
          className={`${
            mobileControlsOpen ? "grid" : "hidden md:grid"
          } grid-cols-1 md:grid-cols-3 gap-3.5 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800`}
        >
          {/* Deslizador 1: Translucidez celular */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-200 font-bold">
                {stageMeta.translucencyLabel}
              </label>
              <span className="text-cyan-300 font-mono font-bold">
                {translucency}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={translucency}
              onChange={(e) => setTranslucency(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              {stageMeta.translucencyHint}
            </p>
          </div>

          {/* Deslizador 2: Corte Histológico / Sección 3D */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                <span>Corte Histológico / Sección 3D</span>
              </label>
              <div className="flex items-center gap-2">
                {cutPercent > 0 && (
                  <button
                    type="button"
                    onClick={() => setCutPercent(0)}
                    className="text-[10px] text-slate-400 hover:text-white underline"
                  >
                    Cerrar corte
                  </button>
                )}
                <span className="text-cyan-300 font-mono font-bold">
                  {cutPercent}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={cutPercent}
              onChange={(e) => setCutPercent(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              Abre la hemimembrana superior para exponer en 3D los merozoítos,
              la cromatina nuclear, los cristales de hemozoína o el hipnozoíto.
            </p>
          </div>

          {/* Deslizador 3: Dinámica reológica y ameboide */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Motilidad Ameboide y Celular</span>
              </label>
              <span className="text-cyan-300 font-mono font-bold">
                {movePercent}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={movePercent}
              onChange={(e) => setMovePercent(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              Controla la deformación elástica del eritrocito y la actividad
              citoplasmática intracelular.
            </p>
          </div>
        </div>

        {/* Selector de Regiones Anatómicas */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Regiones y estructuras representadas (toca para enfocar y ver
              diagnóstico):
            </span>
            {selectedRegionId && (
              <button
                type="button"
                onClick={handleViewFull}
                className="text-xs font-semibold text-cyan-300 hover:text-white"
              >
                Volver a vista general
              </button>
            )}
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              stageMeta.regions.length >= 5
                ? "lg:grid-cols-5"
                : stageMeta.regions.length === 4
                ? "lg:grid-cols-4"
                : "lg:grid-cols-3"
            } gap-2`}
          >
            {stageMeta.regions.map((reg, idx) => {
              const isActive = selectedRegionId === reg.id;
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => handleSelectRegion(reg.id)}
                  className={`text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 border ${
                    isActive
                      ? "bg-cyan-500/20 text-white border-cyan-400 font-bold shadow-sm"
                      : "bg-slate-950/70 hover:bg-slate-950 text-slate-300 border-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      style={{
                        backgroundColor: isWarmLightBg
                          ? reg.colorStain
                          : reg.colorBio,
                      }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    />
                    <span className="truncate">
                      {idx + 1}. {reg.shortLabel}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {selectedRegion ? (
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                    {selectedRegion.badge}
                  </span>
                  <h5 className="text-sm font-bold text-white">
                    {selectedRegion.name}
                  </h5>
                  <span className="text-[11px] font-mono text-slate-400">
                    ({selectedRegion.scale})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleViewFull}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  {stageMeta.fullButtonLabel}
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {selectedRegion.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <strong className="text-rose-300">
                    Frotis con Giemsa / Correlación clínica:{" "}
                  </strong>
                  <span className="text-slate-300">
                    {selectedRegion.microscopyNote}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <strong className="text-cyan-300">
                    Reconstrucción educativa 3D:{" "}
                  </strong>
                  <span className="text-slate-300">
                    {selectedRegion.reconstruction3DNote}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-[11px]">
              <div className="lg:col-span-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 flex flex-col justify-between gap-2 text-slate-300">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{stageMeta.overviewSummary}</span>
                </div>
                <div className="text-slate-400 font-mono">
                  {stageMeta.dimensionsNote}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Claves de <em>{speciesData.scientificName}</em>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  {speciesData.keyTable.map(([k, v], i) => (
                    <React.Fragment key={i}>
                      <span className="text-slate-400">{k}</span>
                      <span
                        className={
                          i === 0
                            ? "text-cyan-300 font-semibold"
                            : i === 1
                            ? "text-amber-300 font-semibold"
                            : i === 2
                            ? "text-slate-200"
                            : "text-emerald-300 font-semibold"
                        }
                      >
                        {v}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Referencias documentales */}
        <div className="pt-2 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
          <div>
            <strong className="text-slate-300">Fuentes de referencia:</strong>{" "}
            CDC DPDx Malaria (
            <a
              href="https://www.cdc.gov/dpdx/malaria/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              cdc.gov/dpdx/malaria
            </a>
            ) · Guías Clínicas MINSAL / ISP Chile.
          </div>
          <div>
            {stages.map((s) => s.shortName).join(" · ")}
          </div>
        </div>
      </div>
    </div>
  );
}
