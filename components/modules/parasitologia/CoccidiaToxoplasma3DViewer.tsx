"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  Microscope,
  ShieldAlert,
  BookOpen,
  Layers,
  X,
  Play,
  Pause,
  Sliders,
  Scissors,
  Compass,
  ChevronDown,
  Check,
} from "lucide-react";

export interface CoccidiaToxoplasma3DViewerProps {
  speciesCode: "p08" | "p09" | "p10" | "p11";
  onClose?: () => void;
}

type StageId = "stage1" | "stage2" | "stage3" | "stage4";
type ShaderMode = "biological" | "giemsa" | "sem" | "xray";

interface RegionMeta {
  id: number;
  name: string;
  shortLabel: string;
  category: string;
  colorBio: string;
  colorGiemsa: string;
  anchor: [number, number, number];
  cameraPos: [number, number, number];
  lookAt: [number, number, number];
  description: string;
  microscopy: string;
  clinical: string;
  threeDNote: string;
}

interface StageMeta {
  id: StageId;
  label: string;
  shortName: string;
  subtitle: string;
  sizeRange: string;
  scaleMicrons: number;
  defaultTranslucency: number;
  defaultCut: number;
  defaultMotility: number;
  defaultCameraPos: [number, number, number];
  summary: string;
  diagnosticPearl: string;
  regions: RegionMeta[];
}

interface SpeciesMeta {
  code: "p08" | "p09" | "p10" | "p11";
  scientificName: string;
  commonName: string;
  taxonomyBadge: string;
  stainLabel: string;
  stages: Record<StageId, StageMeta>;
}

