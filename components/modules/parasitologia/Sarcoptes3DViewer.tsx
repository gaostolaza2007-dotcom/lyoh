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
 * Formas evolutivas y diagnósticas de Sarcoptes scabiei var. hominis (Ácaro de la sarna / escabiosis humana)
 * Referencias morfológicas y clínicas:
 * - CDC DPDx - Scabies (Sarcoptes scabiei var. hominis): https://www.cdc.gov/dpdx/scabies/index.html
 * - Arlian LG, Morgan MS. A review of Sarcoptes scabiei: past, present and future. Parasites & Vectors (2017)
 * - Guías Clínicas MINSAL / ISP Chile: Sarna (Escabiosis) y Ectoparasitosis
 */
export type SarcoptesStageId =
  | "female_adult"
  | "epidermal_burrow"
  | "male_adult"
  | "hexapod_larva";

/**
 * Modos de sombreado:
 * 0 = Biológico 3D (cutícula perlada marfil-ámbar translúcida con estriaciones transversales, escamas dorsales y órganos internos)
 * 1 = Montaje KOH 10% / Aceite Mineral (fondo blanco cálido #faf7f2 de campo claro con quitina ámbar-caoba, huevos hialinos y escíbalos)
 * 2 = SEM (Microscopía Electrónica de Barrido de ultra-alta definición de estriaciones, escamas triangulares y espinas cónicas)
 * 3 = Rayos X / Transiluminación (resalta el huevo gigante intrauterino, mesenterón bilobulado, escíbalos y embrión hexápodo)
 */
export type SarcoptesShaderMode = 0 | 1 | 2 | 3;

export interface SarcoptesRegionInfo {
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

export interface SarcoptesStageMeta {
  id: SarcoptesStageId;
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
  regions: SarcoptesRegionInfo[];
}

/**
 * Utilidades matemáticas para generación procedural orgánica
 */
function clampJS(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function smoothstepJS(edge0: number, edge1: number, x: number): number {
  const t = clampJS((x - edge0) / (edge1 - edge0), 0.0, 1.0);
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
  const len = Math.hypot(a[0], a[1], a[2]);
  if (len < 1e-8) return [0, 1, 0];
  return [a[0] / len, a[1] / len, a[2] / len];
}

/**
 * Evalúa la superficie 3D del idiosoma «en forma de tortuga» de Sarcoptes scabiei var. hominis:
 * - Contorno oval-hemisférico globoso, fuertemente convexo en el dorso y aplanado en el vientre
 * - Escotadura anterior del camerostoma donde se inserta el gnatosoma y hendidura anal terminal posterodorsal
 * - Cintura propodosomal-histerosomal sutil y lóbulos marginales donde emergen los 4 pares de patas cortas
 * - Placa/escudo propodosomal anterodorsal y pliegues cuticulares transversales continuos
 */
function evaluateSarcoptesIdiosomaSurface(
  u: number, // 0.0 (borde anterior del camerostoma) -> 1.0 (extremo caudal perianal)
  phi: number, // 0..2PI alrededor de la sección transversal (cPhi = lateral Z, sPhi = dorsoventral Y)
  variant: "female" | "male" | "larva",
  offsetX = 0.0,
  offsetY = 0.0,
  offsetZ = 0.0,
  scaleFactor = 1.0
): {
  pos: [number, number, number];
  regionId: number;
  segU: number;
  segV: number;
  scleriteMask: number;
} {
  // Proporciones reales: hembra 400 x 320 µm (oval ancha en tortuga), macho 220 x 175 µm, larva 135 x 105 µm
  const totalLen =
    (variant === "female" ? 4.8 : variant === "male" ? 3.55 : 2.85) * scaleFactor;
  const maxWidth =
    (variant === "female" ? 2.02 : variant === "male" ? 1.42 : 1.15) * scaleFactor;
  const maxDorsalH =
    (variant === "female" ? 1.42 : variant === "male" ? 0.96 : 0.78) * scaleFactor;
  const maxVentralH =
    (variant === "female" ? 0.44 : variant === "male" ? 0.34 : 0.28) * scaleFactor;

  const xStart = -totalLen * 0.48;
  const x = offsetX + xStart + u * totalLen;

  const cPhi = Math.cos(phi); // Lateral Z (-1..+1)
  const sPhi = Math.sin(phi); // Dorsoventral Y (+1 = domo dorsal, -1 = cara ventral plana)
  const absC = Math.abs(cPhi);

  // Perfil ovoide ancho «en caparazón de tortuga» con polo redondeado pero ligeramente acuminado adelante y ancho atrás
  const baseArch = Math.pow(Math.sin(clampJS(u, 0.0005, 0.9995) * Math.PI), 0.56);
  const posteriorBroadening = 1.0 + 0.11 * Math.sin((u - 0.22) * Math.PI);

  // Lóbulos marginales donde articulan patas I-II (u ~ 0.16 y 0.31) y cintura sejugal (u ~ 0.43)
  const lobeLeg1 = 1.0 + 0.065 * Math.exp(-Math.pow((u - 0.15) / 0.075, 2.0)) * Math.pow(absC, 1.3);
  const lobeLeg2 = 1.0 + 0.08 * Math.exp(-Math.pow((u - 0.31) / 0.085, 2.0)) * Math.pow(absC, 1.3);
  const sejugalWaist = 1.0 - 0.065 * Math.exp(-Math.pow((u - 0.43) / 0.07, 2.0)) * Math.pow(absC, 1.2);
  const hysteroSwell = 1.0 + 0.075 * Math.exp(-Math.pow((u - 0.67) / 0.18, 2.0)) * Math.pow(absC, 1.1);

  // Hendidura anal terminal bilabiada en el polo posterior (u > 0.91)
  const analCleft =
    u > 0.89 && absC < 0.28 && sPhi > -0.25
      ? 1.0 - 0.22 * smoothstepJS(0.89, 1.0, u) * Math.exp(-Math.pow(cPhi / 0.13, 2.0))
      : 1.0;

  // Camerostoma anterior (depresión anteroventral para el gnatosoma)
  const camerostomeIndent =
    u < 0.11 && absC < 0.42 && sPhi < 0.35
      ? 1.0 - 0.16 * (1.0 - u / 0.11) * Math.exp(-Math.pow(cPhi / 0.24, 2.0))
      : 1.0;

  let W =
    maxWidth *
    baseArch *
    posteriorBroadening *
    lobeLeg1 *
    lobeLeg2 *
    sejugalWaist *
    hysteroSwell *
    analCleft *
    camerostomeIndent;

  // Altura dorso-ventral asimétrica: domo dorsal muy abombado (tortuga) y vientre aplanado
  const heightArch = Math.pow(Math.sin(clampJS(u, 0.0005, 0.9995) * Math.PI), 0.62);
  const dorsalDomeProfile =
    maxDorsalH *
    heightArch *
    (1.0 + 0.09 * Math.sin((u - 0.15) * Math.PI)) *
    analCleft;
  const ventralFlatProfile = maxVentralH * heightArch * camerostomeIndent;

  // Estriaciones cuticulares transversales finas («huellas dactilares» continuas de Sarcoptes)
  const striaeFreq = variant === "larva" ? 42.0 : 58.0;
  const striaeWave = Math.sin(u * Math.PI * striaeFreq + 0.35 * Math.cos(cPhi * 2.5));
  // Las estriaciones se interrumpen levemente en el escudo propodosomal anteromedial (u: 0.12..0.28, absC < 0.32)
  const propodosomalShield =
    sPhi > 0.55 && u > 0.11 && u < 0.28 && absC < 0.34
      ? smoothstepJS(0.34, 0.16, absC) * Math.sin(((u - 0.11) / 0.17) * Math.PI)
      : 0.0;
  const striaeAmp = 0.011 * scaleFactor * (1.0 - 0.75 * propodosomalShield) * Math.sin(u * Math.PI);

  // Surcos transversales mayores del dorso y surco sejugal
  const majorFolds =
    0.018 *
    scaleFactor *
    Math.sin(u * Math.PI * 9.0) *
    (sPhi > 0.0 ? Math.pow(sPhi, 0.7) : 0.35);

  const zDir = Math.sign(cPhi) * Math.pow(absC, 0.86);
  let yLocal = 0.0;
  if (sPhi >= 0.0) {
    // Domo dorsal fuertemente convexo con ligero reborde marginal (flange lateral de tortuga)
    const rimFlange = 1.0 - 0.08 * Math.exp(-Math.pow((absC - 0.88) / 0.09, 2.0));
    yLocal =
      (dorsalDomeProfile * Math.pow(sPhi, 0.74) * rimFlange) +
      (striaeAmp * striaeWave + majorFolds) * sPhi;
  } else {
    // Vientre marcadamente aplanado para adherirse al suelo del surco epidérmico
    const flatVentral = Math.pow(-sPhi, 1.38);
    yLocal = -ventralFlatProfile * flatVentral + 0.4 * striaeAmp * striaeWave * sPhi;
  }

  const zLocal = W * zDir + striaeAmp * striaeWave * cPhi * 0.65;

  // Máscara de esclerotización: escudo propodosomal, borde del camerostoma y escleritos posteriores del macho
  let scleriteMask = propodosomalShield * 0.65;
  if (u < 0.09) {
    scleriteMask = Math.max(scleriteMask, (1.0 - u / 0.09) * 0.72);
  }
  if (variant === "male" && sPhi > 0.35 && u > 0.58 && u < 0.90 && absC < 0.52) {
    // Escudo histerosomal dorsal tenue del macho
    scleriteMask = Math.max(scleriteMask, 0.38 * Math.sin(((u - 0.58) / 0.32) * Math.PI));
  }

  return {
    pos: [x, offsetY + yLocal, offsetZ + zLocal],
    regionId: 2.0,
    segU: u,
    segV: cPhi,
    scleriteMask: clampJS(scleriteMask, 0.0, 1.0),
  };
}

/**
 * Añade un elipsoide 3D u ovoide embrionario al BufferGeometry
 */
function appendSarcoptesEllipsoid(
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
  openShellMode = false // Si true, crea un corion eclosionado con hendidura longitudinal
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

    for (let lon = 0; lon <= lonBands; lon++) {
      const u = lon / lonBands;
      const phi = openShellMode
        ? (0.14 + u * 0.72) * Math.PI * 2.0
        : u * Math.PI * 2.0;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const lx = rx * cosTheta;
      const ly = ry * sinTheta * sinPhi;
      const lz = rz * sinTheta * cosPhi;

      // Rotación Z luego Y
      const x1 = lx * cZ - ly * sZ;
      const y1 = lx * sZ + ly * cZ;
      const z1 = lz;

      const wx = cx + x1 * cY + z1 * sY;
      const wy = cy + y1;
      const wz = cz - x1 * sY + z1 * cY;

      const nx0 = cosTheta / Math.max(0.01, rx);
      const ny0 = (sinTheta * sinPhi) / Math.max(0.01, ry);
      const nz0 = (sinTheta * cosPhi) / Math.max(0.01, rz);

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
 * Añade un tubo orgánico 3D a lo largo de una polilínea de puntos con radios variables
 * (usado para patas cónicas anilladas, pedicelos de ventosas, cerdas flageliformes, epímeros en Y, quelíceros y tubo digestivo)
 */
function appendSarcoptesTube(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  pathPoints: [number, number, number][],
  radii: number[],
  metaZ: number,
  regionId: number,
  radialSegments = 12,
  ringFreq = 0.0,
  ringAmp = 0.0
) {
  if (pathPoints.length < 2) return;
  const baseVertex = positions.length / 3;
  const nPts = pathPoints.length;

  for (let i = 0; i < nPts; i++) {
    const u = i / (nPts - 1);
    const p = pathPoints[i];
    const rBase = radii[i];
    const rMod =
      ringFreq > 0.0
        ? rBase * (1.0 + ringAmp * Math.sin(u * Math.PI * ringFreq))
        : rBase;

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
      const ny = norm[1] * ca + binorm[1] * sa;
      const nz = norm[2] * ca + binorm[2] * sa;

      positions.push(p[0] + rMod * nx, p[1] + rMod * ny, p[2] + rMod * nz);
      normals.push(nx, ny, nz);
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
 * Añade una escama triangular dorsal 3D dirigida hacia atrás (dentículo de anclaje epidérmico)
 */
function appendDorsalTriangularScale(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  surfacePos: [number, number, number],
  surfaceNorm: [number, number, number],
  scaleSize: number,
  regionId: number
) {
  const baseVertex = positions.length / 3;
  const n = vec3Norm(surfaceNorm);
  // Vector tangente apuntando hacia atrás (+X) con ligera elevación dorsal
  const backDir = vec3Norm([0.92, 0.38 * n[1], 0.12 * n[2]]);
  const latDir = vec3Norm(vec3Cross(n, backDir));

  const w = scaleSize * 0.65;
  const len = scaleSize * 1.38;
  const h = scaleSize * 0.44;

  // 4 vértices de una pirámide triangular aplanada en forma de diente de tiburón apuntando a +X
  const pLeft: [number, number, number] = [
    surfacePos[0] - len * 0.25 * backDir[0] - w * latDir[0],
    surfacePos[1] - len * 0.25 * backDir[1] - w * latDir[1],
    surfacePos[2] - len * 0.25 * backDir[2] - w * latDir[2],
  ];
  const pRight: [number, number, number] = [
    surfacePos[0] - len * 0.25 * backDir[0] + w * latDir[0],
    surfacePos[1] - len * 0.25 * backDir[1] + w * latDir[1],
    surfacePos[2] - len * 0.25 * backDir[2] + w * latDir[2],
  ];
  const pRidge: [number, number, number] = [
    surfacePos[0] + len * 0.15 * backDir[0] + h * n[0],
    surfacePos[1] + len * 0.15 * backDir[1] + h * n[1],
    surfacePos[2] + len * 0.15 * backDir[2] + h * n[2],
  ];
  const pTip: [number, number, number] = [
    surfacePos[0] + len * 0.88 * backDir[0] + h * 0.55 * n[0],
    surfacePos[1] + len * 0.88 * backDir[1] + h * 0.55 * n[1],
    surfacePos[2] + len * 0.88 * backDir[2] + h * 0.55 * n[2],
  ];

  const nTop = vec3Norm([n[0] + 0.25 * backDir[0], n[1] + 0.25 * backDir[1], n[2] + 0.25 * backDir[2]]);
  const nLeft = vec3Norm([n[0] - 0.65 * latDir[0], n[1] - 0.65 * latDir[1], n[2] - 0.65 * latDir[2]]);
  const nRight = vec3Norm([n[0] + 0.65 * latDir[0], n[1] + 0.65 * latDir[1], n[2] + 0.65 * latDir[2]]);

  positions.push(
    pLeft[0], pLeft[1], pLeft[2],
    pRight[0], pRight[1], pRight[2],
    pRidge[0], pRidge[1], pRidge[2],
    pTip[0], pTip[1], pTip[2]
  );
  normals.push(
    nLeft[0], nLeft[1], nLeft[2],
    nRight[0], nRight[1], nRight[2],
    nTop[0], nTop[1], nTop[2],
    backDir[0], backDir[1], backDir[2]
  );
  meta1.push(
    0.1, 0.0, 0.72, regionId,
    0.1, 1.0, 0.72, regionId,
    0.5, 0.5, 0.88, regionId,
    1.0, 0.5, 0.98, regionId
  );

  indices.push(
    baseVertex + 0, baseVertex + 2, baseVertex + 1,
    baseVertex + 0, baseVertex + 3, baseVertex + 2,
    baseVertex + 2, baseVertex + 3, baseVertex + 1
  );
}

/**
 * Construye una pata anterior (Par I o II) o Par IV del macho provista de:
 * - Anillo basal quitinoso y 5 poditos telescópicos cortos y cónicos (coxa, trocánter, fémur, genu, tibia-tarso)
 * - 2 garras tarsales cortas y cerdas táctiles
 * - Pedicelo largo no segmentado (ambulacro tubular) rematado en una ventosa acampanada 3D (pulvilo)
 */
function appendSarcoptesLegWithSucker(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  rootPos: [number, number, number],
  dirVec: [number, number, number],
  scale: number,
  regionId: number
) {
  const d = vec3Norm(dirVec);
  const sSign = rootPos[2] >= 0 ? 1 : -1;

  // 1. Cono telescópico de los 5 artejos cortos de la pata (coxa -> tarso)
  const legLen = 0.64 * scale;
  const p0: [number, number, number] = [...rootPos];
  const p1: [number, number, number] = [
    p0[0] + d[0] * legLen * 0.25,
    p0[1] + d[1] * legLen * 0.25,
    p0[2] + d[2] * legLen * 0.25,
  ];
  const p2: [number, number, number] = [
    p0[0] + d[0] * legLen * 0.52,
    p0[1] + d[1] * legLen * 0.52 - 0.02 * scale,
    p0[2] + d[2] * legLen * 0.52,
  ];
  const p3: [number, number, number] = [
    p0[0] + d[0] * legLen * 0.78,
    p0[1] + d[1] * legLen * 0.78 - 0.03 * scale,
    p0[2] + d[2] * legLen * 0.78,
  ];
  const p4: [number, number, number] = [
    p0[0] + d[0] * legLen,
    p0[1] + d[1] * legLen - 0.02 * scale,
    p0[2] + d[2] * legLen,
  ];

  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    [p0, p1, p2, p3, p4],
    [0.21 * scale, 0.175 * scale, 0.14 * scale, 0.105 * scale, 0.068 * scale],
    0.85,
    regionId,
    14,
    5.0,
    0.16
  );

  // Pequeña uña tarsal quitinosa y 2 cerdas táctiles genuales/tibiales
  const clawTip: [number, number, number] = [
    p4[0] + d[0] * 0.11 * scale,
    p4[1] - 0.08 * scale,
    p4[2] + d[2] * 0.09 * scale,
  ];
  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    [p4, clawTip],
    [0.028 * scale, 0.005 * scale],
    0.96,
    regionId,
    8
  );

  const setaMid: [number, number, number] = [
    p2[0] + d[0] * 0.16 * scale,
    p2[1] + 0.06 * scale,
    p2[2] + sSign * 0.24 * scale,
  ];
  const setaTip: [number, number, number] = [
    p2[0] + d[0] * 0.34 * scale,
    p2[1] + 0.02 * scale,
    p2[2] + sSign * 0.48 * scale,
  ];
  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    [p2, setaMid, setaTip],
    [0.018 * scale, 0.01 * scale, 0.002 * scale],
    0.78,
    regionId,
    6
  );

  // 2. Pedicelo largo NO segmentado (ambulacro tubular esbelto característico de Sarcoptes)
  const stalkLen = 0.62 * scale;
  const s1: [number, number, number] = [
    p4[0] + d[0] * stalkLen * 0.35,
    p4[1] + (d[1] + 0.08) * stalkLen * 0.35,
    p4[2] + d[2] * stalkLen * 0.35,
  ];
  const s2: [number, number, number] = [
    p4[0] + d[0] * stalkLen * 0.72,
    p4[1] + (d[1] + 0.12) * stalkLen * 0.72,
    p4[2] + d[2] * stalkLen * 0.72,
  ];
  const s3: [number, number, number] = [
    p4[0] + d[0] * stalkLen,
    p4[1] + (d[1] + 0.14) * stalkLen,
    p4[2] + d[2] * stalkLen,
  ];

  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    [p4, s1, s2, s3],
    [0.024 * scale, 0.019 * scale, 0.017 * scale, 0.022 * scale],
    0.58,
    regionId,
    10
  );

  // 3. Ventosa acampanada terminal (pulvilo / carúncula en copa de succión)
  const cupBrim: [number, number, number] = [
    s3[0] + d[0] * 0.13 * scale,
    s3[1] + 0.02 * scale,
    s3[2] + d[2] * 0.13 * scale,
  ];
  const cupLip: [number, number, number] = [
    s3[0] + d[0] * 0.165 * scale,
    s3[1] + 0.025 * scale,
    s3[2] + d[2] * 0.165 * scale,
  ];
  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    [s3, cupBrim, cupLip],
    [0.024 * scale, 0.082 * scale, 0.095 * scale],
    0.32,
    regionId,
    16
  );
}

/**
 * Construye una pata posterior (Par III o IV en la hembra; Par III en el macho y larva) provista de:
 * - Cono podítico corto ventrolateral con anillos quitinosos
 * - Cerda flageliforme muy larga que se proyecta hacia atrás (sin ventosa)
 */
function appendSarcoptesLegWithLongBristle(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  rootPos: [number, number, number],
  dirVec: [number, number, number],
  bristleLen: number,
  scale: number,
  regionId: number
) {
  const d = vec3Norm(dirVec);
  const sSign = rootPos[2] >= 0 ? 1 : -1;

  // 1. Cono corto y robusto de la pata posterior
  const legLen = 0.48 * scale;
  const p0: [number, number, number] = [...rootPos];
  const p1: [number, number, number] = [
    p0[0] + d[0] * legLen * 0.36,
    p0[1] + d[1] * legLen * 0.36,
    p0[2] + d[2] * legLen * 0.36,
  ];
  const p2: [number, number, number] = [
    p0[0] + d[0] * legLen * 0.72,
    p0[1] + d[1] * legLen * 0.72,
    p0[2] + d[2] * legLen * 0.72,
  ];
  const p3: [number, number, number] = [
    p0[0] + d[0] * legLen,
    p0[1] + d[1] * legLen,
    p0[2] + d[2] * legLen,
  ];

  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    [p0, p1, p2, p3],
    [0.175 * scale, 0.135 * scale, 0.095 * scale, 0.052 * scale],
    0.86,
    regionId,
    12,
    4.0,
    0.15
  );

