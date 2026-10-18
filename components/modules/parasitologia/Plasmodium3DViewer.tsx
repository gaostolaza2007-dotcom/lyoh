"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Scissors,
  Sliders,
  Info,
  X,
  Play,
  Pause,
  Lock,
  Unlock,
  AlertTriangle,
  Check,
  Microscope,
  Focus,
  Maximize2,
} from "lucide-react";

export type PlasmodiumFormId = "ring" | "gametocyte";
export type VisualAppearanceMode = "schematic" | "giemsa";

export interface PlasmodiumStructure {
  id: string;
  name: string;
  shortLabel: string;
  category: "hospedador" | "parasito";
  categoryLabel: string;
  anchor3D: [number, number, number];
  /** Desplazamiento en píxeles (dx, dy) desde el ancla 3D proyectada hasta la etiqueta, unida por línea guía */
  labelOffset: [number, number];
  cameraGoal: {
    position: [number, number, number];
    target: [number, number, number];
  };
  summary: string;
  microscopyNote: string;
  reconstruction3DNote: string;
  colorSchematic: string;
  colorGiemsa: string;
}

export interface PlasmodiumFormMetadata {
  id: PlasmodiumFormId;
  name: string;
  shortName: string;
  subtitle: string;
  dimensionsNote: string;
  overviewSummary: string;
  microscopyComparison: string;
  erythrocyteControlLabel: string;
  erythrocyteControlHint: string;
  defaultErythrocyteTransparency: number;
  defaultCamera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  focusParasiteCamera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  structures: PlasmodiumStructure[];
}

const PLASMODIUM_FORMS: Record<PlasmodiumFormId, PlasmodiumFormMetadata> = {
  ring: {
    id: "ring",
    name: "Trofozoíto en anillo dentro de un eritrocito",
    shortName: "Trofozoíto en anillo",
    subtitle: "Fase asexual intraeritrocitaria temprana en glóbulo rojo normocítico (~7.5 µm)",
    dimensionsNote: "Eritrocito: ~7.5 µm · Anillo intracelular: ~1.85 µm (~1/4 del diámetro celular)",
    overviewSummary:
      "En Plasmodium falciparum, el trofozoíto joven se aloja íntegramente dentro del estroma de un eritrocito de tamaño normal. Presenta un citoplasma anular sumamente fino y delicado con variación suave de espesor alrededor de una zona vacuolar, y uno o dos puntos de cromatina nuclear integrados en su margen.",
    microscopyComparison:
      "En un frotis fino teñido con Giemsa (CDC DPDx), el parásito se observa en proyección 2D como un anillo azul celeste fino con 1 o 2 puntos de cromatina rojo-púrpura (configuración en «auriculares»). Esta reconstrucción 3D educativa muestra su disposición volumétrica intracelular dentro del disco bicóncavo.",
    erythrocyteControlLabel: "Transparencia del eritrocito",
    erythrocyteControlHint: "Regula la atenuación óptica del eritrocito hospedador para inspeccionar el parásito interior",
    defaultErythrocyteTransparency: 54,
    defaultCamera: {
      position: [0.25, 4.35, 6.15],
      target: [0.15, 0.0, 0.0],
    },
    focusParasiteCamera: {
      position: [1.12, 2.05, 2.55],
      target: [0.95, 0.02, 0.0],
    },
    structures: [
      {
        id: "eritrocito",
        name: "Eritrocito hospedador bicóncavo",
        shortLabel: "Eritrocito bicóncavo",
        category: "hospedador",
        categoryLabel: "Célula hospedadora humana",
        anchor3D: [-2.15, 0.38, 0.65],
        labelOffset: [-88, -48],
        cameraGoal: {
          position: [-1.4, 4.4, 6.2],
          target: [0.0, 0.0, 0.0],
        },
        summary:
          "Glóbulo rojo humano maduro con geometría de disco bicóncavo (~7.5 µm de diámetro, ~2.1 µm de espesor en el reborde periférico y ~0.86 µm en la depresión central). En las infecciones por P. falciparum, el eritrocito conserva su tamaño normal (normocítico).",
        microscopyNote:
          "En frotis sanguíneo fino teñido con Giemsa se aprecia como un disco rosado-salmón pálido con una zona central más clara correspondiente a su menor espesor bicóncavo.",
        reconstruction3DNote:
          "Modelado con perfil bicóncavo continuo y atenuación óptica dependiente del espesor para apreciar tanto su depresión central como la posición intracelular del trofozoíto.",
        colorSchematic: "#d94848",
        colorGiemsa: "#d99aa8",
      },
      {
        id: "cromatina_anillo",
        name: "Cromatina nuclear (1 o 2 puntos)",
        shortLabel: "Cromatina nuclear",
        category: "parasito",
        categoryLabel: "Parásito · Núcleo",
        anchor3D: [0.34, 0.09, 0.36],
        labelOffset: [-64, 58],
        cameraGoal: {
          position: [0.55, 1.75, 2.25],
          target: [0.55, 0.04, 0.05],
        },
        summary:
          "Condensaciones lenticulares/ovoides de cromatina nuclear integradas en el sector más fino del anillo citoplasmático. La presencia de dos puntos de cromatina (configuración en «auriculares» o headphone form) es frecuente en P. falciparum según CDC DPDx.",
        microscopyNote:
          "Con tinción de Giemsa destacan nítidamente como uno o dos corpúsculos compactos de color rojo rubí o púrpura-magenta intenso.",
        reconstruction3DNote:
          "Reconstruidos como cuerpos nucleares ovoides suavemente ahusados y asentados en el lecho perinuclear del filamento citoplasmático.",
        colorSchematic: "#cf2952",
        colorGiemsa: "#8f1545",
      },
      {
        id: "citoplasma_anillo",
        name: "Citoplasma anular delicado",
        shortLabel: "Citoplasma delicado",
        category: "parasito",
        categoryLabel: "Parásito · Citoplasma",
        anchor3D: [1.72, 0.04, 0.22],
        labelOffset: [78, 44],
        cameraGoal: {
          position: [1.45, 1.95, 2.45],
          target: [1.02, 0.0, 0.0],
        },
        summary:
          "Cuerpo citoplasmático intracelular delicado (~1.85 µm de diámetro exterior, equivalente a ~1/4 del eritrocito) con variación suave de espesor: forma una media luna citoplasmática esbelta en su arco metabólico y se adelgaza en un filamento fino hacia los puntos de cromatina.",
        microscopyNote:
          "En Giemsa se tiñe de azul celeste basófilo suave. Su trazo fino y delicado ayuda a diferenciar P. falciparum de los anillos más gruesos e irregulares de P. vivax.",
        reconstruction3DNote:
          "Construido como un volumen continuo asimétrico que envuelve parcialmente la depresión vacuolar, evitando la geometría artificial de un toro uniforme.",
        colorSchematic: "#3898d4",
        colorGiemsa: "#3b73c4",
      },
      {
        id: "vacuola",
        name: "Zona vacuolar intracelular",
        shortLabel: "Zona vacuolar",
        category: "parasito",
        categoryLabel: "Parásito · Vacuola",
        anchor3D: [1.02, 0.08, -0.18],
        labelOffset: [72, -52],
        cameraGoal: {
          position: [1.15, 2.0, 2.35],
          target: [1.0, 0.0, 0.0],
        },
        summary:
          "Región central translúcida delimitada por el anillo citoplasmático del trofozoíto joven en el interior de la vacuola parasitófora.",
        microscopyNote:
          "En microscopía óptica se visualiza como el espacio claro central que confiere al trofozoíto joven su característica apariencia anular.",
        reconstruction3DNote:
          "Representada como una cavidad lenticular translúcida con menisco suave, explorable tanto en vista oblicua como mediante el plano de corte geométrico.",
        colorSchematic: "#93c5fd",
        colorGiemsa: "#d8cbd2",
      },
    ],
  },
  gametocyte: {
    id: "gametocyte",
    name: "Gametocito maduro con forma de media luna",
    shortName: "Gametocito maduro",
    subtitle: "Fase sexual eritrocitaria madura (estadio V) con morfología falciforme (~9.5–11 µm)",
    dimensionsNote: "Longitud: ~9.8 µm · Ancho central: ~2.5 µm",
    overviewSummary:
      "Los gametocitos maduros de Plasmodium falciparum presentan una forma característica de media luna, banana o salchicha. Poseen extremos redondeados-ahusados, cromatina nuclear central y gránulos oscuros de pigmento malárico (hemozoína) agrupados alrededor del núcleo.",
    microscopyComparison:
      "En frotis teñido con Giemsa (CDC DPDx), el gametocito distiende por completo al eritrocito hospedador, persistiendo a menudo un fino remanente membranoso en el lado cóncavo (velo de Laveran).",
    erythrocyteControlLabel: "Membrana eritrocitaria (velo de Laveran)",
    erythrocyteControlHint: "Ajusta la visibilidad del remanente de la célula hospedadora que envuelve al gametocito",
    defaultErythrocyteTransparency: 45,
    defaultCamera: {
      position: [0.0, 1.35, 8.8],
      target: [0.0, 0.2, 0.0],
    },
    focusParasiteCamera: {
      position: [0.0, 0.85, 5.2],
      target: [0.0, 0.45, 0.0],
    },
    structures: [
      {
        id: "cuerpo_gametocito",
        name: "Cuerpo del gametocito en media luna",
        shortLabel: "Cuerpo en media luna",
        category: "parasito",
        categoryLabel: "Parásito · P. falciparum",
        anchor3D: [-2.35, 0.12, 0.45],
        labelOffset: [-75, -45],
        cameraGoal: {
          position: [-1.5, 1.4, 7.2],
          target: [-0.4, 0.2, 0.0],
        },
        summary:
          "Cuerpo celular alargado y curvado (~9.8 µm de longitud) con polos redondeados-obtusos, sustentado por su complejo membranoso subpelicular.",
        microscopyNote:
          "En Giemsa el citoplasma se observa azul celeste más intenso en macrogametocitos y más pálido o violáceo suave en microgametocitos.",
        reconstruction3DNote:
          "Huso tridimensional curvado independiente con sombreado orgánico suave.",
        colorSchematic: "#3898d4",
        colorGiemsa: "#3b73c4",
      },
      {
        id: "cromatina_gametocito",
        name: "Cromatina nuclear central",
        shortLabel: "Cromatina central",
        category: "parasito",
        categoryLabel: "Parásito · Núcleo",
        anchor3D: [0.0, 0.82, 0.3],
        labelOffset: [-45, -52],
        cameraGoal: {
          position: [0.2, 1.2, 4.8],
          target: [0.0, 0.65, 0.0],
        },
        summary:
          "Masa única de cromatina nuclear ubicada en la región central del gametocito.",
        microscopyNote:
          "En Giemsa aparece como una masa roja-púrpura compacta en macrogametocitos o más difusa en microgametocitos.",
        reconstruction3DNote:
          "Núcleo central elipsoidal rodeado por los gránulos de pigmento malárico.",
        colorSchematic: "#cf2952",
        colorGiemsa: "#8f1545",
      },
      {
        id: "pigmento_hemozoina",
        name: "Pigmento malárico (hemozoína)",
        shortLabel: "Pigmento (hemozoína)",
        category: "parasito",
        categoryLabel: "Parásito · Pigmento",
        anchor3D: [0.95, 0.62, 0.35],
        labelOffset: [72, -38],
        cameraGoal: {
          position: [0.9, 1.1, 4.6],
          target: [0.35, 0.6, 0.0],
        },
        summary:
          "Gránulos oscuros de hemozoína originados por la digestión de la hemoglobina y agrupados alrededor de la cromatina nuclear.",
        microscopyNote:
          "En Giemsa se distinguen como gránulos pardo-negruzcos u ocre oscuro concentrados en la zona central.",
        reconstruction3DNote:
          "Corpúsculos alargados distribuidos tridimensionalmente en el espacio perinuclear.",
        colorSchematic: "#b45309",
        colorGiemsa: "#3d2616",
      },
      {
        id: "velo_laveran",
        name: "Remanente eritrocitario (velo de Laveran)",
        shortLabel: "Velo de Laveran",
        category: "hospedador",
        categoryLabel: "Célula hospedadora residual",
        anchor3D: [0.0, -0.45, 0.15],
        labelOffset: [25, 52],
        cameraGoal: {
          position: [0.2, -0.4, 6.4],
          target: [0.0, -0.1, 0.0],
        },
        summary:
          "Membrana distendida del eritrocito hospedador que recubre al gametocito y forma un pliegue translúcido en su concavidad (Laveran's bib).",
        microscopyNote:
          "En frotis teñidos con Giemsa puede observarse como un fino puente rosado pálido tendido entre los polos de la media luna.",
        reconstruction3DNote:
          "Envoltura membranosa translúcida regulable mediante el deslizador de transparencia.",
        colorSchematic: "#d94848",
        colorGiemsa: "#d99aa8",
      },
    ],
  },
};

