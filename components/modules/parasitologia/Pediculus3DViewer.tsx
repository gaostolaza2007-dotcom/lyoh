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
 * Formas evolutivas y diagnósticas de Pediculus humanus capitis (Piojo de la cabeza)
 * Referencias morfológicas y clínicas:
 * - CDC DPDx - Pediculosis (Pediculus humanus capitis & P. humanus corporis): https://www.cdc.gov/dpdx/pediculosis/index.html
 * - Guías Clínicas MINSAL / ISP Chile: Pediculosis y Ectoparasitosis
 */
export type PediculusStageId = "female_adult" | "male_adult" | "nit_egg" | "nymph";

/**
 * Modos de sombreado:
 * 0 = Biológico 3D (cutícula quitinosa translúcida ámbar-grisácea con SSS y sangre digerida)
 * 1 = Montaje Microscópico KOH / Bálsamo (fondo blanco cálido #faf7f2 con quitina ámbar-caoba diafanizada)
 * 2 = SEM (Microscopía Electrónica de Barrido topográfica)
 * 3 = Rayos X / Transiluminación (resalta huevos intrauterinos, mesenterón hematófago y embrión en liendre)
 */
export type PediculusShaderMode = 0 | 1 | 2 | 3;

export interface PediculusRegionInfo {
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

export interface PediculusStageMeta {
  id: PediculusStageId;
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
  regions: PediculusRegionInfo[];
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
 * Evalúa el perfil tridimensional continuo del exoesqueleto de Pediculus humanus capitis:
 * - Cabeza subcónica alargada (clípeo/haustelo anterior, seno antenal, prominencia ocular postantenal y cuello occipital)
 * - Tórax áptero fusionado (protórax, mesotórax y metatórax con lóbulos pleurales coxales, fóvea notal dorsal y espiráculo mesotorácico)
 * - Abdomen ovoide de 7 segmentos visibles con profundos festones laterales, placas paratergales quitinosas en relieve,
 *   bandas tergales transversales y dimorfismo sexual caudal (hendidura bífida en W en la hembra vs. ápice convexo en el macho)
 */
function evaluatePediculusBodySurface(
  u: number, // 0.0 (ápice del haustelo cefálico) -> 1.0 (extremo caudal del abdomen)
  phi: number, // 0..2PI alrededor de la sección transversal (cPhi = lateral Z, sPhi = dorsoventral Y)
  variant: "female" | "male" | "nymph"
): {
  pos: [number, number, number];
  regionId: number;
  segU: number;
  segV: number;
  paratergiteMask: number;
} {
  const totalLen = variant === "female" ? 8.0 : variant === "male" ? 7.0 : 5.2;
  const xStart = -totalLen * 0.47;
  const x = xStart + u * totalLen;

  const cPhi = Math.cos(phi); // Lateral Z (-1..+1)
  const sPhi = Math.sin(phi); // Dorsoventral Y (-1..+1, +1 = dorsal, -1 = ventral)
  const absC = Math.abs(cPhi);

  let W = 0.2;
  let H = 0.12;
  let yOffset = 0.0;
  let regionId = 1.0; // 1 = Cabeza, 2 = Tórax, 3 = Abdomen, 4 = Terminalia
  let segU = 0.0;
  let paratergiteMask = 0.0;

  if (u < 0.185) {
    // --- 1. CABEZA SUBCÓNICA ALARGADA (ANOPLURA) ---
    regionId = 1.0;
    const hu = u / 0.185;
    segU = hu;

    // Clípeo anterior redondeado -> seno antenal (hu ~ 0.36) -> prominencia ocular (hu ~ 0.62) -> sienes -> cuello occipital
    const rostrumTip = Math.pow(Math.sin(Math.min(1.0, hu * 1.04) * Math.PI * 0.88), 0.58);
    const antennalSinus = 1.0 - 0.14 * Math.exp(-Math.pow((hu - 0.34) / 0.08, 2.0));
    const ocularProminence = 1.0 + 0.24 * Math.exp(-Math.pow((hu - 0.60) / 0.12, 2.0));
    const templeExpand = 1.0 + 0.16 * Math.exp(-Math.pow((hu - 0.78) / 0.12, 2.0));
    const occipitalNeck = 1.0 - 0.38 * Math.exp(-Math.pow((hu - 0.97) / 0.075, 2.0));

    W = (0.06 + 0.39 * rostrumTip * antennalSinus * ocularProminence * templeExpand) * occipitalNeck;
    H = (0.045 + 0.20 * rostrumTip * templeExpand) * occipitalNeck;

    // Surco clipeofrontal dorsal sutil y bandas laterales esclerotizadas de la cápsula cefálica
    if (sPhi > 0.25 && absC < 0.32) {
      H -= 0.018 * Math.exp(-Math.pow(cPhi / 0.16, 2.0)) * Math.sin(hu * Math.PI);
    }
    yOffset = -0.025 * (1.0 - hu);
    paratergiteMask =
      smoothstepJS(0.68, 0.95, absC) * 0.78 +
      0.55 * Math.exp(-Math.pow((hu - 0.10) / 0.08, 2.0));
  } else if (u < 0.395) {
    // --- 2. TÓRAX ÁPTERO FUSIONADO CON PROMINENCIAS PLEURALES COXALES Y FÓVEA NOTAL ---
    regionId = 2.0;
    const tu = (u - 0.185) / (0.395 - 0.185);
    segU = tu;

    const baseW = variant === "nymph" ? 0.66 : 0.82;
    const trapExpand = 0.58 + 0.46 * smoothstepJS(0.0, 0.78, tu);

    // Tres lóbulos pleurales marcados donde articulan las coxas I, II y III
    const lobe1 = Math.exp(-Math.pow((tu - 0.18) / 0.10, 2.0));
    const lobe2 = Math.exp(-Math.pow((tu - 0.52) / 0.11, 2.0));
    const lobe3 = Math.exp(-Math.pow((tu - 0.85) / 0.11, 2.0));
    const pleuralBulge = 1.0 + (0.15 * lobe1 + 0.18 * lobe2 + 0.20 * lobe3) * Math.pow(absC, 1.2);
    const waist = 1.0 - 0.15 * Math.exp(-Math.pow((tu - 0.99) / 0.065, 2.0));

    W = baseW * trapExpand * pleuralBulge * waist;
    H = (variant === "nymph" ? 0.27 : 0.32) * (0.80 + 0.24 * Math.sin(tu * Math.PI)) * waist;

    // Fóvea torácica notal (depresión longitudinal mediana en el dorso del tórax, característica de Pediculus)
    if (sPhi > 0.15 && absC < 0.38) {
      const notalPit = Math.exp(-Math.pow(cPhi / 0.15, 2.0)) * Math.sin(tu * Math.PI);
      H -= 0.052 * notalPit;
    }

    // Placas pleurales torácicas y placa esternal ventral fuertemente quitinizadas
    const pleuralSclerite = smoothstepJS(0.64, 0.94, absC) * 0.88;
    const sternalPlate = sPhi < -0.55 && absC < 0.45 ? 0.65 * Math.sin(tu * Math.PI) : 0.0;
    const notalRim = sPhi > 0.65 && absC < 0.16 ? 0.55 * Math.sin(tu * Math.PI) : 0.0;
    paratergiteMask = Math.max(pleuralSclerite, Math.max(sternalPlate, notalRim));
  } else {
    // --- 3. ABDOMEN OVOIDE DE 7 SEGMENTOS CON FESTONES LATERALES Y PLACAS PARATERGALES EN RELIEVE ---
    const au = (u - 0.395) / (1.0 - 0.395); // 0.0 -> 1.0 a lo largo del abdomen
    regionId = au > 0.855 ? 4.0 : 3.0;

    const nSegments = 7.0;
    const segCoord = au * nSegments;
    const segIdx = Math.min(6.0, Math.floor(segCoord));
    segU = segCoord - segIdx; // 0..1 dentro de cada segmento abdominal

    const maxAbdomenW = variant === "female" ? 1.56 : variant === "male" ? 1.26 : 1.06;
    const maxAbdomenH = variant === "female" ? 0.50 : variant === "male" ? 0.40 : 0.42;

    // Silueta ovoide alargada del abdomen
    const archW = Math.sin(Math.pow(au, 0.74) * Math.PI * 0.96);
    const baseW = 0.58 + (maxAbdomenW - 0.58) * archW;

    // Surco intersegmentario profundo en los márgenes laterales (festones en diente de sierra redondeado)
    const distToGroove = Math.min(segU, 1.0 - segU);
    const lateralNotch = 1.0 - (0.22 * Math.pow(absC, 1.4) + 0.05) * Math.exp(-Math.pow(distToGroove / 0.11, 2.0));
    const lobeArch = 1.0 + 0.11 * Math.sin(segU * Math.PI) * Math.pow(absC, 1.35);

    W = baseW * lateralNotch * lobeArch;
    H = (0.26 + (maxAbdomenH - 0.26) * Math.sin(Math.pow(au, 0.78) * Math.PI)) * (0.90 + 0.10 * lateralNotch);

    // Pliegues intersegmentarios transversales en tergitos dorsales y esternitos ventrales
    const dorsalVentralGroove = Math.exp(-Math.pow(distToGroove / 0.095, 2.0));
    H *= 1.0 - 0.11 * dorsalVentralGroove * (1.0 - 0.5 * absC);

    // Relieve tridimensional de las placas paratergales laterales (capuchones quitinosos oscuros en cada festón)
    const isLateralEdge = smoothstepJS(0.66, 0.92, absC);
    const inSegmentBody = Math.sin(segU * Math.PI);
    W += 0.045 * isLateralEdge * Math.pow(inSegmentBody, 1.4);
    H += 0.024 * isLateralEdge * Math.pow(inSegmentBody, 1.4);

    // Bandas tergales dorsales esclerotizadas (muy marcadas en el macho y moderadas en la hembra)
    const tergalBandStrength = variant === "male" ? 0.58 : variant === "female" ? 0.26 : 0.15;
    const isDorsalTergite =
      sPhi > 0.35 &&
      absC < 0.66 &&
      segU > 0.22 &&
      segU < 0.78
        ? tergalBandStrength * Math.sin(((segU - 0.22) / 0.56) * Math.PI) * (1.0 - 0.4 * Math.exp(-Math.pow(cPhi / 0.12, 2.0)))
        : 0.0;

    paratergiteMask = Math.max(
      isLateralEdge * Math.pow(inSegmentBody, 0.75),
      isDorsalTergite
    );

    // --- DIFERENCIACIÓN SEXUAL DEL EXTREMO POSTERIOR (TERMINALIA) ---
    if (variant === "female") {
      // Hembra: Extremo posterior BÍFIDO con dos lóbulos caudales cónicos y hendidura medial en «W»
      if (au > 0.84) {
        const tipT = (au - 0.84) / 0.16;
        const medialCleft = Math.exp(-Math.pow(cPhi / 0.34, 2.0));
        const lobePeak = Math.exp(-Math.pow((absC - 0.56) / 0.25, 2.0));
        const endTaper = Math.cos(tipT * Math.PI * 0.47);
        W *= endTaper * (1.0 - 0.62 * tipT * medialCleft + 0.34 * tipT * lobePeak);
        H *= Math.cos(tipT * Math.PI * 0.45) * (1.0 - 0.48 * tipT * medialCleft);
        paratergiteMask = Math.max(paratergiteMask, 0.65 * tipT * lobePeak);
      }
    } else {
      // Macho y Ninfa: Extremo posterior REDONDEADO / CONVEXO (con placa genital esclerotizada en el macho)
      if (au > 0.85) {
        const tipT = (au - 0.85) / 0.15;
        const roundCap = Math.pow(Math.max(0.001, 1.0 - tipT * tipT), 0.50);
        W *= roundCap;
        H *= roundCap;
        if (variant === "male") {
          paratergiteMask = Math.max(paratergiteMask, 0.72 * tipT);
        }
      }
    }
  }

  // Sección transversal dorsoventralmente aplanada característica de Anoplura, con dorso ligeramente convexo y vientre plano
  const zDir = Math.sign(cPhi) * Math.pow(absC, 0.76);
  const yAsym = sPhi >= 0.0 ? Math.pow(sPhi, 0.84) : -0.82 * Math.pow(-sPhi, 0.92);

  return {
    pos: [x, yOffset + H * yAsym, W * zDir],
    regionId,
    segU,
    segV: cPhi,
    paratergiteMask: clampJS(paratergiteMask, 0.0, 1.0),
  };
}

/**
 * Añade una esfera/elipsoide 3D u ovoide operculado al BufferGeometry del cuerpo del piojo
 */
function appendPediculusEllipsoid(
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
  tiltZ: number,
  metaZ: number,
  regionId: number,
  latBands = 14,
  lonBands = 18
) {
  const baseVertex = positions.length / 3;
  const cT = Math.cos(tiltZ);
  const sT = Math.sin(tiltZ);

  for (let lat = 0; lat <= latBands; lat++) {
    const v = lat / latBands;
    const theta = v * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    // Si es un huevo intrauterino (regionId === 6), le damos perfil ovoide real con collar opercular en el polo anterior (v ~ 0.18)
    let eggProfile = 1.0;
    if (regionId === 6.0) {
      const collarPinch = 1.0 - 0.14 * Math.exp(-Math.pow((v - 0.20) / 0.045, 2.0));
      const basalTaper = v > 0.5 ? 1.0 - 0.16 * Math.pow((v - 0.5) / 0.5, 1.6) : 1.0;
      eggProfile = collarPinch * basalTaper;
    }

    for (let lon = 0; lon <= lonBands; lon++) {
      const u = lon / lonBands;
      const phi = u * Math.PI * 2.0;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const lx = rx * cosTheta;
      const ly = ry * sinTheta * sinPhi * eggProfile;
      const lz = rz * sinTheta * cosPhi * eggProfile;

      const wx = cx + lx * cT - lz * sT;
      const wy = cy + ly;
      const wz = cz + lx * sT + lz * cT;

      const nx0 = cosTheta / rx;
      const ny0 = (sinTheta * sinPhi) / Math.max(0.01, ry * eggProfile);
      const nz0 = (sinTheta * cosPhi) / Math.max(0.01, rz * eggProfile);
      const nRotX = nx0 * cT - nz0 * sT;
      const nRotZ = nx0 * sT + nz0 * cT;
      const norm = vec3Norm([nRotX, ny0, nRotZ]);

      positions.push(wx, wy, wz);
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
 * Añade un tubo orgánico ahusado o elíptico a lo largo de una curva 3D (para artejos de patas, garras tarsales,
 * espolones tibiales, antenas de 5 artejos, cerdas sensoriales / quetotaxia, tráqueas y tallos pilosos)
 */
function appendOrganicTube(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  curvePoints: THREE.Vector3[],
  radiusFn: (u: number) => number,
  regionId: number,
  metaZ = 0.0,
  tubularSegments = 24,
  radialSegments = 12,
  flattenY = 1.0
) {
  const curve = new THREE.CatmullRomCurve3(curvePoints);
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const baseVertex = positions.length / 3;

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments;
    const pt = curve.getPointAt(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = Math.max(0.0025, radiusFn(u));

    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments;
      const theta = v * Math.PI * 2.0;
      const ct = Math.cos(theta);
      const st = Math.sin(theta) * flattenY;

      const nx = ct * N.x + st * B.x;
      const ny = ct * N.y + st * B.y;
      const nz = ct * N.z + st * B.z;
      const norm = vec3Norm([nx, ny, nz]);

      positions.push(pt.x + r * nx, pt.y + r * ny, pt.z + r * nz);
      normals.push(norm[0], norm[1], norm[2]);
      meta1.push(u, v, metaZ, regionId);
    }
  }

  const stride = radialSegments + 1;
  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = baseVertex + i * stride + j;
      const b = baseVertex + (i + 1) * stride + j;
      const c = baseVertex + (i + 1) * stride + (j + 1);
      const d = baseVertex + i * stride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }
}

/**
 * Añade una cerda sensorial (seta entomológica) fina y ahusada
 */
function appendSensorySeta(
  positions: number[],
  normals: number[],
  meta1: number[],
  indices: number[],
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  baseRadius: number,
  regionId: number
) {
  const d = dir.clone().normalize();
  const mid = origin
    .clone()
    .addScaledVector(d, length * 0.55)
    .add(new THREE.Vector3(length * 0.08, -length * 0.05, 0));
  const tip = origin
    .clone()
    .addScaledVector(d, length)
    .add(new THREE.Vector3(length * 0.18, -length * 0.10, 0));
  appendOrganicTube(
    positions,
    normals,
    meta1,
    indices,
    [origin, mid, tip],
    (u) => baseRadius * Math.pow(1.0 - u * 0.92, 0.75),
    regionId,
    1.15, // marca de cerda quitinosa ambarina
    7,
    6
  );
}

/**
 * Construye la geometría 3D entomológica de alta fidelidad de Pediculus humanus capitis:
 * - Exoesqueleto esculpido de cabeza, tórax con fóvea notal y abdomen de 7 segmentos con placas paratergales (rId = 1..4)
 * - 6 pares de espiráculos abdominales crateriformes + 1 par de espiráculos mesotorácicos en relieve (rId = 3, metaZ = 2.5)
 * - Antenas de 5 artejos articulados con sensilas apicales, ocelos con lente corneal hemisférica y haustelo bucal con dientes prestomales (rId = 1)
 * - 3 pares de patas articuladas pieza por pieza (coxa, trocánter, fémur, tibia con espolón/pulgar oponible armado de espina, tarso y gran garra tarsal falciforme) (rId = 9)
 * - 2 tallos de cabello humano sujetados directamente por las pinzas tibiotarsales en adultos (rId = 10)
 * - Quetotaxia entomológica: cerdas sensoriales (setas) en cada festón abdominal, cabeza, antenas, patas y ápice caudal
 * - Órganos internos 3D expuestos al activar el Corte Histológico / Sección 3D:
 *   - Esófago, Mesenterón hematófago lobulado con 2 ciegos gástricos anteriores llenos de sangre y túbulos de Malpighi (rId = 5)
 *   - En la hembra: 9 huevos/ovocitos maduros 3D con opérculo y collar aerífero en los ovariolos laterales (rId = 6) + glándulas del cemento y oviductos (rId = 7)
 *   - En el macho: 4 folículos testiculares piriformes, vesículas seminales (rId = 7) y aparato copulador con placa basal y edeago quitinoso (rId = 8)
 */
function buildPediculusCompleteGeometry(variant: "female" | "male" | "nymph"): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const meta1: number[] = [];
  const indices: number[] = [];

  const scaleFactor = variant === "female" ? 1.0 : variant === "male" ? 0.88 : 0.66;
  const totalLen = variant === "female" ? 8.0 : variant === "male" ? 7.0 : 5.2;
  const xStart = -totalLen * 0.47;

  // 1. ANATOMÍA INTERNA 3D (RENDERIZADA PRIMERO EN EL BUFFER PARA SER VISIBLE TANTO POR TRANSLUCIDEZ COMO EN CORTE HISTOLÓGICO)
  // A. Esófago + Mesenterón hematófago saculado con 2 ciegos gástricos anteriores llenos de sangre (rId = 5.0)
  const esophPts = [
    new THREE.Vector3(xStart + 0.08 * totalLen, -0.01 * scaleFactor, 0.0),
    new THREE.Vector3(xStart + 0.22 * totalLen, -0.01 * scaleFactor, 0.0),
    new THREE.Vector3(xStart + 0.37 * totalLen, -0.015 * scaleFactor, 0.0),
  ];
  appendOrganicTube(
    positions,
    normals,
    meta1,
    indices,
    esophPts,
    () => 0.042 * scaleFactor,
    5.0,
    0.2,
    12,
    8
  );

  const midgutPts = [
    new THREE.Vector3(xStart + 0.36 * totalLen, -0.02 * scaleFactor, 0.0),
    new THREE.Vector3(xStart + 0.48 * totalLen, -0.01 * scaleFactor, 0.0),
    new THREE.Vector3(xStart + 0.61 * totalLen, -0.01 * scaleFactor, 0.0),
    new THREE.Vector3(xStart + 0.74 * totalLen, -0.015 * scaleFactor, 0.0),
    new THREE.Vector3(xStart + 0.88 * totalLen, -0.025 * scaleFactor, 0.0),
  ];
  appendOrganicTube(
    positions,
    normals,
    meta1,
    indices,
    midgutPts,
    (u) => {
      const haustra = 1.0 + 0.22 * Math.sin(u * Math.PI * 4.0);
      const gutRad = variant === "nymph" ? 0.30 : 0.26 * scaleFactor;
      return gutRad * Math.sin(Math.pow(u, 0.68) * Math.PI * 0.94) * haustra;
    },
    5.0,
    0.0,
    34,
    18,
    0.82
  );

  // Dos ciegos gástricos anterolaterales del mesenterón (característicos de Pediculus humanus)
  for (const side of [-1.0, 1.0]) {
    const caecumPts = [
      new THREE.Vector3(xStart + 0.45 * totalLen, 0.0, side * 0.12 * scaleFactor),
      new THREE.Vector3(xStart + 0.38 * totalLen, 0.01, side * 0.25 * scaleFactor),
      new THREE.Vector3(xStart + 0.31 * totalLen, 0.01, side * 0.28 * scaleFactor),
    ];
    appendOrganicTube(
      positions,
      normals,
      meta1,
      indices,
      caecumPts,
      (u) => 0.125 * scaleFactor * Math.sin((1.0 - u * 0.62) * Math.PI * 0.5),
      5.0,
      0.0,
      14,
      12,
      0.85
    );

    // Troncos traqueales respiratorios longitudinales internos que unen los espiráculos laterales (rId = 7.0, metaZ = 3.0)
    const trachPts = [
      new THREE.Vector3(xStart + 0.24 * totalLen, 0.02 * scaleFactor, side * 0.42 * scaleFactor),
      new THREE.Vector3(xStart + 0.44 * totalLen, 0.02 * scaleFactor, side * 0.72 * scaleFactor),
      new THREE.Vector3(xStart + 0.64 * totalLen, 0.02 * scaleFactor, side * 0.88 * scaleFactor),
      new THREE.Vector3(xStart + 0.82 * totalLen, 0.01 * scaleFactor, side * 0.62 * scaleFactor),
    ];
    appendOrganicTube(
      positions,
      normals,
      meta1,
      indices,
      trachPts,
      () => 0.024 * scaleFactor,
      7.0,
      3.0, // tráquea plateada
      22,
      8
    );
  }

  // B. HUEVOS / OVOCITOS MADUROS 3D CON OPÉRCULO EN EL INTERIOR DEL ABDOMEN DE LA HEMBRA GRÁVIDA (rId = 6.0)
  if (variant === "female") {
    const eggRows: Array<{ uAb: number; zFrac: number; rx: number; rz: number; tilt: number }> = [
      { uAb: 0.47, zFrac: 0.52, rx: 0.38, rz: 0.175, tilt: 0.32 },
      { uAb: 0.58, zFrac: 0.64, rx: 0.44, rz: 0.195, tilt: 0.24 },
      { uAb: 0.69, zFrac: 0.60, rx: 0.46, rz: 0.205, tilt: 0.16 },
      { uAb: 0.79, zFrac: 0.44, rx: 0.42, rz: 0.185, tilt: -0.18 },
    ];

    let eggCount = 0;
    for (const side of [-1.0, 1.0]) {
      eggRows.forEach((er) => {
        const xEgg = xStart + er.uAb * totalLen;
        const zEgg = side * er.zFrac;
        const yEgg = 0.015 + (eggCount % 2 === 0 ? 0.022 : -0.018);
        appendPediculusEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          xEgg,
          yEgg,
          zEgg,
          er.rx,
          er.rz * 0.90,
          er.rz,
          side * er.tilt,
          eggCount++,
          6.0,
          16,
          20
        );
      });
    }

    // 9.º huevo maduro en el oviducto medio caudal (listo para ser cementado al cabello)
    appendPediculusEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      xStart + 0.86 * totalLen,
      -0.01,
      0.0,
      0.40,
      0.165,
      0.18,
      0.0,
      eggCount++,
      6.0,
      16,
      20
    );

