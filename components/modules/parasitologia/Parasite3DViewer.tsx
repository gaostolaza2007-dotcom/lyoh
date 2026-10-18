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

export type TaeniaStageId = "strobila" | "scolex" | "egg" | "cysticercus";
export type TaeniaShaderMode = 0 | 1 | 2 | 3; // 0 = Biológico 3D, 1 = Tinción Carmín / Histológica (fondo blanco cálido), 2 = SEM, 3 = Rayos X

export interface TaeniaRegionMeta {
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
  summary: string;
  microscopyNote: string;
  reconstruction3DNote: string;
}

export interface TaeniaStageMeta {
  id: TaeniaStageId;
  name: string;
  shortName: string;
  subtitle: string;
  dimensionsNote: string;
  scaleBarLabel: string;
  scaleBarWorldUnits: number;
  translucencyLabel: string;
  translucencyHint: string;
  defaultTranslucency: number;
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
  regions: TaeniaRegionMeta[];
}

/**
 * FUNCIONES MATEMÁTICAS DE LA ESPINA DORSAL Y SUPERFICIE ORGÁNICA DE TAENIA SOLIUM
 */
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

function evalSpinePointJS(x: number, time: number, waveScale: number): [number, number, number] {
  const u = Math.max(0.0, x - 1.65) / 26.35;
  const env = u * u * (3.0 - 2.0 * u);
  const amp = 0.35 + 0.65 * waveScale;

  const px = x - 10.5 - env * 1.85 * amp * (1.0 - Math.cos(u * 4.2));
  const py =
    env * amp * (1.85 * Math.sin(u * 5.8 - time * 1.5) + 0.65 * Math.cos(u * 10.5 - time * 2.2));
  const pz =
    env *
    amp *
    (2.65 * Math.sin(u * 4.6 - time * 1.15 + 1.1) + 0.9 * Math.sin(u * 8.8 - time * 1.8));
  return [px, py, pz];
}

function evalSpineTwistJS(x: number, time: number, waveScale: number): number {
  const u = Math.max(0.0, x - 1.65) / 26.35;
  const env = u * u * (3.0 - 2.0 * u);
  const amp = 0.35 + 0.65 * waveScale;
  return env * amp * (0.42 * Math.sin(u * 4.8 - time * 1.1) + 0.18 * Math.cos(u * 7.5));
}

function localToWorldWormPoint(
  localXYZ: [number, number, number],
  time: number,
  waveScale: number
): [number, number, number] {
  const x = localXYZ[0];
  const y = localXYZ[1];
  const z = localXYZ[2];
  const eps = 0.03;
  const pC = evalSpinePointJS(x, time, waveScale);
  const pF = evalSpinePointJS(x + eps, time, waveScale);
  const pB = evalSpinePointJS(Math.max(0.0, x - eps), time, waveScale);
  const T = vec3Norm(vec3Sub(pF, pB));
  const B0 = vec3Norm(vec3Cross(T, [0.0, 1.0, 0.0]));
  const N0 = vec3Cross(B0, T);
  const twist = evalSpineTwistJS(x, time, waveScale);
  const c = Math.cos(twist);
  const s = Math.sin(twist);
  const N = [c * N0[0] - s * B0[0], c * N0[1] - s * B0[1], c * N0[2] - s * B0[2]];
  const B = [s * N0[0] + c * B0[0], s * N0[1] + c * B0[1], s * N0[2] + c * B0[2]];
  return [
    pC[0] + y * N[0] + z * B[0],
    pC[1] + y * N[1] + z * B[1],
    pC[2] + y * N[2] + z * B[2],
  ];
}

function poreSideForSegment(k: number): number {
  return Math.sin(k * 2.3 + Math.cos(k * 1.7)) >= 0.0 ? 1.0 : -1.0;
}

function evaluateTaeniaBodySurface(x: number, phi: number, isSaginata = false) {
  let W = 0.35;
  let H = 0.35;
  let regionId = 2.0;
  let segU = 0.0;
  let segIndex = 0.0;

  if (x < 2.0) {
    if (isSaginata) {
      // Taenia saginata: Escólex inerme cuadrangular/piriforme (1.5–2.0 mm), con depresión apical sin rostelo ni ganchos
      regionId = x < 0.36 ? 1.0 : 2.0;
      const cap = Math.pow(Math.sin(Math.min(1.0, x / 0.34) * (Math.PI * 0.5)), 0.56);
      const apicalPit = -0.075 * Math.exp(-Math.pow(x / 0.16, 2.0));
      const bulbBell = Math.exp(-Math.pow((x - 1.02) / 0.56, 2.0));
      const quadCorner = 1.0 + 0.085 * Math.cos(4.0 * phi) * bulbBell;
      let R =
        (0.36 * cap * (1.0 - smoothstepJS(0.28, 0.54, x)) +
          apicalPit +
          (0.35 + 0.66 * bulbBell) * smoothstepJS(0.16, 0.48, x)) *
        quadCorner;
      if (x > 1.45) {
        const tNeck = smoothstepJS(1.45, 2.0, x);
        R = R * (1.0 - tNeck) + 0.35 * tNeck;
      }

      const suckerAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
      let suckerDisp = 0.0;
      for (let k = 0; k < 4; k++) {
        const dPhi = Math.atan2(Math.sin(phi - suckerAngles[k]), Math.cos(phi - suckerAngles[k]));
        const dxNorm = (x - 1.02) / 0.47;
        const dPhiNorm = dPhi / 0.57;
        const d = Math.hypot(dxNorm, dPhiNorm);
        if (d < 1.28) {
          const rim = 0.27 * Math.exp(-Math.pow((d - 0.77) / 0.22, 2.0));
          const cupT = Math.max(0.0, 1.0 - Math.pow(d / 0.65, 2.0));
          const cup = -0.35 * cupT * cupT;
          suckerDisp += rim + cup;
        }
      }
      R += suckerDisp;
      W = R;
      H = R * (1.0 - 0.24 * smoothstepJS(1.5, 2.0, x));
    } else {
      // Taenia solium: Escólex globuloso armado (~1 mm) con rostelo apical
      regionId = 2.0;
      const cap = Math.pow(Math.sin(Math.min(1.0, x / 0.38) * (Math.PI * 0.5)), 0.72);
      const rostellum = 0.42 * cap * (1.0 - 0.22 * smoothstepJS(0.28, 0.42, x));
      const bulbBell = Math.exp(-Math.pow((x - 1.05) / 0.52, 2.0));
      let R =
        rostellum * (1.0 - smoothstepJS(0.32, 0.58, x)) +
        (0.31 + 0.58 * bulbBell) * smoothstepJS(0.22, 0.55, x);
      if (x > 1.45) {
        const tNeck = smoothstepJS(1.45, 2.0, x);
        R = R * (1.0 - tNeck) + 0.33 * tNeck;
      }

      const suckerAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
      let suckerDisp = 0.0;
      for (let k = 0; k < 4; k++) {
        const dPhi = Math.atan2(Math.sin(phi - suckerAngles[k]), Math.cos(phi - suckerAngles[k]));
        const dxNorm = (x - 1.05) / 0.44;
        const dPhiNorm = dPhi / 0.54;
        const d = Math.hypot(dxNorm, dPhiNorm);
        if (d < 1.25) {
          const rim = 0.23 * Math.exp(-Math.pow((d - 0.76) / 0.22, 2.0));
          const cupT = Math.max(0.0, 1.0 - Math.pow(d / 0.64, 2.0));
          const cup = -0.31 * cupT * cupT;
          suckerDisp += rim + cup;
        }
      }
      R += suckerDisp;
      W = R;
      H = R * (1.0 - 0.25 * smoothstepJS(1.5, 2.0, x));
    }
  } else {
    const flatFactor = smoothstepJS(1.85, 4.2, x);
    W = 0.33 + 1.18 * Math.pow(smoothstepJS(2.0, 22.5, x), 0.85);
    W *= 1.0 - 0.14 * smoothstepJS(24.0, 27.8, x);
    const endCap = Math.pow(Math.sin(Math.min(1.0, (28.02 - x) / 0.45) * (Math.PI * 0.5)), 0.65);
    W *= endCap;

    H =
      (0.25 * (1.0 - flatFactor) + 0.195 * flatFactor) *
      (0.85 + 0.22 * smoothstepJS(3.5, 20.0, x)) *
      endCap;

    if (x < 3.55) {
      regionId = 3.0;
      const nascent = smoothstepJS(2.8, 3.55, x) * Math.sin((x - 2.8) * 18.0) * 0.012;
      W += nascent;
    } else {
      const L = x - 3.55;
      const p = L / (0.5 + 0.0185 * L);
      segIndex = Math.floor(p);
      segU = p - segIndex;

      if (x < 9.5) {
        regionId = 4.0;
      } else if (x < 18.0) {
        regionId = 5.0;
      } else {
        regionId = 6.0;
      }

      const segBlend = smoothstepJS(3.55, 4.15, x);
      const distToEdge = Math.min(segU, 1.0 - segU);
      const groove = 1.0 - segBlend * 0.22 * Math.exp(-Math.pow(distToEdge / 0.095, 2.0));
      const craspedote =
        1.0 + segBlend * 0.065 * (segU - 0.35) * smoothstepJS(0.04, 0.16, 1.0 - segU);

      W *= groove * craspedote;
      H *= 1.0 - segBlend * 0.15 * Math.exp(-Math.pow(distToEdge / 0.095, 2.0));

      const cPhi = Math.cos(phi);
      const sPhi = Math.sin(phi);

      if (segIndex >= 8.0) {
        const pSide = poreSideForSegment(segIndex);
        const sideMatch = cPhi * pSide;
        if (sideMatch > 0.55) {
          const du = (segU - 0.52) / 0.11;
          const dy = sPhi / 0.35;
          const dp = Math.hypot(du, dy);
          if (dp < 1.2) {
            const papilla = 0.095 * Math.exp(-dp * dp * 1.8);
            const poreDimple = -0.045 * Math.exp(-dp * dp * 12.0);
            W += (papilla + poreDimple) * smoothstepJS(8.0, 10.0, segIndex);
          }
        }
      }
    }
  }

  const flat = smoothstepJS(1.85, 4.2, x);
  const cPhi = Math.cos(phi);
  const sPhi = Math.sin(phi);

  const zDir = Math.sign(cPhi) * Math.pow(Math.abs(cPhi), 1.0 - 0.32 * flat);
  const yDir = Math.sign(sPhi) * Math.pow(Math.abs(sPhi), 1.0 - 0.15 * flat);

  return {
    pos: [x, H * yDir, W * zDir] as [number, number, number],
    regionId,
    segU,
    segV: cPhi,
    segIndex,
  };
}

/**
 * Construye la malla continua orgánica de Taenia solium (escólex armado con 28 ganchos)
 * o de Taenia saginata (escólex inerme cuadrangular con 4 ventosas y sin ganchos)
 */