// ============================================================================
// GEOMETRÍA ORGÁNICA TRIDIMENSIONAL Y SHADERS PERSONALIZADOS
// Escala: 1 unidad 3D = 1 micrómetro (µm)
// ============================================================================

const RBC_RADIUS = 3.75; // Diámetro = 7.50 µm (normocito)
const RING_CENTER_X = 1.0;
const RING_CENTER_Z = 0.0;
const RING_TILT_Z = -0.09; // Suave inclinación (5°) que acompaña la concavidad interna del estroma

/**
 * Construye la malla 3D del eritrocito bicóncavo sin ruido artificial,
 * almacenando en UV.x la coordenada radial normalizada rho = r / R
 * y en UV.y el factor de espesor local para el sombreado óptico subsuperficial.
 */
function buildBiconcaveRBCGeometry(radialSegs = 80, angularSegs = 128): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const evalSurface = (psi: number, theta: number) => {
    const sinPsi = Math.sin(psi);
    const cosPsi = Math.cos(psi);
    const rho = Math.abs(cosPsi);
    const signY = sinPsi >= 0 ? 1.0 : -1.0;

    const r = rho * RBC_RADIUS;
    const r2 = rho * rho;
    const r4 = r2 * r2;
    // Perfil bicóncavo clásico de Evans-Fung (~0.86 µm en el centro, ~2.12 µm en el reborde)
    const poly = 0.23 + 2.04 * r2 - 1.15 * r4;
    const halfH = 0.5 * RBC_RADIUS * Math.abs(sinPsi) * poly;
    const y = signY * halfH;

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    return { pos: new THREE.Vector3(x, y, z), rho, halfH };
  };

  for (let i = 0; i <= radialSegs; i++) {
    const psi = -Math.PI * 0.5 + (i / radialSegs) * Math.PI;
    const sinPsi = Math.sin(psi);
    const signY = sinPsi >= 0 ? 1.0 : -1.0;

    for (let j = 0; j <= angularSegs; j++) {
      const theta = (j / angularSegs) * Math.PI * 2.0;
      const { pos, rho, halfH } = evalSurface(psi, theta);
      positions.push(pos.x, pos.y, pos.z);
      uvs.push(rho, halfH);

      const eps = 0.012;
      const psiNext = Math.min(Math.PI * 0.5, psi + eps);
      const psiPrev = Math.max(-Math.PI * 0.5, psi - eps);
      const dPsi = evalSurface(psiNext, theta).pos.sub(evalSurface(psiPrev, theta).pos);
      const dTheta = evalSurface(psi, theta + eps).pos.sub(evalSurface(psi, theta - eps).pos);
      const n = new THREE.Vector3().crossVectors(dTheta, dPsi).normalize();
      if (Math.abs(sinPsi) > 0.9992) {
        n.set(0, signY, 0);
      }
      normals.push(n.x, n.y, n.z);
    }
  }

  const stride = angularSegs + 1;
  for (let i = 0; i < radialSegs; i++) {
    for (let j = 0; j < angularSegs; j++) {
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
 * Evalúa la línea media y sección transversal orgánica del citoplasma en anillo.
 * - Contorno ovoide suave (~1.85 µm de diámetro total, ~1/4 del eritrocito).
 * - Variación continua de espesor: media luna citoplasmática suave en u = 0
 *   que se adelgaza hasta un filamento delicado en u = +-pi (zona cromatínica),
 *   con cuna perinuclear donde se asienta la cromatina y labio cupuliforme interno.
 */
function evalRingCytoplasmPoint(u: number, v: number): { pos: THREE.Vector3; uvMeta: [number, number] } {
  const cosU = Math.cos(u);
  const sinU = Math.sin(u);
  const cosV = Math.cos(v);
  const sinV = Math.sin(v);

  // Radio medio suavemente ovoide (no un círculo mecánico rígido)
  const midR = 0.72 * (1.0 + 0.065 * cosU - 0.03 * Math.cos(2.0 * u));

  // Variación orgánica de espesor:
  // En u = 0 (arco citoplasmático principal): ancho ~0.21 µm
  // En u = pi (arco fino donde reside la cromatina): filamento delicado ~0.068 µm
  const crescentFactor = Math.pow(0.5 * (1.0 + cosU), 1.35);
  let widthR = 0.068 + 0.145 * crescentFactor;
  let heightY = 0.058 + 0.088 * crescentFactor;

  // Suave ensanchamiento de transición (cuna perinuclear) bajo los dos corpúsculos de cromatina
  const dU1 = Math.atan2(Math.sin(u - 2.52), Math.cos(u - 2.52));
  const dU2 = Math.atan2(Math.sin(u + 2.42), Math.cos(u + 2.42));
  const cradle1 = Math.exp(-(dU1 * dU1) / 0.09);
  const cradle2 = Math.exp(-(dU2 * dU2) / 0.075);
  widthR += 0.038 * cradle1 + 0.028 * cradle2;
  heightY += 0.022 * cradle1 + 0.016 * cradle2;

  // Sección transversal cupuliforme: el borde interior (cosV < 0) se extiende suavemente
  // formando el menisco/piso cóncavo que abraza la zona vacuolar
  const innerLip = cosV < 0.0 ? Math.pow(-cosV, 1.4) * 0.045 : 0.0;
  const localRad = midR + widthR * cosV - innerLip;
  const cupDrop = cosV < 0.0 ? -0.022 * (-cosV) * (0.4 + 0.6 * crescentFactor) : 0.0;

  const lx = localRad * cosU;
  const lz = localRad * sinU;
  const ly = heightY * sinV + cupDrop;

  // Aplicar suave inclinación intracelular para acompañar el perfil del eritrocito
  const cT = Math.cos(RING_TILT_Z);
  const sT = Math.sin(RING_TILT_Z);
  const wx = RING_CENTER_X + lx * cT - ly * sT;
  const wy = lx * sT + ly * cT;
  const wz = RING_CENTER_Z + lz;

  return {
    pos: new THREE.Vector3(wx, wy, wz),
    uvMeta: [crescentFactor, 0.5 * (cosV + 1.0)],
  };
}

function buildOrganicRingCytoplasmGeometry(uSegs = 112, vSegs = 48): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= uSegs; i++) {
    const u = (i / uSegs) * Math.PI * 2.0;
    for (let j = 0; j <= vSegs; j++) {
      const v = (j / vSegs) * Math.PI * 2.0;
      const { pos, uvMeta } = evalRingCytoplasmPoint(u, v);
      positions.push(pos.x, pos.y, pos.z);
      uvs.push(uvMeta[0], uvMeta[1]);

      const eps = 0.015;
      const dU = evalRingCytoplasmPoint(u + eps, v).pos.sub(evalRingCytoplasmPoint(u - eps, v).pos);
      const dV = evalRingCytoplasmPoint(u, v + eps).pos.sub(evalRingCytoplasmPoint(u, v - eps).pos);
      const n = new THREE.Vector3().crossVectors(dV, dU).normalize();
      normals.push(n.x, n.y, n.z);
    }
  }

  const stride = vSegs + 1;
  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
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
 * Construye un corpúsculo de cromatina nuclear lenticular/ovoide curvado a lo largo
 * del arco fino del anillo, evitando por completo el aspecto de «esfera pegada».
 */
function buildCurvedChromatinBodyGeometry(
  centerAngleU: number,
  arcHalfSpan: number,
  radialHalfThickness: number,
  verticalHalfThickness: number,
  uSegs = 40,
  vSegs = 32
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const evalChromPoint = (tLat: number, phi: number): THREE.Vector3 => {
    // tLat en [-pi/2, pi/2] a lo largo del arco del anillo
    const sinLat = Math.sin(tLat);
    const cosLat = Math.cos(tLat);
    // Ahusamiento suave en los extremos donde se integra con el filamento citoplasmático
    const env = Math.pow(Math.max(0.0, cosLat), 0.85);

    const u = centerAngleU + sinLat * arcHalfSpan;
    const midR = 0.72 * (1.0 + 0.065 * Math.cos(u) - 0.03 * Math.cos(2.0 * u));

    const rLocal = midR + radialHalfThickness * env * Math.cos(phi);
    const yLocal = 0.018 + verticalHalfThickness * env * Math.sin(phi);

    const lx = rLocal * Math.cos(u);
    const lz = rLocal * Math.sin(u);
    const ly = yLocal;

    const cT = Math.cos(RING_TILT_Z);
    const sT = Math.sin(RING_TILT_Z);
    return new THREE.Vector3(
      RING_CENTER_X + lx * cT - ly * sT,
      lx * sT + ly * cT,
      RING_CENTER_Z + lz
    );
  };

  for (let i = 0; i <= uSegs; i++) {
    const tLat = -Math.PI * 0.5 + (i / uSegs) * Math.PI;
    const cosLat = Math.cos(tLat);
    for (let j = 0; j <= vSegs; j++) {
      const phi = (j / vSegs) * Math.PI * 2.0;
      const p = evalChromPoint(tLat, phi);
      positions.push(p.x, p.y, p.z);
      uvs.push(cosLat, 0.5 * (Math.sin(phi) + 1.0));

      const eps = 0.018;
      const tNext = Math.min(Math.PI * 0.499, tLat + eps);
      const tPrev = Math.max(-Math.PI * 0.499, tLat - eps);
      const dT = evalChromPoint(tNext, phi).sub(evalChromPoint(tPrev, phi));
      const dP = evalChromPoint(tLat, phi + eps).sub(evalChromPoint(tLat, phi - eps));
      const n = new THREE.Vector3().crossVectors(dP, dT).normalize();
      normals.push(n.x, n.y, n.z);
    }
  }

  const stride = vSegs + 1;
  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
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
 * Construye la zona vacuolar intracelular con forma lenticular-cóncava suave
 * encajada exactamente en el lumen del anillo citoplasmático.
 */
function buildVacuoleLensGeometry(radialSegs = 36, angularSegs = 64): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const evalVacPoint = (psi: number, u: number) => {
    const sinPsi = Math.sin(psi);
    const cosPsi = Math.cos(psi);
    const rho = Math.abs(cosPsi);
    const signY = sinPsi >= 0 ? 1.0 : -1.0;

    const maxR = 0.65 * (1.0 + 0.055 * Math.cos(u) - 0.025 * Math.cos(2.0 * u));
    const r = rho * maxR;
    // Perfil meniscal: suavemente deprimido en el centro y acoplado al borde interno del anillo
    const halfH = 0.075 * Math.abs(sinPsi) * (0.65 + 0.55 * rho * rho);

    const lx = r * Math.cos(u);
    const lz = r * Math.sin(u);
    const ly = signY * halfH;

    const cT = Math.cos(RING_TILT_Z);
    const sT = Math.sin(RING_TILT_Z);
    return {
      pos: new THREE.Vector3(
        RING_CENTER_X + lx * cT - ly * sT,
        lx * sT + ly * cT,
        RING_CENTER_Z + lz
      ),
      rho,
    };
  };

  for (let i = 0; i <= radialSegs; i++) {
    const psi = -Math.PI * 0.5 + (i / radialSegs) * Math.PI;
    const sinPsi = Math.sin(psi);
    const signY = sinPsi >= 0 ? 1.0 : -1.0;

    for (let j = 0; j <= angularSegs; j++) {
      const u = (j / angularSegs) * Math.PI * 2.0;
      const { pos, rho } = evalVacPoint(psi, u);
      positions.push(pos.x, pos.y, pos.z);
      uvs.push(rho, 0.5 * (sinPsi + 1.0));

      const eps = 0.02;
      const pNext = Math.min(Math.PI * 0.5, psi + eps);
      const pPrev = Math.max(-Math.PI * 0.5, psi - eps);
      const dPsi = evalVacPoint(pNext, u).pos.sub(evalVacPoint(pPrev, u).pos);
      const dU = evalVacPoint(psi, u + eps).pos.sub(evalVacPoint(psi, u - eps).pos);
      const n = new THREE.Vector3().crossVectors(dU, dPsi).normalize();
      if (Math.abs(sinPsi) > 0.999) n.set(0, signY, 0);
      normals.push(n.x, n.y, n.z);
    }
  }

  const stride = angularSegs + 1;
  for (let i = 0; i < radialSegs; i++) {
    for (let j = 0; j < angularSegs; j++) {
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
 * Geometrías existentes para la segunda forma (Gametocito maduro en media luna)
 */
function evalGametocyteSpineAndRadius(s: number) {
  const clamped = Math.max(-1.0, Math.min(1.0, s));
  const u = (clamped + 1.0) * 0.5;
  const sinPiU = Math.sin(Math.PI * u);
  const rBase = 1.24 * Math.pow(Math.max(0.0, sinPiU), 0.62);
  const spineY = 1.18 * (1.0 - clamped * clamped) - 0.42;
  return { spineY, rx: 4.35, ry: rBase, rz: rBase * 0.88 };
}

function buildCrescentGametocyteGeometry(lengthSegs = 96, radialSegs = 48): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const evalPoint = (uNorm: number, phi: number): THREE.Vector3 => {
    const s = uNorm * 2.0 - 1.0;
    const x = s * 4.35;
    const { spineY, ry, rz } = evalGametocyteSpineAndRadius(s);
    const y = spineY + ry * Math.sin(phi);
    const z = rz * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  for (let i = 0; i <= lengthSegs; i++) {
    const t = i / lengthSegs;
    const uNorm = 0.5 * (1.0 - Math.cos(Math.PI * t));
    for (let j = 0; j <= radialSegs; j++) {
      const phi = (j / radialSegs) * Math.PI * 2.0;
      const p = evalPoint(uNorm, phi);
      positions.push(p.x, p.y, p.z);
      uvs.push(uNorm, 0.5 * (Math.sin(phi) + 1.0));

      const uNext = Math.min(0.9995, uNorm + 0.008);
      const uPrev = Math.max(0.0005, uNorm - 0.008);
      const dU = evalPoint(uNext, phi).sub(evalPoint(uPrev, phi));
      const dPhi = evalPoint(uNorm, phi + 0.025).sub(evalPoint(uNorm, phi - 0.025));
      const n = new THREE.Vector3().crossVectors(dPhi, dU).normalize();
      if (i === 0) n.set(-1, 0, 0);
      if (i === lengthSegs) n.set(1, 0, 0);
      normals.push(n.x, n.y, n.z);
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < lengthSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
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

function buildLaveransBibGeometry(lengthSegs = 84, radialSegs = 44): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const evalBibPoint = (uNorm: number, phi: number): THREE.Vector3 => {
    const s = uNorm * 2.0 - 1.0;
    const x = s * 4.46;
    const { spineY, ry, rz } = evalGametocyteSpineAndRadius(s);
    const envRy = ry * 1.06 + 0.03;
    const envRz = rz * 1.06 + 0.03;

    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const archMask = Math.max(0.0, 1.0 - Math.pow(s / 0.86, 2.0));
    const ventralPull = sinPhi < 0.0 ? Math.pow(-sinPhi, 1.35) * archMask : 0.0;

    const baseRimY = spineY + envRy * sinPhi;
    const chordY = -0.68 - 0.36 * archMask;
    const y = baseRimY * (1.0 - 0.68 * ventralPull) + chordY * (0.68 * ventralPull);
    const zThinning = 1.0 - 0.62 * ventralPull;
    const z = envRz * cosPhi * zThinning;

    return new THREE.Vector3(x, y, z);
  };

  for (let i = 0; i <= lengthSegs; i++) {
    const t = i / lengthSegs;
    const uNorm = 0.5 * (1.0 - Math.cos(Math.PI * t));
    for (let j = 0; j <= radialSegs; j++) {
      const phi = (j / radialSegs) * Math.PI * 2.0;
      const p = evalBibPoint(uNorm, phi);
      positions.push(p.x, p.y, p.z);
      uvs.push(Math.abs(uNorm * 2.0 - 1.0), 0.5);

      const uNext = Math.min(0.999, uNorm + 0.009);
      const uPrev = Math.max(0.001, uNorm - 0.009);
      const dU = evalBibPoint(uNext, phi).sub(evalBibPoint(uPrev, phi));
      const dPhi = evalBibPoint(uNorm, phi + 0.025).sub(evalBibPoint(uNorm, phi - 0.025));
      const n = new THREE.Vector3().crossVectors(dPhi, dU).normalize();
      if (i === 0) n.set(-1, 0, 0);
      if (i === lengthSegs) n.set(1, 0, 0);
      normals.push(n.x, n.y, n.z);
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < lengthSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
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

// ============================================================================
// SHADERS ORGÁNICOS CON DISPERSIÓN SUBSUPERFICIAL, VOLUMEN Y CORTE GEOMÉTRICO
// (Inspirados en el acabado volumétrico de la referencia localhost:8080)
// ============================================================================

const ORGANIC_VERTEX_SHADER = `
  varying vec3 v_worldPos;
  varying vec3 v_worldNormal;
  varying vec2 v_uv;

  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    v_worldPos = wp.xyz;
    v_worldNormal = normalize(mat3(modelMatrix) * normal);
    v_uv = uv;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

/**
 * Shader del Eritrocito bicóncavo (y velo de Laveran):
 * - En Esquemático 3D: rojo hemoglobina orgánico con iluminación envolvente (wrap),
 *   dispersión subsuperficial cálida y mayor densidad óptica en el reborde bicóncavo.
 * - En Simulación de Giemsa: coloración eosinofílica rosado-salmón suave de frotis fino
 *   con palidez central fisiológica en la depresión bicóncava (rho < 0.45).
 */
const RBC_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;
  varying vec3 v_worldNormal;
  varying vec2 v_uv;

  uniform int u_visualMode;     // 0 = Esquemático 3D, 1 = Simulación de Giemsa
  uniform float u_baseOpacity;  // Controlado por el deslizador de transparencia
  uniform float u_cutZ;         // Coordenada Z del plano de corte
  uniform int u_highlight;      // 1 = seleccionado, -1 = atenuado, 0 = normal

  void main() {
    if (v_worldPos.z > u_cutZ) discard;

    vec3 N = normalize(v_worldNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - v_worldPos);

    vec3 L1 = normalize(vec3(0.42, 0.78, 0.52));
    vec3 L2 = normalize(vec3(-0.65, -0.28, 0.55));
    vec3 H1 = normalize(L1 + V);

    float diff1 = max(0.0, dot(N, L1));
    float wrap1 = max(0.0, (dot(N, L1) + 0.55) / 1.55);
    float diff2 = max(0.0, dot(N, L2));
    float ndotv = max(0.0, dot(N, V));
    float fresnel = pow(1.0 - ndotv, 2.4);
    // Brillo satinado orgánico muy suave (nunca plástico)
    float sheen = pow(max(0.0, dot(N, H1)), 18.0) * 0.12;

    float rho = clamp(v_uv.x, 0.0, 1.0);
    // Factor de espesor bicóncavo: menor en la depresión central (rho ~ 0), máximo en el reborde (rho ~ 0.7)
    float rimThickness = smoothstep(0.12, 0.68, rho);
    // Sombreado de profundidad suave en la concavidad central para leer el volumen 3D
    float dimpleOcclusion = 0.84 + 0.16 * smoothstep(0.0, 0.52, rho);

    vec3 color = vec3(0.0);
    float alpha = 1.0;

    if (u_visualMode == 0) {
      // MODO 1: ESQUEMÁTICO 3D (Volumen orgánico de hemoglobina sin tonos neón ni brillo plástico)
      vec3 colCenter = vec3(0.84, 0.25, 0.27);
      vec3 colRim    = vec3(0.68, 0.12, 0.16);
      vec3 sssWarm   = vec3(0.94, 0.38, 0.34);

      vec3 baseCol = mix(colCenter, colRim, rimThickness * 0.75);
      vec3 lit = baseCol * (0.28 + 0.58 * wrap1 + 0.20 * diff2) * dimpleOcclusion;
      lit += sssWarm * (0.24 * wrap1 * (1.0 - diff1 * 0.45));
      lit += vec3(0.95, 0.55, 0.52) * fresnel * 0.32;
      lit += vec3(1.0, 0.92, 0.90) * sheen;
      color = lit;

      // Transparencia controlada: el centro bicóncavo donde se aloja el anillo es más diáfano,
      // mientras que el reborde periférico conserva definición volumétrica
      float opticalPath = 0.36 + 0.64 * rimThickness + 0.42 * fresnel;
      alpha = clamp(u_baseOpacity * opticalPath, 0.05, 0.95);
    } else {
      // MODO 2: SIMULACIÓN DE GIEMSA (Coloración eosinofílica rosado-salmón con palidez central)
      vec3 giemsaCenter = vec3(0.93, 0.81, 0.84);
      vec3 giemsaRim    = vec3(0.83, 0.57, 0.64);
      vec3 giemsaEdge   = vec3(0.70, 0.42, 0.50);

      vec3 baseGiemsa = mix(giemsaCenter, giemsaRim, smoothstep(0.18, 0.68, rho));
      baseGiemsa = mix(baseGiemsa, giemsaEdge, fresnel * 0.55);

      vec3 lit = baseGiemsa * (0.52 + 0.40 * wrap1 + 0.14 * diff2) * dimpleOcclusion;
      lit += vec3(0.98, 0.92, 0.94) * sheen * 0.7;
      color = lit;

      float opticalPath = 0.32 + 0.68 * rimThickness + 0.38 * fresnel;
      alpha = clamp(u_baseOpacity * opticalPath, 0.05, 0.95);
    }

    if (u_highlight == 1) {
      color += vec3(0.16, 0.06, 0.08) * (0.4 + 0.6 * fresnel);
      alpha = max(alpha, 0.48);
    }

    // Tone mapping suave
    color = color / (1.0 + color * 0.14);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Shader orgánico para las estructuras del parásito (Citoplasma anular, Cromatina nuclear,
 * Zona vacuolar y estructuras del Gametocito):
 * - Materiales mates-orgánicos con volumen profundo y clara separación visual entre estructuras.
 */
const PARASITE_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;
  varying vec3 v_worldNormal;
  varying vec2 v_uv;

  uniform int u_partType;      // 1 = citoplasma, 2 = cromatina, 3 = vacuola, 4 = pigmento
  uniform int u_visualMode;    // 0 = Esquemático 3D, 1 = Simulación de Giemsa
  uniform float u_cutZ;        // Coordenada Z del plano de corte
  uniform int u_highlight;     // 1 = seleccionado, -1 = otro seleccionado, 0 = normal
  uniform float u_opacity;

  void main() {
    if (v_worldPos.z > u_cutZ) discard;

    vec3 N = normalize(v_worldNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - v_worldPos);

    vec3 L1 = normalize(vec3(0.42, 0.78, 0.52));
    vec3 L2 = normalize(vec3(-0.65, -0.28, 0.55));
    vec3 H1 = normalize(L1 + V);

    float diff1 = max(0.0, dot(N, L1));
    float wrap1 = max(0.0, (dot(N, L1) + 0.55) / 1.55);
    float diff2 = max(0.0, dot(N, L2));
    float ndotv = max(0.0, dot(N, V));
    float fresnel = pow(1.0 - ndotv, 2.2);
    float softSpec = pow(max(0.0, dot(N, H1)), 16.0) * 0.10;

    vec3 color = vec3(0.0);
    float alpha = u_opacity;

    if (u_partType == 1) {
      // --- CITOPLASMA DEL PARÁSITO (Anillo delicado / Cuerpo del gametocito) ---
      if (u_visualMode == 0) {
        // Esquemático 3D: Azul cerúleo orgánico con sombreado volumétrico suave
        vec3 cytoCore = vec3(0.24, 0.62, 0.84);
        vec3 cytoDeep = vec3(0.11, 0.36, 0.56);
        vec3 cytoSSS  = vec3(0.42, 0.78, 0.94);

        vec3 base = mix(cytoCore, cytoDeep, fresnel * 0.58);
        color = base * (0.30 + 0.56 * wrap1 + 0.22 * diff2)
              + cytoSSS * (0.20 * wrap1 * (1.0 - diff1 * 0.4))
              + vec3(0.75, 0.92, 1.0) * fresnel * 0.22
              + vec3(0.90, 0.97, 1.0) * softSpec;
      } else {
        // Simulación de Giemsa: Azul basófilo Romanowsky (más denso en el borde del anillo)
        vec3 giemsaMid  = vec3(0.26, 0.48, 0.82);
        vec3 giemsaEdge = vec3(0.15, 0.31, 0.64);
        vec3 giemsaPale = vec3(0.46, 0.67, 0.92);

        vec3 base = mix(giemsaPale, giemsaMid, 0.45 + 0.35 * v_uv.x);
        base = mix(base, giemsaEdge, fresnel * 0.65);
        color = base * (0.48 + 0.42 * wrap1 + 0.16 * diff2) + vec3(0.88, 0.94, 1.0) * softSpec * 0.6;
      }
    } else if (u_partType == 2) {
      // --- CROMATINA NUCLEAR (1 o 2 puntos en el anillo / Núcleo central en gametocito) ---
      if (u_visualMode == 0) {
        // Esquemático 3D: Carmesí-granate denso y aterciopelado, claramente diferenciado del eritrocito
        vec3 chromCore = vec3(0.82, 0.14, 0.34);
        vec3 chromDeep = vec3(0.46, 0.05, 0.18);
        vec3 chromRim  = vec3(0.96, 0.36, 0.52);

        vec3 base = mix(chromCore, chromDeep, fresnel * 0.55);
        color = base * (0.28 + 0.60 * wrap1 + 0.20 * diff2)
              + chromRim * fresnel * 0.25
              + vec3(1.0, 0.88, 0.92) * softSpec * 0.9;
      } else {
        // Simulación de Giemsa: Rojo-púrpura / rubí Romanowsky intenso (azur-eosina)
        vec3 romCore = vec3(0.60, 0.07, 0.28);
        vec3 romDeep = vec3(0.38, 0.03, 0.17);
        vec3 romTint = vec3(0.76, 0.14, 0.38);

        vec3 base = mix(romTint, romCore, 0.5 + 0.4 * ndotv);
        base = mix(base, romDeep, fresnel * 0.6);
        color = base * (0.46 + 0.45 * wrap1 + 0.15 * diff2) + vec3(0.95, 0.80, 0.88) * softSpec * 0.6;
      }
    } else if (u_partType == 3) {
      // --- ZONA VACUOLAR INTRACELULAR ---
      float rhoVac = clamp(v_uv.x, 0.0, 1.0);
      float meniscus = smoothstep(0.45, 1.0, rhoVac);
      if (u_visualMode == 0) {
        vec3 vacCenter = vec3(0.78, 0.91, 0.98);
        vec3 vacRim    = vec3(0.42, 0.72, 0.90);
        vec3 base = mix(vacCenter, vacRim, meniscus * 0.65);
        color = base * (0.45 + 0.45 * wrap1 + 0.15 * diff2);
        alpha = clamp(0.32 + 0.34 * meniscus + 0.18 * fresnel, 0.25, 0.78);
      } else {
        vec3 vacCenterG = vec3(0.97, 0.94, 0.96);
        vec3 vacRimG    = vec3(0.74, 0.82, 0.94);
        vec3 base = mix(vacCenterG, vacRimG, meniscus * 0.7);
        color = base * (0.62 + 0.32 * wrap1 + 0.10 * diff2);
        alpha = clamp(0.42 + 0.32 * meniscus + 0.15 * fresnel, 0.35, 0.82);
      }
    } else {
      // --- PIGMENTO MALÁRICO (Hemozoína en el gametocito) ---
      if (u_visualMode == 0) {
        vec3 pigBase = vec3(0.68, 0.36, 0.08);
        color = pigBase * (0.30 + 0.58 * wrap1 + 0.20 * diff2) + vec3(0.95, 0.72, 0.35) * softSpec * 1.4;
      } else {
        vec3 pigGiemsa = vec3(0.24, 0.15, 0.09);
        color = pigGiemsa * (0.42 + 0.48 * wrap1 + 0.15 * diff2) + vec3(0.55, 0.42, 0.30) * softSpec;
      }
    }

    if (u_highlight == 1) {
      color += vec3(0.14, 0.20, 0.26) * (0.45 + 0.55 * fresnel);
      alpha = max(alpha, 0.82);
    } else if (u_highlight == -1) {
      color *= 0.82;
    }

    color = color / (1.0 + color * 0.14);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Shader del plano de corte geométrico (Superficie de sección 3D comprensible)
 */
const SECTION_CAP_VERTEX_SHADER = `
  varying vec3 v_worldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    v_worldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const SECTION_CAP_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;

  uniform int u_formMode;       // 0 = ring, 1 = gametocyte
  uniform int u_visualMode;     // 0 = Esquemático 3D, 1 = Simulación de Giemsa
  uniform float u_rbcOpacity;
  uniform float u_cutActive;

  float ellipsoidDist(vec3 p, vec3 c, vec3 r) {
    vec3 d = (p - c) / r;
    return length(d);
  }

  void main() {
    if (u_cutActive < 0.5) discard;

    vec3 p = v_worldPos;

    if (u_formMode == 0) {
      // --- SECCIÓN DEL ERITROCITO BICÓNCAVO Y TROFOZOÍTO EN ANILLO ---
      float rXZ = length(p.xz);
      float rho = rXZ / 3.75;
      if (rho > 1.0) discard;

      float r2 = rho * rho;
      float r4 = r2 * r2;
      float halfH = 0.5 * 3.75 * sqrt(max(0.0, 1.0 - r2)) * (0.23 + 2.04 * r2 - 1.15 * r4);
      if (abs(p.y) > halfH) discard;

      float rbcEdgeDist = halfH - abs(p.y);

      // Coordenadas locales del anillo deshaciendo la inclinación RING_TILT_Z = -0.09
      float dx = p.x - 1.0;
      float dy = p.y;
      float dz = p.z;
      float cT = cos(0.09);
      float sT = sin(0.09);
      float lx = dx * cT - dy * sT;
      float ly = dx * sT + dy * cT;
      float lz = dz;

      float u = atan(lz, lx);
      float cosU = cos(u);
      float midR = 0.72 * (1.0 + 0.065 * cosU - 0.03 * cos(2.0 * u));
      float rLocal = length(vec2(lx, lz));

      // 1. Cromatina nuclear en sección
      float dU1 = atan(sin(u - 2.52), cos(u - 2.52));
      float dU2 = atan(sin(u + 2.42), cos(u + 2.42));
      float dChrom1 = length(vec3(dU1 / 0.28, (rLocal - midR) / 0.13, (ly - 0.018) / 0.11));
      float dChrom2 = length(vec3(dU2 / 0.21, (rLocal - midR) / 0.105, (ly - 0.018) / 0.09));
      float dChrom = min(dChrom1, dChrom2);

      if (dChrom <= 1.0) {
        vec3 col = (u_visualMode == 0) ? vec3(0.78, 0.14, 0.34) : vec3(0.58, 0.07, 0.27);
        float rim = smoothstep(0.75, 1.0, dChrom);
        col = mix(col, col * 0.55, rim);
        gl_FragColor = vec4(col, 0.98);
        return;
      }

      // 2. Citoplasma anular delicado en sección
      float crescentFactor = pow(0.5 * (1.0 + cosU), 1.35);
      float widthR = 0.068 + 0.145 * crescentFactor + 0.038 * exp(-(dU1 * dU1) / 0.09) + 0.028 * exp(-(dU2 * dU2) / 0.075);
      float heightY = 0.058 + 0.088 * crescentFactor;
      float dCyto = length(vec2((rLocal - midR) / widthR, ly / heightY));

      if (dCyto <= 1.0) {
        vec3 col = (u_visualMode == 0) ? vec3(0.22, 0.58, 0.80) : vec3(0.25, 0.46, 0.80);
        float rim = smoothstep(0.75, 1.0, dCyto);
        col = mix(col, col * 0.60, rim);
        gl_FragColor = vec4(col, 0.96);
        return;
      }

      // 3. Zona vacuolar intracelular en sección
      float maxVacR = 0.65 * (1.0 + 0.055 * cosU - 0.025 * cos(2.0 * u));
      float rhoVac = rLocal / max(0.01, maxVacR);
      float vacHalfH = 0.075 * sqrt(max(0.0, 1.0 - rhoVac * rhoVac)) * (0.65 + 0.55 * rhoVac * rhoVac);
      if (rhoVac <= 1.0 && abs(ly) <= vacHalfH) {
        vec3 col = (u_visualMode == 0) ? vec3(0.75, 0.89, 0.97) : vec3(0.95, 0.91, 0.94);
        gl_FragColor = vec4(col, 0.82);
        return;
      }

      // 4. Estroma del eritrocito bicóncavo en sección
      vec3 rbcFill = (u_visualMode == 0) ? vec3(0.74, 0.19, 0.22) : vec3(0.87, 0.65, 0.71);
      vec3 rbcMem  = (u_visualMode == 0) ? vec3(0.92, 0.36, 0.38) : vec3(0.72, 0.45, 0.52);
      float memMask = 1.0 - smoothstep(0.0, 0.06, rbcEdgeDist);
      vec3 finalRbc = mix(rbcFill, rbcMem, memMask * 0.85);
      float alphaRbc = clamp(u_rbcOpacity * 0.88 + memMask * 0.35, 0.15, 0.94);
      gl_FragColor = vec4(finalRbc, alphaRbc);
      return;

    } else {
      // --- SECCIÓN DEL GAMETOCITO MADURO EN MEDIA LUNA ---
      float s = p.x / 4.35;
      float sBib = p.x / 4.46;
      if (abs(sBib) > 1.0) discard;

      float u = clamp((s + 1.0) * 0.5, 0.0, 1.0);
      float rBase = 1.24 * pow(max(0.0, sin(3.14159265 * u)), 0.62);
      float spineY = 1.18 * (1.0 - s * s) - 0.42;
      float ry = max(0.001, rBase);
      float rz = max(0.001, rBase * 0.88);
      float dGam = length(vec2((p.y - spineY) / ry, p.z / rz));

      if (abs(s) <= 1.0 && dGam <= 1.0) {
        float dNuc = ellipsoidDist(p, vec3(0.0, 0.72, 0.0), vec3(0.82, 0.46, 0.44));
        if (dNuc <= 1.0) {
          vec3 col = (u_visualMode == 0) ? vec3(0.78, 0.14, 0.34) : vec3(0.58, 0.07, 0.27);
          gl_FragColor = vec4(col, 0.98);
          return;
        }

        float dPig1 = ellipsoidDist(p, vec3(-0.92, 0.62, 0.0), vec3(0.20, 0.11, 0.14));
        float dPig2 = ellipsoidDist(p, vec3(0.95, 0.64, 0.0), vec3(0.21, 0.11, 0.14));
        float dPig3 = ellipsoidDist(p, vec3(-0.48, 0.22, 0.0), vec3(0.18, 0.10, 0.13));
        float dPig4 = ellipsoidDist(p, vec3(0.52, 0.24, 0.0), vec3(0.19, 0.10, 0.13));
        if (min(min(dPig1, dPig2), min(dPig3, dPig4)) <= 1.0) {
          vec3 col = (u_visualMode == 0) ? vec3(0.68, 0.36, 0.08) : vec3(0.24, 0.15, 0.09);
          gl_FragColor = vec4(col, 0.98);
          return;
        }

        vec3 cytoCol = (u_visualMode == 0) ? vec3(0.22, 0.58, 0.80) : vec3(0.25, 0.46, 0.80);
        float pellicleRim = smoothstep(0.88, 1.0, dGam);
        vec3 rimCol = (u_visualMode == 0) ? vec3(0.42, 0.76, 0.94) : vec3(0.15, 0.31, 0.64);
        gl_FragColor = vec4(mix(cytoCol, rimCol, pellicleRim * 0.8), 0.95);
        return;
      }

      float archMask = max(0.0, 1.0 - pow(sBib / 0.86, 2.0));
      float topY = spineY - ry * 0.95;
      float botY = -0.68 - 0.36 * archMask;
      if (archMask > 0.02 && p.y <= topY && p.y >= botY && abs(p.z) <= 0.22) {
        vec3 bibCol = (u_visualMode == 0) ? vec3(0.84, 0.28, 0.32) : vec3(0.83, 0.57, 0.64);
        gl_FragColor = vec4(bibCol, clamp(u_rbcOpacity * 0.8, 0.12, 0.85));
        return;
      }

      discard;
    }
  }
`;

export interface Plasmodium3DViewerProps {
  onClose?: () => void;
}

export const Plasmodium3DViewer: React.FC<Plasmodium3DViewerProps> = ({ onClose }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Referencias WebGL / Three.js
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const sectionCapMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const cutZRef = useRef<number>(5.0);

  // Transición suave de cámara
  const camTransitionRef = useRef<{
    active: boolean;
    goalPos: THREE.Vector3;
    goalTarget: THREE.Vector3;
  }>({
    active: false,
    goalPos: new THREE.Vector3(0.25, 4.35, 6.15),
    goalTarget: new THREE.Vector3(0.15, 0.0, 0.0),
  });

  // Estados de la interfaz
  const [activeForm, setActiveForm] = useState<PlasmodiumFormId>("ring");
  const [isFormDropdownOpen, setIsFormDropdownOpen] = useState(false);
  const [visualMode, setVisualMode] = useState<VisualAppearanceMode>("schematic");
  const [erythrocyteTransparency, setErythrocyteTransparency] = useState<number>(54);
  const [cutPercent, setCutPercent] = useState<number>(0);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [isFocusedOnParasite, setIsFocusedOnParasite] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false); // Apagada al inicio
  const [mobileControlsOpen, setMobileControlsOpen] = useState<boolean>(false);
  const [mobileTouchInteractive, setMobileTouchInteractive] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  // Posiciones proyectadas en 2D para los marcadores y sus líneas guía
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
  const [scaleBarPx, setScaleBarPx] = useState<number>(64);

  const formMeta = PLASMODIUM_FORMS[activeForm];
  const selectedStructure = useMemo(
    () => formMeta.structures.find((s) => s.id === selectedStructureId) || null,
    [formMeta, selectedStructureId]
  );

  // Cerrar el desplegable «Elegir forma» al hacer clic fuera o con Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFormDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFormDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const disposeGroup = useCallback((group: THREE.Group) => {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });
  }, []);

  // Construye las mallas 3D con Shaders orgánicos para la forma activa
  const buildForm3DScene = useCallback(
    (formId: PlasmodiumFormId, scene: THREE.Scene) => {
      if (modelRootRef.current) {
        scene.remove(modelRootRef.current);
        disposeGroup(modelRootRef.current);
      }

      const root = new THREE.Group();
      modelRootRef.current = root;

      if (formId === "ring") {
        // 1. ZONA VACUOLAR INTRACELULAR (renderOrder 1)
        const vacGeo = buildVacuoleLensGeometry(36, 64);
        const vacMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: PARASITE_FRAGMENT_SHADER,
          uniforms: {
            u_partType: { value: 3 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 0.55 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const vacMesh = new THREE.Mesh(vacGeo, vacMat);
        vacMesh.userData = { structureId: "vacuola", shaderType: "parasite" };
        vacMesh.renderOrder = 1;
        root.add(vacMesh);

        // 2. CITOPLASMA ANULAR DELICADO (renderOrder 2)
        const ringGeo = buildOrganicRingCytoplasmGeometry(112, 48);
        const ringMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: PARASITE_FRAGMENT_SHADER,
          uniforms: {
            u_partType: { value: 1 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 1.0 },
          },
          transparent: false,
          depthWrite: true,
          side: THREE.DoubleSide,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.userData = { structureId: "citoplasma_anillo", shaderType: "parasite" };
        ringMesh.renderOrder = 2;
        root.add(ringMesh);

        // 3. CROMATINA NUCLEAR (1 cuerpo lenticular principal + 1 cuerpo accesorio en configuración de «auriculares»)
        const chromMatMain = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: PARASITE_FRAGMENT_SHADER,
          uniforms: {
            u_partType: { value: 2 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 1.0 },
          },
          transparent: false,
          depthWrite: true,
          side: THREE.DoubleSide,
        });

        const chromGeo1 = buildCurvedChromatinBodyGeometry(2.52, 0.27, 0.125, 0.108, 40, 32);
        const chromMesh1 = new THREE.Mesh(chromGeo1, chromMatMain);
        chromMesh1.userData = { structureId: "cromatina_anillo", shaderType: "parasite" };
        chromMesh1.renderOrder = 2;
        root.add(chromMesh1);

        const chromGeo2 = buildCurvedChromatinBodyGeometry(-2.42, 0.21, 0.102, 0.09, 36, 28);
        const chromMesh2 = new THREE.Mesh(chromGeo2, chromMatMain.clone());
        chromMesh2.userData = { structureId: "cromatina_anillo", shaderType: "parasite" };
        chromMesh2.renderOrder = 2;
        root.add(chromMesh2);

        // 4. ERITROCITO HOSPEDADOR BICÓNCAVO (Doble pasada BackSide + FrontSide para transparencia limpia sin artefactos)
        const rbcGeo = buildBiconcaveRBCGeometry(80, 128);

        const rbcBackMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: RBC_FRAGMENT_SHADER,
          uniforms: {
            u_visualMode: { value: 0 },
            u_baseOpacity: { value: 0.46 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.BackSide,
        });
        const rbcBackMesh = new THREE.Mesh(rbcGeo, rbcBackMat);
        rbcBackMesh.userData = { structureId: "eritrocito", shaderType: "rbc" };
        rbcBackMesh.renderOrder = 3;
        root.add(rbcBackMesh);

        const rbcFrontMat = rbcBackMat.clone();
        rbcFrontMat.side = THREE.FrontSide;
        const rbcFrontMesh = new THREE.Mesh(rbcGeo, rbcFrontMat);
        rbcFrontMesh.userData = { structureId: "eritrocito", shaderType: "rbc" };
        rbcFrontMesh.renderOrder = 4;
        root.add(rbcFrontMesh);
      } else {
        // --- FORMA 2: GAMETOCITO MADURO EN MEDIA LUNA (Conservada) ---
        // 1. Cromatina nuclear central
        const nucGeo = new THREE.SphereGeometry(1.0, 36, 28);
        nucGeo.scale(0.82, 0.46, 0.44);
        const nucMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: PARASITE_FRAGMENT_SHADER,
          uniforms: {
            u_partType: { value: 2 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 1.0 },
          },
          transparent: false,
          depthWrite: true,
          side: THREE.DoubleSide,
        });
        const nucMesh = new THREE.Mesh(nucGeo, nucMat);
        nucMesh.position.set(0.0, 0.72, 0.0);
        nucMesh.userData = { structureId: "cromatina_gametocito", shaderType: "parasite" };
        nucMesh.renderOrder = 1;
        root.add(nucMesh);

        // 2. Pigmento malárico (hemozoína)
        const pigmentPositions: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
          { pos: [-0.92, 0.62, 0.0], rot: [0.1, 0.2, 0.35] },
          { pos: [0.95, 0.64, 0.0], rot: [-0.1, -0.2, -0.3] },
          { pos: [-0.48, 0.22, 0.0], rot: [0.2, 0.1, 0.15] },
          { pos: [0.52, 0.24, 0.0], rot: [-0.15, 0.2, -0.2] },
          { pos: [-0.72, 0.88, 0.32], rot: [0.3, -0.2, 0.4] },
          { pos: [0.74, 0.86, 0.3], rot: [-0.25, 0.3, -0.35] },
          { pos: [-0.68, 0.82, -0.34], rot: [0.2, 0.4, -0.25] },
          { pos: [0.7, 0.84, -0.32], rot: [-0.3, -0.25, 0.3] },
          { pos: [-1.15, 0.48, 0.24], rot: [0.15, 0.3, 0.45] },
          { pos: [1.18, 0.46, 0.22], rot: [-0.2, -0.35, -0.4] },
          { pos: [-0.25, 0.45, 0.46], rot: [0.4, 0.1, 0.12] },
          { pos: [0.28, 0.48, -0.45], rot: [-0.35, -0.15, 0.18] },
        ];

        const pigMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: PARASITE_FRAGMENT_SHADER,
          uniforms: {
            u_partType: { value: 4 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 1.0 },
          },
          transparent: false,
          depthWrite: true,
          side: THREE.DoubleSide,
        });

        pigmentPositions.forEach((item) => {
          const pGeo = new THREE.SphereGeometry(1.0, 20, 16);
          pGeo.scale(0.2, 0.105, 0.12);
          const pMesh = new THREE.Mesh(pGeo, pigMat.clone());
          pMesh.position.set(...item.pos);
          pMesh.rotation.set(...item.rot);
          pMesh.userData = { structureId: "pigmento_hemozoina", shaderType: "parasite" };
          pMesh.renderOrder = 1;
          root.add(pMesh);
        });

        // 3. Cuerpo del gametocito en media luna
        const gamGeo = buildCrescentGametocyteGeometry(96, 48);
        const gamMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: PARASITE_FRAGMENT_SHADER,
          uniforms: {
            u_partType: { value: 1 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 0.72 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const gamMesh = new THREE.Mesh(gamGeo, gamMat);
        gamMesh.userData = { structureId: "cuerpo_gametocito", shaderType: "parasite" };
        gamMesh.renderOrder = 2;
        root.add(gamMesh);

        // 4. Velo de Laveran (remanente eritrocitario)
        const bibGeo = buildLaveransBibGeometry(84, 44);
        const bibMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: RBC_FRAGMENT_SHADER,
          uniforms: {
            u_visualMode: { value: 0 },
            u_baseOpacity: { value: 0.45 },
            u_cutZ: { value: 5.0 },
            u_highlight: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const bibMesh = new THREE.Mesh(bibGeo, bibMat);
        bibMesh.userData = { structureId: "velo_laveran", shaderType: "rbc" };
        bibMesh.renderOrder = 3;
        root.add(bibMesh);
      }

      // Superficie de sección sólida para el plano de corte geométrico
      const capGeo = new THREE.PlaneGeometry(11.0, 8.0);
      const capMat = new THREE.ShaderMaterial({
        vertexShader: SECTION_CAP_VERTEX_SHADER,
        fragmentShader: SECTION_CAP_FRAGMENT_SHADER,
        uniforms: {
          u_formMode: { value: formId === "ring" ? 0 : 1 },
          u_visualMode: { value: 0 },
          u_rbcOpacity: { value: 0.46 },
          u_cutActive: { value: 0.0 },
        },
        transparent: true,
        depthWrite: true,
        side: THREE.DoubleSide,
      });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.set(0, 0, 5.0);
      capMesh.visible = false;
      capMesh.renderOrder = 5;
      sectionCapMeshRef.current = capMesh;
      root.add(capMesh);

      scene.add(root);
    },
    [disposeGroup]
  );

  // Sincronizar uniforms de shaders según el modo visual, transparencia, corte y selección
  const syncUniforms = useCallback(() => {
    const scene = sceneRef.current;
    const root = modelRootRef.current;
    if (!scene || !root) return;

    const isGiemsa = visualMode === "giemsa";
    // Blanco ligeramente cálido (marfil suave / 0xfaf7f2) en simulación de Giemsa
    scene.background = new THREE.Color(isGiemsa ? 0xfaf7f2 : 0x070b14);

    const maxZ = activeForm === "ring" ? 3.8 : 1.32;
    const isCutting = cutPercent > 0.5;
    const cutZ = isCutting ? maxZ * (1.0 - (cutPercent / 100.0) * 1.85) : maxZ + 1.5;
    cutZRef.current = cutZ;

    let rbcBaseOpacity = Math.max(
      0.06,
      Math.min(0.95, 0.94 - (erythrocyteTransparency / 100.0) * 0.86)
    );

    if (
      selectedStructureId &&
      selectedStructureId !== "eritrocito" &&
      selectedStructureId !== "velo_laveran" &&
      rbcBaseOpacity > 0.48
    ) {
      rbcBaseOpacity = 0.38;
    }

    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh) || obj === sectionCapMeshRef.current) return;
      const sId = obj.userData?.structureId as string | undefined;
      const shaderType = obj.userData?.shaderType as string | undefined;
      if (!sId || !shaderType) return;

      const mat = obj.material as THREE.ShaderMaterial;
      const isSelected = selectedStructureId === sId;
      const hasOtherSelection = Boolean(selectedStructureId && selectedStructureId !== sId);
      const highlightVal = isSelected ? 1 : hasOtherSelection ? -1 : 0;

      mat.uniforms.u_visualMode.value = isGiemsa ? 1 : 0;
      mat.uniforms.u_cutZ.value = cutZ;
      mat.uniforms.u_highlight.value = highlightVal;

      if (shaderType === "rbc") {
        mat.uniforms.u_baseOpacity.value = rbcBaseOpacity;
      } else if (shaderType === "parasite" && sId === "cuerpo_gametocito") {
        const inspectingInner =
          selectedStructureId === "cromatina_gametocito" ||
          selectedStructureId === "pigmento_hemozoina";
        mat.uniforms.u_opacity.value = inspectingInner ? 0.38 : 0.72;
      }
    });

    if (sectionCapMeshRef.current) {
      const cap = sectionCapMeshRef.current;
      const capMat = cap.material as THREE.ShaderMaterial;
      cap.visible = isCutting;
      cap.position.set(0, 0, cutZ - 0.002);
      capMat.uniforms.u_formMode.value = activeForm === "ring" ? 0 : 1;
      capMat.uniforms.u_visualMode.value = isGiemsa ? 1 : 0;
      capMat.uniforms.u_rbcOpacity.value = rbcBaseOpacity;
      capMat.uniforms.u_cutActive.value = isCutting ? 1.0 : 0.0;
    }
  }, [activeForm, visualMode, erythrocyteTransparency, cutPercent, selectedStructureId]);

  // Inicializar escena WebGL al montar y liberar todos los recursos al desmontar
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

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    const initCam = PLASMODIUM_FORMS.ring.defaultCamera;
    camera.position.set(...initCam.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 1.65;
    controls.maxDistance = 16.0;
    controls.target.set(...initCam.target);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.25;
    controlsRef.current = controls;

    const stopCamTransition = () => {
      camTransitionRef.current.active = false;
    };
    controls.addEventListener("start", stopCamTransition);

    buildForm3DScene("ring", scene);

    // Raycasting para seleccionar estructuras directamente sobre el modelo 3D
    const raycaster = new THREE.Raycaster();
    const downPt = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      downPt.set(e.clientX, e.clientY);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downPt.x, e.clientY - downPt.y) > 6) return;
      if (!modelRootRef.current || !cameraRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, cameraRef.current);
      const hits = raycaster.intersectObjects(modelRootRef.current.children, true);
      const validHit = hits.find(
        (h) =>
          h.object !== sectionCapMeshRef.current &&
          h.object.userData?.structureId &&
          h.point.z <= cutZRef.current + 0.02
      );
      if (validHit?.object.userData?.structureId) {
        handleSelectStructureRef.current(validHit.object.userData.structureId as string);
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    let frameCount = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

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

      // Proyección de marcadores 3D con resolución de colisiones para evitar superposiciones y cortes
      frameCount++;
      if (frameCount % 2 === 0 && holder) {
        const w = holder.clientWidth;
        const h = holder.clientHeight;
        if (w > 0 && h > 0) {
          const currentForm = PLASMODIUM_FORMS[activeFormRef.current];
          const rawPins: Array<{
            id: string;
            anchorX: number;
            anchorY: number;
            labelX: number;
            labelY: number;
            visible: boolean;
          }> = [];

          currentForm.structures.forEach((st) => {
            const worldPt = new THREE.Vector3(...st.anchor3D);
            const proj = worldPt.clone().project(camera);
            const inFront = proj.z >= -1 && proj.z <= 1;
            const ax = (proj.x * 0.5 + 0.5) * w;
            const ay = (-(proj.y * 0.5) + 0.5) * h;

            // Sujetar la etiqueta dentro de márgenes seguros para que nunca se corte el texto
            const padX = Math.min(105, w * 0.24);
            const padTop = 64;
            const padBot = 54;
            const lx = Math.max(padX, Math.min(w - padX, ax + st.labelOffset[0]));
            const ly = Math.max(padTop, Math.min(h - padBot, ay + st.labelOffset[1]));

            rawPins.push({
              id: st.id,
              anchorX: ax,
              anchorY: ay,
              labelX: lx,
              labelY: ly,
              visible: inFront && ax > 20 && ax < w - 20 && ay > 20 && ay < h - 20,
            });
          });

          // Separación iterativa mínima entre etiquetas para impedir superposiciones en cualquier ángulo
          for (let iter = 0; iter < 3; iter++) {
            for (let i = 0; i < rawPins.length; i++) {
              for (let j = i + 1; j < rawPins.length; j++) {
                const pA = rawPins[i];
                const pB = rawPins[j];
                if (!pA.visible || !pB.visible) continue;
                const dx = pB.labelX - pA.labelX;
                const dy = pB.labelY - pA.labelY;
                if (Math.abs(dx) < 138 && Math.abs(dy) < 34) {
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

          // Escala geométrica vinculada al tamaño del modelo (1 unidad = 1 µm) y distancia de cámara
          const dist = camera.position.distanceTo(controls.target);
          const fovRad = THREE.MathUtils.degToRad(camera.fov);
          const worldHeightAtTarget = 2.0 * dist * Math.tan(fovRad * 0.5);
          const pxPerMicron = h / Math.max(0.1, worldHeightAtTarget);
          setScaleBarPx(Math.max(28, Math.min(180, Math.round(pxPerMicron * 2.0))));
        }
      }
    };
    animate();

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
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (modelRootRef.current) disposeGroup(modelRootRef.current);
      controls.dispose();
      renderer.dispose();
      if (holder) holder.innerHTML = "";
    };
  }, [buildForm3DScene, disposeGroup]);

  const activeFormRef = useRef<PlasmodiumFormId>(activeForm);
  useEffect(() => {
    activeFormRef.current = activeForm;
  }, [activeForm]);

  const handleSelectStructure = useCallback((structureId: string | null) => {
    setSelectedStructureId((prev) => {
      const nextId = prev === structureId ? null : structureId;
      const currentForm = PLASMODIUM_FORMS[activeFormRef.current];
      if (nextId) {
        const st = currentForm.structures.find((s) => s.id === nextId);
        if (st) {
          setIsFocusedOnParasite(nextId !== "eritrocito" && nextId !== "velo_laveran");
          camTransitionRef.current = {
            active: true,
            goalPos: new THREE.Vector3(...st.cameraGoal.position),
            goalTarget: new THREE.Vector3(...st.cameraGoal.target),
          };
        }
      } else {
        setIsFocusedOnParasite(false);
        camTransitionRef.current = {
          active: true,
          goalPos: new THREE.Vector3(...currentForm.defaultCamera.position),
          goalTarget: new THREE.Vector3(...currentForm.defaultCamera.target),
        };
      }
      return nextId;
    });
  }, []);

  const handleSelectStructureRef = useRef(handleSelectStructure);
  useEffect(() => {
    handleSelectStructureRef.current = handleSelectStructure;
  }, [handleSelectStructure]);

  // Botón «Enfocar parásito»
  const handleFocusParasite = () => {
    const meta = PLASMODIUM_FORMS[activeForm];
    setIsFocusedOnParasite(true);
    camTransitionRef.current = {
      active: true,
      goalPos: new THREE.Vector3(...meta.focusParasiteCamera.position),
      goalTarget: new THREE.Vector3(...meta.focusParasiteCamera.target),
    };
  };

  // Botón «Ver eritrocito completo»
  const handleViewFullCell = () => {
    const meta = PLASMODIUM_FORMS[activeForm];
    setSelectedStructureId(null);
    setIsFocusedOnParasite(false);
    camTransitionRef.current = {
      active: true,
      goalPos: new THREE.Vector3(...meta.defaultCamera.position),
      goalTarget: new THREE.Vector3(...meta.defaultCamera.target),
    };
  };

  // Cambio entre formas en el selector desplegable
  const handleSwitchForm = useCallback(
    (newForm: PlasmodiumFormId) => {
      setIsFormDropdownOpen(false);
      if (newForm === activeForm) return;

      const meta = PLASMODIUM_FORMS[newForm];
      setActiveForm(newForm);
      setSelectedStructureId(null);
      setIsFocusedOnParasite(false);
      setCutPercent(0);
      setErythrocyteTransparency(meta.defaultErythrocyteTransparency);

      if (sceneRef.current) {
        buildForm3DScene(newForm, sceneRef.current);
      }

      camTransitionRef.current = {
        active: true,
        goalPos: new THREE.Vector3(...meta.defaultCamera.position),
        goalTarget: new THREE.Vector3(...meta.defaultCamera.target),
      };
    },
    [activeForm, buildForm3DScene]
  );

  useEffect(() => {
    syncUniforms();
  }, [syncUniforms]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  const handleZoom = (factor: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    camTransitionRef.current.active = false;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    const nextLen = Math.max(1.75, Math.min(15.0, dir.length() * factor));
    dir.setLength(nextLen);
    cam.position.copy(target).add(dir);
    controlsRef.current.update();
  };

  const isGiemsa = visualMode === "giemsa";

  // Fallback estático si falla WebGL
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
        <p className="text-[11px] text-amber-300/90 font-medium">
          Reconstrucción 3D educativa; no sustituye la observación microscópica.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className="w-full space-y-3 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. VISOR 3D PROTAGONISTA: Los paneles principales están fuera del lienzo para no ocultar nunca la anatomía */}
      <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[580px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#070b14]">
        {/* Lienzo WebGL Three.js */}
        <div
          ref={canvasHolderRef}
          className={`w-full h-full cursor-grab active:cursor-grabbing ${
            !mobileTouchInteractive ? "touch-pan-y md:touch-none" : "touch-none"
          }`}
        />

        {/* Líneas guía SVG y Marcadores 3D sin superposiciones (desaparecen por completo al ocultarlos) */}
        {showMarkers && (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
              {formMeta.structures.map((st) => {
                const pin = projectedPins[st.id];
                if (!pin || !pin.visible) return null;
                const isSelected = selectedStructureId === st.id;
                const strokeCol = isSelected
                  ? "#fb7185"
                  : isGiemsa
                  ? "rgba(71, 85, 105, 0.75)"
                  : "rgba(148, 163, 184, 0.65)";

                return (
                  <g key={`line-${st.id}`}>
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
                      fill={isGiemsa ? st.colorGiemsa : st.colorSchematic}
                      stroke={isGiemsa ? "#334155" : "#ffffff"}
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              {formMeta.structures.map((st, idx) => {
                const pin = projectedPins[st.id];
                if (!pin || !pin.visible) return null;
                const isSelected = selectedStructureId === st.id;
                const dotColor = isGiemsa ? st.colorGiemsa : st.colorSchematic;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStructure(st.id);
                    }}
                    style={{
                      left: `${pin.labelX}px`,
                      top: `${pin.labelY}px`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 shadow-lg border backdrop-blur-md ${
                      isSelected
                        ? "bg-rose-600 text-white border-rose-300 scale-105 ring-4 ring-rose-500/30 z-30"
                        : isGiemsa
                        ? "bg-slate-900/90 text-slate-100 border-slate-700 hover:bg-slate-900"
                        : "bg-slate-950/85 text-slate-100 border-slate-700/80 hover:border-cyan-400/70"
                    }`}
                  >
                    <span
                      style={{ backgroundColor: isSelected ? "#ffffff" : dotColor }}
                      className="w-2 h-2 rounded-full shrink-0"
                    />
                    <span className="whitespace-nowrap">
                      {idx + 1}. {st.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* BARRA SUPERIOR COMPACTA: Selector «Elegir forma», «Enfocar parásito» / «Ver eritrocito completo», Modos y Marcadores */}
        <header className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Izquierda: Selector desplegable «Elegir forma» + Botones de encuadre contextual */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsFormDropdownOpen((prev) => !prev)}
                aria-expanded={isFormDropdownOpen}
                aria-haspopup="listbox"
                className="rounded-xl bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 text-xs font-bold text-white shadow-lg flex items-center gap-2 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Elegir forma:</span>
                <span className="text-cyan-300">{formMeta.shortName}</span>
                {isFormDropdownOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-cyan-300" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-300" />
                )}
              </button>

              {isFormDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Elegir forma de Plasmodium falciparum"
                  className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1.5"
                >
                  <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Formas sanguíneas de P. falciparum
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFormDropdownOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(["ring", "gametocyte"] as PlasmodiumFormId[]).map((fId) => {
                    const item = PLASMODIUM_FORMS[fId];
                    const isCurrent = activeForm === fId;
                    return (
                      <button
                        key={fId}
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => handleSwitchForm(fId)}
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

            {/* Botones de encuadre rápido: «Enfocar parásito» y «Ver eritrocito completo» */}
            <div className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 p-0.5 flex items-center gap-0.5 shadow-lg">
              <button
                type="button"
                onClick={handleFocusParasite}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  isFocusedOnParasite
                    ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/40"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Acercar la cámara hacia el parásito intracelular"
              >
                <Focus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enfocar parásito</span>
              </button>
              <button
                type="button"
                onClick={handleViewFullCell}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  !isFocusedOnParasite && !selectedStructureId
                    ? "bg-slate-800 text-white border border-slate-600/60"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Recuperar el encuadre completo de la célula hospedadora"
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
                <span>Ver eritrocito completo</span>
              </button>
            </div>
          </div>

          {/* Derecha: Modos («Esquemático 3D» / «Simulación de Giemsa») + «Mostrar / Ocultar marcadores» */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 p-0.5 flex items-center gap-0.5 shadow-lg">
              <button
                type="button"
                onClick={() => setVisualMode("schematic")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  visualMode === "schematic"
                    ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Esquemático 3D</span>
              </button>
              <button
                type="button"
                onClick={() => setVisualMode("giemsa")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  visualMode === "giemsa"
                    ? "bg-rose-500 text-white font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Microscope className="w-3 h-3" />
                <span>Simulación de Giemsa</span>
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

        {/* BARRA INFERIOR COMPACTA DEL VISOR: Aviso educativo, Cámara rápida y Escala geométrica */}
        <footer className="absolute bottom-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/70 px-3 py-1.5 text-[11px] text-slate-200 flex items-center gap-2 pointer-events-auto shadow-lg">
            <span className="font-semibold text-amber-300">
              Reconstrucción 3D educativa; no sustituye la observación microscópica.
            </span>
            <span className="hidden xl:inline text-slate-400">
              ·{" "}
              {isGiemsa
                ? "Simulación de Giemsa: representación basada en imágenes documentadas (no fotografía real)."
                : "Esquemático 3D: colores educativos para distinguir estructuras y volumen."}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Activar interacción táctil en celular sin bloquear el scroll de la página */}
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

            {/* Controles rápidos de cámara */}
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
                onClick={handleViewFullCell}
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

            {/* Escala dinámica de 2 µm */}
            <div
              className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/70 px-2.5 py-1.5 flex items-center gap-2 shadow-lg"
              title="Escala geométrica correspondiente al tamaño del modelo (1 unidad = 1 µm) y a la cámara"
            >
              <span className="text-[11px] font-mono font-bold text-cyan-300">2 µm</span>
              <div
                style={{ width: `${scaleBarPx}px` }}
                className="h-1.5 border-x-2 border-b-2 border-cyan-400 transition-all duration-150"
              />
            </div>
          </div>
        </footer>
      </div>

      {/* 2. PANEL DE CONTROLES Y ESTRUCTURAS FUERA DEL ÁREA PRINCIPAL DEL MODELO (Plegable en pantallas estrechas) */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 space-y-3.5">
        {/* Cabecera plegable para pantallas estrechas (celular) */}
        <div className="flex md:hidden items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleFocusParasite}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1"
            >
              <Focus className="w-3.5 h-3.5" />
              <span>Enfocar parásito</span>
            </button>
            <button
              type="button"
              onClick={handleViewFullCell}
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

        {/* Deslizadores de Transparencia del eritrocito y Corte geométrico del modelo */}
        <div
          className={`${
            mobileControlsOpen ? "grid" : "hidden md:grid"
          } grid-cols-1 md:grid-cols-2 gap-4 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800`}
        >
          {/* Deslizador 1: Transparencia del eritrocito */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sliderRbcTransp" className="text-slate-200 font-bold">
                {formMeta.erythrocyteControlLabel}
              </label>
              <span className="text-cyan-300 font-mono font-bold">{erythrocyteTransparency}%</span>
            </div>
            <input
              id="sliderRbcTransp"
              type="range"
              min={0}
              max={100}
              value={erythrocyteTransparency}
              onChange={(e) => setErythrocyteTransparency(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              {formMeta.erythrocyteControlHint}
            </p>
          </div>

          {/* Deslizador 2: Corte geométrico del modelo */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="sliderCutPlane"
                className="text-slate-200 font-bold flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                <span>Corte del modelo (sección geométrica 3D)</span>
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
              id="sliderCutPlane"
              type="range"
              min={0}
              max={100}
              value={cutPercent}
              onChange={(e) => setCutPercent(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              Herramienta geométrica de exploración interna (en 50% secciona el centro bicóncavo y el anillo).
            </p>
          </div>
        </div>

        {/* Selector de estructuras representadas y explicación breve bajo demanda */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Estructuras representadas (toca para resaltar y ver detalle):
            </span>
            {selectedStructureId && (
              <button
                type="button"
                onClick={handleViewFullCell}
                className="text-xs font-semibold text-cyan-300 hover:text-white"
              >
                Volver a vista general
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {formMeta.structures.map((st, idx) => {
              const isActive = selectedStructureId === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectStructure(st.id)}
                  className={`text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 border ${
                    isActive
                      ? "bg-cyan-500/20 text-white border-cyan-400 font-bold shadow-sm"
                      : "bg-slate-950/70 hover:bg-slate-950 text-slate-300 border-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      style={{
                        backgroundColor: isGiemsa ? st.colorGiemsa : st.colorSchematic,
                      }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    />
                    <span className="truncate">
                      {idx + 1}. {st.shortLabel}
                    </span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0">
                    {st.category === "hospedador" ? "Hospedador" : "Parásito"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tarjeta de explicación breve al seleccionar una estructura o resumen general */}
          {selectedStructure ? (
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedStructure.category === "hospedador"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    }`}
                  >
                    {selectedStructure.categoryLabel}
                  </span>
                  <h5 className="text-sm font-bold text-white">{selectedStructure.name}</h5>
                </div>
                <button
                  type="button"
                  onClick={handleViewFullCell}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Ver eritrocito completo
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed">{selectedStructure.summary}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <strong className="text-rose-300">Observación microscópica (Giemsa): </strong>
                  <span className="text-slate-300">{selectedStructure.microscopyNote}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <strong className="text-cyan-300">Reconstrucción educativa 3D: </strong>
                  <span className="text-slate-300">{selectedStructure.reconstruction3DNote}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{formMeta.overviewSummary}</span>
              </div>
              <span className="text-slate-400 font-mono shrink-0">{formMeta.dimensionsNote}</span>
            </div>
          )}
        </div>

        {/* Referencias documentales */}
        <div className="pt-2 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
          <div>
            <strong className="text-slate-300">Fuentes de referencia:</strong> CDC DPDx Malaria (
            <a
              href="https://www.cdc.gov/dpdx/malaria/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              cdc.gov/dpdx/malaria
            </a>
            ) · Bench Aid <em>P. falciparum</em> · Bannister et al., <em>Parasitol Today</em> 2000.
          </div>
          <div>
            Observación microscópica 2D ≠ Reconstrucción esquemática 3D
          </div>
        </div>
      </div>
    </div>
  );
};
