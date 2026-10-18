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
} from "lucide-react";

export type GiardiaFormId = "trophozoite" | "cyst";
export type GiardiaVisualMode = "schematic" | "trichrome";

export interface GiardiaStructureMeta {
  id: string;
  number: number;
  name: string;
  shortLabel: string;
  category: "cubierta" | "organulo" | "citoesqueleto";
  categoryLabel: string;
  colorSchematic: string;
  colorTrichrome: string;
  anchor3D: [number, number, number];
  /** Desplazamiento 2D (px) desde el punto proyectado hacia la etiqueta para evitar solapamientos */
  labelOffset: [number, number];
  cameraGoal: {
    position: [number, number, number];
    target: [number, number, number];
  };
  summary: string;
  microscopyNote: string;
  reconstruction3DNote: string;
}

export interface GiardiaFormMeta {
  id: GiardiaFormId;
  name: string;
  shortName: string;
  subtitle: string;
  dimensionsNote: string;
  pellicleControlLabel: string;
  pellicleControlHint: string;
  defaultPellicleTransparency: number;
  defaultCamera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  focusOrganellesCamera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  overviewSummary: string;
  structures: GiardiaStructureMeta[];
}

/**
 * ESCALA GEOMÉTRICA REAL (1 unidad 3D = 1 µm):
 * - Trofozoíto de Giardia duodenalis:
 *   Longitud = 14.0 µm (y ∈ [-7.0, +7.0]), ancho anterior = 8.4 µm (x ∈ [-4.2, +4.2]),
 *   espesor dorsoventral = ~3.1 µm, con dorso convexo y cara anteroventral cóncava ocupada
 *   por el disco ventral suctorio bilobulado (~5.8 µm de ancho).
 * - Quiste maduro de Giardia duodenalis:
 *   Longitud = 12.0 µm (y ∈ [-6.0, +6.0]), ancho = 8.4 µm (x ∈ [-4.2, +4.2]),
 *   pared quística lisa hialina, espacio peritrófico de retracción citoplasmática,
 *   4 núcleos en el polo anterior y fibrillas intranquísticas diagonales.
 */
export const GIARDIA_FORMS: Record<GiardiaFormId, GiardiaFormMeta> = {
  trophozoite: {
    id: "trophozoite",
    name: "Trofozoíto piriforme binucleado (forma vegetativa móvil)",
    shortName: "Trofozoíto piriforme",
    subtitle:
      "Forma vegetativa con simetría bilateral, disco ventral adhesivo, dos núcleos con cariosoma central, cuerpos medianos y 4 pares de flagelos",
    dimensionsNote:
      "Trofozoíto: 10–20 µm de largo (promedio 12–15 µm) × 5–15 µm de ancho · Simetría bilateral",
    pellicleControlLabel: "Transparencia del cuerpo citoplasmático",
    pellicleControlHint:
      "Ajusta la traslucidez de la película y el citoplasma para inspeccionar los 2 núcleos, el axostilo, los cuerpos medianos y el disco ventral.",
    defaultPellicleTransparency: 46,
    defaultCamera: {
      position: [1.8, 1.2, 16.2],
      target: [0.0, -0.3, 0.0],
    },
    focusOrganellesCamera: {
      position: [0.8, 1.3, 9.2],
      target: [0.0, 1.1, 0.1],
    },
    overviewSummary:
      "El trofozoíto de Giardia duodenalis habita en el lumen del duodeno y yeyuno proximal. Presenta forma piriforme («media pera» o «gota»), convexa dorsalmente y aplanada ventralmente, donde destaca el gran disco suctorio bilobulado con el que se adhiere al borde en cepillo de los enterocitos.",
    structures: [
      {
        id: "disco_ventral",
        number: 1,
        name: "Disco ventral adhesivo (disco suctorio)",
        shortLabel: "Disco ventral",
        category: "citoesqueleto",
        categoryLabel: "Órgano de adhesión ventral",
        colorSchematic: "#0ea5e9",
        colorTrichrome: "#2d7a78",
        anchor3D: [-1.45, 2.25, 0.42],
        labelOffset: [-125, -42],
        cameraGoal: {
          position: [-1.8, 2.1, 8.2],
          target: [0.0, 2.0, 0.25],
        },
        summary:
          "Depresión cóncava rígida pero contráctil que ocupa la mitad anteroventral del trofozoíto. Está sostenida por una espiral de microtúbulos y microrribocintas (microribbons) con una muesca posteromedial («bare area»).",
        microscopyNote:
          "En cortes histológicos y perfil lateral se distingue como una concavidad ventral en cuchara; en vista frontal enmarca la región de los dos núcleos.",
        reconstruction3DNote:
          "Modelado como una cúpula cóncava bilobulada en la cara anteroventral con su cresta marginal y hendidura posteromedial característica.",
      },
      {
        id: "nucleos_binucleados",
        number: 2,
        name: "Dos núcleos anteriores con cariosoma central",
        shortLabel: "2 núcleos (cariosomas)",
        category: "organulo",
        categoryLabel: "Núcleos del parásito",
        colorSchematic: "#e11d48",
        colorTrichrome: "#9d174d",
        anchor3D: [1.18, 2.2, -0.05],
        labelOffset: [125, -48],
        cameraGoal: {
          position: [1.2, 2.3, 7.6],
          target: [0.0, 2.2, -0.05],
        },
        summary:
          "Par de núcleos ovoides dispuestos simétricamente a ambos lados de la línea media anterior. Cada núcleo posee un cariosoma central prominente (o ligeramente fragmentado) rodeado de un espacio claro sin cromatina periférica.",
        microscopyNote:
          "En tinción tricrómica los dos cariosomas se tiñen de rojo-púrpura intenso rodeados por un halo pálido, otorgando al trofozoíto su clásico aspecto de «cara con dos ojos».",
        reconstruction3DNote:
          "Representados con su envoltura nuclear ovoide translúcida y el cariosoma central denso en posición dorsal al disco ventral.",
      },
      {
        id: "cuerpos_medianos",
        number: 3,
        name: "Cuerpos medianos (parabasales) en forma de coma",
        shortLabel: "Cuerpos medianos",
        category: "citoesqueleto",
        categoryLabel: "Citoesqueleto microtubular",
        colorSchematic: "#f59e0b",
        colorTrichrome: "#be123c",
        anchor3D: [0.65, -0.15, -0.12],
        labelOffset: [130, 12],
        cameraGoal: {
          position: [1.4, -0.2, 7.8],
          target: [0.2, -0.15, -0.1],
        },
        summary:
          "Par de haces curvos de microtúbulos situados transversalmente u oblicuamente detrás de los dos núcleos y dorsales al axostilo. En Giardia duodenalis adoptan una morfología curvada en «coma» o «garra de martillo».",
        microscopyNote:
          "En tricrómico se tiñen de rojo-púrpura oscuro detrás de los núcleos, completando la «sonrisa» de la apariencia facial del trofozoíto.",
        reconstruction3DNote:
          "Modelados como dos cuerpos fusiformes curvados oblicuos superpuestos en la región ecuatorial posterior al disco suctorio.",
      },
      {
        id: "axostilo_flagelos",
        number: 4,
        name: "Axostilo central, blefaroplastos y 4 pares de flagelos",
        shortLabel: "Axostilo y 8 flagelos",
        category: "citoesqueleto",
        categoryLabel: "Aparato locomotor",
        colorSchematic: "#10b981",
        colorTrichrome: "#6b2146",
        anchor3D: [-0.85, -3.2, 0.15],
        labelOffset: [-128, 46],
        cameraGoal: {
          position: [-1.5, -1.5, 11.5],
          target: [0.0, -1.2, 0.0],
        },
        summary:
          "Ocho flagelos (4 pares: anterior, posterolateral, ventral y caudal) que nacen de los cuerpos basales (blefaroplastos) situados entre los polos anteriores de ambos núcleos. Los axonemas caudales recorren longitudinalmente la línea media formando el axostilo.",
        microscopyNote:
          "En preparaciones en fresco confieren el movimiento característico en «hoja que cae»; en tricrómico se observan el par de axonemas centrales y las raíces flagelares.",
        reconstruction3DNote:
          "Reconstruidos siguiendo sus trayectorias anatómicas reales: quiasma anterior para el par anterolateral, surcos laterales para el par posterolateral, emergencia ventral y prolongación caudal.",
      },
      {
        id: "cuerpo_piriforme",
        number: 5,
        name: "Cuerpo piriforme con simetría bilateral y reborde ventrolateral",
        shortLabel: "Cuerpo piriforme",
        category: "cubierta",
        categoryLabel: "Morfología celular",
        colorSchematic: "#38bdf8",
        colorTrichrome: "#528e85",
        anchor3D: [2.45, 0.3, -0.35],
        labelOffset: [128, 62],
        cameraGoal: {
          position: [4.2, 0.8, 13.8],
          target: [0.0, 0.0, 0.0],
        },
        summary:
          "Cuerpo celular en forma de lágrima o pera invertida: redondeado en el extremo anterior y progresivamente afilado hacia el cono caudal, con dorso abovedado y reborde marginal ventrolateral.",
        microscopyNote:
          "En tinciones permanentes mide de 10 a 20 µm de longitud (promedio 12–15 µm) con citoplasma fino verde-azulado en tricrómico.",
        reconstruction3DNote:
          "Superficie paramétrica continua que reproduce la bóveda dorsal convexa, el aplanamiento ventral y el cono caudal sin uniones geométricas artificiales.",
      },
    ],
  },
  cyst: {
    id: "cyst",
    name: "Quiste ovalado tetranucleado (forma infectante y de resistencia)",
    shortName: "Quiste tetranucleado",
    subtitle:
      "Forma de resistencia ambiental e infectante por vía fecal-oral, con pared hialina lisa, espacio de retracción, 4 núcleos y fibrillas",
    dimensionsNote:
      "Quiste: 8–19 µm de largo (promedio 11–14 µm) × 7–10 µm de ancho · Pared lisa y 4 núcleos en madurez",
    pellicleControlLabel: "Transparencia de la pared quística",
    pellicleControlHint:
      "Regula la opacidad de la pared quística y del citoplasma para observar los 4 núcleos anteriores y las fibrillas intranquísticas.",
    defaultPellicleTransparency: 48,
    defaultCamera: {
      position: [1.6, 1.0, 14.2],
      target: [0.0, 0.0, 0.0],
    },
    focusOrganellesCamera: {
      position: [0.9, 1.2, 8.8],
      target: [0.0, 0.8, 0.0],
    },
    overviewSummary:
      "El quiste de Giardia duodenalis es la etapa resistente responsable de la transmisión fecal-oral (capaz de sobrevivir meses en agua fría y resistir la cloración estándar). En el intestino delgado cada quiste maduro tetranucleado se desenquista liberando dos trofozoítos.",
    structures: [
      {
        id: "pared_quistica",
        number: 1,
        name: "Pared quística hialina y espacio de retracción citoplasmática",
        shortLabel: "Pared quística y halo",
        category: "cubierta",
        categoryLabel: "Cubierta de resistencia",
        colorSchematic: "#38bdf8",
        colorTrichrome: "#5e948c",
        anchor3D: [-2.85, 1.1, 0.4],
        labelOffset: [-126, -38],
        cameraGoal: {
          position: [-2.4, 1.2, 11.8],
          target: [0.0, 0.0, 0.0],
        },
        summary:
          "Cubierta externa ovoide lisa, refringente y bien definida (~0.3–0.5 µm). El citoplasma interno suele retraerse ligeramente de la pared quística dejando un espacio claro peritrófico muy característico.",
        microscopyNote:
          "En fresco y tricrómico el halo claro entre la pared externa lisa y el citoplasma retraído facilita la identificación inmediata del quiste.",
        reconstruction3DNote:
          "Modelada en dos capas concéntricas (pared quística externa translúcida y membrana citoplasmática interna ligeramente retraída en el polo inferior).",
      },
      {
        id: "cuatro_nucleos",
        number: 2,
        name: "Cuatro núcleos anteriores con cariosoma central",
        shortLabel: "4 núcleos anteriores",
        category: "organulo",
        categoryLabel: "Núcleos del quiste maduro",
        colorSchematic: "#e11d48",
        colorTrichrome: "#9d174d",
        anchor3D: [1.05, 2.35, 0.25],
        labelOffset: [125, -45],
        cameraGoal: {
          position: [1.2, 2.1, 7.6],
          target: [0.0, 2.0, 0.0],
        },
        summary:
          "El quiste maduro e infectante contiene 4 núcleos esféricos agrupados habitualmente en uno de los polos (los quistes inmaduros presentan 2). Cada núcleo conserva un cariosoma central compacto sin cromatina periférica.",
        microscopyNote:
          "En preparaciones teñidas con yodo lugol o tricrómico se enfocan en distintos planos ópticos entre 2 y 4 núcleos en el polo anterior.",
        reconstruction3DNote:
          "Dispuestos tridimensionalmente en el polo superior en ligera distribución escalonada dorsoventral, tal como se recorren con el tornillo micrométrico.",
      },
      {
        id: "fibrillas_intranquisticas",
        number: 3,
        name: "Fibrillas longitudinales intranquísticas (axonemas internalizados)",
        shortLabel: "Fibrillas (axonemas)",
        category: "citoesqueleto",
        categoryLabel: "Estructuras fibrilares",
        colorSchematic: "#10b981",
        colorTrichrome: "#6b2146",
        anchor3D: [-0.45, -1.2, 0.12],
        labelOffset: [-128, 42],
        cameraGoal: {
          position: [-1.2, -0.6, 8.2],
          target: [0.0, -0.6, 0.0],
        },
        summary:
          "Durante el enquistamiento, los flagelos se reabsorben dentro del citoplasma, observándose como haces de axonemas longitudinales o diagonales que cruzan el eje mayor del quiste.",
        microscopyNote:
          "Visibles como líneas refringentes oscuras o rojizas que atraviesan longitudinalmente el quiste tanto en lugol como en tricrómico.",
        reconstruction3DNote:
          "Representadas como pares de filamentos microtubulares internos suavemente arqueados a lo largo del citoplasma quístico.",
      },
      {
        id: "cuerpos_parabasales_quiste",
        number: 4,
        name: "Cuerpos medianos y fragmentos retráctiles del disco",
        shortLabel: "Cuerpos medianos / disco",
        category: "citoesqueleto",
        categoryLabel: "Citoesqueleto interno",
        colorSchematic: "#f59e0b",
        colorTrichrome: "#be123c",
        anchor3D: [0.75, -0.55, 0.22],
        labelOffset: [128, 38],
        cameraGoal: {
          position: [1.4, -0.4, 8.0],
          target: [0.2, -0.4, 0.1],
        },
        summary:
          " Cuerpos parabasales gruesos en medialuna y fragmentos fibrosos del disco ventral desensamblado que persisten en la región central y posterior del quiste antes de la división posdesenquistamiento.",
        microscopyNote:
          "En tinción tricrómica destacan como trazos curvos gruesos y muy cromofílicos (rojo-púrpura oscuro) oblicuos a los axonemas.",
        reconstruction3DNote:
          "Modelados como cuerpos semilunares densos dispuestos oblicuamente junto a las fibrillas centrales.",
      },
    ],
  },
};