  // 2. Cerda flageliforme larga y arqueada (seta terminal larga patognomónica)
  const bPts: [number, number, number][] = [];
  const bRadii: number[] = [];
  const nSegs = 14;
  for (let i = 0; i <= nSegs; i++) {
    const t = i / nSegs;
    const bx = p3[0] + (d[0] * 0.55 + 0.82) * bristleLen * scale * Math.pow(t, 0.92);
    const by =
      p3[1] +
      d[1] * 0.35 * bristleLen * scale * t -
      0.16 * scale * Math.sin(t * Math.PI * 0.85);
    const bz =
      p3[2] +
      d[2] * 0.78 * bristleLen * scale * t +
      sSign * 0.22 * scale * Math.sin(t * Math.PI);
    bPts.push([bx, by, bz]);
    bRadii.push(scale * (0.026 * Math.pow(1.0 - t, 0.72) + 0.003));
  }

  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    bPts,
    bRadii,
    0.92,
    regionId,
    8
  );
}

/**
 * Añade todas las estructuras internas, armadura dorsal, gnatosoma, epímeros y patas de un espécimen de Sarcoptes scabiei
 * (antes de emitir la cutícula dorsal translúcida, garantizando visibilidad por transparencia y en el corte histológico)
 */
function appendCompleteMiteInstance(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  variant: "female" | "male" | "larva",
  offsetX = 0.0,
  offsetY = 0.0,
  offsetZ = 0.0,
  scaleFactor = 1.0
) {
  const totalLen =
    (variant === "female" ? 4.8 : variant === "male" ? 3.55 : 2.85) * scaleFactor;
  const xStart = offsetX - totalLen * 0.48;

  // =========================================================================
  // 1. ÓRGANOS INTERNOS 3D (EMITIDOS PRIMERO PARA VERSE A TRAVÉS DE LA CUTÍCULA Y EN EL CORTE HISTOLÓGICO)
  // =========================================================================

  // A) Faringe quitinosa, Esófago, Singanglio nervioso y Mesenterón bilobulado en «H» con ciegos gástricos (rId = 8)
  const gutY = offsetY + 0.14 * scaleFactor;
  // Esófago y faringe anterior + Singanglio central circunfaríngeo
  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    [
      [xStart - 0.15 * scaleFactor, offsetY + 0.02 * scaleFactor, offsetZ],
      [xStart + totalLen * 0.14, gutY - 0.04 * scaleFactor, offsetZ],
      [xStart + totalLen * 0.28, gutY, offsetZ],
    ],
    [0.055 * scaleFactor, 0.08 * scaleFactor, 0.13 * scaleFactor],
    0.55,
    8.0,
    10
  );
  // Masa ganglionar central (singanglio)
  appendSarcoptesEllipsoid(
    positions,
    normals,
    meta1,
    indices,
    xStart + totalLen * 0.22,
    gutY - 0.06 * scaleFactor,
    offsetZ,
    0.22 * scaleFactor,
    0.13 * scaleFactor,
    0.25 * scaleFactor,
    0.0,
    0.0,
    0.35,
    8.0,
    12,
    14
  );

  // Estómago central / ventrículo anterior del mesenterón
  appendSarcoptesEllipsoid(
    positions,
    normals,
    meta1,
    indices,
    xStart + totalLen * 0.34,
    gutY + 0.05 * scaleFactor,
    offsetZ,
    0.38 * scaleFactor,
    0.22 * scaleFactor,
    0.52 * scaleFactor,
    0.0,
    0.0,
    0.72,
    8.0,
    14,
    18
  );

  // Dos grandes ciegos gástricos laterales en «H» (llenos de queratina e histolinfa digerida color ámbar-pardo)
  for (const side of [-1, 1]) {
    const zSide = offsetZ + side * (variant === "female" ? 0.74 : 0.52) * scaleFactor;
    appendSarcoptesTube(
      positions,
      normals,
      meta1,
      indices,
      [
        [xStart + totalLen * 0.22, gutY + 0.02 * scaleFactor, zSide * 0.78 + offsetZ * 0.22],
        [xStart + totalLen * 0.36, gutY + 0.08 * scaleFactor, zSide],
        [xStart + totalLen * 0.56, gutY + 0.09 * scaleFactor, zSide * 1.04 - offsetZ * 0.04],
        [xStart + totalLen * 0.74, gutY + 0.03 * scaleFactor, zSide * 0.85 + offsetZ * 0.15],
      ],
      [
        0.16 * scaleFactor,
        0.25 * scaleFactor,
        0.27 * scaleFactor,
        0.17 * scaleFactor,
      ],
      0.78,
      8.0,
      12,
      4.0,
      0.14
    );
  }

  // Intestino posterior / recto y 3 escíbalos fecales esféricos oscuros en tránsito hacia el ano terminal (rId = 8)
  const scybalaCoords: [number, number, number, number][] = [
    [xStart + totalLen * 0.76, gutY + 0.06 * scaleFactor, offsetZ + 0.08 * scaleFactor, 0.13],
    [xStart + totalLen * 0.83, gutY + 0.04 * scaleFactor, offsetZ - 0.07 * scaleFactor, 0.14],
    [xStart + totalLen * 0.89, gutY + 0.02 * scaleFactor, offsetZ + 0.02 * scaleFactor, 0.12],
  ];
  for (const [sx, sy, sz, sr] of scybalaCoords) {
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      sx,
      sy,
      sz,
      sr * scaleFactor,
      sr * 0.88 * scaleFactor,
      sr * 0.95 * scaleFactor,
      0.2,
      0.1,
      0.95,
      8.0,
      12,
      14
    );
  }

  // B) Sistema reproductor específico según estadio
  if (variant === "female") {
    // ¡HUEVO GIGANTE INTRAUTERINO 3D (150 × 100 µm)! Ocupa gran parte de la cavidad central-posterior de la hembra grávida (rId = 7)
    const eggCX = xStart + totalLen * 0.57;
    const eggCY = offsetY + 0.22 * scaleFactor;
    const eggCZ = offsetZ - 0.04 * scaleFactor;

    // Masa vitelina embrionaria interna dentro del huevo intrauterino
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      eggCX,
      eggCY,
      eggCZ,
      0.66 * scaleFactor,
      0.40 * scaleFactor,
      0.44 * scaleFactor,
      0.08,
      0.04,
      0.88,
      7.0,
      16,
      20
    );

    // Corion perlado externo del huevo gigante intrauterino (150 × 100 µm)
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      eggCX,
      eggCY,
      eggCZ,
      0.84 * scaleFactor,
      0.51 * scaleFactor,
      0.56 * scaleFactor,
      0.08,
      0.04,
      0.38,
      7.0,
      20,
      26
    );

    // Ovocitos en maduración en el ovario / oviducto posterior y tocostoma (oviporo transversal ventral)
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      xStart + totalLen * 0.77,
      offsetY + 0.14 * scaleFactor,
      offsetZ + 0.24 * scaleFactor,
      0.32 * scaleFactor,
      0.22 * scaleFactor,
      0.25 * scaleFactor,
      -0.2,
      0.0,
      0.62,
      7.0,
      14,
      18
    );
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      xStart + totalLen * 0.79,
      offsetY + 0.12 * scaleFactor,
      offsetZ - 0.24 * scaleFactor,
      0.26 * scaleFactor,
      0.19 * scaleFactor,
      0.21 * scaleFactor,
      0.2,
      0.0,
      0.62,
      7.0,
      12,
      16
    );

    // Labios quitinosos del tocostoma (oviporo transversal ventral en el tercio medio, entre coxas II y III)
    appendSarcoptesTube(
      positions,
      normals,
      meta1,
      indices,
      [
        [xStart + totalLen * 0.41, offsetY - 0.39 * scaleFactor, offsetZ - 0.36 * scaleFactor],
        [xStart + totalLen * 0.39, offsetY - 0.41 * scaleFactor, offsetZ],
        [xStart + totalLen * 0.41, offsetY - 0.39 * scaleFactor, offsetZ + 0.36 * scaleFactor],
      ],
      [0.025 * scaleFactor, 0.042 * scaleFactor, 0.025 * scaleFactor],
      0.75,
      7.0,
      10
    );
  } else if (variant === "male") {
    // Aparato copulador masculino fuertemente quitinizado (epiandrio, arco genital en campana y edeago entre coxas IV, rId = 9)
    const genX = xStart + totalLen * 0.72;
    const genY = offsetY - 0.26 * scaleFactor;
    for (const side of [-1, 1]) {
      appendSarcoptesTube(
        positions,
        normals,
        meta1,
        indices,
        [
          [genX - 0.24 * scaleFactor, genY + 0.02 * scaleFactor, offsetZ + side * 0.04 * scaleFactor],
          [genX, genY - 0.03 * scaleFactor, offsetZ + side * 0.22 * scaleFactor],
          [genX + 0.26 * scaleFactor, genY - 0.01 * scaleFactor, offsetZ + side * 0.26 * scaleFactor],
        ],
        [0.042 * scaleFactor, 0.052 * scaleFactor, 0.036 * scaleFactor],
        0.92,
        9.0,
        10
      );
      // Testículos bilaterales internos
      appendSarcoptesEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        xStart + totalLen * 0.58,
        offsetY + 0.08 * scaleFactor,
        offsetZ + side * 0.32 * scaleFactor,
        0.28 * scaleFactor,
        0.18 * scaleFactor,
        0.21 * scaleFactor,
        0.0,
        0.0,
        0.55,
        9.0,
        14,
        18
      );
    }
    // Edeago central cónico
    appendSarcoptesTube(
      positions,
      normals,
      meta1,
      indices,
      [
        [genX - 0.14 * scaleFactor, genY + 0.06 * scaleFactor, offsetZ],
        [genX + 0.08 * scaleFactor, genY - 0.04 * scaleFactor, offsetZ],
        [genX + 0.28 * scaleFactor, genY - 0.06 * scaleFactor, offsetZ],
      ],
      [0.068 * scaleFactor, 0.055 * scaleFactor, 0.018 * scaleFactor],
      0.98,
      9.0,
      12
    );
  }

  // =========================================================================
  // 2. GNATOSOMA ANTERIOR (QUELÍCEROS QUELADOS DENTADOS + PEDIPALPOS DE 3 ARTEJOS, rId = 1)
  // =========================================================================
  const gnathoBaseX = xStart + 0.08 * scaleFactor;
  const gnathoTipX = xStart - 0.58 * scaleFactor;
  const gnathoY = offsetY - 0.04 * scaleFactor;

  // Subcapítulo / Epistoma basal troncocónico
  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    [
      [gnathoBaseX + 0.12 * scaleFactor, gnathoY + 0.02 * scaleFactor, offsetZ],
      [gnathoBaseX - 0.14 * scaleFactor, gnathoY, offsetZ],
      [gnathoTipX + 0.24 * scaleFactor, gnathoY - 0.02 * scaleFactor, offsetZ],
    ],
    [0.32 * scaleFactor, 0.28 * scaleFactor, 0.19 * scaleFactor],
    0.76,
    1.0,
    14
  );

  // Par de quelíceros quelados robustos (mandíbulas dorsomediales con dientes quitinosos oscuros para excavar el estrato córneo)
  for (const side of [-1, 1]) {
    const cz = offsetZ + side * 0.095 * scaleFactor;
    appendSarcoptesTube(
      positions,
      normals,
      meta1,
      indices,
      [
        [gnathoBaseX - 0.04 * scaleFactor, gnathoY + 0.05 * scaleFactor, cz * 1.05 - offsetZ * 0.05],
        [gnathoTipX + 0.18 * scaleFactor, gnathoY + 0.03 * scaleFactor, cz],
        [gnathoTipX - 0.04 * scaleFactor, gnathoY - 0.01 * scaleFactor, offsetZ + side * 0.042 * scaleFactor],
      ],
      [0.115 * scaleFactor, 0.092 * scaleFactor, 0.024 * scaleFactor],
      0.94,
      1.0,
      12
    );

    // Dedo móvil ventral del quelícero (pinza dentada)
    appendSarcoptesTube(
      positions,
      normals,
      meta1,
      indices,
      [
        [gnathoTipX + 0.16 * scaleFactor, gnathoY - 0.03 * scaleFactor, cz],
        [gnathoTipX - 0.02 * scaleFactor, gnathoY - 0.055 * scaleFactor, offsetZ + side * 0.05 * scaleFactor],
      ],
      [0.052 * scaleFactor, 0.014 * scaleFactor],
      0.98,
      1.0,
      8
    );

    // Pedipalpos laterales cortos de 3 artejos flanqueando los quelíceros
    const pz = offsetZ + side * 0.23 * scaleFactor;
    appendSarcoptesTube(
      positions,
      normals,
      meta1,
      indices,
      [
        [gnathoBaseX - 0.02 * scaleFactor, gnathoY - 0.01 * scaleFactor, pz * 1.12 - offsetZ * 0.12],
        [gnathoTipX + 0.22 * scaleFactor, gnathoY - 0.02 * scaleFactor, pz],
        [gnathoTipX + 0.02 * scaleFactor, gnathoY - 0.03 * scaleFactor, offsetZ + side * 0.16 * scaleFactor],
      ],
      [0.095 * scaleFactor, 0.078 * scaleFactor, 0.042 * scaleFactor],
      0.84,
      1.0,
      10,
      3.0,
      0.16
    );
  }

  // =========================================================================
  // 3. ARMADURA DORSAL: ESCAMAS TRIANGULARES + 3 PARES DE ESPINAS ANTERIORES + 7 PARES DE ESPINAS CÓNICAS POSTERODORSALES (rId = 3)
  // =========================================================================
  // A) Campo central de escamas triangulares dorsales dirigidas hacia atrás (dentículos de anclaje)
  const scaleRows = variant === "female" ? 9 : variant === "male" ? 6 : 5;
  for (let r = 0; r < scaleRows; r++) {
    const uRow = 0.27 + (r / (scaleRows - 1)) * 0.42;
    const colsInRow =
      variant === "female"
        ? r % 2 === 0
          ? 9
          : 8
        : r % 2 === 0
        ? 7
        : 6;
    const maxLatPhi = 0.56 * Math.sin(((uRow - 0.20) / 0.58) * Math.PI);

    for (let c = 0; c < colsInRow; c++) {
      const frac = colsInRow <= 1 ? 0.0 : (c / (colsInRow - 1)) * 2.0 - 1.0;
      const phi = Math.PI * 0.5 + frac * maxLatPhi;
      const surf = evaluateSarcoptesIdiosomaSurface(
        uRow,
        phi,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );
      const surfNext = evaluateSarcoptesIdiosomaSurface(
        Math.min(0.99, uRow + 0.01),
        phi,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );
      const surfLat = evaluateSarcoptesIdiosomaSurface(
        uRow,
        phi + 0.02,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );
      const tU = vec3Sub(surfNext.pos, surf.pos);
      const tPhi = vec3Sub(surfLat.pos, surf.pos);
      const sNorm = vec3Norm(vec3Cross(tPhi, tU));

      appendDorsalTriangularScale(
        positions,
        normals,
        meta1,
        indices,
        surf.pos,
        sNorm,
        0.135 * scaleFactor * (1.0 - 0.22 * Math.abs(frac)),
        3.0
      );
    }
  }

  // B) 3 pares de espinas cónicas cortas anterodorsales (propodosomales) + cerdas escapulares largas (sci / sce)
  const anteriorSpines: [number, number, number][] = [
    [0.18, 0.22, 0.22],
    [0.24, 0.36, 0.24],
    [0.31, 0.48, 0.25],
  ];
  for (const [uSp, latAngle, spLen] of anteriorSpines) {
    for (const side of [-1, 1]) {
      const phi = Math.PI * 0.5 + side * latAngle;
      const surf = evaluateSarcoptesIdiosomaSurface(
        uSp,
        phi,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );
      const pBase = surf.pos;
      const pMid: [number, number, number] = [
        pBase[0] + spLen * 0.55 * scaleFactor,
        pBase[1] + spLen * 0.72 * scaleFactor,
        pBase[2] + side * spLen * 0.28 * scaleFactor,
      ];
      const pTip: [number, number, number] = [
        pBase[0] + spLen * 1.15 * scaleFactor,
        pBase[1] + spLen * 1.05 * scaleFactor,
        pBase[2] + side * spLen * 0.45 * scaleFactor,
      ];
      appendSarcoptesTube(
        positions,
        normals,
        meta1,
        indices,
        [pBase, pMid, pTip],
        [0.048 * scaleFactor, 0.032 * scaleFactor, 0.006 * scaleFactor],
        0.92,
        3.0,
        8
      );
    }
  }

  // Par de cerdas escapulares externas largas (sce) en los hombros propodosomales
  for (const side of [-1, 1]) {
    const phi = Math.PI * 0.5 + side * 0.68;
    const surf = evaluateSarcoptesIdiosomaSurface(
      0.25,
      phi,
      variant,
      offsetX,
      offsetY,
      offsetZ,
      scaleFactor
    );
    const p0 = surf.pos;
    appendSarcoptesTube(
      positions,
      normals,
      meta1,
      indices,
      [
        p0,
        [p0[0] + 0.32 * scaleFactor, p0[1] + 0.24 * scaleFactor, p0[2] + side * 0.48 * scaleFactor],
        [p0[0] + 0.78 * scaleFactor, p0[1] + 0.12 * scaleFactor, p0[2] + side * 0.85 * scaleFactor],
      ],
      [0.028 * scaleFactor, 0.016 * scaleFactor, 0.003 * scaleFactor],
      0.86,
      3.0,
      8
    );
  }

  // C) 7 pares de espinas dorsales cónicas robustas (14 clavijas histerosomales en forma de bellota con anillo basal alveolado)
  // Dispuestas en dos hileras longitudinales internas (4 pares) y externas (3 pares) en la mitad posterior del dorso
  const posterodorsalPegs: [number, number, number][] = [
    // Hilera longitudinal interna (4 pares)
    [0.56, 0.18, 0.38],
    [0.65, 0.19, 0.40],
    [0.74, 0.18, 0.42],
    [0.83, 0.16, 0.40],
    // Hilera longitudinal externa (3 pares)
    [0.60, 0.38, 0.38],
    [0.70, 0.39, 0.41],
    [0.80, 0.36, 0.39],
  ];

  for (const [uPeg, latAngle, pegLen] of posterodorsalPegs) {
    for (const side of [-1, 1]) {
      const phi = Math.PI * 0.5 + side * latAngle;
      const surf = evaluateSarcoptesIdiosomaSurface(
        uPeg,
        phi,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );
      const p0 = surf.pos;
      // Anillo basal quitinoso (alvéolo esclerotizado) + espina robusta lanceolada/bellota apuntando hacia atrás
      const pRing: [number, number, number] = [
        p0[0] + 0.04 * scaleFactor,
        p0[1] + 0.05 * scaleFactor,
        p0[2] + side * 0.02 * scaleFactor,
      ];
      const pBody: [number, number, number] = [
        p0[0] + pegLen * 0.52 * scaleFactor,
        p0[1] + pegLen * 0.58 * scaleFactor,
        p0[2] + side * pegLen * 0.22 * scaleFactor,
      ];
      const pTip: [number, number, number] = [
        p0[0] + pegLen * 1.15 * scaleFactor,
        p0[1] + pegLen * 0.78 * scaleFactor,
        p0[2] + side * pegLen * 0.36 * scaleFactor,
      ];
      appendSarcoptesTube(
        positions,
        normals,
        meta1,
        indices,
        [p0, pRing, pBody, pTip],
        [
          0.072 * scaleFactor,
          0.052 * scaleFactor,
          0.056 * scaleFactor,
          0.008 * scaleFactor,
        ],
        0.95,
        3.0,
        10
      );
    }
  }

  // D) 2 pares de cerdas caudales terminales largas flanqueando la hendidura anal posterior
  for (const side of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      const phi = Math.PI * (0.12 + k * 0.10);
      const surf = evaluateSarcoptesIdiosomaSurface(
        0.94 - k * 0.03,
        side > 0 ? phi : Math.PI - phi,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );
      const p0 = surf.pos;
      const sL = (1.15 - k * 0.25) * scaleFactor;
      appendSarcoptesTube(
        positions,
        normals,
        meta1,
        indices,
        [
          p0,
          [p0[0] + sL * 0.48, p0[1] - 0.05 * scaleFactor, p0[2] + side * sL * 0.24],
          [p0[0] + sL * 0.98, p0[1] - 0.14 * scaleFactor, p0[2] + side * sL * 0.46],
        ],
        [0.024 * scaleFactor, 0.014 * scaleFactor, 0.002 * scaleFactor],
        0.88,
        3.0,
        8
      );
    }
  }

  // =========================================================================
  // 4. EPÍMEROS QUITINOSOS VENTRALES (APODEMAS I FUSIONADOS EN «Y» Y EPÍMEROS II–IV, rId = 4)
  // =========================================================================
  const vY = offsetY - (variant === "female" ? 0.39 : variant === "male" ? 0.30 : 0.25) * scaleFactor;

  // Epímeros I: convergen desde las coxas I hacia la línea media y se fusionan formando el ESTERNÓN EN «Y» patognomónico
  const sternumJoinX = xStart + totalLen * 0.18;
  const sternumEndX = xStart + totalLen * 0.33;
  for (const side of [-1, 1]) {
    appendSarcoptesTube(
      positions,
      normals,
      meta1,
      indices,
      [
        [xStart + totalLen * 0.08, vY + 0.08 * scaleFactor, offsetZ + side * 0.62 * scaleFactor],
        [xStart + totalLen * 0.13, vY + 0.02 * scaleFactor, offsetZ + side * 0.28 * scaleFactor],
        [sternumJoinX, vY - 0.01 * scaleFactor, offsetZ],
      ],
      [0.058 * scaleFactor, 0.048 * scaleFactor, 0.052 * scaleFactor],
      0.95,
      4.0,
      10
    );
  }
  // Tallo impar mediano del esternón en «Y»
  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    [
      [sternumJoinX, vY - 0.01 * scaleFactor, offsetZ],
      [sternumEndX, vY - 0.015 * scaleFactor, offsetZ],
    ],
    [0.056 * scaleFactor, 0.038 * scaleFactor],
    0.96,
    4.0,
    10
  );

  // Epímeros II: oblicuos desde las coxas II con extremos libres curvados hacia adentro
  for (const side of [-1, 1]) {
    appendSarcoptesTube(
      positions,
      normals,
      meta1,
      indices,
      [
        [xStart + totalLen * 0.23, vY + 0.09 * scaleFactor, offsetZ + side * 0.92 * scaleFactor],
        [xStart + totalLen * 0.29, vY + 0.01 * scaleFactor, offsetZ + side * 0.56 * scaleFactor],
        [xStart + totalLen * 0.37, vY - 0.01 * scaleFactor, offsetZ + side * 0.32 * scaleFactor],
      ],
      [0.054 * scaleFactor, 0.044 * scaleFactor, 0.032 * scaleFactor],
      0.92,
      4.0,
      10
    );
  }

  // Epímeros III y IV (en la larva solo existen los epímeros III)
  for (const side of [-1, 1]) {
    // Epímero III
    appendSarcoptesTube(
      positions,
      normals,
      meta1,
      indices,
      [
        [xStart + totalLen * 0.55, vY + 0.03 * scaleFactor, offsetZ + side * 0.54 * scaleFactor],
        [xStart + totalLen * 0.62, vY + 0.05 * scaleFactor, offsetZ + side * 0.86 * scaleFactor],
      ],
      [0.038 * scaleFactor, 0.052 * scaleFactor],
      0.92,
      4.0,
      10
    );

    if (variant !== "larva") {
      // Epímero IV (en el macho se une medialmente con el arco genital)
      appendSarcoptesTube(
        positions,
        normals,
        meta1,
        indices,
        [
          [
            xStart + totalLen * 0.68,
            vY + 0.02 * scaleFactor,
            offsetZ + side * (variant === "male" ? 0.28 : 0.44) * scaleFactor,
          ],
          [xStart + totalLen * 0.75, vY + 0.05 * scaleFactor, offsetZ + side * 0.72 * scaleFactor],
        ],
        [0.038 * scaleFactor, 0.05 * scaleFactor],
        0.92,
        4.0,
        10
      );
    }
  }

  // =========================================================================
  // 5. PARES DE PATAS ANTERIORES I Y II CON AMBULACROS LARGOS Y VENTOSAS ACAMPANADAS (rId = 5)
  // =========================================================================
  for (const side of [-1, 1]) {
    // Pata I (anterolateral junto al gnatosoma)
    const rootLeg1: [number, number, number] = [
      xStart + totalLen * 0.11,
      vY + 0.12 * scaleFactor,
      offsetZ + side * (variant === "female" ? 0.78 : variant === "male" ? 0.58 : 0.48) * scaleFactor,
    ];
    appendSarcoptesLegWithSucker(
      positions,
      normals,
      meta1,
      indices,
      rootLeg1,
      [-0.78, -0.14, side * 0.62],
      1.05 * scaleFactor,
      5.0
    );

    // Pata II (anterolateral detrás de la pata I)
    const rootLeg2: [number, number, number] = [
      xStart + totalLen * 0.26,
      vY + 0.14 * scaleFactor,
      offsetZ + side * (variant === "female" ? 1.18 : variant === "male" ? 0.86 : 0.70) * scaleFactor,
    ];
    appendSarcoptesLegWithSucker(
      positions,
      normals,
      meta1,
      indices,
      rootLeg2,
      [-0.48, -0.16, side * 0.86],
      1.02 * scaleFactor,
      5.0
    );
  }

  // =========================================================================
  // 6. PARES DE PATAS POSTERIORES III Y IV (rId = 6)
  // - Hembra: Pares III y IV terminan en CERDAS LARGAS FLAGELIFORMES (sin ventosas)
  // - Macho: Par III termina en CERDA LARGA, pero el Par IV termina en VENTOSA PEDICULADA (criterio diagnóstico diferencial)
  // - Larva hexápoda: Solo posee Par III con CERDA LARGA; carece por completo del Par IV (6 patas en total)
  // =========================================================================
  for (const side of [-1, 1]) {
    // Pata III (presente en hembra, macho y larva hexápoda -> siempre termina en cerda larga)
    const rootLeg3: [number, number, number] = [
      xStart + totalLen * 0.62,
      vY + 0.08 * scaleFactor,
      offsetZ + side * (variant === "female" ? 0.98 : variant === "male" ? 0.74 : 0.62) * scaleFactor,
    ];
    appendSarcoptesLegWithLongBristle(
      positions,
      normals,
      meta1,
      indices,
      rootLeg3,
      [0.42, -0.22, side * 0.88],
      variant === "female" ? 2.15 : 1.75,
      scaleFactor,
      6.0
    );

    // Pata IV (ausente en la larva hexápoda)
    if (variant === "female") {
      const rootLeg4F: [number, number, number] = [
        xStart + totalLen * 0.76,
        vY + 0.07 * scaleFactor,
        offsetZ + side * 0.76 * scaleFactor,
      ];
      appendSarcoptesLegWithLongBristle(
        positions,
        normals,
        meta1,
        indices,
        rootLeg4F,
        [0.68, -0.20, side * 0.72],
        2.35,
        0.95 * scaleFactor,
        6.0
      );
    } else if (variant === "male") {
      // ¡En el macho el 4.º par de patas posee ambulacro pediculado con ventosa acampanada!
      const rootLeg4M: [number, number, number] = [
        xStart + totalLen * 0.76,
        vY + 0.06 * scaleFactor,
        offsetZ + side * 0.56 * scaleFactor,
      ];
      appendSarcoptesLegWithSucker(
        positions,
        normals,
        meta1,
        indices,
        rootLeg4M,
        [0.65, -0.18, side * 0.74],
        0.84 * scaleFactor,
        6.0
      );
    }
  }

  // =========================================================================
  // 7. CAPARAZÓN DEL IDIOSOMA (VIENTRE PRIMERO Y CUTÍCULA DORSAL TRANSLÚCIDA AL FINAL, rId = 2)
  // =========================================================================
  const uSegs = 96;
  const phiSegs = 64;
  const epsU = 0.003;
  const epsPhi = 0.015;

  const shellBaseVertex = positions.length / 3;
  for (let i = 0; i <= uSegs; i++) {
    const u = i / uSegs;
    for (let j = 0; j <= phiSegs; j++) {
      const phi = (j / phiSegs) * Math.PI * 2.0;
      const evalC = evaluateSarcoptesIdiosomaSurface(
        u,
        phi,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );

      const uNext = Math.min(1.0, u + epsU);
      const uPrev = Math.max(0.0, u - epsU);
      const evalU1 = evaluateSarcoptesIdiosomaSurface(
        uNext,
        phi,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );
      const evalU0 = evaluateSarcoptesIdiosomaSurface(
        uPrev,
        phi,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );

      const evalP1 = evaluateSarcoptesIdiosomaSurface(
        u,
        phi + epsPhi,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );
      const evalP0 = evaluateSarcoptesIdiosomaSurface(
        u,
        phi - epsPhi,
        variant,
        offsetX,
        offsetY,
        offsetZ,
        scaleFactor
      );

      const tangU = vec3Sub(evalU1.pos, evalU0.pos);
      const tangPhi = vec3Sub(evalP1.pos, evalP0.pos);
      const norm = vec3Norm(vec3Cross(tangPhi, tangU));

      positions.push(evalC.pos[0], evalC.pos[1], evalC.pos[2]);
      normals.push(norm[0], norm[1], norm[2]);
      meta1.push(evalC.segU, evalC.segV, evalC.scleriteMask, evalC.regionId);
    }
  }

  const stride = phiSegs + 1;
  // Paso A: Triángulos ventrales (sin(phi) <= 0)
  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < phiSegs; j++) {
      const phiMid = ((j + 0.5) / phiSegs) * Math.PI * 2.0;
      if (Math.sin(phiMid) <= 0.0) {
        const a = shellBaseVertex + i * stride + j;
        const b = a + stride;
        const c = a + 1;
        const d = b + 1;
        indices.push(a, b, c, c, b, d);
      }
    }
  }
  // Paso B: Triángulos dorsales translúcidos (sin(phi) > 0) emitidos al final del ácaro
  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < phiSegs; j++) {
      const phiMid = ((j + 0.5) / phiSegs) * Math.PI * 2.0;
      if (Math.sin(phiMid) > 0.0) {
        const a = shellBaseVertex + i * stride + j;
        const b = a + stride;
        const c = a + 1;
        const d = b + 1;
        indices.push(a, b, c, c, b, d);
      }
    }
  }
}