const SPECIES_CONFIG: Record<"p08" | "p09" | "p10" | "p11", SpeciesMeta> = {
  p08: {
    code: "p08",
    scientificName: "Cryptosporidium parvum / C. hominis",
    commonName: "Criptosporidiosis (Diarrea Acuosa en Inmunocompetentes y VIH)",
    taxonomyBadge: "P08 · Apicomplejo Coccidio Epicelular",
    stainLabel: "Ziehl-Neelsen Mod. (Kinyoun)",
    stages: {
      stage1: {
        id: "stage1",
        label: "Ooquiste Esporulado de Pared Gruesa (4–6 µm) — 4 Esporozoítos Desnudos",
        shortName: "1. Ooquiste Esporulado (4–6 µm)",
        subtitle: "Esférico diminuto con 4 esporozoítos libres (SIN esporoquistes) y cuerpo residual cristalino",
        sizeRange: "4.0 – 6.0 µm",
        scaleMicrons: 2,
        defaultTranslucency: 55,
        defaultCut: 0,
        defaultMotility: 35,
        defaultCameraPos: [0.2, 0.35, 3.6],
        summary:
          "El ooquiste de Cryptosporidium parvum / C. hominis es diminuto (4–6 µm) y se excreta YA ESPORULADO e inmediatamente infectante en las heces. A diferencia de Cyclospora y Cystoisospora, NO posee esporoquistes internos: contiene 4 esporozoítos vermiformes desnudos dispuestos en «C» junto a un cuerpo residual globular rico en amilopectina y una sutura apical de desenquistamiento.",
        diagnosticPearl:
          "Regla nemotécnica «1 - 2 - 4» de los coccidios intestinales: Cryptosporidium mide ~5 µm y tiene 4 esporozoítos desnudos (0 esporoquistes); Cyclospora mide ~9 µm y tiene 2 esporoquistes × 2 esporozoítos; Cystoisospora mide ~25 µm y tiene 2 esporoquistes × 4 esporozoítos.",
        regions: [
          {
            id: 1,
            name: "Pared Ooquística Gruesa Ácido-Alcohol Resistente y Sutura Apical",
            shortLabel: "Pared AAR y sutura",
            category: "Resistencia al Cloro",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.85, 0.55, 0.3],
            cameraPos: [-1.7, 1.0, 2.4],
            lookAt: [-0.4, 0.3, 0.1],
            description:
              "Pared trilaminar rica en lípidos ácido-alcohol resistentes y proteínas de pared de Cryptosporidium (COWP), provista de una línea de sutura preformada en un polo.",
            microscopy:
              "En tinción de Ziehl-Neelsen modificada (Kinyoun) se tiñe de color rojo fucsia o magenta brillante sobre fondo azul de metileno.",
            clinical:
              "Resiste la cloración habitual del agua potable y piscinas (requiere filtración ≤1 µm, ozono o luz UV) y su excreción ya esporulada explica la transmisión directa persona a persona en guarderías.",
            threeDNote:
              "Esfera externa translúcida con cresta polar de sutura; se secciona al deslizar «Corte Histológico».",
          },
          {
            id: 2,
            name: "Cuatro Esporozoítos Vermiformes Desnudos (Sin Esporoquistes)",
            shortLabel: "4 esporozoítos libres",
            category: "Arquitectura Interna Única",
            colorBio: "#fde047",
            colorGiemsa: "#be123c",
            anchor: [0.35, 0.18, 0.32],
            cameraPos: [1.2, 0.4, 2.2],
            lookAt: [0.2, 0.1, 0.1],
            description:
              "Cuatro esporozoítos falciformes de ~4.5 × 0.8 µm alojados directamente en la cavidad ooquística sin envoltura de esporoquiste.",
            microscopy:
              "En contraste diferencial de interferencia (DIC) o Kinyoun de alta resolución se distinguen como semilunas más densas abrazando el cuerpo residual.",
            clinical:
              "Al abrirse la sutura polar en el yeyuno/íleon, los 4 esporozoítos se liberan e invaden inmediatamente el borde en cepillo de los enterocitos.",
            threeDNote:
              "Cuatro cuerpos curvos 3D dispuestos en paralelo meridiano en el interior del ooquiste.",
          },
          {
            id: 3,
            name: "Cuerpo Residual Ooquístico y Gránulos de Amilopectina",
            shortLabel: "Cuerpo residual",
            category: "Reserva Metabólica",
            colorBio: "#38bdf8",
            colorGiemsa: "#7e22ce",
            anchor: [-0.15, -0.25, 0.35],
            cameraPos: [-0.8, -0.5, 2.2],
            lookAt: [-0.1, -0.15, 0.1],
            description:
              "Glóbulo central refringente de 1.5 µm rodeado de gránulos cristalinos de amilopectina que proveen energía a los esporozoítos.",
            microscopy:
              "En tinción ácido-alcohol resistente aparece como un gránulo excéntrico oscuro o refringente dentro de la esfera magenta de 4–6 µm.",
            clinical:
              "Permite distinguir ooquistes verdaderos de levaduras fecales (las levaduras no son ácido-alcohol resistentes y carecen de cuerpo residual y esporozoítos).",
            threeDNote:
              "Esfera central azulada con microesferas satélites expuesta en el corte histológico.",
          },
          {
            id: 4,
            name: "Complejo Apical de los Esporozoítos (Roptrias y Micronemas)",
            shortLabel: "Complejo apical",
            category: "Maquinaria de Adhesión",
            colorBio: "#a855f7",
            colorGiemsa: "#6d28d9",
            anchor: [0.12, 0.58, 0.25],
            cameraPos: [0.6, 1.1, 2.2],
            lookAt: [0.05, 0.4, 0.1],
            description:
              "Polo anterior especializado de cada esporozoíto provisto de conoide, micronemas (gp900, TRAP-C1) y una roptria única.",
            microscopy:
              "Ultraestructura visible por microscopía electrónica de transmisión (TEM) en el polo apical convergente de los 4 esporozoítos.",
            clinical:
              "Induce la remodelación de actina de las microvellosidades del enterocito para construir la vacuola parasitófora epicelular.",
            threeDNote:
              "Conos apicales violetas en el extremo superior de cada uno de los 4 esporozoítos.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Meronte Epicelular (Intracelular pero Extracitoplasmático)",
        shortName: "2. Meronte Epicelular",
        subtitle: "Localización patognomónica en el borde en cepillo con orgánulo de alimentación electrodenso",
        sizeRange: "Meronte 4–5 µm en borde microvellositario",
        scaleMicrons: 3,
        defaultTranslucency: 48,
        defaultCut: 0,
        defaultMotility: 30,
        defaultCameraPos: [0.15, 0.45, 4.0],
        summary:
          "Cryptosporidium ocupa un nicho biológico único entre los apicomplejos: es INTRACELULAR pero EXTRACITOPLASMÁTICO (epicelular). El trofozoíto/meronte queda envuelto por las membranas fusionadas de las microvellosidades en el ápice del enterocito, separado del citoplasma celular por un «orgánulo de alimentación» laminar electrodenso.",
        diagnosticPearl:
          "En biopsia intestinal (H&E) los merontes se observan como pequeñas esferas basófilas («cuentas de collar azules» de 3–5 µm) alineadas sobre la superficie luminal del borde en cepillo de los enterocitos.",
        regions: [
          {
            id: 1,
            name: "Vacuola Parasitófora Epicelular (Aspecto de «Cuenta en el Borde en Cepillo»)",
            shortLabel: "Vacuola epicelular",
            category: "Nicho Intracelular-Extracitoplasmático",
            colorBio: "#38bdf8",
            colorGiemsa: "#6366f1",
            anchor: [0.0, 0.45, 0.4],
            cameraPos: [0.1, 0.9, 2.4],
            lookAt: [0.0, 0.3, 0.1],
            description:
              "Cúpula membranosa que sobresale hacia la luz intestinal formada por la membrana plasmática remodelada de las microvellosidades del enterocito.",
            microscopy:
              "En histopatología H&E aparece como corpúsculos esféricos basófilos de 4 µm adheridos como rocío sobre el borde apical de las vellosidades.",
            clinical:
              "Su localización superficial extracitoplasmática limita la penetración de muchos fármacos sistémicos y explica la eficacia variable de los antimicrobianos en inmunodeprimidos.",
            threeDNote:
              "Domo translúcido apical que al cortarse con «Corte Histológico» revela los 8 merozoítos de Tipo I en su interior.",
          },
          {
            id: 2,
            name: "Merozoítos de Tipo I en Gemación (6–8 Merozoítos)",
            shortLabel: "Merozoítos Tipo I",
            category: "Multiplicación Asexual",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [0.15, 0.32, 0.25],
            cameraPos: [0.8, 0.7, 2.2],
            lookAt: [0.05, 0.25, 0.05],
            description:
              "Seis a ocho merozoítos falciformes dispuestos como gajos de naranja dentro del meronte de Tipo I.",
            microscopy:
              "Cada merozoíto posee un núcleo compacto teñido con Giemsa/H&E.",
            clinical:
              "Los merozoítos de Tipo I se reciclan invadiendo enterocitos vecinos de forma exponencial, destruyendo el borde en cepillo y causando diarrea secretora/malabsortiva.",
            threeDNote:
              "Ocho merozoítos 3D dispuestos radialmente dentro de la cúpula epicelular.",
          },
          {
            id: 3,
            name: "Orgánulo de Alimentación Electrodenso (Feeder Organelle)",
            shortLabel: "Orgánulo alimentador",
            category: "Interfase Metabólica",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [0.0, -0.05, 0.35],
            cameraPos: [0.0, 0.1, 2.3],
            lookAt: [0.0, -0.05, 0.1],
            description:
              "Placa plegada de invaginaciones membranosas y banda densa rica en actina situada en la base del parásito, justo en la unión con el citoplasma del enterocito.",
            microscopy:
              "Sello ultraestructural patognomónico en microscopía electrónica: separa al parásito del citosol mientras absorbe nutrientes del enterocito.",
            clinical:
              "Dado que Cryptosporidium carece de síntesis de novo de purinas, pirimidinas y aminoácidos, depende por completo de los transportadores de este orgánulo.",
            threeDNote:
              "Disco plisado rojo-coral en la base de implantación del meronte sobre el enterocito.",
          },
          {
            id: 4,
            name: "Borde en Cepillo de Microvellosidades Enterocitarias Atróficas",
            shortLabel: "Microvellosidades",
            category: "Epitelio Intestinal",
            colorBio: "#f472b6",
            colorGiemsa: "#db2777",
            anchor: [-0.85, -0.25, 0.35],
            cameraPos: [-1.7, 0.1, 2.5],
            lookAt: [-0.5, -0.2, 0.1],
            description:
              "Empalizada de microvellosidades intestinales desplazadas, acortadas y fusionadas alrededor del sitio de anclaje del meronte.",
            microscopy:
              "Pérdida de disacaridasas del borde en cepillo y apertura de uniones estrechas intercelulares.",
            clinical:
              "En pacientes con SIDA (CD4 < 100 cél/µL) el parásito coloniza además el árbol biliar (colangitis esclerosante acalculosa) y los conductos pancreáticos.",
            threeDNote:
              "Matriz de pilares microvellositarios 3D flanqueando el domo epicelular.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Ooquiste de Pared Delgada (Autoinfección Endógena vs Pared Gruesa)",
        shortName: "3. Ooquiste Autoinfectante",
        subtitle: "20% de pared delgada (desenquista in situ perpetuando la infección) vs 80% de pared gruesa",
        sizeRange: "4.0 – 5.5 µm",
        scaleMicrons: 2,
        defaultTranslucency: 58,
        defaultCut: 0,
        defaultMotility: 45,
        defaultCameraPos: [0.1, 0.35, 3.9],
        summary:
          "Tras la fase sexual (gametogonia), el cigoto de Cryptosporidium produce dos tipos de ooquistes: el 80% son ooquistes de pared gruesa que salen al exterior en las heces, pero el 20% son ooquistes de PARED DELGADA (solo una membrana unitaria) que se rompen dentro del propio intestino del paciente, liberando esporozoítos que reinician el ciclo (autoinfección interna).",
        diagnosticPearl:
          "La autoinfección por ooquistes de pared delgada explica por qué un paciente con VIH avanzado (CD4 < 100/µL) sufre diarrea coleriforme incesante de hasta 10–15 L/día durante meses: el tratamiento fundamental en VIH es la reconstitución inmune con TARV (la nitazoxanida sola es ineficaz sin CD4).",
        regions: [
          {
            id: 1,
            name: "Ooquiste de Pared Delgada en Desenquistamiento Intraluminal (Izquierda)",
            shortLabel: "Ooquiste pared delgada",
            category: "Mecanismo de Autoinfección",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [-0.85, 0.25, 0.3],
            cameraPos: [-1.7, 0.5, 2.4],
            lookAt: [-0.75, 0.1, 0.0],
            description:
              "Ooquiste rodeado únicamente por una membrana unitaria delgada (20% del total producido) que se lisa espontáneamente en el lumen intestinal sin salir al exterior.",
            microscopy:
              "Rara vez se recupera intacto en heces debido a su fragilidad osmótica y lisis intraluminal.",
            clinical:
              "Responsable de la hiperinfección autoperpetuada en pacientes con inmunodeficiencia celular (SIDA, trasplantados, déficit de IgA/CD40L).",
            threeDNote:
              "Esfera izquierda de membrana fina translúcida de la cual emergen esporozoítos activos.",
          },
          {
            id: 2,
            name: "Esporozoítos Emergentes Invadiendo Enterocitos Vecinos",
            shortLabel: "Esporozoítos emergentes",
            category: "Ciclo Autoinfectivo",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [-0.45, 0.48, 0.35],
            cameraPos: [-1.1, 0.9, 2.3],
            lookAt: [-0.5, 0.35, 0.1],
            description:
              "Esporozoítos móviles en forma de banana saliendo directamente del ooquiste de pared delgada en la luz yeyunal.",
            microscopy:
              "Miden 4.5 × 0.8 µm y se desplazan por motilidad deslizante (gliding motility) dependiente de actina-miosina.",
            clinical:
              "Amplifican masivamente la carga parasitaria a partir de una dosis infectante inicial mínima (basta ingerir 10 a 30 ooquistes para enfermar).",
            threeDNote:
              "Formas falciformes proyectándose hacia afuera desde el polo superior del ooquiste izquierdo.",
          },
          {
            id: 3,
            name: "Ooquiste de Pared Gruesa Trilaminar (Derecha: 80% Excretado)",
            shortLabel: "Ooquiste pared gruesa",
            category: "Transmisión Ambiental",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [0.85, 0.25, 0.3],
            cameraPos: [1.8, 0.5, 2.4],
            lookAt: [0.75, 0.1, 0.0],
            description:
              "Ooquiste provisto de doble pared proteico-lipídica gruesa (80% de la progenie sexual) diseñado para resistir en el agua y contagiar nuevos hospedadores.",
            microscopy:
              "Es la forma diagnóstica observada en el examen coproparasitológico con tinción de Kinyoun, auramina-rodamina o inmunofluorescencia directa (DFA).",
            clinical:
              "Causa grandes brotes hídricos epidémicos asociados a plantas potabilizadoras y parques acuáticos recreativos.",
            threeDNote:
              "Esfera derecha con coraza gruesa magenta y 4 esporozoítos internos.",
          },
          {
            id: 4,
            name: "Cuerpo Residual Globular (Ambos Ooquistes)",
            shortLabel: "Cuerpo residual",
            category: "Marcador Interno",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.85, -0.15, 0.35],
            cameraPos: [1.6, -0.3, 2.2],
            lookAt: [0.75, -0.1, 0.1],
            description:
              "Glóbulo refringente acompañado de gránulos de amilopectina en el interior de los ooquistes.",
            microscopy:
              "Visible al seccionar o enfocar el plano ecuatorial del ooquiste.",
            clinical:
              "Su agotamiento energético en agua cálida determina la pérdida gradual de infectividad tras varios meses.",
            threeDNote:
              "Núcleo esférico interno expuesto al deslizar «Corte Histológico».",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Campo Microscópico Ziehl-Neelsen Modificado (Kinyoun) e IFA",
        shortName: "4. Campo Kinyoun (4–6 µm)",
        subtitle: "Esferas ácido-alcohol resistentes rojo-magenta brillantes sobre fondo azul de metileno",
        sizeRange: "Ooquistes 4–6 µm en frotis fecal",
        scaleMicrons: 5,
        defaultTranslucency: 45,
        defaultCut: 0,
        defaultMotility: 20,
        defaultCameraPos: [0.1, 0.5, 4.1],
        summary:
          "En el laboratorio clínico, los ooquistes de Cryptosporidium (4–6 µm) pasan fácilmente desapercibidos en el examen coproparasitológico convencional en fresco o Lugol por su diminuto tamaño y aspecto similar a levaduras. La solicitud específica de tinción ácido-alcohol resistente modificada en frío (Kinyoun) revela esferas rojo-fucsia brillantes inconfundibles sobre el fondo azul de metileno.",
        diagnosticPearl:
          "El coproparasitológico seriado estándar NO incluye tinción de Kinyoun de rutina: ante toda diarrea acuosa prolongada (>7–14 días) o en paciente inmunodeprimido, el médico debe solicitar explícitamente «Tinción de Ziehl-Neelsen modificada / Kinyoun para coccidios» o «Antígeno / PCR para Cryptosporidium».",
        regions: [
          {
            id: 1,
            name: "Ooquistes Ácido-Alcohol Resistentes Intensos (Rojo Fucsia, 4–6 µm)",
            shortLabel: "Ooquistes fucsia (4–6 µm)",
            category: "Tinción Positiva de Kinyoun",
            colorBio: "#e11d48",
            colorGiemsa: "#be123c",
            anchor: [-0.45, 0.25, 0.35],
            cameraPos: [-1.2, 0.6, 2.3],
            lookAt: [-0.35, 0.15, 0.1],
            description:
              "Ooquistes esféricos uniformes de 4 a 6 µm que retienen la carbolfucsina tras la decoloración suave con ácido sulfúrico al 1% o alcohol-ácido.",
            microscopy:
              "En el interior de varios ooquistes se distinguen de 1 a 4 estructuras semilunares oscuras (esporozoítos) y el gránulo del cuerpo residual.",
            clinical:
              "Confirma el diagnóstico etiológico de criptosporidiosis intestinal o biliar.",
            threeDNote:
              "Agrupación de ooquistes 3D con esporozoítos internos visibles al aplicar el corte histológico.",
          },
          {
            id: 2,
            name: "Levaduras Fecales No Ácido-Alcohol Resistentes (Azules, Control Interno)",
            shortLabel: "Levaduras azules (NO AAR)",
            category: "Diagnóstico Diferencial",
            colorBio: "#3b82f6",
            colorGiemsa: "#1d4ed8",
            anchor: [0.78, -0.18, 0.3],
            cameraPos: [1.7, -0.2, 2.4],
            lookAt: [0.6, -0.1, 0.05],
            description:
              "Células levaduriformes ovaladas (4–7 µm, a veces en gemación) presentes en la microbiota fecal que se decoloran y toman el contracolorante azul de metileno.",
            microscopy:
              "En fresco son muy parecidas a Cryptosporidium, pero en Kinyoun se tiñen de azul/verde pálido y carecen de esporozoítos internos.",
            clinical:
              "Evita falsos positivos diagnósticos en el laboratorio de parasitología.",
            threeDNote:
              "Células ovoides azules con brote de gemación sobre el portaobjetos.",
          },
          {
            id: 3,
            name: "Ooquiste Marcado con Anticuerpo Monoclonal FITC (Inmunofluorescencia Directa)",
            shortLabel: "Ooquiste DFA (Verde manzana)",
            category: "Estándar de Oro Inmunológico",
            colorBio: "#22c55e",
            colorGiemsa: "#16a34a",
            anchor: [0.25, 0.48, 0.3],
            cameraPos: [0.9, 0.9, 2.3],
            lookAt: [0.2, 0.35, 0.05],
            description:
              "Ooquiste recubierto por anticuerpos monoclonales conjugados con isotiocianato de fluoresceína (FITC) dirigidos contra antígenos de superficie ooquística.",
            microscopy:
              "En microscopía de fluorescencia brilla con un contorno circular verde manzana intenso y nítido (sensibilidad y especificidad >98%).",
            clinical:
              "La inmunofluorescencia directa (DFA) y la PCR multiplex son más sensibles que la tinción de Kinyoun cuando la excreción de ooquistes es baja.",
            threeDNote:
              "Ooquiste superior con halo fluorescente verde esmeralda.",
          },
          {
            id: 4,
            name: "Matriz Mucosa Fecal Contracoloreada con Azul de Metileno",
            shortLabel: "Fondo azul de metileno",
            category: "Contraste Microscópico",
            colorBio: "#1e3a8a",
            colorGiemsa: "#1e40af",
            anchor: [-0.95, -0.35, 0.15],
            cameraPos: [-1.9, -0.4, 2.5],
            lookAt: [-0.5, -0.3, 0.0],
            description:
              "Hebras de moco y detritus fecal teñidos de azul que proporcionan el contraste cromático frente a los ooquistes magenta.",
            microscopy:
              "Ausencia habitual de leucocitos polimorfonucleares o eritrocitos en las heces (diarrea secretora no inflamatoria).",
            clinical:
              "Las heces de la criptosporidiosis son profusas y acuosas («como agua de arroz»), sin sangre macroscópica.",
            threeDNote:
              "Plano basal texturizado azul sobre el que descansan los ooquistes y levaduras.",
          },
        ],
      },
    },
  },
  p09: {
    code: "p09",
    scientificName: "Cyclospora cayetanensis",
    commonName: "Ciclosporiasis (Diarrea del Viajero y Brotes por Frambuesas/Hortalizas)",
    taxonomyBadge: "P09 · Apicomplejo Coccidio Autofluorescente",
    stainLabel: "Kinyoun Variable / UV",
    stages: {
      stage1: {
        id: "stage1",
        label: "Ooquiste No Esporulado Recién Excretado (8–10 µm) — Mórula Central",
        shortName: "1. Ooquiste No Esporulado (Heces)",
        subtitle: "Esférico de 8–10 µm (doble de Cryptosporidium) con mórula central de glóbulos refringentes",
        sizeRange: "8.0 – 10.0 µm",
        scaleMicrons: 4,
        defaultTranslucency: 56,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.2, 0.35, 3.7],
        summary:
          "En las heces humanas recién emitidas, Cyclospora cayetanensis se observa SIEMPRE como un ooquiste esférico NO ESPORULADO de 8 a 10 µm de diámetro (exactamente el doble del diámetro de Cryptosporidium). Su interior está ocupado por una «mórula» central compacta formada por 6 a 12 glóbulos refringentes verdosos. Debido a que requiere 7 a 15 días en el ambiente exterior para esporular, NO es inmediatamente infectante.",
        diagnosticPearl:
          "Perla epidemiológica clave: Dado que el ooquiste recién excretado NO está esporulado, Cyclospora cayetanensis NO se transmite directamente de persona a persona (a diferencia de Cryptosporidium y Giardia); la infección ocurre siempre a través de agua o vegetales frescos (frambuesas, moras, cilantro, albahaca, lechuga) contaminados días antes.",
        regions: [
          {
            id: 1,
            name: "Mórula Central de Glóbulos Refringentes (Esporonte Inmaduro)",
            shortLabel: "Mórula de glóbulos",
            category: "Forma Diagnóstica en Heces Frescas",
            colorBio: "#a3e635",
            colorGiemsa: "#db2777",
            anchor: [0.05, 0.08, 0.35],
            cameraPos: [0.2, 0.3, 2.2],
            lookAt: [0.0, 0.0, 0.1],
            description:
              "Agrupación esférica central de 6–7 µm compuesta por múltiples esférulas lipídicas refringentes de aspecto morulado.",
            microscopy:
              "En examen en fresco con solución salina o DIC se observa como una esfera bien delimitada rellena de glóbulos brillantes («racimo de uvas» o mórula).",
            clinical:
              "Es el estadio que el microbiólogo observa en las heces del paciente con diarrea acuosa prolongada, anorexia, fatiga marcada y pérdida de peso.",
            threeDNote:
              "Racimo central de 14 esferas refringentes 3D completamente visible al activar «Corte Histológico».",
          },
          {
            id: 2,
            name: "Pared Ooquística Bilaminar Lisa (8–10 µm)",
            shortLabel: "Pared ooquística (8–10 µm)",
            category: "Criterio Morfométrico",
            colorBio: "#38bdf8",
            colorGiemsa: "#be123c",
            anchor: [-0.88, 0.52, 0.25],
            cameraPos: [-1.8, 0.9, 2.4],
            lookAt: [-0.4, 0.25, 0.05],
            description:
              "Pared externa rígida e incolora de ~110 nm de espesor y contorno perfectamente circular de 8 a 10 µm.",
            microscopy:
              "La medición con micrómetro ocular es decisiva: 8–10 µm para Cyclospora frente a 4–6 µm para Cryptosporidium.",
            clinical:
              "Rica en polímeros fenólicos aromáticos que le confieren su autofluorescencia azul-neón bajo luz ultravioleta.",
            threeDNote:
              "Esfera externa translúcida que se abre con el deslizador de corte histológico.",
          },
          {
            id: 3,
            name: "Espacio Perimorular Hialino",
            shortLabel: "Halo perimorular",
            category: "Arquitectura Ooquística",
            colorBio: "#e0f2fe",
            colorGiemsa: "#fce7f3",
            anchor: [0.65, -0.35, 0.3],
            cameraPos: [1.5, -0.5, 2.3],
            lookAt: [0.35, -0.2, 0.1],
            description:
              "Anillo claro ópticamente vacío situado entre la pared interna del ooquiste y la mórula central de glóbulos.",
            microscopy:
              "En montaje húmedo crea un doble contorno característico alrededor de la masa globular central.",
            clinical:
              "Permite diferenciar el ooquiste de gotas de grasa fecal o blastoconidias.",
            threeDNote:
              "Espacio concéntrico entre la cápsula externa y el racimo morulado central.",
          },
          {
            id: 4,
            name: "Gránulos Amilopectínicos y Lipídicos de Esporogonia",
            shortLabel: "Glóbulos lipídicos",
            category: "Sustratos de Maduración",
            colorBio: "#facc15",
            colorGiemsa: "#9333ea",
            anchor: [-0.28, -0.22, 0.35],
            cameraPos: [-0.9, -0.4, 2.2],
            lookAt: [-0.15, -0.1, 0.1],
            description:
              "Inclusiones ricas en lípidos neutros y amilopectina dentro de la mórula que alimentarán la división en dos esporoquistes en el ambiente.",
            microscopy:
              "En tinción de safranina calentada en microondas se tiñen de forma uniforme de color rojo-anaranjado brillante.",
            clinical:
              "El tratamiento de primera línea de la ciclosporiasis es Trimetoprim-Sulfametoxazol (TMP-SMX, cotrimoxazol) durante 7–10 días (la nitazoxanida y el albendazol son poco eficaces).",
            threeDNote:
              "Esferas doradas internas intercaladas en el núcleo de la mórula.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Ooquiste Esporulado Infectante (2 Esporoquistes × 2 Esporozoítos)",
        shortName: "2. Ooquiste Esporulado (2×2)",
        subtitle: "Madurado en el ambiente (7–15 días): contiene 2 esporoquistes ovales con 2 esporozoítos cada uno",
        sizeRange: "8.0 – 10.0 µm",
        scaleMicrons: 4,
        defaultTranslucency: 58,
        defaultCut: 0,
        defaultMotility: 30,
        defaultCameraPos: [0.2, 0.35, 3.7],
        summary:
          "Tras permanecer 1 a 2 semanas en el ambiente exterior a 22–30 °C, la mórula de Cyclospora cayetanensis esporula y se divide en 2 ESPOROQUISTES ovalados, cada uno de los cuales contiene 2 ESPOROZOÍTOS falciformes (fórmula taxonómica «2 × 2 = 4»). Este es el estadio infectante ingerido en frutas finas (frambuesas) u hojas verdes.",
        diagnosticPearl:
          "Fórmula taxonómica del género Cyclospora («di-esporoquístico, di-zoico»): 2 esporoquistes × 2 esporozoítos = 4 esporozoítos totales por ooquiste.",
        regions: [
          {
            id: 1,
            name: "Dos Esporoquistes Ovalados con Cuerpo de Stieda Apical",
            shortLabel: "2 esporoquistes ovales",
            category: "Fórmula Taxonómica 2×2",
            colorBio: "#38bdf8",
            colorGiemsa: "#a855f7",
            anchor: [-0.38, 0.15, 0.3],
            cameraPos: [-1.2, 0.4, 2.2],
            lookAt: [-0.3, 0.05, 0.05],
            description:
              "Dos cápsulas elipsoidales internas de ~4 × 6.3 µm provistas en su polo anterior de un tapón proteico refringente (cuerpo de Stieda y substieda).",
            microscopy:
              "Se observan nítidamente al incubar la muestra fecal en dicromato de potasio al 2.5% durante 7–14 días para confirmar la especie.",
            clinical:
              "El cuerpo de Stieda se disuelve en presencia de tripsina y sales biliares en el yeyuno, permitiendo la salida de los esporozoítos.",
            threeDNote:
              "Dos cápsulas elipsoidales gemelas semitransparentes dentro del ooquiste.",
          },
          {
            id: 2,
            name: "Dos Esporozoítos Falciformes por cada Esporoquiste (4 en Total)",
            shortLabel: "2 esporozoítos / esporoquiste",
            category: "Estadio Invasivo",
            colorBio: "#fde047",
            colorGiemsa: "#e11d48",
            anchor: [0.38, 0.15, 0.32],
            cameraPos: [1.2, 0.4, 2.2],
            lookAt: [0.3, 0.05, 0.05],
            description:
              "Cada esporoquiste aloja exactamente dos esporozoítos alargados (1.2 × 9 µm) plegados cabeza con cola.",
            microscopy:
              "Visibles dentro de cada esporoquiste en microscopía DIC o electrónica de transmisión.",
            clinical:
              "Invaden los enterocitos del yeyuno (en posición intracitoplasmática supranuclear, a diferencia de Cryptosporidium que es epicelular), provocando atrofia vellositaria e inflamación de lámina propia.",
            threeDNote:
              "Dos pares de esporozoítos curvos 3D alojados dentro de los dos esporoquistes; expuestos al activar «Corte Histológico».",
          },
          {
            id: 3,
            name: "Cuerpos Residuales Esporoquísticos Granulares",
            shortLabel: "Cuerpo residual",
            category: "Reserva Interna",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [-0.38, -0.22, 0.3],
            cameraPos: [-1.1, -0.4, 2.2],
            lookAt: [-0.3, -0.15, 0.05],
            description:
              "Pequeña masa granular residual presente dentro de cada uno de los dos esporoquistes junto a los dos esporozoítos.",
            microscopy:
              "Gránulo refringente excéntrico dentro de cada cápsula esporoquística.",
            clinical:
              "Sustenta la viabilidad del ooquiste adherido a los tricomas microscópicos de las frambuesas y hojas de cilantro (donde no se elimina con el simple lavado con agua).",
            threeDNote:
              "Esferas coralinas dentro de ambos esporoquistes.",
          },
          {
            id: 4,
            name: "Pared Ooquística Externa (8–10 µm)",
            shortLabel: "Pared externa (8–10 µm)",
            category: "Cubierta Ambiental",
            colorBio: "#94a3b8",
            colorGiemsa: "#64748b",
            anchor: [0.0, 0.85, 0.25],
            cameraPos: [0.1, 1.5, 2.5],
            lookAt: [0.0, 0.4, 0.0],
            description:
              "Cubierta esférica externa resistente a la cloración del agua.",
            microscopy:
              "Mantiene el diámetro constante de 8–10 µm durante toda la esporogonia.",
            clinical:
              "La cocción o congelación comercial a -20 °C inactiva los ooquistes, pero el refrigerado doméstico a 4 °C los mantiene viables.",
            threeDNote:
              "Cápsula esférica exterior seccionable con el control de corte histológico.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Autofluorescencia Azul-Neón / Cian bajo Luz Ultravioleta (330–365 nm)",
        shortName: "3. Autofluorescencia UV",
        subtitle: "Anillo brillante azul-neón (330–365 nm) o verde-menta (450–490 nm) sin ningún colorante",
        sizeRange: "8.0 – 10.0 µm",
        scaleMicrons: 5,
        defaultTranslucency: 45,
        defaultCut: 0,
        defaultMotility: 20,
        defaultCameraPos: [0.1, 0.4, 3.9],
        summary:
          "Una propiedad biofísica patognomónica y extraordinariamente útil en el laboratorio para diagnosticar Cyclospora cayetanensis es su AUTOFLUORESCENCIA intrínseca bajo microscopía de epifluorescencia UV (sin necesidad de añadir anticuerpos ni fluorocromos): la pared del ooquiste de 8–10 µm brilla como un anillo de neón azul intenso (filtro UV 330–365 nm) o verde brillante (filtro azul 450–490 nm).",
        diagnosticPearl:
          "Cryptosporidium (4–6 µm) NO presenta autofluorescencia azul intensa bajo UV; en cambio, Cyclospora (8–10 µm) y Cystoisospora (20–33 µm) brillan intensamente con luz UV en preparaciones húmedas sin teñir, diferenciándose al instante por su tamaño y forma.",
        regions: [
          {
            id: 1,
            name: "Anillo Periférico Autofluorescente Azul-Neón (Excitación UV 330–365 nm)",
            shortLabel: "Anillo UV azul-neón",
            category: "Propiedad Óptica Patognomónica",
            colorBio: "#22d3ee",
            colorGiemsa: "#06b6d4",
            anchor: [-0.55, 0.35, 0.35],
            cameraPos: [-1.4, 0.7, 2.3],
            lookAt: [-0.45, 0.2, 0.1],
            description:
              "Emisión fluorescente intensa azul-cian generada por las ditirosinas y polifenoles entrecruzados de la pared ooquística al ser excitada con luz ultravioleta.",
            microscopy:
              "En campo oscuro de epifluorescencia UV los ooquistes resaltan inmediatamente como círculos luminosos perfectos de 8–10 µm.",
            clinical:
              "Es el método de tamizaje más rápido y sensible en brotes alimentarios antes de confirmar con PCR (BioFire GI Panel).",
            threeDNote:
              "Ooquiste principal con halo luminiscente cian de alta intensidad.",
          },
          {
            id: 2,
            name: "Emisión Verde-Menta bajo Filtro de Excitación Azul (450–490 nm)",
            shortLabel: "Autofluorescencia 450–490 nm",
            category: "Filtro FITC Estándar",
            colorBio: "#4ade80",
            colorGiemsa: "#10b981",
            anchor: [0.75, -0.15, 0.3],
            cameraPos: [1.6, -0.2, 2.4],
            lookAt: [0.6, -0.1, 0.05],
            description:
              "Cuando el microscopio utiliza un filtro de excitación azul estándar (450–490 nm, tipo FITC), el mismo ooquiste autofluoresce en tono verde-menta.",
            microscopy:
              "Permite detectar Cyclospora incluso en laboratorios que solo cuentan con cubo de filtro FITC para inmunofluorescencia.",
            clinical:
              "Facilita el diagnóstico rápido en viajeros que regresan de zonas endémicas (Perú, Guatemala, México, Sudeste Asiático) con diarrea acuosa cíclica.",
            threeDNote:
              "Segundo ooquiste 3D a la derecha mostrando el espectro de emisión verde.",
          },
          {
            id: 3,
            name: "Mórula Interna con Fluorescencia Tenue",
            shortLabel: "Mórula interna en UV",
            category: "Estructura Interna",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [-0.45, 0.15, 0.35],
            cameraPos: [-1.1, 0.3, 2.1],
            lookAt: [-0.45, 0.1, 0.1],
            description:
              "Glóbulos centrales de la mórula débilmente autofluorescentes enmarcados por el brillante anillo periférico de la pared.",
            microscopy:
              "Al alternar entre luz blanca (DIC) y luz UV se comprueba la presencia de la mórula de 6–7 µm dentro del anillo fluorescente de 8–10 µm.",
            clinical:
              "Descarta artefactos fluorescentes vegetales o esporas fúngicas en las heces.",
            threeDNote:
              "Esférulas internas visibles por transparencia y al seccionar el ooquiste con «Corte Histológico».",
          },
          {
            id: 4,
            name: "Campo Oscuro de Epifluorescencia",
            shortLabel: "Fondo oscuro UV",
            category: "Contraste de Epifluorescencia",
            colorBio: "#0f172a",
            colorGiemsa: "#1e1b4b",
            anchor: [0.0, -0.65, 0.1],
            cameraPos: [0.0, -1.1, 2.5],
            lookAt: [0.0, -0.4, 0.0],
            description:
              "Ausencia de fluorescencia en el fondo fecal circundante, lo que multiplica por 3 la sensibilidad diagnóstica respecto al frotis en fresco.",
            microscopy:
              "Permite examinar el portaobjetos completo a 20× en menos de 2 minutos.",
            clinical:
              "Esencial dado que Cyclospora se excreta en cantidades bajas e intermitentes.",
            threeDNote:
              "Base oscura no reflectante bajo los ooquistes autofluorescentes.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Tinción Ácido-Alcohol Resistente Variable (Rojos, Rosados y «Fantasmas»)",
        shortName: "4. Tinción AAR Variable",
        subtitle: "Sello diagnóstico en Kinyoun: mezcla de ooquistes rojo oscuro, rosados e incoloros («fantasmas»)",
        sizeRange: "8.0 – 10.0 µm",
        scaleMicrons: 5,
        defaultTranslucency: 50,
        defaultCut: 0,
        defaultMotility: 20,
        defaultCameraPos: [0.1, 0.45, 4.0],
        summary:
          "En la tinción de Ziehl-Neelsen modificada (Kinyoun), Cyclospora cayetanensis exhibe un comportamiento patognomónico llamado «ÁCIDO-ALCOHOL RESISTENCIA VARIABLE»: en un mismo campo microscópico, algunos ooquistes de 8–10 µm se tiñen de rojo rubí oscuro, otros de rosa pálido moteado y muchos quedan completamente incoloros como esferas vítreas refringentes («ooquistes fantasma» o ghost oocysts).",
        diagnosticPearl:
          "Si en un frotis de Kinyoun observas esferas de 8–10 µm donde unas son rojas, otras rosadas y otras transparentes «fantasmas» sobre el fondo azul, el diagnóstico es Cyclospora cayetanensis. (La tinción con Safranina caliente al microondas logra teñir casi el 100% de color rojo-anaranjado uniforme).",
        regions: [
          {
            id: 1,
            name: "Ooquiste Intensamente Ácido-Alcohol Resistente (Rojo Rubí)",
            shortLabel: "Ooquiste rojo intenso",
            category: "Variabilidad Tintorial (1/3)",
            colorBio: "#be123c",
            colorGiemsa: "#9f1239",
            anchor: [-0.88, 0.22, 0.3],
            cameraPos: [-1.8, 0.5, 2.4],
            lookAt: [-0.8, 0.1, 0.05],
            description:
              "Ooquiste de 8–10 µm que ha retenido fuertemente la carbolfucsina mostrando color rojo-magenta oscuro.",
            microscopy:
              "Suele presentar aspecto plegado o arrugado interno por la fijación alcohólica.",
            clinical:
              "Su diámetro doble (8–10 µm) impide confundirlo con Cryptosporidium (4–6 µm).",
            threeDNote:
              "Ooquiste izquierdo rojo rubí con mórula interna.",
          },
          {
            id: 2,
            name: "Ooquiste Parcialmente Teñido (Rosa Pálido Moteado)",
            shortLabel: "Ooquiste rosa moteado",
            category: "Variabilidad Tintorial (2/3)",
            colorBio: "#f472b6",
            colorGiemsa: "#ec4899",
            anchor: [0.0, 0.35, 0.35],
            cameraPos: [0.0, 0.8, 2.3],
            lookAt: [0.0, 0.2, 0.1],
            description:
              "Ooquiste con retención parcial e irregular del colorante fucsina sobre los glóbulos de la mórula.",
            microscopy:
              "Muestra un punteado rosado-rojizo interno rodeado por una pared clara.",
            clinical:
              "Demuestra la permeabilidad heterogénea de la pared de Cyclospora frente al decolorante ácido.",
            threeDNote:
              "Ooquiste central rosado semitransparente.",
          },
          {
            id: 3,
            name: "«Ooquiste Fantasma» No Teñido (Vítreo / Incoloro Refringente)",
            shortLabel: "Ooquiste «fantasma»",
            category: "Variabilidad Tintorial (3/3)",
            colorBio: "#e2e8f0",
            colorGiemsa: "#cbd5e1",
            anchor: [0.88, 0.18, 0.3],
            cameraPos: [1.8, 0.5, 2.4],
            lookAt: [0.8, 0.1, 0.05],
            description:
              "Ooquiste de 8–10 µm que perdió totalmente la fucsina durante la decoloración pero tampoco aceptó el azul de metileno, quedando como un círculo blanco/vítreo refringente con pared arrugada.",
            microscopy:
              "Los «ooquistes fantasma» son sumamente característicos de Cyclospora cayetanensis en tinciones ácido-alcohol resistentes estándar.",
            clinical:
              "Si todos los ooquistes de una muestra se decoloran, un observador inexperto puede informar un falso negativo; de ahí el valor de la autofluorescencia UV o la safranina caliente.",
            threeDNote:
              "Ooquiste derecho nacarado hialino sobre el fondo azul.",
          },
          {
            id: 4,
            name: "Alternativa de Confirmación: Tinción de Safranina Caliente",
            shortLabel: "Referencia Safranina",
            category: "Optimización de Laboratorio",
            colorBio: "#f97316",
            colorGiemsa: "#ea580c",
            anchor: [0.0, -0.45, 0.25],
            cameraPos: [0.0, -0.8, 2.4],
            lookAt: [0.0, -0.35, 0.0],
            description:
              "La tinción con safranina alcohólica calentada (85 °C o microondas) penetra uniformemente la pared de todos los ooquistes de Cyclospora.",
            microscopy:
              "Elimina el fenómeno de los ooquistes fantasma al teñir el 100% de los ooquistes de un color rojo-anaranjado brillante homogéneo.",
            clinical:
              "Recomendada por el CDC DPDx como tinción cromogénica de referencia para Cyclospora cayetanensis.",
            threeDNote:
              "Indicador cromático inferior en la placa.",
          },
        ],
      },
    },
  },
  p10: {
    code: "p10",
    scientificName: "Cystoisospora belli (Isospora belli)",
    commonName: "Cistoisosporiasis (Diarrea Crónica en VIH y Eosinofilia por Coccidio)",
    taxonomyBadge: "P10 · Apicomplejo Coccidio Elipsoidal Gigante",
    stainLabel: "Kinyoun / Fresco DIC",
    stages: {
      stage1: {
        id: "stage1",
        label: "Ooquiste Inmaduro Recién Excretado (20–33 × 10–19 µm) — 1 Esporoblasto",
        shortName: "1. Ooquiste Inmaduro (1 Esporoblasto)",
        subtitle: "Elipsoidal grande en forma de «balón de rugby» con polos ahusados y un único esporoblasto central",
        sizeRange: "20 – 33 × 10 – 19 µm",
        scaleMicrons: 10,
        defaultTranslucency: 60,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.2, 0.35, 3.9],
        summary:
          "El ooquiste de Cystoisospora belli (antes Isospora belli) es enorme en comparación con los demás coccidios intestinales: mide 20–33 µm de largo por 10–19 µm de ancho y tiene una silueta elipsoidal alargada con uno o ambos polos ligeramente ahusados («en forma de balón de rugby o botella»). En heces recién emitidas contiene habitualmente una única masa esférica granular central llamada ESPOROBLASTO (no es inmediatamente infectante).",
        diagnosticPearl:
          "Cystoisospora belli es el ÚNICO protozoo intestinal que se asocia característicamente con EOSINOFILIA periférica y cristales de Charcot-Leyden en las heces. Tratamiento de elección: Trimetoprim-Sulfametoxazol (TMP-SMX).",
        regions: [
          {
            id: 1,
            name: "Pared Ooquística Elipsoidal Hialina con Polos Ahusados (20–33 µm)",
            shortLabel: "Pared elipsoidal (20–33 µm)",
            category: "Morfología Diagnóstica",
            colorBio: "#94a3b8",
            colorGiemsa: "#64748b",
            anchor: [-1.15, 0.35, 0.25],
            cameraPos: [-2.1, 0.7, 2.5],
            lookAt: [-0.6, 0.15, 0.0],
            description:
              "Cubierta externa lisa, delgada, incolora y bicapa con silueta ovalada alargada y estrechamiento suave hacia los extremos polares.",
            microscopy:
              "En examen en fresco hay que cerrar el condensador y bajar la intensidad de luz porque la pared es muy transparente y puede pasar inadvertida con iluminación excesiva.",
            clinical:
              "Su gran tamaño (25–30 µm) permite identificarlo de inmediato en el coproparasitológico directo o por concentración (3 a 6 veces más largo que Cryptosporidium).",
            threeDNote:
              "Cápsula elipsoidal translúcida con polos suavemente aguzados; se abre longitudinalmente con «Corte Histológico».",
          },
          {
            id: 2,
            name: "Esporoblasto Único Esférico Central (Estadio Diagnóstico Habitual)",
            shortLabel: "1 esporoblasto central",
            category: "Forma en Heces Frescas",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [0.0, 0.05, 0.38],
            cameraPos: [0.1, 0.2, 2.3],
            lookAt: [0.0, 0.0, 0.1],
            description:
              "Masa esférica única de 10–14 µm compuesta por gránulos citoplasmáticos gruesos y refringentes que ocupa el centro del ooquiste recién excretado.",
            microscopy:
              "En tinción de Ziehl-Neelsen modificada (Kinyoun) el esporoblasto central se tiñe de un intenso color rojo carmín o magenta brillante, mientras que el espacio periférico y la pared quedan claros o rosados.",
            clinical:
              "Como el ooquiste sale inmaduro con 1 esporoblasto, requiere al menos 24–48 h en el ambiente exterior para esporular y volverse infectante.",
            threeDNote:
              "Esfera central granulada rojo-rubí suspendida dentro de la cavidad elipsoidal.",
          },
          {
            id: 3,
            name: "Polos Apicales con Cuello Estrechado y Micrópilo",
            shortLabel: "Polo ahusado",
            category: "Detalle Polar",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [1.28, 0.0, 0.2],
            cameraPos: [2.2, 0.3, 2.3],
            lookAt: [0.9, 0.0, 0.0],
            description:
              "Extremo polar ligeramente asimétrico y estrechado en cuello de botella que distingue a C. belli de otros ooquistes.",
            microscopy:
              "Visible a 40× en montaje húmedo con Lugol o DIC.",
            clinical:
              "Sitio de adelgazamiento polar involucrado en la liberación de esporozoítos en el duodeno.",
            threeDNote:
              "Ahusamiento polar esculpido en ambos extremos del eje X.",
          },
          {
            id: 4,
            name: "Espacio Periesporoblástico Transparente",
            shortLabel: "Cavidad hialina",
            category: "Contraste Interno",
            colorBio: "#e2e8f0",
            colorGiemsa: "#fce7f3",
            anchor: [-0.65, -0.25, 0.3],
            cameraPos: [-1.4, -0.5, 2.3],
            lookAt: [-0.4, -0.15, 0.05],
            description:
              "Amplia cámara clara comprendida entre el esporoblasto esférico central y los polos de la pared elipsoidal.",
            microscopy:
              "En Kinyoun da la imagen clásica de «una bola roja flotando dentro de una cápsula de vidrio transparente».",
            clinical:
              "Permite el espacio físico para la posterior escisión en dos esporoblastos y dos esporoquistes.",
            threeDNote:
              "Espacio interno visible alrededor de la esfera central.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Ooquiste Maduro Esporulado Infectante (2 Esporoquistes × 4 Esporozoítos)",
        shortName: "2. Ooquiste Maduro (2×4)",
        subtitle: "Contiene 2 esporoquistes esféricos/ovales, cada uno con 4 esporozoítos curvos (8 en total)",
        sizeRange: "20 – 33 × 10 – 19 µm",
        scaleMicrons: 10,
        defaultTranslucency: 62,
        defaultCut: 0,
        defaultMotility: 30,
        defaultCameraPos: [0.2, 0.35, 3.9],
        summary:
          "En 24 a 48 horas a temperatura ambiente (o en muestras fecales que demoraron en procesarse), el esporoblasto único de Cystoisospora belli se divide en dos esporoblastos, que secretan su propia pared para convertirse en 2 ESPOROQUISTES, dentro de cada cual se forman 4 ESPOROZOÍTOS falciformes (fórmula taxonómica «2 × 4 = 8»).",
        diagnosticPearl:
          "Fórmula taxonómica del género Cystoisospora / Sarcocystis / Toxoplasma («di-esporoquístico, tetra-zoico»): 2 esporoquistes × 4 esporozoítos = 8 esporozoítos totales por ooquiste.",
        regions: [
          {
            id: 1,
            name: "Dos Esporoquistes Internos de Pared Propia (9–14 µm cada uno)",
            shortLabel: "2 esporoquistes",
            category: "Fórmula Taxonómica 2×4",
            colorBio: "#38bdf8",
            colorGiemsa: "#a855f7",
            anchor: [-0.52, 0.22, 0.3],
            cameraPos: [-1.4, 0.5, 2.3],
            lookAt: [-0.45, 0.1, 0.05],
            description:
              "Dos quistes secundarios elipsoidales u ovoides situados en línea a lo largo del eje mayor del ooquiste.",
            microscopy:
              "Cada esporoquiste posee una pared refringente independiente sin cuerpo de Stieda.",
            clinical:
              "Es la forma infectante por vía fecal-oral a través de agua o alimentos contaminados.",
            threeDNote:
              "Dos cápsulas ovoides translúcidas alineadas dentro del ooquiste elipsoidal.",
          },
          {
            id: 2,
            name: "Cuatro Esporozoítos en Media Luna por Esporoquiste (8 Totales)",
            shortLabel: "4 esporozoítos / esporoquiste",
            category: "Estadio Invasivo",
            colorBio: "#fde047",
            colorGiemsa: "#e11d48",
            anchor: [0.52, 0.18, 0.32],
            cameraPos: [1.4, 0.5, 2.3],
            lookAt: [0.45, 0.1, 0.05],
            description:
              "Cuatro esporozoítos curvos con núcleo central agrupados dentro de cada uno de los dos esporoquistes.",
            microscopy:
              "Visibles en microscopía de contraste de fases, DIC o al seccionar el ooquiste.",
            clinical:
              "Invaden el citoplasma de los enterocitos del duodeno distal y yeyuno proximal; en pacientes con SIDA pueden diseminarse además a ganglios linfáticos mesentéricos, hígado y bazo (quistes tisulares extraintestinales monozoicos).",
            threeDNote:
              "Ocho esporozoítos curvos 3D (4 en el esporoquiste izquierdo y 4 en el derecho) expuestos al deslizar «Corte Histológico».",
          },
          {
            id: 3,
            name: "Cuerpo Residual Esporoquístico Compacto",
            shortLabel: "Cuerpo residual",
            category: "Reserva Metabólica",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [-0.48, -0.18, 0.3],
            cameraPos: [-1.2, -0.4, 2.2],
            lookAt: [-0.45, -0.1, 0.05],
            description:
              "Masa granular compacta de reserva situada entre los 4 esporozoítos de cada esporoquiste.",
            microscopy:
              "Se tiñe intensamente de rojo en Kinyoun dentro de cada uno de los dos esporoquistes.",
            clinical:
              "Mantiene la infectividad del ooquiste durante meses en ambientes cálidos y húmedos.",
            threeDNote:
              "Esfera roja en el centro de cada esporoquiste.",
          },
          {
            id: 4,
            name: "Pared Ooquística Elipsoidal Externa (Autofluorescente en UV)",
            shortLabel: "Pared externa UV+",
            category: "Cubierta Diagnóstica",
            colorBio: "#22d3ee",
            colorGiemsa: "#64748b",
            anchor: [0.0, 0.68, 0.25],
            cameraPos: [0.1, 1.3, 2.5],
            lookAt: [0.0, 0.35, 0.0],
            description:
              "Al igual que Cyclospora, la pared de Cystoisospora belli exhibe autofluorescencia azul-violeta intensa bajo luz UV (330–365 nm).",
            microscopy:
              "Bajo UV se observa la inconfundible silueta grande en balón de rugby (20–33 µm) con sus dos esferas internas brillantes.",
            clinical:
              "En pacientes con VIH/SIDA las recaídas son frecuentes tras suspender el tratamiento, por lo que requieren profilaxis secundaria con TMP-SMX mientras los CD4 sean <200 cél/µL.",
            threeDNote:
              "Cápsula exterior elipsoidal seccionable en 3D.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Ooquiste en División (2 Esporoblastos) + Cristales de Charcot-Leyden",
        shortName: "3. Bi-esporoblasto + Charcot-Leyden",
        subtitle: "Estadio intermedio con 2 esporoblastos rojos en Kinyoun acompañado de cristales de Charcot-Leyden",
        sizeRange: "Ooquiste 25–30 µm · Cristales 15–40 µm",
        scaleMicrons: 10,
        defaultTranslucency: 55,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.15, 0.4, 4.1],
        summary:
          "En muestras fecales procesadas pocas horas después de la emisión se observa con frecuencia el estadio intermedio de división con 2 ESPOROBLASTOS esféricos gemelos teñidos de rojo intenso en Kinyoun, rodeados en el frotis por abundantes cristales bipiramidales de Charcot-Leyden (producto de la degranulación eosinofílica en la mucosa intestinal).",
        diagnosticPearl:
          "La tríada en el examen coproparasitológico de: (1) diarrea acuosa crónica en paciente inmunodeprimido, (2) abundantes cristales de Charcot-Leyden en heces, y (3) grandes cápsulas ovales con 1 o 2 bolas rojas ácido-alcohol resistentes es patognomónica de Cystoisospora belli.",
        regions: [
          {
            id: 1,
            name: "Dos Esporoblastos Esféricos Gemelos (Ácido-Alcohol Resistentes)",
            shortLabel: "2 esporoblastos rojos",
            category: "Maduración Temprana",
            colorBio: "#e11d48",
            colorGiemsa: "#be123c",
            anchor: [-0.45, 0.15, 0.35],
            cameraPos: [-1.2, 0.4, 2.3],
            lookAt: [-0.35, 0.1, 0.05],
            description:
              "Dos esferas granulares simétricas de ~10 µm aún desprovistas de pared esporoquística rígida ni esporozoítos diferenciados.",
            microscopy:
              "En tinción de Kinyoun destacan como dos círculos rojo-magenta intensos dentro del óvalo transparente de 25–30 µm.",
            clinical:
              "Estadio frecuentemente fotografiado en los atlas de diagnóstico parasitológico (CDC DPDx).",
            threeDNote:
              "Dos esferas granulares rojas dentro del ooquiste elipsoidal.",
          },
          {
            id: 2,
            name: "Cristales Bipiramidales de Charcot-Leyden en Heces",
            shortLabel: "Cristales Charcot-Leyden",
            category: "Asociación Eosinofílica Única",
            colorBio: "#fbbf24",
            colorGiemsa: "#ec4899",
            anchor: [0.75, -0.45, 0.3],
            cameraPos: [1.7, -0.6, 2.4],
            lookAt: [0.55, -0.35, 0.05],
            description:
              "Cristales hexagonales bipiramidales en forma de aguja o rombo alargado originados por la lisis de eosinófilos infiltrados en la lámina propia intestinal.",
            microscopy:
              "En fresco son refringentes; en tricrómico y Kinyoun se tiñen de rojo-púrpura o fucsia brillante.",
            clinical:
              "A diferencia de Giardia, Cryptosporidium y Entamoeba (que no cursan con eosinofilia), Cystoisospora belli estimula una marcada eosinofilia mucosa y sanguínea.",
            threeDNote:
              "Bipirámides geométricas facetadas junto al ooquiste.",
          },
          {
            id: 3,
            name: "Pared Elipsoidal en «Balón de Rugby»",
            shortLabel: "Pared ooquística",
            category: "Envoltura",
            colorBio: "#94a3b8",
            colorGiemsa: "#64748b",
            anchor: [0.55, 0.48, 0.25],
            cameraPos: [1.4, 0.9, 2.4],
            lookAt: [0.3, 0.25, 0.0],
            description:
              "Contorno elipsoidal alargado de 25–30 µm con polos simétricamente estrechados.",
            microscopy:
              "Permanece incolora o levemente rosada tras la decoloración ácida.",
            clinical:
              "Resistente a desinfectantes clorados convencionales.",
            threeDNote:
              "Cápsula exterior seccionable con «Corte Histológico».",
          },
          {
            id: 4,
            name: "Puente de Escisión Citoplasmática",
            shortLabel: "Plano de escisión",
            category: "División Esporogónica",
            colorBio: "#fda4af",
            colorGiemsa: "#f43f5e",
            anchor: [0.0, 0.05, 0.35],
            cameraPos: [0.0, 0.2, 2.2],
            lookAt: [0.0, 0.0, 0.1],
            description:
              "Plano ecuatorial donde el esporoblasto primario acaba de dividirse por fisión binaria en los dos esporoblastos hijos.",
            microscopy:
              "Separación nítida en la cintura central del ooquiste.",
            clinical:
              "Precede inmediatamente a la síntesis de la pared de los dos esporoquistes.",
            threeDNote:
              "Interfase central entre ambas esferas.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Esquizogonia Intracitoplasmática en Enterocito + Eosinofilia Mucosa",
        shortName: "4. Biopsia Duodenal (Enterocito)",
        subtitle: "Merozoítos intracitoplasmáticos profundos (no epicelulares) con infiltrado eosinofílico en lámina propia",
        sizeRange: "Meronte 12–18 µm dentro de enterocito",
        scaleMicrons: 10,
        defaultTranslucency: 48,
        defaultCut: 0,
        defaultMotility: 30,
        defaultCameraPos: [0.15, 0.45, 4.1],
        summary:
          "A diferencia de Cryptosporidium (que es epicelular en la punta de las microvellosidades), Cystoisospora belli invade profundamente el CITOPLASMA perinuclear y subnuclear de los enterocitos del duodeno y yeyuno. La biopsia intestinal muestra atrofia de vellosidades, hiperplasia de criptas, merontes y gamontes intracitoplasmáticos y un denso infiltrado de eosinófilos en la lámina propia.",
        diagnosticPearl:
          "En biopsia duodenal: Cryptosporidium está pegado «por fuera» en el borde en cepillo; Cyclospora y Cystoisospora están «por dentro» en vacuolas intracitoplasmáticas del enterocito.",
        regions: [
          {
            id: 1,
            name: "Vacuola Parasitófora Intracitoplasmática con Merozoítos en Haces",
            shortLabel: "Meronte intracitoplasmático",
            category: "Localización Intracelular Profunda",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [0.05, 0.18, 0.35],
            cameraPos: [0.2, 0.5, 2.3],
            lookAt: [0.0, 0.15, 0.1],
            description:
              "Vacuola situada en el pleno citoplasma del enterocito (por encima o por debajo del núcleo) que aloja haces de merozoítos alargados en forma de medialuna.",
            microscopy:
              "En H&E y Giemsa tisular se distinguen los merozoítos fusiformes de 8–10 µm dentro de una vacuola clara perinuclear.",
            clinical:
              "La lisis repetida de enterocitos provoca síndrome de malabsorción grave con esteatorrea, pérdida de peso caquectizante y fiebre.",
            threeDNote:
              "Haz de merozoítos 3D en el interior del enterocito prismático; expuesto al activar «Corte Histológico».",
          },
          {
            id: 2,
            name: "Núcleo Basal Desplazado del Enterocito Hospedador",
            shortLabel: "Núcleo del enterocito",
            category: "Célula Epitelial",
            colorBio: "#6366f1",
            colorGiemsa: "#4338ca",
            anchor: [-0.25, -0.32, 0.25],
            cameraPos: [-0.9, -0.4, 2.3],
            lookAt: [-0.2, -0.25, 0.05],
            description:
              "Núcleo ovoide basal del enterocito comprimido por el crecimiento de la vacuola parasitófora.",
            microscopy:
              "Cromatina condensada e hipertrofia reactiva de las células de las criptas.",
            clinical:
              "El daño epitelial reduce drásticamente la superficie absortiva duodenal.",
            threeDNote:
              "Elipsoide violeta en el tercio basal de la columna epitelial.",
          },
          {
            id: 3,
            name: "Infiltrado de Eosinófilos en la Lámina Propia Subepitelial",
            shortLabel: "Eosinófilos en lámina propia",
            category: "Sello Histopatológico",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [0.68, -0.48, 0.3],
            cameraPos: [1.6, -0.6, 2.4],
            lookAt: [0.45, -0.4, 0.05],
            description:
              "Abundantes leucocitos eosinófilos bilobulados infiltrando la lámina propia bajo la membrana basal del enterocito.",
            microscopy:
              "Intensa eosinofilia tisular acompañada de liberación de galectina-10 hacia la luz intestinal (origen de los cristales de Charcot-Leyden).",
            clinical:
              "Explica la eosinofilia en sangre periférica (10–25%) que orienta al clínico hacia C. belli frente a otros protozoos.",
            threeDNote:
              "Esferas celulares rojas granuladas en el compartimento subepitelial inferior.",
          },
          {
            id: 4,
            name: "Cuerpo Cilíndrico del Enterocito y Borde Microvellositario",
            shortLabel: "Citoplasma enterocitario",
            category: "Tejido Hospedador",
            colorBio: "#38bdf8",
            colorGiemsa: "#94a3b8",
            anchor: [-0.75, 0.35, 0.3],
            cameraPos: [-1.7, 0.7, 2.5],
            lookAt: [-0.4, 0.2, 0.0],
            description:
              "Célula epitelial cilíndrica del intestino delgado con microvellosidades apicales.",
            microscopy:
              "A diferencia de Cryptosporidium, aquí la superficie microvellositaria no aloja al parásito, sino que el parásito reside dentro del cuerpo celular.",
            clinical:
              "En pacientes alérgicos a sulfonamidas (TMP-SMX), la alternativa terapéutica es pirimetamina + ácido folínico o ciprofloxacino.",
            threeDNote:
              "Prisma celular translúcido que se secciona con el deslizador de corte histológico.",
          },
        ],
      },
    },
  },
  p11: {
    code: "p11",
    scientificName: "Toxoplasma gondii",
    commonName: "Toxoplasmosis (Congénita, Coriorretinitis y Encefalitis en VIH)",
    taxonomyBadge: "P11 · Apicomplejo Intracelular Obligado",
    stainLabel: "Tinción Giemsa / PAS",
    stages: {
      stage1: {
        id: "stage1",
        label: "Taquizoíto en Media Luna / Arco (6 × 2 µm) — Complejo Apical 3D",
        shortName: "1. Taquizoíto (Complejo Apical)",
        subtitle: "Forma proliferativa aguda («trophos = arco») con conoide, roptrias en maza, micronemas y apicoplasto",
        sizeRange: "5.0 – 7.0 × 2.0 – 3.0 µm",
        scaleMicrons: 2,
        defaultTranslucency: 56,
        defaultCut: 0,
        defaultMotility: 45,
        defaultCameraPos: [0.15, 0.35, 3.6],
        summary:
          "El taquizoíto (del griego tachys = rápido) es la forma de multiplicación rápida responsable de la fase aguda de la toxoplasmosis, la transmisión transplacentaria congénita y la encefalitis por reactivación. Tiene forma de media luna o arco (de ahí el nombre Toxoplasma: toxon = arco) con un polo anterior puntiagudo que aloja el COMPLEJO APICAL (conoide retráctil, roptrias claviformes, micronemas y anillos polares) y un polo posterior redondeado.",
        diagnosticPearl:
          "El taquizoíto puede invadir activamente CUALQUIER célula nucleada de mamífero en <15 segundos mediante su complejo apical y las proteínas de roptrias (RON/ROP) que forman la unión móvil (moving junction), creando una vacuola parasitófora que bloquea la acidificación lisosomal.",
        regions: [
          {
            id: 1,
            name: "Conoide Apical Retráctil y Anillos Polares (Polo Anterior Puntiagudo)",
            shortLabel: "Conoide y anillos polares",
            category: "Maquinaria de Invasión Activa",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [-1.18, 0.38, 0.15],
            cameraPos: [-2.0, 0.7, 2.2],
            lookAt: [-0.9, 0.25, 0.0],
            description:
              "Cono truncado hueco formado por fibras espirales de tubulina polimórfica situado en el extremo anterior aguzado, desde donde nacen los 22 microtúbulos subpeliculares.",
            microscopy:
              "En microscopía electrónica se observa cómo el conoide se extruye hacia adelante impulsado por calcio en el instante de perforar la membrana de la célula huésped.",
            clinical:
              "Proporciona la fuerza mecánica para penetrar la barrera placentaria, hematoencefálica y hematorretiniana.",
            threeDNote:
              "Cono anillado cian en el vértice anterior del arco; expuesto en detalle al activar «Corte Histológico».",
          },
          {
            id: 2,
            name: "Roptrias Claviformes (8–12 Organelos en Forma de Maza) y Micronemas",
            shortLabel: "Roptrias y micronemas",
            category: "Organelos Secretorios Apicomplejos",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.55, 0.22, 0.28],
            cameraPos: [-1.3, 0.5, 2.2],
            lookAt: [-0.45, 0.15, 0.05],
            description:
              "Organelos alargados en forma de maza o bate de béisbol cuyos cuellos delgados convergen dentro del conoide, rodeados por decenas de micronemas ovalados.",
            microscopy:
              "Los micronemas secretan adhesinas (MIC2) para la motilidad deslizante; las roptrias inyectan proteínas ROP16/ROP18 directamente al núcleo del hospedador.",
            clinical:
              "Las quinasas de roptria (ROP18) inactivan las GTPasas de inmunidad del huésped, impidiendo que la vacuola sea destruida por el macrófago.",
            threeDNote:
              "Haces de mazas rojas (roptrias) y vesículas ambarinas (micronemas) convergiendo hacia el conoide anterior.",
          },
          {
            id: 3,
            name: "Apicoplasto (Plastidio No Fotosintético de 4 Membranas)",
            shortLabel: "Apicoplasto (diana farmacológica)",
            category: "Diana de Clindamicina / Pirimetamina",
            colorBio: "#4ade80",
            colorGiemsa: "#16a34a",
            anchor: [0.05, 0.15, 0.28],
            cameraPos: [0.2, 0.4, 2.2],
            lookAt: [0.0, 0.1, 0.05],
            description:
              "Organelo relictual de origen endosimbiótico algal provisto de 4 membranas y su propio genoma circular de 35 kb, situado justo delante del núcleo.",
            microscopy:
              "Sintetiza ácidos grasos de tipo II (FAS II), isoprenoides y grupos hemo esenciales para la supervivencia del parásito.",
            clinical:
              "El apicoplasto posee ribosomas de tipo procariota (70S), razón por la cual antibióticos como la CLINDAMICINA, espiramicina y azitromicina son activos contra Toxoplasma gondii.",
            threeDNote:
              "Esférula verde esmeralda multilaminar situada delante del núcleo.",
          },
          {
            id: 4,
            name: "Núcleo Subcentral, Gránulos Densos (GRA) y Película Trimembranaria",
            shortLabel: "Núcleo y película IMC",
            category: "Cuerpo en Media Luna",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.58, -0.05, 0.3],
            cameraPos: [1.4, 0.2, 2.3],
            lookAt: [0.45, -0.05, 0.05],
            description:
              "Núcleo eucariota situado hacia la mitad posterior redondeada y película formada por la membrana plasmática más el complejo de membrana interna (IMC).",
            microscopy:
              "En tinción de Giemsa el citoplasma del taquizoíto se tiñe de azul cielo y el núcleo paracentral de rojo-púrpura intenso.",
            clinical:
              "La síntesis de folatos nucleares es bloqueada sinérgicamente por Pirimetamina + Sulfadiazina (siempre asociar Ácido Folínico / Leucovorina para proteger la médula ósea humana).",
            threeDNote:
              "Núcleo púrpura y corteza arqueada que se abre con el deslizador de corte histológico.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Quiste Tisular Cerebral / Muscular con Bradizoítos (50–100 µm)",
        shortName: "2. Quiste Tisular (Bradizoítos)",
        subtitle: "Esférico con pared elástica PAS+ repleto de cientos de bradizoítos de división lenta (latencia de por vida)",
        sizeRange: "15 – 100 µm (contiene 50 a >1.000 bradizoítos)",
        scaleMicrons: 25,
        defaultTranslucency: 52,
        defaultCut: 0,
        defaultMotility: 15,
        defaultCameraPos: [0.2, 0.35, 3.8],
        summary:
          "Bajo la presión de la inmunidad celular (IFN-γ y linfocitos T CD8+), Toxoplasma gondii se transforma en BRADIZOÍTOS de multiplicación lenta contenidos dentro de QUISTES TISULARES esféricos en el cerebro, retina y músculo esquelético/miocárdico. Estos quistes persisten de por vida en el hospedador y son la fuente de infección al comer carne cruda o poco cocida, así como el origen de la encefalitis toxoplásmica cuando caen los CD4 (<100/µL en VIH).",
        diagnosticPearl:
          "En VIH avanzado (CD4 < 100/µL), la rotura de quistes tisulares cerebrales causa Encefalitis Toxoplásmica con lesiones múltiples con «realce en anillo» y edema en ganglios basales y unión corticomedular en la RM/TC cerebral.",
        regions: [
          {
            id: 1,
            name: "Pared Quística Tisular Elástica (Argirófila y PAS+)",
            shortLabel: "Pared quística tisular",
            category: "Persistencia e Inmunoevasión",
            colorBio: "#a855f7",
            colorGiemsa: "#9333ea",
            anchor: [-0.95, 0.55, 0.3],
            cameraPos: [-1.9, 1.0, 2.5],
            lookAt: [-0.5, 0.3, 0.05],
            description:
              "Membrana vacuolar modificada por el parásito (<0.5 µm de espesor), rica en glicoproteínas fijadoras de lectina Dolichos biflorus (CST1) y quitina-símil.",
            microscopy:
              "En cortes histológicos de cerebro (H&E, PAS o impregnación argéntica) el quiste tisular intacto es esférico y NO presenta reacción inflamatoria alrededor mientras permanece cerrado.",
            clinical:
              "Oculta a los bradizoítos del sistema inmune y resiste a todos los antiparasitarios actuales (ningún fármaco erradica los quistes tisulares latentes).",
            threeDNote:
              "Esfera externa translúcida que al abrirse con «Corte Histológico» revela el empaquetamiento masivo de bradizoítos.",
          },
          {
            id: 2,
            name: "Cientos de Bradizoítos en Media Luna (Gránulos de Amilopectina PAS+)",
            shortLabel: "Bradizoítos empaquetados",
            category: "Estadio Latente Infectante",
            colorBio: "#fde047",
            colorGiemsa: "#ec4899",
            anchor: [0.22, 0.12, 0.35],
            cameraPos: [1.1, 0.3, 2.2],
            lookAt: [0.15, 0.05, 0.1],
            description:
              "Formas arqueadas de 7 × 1.5 µm más delgadas que los taquizoítos, con núcleo desplazado hacia el polo posterior y abundantes gránulos de amilopectina.",
            microscopy:
              "Gracias a sus reservas de amilopectina, los bradizoítos se tiñen de color magenta intenso con Ácido Peryódico de Schiff (PAS), brillando como un saco de semillas rojas.",
            clinical:
              "Al ingerir carne de cerdo, cordero o res insuficientemente cocida (<67 °C), la pepsina gástrica disuelve la pared del quiste pero los bradizoítos resisten el ácido e invaden el intestino humano.",
            threeDNote:
              "Decenas de bradizoítos 3D curvos densamente empaquetados en el interior del quiste.",
          },
          {
            id: 3,
            name: "Matriz Intracística Mucopolisacárida",
            shortLabel: "Matriz intracística",
            category: "Soporte Interno",
            colorBio: "#38bdf8",
            colorGiemsa: "#6366f1",
            anchor: [-0.25, -0.32, 0.35],
            cameraPos: [-1.0, -0.5, 2.2],
            lookAt: [-0.15, -0.2, 0.1],
            description:
              "Red nanotubular membranosa y matriz rica en proteínas GRA que llena los intersticios entre los bradizoítos.",
            microscopy:
              "Mantiene la cohesión estructural del quiste dentro del neuropilo cerebral o de la fibra muscular estriada.",
            clinical:
              "Su desestructuración ante la caída de IFN-γ (SIDA o inmunosupresión postrasplante) induce la reconversión de bradizoítos a taquizoítos destructivos.",
            threeDNote:
              "Núcleo central translúcido entre los bradizoítos.",
          },
          {
            id: 4,
            name: "Zona de Ruptura y Reconversión a Taquizoítos (Reactivación)",
            shortLabel: "Foco de reactivación",
            category: "Patogenia de Encefalitis / Retinitis",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [0.88, 0.38, 0.28],
            cameraPos: [1.8, 0.7, 2.4],
            lookAt: [0.6, 0.25, 0.05],
            description:
              "Polo del quiste donde los bradizoítos se reactivan a taquizoítos e inician la invasión de las neuronas y células gliales vecinas.",
            microscopy:
              "En encefalitis toxoplásmica se observan quistes intactos coexistiendo con taquizoítos libres en la periferia de áreas de necrosis coagulativa.",
            clinical:
              "En la retina causa coriorretinitis necrotizante focal («faro en la niebla» por vitritis intensa sobre lesión blanco-amarillenta adyacente a cicatriz pigmentada antigua).",
            threeDNote:
              "Brote de formas arqueadas emergiendo en el cuadrante superior derecho.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Roseta Intracelular de Taquizoítos por Endodiogenia en Macrófago",
        shortName: "3. Roseta en Macrófago",
        subtitle: "Multiplicación asexual por endodiogenia (2 células hijas dentro de la madre) en vacuola parasitófora",
        sizeRange: "Vacuola 12–20 µm con 8–32 taquizoítos",
        scaleMicrons: 5,
        defaultTranslucency: 50,
        defaultCut: 0,
        defaultMotility: 40,
        defaultCameraPos: [0.15, 0.4, 3.9],
        summary:
          "Dentro de la vacuola parasitófora de un macrófago o fibroblasto, los taquizoítos se dividen cada 6–8 horas mediante un mecanismo especializado llamado ENDODIOGENIA (formación interna de dos células hijas completas dentro del citoplasma de la célula madre, que se consume al final). Las divisiones sincrónicas sucesivas crean una característica «roseta» o «racimo de bananas» antes de lisar la célula.",
        diagnosticPearl:
          "Los macrófagos y células dendríticas infectados son utilizados como «caballos de Troya» por Toxoplasma gondii para diseminarse por vía hematógena hacia el cerebro, el ojo y la placenta.",
        regions: [
          {
            id: 1,
            name: "Roseta de Taquizoítos en «Racimo de Bananas» (Endodiogenia Sincrónica)",
            shortLabel: "Roseta de taquizoítos",
            category: "División por Endodiogenia",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [0.15, 0.15, 0.35],
            cameraPos: [0.9, 0.4, 2.2],
            lookAt: [0.1, 0.1, 0.1],
            description:
              "Ocho a dieciséis taquizoítos arqueados dispuestos radialmente con sus polos posteriores unidos a un cuerpo residual común y sus polos apicales apuntando hacia afuera.",
            microscopy:
              "En frotis de líquido cefalorraquídeo, lavado broncoalveolar o impronta tisular teñidos con Giemsa forman rosetas intracelulares patognomónicas.",
            clinical:
              "Cuando la vacuola acumula 64–128 taquizoítos, el egreso activo inducido por perforinas parasitarias (TgPLP1) rompe la célula huésped.",
            threeDNote:
              "Doce taquizoítos 3D dispuestos en flor radial dentro de la vacuola parasitófora.",
          },
          {
            id: 2,
            name: "Membrana de la Vacuola Parasitófora No Fusogénica (PVM)",
            shortLabel: "Vacuola parasitófora",
            category: "Evasión de Fagolisosoma",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [0.45, 0.55, 0.3],
            cameraPos: [1.3, 1.0, 2.4],
            lookAt: [0.25, 0.3, 0.05],
            description:
              "Membrana vacuolar desprovista de proteínas transmembrana del huésped (excluye CD45 y marcadores endocíticos Rab/LAMP1), por lo que los lisosomas celulares no la reconocen ni pueden fusionarse con ella.",
            microscopy:
              "Aparece como un halo claro nítido alrededor de la roseta de taquizoítos.",
            clinical:
              "Recluta mitocondrias y retículo endoplásmico del macrófago hacia su superficie externa mediante la proteína MAF1 para captar lípidos.",
            threeDNote:
              "Esfera vacuolar interna translúcida alrededor de la roseta.",
          },
          {
            id: 3,
            name: "Núcleo Reniforme del Macrófago Hospedador",
            shortLabel: "Núcleo del macrófago",
            category: "Célula Hospedadora",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.65, -0.15, 0.25],
            cameraPos: [-1.5, -0.2, 2.3],
            lookAt: [-0.45, -0.1, 0.05],
            description:
              "Núcleo grande arriñonado del leucocito mononuclear desplazado hacia la periferia por la expansión de la vacuola parasitófora.",
            microscopy:
              "Teñido de violeta oscuro en Giemsa; el parásito inyecta proteínas efectoras (GRA16, GRA24, TgIST) dentro de este núcleo para bloquear la respuesta al IFN-γ.",
            clinical:
              "El secuestro de la señalización transcripcional del macrófago impide la expresión de MHC-II y la apoptosis celular.",
            threeDNote:
              "Estructura reniforme púrpura a la izquierda de la vacuola.",
          },
          {
            id: 4,
            name: "Membrana Plasmática del Macrófago («Caballo de Troya»)",
            shortLabel: "Membrana del macrófago",
            category: "Diseminación Sistémica",
            colorBio: "#64748b",
            colorGiemsa: "#94a3b8",
            anchor: [-0.95, 0.62, 0.2],
            cameraPos: [-1.9, 1.1, 2.6],
            lookAt: [-0.4, 0.3, 0.0],
            description:
              "Cuerpo celular del macrófago que adquiere un fenotipo hipermigratorio inducido por el parásito (vía señalización GABAérgica).",
            microscopy:
              "Permite el transporte intracelular de taquizoítos a través del endotelio capilar cerebral y placentario.",
            clinical:
              "En embarazadas con primoinfección aguda, el paso transplacentario origina la Toxoplasmosis Congénita (tríada clásica de Sabin: hidrocefalia, calcificaciones intracraneales difusas y coriorretinitis bilateral).",
            threeDNote:
              "Envoltura celular externa que se abre con «Corte Histológico».",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Ooquiste Fecal Felino Esporulado (10–12 µm) — 2 Esporoquistes × 4 Esporozoítos",
        shortName: "4. Ooquiste Felino (2×4)",
        subtitle: "Excretado únicamente por félidos (hospedador definitivo): 2 esporoquistes con 4 esporozoítos cada uno",
        sizeRange: "10.0 – 12.0 µm",
        scaleMicrons: 4,
        defaultTranslucency: 58,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.2, 0.35, 3.7],
        summary:
          "El gato doméstico y otros félidos son los ÚNICOS hospedadores definitivos de Toxoplasma gondii (debido a que carecen de la enzima delta-6-desaturasa intestinal, lo que acumula ácido linoleico libre que desencadena el ciclo sexual del parásito). El gato primoinfectado excreta millones de ooquistes durante 1–3 semanas; estos ooquistes (10–12 µm) esporulan en la caja de arena o tierra en 1 a 5 días formando 2 esporoquistes con 4 esporozoítos cada uno.",
        diagnosticPearl:
          "Consejo preventivo a embarazadas seronegativas: Como el ooquiste felino tarda 24 a 72 horas en esporular en las heces del gato, limpiar la caja de arena DIARIAMENTE (con guantes o delegando la tarea), usar guantes en jardinería y cocinar toda carne a ≥67 °C previene la toxoplasmosis congénita.",
        regions: [
          {
            id: 1,
            name: "Dos Esporoquistes Elipsoidales Internos (6 × 8 µm)",
            shortLabel: "2 esporoquistes (6×8 µm)",
            category: "Fórmula Coccidia 2×4",
            colorBio: "#38bdf8",
            colorGiemsa: "#6366f1",
            anchor: [-0.42, 0.18, 0.3],
            cameraPos: [-1.2, 0.5, 2.2],
            lookAt: [-0.35, 0.1, 0.05],
            description:
              "Dos esporoquistes ovoides formados entre las 24 y 72 horas posteriores a la excreción fecal felina.",
            microscopy:
              "Carecen de cuerpo de Stieda polar (al igual que Cystoisospora y Sarcocystis).",
            clinical:
              "Altamente infectantes por vía oral a través de agua, verduras crudas, tierra de jardín o manos contaminadas.",
            threeDNote:
              "Dos cápsulas ovoides gemelas dentro de la esfera ooquística.",
          },
          {
            id: 2,
            name: "Cuatro Esporozoítos por Esporoquiste (8 Esporozoítos Totales)",
            shortLabel: "8 esporozoítos internos",
            category: "Estadio Infectante Ambiental",
            colorBio: "#fde047",
            colorGiemsa: "#ec4899",
            anchor: [0.42, 0.15, 0.32],
            cameraPos: [1.2, 0.4, 2.2],
            lookAt: [0.35, 0.05, 0.05],
            description:
              "Cada esporoquiste contiene 4 esporozoítos falciformes de 2 × 6 µm que al ser ingeridos se transforman rápidamente en taquizoítos en la lámina propia intestinal.",
            microscopy:
              "Visibles en el interior de los esporoquistes maduros.",
            clinical:
              "La infección adquirida por ingestión de ooquistes suele ser más sintomática y causar mayor incidencia de toxoplasmosis ocular que la adquirida por quistes tisulares.",
            threeDNote:
              "Ocho esporozoítos curvos 3D (4 por esporoquiste) expuestos al deslizar «Corte Histológico».",
          },
          {
            id: 3,
            name: "Pared Ooquística Subesférica Ultrarresistente (10–12 µm)",
            shortLabel: "Pared ooquística (10–12 µm)",
            category: "Supervivencia en Suelo y Agua",
            colorBio: "#94a3b8",
            colorGiemsa: "#64748b",
            anchor: [0.0, 0.88, 0.25],
            cameraPos: [0.1, 1.5, 2.5],
            lookAt: [0.0, 0.4, 0.0],
            description:
              "Pared bilaminar rica en polímeros tirosina-ricos y beta-glucanos que resiste ácidos fuertes, lejía, cloración y congelación moderada.",
            microscopy:
              "Ooquiste subesférico de 10 × 12 µm con autofluorescencia azul bajo luz UV.",
            clinical:
              "Permanece viable e infectante durante 12 a 18 meses en tierra húmeda y agua dulce.",
            threeDNote:
              "Esfera externa translúcida seccionable con «Corte Histológico».",
          },
          {
            id: 4,
            name: "Cuerpos Residuales Esporoquísticos",
            shortLabel: "Cuerpos residuales",
            category: "Reserva Energética",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.38, -0.22, 0.3],
            cameraPos: [-1.1, -0.4, 2.2],
            lookAt: [-0.3, -0.15, 0.05],
            description:
              "Agregado granular lipídico y amilopectínico dentro de cada esporoquiste.",
            microscopy:
              "Refringente en montaje húmedo.",
            clinical:
              "Permite la latencia prolongada de los esporozoítos en el ambiente exterior.",
            threeDNote:
              "Esferas rojas internas en ambos esporoquistes.",
          },
        ],
      },
    },
  },
};

const VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  varying vec3 vViewPos;
  varying vec3 vColor;
  varying float vRegionId;

  attribute float aRegionId;
  uniform float uTime;
  uniform float uMotility;

  void main() {
    vColor = color;
    vRegionId = aRegionId;
    vec3 pos = position;

    float wave = sin(pos.x * 4.0 + pos.y * 3.2 + uTime * 2.5) * 0.014 * uMotility;
    pos += normal * wave;

    vLocalPos = pos;
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    vViewPos = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  varying vec3 vViewPos;
  varying vec3 vColor;
  varying float vRegionId;

  uniform float uTime;
  uniform float uTranslucency;
  uniform float uCutPercent;
  uniform int uShaderMode;
  uniform int uSelectedRegion;
  uniform int uHoveredRegion;

  float hash31(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3D(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
          mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
          mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  vec3 perturbNormalAnalytical(vec3 N, vec3 pos, float scale, float strength) {
    float eps = 0.025;
    float h0 = noise3D(pos * scale);
    float hx = noise3D((pos + vec3(eps, 0.0, 0.0)) * scale);
    float hy = noise3D((pos + vec3(0.0, eps, 0.0)) * scale);
    float hz = noise3D((pos + vec3(0.0, 0.0, eps)) * scale);
    vec3 grad = vec3(hx - h0, hy - h0, hz - h0) / eps;
    return normalize(N - grad * strength);
  }

  void main() {
    int reg = int(floor(vRegionId + 0.5));
    float frac = fract(vRegionId);

    if (uCutPercent > 0.01 && frac > 0.2) {
      float cutPlane = mix(1.45, -0.55, uCutPercent);
      if (vLocalPos.z + vLocalPos.y * 0.35 > cutPlane) {
        discard;
      }
    }

    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(vViewPos);
    N = perturbNormalAnalytical(N, vLocalPos, 12.0, 0.075);

    vec3 L1 = normalize(vec3(2.4, 3.2, 2.8));
    vec3 L2 = normalize(vec3(-2.5, -1.5, 1.8));
    float diff1 = max(dot(N, L1), 0.0);
    float diff2 = max(dot(N, L2), 0.0) * 0.35;
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.5);

    vec3 baseCol = vColor;
    vec3 finalCol = baseCol;
    float alpha = 1.0;

    if (uShaderMode == 0) {
      float sss = pow(max(dot(-L1, V), 0.0), 2.2) * 0.4;
      vec3 spec = vec3(1.0, 0.97, 0.92) * pow(max(dot(reflect(-L1, N), V), 0.0), 30.0) * 0.38;
      finalCol = baseCol * (0.28 + diff1 * 0.72 + diff2) + baseCol * sss + spec + vec3(0.18, 0.28, 0.38) * fresnel * 0.38;
      if (frac > 0.2) {
        alpha = mix(0.95, 0.3, uTranslucency);
      }
    } else if (uShaderMode == 1) {
      vec3 stainShift = mix(baseCol, vec3(baseCol.r * 1.05, baseCol.g * 0.48, baseCol.b * 0.85), 0.45);
      finalCol = stainShift * (0.5 + diff1 * 0.5) + vec3(0.95, 0.85, 0.92) * fresnel * 0.25;
      if (frac > 0.2) {
        alpha = mix(0.92, 0.28, uTranslucency);
      }
    } else if (uShaderMode == 2) {
      float lum = dot(baseCol, vec3(0.299, 0.587, 0.114));
      float micro = noise3D(vLocalPos * 24.0) * 0.18;
      vec3 semBase = vec3(0.52 + lum * 0.28 + micro);
      finalCol = semBase * (0.22 + diff1 * 0.58) + vec3(0.88, 0.92, 0.96) * fresnel * 0.72;
      alpha = frac > 0.2 ? mix(0.98, 0.5, uTranslucency * 0.5) : 1.0;
    } else {
      finalCol = mix(baseCol, vec3(0.22, 0.85, 0.98), 0.55) * (0.35 + fresnel * 1.35);
      alpha = frac > 0.2 ? mix(0.55, 0.18, uTranslucency) : 0.88;
    }

    if (reg == uSelectedRegion) {
      finalCol += vec3(0.18, 0.28, 0.38) * (0.55 + 0.45 * sin(uTime * 4.0));
    } else if (reg == uHoveredRegion) {
      finalCol += vec3(0.12, 0.18, 0.24);
    }

    gl_FragColor = vec4(clamp(finalCol, 0.0, 1.0), alpha);
  }
`;

class BioMeshBuilder {
  positions: number[] = [];
  normals: number[] = [];
  colors: number[] = [];
  regionIds: number[] = [];
  indices: number[] = [];

  addSphere(
    cx: number,
    cy: number,
    cz: number,
    rx: number,
    ry: number,
    rz: number,
    colHex: string,
    regionTag: number,
    segU = 28,
    segV = 20,
    deformFn?: (x: number, y: number, z: number, u: number, v: number) => [number, number, number]
  ) {
    const col = new THREE.Color(colHex);
    const baseIdx = this.positions.length / 3;

    for (let iv = 0; iv <= segV; iv++) {
      const v = iv / segV;
      const phi = v * Math.PI;
      for (let iu = 0; iu <= segU; iu++) {
        const u = iu / segU;
        const theta = u * Math.PI * 2;

        const nx = Math.sin(phi) * Math.cos(theta);
        const ny = Math.cos(phi);
        const nz = Math.sin(phi) * Math.sin(theta);

        let px = cx + nx * rx;
        let py = cy + ny * ry;
        let pz = cz + nz * rz;

        if (deformFn) {
          const [dx, dy, dz] = deformFn(px, py, pz, u, v);
          px = dx;
          py = dy;
          pz = dz;
        }

        const nLen = Math.hypot(nx / rx, ny / ry, nz / rz) || 1;
        this.positions.push(px, py, pz);
        this.normals.push(nx / rx / nLen, ny / ry / nLen, nz / rz / nLen);
        this.colors.push(col.r, col.g, col.b);
        this.regionIds.push(regionTag);
      }
    }

    for (let iv = 0; iv < segV; iv++) {
      for (let iu = 0; iu < segU; iu++) {
        const a = baseIdx + iv * (segU + 1) + iu;
        const b = a + segU + 1;
        this.indices.push(a, b, a + 1);
        this.indices.push(b, b + 1, a + 1);
      }
    }
  }

  addTube(
    points: [number, number, number][],
    radii: number[],
    colHex: string,
    regionTag: number,
    radialSeg = 14
  ) {
    if (points.length < 2) return;
    const col = new THREE.Color(colHex);
    const baseIdx = this.positions.length / 3;
    const nPts = points.length;

    for (let i = 0; i < nPts; i++) {
      const p = new THREE.Vector3(...points[i]);
      const pPrev = new THREE.Vector3(...points[Math.max(0, i - 1)]);
      const pNext = new THREE.Vector3(...points[Math.min(nPts - 1, i + 1)]);
      const tangent = pNext.clone().sub(pPrev).normalize();
      const up = Math.abs(tangent.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const binorm = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const norm = new THREE.Vector3().crossVectors(binorm, tangent).normalize();
      const r = radii[i] ?? radii[radii.length - 1];

      for (let j = 0; j <= radialSeg; j++) {
        const ang = (j / radialSeg) * Math.PI * 2;
        const cos = Math.cos(ang);
        const sin = Math.sin(ang);
        const nVec = binorm.clone().multiplyScalar(cos).add(norm.clone().multiplyScalar(sin));
        const vPos = p.clone().add(nVec.clone().multiplyScalar(r));

        this.positions.push(vPos.x, vPos.y, vPos.z);
        this.normals.push(nVec.x, nVec.y, nVec.z);
        this.colors.push(col.r, col.g, col.b);
        this.regionIds.push(regionTag);
      }
    }

    for (let i = 0; i < nPts - 1; i++) {
      for (let j = 0; j < radialSeg; j++) {
        const a = baseIdx + i * (radialSeg + 1) + j;
        const b = a + radialSeg + 1;
        this.indices.push(a, b, a + 1);
        this.indices.push(b, b + 1, a + 1);
      }
    }
  }

  toBufferGeometry(): THREE.BufferGeometry {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
    geom.setAttribute("normal", new THREE.Float32BufferAttribute(this.normals, 3));
    geom.setAttribute("color", new THREE.Float32BufferAttribute(this.colors, 3));
    geom.setAttribute("aRegionId", new THREE.Float32BufferAttribute(this.regionIds, 1));
    geom.setIndex(this.indices);
    geom.computeVertexNormals();
    return geom;
  }
}

/**
 * Helper to emit a curved banana-shaped sporozoite / merozoite / bradyzoite
 */
function addCrescentZoite(
  b: BioMeshBuilder,
  cx: number,
  cy: number,
  cz: number,
  length: number,
  radius: number,
  angleY: number,
  colHex: string,
  regionId: number
) {
  const pts: [number, number, number][] = [];
  const rads: number[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 - 1; // -1 to 1
    const localY = t * (length * 0.5);
    const bow = (1 - t * t) * (length * 0.22);
    const lx = bow * Math.cos(angleY);
    const lz = bow * Math.sin(angleY);
    pts.push([cx + lx, cy + localY, cz + lz]);
    const r = radius * Math.sin(((i / steps) * Math.PI) * 0.92 + 0.08);
    rads.push(Math.max(0.015, r));
  }
  b.addTube(pts, rads, colHex, regionId, 12);
}

function buildStageGeometry(
  speciesCode: "p08" | "p09" | "p10" | "p11",
  stageId: StageId
): THREE.BufferGeometry {
  const b = new BioMeshBuilder();

  if (speciesCode === "p08") {
    // P08: Cryptosporidium parvum / hominis
    if (stageId === "stage1") {
      // Stage 1: Sporulated thick-walled oocyst (4 naked sporozoites + residual body + apical complex + outer shell)
      // 1. Central residual body & amylopectin granules (region 3)
      b.addSphere(-0.12, -0.22, 0.05, 0.25, 0.25, 0.25, "#38bdf8", 3, 18, 14);
      b.addSphere(0.14, -0.32, -0.1, 0.11, 0.11, 0.11, "#7dd3fc", 3, 12, 10);

      // 2. Four naked banana-shaped sporozoites (region 2) + apical complex tips (region 4)
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + 0.35;
        const ox = Math.cos(ang) * 0.32;
        const oz = Math.sin(ang) * 0.32;
        addCrescentZoite(b, ox, 0.02, oz, 1.15, 0.13, ang, "#fde047", 2);
        b.addSphere(ox * 0.65, 0.56, oz * 0.65, 0.085, 0.11, 0.085, "#a855f7", 4, 12, 10);
      }

      // 3. Apical suture ridge (region 1)
      b.addTube(
        [
          [-0.45, 0.92, 0.0],
          [0.0, 1.05, 0.0],
          [0.45, 0.92, 0.0],
        ],
        [0.035, 0.05, 0.035],
        "#fb7185",
        1,
        12
      );

      // 4. Outer acid-fast oocyst wall (region 1.4 -> cuttable shell)
      b.addSphere(0, 0, 0, 1.02, 1.02, 1.02, "#f43f5e", 1.4, 38, 28);
    } else if (stageId === "stage2") {
      // Stage 2: Epicellular Meront on Enterocyte Brush Border
      // 1. Eight Type I merozoites budding inside epicellular vacuole (region 2)
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const mx = Math.cos(ang) * 0.28;
        const mz = Math.sin(ang) * 0.28;
        addCrescentZoite(b, mx, 0.32, mz, 0.68, 0.095, ang, "#fde047", 2);
      }

      // 2. Dense Feeder Organelle at base of meront (region 3)
      b.addSphere(0, -0.05, 0, 0.52, 0.11, 0.52, "#f43f5e", 3, 24, 14);

      // 3. Enterocyte microvillar brush border & apical cytoplasm (region 4)
      b.addSphere(0, -0.62, 0, 1.38, 0.42, 1.15, "#f472b6", 4, 30, 18);
      for (let ix = -5; ix <= 5; ix++) {
        for (let iz = -4; iz <= 4; iz++) {
          const vx = ix * 0.21;
          const vz = iz * 0.21;
          if (Math.hypot(vx, vz) < 0.58) continue;
          b.addTube(
            [
              [vx, -0.25, vz],
              [vx, 0.12, vz],
            ],
            [0.045, 0.038],
            "#f472b6",
            4,
            8
          );
        }
      }

      // 4. Epicellular parasitophorous vacuole dome (region 1.4 -> cuttable shell)
      b.addSphere(0, 0.32, 0, 0.68, 0.62, 0.68, "#38bdf8", 1.4, 32, 24);
    } else if (stageId === "stage3") {
      // Stage 3: Thin-walled autoinfective oocyst (left) vs Thick-walled excreted oocyst (right)
      // Left: Thin-walled oocyst excysting sporozoites
      b.addSphere(-0.85, -0.15, 0.0, 0.18, 0.18, 0.18, "#a855f7", 4, 14, 12);
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        addCrescentZoite(
          b,
          -0.85 + Math.cos(ang) * 0.24,
          0.25 + i * 0.12,
          Math.sin(ang) * 0.24,
          0.75,
          0.085,
          ang,
          "#fde047",
          2
        );
      }
      b.addSphere(-0.85, 0.0, 0.0, 0.68, 0.68, 0.68, "#38bdf8", 1.4, 30, 22);

      // Right: Thick-walled oocyst
      b.addSphere(0.85, -0.15, 0.0, 0.18, 0.18, 0.18, "#a855f7", 4, 14, 12);
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        addCrescentZoite(
          b,
          0.85 + Math.cos(ang) * 0.22,
          0.02,
          Math.sin(ang) * 0.22,
          0.75,
          0.085,
          ang,
          "#fde047",
          2
        );
      }
      b.addSphere(0.85, 0.0, 0.0, 0.74, 0.74, 0.74, "#f43f5e", 3.4, 32, 24);
    } else {
      // Stage 4: Kinyoun acid-fast microscopic field + DFA oocyst + blue yeast differential
      // Background methylene blue slide (region 4)
      b.addSphere(0, -0.58, -0.15, 1.65, 0.14, 1.35, "#1e3a8a", 4, 28, 16);

      // Acid-fast magenta oocysts (region 1.4) with internal sporozoites
      const oocystCenters: [number, number, number][] = [
        [-0.55, 0.08, 0.15],
        [-0.12, -0.05, 0.35],
        [-0.78, -0.15, -0.25],
      ];
      for (const [ox, oy, oz] of oocystCenters) {
        addCrescentZoite(b, ox - 0.1, oy, oz, 0.52, 0.065, 0.4, "#fde047", 1);
        addCrescentZoite(b, ox + 0.1, oy, oz, 0.52, 0.065, -0.4, "#fde047", 1);
        b.addSphere(ox, oy, oz, 0.42, 0.42, 0.42, "#e11d48", 1.4, 24, 18);
      }

      // FITC Direct Immunofluorescence apple-green oocyst (region 3.4)
      addCrescentZoite(b, 0.25, 0.35, 0.1, 0.52, 0.065, 0.2, "#fde047", 3);
      b.addSphere(0.25, 0.35, 0.1, 0.44, 0.44, 0.44, "#22c55e", 3.4, 24, 18);

      // Non-acid-fast blue budding yeast cells (region 2)
      b.addSphere(0.82, -0.12, 0.18, 0.32, 0.24, 0.24, "#3b82f6", 2, 20, 14);
      b.addSphere(1.08, 0.02, 0.18, 0.15, 0.12, 0.12, "#60a5fa", 2, 14, 12);
    }
  } else if (speciesCode === "p09") {
    // P09: Cyclospora cayetanensis
    if (stageId === "stage1") {
      // Stage 1: Unsporulated Oocyst in fresh stool (central morula of refractile globules)
      // 1. Central morula of 14 refractile globules (region 1 & 4)
      for (let i = 0; i < 14; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 14);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = i < 4 ? 0.18 : 0.38;
        const gx = r * Math.sin(phi) * Math.cos(theta);
        const gy = r * Math.cos(phi);
        const gz = r * Math.sin(phi) * Math.sin(theta);
        const col = i % 3 === 0 ? "#facc15" : "#a3e635";
        const reg = i % 3 === 0 ? 4 : 1;
        b.addSphere(gx, gy, gz, 0.19, 0.19, 0.19, col, reg, 16, 14);
      }

      // 2. Perimorular halo & outer oocyst wall (region 2.4 & 3.4 -> cuttable shells)
      b.addSphere(0, 0, 0, 0.78, 0.78, 0.78, "#e0f2fe", 3.4, 28, 20);
      b.addSphere(0, 0, 0, 1.06, 1.06, 1.06, "#38bdf8", 2.4, 38, 28);
    } else if (stageId === "stage2") {
      // Stage 2: Sporulated Oocyst (2 sporocysts × 2 sporozoites = 4)
      for (const side of [-1, 1]) {
        const sx = side * 0.4;
        // 2 sporozoites inside each sporocyst (region 2)
        addCrescentZoite(b, sx - 0.08, 0.04, 0.06, 0.82, 0.095, 0.3, "#fde047", 2);
        addCrescentZoite(b, sx + 0.08, -0.04, -0.06, 0.82, 0.095, -2.8, "#fde047", 2);
        // Residual body inside sporocyst (region 3)
        b.addSphere(sx, -0.22, 0.12, 0.12, 0.12, 0.12, "#f43f5e", 3, 12, 10);
        // Apical Stieda body knob (region 1)
        b.addSphere(sx, 0.56, 0.0, 0.09, 0.06, 0.09, "#22d3ee", 1, 12, 10);
        // Sporocyst wall (region 1.4 -> cuttable)
        b.addSphere(sx, 0.0, 0.0, 0.36, 0.56, 0.36, "#38bdf8", 1.4, 24, 18);
      }
      // Outer oocyst wall (region 4.4 -> cuttable)
      b.addSphere(0, 0, 0, 1.08, 1.08, 1.08, "#94a3b8", 4.4, 38, 28);
    } else if (stageId === "stage3") {
      // Stage 3: UV Autofluorescence (left: 330-365 nm neon cyan-blue; right: 450-490 nm mint green)
      b.addSphere(0, -0.62, -0.1, 1.65, 0.12, 1.35, "#0f172a", 4, 24, 14);

      // Left oocyst: UV 330-365 nm neon cyan
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.addSphere(-0.55 + Math.cos(a) * 0.22, 0.15 + Math.sin(a) * 0.22, 0.0, 0.13, 0.13, 0.13, "#38bdf8", 3, 12, 10);
      }
      b.addSphere(-0.55, 0.15, 0.0, 0.66, 0.66, 0.66, "#22d3ee", 1.4, 32, 24);

      // Right oocyst: 450-490 nm green
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.addSphere(0.68 + Math.cos(a) * 0.2, -0.05 + Math.sin(a) * 0.2, 0.0, 0.12, 0.12, 0.12, "#86efac", 2, 12, 10);
      }
      b.addSphere(0.68, -0.05, 0.0, 0.62, 0.62, 0.62, "#4ade80", 2.4, 32, 24);
    } else {
      // Stage 4: Variable Acid-Fast Staining (deep red, mottled pink, unstained glassy "ghost", and hot safranin control)
      // Left: Deep red oocyst (region 1.4)
      b.addSphere(-0.88, 0.18, 0.0, 0.32, 0.32, 0.32, "#9f1239", 1, 16, 14);
      b.addSphere(-0.88, 0.18, 0.0, 0.52, 0.52, 0.52, "#be123c", 1.4, 28, 20);

      // Center: Mottled pink oocyst (region 2.4)
      b.addSphere(0.0, 0.28, 0.0, 0.32, 0.32, 0.32, "#f472b6", 2, 16, 14);
      b.addSphere(0.0, 0.28, 0.0, 0.52, 0.52, 0.52, "#fbcfe8", 2.4, 28, 20);

      // Right: Unstained glassy "ghost" oocyst with wrinkled wall (region 3.4)
      b.addSphere(0.88, 0.18, 0.0, 0.52, 0.52, 0.52, "#e2e8f0", 3.4, 28, 20, (px, py, pz) => {
        const w = Math.sin(px * 12) * Math.cos(py * 12) * 0.03;
        return [px + w, py + w, pz + w];
      });

      // Bottom: Hot Safranin uniform orange-red reference oocyst (region 4.4)
      b.addSphere(0.0, -0.48, 0.0, 0.46, 0.46, 0.46, "#f97316", 4.4, 26, 18);
    }
  } else if (speciesCode === "p10") {
    // P10: Cystoisospora belli
    const rugbyDeform = (px: number, py: number, pz: number): [number, number, number] => {
      // Elongated rugby-ball with slightly pinched neck at poles
      const ax = Math.abs(px);
      const pinch = ax > 0.9 ? (1.0 - (ax - 0.9) * 0.45) : 1.0;
      return [px, py * pinch, pz * pinch];
    };

    if (stageId === "stage1") {
      // Stage 1: Immature ellipsoidal oocyst with 1 single spherical central sporoblast
      // 1. Granular single central sporoblast (region 2)
      for (let i = 0; i < 18; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 18);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 0.28;
        b.addSphere(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta),
          0.16,
          0.16,
          0.16,
          "#f43f5e",
          2,
          14,
          12
        );
      }
      b.addSphere(0, 0, 0, 0.46, 0.46, 0.46, "#e11d48", 2.4, 24, 18);

      // 2. Polar necks (region 3)
      b.addSphere(-1.32, 0, 0, 0.16, 0.18, 0.18, "#38bdf8", 3, 16, 12);
      b.addSphere(1.32, 0, 0, 0.16, 0.18, 0.18, "#38bdf8", 3, 16, 12);

      // 3. Outer rugby-ball ellipsoidal oocyst wall (region 1.4 -> cuttable)
      b.addSphere(0, 0, 0, 1.42, 0.72, 0.72, "#94a3b8", 1.4, 42, 28, rugbyDeform);
    } else if (stageId === "stage2") {
      // Stage 2: Mature sporulated oocyst (2 sporocysts × 4 sporozoites = 8)
      for (const side of [-1, 1]) {
        const sx = side * 0.52;
        // 4 curved sporozoites per sporocyst (region 2)
        for (let k = 0; k < 4; k++) {
          const ang = (k / 4) * Math.PI * 2;
          addCrescentZoite(
            b,
            sx + Math.cos(ang) * 0.14,
            0.0,
            Math.sin(ang) * 0.14,
            0.68,
            0.075,
            ang,
            "#fde047",
            2
          );
        }
        // Residual body (region 3)
        b.addSphere(sx, -0.14, 0.0, 0.12, 0.12, 0.12, "#f43f5e", 3, 12, 10);
        // Sporocyst wall (region 1.4 -> cuttable)
        b.addSphere(sx, 0, 0, 0.42, 0.48, 0.42, "#38bdf8", 1.4, 24, 18);
      }
      // Outer ellipsoidal wall (region 4.4 -> cuttable)
      b.addSphere(0, 0, 0, 1.42, 0.72, 0.72, "#22d3ee", 4.4, 42, 28, rugbyDeform);
    } else if (stageId === "stage3") {
      // Stage 3: Dividing oocyst (2 acid-fast red sporoblasts) + Charcot-Leyden bipyramidal crystals
      b.addSphere(-0.48, 0.12, 0.0, 0.42, 0.42, 0.42, "#e11d48", 1, 24, 18);
      b.addSphere(0.48, 0.12, 0.0, 0.42, 0.42, 0.42, "#e11d48", 1, 24, 18);
      b.addSphere(0, 0.12, 0.0, 0.12, 0.22, 0.22, "#fda4af", 4, 14, 12);
      b.addSphere(0, 0.12, 0.0, 1.38, 0.68, 0.68, "#94a3b8", 3.4, 40, 26, rugbyDeform);

      // Charcot-Leyden crystals (region 2)
      const crystals: [number, number, number, number][] = [
        [0.65, -0.52, 0.25, 0.25],
        [-0.58, -0.55, 0.2, -0.35],
        [0.05, -0.62, -0.15, 0.08],
      ];
      for (const [cx, cy, cz, rot] of crystals) {
        b.addTube(
          [
            [cx - Math.cos(rot) * 0.42, cy - Math.sin(rot) * 0.42, cz],
            [cx, cy, cz],
            [cx + Math.cos(rot) * 0.42, cy + Math.sin(rot) * 0.42, cz],
          ],
          [0.01, 0.095, 0.01],
          "#fbbf24",
          2,
          6
        );
      }
    } else {
      // Stage 4: Duodenal Enterocyte Biopsy (intracytoplasmic merozoites + lamina propria eosinophils)
      // 1. Intracytoplasmic merozoite bundle inside vacuole (region 1)
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        addCrescentZoite(
          b,
          Math.cos(ang) * 0.22,
          0.22,
          Math.sin(ang) * 0.22,
          0.65,
          0.075,
          ang,
          "#fde047",
          1
        );
      }
      // 2. Host enterocyte basal nucleus (region 2)
      b.addSphere(-0.22, -0.28, 0.0, 0.26, 0.2, 0.24, "#6366f1", 2, 18, 14);

      // 3. Lamina propria eosinophils below basement membrane (region 3)
      for (let i = 0; i < 10; i++) {
        const ex = -0.85 + (i % 5) * 0.42;
        const ez = (Math.floor(i / 5) - 0.5) * 0.38;
        b.addSphere(ex, -0.65, ez, 0.15, 0.14, 0.14, "#f43f5e", 3, 14, 12);
      }

      // 4. Columnar enterocyte body (region 4.4 -> cuttable shell)
      b.addSphere(0, 0.08, 0, 0.85, 0.65, 0.72, "#38bdf8", 4.4, 32, 24);
    }
  } else {
    // P11: Toxoplasma gondii
    if (stageId === "stage1") {
      // Stage 1: Crescent Tachyzoite (6 x 2 um) with 3D Apical Complex (Conoid, Rhoptries, Micronemes, Apicoplast, Nucleus)
      // 1. Apical Conoid & polar rings at pointed anterior pole (region 1)
      b.addTube(
        [
          [-1.32, 0.42, 0.0],
          [-1.12, 0.34, 0.0],
        ],
        [0.065, 0.15],
        "#22d3ee",
        1,
        16
      );

      // 2. Club-shaped Rhoptries (8-12 clubs converging into conoid) & Micronemes (region 2)
      const rhoptryOffsets: [number, number][] = [
        [0.08, 0.08],
        [-0.08, 0.08],
        [0.08, -0.08],
        [-0.08, -0.08],
        [0.0, 0.12],
        [0.0, -0.12],
      ];
      for (const [oy, oz] of rhoptryOffsets) {
        b.addTube(
          [
            [-1.15, 0.35 + oy * 0.3, oz * 0.3],
            [-0.75, 0.22 + oy, oz],
            [-0.38, 0.12 + oy * 1.4, oz * 1.4],
          ],
          [0.02, 0.055, 0.095],
          "#f43f5e",
          2,
          12
        );
      }

      // 3. Apicoplast (4-membrane plastid, target of clindamycin, region 3)
      b.addSphere(0.05, 0.12, 0.05, 0.18, 0.16, 0.16, "#4ade80", 3, 18, 14);

      // 4. Subcentral Nucleus & Dense Granules (region 4)
      b.addSphere(0.55, -0.04, 0.0, 0.32, 0.28, 0.28, "#a855f7", 4, 22, 16);

      // 5. Outer Crescent Pellicle & Inner Membrane Complex (region 4.4 -> cuttable shell)
      const arcPts: [number, number, number][] = [];
      const arcRads: number[] = [];
      for (let i = 0; i <= 36; i++) {
        const t = i / 36; // 0 (pointed anterior) to 1 (rounded posterior)
        const x = -1.32 + t * 2.55;
        const y = 0.42 * (1 - t) - Math.sin(t * Math.PI) * 0.28;
        arcPts.push([x, y, 0.0]);
        const r = t < 0.15 ? 0.07 + t * 2.2 : 0.46 * Math.sin(Math.pow(t, 0.65) * Math.PI);
        arcRads.push(Math.max(0.05, r));
      }
      b.addTube(arcPts, arcRads, "#38bdf8", 4.4, 26);
    } else if (stageId === "stage2") {
      // Stage 2: Brain/Muscle Tissue Cyst packed with Bradyzoites
      // 1. Packed crescent bradyzoites inside cyst (region 2)
      for (let i = 0; i < 36; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 36);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = i < 10 ? 0.32 : 0.66;
        const bx = r * Math.sin(phi) * Math.cos(theta);
        const by = r * Math.cos(phi);
        const bz = r * Math.sin(phi) * Math.sin(theta);
        addCrescentZoite(b, bx, by, bz, 0.46, 0.068, theta, "#fde047", 2);
      }

      // 2. Intracystic matrix core (region 3)
      b.addSphere(0, 0, 0, 0.45, 0.45, 0.45, "#38bdf8", 3.4, 20, 14);

      // 3. Reactivating tachyzoites emerging at upper right pole (region 4)
      addCrescentZoite(b, 0.92, 0.42, 0.15, 0.55, 0.085, 0.5, "#f43f5e", 4);
      addCrescentZoite(b, 1.05, 0.25, -0.1, 0.55, 0.085, -0.3, "#f43f5e", 4);

      // 4. Elastic PAS+ argyrophilic tissue cyst wall (region 1.4 -> cuttable shell)
      b.addSphere(0, 0, 0, 1.08, 1.08, 1.08, "#a855f7", 1.4, 40, 30);
    } else if (stageId === "stage3") {
      // Stage 3: Intracellular Endodyogeny Rosette of Tachyzoites inside Macrophage
      // 1. Rosette of 12 tachyzoites radiating inside parasitophorous vacuole (region 1)
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const rx = 0.18 + Math.cos(ang) * 0.34;
        const ry = 0.08 + Math.sin(ang) * 0.34;
        const rz = ((i % 3) - 1) * 0.14;
        addCrescentZoite(b, rx, ry, rz, 0.56, 0.085, ang, "#22d3ee", 1);
      }

      // 2. Parasitophorous vacuole membrane (PVM, region 2.4 -> cuttable)
      b.addSphere(0.18, 0.08, 0.0, 0.72, 0.72, 0.68, "#f43f5e", 2.4, 28, 20);

      // 3. Kidney-shaped macrophage nucleus (region 3)
      b.addSphere(-0.68, -0.12, 0.0, 0.32, 0.46, 0.36, "#a855f7", 3, 22, 16);

      // 4. Outer macrophage cell membrane (region 4.4 -> cuttable)
      b.addSphere(0, 0, 0, 1.32, 1.08, 1.02, "#64748b", 4.4, 36, 26);
    } else {
      // Stage 4: Feline Sporulated Oocyst (10-12 um: 2 sporocysts × 4 sporozoites = 8)
      for (const side of [-1, 1]) {
        const sx = side * 0.42;
        for (let k = 0; k < 4; k++) {
          const ang = (k / 4) * Math.PI * 2;
          addCrescentZoite(
            b,
            sx + Math.cos(ang) * 0.14,
            0.02,
            Math.sin(ang) * 0.14,
            0.74,
            0.08,
            ang,
            "#fde047",
            2
          );
        }
        b.addSphere(sx, -0.18, 0.08, 0.12, 0.12, 0.12, "#f43f5e", 4, 12, 10);
        b.addSphere(sx, 0, 0, 0.38, 0.54, 0.38, "#38bdf8", 1.4, 24, 18);
      }
      b.addSphere(0, 0, 0, 1.12, 1.04, 1.04, "#94a3b8", 3.4, 38, 28);
    }
  }

  return b.toBufferGeometry();
}

export function CoccidiaToxoplasma3DViewer({
  speciesCode,
  onClose,
}: CoccidiaToxoplasma3DViewerProps) {
  const speciesMeta = SPECIES_CONFIG[speciesCode];
  const [stage, setStage] = useState<StageId>("stage1");
  const stageMeta = speciesMeta.stages[stage];

  const [shaderMode, setShaderMode] = useState<ShaderMode>("biological");
  const [selectedRegion, setSelectedRegion] = useState<number | null>(1);
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);
  const [isStageMenuOpen, setIsStageMenuOpen] = useState(false);

  const [translucency, setTranslucency] = useState<number>(stageMeta.defaultTranslucency);
  const [cutPercent, setCutPercent] = useState<number>(stageMeta.defaultCut);
  const [motility, setMotility] = useState<number>(stageMeta.defaultMotility);

  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [scaleBarPx, setScaleBarPx] = useState<number>(78);
  const [markerCoords, setMarkerCoords] = useState<
    Record<
      number,
      {
        ax: number;
        ay: number;
        px: number;
        py: number;
        visible: boolean;
      }
    >
  >({});

  const mountRef = useRef<HTMLDivElement | null>(null);
  const stageMenuRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const cameraTargetRef = useRef<{
    pos: THREE.Vector3;
    look: THREE.Vector3;
    active: boolean;
  }>({
    pos: new THREE.Vector3(...stageMeta.defaultCameraPos),
    look: new THREE.Vector3(0, 0, 0),
    active: false,
  });

  useEffect(() => {
    const meta = speciesMeta.stages[stage];
    setTranslucency(meta.defaultTranslucency);
    setCutPercent(meta.defaultCut);
    setMotility(meta.defaultMotility);
    setSelectedRegion(1);
    cameraTargetRef.current = {
      pos: new THREE.Vector3(...meta.defaultCameraPos),
      look: new THREE.Vector3(0, 0, 0),
      active: true,
    };
  }, [stage, speciesCode, speciesMeta]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stageMenuRef.current && !stageMenuRef.current.contains(e.target as Node)) {
        setIsStageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      100
    );
    camera.position.set(...stageMeta.defaultCameraPos);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 1.5;
    controls.maxDistance = 8.5;
    controlsRef.current = controls;

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      vertexColors: true,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
      uniforms: {
        uTime: { value: 0 },
        uTranslucency: { value: translucency / 100 },
        uCutPercent: { value: cutPercent / 100 },
        uMotility: { value: motility / 100 },
        uShaderMode: { value: 0 },
        uSelectedRegion: { value: 1 },
        uHoveredRegion: { value: -1 },
      },
    });
    materialRef.current = material;

    const geom = buildStageGeometry(speciesCode, stage);
    const mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      material.uniforms.uTime.value = clock.getElapsedTime();

      if (cameraTargetRef.current.active) {
        camera.position.lerp(cameraTargetRef.current.pos, 0.09);
        controls.target.lerp(cameraTargetRef.current.look, 0.09);
        if (
          camera.position.distanceTo(cameraTargetRef.current.pos) < 0.03 &&
          controls.target.distanceTo(cameraTargetRef.current.look) < 0.03
        ) {
          cameraTargetRef.current.active = false;
        }
      } else if (controls.autoRotate) {
        controls.update();
      }

      controls.update();
      renderer.render(scene, camera);

      const w = container.clientWidth;
      const h = container.clientHeight;
      const dist = camera.position.distanceTo(controls.target);
      const fovRad = (camera.fov * Math.PI) / 180;
      const worldHeight = 2 * Math.tan(fovRad / 2) * dist;
      const pxPerUnit = h / Math.max(0.1, worldHeight);
      setScaleBarPx(Math.max(42, Math.min(130, Math.round(pxPerUnit * 0.72))));

      const currentRegions = SPECIES_CONFIG[speciesCode].stages[stage].regions;
      const nextCoords: Record<
        number,
        { ax: number; ay: number; px: number; py: number; visible: boolean }
      > = {};

      currentRegions.forEach((reg, idx) => {
        const v = new THREE.Vector3(...reg.anchor);
        v.project(camera);
        const ax = (v.x * 0.5 + 0.5) * w;
        const ay = (-v.y * 0.5 + 0.5) * h;
        const visible = v.z < 1.0 && ax > 20 && ax < w - 20 && ay > 20 && ay < h - 20;

        const sideX = ax < w * 0.5 ? -1 : 1;
        const sideY = idx % 2 === 0 ? -1 : 1;
        const px = Math.max(85, Math.min(w - 85, ax + sideX * 66));
        const py = Math.max(58, Math.min(h - 58, ay + sideY * 36));
        nextCoords[reg.id] = { ax, ay, px, py, visible };
      });
      setMarkerCoords(nextCoords);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      geom.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [speciesCode, stage]);

  useEffect(() => {
    if (!materialRef.current || !sceneRef.current) return;
    materialRef.current.uniforms.uTranslucency.value = translucency / 100;
    materialRef.current.uniforms.uCutPercent.value = cutPercent / 100;
    materialRef.current.uniforms.uMotility.value = motility / 100;
    materialRef.current.uniforms.uSelectedRegion.value = selectedRegion ?? -1;
    materialRef.current.uniforms.uHoveredRegion.value = hoveredRegion ?? -1;

    const modeIdx =
      shaderMode === "biological" ? 0 : shaderMode === "giemsa" ? 1 : shaderMode === "sem" ? 2 : 3;
    materialRef.current.uniforms.uShaderMode.value = modeIdx;

    sceneRef.current.background = new THREE.Color(
      shaderMode === "giemsa"
        ? "#faf7f2"
        : shaderMode === "sem"
        ? "#141619"
        : shaderMode === "xray"
        ? "#030812"
        : "#06101a"
    );
  }, [translucency, cutPercent, motility, shaderMode, selectedRegion, hoveredRegion]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 0.85;
    }
  }, [autoRotate]);

  const handleFocusRegion = (reg: RegionMeta) => {
    setSelectedRegion(reg.id);
    setAutoRotate(false);
    cameraTargetRef.current = {
      pos: new THREE.Vector3(...reg.cameraPos),
      look: new THREE.Vector3(...reg.lookAt),
      active: true,
    };
  };

  const handleResetView = () => {
    cameraTargetRef.current = {
      pos: new THREE.Vector3(...stageMeta.defaultCameraPos),
      look: new THREE.Vector3(0, 0, 0),
      active: true,
    };
  };

  const handleZoom = (factor: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const dir = cameraRef.current.position.clone().sub(controlsRef.current.target);
    dir.multiplyScalar(factor);
    cameraTargetRef.current = {
      pos: controlsRef.current.target.clone().add(dir),
      look: controlsRef.current.target.clone(),
      active: true,
    };
  };

  const activeRegion =
    stageMeta.regions.find((r) => r.id === selectedRegion) ?? stageMeta.regions[0];

  return (
    <div className="flex flex-col gap-3 text-slate-100">
      {/* FULL-WIDTH PROTAGONIST 3D VIEWPORT */}
      <div className="relative w-full h-[58vh] min-h-[430px] max-h-[670px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 select-none">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* TOP COMPACT HUD BAR */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div ref={stageMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsStageMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 text-xs font-semibold text-slate-100 shadow-lg transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Elegir forma: {stageMeta.shortName}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isStageMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isStageMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-80 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-1.5 z-30">
                  {(Object.values(speciesMeta.stages) as StageMeta[]).map((st) => {
                    const active = st.id === stage;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setStage(st.id);
                          setIsStageMenuOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                          active
                            ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-200"
                            : "hover:bg-slate-900 text-slate-300"
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            active ? "text-cyan-400 opacity-100" : "opacity-0"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{st.shortName}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {st.sizeRange} · {st.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleFocusRegion(stageMeta.regions[0])}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-[11px] font-medium text-cyan-300 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Enfocar {stageMeta.regions[0].shortLabel}</span>
            </button>

            <button
              type="button"
              onClick={handleResetView}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-[11px] font-medium text-slate-300 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vista general</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div className="flex items-center bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-0.5">
              {(
                [
                  { id: "biological", label: "Biológico" },
                  { id: "giemsa", label: speciesMeta.stainLabel },
                  { id: "sem", label: "SEM" },
                  { id: "xray", label: "Rayos X" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setShaderMode(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    shaderMode === m.id
                      ? "bg-cyan-500/25 text-cyan-200 border border-cyan-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowMarkers((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-md border text-[11px] font-medium transition-all ${
                showMarkers
                  ? "bg-cyan-950/80 border-cyan-500/40 text-cyan-200"
                  : "bg-slate-950/80 border-slate-800 text-slate-400"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showMarkers ? "Ocultar" : "Mostrar"} marcadores</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-950/85 hover:bg-red-950/80 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition-all"
                title="Cerrar visor 3D"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* SVG LEADER LINES & FLOATING REGION PILLS */}
        {showMarkers && (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {stageMeta.regions.map((reg) => {
                const c = markerCoords[reg.id];
                if (!c || !c.visible) return null;
                const isSel = selectedRegion === reg.id;
                const strokeColor =
                  shaderMode === "giemsa" ? reg.colorGiemsa : reg.colorBio;
                return (
                  <g key={reg.id}>
                    <line
                      x1={c.ax}
                      y1={c.ay}
                      x2={c.px}
                      y2={c.py}
                      stroke={strokeColor}
                      strokeWidth={isSel ? 2 : 1.2}
                      strokeDasharray={isSel ? "none" : "3 3"}
                      opacity={isSel ? 0.95 : 0.65}
                    />
                    <circle
                      cx={c.ax}
                      cy={c.ay}
                      r={isSel ? 4.5 : 3}
                      fill={strokeColor}
                      stroke="#0f172a"
                      strokeWidth={1.5}
                    />
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 pointer-events-none z-10">
              {stageMeta.regions.map((reg) => {
                const c = markerCoords[reg.id];
                if (!c || !c.visible) return null;
                const isSel = selectedRegion === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => handleFocusRegion(reg)}
                    onMouseEnter={() => setHoveredRegion(reg.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    style={{
                      left: `${c.px}px`,
                      top: `${c.py}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`pointer-events-auto absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border transition-all shadow-lg ${
                      isSel
                        ? "bg-slate-900/95 border-cyan-400 text-cyan-200 scale-105"
                        : "bg-slate-950/80 border-slate-700/80 text-slate-200 hover:border-cyan-500/60"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          shaderMode === "giemsa" ? reg.colorGiemsa : reg.colorBio,
                      }}
                    />
                    <span>
                      {reg.id}. {reg.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* BOTTOM COMPACT HUD BAR */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-[11px] text-slate-300 pointer-events-auto">
            <span className="font-semibold text-cyan-300 italic">
              {speciesMeta.scientificName}
            </span>{" "}
            · {stageMeta.label} ({stageMeta.sizeRange})
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => handleZoom(0.82)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                title="Acercar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(1.22)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                title="Alejar"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                title="Restablecer cámara"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAutoRotate((v) => !v)}
                className={`p-1.5 rounded-lg transition-colors ${
                  autoRotate ? "bg-cyan-500/20 text-cyan-300" : "hover:bg-slate-800 text-slate-400"
                }`}
                title={autoRotate ? "Pausar rotación" : "Rotación automática"}
              >
                {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex flex-col items-end px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800">
              <div className="text-[10px] font-mono text-cyan-300">{stageMeta.scaleMicrons} µm</div>
              <div
                className="h-1 bg-cyan-400 rounded-full mt-0.5 transition-all"
                style={{ width: `${scaleBarPx}px` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* EXTERNAL BOTTOM PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Controles Morfológicos e Histológicos 3D
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {speciesMeta.taxonomyBadge}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Translucidez de Pared / Película</span>
                <span className="font-mono text-cyan-300">{translucency}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={translucency}
                onChange={(e) => setTranslucency(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-rose-400" />
                  Corte Histológico / Sección 3D
                </span>
                <span className="font-mono text-rose-300">{cutPercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={cutPercent}
                onChange={(e) => setCutPercent(Number(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Motilidad Biológica in vivo</span>
                <span className="font-mono text-emerald-300">{motility}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={motility}
                onChange={(e) => setMotility(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Regiones Anatómicas ({stageMeta.regions.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {stageMeta.regions.map((reg) => {
                const active = activeRegion.id === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => handleFocusRegion(reg)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all ${
                      active
                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-200"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          shaderMode === "giemsa" ? reg.colorGiemsa : reg.colorBio,
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">
                        {reg.id}. {reg.shortLabel}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{reg.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  {activeRegion.category}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-100">
                  {activeRegion.id}. {activeRegion.name}
                </h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                {stageMeta.sizeRange}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activeRegion.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 uppercase">
                  <Microscope className="w-3.5 h-3.5" />
                  Microscopía y Tinción
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeRegion.microscopy}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Correlación Clínica y Diagnóstica
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeRegion.clinical}</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/25 border border-cyan-800/35 text-xs text-cyan-100/90">
              <strong className="text-cyan-300">Perla Diagnóstica ({stageMeta.shortName}): </strong>
              {stageMeta.diagnosticPearl}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Fuentes: CDC DPDx ({speciesMeta.scientificName}) · Guías Clínicas MINSAL / ISP Chile
            </span>
            <span className="text-slate-500">{activeRegion.threeDNote}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
