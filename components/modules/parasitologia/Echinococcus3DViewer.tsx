"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Microscope,
  Scissors,
  Sliders,
  Focus,
  Maximize2,
  Play,
  Pause,
  Lock,
  Unlock,
  Check,
  X,
  AlertTriangle,
  Activity,
} from "lucide-react";

export type EchinococcusStageId = "hydatid_cyst" | "adult" | "protoscolex" | "egg";
export type EchinococcusShaderMode = 0 | 1 | 2 | 3; // 0 = Biológico 3D, 1 = Tinción PAS / Carmín (fondo blanco cálido #faf7f2), 2 = SEM, 3 = Rayos X

export interface EchinococcusRegionMeta {
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

export interface EchinococcusStageMeta {
  id: EchinococcusStageId;
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
  hasPeristalsis: boolean;
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
  regions: EchinococcusRegionMeta[];
}

function smoothstepJS(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0.0, Math.min(1.0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3.0 - 2.0 * t);
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
  const len = Math.hypot(a[0], a[1], a[2]) || 1.0;
  return [a[0] / len, a[1] / len, a[2] / len];
}

/**
 * Curva espinal suave para el adulto diminuto de Echinococcus granulosus (2 a 7 mm, solo 3 proglótides)
 */
function evalEchinococcusSpineJS(x: number, time: number, waveScale: number): [number, number, number] {
  const u = Math.max(0.0, x - 1.4) / 10.6;
  const env = u * u * (3.0 - 2.0 * u);
  const amp = (0.25 + 0.55 * waveScale) * env;
  const px = x - 5.8;
  const py = amp * 0.55 * Math.sin(u * 4.2 - time * 1.4);
  const pz = amp * 0.72 * Math.cos(u * 3.6 - time * 1.1);
  return [px, py, pz];
}

function localToWorldAdultPoint(
  localXYZ: [number, number, number],
  time: number,
  waveScale: number
): [number, number, number] {
  const [x, y, z] = localXYZ;
  const eps = 0.025;
  const pC = evalEchinococcusSpineJS(x, time, waveScale);
  const pF = evalEchinococcusSpineJS(x + eps, time, waveScale);
  const pB = evalEchinococcusSpineJS(Math.max(0.0, x - eps), time, waveScale);
  const T = vec3Norm(vec3Sub(pF, pB));
  const B = vec3Norm(vec3Cross(T, [0.0, 1.0, 0.0]));
  const N = vec3Cross(B, T);
  return [
    pC[0] + y * N[0] + z * B[0],
    pC[1] + y * N[1] + z * B[1],
    pC[2] + y * N[2] + z * B[2],
  ];
}

/**
 * Superficie paramétrica del adulto de Echinococcus granulosus (longitud total x ∈ [0, 12.0]):
 * - x ∈ [0.0, 1.45]: Escólex piriforme armado (~0.3 mm) con rostelo apical y 4 ventosas acetabulares
 * - x ∈ [1.45, 2.35]: Cuello corto proliferativo
 * - x ∈ [2.35, 3.95]: 1.ª Proglótide (inmadura, corta) -> regionId = 3
 * - x ∈ [3.95, 6.55]: 2.ª Proglótide (madura hermafrodita con poro genital lateral) -> regionId = 4
 * - x ∈ [6.55, 12.0]: 3.ª Proglótide (grávida terminal, >50% del cuerpo, con útero sacular lobulado) -> regionId = 5
 */
function evaluateEchinococcusAdultSurface(x: number, phi: number) {
  let W = 0.35;
  let H = 0.35;
  let regionId = 2.0;
  let segU = 0.0;
  let segIndex = 0.0;

  if (x < 1.45) {
    regionId = 2.0;
    const cap = Math.pow(Math.sin(Math.min(1.0, x / 0.34) * (Math.PI * 0.5)), 0.72);
    const rostellum = 0.38 * cap * (1.0 - 0.22 * smoothstepJS(0.24, 0.38, x));
    const bulbBell = Math.exp(-Math.pow((x - 0.88) / 0.42, 2.0));
    let R =
      rostellum * (1.0 - smoothstepJS(0.26, 0.50, x)) +
      (0.28 + 0.52 * bulbBell) * smoothstepJS(0.18, 0.48, x);
    if (x > 1.15) {
      const tNeck = smoothstepJS(1.15, 1.45, x);
      R = R * (1.0 - tNeck) + 0.29 * tNeck;
    }

    const suckerAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    let suckerDisp = 0.0;
    for (let k = 0; k < 4; k++) {
      const dPhi = Math.atan2(Math.sin(phi - suckerAngles[k]), Math.cos(phi - suckerAngles[k]));
      const dxNorm = (x - 0.88) / 0.36;
      const dPhiNorm = dPhi / 0.52;
      const d = Math.hypot(dxNorm, dPhiNorm);
      if (d < 1.25) {
        const rim = 0.21 * Math.exp(-Math.pow((d - 0.75) / 0.22, 2.0));
        const cupT = Math.max(0.0, 1.0 - Math.pow(d / 0.64, 2.0));
        const cup = -0.27 * cupT * cupT;
        suckerDisp += rim + cup;
      }
    }
    R += suckerDisp;
    W = R;
    H = R * (1.0 - 0.22 * smoothstepJS(1.15, 1.45, x));
  } else if (x < 2.35) {
    // Cuello corto
    regionId = 3.0;
    segIndex = 0.0;
    segU = (x - 1.45) / 0.90;
    const flat = smoothstepJS(1.45, 2.35, x);
    W = 0.29 + 0.09 * flat;
    H = 0.23 * (1.0 - 0.25 * flat);
  } else {
    // Las 3 proglótides características de Echinococcus granulosus
    if (x < 3.95) {
      // 1.ª Proglótide: Inmadura
      regionId = 3.0;
      segIndex = 1.0;
      segU = (x - 2.35) / (3.95 - 2.35);
      W = 0.38 + 0.16 * segU;
      H = 0.18 + 0.04 * segU;
    } else if (x < 6.55) {
      // 2.ª Proglótide: Madura hermafrodita
      regionId = 4.0;
      segIndex = 2.0;
      segU = (x - 3.95) / (6.55 - 3.95);
      W = 0.54 + 0.26 * Math.sin(segU * Math.PI * 0.78);
      H = 0.22 + 0.05 * Math.sin(segU * Math.PI);
    } else {
      // 3.ª Proglótide: Grávida terminal (>50% de la longitud total, fusiforme y distendida)
      regionId = 5.0;
      segIndex = 3.0;
      segU = (x - 6.55) / (12.0 - 6.55);
      const belly = Math.sin(Math.pow(segU, 0.78) * Math.PI);
      const endCap = Math.pow(Math.sin(Math.min(1.0, (12.02 - x) / 0.65) * (Math.PI * 0.5)), 0.62);
      W = (0.72 + 0.42 * belly) * endCap;
      H = (0.25 + 0.14 * belly) * endCap;
    }

    // Surcos profundos intersegmentarios entre las 3 proglótides (en x = 2.35, 3.95 y 6.55)
    const distToGroove = Math.min(segU, 1.0 - segU);
    const isPosteriorTip = segIndex === 3.0 && segU > 0.85;
    if (!isPosteriorTip) {
      const groove = 1.0 - 0.24 * Math.exp(-Math.pow(distToGroove / 0.075, 2.0));
      W *= groove;
      H *= 1.0 - 0.16 * Math.exp(-Math.pow(distToGroove / 0.075, 2.0));
    }

    // Poro genital lateral prominente (en proglótide madura hacia +Z y grávida hacia -Z)
    const cPhi = Math.cos(phi);
    const sPhi = Math.sin(phi);
    if (segIndex === 2.0 || segIndex === 3.0) {
      const pSide = segIndex === 2.0 ? 1.0 : -1.0;
      const porePosU = segIndex === 2.0 ? 0.55 : 0.46;
      if (cPhi * pSide > 0.55) {
        const du = (segU - porePosU) / 0.10;
        const dy = sPhi / 0.35;
        const dp = Math.hypot(du, dy);
        if (dp < 1.25) {
          const papilla = 0.11 * Math.exp(-dp * dp * 1.8);
          const dimple = -0.05 * Math.exp(-dp * dp * 11.0);
          W += papilla + dimple;
        }
      }
    }
  }

  const flat = smoothstepJS(1.4, 2.6, x);
  const cPhi = Math.cos(phi);
  const sPhi = Math.sin(phi);
  const zDir = Math.sign(cPhi) * Math.pow(Math.abs(cPhi), 1.0 - 0.28 * flat);
  const yDir = Math.sign(sPhi) * Math.pow(Math.abs(sPhi), 1.0 - 0.14 * flat);

  return {
    pos: [x, H * yDir, W * zDir] as [number, number, number],
    regionId,
    segU,
    segV: cPhi,
    segIndex,
  };
}

/**
 * Añade una microesfera 3D (huevo embrionado intrauterino o folículo testicular/ovárico)
 * al BufferGeometry del adulto de Echinococcus granulosus
 */
function appendEchinococcusInternalSphere(
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
  metaZ: number,
  regionId: number,
  latBands = 8,
  lonBands = 10
) {
  const baseVertex = positions.length / 3;
  for (let lat = 0; lat <= latBands; lat++) {
    const v = lat / latBands;
    const theta = v * Math.PI;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    for (let lon = 0; lon <= lonBands; lon++) {
      const u = lon / lonBands;
      const phi = u * Math.PI * 2.0;
      const sinP = Math.sin(phi);
      const cosP = Math.cos(phi);

      const nx = sinT * cosP;
      const ny = cosT;
      const nz = sinT * sinP;

      positions.push(cx + rx * nx, cy + ry * ny, cz + rz * nz);
      const norm = vec3Norm([nx / rx, ny / ry, nz / rz]);
      normals.push(norm[0], norm[1], norm[2]);
      meta1.push(u, v, metaZ, regionId);
    }
  }

  const stride = lonBands + 1;
  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < lonBands; lon++) {
      const a = baseVertex + lat * stride + lon;
      const b = baseVertex + (lat + 1) * stride + lon;
      const c = baseVertex + (lat + 1) * stride + (lon + 1);
      const d = baseVertex + lat * stride + (lon + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }
}

/**
 * Construye la malla continua orgánica del adulto de Echinococcus granulosus (escólex armado con
 * doble corona de 32 ganchos rostelares, 4 ventosas acetabulares, estróbilo de 3 proglótides
 * y huevos embrionados 3D + órganos internos expuestos al activar el corte histológico)
 */
function buildEchinococcusAdultBufferGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const meta1: number[] = [];
  const indices: number[] = [];

  const xSamples: number[] = [];
  const nScolex = 75;
  const nBody = 185;
  for (let i = 0; i <= nScolex; i++) {
    xSamples.push((i / nScolex) * 1.5);
  }
  for (let i = 1; i <= nBody; i++) {
    const t = i / nBody;
    xSamples.push(1.5 + t * (12.0 - 1.5));
  }

  const nRings = xSamples.length;
  const nRadial = 60;

  for (let i = 0; i < nRings; i++) {
    const x = xSamples[i];
    const epsX = i < nScolex ? 0.007 : 0.02;
    const epsPhi = 0.025;

    for (let j = 0; j <= nRadial; j++) {
      const phi = (j / nRadial) * Math.PI * 2.0;
      const surf = evaluateEchinococcusAdultSurface(x, phi);

      const xPrev = Math.max(0.0005, x - epsX);
      const xNext = Math.min(11.999, x + epsX);
      const pX1 = evaluateEchinococcusAdultSurface(xNext, phi).pos;
      const pX0 = evaluateEchinococcusAdultSurface(xPrev, phi).pos;
      const pP1 = evaluateEchinococcusAdultSurface(x, phi + epsPhi).pos;
      const pP0 = evaluateEchinococcusAdultSurface(x, phi - epsPhi).pos;

      const dX = vec3Sub(pX1, pX0);
      const dP = vec3Sub(pP1, pP0);
      let N = vec3Norm(vec3Cross(dP, dX));
      if (x < 0.015) {
        N = vec3Norm([-1.0, surf.pos[1] * 2.0, surf.pos[2] * 2.0]);
      }

      positions.push(surf.pos[0], surf.pos[1], surf.pos[2]);
      normals.push(N[0], N[1], N[2]);
      meta1.push(surf.segU, surf.segV, surf.segIndex, surf.regionId);
    }
  }