/**
 * Construye un embrión hexápodo 3D acurrucado dentro del corion ovular (para los huevos embrionados)
 */
function appendCurledEmbryo3D(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  cx: number,
  cy: number,
  cz: number,
  scale: number,
  regionId: number
) {
  // Cuerpo embrionario segmentado acurrucado en C
  appendSarcoptesTube(
    positions,
    normals,
    meta1,
    indices,
    [
      [cx - 0.52 * scale, cy - 0.06 * scale, cz],
      [cx - 0.18 * scale, cy + 0.14 * scale, cz],
      [cx + 0.24 * scale, cy + 0.12 * scale, cz],
      [cx + 0.52 * scale, cy - 0.08 * scale, cz],
    ],
    [0.24 * scale, 0.38 * scale, 0.42 * scale, 0.28 * scale],
    0.72,
    regionId,
    14,
    6.0,
    0.08
  );

  // Esbozo de gnatosoma embrionario anterior
  appendSarcoptesEllipsoid(
    positions,
    normals,
    meta1,
    indices,
    cx - 0.62 * scale,
    cy - 0.10 * scale,
    cz,
    0.18 * scale,
    0.14 * scale,
    0.16 * scale,
    0.0,
    0.2,
    0.92,
    regionId,
    10,
    12
  );

  // 3 pares de esbozos de patas embrionarias plegadas ventralmente hacia la línea media
  const legX = [-0.36, -0.06, 0.24];
  for (let i = 0; i < 3; i++) {
    for (const side of [-1, 1]) {
      const lx = cx + legX[i] * scale;
      appendSarcoptesTube(
        positions,
        normals,
        meta1,
        indices,
        [
          [lx, cy - 0.04 * scale, cz + side * 0.34 * scale],
          [lx - 0.10 * scale, cy - 0.26 * scale, cz + side * 0.22 * scale],
          [lx - 0.22 * scale, cy - 0.32 * scale, cz + side * 0.06 * scale],
        ],
        [0.095 * scale, 0.072 * scale, 0.038 * scale],
        0.88,
        regionId,
        8,
        3.0,
        0.12
      );
    }
  }
}