    // Glándulas colaterales secretoras del cemento quitinoso (rId = 7.0)
    for (const side of [-1.0, 1.0]) {
      appendPediculusEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        xStart + 0.85 * totalLen,
        -0.025,
        side * 0.28,
        0.20,
        0.10,
        0.14,
        side * 0.20,
        1.0,
        7.0,
        10,
        14
      );
    }
  } else if (variant === "male") {
    for (const side of [-1.0, 1.0]) {
      appendPediculusEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        xStart + 0.58 * totalLen,
        0.01,
        side * 0.42,
        0.27,
        0.12,
        0.15,
        side * 0.20,
        0.0,
        7.0,
        12,
        14
      );
      appendPediculusEllipsoid(
        positions,
        normals,
        meta1,
        indices,
        xStart + 0.70 * totalLen,
        0.0,
        side * 0.32,
        0.24,
        0.11,
        0.14,
        -side * 0.16,
        1.0,
        7.0,
        12,
        14
      );
    }
  }

  // 2. HAUSTELO BUCAL APICAL, ANTENAS DE 5 ARTEJOS CON SENSILAS Y OJOS SIMPLES CON CÓRNEA
  const haustellumPts = [
    new THREE.Vector3(xStart + 0.02 * totalLen, -0.02 * scaleFactor, 0.0),
    new THREE.Vector3(xStart - 0.08 * scaleFactor, -0.025 * scaleFactor, 0.0),
    new THREE.Vector3(xStart - 0.18 * scaleFactor, -0.03 * scaleFactor, 0.0),
  ];
  appendOrganicTube(
    positions,
    normals,
    meta1,
    indices,
    haustellumPts,
    (u) => (0.072 - 0.022 * u + 0.012 * Math.sin(u * Math.PI * 2.0)) * scaleFactor,
    1.0,
    1.25,
    10,
    12
  );

  for (const side of [-1.0, 1.0]) {
    const xAnt = xStart + 0.072 * totalLen;
    const zAnt = side * 0.24 * scaleFactor;
    const antPts = [
      new THREE.Vector3(xAnt, -0.01 * scaleFactor, zAnt),
      new THREE.Vector3(xAnt - 0.08 * scaleFactor, 0.01 * scaleFactor, zAnt + side * 0.22 * scaleFactor),
      new THREE.Vector3(xAnt - 0.22 * scaleFactor, 0.02 * scaleFactor, zAnt + side * 0.45 * scaleFactor),
      new THREE.Vector3(xAnt - 0.40 * scaleFactor, 0.015 * scaleFactor, zAnt + side * 0.65 * scaleFactor),
      new THREE.Vector3(xAnt - 0.60 * scaleFactor, 0.00 * scaleFactor, zAnt + side * 0.80 * scaleFactor),
      new THREE.Vector3(xAnt - 0.78 * scaleFactor, -0.015 * scaleFactor, zAnt + side * 0.90 * scaleFactor),
    ];
    appendOrganicTube(
      positions,
      normals,
      meta1,
      indices,
      antPts,
      (u) => {
        const segCoord = u * 5.0;
        const segFrac = segCoord - Math.floor(Math.min(4.999, segCoord));
        const distJoint = Math.min(segFrac, 1.0 - segFrac);
        const jointPinch = 1.0 - 0.36 * Math.exp(-Math.pow(distJoint / 0.14, 2.0));
        const articleBelly = 1.0 + 0.14 * Math.sin(segFrac * Math.PI);
        const taper = 1.0 - 0.34 * u;
        return 0.062 * scaleFactor * taper * jointPinch * articleBelly;
      },
      1.0,
      0.85,
      35,
      12
    );

    const antTip = antPts[5];
    for (let s = -1; s <= 1; s++) {
      appendSensorySeta(
        positions,
        normals,
        meta1,
        indices,
        antTip,
        new THREE.Vector3(-0.65, 0.08 * s, side * (0.65 + 0.22 * s)),
        0.16 * scaleFactor,
        0.009 * scaleFactor,
        1.0
      );
    }
    appendSensorySeta(
      positions,
      normals,
      meta1,
      indices,
      antPts[2],
      new THREE.Vector3(-0.4, 0.15, side * 0.85),
      0.14 * scaleFactor,
      0.008 * scaleFactor,
      1.0
    );

    const xEye = xStart + 0.112 * totalLen;
    appendPediculusEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      xEye,
      0.025 * scaleFactor,
      side * 0.31 * scaleFactor,
      0.065 * scaleFactor,
      0.055 * scaleFactor,
      0.058 * scaleFactor,
      0.0,
      2.0,
      1.0,
      8,
      10
    );
    appendSensorySeta(
      positions,
      normals,
      meta1,
      indices,
      new THREE.Vector3(xStart + 0.145 * totalLen, 0.02 * scaleFactor, side * 0.32 * scaleFactor),
      new THREE.Vector3(0.35, 0.05, side * 0.92),
      0.22 * scaleFactor,
      0.010 * scaleFactor,
      1.0
    );
  }

  // 3. ESPIRÁCULOS RESPIRATORIOS EN RELIEVE Y QUETOTAXIA ABDOMINAL
  for (const side of [-1.0, 1.0]) {
    const surfTh = evaluatePediculusBodySurface(0.245, side > 0 ? 0.15 : Math.PI - 0.15, variant);
    appendPediculusEllipsoid(
      positions,
      normals,
      meta1,
      indices,
      surfTh.pos[0],
      surfTh.pos[1] + 0.02 * scaleFactor,
      surfTh.pos[2] * 0.96,
      0.048 * scaleFactor,
      0.038 * scaleFactor,
      0.048 * scaleFactor,
      0.0,
      2.5,
      2.0,
      6,
      8
    );

    for (let seg = 0; seg < 7; seg++) {
      const uSegMid = 0.395 + ((seg + 0.52) / 7.0) * (1.0 - 0.395);
      const surfLat = evaluatePediculusBodySurface(uSegMid, side > 0 ? 0.08 : Math.PI - 0.08, variant);

      if (seg < 6) {
        appendPediculusEllipsoid(
          positions,
          normals,
          meta1,
          indices,
          surfLat.pos[0],
          surfLat.pos[1] + 0.025 * scaleFactor,
          surfLat.pos[2] * 0.97,
          0.054 * scaleFactor,
          0.042 * scaleFactor,
          0.054 * scaleFactor,
          0.0,
          2.5,
          3.0,
          7,
          10
        );
      }

      const uSegPost = 0.395 + ((seg + 0.72) / 7.0) * (1.0 - 0.395);
      const surfPost = evaluatePediculusBodySurface(uSegPost, side > 0 ? 0.0 : Math.PI, variant);
      const setaOrigin = new THREE.Vector3(surfPost.pos[0], surfPost.pos[1], surfPost.pos[2] * 0.98);
      const baseLen = (0.34 + 0.06 * Math.sin(seg * 0.8)) * scaleFactor;

      appendSensorySeta(
        positions,
        normals,
        meta1,
        indices,
        setaOrigin,
        new THREE.Vector3(0.48, -0.06, side * 0.88),
        baseLen,
        0.013 * scaleFactor,
        3.0
      );
      appendSensorySeta(
        positions,
        normals,
        meta1,
        indices,
        setaOrigin.clone().add(new THREE.Vector3(-0.04 * scaleFactor, 0.02 * scaleFactor, 0)),
        new THREE.Vector3(0.32, 0.08, side * 0.94),
        baseLen * 0.78,
        0.011 * scaleFactor,
        3.0
      );
    }
  }

  // 4. TRES PARES DE PATAS TORÁCICAS ARTICULADAS PIEZA POR PIEZA + PINZA TIBIOTARSAL + TALLOS DE CABELLO SUJETADOS
  const legConfigs = [
    { uPos: 0.228, xBias: -0.58, zSpread: 1.02, isForeLeg: true },
    { uPos: 0.298, xBias: -0.08, zSpread: 1.12, isForeLeg: false },
    { uPos: 0.368, xBias: 0.44, zSpread: 1.18, isForeLeg: false },
  ];

  for (const side of [-1.0, 1.0]) {
    const clawPincerCenters: THREE.Vector3[] = [];

    legConfigs.forEach((lc) => {
      const surfHip = evaluatePediculusBodySurface(lc.uPos, side > 0 ? -0.35 : Math.PI + 0.35, variant);
      const xHip = surfHip.pos[0];
      const yHip = surfHip.pos[1] - 0.04 * scaleFactor;
      const zHip = surfHip.pos[2] * 0.88;

      const rob = (variant === "male" && lc.isForeLeg ? 1.26 : 1.0) * scaleFactor;
      const dx = lc.xBias * scaleFactor;
      const dz = side * lc.zSpread * scaleFactor;

      const pCoxaStart = new THREE.Vector3(xHip, yHip, zHip);
      const pCoxaEnd = new THREE.Vector3(xHip + dx * 0.14, yHip - 0.12 * scaleFactor, zHip + dz * 0.22);
      const pTrochEnd = new THREE.Vector3(xHip + dx * 0.26, yHip - 0.16 * scaleFactor, zHip + dz * 0.38);
      const pFemurMid = new THREE.Vector3(xHip + dx * 0.46, yHip - 0.02 * scaleFactor, zHip + dz * 0.64);
      const pFemurEnd = new THREE.Vector3(xHip + dx * 0.64, yHip - 0.06 * scaleFactor, zHip + dz * 0.86);
      const pTibiaMid = new THREE.Vector3(xHip + dx * 0.84, yHip - 0.18 * scaleFactor, zHip + dz * 1.10);
      const pTibiaEnd = new THREE.Vector3(xHip + dx * 0.98, yHip - 0.28 * scaleFactor, zHip + dz * 1.25);
      const pTarsusEnd = new THREE.Vector3(xHip + dx * 1.08, yHip - 0.35 * scaleFactor, zHip + dz * 1.36);

      appendOrganicTube(
        positions,
        normals,
        meta1,
        indices,
        [pCoxaStart, pCoxaEnd, pTrochEnd],
        (u) => {
          const trochanterGroove = 1.0 - 0.28 * Math.exp(-Math.pow((u - 0.56) / 0.12, 2.0));
          return (0.125 - 0.025 * u) * rob * trochanterGroove;
        },
        9.0,
        0.45,
        14,
        12,
        0.88
      );

      appendOrganicTube(
        positions,
        normals,
        meta1,
        indices,
        [pTrochEnd, pFemurMid, pFemurEnd],
        (u) => {
          const belly = Math.sin(u * Math.PI);
          const ends = 0.74 + 0.42 * belly;
          return 0.118 * rob * ends;
        },
        9.0,
        0.30,
        16,
        12,
        0.82
      );

      appendOrganicTube(
        positions,
        normals,
        meta1,
        indices,
        [pFemurEnd, pTibiaMid, pTibiaEnd],
        (u) => {
          const clubExpand = 0.72 + 0.52 * Math.pow(u, 0.85) * Math.sin(u * Math.PI * 0.82);
          return 0.112 * rob * clubExpand;
        },
        9.0,
        0.52,
        16,
        12,
        0.85
      );

      const pThumbMid = new THREE.Vector3(
        pTibiaEnd.x + 0.10 * scaleFactor,
        pTibiaEnd.y - 0.14 * scaleFactor,
        pTibiaEnd.z - side * 0.04 * scaleFactor
      );
      const pThumbTip = new THREE.Vector3(
        pTibiaEnd.x + 0.18 * scaleFactor,
        pTibiaEnd.y - 0.25 * scaleFactor,
        pTibiaEnd.z - side * 0.12 * scaleFactor
      );
      appendOrganicTube(
        positions,
        normals,
        meta1,
        indices,
        [pTibiaEnd, pThumbMid, pThumbTip],
        (u) => 0.068 * rob * Math.pow(1.0 - u * 0.82, 0.58),
        9.0,
        1.25,
        12,
        10
      );

      appendOrganicTube(
        positions,
        normals,
        meta1,
        indices,
        [pTibiaEnd, pTarsusEnd],
        (u) => (0.088 - 0.015 * u) * rob,
        9.0,
        0.60,
        8,
        10
      );

      const clawPts = [
        pTarsusEnd.clone(),
        new THREE.Vector3(
          pTarsusEnd.x + 0.12 * scaleFactor,
          pTarsusEnd.y - 0.10 * scaleFactor,
          pTarsusEnd.z + side * 0.08 * scaleFactor
        ),
        new THREE.Vector3(
          pTarsusEnd.x + 0.22 * scaleFactor,
          pTarsusEnd.y - 0.22 * scaleFactor,
          pTarsusEnd.z - side * 0.02 * scaleFactor
        ),
        new THREE.Vector3(
          pTibiaEnd.x + 0.25 * scaleFactor,
          pTibiaEnd.y - 0.30 * scaleFactor,
          pTibiaEnd.z - side * 0.16 * scaleFactor
        ),
        new THREE.Vector3(
          pThumbTip.x + 0.02 * scaleFactor,
          pThumbTip.y - 0.02 * scaleFactor,
          pThumbTip.z - side * 0.03 * scaleFactor
        ),
      ];
      appendOrganicTube(
        positions,
        normals,
        meta1,
        indices,
        clawPts,
        (u) => 0.072 * rob * Math.pow(1.0 - u * 0.90, 0.68),
        9.0,
        1.35,
        20,
        12,
        0.80
      );

      clawPincerCenters.push(
        new THREE.Vector3(
          pTibiaEnd.x + 0.15 * scaleFactor,
          pTibiaEnd.y - 0.21 * scaleFactor,
          pTibiaEnd.z - side * 0.02 * scaleFactor
        )
      );

      appendSensorySeta(
        positions,
        normals,
        meta1,
        indices,
        pTibiaMid,
        new THREE.Vector3(lc.xBias * 0.3, 0.25, side * 0.9),
        0.20 * scaleFactor,
        0.010 * scaleFactor,
        9.0
      );
      appendSensorySeta(
        positions,
        normals,
        meta1,
        indices,
        pThumbMid,
        new THREE.Vector3(0.4, -0.6, -side * 0.3),
        0.14 * scaleFactor,
        0.009 * scaleFactor,
        9.0
      );
    });

    // Tallo de cabello humano sujetado por las pinzas tibiotarsales (en hembra, macho y lado derecho de la ninfa)
    if ((variant !== "nymph" || side > 0) && clawPincerCenters.length === 3) {
      const p0 = clawPincerCenters[0];
      const p1 = clawPincerCenters[1];
      const p2 = clawPincerCenters[2];
      const dirFront = p0.clone().sub(p1).normalize();
      const dirBack = p2.clone().sub(p1).normalize();
      const hairPts = [
        p0.clone().addScaledVector(dirFront, 1.85 * scaleFactor),
        p0,
        p1,
        p2,
        p2.clone().addScaledVector(dirBack, 2.65 * scaleFactor),
      ];
      appendOrganicTube(
        positions,
        normals,
        meta1,
        indices,
        hairPts,
        () => 0.082 * scaleFactor,
        10.0,
        0.0,
        36,
        14
      );
    }
  }

  // 5. TERMINALIA SEXUAL ESPECÍFICA: Gonópodos falciformes en Hembra vs. Edeago y Placa Basal en Macho
  if (variant === "female") {
    for (const side of [-1.0, 1.0]) {
      const gPts = [
        new THREE.Vector3(xStart + 0.875 * totalLen, -0.07, side * 0.44),
        new THREE.Vector3(xStart + 0.935 * totalLen, -0.10, side * 0.25),
        new THREE.Vector3(xStart + 0.985 * totalLen, -0.08, side * 0.10),
      ];
      appendOrganicTube(
        positions,
        normals,
        meta1,
        indices,
        gPts,
        (u) => 0.072 * Math.sin((1.0 - u * 0.65) * Math.PI * 0.5),
        4.0,
        1.15,
        14,
        10,
        0.72
      );
      for (let c = 0; c < 3; c++) {
        appendSensorySeta(
          positions,
          normals,
          meta1,
          indices,
          new THREE.Vector3(xStart + (0.94 + c * 0.02) * totalLen, -0.04, side * (0.28 + c * 0.08)),
          new THREE.Vector3(0.85, -0.1, side * (0.35 + c * 0.15)),
          0.26,
          0.011,
          4.0
        );
      }
    }
  } else if (variant === "male") {
    const aedPts = [
      new THREE.Vector3(xStart + 0.74 * totalLen, -0.015, 0.0),
      new THREE.Vector3(xStart + 0.85 * totalLen, -0.005, 0.0),
      new THREE.Vector3(xStart + 0.96 * totalLen, 0.005, 0.0),
      new THREE.Vector3(xStart + 1.055 * totalLen, 0.015, 0.0),
    ];
    appendOrganicTube(
      positions,
      normals,
      meta1,
      indices,
      aedPts,
      (u) => {
        const basalBulge = 1.0 + 0.28 * Math.exp(-Math.pow((u - 0.35) / 0.18, 2.0));
        return 0.125 * basalBulge * Math.sin(Math.pow(1.0 - u * 0.88, 0.62) * Math.PI * 0.5);
      },
      8.0,
      1.35,
      22,
      14,
      0.78
    );
    for (const side of [-1.0, 1.0]) {
      const paramPts = [
        new THREE.Vector3(xStart + 0.72 * totalLen, -0.01, side * 0.13),
        new THREE.Vector3(xStart + 0.84 * totalLen, 0.0, side * 0.15),
        new THREE.Vector3(xStart + 0.96 * totalLen, 0.01, side * 0.06),
      ];
      appendOrganicTube(
        positions,
        normals,
        meta1,
        indices,
        paramPts,
        (u) => 0.042 * (1.0 - 0.55 * u),
        8.0,
        1.25,
        12,
        8
      );
    }
  }

  // 6. MALLA CONTINUA DE CABEZA, TÓRAX Y ABDOMEN SEGMENTADO (EMITIDA AL FINAL: PRIMERO CARA VENTRAL Y LUEGO DORSAL TRANSLÚCIDA)
  const nLongitudinal = 220;
  const nRadial = 80;
  const shellBaseVertex = positions.length / 3;

  for (let i = 0; i <= nLongitudinal; i++) {
    const u = i / nLongitudinal;
    const epsU = 0.003;
    const epsPhi = 0.020;

    for (let j = 0; j <= nRadial; j++) {
      const phi = (j / nRadial) * Math.PI * 2.0;
      const surf = evaluatePediculusBodySurface(u, phi, variant);

      const uPrev = Math.max(0.0005, u - epsU);
      const uNext = Math.min(0.9995, u + epsU);
      const pU1 = evaluatePediculusBodySurface(uNext, phi, variant).pos;
      const pU0 = evaluatePediculusBodySurface(uPrev, phi, variant).pos;
      const pP1 = evaluatePediculusBodySurface(u, phi + epsPhi, variant).pos;
      const pP0 = evaluatePediculusBodySurface(u, phi - epsPhi, variant).pos;

      const dU = vec3Sub(pU1, pU0);
      const dP = vec3Sub(pP1, pP0);
      let N = vec3Norm(vec3Cross(dP, dU));
      if (u < 0.006) {
        N = vec3Norm([-1.0, surf.pos[1] * 2.0, surf.pos[2] * 2.0]);
      }

      positions.push(surf.pos[0], surf.pos[1], surf.pos[2]);
      normals.push(N[0], N[1], N[2]);
      meta1.push(surf.segU, surf.segV, surf.paratergiteMask, surf.regionId);
    }
  }

  const ringStride = nRadial + 1;
  // Primero emitimos la mitad ventral (j >= nRadial / 2, donde sin(phi) <= 0)
  for (let i = 0; i < nLongitudinal; i++) {
    for (let j = Math.floor(nRadial / 2); j < nRadial; j++) {
      const a = shellBaseVertex + i * ringStride + j;
      const b = shellBaseVertex + (i + 1) * ringStride + j;
      const c = shellBaseVertex + (i + 1) * ringStride + (j + 1);
      const d = shellBaseVertex + i * ringStride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }
  // Luego emitimos la mitad dorsal (j < nRadial / 2, donde sin(phi) >= 0) para que se mezcle por alfa sobre los órganos internos 3D
  for (let i = 0; i < nLongitudinal; i++) {
    for (let j = 0; j < Math.floor(nRadial / 2); j++) {
      const a = shellBaseVertex + i * ringStride + j;
      const b = shellBaseVertex + (i + 1) * ringStride + j;
      const c = shellBaseVertex + (i + 1) * ringStride + (j + 1);
      const d = shellBaseVertex + i * ringStride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("a_meta", new THREE.Float32BufferAttribute(meta1, 4));
  geo.setIndex(indices);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 14.0);
  return geo;
}

/**
 * ---------------------------------------------------------------------------
 * SHADERS GLSL FOTORREALISTAS DE PEDICULUS HUMANUS CAPITIS (100% COMPATIBLES WEBGL1/2)
 * ---------------------------------------------------------------------------
 */

const PEDICULUS_BODY_VERTEX_SHADER = `
  precision highp float;

  attribute vec4 a_meta;

  uniform float u_time;
  uniform float u_moveScale;

  varying vec3 v_worldPos;
  varying vec3 v_worldNormal;
  varying vec3 v_localPos;
  varying vec4 v_meta;

  void main() {
    vec3 pos = position;
    vec3 norm = normal;

    int rId = int(a_meta.w + 0.5);
    // Bombeo respiratorio abdominal, peristaltismo del mesenterón y micro-oscilación prensil de patas/antenas
    float breath = sin(u_time * 2.2 + pos.x * 0.85) * 0.016 * u_moveScale;
    if (rId == 3 || rId == 4) {
      pos.z *= 1.0 + breath;
      pos.y *= 1.0 + breath * 0.65;
    } else if (rId == 5) {
      float peristalsis = sin(u_time * 3.4 - pos.x * 2.2) * 0.022 * u_moveScale;
      pos.z *= 1.0 + peristalsis;
      pos.y *= 1.0 + peristalsis;
    } else if (rId == 9) {
      float legSwing = sin(u_time * 2.8 + pos.x * 2.2) * 0.018 * u_moveScale * a_meta.x;
      pos.x += legSwing;
      pos.y += abs(legSwing) * 0.32;
    } else if (rId == 1 && a_meta.z > 0.6 && a_meta.z < 1.1) {
      float antTremor = sin(u_time * 4.2 + pos.z * 3.0) * 0.015 * u_moveScale * a_meta.x;
      pos.y += antTremor;
    }

    vec4 wp = modelMatrix * vec4(pos, 1.0);
    v_worldPos = wp.xyz;
    v_worldNormal = normalize(mat3(modelMatrix) * norm);
    v_localPos = position;
    v_meta = a_meta;

    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const PEDICULUS_BODY_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;
  varying vec3 v_worldNormal;
  varying vec3 v_localPos;
  varying vec4 v_meta;

  uniform float u_translucency;
  uniform float u_cutPlane;
  uniform int u_shaderMode;
  uniform int u_highlightRegion;

  // Perturbación analítica continua en espacio tangente (sin dFdx/dFdy ni #extension)
  vec3 perturbNormalAnalytical(vec3 N, float dU, float dV, float strength) {
    vec3 up = abs(N.y) < 0.92 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 T1 = normalize(cross(up, N));
    vec3 T2 = cross(N, T1);
    return normalize(N + strength * (T1 * dU + T2 * dV));
  }

  void main() {
    int rId = int(v_meta.w + 0.5);
    // rId:
    // 1  = Cabeza, antenas de 5 artejos, ocelos y haustelo
    // 2  = Tórax fusionado con fóvea notal
    // 3  = Abdomen de 7 segmentos con placas paratergales, espiráculos y cerdas
    // 4  = Terminalia (bífida con gonópodos en hembra / convexa en macho)
    // 5  = Mesenterón / Intestino medio 3D con sangre ingerida y ciegos gástricos (interno)
    // 6  = Huevos / Ovocitos maduros 3D operculados en el interior del abdomen de la hembra (interno)
    // 7  = Glándulas del cemento / Testículos / Troncos traqueales 3D (interno)
    // 8  = Edeago, placa basal y parámeros quitinosos del macho
    // 9  = 3 pares de patas articuladas (coxa, trocánter, fémur, tibia con pulgar oponible y garra tarsal)
    // 10 = Tallos de cabello humano sujetados por las pinzas tibiotarsales

    bool isInternalOrgan = (rId == 5 || rId == 6 || rId == 7);
    bool isDorsalShell = (rId >= 1 && rId <= 4 && v_meta.z < 1.1);

    if (u_cutPlane <= 0.01 && u_translucency < 0.04 && isInternalOrgan) {
      discard;
    }

    // Sección histológica 3D de la cutícula dorsal con borde biselado de espesor real
    float cutThreshold = mix(0.52, -0.09, clamp(u_cutPlane, 0.0, 1.0));
    bool isCutRim = false;
    if (u_cutPlane > 0.01 && isDorsalShell) {
      if (v_localPos.y > cutThreshold) {
        discard;
      }
      if (cutThreshold - v_localPos.y < 0.038) {
        isCutRim = true;
      }
    }

    vec3 N0 = normalize(v_worldNormal);
    bool isBackFace = !gl_FrontFacing;
    if (isBackFace) N0 = -N0;

    // Microescultura superficial analítica según región anatómica
    float dU = 0.0;
    float dV = 0.0;
    float bumpStrength = 0.08;
    if (rId == 6) {
      float isOp = smoothstep(0.23, 0.16, v_meta.y);
      dU = mix(cos(v_meta.x * 52.0) * cos(v_meta.y * 52.0), cos(v_meta.x * 38.0) * sin(v_meta.y * 92.0) * 1.8, isOp);
      dV = mix(-sin(v_meta.x * 52.0) * sin(v_meta.y * 52.0), sin(v_meta.x * 38.0) * cos(v_meta.y * 92.0) * 1.8, isOp);
      bumpStrength = 0.11;
    } else if (rId == 10) {
      dU = cos(v_meta.x * 160.0 + sin(v_meta.y * 18.0) * 1.2);
      dV = cos(v_meta.y * 18.0) * 0.4;
      bumpStrength = 0.09;
    } else if (rId == 5) {
      dU = cos(v_meta.x * 44.0) * cos(v_meta.y * 24.0);
      dV = -sin(v_meta.x * 44.0) * sin(v_meta.y * 24.0);
      bumpStrength = 0.085;
    } else {
      dU = cos(v_localPos.x * 78.0 + sin(v_localPos.z * 26.0) * 1.6);
      dV = -sin(v_localPos.z * 64.0) * cos(v_localPos.y * 58.0);
      bumpStrength = 0.065;
    }

    vec3 N = perturbNormalAnalytical(N0, dU, dV, bumpStrength);
    vec3 V = normalize(cameraPosition - v_worldPos);

    // Iluminación de estudio entomológico a 3 puntos (Key cálida, Fill azulada y Rim dorsal)
    vec3 L1 = normalize(vec3(-0.38, 0.80, 0.46));
    vec3 L2 = normalize(vec3(0.65, -0.28, -0.62));
    vec3 L3 = normalize(vec3(0.15, 0.55, -0.82));
    vec3 H1 = normalize(L1 + V);
    vec3 H3 = normalize(L3 + V);

    float diff1 = max(0.0, dot(N, L1));
    float wrap1 = max(0.0, (dot(N, L1) + 0.58) / 1.58);
    float diff2 = max(0.0, dot(N, L2));
    float ndotv = max(0.0, dot(N, V));
    float fresnel = pow(1.0 - ndotv, 2.5);
    float specHard = pow(max(0.0, dot(N, H1)), 64.0) + 0.45 * pow(max(0.0, dot(N, H3)), 48.0);
    float specSoft = pow(max(0.0, dot(N, H1)), 18.0);

    vec3 color = vec3(0.0);
    float alpha = 1.0;

    // --- 1. TALLO DE CABELLO HUMANO SUJETADO POR LAS PINZAS TIBIOTARSALES (rId == 10) ---
    if (rId == 10) {
      float scalePattern = 0.86 + 0.14 * sin(v_meta.x * 160.0 + sin(v_meta.y * 18.0) * 1.2);
      float anisoSpec = pow(max(0.0, sin(v_meta.x * 3.14159 + dot(N, H1) * 2.2)), 24.0) * 0.45;
      if (u_shaderMode == 0) {
        vec3 hairDark = vec3(0.24, 0.14, 0.07) * scalePattern;
        vec3 hairSheen = vec3(0.76, 0.54, 0.32) * (specSoft * 0.55 + anisoSpec);
        color = hairDark * (0.26 + 0.64 * wrap1 + 0.18 * diff2) + hairSheen + vec3(0.45, 0.30, 0.16) * fresnel * 0.35;
      } else if (u_shaderMode == 1) {
        vec3 hairKoh = vec3(0.44, 0.25, 0.11) * scalePattern;
        color = hairKoh * (0.50 + 0.46 * wrap1) + vec3(0.92, 0.78, 0.56) * specSoft * 0.45;
      } else if (u_shaderMode == 2) {
        float lum = (0.16 + 0.64 * fresnel + 0.24 * wrap1) * scalePattern;
        color = vec3(lum * 0.95, lum * 0.97, lum * 1.02) + vec3(0.22) * specHard;
      } else {
        color = vec3(0.14, 0.52, 0.84) * (0.28 + 0.72 * fresnel);
      }
      color = color / (1.0 + color * 0.16);
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    // --- 2. HUEVOS / OVOCITOS MADUROS 3D EN EL INTERIOR DEL ABDOMEN DE LA HEMBRA (rId == 6) ---
    if (rId == 6) {
      float isOperculum = smoothstep(0.23, 0.17, v_meta.y);
      float isCollarRim = exp(-pow((v_meta.y - 0.20) / 0.024, 2.0));
      float aeropyles = smoothstep(-0.2, 0.5, sin(v_meta.x * 38.0) * sin(v_meta.y * 88.0));
      float chorionNet = 0.93 + 0.07 * sin(v_meta.x * 48.0) * cos(v_meta.y * 48.0);
      float vitellusSSS = pow(ndotv, 1.45);

      if (u_shaderMode == 0) {
        vec3 pearlChorion = vec3(0.96, 0.90, 0.75) * chorionNet;
        vec3 collarAmber = vec3(0.66, 0.40, 0.14);
        vec3 operculumTop = mix(vec3(0.58, 0.34, 0.12), vec3(0.92, 0.74, 0.40), aeropyles);
        vec3 eggBase = mix(pearlChorion, operculumTop, isOperculum);
        eggBase = mix(eggBase, collarAmber, isCollarRim * 0.75);
        vec3 yolkGlow = vec3(0.98, 0.78, 0.38) * vitellusSSS * 0.32;
        color = eggBase * (0.28 + 0.62 * wrap1 + 0.18 * diff2) + yolkGlow + vec3(1.0, 0.96, 0.86) * specHard * 0.85 + vec3(0.94, 0.76, 0.40) * fresnel * 0.38;
      } else if (u_shaderMode == 1) {
        vec3 kohEgg = mix(vec3(0.88, 0.64, 0.28) * chorionNet, vec3(0.56, 0.24, 0.08), isOperculum * 0.68 + isCollarRim * 0.55 + fresnel * 0.42);
        color = kohEgg * (0.50 + 0.46 * wrap1) + vec3(1.0, 0.92, 0.78) * specHard * 0.55;
      } else if (u_shaderMode == 2) {
        float lum = (0.22 + 0.66 * pow(1.0 - ndotv, 1.6) + 0.24 * wrap1) * chorionNet;
        color = vec3(lum * 0.95, lum * 0.97, lum * 1.02) + vec3(0.30) * specHard;
      } else {
        color = vec3(0.18, 0.98, 0.70) * (0.40 + 0.68 * fresnel) + vec3(0.85, 1.0, 0.92) * specHard * 0.60;
      }

      if (u_highlightRegion == 6 || u_highlightRegion == 3) {
        color += vec3(0.14, 0.26, 0.34) * (0.45 + 0.55 * fresnel);
      }
      color = color / (1.0 + color * 0.16);
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    // --- 3. MESENTERÓN HEMATÓFAGO CON SANGRE INGERIDA (rId == 5), GLÁNDULAS / TESTÍCULOS Y TRÁQUEAS (rId == 7) ---
    if (rId == 5 || rId == 7) {
      bool isTrachea = (rId == 7 && v_meta.z > 2.2);
      float gran = 0.88 + 0.12 * sin(v_meta.x * 42.0) * cos(v_meta.y * 28.0);
      if (u_shaderMode == 0) {
        if (isTrachea) {
          float taenidia = 0.82 + 0.18 * sin(v_meta.x * 140.0);
          color = vec3(0.84, 0.88, 0.92) * taenidia * (0.35 + 0.65 * wrap1) + vec3(1.0) * specHard * 0.9;
        } else if (rId == 5) {
          vec3 darkHeme = vec3(0.42, 0.03, 0.05) * gran;
          vec3 rubyEdge = vec3(0.78, 0.10, 0.14);
          vec3 bloodCol = mix(darkHeme, rubyEdge, fresnel * 0.58 + pow(ndotv, 2.0) * 0.25);
          color = bloodCol * (0.26 + 0.64 * wrap1 + 0.18 * diff2) + vec3(1.0, 0.82, 0.84) * specHard * 0.95 + vec3(0.95, 0.25, 0.30) * specSoft * 0.28;
        } else {
          vec3 glandCol = vec3(0.86, 0.68, 0.44) * gran;
          color = glandCol * (0.30 + 0.60 * wrap1 + 0.18 * diff2) + vec3(1.0, 0.94, 0.85) * specHard * 0.55;
        }
      } else if (u_shaderMode == 1) {
        vec3 kohInternal = isTrachea
          ? vec3(0.78, 0.66, 0.48)
          : (rId == 5)
          ? vec3(0.48, 0.09, 0.07) * gran
          : vec3(0.74, 0.45, 0.22) * gran;
        color = kohInternal * (0.48 + 0.46 * wrap1) + vec3(0.96, 0.84, 0.78) * specHard * 0.40;
      } else if (u_shaderMode == 2) {
        float lum = (0.20 + 0.64 * fresnel + 0.24 * wrap1) * gran;
        color = vec3(lum);
      } else {
        vec3 rxCol = (rId == 5) ? vec3(0.98, 0.22, 0.46) : vec3(0.36, 0.86, 1.0);
        color = rxCol * (0.42 + 0.68 * fresnel);
      }

      if (u_highlightRegion == rId) {
        color += vec3(0.14, 0.26, 0.32) * (0.45 + 0.55 * fresnel);
      }
      color = color / (1.0 + color * 0.16);
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    // --- 4. EXOESQUELETO QUITINOSO DE CABEZA, TÓRAX, ABDOMEN, ESPIRÁCULOS, CERDAS, PATAS Y EDEAGO ---
    float paratergite = v_meta.z;
    bool isOcellus = (rId == 1 && paratergite > 1.8 && paratergite < 2.2);
    bool isSpiracle = (paratergite > 2.3);
    bool isSeta = (paratergite > 1.08 && paratergite < 1.20);
    bool isClawOrAedeagus = (rId == 9 && paratergite > 1.20) || rId == 8 || (rId == 1 && paratergite > 1.20 && paratergite < 1.50);

    float jointDarkening = 0.0;
    if (rId == 9 && paratergite < 1.0) {
      float endDist = min(v_meta.x, 1.0 - v_meta.x);
      jointDarkening = exp(-pow(endDist / 0.09, 2.0)) * 0.72;
    } else if (rId == 1 && paratergite > 0.75 && paratergite < 1.0) {
      float segF = fract(v_meta.x * 5.0);
      float dJ = min(segF, 1.0 - segF);
      jointDarkening = exp(-pow(dJ / 0.12, 2.0)) * 0.68;
    }

    float bloodShadow = 0.0;
    float eggShadow = 0.0;
    if (rId == 3) {
      bloodShadow = exp(-pow(v_localPos.z / 0.28, 2.0)) * smoothstep(-0.7, 0.25, v_localPos.x) * smoothstep(3.4, 2.0, v_localPos.x);
      eggShadow = exp(-pow((abs(v_localPos.z) - 0.56) / 0.24, 2.0)) * (0.65 + 0.35 * sin(v_localPos.x * 6.5));
    }
    float internalVis = clamp(u_translucency + (isBackFace ? 0.52 : 0.0), 0.0, 1.0);

    if (u_shaderMode == 0) {
      if (isOcellus) {
        vec3 eyeBase = vec3(0.08, 0.04, 0.06) * (0.3 + 0.7 * wrap1);
        color = eyeBase + vec3(1.0, 0.98, 0.95) * specHard * 1.65 + vec3(0.45, 0.32, 0.25) * fresnel * 0.5;
      } else if (isSpiracle) {
        float atriumHole = smoothstep(0.55, 0.22, abs(v_meta.y - 0.5) * 2.0);
        vec3 peritremeAmber = vec3(0.48, 0.24, 0.08);
        vec3 atriumDark = vec3(0.06, 0.03, 0.02);
        color = mix(peritremeAmber * (0.32 + 0.68 * wrap1), atriumDark, atriumHole * 0.85) + vec3(1.0, 0.90, 0.72) * specHard * (1.0 - atriumHole);
      } else if (isSeta) {
        vec3 setaGold = mix(vec3(0.52, 0.28, 0.10), vec3(0.92, 0.72, 0.36), v_meta.x);
        color = setaGold * (0.35 + 0.65 * wrap1) + vec3(1.0, 0.92, 0.75) * specSoft * 0.75;
      } else if (isClawOrAedeagus) {
        vec3 clawBase = mix(vec3(0.62, 0.32, 0.12), vec3(0.24, 0.08, 0.03), pow(v_meta.x, 0.75));
        color = clawBase * (0.28 + 0.64 * wrap1 + 0.18 * diff2) + vec3(1.0, 0.93, 0.78) * specHard * 1.15 + vec3(0.90, 0.56, 0.22) * fresnel * 0.42;
      } else if (isCutRim) {
        color = vec3(0.86, 0.66, 0.38) * (0.45 + 0.55 * wrap1) + vec3(1.0, 0.95, 0.85) * specSoft * 0.6;
      } else {
        vec3 cuticlePale = isBackFace ? vec3(0.76, 0.68, 0.55) : vec3(0.84, 0.77, 0.65);
        vec3 scleriteAmber = vec3(0.46, 0.24, 0.09);
        vec3 jointMahogany = vec3(0.30, 0.12, 0.04);

        float sclerotization = clamp(paratergite * 0.82, 0.0, 0.88);
        vec3 baseCuticle = mix(cuticlePale, scleriteAmber, sclerotization);
        baseCuticle = mix(baseCuticle, jointMahogany, jointDarkening);

        if (rId == 3) {
          float segGroove = exp(-pow(min(v_meta.x, 1.0 - v_meta.x) / 0.10, 2.0));
          baseCuticle *= 1.0 - 0.18 * segGroove;
        }

        baseCuticle = mix(baseCuticle, vec3(0.46, 0.05, 0.07), bloodShadow * internalVis * 0.78);
        baseCuticle = mix(baseCuticle, vec3(0.94, 0.84, 0.62), eggShadow * internalVis * 0.55);

        vec3 sssHoney = vec3(0.88, 0.56, 0.26);
        vec3 lit = baseCuticle * (0.22 + 0.62 * diff1 + 0.22 * diff2) + sssHoney * (wrap1 * 0.28 * (1.0 - diff1 * 0.42));
        color = lit + vec3(1.0, 0.96, 0.88) * (specHard * 0.52 + specSoft * 0.18) + vec3(0.86, 0.72, 0.48) * fresnel * 0.32;
      }
    } else if (u_shaderMode == 1) {
      vec3 kohSlideLight = isBackFace ? vec3(0.93, 0.78, 0.50) : vec3(0.96, 0.84, 0.58);
      vec3 kohAmberMid = vec3(0.76, 0.44, 0.16);
      vec3 kohDeepMahogany = vec3(0.38, 0.13, 0.03);

      float opticalDensity =
        0.18 +
        0.46 * fresnel +
        clamp(paratergite * 0.62, 0.0, 0.72) +
        jointDarkening * 0.55 +
        (isClawOrAedeagus || isSpiracle ? 0.52 : 0.0) +
        bloodShadow * internalVis * 0.45;

      vec3 stained = mix(kohSlideLight, kohAmberMid, smoothstep(0.0, 0.55, opticalDensity));
      stained = mix(stained, kohDeepMahogany, smoothstep(0.45, 1.05, opticalDensity));
      color = stained * (0.54 + 0.44 * wrap1) + vec3(1.0, 0.95, 0.84) * specHard * 0.42;
    } else if (u_shaderMode == 2) {
      float semEdge = pow(1.0 - ndotv, 1.55);
      float semDiff = 0.28 * diff1 + 0.18 * diff2;
      float semCrevice = 1.0 - 0.25 * jointDarkening;
      float lum = (0.14 + 0.74 * semEdge + semDiff) * semCrevice;
      color = vec3(lum * 0.94, lum * 0.97, lum * 1.03) + vec3(0.28) * specHard;
    } else {
      vec3 rimGlow = vec3(0.10, 0.64, 0.94) * fresnel * 1.38;
      vec3 baseDark = vec3(0.03, 0.10, 0.18) * (0.4 + 0.6 * wrap1);
      vec3 internalGlow = vec3(0.98, 0.24, 0.48) * bloodShadow * 0.68 + vec3(0.20, 0.96, 0.70) * eggShadow * 0.58;
      color = baseDark + rimGlow + internalGlow + vec3(0.5, 0.9, 1.0) * specHard * 0.45;
    }

    if (u_highlightRegion > 0 && rId == u_highlightRegion) {
      color += vec3(0.12, 0.24, 0.34) * (0.45 + 0.55 * fresnel);
    }

    if (isDorsalShell && !isBackFace && u_translucency > 0.02 && u_cutPlane <= 0.01) {
      alpha = clamp(0.95 - u_translucency * 0.62, 0.26, 0.98);
    }

    color = color / (1.0 + color * 0.18);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Shader fotorrealista para la Liendre adherida al tallo del cabello humano (Huevo operculado + Ninfa embrionaria 3D)
 */
const PEDICULUS_NIT_VERTEX_SHADER = `
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

const PEDICULUS_NIT_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;
  varying vec3 v_localPos;
  varying vec3 v_worldNormal;
  varying vec2 v_uv;

  uniform int u_partId;
  // 20 = Tallo del cabello humano (cilindro queratinizado con escamas cuticulares imbricadas)
  // 21 = Vaina / Cilindro de cemento quitinoso adhesivo con meniscos alrededor del pelo
  // 22 = Corion / Cápsula ovoide nacarada de la liendre (0.8 x 0.3 mm)
  // 23 = Opérculo apical abovedado con cámaras aeríferas (aerópilos en roseta)
  // 24 = Ninfa embrionaria 3D articulada en desarrollo dentro de la liendre
  // 25 = Manchas oculares ommatidiales y garras embrionarias internas
  uniform int u_shaderMode;
  uniform float u_translucency;
  uniform float u_cutZ;
  uniform int u_highlight;

  vec3 perturbNitNormalAnalytical(vec3 N, float dU, float dV, float strength) {
    vec3 up = abs(N.y) < 0.92 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 T1 = normalize(cross(up, N));
    vec3 T2 = cross(N, T1);
    return normalize(N + strength * (T1 * dU + T2 * dV));
  }

  void main() {
    bool isCutRim = false;
    if (u_partId == 22) {
      if (v_worldPos.z > u_cutZ) {
        discard;
      }
      if (u_cutZ < 0.82 && (u_cutZ - v_worldPos.z) < 0.045) {
        isCutRim = true;
      }
    }

    vec3 N0 = normalize(v_worldNormal);
    if (!gl_FrontFacing) N0 = -N0;

    float dU = 0.0;
    float dV = 0.0;
    float bStr = 0.07;
    if (u_partId == 20) {
      dU = cos(v_uv.x * 24.0) * 0.4;
      dV = cos(v_uv.y * 190.0 + sin(v_uv.x * 24.0) * 1.6);
      bStr = 0.095;
    } else if (u_partId == 21) {
      dU = -sin(v_uv.x * 32.0) * 0.4;
      dV = cos(v_uv.y * 85.0);
      bStr = 0.085;
    } else if (u_partId == 22) {
      dU = cos(v_uv.x * 88.0) * cos(v_uv.y * 88.0);
      dV = -sin(v_uv.x * 88.0) * sin(v_uv.y * 88.0);
      bStr = 0.055;
    } else if (u_partId == 23) {
      dU = cos(v_uv.x * 52.0) * sin(v_uv.y * 52.0);
      dV = sin(v_uv.x * 52.0) * cos(v_uv.y * 52.0);
      bStr = 0.12;
    } else if (u_partId == 24) {
      dU = 0.0;
      dV = cos(v_localPos.y * 22.0);
      bStr = 0.075;
    }

    vec3 N = perturbNitNormalAnalytical(N0, dU, dV, bStr);
    vec3 V = normalize(cameraPosition - v_worldPos);

    vec3 L1 = normalize(vec3(-0.38, 0.78, 0.50));
    vec3 L2 = normalize(vec3(0.62, -0.32, 0.55));
    vec3 H1 = normalize(L1 + V);

    float wrap1 = max(0.0, (dot(N, L1) + 0.54) / 1.54);
    float diff2 = max(0.0, dot(N, L2));
    float ndotv = max(0.0, dot(N, V));
    float fresnel = pow(1.0 - ndotv, 2.3);
    float spec = pow(max(0.0, dot(N, H1)), 48.0) * 0.48;

    vec3 color = vec3(0.0);
    float alpha = 1.0;

    if (u_partId == 20) {
      float scales = 0.85 + 0.15 * sin(v_uv.y * 190.0 + sin(v_uv.x * 24.0) * 1.6);
      float aniso = pow(max(0.0, 1.0 - abs(N.y - V.y * 0.35)), 16.0) * 0.32;
      if (u_shaderMode == 0) {
        vec3 hairCol = vec3(0.28, 0.16, 0.08) * scales;
        color = hairCol * (0.26 + 0.64 * wrap1 + 0.18 * diff2) + vec3(0.82, 0.62, 0.38) * (spec * 1.15 + aniso);
      } else if (u_shaderMode == 1) {
        vec3 hairKoh = vec3(0.45, 0.26, 0.12) * scales;
        color = hairKoh * (0.50 + 0.46 * wrap1) + vec3(0.95, 0.82, 0.64) * spec * 0.65;
      } else if (u_shaderMode == 2) {
        float lum = (0.16 + 0.64 * fresnel + 0.24 * wrap1) * scales;
        color = vec3(lum * 0.95, lum * 0.97, lum * 1.02) + vec3(0.24) * spec;
      } else {
        color = vec3(0.15, 0.55, 0.85) * (0.30 + 0.70 * fresnel);
      }

    } else if (u_partId == 21) {
      float ridges = 0.88 + 0.12 * sin(v_uv.y * 75.0);
      if (u_shaderMode == 0) {
        vec3 glueCol = mix(vec3(0.82, 0.68, 0.44) * ridges, vec3(0.95, 0.86, 0.66), fresnel * 0.58);
        color = glueCol * (0.32 + 0.58 * wrap1 + 0.18 * diff2) + vec3(1.0, 0.95, 0.82) * spec * 0.85;
      } else if (u_shaderMode == 1) {
        vec3 glueKoh = mix(vec3(0.84, 0.58, 0.26) * ridges, vec3(0.58, 0.30, 0.10), fresnel * 0.55);
        color = glueKoh * (0.50 + 0.46 * wrap1) + spec * 0.45;
      } else if (u_shaderMode == 2) {
        float lum = (0.22 + 0.66 * fresnel + 0.24 * wrap1) * ridges;
        color = vec3(lum);
      } else {
        color = vec3(0.22, 0.88, 0.96) * (0.35 + 0.65 * fresnel);
      }
      alpha = 0.95;

    } else if (u_partId == 22) {
      if (isCutRim) {
        color = vec3(0.95, 0.82, 0.54) * (0.5 + 0.5 * wrap1) + vec3(1.0) * spec;
        alpha = 0.98;
      } else {
        float microHex = 0.94 + 0.06 * sin(v_uv.x * 88.0) * cos(v_uv.y * 88.0);
        float baseOp = clamp(0.90 - u_translucency * 0.72, 0.16, 0.94);
        if (u_shaderMode == 0) {
          vec3 pearlWhite = vec3(0.96, 0.91, 0.79) * microHex;
          vec3 caramelAmber = vec3(0.80, 0.62, 0.38);
          color = mix(pearlWhite, caramelAmber, fresnel * 0.62) * (0.34 + 0.56 * wrap1 + 0.18 * diff2) + vec3(1.0, 0.96, 0.88) * spec * 0.95;
        } else if (u_shaderMode == 1) {
          vec3 kohChorion = mix(vec3(0.92, 0.74, 0.44) * microHex, vec3(0.64, 0.34, 0.12), fresnel * 0.68);
          color = kohChorion * (0.50 + 0.46 * wrap1) + spec * 0.55;
        } else if (u_shaderMode == 2) {
          float lum = (0.22 + 0.66 * fresnel + 0.24 * wrap1) * microHex;
          color = vec3(lum);
        } else {
          color = vec3(0.12, 0.68, 0.96) * (0.32 + 0.72 * fresnel);
        }
        alpha = clamp(baseOp * (0.46 + 0.54 * fresnel), 0.14, 0.94);
      }

    } else if (u_partId == 23) {
      float aeropyleCells = sin(v_uv.x * 52.0) * sin(v_uv.y * 52.0);
      float cellMask = smoothstep(-0.28, 0.45, aeropyleCells);
      if (u_shaderMode == 0) {
        vec3 opDark  = vec3(0.48, 0.26, 0.09);
        vec3 opLight = vec3(0.92, 0.74, 0.42);
        vec3 opCol = mix(opDark, opLight, 0.25 + 0.75 * cellMask);
        color = opCol * (0.30 + 0.60 * wrap1 + 0.18 * diff2) + vec3(1.0, 0.94, 0.80) * spec * 0.85;
      } else if (u_shaderMode == 1) {
        vec3 opKoh = mix(vec3(0.46, 0.18, 0.06), vec3(0.84, 0.54, 0.22), 0.25 + 0.75 * cellMask);
        color = opKoh * (0.50 + 0.46 * wrap1) + spec * 0.50;
      } else if (u_shaderMode == 2) {
        float lum = (0.20 + 0.66 * fresnel + 0.25 * wrap1) * (0.68 + 0.32 * cellMask);
        color = vec3(lum);
      } else {
        color = vec3(0.98, 0.78, 0.24) * (0.4 + 0.6 * fresnel) * (0.7 + 0.3 * cellMask);
      }

    } else if (u_partId == 24) {
      float segBands = 0.86 + 0.14 * sin(v_localPos.y * 22.0);
      if (u_shaderMode == 0) {
        vec3 embCol = mix(vec3(0.95, 0.84, 0.64) * segBands, vec3(0.80, 0.54, 0.28), fresnel * 0.58);
        color = embCol * (0.32 + 0.58 * wrap1 + 0.18 * diff2) + vec3(1.0, 0.95, 0.85) * spec * 0.55;
      } else if (u_shaderMode == 1) {
        vec3 embKoh = mix(vec3(0.84, 0.52, 0.24) * segBands, vec3(0.58, 0.24, 0.09), fresnel * 0.62);
        color = embKoh * (0.50 + 0.46 * wrap1) + spec * 0.40;
      } else if (u_shaderMode == 2) {
        float lum = (0.24 + 0.62 * fresnel + 0.24 * wrap1) * segBands;
        color = vec3(lum);
      } else {
        color = vec3(0.22, 0.96, 0.68) * (0.42 + 0.65 * fresnel);
      }
      alpha = 0.98;

    } else {
      if (u_shaderMode == 0 || u_shaderMode == 1) {
        color = vec3(0.42, 0.12, 0.05) * (0.32 + 0.68 * wrap1) + vec3(1.0, 0.92, 0.82) * spec * 1.1;
      } else if (u_shaderMode == 2) {
        color = vec3(0.85) * (0.4 + 0.6 * wrap1);
      } else {
        color = vec3(0.98, 0.38, 0.78) * (0.55 + 0.65 * fresnel);
      }
    }

    if (u_highlight == 1) {
      color += vec3(0.12, 0.24, 0.32) * (0.45 + 0.55 * fresnel);
      alpha = max(alpha, 0.74);
    }

    color = color / (1.0 + color * 0.15);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * METADATOS ANATÓMICOS Y CLÍNICOS DE LAS 4 FORMAS DE PEDICULUS HUMANUS CAPITIS
 */
export const PEDICULUS_STAGES: Record<PediculusStageId, PediculusStageMeta> = {
  female_adult: {
    id: "female_adult",
    name: "Hembra adulta grávida (2.4–3.3 mm, abdomen bífido y huevos internos)",
    shortName: "Hembra adulta",
    subtitle:
      "Insecto Anoplura hematófago sin alas: cabeza con antenas de 5 artejos, tórax con 6 patas en pinza y abdomen de 7 segmentos con extremo bífido y huevos 3D internos",
    dimensionsNote:
      "Hembra adulta: 2.4 a 3.3 mm · 3 pares de patas con garra tarsal · Abdomen de 7 segmentos con extremo bífido y 6–10 huevos/día",
    scaleBarLabel: "500 µm",
    scaleBarWorldUnits: 1.4,
    translucencyLabel: "Translucidez de la cutícula quitinosa",
    translucencyHint:
      "Aumenta la translucidez o activa el Corte Histológico para observar el mesenterón con sangre y los huevos maduros 3D dentro del abdomen.",
    defaultTranslucency: 42,
    defaultCutPercent: 0,
    hasMovement: true,
    defaultCamera: {
      position: [0.0, 5.8, 7.4],
      target: [0.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [1.2, 3.6, 4.2],
      target: [1.1, 0.0, 0.0],
    },
    focusButtonLabel: "Enfocar abdomen y huevos 3D",
    fullButtonLabel: "Ver hembra completa",
    overviewSummary:
      "Pediculus humanus capitis es un insecto ectoparásito hematófago obligado que completa todo su ciclo vital en el cuero cabelludo humano. La hembra adulta (2.4–3.3 mm) se distingue del macho por su mayor tamaño, su extremo abdominal posterior bífido (en «V» invertida) provisto de gonópodos y la presencia de huevos maduros en el interior de su abdomen (que se visualizan directamente en 3D al activar el Corte Histológico).",
    regions: [
      {
        id: "head_antennae_female",
        number: 1,
        name: "Cabeza alargada, antenas de 5 artejos, ocelos y haustelo",
        shortLabel: "Cabeza y antenas (5 seg)",
        badge: "Hematofagia Capilar",
        scale: "Longitud: ~0.45 mm",
        regionCode: 1,
        colorBio: "#f59e0b",
        colorStain: "#b45309",
        localAnchor: [-3.15, 0.05, 0.32],
        labelOffset: [-122, -48],
        camGoal: {
          position: [-3.4, 2.2, 3.2],
          target: [-2.85, 0.0, 0.0],
        },
        defaultTranslucency: 25,
        defaultCutPercent: 0,
        summary:
          "Cabeza subcónica más estrecha que el tórax, provista de un par de antenas sensoriales cortas de 5 segmentos, dos ojos simples pigmentados (ocelos) laterales y un aparato bucal perforador-chupador retráctil (haustelo con estiletes).",
        microscopyNote:
          "A diferencia de los piojos masticadores, el aparato bucal de Anoplura está invaginado y everte pequeños dientes haustelares para anclarse a la epidermis durante la ingesta sanguínea.",
        reconstruction3DNote:
          "Modelada con las 2 antenas articuladas de 5 artejos y los ocelos laterales pigmentados.",
      },
      {
        id: "tarsal_claws_female",
        number: 2,
        name: "Tórax fusionado y 3 pares de patas con garra tarsal y pulgar tibial",
        shortLabel: "Patas y garras en pinza",
        badge: "Prensión del Cabello",
        scale: "6 patas prensiles",
        regionCode: 9,
        colorBio: "#38bdf8",
        colorStain: "#92400e",
        localAnchor: [-1.45, -0.25, 1.35],
        labelOffset: [-122, 48],
        camGoal: {
          position: [-1.8, 2.1, 3.6],
          target: [-1.4, -0.15, 0.85],
        },
        defaultTranslucency: 28,
        defaultCutPercent: 0,
        summary:
          "Tórax carente de alas del que emergen tres pares de patas articuladas robustas. Cada pata termina en una gran garra tarsal curva que cierra como una pinza contra el proceso o espolón tibial oponible («pulgar tibial»).",
        microscopyNote:
          "El diámetro de la pinza tibiotarsal de P. humanus capitis está adaptado específicamente a la sección cilíndrica del cabello humano; no salta ni vuela, se desplaza reptando a ~23 cm/min.",
        reconstruction3DNote:
          "Cada una de las 6 patas incluye coxa, trocánter, fémur, tibia, espolón tibial oponible y garra tarsal curva esclerotizada.",
      },
      {
        id: "abdomen_paratergites_female",
        number: 3,
        name: "Abdomen de 7 segmentos con placas paratergales y 6 pares de espiráculos",
        shortLabel: "Abdomen y paratergitos",
        badge: "Respiración Traqueal",
        scale: "7 segmentos visibles",
        regionCode: 3,
        colorBio: "#10b981",
        colorStain: "#78350f",
        localAnchor: [0.85, 0.15, 1.38],
        labelOffset: [118, -50],
        camGoal: {
          position: [0.8, 3.8, 4.8],
          target: [0.6, 0.0, 0.3],
        },
        defaultTranslucency: 38,
        defaultCutPercent: 0,
        summary:
          "Abdomen membranoso ovalado dividido en 7 segmentos visibles cuyos márgenes laterales están reforzados por placas paratergales esclerotizadas festoneadas donde se abren 6 pares de espiráculos traqueales.",
        microscopyNote:
          "Los pediculicidas físicos (dimeticona) actúan recubriendo y ocluyendo estos espiráculos respiratorios laterales, provocando el colapso osmótico y asfixia del piojo.",
        reconstruction3DNote:
          "Esculpido con los 7 festones laterales esclerotizados de tono ámbar-castaño.",
      },
      {
        id: "internal_eggs_midgut_female",
        number: 4,
        name: "Huevos intrauterinos 3D y mesenterón con sangre (Corte Histológico)",
        shortLabel: "Huevos internos y mesenterón",
        badge: "Interior en Sección 3D",
        scale: "8 huevos + mesenterón",
        regionCode: 6,
        colorBio: "#ec4899",
        colorStain: "#be123c",
        localAnchor: [1.15, 0.05, 0.55],
        labelOffset: [122, 6],
        camGoal: {
          position: [1.1, 3.6, 3.9],
          target: [1.0, 0.0, 0.0],
        },
        defaultTranslucency: 78,
        defaultCutPercent: 56,
        summary:
          "En el interior de la cavidad abdominal de la hembra grávida se alojan los huevos (ovocitos) maduros dispuestos a ambos lados del mesenterón (estómago medio distendido por sangre capilar recién ingerida).",
        microscopyNote:
          "Cada hembra adulta deposita de 6 a 10 huevos diarios (hasta 100–150 a lo largo de sus ~30 días de vida adulta) y necesita ingerir sangre varias veces al día.",
        reconstruction3DNote:
          "Al activar el Corte Histológico / Sección 3D se abre la pared dorsal del abdomen y quedan expuestos los 8 huevos 3D con opérculo y el mesenterón rojo rubí central.",
      },
      {
        id: "bifid_terminalia_female",
        number: 5,
        name: "Extremo posterior bífido en «W» y gonópodos cementadores",
        shortLabel: "Ápice bífido y gonópodos",
        badge: "Dimorfismo Sexual (♀)",
        scale: "2 lóbulos caudales",
        regionCode: 4,
        colorBio: "#ef4444",
        colorStain: "#881337",
        localAnchor: [3.65, -0.04, 0.35],
        labelOffset: [115, 52],
        camGoal: {
          position: [3.9, 2.4, 3.2],
          target: [3.2, -0.05, 0.0],
        },
        defaultTranslucency: 45,
        defaultCutPercent: 0,
        summary:
          "El último segmento abdominal de la hembra presenta una profunda escotadura o hendidura medial que le confiere forma bífida (en «V» invertida), acompañada ventralmente por dos gonópodos curvos.",
        microscopyNote:
          "Los gonópodos sujetan y guían el tallo del cabello mientras las glándulas accesorias secretan el cemento proteico que suelda la liendre a 1–2 mm del cuero cabelludo.",
        reconstruction3DNote:
          "Muestra la hendidura caudal bilobulada, el par de gonópodos ventrales y las glándulas accesorias internas.",
      },
    ],
  },
  male_adult: {
    id: "male_adult",
    name: "Macho adulto (2.0–2.6 mm, ápice redondeado y edeago quitinoso)",
    shortName: "Macho adulto",
    subtitle:
      "Dimorfismo sexual masculino: menor tamaño, primer par de patas engrosado y extremo abdominal redondeado con aparato copulador (edeago) esclerotizado",
    dimensionsNote:
      "Macho adulto: 2.0 a 2.6 mm · Primer par de patas robusto · Ápice abdominal convexo con edeago y placa basal",
    scaleBarLabel: "500 µm",
    scaleBarWorldUnits: 1.4,
    translucencyLabel: "Translucidez de la cutícula quitinosa",
    translucencyHint:
      "Aumenta la translucidez o activa el Corte Histológico para observar el edeago interno, los testículos bilobulados y el mesenterón.",
    defaultTranslucency: 45,
    defaultCutPercent: 0,
    hasMovement: true,
    defaultCamera: {
      position: [0.0, 5.4, 6.8],
      target: [0.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [2.8, 2.2, 3.2],
      target: [2.2, 0.0, 0.0],
    },
    focusButtonLabel: "Enfocar edeago caudal",
    fullButtonLabel: "Ver macho completo",
    overviewSummary:
      "El macho adulto de Pediculus humanus capitis (2.0–2.6 mm) es más pequeño y esbelto que la hembra. Se identifica microscópicamente por su extremo abdominal posterior redondeado (no bífido) a través del cual asoma el edeago (órgano copulador cónico fuertemente quitinizado), y por poseer el primer par de patas anteriores más grueso para sujetar a la hembra.",
    regions: [
      {
        id: "forelegs_male",
        number: 1,
        name: "Primer par de patas protorácicas engrosadas con garra robusta",
        shortLabel: "1.er par de patas robusto",
        badge: "Sujeción Copulatoria",
        scale: "Garras anteriores mayores",
        regionCode: 9,
        colorBio: "#38bdf8",
        colorStain: "#92400e",
        localAnchor: [-1.62, -0.22, 1.15],
        labelOffset: [-122, -44],
        camGoal: {
          position: [-2.1, 2.2, 3.4],
          target: [-1.5, -0.1, 0.6],
        },
        defaultTranslucency: 30,
        defaultCutPercent: 0,
        summary:
          "En el macho, las patas del primer par torácico presentan un fémur, tibia y garra tarsal proporcionalmente más robustos que los pares medio y posterior.",
        microscopyNote:
          "Le permiten aferrarse al tórax de la hembra desde una posición ventral durante el apareamiento.",
        reconstruction3DNote:
          "Modeladas con un calibre un 24% mayor en el primer par protorácico.",
      },
      {
        id: "midgut_testes_male",
        number: 2,
        name: "Mesenterón hematófago y testículos bilobulados (Corte Histológico)",
        shortLabel: "Mesenterón y testículos",
        badge: "Anatomía Interna 3D",
        scale: "Interior abdominal",
        regionCode: 7,
        colorBio: "#ec4899",
        colorStain: "#be123c",
        localAnchor: [0.85, 0.02, 0.38],
        labelOffset: [-115, 48],
        camGoal: {
          position: [0.9, 3.4, 3.8],
          target: [0.8, 0.0, 0.0],
        },
        defaultTranslucency: 76,
        defaultCutPercent: 54,
        summary:
          "Al practicar el corte histológico dorsal del abdomen masculino se observa el mesenterón central lleno de sangre flanqueado por los dos pares de folículos testiculares piriformes y las vesículas seminales.",
        microscopyNote:
          "Tanto machos como hembras y ninfas son hematófagos estrictos e inyectan saliva anticoagulante y vasodilatadora responsable del prurito intenso del cuero cabelludo.",
        reconstruction3DNote:
          "Al activar el Corte Histológico se exponen en 3D el mesenterón rojo rubí y los 4 lóbulos testiculares/vesículas seminales.",
      },
      {
        id: "aedeagus_male",
        number: 3,
        name: "Ápice abdominal redondeado y edeago quitinoso esclerotizado",
        shortLabel: "Edeago y placa basal (♂)",
        badge: "Dimorfismo Sexual (♂)",
        scale: "Ápice convexo + estilete",
        regionCode: 8,
        colorBio: "#f59e0b",
        colorStain: "#881337",
        localAnchor: [3.25, 0.01, 0.0],
        labelOffset: [122, 12],
        camGoal: {
          position: [3.4, 2.0, 2.9],
          target: [2.6, 0.0, 0.0],
        },
        defaultTranslucency: 68,
        defaultCutPercent: 42,
        summary:
          "A diferencia de la hembra bífida, el polo posterior del macho es redondeado y alberga una conspicua estructura copuladora quitinosa en forma de cuña o cono (edeago apoyado sobre una placa basal interna).",
        microscopyNote:
          "En preparaciones aclaradas con KOH, la silueta oscura en cuña del edeago en los últimos segmentos abdominales identifica inmediatamente al macho.",
        reconstruction3DNote:
          "Estructura cónica esclerotizada ámbar-caoba que emerge en el polo caudal redondeado.",
      },
    ],
  },
  nit_egg: {
    id: "nit_egg",
    name: "Liendre viable adherida al cabello (0.8 × 0.3 mm, opérculo y embrión 3D)",
    shortName: "Liendre (huevo)",
    subtitle:
      "Huevo operculado cementado oblicuamente al tallo piloso humano con cilindro de cemento, aerópilos operculares y ninfa embrionaria 3D en su interior",
    dimensionsNote:
      "Liendre: 0.8 × 0.3 mm · Adherida a <6 mm del cuero cabelludo si es viable · Eclosión en 6–9 días",
    scaleBarLabel: "200 µm",
    scaleBarWorldUnits: 1.0,
    translucencyLabel: "Transparencia del corion de la liendre",
    translucencyHint:
      "Aumenta la transparencia o activa el Corte Histológico para ver la ninfa embrionaria con sus ojos y patas dentro de la liendre.",
    defaultTranslucency: 44,
    defaultCutPercent: 45,
    hasMovement: false,
    defaultCamera: {
      position: [1.4, 0.8, 6.8],
      target: [0.0, 0.1, 0.0],
    },
    focusCamera: {
      position: [0.9, 0.5, 4.3],
      target: [0.25, 0.15, 0.0],
    },
    focusButtonLabel: "Enfocar embrión y opérculo",
    fullButtonLabel: "Ver liendre y cabello",
    overviewSummary:
      "Las liendres son los huevos ovalados (0.8 × 0.3 mm) de Pediculus humanus capitis, soldados firmemente al tallo del cabello mediante un cilindro de cemento insoluble. Una liendre situada a menos de 6 mm del cuero cabelludo, de color caramelo/ambarino y con embrión interno indica infestación activa; las liendres blancas vacías situadas a >1 cm del cuero cabelludo suelen corresponder a eclosiones pasadas.",
    regions: [
      {
        id: "hair_cement_nit",
        number: 1,
        name: "Tallo del cabello humano y cilindro de cemento quitinoso insoluble",
        shortLabel: "Cabello y vaina de cemento",
        badge: "Fijación Mecánica",
        scale: "Cabello: Ø ~70–100 µm",
        regionCode: 21,
        colorBio: "#f59e0b",
        colorStain: "#92400e",
        localAnchor: [-0.92, -0.55, 0.15],
        labelOffset: [-125, 42],
        camGoal: {
          position: [-1.4, -0.3, 4.8],
          target: [-0.55, -0.35, 0.0],
        },
        defaultTranslucency: 30,
        defaultCutPercent: 0,
        summary:
          "Manguito cilíndrico de secreción proteica polimerizada que envuelve por completo el tallo del pelo y suelda la base de la liendre en un ángulo oblicuo de ~25–30°.",
        microscopyNote:
          "A diferencia de la caspa, los cilindros parafoliculares (hair casts) o la piedra blanca, la liendre no se desliza fácilmente con los dedos y requiere lendrera de púas estrechas.",
        reconstruction3DNote:
          "Representa el tallo cilíndrico del cabello con escamas cuticulares y el manguito anular de cemento que abraza la fibra pilosa.",
      },
      {
        id: "operculum_aeropyles_nit",
        number: 2,
        name: "Opérculo apical abovedado con cámaras aeríferas (aerópilos)",
        shortLabel: "Opérculo y aerópilos",
        badge: "Intercambio Gaseoso",
        scale: "12–16 poros respiratorios",
        regionCode: 23,
        colorBio: "#38bdf8",
        colorStain: "#b45309",
        localAnchor: [0.85, 1.42, 0.15],
        labelOffset: [122, -46],
        camGoal: {
          position: [1.3, 1.5, 4.2],
          target: [0.55, 1.05, 0.0],
        },
        defaultTranslucency: 28,
        defaultCutPercent: 0,
        summary:
          "Tapa convexa en el polo libre (distal) de la liendre provista de una roseta de tubérculos perforados (aerópilos) que permiten la entrada de oxígeno al embrión en desarrollo sin deshidratarlo.",
        microscopyNote:
          "Tras 6 a 9 días de incubación a la temperatura del cuero cabelludo (~32 °C), la ninfa ingiere aire, aumenta su presión interna y abre esta tapa opercular para emerger.",
        reconstruction3DNote:
          "Cúpula apical esculpida con relieve en panal de cámaras aeríferas.",
      },
      {
        id: "chorion_capsule_nit",
        number: 3,
        name: "Corion (cápsula ovoide nacarada de la liendre, 0.8 × 0.3 mm)",
        shortLabel: "Corion (cápsula ovoide)",
        badge: "Barrera Protectora",
        scale: "0.8 × 0.3 mm",
        regionCode: 22,
        colorBio: "#10b981",
        colorStain: "#78350f",
        localAnchor: [-0.15, 0.45, 0.68],
        labelOffset: [-125, -42],
        camGoal: {
          position: [-0.8, 0.6, 5.4],
          target: [0.1, 0.2, 0.0],
        },
        defaultTranslucency: 24,
        defaultCutPercent: 35,
        summary:
          "Cubierta quitinosa rígida, lisa y translúcida que protege al embrión frente a la desecación y reduce parcialmente la penetración de insecticidas neurotópicos convencionales.",
        microscopyNote:
          "Como muchos pediculicidas (permetrina 1%) no son 100% ovicidas en una sola aplicación, se recomienda repetir el tratamiento a los 7–10 días para eliminar las ninfas recién nacidas.",
        reconstruction3DNote:
          "Cápsula ovoide en doble pasada que se secciona limpiamente al activar el Corte Histológico.",
      },
      {
        id: "embryo_nymph_nit",
        number: 4,
        name: "Ninfa embrionaria 3D en desarrollo en el interior de la liendre",
        shortLabel: "Embrión interno (ninfa)",
        badge: "Liendre Viable",
        scale: "Ojos y garras formados",
        regionCode: 24,
        colorBio: "#ec4899",
        colorStain: "#be123c",
        localAnchor: [0.32, 0.22, 0.15],
        labelOffset: [125, 38],
        camGoal: {
          position: [0.8, 0.3, 4.1],
          target: [0.25, 0.15, 0.0],
        },
        defaultTranslucency: 58,
        defaultCutPercent: 56,
        summary:
          "En el interior de la liendre viable se observa el embrión de primer estadio ninfal orientado con la cabeza hacia el opérculo, mostrando su mancha ocular pigmentada y sus tres pares de patas plegadas.",
        microscopyNote:
          "En dermatoscopía (entomoscopía), la presencia del embrión ambarino con mancha ocular dentro de una liendre próxima a la raíz pilosa confirma viabilidad y necesidad de tratamiento.",
        reconstruction3DNote:
          "Al activar el Corte Histológico / Sección 3D se abre la pared anterior de la liendre y queda expuesto el embrión 3D completo en su interior.",
      },
    ],
  },
  nymph: {
    id: "nymph",
    name: "Ninfa hematófaga juvenil (1.1–2.0 mm, metamorfosis hemimetábola)",
    shortName: "Ninfa juvenil",
    subtitle:
      "Estadio juvenil recién eclosionado de la liendre: morfología similar al adulto en miniatura, cutícula muy translúcida y mesenterón distendido por sangre fresca",
    dimensionsNote:
      "Ninfa (3 estadios N1–N3): 1.1 a 2.0 mm · Madura a adulto en ~8–10 días · Hematófaga obligada desde el día 1",
    scaleBarLabel: "500 µm",
    scaleBarWorldUnits: 1.4,
    translucencyLabel: "Translucidez de la cutícula juvenil",
    translucencyHint:
      "Observa a través de la fina cutícula ninfal o mediante el Corte Histológico el gran mesenterón distendido por sangre fresca.",
    defaultTranslucency: 56,
    defaultCutPercent: 0,
    hasMovement: true,
    defaultCamera: {
      position: [0.0, 4.8, 5.8],
      target: [0.0, 0.0, 0.0],
    },
    focusCamera: {
      position: [0.4, 3.0, 3.6],
      target: [0.2, 0.0, 0.0],
    },
    focusButtonLabel: "Enfocar mesenterón con sangre",
    fullButtonLabel: "Ver ninfa completa",
    overviewSummary:
      "Tras emerger por el opérculo de la liendre, la ninfa de Pediculus humanus capitis atraviesa tres estadios ninfales (N1, N2 y N3) separados por mudas a lo largo de 8 a 10 días antes de alcanzar la madurez sexual. Debe ingerir sangre en las primeras 24 horas tras nacer; su cutícula es más pálida y transparente, dejando ver el tubo digestivo rojo brillante.",
    regions: [
      {
        id: "head_thorax_nymph",
        number: 1,
        name: "Cabeza y tórax juvenil con 3 pares de patas prensiles funcionales",
        shortLabel: "Cabeza y patas ninfales",
        badge: "Hematófaga desde N1",
        scale: "Proporción cefálica mayor",
        regionCode: 1,
        colorBio: "#38bdf8",
        colorStain: "#b45309",
        localAnchor: [-1.85, 0.04, 0.25],
        labelOffset: [-118, -44],
        camGoal: {
          position: [-2.1, 2.2, 3.2],
          target: [-1.3, 0.0, 0.0],
        },
        defaultTranslucency: 38,
        defaultCutPercent: 0,
        summary:
          "Desde el primer estadio ninfal (N1, ~1.1 mm), el insecto posee ya antenas de 5 artejos, aparato bucal perforador funcional y 3 pares de patas con pinza tibiotarsal para sujetarse al cabello.",
        microscopyNote:
          "Las ninfas jóvenes permanecen cerca del cuero cabelludo alimentándose con frecuencia y rara vez se transfieren a otro hospedador hasta que alcanzan mayor movilidad.",
        reconstruction3DNote:
          "Muestra la mayor proporción relativa de la cabeza y las patas respecto del abdomen juvenil corto.",
      },
      {
        id: "midgut_blood_nymph",
        number: 2,
        name: "Mesenterón intensamente distendido por comida de sangre fresca",
        shortLabel: "Mesenterón con sangre",
        badge: "Requisito Vital (<24 h)",
        scale: "Ocupa gran parte del abdomen",
        regionCode: 5,
        colorBio: "#ef4444",
        colorStain: "#be123c",
        localAnchor: [0.45, 0.02, 0.0],
        labelOffset: [122, -38],
        camGoal: {
          position: [0.6, 2.8, 3.4],
          target: [0.4, 0.0, 0.0],
        },
        defaultTranslucency: 78,
        defaultCutPercent: 52,
        summary:
          "Debido a la delgadez y transparencia del exoesqueleto ninfal, tras alimentarse se aprecia nítidamente el ventrículo medio (mesenterón) repleto de sangre roja.",
        microscopyNote:
          "El hallazgo de ninfas móviles o adultos vivos en el cuero cabelludo (especialmente en las regiones retroauricular y occipital) constituye el criterio de certeza de pediculosis activa.",
        reconstruction3DNote:
          "Visible tanto por transparencia de la cutícula juvenil como en relieve 3D al activar el Corte Histológico.",
      },
      {
        id: "immature_abdomen_nymph",
        number: 3,
        name: "Abdomen juvenil corto sin diferenciación genital (sin huevos ni edeago)",
        shortLabel: "Abdomen inmaduro",
        badge: "3 Mudas (N1 → N2 → N3)",
        scale: "Sin gonópodos ni edeago",
        regionCode: 3,
        colorBio: "#10b981",
        colorStain: "#78350f",
        localAnchor: [1.45, 0.08, 0.72],
        labelOffset: [118, 46],
        camGoal: {
          position: [1.6, 2.8, 3.6],
          target: [1.1, 0.0, 0.1],
        },
        defaultTranslucency: 48,
        defaultCutPercent: 0,
        summary:
          "El abdomen ninfal es más corto y redondeado que el del adulto, presenta menor esclerotización paratergal y carece aún de órganos reproductores maduros (sin huevos internos, gonópodos ni edeago).",
        microscopyNote:
          "El ciclo desde la eclosión de la ninfa N1 hasta el adulto reproductor dura entre 8 y 10 días, lo que fundamenta repetir el pediculicida al día 7–10.",
        reconstruction3DNote:
          "Abdomen ovalado juvenil con ápice redondeado simple.",
      },
    ],
  },
};

export interface Pediculus3DViewerProps {
  onClose?: () => void;
}

export const Pediculus3DViewer: React.FC<Pediculus3DViewerProps> = ({ onClose }) => {
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
    goalPos: new THREE.Vector3(...PEDICULUS_STAGES.female_adult.defaultCamera.position),
    goalTarget: new THREE.Vector3(...PEDICULUS_STAGES.female_adult.defaultCamera.target),
  });

  const [activeStage, setActiveStage] = useState<PediculusStageId>("female_adult");
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [shaderMode, setShaderMode] = useState<PediculusShaderMode>(0);
  const [showMarkers, setShowMarkers] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [translucency, setTranslucency] = useState<number>(
    PEDICULUS_STAGES.female_adult.defaultTranslucency
  );
  const [cutPercent, setCutPercent] = useState<number>(
    PEDICULUS_STAGES.female_adult.defaultCutPercent
  );
  const [movePercent, setMovePercent] = useState<number>(45);
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

  const stageMeta = PEDICULUS_STAGES[activeStage];
  const selectedRegion = stageMeta.regions.find((r) => r.id === selectedRegionId) || null;
  const isWarmLightBg = shaderMode === 1;

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
   * Construye la escena 3D según la forma seleccionada de Pediculus humanus capitis
   */
  const buildStage3DScene = useCallback(
    (stageId: PediculusStageId, scene: THREE.Scene) => {
      if (modelRootRef.current) {
        scene.remove(modelRootRef.current);
        disposeGroup(modelRootRef.current);
        modelRootRef.current = null;
      }

      const root = new THREE.Group();
      modelRootRef.current = root;

      if (stageId === "female_adult" || stageId === "male_adult" || stageId === "nymph") {
        const variant =
          stageId === "female_adult" ? "female" : stageId === "male_adult" ? "male" : "nymph";
        const bodyGeo = buildPediculusCompleteGeometry(variant);
        const bodyMat = new THREE.ShaderMaterial({
          vertexShader: PEDICULUS_BODY_VERTEX_SHADER,
          fragmentShader: PEDICULUS_BODY_FRAGMENT_SHADER,
          uniforms: {
            u_time: { value: 0.0 },
            u_moveScale: { value: 0.45 },
            u_translucency: { value: PEDICULUS_STAGES[stageId].defaultTranslucency / 100.0 },
            u_cutPlane: { value: PEDICULUS_STAGES[stageId].defaultCutPercent / 100.0 },
            u_shaderMode: { value: 0 },
            u_highlightRegion: { value: 0 },
          },
          transparent: true,
          side: THREE.DoubleSide,
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.frustumCulled = false;
        bodyMesh.userData = { shaderKind: "body" };
        root.add(bodyMesh);
      } else {
        // --- LIENDRE (HUEVO OPERCULADO ADHERIDO AL TALLO DEL CABELLO HUMANO CON EMBRIÓN 3D INTERNO ARTICULADO) ---
        const makeNitMat = (partId: number, transparent = false, side: THREE.Side = THREE.DoubleSide) =>
          new THREE.ShaderMaterial({
            vertexShader: PEDICULUS_NIT_VERTEX_SHADER,
            fragmentShader: PEDICULUS_NIT_FRAGMENT_SHADER,
            uniforms: {
              u_partId: { value: partId },
              u_shaderMode: { value: 0 },
              u_translucency: { value: 0.44 },
              u_cutZ: { value: 0.05 },
              u_highlight: { value: 0 },
            },
            transparent,
            depthWrite: !transparent,
            side,
          });

        // 1. Tallo cilíndrico del cabello humano con leve curvatura orgánica y escamas imbricadas
        const hairGroup = new THREE.Group();
        hairGroup.rotation.z = 0.28;
        hairGroup.position.set(-0.85, 0.0, 0.0);

        const hairGeo = new THREE.CylinderGeometry(0.24, 0.25, 6.6, 48, 64);
        const hairMesh = new THREE.Mesh(hairGeo, makeNitMat(20, false));
        hairMesh.userData = { shaderKind: "nit", regionCode: 21 };
        hairGroup.add(hairMesh);

        // 2. Cilindro o vaina de cemento quitinoso adhesivo con meniscos ahusados en ambos extremos y anillos de flujo
        const cementGeo = new THREE.CylinderGeometry(0.35, 0.34, 2.55, 48, 48);
        const cemPos = cementGeo.attributes.position;
        for (let i = 0; i < cemPos.count; i++) {
          const cx = cemPos.getX(i);
          const cy = cemPos.getY(i);
          const cz = cemPos.getZ(i);
          const yNorm = cy / 1.275; // -1..+1
          // Menisco ahusado hacia el cabello en los extremos superior e inferior + ondas de secreción
          const meniscus = 1.0 - 0.24 * Math.pow(Math.abs(yNorm), 3.2);
          const ripples = 1.0 + 0.035 * Math.sin(yNorm * Math.PI * 7.0);
          // Engrosamiento unilateral hacia el lado donde se suelda la liendre (+X)
          const unilateral = cx > 0 ? 1.0 + 0.22 * (cx / 0.35) * Math.exp(-Math.pow((yNorm + 0.15) / 0.65, 2.0)) : 1.0;
          cemPos.setXYZ(i, cx * meniscus * ripples * unilateral, cy, cz * meniscus * ripples);
        }
        cementGeo.computeVertexNormals();
        const cementMesh = new THREE.Mesh(cementGeo, makeNitMat(21, true));
        cementMesh.position.set(0.0, -0.55, 0.0);
        cementMesh.userData = { shaderKind: "nit", regionCode: 21 };
        hairGroup.add(cementMesh);

        root.add(hairGroup);

        // 3. Grupo de la Liendre (inclinada oblicuamente ~26° respecto del cabello)
        const nitGroup = new THREE.Group();
        nitGroup.position.set(0.28, 0.18, 0.0);
        nitGroup.rotation.z = -0.32;

        // Cuna / Puente de cemento basal que une el manguito del cabello con el polo basal de la liendre
        const bridgeGeo = new THREE.CylinderGeometry(0.46, 0.30, 0.95, 36, 18);
        const bridgeMesh = new THREE.Mesh(bridgeGeo, makeNitMat(21, true));
        bridgeMesh.position.set(-0.34, -1.12, 0.0);
        bridgeMesh.rotation.z = 0.52;
        bridgeMesh.userData = { shaderKind: "nit", regionCode: 21 };
        nitGroup.add(bridgeMesh);

        // A. Ninfa embrionaria 3D articulada en desarrollo en el interior de la liendre (visible al cortar o dar transparencia)
        // Cápsula cefálica embrionaria con clípeo anterior orientado hacia el opérculo
        const embHeadGeo = new THREE.SphereGeometry(0.35, 32, 26);
        embHeadGeo.scale(0.88, 1.12, 0.84);
        const embHeadMesh = new THREE.Mesh(embHeadGeo, makeNitMat(24, false));
        embHeadMesh.position.set(0.0, 0.64, 0.02);
        embHeadMesh.userData = { shaderKind: "nit", regionCode: 24 };
        embHeadMesh.renderOrder = 1;
        nitGroup.add(embHeadMesh);

        // Tórax y Abdomen embrionario con festones segmentarios esculpidos
        const embBodyGeo = new THREE.SphereGeometry(0.56, 40, 36);
        const ebPos = embBodyGeo.attributes.position;
        for (let i = 0; i < ebPos.count; i++) {
          const ex = ebPos.getX(i);
          const ey = ebPos.getY(i);
          const ez = ebPos.getZ(i);
          const segWave = 1.0 + 0.055 * Math.sin(ey * 16.0);
          ebPos.setXYZ(i, ex * 0.84 * segWave, ey * 1.48, ez * 0.78 * segWave);
        }
        embBodyGeo.computeVertexNormals();
        const embBodyMesh = new THREE.Mesh(embBodyGeo, makeNitMat(24, false));
        embBodyMesh.position.set(0.0, -0.18, 0.0);
        embBodyMesh.userData = { shaderKind: "nit", regionCode: 24 };
        embBodyMesh.renderOrder = 1;
        nitGroup.add(embBodyMesh);

        // Manchas oculares pigmentadas, antenas embrionarias plegadas y 3 pares de patas con garras tarsales plegadas
        for (const side of [-1.0, 1.0]) {
          const eyeGeo = new THREE.SphereGeometry(0.078, 16, 14);
          const eyeMesh = new THREE.Mesh(eyeGeo, makeNitMat(25, false));
          eyeMesh.position.set(side * 0.25, 0.70, 0.22);
          eyeMesh.userData = { shaderKind: "nit", regionCode: 24 };
          eyeMesh.renderOrder = 1;
          nitGroup.add(eyeMesh);

          // Antena embrionaria plegada hacia atrás a los lados de la cabeza
          const antEmbryoCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(side * 0.22, 0.76, 0.24),
            new THREE.Vector3(side * 0.36, 0.62, 0.28),
            new THREE.Vector3(side * 0.38, 0.44, 0.22),
          ]);
          const antEmbryoGeo = new THREE.TubeGeometry(antEmbryoCurve, 12, 0.036, 8, false);
          const antEmbryoMesh = new THREE.Mesh(antEmbryoGeo, makeNitMat(24, false));
          antEmbryoMesh.userData = { shaderKind: "nit", regionCode: 24 };
          antEmbryoMesh.renderOrder = 1;
          nitGroup.add(antEmbryoMesh);

          for (let l = 0; l < 3; l++) {
            const yBase = 0.32 - l * 0.24;
            const legCurve = new THREE.CatmullRomCurve3([
              new THREE.Vector3(side * 0.26, yBase, 0.14),
              new THREE.Vector3(side * 0.46, yBase - 0.10, 0.30),
              new THREE.Vector3(side * 0.28, yBase - 0.24, 0.39),
              new THREE.Vector3(side * 0.12, yBase - 0.28, 0.36),
            ]);
            const legGeo = new THREE.TubeGeometry(legCurve, 16, 0.052, 10, false);
            const legMesh = new THREE.Mesh(legGeo, makeNitMat(24, false));
            legMesh.userData = { shaderKind: "nit", regionCode: 24 };
            legMesh.renderOrder = 1;
            nitGroup.add(legMesh);

            // Garra tarsal embrionaria en el extremo de cada pata plegada
            const clawEmbryoCurve = new THREE.CatmullRomCurve3([
              new THREE.Vector3(side * 0.12, yBase - 0.28, 0.36),
              new THREE.Vector3(side * 0.04, yBase - 0.32, 0.34),
              new THREE.Vector3(side * 0.08, yBase - 0.24, 0.28),
            ]);
            const clawEmbryoGeo = new THREE.TubeGeometry(clawEmbryoCurve, 10, 0.028, 8, false);
            const clawEmbryoMesh = new THREE.Mesh(clawEmbryoGeo, makeNitMat(25, false));
            clawEmbryoMesh.userData = { shaderKind: "nit", regionCode: 24 };
            clawEmbryoMesh.renderOrder = 1;
            nitGroup.add(clawEmbryoMesh);
          }
        }

        // B. Opérculo apical abovedado con aerópilos respiratorios crateriformes en roseta (u_partId == 23)
        const opGeo = new THREE.SphereGeometry(0.56, 42, 28, 0, Math.PI * 2.0, 0, Math.PI * 0.45);
        opGeo.scale(1.0, 0.68, 0.94);
        const opMesh = new THREE.Mesh(opGeo, makeNitMat(23, false));
        opMesh.position.set(0.0, 1.05, 0.0);
        opMesh.userData = { shaderKind: "nit", regionCode: 23 };
        opMesh.renderOrder = 2;
        nitGroup.add(opMesh);

        // Anillo/collar de dehiscencia opercular
        const rimGeo = new THREE.TorusGeometry(0.495, 0.052, 16, 44);
        rimGeo.scale(1.0, 0.94, 1.0);
        const rimMesh = new THREE.Mesh(rimGeo, makeNitMat(23, false));
        rimMesh.position.set(0.0, 1.16, 0.0);
        rimMesh.rotation.x = Math.PI * 0.5;
        rimMesh.userData = { shaderKind: "nit", regionCode: 23 };
        rimMesh.renderOrder = 2;
        nitGroup.add(rimMesh);

        // Roseta de 15 cámaras aeríferas (aerópilos) crateriformes en la cima del opérculo (1 central + 5 internas + 9 externas)
        const aeroCoords: Array<[number, number]> = [[0.0, 0.0]];
        for (let a = 0; a < 5; a++) {
          const ang = (a / 5) * Math.PI * 2.0;
          aeroCoords.push([Math.cos(ang) * 0.14, Math.sin(ang) * 0.14]);
        }
        for (let a = 0; a < 9; a++) {
          const ang = (a / 9) * Math.PI * 2.0 + 0.3;
          aeroCoords.push([Math.cos(ang) * 0.29, Math.sin(ang) * 0.27]);
        }
        aeroCoords.forEach(([ax, az]) => {
          const rDist = Math.hypot(ax, az);
          const aeroGeo = new THREE.TorusGeometry(0.048, 0.021, 10, 18);
          const aeroMesh = new THREE.Mesh(aeroGeo, makeNitMat(23, false));
          aeroMesh.position.set(ax, 1.40 - rDist * rDist * 0.52, az);
          aeroMesh.rotation.x = Math.PI * 0.5;
          aeroMesh.userData = { shaderKind: "nit", regionCode: 23 };
          aeroMesh.renderOrder = 2;
          nitGroup.add(aeroMesh);
        });

        // C. Cápsula ovoide del Corion de la liendre (BackSide + FrontSide para sección 3D limpia con espesor)
        const chorionGeo = new THREE.SphereGeometry(0.76, 64, 52);
        const cPos = chorionGeo.attributes.position;
        for (let i = 0; i < cPos.count; i++) {
          const vx = cPos.getX(i);
          const vy = cPos.getY(i);
          const vz = cPos.getZ(i);
          const taper = vy < 0 ? 1.0 + 0.17 * (vy / 0.76) : 1.0 - 0.12 * Math.pow(vy / 0.76, 2.0);
          const clampedY = Math.min(0.66, vy) * 1.75;
          cPos.setXYZ(i, vx * 0.96 * taper, clampedY, vz * 0.90 * taper);
        }
        chorionGeo.computeVertexNormals();

        const chorionBack = new THREE.Mesh(chorionGeo, makeNitMat(22, true, THREE.BackSide));
        chorionBack.userData = { shaderKind: "nit", regionCode: 22 };
        chorionBack.renderOrder = 3;
        nitGroup.add(chorionBack);

        const chorionFront = new THREE.Mesh(chorionGeo, makeNitMat(22, true, THREE.FrontSide));
        chorionFront.userData = { shaderKind: "nit", regionCode: 22 };
        chorionFront.renderOrder = 4;
        nitGroup.add(chorionFront);

        root.add(nitGroup);
      }

      scene.add(root);
    },
    [disposeGroup]
  );

  const activeStageRef = useRef<PediculusStageId>(activeStage);
  const movePercentRef = useRef<number>(movePercent);

  useEffect(() => {
    activeStageRef.current = activeStage;
  }, [activeStage]);
  useEffect(() => {
    movePercentRef.current = movePercent;
  }, [movePercent]);

  const syncUniforms = useCallback(() => {
    const scene = sceneRef.current;
    const root = modelRootRef.current;
    if (!scene || !root) return;

    // Fondo blanco ligeramente cálido (#faf7f2) en modo Montaje KOH / Lupa (shaderMode === 1)
    scene.background = new THREE.Color(shaderMode === 1 ? 0xfaf7f2 : 0x070b14);

    const currentMeta = PEDICULUS_STAGES[activeStage];
    const activeReg = currentMeta.regions.find((r) => r.id === selectedRegionId) || null;
    const highlightCode = activeReg ? activeReg.regionCode : 0;

    const maxZ = 0.85;
    const isCutting = cutPercent > 0.5;
    const cutZ = isCutting ? maxZ * (1.0 - (cutPercent / 100.0) * 1.95) : maxZ + 2.0;

    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mat = obj.material as THREE.ShaderMaterial;
      const kind = obj.userData?.shaderKind;

      if (kind === "body") {
        mat.uniforms.u_translucency.value = translucency / 100.0;
        mat.uniforms.u_cutPlane.value = cutPercent / 100.0;
        mat.uniforms.u_shaderMode.value = shaderMode;
        mat.uniforms.u_highlightRegion.value = highlightCode;
      } else if (kind === "nit") {
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
        "No se pudo inicializar WebGL en este navegador. Se muestra la alternativa esquemática."
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
    const initCam = PEDICULUS_STAGES.female_adult.defaultCamera;
    camera.position.set(...initCam.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.4;
    controls.maxDistance = 24.0;
    controls.target.set(...initCam.target);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.15;
    controlsRef.current = controls;

    const stopCamTransition = () => {
      camTransitionRef.current.active = false;
    };
    controls.addEventListener("start", stopCamTransition);

    buildStage3DScene("female_adult", scene);

    let lastNow = performance.now();
    let frameCount = 0;

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const dt = Math.min(0.05, (now - lastNow) * 0.001);
      lastNow = now;

      const moveScale = movePercentRef.current / 100.0;
      const stg = activeStageRef.current;
      if (stg !== "nit_egg") {
        simTimeRef.current += dt * (0.2 + 1.2 * moveScale);
        if (modelRootRef.current) {
          modelRootRef.current.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.userData?.shaderKind === "body") {
              const mat = obj.material as THREE.ShaderMaterial;
              mat.uniforms.u_time.value = simTimeRef.current;
              mat.uniforms.u_moveScale.value = moveScale;
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
          const currentStage = PEDICULUS_STAGES[stg];
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
            { anchorX: number; anchorY: number; labelX: number; labelY: number; visible: boolean }
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
      const currentStage = PEDICULUS_STAGES[activeStageRef.current];
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
    if (activeStage === "female_adult") {
      setCutPercent(55);
      setTranslucency(65);
    } else if (activeStage === "male_adult") {
      setCutPercent(42);
      setTranslucency(65);
    } else if (activeStage === "nit_egg") {
      setCutPercent(55);
      setTranslucency(55);
    } else {
      setCutPercent(48);
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
    (newStage: PediculusStageId) => {
      setIsStageDropdownOpen(false);
      if (newStage === activeStage) return;
      const meta = PEDICULUS_STAGES[newStage];
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
    const nextLen = Math.max(1.5, Math.min(22.0, dir.length() * factor));
    cam.position.copy(target).add(dir.normalize().multiplyScalar(nextLen));
    controlsRef.current.update();
  };

  return (
    <div className="space-y-3">
      {/* 1. VISOR 3D PROTAGONISTA */}
      <div
        ref={viewportRef}
        className={`relative w-full h-[58vh] min-h-[430px] max-h-[670px] rounded-2xl overflow-hidden border shadow-2xl select-none transition-colors duration-300 ${
          isWarmLightBg ? "border-amber-300/60 bg-[#faf7f2]" : "border-slate-700/80 bg-[#070b14]"
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
            <p className="text-sm text-amber-300 font-semibold mb-2">{webglError}</p>
            <p className="text-xs text-slate-400 max-w-md">{stageMeta.overviewSummary}</p>
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
                  aria-label="Elegir estadio de Pediculus humanus capitis"
                  className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1.5"
                >
                  <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Formas evolutivas de Pediculus humanus capitis
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsStageDropdownOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(
                    ["female_adult", "male_adult", "nit_egg", "nymph"] as PediculusStageId[]
                  ).map((sId) => {
                    const item = PEDICULUS_STAGES[sId];
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
                ? "Montaje KOH / Bálsamo: fondo blanco cálido (#faf7f2) con exoesqueleto quitinoso ámbar diafanizado."
                : shaderMode === 2
                ? "SEM: simulación topográfica de microscopía electrónica de barrido."
                : shaderMode === 3
                ? "Rayos X / Transiluminación: visualización de huevos intrauterinos, mesenterón hematófago y embrión."
                : "Modo Biológico 3D: cutícula quitinosa translúcida, garras en pinza y órganos internos."}
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
            <span>{mobileControlsOpen ? "Ocultar controles" : "Translucidez y corte"}</span>
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
              <label htmlFor="sliderPediculusTrans" className="text-slate-200 font-bold">
                {stageMeta.translucencyLabel}
              </label>
              <span className="text-cyan-300 font-mono font-bold">{translucency}%</span>
            </div>
            <input
              id="sliderPediculusTrans"
              type="range"
              min={0}
              max={100}
              value={translucency}
              onChange={(e) => setTranslucency(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">{stageMeta.translucencyHint}</p>
          </div>

          {/* Deslizador 2: Corte Histológico / Sección 3D */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="sliderPediculusCut"
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
              id="sliderPediculusCut"
              type="range"
              min={0}
              max={100}
              value={cutPercent}
              onChange={(e) => setCutPercent(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              {activeStage === "female_adult"
                ? "Secciona la cutícula dorsal para ver en el interior los huevos maduros 3D en los oviductos y el mesenterón con sangre."
                : activeStage === "nit_egg"
                ? "Abre el corion de la liendre para exponer en su interior el embrión de ninfa 3D con sus ojos y patas."
                : "Secciona la pared dorsal del exoesqueleto para examinar el mesenterón hematófago y los órganos internos en 3D."}
            </p>
          </div>

          {/* Deslizador 3: Respiración abdominal y movimiento articular */}
          {stageMeta.hasMovement && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="sliderPediculusMove"
                  className="text-slate-200 font-bold flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Respiración y Motilidad</span>
                </label>
                <span className="text-cyan-300 font-mono font-bold">{movePercent}%</span>
              </div>
              <input
                id="sliderPediculusMove"
                type="range"
                min={0}
                max={100}
                value={movePercent}
                onChange={(e) => setMovePercent(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 leading-snug">
                Controla el bombeo respiratorio abdominal y la oscilación de las patas prensiles.
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
                  Claves de <em>Pediculus humanus capitis</em>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className="text-slate-400">Orden / Tipo:</span>
                  <span className="text-cyan-300 font-semibold">Anoplura (sin alas)</span>
                  <span className="text-slate-400">Hembra vs Macho:</span>
                  <span className="text-amber-300 font-semibold">Bífida (♀) / Edeago (♂)</span>
                  <span className="text-slate-400">Liendre viable:</span>
                  <span className="text-slate-200">&lt;6 mm de raíz pilosa</span>
                  <span className="text-slate-400">Vector de tifus:</span>
                  <span className="text-emerald-300 font-semibold">No (solo P. h. corporis)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Referencias documentales */}
        <div className="pt-2 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
          <div>
            <strong className="text-slate-300">Fuentes de referencia:</strong> CDC DPDx Pediculosis (
            <a
              href="https://www.cdc.gov/dpdx/pediculosis/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              cdc.gov/dpdx/pediculosis
            </a>
            ) · Guías Clínicas MINSAL / ISP Chile.
          </div>
          <div>
            Hembra grávida (huevos 3D) · Macho (edeago) · Liendre en cabello · Ninfa
          </div>
        </div>
      </div>
    </div>
  );
};