function buildTaeniaWormBufferGeometry(isSaginata = false): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const meta1: number[] = [];
  const indices: number[] = [];

  const xSamples: number[] = [];
  const nScolex = 95;
  const nStrobila = 265;
  for (let i = 0; i <= nScolex; i++) {
    xSamples.push((i / nScolex) * 2.05);
  }
  for (let i = 1; i <= nStrobila; i++) {
    const t = i / nStrobila;
    xSamples.push(2.05 + t * (28.0 - 2.05));
  }

  const nRings = xSamples.length;
  const nRadial = 64;

  for (let i = 0; i < nRings; i++) {
    const x = xSamples[i];
    const epsX = i < nScolex ? 0.008 : 0.025;
    const epsPhi = 0.025;

    for (let j = 0; j <= nRadial; j++) {
      const phi = (j / nRadial) * Math.PI * 2.0;
      const surf = evaluateTaeniaBodySurface(x, phi, isSaginata);

      const xPrev = Math.max(0.0005, x - epsX);
      const xNext = Math.min(27.999, x + epsX);
      const pX1 = evaluateTaeniaBodySurface(xNext, phi, isSaginata).pos;
      const pX0 = evaluateTaeniaBodySurface(xPrev, phi, isSaginata).pos;
      const pP1 = evaluateTaeniaBodySurface(x, phi + epsPhi, isSaginata).pos;
      const pP0 = evaluateTaeniaBodySurface(x, phi - epsPhi, isSaginata).pos;

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

  // En Taenia solium (!isSaginata), añadir la doble corona de 28 ganchos quitinosos falciformes.
  // En Taenia saginata (isSaginata), el escólex es estrictamente inerme (sin rostelo ni ganchos).
  if (!isSaginata) {
    const totalHooks = 28;
    const hookSteps = 16;
    const hookSides = 10;

    for (let h = 0; h < totalHooks; h++) {
      const isLarge = h % 2 === 0;
      const angle = (h / totalHooks) * Math.PI * 2.0;
      const cA = Math.cos(angle);
      const sA = Math.sin(angle);

      const baseX = isLarge ? 0.20 : 0.29;
      const baseR = isLarge ? 0.34 : 0.39;
      const hookLen = isLarge ? 0.24 : 0.175;
      const baseThick = isLarge ? 0.026 : 0.021;

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

        const guardBulge = 1.0 + 0.45 * Math.exp(-Math.pow((t - 0.28) / 0.14, 2.0));
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
  }

/**
 * Añade una microesfera 3D (huevo embrionado intrauterino o folículo reproductor)
 * al BufferGeometry del estróbilo de Taenia solium / Taenia saginata
 */
function appendTaeniaInternalSphere(
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
  latBands = 6,
  lonBands = 8
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

  // --- ÓRGANOS REPRODUCTORES 3D EN PROGLÓTIDES MADURAS (segIndex 10..17, x: ~9.6 -> 17.8, regionId = 8.0) ---
  for (let segIdx = 10; segIdx <= 17; segIdx++) {
    const pSide = poreSideForSegment(segIdx);
    // Ovario bilobulado (T. saginata) o trilobulado con lóbulo accesorio (T. solium)
    for (const sideSign of [-1.0, 1.0]) {
      for (let k = 0; k < 4; k++) {
        const uOv = 0.64 + (k - 1.5) * 0.04;
        const pVal = segIdx + uOv;
        const L = (0.5 * pVal) / (1.0 - 0.0185 * pVal);
        const xOv = 3.55 + L;
        const wApprox = 0.33 + 1.18 * Math.pow(smoothstepJS(2.0, 22.5, xOv), 0.85);
        const zOv = sideSign * (0.20 + k * 0.045) * wApprox;
        appendTaeniaInternalSphere(
          positions,
          normals,
          meta1,
          indices,
          xOv,
          -0.01,
          zOv,
          0.055,
          0.036,
          0.052,
          1.0,
          8.0,
          6,
          8
        );
      }
    }
    if (!isSaginata) {
      // Tercer lóbulo ovárico accesorio en Taenia solium
      const pVal = segIdx + 0.56;
      const xAcc = 3.55 + (0.5 * pVal) / (1.0 - 0.0185 * pVal);
      const wApprox = 0.33 + 1.18 * Math.pow(smoothstepJS(2.0, 22.5, xAcc), 0.85);
      appendTaeniaInternalSphere(
        positions,
        normals,
        meta1,
        indices,
        xAcc,
        -0.005,
        pSide * 0.14 * wApprox,
        0.052,
        0.036,
        0.048,
        1.0,
        8.0,
        6,
        8
      );
    }
    // Folículos testiculares 3D
    for (let t = 0; t < 10; t++) {
      const uT = 0.16 + ((t * 0.37) % 0.64);
      const vT = ((t % 2 === 0 ? 1 : -1) * (0.28 + ((t * 0.19) % 0.36)));
      const pVal = segIdx + uT;
      const xT = 3.55 + (0.5 * pVal) / (1.0 - 0.0185 * pVal);
      const wApprox = 0.33 + 1.18 * Math.pow(smoothstepJS(2.0, 22.5, xT), 0.85);
      appendTaeniaInternalSphere(
        positions,
        normals,
        meta1,
        indices,
        xT,
        -0.015,
        vT * wApprox,
        0.038,
        0.030,
        0.038,
        0.0,
        8.0,
        5,
        7
      );
    }
  }

  // --- HUEVOS EMBRIONADOS 3D EN EL INTERIOR DE LAS PROGLÓTIDES GRÁVIDAS (segIndex 18..24, x: 18.0 -> 27.6, regionId = 7.0) ---
  // Distribuidos a lo largo del tallo uterino central y de las ramas laterales (7–13 dendríticas en T. solium vs 15–20 dicotómicas en T. saginata)
  let taeniaEggCounter = 0;
  for (let segIdx = 18; segIdx <= 24; segIdx++) {
    const nBranches = isSaginata ? 15 : 9;
    for (let bIdx = 0; bIdx < nBranches; bIdx++) {
      const uBranch = 0.09 + ((bIdx + 0.5) / nBranches) * 0.82;
      const pVal = segIdx + uBranch;
      const L = (0.5 * pVal) / (1.0 - 0.0185 * pVal);
      const xBase = 3.55 + L;
      if (xBase > 27.55) continue;

      const endCap = Math.pow(Math.sin(Math.min(1.0, (28.02 - xBase) / 0.45) * (Math.PI * 0.5)), 0.65);
      const W =
        (0.33 + 1.18 * Math.pow(smoothstepJS(2.0, 22.5, xBase), 0.85)) *
        (1.0 - 0.14 * smoothstepJS(24.0, 27.8, xBase)) *
        endCap;
      const H = 0.20 * endCap;

      // Huevos en el tallo uterino longitudinal mediano
      const rStemEgg = 0.048 + 0.006 * Math.sin(taeniaEggCounter * 1.7);
      appendTaeniaInternalSphere(
        positions,
        normals,
        meta1,
        indices,
        xBase,
        (bIdx % 2 === 0 ? 0.16 : -0.14) * H,
        ((bIdx % 3) - 1) * 0.03 * W,
        rStemEgg,
        rStemEgg * 0.92,
        rStemEgg,
        taeniaEggCounter++,
        7.0,
        6,
        8
      );

      // Huevos a lo largo de las ramas uterinas laterales (+Z y -Z) y sus bifurcaciones
      for (const sideSign of [-1.0, 1.0]) {
        const maxReach = 0.62 + 0.05 * Math.sin(bIdx * 2.9 + segIdx + sideSign);
        const nEggsPerBranch = isSaginata ? 4 : 5;
        for (let e = 0; e < nEggsPerBranch; e++) {
          const tReach = (e + 0.4) / nEggsPerBranch;
          const vAbs = 0.10 + tReach * (maxReach - 0.10);
          const forkSign = e >= nEggsPerBranch - 2 ? (e % 2 === 0 ? 1.0 : -1.0) : 0.0;
          const uForkOffset = forkSign * 0.018 * smoothstepJS(0.25, 0.62, vAbs);
          const pEgg = segIdx + uBranch + uForkOffset;
          const xEgg = 3.55 + (0.5 * pEgg) / (1.0 - 0.0185 * pEgg);
          if (xEgg > 27.55) continue;

          const yEgg = ((e + bIdx) % 2 === 0 ? 0.18 : -0.16) * H;
          const zEgg = sideSign * vAbs * W;
          const rEgg = 0.044 + 0.007 * Math.cos(taeniaEggCounter * 2.3);

          appendTaeniaInternalSphere(
            positions,
            normals,
            meta1,
            indices,
            xEgg,
            yEgg,
            zEgg,
            rEgg,
            rEgg * 0.92,
            rEgg,
            taeniaEggCounter++,
            7.0,
            6,
            8
          );
        }
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("a_meta", new THREE.Float32BufferAttribute(meta1, 4));
  geo.setIndex(indices);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 30.0);
  return geo;
}

/**
 * Construye un gancho falciforme orgánico 3D para la oncosfera hexacanta o el cisticerco
 */
function buildFalciformHookGeometry(length = 0.52, baseRadius = 0.042): THREE.BufferGeometry {
  const curvePts = [
    new THREE.Vector3(0, -length * 0.5, 0),
    new THREE.Vector3(0.03 * length, -length * 0.12, 0),
    new THREE.Vector3(0.11 * length, length * 0.16, 0),
    new THREE.Vector3(0.02 * length, length * 0.42, 0),
    new THREE.Vector3(-0.18 * length, length * 0.52, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(curvePts);
  const segs = 32;
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
    const guard = 1.0 + 0.55 * Math.exp(-Math.pow((u - 0.45) / 0.14, 2.0));
    const r = baseRadius * guard * Math.sin(Math.PI * Math.pow(u, 0.68)) + 0.002;

    for (let j = 0; j <= radSegs; j++) {
      const v = j / radSegs;
      const phi = v * Math.PI * 2.0;
      const nx = Math.cos(phi) * N.x + Math.sin(phi) * 0.75 * B.x;
      const ny = Math.cos(phi) * N.y + Math.sin(phi) * 0.75 * B.y;
      const nz = Math.cos(phi) * N.z + Math.sin(phi) * 0.75 * B.z;
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
 * SHADERS GLSL DE TAENIA SOLIUM Y TAENIA SAGINATA (Estróbilo/Escólex + Huevo + Cisticerco)
 * ---------------------------------------------------------------------------
 */

const TAENIA_WORM_VERTEX_SHADER = `
  precision highp float;

  attribute vec4 a_meta;

  uniform float u_time;
  uniform float u_waveScale;

  varying vec3 v_worldPos;
  varying vec3 v_worldNormal;
  varying vec3 v_localPos;
  varying vec3 v_localNormal;
  varying vec4 v_meta;

  vec3 evalSpinePoint(float x, float t, float waveScale) {
    float u = max(0.0, x - 1.65) / 26.35;
    float env = u * u * (3.0 - 2.0 * u);
    float amp = 0.35 + 0.65 * waveScale;

    float px = (x - 10.5) - env * 1.85 * amp * (1.0 - cos(u * 4.2));
    float py = env * amp * (1.85 * sin(u * 5.8 - t * 1.5) + 0.65 * cos(u * 10.5 - t * 2.2));
    float pz = env * amp * (2.65 * sin(u * 4.6 - t * 1.15 + 1.1) + 0.9 * sin(u * 8.8 - t * 1.8));
    return vec3(px, py, pz);
  }

  float evalSpineTwist(float x, float t, float waveScale) {
    float u = max(0.0, x - 1.65) / 26.35;
    float env = u * u * (3.0 - 2.0 * u);
    float amp = 0.35 + 0.65 * waveScale;
    return env * amp * (0.42 * sin(u * 4.8 - t * 1.1) + 0.18 * cos(u * 7.5));
  }

  void main() {
    float x = position.x;
    float eps = 0.03;
    vec3 pC = evalSpinePoint(x, u_time, u_waveScale);
    vec3 pF = evalSpinePoint(x + eps, u_time, u_waveScale);
    vec3 pB = evalSpinePoint(max(0.0, x - eps), u_time, u_waveScale);

    vec3 T = normalize(pF - pB);
    vec3 B0 = normalize(cross(T, vec3(0.0, 1.0, 0.0)));
    vec3 N0 = cross(B0, T);

    float twist = evalSpineTwist(x, u_time, u_waveScale);
    float c = cos(twist);
    float s = sin(twist);
    vec3 N = c * N0 - s * B0;
    vec3 B = s * N0 + c * B0;

    vec3 worldPos = pC + position.y * N + position.z * B;
    vec3 worldNormal = normalize(normal.x * T + normal.y * N + normal.z * B);

    v_worldPos = worldPos;
    v_worldNormal = worldNormal;
    v_localPos = position;
    v_localNormal = normal;
    v_meta = a_meta;

    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
  }
`;

const TAENIA_WORM_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;
  varying vec3 v_worldNormal;
  varying vec3 v_localPos;
  varying vec3 v_localNormal;
  varying vec4 v_meta;

  uniform float u_translucency;
  uniform float u_cutPlane;
  uniform int u_shaderMode;
  uniform int u_highlightRegion;
  uniform int u_isSaginata;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float poreSide(float k) {
    return sin(k * 2.3 + cos(k * 1.7)) >= 0.0 ? 1.0 : -1.0;
  }

  vec3 computeInternalAnatomy(float segU, float segV, float segIdx, float regionId, float xCoord) {
    if (regionId < 2.5) return vec3(0.0);

    float canal = exp(-pow((abs(segV) - 0.78) / 0.032, 2.0));
    if (regionId > 3.5 && abs(segV) < 0.78) {
      canal = max(canal, 0.75 * exp(-pow((segU - 0.89) / 0.025, 2.0)));
    }

    float primaryOrgan = 0.0;
    float secondaryOrgan = 0.0;
    float pSide = poreSide(segIdx);

    if (regionId > 3.5 && regionId < 4.5) {
      float streak = exp(-pow(segV / 0.12, 2.0)) * smoothstep(0.15, 0.35, segU) * smoothstep(0.88, 0.68, segU);
      primaryOrgan = 0.45 * streak;
    }

    if (regionId > 4.5 && regionId < 5.5) {
      vec2 pLobe1 = vec2((segU - 0.67) / 0.115, (abs(segV) - 0.27) / 0.17);
      float mainLobes = exp(-dot(pLobe1, pLobe1) * 1.55);
      float lobuleTex = 0.7 + 0.3 * sin(segU * 55.0) * cos(segV * 45.0);
      mainLobes *= lobuleTex;

      // En Taenia solium (u_isSaginata == 0): tercer lóbulo ovárico accesorio del lado del poro.
      // En Taenia saginata (u_isSaginata == 1): ovario estrictamente bilobulado (sin lóbulo accesorio), pero con esfínter vaginal muscular.
      float accLobe = 0.0;
      float vaginalSphincter = 0.0;
      if (u_isSaginata == 0) {
        vec2 pAcc = vec2((segU - 0.56) / 0.075, (segV - pSide * 0.14) / 0.09);
        accLobe = exp(-dot(pAcc, pAcc) * 1.8) * lobuleTex;
      } else {
        vec2 pSph = vec2((segU - 0.54) / 0.036, (segV - pSide * 0.68) / 0.062);
        vaginalSphincter = exp(-dot(pSph, pSph) * 1.9);
      }

      vec2 pVit = vec2((segU - 0.83) / 0.045, segV / 0.22);
      float vitelline = exp(-dot(pVit, pVit) * 2.0);

      float ductU = 0.52 + 0.12 * exp(-pow(segV / 0.35, 2.0));
      float inPoreSide = step(0.0, segV * pSide) * step(abs(segV), 0.98);
      float genitalDuct = inPoreSide * exp(-pow((segU - ductU) / 0.028, 2.0));

      primaryOrgan = clamp(mainLobes + accLobe + 0.95 * vaginalSphincter + 0.9 * vitelline + 0.85 * genitalDuct, 0.0, 1.0);

      if (abs(segV) < 0.74 && segU > 0.10 && segU < 0.82) {
        vec2 gridScale = (u_isSaginata == 1) ? vec2(23.0, 18.0) : vec2(18.0, 14.0);
        vec2 gridUV = vec2(segU * gridScale.x, segV * gridScale.y);
        vec2 cellId = floor(gridUV);
        vec2 cellF = fract(gridUV) - 0.5;
        float h = hash21(cellId + segIdx * 7.13);
        float thresh = (u_isSaginata == 1) ? 0.24 : 0.32;
        if (h > thresh && mainLobes < 0.35) {
          vec2 jitter = vec2(fract(h * 13.7) - 0.5, fract(h * 29.3) - 0.5) * 0.45;
          float dDot = length(cellF - jitter);
          secondaryOrgan = smoothstep(0.28, 0.10, dDot) * 0.78;
        }
      }
    }

    if (regionId > 5.5) {
      float stemMask = smoothstep(0.06, 0.12, segU) * smoothstep(0.94, 0.88, segU);
      float stem = exp(-pow(segV / 0.058, 2.0)) * stemMask;

      float branches = 0.0;
      float vAbs = abs(segV);
      float sideSign = sign(segV);

      if (u_isSaginata == 1) {
        // Taenia saginata: 15 a 20+ ramas uterinas laterales por lado con ramificación dicotómica fina
        if (vAbs < 0.76 && segU > 0.06 && segU < 0.94) {
          float nBranches = 18.0;
          float branchCoord = (segU - 0.07) / 0.86 * nBranches;
          float bIdx = floor(branchCoord);
          float bFrac = fract(branchCoord) - 0.5;

          if (bIdx >= 0.0 && bIdx < nBranches) {
            float curveOffset = 0.06 * (vAbs - 0.18) * sin(bIdx * 1.3 + sideSign);
            float forkSpread = 0.21 * smoothstep(0.26, 0.68, vAbs);

            float d1 = abs(bFrac - curveOffset - forkSpread);
            float d2 = abs(bFrac - curveOffset + forkSpread);
            float dTrunk = abs(bFrac - curveOffset);

            float trunkWeight = 1.0 - smoothstep(0.24, 0.40, vAbs);
            float forkWeight = smoothstep(0.22, 0.38, vAbs);

            float dBranch = trunkWeight * dTrunk + forkWeight * min(d1, d2);
            float maxReach = 0.66 + 0.05 * sin(bIdx * 2.9 + segIdx + sideSign);
            float reachMask = smoothstep(maxReach, maxReach - 0.07, vAbs) * smoothstep(0.02, 0.07, vAbs);

            float width = 0.115 + 0.035 * smoothstep(0.32, 0.65, vAbs);
            branches = exp(-pow(dBranch / width, 2.0)) * reachMask;
          }
        }
      } else {
        // Taenia solium: 7 a 13 ramas uterinas laterales por lado con ramificación dendrítica gruesa
        if (vAbs < 0.75 && segU > 0.08 && segU < 0.92) {
          float branchCoord = (segU - 0.10) / 0.80 * 9.0;
          float bIdx = floor(branchCoord);
          float bFrac = fract(branchCoord) - 0.5;

          if (bIdx >= 0.0 && bIdx < 9.0) {
            float phaseShift = 0.08 * sin(bIdx * 2.1 + sideSign * 1.4);
            float curveOffset = 0.12 * (vAbs - 0.2) * sin(bIdx * 1.7 + sideSign);
            float forkSpread = 0.24 * smoothstep(0.25, 0.65, vAbs);

            float d1 = abs(bFrac - curveOffset - phaseShift - forkSpread);
            float d2 = abs(bFrac - curveOffset - phaseShift + forkSpread);
            float dTrunk = abs(bFrac - curveOffset - phaseShift);

            float trunkWeight = 1.0 - smoothstep(0.22, 0.42, vAbs);
            float forkWeight = smoothstep(0.20, 0.38, vAbs);

            float dBranch = trunkWeight * dTrunk + forkWeight * min(d1, d2);
            float maxReach = 0.62 + 0.08 * sin(bIdx * 3.7 + segIdx + sideSign);
            float reachMask = smoothstep(maxReach, maxReach - 0.08, vAbs) * smoothstep(0.02, 0.08, vAbs);

            float width = 0.13 + 0.05 * smoothstep(0.3, 0.6, vAbs);
            float bVal = exp(-pow(dBranch / width, 2.0)) * reachMask;
            branches = bVal;
          }
        }
      }

      float eggGranules = 0.78 + 0.22 * sin(segU * 140.0) * cos(segV * 120.0);
      primaryOrgan = clamp(max(stem, branches) * eggGranules, 0.0, 1.0);

      float inPoreSide = step(0.0, segV * pSide) * step(abs(segV), 0.98);
      secondaryOrgan = inPoreSide * exp(-pow((segU - 0.52) / 0.022, 2.0)) * 0.5;
    }

    return vec3(primaryOrgan, secondaryOrgan, canal);
  }

  void main() {
    int rId = int(v_meta.w + 0.5);

    // Los huevos embrionados 3D internos (rId == 7) y los órganos reproductores maduros 3D (rId == 8)
    // se revelan al activar el Corte Histológico / Sección 3D (u_cutPlane > 0.01).
    if (u_cutPlane <= 0.01 && rId >= 7) {
      discard;
    }

    // Al activar el corte histológico, seccionamos la pared dorsal del estróbilo (rId >= 2 && rId <= 6)
    // preservando la cubeta ventral para que los huevos embrionados 3D (rId == 7) y órganos (rId == 8) se vean adentro.
    if (u_cutPlane > 0.01 && rId >= 2 && rId <= 6) {
      float cutThreshold = mix(0.24, -0.05, clamp(u_cutPlane, 0.0, 1.0));
      if (v_localPos.y > cutThreshold) {
        discard;
      }
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

    if (rId == 7) {
      // --- HUEVOS EMBRIONADOS 3D EN EL INTERIOR DE LAS RAMAS UTERINAS GRÁVIDAS ---
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

      if (u_highlightRegion == 6) {
        color += vec3(0.12, 0.24, 0.32) * (0.45 + 0.55 * fresnel);
      }
      color = color / (1.0 + color * 0.18);
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    if (rId == 8) {
      // --- ÓRGANOS REPRODUCTORES 3D EN EL INTERIOR DE LAS PROGLÓTIDES MADURAS ---
      bool isOvary = v_meta.z > 0.5;
      float gran = 0.86 + 0.14 * sin(v_meta.x * 28.0) * cos(v_meta.y * 28.0);
      if (u_shaderMode == 0) {
        vec3 orgCol = isOvary ? vec3(0.84, 0.32, 0.48) : vec3(0.78, 0.56, 0.36);
        color = (orgCol * gran) * (0.30 + 0.60 * wrap1 + 0.18 * diff2) + vec3(1.0, 0.92, 0.90) * spec * 0.45 + orgCol * fresnel * 0.25;
      } else if (u_shaderMode == 1) {
        vec3 stCol = isOvary ? vec3(0.62, 0.08, 0.28) : vec3(0.76, 0.22, 0.40);
        color = (stCol * gran) * (0.48 + 0.46 * wrap1) + vec3(0.98, 0.84, 0.90) * spec * 0.35;
      } else if (u_shaderMode == 2) {
        float lum = (0.22 + 0.62 * pow(1.0 - ndotv, 1.6) + 0.24 * wrap1) * gran;
        color = vec3(lum);
      } else {
        vec3 rxCol = isOvary ? vec3(0.98, 0.36, 0.72) : vec3(0.38, 0.82, 1.0);
        color = rxCol * (0.42 + 0.65 * fresnel);
      }

      if (u_highlightRegion == 5) {
        color += vec3(0.12, 0.24, 0.32) * (0.45 + 0.55 * fresnel);
      }
      color = color / (1.0 + color * 0.18);
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    float microTex = sin(v_localPos.x * 45.0) * cos(v_meta.y * 35.0) * 0.025;

    vec3 anatomy = computeInternalAnatomy(v_meta.x, v_meta.y, v_meta.z, v_meta.w, v_localPos.x);
    float organPrimary = anatomy.x;
    float organSecondary = anatomy.y;
    float canal = anatomy.z;

    float internalVis = clamp(u_translucency + (isBackFace ? 0.65 : 0.0), 0.0, 1.0);

    if (u_shaderMode == 0) {
      // MODO 0: BIOLÓGICO / ESQUEMÁTICO 3D
      if (rId == 1 && u_isSaginata == 0) {
        float hookTip = v_meta.x;
        vec3 hookBaseCol = mix(vec3(0.86, 0.76, 0.56), vec3(0.98, 0.94, 0.84), hookTip);
        color = hookBaseCol * (0.25 + 0.75 * wrap1) + vec3(1.0, 0.96, 0.88) * pow(spec, 0.8) * 0.95 + vec3(0.45, 0.35, 0.2) * fresnel;
      } else {
        vec3 surfaceIvory = (isBackFace ? vec3(0.85, 0.78, 0.70) : vec3(0.93, 0.89, 0.81)) + microTex;
        vec3 sssWarm = vec3(0.88, 0.58, 0.52);

        if (rId == 1 && u_isSaginata == 1) {
          // Depresión apical inerme de T. saginata (frecuentemente con ligera pigmentación central)
          float pitDepth = clamp(1.0 - v_localPos.x / 0.36, 0.0, 1.0);
          surfaceIvory = mix(surfaceIvory, vec3(0.75, 0.63, 0.57), pitDepth * 0.65);
        }

        if (rId == 2 && v_localPos.x > 0.55 && v_localPos.x < 1.55) {
          float radialR = length(v_localPos.yz);
          float cupDepth = clamp((0.88 - radialR) * 2.2, 0.0, 1.0);
          surfaceIvory = mix(surfaceIvory, vec3(0.76, 0.62, 0.58), cupDepth * 0.75);
        }

        vec3 organCol = (rId == 6) ? vec3(0.55, 0.22, 0.26) : vec3(0.72, 0.26, 0.38);
        vec3 secCol = vec3(0.68, 0.45, 0.32);
        vec3 canalCol = vec3(0.75, 0.85, 0.88);

        vec3 baseBio = surfaceIvory;
        baseBio = mix(baseBio, secCol, organSecondary * internalVis * 0.75);
        baseBio = mix(baseBio, canalCol, canal * internalVis * 0.55);
        baseBio = mix(baseBio, organCol, organPrimary * internalVis * 0.88);

        vec3 lit = baseBio * (0.22 + 0.62 * diff1 + 0.25 * diff2) + sssWarm * (wrap1 * 0.28 * (1.0 - diff1 * 0.5));
        color = lit + vec3(1.0, 0.98, 0.95) * spec * 0.55 + vec3(0.65, 0.78, 0.88) * fresnel * 0.28;
      }
    } else if (u_shaderMode == 1) {
      // MODO 1: TINCIÓN CARMÍN / HISTOLÓGICA (Sobre fondo blanco ligeramente cálido #faf7f2)
      if (rId == 1 && u_isSaginata == 0) {
        color = vec3(0.65, 0.12, 0.28) * (0.4 + 0.6 * wrap1) + vec3(1.0, 0.8, 0.88) * spec * 0.7;
      } else {
        vec3 slideBg = isBackFace ? vec3(0.92, 0.72, 0.79) : vec3(0.95, 0.78, 0.84);
        vec3 stainDeep = vec3(0.52, 0.04, 0.20);
        vec3 stainMid = vec3(0.76, 0.14, 0.35);

        float density = 0.22 + 0.45 * fresnel;
        density += organPrimary * (0.45 + 0.50 * internalVis);
        density += organSecondary * (0.30 + 0.40 * internalVis);
        density += canal * 0.25 * internalVis;

        vec3 stained = mix(slideBg, stainMid, clamp(density, 0.0, 1.0));
        stained = mix(stained, stainDeep, clamp(organPrimary * (0.5 + 0.5 * internalVis), 0.0, 1.0));
        color = stained * (0.55 + 0.45 * wrap1) + vec3(1.0, 0.85, 0.92) * spec * 0.35;
      }
    } else if (u_shaderMode == 2) {
      // MODO 2: SEM (Microscopía Electrónica de Barrido)
      float semEdge = pow(1.0 - max(0.0, dot(N, V)), 1.65);
      float semDiff = 0.25 * diff1 + 0.18 * diff2;
      float semMicro = 1.0 + sin(v_localPos.x * 80.0) * cos(v_meta.y * 60.0) * 0.06;
      float lum = (0.14 + 0.72 * semEdge + semDiff) * semMicro;
      lum += (organPrimary * 0.25 + canal * 0.15) * u_translucency;
      color = vec3(lum * 0.94, lum * 0.96, lum * 1.02) + vec3(0.25) * spec;
    } else {
      // MODO 3: RAYOS X / TRANSILUMINACIÓN
      if (rId == 1 && u_isSaginata == 0) {
        color = vec3(0.95, 0.35, 0.75) * (0.5 + 0.8 * fresnel) + vec3(1.0) * spec;
      } else {
        vec3 rimGlow = vec3(0.08, 0.55, 0.85) * fresnel * 1.35;
        vec3 baseDark = vec3(0.03, 0.10, 0.18) * (0.4 + 0.6 * wrap1);
        vec3 organGlow = (rId == 6)
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
 * Shaders orgánicos para el Huevo embrionado (embrióforo radiado + oncosfera hexacanta)
 * y el Cisticerco (vesícula translúcida + escólex invaginado)
 */
const STAGE_VERTEX_SHADER = `
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

const STAGE_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;
  varying vec3 v_localPos;
  varying vec3 v_worldNormal;
  varying vec2 v_uv;

  uniform int u_partId;
  // 10 = Embrióforo estriado radial externo
  // 11 = Oncosfera hexacanta (embrión interno)
  // 12 = Ganchos quitinosos (huevo / cisticerco)
  // 20 = Vesícula translúcida de Cysticercus cellulosae
  // 21 = Escólex invaginado (nódulo mural) y canal espiral
  uniform int u_shaderMode;
  uniform float u_translucency;
  uniform float u_cutZ;
  uniform int u_highlight;

  void main() {
    if (v_worldPos.z > u_cutZ) discard;

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
    float spec = pow(max(0.0, dot(N, H1)), 28.0) * 0.25;

    vec3 color = vec3(0.0);
    float alpha = 1.0;

    if (u_partId == 10) {
      // --- EMBRIÓFORO GRUESO CON ESTRIACIONES RADIALES DE QUERATINA ---
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
      // --- ONCOSFERA HEXACANTA (EMBRIÓN INTERNO) ---
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

    } else if (u_partId == 12) {
      // --- GANCHOS QUITINOSOS REFRINGENTES ---
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

    } else if (u_partId == 20) {
      // --- VESÍCULA TRANSLÚCIDA DE CYSTICERCUS CELLULOSAE ---
      float microtriches = 0.96 + 0.04 * sin(v_localPos.x * 28.0) * cos(v_localPos.y * 28.0);
      float baseOp = clamp(0.86 - u_translucency * 0.72, 0.10, 0.90);

      if (u_shaderMode == 0) {
        vec3 vesCore = vec3(0.72, 0.86, 0.94) * microtriches;
        vec3 vesRim  = vec3(0.92, 0.96, 1.00);
        color = mix(vesCore, vesRim, fresnel * 0.65) * (0.36 + 0.52 * wrap1 + 0.18 * diff2) + spec * 0.6;
      } else if (u_shaderMode == 1) {
        vec3 vesStainIn  = vec3(0.92, 0.76, 0.82);
        vec3 vesStainRim = vec3(0.66, 0.22, 0.38);
        color = mix(vesStainIn, vesStainRim, 0.25 + 0.65 * fresnel) * (0.52 + 0.42 * wrap1);
      } else if (u_shaderMode == 2) {
        float lum = (0.16 + 0.68 * fresnel + 0.24 * wrap1) * microtriches;
        color = vec3(lum * 0.94, lum * 0.96, lum * 1.02);
      } else {
        color = vec3(0.08, 0.56, 0.88) * (0.25 + 0.85 * fresnel);
      }
      alpha = clamp(baseOp * (0.34 + 0.66 * pow(fresnel, 0.85)), 0.08, 0.92);

    } else {
      // --- ESCÓLEX INVAGINADO (NÓDULO MURAL BLANCO NACARADO) ---
      if (u_shaderMode == 0) {
        vec3 nodCore = vec3(0.95, 0.90, 0.78);
        vec3 nodDeep = vec3(0.78, 0.62, 0.48);
        color = mix(nodCore, nodDeep, fresnel * 0.5) * (0.32 + 0.58 * wrap1 + 0.18 * diff2) + spec * 0.45;
      } else if (u_shaderMode == 1) {
        vec3 nodStain = vec3(0.68, 0.12, 0.30);
        color = nodStain * (0.46 + 0.48 * wrap1 + 0.14 * diff2) + vec3(0.96, 0.82, 0.88) * spec * 0.4;
      } else if (u_shaderMode == 2) {
        float lum = 0.26 + 0.58 * fresnel + 0.26 * wrap1;
        color = vec3(lum);
      } else {
        color = vec3(0.96, 0.36, 0.68) * (0.45 + 0.65 * fresnel);
      }
      alpha = 0.98;
    }

    if (u_highlight == 1) {
      color += vec3(0.12, 0.22, 0.28) * (0.45 + 0.55 * fresnel);
      alpha = max(alpha, 0.65);
    }

    color = color / (1.0 + color * 0.15);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * METADATOS ANATÓMICOS Y CLÍNICOS DE LOS 4 ESTADIOS DE TAENIA SOLIUM
 */
export const TAENIA_STAGES: Record<TaeniaStageId, TaeniaStageMeta> = {
  strobila: {
    id: "strobila",
    name: "Estróbilo adulto completo y Escólex armado (teniasis intestinal)",
    shortName: "Estróbilo y Escólex",
    subtitle:
      "Platelminto adulto acintado con escólex armado (28 ganchos y 4 ventosas), cuello proliferativo y proglótides inmaduras, maduras y grávidas",
    dimensionsNote:
      "Adulto: 2 a 4 m (hasta 7 m) · Escólex: ~1 mm · Proglótide grávida: ~12 × 6 mm (7–13 ramas uterinas)",
    scaleBarLabel: "2 mm",
    scaleBarWorldUnits: 2.0,
    translucencyLabel: "Translucidez Tegumentaria (órganos internos)",
    translucencyHint:
      "Aumenta la translucidez para observar el ovario trilobulado, los folículos testiculares y las 7–13 ramas uterinas dendríticas.",
    defaultTranslucency: 42,
    hasPeristalsis: true,
    defaultCamera: {
      position: [-8.6, 5.2, 14.2],
      target: [-2.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [-11.8, 0.8, 2.2],
      target: [-9.8, 0.1, 0.0],
    },
    focusButtonLabel: "Enfocar escólex",
    fullButtonLabel: "Ver estróbilo completo",
    overviewSummary:
      "Taenia solium habita en el intestino delgado humano fijada por su escólex armado. Su cuerpo acintado (estróbilo) muestra transición continua desde el cuello germinativo hacia proglótides maduras hermafroditas (con ovario trilobulado) y proglótides grávidas terminales (con 7 a 13 ramas uterinas laterales).",
    regions: [
      {
        id: "rostellum",
        number: 1,
        name: "Rostelo apical y doble corona de 28 ganchos quitinosos",
        shortLabel: "Rostelo y ganchos",
        badge: "Extremo Apical · Escólex",
        scale: "Ganchos: 130 – 180 µm",
        regionCode: 1,
        colorBio: "#f59e0b",
        colorStain: "#be123c",
        localAnchor: [0.28, 0.35, 0.25],
        labelOffset: [-115, -48],
        camGoal: {
          position: [-11.9, 0.65, 1.75],
          target: [-10.22, 0.25, 0.15],
        },
        defaultTranslucency: 20,
        summary:
          "Prominencia apical retráctil armada con dos hileras concéntricas alternadas de 22 a 32 ganchos quitinosos falciformes (ganchos grandes de ~180 µm en el anillo interno y pequeños de ~130 µm en el externo), cada uno con hoja curva, mango y guarda.",
        microscopyNote:
          "En preparaciones diafanizadas o teñidas con carmín, la doble corona refringente diferencia inmediatamente a Taenia solium (armada) de Taenia saginata (inerme).",
        reconstruction3DNote:
          "Modelado con 28 ganchos falciformes individuales dispuestos en doble corona alternada sobre la cúpula rostellar.",
      },
      {
        id: "scolex",
        number: 2,
        name: "Escólex globular y cuatro ventosas acetabulares",
        shortLabel: "Escólex y 4 ventosas",
        badge: "Órgano de Fijación",
        scale: "Diámetro: ~1 mm",
        regionCode: 2,
        colorBio: "#38bdf8",
        colorStain: "#9d174d",
        localAnchor: [1.05, 0.68, 0.68],
        labelOffset: [-95, 48],
        camGoal: {
          position: [-11.4, 1.0, 2.8],
          target: [-9.45, 0.15, 0.1],
        },
        defaultTranslucency: 25,
        summary:
          "Cabeza globular o piriforme de ~1 mm de diámetro provista de cuatro ventosas musculares profundas en forma de copa (acetábulos) dispuestas simétricamente en los flancos ecuatoriales.",
        microscopyNote:
          "Las 4 ventosas hemisféricas muestran un grueso reborde muscular contráctil que succiona las vellosidades de la mucosa yeyunal.",
        reconstruction3DNote:
          "Esculpido como una superficie continua donde las 4 copas acetabulares emergen orgánicamente del bulbo del escólex.",
      },
      {
        id: "neck",
        number: 3,
        name: "Cuello proliferativo no segmentado (zona germinativa)",
        shortLabel: "Cuello proliferativo",
        badge: "Estrobilación",
        scale: "Longitud: 5 – 10 mm",
        regionCode: 3,
        colorBio: "#10b981",
        colorStain: "#831843",
        localAnchor: [2.75, 0.22, 0.0],
        labelOffset: [-10, -52],
        camGoal: {
          position: [-8.8, 1.4, 3.8],
          target: [-7.75, 0.1, 0.0],
        },
        defaultTranslucency: 35,
        summary:
          "Región estrecha y lisa inmediatamente posterior al escólex. Contiene células madre germinativas de alta actividad mitótica que originan continuamente nuevas proglótides.",
        microscopyNote:
          "Si el tratamiento antiparasitario no elimina el escólex y el cuello, el cestodo regenera la totalidad del estróbilo.",
        reconstruction3DNote:
          "Muestra el estrechamiento poscefálico y el inicio progresivo de los surcos de segmentación nacientes.",
      },
      {
        id: "mature",
        number: 4,
        name: "Proglótide madura hermafrodita (ovario trilobulado)",
        shortLabel: "Proglótide madura",
        badge: "Hermafrodita Funcional",
        scale: "Tamaño: ~6 × 5 mm",
        regionCode: 5,
        colorBio: "#ec4899",
        colorStain: "#9d174d",
        localAnchor: [13.5, 0.2, 0.0],
        labelOffset: [35, -52],
        camGoal: {
          position: [1.5, 3.8, 4.2],
          target: [1.5, 0.0, 0.4],
        },
        defaultTranslucency: 78,
        summary:
          "Segmentos cuadrangulares con órganos reproductores masculinos (150–200 folículos testiculares) y femeninos completos. Presenta un ovario trilobulado patognomónico (dos lóbulos principales más un lóbulo accesorio del lado del poro genital) y poros genitales laterales alternantes.",
        microscopyNote:
          "En tinción con carmín de Semichon, la presencia del tercer lóbulo ovárico accesorio y la ausencia de esfínter vaginal diferencian a T. solium de T. saginata.",
        reconstruction3DNote:
          "Al elevar la translucidez tegumentaria se visualizan el ovario trilobulado, la glándula vitelógena posterior, los testículos foliculares y los canales osmorreguladores.",
      },
      {
        id: "gravid",
        number: 5,
        name: "Proglótide grávida terminal (útero con 7–13 ramas laterales)",
        shortLabel: "Proglótide grávida (7–13 ramas)",
        badge: "Diagnóstico Diferencial",
        scale: "Tamaño: ~12 × 6 mm",
        regionCode: 6,
        colorBio: "#ef4444",
        colorStain: "#881337",
        localAnchor: [22.8, 0.2, 0.0],
        labelOffset: [95, 48],
        camGoal: {
          position: [9.2, 4.4, 5.2],
          target: [8.6, -0.2, 0.5],
        },
        defaultTranslucency: 85,
        summary:
          "Segmentos rectangulares terminales ocupados por un útero distendido con 7 a 13 ramas laterales dendríticas por lado del tallo central (T. saginata posee 15 a 30 ramas dicotómicas), repletas de 30.000 a 50.000 huevos infectantes.",
        microscopyNote:
          "El recuento de las 7–13 ramas uterinas principales tras diafanización o tinción con carmín/tinta china es el criterio diagnóstico diferencial clave en el laboratorio.",
        reconstruction3DNote:
          "Representa el tallo uterino central y sus ramificaciones dendríticas laterales gruesas cargadas de granulación ovular.",
      },
    ],
  },
  scolex: {
    id: "scolex",
    name: "Escólex armado en detalle (órgano de fijación anterior)",
    shortName: "Escólex armado",
    subtitle:
      "Vista macroscópica de alta resolución del rostelo apical, la doble corona de 28 ganchos falciformes, las 4 ventosas acetabulares y el cuello",
    dimensionsNote:
      "Escólex: ~0.8 a 1.2 mm de diámetro · 4 ventosas acetabulares (~0.4 mm) · 22–32 ganchos en 2 coronas",
    scaleBarLabel: "250 µm",
    scaleBarWorldUnits: 0.5,
    translucencyLabel: "Translucidez Tegumentaria",
    translucencyHint:
      "Ajusta la traslucidez del tegumento cefálico y del cuello proliferativo.",
    defaultTranslucency: 24,
    hasPeristalsis: true,
    defaultCamera: {
      position: [-11.8, 0.9, 2.5],
      target: [-9.65, 0.15, 0.05],
    },
    focusCamera: {
      position: [-11.9, 0.55, 1.55],
      target: [-10.22, 0.25, 0.15],
    },
    focusButtonLabel: "Enfocar corona de ganchos",
    fullButtonLabel: "Ver escólex y cuello",
    overviewSummary:
      "El escólex de Taenia solium mide apenas ~1 mm (tamaño de una cabeza de alfiler), pero asegura el anclaje firme a la mucosa yeyunal mediante la acción combinada de sus 4 ventosas acetabulares musculares y su rostelo armado con doble corona de ganchos quitinosos.",
    regions: [
      {
        id: "rostellum_detail",
        number: 1,
        name: "Rostelo apical y doble corona de ganchos (130–180 µm)",
        shortLabel: "Rostelo y doble corona",
        badge: "Ápice Armado",
        scale: "22–32 ganchos",
        regionCode: 1,
        colorBio: "#f59e0b",
        colorStain: "#be123c",
        localAnchor: [0.28, 0.35, 0.25],
        labelOffset: [-115, -45],
        camGoal: {
          position: [-11.9, 0.55, 1.55],
          target: [-10.22, 0.25, 0.15],
        },
        defaultTranslucency: 18,
        summary:
          "Cúpula muscular retráctil en el ápice anterior armada con dos hileras concéntricas de ganchos quitinosos falciformes (alternando ganchos largos y cortos).",
        microscopyNote:
          "Cada gancho consta de una hoja curva refringente, un mango basal y una guarda ventral engrosada.",
        reconstruction3DNote:
          "Los 28 ganchos están modelados individualmente con su curvatura falciforme y engrosamiento de guarda.",
      },
      {
        id: "suckers_detail",
        number: 2,
        name: "Cuatro ventosas acetabulares cupuliformes",
        shortLabel: "4 ventosas acetabulares",
        badge: "Fijación Muscular",
        scale: "~0.4 – 0.5 mm",
        regionCode: 2,
        colorBio: "#38bdf8",
        colorStain: "#9d174d",
        localAnchor: [1.05, 0.68, 0.68],
        labelOffset: [110, -40],
        camGoal: {
          position: [-11.1, 1.05, 2.35],
          target: [-9.45, 0.15, 0.1],
        },
        defaultTranslucency: 24,
        summary:
          "Cuatro órganos musculares hemisféricos dispuestos radialmente a 90° en la zona ecuatorial del escólex.",
        microscopyNote:
          "Actúan como copas de succión hidrostática sobre el epitelio intestinal.",
        reconstruction3DNote:
          "integradas de forma continua en la geometría del escólex con su reborde anular elevado y depresión central.",
      },
      {
        id: "neck_detail",
        number: 3,
        name: "Cuello germinativo y primeros segmentos inmaduros",
        shortLabel: "Cuello germinativo",
        badge: "Zona de Crecimiento",
        scale: "5 – 10 mm",
        regionCode: 3,
        colorBio: "#10b981",
        colorStain: "#831843",
        localAnchor: [2.75, 0.22, 0.0],
        labelOffset: [105, 50],
        camGoal: {
          position: [-9.2, 1.15, 3.2],
          target: [-7.95, 0.1, 0.0],
        },
        defaultTranslucency: 35,
        summary:
          "Zona proliferativa inmediatamente caudal al escólex a partir de la cual se forman por estrobilación todos los proglótides.",
        microscopyNote:
          "Región no segmentada de tejido denso que transita gradualmente hacia las primeras proglótides inmaduras.",
        reconstruction3DNote:
          "Muestra la transición desde la sección subcilíndrica del cuello hacia la cinta aplanada dorsoventralmente.",
      },
    ],
  },
  egg: {
    id: "egg",
    name: "Huevo embrionado de Taenia sp. (embrióforo radiado y oncosfera)",
    shortName: "Huevo embrionado",
    subtitle:
      "Forma diagnóstica en heces y forma infectante causante de la cisticercosis humana y porcina",
    dimensionsNote:
      "Huevo: 31 a 43 µm de diámetro · Esférico · Embrióforo radiado grueso con oncosfera hexacanta (6 ganchos)",
    scaleBarLabel: "10 µm",
    scaleBarWorldUnits: 1.0,
    translucencyLabel: "Transparencia del embrióforo",
    translucencyHint:
      "Aumenta la transparencia de la cubierta radiada para observar en el interior la oncosfera hexacanta y sus 3 pares de ganchos.",
    defaultTranslucency: 48,
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
      "Los huevos de Taenia solium y Taenia saginata son morfológicamente indistinguibles al microscopio óptico (31–43 µm). Poseen un grueso embrióforo marrón amarillento formado por bloques prismáticos de queratina con estriaciones radiales que protege al embrión hexacanto (oncosfera con 6 ganchos).",
    regions: [
      {
        id: "embrioforo",
        number: 1,
        name: "Embrióforo grueso con estriaciones radiales (bloques de queratina)",
        shortLabel: "Embrióforo radiado",
        badge: "Cubierta Protectora",
        scale: "Ø 31 – 43 µm",
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
          "Cubierta esférica gruesa constituida por bloques prismáticos de proteína tipo queratina cementados entre sí, lo que le confiere su clásico aspecto de «llanta» o «rueda radiada».",
        microscopyNote:
          "En examen coproparasitológico directo o con Lugol destaca por su gruesa corteza marrón estriada radialmente.",
        reconstruction3DNote:
          "Renderizado en doble pasada con patrón radial de bloques prismáticos y control de transparencia o corte ecuatorial.",
      },
      {
        id: "oncosfera",
        number: 2,
        name: "Oncosfera (embrión hexacanto interno)",
        shortLabel: "Oncosfera (embrión)",
        badge: "Embrión Infectante",
        scale: "Ø ~20 – 25 µm",
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
          "Masa embrionaria esférica alojada dentro del embrióforo. Al ser ingerido el huevo por el cerdo o el ser humano, las sales biliares disuelven el embrióforo y activan la oncosfera.",
        microscopyNote:
          "Se visualiza como una esfera celular refringente rodeada por la membrana oncosferal fina.",
        reconstruction3DNote:
          "Esfera embrionaria translúcida concéntrica en cuyo interior se disponen simétricamente los 6 ganchos.",
      },
      {
        id: "ganchos_oncosfericos",
        number: 3,
        name: "Tres pares de ganchos embrionarios quitinosos (6 ganchos)",
        shortLabel: "6 ganchos (3 pares)",
        badge: "Penetración Mucosa",
        scale: "Longitud: ~12 – 16 µm",
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
          "Seis estiletes/ganchos falciformes dispuestos en 3 pares (un par medial y dos pares laterales) accionados por fibras musculares embrionarias para perforar la pared intestinal y alcanzar la circulación.",
        microscopyNote:
          "Al enfocar con el tornillo micrométrico a 400x se distinguen los 6 trazos brillantes refringentes dentro de la oncosfera.",
        reconstruction3DNote:
          "Modelados como 3 pares de ganchos falciformes orientados en abanico dentro del hemisferio anterior de la oncosfera.",
      },
    ],
  },
  cysticercus: {
    id: "cysticercus",
    name: "Cisticerco (Cysticercus cellulosae con escólex invaginado)",
    shortName: "Cisticerco (larva)",
    subtitle:
      "Metacestodo vesicular tisular causante de la neurocisticercosis humana y de la cisticercosis porcina",
    dimensionsNote:
      "Vesícula: 5 a 15 mm · Escólex invaginado (nódulo mural): ~1.5 a 2 mm («hole-with-a-dot» en RM)",
    scaleBarLabel: "2 mm",
    scaleBarWorldUnits: 1.0,
    translucencyLabel: "Transparencia de la pared vesicular",
    translucencyHint:
      "Regula la traslucidez de la vesícula llena de líquido para inspeccionar el escólex invaginado (nódulo mural) y su corona de ganchos.",
    defaultTranslucency: 52,
    hasPeristalsis: false,
    defaultCamera: {
      position: [1.5, 1.1, 8.2],
      target: [0.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [0.9, 0.6, 4.9],
      target: [0.35, 0.15, 0.0],
    },
    focusButtonLabel: "Enfocar escólex invaginado",
    fullButtonLabel: "Ver cisticerco completo",
    overviewSummary:
      "Cysticercus cellulosae es una vesícula ovoide opalescente llena de líquido claro que contiene en su interior un único escólex invaginado armado con 4 ventosas y doble corona de ganchos (visible como un nódulo mural denso).",
    regions: [
      {
        id: "vesicula_cisticerco",
        number: 1,
        name: "Vesícula membranosa translúcida y cavidad llena de líquido",
        shortLabel: "Vesícula translúcida",
        badge: "Pared Vesicular",
        scale: "5 – 15 mm",
        regionCode: 20,
        colorBio: "#38bdf8",
        colorStain: "#db2777",
        localAnchor: [-1.95, 0.85, 0.35],
        labelOffset: [-125, -42],
        camGoal: {
          position: [-1.6, 1.0, 7.6],
          target: [0.0, 0.0, 0.0],
        },
        defaultTranslucency: 35,
        summary:
          "Membrana tegumentaria bilaminar fina recubierta de microtricas absortivas que encierra una cavidad llena de fluido vesicular hialino.",
        microscopyNote:
          "En cortes histológicos muestra una capa cuticular eosinófila festoneada y una capa reticular subyacente.",
        reconstruction3DNote:
          "Superficie ovoide reniforme translúcida que permite apreciar la refracción periférica de la pared vesicular.",
      },
      {
        id: "escolex_invaginado",
        number: 2,
        name: "Escólex invaginado (nódulo mural y canal espiral)",
        shortLabel: "Escólex invaginado",
        badge: "Signo «Hole-with-a-dot»",
        scale: "1.5 – 2.5 mm",
        regionCode: 21,
        colorBio: "#fde047",
        colorStain: "#9d174d",
        localAnchor: [0.55, 0.25, 0.2],
        labelOffset: [125, -38],
        camGoal: {
          position: [1.1, 0.6, 4.8],
          target: [0.4, 0.15, 0.0],
        },
        defaultTranslucency: 68,
        summary:
          "Cabeza cefálica invaginada dentro de la vesícula y unida a la pared por un cuello y canal espiral plegado. Constituye el signo radiológico patognomónico del «punto en el hoyo» en neuroimagen.",
        microscopyNote:
          "Presenta las 4 ventosas musculares y el rostelo replegado hacia la luz del canal de invaginación.",
        reconstruction3DNote:
          "Modelado como un cuerpo piriforme blanco nacarado anclado a la pared medial con sus 4 ventosas y cuello espiral.",
      },
      {
        id: "corona_interna_cisticerco",
        number: 3,
        name: "Corona interna de ganchos quitinosos del protocólex",
        shortLabel: "Corona de ganchos",
        badge: "Armadura Larvaria",
        scale: "22 – 32 ganchos",
        regionCode: 12,
        colorBio: "#f59e0b",
        colorStain: "#881337",
        localAnchor: [0.32, -0.12, 0.25],
        labelOffset: [125, 45],
        camGoal: {
          position: [0.6, -0.2, 4.2],
          target: [0.32, -0.05, 0.1],
        },
        defaultTranslucency: 76,
        summary:
          "El escólex invaginado de Cysticercus cellulosae ya posee su doble corona de ganchos quitinosos lista para evaginarse en el duodeno humano tras la ingesta de carne de cerdo cruda o mal cocida.",
        microscopyNote:
          "En biopsias de lesiones calcificadas o degeneradas, los ganchos quitinosos persisten y confirman el diagnóstico etiológico.",
        reconstruction3DNote:
          "Corona concéntrica de ganchos falciformes alojada en el polo rostellar del nódulo mural.",
      },
    ],
  },
};

/**
 * METADATOS ANATÓMICOS Y CLÍNICOS DE LOS 4 ESTADIOS DE TAENIA SAGINATA
 */
export const TAENIA_SAGINATA_STAGES: Record<TaeniaStageId, TaeniaStageMeta> = {
  strobila: {
    id: "strobila",
    name: "Estróbilo adulto completo y Escólex inerme (teniasis bovina)",
    shortName: "Estróbilo y Escólex",
    subtitle:
      "Platelminto adulto acintado con escólex inerme cuadrangular (4 ventosas acetabulares, sin rostelo ni ganchos), proglótides maduras (ovario bilobulado y esfínter vaginal) y grávidas (15–20+ ramas uterinas dicotómicas)",
    dimensionsNote:
      "Adulto: 4 a 10 m (1000–2000 proglótides) · Escólex inerme: 1.5–2.0 mm · Proglótide grávida: 16–20 × 5–7 mm (15–20+ ramas uterinas)",
    scaleBarLabel: "2 mm",
    scaleBarWorldUnits: 2.0,
    translucencyLabel: "Translucidez Tegumentaria (órganos internos)",
    translucencyHint:
      "Aumenta la translucidez para observar el ovario bilobulado (sin lóbulo accesorio), el esfínter vaginal y las 15–20+ ramas uterinas dicotómicas.",
    defaultTranslucency: 45,
    hasPeristalsis: true,
    defaultCamera: {
      position: [-8.6, 5.2, 14.2],
      target: [-2.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [-11.8, 0.8, 2.2],
      target: [-9.8, 0.1, 0.0],
    },
    focusButtonLabel: "Enfocar escólex inerme",
    fullButtonLabel: "Ver estróbilo completo",
    overviewSummary:
      "Taenia saginata (solitaria bovina) se aloja en el yeyuno humano fijada únicamente por las 4 potentes ventosas acetabulares de su escólex inerme (carece de rostelo y de ganchos). Sus proglótides maduras poseen ovario bilobulado y esfínter vaginal, y sus proglótides grávidas presentan 15 a 20 (hasta 30) ramas uterinas laterales dicotómicas y reptan activamente al desprenderse.",
    regions: [
      {
        id: "apice_inerme",
        number: 1,
        name: "Depresión apical inerme (ausencia total de rostelo y de ganchos)",
        shortLabel: "Ápice inerme (sin ganchos)",
        badge: "Criterio Diferencial Clave",
        scale: "Sin rostelo ni ganchos",
        regionCode: 1,
        colorBio: "#f59e0b",
        colorStain: "#be123c",
        localAnchor: [0.12, 0.16, 0.14],
        labelOffset: [-118, -48],
        camGoal: {
          position: [-11.9, 0.65, 1.75],
          target: [-10.22, 0.15, 0.10],
        },
        defaultTranslucency: 20,
        summary:
          "El polo anterior del escólex de Taenia saginata es romo o ligeramente deprimido en el centro (a menudo con pigmentación oscura apical) y carece por completo de rostelo y de corona de ganchos quitinosos («tenia inerme»).",
        microscopyNote:
          "En preparaciones aclaradas o teñidas con carmín, la ausencia de corona de ganchos distingue de forma inmediata el escólex de T. saginata del escólex armado de T. solium.",
        reconstruction3DNote:
          "Modelado con una suave depresión apical tegumentaria sobre el bulbo cefálico cuadrangular, sin prominencia rostellar ni ganchos.",
      },
      {
        id: "scolex_saginata",
        number: 2,
        name: "Escólex cuadrangular-piriforme y 4 ventosas acetabulares",
        shortLabel: "Escólex y 4 ventosas",
        badge: "Órgano Único de Fijación",
        scale: "Diámetro: 1.5 – 2.0 mm",
        regionCode: 2,
        colorBio: "#38bdf8",
        colorStain: "#9d174d",
        localAnchor: [1.02, 0.74, 0.74],
        labelOffset: [-95, 48],
        camGoal: {
          position: [-11.4, 1.0, 2.8],
          target: [-9.45, 0.15, 0.1],
        },
        defaultTranslucency: 25,
        summary:
          "Escólex de contorno cuadrangular o piriforme de 1.5 a 2.0 mm de diámetro (más voluminoso que el de T. solium), provisto de cuatro ventosas acetabulares hemisféricas muy musculosas en sus cuatro ángulos ecuatoriales.",
        microscopyNote:
          "Al no poseer ganchos, las 4 ventosas acetabulares están hipertrofiadas para garantizar por sí solas el anclaje a la mucosa yeyunal.",
        reconstruction3DNote:
          "Superficie continua de perfil subcuadrangular con 4 copas acetabulares profundas de reborde muscular elevado.",
      },
      {
        id: "neck_saginata",
        number: 3,
        name: "Cuello proliferativo no segmentado (zona germinativa)",
        shortLabel: "Cuello proliferativo",
        badge: "Estrobilación",
        scale: "Longitud: 5 – 12 mm",
        regionCode: 3,
        colorBio: "#10b981",
        colorStain: "#831843",
        localAnchor: [2.75, 0.22, 0.0],
        labelOffset: [-10, -52],
        camGoal: {
          position: [-8.8, 1.4, 3.8],
          target: [-7.75, 0.1, 0.0],
        },
        defaultTranslucency: 35,
        summary:
          "Región estrecha e indiferenciada posterior al escólex cuyas células germinativas originan una cadena de 1.000 a 2.000 proglótides que puede alcanzar de 4 a 10 metros de longitud.",
        microscopyNote:
          "La curación parasitológica definitiva requiere la expulsión o destrucción del escólex y del cuello proliferativo.",
        reconstruction3DNote:
          "Muestra la transición poscefálica y el inicio de los primeros surcos transversales de estrobilación.",
      },
      {
        id: "mature_saginata",
        number: 4,
        name: "Proglótide madura (ovario bilobulado y esfínter vaginal)",
        shortLabel: "Proglótide madura (2 lóbulos)",
        badge: "Ovario Bilobulado",
        scale: "Tamaño: ~8 × 6 mm",
        regionCode: 5,
        colorBio: "#ec4899",
        colorStain: "#9d174d",
        localAnchor: [13.5, 0.2, 0.0],
        labelOffset: [35, -52],
        camGoal: {
          position: [1.5, 3.8, 4.2],
          target: [1.5, 0.0, 0.4],
        },
        defaultTranslucency: 78,
        summary:
          "Proglótide hermafrodita que contiene de 300 a 400 folículos testiculares y un ovario estrictamente bilobulado (carece del tercer lóbulo accesorio de T. solium), además de un característico esfínter muscular vaginal próximo al poro genital lateral.",
        microscopyNote:
          "En preparaciones teñidas con carmín de Semichon, el ovario bilobulado y la presencia del esfínter vaginal confirman Taenia saginata.",
        reconstruction3DNote:
          "Al aumentar la translucidez tegumentaria se distinguen los 2 lóbulos ováricos simétricos (sin lóbulo accesorio), el esfínter vaginal, el vitelario y el campo denso de folículos testiculares.",
      },
      {
        id: "gravid_saginata",
        number: 5,
        name: "Proglótide grávida terminal (15–20+ ramas uterinas dicotómicas)",
        shortLabel: "Proglótide grávida (15–20+ ramas)",
        badge: "Diagnóstico Diferencial",
        scale: "Tamaño: 16–20 × 5–7 mm",
        regionCode: 6,
        colorBio: "#ef4444",
        colorStain: "#881337",
        localAnchor: [22.8, 0.2, 0.0],
        labelOffset: [95, 48],
        camGoal: {
          position: [9.2, 4.4, 5.2],
          target: [8.6, -0.2, 0.5],
        },
        defaultTranslucency: 85,
        summary:
          "Segmento rectangular alargado y muy musculoso ocupado por un útero central con 15 a 20 (hasta 30) ramas laterales principales por lado que se bifurcan de forma dicotómica. Contiene ~80.000 a 100.000 huevos y se desprende individualmente reptando de forma activa a través del esfínter anal.",
        microscopyNote:
          "Contar ≥15 ramas uterinas laterales dicotómicas por lado (frente a las 7–13 ramas dendríticas de T. solium) es el estándar diagnóstico de laboratorio en proglótides expulsadas.",
        reconstruction3DNote:
          "Representa el tallo uterino longitudinal con sus numerosas ramificaciones laterales finas de bifurcación dicotómica.",
      },
    ],
  },
  scolex: {
    id: "scolex",
    name: "Escólex inerme cuadrangular en detalle (sin rostelo ni ganchos)",
    shortName: "Escólex inerme",
    subtitle:
      "Vista macroscópica de alta resolución del ápice inerme, las 4 ventosas acetabulares musculares en los ángulos del escólex y el cuello",
    dimensionsNote:
      "Escólex inerme: 1.5 a 2.0 mm de diámetro · 4 ventosas acetabulares (~0.5–0.6 mm) · 0 ganchos (sin rostelo)",
    scaleBarLabel: "500 µm",
    scaleBarWorldUnits: 0.5,
    translucencyLabel: "Translucidez Tegumentaria",
    translucencyHint:
      "Ajusta la traslucidez del tegumento cefálico para examinar las 4 copas acetabulares musculares y el cuello.",
    defaultTranslucency: 24,
    hasPeristalsis: true,
    defaultCamera: {
      position: [-11.8, 0.9, 2.5],
      target: [-9.65, 0.15, 0.05],
    },
    focusCamera: {
      position: [-11.9, 0.55, 1.55],
      target: [-10.22, 0.15, 0.10],
    },
    focusButtonLabel: "Enfocar ápice inerme",
    fullButtonLabel: "Ver escólex y cuello",
    overviewSummary:
      "A diferencia de Taenia solium, el escólex de Taenia saginata es más grande (1.5–2.0 mm), de sección cuadrangular y completamente inerme: carece de rostelo y de ganchos quitinosos, fijándose exclusivamente mediante sus 4 vigorosas ventosas acetabulares.",
    regions: [
      {
        id: "apice_inerme_detail",
        number: 1,
        name: "Depresión apical inerme (sin rostelo ni corona de ganchos)",
        shortLabel: "Ápice inerme (sin ganchos)",
        badge: "Escólex Inerme",
        scale: "0 ganchos",
        regionCode: 1,
        colorBio: "#f59e0b",
        colorStain: "#be123c",
        localAnchor: [0.12, 0.16, 0.14],
        labelOffset: [-115, -45],
        camGoal: {
          position: [-11.9, 0.55, 1.55],
          target: [-10.22, 0.15, 0.10],
        },
        defaultTranslucency: 18,
        summary:
          "Superficie apical truncada con una leve foseta o depresión central desprovista de rostelo y de ganchos quitinosos.",
        microscopyNote:
          "Suele presentar gránulos de pigmento melánico en la depresión apical; la ausencia de ganchos descarta T. solium.",
        reconstruction3DNote:
          "Modelado sin rostelo ni ganchos, mostrando la depresión apical suave entre las 4 prominencias acetabulares.",
      },
      {
        id: "suckers_saginata_detail",
        number: 2,
        name: "Cuatro ventosas acetabulares musculares en los ángulos cefálicos",
        shortLabel: "4 ventosas acetabulares",
        badge: "Fijación Muscular",
        scale: "~0.5 – 0.6 mm",
        regionCode: 2,
        colorBio: "#38bdf8",
        colorStain: "#9d174d",
        localAnchor: [1.02, 0.74, 0.74],
        labelOffset: [110, -40],
        camGoal: {
          position: [-11.1, 1.05, 2.35],
          target: [-9.45, 0.15, 0.1],
        },
        defaultTranslucency: 24,
        summary:
          "Cuatro copas musculares hemisféricas muy desarrolladas situadas en los cuatro ángulos del escólex cuadrangular.",
        microscopyNote:
          "Su gruesa pared muscular esfinteriana permite mantener anclado un estróbilo de hasta 10 metros contra el peristaltismo intestinal.",
        reconstruction3DNote:
          "Esculpidas con mayor diámetro y reborde anular prominente en los 4 vértices del bulbo cefálico.",
      },
      {
        id: "neck_saginata_detail",
        number: 3,
        name: "Cuello germinativo y primeros segmentos inmaduros",
        shortLabel: "Cuello germinativo",
        badge: "Zona de Crecimiento",
        scale: "5 – 12 mm",
        regionCode: 3,
        colorBio: "#10b981",
        colorStain: "#831843",
        localAnchor: [2.75, 0.22, 0.0],
        labelOffset: [105, 50],
        camGoal: {
          position: [-9.2, 1.15, 3.2],
          target: [-7.95, 0.1, 0.0],
        },
        defaultTranslucency: 35,
        summary:
          "Región proliferativa caudal al escólex que genera continuamente los más de 1.000 a 2.000 segmentos del adulto.",
        microscopyNote:
          "Zona estrecha no segmentada que da paso gradualmente a las primeras proglótides inmaduras.",
        reconstruction3DNote:
          "Representa el estrechamiento poscefálico y el aplanamiento dorsoventral progresivo del estróbilo.",
      },
    ],
  },
  egg: {
    id: "egg",
    name: "Huevo embrionado de Taenia saginata (indistinguible de T. solium)",
    shortName: "Huevo embrionado",
    subtitle:
      "Forma diagnóstica en heces/región perianal e infectante para el ganado bovino (no causa cisticercosis humana)",
    dimensionsNote:
      "Huevo: 31 a 43 µm · Esférico · Embrióforo radiado grueso con oncosfera hexacanta (6 ganchos) · Indistinguible de T. solium al microscopio",
    scaleBarLabel: "10 µm",
    scaleBarWorldUnits: 1.0,
    translucencyLabel: "Transparencia del embrióforo",
    translucencyHint:
      "Aumenta la transparencia de la cubierta radiada para observar la oncosfera hexacanta y sus 3 pares de ganchos.",
    defaultTranslucency: 48,
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
      "Los huevos de Taenia saginata (31–43 µm) son morfológicamente idénticos a los de Taenia solium al microscopio óptico (por lo que en ausencia de proglótides se informan como «huevos de Taenia sp.»). Sin embargo, a diferencia de T. solium, los huevos de T. saginata solo infectan al ganado bovino y NO producen cisticercosis humana.",
    regions: [
      {
        id: "embrioforo_saginata",
        number: 1,
        name: "Embrióforo grueso con estriaciones radiales (bloques de queratina)",
        shortLabel: "Embrióforo radiado",
        badge: "Indistinguible de T. solium",
        scale: "Ø 31 – 43 µm",
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
          "Cápsula esférica marrón amarillenta formada por bloques prismáticos de proteína tipo queratina adosados radialmente, muy resistente en pasturas y aguas residuales.",
        microscopyNote:
          "En el examen coproparasitológico o en la cinta adhesiva perianal (método de Graham) no puede diferenciarse ópticamente del huevo de T. solium; la tinción Ziehl-Neelsen o la PCR permiten distinguirlos.",
        reconstruction3DNote:
          "Renderizado en doble pasada con patrón radial de bloques de queratina y control de transparencia o sección ecuatorial.",
      },
      {
        id: "oncosfera_saginata",
        number: 2,
        name: "Oncosfera hexacanta (infectante para bovinos, no para humanos)",
        shortLabel: "Oncosfera (embrión)",
        badge: "Infectante en Bovinos",
        scale: "Ø ~20 – 25 µm",
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
          "Embrión hexacanto interno que se activa en el intestino del ganado vacuno tras ingerir pasto o agua contaminados con heces humanas, dando origen a Cysticercus bovis en el músculo bovino.",
        microscopyNote:
          "Importante perla clínica: la ingestión accidental de huevos de Taenia saginata por el ser humano NO causa neurocisticercosis.",
        reconstruction3DNote:
          "Esfera embrionaria translúcida concéntrica rodeada por la membrana oncosferal.",
      },
      {
        id: "ganchos_oncosfericos_saginata",
        number: 3,
        name: "Tres pares de ganchos embrionarios de la oncosfera (6 estiletes)",
        shortLabel: "6 ganchos oncosféricos",
        badge: "Embrión Hexacanto",
        scale: "Longitud: ~12 – 16 µm",
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
          "Aunque el adulto de Taenia saginata es inerme (sin ganchos en el escólex), su embrión hexacanto dentro del huevo sí posee los 6 ganchos embrionarios típicos de todos los ciclofilídeos para atravesar la mucosa intestinal del bovino.",
        microscopyNote:
          "Al enfocar con el micrométrico a 400x se observan los 3 pares de estiletes refringentes dentro de la oncosfera.",
        reconstruction3DNote:
          "Modelados como 3 pares de estiletes falciformes dispuestos en abanico dentro de la oncosfera.",
      },
    ],
  },
  cysticercus: {
    id: "cysticercus",
    name: "Cisticerco bovino (Cysticercus bovis con escólex invaginado inerme)",
    shortName: "Cisticerco (C. bovis)",
    subtitle:
      "Metacestodo vesicular en músculo estriado bovino; forma infectante causante de la teniasis humana por carne vacuna poco cocida",
    dimensionsNote:
      "Vesícula: 5 a 10 mm · Escólex invaginado inerme (4 ventosas, 0 ganchos) · Alojado en músculo bovino",
    scaleBarLabel: "2 mm",
    scaleBarWorldUnits: 1.0,
    translucencyLabel: "Transparencia de la pared vesicular",
    translucencyHint:
      "Regula la traslucidez de la vesícula para observar el escólex invaginado inerme (con sus 4 ventosas y sin corona de ganchos).",
    defaultTranslucency: 54,
    hasPeristalsis: false,
    defaultCamera: {
      position: [1.5, 1.1, 8.2],
      target: [0.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [0.9, 0.6, 4.9],
      target: [0.35, 0.15, 0.0],
    },
    focusButtonLabel: "Enfocar escólex invaginado inerme",
    fullButtonLabel: "Ver Cysticercus bovis completo",
    overviewSummary:
      "Cysticercus bovis es una vesícula ovoide blanquecina-opalescente de 5 a 10 mm alojada en el tejido muscular estriado del ganado vacuno (maseteros, corazón, lengua, diafragma). Contiene un único escólex invaginado INERME (con 4 ventosas acetabulares, pero sin rostelo ni ganchos).",
    regions: [
      {
        id: "vesicula_bovis",
        number: 1,
        name: "Vesícula membranosa translúcida (Cysticercus bovis)",
        shortLabel: "Vesícula translúcida",
        badge: "Músculo Bovino",
        scale: "5 – 10 mm",
        regionCode: 20,
        colorBio: "#38bdf8",
        colorStain: "#db2777",
        localAnchor: [-1.95, 0.85, 0.35],
        labelOffset: [-125, -42],
        camGoal: {
          position: [-1.6, 1.0, 7.6],
          target: [0.0, 0.0, 0.0],
        },
        defaultTranslucency: 35,
        summary:
          "Vesícula ovoide llena de fluido rosado-opalescente situada entre las fibras musculares del ganado vacuno. Al ingerirse carne bovina cruda o insuficientemente cocida, la vesícula se digiere y el escólex se evagina en el intestino delgado humano.",
        microscopyNote:
          "La cocción uniforme de la carne bovina a ≥63–71 °C o su congelación a -20 °C por ≥7–10 días desnaturaliza e inactiva el cisticerco.",
        reconstruction3DNote:
          "Pared vesicular ovoide translúcida con poro de invaginación lateral.",
      },
      {
        id: "escolex_invaginado_inerme",
        number: 2,
        name: "Escólex invaginado inerme (nódulo mural sin ganchos y canal espiral)",
        shortLabel: "Escólex invaginado inerme",
        badge: "Sin Corona de Ganchos",
        scale: "1.5 – 2.0 mm",
        regionCode: 21,
        colorBio: "#fde047",
        colorStain: "#9d174d",
        localAnchor: [0.55, 0.25, 0.2],
        labelOffset: [125, -38],
        camGoal: {
          position: [1.1, 0.6, 4.8],
          target: [0.4, 0.15, 0.0],
        },
        defaultTranslucency: 68,
        summary:
          "Nódulo mural denso unido a la pared vesicular por un canal espiral plegado. A diferencia de Cysticercus cellulosae (T. solium), el escólex invaginado de Cysticercus bovis carece totalmente de ganchos quitinosos.",
        microscopyNote:
          "Al comprimir o seccionar histológicamente el nódulo mural se comprueba la ausencia de rostelo y de ganchos.",
        reconstruction3DNote:
          "Cuerpo cefálico subcuadrangular invaginado conectado al poro vesicular mediante el cuello espiral, desprovisto de armadura rostellar.",
      },
      {
        id: "ventosas_internas_bovis",
        number: 3,
        name: "Cuatro ventosas acetabulares del protocólex invaginado",
        shortLabel: "4 ventosas internas",
        badge: "Fijación Preformada",
        scale: "4 acetábulos (~0.4 mm)",
        regionCode: 12,
        colorBio: "#f59e0b",
        colorStain: "#881337",
        localAnchor: [0.35, -0.18, 0.42],
        labelOffset: [125, 45],
        camGoal: {
          position: [0.7, -0.2, 4.2],
          target: [0.35, -0.05, 0.1],
        },
        defaultTranslucency: 76,
        summary:
          "Las cuatro ventosas acetabulares musculares ya están completamente formadas en el protocólex invaginado, listas para evaginarse bajo el estímulo de la bilis y las enzimas pancreáticas en el duodeno humano.",
        microscopyNote:
          "En el corte del nódulo mural se identifican las 4 copas musculares acetabulares sin rastro de ganchos.",
        reconstruction3DNote:
          "Cuatro anillos acetabulares cupuliformes dispuestos simétricamente alrededor del polo anterior del escólex invaginado.",
      },
    ],
  },
};

export interface Parasite3DViewerProps {
  speciesName?: string;
  onClose?: () => void;
}

export const Parasite3DViewer: React.FC<Parasite3DViewerProps> = ({
  speciesName = "Taenia solium",
  onClose,
}) => {
  const isSaginata = speciesName.toLowerCase().includes("saginata");
  const stagesDict = isSaginata ? TAENIA_SAGINATA_STAGES : TAENIA_STAGES;

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Referencias WebGL / Three.js
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const simTimeRef = useRef<number>(0.0);

  // Transición suave de cámara
  const camTransitionRef = useRef<{
    active: boolean;
    goalPos: THREE.Vector3;
    goalTarget: THREE.Vector3;
  }>({
    active: false,
    goalPos: new THREE.Vector3(...stagesDict.strobila.defaultCamera.position),
    goalTarget: new THREE.Vector3(...stagesDict.strobila.defaultCamera.target),
  });

  // Estados de la interfaz
  const [activeStage, setActiveStage] = useState<TaeniaStageId>("strobila");
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [shaderMode, setShaderMode] = useState<TaeniaShaderMode>(0);
  const [showMarkers, setShowMarkers] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [translucency, setTranslucency] = useState<number>(
    stagesDict.strobila.defaultTranslucency
  );
  const [wavePercent, setWavePercent] = useState<number>(55);
  const [cutPercent, setCutPercent] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [mobileTouchInteractive, setMobileTouchInteractive] = useState(false);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [scaleBarPx, setScaleBarPx] = useState<number>(64);

  // Posiciones proyectadas 2D para los marcadores con resolución de colisiones
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

  const stageMeta = stagesDict[activeStage];
  const selectedRegion =
    stageMeta.regions.find((r) => r.id === selectedRegionId) || null;

  // Cerrar el desplegable «Elegir forma» al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsStageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Limpieza de geometrías y materiales
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

  // Construir la escena 3D según el estadio seleccionado y la especie (T. solium vs T. saginata)
  const buildStage3DScene = useCallback(
    (stageId: TaeniaStageId, scene: THREE.Scene) => {
      if (modelRootRef.current) {
        scene.remove(modelRootRef.current);
        disposeGroup(modelRootRef.current);
        modelRootRef.current = null;
      }

      const root = new THREE.Group();
      modelRootRef.current = root;

      if (stageId === "strobila" || stageId === "scolex") {
        // --- MALLA CONTINUA ORGÁNICA DEL ESTRÓBILO Y ESCÓLEX (Armado en T. solium / Inerme en T. saginata) ---
        const wormGeo = buildTaeniaWormBufferGeometry(isSaginata);
        const wormMat = new THREE.ShaderMaterial({
          vertexShader: TAENIA_WORM_VERTEX_SHADER,
          fragmentShader: TAENIA_WORM_FRAGMENT_SHADER,
          uniforms: {
            u_time: { value: 0.0 },
            u_waveScale: { value: 0.55 },
            u_translucency: { value: isSaginata ? 0.45 : 0.42 },
            u_cutPlane: { value: 0.0 },
            u_shaderMode: { value: 0 },
            u_highlightRegion: { value: 0 },
            u_isSaginata: { value: isSaginata ? 1 : 0 },
          },
          side: THREE.DoubleSide,
        });
        const wormMesh = new THREE.Mesh(wormGeo, wormMat);
        wormMesh.frustumCulled = false;
        wormMesh.userData = { shaderKind: "worm" };
        root.add(wormMesh);
      } else if (stageId === "egg") {
        // --- HUEVO EMBRIONADO DE TAENIA SP. (Embrióforo radiado + Oncosfera hexacanta) ---

        // 1. Seis ganchos embrionarios falciformes dispuestos en 3 pares dentro de la oncosfera
        const hookMat = new THREE.ShaderMaterial({
          vertexShader: STAGE_VERTEX_SHADER,
          fragmentShader: STAGE_FRAGMENT_SHADER,
          uniforms: {
            u_partId: { value: 12 },
            u_shaderMode: { value: 0 },
            u_translucency: { value: 0.48 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
          },
          side: THREE.DoubleSide,
        });

        const hexacanthPairs: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
          // Par medial
          { pos: [-0.14, 0.12, 0.28], rot: [0.15, 0.0, 0.12] },
          { pos: [0.14, 0.12, 0.28], rot: [0.15, Math.PI, -0.12] },
          // Par anterolateral izquierdo
          { pos: [-0.46, 0.02, 0.18], rot: [0.1, 0.2, 0.48] },
          { pos: [-0.58, -0.18, -0.05], rot: [-0.1, 0.25, 0.65] },
          // Par anterolateral derecho
          { pos: [0.46, 0.02, 0.18], rot: [0.1, Math.PI - 0.2, -0.48] },
          { pos: [0.58, -0.18, -0.05], rot: [-0.1, Math.PI - 0.25, -0.65] },
        ];

        hexacanthPairs.forEach((hp) => {
          const hGeo = buildFalciformHookGeometry(0.62, 0.045);
          const hMesh = new THREE.Mesh(hGeo, hookMat.clone());
          hMesh.position.set(...hp.pos);
          hMesh.rotation.set(...hp.rot);
          hMesh.userData = { shaderKind: "stage", regionCode: 12 };
          hMesh.renderOrder = 1;
          root.add(hMesh);
        });

        // 2. Oncosfera hexacanta interna (embrión esférico)
        const oncGeo = new THREE.SphereGeometry(1.18, 48, 36);
        const oncMat = new THREE.ShaderMaterial({
          vertexShader: STAGE_VERTEX_SHADER,
          fragmentShader: STAGE_FRAGMENT_SHADER,
          uniforms: {
            u_partId: { value: 11 },
            u_shaderMode: { value: 0 },
            u_translucency: { value: 0.48 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const oncMesh = new THREE.Mesh(oncGeo, oncMat);
        oncMesh.userData = { shaderKind: "stage", regionCode: 11 };
        oncMesh.renderOrder = 2;
        root.add(oncMesh);

        // 3. Embrióforo grueso radiado externo (doble pasada BackSide + FrontSide)
        const embGeo = new THREE.SphereGeometry(1.88, 64, 48);
        const embBackMat = new THREE.ShaderMaterial({
          vertexShader: STAGE_VERTEX_SHADER,
          fragmentShader: STAGE_FRAGMENT_SHADER,
          uniforms: {
            u_partId: { value: 10 },
            u_shaderMode: { value: 0 },
            u_translucency: { value: 0.48 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.BackSide,
        });
        const embBack = new THREE.Mesh(embGeo, embBackMat);
        embBack.userData = { shaderKind: "stage", regionCode: 10 };
        embBack.renderOrder = 3;
        root.add(embBack);

        const embFrontMat = embBackMat.clone();
        embFrontMat.side = THREE.FrontSide;
        const embFront = new THREE.Mesh(embGeo, embFrontMat);
        embFront.userData = { shaderKind: "stage", regionCode: 10 };
        embFront.renderOrder = 4;
        root.add(embFront);
      } else {
        // --- CISTICERCO: Cysticercus cellulosae (armado, T. solium) vs Cysticercus bovis (inerme, T. saginata) ---

        const accentMat = new THREE.ShaderMaterial({
          vertexShader: STAGE_VERTEX_SHADER,
          fragmentShader: STAGE_FRAGMENT_SHADER,
          uniforms: {
            u_partId: { value: 12 },
            u_shaderMode: { value: 0 },
            u_translucency: { value: 0.52 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
          },
          side: THREE.DoubleSide,
        });

        if (!isSaginata) {
          // En Taenia solium (Cysticercus cellulosae): Corona interna de 20 ganchos falciformes en el escólex invaginado
          const nCystHooks = 20;
          for (let k = 0; k < nCystHooks; k++) {
            const ang = (k / nCystHooks) * Math.PI * 2.0;
            const rRing = k % 2 === 0 ? 0.24 : 0.29;
            const hGeo = buildFalciformHookGeometry(k % 2 === 0 ? 0.28 : 0.22, 0.024);
            const hMesh = new THREE.Mesh(hGeo, accentMat.clone());
            hMesh.position.set(
              0.35 + Math.cos(ang) * rRing * 0.4,
              -0.08 + Math.sin(ang) * rRing,
              Math.cos(ang) * rRing
            );
            hMesh.rotation.set(ang, 0.3, Math.PI * 0.35);
            hMesh.userData = {
              shaderKind: "stage",
              regionCode: 12,
            };
            hMesh.renderOrder = 1;
            root.add(hMesh);
          }
        } else {
          // En Taenia saginata (Cysticercus bovis): SIN ganchos; 4 ventosas acetabulares musculares internas en el protocólex inerme
          const suckerAngles = [
            Math.PI * 0.25,
            Math.PI * 0.75,
            Math.PI * 1.25,
            Math.PI * 1.75,
          ];
          suckerAngles.forEach((ang) => {
            const cupGeo = new THREE.TorusGeometry(0.18, 0.055, 16, 28);
            const cupMesh = new THREE.Mesh(cupGeo, accentMat.clone());
            const rPos = 0.44;
            cupMesh.position.set(
              0.36,
              0.12 + Math.sin(ang) * rPos,
              Math.cos(ang) * rPos
            );
            cupMesh.rotation.set(0, Math.cos(ang) * 0.65, Math.sin(ang) * 0.65);
            cupMesh.userData = {
              shaderKind: "stage",
              regionCode: 12,
            };
            cupMesh.renderOrder = 1;
            root.add(cupMesh);
          });
        }

        // 2. Escólex invaginado (nódulo mural piriforme/cuadrangular + cuello espiral hacia la pared)
        const scolexMat = new THREE.ShaderMaterial({
          vertexShader: STAGE_VERTEX_SHADER,
          fragmentShader: STAGE_FRAGMENT_SHADER,
          uniforms: {
            u_partId: { value: 21 },
            u_shaderMode: { value: 0 },
            u_translucency: { value: 0.52 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
          },
          side: THREE.DoubleSide,
        });

        // Bulbo cefálico del escólex invaginado con sus 4 lóbulos acetabulares
        const nodGeo = new THREE.SphereGeometry(0.68, 44, 34);
        const posAttr = nodGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const vx = posAttr.getX(i);
          const vy = posAttr.getY(i);
          const vz = posAttr.getZ(i);
          const phi = Math.atan2(vz, vy);
          const fourLobes = 1.0 + 0.14 * Math.cos(4.0 * phi) * Math.exp(-vx * vx * 2.5);
          posAttr.setXYZ(i, vx * 1.15, vy * fourLobes * 0.88, vz * fourLobes * 0.88);
        }
        nodGeo.computeVertexNormals();
        const nodMesh = new THREE.Mesh(nodGeo, scolexMat);
        nodMesh.position.set(0.42, 0.12, 0.0);
        nodMesh.userData = { shaderKind: "stage", regionCode: 21 };
        nodMesh.renderOrder = 2;
        root.add(nodMesh);

        // Canal espiral de invaginación que conecta el nódulo mural con el poro de la pared vesicular
        const canalCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.75, 0.18, 0.0),
          new THREE.Vector3(1.18, 0.42, 0.18),
          new THREE.Vector3(1.58, 0.25, -0.12),
          new THREE.Vector3(1.98, 0.35, 0.0),
        ]);
        const canalGeo = new THREE.TubeGeometry(canalCurve, 36, 0.24, 18, false);
        const canalMesh = new THREE.Mesh(canalGeo, scolexMat.clone());
        canalMesh.userData = { shaderKind: "stage", regionCode: 21 };
        canalMesh.renderOrder = 2;
        root.add(canalMesh);

        // 3. Vesícula translúcida ovoide-reniforme llena de líquido (BackSide + FrontSide)
        const vesGeo = new THREE.SphereGeometry(2.15, 64, 48);
        const vPos = vesGeo.attributes.position;
        for (let i = 0; i < vPos.count; i++) {
          const vx = vPos.getX(i);
          const vy = vPos.getY(i);
          const vz = vPos.getZ(i);
          const dimple =
            vx > 0.8
              ? -0.26 * Math.exp(-(vy * vy + vz * vz) * 1.4) * smoothstepJS(0.8, 2.1, vx)
              : 0.0;
          vPos.setXYZ(i, vx * 1.18 + dimple, vy * 0.88, vz * 0.86);
        }
        vesGeo.computeVertexNormals();

        const vesBackMat = new THREE.ShaderMaterial({
          vertexShader: STAGE_VERTEX_SHADER,
          fragmentShader: STAGE_FRAGMENT_SHADER,
          uniforms: {
            u_partId: { value: 20 },
            u_shaderMode: { value: 0 },
            u_translucency: { value: 0.52 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.BackSide,
        });
        const vesBack = new THREE.Mesh(vesGeo, vesBackMat);
        vesBack.userData = {
          shaderKind: "stage",
          regionCode: 20,
        };
        vesBack.renderOrder = 3;
        root.add(vesBack);

        const vesFrontMat = vesBackMat.clone();
        vesFrontMat.side = THREE.FrontSide;
        const vesFront = new THREE.Mesh(vesGeo, vesFrontMat);
        vesFront.userData = {
          shaderKind: "stage",
          regionCode: 20,
        };
        vesFront.renderOrder = 4;
        root.add(vesFront);
      }

      scene.add(root);
    },
    [disposeGroup, isSaginata]
  );

  // Refs sincronizados para el bucle de animación
  const activeStageRef = useRef<TaeniaStageId>(activeStage);
  const wavePercentRef = useRef<number>(wavePercent);
  const translucencyRef = useRef<number>(translucency);
  const cutPercentRef = useRef<number>(cutPercent);
  const shaderModeRef = useRef<TaeniaShaderMode>(shaderMode);
  const selectedRegionIdRef = useRef<string | null>(selectedRegionId);
  const stagesDictRef = useRef<Record<TaeniaStageId, TaeniaStageMeta>>(stagesDict);

  useEffect(() => {
    stagesDictRef.current = stagesDict;
  }, [stagesDict]);
  useEffect(() => {
    activeStageRef.current = activeStage;
  }, [activeStage]);
  useEffect(() => {
    wavePercentRef.current = wavePercent;
  }, [wavePercent]);
  useEffect(() => {
    translucencyRef.current = translucency;
  }, [translucency]);
  useEffect(() => {
    cutPercentRef.current = cutPercent;
  }, [cutPercent]);
  useEffect(() => {
    shaderModeRef.current = shaderMode;
  }, [shaderMode]);
  useEffect(() => {
    selectedRegionIdRef.current = selectedRegionId;
  }, [selectedRegionId]);

  // Sincronizar color de fondo y uniforms estáticos al cambiar modo o controles
  const syncUniforms = useCallback(() => {
    const scene = sceneRef.current;
    const root = modelRootRef.current;
    if (!scene || !root) return;

    // En modo Tinción Carmín / Histológica (shaderMode === 1), usar fondo blanco ligeramente cálido (#faf7f2)
    scene.background = new THREE.Color(shaderMode === 1 ? 0xfaf7f2 : 0x070b14);

    const currentMeta = stagesDict[activeStage];
    const activeReg = currentMeta.regions.find((r) => r.id === selectedRegionId) || null;
    const highlightCode = activeReg ? activeReg.regionCode : 0;

    const maxZ = activeStage === "egg" ? 1.92 : 2.15;
    const isCutting = cutPercent > 0.5;
    const cutZ = isCutting ? maxZ * (1.0 - (cutPercent / 100.0) * 1.85) : maxZ + 2.0;

    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mat = obj.material as THREE.ShaderMaterial;
      const kind = obj.userData?.shaderKind;

      if (kind === "worm") {
        mat.uniforms.u_translucency.value = translucency / 100.0;
        mat.uniforms.u_cutPlane.value = cutPercent / 100.0;
        mat.uniforms.u_shaderMode.value = shaderMode;
        mat.uniforms.u_highlightRegion.value = highlightCode;
        mat.uniforms.u_isSaginata.value = isSaginata ? 1 : 0;
      } else if (kind === "stage") {
        const rCode = obj.userData?.regionCode as number;
        mat.uniforms.u_shaderMode.value = shaderMode;
        mat.uniforms.u_translucency.value = translucency / 100.0;
        mat.uniforms.u_cutZ.value = cutZ;
        mat.uniforms.u_highlight.value = highlightCode > 0 && highlightCode === rCode ? 1 : 0;
      }
    });
  }, [activeStage, shaderMode, translucency, cutPercent, selectedRegionId, stagesDict, isSaginata]);

  useEffect(() => {
    syncUniforms();
  }, [syncUniforms]);

  // Inicializar escena WebGL al montar y liberar recursos al desmontar
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
    const initCam = stagesDictRef.current.strobila.defaultCamera;
    camera.position.set(...initCam.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.25;
    controls.maxDistance = 32.0;
    controls.target.set(...initCam.target);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.15;
    controlsRef.current = controls;

    const stopCamTransition = () => {
      camTransitionRef.current.active = false;
    };
    controls.addEventListener("start", stopCamTransition);

    buildStage3DScene("strobila", scene);

    let lastNow = performance.now();
    let frameCount = 0;

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const dt = Math.min(0.05, (now - lastNow) * 0.001);
      lastNow = now;

      const waveScale = wavePercentRef.current / 100.0;
      const stg = activeStageRef.current;
      if (stg === "strobila" || stg === "scolex") {
        simTimeRef.current += dt * (0.12 + 1.25 * waveScale);
        if (modelRootRef.current) {
          modelRootRef.current.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.userData?.shaderKind === "worm") {
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

      // Proyección de marcadores 3D con resolución de colisiones
      frameCount++;
      if (frameCount % 2 === 0 && holder) {
        const w = holder.clientWidth;
        const h = holder.clientHeight;
        if (w > 0 && h > 0) {
          const currentStage = stagesDictRef.current[stg];
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
            if (stg === "strobila" || stg === "scolex") {
              worldXYZ = localToWorldWormPoint(reg.localAnchor, simTimeRef.current, waveScale);
            } else {
              worldXYZ = reg.localAnchor;
            }

            const worldPt = new THREE.Vector3(...worldXYZ);
            const proj = worldPt.clone().project(camera);
            const inFront = proj.z >= -1 && proj.z <= 1;
            const ax = (proj.x * 0.5 + 0.5) * w;
            const ay = (-(proj.y * 0.5) + 0.5) * h;

            const padX = Math.min(112, w * 0.24);
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

          // Separación iterativa mínima entre etiquetas para impedir superposiciones
          for (let iter = 0; iter < 3; iter++) {
            for (let i = 0; i < rawPins.length; i++) {
              for (let j = i + 1; j < rawPins.length; j++) {
                const pA = rawPins[i];
                const pB = rawPins[j];
                if (!pA.visible || !pB.visible) continue;
                const dx = pB.labelX - pA.labelX;
                const dy = pB.labelY - pA.labelY;
                if (Math.abs(dx) < 146 && Math.abs(dy) < 34) {
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

          // Escala geométrica dinámica según la distancia de cámara
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

  // Seleccionar una región / estructura anatómica
  const handleSelectRegion = useCallback((regionId: string | null) => {
    setSelectedRegionId((prev) => {
      const nextId = prev === regionId ? null : regionId;
      const currentStage = stagesDictRef.current[activeStageRef.current];
      if (nextId) {
        const reg = currentStage.regions.find((r) => r.id === nextId);
        if (reg) {
          setIsFocused(true);
          if (reg.defaultTranslucency !== undefined) {
            setTranslucency(reg.defaultTranslucency);
          }
          // Si es el estróbilo/escólex, calculamos el punto de anclaje actual en el mundo
          if (activeStageRef.current === "strobila" || activeStageRef.current === "scolex") {
            const wp = localToWorldWormPoint(
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

  // Botón de enfoque rápido («Enfocar escólex» / «Enfocar oncosfera» / «Enfocar escólex invaginado»)
  const handleQuickFocus = () => {
    setSelectedRegionId(null);
    setIsFocused(true);
    if (activeStage === "egg" || activeStage === "cysticercus") {
      setTranslucency(65);
    }
    const cam = stageMeta.focusCamera;
    camTransitionRef.current = {
      active: true,
      goalPos: new THREE.Vector3(...cam.position),
      goalTarget: new THREE.Vector3(...cam.target),
    };
  };

  // Botón «Ver completo»
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

  // Cambiar de forma / estadio desde el desplegable «Elegir forma»
  const handleSwitchStage = useCallback(
    (newStage: TaeniaStageId) => {
      setIsStageDropdownOpen(false);
      if (newStage === activeStage) return;
      const meta = stagesDict[newStage];
      setActiveStage(newStage);
      setSelectedRegionId(null);
      setIsFocused(false);
      setCutPercent(0);
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
    [activeStage, buildStage3DScene, stagesDict]
  );

  const handleZoom = (factor: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    camTransitionRef.current.active = false;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    const nextLen = Math.max(1.35, Math.min(30.0, dir.length() * factor));
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
      {/* 1. VISOR 3D PROTAGONISTA: Los paneles de control están fuera del lienzo para no tapar nunca el modelo */}
      <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[580px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#070b14]">
        {/* Lienzo WebGL Three.js */}
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

        {/* BARRA SUPERIOR COMPACTA: Selector «Elegir forma», Enfoque rápido, 4 Modos de renderizado y Marcadores */}
        <header className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Izquierda: Selector desplegable «Elegir forma» + Botones de encuadre rápido */}
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
                  aria-label={`Elegir estadio de ${speciesName}`}
                  className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1.5"
                >
                  <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Estadios morfológicos de {speciesName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsStageDropdownOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(["strobila", "scolex", "egg", "cysticercus"] as TaeniaStageId[]).map((sId) => {
                    const item = stagesDict[sId];
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
                  })}
                </div>
              )}
            </div>

            {/* Botones de encuadre rápido */}
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

          {/* Derecha: Modos de renderizado (Biológico, Tinción Carmín, SEM, Rayos X) + Mostrar/Ocultar marcadores */}
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
                <span>Tinción Carmín</span>
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

        {/* BARRA INFERIOR COMPACTA DEL VISOR */}
        <footer className="absolute bottom-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/70 px-3 py-1.5 text-[11px] text-slate-200 flex items-center gap-2 pointer-events-auto shadow-lg">
            <span className="font-semibold text-amber-300">
              Reconstrucción 3D educativa; no sustituye la observación microscópica.
            </span>
            <span className="hidden xl:inline text-slate-400">
              ·{" "}
              {shaderMode === 1
                ? "Tinción Carmín de Semichon: fondo blanco cálido con coloración diferencial de órganos reproductores."
                : shaderMode === 2
                ? "SEM: simulación de relieve topográfico de microscopía electrónica de barrido."
                : shaderMode === 3
                ? isSaginata
                  ? "Rayos X: transiluminación de conductos osmorreguladores, ovario bilobulado y 15–20+ ramas uterinas."
                  : "Rayos X: transiluminación de conductos osmorreguladores, ovario trilobulado y 7–13 ramas uterinas."
                : "Modo Biológico 3D: sombreado orgánico con dispersión subsuperficial."}
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

            {/* Escala dinámica */}
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

      {/* 2. PANEL DE CONTROLES Y REGIONES ANATÓMICAS FUERA DEL LIENZO PRINCIPAL */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 space-y-3.5">
        {/* Cabecera plegable para celular */}
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
            <span>{mobileControlsOpen ? "Ocultar controles" : "Translucidez y corte"}</span>
            {mobileControlsOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Deslizadores: Translucidez Cuticular, Corte Histológico Dorsal y Ondulación Peristáltica */}
        <div
          className={`${
            mobileControlsOpen ? "grid" : "hidden md:grid"
          } grid-cols-1 ${
            stageMeta.hasPeristalsis ? "md:grid-cols-3" : "md:grid-cols-2"
          } gap-3.5 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800`}
        >
          {/* Deslizador 1: Translucidez Cuticular / Tegumentaria */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sliderTaeniaTrans" className="text-slate-200 font-bold">
                {stageMeta.translucencyLabel}
              </label>
              <span className="text-cyan-300 font-mono font-bold">{translucency}%</span>
            </div>
            <input
              id="sliderTaeniaTrans"
              type="range"
              min={0}
              max={100}
              value={translucency}
              onChange={(e) => setTranslucency(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">{stageMeta.translucencyHint}</p>
          </div>

          {/* Deslizador 2: Corte Histológico Dorsal / Sección 3D */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="sliderTaeniaCut"
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
                    Quitar corte
                  </button>
                )}
                <span className="text-cyan-300 font-mono font-bold">{cutPercent}%</span>
              </div>
            </div>
            <input
              id="sliderTaeniaCut"
              type="range"
              min={0}
              max={100}
              value={cutPercent}
              onChange={(e) => setCutPercent(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              Secciona progresivamente el plano dorsal o frontal para examinar la anatomía interna.
            </p>
          </div>

          {/* Deslizador 3: Ondulación Peristáltica (solo en estróbilo / escólex) */}
          {stageMeta.hasPeristalsis && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="sliderTaeniaWave"
                  className="text-slate-200 font-bold flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ondulación Peristáltica</span>
                </label>
                <span className="text-cyan-300 font-mono font-bold">{wavePercent}%</span>
              </div>
              <input
                id="sliderTaeniaWave"
                type="range"
                min={0}
                max={100}
                value={wavePercent}
                onChange={(e) => setWavePercent(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 leading-snug">
                Controla la amplitud y velocidad de la onda muscular a lo largo del estróbilo.
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

          {/* Tarjeta de detalle de la región seleccionada o resumen general con tabla diferencial */}
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
                    Observación microscópica / Diagnóstico diferencial:{" "}
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

              {/* Mini-tabla diferencial T. solium vs T. saginata */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Diferencial rápido: <em>T. solium</em> vs <em>T. saginata</em>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <span className="text-slate-400 font-semibold">Rasgo</span>
                  <span className={!isSaginata ? "text-cyan-300 font-bold" : "text-slate-400"}>
                    T. solium
                  </span>
                  <span className={isSaginata ? "text-cyan-300 font-bold" : "text-amber-300/90 font-semibold"}>
                    T. saginata
                  </span>
                  <span className="text-slate-400">Rostelo/Ganchos</span>
                  <span className={!isSaginata ? "text-slate-200 font-semibold" : "text-slate-400"}>
                    22–32 (2 filas)
                  </span>
                  <span className={isSaginata ? "text-slate-200 font-semibold" : "text-slate-400"}>
                    Inerme (0 ganchos)
                  </span>
                  <span className="text-slate-400">Ovario</span>
                  <span className={!isSaginata ? "text-slate-200 font-semibold" : "text-slate-400"}>
                    Trilobulado
                  </span>
                  <span className={isSaginata ? "text-slate-200 font-semibold" : "text-slate-400"}>
                    Bilobulado + esfínter
                  </span>
                  <span className="text-slate-400">Ramas útero</span>
                  <span className={!isSaginata ? "text-slate-200 font-semibold" : "text-slate-400"}>
                    7 – 13 (dendríticas)
                  </span>
                  <span className={isSaginata ? "text-slate-200 font-semibold" : "text-slate-400"}>
                    15 – 30 (dicotómicas)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Referencias documentales */}
        <div className="pt-2 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
          <div>
            <strong className="text-slate-300">Fuentes de referencia:</strong> CDC DPDx Taeniasis /
            Cysticercosis (
            <a
              href="https://www.cdc.gov/dpdx/taeniasis/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              cdc.gov/dpdx/taeniasis
            </a>
            ) · García HH et al., <em>Lancet</em> 2014 · Guía MINSAL Chile.
          </div>
          <div>
            {isSaginata
              ? "Escólex inerme (0 ganchos) · 4 ventosas · Ovario bilobulado · 15–20+ ramas uterinas"
              : "28 ganchos · 4 ventosas · Ovario trilobulado · 7–13 ramas uterinas"}
          </div>
        </div>
      </div>
    </div>
  );
};