/**
 * Construye la geometría completa según el estadio evolutivo seleccionado:
 * - "female_adult": Hembra adulta grávida (300–450 µm) con huevo gigante intrauterino 3D, escamas triangulares, 14 espinas, epímeros I en Y
 * - "epidermal_burrow": Surco acarino en estrato córneo con hembra en el extremo ciego («signo del ala delta»), fila de 4 huevos y escíbalos fecales
 * - "male_adult": Macho adulto (200–240 µm) con ventosas en patas I, II y IV, cerda larga en pata III y edeago ventral
 * - "hexapod_larva": Larva hexápoda (6 patas) emergiendo junto a un huevo embrionado de 150 × 100 µm con embrión 3D interno
 */
function buildSarcoptesCompleteGeometry(
  stage: SarcoptesStageId
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const meta1: number[] = [];
  const indices: number[] = [];

  if (stage === "female_adult") {
    appendCompleteMiteInstance(
      positions,
      normals,
      meta1,
      indices,
      "female",
      0.0,
      0.0,
      0.0,
      1.0
    );
  } else if (stage === "male_adult") {
    appendCompleteMiteInstance(
      positions,
      normals,
      meta1,
      indices,
      "male",
      0.0,
      0.0,
      0.0,
      1.18
    );
  } else if (stage === "hexapod_larva") {
    // 1. Primero emitimos el embrión hexápodo 3D acurrucado dentro del huevo vecino (rId = 9) para que sea visible por translucidez y en el corte histológico
    const eggX = 1.65;
    const eggY = 0.04;
    const eggZ = 0.15;
    appendCurledEmbryo3D(
      positions,
      normals,
      meta1,
      indices,
      eggX,
      eggY,
      eggZ,
      1.12,
      9.0
    );

    // 2. Larva hexápoda libre de 6 patas (3 pares de patas: I-II con ventosas, III con cerda larga, sin par IV)
    appendCompleteMiteInstance(
      positions,
      normals,
      meta1,
      indices,
      "larva",
      -1.45,
      0.0,
      -0.12,
      1.05
    );

    // 3. Corion ovalado hialino translúcido del huevo embrionado (150 × 100 µm, rId = 7) emitido al final para envolver al embrión 3D
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      eggX,
      eggY,
      eggZ,
      1.26,
      0.82,
      0.86,
      -0.18,
      0.08,
      0.28,
      7.0,
      24,
      32
    );
  } else if (stage === "epidermal_burrow") {
    // =========================================================================
    // SURCO ACARINO INTRAEPIDÉRMICO EN ESTRATO CÓRNEO («RASPADO CUTÁNEO / DERMATOSCOPÍA»)
    // Muestra la tríada diagnóstica completa del Acarotest:
    // 1) Hembra grávida excavando el extremo ciego anterior («signo del ala delta»)
    // 2) Hilera de 4 huevos ovalados grandes (150 × 100 µm) en maduración progresiva + embrión 3D interno
    // 3) Cúmulos de escíbalos (bolas fecales oscuras) a lo largo de la galería
    // 4) Lecho y techo laminar de corneocitos del estrato córneo
    // =========================================================================

    // A) Contenidos internos de los huevos en el túnel (mórula, blastodermo y embrión hexápodo 3D, rId = 9)
    // Huevo 1 (recién ovipuesto cerca de la hembra: mórula de blastómeros)
    const egg1Pos: [number, number, number] = [-0.55, -0.14, 0.22];
    const blastomeres: [number, number, number, number][] = [
      [-0.22, 0.04, 0.06, 0.22],
      [0.05, 0.08, -0.08, 0.24],
      [0.24, -0.04, 0.05, 0.21],
      [-0.06, -0.09, 0.10, 0.20],
    ];
    for (const [bx, by, bz, br] of blastomeres) {
      appendSarcoptesEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        egg1Pos[0] + bx,
        egg1Pos[1] + by,
        egg1Pos[2] + bz,
        br,
        br * 0.85,
        br * 0.9,
        0.0,
        0.0,
        0.78,
        9.0,
        10,
        12
      );
    }

    // Huevo 2 (estadio blastodérmico intermedio)
    const egg2Pos: [number, number, number] = [1.05, -0.14, -0.24];
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      egg2Pos[0],
      egg2Pos[1],
      egg2Pos[2],
      0.56,
      0.34,
      0.38,
      0.18,
      0.04,
      0.82,
      9.0,
      14,
      18
    );

    // Huevo 3 (huevo embrionado maduro con larva hexápoda 3D formada en su interior, rId = 9)
    const egg3Pos: [number, number, number] = [2.65, -0.12, 0.18];
    appendCurledEmbryo3D(
      positions,
      normals,
      meta1,
      indices,
      egg3Pos[0],
      egg3Pos[1],
      egg3Pos[2],
      0.72,
      9.0
    );

    // B) Cúmulos de escíbalos fecales (bolas fecales oscuras pardo-amarillentas, rId = 8) repartidos a lo largo de la galería
    const burrowScybala: [number, number, number, number][] = [
      [-1.35, -0.36, -0.35, 0.13],
      [-1.18, -0.38, -0.22, 0.11],
      [-1.05, -0.35, -0.40, 0.12],
      [0.18, -0.36, -0.28, 0.14],
      [0.32, -0.38, -0.14, 0.12],
      [0.44, -0.34, -0.32, 0.11],
      [0.25, -0.37, 0.34, 0.12],
      [1.82, -0.36, 0.28, 0.14],
      [1.98, -0.38, 0.15, 0.12],
      [2.10, -0.35, 0.35, 0.13],
      [1.75, -0.37, -0.32, 0.11],
      [3.38, -0.36, -0.22, 0.13],
      [3.55, -0.38, -0.08, 0.12],
      [3.68, -0.35, -0.28, 0.11],
    ];
    for (const [sx, sy, sz, sr] of burrowScybala) {
      appendSarcoptesEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        sx,
        sy,
        sz,
        sr,
        sr * 0.85,
        sr * 0.92,
        sx * 1.7,
        sz * 1.3,
        0.96,
        8.0,
        10,
        12
      );
    }

    // C) Suelo queratinizado del surco acarino (lecho laminar de corneocitos del estrato córneo, rId = 10)
    const uTunSegs = 80;
    const vTunSegs = 36;
    const floorBase = positions.length / 3;
    for (let i = 0; i <= uTunSegs; i++) {
      const u = i / uTunSegs;
      const x = -5.4 + u * 10.8;
      // Trayectoria serpiginosa suave del túnel epidérmico
      const zCenter = 0.18 * Math.sin(u * Math.PI * 2.2);
      for (let j = 0; j <= vTunSegs; j++) {
        const v = j / vTunSegs;
        const lat = (v - 0.5) * 2.0; // -1..+1
        const z = zCenter + lat * 2.15;
        // Canal cóncavo excavado en la mitad central (|lat| < 0.68)
        const inChannel = Math.exp(-Math.pow(lat / 0.56, 2.0));
        const kerFlake =
          0.025 * Math.sin(u * 38.0 + lat * 12.0) +
          0.018 * Math.cos(u * 19.0 - lat * 18.0);
        const y = -0.22 - 0.36 * inChannel + kerFlake;

        const dydz = (0.36 * 2.0 * lat / (0.56 * 0.56)) * inChannel * 0.46;
        const nVec = vec3Norm([0.0, 1.0, -dydz]);

        positions.push(x, y, z);
        normals.push(nVec[0], nVec[1], nVec[2]);
        meta1.push(u, v, 0.65 * (1.0 - 0.5 * inChannel), 10.0);
      }
    }
    const floorStride = vTunSegs + 1;
    for (let i = 0; i < uTunSegs; i++) {
      for (let j = 0; j < vTunSegs; j++) {
        const a = floorBase + i * floorStride + j;
        const b = a + floorStride;
        const c = a + 1;
        const d = b + 1;
        indices.push(a, c, b, c, d, b);
      }
    }

    // D) Hembra adulta grávida en el extremo ciego anterior del túnel («signo del ala delta», x ~ -2.85)
    appendCompleteMiteInstance(
      positions,
      normals,
      meta1,
      indices,
      "female",
      -2.85,
      -0.06,
      0.04,
      0.72
    );

    // E) Corion hialino translúcido de los 4 huevos ovalados en la galería (rId = 7)
    // Huevo 1 (mórula)
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      egg1Pos[0],
      egg1Pos[1],
      egg1Pos[2],
      0.78,
      0.50,
      0.53,
      -0.16,
      0.05,
      0.32,
      7.0,
      18,
      24
    );
    // Huevo 2 (blastodermo)
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      egg2Pos[0],
      egg2Pos[1],
      egg2Pos[2],
      0.79,
      0.51,
      0.54,
      0.20,
      -0.04,
      0.34,
      7.0,
      18,
      24
    );
    // Huevo 3 (embrionado maduro con larva 3D interna)
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      egg3Pos[0],
      egg3Pos[1],
      egg3Pos[2],
      0.82,
      0.53,
      0.56,
      -0.14,
      0.06,
      0.28,
      7.0,
      20,
      26
    );
    // Huevo 4 (corion hialino vacío recién eclosionado con hendidura longitudinal en el extremo antiguo del surco)
    appendSarcoptesEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      4.15,
      -0.16,
      -0.12,
      0.76,
      0.46,
      0.48,
      0.28,
      0.10,
      0.44,
      7.0,
      16,
      20,
      true
    );

    // F) Techo laminar translúcido de estrato córneo que cubre el surco acarino (rId = 10, emitido al final para transparencia y corte histológico)
    const roofBase = positions.length / 3;
    for (let i = 0; i <= uTunSegs; i++) {
      const u = i / uTunSegs;
      const x = -5.0 + u * 9.8;
      const zCenter = 0.18 * Math.sin(u * Math.PI * 2.2);
      // El techo se eleva sobre la hembra en el extremo ciego (vesícula perlada / pápula acarina) y forma la galería serpiginosa
      const miteDome = 1.0 + 0.34 * Math.exp(-Math.pow((u - 0.22) / 0.14, 2.0));
      const endTaper = Math.sin(clampJS(u, 0.01, 0.99) * Math.PI * 0.96);

      for (let j = 0; j <= 28; j++) {
        const v = j / 28;
        const archAng = v * Math.PI; // 0..PI de borde a borde del techo del túnel
        const cA = Math.cos(archAng);
        const sA = Math.sin(archAng);

        const z = zCenter + cA * 1.42 * (0.82 + 0.18 * miteDome);
        const flake = 0.022 * Math.sin(u * 44.0 + v * 16.0);
        const y = -0.18 + sA * 0.96 * miteDome * Math.pow(endTaper, 0.35) + flake;

        const nVec = vec3Norm([0.0, Math.max(0.25, sA), cA * 0.65]);
        positions.push(x, y, z);
        normals.push(nVec[0], nVec[1], nVec[2]);
        meta1.push(u, v, 0.22, 10.0);
      }
    }
    const roofStride = 29;
    for (let i = 0; i < uTunSegs; i++) {
      for (let j = 0; j < 28; j++) {
        const a = roofBase + i * roofStride + j;
        const b = a + roofStride;
        const c = a + 1;
        const d = b + 1;
        indices.push(a, b, c, c, b, d);
      }
    }
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
 * ============================================================================
 * SHADERS GLSL HIPERREALISTAS PARA SARCOPTES SCABIEI VAR. HOMINIS
 * (Con perturbación analítica de normales en espacio tangente, SSS cuticular,
 *  modo KOH/Aceite mineral de campo claro #faf7f2, SEM y Rayos X)
 * ============================================================================
 */
const SARCOPTES_VERTEX_SHADER = `
  attribute vec4 aMeta1;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  varying vec3 vNormal;
  varying vec2 vSegUV;
  varying float vScleriteMask;
  varying float vRegionId;

  uniform float uTime;
  uniform float uMovement;
  uniform float uStageType; // 0 = female, 1 = burrow, 2 = male, 3 = larva

  void main() {
    vec3 pos = position;
    vec3 norm = normal;
    float rId = aMeta1.w;

    if (uMovement > 0.01) {
      // Movimiento lento de excavación del gnatosoma (quelíceros) y ondulación de las patas y cerdas
      if (rId > 0.5 && rId < 1.5) {
        // Gnatosoma masticando / excavando queratina
        float chew = sin(uTime * 3.8 + pos.z * 6.0) * 0.028 * uMovement;
        pos.x += chew;
        pos.y += cos(uTime * 3.8) * 0.014 * uMovement;
      } else if (rId > 4.5 && rId < 6.5) {
        // Patas anteriores con ventosas y posteriores con cerdas largas
        float sidePhase = pos.z >= 0.0 ? 0.0 : 3.14159;
        float legWave = sin(uTime * 2.8 + pos.x * 1.9 + sidePhase) * 0.036 * uMovement;
        pos.y += legWave * aMeta1.x;
        pos.x += cos(uTime * 2.8 + pos.z * 2.2 + sidePhase) * 0.025 * uMovement * aMeta1.x;
      } else if (rId > 1.5 && rId < 3.5) {
        // Pulsación peristáltica sutil del idiosoma
        pos.y += sin(uTime * 1.9 + pos.x * 1.4) * 0.012 * uMovement;
      }
    }

    vLocalPos = pos;
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPosition.xyz;
    vNormal = normalize(normalMatrix * norm);
    vSegUV = aMeta1.xy;
    vScleriteMask = aMeta1.z;
    vRegionId = aMeta1.w;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const SARCOPTES_FRAGMENT_SHADER = `
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  varying vec3 vNormal;
  varying vec2 vSegUV;
  varying float vScleriteMask;
  varying float vRegionId;

  uniform float uTranslucency;
  uniform float uCutPercent;
  uniform int uShaderMode;
  uniform int uSelectedRegion;

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
      p = p * 2.07 + vec3(7.1, 13.7, 5.3);
      a *= 0.5;
    }
    return v;
  }

  // Perturbación analítica de normales (100% compatible con WebGL2 sin #extension):
  // Recrea los micro-surcos transversales continuos («huellas dactilares») de Sarcoptes,
  // la textura quitinosa de los epímeros/gnatosoma y las lamelas queratinizadas del estrato córneo
  vec3 perturbSarcoptesNormalAnalytical(vec3 N, vec3 pos, float rId, vec2 uv) {
    vec3 up = abs(N.y) < 0.92 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 T = normalize(cross(up, N));
    vec3 B = normalize(cross(N, T));

    float dU = 0.0;
    float dV = 0.0;

    if (rId > 1.5 && rId < 2.5) {
      // Idiosoma: finas estriaciones cuticulares transversales paralelas («huellas dactilares»)
      float striaeArg = uv.x * 360.0 + 1.8 * sin(uv.y * 6.28318);
      dU = cos(striaeArg) * 0.24 + cos(pos.x * 28.0) * 0.06;
      dV = sin(uv.y * 95.0 + pos.x * 16.0) * 0.08;
    } else if (rId > 9.5) {
      // Estrato córneo: escamas laminares de queratina
      dU = cos(pos.x * 22.0 + pos.z * 14.0) * 0.22;
      dV = sin(pos.z * 26.0 - pos.x * 12.0) * 0.22;
    } else if (rId > 6.5 && rId < 7.5) {
      // Corion ovular perlado finamente granulado
      dU = cos(uv.x * 80.0 + uv.y * 40.0) * 0.07;
      dV = sin(uv.y * 80.0 - uv.x * 40.0) * 0.07;
    } else {
      // Quitina esclerotizada de gnatosoma, espinas, epímeros y patas
      dU = cos(uv.x * 55.0 + pos.x * 24.0) * 0.14;
      dV = sin(uv.y * 45.0 + pos.z * 24.0) * 0.14;
    }

    return normalize(N - (T * dU + B * dV));
  }

  void main() {
    float rId = floor(vRegionId + 0.5);

    // --- CORTE HISTOLÓGICO / SECCIÓN 3D ---
    // Al deslizar uCutPercent > 0, abrimos progresivamente el techo del surco acarino (rId == 10 dorsal),
    // la bóveda dorsal de la cutícula del idiosoma (rId == 2 con vLocalPos.y > -0.02) y la mitad superior del corion de los huevos (rId == 7),
    // dejando completamente expuestos el huevo gigante intrauterino, el mesenterón en H, los escíbalos y el embrión hexápodo 3D.
    if (uCutPercent > 0.01) {
      float cutPlaneY = mix(1.55, -0.10, uCutPercent);
      float cutPlaneZ = mix(2.20, -0.45, uCutPercent);

      bool isDorsalIdiosoma = (rId == 2.0) && (vLocalPos.y > -0.02);
      bool isDorsalSpines = (rId == 3.0) && (vLocalPos.y > 0.12);
      bool isBurrowRoof = (rId == 10.0) && (vLocalPos.y > -0.19);
      bool isEggChorionTop = (rId == 7.0) && (vScleriteMask < 0.45) && (vLocalPos.y > 0.02);

      if (isBurrowRoof && (vLocalPos.y > cutPlaneY - 0.15 || vLocalPos.z > cutPlaneZ)) {
        discard;
      }
      if ((isDorsalIdiosoma || isDorsalSpines) && (vLocalPos.y > cutPlaneY || vLocalPos.z > cutPlaneZ)) {
        discard;
      }
      if (isEggChorionTop && (vLocalPos.y > cutPlaneY - 0.08 || vLocalPos.z > cutPlaneZ)) {
        discard;
      }
    }

    vec3 geomN = normalize(gl_FrontFacing ? vNormal : -vNormal);
    vec3 N = perturbSarcoptesNormalAnalytical(geomN, vLocalPos, rId, vSegUV);
    vec3 V = normalize(cameraPosition - vWorldPos);

    // Iluminación de estudio entomológico / dermatoscópico de 3 puntos
    vec3 L1 = normalize(vec3(0.48, 0.82, 0.52));
    vec3 L2 = normalize(vec3(-0.62, -0.35, 0.58));
    vec3 L3 = normalize(vec3(0.10, 0.95, -0.35));

    float diff1 = max(dot(N, L1), 0.0);
    float diff2 = max(dot(N, L2), 0.0) * 0.38;
    float backLight = max(dot(-N, L1), 0.0);
    float sss = pow( clamp(dot(V, -L1 + N * 0.45), 0.0, 1.0), 2.4 );
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.8);

    vec3 H1 = normalize(L1 + V);
    vec3 H3 = normalize(L3 + V);

    float microNoise = fbm3(vLocalPos * 6.5);
    float fineNoise = fbm3(vLocalPos * 20.0);

    // Patrón de estriaciones transversales finas («huellas dactilares») sobre el idiosoma
    float striaePattern = 0.5 + 0.5 * sin(vSegUV.x * 360.0 + 1.8 * sin(vSegUV.y * 6.28318));

    vec3 baseCol = vec3(0.92, 0.86, 0.75);
    float rough = 0.34;
    float alpha = 0.96;

    if (rId == 1.0) {
      // 1. Gnatosoma (quelíceros dentados y pedipalpos): quitina densa ámbar-caoba oscura («triángulo del ala delta»)
      vec3 baseChitin = vec3(0.46, 0.25, 0.11);
      vec3 darkJaw = vec3(0.19, 0.09, 0.04);
      baseCol = mix(baseChitin, darkJaw, smoothstep(0.65, 0.98, vScleriteMask));
      baseCol *= 0.90 + 0.16 * microNoise;
      rough = 0.20;
      alpha = 0.99;
    } else if (rId == 2.0) {
      // 2. Idiosoma en forma de tortuga: cutícula perlada crema-marfil translúcida con estriaciones transversales
      vec3 pearlCuticle = vec3(0.95, 0.90, 0.80);
      vec3 grooveShade = vec3(0.81, 0.72, 0.58);
      vec3 shieldAmber = vec3(0.72, 0.52, 0.30);

      baseCol = mix(grooveShade, pearlCuticle, smoothstep(0.18, 0.82, striaePattern));
      baseCol = mix(baseCol, shieldAmber, vScleriteMask * 0.65);
      baseCol *= 0.94 + 0.09 * microNoise;

      // Sombra proyectada cálida de órganos internos a través de la cutícula translúcida
      float internalGlow = exp(-pow(vLocalPos.z / 0.85, 2.0)) * smoothstep(0.18, 0.85, vSegUV.x);
      baseCol = mix(baseCol, vec3(0.85, 0.68, 0.45), internalGlow * 0.28 * uTranslucency);

      rough = 0.30;
      // Cutícula dorsal translúcida para dejar ver el huevo gigante intrauterino y el mesenterón
      bool isDorsal = vLocalPos.y > -0.02;
      alpha = isDorsal
        ? clamp(0.84 - uTranslucency * 0.52 + fresnel * 0.24 + vScleriteMask * 0.18, 0.24, 0.95)
        : 0.94;
    } else if (rId == 3.0) {
      // 3. Escamas triangulares dorsales y 14 espinas cónicas posterodorsales: quitina ámbar dorada refringente
      vec3 scaleGold = vec3(0.78, 0.56, 0.28);
      vec3 spineTip = vec3(0.48, 0.28, 0.11);
      baseCol = mix(scaleGold, spineTip, smoothstep(0.55, 0.96, vScleriteMask));
      baseCol *= 0.92 + 0.12 * fineNoise;
      rough = 0.22;
      alpha = 0.98;
    } else if (rId == 4.0) {
      // 4. Epímeros quitinosos ventrales (Esternón en «Y» y apodemas coxales II-IV): caoba rojizo oscuro muy esclerotizado
      baseCol = mix(vec3(0.45, 0.22, 0.09), vec3(0.24, 0.10, 0.04), smoothstep(0.4, 0.98, vScleriteMask));
      rough = 0.18;
      alpha = 0.99;
    } else if (rId == 5.0 || rId == 6.0) {
      // 5 y 6. Patas anteriores (con ventosas acampanadas) y posteriores (con cerdas largas o ventosa en macho IV)
      if (vScleriteMask < 0.42) {
        // Copa de la ventosa acampanada (pulvilo hialino perlado)
        baseCol = vec3(0.92, 0.94, 0.96);
        rough = 0.14;
        alpha = 0.76;
      } else if (vScleriteMask < 0.68) {
        // Pedicelo / ambulacro largo no segmentado
        baseCol = vec3(0.74, 0.55, 0.32);
        rough = 0.22;
        alpha = 0.94;
      } else {
        // Artejos cónicos anillados de la pata y cerdas largas quitinosas
        float ringBand = sin(vSegUV.x * 31.4159);
        baseCol = mix(vec3(0.58, 0.34, 0.15), vec3(0.30, 0.15, 0.06), smoothstep(-0.2, 0.6, ringBand));
        rough = 0.20;
        alpha = 0.99;
      }
    } else if (rId == 7.0) {
      // 7. Huevo gigante intrauterino (150 × 100 µm) y huevos ovalados en la galería
      if (vScleriteMask < 0.48) {
        // Corion ovular hialino perlado translúcido
        baseCol = mix(vec3(0.96, 0.93, 0.85), vec3(0.88, 0.80, 0.66), fineNoise * 0.45);
        rough = 0.16;
        alpha = clamp(0.68 - uTranslucency * 0.34 + fresnel * 0.28, 0.22, 0.88);
      } else {
        // Masa vitelina embrionaria interna y ovario
        baseCol = mix(vec3(0.94, 0.80, 0.52), vec3(0.82, 0.62, 0.34), microNoise);
        rough = 0.32;
        alpha = 0.97;
      }
    } else if (rId == 8.0) {
      // 8. Mesenterón bilobulado en «H» y Escíbalos fecales (scybala)
      if (vScleriteMask > 0.88) {
        // Escíbalos (bolas fecales pardo-negruzcas patognomónicas)
        baseCol = mix(vec3(0.26, 0.16, 0.08), vec3(0.14, 0.08, 0.04), fineNoise);
        rough = 0.38;
        alpha = 0.99;
      } else if (vScleriteMask < 0.45) {
        // Singanglio nervioso central blanco-nacarado
        baseCol = vec3(0.92, 0.89, 0.82);
        rough = 0.30;
        alpha = 0.96;
      } else {
        // Ciegos gástricos del mesenterón con queratina e histolinfa digerida
        baseCol = mix(vec3(0.55, 0.34, 0.16), vec3(0.36, 0.20, 0.09), microNoise);
        rough = 0.34;
        alpha = 0.97;
      }
    } else if (rId == 9.0) {
      // 9. Aparato copulador masculino quitinoso (macho) o Embrión hexápodo 3D intraovular (larva / surco)
      if (vScleriteMask > 0.89) {
        // Edeago y epiandrio quitinoso caoba oscuro
        baseCol = mix(vec3(0.38, 0.17, 0.07), vec3(0.18, 0.07, 0.03), fineNoise);
        rough = 0.18;
        alpha = 0.99;
      } else {
        // Embrión hexápodo 3D acurrucado dentro del huevo o testículos internos
        baseCol = mix(vec3(0.93, 0.82, 0.62), vec3(0.76, 0.58, 0.36), microNoise);
        rough = 0.28;
        alpha = 0.98;
      }
    } else if (rId == 10.0) {
      // 10. Estrato córneo epidérmico (suelo y techo laminar de corneocitos del surco acarino)
      float flakePattern = sin(vLocalPos.x * 18.0 + microNoise * 5.0) * cos(vLocalPos.z * 16.0);
      vec3 skinBase = vec3(0.89, 0.77, 0.66);
      vec3 keratinFlake = vec3(0.95, 0.88, 0.79);
      baseCol = mix(skinBase, keratinFlake, smoothstep(-0.4, 0.5, flakePattern));
      rough = 0.46;
      bool isRoof = vScleriteMask < 0.40;
      alpha = isRoof
        ? clamp(0.64 - uTranslucency * 0.42 + fresnel * 0.22, 0.16, 0.82)
        : 0.94;
    }

    float specPower = mix(18.0, 96.0, 1.0 - rough);
    float spec =
      pow(max(dot(N, H1), 0.0), specPower) * (1.0 - rough * 0.55) +
      0.35 * pow(max(dot(N, H3), 0.0), specPower * 0.65);

    vec3 finalRGB = baseCol;

    if (uShaderMode == 0) {
      // --- MODO 0: BIOLÓGICO 3D HIPERREALISTA (Cutícula perlada, SSS cálido y micro-relieve quitinoso) ---
      vec3 ambient = baseCol * vec3(0.38, 0.36, 0.34);
      vec3 diffuse = baseCol * (diff1 * 0.86 + diff2 * 0.42);
      vec3 sssCol = baseCol * vec3(1.08, 0.78, 0.46) * (sss * 0.52 + backLight * 0.24) * (0.45 + 0.55 * uTranslucency);
      vec3 specCol = vec3(1.0, 0.96, 0.88) * spec * 0.64;
      vec3 rimCol = vec3(0.96, 0.86, 0.68) * fresnel * 0.34;
      finalRGB = ambient + diffuse + sssCol + specCol + rimCol;
    } else if (uShaderMode == 1) {
      // --- MODO 1: MONTAJE MICROSCÓPICO KOH 10% / ACEITE MINERAL (Campo claro #faf7f2) ---
      // En microscopía óptica de campo claro, la luz atraviesa el espécimen aclarado:
      // Los bordes (fresnel), estriaciones, espinas, epímeros en Y y gnatosoma absorben luz (ámbar-marrón oscuro),
      // mientras el centro del idiosoma y del corion ovular es hialino luminoso.
      float opticalDensity = clamp(fresnel * 1.15 + vScleriteMask * 0.65 + (1.0 - striaePattern) * 0.18, 0.0, 1.0);
      vec3 brightFieldBg = vec3(0.98, 0.96, 0.91);
      vec3 amberChitin = mix(vec3(0.88, 0.68, 0.36), vec3(0.32, 0.15, 0.05), opticalDensity);

      if (rId == 8.0 && vScleriteMask > 0.88) {
        // Escíbalos fecales marrón-negruzcos granulares
        finalRGB = mix(vec3(0.34, 0.22, 0.10), vec3(0.15, 0.09, 0.04), opticalDensity);
        alpha = 0.96;
      } else if (rId == 10.0) {
        // Escamas queratínicas translúcidas del estrato córneo en KOH
        finalRGB = mix(brightFieldBg, vec3(0.85, 0.78, 0.66), fresnel * 0.68 + 0.18);
        alpha = vScleriteMask < 0.40 ? clamp(0.32 + fresnel * 0.35, 0.15, 0.68) : 0.72;
      } else if (rId == 7.0 && vScleriteMask < 0.48) {
        // Cáscara hialina birrefringente del huevo de 150 µm
        finalRGB = mix(brightFieldBg, vec3(0.68, 0.56, 0.38), fresnel * 1.35 + 0.12);
        alpha = clamp(0.42 + fresnel * 0.52, 0.24, 0.92);
      } else {
        finalRGB = mix(brightFieldBg * 0.95, amberChitin, 0.35 + 0.62 * opticalDensity) + vec3(spec * 0.22);
        if (rId == 2.0 && vLocalPos.y > -0.02) {
          alpha = clamp(0.38 + fresnel * 0.48 + vScleriteMask * 0.32 - uTranslucency * 0.22, 0.22, 0.88);
        }
      }
    } else if (uShaderMode == 2) {
      // --- MODO 2: SEM (Microscopía Electrónica de Barrido de ultra-alta definición) ---
      float semSignal =
        0.18 +
        0.34 * diff1 +
        0.58 * pow(1.0 - max(dot(N, V), 0.0), 1.65) +
        0.16 * striaePattern +
        0.12 * fineNoise;
      finalRGB = vec3(semSignal) * vec3(0.90, 0.94, 0.98);
      alpha = (rId == 10.0 && vScleriteMask < 0.40) ? 0.35 : 0.99;
    } else {
      // --- MODO 3: RAYOS X / TRANSILUMINACIÓN ---
      vec3 xrayCol = vec3(0.24, 0.72, 0.96);
      if (rId == 7.0) xrayCol = vec3(1.0, 0.78, 0.22); // Huevos de 150 µm en dorado brillante
      else if (rId == 8.0) xrayCol = vec3(0.96, 0.38, 0.32); // Mesenterón y escíbalos en coral
      else if (rId == 9.0) xrayCol = vec3(0.75, 0.48, 1.0); // Embrión hexápodo / edeago en violeta
      else if (rId == 4.0 || rId == 1.0) xrayCol = vec3(0.25, 0.95, 0.72); // Epímeros en Y y gnatosoma

      float edgeGlow = pow(1.0 - max(dot(N, V), 0.0), 1.85);
      finalRGB = xrayCol * (0.28 + 0.85 * edgeGlow + 0.30 * diff1);
      alpha = (rId == 7.0 || rId == 8.0 || rId == 9.0 || rId == 4.0)
        ? 0.92
        : clamp(0.18 + edgeGlow * 0.55, 0.14, 0.75);
    }

    // Realce interactivo de la estructura seleccionada en la guía morfológica
    if (uSelectedRegion > 0) {
      if (int(rId) == uSelectedRegion) {
        finalRGB = mix(finalRGB, finalRGB * 1.28 + vec3(0.08, 0.18, 0.24), 0.42);
      } else {
        finalRGB *= 0.68;
      }
    }

    gl_FragColor = vec4(clamp(finalRGB, 0.0, 1.0), alpha);
  }