  const ringStride = nRadial + 1;
  for (let i = 0; i < nRings - 1; i++) {
    for (let j = 0; j < nRadial; j++) {
      const a = i * ringStride + j;
      const b = (i + 1) * ringStride + j;
      const c = (i + 1) * ringStride + (j + 1);
      const d = i * ringStride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // Doble corona rostellar de 32 ganchos quitinosos falciformes (28–50 ganchos en E. granulosus)
  const totalHooks = 32;
  const hookSteps = 14;
  const hookSides = 10;

  for (let h = 0; h < totalHooks; h++) {
    const isLarge = h % 2 === 0;
    const angle = (h / totalHooks) * Math.PI * 2.0;
    const cA = Math.cos(angle);
    const sA = Math.sin(angle);

    const baseX = isLarge ? 0.17 : 0.25;
    const baseR = isLarge ? 0.31 : 0.35;
    const hookLen = isLarge ? 0.21 : 0.155;
    const baseThick = isLarge ? 0.023 : 0.019;

    const baseVertexOffset = positions.length / 3;

    const hookCenter = (t: number): [number, number, number] => {
      const x = baseX + hookLen * (0.85 * t - 0.18 * Math.sin(t * Math.PI));
      const r =
        baseR +
        hookLen * (0.72 * Math.sin(t * Math.PI * 0.78) + 0.18 * t - 0.22 * Math.pow(t, 3.2));
      return [x, r * sA, r * cA];
    };

    for (let i = 0; i <= hookSteps; i++) {
      const t = i / hookSteps;
      const pC = hookCenter(t);
      const pNext = hookCenter(Math.min(1.0, t + 0.02));
      const pPrev = hookCenter(Math.max(0.0, t - 0.02));
      const T = vec3Norm(vec3Sub(pNext, pPrev));

      const radialDir = [0.0, sA, cA];
      const B = vec3Norm(vec3Cross(T, radialDir));
      const N = vec3Cross(B, T);

      const guardBulge = 1.0 + 0.48 * Math.exp(-Math.pow((t - 0.30) / 0.14, 2.0));
      const taper = Math.pow(1.0 - t, 0.75);
      const rad = baseThick * guardBulge * taper + 0.0015;

      for (let j = 0; j <= hookSides; j++) {
        const theta = (j / hookSides) * Math.PI * 2.0;
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        const nVec = [
          ct * N[0] + st * 0.72 * B[0],
          ct * N[1] + st * 0.72 * B[1],
          ct * N[2] + st * 0.72 * B[2],
        ];
        const normVec = vec3Norm(nVec);
        positions.push(pC[0] + rad * nVec[0], pC[1] + rad * nVec[1], pC[2] + rad * nVec[2]);
        normals.push(normVec[0], normVec[1], normVec[2]);
        meta1.push(t, isLarge ? 1.0 : 0.0, h, 1.0);
      }
    }

    const hStride = hookSides + 1;
    for (let i = 0; i < hookSteps; i++) {
      for (let j = 0; j < hookSides; j++) {
        const a = baseVertexOffset + i * hStride + j;
        const b = baseVertexOffset + (i + 1) * hStride + j;
        const c = baseVertexOffset + (i + 1) * hStride + (j + 1);
        const d = baseVertexOffset + i * hStride + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
  }

  // --- ÓRGANOS REPRODUCTORES 3D EN LA 2.ª PROGLÓTIDE (MADURA, x: 3.95 -> 6.55, regionId = 7.0) ---
  // 1. Ovario en herradura bilobulado + glándula vitelógena + bolsa del cirro (metaZ = 1.0)
  for (let k = 0; k < 14; k++) {
    const tLobe = (k / 13.0) * 2.0 - 1.0;
    const uOv = 0.65 - 0.06 * (1.0 - tLobe * tLobe);
    const xOv = 3.95 + uOv * (6.55 - 3.95);
    const zOv = tLobe * 0.22;
    const yOv = -0.015 + 0.015 * Math.cos(k * 1.9);
    appendEchinococcusInternalSphere(
      positions,
      normals,
      meta1,
      indices,
      xOv,
      yOv,
      zOv,
      0.052,
      0.040,
      0.048,
      1.0,
      7.0,
      7,
      9
    );
  }
  // Glándula vitelógena posterior compacta
  for (let k = 0; k < 5; k++) {
    const xVit = 3.95 + 0.82 * (6.55 - 3.95) + (k - 2) * 0.03;
    const zVit = (k - 2) * 0.045;
    appendEchinococcusInternalSphere(
      positions,
      normals,
      meta1,
      indices,
      xVit,
      -0.01,
      zVit,
      0.048,
      0.038,
      0.045,
      1.0,
      7.0,
      7,
      9
    );
  }
  // 2. Folículos testiculares 3D (38–42 testículos en campos anterior y posterior, metaZ = 0.0)
  let testisSeed = 1;
  for (let ix = 0; ix < 8; ix++) {
    for (let iz = 0; iz < 6; iz++) {
      testisSeed = (testisSeed * 1664525 + 1013904223) >>> 0;
      const r1 = (testisSeed & 0xffff) / 0xffff;
      const r2 = ((testisSeed >>> 16) & 0xffff) / 0xffff;
      const uT = 0.14 + ((ix + 0.25 + 0.5 * r1) / 8.0) * 0.72;
      const vT = -0.58 + ((iz + 0.2 + 0.6 * r2) / 6.0) * 1.16;
      // Dejar espacio central para el ovario
      if (uT > 0.54 && uT < 0.76 && Math.abs(vT) < 0.30) continue;
      const xT = 3.95 + uT * (6.55 - 3.95);
      const wLocal = 0.54 + 0.26 * Math.sin(uT * Math.PI * 0.78);
      const zT = vT * wLocal * 0.78;
      const yT = -0.025 + (r1 - 0.5) * 0.06;
      appendEchinococcusInternalSphere(
        positions,
        normals,
        meta1,
        indices,
        xT,
        yT,
        zT,
        0.040,
        0.034,
        0.040,
        0.0,
        7.0,
        6,
        8
      );
    }
  }

  // --- HUEVOS EMBRIONADOS 3D EN EL INTERIOR DE LA 3.ª PROGLÓTIDE (GRÁVIDA, x: 6.55 -> 12.0, regionId = 6.0) ---
  // Distribuidos a lo largo del saco uterino central y sus 12 divertículos laterales a cada lado
  const nDiverticula = 12;
  let eggIdx = 0;

  for (let d = 0; d < nDiverticula; d++) {
    const uDiv = 0.11 + (d / (nDiverticula - 1)) * 0.77;
    const xBase = 6.55 + uDiv * (12.0 - 6.55);

    const belly = Math.sin(Math.pow(uDiv, 0.78) * Math.PI);
    const endCap = Math.pow(Math.sin(Math.min(1.0, (12.02 - xBase) / 0.65) * (Math.PI * 0.5)), 0.62);
    const distToGroove = Math.min(uDiv, 1.0 - uDiv);
    const groove = uDiv > 0.85 ? 1.0 : 1.0 - 0.24 * Math.exp(-Math.pow(distToGroove / 0.075, 2.0));
    const W = (0.72 + 0.42 * belly) * endCap * groove;
    const H =
      (0.25 + 0.14 * belly) *
      endCap *
      (uDiv > 0.85 ? 1.0 : 1.0 - 0.16 * Math.exp(-Math.pow(distToGroove / 0.075, 2.0)));

    // A. Huevos en el tronco uterino sacular central (2 capas dorsoventrales)
    const stemOffsets: Array<[number, number, number]> = [
      [-0.08, 0.035, -0.05],
      [0.0, 0.045, 0.04],
      [0.08, 0.025, -0.02],
      [-0.05, -0.045, 0.06],
      [0.05, -0.050, -0.06],
      [0.14, 0.015, 0.02],
    ];
    for (let s = 0; s < stemOffsets.length; s++) {
      const [dx, yFrac, zFrac] = stemOffsets[s];
      const rEgg = 0.056 + 0.008 * Math.sin(eggIdx * 1.7);
      appendEchinococcusInternalSphere(
        positions,
        normals,
        meta1,
        indices,
        xBase + dx,
        yFrac * H * 1.8,
        zFrac * W,
        rEgg,
        rEgg * 0.94,
        rEgg,
        eggIdx++,
        6.0,
        8,
        10
      );
    }

    // B. Huevos rellenando los divertículos o sacos uterinos laterales (+Z y -Z)
    for (const sideSign of [-1.0, 1.0]) {
      const pouchReach = 0.48 + 0.10 * Math.sin(d * 2.3 + sideSign * 1.1);
      const nEggsInPouch = 7;
      for (let e = 0; e < nEggsInPouch; e++) {
        const tPouch = (e + 0.5) / nEggsInPouch;
        const vPos = sideSign * (0.14 + tPouch * (pouchReach - 0.12));
        const xJitter = Math.sin(eggIdx * 2.7 + e) * 0.065;
        const yLayer = (e % 2 === 0 ? 0.24 : -0.22) + 0.08 * Math.cos(eggIdx * 1.9);
        const rEgg = (0.054 + 0.009 * Math.cos(eggIdx * 3.1)) * (1.0 - 0.14 * tPouch);

        appendEchinococcusInternalSphere(
          positions,
          normals,
          meta1,
          indices,
          xBase + xJitter,
          yLayer * H,
          vPos * W,
          rEgg,
          rEgg * 0.94,
          rEgg,
          eggIdx++,
          6.0,
          8,
          10
        );
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("a_meta", new THREE.Float32BufferAttribute(meta1, 4));
  geo.setIndex(indices);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 18.0);
  return geo;
}

/**
 * Gancho falciforme en forma de daga/hoz de Echinococcus granulosus (con hoja curva, mango y guarda)
 */
function buildHydatidHookGeometry(length = 0.48, baseRadius = 0.042): THREE.BufferGeometry {
  const curvePts = [
    new THREE.Vector3(0, -length * 0.5, 0),
    new THREE.Vector3(0.04 * length, -length * 0.10, 0),
    new THREE.Vector3(0.13 * length, length * 0.16, 0),
    new THREE.Vector3(0.02 * length, length * 0.42, 0),
    new THREE.Vector3(-0.20 * length, length * 0.52, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(curvePts);
  const segs = 28;
  const radSegs = 12;
  const frames = curve.computeFrenetFrames(segs, false);

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const pt = curve.getPointAt(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const guard = 1.0 + 0.62 * Math.exp(-Math.pow((u - 0.44) / 0.13, 2.0));
    const r = baseRadius * guard * Math.sin(Math.PI * Math.pow(u, 0.68)) + 0.002;

    for (let j = 0; j <= radSegs; j++) {
      const v = j / radSegs;
      const phi = v * Math.PI * 2.0;
      const nx = Math.cos(phi) * N.x + Math.sin(phi) * 0.74 * B.x;
      const ny = Math.cos(phi) * N.y + Math.sin(phi) * 0.74 * B.y;
      const nz = Math.cos(phi) * N.z + Math.sin(phi) * 0.74 * B.z;
      const nLen = Math.hypot(nx, ny, nz) || 1.0;

      positions.push(pt.x + r * nx, pt.y + r * ny, pt.z + r * nz);
      normals.push(nx / nLen, ny / nLen, nz / nLen);
      uvs.push(u, v);
    }
  }

  const stride = radSegs + 1;
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radSegs; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

/**
 * ---------------------------------------------------------------------------
 * SHADERS GLSL DE ECHINOCOCCUS GRANULOSUS SENSU LATO
 * ---------------------------------------------------------------------------
 */

const ECHINOCOCCUS_ADULT_VERTEX_SHADER = `
  precision highp float;

  attribute vec4 a_meta;

  uniform float u_time;
  uniform float u_waveScale;

  varying vec3 v_worldPos;
  varying vec3 v_worldNormal;
  varying vec3 v_localPos;
  varying vec4 v_meta;

  vec3 evalSpine(float x, float t, float waveScale) {
    float u = max(0.0, x - 1.4) / 10.6;
    float env = u * u * (3.0 - 2.0 * u);
    float amp = (0.25 + 0.55 * waveScale) * env;
    float px = x - 5.8;
    float py = amp * 0.55 * sin(u * 4.2 - t * 1.4);
    float pz = amp * 0.72 * cos(u * 3.6 - t * 1.1);
    return vec3(px, py, pz);
  }

  void main() {
    float x = position.x;
    float eps = 0.025;
    vec3 pC = evalSpine(x, u_time, u_waveScale);
    vec3 pF = evalSpine(x + eps, u_time, u_waveScale);
    vec3 pB = evalSpine(max(0.0, x - eps), u_time, u_waveScale);

    vec3 T = normalize(pF - pB);
    vec3 B = normalize(cross(T, vec3(0.0, 1.0, 0.0)));
    vec3 N = cross(B, T);

    vec3 worldPos = pC + position.y * N + position.z * B;
    vec3 worldNormal = normalize(normal.x * T + normal.y * N + normal.z * B);

    v_worldPos = worldPos;
    v_worldNormal = worldNormal;
    v_localPos = position;
    v_meta = a_meta;

    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
  }
`;

const ECHINOCOCCUS_ADULT_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;
  varying vec3 v_worldNormal;
  varying vec3 v_localPos;
  varying vec4 v_meta;

  uniform float u_translucency;
  uniform float u_cutPlane;
  uniform int u_shaderMode;
  uniform int u_highlightRegion;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  vec3 computeAdultInternalOrgans(float segU, float segV, float segIdx, float regionId) {
    if (regionId < 2.5) return vec3(0.0);

    // Canales osmorreguladores laterales longitudinales
    float canal = exp(-pow((abs(segV) - 0.78) / 0.035, 2.0));

    float primaryOrgan = 0.0;
    float secondaryOrgan = 0.0;

    if (segIdx > 0.5 && segIdx < 1.5) {
      // 1.ª Proglótide (inmadura): primordio genital medial
      float streak = exp(-pow(segV / 0.14, 2.0)) * smoothstep(0.18, 0.38, segU) * smoothstep(0.85, 0.65, segU);
      primaryOrgan = 0.45 * streak;
    } else if (segIdx > 1.5 && segIdx < 2.5) {
      // 2.ª Proglótide (madura hermafrodita): ovario en herradura/bilobulado, vitelario, bolsa del cirro y 35–50 testículos
      vec2 pOv = vec2((segU - 0.66) / 0.12, (abs(segV) - 0.24) / 0.17);
      float ovary = exp(-dot(pOv, pOv) * 1.6);
      vec2 pIsthmus = vec2((segU - 0.68) / 0.06, segV / 0.22);
      ovary = max(ovary, 0.85 * exp(-dot(pIsthmus, pIsthmus) * 1.8));

      vec2 pVit = vec2((segU - 0.83) / 0.055, segV / 0.20);
      float vitellaria = exp(-dot(pVit, pVit) * 2.0);

      // Conducto genital y saco del cirro hacia el poro lateral (+Z)
      float inPoreSide = step(0.0, segV) * step(abs(segV), 0.98);
      float ductU = 0.55 + 0.10 * exp(-pow(segV / 0.35, 2.0));
      float cirrusSac = inPoreSide * exp(-pow((segU - ductU) / 0.038, 2.0));

      primaryOrgan = clamp(ovary + 0.9 * vitellaria + 0.88 * cirrusSac, 0.0, 1.0);

      // 35–50 folículos testiculares grandes distribuidos anterior y posteriormente
      if (abs(segV) < 0.70 && segU > 0.12 && segU < 0.86) {
        vec2 gridUV = vec2(segU * 11.0, segV * 9.0);
        vec2 cellId = floor(gridUV);
        vec2 cellF = fract(gridUV) - 0.5;
        float h = hash21(cellId + 19.3);
        if (h > 0.30 && ovary < 0.35) {
          vec2 jitter = vec2(fract(h * 13.7) - 0.5, fract(h * 29.3) - 0.5) * 0.38;
          float dDot = length(cellF - jitter);
          secondaryOrgan = smoothstep(0.32, 0.12, dDot) * 0.82;
        }
      }
    } else if (segIdx > 2.5) {
      // 3.ª Proglótide (grávida terminal): útero sacular central con 12–15 evaginaciones/divertículos laterales cortos
      float stemMask = smoothstep(0.07, 0.14, segU) * smoothstep(0.93, 0.85, segU);
      float saccularStem = exp(-pow(segV / 0.18, 2.0)) * stemMask;

      float diverticula = 0.0;
      float vAbs = abs(segV);
      float sideSign = sign(segV);
      if (vAbs < 0.72 && segU > 0.09 && segU < 0.91) {
        float nDiv = 12.0;
        float divCoord = (segU - 0.10) / 0.80 * nDiv;
        float dIdx = floor(divCoord);
        float dFrac = fract(divCoord) - 0.5;
        if (dIdx >= 0.0 && dIdx < nDiv) {
          float pouchReach = 0.48 + 0.12 * sin(dIdx * 2.3 + sideSign * 1.1);
          float reachMask = smoothstep(pouchReach, pouchReach - 0.12, vAbs) * smoothstep(0.06, 0.15, vAbs);
          float width = 0.24;
          diverticula = exp(-pow(dFrac / width, 2.0)) * reachMask;
        }
      }

      float eggGranules = 0.76 + 0.24 * sin(segU * 110.0) * cos(segV * 95.0);
      primaryOrgan = clamp(max(saccularStem, diverticula) * eggGranules, 0.0, 1.0);

      // Poro genital lateral remanente (-Z)
      float inPoreSide = step(0.0, -segV) * step(abs(segV), 0.98);
      secondaryOrgan = inPoreSide * exp(-pow((segU - 0.46) / 0.025, 2.0)) * 0.55;
    }

    return vec3(primaryOrgan, secondaryOrgan, canal);
  }

  void main() {
    int rId = int(v_meta.w + 0.5);

    // Los huevos embrionados 3D internos (rId == 6) y órganos maduros 3D (rId == 7)
    // se revelan específicamente al activar el Corte Histológico / Sección 3D (u_cutPlane > 0.01).
    if (u_cutPlane <= 0.01 && rId >= 6) {
      discard;
    }

    // Al activar el corte histológico, seccionamos la pared dorsal de las proglótides (rId >= 2 && rId <= 5)
    // preservando la cubeta ventral para que los huevos embrionados 3D (rId == 6) y órganos (rId == 7) se vean en su interior.
    if (u_cutPlane > 0.01 && rId >= 2 && rId <= 5) {
      float cutThreshold = mix(0.36, -0.05, clamp(u_cutPlane, 0.0, 1.0));
      if (v_localPos.y > cutThreshold) discard;
    }

    vec3 N = normalize(v_worldNormal);
    vec3 V = normalize(cameraPosition - v_worldPos);
    bool isBackFace = !gl_FrontFacing;
    if (isBackFace) N = -N;

    vec3 L1 = normalize(vec3(-0.45, 0.75, 0.55));
    vec3 L2 = normalize(vec3(0.65, -0.35, -0.65));
    vec3 H1 = normalize(L1 + V);

    float diff1 = max(0.0, dot(N, L1));
    float wrap1 = max(0.0, (dot(N, L1) + 0.55) / 1.55);
    float diff2 = max(0.0, dot(N, L2));
    float ndotv = max(0.0, dot(N, V));
    float fresnel = pow(1.0 - ndotv, 3.0);
    float spec = pow(max(0.0, dot(N, H1)), 48.0);

    vec3 color = vec3(0.0);

    if (rId == 6) {
      // --- HUEVOS EMBRIONADOS 3D EN EL INTERIOR DEL ÚTERO SACULAR GRÁVIDO ---
      // v_meta.xy contiene las coordenadas esféricas locales (u, v) de cada huevo para renderizar su embrióforo radiado
      float radialBlocks = sin(v_meta.x * 52.0) * sin(v_meta.y * 52.0);
      float blockMask = smoothstep(-0.35, 0.55, radialBlocks);
      float innerOncosphere = pow(ndotv, 1.85);

      if (u_shaderMode == 0) {
        vec3 keratinDark  = vec3(0.42, 0.19, 0.05);
        vec3 keratinLight = vec3(0.84, 0.54, 0.18);
        vec3 shellCol = mix(keratinDark, keratinLight, 0.35 + 0.65 * blockMask);
        vec3 oncGlow  = vec3(0.97, 0.89, 0.68) * innerOncosphere * 0.28;
        color = shellCol * (0.28 + 0.62 * wrap1 + 0.18 * diff2) + oncGlow + vec3(1.0, 0.92, 0.72) * spec * 0.65 + vec3(0.95, 0.72, 0.32) * fresnel * 0.35;
      } else if (u_shaderMode == 1) {
        vec3 carmineDark  = vec3(0.38, 0.08, 0.14);
        vec3 carmineLight = vec3(0.76, 0.24, 0.32);
        vec3 shellStain = mix(carmineDark, carmineLight, 0.35 + 0.65 * blockMask);
        color = shellStain * (0.45 + 0.48 * wrap1 + 0.14 * diff2) + vec3(0.98, 0.80, 0.86) * spec * 0.45;
      } else if (u_shaderMode == 2) {
        float lum = (0.20 + 0.64 * pow(1.0 - ndotv, 1.6) + 0.26 * wrap1) * (0.76 + 0.24 * blockMask);
        color = vec3(lum * 0.95, lum * 0.97, lum * 1.02) + vec3(0.28) * spec;
      } else {
        color = vec3(0.22, 0.96, 0.68) * (0.40 + 0.70 * fresnel) * (0.70 + 0.30 * blockMask) + vec3(0.7, 1.0, 0.9) * spec * 0.5;
      }

      if (u_highlightRegion == 5) {
        color += vec3(0.12, 0.24, 0.32) * (0.45 + 0.55 * fresnel);
      }
      color = color / (1.0 + color * 0.18);
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    if (rId == 7) {
      // --- ÓRGANOS REPRODUCTORES 3D INTERNOS DE LA 2.ª PROGLÓTIDE MADURA (Ovario en herradura y testículos) ---
      bool isOvaryOrVit = v_meta.z > 0.5;
      float gran = 0.86 + 0.14 * sin(v_meta.x * 28.0) * cos(v_meta.y * 28.0);
      if (u_shaderMode == 0) {
        vec3 orgCol = isOvaryOrVit ? vec3(0.84, 0.32, 0.48) : vec3(0.78, 0.56, 0.36);
        color = (orgCol * gran) * (0.30 + 0.60 * wrap1 + 0.18 * diff2) + vec3(1.0, 0.92, 0.90) * spec * 0.45 + orgCol * fresnel * 0.25;
      } else if (u_shaderMode == 1) {
        vec3 stCol = isOvaryOrVit ? vec3(0.62, 0.08, 0.28) : vec3(0.76, 0.22, 0.40);
        color = (stCol * gran) * (0.48 + 0.46 * wrap1) + vec3(0.98, 0.84, 0.90) * spec * 0.35;
      } else if (u_shaderMode == 2) {
        float lum = (0.22 + 0.62 * pow(1.0 - ndotv, 1.6) + 0.24 * wrap1) * gran;
        color = vec3(lum);
      } else {
        vec3 rxCol = isOvaryOrVit ? vec3(0.98, 0.36, 0.72) : vec3(0.38, 0.82, 1.0);
        color = rxCol * (0.42 + 0.65 * fresnel);
      }

      if (u_highlightRegion == 4) {
        color += vec3(0.12, 0.24, 0.32) * (0.45 + 0.55 * fresnel);
      }
      color = color / (1.0 + color * 0.18);
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    float microTex = sin(v_localPos.x * 45.0) * cos(v_meta.y * 35.0) * 0.025;
    vec3 anatomy = computeAdultInternalOrgans(v_meta.x, v_meta.y, v_meta.z, v_meta.w);
    float organPrimary = anatomy.x;
    float organSecondary = anatomy.y;
    float canal = anatomy.z;

    float internalVis = clamp(u_translucency + (isBackFace ? 0.65 : 0.0), 0.0, 1.0);

    if (u_shaderMode == 0) {
      if (rId == 1) {
        float hookTip = v_meta.x;
        vec3 hookBaseCol = mix(vec3(0.86, 0.76, 0.56), vec3(0.98, 0.94, 0.84), hookTip);
        color = hookBaseCol * (0.25 + 0.75 * wrap1) + vec3(1.0, 0.96, 0.88) * pow(spec, 0.8) * 0.95 + vec3(0.45, 0.35, 0.2) * fresnel;
      } else {
        vec3 surfaceIvory = (isBackFace ? vec3(0.85, 0.78, 0.70) : vec3(0.93, 0.89, 0.81)) + microTex;
        vec3 sssWarm = vec3(0.88, 0.58, 0.52);

        if (rId == 2 && v_localPos.x > 0.45 && v_localPos.x < 1.25) {
          float radialR = length(v_localPos.yz);
          float cupDepth = clamp((0.78 - radialR) * 2.2, 0.0, 1.0);
          surfaceIvory = mix(surfaceIvory, vec3(0.76, 0.62, 0.58), cupDepth * 0.75);
        }

        vec3 organCol = (rId == 5) ? vec3(0.56, 0.22, 0.28) : vec3(0.74, 0.26, 0.40);
        vec3 secCol = vec3(0.68, 0.46, 0.30);
        vec3 canalCol = vec3(0.75, 0.85, 0.88);

        vec3 baseBio = surfaceIvory;
        baseBio = mix(baseBio, secCol, organSecondary * internalVis * 0.78);
        baseBio = mix(baseBio, canalCol, canal * internalVis * 0.55);
        baseBio = mix(baseBio, organCol, organPrimary * internalVis * 0.88);

        vec3 lit = baseBio * (0.22 + 0.62 * diff1 + 0.25 * diff2) + sssWarm * (wrap1 * 0.28 * (1.0 - diff1 * 0.5));
        color = lit + vec3(1.0, 0.98, 0.95) * spec * 0.55 + vec3(0.65, 0.78, 0.88) * fresnel * 0.28;
      }
    } else if (u_shaderMode == 1) {
      // Tinción Carmín sobre fondo blanco cálido (#faf7f2)
      if (rId == 1) {
        color = vec3(0.65, 0.12, 0.28) * (0.4 + 0.6 * wrap1) + vec3(1.0, 0.8, 0.88) * spec * 0.7;
      } else {
        vec3 slideBg = isBackFace ? vec3(0.92, 0.72, 0.79) : vec3(0.95, 0.78, 0.84);
        vec3 stainDeep = vec3(0.52, 0.04, 0.20);
        vec3 stainMid = vec3(0.76, 0.14, 0.35);

        float density = 0.22 + 0.45 * fresnel;
        density += organPrimary * (0.45 + 0.50 * internalVis);
        density += organSecondary * (0.32 + 0.40 * internalVis);
        density += canal * 0.25 * internalVis;

        vec3 stained = mix(slideBg, stainMid, clamp(density, 0.0, 1.0));
        stained = mix(stained, stainDeep, clamp(organPrimary * (0.5 + 0.5 * internalVis), 0.0, 1.0));
        color = stained * (0.55 + 0.45 * wrap1) + vec3(1.0, 0.85, 0.92) * spec * 0.35;
      }
    } else if (u_shaderMode == 2) {
      float semEdge = pow(1.0 - max(0.0, dot(N, V)), 1.65);
      float semDiff = 0.25 * diff1 + 0.18 * diff2;
      float semMicro = 1.0 + sin(v_localPos.x * 80.0) * cos(v_meta.y * 60.0) * 0.06;
      float lum = (0.14 + 0.72 * semEdge + semDiff) * semMicro;
      lum += (organPrimary * 0.25 + canal * 0.15) * u_translucency;
      color = vec3(lum * 0.94, lum * 0.96, lum * 1.02) + vec3(0.25) * spec;
    } else {
      if (rId == 1) {
        color = vec3(0.95, 0.35, 0.75) * (0.5 + 0.8 * fresnel) + vec3(1.0) * spec;
      } else {
        vec3 rimGlow = vec3(0.08, 0.55, 0.85) * fresnel * 1.35;
        vec3 baseDark = vec3(0.03, 0.10, 0.18) * (0.4 + 0.6 * wrap1);
        vec3 organGlow = (rId == 5)
          ? vec3(0.15, 0.95, 0.65) * organPrimary * (0.65 + 0.55 * internalVis)
          : vec3(0.98, 0.32, 0.68) * organPrimary * (0.65 + 0.55 * internalVis);
        vec3 secGlow = vec3(0.35, 0.75, 1.0) * (organSecondary * 0.7 + canal * 0.6) * (0.5 + 0.5 * internalVis);
        color = baseDark + rimGlow + organGlow + secGlow + vec3(0.5, 0.9, 1.0) * spec * 0.4;
      }
    }

    if (u_highlightRegion > 0 && rId == u_highlightRegion) {
      color += vec3(0.08, 0.22, 0.32) * (0.4 + 0.6 * fresnel);
    }

    color = color / (1.0 + color * 0.18);
    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Shader multipropósito para el Quiste Hidatídico Unilocular, el Protoescólex + Arena Hidatídica y el Huevo Embrionado
 */
const ECHINOCOCCUS_STAGE_VERTEX_SHADER = `
  varying vec3 v_worldPos;
  varying vec3 v_localPos;
  varying vec3 v_worldNormal;
  varying vec2 v_uv;

  void main() {
    v_uv = uv;
    v_localPos = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    v_worldPos = wp.xyz;
    v_worldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const ECHINOCOCCUS_STAGE_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;
  varying vec3 v_localPos;
  varying vec3 v_worldNormal;
  varying vec2 v_uv;

  uniform int u_partId;
  // 30 = Periquística / Adventicia fibrosa del hospedador
  // 31 = Capa laminar acelular (cuticular blanca nacarada / PAS+ intensa)
  // 32 = Capa germinativa (prolígera sincitial)
  // 33 = Vesículas prolígeras (brood capsules) y vesículas hijas endógenas
  // 34 = Arena hidatídica y protoescólices internos
  // 40 = Cuerpo del protoescólex invaginado
  // 41 = Corpúsculos calcáreos refringentes
  // 10 = Embrióforo estriado radial externo (huevo)
  // 11 = Oncosfera hexacanta (huevo)
  // 12 = Ganchos quitinosos falciformes (protoescólex / huevo)
  uniform int u_shaderMode;
  uniform float u_translucency;
  uniform float u_cutZ;
  uniform int u_highlight;

  void main() {
    // Las estructuras internas (protoescólices, arena hidatídica, ganchos y oncosfera)
    // permanecen visibles al cortar las membranas envolventes externas para poder inspeccionar el interior.
    bool isOuterShell = (u_partId == 30 || u_partId == 31 || u_partId == 32 || u_partId == 10 || u_partId == 40);
    if (isOuterShell && v_worldPos.z > u_cutZ) {
      discard;
    }
    // Al profundizar el corte histológico en el quiste hidatídico, abrimos también una ventana anterior
    // en las vesículas prolígeras / hijas (u_partId == 33) para ver directamente los protoescólices anidados dentro.
    if (u_partId == 33 && u_cutZ < 0.45 && v_localPos.z > 0.08) {
      discard;
    }

    vec3 N = normalize(v_worldNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - v_worldPos);

    vec3 L1 = normalize(vec3(-0.42, 0.76, 0.52));
    vec3 L2 = normalize(vec3(0.62, -0.32, 0.55));
    vec3 H1 = normalize(L1 + V);

    float wrap1 = max(0.0, (dot(N, L1) + 0.52) / 1.52);
    float diff2 = max(0.0, dot(N, L2));
    float ndotv = max(0.0, dot(N, V));
    float fresnel = pow(1.0 - ndotv, 2.25);
    float spec = pow(max(0.0, dot(N, H1)), 32.0) * 0.28;

    vec3 color = vec3(0.0);
    float alpha = 1.0;

    if (u_partId == 30) {
      // --- CAPA PERIQUÍSTICA / ADVENTICIA FIBROSA (REACCIÓN DEL HOSPEDADOR) ---
      float fibers = 0.86 + 0.14 * sin(v_localPos.x * 16.0 + v_localPos.y * 12.0) * cos(v_localPos.z * 14.0);
      float baseOp = clamp(0.92 - u_translucency * 0.76, 0.14, 0.94);
      if (u_shaderMode == 0) {
        vec3 advCore = vec3(0.68, 0.32, 0.30) * fibers;
        vec3 advRim  = vec3(0.84, 0.48, 0.44);
        color = mix(advCore, advRim, fresnel * 0.55) * (0.30 + 0.58 * wrap1 + 0.16 * diff2) + spec * 0.25;
      } else if (u_shaderMode == 1) {
        // Tinción H&E / PAS: colágeno fibroso rosado-violáceo pálido
        vec3 heAdv = vec3(0.86, 0.64, 0.74) * fibers;
        color = mix(heAdv, vec3(0.68, 0.38, 0.52), fresnel * 0.5) * (0.50 + 0.44 * wrap1);
      } else if (u_shaderMode == 2) {
        float lum = (0.18 + 0.64 * fresnel + 0.24 * wrap1) * fibers;
        color = vec3(lum * 0.94, lum * 0.96, lum * 1.02);
      } else {
        color = vec3(0.10, 0.50, 0.82) * (0.28 + 0.72 * fresnel);
      }
      alpha = clamp(baseOp * (0.42 + 0.58 * fresnel), 0.10, 0.94);

    } else if (u_partId == 31) {
      // --- CAPA LAMINAR ACELULAR (CUTICULAR BLANCA NACARADA / PAS-POSITIVA CON LAMINACIONES CONCÉNTRICAS) ---
      float rLen = length(v_localPos);
      float lamellae = 0.85 + 0.15 * sin(rLen * 85.0 + v_uv.y * 40.0);
      float baseOp = clamp(0.94 - u_translucency * 0.74, 0.16, 0.96);
      if (u_shaderMode == 0) {
        vec3 pearlWhite = vec3(0.95, 0.96, 0.98) * lamellae;
        vec3 pearlBlue  = vec3(0.76, 0.88, 0.96);
        color = mix(pearlWhite, pearlBlue, fresnel * 0.6) * (0.36 + 0.54 * wrap1 + 0.18 * diff2) + spec * 0.65;
      } else if (u_shaderMode == 1) {
        // En tinción PAS, la membrana laminar acelular rica en mucopolisacáridos tiñe de MAGENTA INTENSO patognomónico
        vec3 pasMagenta = vec3(0.82, 0.10, 0.48) * lamellae;
        vec3 pasDeep    = vec3(0.58, 0.04, 0.34);
        color = mix(pasMagenta, pasDeep, fresnel * 0.55) * (0.48 + 0.46 * wrap1) + spec * 0.4;
      } else if (u_shaderMode == 2) {
        float lum = (0.24 + 0.62 * fresnel + 0.24 * wrap1) * lamellae;
        color = vec3(lum);
      } else {
        color = vec3(0.22, 0.88, 0.96) * (0.35 + 0.75 * fresnel) * lamellae;
      }
      alpha = clamp(baseOp * (0.48 + 0.52 * fresnel), 0.14, 0.96);

    } else if (u_partId == 32) {
      // --- CAPA GERMINATIVA (MEMBRANA PROLÍGERA SINCITIAL NUCLEADA) ---
      float nucleiDots = smoothstep(0.45, 0.85, sin(v_localPos.x * 32.0) * cos(v_localPos.y * 32.0) * sin(v_localPos.z * 32.0));
      float baseOp = clamp(0.90 - u_translucency * 0.68, 0.18, 0.92);
      if (u_shaderMode == 0) {
        vec3 germBase = mix(vec3(0.92, 0.78, 0.46), vec3(0.82, 0.52, 0.22), nucleiDots * 0.6);
        color = germBase * (0.32 + 0.56 * wrap1 + 0.18 * diff2) + spec * 0.35;
      } else if (u_shaderMode == 1) {
        vec3 germStain = mix(vec3(0.68, 0.24, 0.54), vec3(0.38, 0.08, 0.36), nucleiDots * 0.75);
        color = germStain * (0.48 + 0.46 * wrap1);
      } else if (u_shaderMode == 2) {
        float lum = 0.22 + 0.62 * fresnel + 0.22 * wrap1 + nucleiDots * 0.12;
        color = vec3(lum);
      } else {
        color = vec3(0.96, 0.76, 0.24) * (0.35 + 0.65 * fresnel);
      }
      alpha = clamp(baseOp * (0.45 + 0.55 * fresnel), 0.16, 0.92);

    } else if (u_partId == 33) {
      // --- VESÍCULAS PROLÍGERAS (BROOD CAPSULES) Y VESÍCULAS HIJAS ENDÓGENAS ---
      if (u_shaderMode == 0) {
        vec3 vesCol = mix(vec3(0.76, 0.92, 0.96), vec3(0.94, 0.98, 1.0), fresnel * 0.65);
        color = vesCol * (0.36 + 0.54 * wrap1 + 0.18 * diff2) + spec * 0.75;
      } else if (u_shaderMode == 1) {
        vec3 vesStain = mix(vec3(0.88, 0.62, 0.76), vec3(0.64, 0.14, 0.42), fresnel * 0.7);
        color = vesStain * (0.50 + 0.44 * wrap1) + spec * 0.4;
      } else if (u_shaderMode == 2) {
        float lum = 0.24 + 0.66 * fresnel + 0.24 * wrap1;
        color = vec3(lum);
      } else {
        color = vec3(0.18, 0.96, 0.72) * (0.35 + 0.75 * fresnel);
      }
      alpha = 0.68;

    } else if (u_partId == 34 || u_partId == 40) {
      // --- PROTOESCÓLICES Y ARENA HIDATÍDICA ---
      float gran = 0.88 + 0.12 * sin(v_localPos.x * 26.0) * cos(v_localPos.y * 26.0);
      float baseOp = (u_partId == 40) ? clamp(0.88 - u_translucency * 0.62, 0.22, 0.92) : 0.95;
      if (u_shaderMode == 0) {
        vec3 protoCol = mix(vec3(0.95, 0.89, 0.74) * gran, vec3(0.82, 0.66, 0.46), fresnel * 0.5);
        color = protoCol * (0.34 + 0.56 * wrap1 + 0.18 * diff2) + spec * 0.45;
      } else if (u_shaderMode == 1) {
        vec3 protoStain = mix(vec3(0.82, 0.46, 0.60) * gran, vec3(0.56, 0.10, 0.30), fresnel * 0.55);
        color = protoStain * (0.48 + 0.46 * wrap1) + spec * 0.35;
      } else if (u_shaderMode == 2) {
        float lum = 0.25 + 0.60 * fresnel + 0.24 * wrap1;
        color = vec3(lum);
      } else {
        color = vec3(0.98, 0.42, 0.72) * (0.42 + 0.65 * fresnel);
      }
      alpha = baseOp;

    } else if (u_partId == 41) {
      // --- CORPÚSCULOS CALCÁREOS REFRINGENTES DEL PROTOESCÓLEX ---
      if (u_shaderMode == 0) {
        color = vec3(0.84, 0.96, 0.98) * (0.42 + 0.52 * wrap1) + vec3(1.0) * spec * 1.4;
      } else if (u_shaderMode == 1) {
        color = vec3(0.46, 0.18, 0.48) * (0.48 + 0.46 * wrap1) + vec3(0.95, 0.85, 0.95) * spec;
      } else if (u_shaderMode == 2) {
        color = vec3(0.92) * (0.4 + 0.6 * wrap1);
      } else {
        color = vec3(0.35, 0.95, 1.0) * (0.5 + 0.6 * fresnel);
      }
      alpha = 0.96;

    } else if (u_partId == 10) {
      // --- EMBRIÓFORO ESTRIADO RADIAL EXTERNO (HUEVO) ---
      float radialBlocks = sin(v_uv.x * 92.0) * sin(v_uv.y * 184.0);
      float blockMask = smoothstep(-0.35, 0.55, radialBlocks);
      float baseOp = clamp(0.95 - u_translucency * 0.78, 0.14, 0.96);
      if (u_shaderMode == 0) {
        vec3 keratinDark  = vec3(0.42, 0.21, 0.06);
        vec3 keratinLight = vec3(0.76, 0.48, 0.16);
        vec3 base = mix(keratinDark, keratinLight, 0.35 + 0.65 * blockMask);
        color = base * (0.30 + 0.58 * wrap1 + 0.18 * diff2) + vec3(0.96, 0.80, 0.48) * fresnel * 0.28 + spec * 0.4;
      } else if (u_shaderMode == 1) {
        vec3 lugolDark  = vec3(0.36, 0.16, 0.08);
        vec3 lugolLight = vec3(0.68, 0.36, 0.18);
        vec3 base = mix(lugolDark, lugolLight, 0.35 + 0.65 * blockMask);
        color = base * (0.48 + 0.44 * wrap1 + 0.14 * diff2);
      } else if (u_shaderMode == 2) {
        float lum = (0.18 + 0.65 * fresnel + 0.25 * wrap1) * (0.75 + 0.25 * blockMask);
        color = vec3(lum * 0.95, lum * 0.97, lum * 1.02);
      } else {
        color = vec3(0.12, 0.62, 0.92) * (0.35 + 0.75 * fresnel) * (0.65 + 0.35 * blockMask);
      }
      alpha = clamp(baseOp * (0.45 + 0.55 * fresnel), 0.12, 0.96);

    } else if (u_partId == 11) {
      // --- ONCOSFERA HEXACANTA INTERNA (HUEVO) ---
      float gran = 0.88 + 0.12 * sin(v_localPos.x * 24.0) * cos(v_localPos.y * 24.0);
      if (u_shaderMode == 0) {
        vec3 oncCore = vec3(0.92, 0.86, 0.76) * gran;
        vec3 oncRim  = vec3(0.78, 0.56, 0.48);
        color = mix(oncCore, oncRim, fresnel * 0.55) * (0.34 + 0.56 * wrap1 + 0.18 * diff2);
      } else if (u_shaderMode == 1) {
        vec3 oncStain = vec3(0.84, 0.54, 0.62) * gran;
        color = mix(oncStain, vec3(0.62, 0.22, 0.36), fresnel * 0.6) * (0.48 + 0.44 * wrap1 + 0.14 * diff2);
      } else if (u_shaderMode == 2) {
        float lum = 0.22 + 0.62 * fresnel + 0.24 * wrap1;
        color = vec3(lum);
      } else {
        color = vec3(0.20, 0.82, 0.68) * (0.35 + 0.65 * fresnel);
      }
      alpha = 0.72;

    } else {
      // --- GANCHOS QUITINOSOS REFRINGENTES (PROTOESCÓLEX / ARENA HIDATÍDICA / HUEVO) ---
      if (u_shaderMode == 0) {
        color = vec3(0.96, 0.76, 0.28) * (0.32 + 0.62 * wrap1) + vec3(1.0, 0.95, 0.80) * spec * 1.4;
      } else if (u_shaderMode == 1) {
        color = vec3(0.74, 0.10, 0.30) * (0.42 + 0.52 * wrap1) + vec3(1.0, 0.85, 0.90) * spec;
      } else if (u_shaderMode == 2) {
        color = vec3(0.88, 0.90, 0.95) * (0.35 + 0.65 * wrap1);
      } else {
        color = vec3(0.98, 0.38, 0.78) * (0.55 + 0.65 * fresnel);
      }
      alpha = 1.0;
    }

    if (u_highlight == 1) {
      color += vec3(0.12, 0.24, 0.30) * (0.45 + 0.55 * fresnel);
      alpha = max(alpha, 0.70);
    }

    color = color / (1.0 + color * 0.15);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * METADATOS ANATÓMICOS Y CLÍNICOS DE LOS 4 ESTADIOS DE ECHINOCOCCUS GRANULOSUS SENSU LATO
 */
export const ECHINOCOCCUS_STAGES: Record<EchinococcusStageId, EchinococcusStageMeta> = {
  hydatid_cyst: {
    id: "hydatid_cyst",
    name: "Quiste hidatídico unilocular (metacestodo hepático / pulmonar)",
    shortName: "Quiste hidatídico",
    subtitle:
      "Metacestodo tisular causante de la equinococosis quística humana (hidatidosis): adventicia, capa laminar PAS+, capa germinativa, vesículas prolígeras y arena hidatídica",
    dimensionsNote:
      "Quiste: 1 a >15 cm (crece ~1–5 cm/año) · Capa laminar: 1–2 mm · Capa germinativa: ~20 µm · Protoescólices: 100–200 µm",
    scaleBarLabel: "1 cm",
    scaleBarWorldUnits: 1.0,
    translucencyLabel: "Transparencia de las envolturas quísticas",
    translucencyHint:
      "Combina el corte ecuatorial y la transparencia para examinar las 3 capas concéntricas, las vesículas prolígeras y la arena hidatídica.",
    defaultTranslucency: 36,
    defaultCutPercent: 48,
    hasPeristalsis: false,
    defaultCamera: {
      position: [1.6, 1.2, 7.8],
      target: [0.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [0.7, -0.3, 4.6],
      target: [0.1, -0.45, 0.0],
    },
    focusButtonLabel: "Enfocar vesículas y arena hidatídica",
    fullButtonLabel: "Ver quiste hidatídico completo",
    overviewSummary:
      "En el ser humano (hospedador intermediario accidental) y en el ganado ovino, la oncosfera desarrolla el quiste hidatídico unilocular (70% en hígado, 20% en pulmón). Está delimitado por la periquística fibrosa del hospedador y dos capas parasitarias propias: la capa laminar acelular (PAS+) y la capa germinativa nucleada que origina vesículas prolígeras, vesículas hijas y miles de protoescólices («arena hidatídica»).",
    regions: [
      {
        id: "adventicia_periquistica",
        number: 1,
        name: "Adventicia o periquística (reacción fibrosa del hospedador)",
        shortLabel: "Adventicia (periquística)",
        badge: "Tejido del Hospedador",
        scale: "Espesor: 1 – 5 mm",
        regionCode: 30,
        colorBio: "#ef4444",
        colorStain: "#be185d",
        localAnchor: [-2.12, 1.05, 0.15],
        labelOffset: [-128, -46],
        camGoal: {
          position: [-2.4, 1.2, 6.6],
          target: [-0.8, 0.4, 0.0],
        },
        defaultTranslucency: 20,
        defaultCutPercent: 48,
        summary:
          "Envoltura fibrosa pericapsular de colágeno y vasos neoformados producida por el órgano del hospedador (parénquima hepático o pulmonar) en respuesta a la compresión crónica del metacestodo.",
        microscopyNote:
          "No pertenece genéticamente al parásito; en quistes antiguos puede calcificarse periféricamente en «cáscara de huevo» en radiografía o TC.",
        reconstruction3DNote:
          "Representada como la corteza conectiva rojiza más externa que envuelve la superficie de la capa laminar.",
      },
      {
        id: "capa_laminar",
        number: 2,
        name: "Capa laminar acelular (membrana cuticular blanca nacarada, PAS+)",
        shortLabel: "Capa laminar (PAS+)",
        badge: "Barrera Inmunológica",
        scale: "Espesor: 1 – 2 mm",
        regionCode: 31,
        colorBio: "#38bdf8",
        colorStain: "#db2777",
        localAnchor: [-1.82, -0.75, 0.20],
        labelOffset: [-128, 46],
        camGoal: {
          position: [-2.0, -0.8, 6.0],
          target: [-0.6, -0.3, 0.0],
        },
        defaultTranslucency: 24,
        defaultCutPercent: 52,
        summary:
          "Membrana elástica acelular secretada por el parásito, compuesta por glucoproteínas y mucopolisacáridos dispuestos en láminas concéntricas. Macroscópicamente tiene el aspecto característico de «clara de huevo cocida».",
        microscopyNote:
          "En anatomía patológica se tiñe de color magenta brillante con ácido peryódico de Schiff (PAS-positiva intensa) y muestra estriaciones laminares paralelas sin núcleos.",
        reconstruction3DNote:
          "Modelada como la gruesa capa blanca nacarada intermedia (que pasa a magenta intenso al activar el modo de tinción histológica PAS).",
      },
      {
        id: "capa_germinativa",
        number: 3,
        name: "Capa germinativa o prolígera (sincitio celular germinativo)",
        shortLabel: "Capa germinativa",
        badge: "Origen de Protoescólices",
        scale: "Espesor: ~15 – 25 µm",
        regionCode: 32,
        colorBio: "#f59e0b",
        colorStain: "#9d174d",
        localAnchor: [1.58, 0.82, 0.15],
        labelOffset: [128, -46],
        camGoal: {
          position: [2.1, 1.0, 5.8],
          target: [0.6, 0.3, 0.0],
        },
        defaultTranslucency: 35,
        defaultCutPercent: 52,
        summary:
          "Delgada lámina sincitial viva y nucleada que tapiza la cara interna de la membrana laminar. Es la única capa metabólicamente activa y reproductiva del quiste.",
        microscopyNote:
          "El albendazol actúa inhibiendo la polimerización de tubulina en esta capa germinativa; si queda intacta tras cirugía, produce recidiva.",
        reconstruction3DNote:
          "Tapiz celular dorado-ámbar interno del cual brotan hacia la cavidad las vesículas prolígeras pediculadas.",
      },
      {
        id: "vesiculas_proligeras",
        number: 4,
        name: "Vesículas prolígeras (brood capsules) y vesículas hijas endógenas",
        shortLabel: "Vesículas prolígeras / hijas",
        badge: "Signo «Rueda de Carro»",
        scale: "Ø 250 µm a varios cm",
        regionCode: 33,
        colorBio: "#22d3ee",
        colorStain: "#be123c",
        localAnchor: [0.68, 0.38, 0.25],
        labelOffset: [128, 12],
        camGoal: {
          position: [1.2, 0.6, 4.8],
          target: [0.35, 0.2, 0.0],
        },
        defaultTranslucency: 45,
        defaultCutPercent: 55,
        summary:
          "Pequeñas esferas germinativas que brotan de la capa prolígera y albergan de 5 a 30 protoescólices en su interior, junto con vesículas hijas endógenas completas que flotan en el líquido hidatídico.",
        microscopyNote:
          "En ecografía (clasificación OMS CE2 / Gharbi III), las múltiples vesículas hijas dentro del quiste madre producen la imagen multivesicular en «panal de abejas» o «rueda de carro».",
        reconstruction3DNote:
          "Esferas translúcidas adheridas a la membrana germinativa y flotando en la cavidad con protoescólices visibles en su interior.",
      },
      {
        id: "arena_hidatidica",
        number: 5,
        name: "Arena hidatídica (sedimento de protoescólices y ganchos libres)",
        shortLabel: "Arena hidatídica",
        badge: "Riesgo de Anafilaxia",
        scale: "Protoescólices: 100 – 200 µm",
        regionCode: 34,
        colorBio: "#fde047",
        colorStain: "#881337",
        localAnchor: [0.12, -1.18, 0.25],
        labelOffset: [125, 52],
        camGoal: {
          position: [0.6, -0.8, 4.4],
          target: [0.0, -0.95, 0.1],
        },
        defaultTranslucency: 52,
        defaultCutPercent: 58,
        summary:
          "Sedimento blanquecino granular depositado por gravedad en el fondo del líquido hidatídico («agua de roca»), integrado por cientos de miles de cápsulas prolígeras desprendidas, protoescólices invaginados y ganchos quitinosos libres.",
        microscopyNote:
          "La rotura o punción no controlada del quiste derrama líquido y arena hidatídica, pudiendo desencadenar shock anafiláctico grave y siembra peritoneal/pleural secundaria.",
        reconstruction3DNote:
          "Agrupación de protoescólices ovoideos y vesículas prolígeras en el polo declive de la cavidad quística.",
      },
    ],
  },
  adult: {
    id: "adult",
    name: "Adulto diminuto de 3 proglótides (2–7 mm en intestino de cánidos)",
    shortName: "Adulto (3 proglótides)",
    subtitle:
      "Cestodo adulto completo en el intestino delgado del perro: escólex armado, cuello y únicamente 3 proglótides (inmadura, madura y grávida con huevos 3D internos)",
    dimensionsNote:
      "Longitud total: solo 2 a 7 mm · Escólex armado: ~0.3 mm (28–50 ganchos) · Estróbilo: 3 (rara vez 4) proglótides",
    scaleBarLabel: "500 µm",
    scaleBarWorldUnits: 1.5,
    translucencyLabel: "Translucidez Tegumentaria (órganos internos)",
    translucencyHint:
      "Aumenta la translucidez o activa el Corte Histológico para ver los huevos 3D dentro del útero sacular de la 3.ª proglótide.",
    defaultTranslucency: 46,
    defaultCutPercent: 0,
    hasPeristalsis: true,
    defaultCamera: {
      position: [-1.8, 3.2, 9.8],
      target: [-0.2, 0.0, 0.0],
    },
    focusCamera: {
      position: [-6.4, 0.7, 2.2],
      target: [-4.9, 0.05, 0.0],
    },
    focusButtonLabel: "Enfocar escólex armado",
    fullButtonLabel: "Ver adulto completo (3 proglótides)",
    overviewSummary:
      "A diferencia de las grandes tenias humanas (que miden metros y tienen más de mil segmentos), el adulto de Echinococcus granulosus habita exclusivamente en el intestino delgado del perro y otros cánidos, mide apenas 2 a 7 mm de longitud total y posee tan solo 3 proglótides: una inmadura, una madura hermafrodita y una grávida terminal que representa más de la mitad del cuerpo. Al activar el Corte Histológico 3D se observan directamente los huevos embrionados alojados dentro de su útero sacular.",
    regions: [
      {
        id: "rostellum_echinococcus",
        number: 1,
        name: "Rostelo apical armado con doble corona de 28–50 ganchos",
        shortLabel: "Rostelo y 32 ganchos",
        badge: "Escólex Armado",
        scale: "Ganchos: 22 – 45 µm",
        regionCode: 1,
        colorBio: "#f59e0b",
        colorStain: "#be123c",
        localAnchor: [0.22, 0.30, 0.22],
        labelOffset: [-118, -46],
        camGoal: {
          position: [-6.8, 0.55, 1.65],
          target: [-5.55, 0.15, 0.10],
        },
        defaultTranslucency: 20,
        defaultCutPercent: 0,
        summary:
          "Prominencia apical retráctil provista de dos hileras concéntricas de 28 a 50 (usualmente 30–36) ganchos quitinosos falciformes con hoja curva, mango y guarda.",
        microscopyNote:
          "Permite al diminuto cestodo anclarse profundamente entre las criptas de Lieberkühn de la mucosa intestinal del perro.",
        reconstruction3DNote:
          "Modelado con 32 ganchos falciformes individuales dispuestos en doble corona alternada.",
      },
      {
        id: "scolex_echinococcus",
        number: 2,
        name: "Escólex piriforme (~0.3 mm) y 4 ventosas acetabulares",
        shortLabel: "Escólex y 4 ventosas",
        badge: "Fijación en Cánidos",
        scale: "Ø ~300 µm",
        regionCode: 2,
        colorBio: "#38bdf8",
        colorStain: "#9d174d",
        localAnchor: [0.88, 0.58, 0.58],
        labelOffset: [-98, 46],
        camGoal: {
          position: [-6.2, 0.85, 2.35],
          target: [-4.9, 0.1, 0.05],
        },
        defaultTranslucency: 25,
        defaultCutPercent: 0,
        summary:
          "Cabeza globulosa o piriforme de ~0.3 mm de diámetro con cuatro ventosas acetabulares musculares subesféricas dispuestas radialmente.",
        microscopyNote:
          "Seguido de un cuello corto que da origen de inmediato a la breve cadena de solo 3 segmentos.",
        reconstruction3DNote:
          "Geometría continua donde las 4 copas acetabulares emergen del bulbo cefálico.",
      },
      {
        id: "proglotide_inmadura",
        number: 3,
        name: "Cuello corto y 1.ª proglótide inmadura",
        shortLabel: "1.ª Proglótide (inmadura)",
        badge: "Segmento 1 de 3",
        scale: "Longitud: ~0.4 – 0.6 mm",
        regionCode: 3,
        colorBio: "#10b981",
        colorStain: "#831843",
        localAnchor: [3.15, 0.16, 0.0],
        labelOffset: [-15, -52],
        camGoal: {
          position: [-2.8, 1.2, 3.6],
          target: [-2.6, 0.05, 0.0],
        },
        defaultTranslucency: 42,
        defaultCutPercent: 0,
        summary:
          "Primer segmento del estróbilo, más corto que ancho, en el cual apenas se esboza el primordio de los órganos reproductores en la línea media.",
        microscopyNote:
          "Carece aún de diferenciación testicular completa y de poro genital abierto.",
        reconstruction3DNote:
          "Muestra el primer anillo estrobilar tras el cuello y el primordio germinal axial.",
      },
      {
        id: "proglotide_madura",
        number: 4,
        name: "2.ª proglótide madura hermafrodita (35–50 testículos y ovario)",
        shortLabel: "2.ª Proglótide (madura)",
        badge: "Segmento 2 de 3",
        scale: "Longitud: ~1.0 – 1.5 mm",
        regionCode: 4,
        colorBio: "#ec4899",
        colorStain: "#9d174d",
        localAnchor: [5.25, 0.18, 0.0],
        labelOffset: [35, -52],
        camGoal: {
          position: [-0.4, 1.8, 3.8],
          target: [-0.5, 0.0, 0.2],
        },
        defaultTranslucency: 78,
        defaultCutPercent: 48,
        summary:
          "Segundo segmento del adulto, alargado y provisto de órganos reproductores masculinos (30 a 60 folículos testiculares grandes) y femeninos (ovario en herradura, glándula vitelógena compacta y bolsa del cirro que desemboca en el poro genital lateral).",
        microscopyNote:
          "En preparaciones teñidas con carmín destaca la bolsa del cirro piriforme lateral y el menor número de testículos respecto del género Taenia.",
        reconstruction3DNote:
          "Al activar el Corte Histológico se observan en relieve 3D el ovario bilobulado en herradura, el vitelario posterior y los folículos testiculares.",
      },
      {
        id: "proglotide_gravida",
        number: 5,
        name: "3.ª proglótide grávida terminal (>50% del adulto, útero con huevos 3D)",
        shortLabel: "3.ª Proglótide (grávida)",
        badge: "Segmento 3 de 3",
        scale: "Longitud: 2.0 – 3.5 mm",
        regionCode: 5,
        colorBio: "#ef4444",
        colorStain: "#881337",
        localAnchor: [9.2, 0.22, 0.0],
        labelOffset: [95, 48],
        camGoal: {
          position: [3.2, 2.2, 4.6],
          target: [3.1, 0.0, 0.2],
        },
        defaultTranslucency: 84,
        defaultCutPercent: 54,
        summary:
          "Tercer y último segmento del adulto; mide más de la mitad de la longitud total del parásito. Está ocupado por un útero sacular central con 12 a 15 evaginaciones o divertículos laterales cortos repleto de 500 a 1.500 huevos embrionados infectantes.",
        microscopyNote:
          "A diferencia de Taenia spp. (ramas laterales arborescentes largas), el útero grávido de Echinococcus granulosus es un saco longitudinal con bolsas o divertículos laterales cortos llenos de huevos.",
        reconstruction3DNote:
          "Al activar el Corte Histológico / Sección 3D se abre la pared dorsal de la proglótide y quedan expuestos en su interior los huevos embrionados 3D con su embrióforo estriado.",
      },
    ],
  },
  protoscolex: {
    id: "protoscolex",
    name: "Protoescólex invaginado y ganchos libres («arena hidatídica»)",
    shortName: "Protoescólex (arena)",
    subtitle:
      "Elemento diagnóstico patognomónico en el examen microscópico del líquido hidatídico: protoescólex ovoideo con corona interna de ganchos y corpúsculos calcáreos",
    dimensionsNote:
      "Protoescólex invaginado: 100 a 200 µm · Ganchos rostelares en daga: 22–40 µm · Corpúsculos calcáreos: 8–15 µm",
    scaleBarLabel: "50 µm",
    scaleBarWorldUnits: 1.0,
    translucencyLabel: "Transparencia del soma del protoescólex",
    translucencyHint:
      "Aumenta la transparencia para visualizar nítidamente la corona central de ganchos invaginados y los corpúsculos calcáreos refringentes.",
    defaultTranslucency: 54,
    defaultCutPercent: 0,
    hasPeristalsis: false,
    defaultCamera: {
      position: [1.1, 0.85, 6.8],
      target: [0.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [0.4, 0.35, 4.3],
      target: [0.0, 0.05, 0.1],
    },
    focusButtonLabel: "Enfocar corona de ganchos interna",
    fullButtonLabel: "Ver protoescólex y ganchos libres",
    overviewSummary:
      "Cada protoescólex de la «arena hidatídica» es un escólex juvenil invaginado sobre sí mismo (100–200 µm). Si es ingerido por un perro, se evagina en el duodeno y origina un gusano adulto; si se libera en la cavidad peritoneal o pleural humana durante una rotura quística, tiene la capacidad de diferenciarse en un nuevo quiste hidatídico secundario.",
    regions: [
      {
        id: "corona_ganchos_proto",
        number: 1,
        name: "Corona central invaginada de 30–36 ganchos quitinosos",
        shortLabel: "Corona de ganchos",
        badge: "Hallazgo Patognomónico",
        scale: "22 – 40 µm por gancho",
        regionCode: 12,
        colorBio: "#f59e0b",
        colorStain: "#be123c",
        localAnchor: [0.0, 0.12, 0.55],
        labelOffset: [-122, -44],
        camGoal: {
          position: [-0.5, 0.35, 4.2],
          target: [0.0, 0.1, 0.2],
        },
        defaultTranslucency: 68,
        summary:
          "En el centro del protoescólex invaginado destaca una corona compacta y refringente de 30 a 36 ganchos rostelares replegados hacia el canal de invaginación, junto con ganchos sueltos libres en el sedimento.",
        microscopyNote:
          "Incluso en quistes supurados o degenerados donde los protoescólices se han lisado, el hallazgo microscópico de ganchos libres en forma de daga confirma hidatidosis.",
        reconstruction3DNote:
          "Anillo doble central de ganchos falciformes en el interior del protoescólex más dos ganchos libres desprendidos en el campo microscópico.",
      },
      {
        id: "soma_protoescolex",
        number: 2,
        name: "Cuerpo ovoideo del protoescólex y 4 ventosas invaginadas",
        shortLabel: "Soma y 4 ventosas",
        badge: "Escólex Juvenil",
        scale: "100 – 200 µm",
        regionCode: 40,
        colorBio: "#fde047",
        colorStain: "#9d174d",
        localAnchor: [-1.25, -0.45, 0.35],
        labelOffset: [-122, 46],
        camGoal: {
          position: [-1.4, -0.4, 5.8],
          target: [-0.2, -0.1, 0.0],
        },
        defaultTranslucency: 38,
        summary:
          "Cuerpo parenquimatoso ovoideo o subesférico revestido de tegumento que mantiene invaginado su polo rostellar y sus cuatro ventosas acetabulares para protegerlos dentro de la vesícula prolígera.",
        microscopyNote:
          "Los protoescólices viables muestran contractilidad ameboide lenta y exclusión del colorante vital eosina al 0,1%.",
        reconstruction3DNote:
          "Malla ovoidea translúcida con hendidura apical de invaginación y 4 copas acetabulares internas.",
      },
      {
        id: "corpusculos_calcareos",
        number: 3,
        name: "Corpúsculos calcáreos refringentes del parénquima",
        shortLabel: "Corpúsculos calcáreos",
        badge: "Reserva Mineral",
        scale: "Ø 8 – 15 µm",
        regionCode: 41,
        colorBio: "#38bdf8",
        colorStain: "#7e22ce",
        localAnchor: [0.85, 0.55, 0.35],
        labelOffset: [122, -40],
        camGoal: {
          position: [1.1, 0.6, 4.8],
          target: [0.3, 0.2, 0.1],
        },
        defaultTranslucency: 62,
        summary:
          "Concreciones esféricas u ovaladas de carbonato y fosfato cálcico distribuidas en el parénquima del protoescólex que amortiguan el pH ácido gástrico y aportan iones durante la evaginación.",
        microscopyNote:
          "Son intensamente birrefringentes al microscopio óptico y constituyen un marcador histológico clásico de tejido metacestódico.",
        reconstruction3DNote:
          "Esférulas minerales refringentes distribuidas en la periferia parenquimatosa del protoescólex.",
      },
    ],
  },
  egg: {
    id: "egg",
    name: "Huevo embrionado de Echinococcus granulosus (infectante humano)",
    shortName: "Huevo embrionado",
    subtitle:
      "Eliminado en heces de perros infectados; su ingestión accidental por humanos u ovinos causa la hidatidosis (equinococosis quística)",
    dimensionsNote:
      "Huevo: 30 a 37 µm · Esférico/subesférico · Embrióforo radiado con oncosfera hexacanta · Indistinguible de Taenia spp.",
    scaleBarLabel: "10 µm",
    scaleBarWorldUnits: 1.0,
    translucencyLabel: "Transparencia del embrióforo",
    translucencyHint:
      "Aumenta la transparencia de la cubierta radiada para observar la oncosfera hexacanta y sus 3 pares de ganchos.",
    defaultTranslucency: 48,
    defaultCutPercent: 0,
    hasPeristalsis: false,
    defaultCamera: {
      position: [1.2, 0.9, 7.6],
      target: [0.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [0.6, 0.5, 4.8],
      target: [0.0, 0.0, 0.1],
    },
    focusButtonLabel: "Enfocar oncosfera hexacanta",
    fullButtonLabel: "Ver huevo completo",
    overviewSummary:
      "El huevo de Echinococcus granulosus (30–37 µm) es inmediatamente infectante al ser excretado en las heces del perro y es morfológicamente indistinguible al microscopio óptico de los huevos de Taenia spp. Cuando el ser humano ingiere estos huevos (por contacto con el pelaje de perros, manos contaminadas, agua o verduras), la oncosfera penetra la pared intestinal y viaja por la vena porta hacia el hígado y los pulmones.",
    regions: [
      {
        id: "embrioforo_echinococcus",
        number: 1,
        name: "Embrióforo grueso con estriaciones radiales (bloques de queratina)",
        shortLabel: "Embrióforo radiado",
        badge: "Alta Resistencia Ambiental",
        scale: "Ø 30 – 37 µm",
        regionCode: 10,
        colorBio: "#d97706",
        colorStain: "#92400e",
        localAnchor: [-1.75, 0.85, 0.35],
        labelOffset: [-125, -42],
        camGoal: {
          position: [-1.5, 1.0, 6.8],
          target: [0.0, 0.0, 0.0],
        },
        defaultTranslucency: 25,
        summary:
          "Corteza esférica gruesa de bloques prismáticos de proteína tipo queratina con estriaciones radiales que permite al huevo sobrevivir meses en suelos húmedos y bajas temperaturas.",
        microscopyNote:
          "El ser humano NO elimina huevos de E. granulosus en sus heces (el humano es hospedador intermediario accidental, no definitivo).",
        reconstruction3DNote:
          "Renderizado en doble pasada con patrón radial de bloques de queratina y control de transparencia o sección ecuatorial.",
      },
      {
        id: "oncosfera_echinococcus",
        number: 2,
        name: "Oncosfera hexacanta (embrión causante de la hidatidosis)",
        shortLabel: "Oncosfera (embrión)",
        badge: "Migración Portal",
        scale: "Ø ~20 – 24 µm",
        regionCode: 11,
        colorBio: "#e2e8f0",
        colorStain: "#be185d",
        localAnchor: [0.95, 0.65, 0.25],
        labelOffset: [125, -38],
        camGoal: {
          position: [0.9, 0.7, 5.2],
          target: [0.0, 0.0, 0.0],
        },
        defaultTranslucency: 62,
        summary:
          "Embrión hexacanto que eclosiona en el duodeno humano, atraviesa las vénulas mesentéricas y se detiene primero en los sinusoides hepáticos (65–75% de los quistes) o pasa al lecho capilar pulmonar (20–25%).",
        microscopyNote:
          "En el parénquima hepático o pulmonar sufre vesiculación central y se transforma en un quiste hidatídico en pocos días.",
        reconstruction3DNote:
          "Esfera embrionaria translúcida concéntrica en cuyo interior se alojan los 3 pares de ganchos.",
      },
      {
        id: "ganchos_oncosfericos_echinococcus",
        number: 3,
        name: "Tres pares de ganchos embrionarios quitinosos (6 estiletes)",
        shortLabel: "6 ganchos oncosféricos",
        badge: "Penetración Mucosa",
        scale: "Longitud: ~12 – 15 µm",
        regionCode: 12,
        colorBio: "#fbbf24",
        colorStain: "#9d174d",
        localAnchor: [0.35, -0.35, 0.45],
        labelOffset: [125, 45],
        camGoal: {
          position: [0.5, -0.3, 4.5],
          target: [0.0, -0.1, 0.2],
        },
        defaultTranslucency: 72,
        summary:
          "Seis estiletes quitinosos dispuestos en tres pares que junto con las secreciones de las glándulas de penetración permiten a la oncosfera cruzar el epitelio intestinal hacia la circulación portal.",
        microscopyNote:
          "Visibles como 6 trazos refringentes en el interior del embrión hexacanto.",
        reconstruction3DNote:
          "Modelados como 3 pares de estiletes falciformes orientados en abanico.",
      },
    ],
  },
};

export interface Echinococcus3DViewerProps {
  onClose?: () => void;
}

export const Echinococcus3DViewer: React.FC<Echinococcus3DViewerProps> = ({ onClose }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const simTimeRef = useRef<number>(0.0);

  const camTransitionRef = useRef<{
    active: boolean;
    goalPos: THREE.Vector3;
    goalTarget: THREE.Vector3;
  }>({
    active: false,
    goalPos: new THREE.Vector3(...ECHINOCOCCUS_STAGES.hydatid_cyst.defaultCamera.position),
    goalTarget: new THREE.Vector3(...ECHINOCOCCUS_STAGES.hydatid_cyst.defaultCamera.target),
  });

  const [activeStage, setActiveStage] = useState<EchinococcusStageId>("hydatid_cyst");
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [shaderMode, setShaderMode] = useState<EchinococcusShaderMode>(0);
  const [showMarkers, setShowMarkers] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [translucency, setTranslucency] = useState<number>(
    ECHINOCOCCUS_STAGES.hydatid_cyst.defaultTranslucency
  );
  const [cutPercent, setCutPercent] = useState<number>(
    ECHINOCOCCUS_STAGES.hydatid_cyst.defaultCutPercent
  );
  const [wavePercent, setWavePercent] = useState<number>(50);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [mobileTouchInteractive, setMobileTouchInteractive] = useState(false);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [scaleBarPx, setScaleBarPx] = useState<number>(64);

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

  const stageMeta = ECHINOCOCCUS_STAGES[activeStage];
  const selectedRegion = stageMeta.regions.find((r) => r.id === selectedRegionId) || null;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsStageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const disposeGroup = useCallback((group: THREE.Group) => {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });
  }, []);

  /**
   * Construye la escena 3D según el estadio seleccionado de Echinococcus granulosus
   */
  const buildStage3DScene = useCallback(
    (stageId: EchinococcusStageId, scene: THREE.Scene) => {
      if (modelRootRef.current) {
        scene.remove(modelRootRef.current);
        disposeGroup(modelRootRef.current);
        modelRootRef.current = null;
      }

      const root = new THREE.Group();
      modelRootRef.current = root;

      const makePartMat = (partId: number, transparent = false, side: THREE.Side = THREE.DoubleSide) =>
        new THREE.ShaderMaterial({
          vertexShader: ECHINOCOCCUS_STAGE_VERTEX_SHADER,
          fragmentShader: ECHINOCOCCUS_STAGE_FRAGMENT_SHADER,
          uniforms: {
            u_partId: { value: partId },
            u_shaderMode: { value: 0 },
            u_translucency: { value: 0.36 },
            u_cutZ: { value: 0.1 },
            u_highlight: { value: 0 },
          },
          transparent,
          depthWrite: !transparent,
          side,
        });

      if (stageId === "hydatid_cyst") {
        // --- 1. QUISTE HIDATÍDICO UNILOCULAR (3 capas concéntricas + vesículas prolígeras/hijas + arena hidatídica) ---

        // A. Arena hidatídica en el polo declive (sedimento de protoescólices y cápsulas desprendidas)
        const sandPositions: Array<[number, number, number, number]> = [
          [0.0, -1.26, 0.12, 0.13],
          [-0.24, -1.24, 0.22, 0.12],
          [0.26, -1.22, 0.18, 0.12],
          [-0.44, -1.16, 0.08, 0.11],
          [0.45, -1.15, -0.05, 0.11],
          [-0.14, -1.28, -0.18, 0.12],
          [0.18, -1.27, -0.16, 0.13],
          [0.02, -1.15, 0.34, 0.11],
          [-0.32, -1.18, -0.22, 0.10],
          [0.34, -1.17, 0.28, 0.10],
          [-0.55, -1.08, 0.18, 0.09],
          [0.54, -1.06, 0.15, 0.09],
        ];
        sandPositions.forEach(([sx, sy, sz, sr]) => {
          const pGeo = new THREE.SphereGeometry(sr, 20, 16);
          pGeo.scale(1.0, 1.22, 1.0);
          const pMesh = new THREE.Mesh(pGeo, makePartMat(34, false));
          pMesh.position.set(sx, sy, sz);
          pMesh.userData = { shaderKind: "stage", regionCode: 34 };
          pMesh.renderOrder = 1;
          root.add(pMesh);
        });

        // Ganchos quitinosos libres en el sedimento de arena hidatídica
        const freeHookCoords: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
          { pos: [-0.08, -1.12, 0.36], rot: [0.3, 0.4, 0.8] },
          { pos: [0.22, -1.10, 0.34], rot: [-0.2, 1.1, -0.6] },
          { pos: [0.05, -1.20, 0.42], rot: [0.4, -0.5, 1.2] },
        ];
        freeHookCoords.forEach((fh) => {
          const hGeo = buildHydatidHookGeometry(0.22, 0.020);
          const hMesh = new THREE.Mesh(hGeo, makePartMat(12, false));
          hMesh.position.set(...fh.pos);
          hMesh.rotation.set(...fh.rot);
          hMesh.userData = { shaderKind: "stage", regionCode: 34 };
          hMesh.renderOrder = 1;
          root.add(hMesh);
        });

        // B. Vesículas prolígeras (brood capsules) adheridas a la capa germinativa y vesículas hijas endógenas
        const broodCapsules: Array<{ pos: [number, number, number]; r: number; nProto: number }> = [
          { pos: [0.68, 0.38, 0.12], r: 0.42, nProto: 6 }, // Vesícula hija endógena principal
          { pos: [-0.72, 0.45, -0.10], r: 0.34, nProto: 5 },
          { pos: [0.15, 0.96, -0.15], r: 0.28, nProto: 4 },
          { pos: [-1.12, -0.15, 0.10], r: 0.25, nProto: 4 },
          { pos: [1.08, -0.28, 0.08], r: 0.26, nProto: 4 },
          { pos: [-0.42, -0.55, -0.20], r: 0.30, nProto: 4 },
        ];

        broodCapsules.forEach((bc) => {
          // Protoescólices dentro de cada vesícula prolígera / hija
          for (let k = 0; k < bc.nProto; k++) {
            const ang = (k / bc.nProto) * Math.PI * 2.0;
            const pr = bc.r * 0.46;
            const protoGeo = new THREE.SphereGeometry(0.085, 16, 14);
            protoGeo.scale(1.0, 1.25, 1.0);
            const protoMesh = new THREE.Mesh(protoGeo, makePartMat(34, false));
            protoMesh.position.set(
              bc.pos[0] + Math.cos(ang) * pr,
              bc.pos[1] + Math.sin(ang) * pr,
              bc.pos[2] + (k % 2 === 0 ? 0.04 : -0.04)
            );
            protoMesh.userData = { shaderKind: "stage", regionCode: 34 };
            protoMesh.renderOrder = 1;
            root.add(protoMesh);
          }

          // Membrana translúcida de la vesícula prolígera / hija
          const bcGeo = new THREE.SphereGeometry(bc.r, 32, 24);
          const bcMesh = new THREE.Mesh(bcGeo, makePartMat(33, true));
          bcMesh.position.set(...bc.pos);
          bcMesh.userData = { shaderKind: "stage", regionCode: 33 };
          bcMesh.renderOrder = 2;
          root.add(bcMesh);
        });

        // C. Las 3 capas concéntricas de la pared quística (con BackSide + FrontSide para lectura limpia del corte 3D)
        const shells: Array<{ r: number; partId: number; orderBase: number }> = [
          { r: 1.56, partId: 32, orderBase: 3 }, // Capa germinativa o prolígera (interna)
          { r: 1.84, partId: 31, orderBase: 5 }, // Capa laminar acelular (PAS+, blanca nacarada)
          { r: 2.12, partId: 30, orderBase: 7 }, // Capa adventicia o periquística (externa del hospedador)
        ];

        shells.forEach((sh) => {
          const sGeo = new THREE.SphereGeometry(sh.r, 64, 48);
          const backMesh = new THREE.Mesh(sGeo, makePartMat(sh.partId, true, THREE.BackSide));
          backMesh.userData = { shaderKind: "stage", regionCode: sh.partId };
          backMesh.renderOrder = sh.orderBase;
          root.add(backMesh);

          const frontMesh = new THREE.Mesh(sGeo, makePartMat(sh.partId, true, THREE.FrontSide));
          frontMesh.userData = { shaderKind: "stage", regionCode: sh.partId };
          frontMesh.renderOrder = sh.orderBase + 1;
          root.add(frontMesh);
        });
      } else if (stageId === "adult") {
        // --- 2. ADULTO DIMINUTO DE 3 PROGLÓTIDES (2 a 7 mm) ---
        const adultGeo = buildEchinococcusAdultBufferGeometry();
        const adultMat = new THREE.ShaderMaterial({
          vertexShader: ECHINOCOCCUS_ADULT_VERTEX_SHADER,
          fragmentShader: ECHINOCOCCUS_ADULT_FRAGMENT_SHADER,
          uniforms: {
            u_time: { value: 0.0 },
            u_waveScale: { value: 0.50 },
            u_translucency: { value: 0.46 },
            u_cutPlane: { value: 0.0 },
            u_shaderMode: { value: 0 },
            u_highlightRegion: { value: 0 },
          },
          side: THREE.DoubleSide,
        });
        const adultMesh = new THREE.Mesh(adultGeo, adultMat);
        adultMesh.frustumCulled = false;
        adultMesh.userData = { shaderKind: "adult" };
        root.add(adultMesh);
      } else if (stageId === "protoscolex") {
        // --- 3. PROTOESCÓLEX INVAGINADO Y GANCHOS LIBRES («ARENA HIDATÍDICA») ---

        // A. Corona central invaginada de 32 ganchos quitinosos falciformes
        const nHooks = 32;
        for (let k = 0; k < nHooks; k++) {
          const isLarge = k % 2 === 0;
          const ang = (k / nHooks) * Math.PI * 2.0;
          const rRing = isLarge ? 0.42 : 0.50;
          const hGeo = buildHydatidHookGeometry(isLarge ? 0.44 : 0.35, 0.032);
          const hMesh = new THREE.Mesh(hGeo, makePartMat(12, false));
          hMesh.position.set(
            Math.cos(ang) * rRing,
            0.12 + (isLarge ? 0.04 : -0.04),
            Math.sin(ang) * rRing
          );
          hMesh.rotation.set(0.25 * Math.sin(ang), -ang + Math.PI * 0.5, 0.35);
          hMesh.userData = { shaderKind: "stage", regionCode: 12 };
          hMesh.renderOrder = 1;
          root.add(hMesh);
        }

        // Dos ganchos rostelares libres desprendidos en el campo microscópico (típicos de la arena hidatídica)
        const detachedHooks: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
          { pos: [1.95, -0.75, 0.25], rot: [0.15, 0.25, -0.45] },
          { pos: [2.35, -0.25, -0.15], rot: [-0.20, 0.85, 0.55] },
        ];
        detachedHooks.forEach((dh) => {
          const dhGeo = buildHydatidHookGeometry(0.68, 0.048);
          const dhMesh = new THREE.Mesh(dhGeo, makePartMat(12, false));
          dhMesh.position.set(...dh.pos);
          dhMesh.rotation.set(...dh.rot);
          dhMesh.userData = { shaderKind: "stage", regionCode: 12 };
          dhMesh.renderOrder = 1;
          root.add(dhMesh);
        });

        // B. Cuatro ventosas acetabulares internas invaginadas alrededor del polo rostellar
        const suckerAngles = [
          Math.PI * 0.25,
          Math.PI * 0.75,
          Math.PI * 1.25,
          Math.PI * 1.75,
        ];
        suckerAngles.forEach((ang) => {
          const cupGeo = new THREE.TorusGeometry(0.26, 0.075, 16, 28);
          const cupMesh = new THREE.Mesh(cupGeo, makePartMat(40, false));
          cupMesh.position.set(Math.cos(ang) * 0.78, -0.15, Math.sin(ang) * 0.78);
          cupMesh.rotation.set(Math.PI * 0.5, ang, 0.0);
          cupMesh.userData = { shaderKind: "stage", regionCode: 40 };
          cupMesh.renderOrder = 1;
          root.add(cupMesh);
        });

        // C. Corpúsculos calcáreos refringentes distribuidos en el parénquima del protoescólex
        const corpuscleCoords: Array<[number, number, number, number]> = [
          [0.85, 0.55, 0.35, 0.13],
          [-0.82, 0.48, 0.38, 0.12],
          [0.72, -0.68, 0.42, 0.14],
          [-0.76, -0.62, 0.36, 0.12],
          [0.35, 0.88, -0.32, 0.11],
          [-0.42, 0.82, -0.38, 0.12],
          [0.92, -0.12, -0.42, 0.13],
          [-0.95, 0.05, -0.35, 0.12],
          [0.15, -0.98, 0.28, 0.11],
          [-0.25, -0.92, -0.32, 0.12],
          [0.58, 0.42, 0.68, 0.10],
          [-0.55, 0.36, 0.70, 0.11],
        ];
        corpuscleCoords.forEach(([cx, cy, cz, cr]) => {
          const cGeo = new THREE.SphereGeometry(cr, 20, 16);
          cGeo.scale(1.15, 0.92, 1.0);
          const cMesh = new THREE.Mesh(cGeo, makePartMat(41, false));
          cMesh.position.set(cx, cy, cz);
          cMesh.userData = { shaderKind: "stage", regionCode: 41 };
          cMesh.renderOrder = 2;
          root.add(cMesh);
        });

        // D. Soma ovoideo del protoescólex invaginado (con depresión apical de invaginación)
        const somaGeo = new THREE.SphereGeometry(1.45, 56, 44);
        const sPos = somaGeo.attributes.position;
        for (let i = 0; i < sPos.count; i++) {
          const vx = sPos.getX(i);
          const vy = sPos.getY(i);
          const vz = sPos.getZ(i);
          const rXZ = Math.hypot(vx, vz);
          // Hendidura apical superior donde se invagina el canal rostellar
          const apicalCleft =
            vy > 0.5 ? -0.42 * Math.exp(-rXZ * rXZ * 2.6) * smoothstepJS(0.5, 1.45, vy) : 0.0;
          sPos.setXYZ(i, vx * 0.94, vy * 1.16 + apicalCleft, vz * 0.92);
        }
        somaGeo.computeVertexNormals();

        const somaBack = new THREE.Mesh(somaGeo, makePartMat(40, true, THREE.BackSide));
        somaBack.userData = { shaderKind: "stage", regionCode: 40 };
        somaBack.renderOrder = 3;
        root.add(somaBack);

        const somaFront = new THREE.Mesh(somaGeo, makePartMat(40, true, THREE.FrontSide));
        somaFront.userData = { shaderKind: "stage", regionCode: 40 };
        somaFront.renderOrder = 4;
        root.add(somaFront);
      } else {
        // --- 4. HUEVO EMBRIONADO DE ECHINOCOCCUS GRANULOSUS (Embrióforo radiado + Oncosfera hexacanta) ---

        const hexacanthPairs: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
          { pos: [-0.14, 0.12, 0.28], rot: [0.15, 0.0, 0.12] },
          { pos: [0.14, 0.12, 0.28], rot: [0.15, Math.PI, -0.12] },
          { pos: [-0.46, 0.02, 0.18], rot: [0.1, 0.2, 0.48] },
          { pos: [-0.58, -0.18, -0.05], rot: [-0.1, 0.25, 0.65] },
          { pos: [0.46, 0.02, 0.18], rot: [0.1, Math.PI - 0.2, -0.48] },
          { pos: [0.58, -0.18, -0.05], rot: [-0.1, Math.PI - 0.25, -0.65] },
        ];

        hexacanthPairs.forEach((hp) => {
          const hGeo = buildHydatidHookGeometry(0.62, 0.045);
          const hMesh = new THREE.Mesh(hGeo, makePartMat(12, false));
          hMesh.position.set(...hp.pos);
          hMesh.rotation.set(...hp.rot);
          hMesh.userData = { shaderKind: "stage", regionCode: 12 };
          hMesh.renderOrder = 1;
          root.add(hMesh);
        });

        const oncGeo = new THREE.SphereGeometry(1.18, 48, 36);
        const oncMesh = new THREE.Mesh(oncGeo, makePartMat(11, true));
        oncMesh.userData = { shaderKind: "stage", regionCode: 11 };
        oncMesh.renderOrder = 2;
        root.add(oncMesh);

        const embGeo = new THREE.SphereGeometry(1.88, 64, 48);
        const embBack = new THREE.Mesh(embGeo, makePartMat(10, true, THREE.BackSide));
        embBack.userData = { shaderKind: "stage", regionCode: 10 };
        embBack.renderOrder = 3;
        root.add(embBack);

        const embFront = new THREE.Mesh(embGeo, makePartMat(10, true, THREE.FrontSide));
        embFront.userData = { shaderKind: "stage", regionCode: 10 };
        embFront.renderOrder = 4;
        root.add(embFront);
      }

      scene.add(root);
    },
    [disposeGroup]
  );

  const activeStageRef = useRef<EchinococcusStageId>(activeStage);
  const wavePercentRef = useRef<number>(wavePercent);

  useEffect(() => {
    activeStageRef.current = activeStage;
  }, [activeStage]);
  useEffect(() => {
    wavePercentRef.current = wavePercent;
  }, [wavePercent]);

  const syncUniforms = useCallback(() => {
    const scene = sceneRef.current;
    const root = modelRootRef.current;
    if (!scene || !root) return;

    // Fondo blanco ligeramente cálido (#faf7f2) en modo Tinción PAS / Carmín (shaderMode === 1)
    scene.background = new THREE.Color(shaderMode === 1 ? 0xfaf7f2 : 0x070b14);

    const currentMeta = ECHINOCOCCUS_STAGES[activeStage];
    const activeReg = currentMeta.regions.find((r) => r.id === selectedRegionId) || null;
    const highlightCode = activeReg ? activeReg.regionCode : 0;

    const maxZ = activeStage === "hydatid_cyst" ? 2.15 : activeStage === "egg" ? 1.92 : 1.55;
    const isCutting = cutPercent > 0.5;
    const cutZ = isCutting ? maxZ * (1.0 - (cutPercent / 100.0) * 1.85) : maxZ + 2.0;

    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mat = obj.material as THREE.ShaderMaterial;
      const kind = obj.userData?.shaderKind;

      if (kind === "adult") {
        mat.uniforms.u_translucency.value = translucency / 100.0;
        mat.uniforms.u_cutPlane.value = cutPercent / 100.0;
        mat.uniforms.u_shaderMode.value = shaderMode;
        mat.uniforms.u_highlightRegion.value = highlightCode;
      } else if (kind === "stage") {
        const rCode = obj.userData?.regionCode as number;
        mat.uniforms.u_shaderMode.value = shaderMode;
        mat.uniforms.u_translucency.value = translucency / 100.0;
        mat.uniforms.u_cutZ.value = cutZ;
        mat.uniforms.u_highlight.value = highlightCode > 0 && highlightCode === rCode ? 1 : 0;
      }
    });
  }, [activeStage, shaderMode, translucency, cutPercent, selectedRegionId]);

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
        "No se pudo inicializar WebGL en este navegador. Se muestra la alternativa esquemática estática."
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

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 120);
    const initCam = ECHINOCOCCUS_STAGES.hydatid_cyst.defaultCamera;
    camera.position.set(...initCam.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.25;
    controls.maxDistance = 28.0;
    controls.target.set(...initCam.target);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.15;
    controlsRef.current = controls;

    const stopCamTransition = () => {
      camTransitionRef.current.active = false;
    };
    controls.addEventListener("start", stopCamTransition);

    buildStage3DScene("hydatid_cyst", scene);

    let lastNow = performance.now();
    let frameCount = 0;

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const dt = Math.min(0.05, (now - lastNow) * 0.001);
      lastNow = now;

      const waveScale = wavePercentRef.current / 100.0;
      const stg = activeStageRef.current;
      if (stg === "adult") {
        simTimeRef.current += dt * (0.15 + 1.2 * waveScale);
        if (modelRootRef.current) {
          modelRootRef.current.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.userData?.shaderKind === "adult") {
              const mat = obj.material as THREE.ShaderMaterial;
              mat.uniforms.u_time.value = simTimeRef.current;
              mat.uniforms.u_waveScale.value = waveScale;
            }
          });
        }
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
          const currentStage = ECHINOCOCCUS_STAGES[stg];
          const rawPins: Array<{
            id: string;
            anchorX: number;
            anchorY: number;
            labelX: number;
            labelY: number;
            visible: boolean;
          }> = [];

          currentStage.regions.forEach((reg) => {
            let worldXYZ: [number, number, number];
            if (stg === "adult") {
              worldXYZ = localToWorldAdultPoint(reg.localAnchor, simTimeRef.current, waveScale);
            } else {
              worldXYZ = reg.localAnchor;
            }

            const worldPt = new THREE.Vector3(...worldXYZ);
            const proj = worldPt.clone().project(camera);
            const inFront = proj.z >= -1 && proj.z <= 1;
            const ax = (proj.x * 0.5 + 0.5) * w;
            const ay = (-(proj.y * 0.5) + 0.5) * h;

            const padX = Math.min(115, w * 0.24);
            const padTop = 64;
            const padBot = 54;
            const lx = Math.max(padX, Math.min(w - padX, ax + reg.labelOffset[0]));
            const ly = Math.max(padTop, Math.min(h - padBot, ay + reg.labelOffset[1]));

            rawPins.push({
              id: reg.id,
              anchorX: ax,
              anchorY: ay,
              labelX: lx,
              labelY: ly,
              visible: inFront && ax > 20 && ax < w - 20 && ay > 20 && ay < h - 20,
            });
          });

          for (let iter = 0; iter < 3; iter++) {
            for (let i = 0; i < rawPins.length; i++) {
              for (let j = i + 1; j < rawPins.length; j++) {
                const pA = rawPins[i];
                const pB = rawPins[j];
                if (!pA.visible || !pB.visible) continue;
                const dx = pB.labelX - pA.labelX;
                const dy = pB.labelY - pA.labelY;
                if (Math.abs(dx) < 148 && Math.abs(dy) < 34) {
                  const pushY = (34 - Math.abs(dy)) * 0.55 * (dy >= 0 ? 1 : -1);
                  pA.labelY = Math.max(64, Math.min(h - 54, pA.labelY - pushY));
                  pB.labelY = Math.max(64, Math.min(h - 54, pB.labelY + pushY));
                }
              }
            }
          }

          const nextMap: Record<
            string,
            { anchorX: number; anchorY: number; labelX: number; labelY: number; visible: boolean }
          > = {};
          rawPins.forEach((p) => {
            nextMap[p.id] = p;
          });
          setProjectedPins(nextMap);

          const dist = camera.position.distanceTo(controls.target);
          const fovRad = THREE.MathUtils.degToRad(camera.fov);
          const worldHeightAtTarget = 2.0 * dist * Math.tan(fovRad * 0.5);
          const pxPerUnit = h / Math.max(0.1, worldHeightAtTarget);
          setScaleBarPx(
            Math.max(
              28,
              Math.min(180, Math.round(pxPerUnit * currentStage.scaleBarWorldUnits))
            )
          );
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!holder || !rendererRef.current || !cameraRef.current) return;
      const newW = holder.clientWidth;
      const newH = holder.clientHeight;
      if (newW > 0 && newH > 0) {
        cameraRef.current.aspect = newW / newH;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newW, newH);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.removeEventListener("start", stopCamTransition);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (modelRootRef.current) disposeGroup(modelRootRef.current);
      controls.dispose();
      renderer.dispose();
      if (holder) holder.innerHTML = "";
    };
  }, [buildStage3DScene, disposeGroup]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  const handleSelectRegion = useCallback((regionId: string | null) => {
    setSelectedRegionId((prev) => {
      const nextId = prev === regionId ? null : regionId;
      const currentStage = ECHINOCOCCUS_STAGES[activeStageRef.current];
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
          if (activeStageRef.current === "adult") {
            const wp = localToWorldAdultPoint(
              reg.localAnchor,
              simTimeRef.current,
              wavePercentRef.current / 100.0
            );
            const offset = new THREE.Vector3(...reg.camGoal.position).sub(
              new THREE.Vector3(...reg.camGoal.target)
            );
            const targetVec = new THREE.Vector3(...wp);
            camTransitionRef.current = {
              active: true,
              goalPos: targetVec.clone().add(offset),
              goalTarget: targetVec,
            };
          } else {
            camTransitionRef.current = {
              active: true,
              goalPos: new THREE.Vector3(...reg.camGoal.position),
              goalTarget: new THREE.Vector3(...reg.camGoal.target),
            };
          }
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
    if (activeStage === "hydatid_cyst") {
      setCutPercent(55);
      setTranslucency(42);
    } else if (activeStage === "protoscolex" || activeStage === "egg") {
      setTranslucency(65);
    }
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
    (newStage: EchinococcusStageId) => {
      setIsStageDropdownOpen(false);
      if (newStage === activeStage) return;
      const meta = ECHINOCOCCUS_STAGES[newStage];
      setActiveStage(newStage);
      setSelectedRegionId(null);
      setIsFocused(false);
      setCutPercent(meta.defaultCutPercent);
      setTranslucency(meta.defaultTranslucency);

      if (sceneRef.current) {
        buildStage3DScene(newStage, sceneRef.current);
      }

      camTransitionRef.current = {
        active: true,
        goalPos: new THREE.Vector3(...meta.defaultCamera.position),
        goalTarget: new THREE.Vector3(...meta.defaultCamera.target),
      };
    },
    [activeStage, buildStage3DScene]
  );

  const handleZoom = (factor: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    camTransitionRef.current.active = false;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    const nextLen = Math.max(1.35, Math.min(26.0, dir.length() * factor));
    dir.setLength(nextLen);
    cam.position.copy(target).add(dir);
    controlsRef.current.update();
  };

  const isWarmLightBg = shaderMode === 1;

  if (webglError) {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-slate-950 p-5 space-y-4 text-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Visor WebGL no disponible — Alternativa esquemática estática identificada
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{webglError}</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className="w-full space-y-3 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. VISOR 3D PROTAGONISTA */}
      <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[580px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#070b14]">
        <div
          ref={canvasHolderRef}
          className={`w-full h-full cursor-grab active:cursor-grabbing ${
            !mobileTouchInteractive ? "touch-pan-y md:touch-none" : "touch-none"
          }`}
        />

        {/* Líneas guía SVG y Marcadores 3D sin solapamientos */}
        {showMarkers && (
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
                      style={{ backgroundColor: isSelected ? "#ffffff" : dotColor }}
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
                  aria-label="Elegir estadio de Echinococcus granulosus sensu lato"
                  className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1.5"
                >
                  <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Estadios de Echinococcus granulosus
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsStageDropdownOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(["hydatid_cyst", "adult", "protoscolex", "egg"] as EchinococcusStageId[]).map(
                    (sId) => {
                      const item = ECHINOCOCCUS_STAGES[sId];
                      const isCurrent = activeStage === sId;
                      return (
                        <button
                          key={sId}
                          type="button"
                          role="option"
                          aria-selected={isCurrent}
                          onClick={() => handleSwitchStage(sId)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 border ${
                            isCurrent
                              ? "bg-cyan-500/20 border-cyan-400/50 text-white"
                              : "bg-slate-900/60 hover:bg-slate-900 border-transparent text-slate-300"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-white">{item.name}</div>
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
                    }
                  )}
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
                    ? "bg-rose-500 text-white font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Microscope className="w-3 h-3" />
                <span>{activeStage === "hydatid_cyst" ? "Tinción PAS / H&E" : "Tinción Carmín"}</span>
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
              {showMarkers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showMarkers ? "Ocultar marcadores" : "Mostrar marcadores"}</span>
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
              Reconstrucción 3D educativa; no sustituye la observación microscópica.
            </span>
            <span className="hidden xl:inline text-slate-400">
              ·{" "}
              {shaderMode === 1
                ? activeStage === "hydatid_cyst"
                  ? "Tinción PAS / H&E: fondo blanco cálido con capa laminar acelular PAS-positiva (magenta intenso)."
                  : "Tinción Carmín: fondo blanco cálido con coloración diferencial de órganos y ganchos."
                : shaderMode === 2
                ? "SEM: simulación de relieve topográfico de microscopía electrónica de barrido."
                : shaderMode === 3
                ? "Rayos X / Transiluminación: visualización de capas quísticas, vesículas hijas y útero sacular."
                : "Modo Biológico 3D: materiales orgánicos con lectura tridimensional."}
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
                  isAutoRotating ? "bg-emerald-500/25 text-emerald-300" : "text-slate-400 hover:text-white"
                }`}
                title="Autorrotación opcional"
              >
                {isAutoRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>Giro</span>
              </button>
            </div>

            <div
              className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/70 px-2.5 py-1.5 flex items-center gap-2 shadow-lg"
              title="Escala geométrica correspondiente al estadio activo y a la distancia de cámara"
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
            <span>{mobileControlsOpen ? "Ocultar controles" : "Transparencia y corte"}</span>
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
          } grid-cols-1 ${
            stageMeta.hasPeristalsis ? "md:grid-cols-3" : "md:grid-cols-2"
          } gap-3.5 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800`}
        >
          {/* Deslizador 1: Transparencia */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sliderEchinoTrans" className="text-slate-200 font-bold">
                {stageMeta.translucencyLabel}
              </label>
              <span className="text-cyan-300 font-mono font-bold">{translucency}%</span>
            </div>
            <input
              id="sliderEchinoTrans"
              type="range"
              min={0}
              max={100}
              value={translucency}
              onChange={(e) => setTranslucency(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">{stageMeta.translucencyHint}</p>
          </div>

          {/* Deslizador 2: Corte ecuatorial / Sección 3D */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="sliderEchinoCut"
                className="text-slate-200 font-bold flex items-center gap-1.5"
              >
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
                <span className="text-cyan-300 font-mono font-bold">{cutPercent}%</span>
              </div>
            </div>
            <input
              id="sliderEchinoCut"
              type="range"
              min={0}
              max={100}
              value={cutPercent}
              onChange={(e) => setCutPercent(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              Abre una ventana tridimensional en las membranas externas manteniendo intactas las vesículas prolígeras, protoescólices y ganchos internos.
            </p>
          </div>

          {/* Deslizador 3: Ondulación Peristáltica (solo en adulto) */}
          {stageMeta.hasPeristalsis && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="sliderEchinoWave"
                  className="text-slate-200 font-bold flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ondulación Muscular</span>
                </label>
                <span className="text-cyan-300 font-mono font-bold">{wavePercent}%</span>
              </div>
              <input
                id="sliderEchinoWave"
                type="range"
                min={0}
                max={100}
                value={wavePercent}
                onChange={(e) => setWavePercent(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 leading-snug">
                Controla el movimiento suave de las 3 proglótides del cestodo adulto.
              </p>
            </div>
          )}
        </div>

        {/* Selector de Regiones Anatómicas y Detalle Diagnóstico */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Regiones y estructuras representadas (toca para enfocar y ver diagnóstico):
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
              stageMeta.regions.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-3"
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
                        backgroundColor: isWarmLightBg ? reg.colorStain : reg.colorBio,
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
                  <h5 className="text-sm font-bold text-white">{selectedRegion.name}</h5>
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

              <p className="text-slate-300 leading-relaxed">{selectedRegion.summary}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <strong className="text-rose-300">
                    Observación microscópica / Correlación clínica:{" "}
                  </strong>
                  <span className="text-slate-300">{selectedRegion.microscopyNote}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <strong className="text-cyan-300">Reconstrucción educativa 3D: </strong>
                  <span className="text-slate-300">{selectedRegion.reconstruction3DNote}</span>
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
                <div className="text-slate-400 font-mono">{stageMeta.dimensionsNote}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Claves de <em>Echinococcus granulosus</em>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className="text-slate-400">Hosp. definitivo:</span>
                  <span className="text-cyan-300 font-semibold">Perro / cánidos</span>
                  <span className="text-slate-400">Hosp. accidental:</span>
                  <span className="text-amber-300 font-semibold">Humano (quiste)</span>
                  <span className="text-slate-400">Adulto:</span>
                  <span className="text-slate-200">2–7 mm (3 proglótides)</span>
                  <span className="text-slate-400">Capa laminar:</span>
                  <span className="text-rose-300 font-semibold">Acelular PAS+</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Referencias documentales */}
        <div className="pt-2 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
          <div>
            <strong className="text-slate-300">Fuentes de referencia:</strong> CDC DPDx
            Echinococcosis (
            <a
              href="https://www.cdc.gov/dpdx/echinococcosis/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              cdc.gov/dpdx/echinococcosis
            </a>
            ) · WHO-IWGE Cystic Echinococcosis · Guía MINSAL Hidatidosis.
          </div>
          <div>
            Quiste hidatídico · Adulto (3 proglótides) · Protoescólex · Huevo
          </div>
        </div>
      </div>
    </div>
  );
};