/**
 * ---------------------------------------------------------------------------
 * CONSTRUCCIÓN MATEMÁTICA DE LAS GEOMETRÍAS ORGÁNICAS 3D DE GIARDIA DUODENALIS
 * ---------------------------------------------------------------------------
 */


/**
 * Construye la malla cerrada y orgánica del cuerpo piriforme del trofozoíto de Giardia duodenalis:
 * - Cara dorsal convexa en bóveda.
 * - Reborde ventrolateral suave (ventrolateral flange).
 * - Cara anteroventral aplanada con depresión cóncava para alojar el disco suctorio.
 * - Cono caudal posterior progresivamente afilado.
 */
function buildPiriformTrophozoiteGeometry(lengthSegs = 96, radialSegs = 72): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const evalSurfacePoint = (uNorm: number, theta: number): THREE.Vector3 => {
    // Distribución cosenoidal en los polos para evitar pellizcos y lograr curvatura suave
    const s = 0.5 * (1.0 - Math.cos(Math.PI * Math.max(0.0, Math.min(1.0, uNorm))));
    const y = -6.8 + 12.4 * s;

    // Perfil piriforme continuo: ancho en s ≈ 0.70, ahusado en lágrima hacia s = 0
    const rx = 3.95 * Math.pow(s, 1.18) * Math.pow(Math.max(0.0, 1.0 - s), 0.42) * 2.42;

    // Coordenada transversal X e indicador ventral/dorsal
    // theta = 0 → cara ventral (+Z); theta = π → dorso (-Z)
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const x = rx * sinT;

    const envZ = Math.pow(s, 0.85) * Math.pow(Math.max(0.0, 1.0 - s), 0.44) * 2.15;

    let z: number;
    if (cosT >= 0.0) {
      // Mitad ventral (+Z): aplanada con concavidad anteroventral para el disco suctorio
      const baseVentral = 0.48 * envZ * Math.pow(cosT, 0.65);
      // Concavidad del disco ventral centrada en y ≈ 2.05 (s ≈ 0.71)
      const dyDisk = (y - 2.05) / 2.85;
      const dxDisk = x / 2.95;
      const rDisk2 = dxDisk * dxDisk + dyDisk * dyDisk;
      const diskScoop = rDisk2 < 1.0 ? 0.52 * Math.pow(1.0 - rDisk2, 1.35) * cosT : 0.0;
      // Ligero reborde ventrolateral (flange) cerca de |sinT| ≈ 0.85
      const flange = 0.14 * envZ * Math.exp(-Math.pow((Math.abs(sinT) - 0.86) / 0.14, 2.0));
      z = baseVentral - diskScoop + flange;
    } else {
      // Mitad dorsal (-Z): bóveda convexa orgánica («lomo de cuchara»)
      const dorsalArch = Math.pow(-cosT, 0.88);
      z = -1.92 * envZ * dorsalArch;
    }

    // Suave curvatura longitudinal del cono caudal hacia el plano dorsal
    const tailBendZ = s < 0.35 ? -0.22 * Math.pow((0.35 - s) / 0.35, 2.0) : 0.0;
    return new THREE.Vector3(x, y, z + tailBendZ);
  };

  const epsU = 0.0012;
  const epsT = 0.0018;

  for (let i = 0; i <= lengthSegs; i++) {
    const u = i / lengthSegs;
    for (let j = 0; j <= radialSegs; j++) {
      const theta = (j / radialSegs) * Math.PI * 2.0;
      const p = evalSurfacePoint(u, theta);
      positions.push(p.x, p.y, p.z);
      uvs.push(u, j / radialSegs);

      if (i === 0) {
        normals.push(0, -1, 0);
      } else if (i === lengthSegs) {
        normals.push(0, 1, 0);
      } else {
        const pU1 = evalSurfacePoint(Math.min(0.999, u + epsU), theta);
        const pU0 = evalSurfacePoint(Math.max(0.001, u - epsU), theta);
        const pT1 = evalSurfacePoint(u, theta + epsT);
        const pT0 = evalSurfacePoint(u, theta - epsT);
        const dU = new THREE.Vector3().subVectors(pU1, pU0);
        const dT = new THREE.Vector3().subVectors(pT1, pT0);
        // dT × dU apunta hacia el exterior de la superficie
        const n = new THREE.Vector3().crossVectors(dT, dU).normalize();
        normals.push(n.x, n.y, n.z);
      }
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < lengthSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, d, b);
      indices.push(b, d, c);
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
 * Construye el disco ventral adhesivo (disco suctorio) de Giardia duodenalis:
 * - Cúpula cóncava bilobulada/reniforme en la cara anteroventral (centrada en y = +2.05 µm).
 * - Posee una cresta periférica arqueada y una escotadura/hendidura posteromedial («bare area»)
 *   por donde emergen los flagelos ventrales.
 */
function buildVentralAdhesiveDiskGeometry(radialSegs = 40, angularSegs = 88): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const evalDiskPoint = (rNorm: number, psi: number): THREE.Vector3 => {
    const rho = Math.max(0.0, Math.min(1.0, rNorm));
    // phi recorre el ángulo en el plano XY del disco; phi = -π/2 es el borde posterior con la muesca
    const phi = (psi / (Math.PI * 2.0)) * Math.PI * 2.0;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    // Muesca posteromedial («bare area» en phi ≈ -π/2, es decir sinPhi ≈ -1, cosPhi ≈ 0)
    const posteriorNotch =
      sinPhi < -0.25 ? 0.34 * Math.exp(-Math.pow(cosPhi / 0.34, 2.0)) * Math.pow((-sinPhi - 0.25) / 0.75, 1.4) : 0.0;

    // Forma ligeramente bilobulada / reniforme de ~5.5 µm de ancho × ~5.0 µm de alto
    const outerRx = 2.75 * (1.0 + 0.05 * cosPhi * cosPhi - 0.35 * posteriorNotch);
    const outerRy = 2.52 * (1.0 - 0.52 * posteriorNotch);

    // El disco tiene grosor finito: psi_vol envuelve la cara ventral y dorsal de la lámina del disco
    const x = rho * outerRx * cosPhi;
    const y = 2.08 + rho * outerRy * sinPhi;

    // Perfil cóncavo en ventosa con reborde marginal elevado (microrribocintas)
    const rimArch = Math.sin(Math.PI * Math.pow(rho, 1.35));
    const cupDepth = -0.32 * (1.0 - rho * rho);
    const microribbonWave = 0.018 * Math.sin(rho * 28.0) * Math.sin(Math.PI * rho);
    const z = 0.36 + cupDepth + 0.16 * rimArch + microribbonWave;

    return new THREE.Vector3(x, y, z);
  };

  // Construimos una lámina volumétrica cerrada (cara ventral + cara dorsal + borde)
  const totalRing = radialSegs * 2;
  const epsR = 0.003;
  const epsP = 0.003;

  const evalThickDisk = (tProfile: number, phi: number): THREE.Vector3 => {
    // tProfile ∈ [0, 1]: 0..0.5 cara ventral (centro → borde), 0.5..1.0 cara dorsal (borde → centro)
    const isBack = tProfile > 0.5;
    const rho = isBack ? (1.0 - tProfile) * 2.0 : tProfile * 2.0;
    const base = evalDiskPoint(rho, phi);
    const halfThick = 0.085 * Math.sin(Math.PI * Math.min(1.0, rho * 0.92 + 0.08));
    base.z += isBack ? -halfThick : halfThick;
    return base;
  };

  for (let i = 0; i <= totalRing; i++) {
    const tP = i / totalRing;
    for (let j = 0; j <= angularSegs; j++) {
      const phi = (j / angularSegs) * Math.PI * 2.0;
      const p = evalThickDisk(tP, phi);
      positions.push(p.x, p.y, p.z);

      const rho = tP > 0.5 ? (1.0 - tP) * 2.0 : tP * 2.0;
      uvs.push(rho, j / angularSegs);

      const pR1 = evalThickDisk(Math.min(0.999, tP + epsR), phi);
      const pR0 = evalThickDisk(Math.max(0.001, tP - epsR), phi);
      const pP1 = evalThickDisk(tP, phi + epsP);
      const pP0 = evalThickDisk(tP, phi - epsP);
      const dR = new THREE.Vector3().subVectors(pR1, pR0);
      const dP = new THREE.Vector3().subVectors(pP1, pP0);
      const n = new THREE.Vector3().crossVectors(dR, dP).normalize();
      if (n.lengthSq() < 0.01) n.set(0, 0, tP <= 0.5 ? 1 : -1);
      normals.push(n.x, n.y, n.z);
    }
  }

  const stride = angularSegs + 1;
  for (let i = 0; i < totalRing; i++) {
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
 * Construye un cuerpo mediano (parabasal) curvado en forma de «coma» o «garra de martillo»
 * característico de Giardia duodenalis.
 */
function buildMedianBodyGeometry(
  xOffset: number,
  yOffset: number,
  zOffset: number,
  tiltZ: number,
  scaleLen = 1.0
): THREE.BufferGeometry {
  const lengthSegs = 44;
  const radialSegs = 24;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const evalPoint = (uNorm: number, phi: number): THREE.Vector3 => {
    const s = uNorm * 2.0 - 1.0; // [-1, 1]
    // Asimetría en forma de coma: extremo izquierdo más grueso y redondeado, extremo derecho más afilado
    const env = Math.sin(Math.PI * uNorm) * (1.0 - 0.32 * uNorm);
    const r = 0.24 * Math.pow(Math.max(0.0, env), 0.78);

    const localX = s * 1.38 * scaleLen;
    const archY = -0.36 * (1.0 - s * s) + 0.12 * s;
    const localY = archY + r * Math.sin(phi);
    const localZ = r * 0.78 * Math.cos(phi);

    const cT = Math.cos(tiltZ);
    const sT = Math.sin(tiltZ);
    const rx = localX * cT - localY * sT + xOffset;
    const ry = localX * sT + localY * cT + yOffset;
    const rz = localZ + zOffset;
    return new THREE.Vector3(rx, ry, rz);
  };

  const epsU = 0.002;
  const epsP = 0.003;

  for (let i = 0; i <= lengthSegs; i++) {
    const t = i / lengthSegs;
    const uNorm = 0.5 * (1.0 - Math.cos(Math.PI * t));
    for (let j = 0; j <= radialSegs; j++) {
      const phi = (j / radialSegs) * Math.PI * 2.0;
      const p = evalPoint(uNorm, phi);
      positions.push(p.x, p.y, p.z);
      uvs.push(uNorm, j / radialSegs);

      if (i === 0 || i === lengthSegs) {
        normals.push(i === 0 ? -1 : 1, 0, 0);
      } else {
        const pU1 = evalPoint(Math.min(0.999, uNorm + epsU), phi);
        const pU0 = evalPoint(Math.max(0.001, uNorm - epsU), phi);
        const pP1 = evalPoint(uNorm, phi + epsP);
        const pP0 = evalPoint(uNorm, phi - epsP);
        const dU = new THREE.Vector3().subVectors(pU1, pU0);
        const dP = new THREE.Vector3().subVectors(pP1, pP0);
        const n = new THREE.Vector3().crossVectors(dP, dU).normalize();
        normals.push(n.x, n.y, n.z);
      }
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < lengthSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, d, b);
      indices.push(b, d, c);
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
 * Construye un filamento flagelar o fibrilar orgánico con ahusamiento progresivo (tapering)
 * a lo largo de una curva 3D suave CatmullRomCurve3, evitando la apariencia de tubos rígidos de plástico.
 */
function buildTaperedFilamentGeometry(
  controlPoints: Array<[number, number, number]>,
  baseRadius: number,
  tipRadius: number,
  tubularSegs = 64,
  radialSegs = 14
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(
    controlPoints.map((pt) => new THREE.Vector3(pt[0], pt[1], pt[2]))
  );
  const frames = curve.computeFrenetFrames(tubularSegs, false);

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= tubularSegs; i++) {
    const u = i / tubularSegs;
    const pt = curve.getPointAt(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    // Ahusamiento suave desde la raíz basal hacia el extremo libre del flagelo
    const r = baseRadius + (tipRadius - baseRadius) * Math.pow(u, 0.85);

    for (let j = 0; j <= radialSegs; j++) {
      const v = j / radialSegs;
      const phi = v * Math.PI * 2.0;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      const nx = cosP * N.x + sinP * B.x;
      const ny = cosP * N.y + sinP * B.y;
      const nz = cosP * N.z + sinP * B.z;

      positions.push(pt.x + r * nx, pt.y + r * ny, pt.z + r * nz);
      normals.push(nx, ny, nz);
      uvs.push(u, v);
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < tubularSegs; i++) {
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

/**
 * Construye una superficie ovoide orgánica para el quiste de Giardia duodenalis:
 * - Pared quística externa: rx = 4.1 µm, ry = 5.9 µm, rz = 3.85 µm (con sutil asimetría ovoide).
 * - Membrana citoplasmática interna retraída: ligeramente menor y desplazada hacia el polo superior (+Y)
 *   para dejar el característico espacio claro peritrófico de retracción en el polo inferior.
 */
function buildOvoideCystShellGeometry(
  rx: number,
  ry: number,
  rz: number,
  yShift = 0.0,
  latSegs = 64,
  lonSegs = 64
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const evalPt = (u: number, v: number): THREE.Vector3 => {
    const theta = u * Math.PI; // [0, π] de polo superior (+Y) a inferior (-Y)
    const phi = v * Math.PI * 2.0;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    // Sutil forma ovoide (ligeramente más ancha en el polo nuclear superior)
    const eggFactor = 1.0 + 0.045 * cosT;
    const x = rx * eggFactor * sinT * Math.cos(phi);
    const y = ry * cosT + yShift;
    const z = rz * eggFactor * sinT * Math.sin(phi);
    return new THREE.Vector3(x, y, z);
  };

  const eps = 0.002;
  for (let i = 0; i <= latSegs; i++) {
    const u = i / latSegs;
    for (let j = 0; j <= lonSegs; j++) {
      const v = j / lonSegs;
      const p = evalPt(u, v);
      positions.push(p.x, p.y, p.z);
      uvs.push(u, v);

      if (i === 0) {
        normals.push(0, 1, 0);
      } else if (i === latSegs) {
        normals.push(0, -1, 0);
      } else {
        const pU1 = evalPt(Math.min(0.999, u + eps), v);
        const pU0 = evalPt(Math.max(0.001, u - eps), v);
        const pV1 = evalPt(u, v + eps);
        const pV0 = evalPt(u, v - eps);
        const dU = new THREE.Vector3().subVectors(pU1, pU0);
        const dV = new THREE.Vector3().subVectors(pV1, pV0);
        const n = new THREE.Vector3().crossVectors(dU, dV).normalize();
        normals.push(n.x, n.y, n.z);
      }
    }
  }

  const stride = lonSegs + 1;
  for (let i = 0; i < latSegs; i++) {
    for (let j = 0; j < lonSegs; j++) {
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
 * SHADERS GLSL ORGÁNICOS (Esquemático 3D y Simulación de Tinción Tricrómica)
 * ---------------------------------------------------------------------------
 */

const ORGANIC_VERTEX_SHADER = `
  varying vec3 v_worldPos;
  varying vec3 v_localPos;
  varying vec3 v_worldNormal;
  varying vec2 v_uv;

  void main() {
    v_uv = uv;
    v_localPos = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    v_worldPos = worldPosition.xyz;
    v_worldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

/**
 * Shader para la película/cuerpo citoplasmático del trofozoíto y la pared quística / citoplasma retraído:
 * - u_shellType: 0 = cuerpo piriforme del trofozoíto, 1 = pared quística hialina externa, 2 = citoplasma quístico retraído.
 * - u_visualMode: 0 = Esquemático 3D, 1 = Simulación Tricrómica (Gomori-Wheatley).
 */
const GIARDIA_SHELL_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;
  varying vec3 v_localPos;
  varying vec3 v_worldNormal;
  varying vec2 v_uv;

  uniform int u_shellType;
  uniform int u_visualMode;
  uniform float u_baseOpacity;
  uniform float u_cutZ;
  uniform int u_highlight;

  void main() {
    if (v_worldPos.z > u_cutZ) discard;

    vec3 N = normalize(v_worldNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - v_worldPos);

    vec3 L1 = normalize(vec3(0.38, 0.76, 0.52));
    vec3 L2 = normalize(vec3(-0.62, -0.35, 0.58));
    vec3 H1 = normalize(L1 + V);

    float wrap1 = max(0.0, (dot(N, L1) + 0.50) / 1.50);
    float diff2 = max(0.0, dot(N, L2));
    float ndotv = max(0.0, dot(N, V));
    float fresnel = pow(1.0 - ndotv, 2.25);
    float softSheen = pow(max(0.0, dot(N, H1)), 14.0) * 0.08;

    vec3 color = vec3(0.0);
    float alpha = u_baseOpacity;

    if (u_visualMode == 0) {
      // MODO 1: ESQUEMÁTICO 3D (Turquesa-cian orgánico con profundidad subsuperficial)
      if (u_shellType == 0) {
        // Cuerpo piriforme del trofozoíto
        vec3 coreCol = vec3(0.14, 0.56, 0.72);
        vec3 deepCol = vec3(0.06, 0.30, 0.46);
        vec3 rimCol  = vec3(0.38, 0.82, 0.95);

        vec3 base = mix(coreCol, deepCol, 0.35 + 0.45 * fresnel);
        color = base * (0.34 + 0.52 * wrap1 + 0.20 * diff2)
              + rimCol * (0.28 * fresnel)
              + vec3(0.85, 0.96, 1.0) * softSheen;
        alpha = clamp(u_baseOpacity * (0.48 + 0.58 * fresnel), 0.06, 0.92);
      } else if (u_shellType == 1) {
        // Pared quística externa hialina y refringente
        vec3 wallCore = vec3(0.32, 0.74, 0.92);
        vec3 wallRim  = vec3(0.68, 0.92, 1.00);
        vec3 base = mix(wallCore, wallRim, fresnel * 0.72);
        color = base * (0.42 + 0.48 * wrap1 + 0.18 * diff2) + vec3(0.95, 0.99, 1.0) * softSheen * 1.4;
        alpha = clamp(u_baseOpacity * (0.32 + 0.78 * pow(fresnel, 0.85)), 0.06, 0.94);
      } else {
        // Citoplasma interno retraído del quiste
        vec3 cytoCore = vec3(0.12, 0.48, 0.64);
        vec3 cytoRim  = vec3(0.28, 0.68, 0.82);
        vec3 base = mix(cytoCore, cytoRim, fresnel * 0.55);
        color = base * (0.36 + 0.50 * wrap1 + 0.18 * diff2);
        alpha = clamp(u_baseOpacity * (0.42 + 0.45 * fresnel), 0.05, 0.86);
      }
    } else {
      // MODO 2: SIMULACIÓN TRICRÓMICA (Verde-azulado glauco Gomori-Wheatley sobre campo claro cálido)
      if (u_shellType == 0) {
        vec3 triCenter = vec3(0.54, 0.78, 0.74);
        vec3 triEdge   = vec3(0.26, 0.52, 0.49);
        vec3 base = mix(triCenter, triEdge, 0.25 + 0.65 * fresnel);
        color = base * (0.54 + 0.38 * wrap1 + 0.14 * diff2) + vec3(0.90, 0.96, 0.95) * softSheen * 0.5;
        alpha = clamp(u_baseOpacity * (0.44 + 0.60 * fresnel), 0.06, 0.92);
      } else if (u_shellType == 1) {
        // Pared quística refringente con halo claro
        vec3 wallInner = vec3(0.76, 0.88, 0.85);
        vec3 wallOuter = vec3(0.32, 0.56, 0.53);
        vec3 base = mix(wallInner, wallOuter, pow(fresnel, 0.75));
        color = base * (0.58 + 0.35 * wrap1 + 0.12 * diff2);
        alpha = clamp(u_baseOpacity * (0.28 + 0.80 * pow(fresnel, 0.80)), 0.06, 0.94);
      } else {
        // Citoplasma quístico retraído verde-azulado
        vec3 cytoIn  = vec3(0.50, 0.75, 0.71);
        vec3 cytoOut = vec3(0.28, 0.54, 0.51);
        vec3 base = mix(cytoIn, cytoOut, fresnel * 0.65);
        color = base * (0.52 + 0.40 * wrap1 + 0.12 * diff2);
        alpha = clamp(u_baseOpacity * (0.40 + 0.48 * fresnel), 0.05, 0.86);
      }
    }

    if (u_highlight == 1) {
      color += vec3(0.10, 0.22, 0.28) * (0.45 + 0.55 * fresnel);
      alpha = max(alpha, 0.55);
    }

    color = color / (1.0 + color * 0.12);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Shader para los orgánulos internos de Giardia duodenalis:
 * - u_organelleType:
 *   1 = Disco ventral adhesivo (con patrón sutil de microrribocintas concéntricas)
 *   2 = Cariosoma central denso (núcleos)
 *   3 = Envoltura nuclear perinuclear translúcida
 *   4 = Cuerpos medianos (parabasales en coma)
 *   5 = Axostilo, blefaroplastos, flagelos y fibrillas intranquísticas
 */
const GIARDIA_ORGANELLE_FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 v_worldPos;
  varying vec3 v_localPos;
  varying vec3 v_worldNormal;
  varying vec2 v_uv;

  uniform int u_organelleType;
  uniform int u_visualMode;
  uniform float u_cutZ;
  uniform int u_highlight;
  uniform float u_opacity;

  void main() {
    if (v_worldPos.z > u_cutZ) discard;

    vec3 N = normalize(v_worldNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - v_worldPos);

    vec3 L1 = normalize(vec3(0.42, 0.78, 0.52));
    vec3 L2 = normalize(vec3(-0.65, -0.28, 0.55));
    vec3 H1 = normalize(L1 + V);

    float wrap1 = max(0.0, (dot(N, L1) + 0.52) / 1.52);
    float diff2 = max(0.0, dot(N, L2));
    float ndotv = max(0.0, dot(N, V));
    float fresnel = pow(1.0 - ndotv, 2.1);
    float softSpec = pow(max(0.0, dot(N, H1)), 16.0) * 0.09;

    vec3 color = vec3(0.0);
    float alpha = u_opacity;

    if (u_organelleType == 1) {
      // --- 1. DISCO VENTRAL ADHESIVO (Con estriación concéntrica suave de microrribocintas) ---
      float ribbonPattern = 0.5 + 0.5 * sin(v_uv.x * 38.0);
      float rimMask = smoothstep(0.62, 0.98, v_uv.x);
      if (u_visualMode == 0) {
        vec3 diskCenter = vec3(0.08, 0.48, 0.76);
        vec3 diskRim    = vec3(0.22, 0.72, 0.96);
        vec3 base = mix(diskCenter, diskRim, 0.35 * rimMask + 0.14 * ribbonPattern);
        color = base * (0.34 + 0.54 * wrap1 + 0.20 * diff2) + vec3(0.75, 0.94, 1.0) * fresnel * 0.24;
        alpha = clamp(0.68 + 0.24 * rimMask, 0.55, 0.92);
      } else {
        vec3 triDiskIn  = vec3(0.32, 0.62, 0.60);
        vec3 triDiskRim = vec3(0.16, 0.42, 0.41);
        vec3 base = mix(triDiskIn, triDiskRim, 0.48 * rimMask + 0.12 * ribbonPattern + 0.30 * fresnel);
        color = base * (0.48 + 0.42 * wrap1 + 0.15 * diff2);
        alpha = clamp(0.66 + 0.24 * rimMask, 0.55, 0.92);
      }
    } else if (u_organelleType == 2) {
      // --- 2. CARIOSOMA CENTRAL DENSO (Núcleos) ---
      if (u_visualMode == 0) {
        vec3 karCore = vec3(0.86, 0.14, 0.36);
        vec3 karDeep = vec3(0.48, 0.05, 0.18);
        vec3 base = mix(karCore, karDeep, fresnel * 0.55);
        color = base * (0.30 + 0.58 * wrap1 + 0.20 * diff2)
              + vec3(0.98, 0.42, 0.58) * fresnel * 0.25
              + vec3(1.0, 0.88, 0.92) * softSpec;
      } else {
        // Tricrómico: Rojo-púrpura / rubí cromofílico intenso
        vec3 triKarCore = vec3(0.64, 0.08, 0.30);
        vec3 triKarDeep = vec3(0.40, 0.03, 0.18);
        vec3 base = mix(triKarCore, triKarDeep, fresnel * 0.60);
        color = base * (0.46 + 0.45 * wrap1 + 0.15 * diff2) + vec3(0.95, 0.80, 0.86) * softSpec * 0.6;
      }
    } else if (u_organelleType == 3) {
      // --- 3. ENVOLTURA PERINUCLEAR CLARA (Halo sin cromatina periférica) ---
      if (u_visualMode == 0) {
        vec3 envCenter = vec3(0.82, 0.92, 0.98);
        vec3 envRim    = vec3(0.94, 0.42, 0.58);
        vec3 base = mix(envCenter, envRim, pow(fresnel, 0.85));
        color = base * (0.45 + 0.45 * wrap1 + 0.15 * diff2);
        alpha = clamp(0.24 + 0.52 * fresnel, 0.20, 0.76);
      } else {
        vec3 envTriIn  = vec3(0.95, 0.93, 0.91);
        vec3 envTriRim = vec3(0.58, 0.24, 0.38);
        vec3 base = mix(envTriIn, envTriRim, pow(fresnel, 0.80));
        color = base * (0.58 + 0.34 * wrap1 + 0.12 * diff2);
        alpha = clamp(0.32 + 0.48 * fresnel, 0.26, 0.78);
      }
    } else if (u_organelleType == 4) {
      // --- 4. CUERPOS MEDIANOS / PARABASALES EN COMA ---
      if (u_visualMode == 0) {
        vec3 medCore = vec3(0.94, 0.58, 0.10);
        vec3 medDeep = vec3(0.62, 0.30, 0.04);
        vec3 base = mix(medCore, medDeep, fresnel * 0.52);
        color = base * (0.30 + 0.58 * wrap1 + 0.20 * diff2)
              + vec3(1.0, 0.78, 0.38) * fresnel * 0.24
              + vec3(1.0, 0.92, 0.76) * softSpec;
      } else {
        // Tricrómico: Rojo-magenta / púrpura oscuro muy marcado
        vec3 triMedCore = vec3(0.72, 0.10, 0.28);
        vec3 triMedDeep = vec3(0.45, 0.04, 0.16);
        vec3 base = mix(triMedCore, triMedDeep, fresnel * 0.58);
        color = base * (0.46 + 0.45 * wrap1 + 0.15 * diff2);
      }
    } else {
      // --- 5. AXOSTILO, BLEFAROPLASTOS, 8 FLAGELOS Y FIBRILLAS INTRANQUÍSTICAS ---
      if (u_visualMode == 0) {
        vec3 axCore = vec3(0.12, 0.78, 0.56);
        vec3 axDeep = vec3(0.05, 0.44, 0.32);
        vec3 base = mix(axCore, axDeep, fresnel * 0.48);
        color = base * (0.32 + 0.56 * wrap1 + 0.20 * diff2)
              + vec3(0.48, 0.96, 0.78) * fresnel * 0.24
              + vec3(0.88, 1.0, 0.95) * softSpec;
      } else {
        // Tricrómico: Fibrillas y axonemas teñidos en tono vino/violáceo-rojizo oscuro
        vec3 triAxCore = vec3(0.48, 0.16, 0.32);
        vec3 triAxDeep = vec3(0.28, 0.08, 0.18);
        vec3 base = mix(triAxCore, triAxDeep, fresnel * 0.55);
        color = base * (0.45 + 0.45 * wrap1 + 0.15 * diff2);
      }
    }

    if (u_highlight == 1) {
      color += vec3(0.16, 0.22, 0.26) * (0.45 + 0.55 * fresnel);
      alpha = max(alpha, 0.86);
    } else if (u_highlight == -1) {
      color *= 0.80;
    }

    color = color / (1.0 + color * 0.12);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Shader del plano de corte geométrico (Superficie de sección 3D comprensible para Giardia duodenalis)
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

  uniform int u_formMode;       // 0 = trofozoíto, 1 = quiste
  uniform int u_visualMode;     // 0 = Esquemático 3D, 1 = Simulación Tricrómica
  uniform float u_pellicleOpacity;
  uniform float u_cutActive;

  float ellipsoidDist(vec3 p, vec3 c, vec3 r) {
    vec3 d = (p - c) / r;
    return length(d);
  }

  void main() {
    if (u_cutActive < 0.5) discard;

    vec3 p = v_worldPos;

    if (u_formMode == 0) {
      // --- SECCIÓN DEL TROFOZOÍTO PIRIFORME BINUCLEADO ---
      float s = (p.y + 6.8) / 12.4;
      if (s <= 0.005 || s >= 0.995) discard;

      float rx = 3.95 * pow(s, 1.18) * pow(max(0.0, 1.0 - s), 0.42) * 2.42;
      if (abs(p.x) > rx) discard;

      float nx = p.x / max(0.01, rx);
      float cosT = sqrt(max(0.0, 1.0 - nx * nx));
      float envZ = pow(s, 0.85) * pow(max(0.0, 1.0 - s), 0.44) * 2.15;
      float tailBendZ = (s < 0.35) ? -0.22 * pow((0.35 - s) / 0.35, 2.0) : 0.0;

      float dyDisk = (p.y - 2.05) / 2.85;
      float dxDisk = p.x / 2.95;
      float rDisk2 = dxDisk * dxDisk + dyDisk * dyDisk;
      float diskScoop = (rDisk2 < 1.0) ? 0.52 * pow(1.0 - rDisk2, 1.35) * cosT : 0.0;
      float flange = 0.14 * envZ * exp(-pow((abs(nx) - 0.86) / 0.14, 2.0));

      float zMaxVentral = 0.48 * envZ * pow(cosT, 0.65) - diskScoop + flange + tailBendZ;
      float zMinDorsal  = -1.92 * envZ * pow(cosT, 0.88) + tailBendZ;

      if (p.z > zMaxVentral || p.z < zMinDorsal) discard;

      // 1. Núcleos y cariosomas en sección
      float dKarL = ellipsoidDist(p, vec3(-1.18, 2.18, -0.18), vec3(0.36, 0.46, 0.28));
      float dKarR = ellipsoidDist(p, vec3( 1.18, 2.18, -0.18), vec3(0.36, 0.46, 0.28));
      if (min(dKarL, dKarR) <= 1.0) {
        vec3 col = (u_visualMode == 0) ? vec3(0.84, 0.14, 0.36) : vec3(0.62, 0.08, 0.29);
        gl_FragColor = vec4(col, 0.98);
        return;
      }

      float dNucL = ellipsoidDist(p, vec3(-1.18, 2.18, -0.18), vec3(0.82, 1.08, 0.56));
      float dNucR = ellipsoidDist(p, vec3( 1.18, 2.18, -0.18), vec3(0.82, 1.08, 0.56));
      if (min(dNucL, dNucR) <= 1.0) {
        vec3 col = (u_visualMode == 0) ? vec3(0.78, 0.90, 0.98) : vec3(0.92, 0.89, 0.88);
        gl_FragColor = vec4(col, 0.88);
        return;
      }

      // 2. Cuerpos medianos en sección
      float dMed1 = ellipsoidDist(p, vec3(0.10, -0.10, -0.22), vec3(1.25, 0.26, 0.22));
      float dMed2 = ellipsoidDist(p, vec3(0.22, -0.46, -0.14), vec3(1.10, 0.24, 0.20));
      if (min(dMed1, dMed2) <= 1.0) {
        vec3 col = (u_visualMode == 0) ? vec3(0.92, 0.56, 0.10) : vec3(0.70, 0.10, 0.27);
        gl_FragColor = vec4(col, 0.96);
        return;
      }

      // 3. Axostilo central en sección
      if (p.y >= -6.4 && p.y <= 3.1) {
        float dAxL = length(vec2((p.x + 0.13) / 0.09, (p.z + 0.08) / 0.09));
        float dAxR = length(vec2((p.x - 0.13) / 0.09, (p.z + 0.08) / 0.09));
        if (min(dAxL, dAxR) <= 1.0) {
          vec3 col = (u_visualMode == 0) ? vec3(0.12, 0.78, 0.56) : vec3(0.48, 0.16, 0.32);
          gl_FragColor = vec4(col, 0.96);
          return;
        }
      }

      // 4. Estroma citoplasmático y película
      float distEdge = min(zMaxVentral - p.z, p.z - zMinDorsal);
      float memMask = 1.0 - smoothstep(0.0, 0.10, distEdge);
      vec3 cytoFill = (u_visualMode == 0) ? vec3(0.12, 0.48, 0.64) : vec3(0.52, 0.76, 0.72);
      vec3 cytoRim  = (u_visualMode == 0) ? vec3(0.36, 0.80, 0.94) : vec3(0.26, 0.52, 0.49);
      gl_FragColor = vec4(mix(cytoFill, cytoRim, memMask * 0.82), clamp(u_pellicleOpacity * 0.88 + 0.18, 0.22, 0.92));
      return;

    } else {
      // --- SECCIÓN DEL QUISTE OVALADO TETRANUCLEADO ---
      float dOuter = ellipsoidDist(p, vec3(0.0, 0.0, 0.0), vec3(4.10, 5.90, 3.85));
      if (dOuter > 1.0) discard;

      // Pared quística externa hialina
      if (dOuter > 0.935) {
        vec3 wallCol = (u_visualMode == 0) ? vec3(0.52, 0.86, 0.98) : vec3(0.36, 0.60, 0.56);
        gl_FragColor = vec4(wallCol, 0.92);
        return;
      }

      // Citoplasma interno retraído (desplazado a y = +0.26 para mostrar el espacio claro peritrófico)
      float dInner = ellipsoidDist(p, vec3(0.0, 0.26, 0.0), vec3(3.62, 5.22, 3.38));
      if (dInner > 1.0) {
        // Espacio claro de retracción submembranoso
        vec3 haloCol = (u_visualMode == 0) ? vec3(0.82, 0.94, 0.99) : vec3(0.95, 0.94, 0.91);
        gl_FragColor = vec4(haloCol, 0.34);
        return;
      }

      // 4 núcleos anteriores y cariosomas en el polo superior
      float dK1 = ellipsoidDist(p, vec3(-1.15, 2.55,  0.32), vec3(0.30, 0.30, 0.30));
      float dK2 = ellipsoidDist(p, vec3( 1.15, 2.55,  0.32), vec3(0.30, 0.30, 0.30));
      float dK3 = ellipsoidDist(p, vec3(-0.68, 1.55, -0.35), vec3(0.28, 0.28, 0.28));
      float dK4 = ellipsoidDist(p, vec3( 0.68, 1.55, -0.35), vec3(0.28, 0.28, 0.28));
      if (min(min(dK1, dK2), min(dK3, dK4)) <= 1.0) {
        vec3 col = (u_visualMode == 0) ? vec3(0.84, 0.14, 0.36) : vec3(0.62, 0.08, 0.29);
        gl_FragColor = vec4(col, 0.98);
        return;
      }

      float dN1 = ellipsoidDist(p, vec3(-1.15, 2.55,  0.32), vec3(0.68, 0.68, 0.62));
      float dN2 = ellipsoidDist(p, vec3( 1.15, 2.55,  0.32), vec3(0.68, 0.68, 0.62));
      float dN3 = ellipsoidDist(p, vec3(-0.68, 1.55, -0.35), vec3(0.64, 0.64, 0.58));
      float dN4 = ellipsoidDist(p, vec3( 0.68, 1.55, -0.35), vec3(0.64, 0.64, 0.58));
      if (min(min(dN1, dN2), min(dN3, dN4)) <= 1.0) {
        vec3 col = (u_visualMode == 0) ? vec3(0.78, 0.90, 0.98) : vec3(0.92, 0.89, 0.88);
        gl_FragColor = vec4(col, 0.88);
        return;
      }

      // Cuerpos medianos / fragmentos del disco en el quiste
      float dCM1 = ellipsoidDist(p, vec3( 0.45, -0.45,  0.18), vec3(1.15, 0.26, 0.22));
      float dCM2 = ellipsoidDist(p, vec3(-0.35, -1.25, -0.15), vec3(1.05, 0.24, 0.20));
      if (min(dCM1, dCM2) <= 1.0) {
        vec3 col = (u_visualMode == 0) ? vec3(0.92, 0.56, 0.10) : vec3(0.70, 0.10, 0.27);
        gl_FragColor = vec4(col, 0.96);
        return;
      }

      // Estroma del citoplasma quístico retraído
      vec3 cFill = (u_visualMode == 0) ? vec3(0.12, 0.48, 0.64) : vec3(0.50, 0.75, 0.71);
      vec3 cRim  = (u_visualMode == 0) ? vec3(0.28, 0.68, 0.82) : vec3(0.28, 0.54, 0.51);
      float rim = smoothstep(0.88, 1.0, dInner);
      gl_FragColor = vec4(mix(cFill, cRim, rim * 0.85), clamp(u_pellicleOpacity * 0.86 + 0.18, 0.22, 0.90));
      return;
    }
  }
`;

export interface Giardia3DViewerProps {
  onClose?: () => void;
}

export const Giardia3DViewer: React.FC<Giardia3DViewerProps> = ({ onClose }) => {
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
  const cutZRef = useRef<number>(8.0);

  // Transición suave de cámara
  const camTransitionRef = useRef<{
    active: boolean;
    goalPos: THREE.Vector3;
    goalTarget: THREE.Vector3;
  }>({
    active: false,
    goalPos: new THREE.Vector3(...GIARDIA_FORMS.trophozoite.defaultCamera.position),
    goalTarget: new THREE.Vector3(...GIARDIA_FORMS.trophozoite.defaultCamera.target),
  });

  // Estados de la interfaz
  const [activeForm, setActiveForm] = useState<GiardiaFormId>("trophozoite");
  const [isFormDropdownOpen, setIsFormDropdownOpen] = useState(false);
  const [visualMode, setVisualMode] = useState<GiardiaVisualMode>("schematic");
  const [showMarkers, setShowMarkers] = useState(true);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [isFocusedOnOrganelles, setIsFocusedOnOrganelles] = useState(false);
  const [pellicleTransparency, setPellicleTransparency] = useState<number>(
    GIARDIA_FORMS.trophozoite.defaultPellicleTransparency
  );
  const [cutPercent, setCutPercent] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [mobileTouchInteractive, setMobileTouchInteractive] = useState(false);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [scaleBarPx, setScaleBarPx] = useState<number>(64);

  // Posiciones 2D proyectadas para las etiquetas y sus líneas guía SVG (sin solapamientos)
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

  const formMeta = GIARDIA_FORMS[activeForm];
  const selectedStructure =
    formMeta.structures.find((s) => s.id === selectedStructureId) || null;

  // Cerrar el desplegable «Elegir forma» al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFormDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Limpieza recursiva de geometrías y materiales
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

  // Construir la geometría 3D correspondiente a la forma activa («trophozoite» o «cyst»)
  const buildForm3DScene = useCallback(
    (formId: GiardiaFormId, scene: THREE.Scene) => {
      if (modelRootRef.current) {
        scene.remove(modelRootRef.current);
        disposeGroup(modelRootRef.current);
        modelRootRef.current = null;
        sectionCapMeshRef.current = null;
      }

      const root = new THREE.Group();
      modelRootRef.current = root;

      if (formId === "trophozoite") {
        // --- FORMA 1: TROFOZOÍTO PIRIFORME BINUCLEADO ---

        // 1. Dos núcleos anteriores (envoltura perinuclear clara + cariosoma central denso)
        const nucCenters: Array<[number, number, number]> = [
          [-1.18, 2.18, -0.18],
          [1.18, 2.18, -0.18],
        ];

        nucCenters.forEach(([nx, ny, nz]) => {
          // Cariosoma central compacto
          const karGeo = new THREE.SphereGeometry(1.0, 32, 24);
          karGeo.scale(0.36, 0.46, 0.28);
          const karMat = new THREE.ShaderMaterial({
            vertexShader: ORGANIC_VERTEX_SHADER,
            fragmentShader: GIARDIA_ORGANELLE_FRAGMENT_SHADER,
            uniforms: {
              u_organelleType: { value: 2 },
              u_visualMode: { value: 0 },
              u_cutZ: { value: 8.0 },
              u_highlight: { value: 0 },
              u_opacity: { value: 1.0 },
            },
            transparent: false,
            depthWrite: true,
            side: THREE.DoubleSide,
          });
          const karMesh = new THREE.Mesh(karGeo, karMat);
          karMesh.position.set(nx, ny, nz);
          karMesh.userData = { structureId: "nucleos_binucleados", shaderType: "organelle" };
          karMesh.renderOrder = 1;
          root.add(karMesh);

          // Envoltura nuclear perinuclear translúcida
          const envGeo = new THREE.SphereGeometry(1.0, 36, 28);
          envGeo.scale(0.82, 1.08, 0.56);
          const envMat = new THREE.ShaderMaterial({
            vertexShader: ORGANIC_VERTEX_SHADER,
            fragmentShader: GIARDIA_ORGANELLE_FRAGMENT_SHADER,
            uniforms: {
              u_organelleType: { value: 3 },
              u_visualMode: { value: 0 },
              u_cutZ: { value: 8.0 },
              u_highlight: { value: 0 },
              u_opacity: { value: 0.42 },
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const envMesh = new THREE.Mesh(envGeo, envMat);
          envMesh.position.set(nx, ny, nz);
          envMesh.userData = { structureId: "nucleos_binucleados", shaderType: "organelle" };
          envMesh.renderOrder = 2;
          root.add(envMesh);
        });

        // 2. Cuerpos medianos (parabasales) en forma de «coma» o «garra de martillo»
        const medMatBase = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: GIARDIA_ORGANELLE_FRAGMENT_SHADER,
          uniforms: {
            u_organelleType: { value: 4 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 8.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 1.0 },
          },
          transparent: false,
          depthWrite: true,
          side: THREE.DoubleSide,
        });

        const med1Geo = buildMedianBodyGeometry(0.08, -0.08, -0.22, -0.22, 1.0);
        const med1Mesh = new THREE.Mesh(med1Geo, medMatBase.clone());
        med1Mesh.userData = { structureId: "cuerpos_medianos", shaderType: "organelle" };
        med1Mesh.renderOrder = 1;
        root.add(med1Mesh);

        const med2Geo = buildMedianBodyGeometry(0.18, -0.46, -0.14, -0.26, 0.88);
        const med2Mesh = new THREE.Mesh(med2Geo, medMatBase.clone());
        med2Mesh.userData = { structureId: "cuerpos_medianos", shaderType: "organelle" };
        med2Mesh.renderOrder = 1;
        root.add(med2Mesh);

        // 3. Axostilo central, blefaroplastos y los 4 pares de flagelos (8 flagelos en total)
        const flagMatBase = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: GIARDIA_ORGANELLE_FRAGMENT_SHADER,
          uniforms: {
            u_organelleType: { value: 5 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 8.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 1.0 },
          },
          transparent: false,
          depthWrite: true,
          side: THREE.DoubleSide,
        });

        // Blefaroplastos (kinetosomas / cuerpos basales entre los polos anteriores de ambos núcleos)
        const kinetosomes: Array<[number, number, number]> = [
          [-0.24, 2.95, -0.05],
          [0.24, 2.95, -0.05],
          [-0.18, 2.65, -0.06],
          [0.18, 2.65, -0.06],
        ];
        kinetosomes.forEach(([kx, ky, kz]) => {
          const kGeo = new THREE.SphereGeometry(0.13, 18, 14);
          const kMesh = new THREE.Mesh(kGeo, flagMatBase.clone());
          kMesh.position.set(kx, ky, kz);
          kMesh.userData = { structureId: "axostilo_flagelos", shaderType: "organelle" };
          kMesh.renderOrder = 1;
          root.add(kMesh);
        });

        // Trayectorias anatómicas de los 4 pares de flagelos (incluyendo los 2 axonemas axiales/caudales)
        const flagellaPaths: Array<{
          pts: Array<[number, number, number]>;
          rBase: number;
          rTip: number;
        }> = [
          // Par 1: Axonemas centrales longitudinales (axostilo) + Flagelos caudales (izquierdo y derecho)
          {
            pts: [
              [-0.15, 2.85, -0.06],
              [-0.14, 0.5, -0.08],
              [-0.12, -3.2, -0.08],
              [-0.10, -6.75, -0.22],
              [-0.45, -8.5, -0.28],
              [-0.20, -10.3, -0.15],
            ],
            rBase: 0.082,
            rTip: 0.026,
          },
          {
            pts: [
              [0.15, 2.85, -0.06],
              [0.14, 0.5, -0.08],
              [0.12, -3.2, -0.08],
              [0.10, -6.75, -0.22],
              [0.45, -8.5, -0.28],
              [0.20, -10.3, -0.15],
            ],
            rBase: 0.082,
            rTip: 0.026,
          },
          // Par 2: Flagelos anteriores (se cruzan en el quiasma anterior y emergen anterolateralmente)
          {
            pts: [
              [-0.22, 2.95, -0.03],
              [0.0, 3.65, 0.02],
              [1.45, 4.45, 0.08],
              [3.15, 4.10, 0.14],
              [4.85, 3.15, 0.25],
              [5.95, 1.55, 0.10],
            ],
            rBase: 0.068,
            rTip: 0.024,
          },
          {
            pts: [
              [0.22, 2.95, -0.03],
              [0.0, 3.65, -0.02],
              [-1.45, 4.45, 0.08],
              [-3.15, 4.10, 0.14],
              [-4.85, 3.15, 0.25],
              [-5.95, 1.55, 0.10],
            ],
            rBase: 0.068,
            rTip: 0.024,
          },
          // Par 3: Flagelos posterolaterales (recorren el cuerpo y emergen posterolateralmente)
          {
            pts: [
              [-0.20, 2.65, -0.05],
              [-1.15, 0.95, -0.02],
              [-2.25, -1.45, 0.05],
              [-3.55, -3.55, 0.15],
              [-4.85, -5.65, 0.05],
            ],
            rBase: 0.068,
            rTip: 0.024,
          },
          {
            pts: [
              [0.20, 2.65, -0.05],
              [1.15, 0.95, -0.02],
              [2.25, -1.45, 0.05],
              [3.55, -3.55, 0.15],
              [4.85, -5.65, 0.05],
            ],
            rBase: 0.068,
            rTip: 0.024,
          },
          // Par 4: Flagelos ventrales (emergen en la depresión ventral tras el disco suctorio)
          {
            pts: [
              [-0.14, 2.55, 0.04],
              [-0.36, 0.45, 0.34],
              [-0.65, -1.65, 0.78],
              [-0.42, -3.85, 1.18],
              [-0.82, -5.85, 0.92],
            ],
            rBase: 0.068,
            rTip: 0.024,
          },
          {
            pts: [
              [0.14, 2.55, 0.04],
              [0.36, 0.45, 0.34],
              [0.65, -1.65, 0.78],
              [0.42, -3.85, 1.18],
              [0.82, -5.85, 0.92],
            ],
            rBase: 0.068,
            rTip: 0.024,
          },
        ];

        flagellaPaths.forEach((fp) => {
          const fGeo = buildTaperedFilamentGeometry(fp.pts, fp.rBase, fp.rTip, 56, 12);
          const fMesh = new THREE.Mesh(fGeo, flagMatBase.clone());
          fMesh.userData = { structureId: "axostilo_flagelos", shaderType: "organelle" };
          fMesh.renderOrder = 1;
          root.add(fMesh);
        });

        // 4. Disco ventral adhesivo (disco suctorio anteroventral bilobulado)
        const diskGeo = buildVentralAdhesiveDiskGeometry(36, 84);
        const diskMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: GIARDIA_ORGANELLE_FRAGMENT_SHADER,
          uniforms: {
            u_organelleType: { value: 1 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 8.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 0.78 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const diskMesh = new THREE.Mesh(diskGeo, diskMat);
        diskMesh.userData = { structureId: "disco_ventral", shaderType: "organelle" };
        diskMesh.renderOrder = 3;
        root.add(diskMesh);

        // 5. Cuerpo piriforme del trofozoíto en dos pasadas (BackSide + FrontSide) para transparencia volumétrica limpia
        const bodyGeo = buildPiriformTrophozoiteGeometry(96, 72);
        const bodyBackMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: GIARDIA_SHELL_FRAGMENT_SHADER,
          uniforms: {
            u_shellType: { value: 0 },
            u_visualMode: { value: 0 },
            u_baseOpacity: { value: 0.50 },
            u_cutZ: { value: 8.0 },
            u_highlight: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.BackSide,
        });
        const bodyBackMesh = new THREE.Mesh(bodyGeo, bodyBackMat);
        bodyBackMesh.userData = { structureId: "cuerpo_piriforme", shaderType: "shell" };
        bodyBackMesh.renderOrder = 4;
        root.add(bodyBackMesh);

        const bodyFrontMat = bodyBackMat.clone();
        bodyFrontMat.side = THREE.FrontSide;
        const bodyFrontMesh = new THREE.Mesh(bodyGeo, bodyFrontMat);
        bodyFrontMesh.userData = { structureId: "cuerpo_piriforme", shaderType: "shell" };
        bodyFrontMesh.renderOrder = 5;
        root.add(bodyFrontMesh);
      } else {
        // --- FORMA 2: QUISTE OVALADO TETRANUCLEADO ---

        // 1. Cuatro núcleos agrupados en el polo anterior (y > 0)
        const cystNuclei: Array<{ pos: [number, number, number]; rScale: number }> = [
          { pos: [-1.15, 2.55, 0.32], rScale: 1.0 },
          { pos: [1.15, 2.55, 0.32], rScale: 1.0 },
          { pos: [-0.68, 1.55, -0.35], rScale: 0.94 },
          { pos: [0.68, 1.55, -0.35], rScale: 0.94 },
        ];

        cystNuclei.forEach(({ pos, rScale }) => {
          const karGeo = new THREE.SphereGeometry(0.30 * rScale, 28, 22);
          const karMat = new THREE.ShaderMaterial({
            vertexShader: ORGANIC_VERTEX_SHADER,
            fragmentShader: GIARDIA_ORGANELLE_FRAGMENT_SHADER,
            uniforms: {
              u_organelleType: { value: 2 },
              u_visualMode: { value: 0 },
              u_cutZ: { value: 8.0 },
              u_highlight: { value: 0 },
              u_opacity: { value: 1.0 },
            },
            transparent: false,
            depthWrite: true,
            side: THREE.DoubleSide,
          });
          const karMesh = new THREE.Mesh(karGeo, karMat);
          karMesh.position.set(...pos);
          karMesh.userData = { structureId: "cuatro_nucleos", shaderType: "organelle" };
          karMesh.renderOrder = 1;
          root.add(karMesh);

          const envGeo = new THREE.SphereGeometry(1.0, 32, 24);
          envGeo.scale(0.68 * rScale, 0.68 * rScale, 0.62 * rScale);
          const envMat = new THREE.ShaderMaterial({
            vertexShader: ORGANIC_VERTEX_SHADER,
            fragmentShader: GIARDIA_ORGANELLE_FRAGMENT_SHADER,
            uniforms: {
              u_organelleType: { value: 3 },
              u_visualMode: { value: 0 },
              u_cutZ: { value: 8.0 },
              u_highlight: { value: 0 },
              u_opacity: { value: 0.42 },
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const envMesh = new THREE.Mesh(envGeo, envMat);
          envMesh.position.set(...pos);
          envMesh.userData = { structureId: "cuatro_nucleos", shaderType: "organelle" };
          envMesh.renderOrder = 2;
          root.add(envMesh);
        });

        // 2. Cuerpos medianos / fragmentos semilunares del disco en el quiste
        const cystMedMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: GIARDIA_ORGANELLE_FRAGMENT_SHADER,
          uniforms: {
            u_organelleType: { value: 4 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 8.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 1.0 },
          },
          transparent: false,
          depthWrite: true,
          side: THREE.DoubleSide,
        });

        const cMed1Geo = buildMedianBodyGeometry(0.45, -0.45, 0.18, -0.32, 0.95);
        const cMed1Mesh = new THREE.Mesh(cMed1Geo, cystMedMat.clone());
        cMed1Mesh.userData = { structureId: "cuerpos_parabasales_quiste", shaderType: "organelle" };
        cMed1Mesh.renderOrder = 1;
        root.add(cMed1Mesh);

        const cMed2Geo = buildMedianBodyGeometry(-0.35, -1.25, -0.15, 0.28, 0.88);
        const cMed2Mesh = new THREE.Mesh(cMed2Geo, cystMedMat.clone());
        cMed2Mesh.userData = { structureId: "cuerpos_parabasales_quiste", shaderType: "organelle" };
        cMed2Mesh.renderOrder = 1;
        root.add(cMed2Mesh);

        // 3. Fibrillas longitudinales intranquísticas (axonemas internalizados)
        const fibMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: GIARDIA_ORGANELLE_FRAGMENT_SHADER,
          uniforms: {
            u_organelleType: { value: 5 },
            u_visualMode: { value: 0 },
            u_cutZ: { value: 8.0 },
            u_highlight: { value: 0 },
            u_opacity: { value: 1.0 },
          },
          transparent: false,
          depthWrite: true,
          side: THREE.DoubleSide,
        });

        const cystFibrils: Array<Array<[number, number, number]>> = [
          [
            [-0.25, 2.75, 0.08],
            [-0.18, 0.4, 0.12],
            [-0.10, -2.1, 0.08],
            [0.08, -4.15, -0.05],
          ],
          [
            [0.25, 2.75, -0.08],
            [0.16, 0.4, -0.10],
            [0.08, -2.1, -0.06],
            [-0.12, -4.15, 0.06],
          ],
          [
            [-0.75, 2.25, 0.22],
            [-0.42, -0.15, 0.28],
            [0.28, -2.35, 0.16],
            [0.85, -3.75, -0.08],
          ],
          [
            [0.75, 2.25, -0.22],
            [0.42, -0.15, -0.26],
            [-0.28, -2.35, -0.16],
            [-0.85, -3.75, 0.08],
          ],
        ];

        cystFibrils.forEach((pts) => {
          const fGeo = buildTaperedFilamentGeometry(pts, 0.075, 0.045, 44, 12);
          const fMesh = new THREE.Mesh(fGeo, fibMat.clone());
          fMesh.userData = { structureId: "fibrillas_intranquisticas", shaderType: "organelle" };
          fMesh.renderOrder = 1;
          root.add(fMesh);
        });

        // 4. Membrana citoplasmática interna retraída (muestra el espacio claro peritrófico)
        const innerCytoGeo = buildOvoideCystShellGeometry(3.62, 5.22, 3.38, 0.26, 56, 56);
        const innerCytoMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: GIARDIA_SHELL_FRAGMENT_SHADER,
          uniforms: {
            u_shellType: { value: 2 },
            u_visualMode: { value: 0 },
            u_baseOpacity: { value: 0.40 },
            u_cutZ: { value: 8.0 },
            u_highlight: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide,
        });
        const innerCytoMesh = new THREE.Mesh(innerCytoGeo, innerCytoMat);
        innerCytoMesh.userData = { structureId: "pared_quistica", shaderType: "shell" };
        innerCytoMesh.renderOrder = 3;
        root.add(innerCytoMesh);

        // 5. Pared quística externa hialina en dos pasadas (BackSide + FrontSide)
        const outerWallGeo = buildOvoideCystShellGeometry(4.10, 5.90, 3.85, 0.0, 64, 64);
        const outerBackMat = new THREE.ShaderMaterial({
          vertexShader: ORGANIC_VERTEX_SHADER,
          fragmentShader: GIARDIA_SHELL_FRAGMENT_SHADER,
          uniforms: {
            u_shellType: { value: 1 },
            u_visualMode: { value: 0 },
            u_baseOpacity: { value: 0.48 },
            u_cutZ: { value: 8.0 },
            u_highlight: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.BackSide,
        });
        const outerBackMesh = new THREE.Mesh(outerWallGeo, outerBackMat);
        outerBackMesh.userData = { structureId: "pared_quistica", shaderType: "shell" };
        outerBackMesh.renderOrder = 4;
        root.add(outerBackMesh);

        const outerFrontMat = outerBackMat.clone();
        outerFrontMat.side = THREE.FrontSide;
        const outerFrontMesh = new THREE.Mesh(outerWallGeo, outerFrontMat);
        outerFrontMesh.userData = { structureId: "pared_quistica", shaderType: "shell" };
        outerFrontMesh.renderOrder = 5;
        root.add(outerFrontMesh);
      }

      // Plano de tapa para el corte geométrico 3D («Corte del modelo»)
      const capGeo = new THREE.PlaneGeometry(16.0, 20.0);
      const capMat = new THREE.ShaderMaterial({
        vertexShader: SECTION_CAP_VERTEX_SHADER,
        fragmentShader: SECTION_CAP_FRAGMENT_SHADER,
        uniforms: {
          u_formMode: { value: formId === "trophozoite" ? 0 : 1 },
          u_visualMode: { value: 0 },
          u_pellicleOpacity: { value: 0.48 },
          u_cutActive: { value: 0.0 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.visible = false;
      capMesh.renderOrder = 6;
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

    const isTrichrome = visualMode === "trichrome";
    // Blanco ligeramente cálido (marfil suave / 0xfaf7f2) en simulación de tinción, y oscuro (0x070b14) en esquemático 3D
    scene.background = new THREE.Color(isTrichrome ? 0xfaf7f2 : 0x070b14);

    const maxZ = activeForm === "trophozoite" ? 2.4 : 3.9;
    const isCutting = cutPercent > 0.5;
    const cutZ = isCutting ? maxZ * (1.0 - (cutPercent / 100.0) * 1.85) : maxZ + 2.5;
    cutZRef.current = cutZ;

    let shellBaseOpacity = Math.max(
      0.06,
      Math.min(0.95, 0.94 - (pellicleTransparency / 100.0) * 0.86)
    );

    if (
      selectedStructureId &&
      selectedStructureId !== "cuerpo_piriforme" &&
      selectedStructureId !== "pared_quistica" &&
      shellBaseOpacity > 0.46
    ) {
      shellBaseOpacity = 0.36;
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

      mat.uniforms.u_visualMode.value = isTrichrome ? 1 : 0;
      mat.uniforms.u_cutZ.value = cutZ;
      mat.uniforms.u_highlight.value = highlightVal;

      if (shaderType === "shell") {
        mat.uniforms.u_baseOpacity.value = shellBaseOpacity;
      }
    });

    if (sectionCapMeshRef.current) {
      const cap = sectionCapMeshRef.current;
      const capMat = cap.material as THREE.ShaderMaterial;
      cap.visible = isCutting;
      cap.position.set(0, 0, cutZ - 0.002);
      capMat.uniforms.u_formMode.value = activeForm === "trophozoite" ? 0 : 1;
      capMat.uniforms.u_visualMode.value = isTrichrome ? 1 : 0;
      capMat.uniforms.u_pellicleOpacity.value = shellBaseOpacity;
      capMat.uniforms.u_cutActive.value = isCutting ? 1.0 : 0.0;
    }
  }, [activeForm, visualMode, pellicleTransparency, cutPercent, selectedStructureId]);

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

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 120);
    const initCam = GIARDIA_FORMS.trophozoite.defaultCamera;
    camera.position.set(...initCam.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 4.2;
    controls.maxDistance = 28.0;
    controls.target.set(...initCam.target);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.25;
    controlsRef.current = controls;

    const stopCamTransition = () => {
      camTransitionRef.current.active = false;
    };
    controls.addEventListener("start", stopCamTransition);

    buildForm3DScene("trophozoite", scene);

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
          const currentForm = GIARDIA_FORMS[activeFormRef.current];
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

            const padX = Math.min(108, w * 0.24);
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

          // Separación iterativa mínima entre etiquetas para impedir superposiciones
          for (let iter = 0; iter < 3; iter++) {
            for (let i = 0; i < rawPins.length; i++) {
              for (let j = i + 1; j < rawPins.length; j++) {
                const pA = rawPins[i];
                const pB = rawPins[j];
                if (!pA.visible || !pB.visible) continue;
                const dx = pB.labelX - pA.labelX;
                const dy = pB.labelY - pA.labelY;
                if (Math.abs(dx) < 142 && Math.abs(dy) < 34) {
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

  const activeFormRef = useRef<GiardiaFormId>(activeForm);
  useEffect(() => {
    activeFormRef.current = activeForm;
  }, [activeForm]);

  const handleSelectStructure = useCallback((structureId: string | null) => {
    setSelectedStructureId((prev) => {
      const nextId = prev === structureId ? null : structureId;
      const currentForm = GIARDIA_FORMS[activeFormRef.current];
      if (nextId) {
        const st = currentForm.structures.find((s) => s.id === nextId);
        if (st) {
          setIsFocusedOnOrganelles(
            nextId !== "cuerpo_piriforme" && nextId !== "pared_quistica"
          );
          camTransitionRef.current = {
            active: true,
            goalPos: new THREE.Vector3(...st.cameraGoal.position),
            goalTarget: new THREE.Vector3(...st.cameraGoal.target),
          };
        }
      } else {
        setIsFocusedOnOrganelles(false);
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

  // Botón «Enfocar orgánulos»
  const handleFocusOrganelles = () => {
    setSelectedStructureId(null);
    setIsFocusedOnOrganelles(true);
    if (pellicleTransparency < 45) {
      setPellicleTransparency(52);
    }
    const cam = formMeta.focusOrganellesCamera;
    camTransitionRef.current = {
      active: true,
      goalPos: new THREE.Vector3(...cam.position),
      goalTarget: new THREE.Vector3(...cam.target),
    };
  };

  // Botón «Ver parásito completo»
  const handleViewFullParasite = () => {
    setSelectedStructureId(null);
    setIsFocusedOnOrganelles(false);
    const cam = formMeta.defaultCamera;
    camTransitionRef.current = {
      active: true,
      goalPos: new THREE.Vector3(...cam.position),
      goalTarget: new THREE.Vector3(...cam.target),
    };
  };

  // Cambiar de forma desde el botón desplegable «Elegir forma»
  const handleSwitchForm = useCallback(
    (newForm: GiardiaFormId) => {
      setIsFormDropdownOpen(false);
      if (newForm === activeForm) return;
      const meta = GIARDIA_FORMS[newForm];
      setActiveForm(newForm);
      setSelectedStructureId(null);
      setIsFocusedOnOrganelles(false);
      setCutPercent(0);
      setPellicleTransparency(meta.defaultPellicleTransparency);

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
    const nextLen = Math.max(4.5, Math.min(26.0, dir.length() * factor));
    dir.setLength(nextLen);
    cam.position.copy(target).add(dir);
    controlsRef.current.update();
  };

  const isTrichrome = visualMode === "trichrome";

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
                  : isTrichrome
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
                      fill={isTrichrome ? st.colorTrichrome : st.colorSchematic}
                      stroke={isTrichrome ? "#334155" : "#ffffff"}
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
                const dotColor = isTrichrome ? st.colorTrichrome : st.colorSchematic;

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
                        : isTrichrome
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

        {/* BARRA SUPERIOR COMPACTA: Selector «Elegir forma», «Enfocar orgánulos» / «Ver parásito completo», Modos y Marcadores */}
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
                  aria-label="Elegir forma de Giardia duodenalis"
                  className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-2 z-50 space-y-1.5"
                >
                  <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Formas evolutivas de G. duodenalis
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFormDropdownOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(["trophozoite", "cyst"] as GiardiaFormId[]).map((fId) => {
                    const item = GIARDIA_FORMS[fId];
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

            {/* Botones de encuadre rápido: «Enfocar orgánulos» y «Ver parásito completo» */}
            <div className="rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 p-0.5 flex items-center gap-0.5 shadow-lg">
              <button
                type="button"
                onClick={handleFocusOrganelles}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  isFocusedOnOrganelles
                    ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/40"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Acercar la cámara hacia el disco ventral, núcleos y cuerpos medianos"
              >
                <Focus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enfocar orgánulos</span>
              </button>
              <button
                type="button"
                onClick={handleViewFullParasite}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  !isFocusedOnOrganelles && !selectedStructureId
                    ? "bg-slate-800 text-white border border-slate-600/60"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Recuperar el encuadre completo del parásito"
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
                <span>Ver parásito completo</span>
              </button>
            </div>
          </div>

          {/* Derecha: Modos («Esquemático 3D» / «Simulación Tricrómica») + «Mostrar / Ocultar marcadores» */}
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
                onClick={() => setVisualMode("trichrome")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  visualMode === "trichrome"
                    ? "bg-rose-500 text-white font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Microscope className="w-3 h-3" />
                <span>Simulación Tricrómica</span>
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
              {isTrichrome
                ? "Simulación Tricrómica (Gomori-Wheatley): representación basada en imágenes documentadas (no fotografía real)."
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
                onClick={handleViewFullParasite}
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
              onClick={handleFocusOrganelles}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1"
            >
              <Focus className="w-3.5 h-3.5" />
              <span>Enfocar orgánulos</span>
            </button>
            <button
              type="button"
              onClick={handleViewFullParasite}
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

        {/* Deslizadores de Transparencia de cubierta y Corte geométrico del modelo */}
        <div
          className={`${
            mobileControlsOpen ? "grid" : "hidden md:grid"
          } grid-cols-1 md:grid-cols-2 gap-4 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800`}
        >
          {/* Deslizador 1: Transparencia de la película / pared quística */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sliderGiardiaTransp" className="text-slate-200 font-bold">
                {formMeta.pellicleControlLabel}
              </label>
              <span className="text-cyan-300 font-mono font-bold">{pellicleTransparency}%</span>
            </div>
            <input
              id="sliderGiardiaTransp"
              type="range"
              min={0}
              max={100}
              value={pellicleTransparency}
              onChange={(e) => setPellicleTransparency(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              {formMeta.pellicleControlHint}
            </p>
          </div>

          {/* Deslizador 2: Corte geométrico del modelo */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="sliderGiardiaCut"
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
              id="sliderGiardiaCut"
              type="range"
              min={0}
              max={100}
              value={cutPercent}
              onChange={(e) => setCutPercent(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              Herramienta geométrica de exploración interna (en 50% secciona los núcleos, cariosomas y axostilo).
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
                onClick={handleViewFullParasite}
                className="text-xs font-semibold text-cyan-300 hover:text-white"
              >
                Volver a vista general
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
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
                        backgroundColor: isTrichrome ? st.colorTrichrome : st.colorSchematic,
                      }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    />
                    <span className="truncate">
                      {idx + 1}. {st.shortLabel}
                    </span>
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                    {selectedStructure.categoryLabel}
                  </span>
                  <h5 className="text-sm font-bold text-white">{selectedStructure.name}</h5>
                </div>
                <button
                  type="button"
                  onClick={handleViewFullParasite}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Ver parásito completo
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed">{selectedStructure.summary}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <strong className="text-rose-300">
                    Observación microscópica (Tricrómico / Lugol):{" "}
                  </strong>
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
            <strong className="text-slate-300">Fuentes de referencia:</strong> CDC DPDx Giardiasis (
            <a
              href="https://www.cdc.gov/dpdx/giardiasis/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              cdc.gov/dpdx/giardiasis
            </a>
            ) · Bench Aid <em>Giardia duodenalis</em> · Dawson SC, <em>Trends Parasitol</em>.
          </div>
          <div>Observación microscópica 2D ≠ Reconstrucción esquemática 3D</div>
        </div>
      </div>
    </div>
  );
};