`;

/**
 * Metadatos morfológicos, clínicos y diagnósticos de los 4 estadios de Sarcoptes scabiei var. hominis
 */
export const SARCOPTES_STAGES: SarcoptesStageMeta[] = [
  {
    id: "female_adult",
    name: "Hembra adulta grávida (300–450 × 250–350 µm)",
    shortName: "Hembra grávida",
    subtitle:
      "Idiosoma hemisférico «en forma de tortuga» con estriaciones transversales, escamas triangulares dorsales, 14 espinas cónicas, epímeros I fusionados en «Y», ventosas en patas I–II, cerdas largas en III–IV y huevo gigante intrauterino 3D",
    dimensionsNote: "300–450 µm × 250–350 µm (huevo intrauterino: 150 × 100 µm)",
    scaleBarLabel: "100 µm",
    scaleBarWorldUnits: 1.2,
    translucencyLabel: "Translucidez cuticular (KOH / Aceite mineral)",
    translucencyHint:
      "Ajusta la diafanización de la cutícula o activa el «Corte Histológico» para ver el huevo gigante intrauterino (150 µm) y el mesenterón bilobulado en H",
    defaultTranslucency: 0.52,
    defaultCutPercent: 0.0,
    hasMovement: true,
    defaultCamera: {
      position: [0.0, 5.2, 6.2],
      target: [0.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [-2.2, 2.6, 3.6],
      target: [-0.8, 0.0, 0.0],
    },
    focusButtonLabel: "Enfocar Gnatosoma y Epímeros en Y",
    fullButtonLabel: "Vista general del idiosoma",
    overviewSummary:
      "La hembra adulta grávida de Sarcoptes scabiei var. hominis mide 300–450 µm y posee un idiosoma oval-hemisférico («en forma de tortuga»), convexo dorsalmente y aplanado ventralmente, desprovisto de ojos y espiráculos. Su dorso exhibe finas estriaciones transversales paralelas, un campo central de escamas triangulares dirigidas hacia atrás y 7 pares (14) de espinas cónicas posterodorsales. Los pares de patas I y II terminan en largos pedicelos no segmentados con ventosas acampanadas (pulvilos) y sus epímeros I se fusionan en la línea media formando una «Y», mientras que los pares III y IV terminan en largas cerdas flageliformes. En su interior aloja un huevo gigante de 150 × 100 µm visible por translucidez y al activar el Corte Histológico.",
    regions: [
      {
        id: "f-gnathosoma",
        number: 1,
        name: "Gnatosoma anterior (Quelíceros quelados dentados y Pedipalpos)",
        shortLabel: "Gnatosoma (Quelíceros)",
        badge: "Aparato excavador",
        scale: "50–65 µm",
        regionCode: 1,
        colorBio: "#b45309",
        colorStain: "#78350f",
        localAnchor: [-2.68, -0.04, 0.0],
        labelOffset: [-110, -45],
        camGoal: {
          position: [-4.2, 1.6, 2.8],
          target: [-2.4, -0.05, 0.0],
        },
        summary:
          "Falso capítulo cónico corto situado en el camerostoma anterior, integrado por un par de quelíceros quelados robustos provistos de dientes quitinosos y flanqueados por pedipalpos cortos de tres artejos.",
        microscopyNote:
          "Fuertemente esclerotizado de color ámbar-caoba oscuro. En la dermatoscopía in vivo (10×), el gnatosoma pigmentado junto con las coxas anteriores conforman el vértice del patognomónico «signo del ala delta».",
        reconstruction3DNote:
          "Modelado con los dos quelíceros dentados dorsomediales, dedos móviles ventrales y pedipalpos triarticulados laterales con movimiento de excavación.",
      },
      {
        id: "f-idiosoma",
        number: 2,
        name: "Idiosoma «en forma de tortuga» con estriaciones transversales",
        shortLabel: "Idiosoma estriado",
        badge: "Exoesqueleto",
        scale: "300–450 × 250–350 µm",
        regionCode: 2,
        colorBio: "#e2d5b8",
        colorStain: "#d97706",
        localAnchor: [-0.2, 1.28, 0.72],
        labelOffset: [80, -65],
        camGoal: {
          position: [0.2, 5.4, 5.4],
          target: [0.0, 0.2, 0.0],
        },
        summary:
          "Cuerpo sacciforme sin segmentación aparente (fusión de cefalotórax y abdomen), abombado en el dorso y plano en el vientre, recorrido por finas estriaciones cuticulares transversales paralelas que recuerdan huellas dactilares.",
        microscopyNote:
          "Carece por completo de ojos y de espiráculos traqueales (la respiración es íntegramente cutánea). En el dorso anteromedial presenta un escudo propodosomal finamente granulado.",
        reconstruction3DNote:
          "Superficie paramétrica con micro-surcos transversales continuos y perturbación analítica de normales en espacio tangente.",
      },
      {
        id: "f-dorsal-armature",
        number: 3,
        name: "Escamas triangulares dorsales y 14 espinas cónicas posterodorsales",
        shortLabel: "Escamas y 14 Espinas",
        badge: "Anclaje en túnel",
        scale: "Espinas de 25–35 µm",
        regionCode: 3,
        colorBio: "#d97706",
        colorStain: "#92400e",
        localAnchor: [0.85, 1.32, -0.45],
        labelOffset: [105, -55],
        camGoal: {
          position: [2.2, 4.2, 3.8],
          target: [0.5, 0.8, 0.0],
        },
        summary:
          "El centro del dorso está tapizado por hileras de escamas triangulares agudas dirigidas hacia atrás, acompañadas de 3 pares de espinas cortas anterodorsales y 7 pares (14) de espinas cónicas robustas en forma de bellota en la mitad posterior.",
        microscopyNote:
          "Esta armadura dorsal actúa como un trinquete mecánico unidireccional: permite a la hembra avanzar hacia adelante excavando el estrato córneo, pero impide por completo que retroceda dentro del surco.",
        reconstruction3DNote:
          "Cada escama triangular y cada una de las 14 espinas posterodorsales con anillo basal alveolado están esculpidas individualmente en 3D.",
      },
      {
        id: "f-epimeres",
        number: 4,
        name: "Epímeros quitinosos ventrales (Par I fusionado en «Y»)",
        shortLabel: "Epímeros I en «Y»",
        badge: "Criterio taxonómico",
        scale: "Apodemas coxales",
        regionCode: 4,
        colorBio: "#9a3412",
        colorStain: "#7c2d12",
        localAnchor: [-1.15, -0.42, 0.0],
        labelOffset: [-105, 55],
        camGoal: {
          position: [-1.2, -4.6, 3.4],
          target: [-0.8, -0.35, 0.0],
        },
        summary:
          "Barras esclerotizadas de quitina rojizo-caoba en la cara ventral donde se insertan los músculos coxales. En Sarcoptes scabiei, los epímeros del primer par de patas convergen en la línea media y se fusionan formando un característico esternón en «Y».",
        microscopyNote:
          "Los epímeros II, III y IV permanecen libres sin fusionarse en la hembra. La visualización del esternón en «Y» en montajes con KOH al 10% confirma de inmediato el género Sarcoptes.",
        reconstruction3DNote:
          "Rota la cámara hacia la cara ventral para observar la fusión medial en «Y» de los epímeros I y el poro de oviposición transversal (tocostoma).",
      },
      {
        id: "f-anterior-legs",
        number: 5,
        name: "Pares de patas anteriores I y II con ambulacros largos y ventosas",
        shortLabel: "Patas I–II (Ventosas)",
        badge: "Locomoción y succión",
        scale: "Pedicelo no segmentado",
        regionCode: 5,
        colorBio: "#f59e0b",
        colorStain: "#b45309",
        localAnchor: [-1.95, -0.32, 1.52],
        labelOffset: [-95, 45],
        camGoal: {
          position: [-3.2, 2.0, 4.4],
          target: [-1.5, -0.2, 1.0],
        },
        summary:
          "Patas cortas, gruesas, cónicas y telescópicas de 5 artejos que sobresalen del margen anterolateral del cuerpo. Terminan en un pedicelo tubular largo y NO segmentado (ambulacro) coronado por una ventosa acampanada (pulvilo).",
        microscopyNote:
          "El pedicelo largo y carente de articulaciones intermedias distingue a Sarcoptes de otros ácaros (como Psoroptes, cuyo pedicelo está segmentado).",
        reconstruction3DNote:
          "Incluye los anillos quitinosos de los 5 poditos, uñas tarsales, cerdas táctiles, el largo pedicelo tubular y la copa acampanada de succión.",
      },
      {
        id: "f-posterior-legs",
        number: 6,
        name: "Pares de patas posteriores III y IV con cerdas flageliformes largas",
        shortLabel: "Patas III–IV (Cerdas)",
        badge: "Dimorfismo sexual",
        scale: "Cerdas de 150–200 µm",
        regionCode: 6,
        colorBio: "#d97706",
        colorStain: "#92400e",
        localAnchor: [1.35, -0.38, -1.28],
        labelOffset: [95, 55],
        camGoal: {
          position: [2.8, -2.6, -4.2],
          target: [1.1, -0.3, -0.8],
        },
        summary:
          "Insertadas en la cara ventrolateral posterior. En la hembra adulta, TANTO el par III COMO el par IV carecen de ventosas y terminan en larguísimas cerdas flageliformes que se proyectan detrás del cuerpo.",
        microscopyNote:
          "Diferencia clave frente al macho adulto: en la hembra los pares III y IV terminan ambos en cerda larga, mientras que en el macho el par IV posee ventosa pediculada.",
        reconstruction3DNote:
          "Observa los conos podíticos cortos ventrolaterales III y IV proyectando sus largas setas caudales arqueadas.",
      },
      {
        id: "f-intrauterine-egg",
        number: 7,
        name: "Huevo gigante intrauterino 3D (150 × 100 µm) y ovario",
        shortLabel: "Huevo intrauterino 3D",
        badge: "Corte Histológico",
        scale: "150 × 100 µm",
        regionCode: 7,
        colorBio: "#fde047",
        colorStain: "#ca8a04",
        localAnchor: [0.42, 0.32, -0.04],
        labelOffset: [90, -40],
        camGoal: {
          position: [0.6, 3.8, 4.2],
          target: [0.3, 0.2, 0.0],
        },
        defaultTranslucency: 0.72,
        defaultCutPercent: 0.55,
        summary:
          "La hembra grávida madura un huevo ovalado enorme a la vez (150 × 100 µm, casi la mitad de la longitud del propio ácaro) y deposita de 2 a 3 huevos diarios en el surco epidérmico a través del tocostoma ventral.",
        microscopyNote:
          "En los montajes microscópicos de raspado cutáneo es muy frecuente observar el gran huevo elipsoidal de cáscara hialina ocupando el centro del idiosoma de la hembra.",
        reconstruction3DNote:
          "Al seleccionar esta región se activa automáticamente el «Corte Histológico / Sección 3D» para exponer el huevo gigante intrauterino y los ovocitos ováricos en el interior de la hembra.",
      },
      {
        id: "f-digestive-scybala",
        number: 8,
        name: "Mesenterón bilobulado en «H», Singanglio y Escíbalos fecales",
        shortLabel: "Mesenterón y Escíbalos",
        badge: "Anatomía interna",
        scale: "Escíbalos de 20–35 µm",
        regionCode: 8,
        colorBio: "#78350f",
        colorStain: "#451a03",
        localAnchor: [-0.35, 0.22, 0.72],
        labelOffset: [-100, -35],
        camGoal: {
          position: [-0.4, 4.0, 4.4],
          target: [-0.1, 0.15, 0.0],
        },
        defaultTranslucency: 0.72,
        defaultCutPercent: 0.58,
        summary:
          "El aparato digestivo comprende una faringe suctora rodeada por el singanglio nervioso, un ventrículo anterior con dos grandes ciegos gástricos laterales en «H» y un intestino posterior con escíbalos fecales oscuros.",
        microscopyNote:
          "El ácaro secreta proteasas salivales que lisan el estrato córneo e ingiere queratina e histolinfa. Sus deyecciones oscuras ricas en guanina (escíbalos) son altamente antigénicas y desencadenan la hipersensibilidad tipo IV causante del prurito nocturno.",
        reconstruction3DNote:
          "Expuesto en 3D mediante el corte histológico: observa los dos lóbulos laterales del mesenterón, el singanglio anterior y las bolas fecales en el recto.",
      },
    ],
  },
  {
    id: "epidermal_burrow",
    name: "Surco acarino en estrato córneo («Raspado cutáneo / Dermatoscopía»)",
    shortName: "Surco acarino (Galería)",
    subtitle:
      "Tríada diagnóstica del Acarotest en galería serpiginosa del estrato córneo: hembra grávida en el extremo ciego («signo del ala delta»), fila de huevos ovalados (150 µm) y escíbalos fecales",
    dimensionsNote: "Galería de 2–15 mm de largo × 0.4 mm de ancho en el estrato córneo",
    scaleBarLabel: "150 µm",
    scaleBarWorldUnits: 1.5,
    translucencyLabel: "Aclaramiento epidérmico (KOH / Aceite mineral)",
    translucencyHint:
      "Usa el control de «Corte Histológico» para levantar el techo de estrato córneo y abrir el corion de los huevos exponiendo la larva 3D interna",
    defaultTranslucency: 0.58,
    defaultCutPercent: 0.0,
    hasMovement: true,
    defaultCamera: {
      position: [0.0, 6.2, 8.6],
      target: [0.2, -0.1, 0.0],
    },
    focusCamera: {
      position: [-2.8, 3.6, 4.2],
      target: [-2.8, -0.05, 0.0],
    },
    focusButtonLabel: "Enfocar «Signo del Ala Delta»",
    fullButtonLabel: "Ver galería completa",
    overviewSummary:
      "El surco o galería acarina es la lesión elemental patognomónica de la escabiosis humana. La hembra fecundada excava un túnel serpiginoso de 0.5 a 5 mm por día exclusivamente dentro del estrato córneo (sin cruzar la unión dermoepidérmica). En el extremo ciego avanza la hembra («signo del ala delta» en la dermatoscopía), dejando tras de sí una estela lineal de huevos ovalados grandes (150 × 100 µm) en distintos estadios embrionarios y cúmulos de escíbalos (bolas fecales oscuras). El hallazgo de cualquiera de estos 3 elementos en el raspado cutáneo (Acarotest) confirma el diagnóstico.",
    regions: [
      {
        id: "b-delta-wing",
        number: 1,
        name: "Hembra en el extremo ciego («Signo del Ala Delta» dermatoscópico)",
        shortLabel: "Hembra («Ala Delta»)",
        badge: "Dermatoscopía 10×",
        scale: "350–450 µm",
        regionCode: 1,
        colorBio: "#b45309",
        colorStain: "#78350f",
        localAnchor: [-4.45, -0.06, 0.04],
        labelOffset: [-105, -50],
        camGoal: {
          position: [-3.2, 4.2, 4.4],
          target: [-2.9, -0.05, 0.0],
        },
        summary:
          "En el extremo ciego anterior del túnel (vesícula perlada de Bazin) se aloja la hembra grávida. Su gnatosoma y coxas anteriores densamente pigmentados forman un triángulo marrón oscuro conocido en dermatoscopía como «signo del ala delta» o «avión a reacción con estela».",
        microscopyNote:
          "El cuerpo translúcido de la hembra y el túnel blanquecino con huevos y heces constituyen la «estela» detrás del triángulo pigmentado anterior.",
        reconstruction3DNote:
          "Cambia al modo «Montaje KOH / Lupa» desde una vista superior para apreciar el contraste exacto del triángulo anterior oscuro de la hembra dentro del túnel.",
      },
      {
        id: "b-eggs-chain",
        number: 2,
        name: "Hilera de huevos ovalados (150 × 100 µm) en maduración progresiva",
        shortLabel: "Huevos (150 × 100 µm)",
        badge: "Acarotest +",
        scale: "150 × 100 µm",
        regionCode: 7,
        colorBio: "#fde047",
        colorStain: "#ca8a04",
        localAnchor: [1.05, 0.32, -0.24],
        labelOffset: [10, -65],
        camGoal: {
          position: [1.2, 4.2, 5.2],
          target: [1.2, -0.1, 0.0],
        },
        summary:
          "La hembra deposita de 2 a 3 huevos diarios a medida que avanza. Por ello, los huevos más cercanos a la hembra están recién puestos (mórula/blastodermo) y los más distales contienen ya la larva hexápoda lista para eclosionar en 3–4 días.",
        microscopyNote:
          "Los huevos son elipsoidales, muy grandes en proporción al ácaro (150 × 100 µm) y de cáscara hialina lisa y transparente. En el extremo antiguo del surco se observan cáscaras vacías colapsadas con hendidura longitudinal.",
        reconstruction3DNote:
          "Reconstruye la secuencia completa: 1.º huevo en mórula, 2.º en blastodermo, 3.º con larva hexápoda 3D formada y 4.º corion vacío eclosionado.",
      },
      {
        id: "b-embryo-3d",
        number: 3,
        name: "Larva hexápoda 3D intraovular lista para eclosionar",
        shortLabel: "Embrión 3D en huevo",
        badge: "Corte Histológico",
        scale: "110–130 µm intraovular",
        regionCode: 9,
        colorBio: "#f59e0b",
        colorStain: "#b45309",
        localAnchor: [2.65, -0.05, 0.18],
        labelOffset: [95, -45],
        camGoal: {
          position: [2.6, 2.8, 3.6],
          target: [2.65, -0.1, 0.18],
        },
        defaultTranslucency: 0.75,
        defaultCutPercent: 0.58,
        summary:
          "Dentro del tercer huevo de la galería se observa la larva hexápoda completamente formada y acurrucada, que al eclosionar perfora el techo del túnel para salir a la superficie cutánea y excavar bolsillos mudadores.",
        microscopyNote:
          "Como los acaricidas tópicos (permetrina 5%) y la ivermectina oral no son 100% ovicidas frente a estos embriones protegidos por el corion, es indispensable repetir la 2.ª dosis a los 7–14 días.",
        reconstruction3DNote:
          "Al pulsar esta región se activa el «Corte Histológico» abriendo el techo del surco y el polo dorsal del corion para mostrar la larva 3D en su interior.",
      },
      {
        id: "b-scybala",
        number: 4,
        name: "Escíbalos fecales (scybala / bolas fecales oscuras)",
        shortLabel: "Escíbalos (Heces)",
        badge: "Patognomónico",
        scale: "Bolas de 20–35 µm",
        regionCode: 8,
        colorBio: "#78350f",
        colorStain: "#451a03",
        localAnchor: [0.32, -0.35, -0.14],
        labelOffset: [-75, 60],
        camGoal: {
          position: [0.4, 3.2, 4.2],
          target: [0.4, -0.3, -0.1],
        },
        defaultCutPercent: 0.45,
        summary:
          "Cúmulos de esferas fecales de color pardo-amarillento oscuro a negruzco depositadas por la hembra a lo largo del suelo del túnel junto a los huevos.",
        microscopyNote:
          "El hallazgo microscópico aislado de escíbalos fecales en un raspado con aceite mineral tiene el mismo valor diagnóstico confirmatorio que encontrar el ácaro entero o sus huevos (el KOH caliente puede disolver parcialmente los escíbalos).",
        reconstruction3DNote:
          "Agrupados en racimos característicos entre los huevos sobre el lecho queratinizado del túnel.",
      },
      {
        id: "b-stratum-corneum",
        number: 5,
        name: "Techo y lecho laminar del estrato córneo epidérmico",
        shortLabel: "Estrato córneo (Túnel)",
        badge: "Histopatología",
        scale: "Intraepidérmico superficial",
        regionCode: 10,
        colorBio: "#d6b89c",
        colorStain: "#a8a29e",
        localAnchor: [-0.8, 0.76, 0.0],
        labelOffset: [-95, -55],
        camGoal: {
          position: [0.0, 5.8, 7.8],
          target: [0.0, 0.0, 0.0],
        },
        summary:
          "Galería excavada íntegramente en el espesor de los corneocitos anucleados del estrato córneo superficial, sin invadir el estrato espinoso vivo ni la dermis salvo en sobreinfecciones por rascado.",
        microscopyNote:
          "Para realizar el Acarotest correctamente se debe aplicar una gota de aceite mineral sobre el surco intacto y raspar con hoja de bisturí n.º 15 levantando todo el techo epidérmico del túnel.",
        reconstruction3DNote:
          "Desliza el control de «Corte Histológico / Sección 3D» para retirar progresivamente el techo del estrato córneo y explorar la galería abierta.",
      },
    ],
  },
  {
    id: "male_adult",
    name: "Macho adulto (200–240 × 150–200 µm)",
    shortName: "Macho adulto",
    subtitle:
      "Mitad del tamaño de la hembra; posee ambulacros con ventosa en los pares de patas I, II y IV (solo el par III termina en cerda larga) y aparato copulador quitinoso ventral",
    dimensionsNote: "200–240 µm × 150–200 µm",
    scaleBarLabel: "100 µm",
    scaleBarWorldUnits: 1.5,
    translucencyLabel: "Translucidez cuticular (KOH / Aceite mineral)",
    translucencyHint:
      "Observa las ventosas acampanadas en el 4.º par de patas (ausentes en la hembra) y el aparato genital quitinoso entre las coxas IV",
    defaultTranslucency: 0.48,
    defaultCutPercent: 0.0,
    hasMovement: true,
    defaultCamera: {
      position: [0.0, 4.8, 5.8],
      target: [0.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [2.2, -3.2, 3.6],
      target: [0.9, -0.25, 0.0],
    },
    focusButtonLabel: "Enfocar Pata IV (Ventosa) y Edeago",
    fullButtonLabel: "Vista general del macho",
    overviewSummary:
      "El macho adulto de Sarcoptes scabiei var. hominis mide solo 200–240 µm (aproximadamente la mitad que la hembra) y presenta un contorno ligeramente más ovalado y esclerotizado. Su rasgo diagnóstico diferencial clave radica en sus patas posteriores: mientras el 3.er par termina en una cerda larga flageliforme, el 4.º par termina en un ambulacro pediculado con ventosa acampanada (que utiliza para sujetarse a la hembra durante la cópula). Entre las coxas IV exhibe un robusto aparato copulador quitinoso (epiandrio y edeago). Tras fecundar a la hembra, el macho suele morir en pocos días.",
    regions: [
      {
        id: "m-leg4-sucker",
        number: 1,
        name: "4.º Par de patas con ambulacro pediculado y ventosa acampanada",
        shortLabel: "Pata IV con Ventosa",
        badge: "Criterio diagnóstico ♂",
        scale: "Ventosa en pata IV",
        regionCode: 6,
        colorBio: "#f59e0b",
        colorStain: "#b45309",
        localAnchor: [1.55, -0.35, 1.05],
        labelOffset: [95, 50],
        camGoal: {
          position: [2.8, -1.8, 3.6],
          target: [1.2, -0.25, 0.6],
        },
        summary:
          "A diferencia de la hembra (cuyos pares III y IV terminan en cerdas largas), en el macho el 4.º par de patas posee un pedicelo largo no segmentado coronado por una ventosa acampanada (pulvilo), mientras que solo el 3.er par lleva cerda larga.",
        microscopyNote:
          "Fórmula ambulacral diagnóstica de Sarcoptes scabiei: Hembra = ventosas en I y II, cerdas en III y IV; Macho = ventosas en I, II y IV, cerda únicamente en III.",
        reconstruction3DNote:
          "Compara directamente el 3.er par lateral (con cerda larga) y el 4.º par posteromedial (con pedicelo y ventosa en copa).",
      },
      {
        id: "m-genital-apparatus",
        number: 2,
        name: "Aparato copulador ventral (Epiandrio, arco genital y edeago)",
        shortLabel: "Edeago y Epiandrio",
        badge: "Genitalia masculina",
        scale: "Entre coxas IV",
        regionCode: 9,
        colorBio: "#9a3412",
        colorStain: "#7c2d12",
        localAnchor: [1.02, -0.34, 0.0],
        labelOffset: [-95, 60],
        camGoal: {
          position: [1.5, -3.6, 2.8],
          target: [0.9, -0.28, 0.0],
        },
        summary:
          "Estructura quitinosa fuertemente esclerotizada en forma de herradura o campana situada en la línea media ventral posterior entre las coxas del 4.º par de patas, conectada a los testículos bilaterales.",
        microscopyNote:
          "En la cara ventral del macho los epímeros posteriores III y IV se fusionan lateralmente articulándose con el armazón esclerotizado del aparato genital.",
        reconstruction3DNote:
          "Gira el modelo hacia la cara ventral o activa el «Corte Histológico» para ver los testículos bilaterales conectados al edeago.",
      },
      {
        id: "m-anterior-legs-epimeres",
        number: 3,
        name: "Gnatosoma, Epímeros I en «Y» y Patas I–II con ventosas",
        shortLabel: "Gnatosoma y Patas I–II",
        badge: "Región anterior",
        scale: "Ventosas en I y II",
        regionCode: 5,
        colorBio: "#d97706",
        colorStain: "#92400e",
        localAnchor: [-1.45, -0.28, -1.15],
        labelOffset: [-100, -45],
        camGoal: {
          position: [-2.8, 1.8, -3.6],
          target: [-1.1, -0.15, -0.5],
        },
        summary:
          "Al igual que la hembra, el macho presenta quelíceros dentados, epímeros I fusionados medialmente en un esternón en «Y» y ventosas pediculadas en los dos primeros pares de patas.",
        microscopyNote:
          "Los machos viven principalmente en bolsillos epidérmicos superficiales y deambulan por la superficie de la piel en busca de hembras tritoninfas/adultas recién mudadas para fecundarlas.",
        reconstruction3DNote:
          "Modelado con proporción 220 µm y mayor esclerotización dorsal y ventral que la hembra.",
      },
      {
        id: "m-dorsal-armature",
        number: 4,
        name: "Escamas triangulares dorsales y 14 espinas cónicas",
        shortLabel: "Escamas y Espinas",
        badge: "Dorso histerosomal",
        scale: "7 pares de espinas",
        regionCode: 3,
        colorBio: "#b45309",
        colorStain: "#78350f",
        localAnchor: [0.45, 1.05, 0.35],
        labelOffset: [95, -55],
        camGoal: {
          position: [1.6, 3.8, 3.6],
          target: [0.3, 0.6, 0.0],
        },
        summary:
          "Conserva el patrón diagnóstico de la especie en el dorso: estriaciones transversales paralelas, parche central de escamas triangulares y las dos hileras longitudinales de 7 pares de espinas cónicas robustas.",
        microscopyNote:
          "En el macho las escamas triangulares centrales son ligeramente menos numerosas que en la hembra, pero las 14 espinas posterodorsales son prominentes.",
        reconstruction3DNote:
          "Activa el modo SEM para resaltar con máximo contraste topográfico las hileras de espinas y las estriaciones cuticulares.",
      },
    ],
  },
  {
    id: "hexapod_larva",
    name: "Larva hexápoda (6 patas) y Huevo embrionado (110–160 µm)",
    shortName: "Larva hexápoda y Huevo",
    subtitle:
      "Larva recién eclosionada provista únicamente de 3 pares de patas (pares I–II con ventosas y par III con cerda larga; carece de par IV) junto a un huevo embrionado de 150 × 100 µm",
    dimensionsNote: "Larva hexápoda: 110–140 µm · Huevo ovalado: 150 × 100 µm",
    scaleBarLabel: "100 µm",
    scaleBarWorldUnits: 1.4,
    translucencyLabel: "Translucidez del corion y cutícula larval",
    translucencyHint:
      "Activa el «Corte Histológico / Sección 3D» para abrir el corion del huevo de 150 µm y ver la larva hexápoda 3D acurrucada en su interior",
    defaultTranslucency: 0.56,
    defaultCutPercent: 0.0,
    hasMovement: true,
    defaultCamera: {
      position: [0.0, 5.0, 6.6],
      target: [0.1, 0.0, 0.0],
    },
    focusCamera: {
      position: [1.65, 2.8, 3.8],
      target: [1.65, 0.04, 0.15],
    },
    focusButtonLabel: "Enfocar Huevo y Embrión 3D",
    fullButtonLabel: "Ver Larva hexápoda y Huevo",
    overviewSummary:
      "Tras 3 a 4 días de incubación dentro del huevo ovalado de 150 × 100 µm, eclosiona la larva hexápoda (110–140 µm), que se distingue de inmediato de las ninfas (protoninfa y tritoninfa octópodas) y de los adultos porque posee ÚNICAMENTE 3 PARES DE PATAS (6 patas en total): los pares I y II terminan en ventosas pediculadas y el par III termina en una cerda larga flageliforme, careciendo por completo del 4.º par de patas. Las larvas abandonan el surco materno y excavan pequeños bolsillos epidérmicos superficiales («bolsillos de muda») donde mudan a protoninfa de 8 patas en 2–3 días.",
    regions: [
      {
        id: "l-hexapod-body",
        number: 1,
        name: "Larva hexápoda (110–140 µm) con solo 3 pares de patas (6 patas)",
        shortLabel: "Larva hexápoda (6 patas)",
        badge: "Estadio hexápodo",
        scale: "110–140 × 90–110 µm",
        regionCode: 2,
        colorBio: "#e2d5b8",
        colorStain: "#d97706",
        localAnchor: [-1.45, 0.82, -0.12],
        labelOffset: [-105, -55],
        camGoal: {
          position: [-1.5, 3.6, 4.4],
          target: [-1.45, 0.1, -0.12],
        },
        summary:
          "Primer estadio móvil post-embrionario del ciclo biológico. Presenta idiosoma redondo-ovalado con estriaciones transversales, escamas dorsales, espinas posterodorsales, epímeros I fusionados en «Y» y exclusivamente 3 pares de patas.",
        microscopyNote:
          "En un montaje de raspado cutáneo, contar 6 patas (2 pares anteriores con ventosas y 1 único par posterior con cerdas largas) identifica de forma inequívoca a la larva frente a las ninfas y adultos (que poseen 8 patas).",
        reconstruction3DNote:
          "Observa la ausencia total del 4.º par de patas y de los epímeros IV en la mitad posterior de la larva.",
      },
      {
        id: "l-posterior-pair3",
        number: 2,
        name: "Único par de patas posteriores (Par III con cerda larga; sin Par IV)",
        shortLabel: "Par III único (Sin Par IV)",
        badge: "Clave ontogénica",
        scale: "Cerda flageliforme III",
        regionCode: 6,
        colorBio: "#d97706",
        colorStain: "#92400e",
        localAnchor: [-0.85, -0.26, 0.72],
        labelOffset: [-90, 55],
        camGoal: {
          position: [-0.8, -2.8, 3.8],
          target: [-1.2, -0.2, 0.2],
        },
        summary:
          "En la región ventrolateral posterior de la larva solo emerge el 3.er par de patas, provisto de una larga cerda terminal. El 4.º par de patas recién aparecerá tras la primera muda hacia protoninfa octópoda.",
        microscopyNote:
          "Menos del 10% de las larvas que eclosionan logran sobrevivir hasta alcanzar el estadio adulto en un período total de 10 a 14 días.",
        reconstruction3DNote:
          "Gira la vista ventralmente para verificar los 3 pares de coxas y epímeros (I en Y, II y III libres).",
      },
      {
        id: "l-oval-egg",
        number: 3,
        name: "Huevo ovalado grande de cáscara hialina (150 × 100 µm)",
        shortLabel: "Huevo hialino (150 µm)",
        badge: "Diagnóstico directo",
        scale: "150 × 100 µm",
        regionCode: 7,
        colorBio: "#fde047",
        colorStain: "#ca8a04",
        localAnchor: [1.65, 0.85, 0.15],
        labelOffset: [95, -55],
        camGoal: {
          position: [1.8, 3.4, 4.2],
          target: [1.65, 0.1, 0.15],
        },
        summary:
          "Huevo elipsoidal de polos simétricamente redondeados y corion delgado, liso, hialino y refringente. Nótese que el huevo (150 µm) tiene una longitud similar o incluso ligeramente superior a la de la larva hexápoda recién nacida (110–140 µm).",
        microscopyNote:
          "En el Acarotest con aceite mineral o KOH al 10%, los huevos ovalados destacan por su contorno nítido y su gran tamaño uniforme.",
        reconstruction3DNote:
          "Corion perlado semitransparente que permite vislumbrar la silueta embrionaria interna.",
      },
      {
        id: "l-curled-embryo",
        number: 4,
        name: "Embrión hexápodo 3D acurrucado dentro del huevo",
        shortLabel: "Embrión 3D interno",
        badge: "Corte Histológico",
        scale: "Larva pre-eclosión",
        regionCode: 9,
        colorBio: "#f59e0b",
        colorStain: "#b45309",
        localAnchor: [1.65, 0.04, 0.15],
        labelOffset: [95, 50],
        camGoal: {
          position: [1.65, 2.6, 3.4],
          target: [1.65, 0.04, 0.15],
        },
        defaultTranslucency: 0.78,
        defaultCutPercent: 0.56,
        summary:
          "Embrión hexápodo maduro plegado en forma de «C» dentro del corion ovular, mostrando su esbozo de gnatosoma anterior y sus 3 pares de patas embrionarias dobladas sobre la cara ventral.",
        microscopyNote:
          "La visualización del embrión hexápodo dentro del huevo en muestras clínicas confirma viabilidad parasitaria activa.",
        reconstruction3DNote:
          "Al hacer clic en esta región se activa el «Corte Histológico / Sección 3D» abriendo la mitad superior del huevo para exponer la larva 3D interna.",
      },
    ],
  },
];

interface Sarcoptes3DViewerProps {
  onClose?: () => void;
}

function toPercent100(val: number | undefined, fallback: number): number {
  if (val === undefined) return fallback;
  if (val > 0 && val <= 1) return Math.round(val * 100);
  return Math.round(val);
}

export function Sarcoptes3DViewer({ onClose }: Sarcoptes3DViewerProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasHolderRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [activeStage, setActiveStage] =
    useState<SarcoptesStageId>("female_adult");
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [shaderMode, setShaderMode] = useState<SarcoptesShaderMode>(0);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const stageMeta =
    SARCOPTES_STAGES.find((s) => s.id === activeStage) || SARCOPTES_STAGES[0];
  const selectedRegion =
    stageMeta.regions.find((r) => r.id === selectedRegionId) || null;

  const [translucency, setTranslucency] = useState<number>(() =>
    toPercent100(SARCOPTES_STAGES[0].defaultTranslucency, 52)
  );
  const [cutPercent, setCutPercent] = useState<number>(() =>
    toPercent100(SARCOPTES_STAGES[0].defaultCutPercent, 0)
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

  // Referencias para sincronización en el bucle de animación
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
    goalPos: new THREE.Vector3(...SARCOPTES_STAGES[0].defaultCamera.position),
    goalTarget: new THREE.Vector3(...SARCOPTES_STAGES[0].defaultCamera.target),
  });

  const activeStageRef = useRef<SarcoptesStageId>(activeStage);
  activeStageRef.current = activeStage;
  const stageMetaRef = useRef<SarcoptesStageMeta>(stageMeta);
  stageMetaRef.current = stageMeta;
  const movePercentRef = useRef<number>(movePercent);
  movePercentRef.current = movePercent;

  // Cerrar dropdown al hacer clic fuera
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

  // Sincronización de uniforms del shader
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
  }, [stageMeta, shaderMode, translucency, cutPercent, selectedRegionId]);

  useEffect(() => {
    syncUniforms();
  }, [syncUniforms]);

  // Inicialización del lienzo Three.js
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

    const initMeta = SARCOPTES_STAGES[0];
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(...initMeta.defaultCamera.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.8;
    controls.maxDistance = 18.0;
    controls.target.set(...initMeta.defaultCamera.target);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.15;
    controlsRef.current = controls;

    const stopCamTransition = () => {
      camTransitionRef.current.active = false;
    };
    controls.addEventListener("start", stopCamTransition);

    // Material GLSL hiperrealista
    const material = new THREE.ShaderMaterial({
      vertexShader: SARCOPTES_VERTEX_SHADER,
      fragmentShader: SARCOPTES_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uMovement: { value: 0.55 },
        uStageType: { value: 0.0 },
        uTranslucency: {
          value: toPercent100(initMeta.defaultTranslucency, 52) / 100.0,
        },
        uCutPercent: {
          value: toPercent100(initMeta.defaultCutPercent, 0) / 100.0,
        },
        uShaderMode: { value: 0 },
        uSelectedRegion: { value: 0 },
      },
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    const initialGeo = buildSarcoptesCompleteGeometry(initMeta.id);
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

          // Repulsión vertical suave para evitar solapamiento de etiquetas
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
  }, []);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  // Reconstruir geometría al cambiar de estadio
  useEffect(() => {
    if (!meshRef.current || !materialRef.current) return;
    const oldGeo = meshRef.current.geometry;
    const nextGeo = buildSarcoptesCompleteGeometry(activeStage);
    meshRef.current.geometry = nextGeo;
    oldGeo.dispose();

    const stageIdx =
      activeStage === "female_adult"
        ? 0.0
        : activeStage === "epidermal_burrow"
        ? 1.0
        : activeStage === "male_adult"
        ? 2.0
        : 3.0;
    materialRef.current.uniforms.uStageType.value = stageIdx;
  }, [activeStage]);

  const handleSelectRegion = useCallback((regionId: string | null) => {
    setSelectedRegionId((prev) => {
      const nextId = prev === regionId ? null : regionId;
      const currentStage = stageMetaRef.current;
      if (nextId) {
        const reg = currentStage.regions.find((r) => r.id === nextId);
        if (reg) {
          setIsFocused(true);
          if (reg.defaultTranslucency !== undefined) {
            setTranslucency(toPercent100(reg.defaultTranslucency, 65));
          }
          if (reg.defaultCutPercent !== undefined) {
            setCutPercent(toPercent100(reg.defaultCutPercent, 55));
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
    if (activeStage === "female_adult") {
      setCutPercent(55);
      setTranslucency(68);
    } else if (activeStage === "epidermal_burrow") {
      setCutPercent(52);
      setTranslucency(68);
    } else if (activeStage === "male_adult") {
      setCutPercent(0);
      setTranslucency(55);
    } else {
      setCutPercent(55);
      setTranslucency(68);
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
    (newStage: SarcoptesStageId) => {
      setIsStageDropdownOpen(false);
      if (newStage === activeStage) return;
      const meta =
        SARCOPTES_STAGES.find((s) => s.id === newStage) || SARCOPTES_STAGES[0];
      setActiveStage(newStage);
      setSelectedRegionId(null);
      setIsFocused(false);
      setCutPercent(toPercent100(meta.defaultCutPercent, 0));
      setTranslucency(toPercent100(meta.defaultTranslucency, 52));

      camTransitionRef.current = {
        active: true,
        goalPos: new THREE.Vector3(...meta.defaultCamera.position),
        goalTarget: new THREE.Vector3(...meta.defaultCamera.target),
      };
    },
    [activeStage]
  );

  const handleZoom = (factor: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    camTransitionRef.current.active = false;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    const nextLen = Math.max(1.8, Math.min(18.0, dir.length() * factor));
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
                  aria-label="Elegir estadio de Sarcoptes scabiei var. hominis"
                  className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1.5"
                >
                  <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Formas evolutivas de Sarcoptes scabiei var. hominis
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsStageDropdownOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {SARCOPTES_STAGES.map((item) => {
                    const isCurrent = activeStage === item.id;
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
                <span>Montaje KOH / Lupa</span>
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
                ? "Montaje KOH 10% / Aceite mineral: fondo blanco cálido (#faf7f2) con quitina ámbar, huevos hialinos y escíbalos."
                : shaderMode === 2
                ? "SEM: simulación topográfica de microscopía electrónica de barrido de estriaciones, escamas y espinas."
                : shaderMode === 3
                ? "Rayos X / Transiluminación: visualización del huevo gigante intrauterino (150 µm), mesenterón y embrión 3D."
                : "Modo Biológico 3D: cutícula perlada translúcida, armadura dorsal, epímeros en Y y órganos internos."}
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
          } grid-cols-1 ${
            stageMeta.hasMovement ? "md:grid-cols-3" : "md:grid-cols-2"
          } gap-3.5 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800`}
        >
          {/* Deslizador 1: Translucidez de la cutícula / corion */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="sliderSarcoptesTrans"
                className="text-slate-200 font-bold"
              >
                {stageMeta.translucencyLabel}
              </label>
              <span className="text-cyan-300 font-mono font-bold">
                {translucency}%
              </span>
            </div>
            <input
              id="sliderSarcoptesTrans"
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
              <label
                htmlFor="sliderSarcoptesCut"
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
                <span className="text-cyan-300 font-mono font-bold">
                  {cutPercent}%
                </span>
              </div>
            </div>
            <input
              id="sliderSarcoptesCut"
              type="range"
              min={0}
              max={100}
              value={cutPercent}
              onChange={(e) => setCutPercent(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              {activeStage === "female_adult"
                ? "Secciona la bóveda dorsal del idiosoma para ver en el interior el huevo gigante intrauterino (150 µm), el mesenterón en H y los escíbalos."
                : activeStage === "epidermal_burrow"
                ? "Levanta el techo de estrato córneo del surco y abre los huevos para exponer la larva hexápoda 3D interna y las bolas fecales."
                : activeStage === "hexapod_larva"
                ? "Abre el corion del huevo embrionado de 150 × 100 µm para exponer el embrión hexápodo 3D acurrucado en su interior."
                : "Secciona el dorso del macho para examinar los testículos bilaterales conectados al edeago y el tubo digestivo."}
            </p>
          </div>

          {/* Deslizador 3: Motilidad excavadora y articular */}
          {stageMeta.hasMovement && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="sliderSarcoptesMove"
                  className="text-slate-200 font-bold flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Excavación y Motilidad</span>
                </label>
                <span className="text-cyan-300 font-mono font-bold">
                  {movePercent}%
                </span>
              </div>
              <input
                id="sliderSarcoptesMove"
                type="range"
                min={0}
                max={100}
                value={movePercent}
                onChange={(e) => setMovePercent(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 leading-snug">
                Controla el movimiento masticador de los quelíceros del gnatosoma
                y la oscilación de las patas con ventosas y cerdas largas.
              </p>
            </div>
          )}
        </div>

        {/* Selector de Regiones Anatómicas y Detalle Diagnóstico */}
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
                ? "lg:grid-cols-4"
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
                    Acarotest / Dermatoscopía y Correlación clínica:{" "}
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
                  Claves de <em>Sarcoptes scabiei var. hominis</em>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className="text-slate-400">Epímeros I:</span>
                  <span className="text-cyan-300 font-semibold">
                    Fusionados en «Y»
                  </span>
                  <span className="text-slate-400">Hembra (♀):</span>
                  <span className="text-amber-300 font-semibold">
                    Ventosas I–II / Cerdas III–IV
                  </span>
                  <span className="text-slate-400">Macho (♂):</span>
                  <span className="text-slate-200">
                    Ventosas I, II y IV / Cerda III
                  </span>
                  <span className="text-slate-400">Larva / Huevo:</span>
                  <span className="text-emerald-300 font-semibold">
                    Hexápoda (6 patas) / 150 µm
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Referencias documentales */}
        <div className="pt-2 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
          <div>
            <strong className="text-slate-300">Fuentes de referencia:</strong>{" "}
            CDC DPDx Scabies (
            <a
              href="https://www.cdc.gov/dpdx/scabies/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              cdc.gov/dpdx/scabies
            </a>
            ) · Guías Clínicas MINSAL / ISP Chile.
          </div>
          <div>
            Hembra grávida (huevo 3D) · Surco acarino · Macho adulto · Larva
            hexápoda y Huevo
          </div>
        </div>
      </div>
    </div>
  );
}
