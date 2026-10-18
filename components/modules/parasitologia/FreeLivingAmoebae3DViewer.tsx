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

export interface FreeLivingAmoebae3DViewerProps {
  speciesCode: "p17" | "p18";
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
  code: "p17" | "p18";
  scientificName: string;
  commonName: string;
  taxonomyBadge: string;
  stainLabel: string;
  stages: Record<StageId, StageMeta>;
}

const SPECIES_CONFIG: Record<"p17" | "p18", SpeciesMeta> = {
  p17: {
    code: "p17",
    scientificName: "Acanthamoeba spp.",
    commonName: "Queratitis por Acanthamoeba y Encefalitis Amebiana Granulomatosa (EAG)",
    taxonomyBadge: "P17 · Ameba de Vida Libre Anfizoica (Acantopodios)",
    stainLabel: "Blanco de Calcoflúor / Tricrómico",
    stages: {
      stage1: {
        id: "stage1",
        label: "Trofozoíto con Acantopodios Espinosos (15–45 µm) y Cariosoma Gigante",
        shortName: "1. Trofozoíto (Acantopodios)",
        subtitle: "Pseudópodos hialinos filiformes en espina (acantopodios) y núcleo en «ojo de buey» sin cromatina periférica",
        sizeRange: "15 – 45 µm",
        scaleMicrons: 10,
        defaultTranslucency: 54,
        defaultCut: 0,
        defaultMotility: 45,
        defaultCameraPos: [0.2, 0.35, 3.8],
        summary:
          "El trofozoíto de Acanthamoeba spp. (del griego akantha = espina) se distingue de todas las demás amebas humanas por emitir múltiples proyecciones hialinas puntiagudas en forma de espina o cuerno llamadas ACANTOPODIOS en todo su contorno. Su núcleo vesicular posee un nucléolo (cariosoma) central ENORME y denso rodeado de un halo claro libre de cromatina periférica («núcleo en ojo de buey de ameba de vida libre»).",
        diagnosticPearl:
          "Factor de riesgo n.º 1 para Queratitis por Acanthamoeba (>85% de los casos): usuarios de LENTES DE CONTACTO que lavan el estuche con agua de la llave, usan soluciones caseras o nadan/se duchan con los lentes puestos.",
        regions: [
          {
            id: 1,
            name: "Acantopodios Hialinos Espinosos (Proyecciones Filiformes Contráctiles)",
            shortLabel: "Acantopodios espinosos",
            category: "Sello Morfológico de Género",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [1.15, 0.35, 0.25],
            cameraPos: [2.1, 0.7, 2.3],
            lookAt: [0.65, 0.2, 0.0],
            description:
              "Abundantes proyecciones citoplasmáticas aguzadas ricas en microfilamentos de actina que emergen y se retraen lentamente desde la superficie del trofozoíto.",
            microscopy:
              "En examen en fresco de raspado corneal o cultivo en agar no nutritivo con Escherichia coli se observan como espinas hialinas radiantes.",
            clinical:
              "Expresan la proteína fijadora de manosa (MBP) que se adhiere con altísima afinidad tanto al plástico de los lentes de contacto como a las glicoproteínas maniladas del epitelio corneal.",
            threeDNote:
              "Catorce proyecciones cónicas aguzadas emergiendo de la corteza ameboide.",
          },
          {
            id: 2,
            name: "Núcleo en «Ojo de Buey» con Cariosoma Central Gigante (Sin Cromatina Periférica)",
            shortLabel: "Núcleo con cariosoma gigante",
            category: "Criterio Nuclear de Ameba de Vida Libre",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.15, 0.12, 0.3],
            cameraPos: [-0.8, 0.4, 2.1],
            lookAt: [-0.1, 0.05, 0.05],
            description:
              "Núcleo único provisto de un nucléolo (cariosoma) central esférico sumamente voluminoso, rodeado por un halo nuclear claro y una membrana nuclear LISA desprovista de cromatina periférica.",
            microscopy:
              "Diferencia clave con Entamoeba histolytica: E. histolytica tiene cariosoma puntiforme diminuto y anillo de cromatina periférica; Acanthamoeba y Naegleria tienen cariosoma GIGANTE y CERO cromatina periférica.",
            clinical:
              "Permite reconocer trofozoítos de amebas de vida libre en biopsias corneales y cerebrales (donde suelen confundirse con macrófagos).",
            threeDNote:
              "Núcleo esférico interno con gran esfera nucleolar central púrpura expuesta al deslizar «Corte Histológico».",
          },
          {
            id: 3,
            name: "Vacuola Contráctil Osmorreguladora Prominente",
            shortLabel: "Vacuola contráctil",
            category: "Vida Libre en Agua Dulce",
            colorBio: "#38bdf8",
            colorGiemsa: "#6366f1",
            anchor: [0.38, -0.18, 0.32],
            cameraPos: [1.1, -0.3, 2.1],
            lookAt: [0.25, -0.1, 0.05],
            description:
              "Vacuola clara pulsátil que bombea activamente el exceso de agua hacia el exterior cada 40–90 segundos.",
            microscopy:
              "En microscopía de contraste de fases se observa su diástole (llenado) y sístole (colapso brusco).",
            clinical:
              "Permite a Acanthamoeba sobrevivir en agua destilada, agua de grifo, torres de refrigeración y unidades dentales.",
            threeDNote:
              "Esfera cristalina azul-cian en el endoplasma derecho.",
          },
          {
            id: 4,
            name: "Vacuolas Fagocíticas con Bacterias Endosimbiontes (Legionella / Pseudomonas)",
            shortLabel: "Bacterias endosimbiontes",
            category: "Reservorio de Patógenos («Caballo de Troya»)",
            colorBio: "#4ade80",
            colorGiemsa: "#16a34a",
            anchor: [-0.45, -0.25, 0.28],
            cameraPos: [-1.2, -0.4, 2.2],
            lookAt: [-0.3, -0.15, 0.05],
            description:
              "Acanthamoeba fagocita bacterias ambientales, pero bacterias intracelulares como Legionella pneumophila, Pseudomonas aeruginosa y Mycobacterium avium sobreviven dentro de ella.",
            microscopy:
              "Vacuolas digestivas y endosimbiontes bacilares en el endoplasma.",
            clinical:
              "La coinfección con bacterias endosimbiontes incrementa la virulencia corneal de la ameba y la resistencia a los biocidas de los líquidos de lentes de contacto.",
            threeDNote:
              "Bastones verdes intracitoplasmáticos revelados por el corte histológico.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Quiste de Doble Pared (12–25 µm) — Endoquiste Estrellado / Poliédrico",
        shortName: "2. Quiste de Doble Pared (Estrellado)",
        subtitle: "Ectoquiste externo arrugado y endoquiste interno estrellado/poligonal con ostiolos operculados",
        sizeRange: "12 – 25 µm",
        scaleMicrons: 5,
        defaultTranslucency: 56,
        defaultCut: 0,
        defaultMotility: 15,
        defaultCameraPos: [0.2, 0.35, 3.7],
        summary:
          "El quiste de Acanthamoeba spp. posee una morfología PATOGNOMÓNICA única en parasitología médica: es un QUISTE DE DOBLE PARED compuesto por un ectoquiste externo arrugado y un ENDOQUISTE interno de geometría ESTRELLADA, poliédrica o poligonal cuyos brazos contactan con el ectoquiste en poros llamados ostiolos. A diferencia de Naegleria fowleri, Acanthamoeba forma quistes TANTO en el ambiente como DENTRO de los tejidos humanos (córnea y cerebro).",
        diagnosticPearl:
          "El quiste de doble pared estrellado de Acanthamoeba contiene celulosa y quitina en su endoquiste, por lo que brilla intensamente en azul-blanco manzana con la tinción fluorescente de BLANCO DE CALCOFLÚOR y resiste cloro, peróxido de hidrógeno y la mayoría de antimicrobianos (solo las biguanidas como PHMB 0.02% y Clorhexidina 0.02% son quisticidas).",
        regions: [
          {
            id: 1,
            name: "Endoquiste Estrellado / Poliédrico Rico en Celulosa (Calcoflúor+)",
            shortLabel: "Endoquiste estrellado",
            category: "Sello Patognomónico de Acanthamoeba",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [0.35, 0.28, 0.32],
            cameraPos: [1.1, 0.6, 2.2],
            lookAt: [0.2, 0.15, 0.05],
            description:
              "Pared interna gruesa con 5 a 8 puntas estrelladas o caras poligonales compuesta por un 33% de celulosa (β-1,4-glucano).",
            microscopy:
              "Con Blanco de Calcoflúor bajo luz UV o en microscopía confocal in vivo corneal dibuja una estrella luminosa inconfundible dentro de un círculo.",
            clinical:
              "La celulosa del endoquiste le otorga resistencia extrema: puede permanecer viable >20 años en seco y causa las recidivas de la queratitis si se suspende prematuramente el tratamiento tópico con biguanidas.",
            threeDNote:
              "Poliedro estrellado de 6 puntas 3D en el interior del ectoquiste; expuesto al activar «Corte Histológico».",
          },
          {
            id: 2,
            name: "Ectoquiste Externo Fibroso y Ondulado",
            shortLabel: "Ectoquiste arrugado",
            category: "Pared Quística Externa",
            colorBio: "#94a3b8",
            colorGiemsa: "#64748b",
            anchor: [-0.88, 0.55, 0.25],
            cameraPos: [-1.8, 1.0, 2.4],
            lookAt: [-0.45, 0.3, 0.0],
            description:
              "Capa externa esférica pero arrugada y plegada compuesta por proteínas y polisacáridos ácidos.",
            microscopy:
              "Se observa como un halo ondulado separado del endoquiste salvo en los vértices de la estrella.",
            clinical:
              "Protege frente a la desecación, radiación UV, radiación gamma y cloración de piscinas.",
            threeDNote:
              "Esfera externa con pliegues superficiales que se secciona con el deslizador de corte.",
          },
          {
            id: 3,
            name: "Ostiolos con Opérculos en los Vértices de la Estrella",
            shortLabel: "Ostiolos (poros de salida)",
            category: "Puerta de Desenquistamiento",
            colorBio: "#fde047",
            colorGiemsa: "#d97706",
            anchor: [0.78, 0.0, 0.2],
            cameraPos: [1.7, 0.2, 2.2],
            lookAt: [0.55, 0.0, 0.0],
            description:
              "Puntos donde cada brazo del endoquiste estrellado toca al ectoquiste externo, cerrados por un tapón mucopolisacárido convexo (opérculo).",
            microscopy:
              "Visibles en los ángulos de contacto entre las dos paredes.",
            clinical:
              "Cuando mejoran las condiciones o se aplican CORTICOIDES tópicos sin cobertura amebicida, el opérculo se abre y el trofozoíto emerge para reactivar la destrucción corneal.",
            threeDNote:
              "Discos dorados en las puntas de unión entre el endoquiste y el ectoquiste.",
          },
          {
            id: 4,
            name: "Núcleo Único Central con Gran Cariosoma",
            shortLabel: "Núcleo uninucleado",
            category: "Núcleo Quístico",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.0, 0.0, 0.35],
            cameraPos: [0.0, 0.2, 2.1],
            lookAt: [0.0, 0.0, 0.05],
            description:
              "El quiste de Acanthamoeba contiene SIEMPRE un único núcleo central con su gran cariosoma en ojo de buey.",
            microscopy:
              "Lo diferencia de inmediato de los quistes de Entamoeba (que tienen 4 u 8 núcleos y pared simple lisa).",
            clinical:
              "El hallazgo de quistes de doble pared en una biopsia cerebral confirma Acanthamoeba (o Balamuthia) y descarta Naegleria fowleri.",
            threeDNote:
              "Núcleo central con cariosoma gigante en el corazón de la estrella.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Queratitis por Acanthamoeba — Infiltrado Anular y Queratoneuritis Radial",
        shortName: "3. Queratitis Anular (Córnea)",
        subtitle: "Dolor ocular desproporcionado por invasión de nervios corneales (queratoneuritis radial) e infiltrado en anillo",
        sizeRange: "Anillo corneal 4–6 mm · Quistes/Trofozoítos 20 µm",
        scaleMicrons: 100,
        defaultTranslucency: 48,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.15, 0.5, 4.1],
        summary:
          "La Queratitis por Acanthamoeba se caracteriza por dos signos clínicos cardinales: (1) DOLOR OCULAR EXCRUCIANTE desproporcionado respecto a los hallazgos iniciales (causado por el neurotropismo de los trofozoítos que invaden los nervios ciliares estromales: QUERATONEURITIS RADIAL patognomónica), y (2) la aparición más tardía de un INFILTRADO ESTROMAL ANULAR completo o parcial que lleva a perforación o ceguera si se confunde inicialmente con queratitis herpética.",
        diagnosticPearl:
          "Tríada de alerta diagnóstica en oftalmología: Usuario de lentes de contacto + Dolor ocular severísimo desproporcionado + Falla al tratamiento inicial para Herpes simple o bacterias → Raspar córnea para Calcoflúor / cultivo en agar con E. coli / microscopía confocal in vivo e iniciar PHMB 0.02% + Propamidina (Brolene) cada 1 hora.",
        regions: [
          {
            id: 1,
            name: "Infiltrado Estromal Anular (Anillo de Wessely Amebiano)",
            shortLabel: "Infiltrado estromal en anillo",
            category: "Signo Biomicroscópico Clásico",
            colorBio: "#f8fafc",
            colorGiemsa: "#e2e8f0",
            anchor: [-0.68, 0.22, 0.3],
            cameraPos: [-1.5, 0.7, 2.4],
            lookAt: [-0.4, 0.1, 0.05],
            description:
              "Opacidad circular blanco-grisácea densa en el estroma corneal paracentral formada por neutrófilos, colagenólisis (proteasa MIP-133) y depósitos de complejos inmunes.",
            microscopy:
              "Visible en lámpara de hendidura a partir de la 3.ª–6.ª semana de evolución.",
            clinical:
              "Conduce a adelgazamiento estromal progresivo, descemetocele y perforación corneal que obliga a queratoplastia penetrante.",
            threeDNote:
              "Anillo opalescente 3D inmerso dentro de la cúpula transparente de la córnea.",
          },
          {
            id: 2,
            name: "Queratoneuritis Radial (Trofozoítos Invadiendo Nervios Corneales)",
            shortLabel: "Queratoneuritis radial",
            category: "Causa del Dolor Desproporcionado",
            colorBio: "#fde047",
            colorGiemsa: "#d97706",
            anchor: [0.75, 0.15, 0.25],
            cameraPos: [1.7, 0.6, 2.4],
            lookAt: [0.45, 0.1, 0.0],
            description:
              "Infiltrados lineales perineurales a lo largo de los nervios corneales estromales producidos por la migración quimiotáctica de los trofozoítos hacia las células de Schwann.",
            microscopy:
              "Signo precoz patognomónico en lámpara de hendidura y microscopía confocal in vivo (HRT-III).",
            clinical:
              "Explica por qué el paciente refiere un dolor lancinante insoportable aun cuando el epitelio apenas muestra una epiteliopatía dendritiforme que simula herpes.",
            threeDNote:
              "Filetes nerviosos dorados radiales rodeados de trofozoítos.",
          },
          {
            id: 3,
            name: "Quistes Estrellados y Trofozoítos en el Estroma Corneal Profundo",
            shortLabel: "Quistes en estroma corneal",
            category: "Persistencia Intraestromal",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [0.15, 0.12, 0.35],
            cameraPos: [0.5, 0.5, 2.1],
            lookAt: [0.1, 0.05, 0.1],
            description:
              "Coexistencia de trofozoítos activos y quistes de doble pared entre las lamelas de colágeno del estroma corneal.",
            microscopy:
              "La microscopía confocal in vivo permite visualizar sin biopsia los quistes hiperreflectivos de doble pared (15–25 µm) en tiempo real.",
            clinical:
              "Obliga a mantener el tratamiento tópico combinado (Biguanida: PHMB 0.02% o Clorhexidina 0.02% + Diamidina: Propamidina 0.1% o Hexamidina) durante 3 a 6 meses.",
            threeDNote:
              "Quistes estrellados y trofozoítos 3D dentro de la cúpula corneal, expuestos al activar «Corte Histológico».",
          },
          {
            id: 4,
            name: "Domo Corneal Anterior y Lamelas Estromales",
            shortLabel: "Domo corneal",
            category: "Tejido Ocular",
            colorBio: "#38bdf8",
            colorGiemsa: "#64748b",
            anchor: [0.0, -0.35, 0.25],
            cameraPos: [0.0, -0.5, 2.5],
            lookAt: [0.0, -0.2, 0.0],
            description:
              "Córnea transparente avascular.",
            microscopy:
              "El raspado corneal profundo debe sembrarse en placas de agar no nutritivo recubiertas con césped de Escherichia coli, donde los trofozoítos dejan rastros sinuosos («tracks») al comer las bacterias.",
            clinical:
              "Evitar corticoides tópicos antes de instaurar terapia amebicida eficaz.",
            threeDNote:
              "Cúpula translúcida azulada seccionable en 3D.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Encefalitis Amebiana Granulomatosa (EAG) — Angitis Perivascular con Trofozoítos y Quistes",
        shortName: "4. Encefalitis Granulomatosa (EAG)",
        subtitle: "Infección subaguda/crónica del SNC en inmunodeprimidos con TANTO trofozoítos como quistes alrededor de vasos cerebrales",
        sizeRange: "Trofozoítos y quistes 15–35 µm en espacio de Virchow-Robin",
        scaleMicrons: 20,
        defaultTranslucency: 48,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.15, 0.45, 4.1],
        summary:
          "En pacientes inmunodeprimidos (SIDA avanzado, trasplantados de órgano sólido/médula, lupus, cirrosis), Acanthamoeba ingresa por vía inhalatoria pulmonar o úlceras cutáneas y se disemina por vía hematógena al cerebro causando la ENCEFALITIS AMEBIANA GRANULOMATOSA (EAG): cuadro subagudo o crónico (semanas a meses) de déficit neurológico focal, convulsiones y masas cerebrales necrotizantes. En la histopatología cerebral se encuentran TANTO trofozoítos como QUISTES DE DOBLE PARED invadiendo la pared de los vasos sanguíneos.",
        diagnosticPearl:
          "Diferenciación histopatológica cerebral: En la Meningoencefalitis Amebiana Primaria (MAP) por Naegleria fowleri SOLO hay trofozoítos (nunca quistes en tejido); en la Encefalitis Amebiana Granulomatosa (EAG) por Acanthamoeba o Balamuthia mandrillaris coexisten TROFOZOÍTOS + QUISTES de doble pared en los espacios perivasculares.",
        regions: [
          {
            id: 1,
            name: "Angitis Necrotizante con Manguito Perivascular de Trofozoítos y Quistes",
            shortLabel: "Manguito perivascular",
            category: "Histopatología de la EAG",
            colorBio: "#ef4444",
            colorGiemsa: "#be123c",
            anchor: [0.0, 0.0, 0.25],
            cameraPos: [0.1, 0.3, 2.4],
            lookAt: [0.0, 0.0, 0.0],
            description:
              "Arteriola cerebral cuyo espacio perivascular de Virchow-Robin y túnica media están invadidos por trofozoítos y quistes de Acanthamoeba.",
            microscopy:
              "La invasión vascular produce trombosis, necrosis hemorrágica multifocal y células gigantes multinucleadas (en pacientes con inmunidad parcial).",
            clinical:
              "En TC/RM cerebral produce múltiples lesiones ocupantes de espacio que simulan abscesos bacterianos, toxoplasmosis o metástasis.",
            threeDNote:
              "Vaso sanguíneo central rodeado de quistes estrellados y trofozoítos.",
          },
          {
            id: 2,
            name: "Quistes de Doble Pared Estrellados en el Parénquima Cerebral",
            shortLabel: "Quistes en tejido cerebral",
            category: "Diferencial clave frente a Naegleria",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [0.58, 0.32, 0.32],
            cameraPos: [1.4, 0.6, 2.2],
            lookAt: [0.4, 0.2, 0.05],
            description:
              "Quistes uninucleados con endoquiste poliédrico/estrellado formados directamente dentro del tejido encefálico necrótico.",
            microscopy:
              "Se tiñen intensamente con PAS, Grocott-Gomori y Blanco de Calcoflúor.",
            clinical:
              "Su presencia en biopsia cerebral descarta de plano Naegleria fowleri.",
            threeDNote:
              "Quistes con estrella interna 3D visibles al deslizar «Corte Histológico».",
          },
          {
            id: 3,
            name: "Trofozoítos con Cariosoma en «Ojo de Buey» (Simulan Macrófagos)",
            shortLabel: "Trofozoítos perivasculares",
            category: "Diagnóstico Citológico",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [-0.55, 0.25, 0.32],
            cameraPos: [-1.4, 0.5, 2.2],
            lookAt: [-0.4, 0.15, 0.05],
            description:
              "Trofozoítos ameboides de 20–35 µm que en H&E a bajo aumento parecen macrófagos espumosos, pero al enfocar el núcleo revelan el enorme cariosoma central en ojo de buey.",
            microscopy:
              "Confirmación definitiva por inmunofluorescencia indirecta (IFI) o PCR multiplex de LCR/tejido (CDC).",
            clinical:
              "El líquido cefalorraquídeo en la EAG muestra pleocitosis linfocitaria moderada (a diferencia del LCR purulento neutrofílico de Naegleria) y rara vez contiene trofozoítos libres.",
            threeDNote:
              "Trofozoítos 3D con núcleo de gran cariosoma interno.",
          },
          {
            id: 4,
            name: "Parénquima Cerebral con Necrosis Granulomatosa",
            shortLabel: "Necrosis cerebral",
            category: "SNC",
            colorBio: "#a855f7",
            colorGiemsa: "#64748b",
            anchor: [-0.95, -0.35, 0.2],
            cameraPos: [-1.9, -0.4, 2.5],
            lookAt: [-0.5, -0.25, 0.0],
            description:
              "Tejido de corteza cerebral, ganglios basales o cerebelo con gliosis reactiva y células gigantes.",
            microscopy:
              "Lesiones necrotizantes subagudas.",
            clinical:
              "El tratamiento de rescate combina Miltefosina oral + Fluconazol/Voriconazol + Flucitosina + Pentamidina + Sulfadiazina.",
            threeDNote:
              "Matriz tisular envolvente seccionable en 3D.",
          },
        ],
      },
    },
  },
  p18: {
    code: "p18",
    scientificName: "Naegleria fowleri",
    commonName: "Meningoencefalitis Amebiana Primaria (MAP / «Ameba Comecerebros»)",
    taxonomyBadge: "P18 · Ameba Termófila Ameboflagelada Fulminante",
    stainLabel: "Fresco LCR / Tricrómico",
    stages: {
      stage1: {
        id: "stage1",
        label: "Trofozoíto Ameboide Termófilo (15–30 µm) — Amebostoma y Lobopodios",
        shortName: "1. Trofozoíto Ameboide (LCR/Cerebro)",
        subtitle: "ÚNICO estadio presente en el humano: lobopodio anterior romo, «amebostoma» fagocítico y cariosoma gigante",
        sizeRange: "15 – 30 µm",
        scaleMicrons: 5,
        defaultTranslucency: 54,
        defaultCut: 0,
        defaultMotility: 60,
        defaultCameraPos: [0.2, 0.35, 3.8],
        summary:
          "Naegleria fowleri es una ameba de vida libre TERMÓFILA (prolifera en aguas dulces cálidas hasta a 45 °C: lagos en verano, aguas termales, piscinas mal cloradas o lavados nasales con agua de grifo). Su ciclo comprende 3 estadios (trofozoíto ameboide, forma biflagelada transitoria y quiste), pero en los tejidos y LCR humanos se encuentra EXCLUSIVAMENTE el TROFOZOÍTO AMEBOIDE: emite un único pseudópodo hemisférico romo anterior (lobopodio), posee un núcleo en «ojo de buey» y exhibe copas fagocíticas succionadoras llamadas AMEBOSTOMAS con las que trogocita neuronas y eritrocitos.",
        diagnosticPearl:
          "Beber agua contaminada NO transmite Naegleria fowleri: la infección ocurre ÚNICAMENTE cuando el agua dulce cálida entra con fuerza por las FOSAS NASALES (zambullidas, buceo, deportes acuáticos o irrigación sinusal con lota nasal / neti pot sin hervir el agua).",
        regions: [
          {
            id: 1,
            name: "Amebostoma (Copa Fagocítica Succionadora para Trogocitosis)",
            shortLabel: "Amebostoma («boca» fagocítica)",
            category: "Factor de Virulencia Citopático",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.88, 0.25, 0.25],
            cameraPos: [-1.8, 0.6, 2.2],
            lookAt: [-0.6, 0.15, 0.05],
            description:
              "Estructura crateriforme especializada en forma de ventosa o copa succionadora (1–5 µm) rica en actina polimerizada que la ameba forma en su superficie para «morder» y engullir fragmentos de axones, mielina y eritrocitos.",
            microscopy:
              "En microscopía electrónica de barrido (SEM) los amebostomas destacan como bocas circulares con reborde lamelar elevado.",
            clinical:
              "Junto con las naegleriaporos (proteínas formadoras de poros) y fosfolipasas, causa la necrosis hemorrágica fulminante de los bulbos olfatorios y lóbulos frontales.",
            threeDNote:
              "Copa cóncava con anillo elevado rojo-coral en el polo izquierdo engullendo un eritrocito.",
          },
          {
            id: 2,
            name: "Núcleo en «Ojo de Buey» con Gran Cariosoma Central y Halo Claro",
            shortLabel: "Núcleo en ojo de buey",
            category: "Morfología Nuclear",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.05, 0.12, 0.3],
            cameraPos: [-0.3, 0.4, 2.1],
            lookAt: [0.0, 0.05, 0.05],
            description:
              "Núcleo esférico con un gran cariosoma central intensamente teñido rodeado de un halo perinucleolar claro, sin gránulos de cromatina en la membrana nuclear.",
            microscopy:
              "En frotis de LCR teñido con Giemsa o Wright-Giemsa permite diferenciar al trofozoíto de los leucocitos polimorfonucleares y monocitos del paciente (OJO: la tinción de Gram destruye o distorsiona las amebas y es inútil).",
            clinical:
              "El diagnóstico urgente se realiza observando trofozoítos con movimiento direccional rápido en el examen en FRESCO del LCR tibio recién extraído.",
            threeDNote:
              "Núcleo central con gran cariosoma púrpura expuesto al activar «Corte Histológico».",
          },
          {
            id: 3,
            name: "Lobopodio Anterior Hemisférico Romo (Movimiento tipo «Limax»)",
            shortLabel: "Lobopodio romo (sin espinas)",
            category: "Diferenciación con Acanthamoeba",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [1.08, 0.15, 0.2],
            cameraPos: [2.0, 0.4, 2.3],
            lookAt: [0.6, 0.1, 0.0],
            description:
              "Pseudópodo único ancho y redondeado (lobopodio) de ectoplasma hialino que se proyecta de forma explosiva en el sentido del avance (forma «limax» o de babosa).",
            microscopy:
              "A diferencia de Acanthamoeba (que tiene acantopodios espinosos y movimiento lento), Naegleria fowleri tiene un contorno liso con un lobopodio romo y se desplaza velozmente a 37 °C.",
            clinical:
              "Impulsa la migración quimiotáctica hacia la acetilcolina liberada por los nervios olfatorios.",
            threeDNote:
              "Domo hialino anterior redondeado en el extremo derecho.",
          },
          {
            id: 4,
            name: "Uroide Posterior con Filamentos de Arrastre y Vacuola Contráctil",
            shortLabel: "Uroide posterior y vacuola",
            category: "Polo Posterior",
            colorBio: "#fde047",
            colorGiemsa: "#d97706",
            anchor: [-0.55, -0.25, 0.28],
            cameraPos: [-1.4, -0.4, 2.2],
            lookAt: [-0.4, -0.15, 0.05],
            description:
              "Extremo posterior contráctil (uroide) provisto de finos filamentos adhesivos cortos junto a una vacuola contráctil y eritrocitos fagocitados.",
            microscopy:
              "En el LCR hemorrágico los trofozoítos suelen contener glóbulos rojos ingeridos.",
            clinical:
              "La Meningoencefalitis Amebiana Primaria tiene un período de incubación de solo 1 a 9 días (promedio 5 días) y una letalidad >97% en menos de una semana.",
            threeDNote:
              "Vacuola azulada y eritrocitos fagocitados visibles dentro del endoplasma al cortar el modelo.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Forma Biflagelada Piriforme Transitoria (12–18 µm) — Prueba de Enflagelación",
        shortName: "2. Forma Biflagelada (Agua Dulce)",
        subtitle: "Estadio nadador piriforme con 2 flagelos anteriores iguales (se induce en 2 h al pasar trofozoítos a agua destilada)",
        sizeRange: "12 – 18 µm",
        scaleMicrons: 5,
        defaultTranslucency: 56,
        defaultCut: 0,
        defaultMotility: 65,
        defaultCameraPos: [0.2, 0.35, 3.7],
        summary:
          "Naegleria fowleri es un protozoo AMEBOFLAGELADO: cuando el trofozoíto ameboide sufre un cambio brusco de concentración iónica o depleción de nutrientes en el agua cálida, sintetiza de novo en apenas 1 a 2 horas un aparato flagelar completo y se transforma en una FORMA BIFLAGELADA piriforme con 2 flagelos anteriores iguales. No se alimenta ni se divide en este estadio, pero le permite nadar largas distancias en lagos y piscinas antes de reconvertirse en trofozoíto.",
        diagnosticPearl:
          "Prueba clásica de Enflagelación en el laboratorio: Si se incuba una gota de LCR o cultivo con trofozoítos ameboides en agua destilada estéril a 37 °C durante 2 a 4 horas, Naegleria fowleri se transforma en formas piriformes BIFLAGELADAS nadadoras (Acanthamoeba y Entamoeba NUNCA forman flagelos).",
        regions: [
          {
            id: 1,
            name: "Par de Flagelos Anteriores Iguales (9+2 Microtúbulos)",
            shortLabel: "2 flagelos anteriores iguales",
            category: "Sello del Género Naegleria",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [-1.25, 0.35, 0.2],
            cameraPos: [-2.1, 0.7, 2.3],
            lookAt: [-0.85, 0.15, 0.0],
            description:
              "Dos flagelos largos de igual longitud que emergen del extremo anterior estrechado (rostro) a partir de dos cuerpos basales y un rizoplasto conectado al núcleo.",
            microscopy:
              "Producen un movimiento natatorio rápido en espiral o giro continuo en el medio líquido.",
            clinical:
              "Es la forma que con frecuencia inhala nasalmente el nadador en la capa superficial cálida de lagos o piscinas geotermales, transformándose de inmediato en trofozoíto ameboide sobre la mucosa nasal.",
            threeDNote:
              "Dos látigos flagelares simétricos emergiendo del polo anterior piriforme.",
          },
          {
            id: 2,
            name: "Núcleo Anterior con Cariosoma Central Conectado por Rizoplasto",
            shortLabel: "Núcleo y rizoplasto",
            category: "Aparato Neuromotor",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.35, 0.08, 0.28],
            cameraPos: [-1.1, 0.3, 2.1],
            lookAt: [-0.25, 0.0, 0.05],
            description:
              "Durante la fase biflagelada el núcleo con su gran cariosoma migra hacia el polo anterior y se ancla a los cuerpos basales mediante una raíz fibrosa estriada (rizoplasto).",
            microscopy:
              "Situado justo detrás de la emergencia de los dos flagelos.",
            clinical:
              "En menos de 24 horas la forma biflagelada reabsorbe sus flagelos y vuelve al estadio de trofozoíto ameboide invasivo.",
            threeDNote:
              "Núcleo con gran cariosoma y fibrilla anterior expuestos al deslizar «Corte Histológico».",
          },
          {
            id: 3,
            name: "Cuerpo Piriforme Rígido Hidrodinámico (Sin Pseudópodos)",
            shortLabel: "Cuerpo piriforme",
            category: "Estadio Diseminador",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [0.35, 0.38, 0.25],
            cameraPos: [1.1, 0.7, 2.3],
            lookAt: [0.2, 0.15, 0.0],
            description:
              "Cuerpo celular alargado en forma de pera o lágrima estabilizado por una red subpelicular de microtúbulos.",
            microscopy:
              "Contorno liso y simétrico sin emisión de lobopodios mientras conserva los flagelos.",
            clinical:
              "No se observa en cortes histológicos cerebrales, aunque ocasionalmente puede verse en líquido cefalorraquídeo muy diluido.",
            threeDNote:
              "Película piriforme azulada que se secciona con el corte histológico.",
          },
          {
            id: 4,
            name: "Vacuola Contráctil Posterior y Gránulos de Reserva",
            shortLabel: "Vacuola posterior",
            category: "Osmorregulación",
            colorBio: "#fde047",
            colorGiemsa: "#d97706",
            anchor: [0.55, -0.12, 0.28],
            cameraPos: [1.3, -0.2, 2.2],
            lookAt: [0.4, -0.05, 0.05],
            description:
              "Vacuola pulsátil localizada en la mitad posterior ensanchada del cuerpo piriforme.",
            microscopy:
              "Claramente visible en contraste de fases.",
            clinical:
              "Evita la lisis osmótica de la forma nadadora en aguas dulces hipoosmóticas.",
            threeDNote:
              "Esfera interna dorada/cian en el polo posterior.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Quiste Ambiental Esférico de Pared Lisa (7–15 µm) — Ausente en Tejidos Humanos",
        shortName: "3. Quiste Liso (Solo en Ambiente)",
        subtitle: "Pared única lisa con 1–2 poros mucosos operculados (NUNCA se forma en el cerebro humano)",
        sizeRange: "7 – 15 µm",
        scaleMicrons: 4,
        defaultTranslucency: 56,
        defaultCut: 0,
        defaultMotility: 15,
        defaultCameraPos: [0.2, 0.35, 3.7],
        summary:
          "Cuando la temperatura del agua cae o el sedimento se deseca, Naegleria fowleri forma un QUISTE ESFÉRICO de 7 a 15 µm con pared LISA de contorno único (sin el endoquiste estrellado de Acanthamoeba) provisto de 1 o 2 poros planos sellados por un tapón mucoso. Un hecho clínico de enorme importancia para los exámenes médicos es que Naegleria fowleri NUNCA forma quistes en el tejido cerebral humano (porque la muerte del paciente sobreviene de forma fulminante antes de que la ameba pueda enquistarse).",
        diagnosticPearl:
          "Pregunta clásica de examen: ¿Se observan quistes de Naegleria fowleri en la biopsia o autopsia cerebral de un paciente con MAP? NO, JAMÁS. En el tejido cerebral de la MAP solo hay trofozoítos ameboides; el quiste de N. fowleri es exclusivamente ambiental.",
        regions: [
          {
            id: 1,
            name: "Pared Quística Esférica Lisa y Redonda (Sin Endoquiste Estrellado)",
            shortLabel: "Pared lisa (no estrellada)",
            category: "Diferenciación frente a Acanthamoeba",
            colorBio: "#38bdf8",
            colorGiemsa: "#64748b",
            anchor: [-0.88, 0.55, 0.25],
            cameraPos: [-1.8, 1.0, 2.4],
            lookAt: [-0.45, 0.3, 0.0],
            description:
              "Pared esférica de contorno circular liso y uniforme (7–15 µm), mucho más delgada y menos resistente a la desecación y al cloro libre (≥1–2 mg/L) que el quiste de Acanthamoeba.",
            microscopy:
              "Carece por completo de la silueta poliédrica/estrellada de Acanthamoeba.",
            clinical:
              "La adecuada hipercloración y mantenimiento de piscinas destruye eficazmente los quistes y trofozoítos de Naegleria fowleri.",
            threeDNote:
              "Esfera externa lisa translúcida seccionable con «Corte Histológico».",
          },
          {
            id: 2,
            name: "Poro Quístico (Ostiolo) con Tapón Mucoso Refringente",
            shortLabel: "Poro con tapón mucoso",
            category: "Sitio de Eclosión",
            colorBio: "#fde047",
            colorGiemsa: "#d97706",
            anchor: [0.92, 0.15, 0.25],
            cameraPos: [1.8, 0.4, 2.2],
            lookAt: [0.65, 0.1, 0.0],
            description:
              "Uno o dos poros circulares de ~1 µm en la pared quística cerrados por un opérculo mucopolisacárido a ras de la superficie.",
            microscopy:
              "Visibles en contraste de fases o microscopía electrónica.",
            clinical:
              "Cuando la temperatura del agua supera los 30–35 °C en verano, el trofozoíto emerge a través de este poro.",
            threeDNote:
              "Anillo poral con tapón dorado en el polo ecuatorial derecho.",
          },
          {
            id: 3,
            name: "Núcleo Único Central con Gran Cariosoma en «Ojo de Buey»",
            shortLabel: "Núcleo central",
            category: "Núcleo Quístico",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.0, 0.05, 0.35],
            cameraPos: [0.0, 0.2, 2.1],
            lookAt: [0.0, 0.0, 0.05],
            description:
              "Núcleo central único con cariosoma voluminoso rodeado de halo claro.",
            microscopy:
              "Idéntico al núcleo del trofozoíto.",
            clinical:
              "Se observa en placas de agar no nutritivo con E. coli cuando el cultivo envejece.",
            threeDNote:
              "Núcleo central con gran cariosoma púrpura expuesto en el corte 3D.",
          },
          {
            id: 4,
            name: "Citoplasma Denso con Gránulos Lipídicos de Hibernación",
            shortLabel: "Gránulos de reserva",
            category: "Supervivencia Invernal en Sedimentos",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.35, -0.28, 0.32],
            cameraPos: [-1.1, -0.5, 2.2],
            lookAt: [-0.2, -0.15, 0.05],
            description:
              "Inclusiones densas que permiten al quiste hibernar en el fango del fondo de lagos y ríos durante los meses fríos.",
            microscopy:
              "Aspecto finamente granulado alrededor del núcleo.",
            clinical:
              "Al remover el sedimento del fondo de lagos someros cálidos al nadar, los quistes y trofozoítos quedan en suspensión.",
            threeDNote:
              "Esférulas rojas internas alrededor del núcleo.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Invasión Neuroepitelial Olfatoria y Lámina Cribosa del Etmoides (MAP)",
        shortName: "4. Invasión Lámina Cribosa (MAP)",
        subtitle: "Los trofozoítos ascienden por los filetes del nervio olfatorio (I par) atravesando la lámina cribosa hacia el bulbo olfatorio",
        sizeRange: "Trofozoítos 20 µm migrando por axones olfatorios",
        scaleMicrons: 50,
        defaultTranslucency: 46,
        defaultCut: 0,
        defaultMotility: 45,
        defaultCameraPos: [0.15, 0.45, 4.2],
        summary:
          "La vía anatómica de entrada al cerebro en la Meningoencefalitis Amebiana Primaria (MAP) es directa y fulminante: los trofozoítos de Naegleria fowleri se adhieren al neuroepitelio olfatorio del techo de la cavidad nasal, fagocitan las células sustentaculares y ascienden a lo largo de los haces amielínicos del NERVIO OLFATORIO (I par craneal) a través de las fenestraciones óseas de la LÁMINA CRIBOSA DEL ETMOIDES, alcanzando directamente el espacio subaracnoideo y los bulbos olfatorios.",
        diagnosticPearl:
          "Clínica de la MAP: Niño o joven previamente sano que 3–7 días después de nadar en agua dulce cálida debuta con cefalea frontal fulminante, fiebre alta, ageusia/parosmia (por destrucción del bulbo olfatorio), rigidez de nuca y coma rápido. LCR: aspecto purulento/hemorrágico con neutrófilos, hipoglucorraquia, hiperproteinorraquia, Gram negativo y TROFOZOÍTOS MÓVILES al fresco. Tratamiento urgente: Anfotericina B IV/intratecal + Miltefosina + Azitromicina + Rifampicina + Fluconazol + Dexametasona.",
        regions: [
          {
            id: 1,
            name: "Lámina Cribosa del Hueso Etmoides con Forámenes Olfatorios",
            shortLabel: "Lámina cribosa del etmoides",
            category: "Puerta de Entrada Anatómica al SNC",
            colorBio: "#e2e8f0",
            colorGiemsa: "#94a3b8",
            anchor: [0.0, 0.0, 0.3],
            cameraPos: [0.1, 0.3, 2.5],
            lookAt: [0.0, 0.0, 0.05],
            description:
              "Delgada placa ósea horizontal perforada que separa el techo de las fosas nasales (abajo) de la fosa craneal anterior (arriba).",
            microscopy:
              "Sus forámenes carecen de barrera hematoencefálica convencional, ofreciendo un túnel directo a lo largo de las vainas perineurales olfatorias.",
            clinical:
              "Explica por qué el período de incubación de la MAP es tan corto (1–9 días) en comparación con la diseminación hematógena de la EAG (semanas/meses).",
            threeDNote:
              "Placa ósea horizontal marfil con conductos perforados por donde ascienden los nervios.",
          },
          {
            id: 2,
            name: "Filetes Axónicos del Nervio Olfatorio (I Par) y Bulbo Olfatorio",
            shortLabel: "Nervio y bulbo olfatorio",
            category: "Vía Neurotrópica (Quimiotaxis por ACh)",
            colorBio: "#fde047",
            colorGiemsa: "#d97706",
            anchor: [-0.45, 0.55, 0.25],
            cameraPos: [-1.2, 1.0, 2.4],
            lookAt: [-0.3, 0.4, 0.0],
            description:
              "Haces de axones olfatorios que atraviesan la lámina cribosa para hacer sinapsis en los glomérulos del bulbo olfatorio intracraneal.",
            microscopy:
              "Los bulbos olfatorios y la corteza orbitofrontal inferior muestran necrosis hemorrágica masiva en la autopsia.",
            clinical:
              "La destrucción inicial de los bulbos olfatorios explica las alteraciones precoces del olfato (parosmia/anosmia) y del gusto que preceden al meningismo.",
            threeDNote:
              "Columnas nerviosas doradas atravesando la placa hacia el bulbo olfatorio superior.",
          },
          {
            id: 3,
            name: "Trofozoítos de Naegleria fowleri Migrando Hacia el Espacio Subaracnoideo",
            shortLabel: "Trofozoítos invasores",
            category: "Invasión Activa (SOLO Trofozoítos)",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [0.45, 0.35, 0.35],
            cameraPos: [1.3, 0.7, 2.3],
            lookAt: [0.3, 0.25, 0.1],
            description:
              "Trofozoítos ameboides degradando las uniones estrechas del epitelio nasal mediante metaloproteasas y ascendiendo hacia el bulbo olfatorio.",
            microscopy:
              "Recordar: en todo este trayecto tisular SOLO existen trofozoítos con amebostomas (ausencia total de quistes).",
            clinical:
              "La adición de MILTEFOSINA al esquema con Anfotericina B e hipotermia terapéutica controlada ha permitido los pocos casos documentados de supervivencia humana.",
            threeDNote:
              "Trofozoítos 3D con núcleo en ojo de buey interno ascendiendo por los forámenes.",
          },
          {
            id: 4,
            name: "Neuroepitelio Olfatorio Nasal (Abajo) y Exudado Hemorrágico (Arriba)",
            shortLabel: "Mucosa nasal y necrosis",
            category: "Interfase Naso-Encefálica",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.65, -0.48, 0.25],
            cameraPos: [-1.5, -0.7, 2.4],
            lookAt: [-0.4, -0.35, 0.0],
            description:
              "En el plano inferior se ubica la mucosa olfatoria nasal bañada por agua contaminada; en el plano superior, la meningoencefalitis hemorrágica purulenta.",
            microscopy:
              "Abundantes eritrocitos y neutrófilos acompañando a las amebas en el espacio subaracnoideo.",
            clinical:
              "El uso de pinzas nasales al bañarse en aguas termales y el empleo exclusivo de agua hervida/estéril para lavados nasales previenen el 100% de las infecciones.",
            threeDNote:
              "Capas tisulares superior e inferior que muestran sus trofozoítos internos al activar «Corte Histológico».",
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

    float wave = sin(pos.x * 4.0 + pos.y * 3.4 + uTime * 2.6) * 0.016 * uMotility;
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
    N = perturbNormalAnalytical(N, vLocalPos, 11.5, 0.08);

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
      vec3 stainShift = mix(baseCol, vec3(baseCol.r * 0.85, baseCol.g * 0.65, baseCol.b * 1.2), 0.45);
      finalCol = stainShift * (0.5 + diff1 * 0.5) + vec3(0.9, 0.95, 1.0) * fresnel * 0.25;
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
 * Helper to emit a Free-Living Amoeba "Owl's-Eye / Bull's-Eye" Nucleus (giant central karyosome, zero peripheral chromatin)
 */
function addFLABullsEyeNucleus(
  b: BioMeshBuilder,
  cx: number,
  cy: number,
  cz: number,
  radius: number,
  regionId: number
) {
  // Giant dense central karyosome (nucleolus)
  b.addSphere(cx, cy, cz, radius * 0.56, radius * 0.56, radius * 0.56, "#581c87", regionId, 18, 14);
  // Clear halo & smooth nuclear membrane (cuttable outer layer)
  b.addSphere(cx, cy, cz, radius, radius, radius, "#c084fc", regionId + 0.4, 22, 16);
}

function buildStageGeometry(speciesCode: "p17" | "p18", stageId: StageId): THREE.BufferGeometry {
  const b = new BioMeshBuilder();

  if (speciesCode === "p17") {
    // P17: Acanthamoeba spp.
    if (stageId === "stage1") {
      // Stage 1: Trophozoite with spiky Acanthopodia + giant Bull's-eye karyosome + contractile vacuole + endosymbionts
      // 1. Bull's-eye nucleus (region 2)
      addFLABullsEyeNucleus(b, -0.15, 0.1, 0.0, 0.36, 2);

      // 2. Contractile osmoregulatory vacuole (region 3)
      b.addSphere(0.38, -0.18, 0.08, 0.25, 0.25, 0.25, "#38bdf8", 3, 18, 14);

      // 3. Endosymbiotic bacteria inside phagocytic vacuoles (region 4)
      for (const [bx, by, bz] of [
        [-0.48, -0.25, 0.12],
        [-0.32, -0.35, -0.1],
        [0.18, 0.36, 0.08],
      ]) {
        b.addTube(
          [
            [bx - 0.08, by, bz],
            [bx + 0.08, by + 0.05, bz],
          ],
          [0.04, 0.04],
          "#4ade80",
          4,
          10
        );
      }

      // 4. Spiky thorn-like Acanthopodia radiating from surface (region 1)
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const zOff = ((i % 3) - 1) * 0.22;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        b.addTube(
          [
            [ca * 0.65, sa * 0.55, zOff],
            [ca * 1.05, sa * 0.88 + Math.sin(i * 2) * 0.08, zOff * 1.2],
            [ca * 1.38, sa * 1.12, zOff * 1.3],
          ],
          [0.11, 0.05, 0.01],
          "#22d3ee",
          1,
          10
        );
      }

      // 5. Outer pleomorphic trophozoite body (region 1.4 -> cuttable)
      b.addSphere(0, 0, 0, 0.88, 0.72, 0.65, "#67e8f9", 1.4, 36, 26);
    } else if (stageId === "stage2") {
      // Stage 2: Double-Walled Cyst (wrinkled ectocyst + stellate/polyhedral endocyst + ostiole opercula + bull's-eye nucleus)
      // 1. Central bull's-eye nucleus (region 4)
      addFLABullsEyeNucleus(b, 0, 0, 0, 0.32, 4);

      // 2. Stellate 6-pointed / polyhedral Endocyst (region 1.4 -> cuttable) + Ostiole opercula at tips (region 3)
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        // Star arm of endocyst
        b.addTube(
          [
            [ca * 0.35, sa * 0.35, 0.0],
            [ca * 0.82, sa * 0.82, 0.0],
          ],
          [0.28, 0.09],
          "#22d3ee",
          1.4,
          14
        );
        // Ostiole operculum cap at vertex (region 3)
        b.addSphere(ca * 0.86, sa * 0.86, 0.0, 0.11, 0.11, 0.11, "#fde047", 3, 12, 10);
      }
      b.addSphere(0, 0, 0, 0.64, 0.64, 0.58, "#22d3ee", 1.4, 28, 20);

      // 3. Wrinkled outer Ectocyst (region 2.4 -> cuttable)
      b.addSphere(0, 0, 0, 1.06, 1.06, 0.96, "#94a3b8", 2.4, 40, 30, (px, py, pz) => {
        const w = Math.sin(px * 9.0) * Math.cos(py * 9.0) * 0.045;
        return [px + w, py + w, pz + w];
      });
    } else if (stageId === "stage3") {
      // Stage 3: Acanthamoeba Keratitis (Ring Stromal Infiltrate + Radial Keratoneuritis + Intra-stromal Cysts)
      // 1. Ring stromal infiltrate (Wessely ring, region 1)
      const ringPts: [number, number, number][] = [];
      for (let s = 0; s <= 32; s++) {
        const a = (s / 32) * Math.PI * 2;
        ringPts.push([Math.cos(a) * 0.72, 0.15, Math.sin(a) * 0.72]);
      }
      b.addTube(ringPts, Array(33).fill(0.11), "#f8fafc", 1, 14);

      // 2. Radial corneal nerves infiltrated by trophozoites (Radial Keratoneuritis, region 2)
      for (let n = 0; n < 4; n++) {
        const a = (n / 4) * Math.PI * 2 + 0.4;
        b.addTube(
          [
            [Math.cos(a) * 0.25, 0.08, Math.sin(a) * 0.25],
            [Math.cos(a) * 1.15, -0.05, Math.sin(a) * 1.15],
          ],
          [0.035, 0.055],
          "#fde047",
          2,
          10
        );
      }

      // 3. Stellate cysts & trophozoites inside corneal stroma (region 3)
      b.addSphere(0.15, 0.12, 0.15, 0.22, 0.22, 0.22, "#22d3ee", 3, 18, 14);
      b.addSphere(-0.22, 0.1, -0.18, 0.2, 0.2, 0.2, "#22d3ee", 3, 18, 14);

      // 4. Corneal dome (region 4.4 -> cuttable)
      b.addSphere(0, -0.15, 0, 1.45, 0.55, 1.35, "#38bdf8", 4.4, 36, 24);
    } else {
      // Stage 4: Granulomatous Amoebic Encephalitis (GAE) — Perivascular cuffing of both Trophozoites AND Cysts
      // Central cerebral blood vessel (region 1)
      b.addTube(
        [
          [-1.35, 0.0, 0.0],
          [0.0, 0.05, 0.0],
          [1.35, 0.0, 0.0],
        ],
        [0.24, 0.26, 0.24],
        "#ef4444",
        1,
        18
      );
      // Stellate double-walled cysts in Virchow-Robin space (region 2)
      for (const [cx, cy, cz] of [
        [0.55, 0.35, 0.22],
        [0.25, -0.38, 0.2],
        [-0.15, 0.42, -0.18],
      ]) {
        b.addSphere(cx, cy, cz, 0.14, 0.14, 0.14, "#581c87", 2, 12, 10);
        b.addSphere(cx, cy, cz, 0.25, 0.25, 0.25, "#22d3ee", 2.4, 18, 14);
      }
      // Trophozoites with bull's-eye nuclei (region 3)
      for (const [tx, ty, tz] of [
        [-0.55, 0.28, 0.22],
        [-0.42, -0.32, 0.18],
      ]) {
        addFLABullsEyeNucleus(b, tx, ty, tz, 0.15, 3);
        b.addSphere(tx, ty, tz, 0.28, 0.22, 0.22, "#fde047", 3.4, 18, 14);
      }
      // Necrotic brain parenchyma (region 4.4 -> cuttable)
      b.addSphere(0, 0, 0, 1.42, 0.95, 0.95, "#a855f7", 4.4, 34, 24);
    }
  } else {
    // P18: Naegleria fowleri
    if (stageId === "stage1") {
      // Stage 1: Thermophilic Amoeboid Trophozoite (Amebostome sucker cup + Bull's-eye nucleus + Blunt Lobopodium + Uroid)
      // 1. Bull's-eye nucleus with giant central karyosome (region 2)
      addFLABullsEyeNucleus(b, -0.05, 0.1, 0.0, 0.34, 2);

      // 2. Contractile vacuole & ingested RBCs in posterior endoplasm (region 4)
      b.addSphere(-0.55, -0.22, 0.1, 0.22, 0.22, 0.22, "#fde047", 4, 16, 12);
      b.addSphere(-0.35, 0.28, -0.12, 0.16, 0.12, 0.16, "#ef4444", 4, 14, 10);

      // 3. Phagocytic sucker cup "Amebostome" (region 1)
      b.addSphere(-0.88, 0.22, 0.15, 0.28, 0.28, 0.24, "#f43f5e", 1, 22, 16, (px, py, pz) => {
        if (px < -0.92) {
          return [px + 0.16, py, pz]; // concave crater cup
        }
        return [px, py, pz];
      });

      // 4. Blunt hemispherical anterior Lobopodium (region 3.4 -> cuttable)
      b.addSphere(0.75, 0.08, 0.0, 0.56, 0.44, 0.44, "#22d3ee", 3.4, 28, 20);

      // 5. Limax amoeboid body (region 3.4 -> cuttable)
      b.addSphere(-0.15, 0.0, 0.0, 0.88, 0.58, 0.56, "#38bdf8", 3.4, 36, 26);
    } else if (stageId === "stage2") {
      // Stage 2: Pear-shaped Biflagellate Swimming Form (2 equal anterior flagella + anterior nucleus + rhizoplast)
      // 1. Anterior bull's-eye nucleus & rhizoplast (region 2)
      addFLABullsEyeNucleus(b, -0.32, 0.05, 0.0, 0.28, 2);
      b.addTube(
        [
          [-0.85, 0.08, 0.0],
          [-0.45, 0.06, 0.0],
        ],
        [0.035, 0.045],
        "#e879f9",
        2,
        10
      );

      // 2. Posterior contractile vacuole (region 4)
      b.addSphere(0.48, -0.1, 0.0, 0.24, 0.24, 0.24, "#fde047", 4, 18, 14);

      // 3. Pair of equal Anterior Flagella (region 1)
      for (const side of [-1, 1]) {
        const fPts: [number, number, number][] = [];
        for (let s = 0; s <= 18; s++) {
          const t = s / 18;
          fPts.push([
            -0.88 - t * 0.85,
            0.08 + side * (0.12 + t * 0.35) + Math.sin(t * Math.PI * 2.5) * 0.12,
            side * Math.cos(t * Math.PI * 2) * 0.1,
          ]);
        }
        b.addTube(fPts, Array(19).fill(0.026), "#22d3ee", 1, 10);
      }

      // 4. Pyriform teardrop body (region 3.4 -> cuttable)
      b.addSphere(0.05, 0.0, 0.0, 0.96, 0.58, 0.58, "#38bdf8", 3.4, 36, 26, (px, py, pz) => {
        const taper = px < 0 ? Math.max(0.28, 1.0 + px * 0.65) : 1.0;
        return [px, py * taper, pz * taper];
      });
    } else if (stageId === "stage3") {
      // Stage 3: Smooth Single-Walled Spherical Environmental Cyst (ONLY in environment, NEVER in brain)
      // 1. Central bull's-eye nucleus (region 3)
      addFLABullsEyeNucleus(b, 0, 0, 0, 0.36, 3);

      // 2. Hibernation lipid granules (region 4)
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        b.addSphere(Math.cos(a) * 0.55, Math.sin(a) * 0.55, ((i % 2) - 0.5) * 0.25, 0.11, 0.11, 0.11, "#f43f5e", 4, 12, 10);
      }

      // 3. Mucoid plugged ostiole pore (region 2)
      b.addSphere(0.96, 0.12, 0.0, 0.16, 0.18, 0.18, "#fde047", 2, 16, 12);

      // 4. Smooth spherical cyst wall (region 1.4 -> cuttable)
      b.addSphere(0, 0, 0, 1.04, 1.04, 1.04, "#38bdf8", 1.4, 38, 28);
    } else {
      // Stage 4: Olfactory Neuroepithelium & Cribriform Plate Invasion (PAM)
      // 1. Horizontal perforated Cribriform Plate of Ethmoid bone (region 1)
      b.addSphere(0, 0.0, 0, 1.45, 0.14, 1.15, "#e2e8f0", 1, 30, 16);

      // 2. Olfactory nerve fila & Olfactory Bulb above plate (region 2)
      for (const nx of [-0.65, 0.0, 0.65]) {
        b.addTube(
          [
            [nx, -0.55, 0.0],
            [nx, 0.52, 0.0],
          ],
          [0.08, 0.09],
          "#fde047",
          2,
          12
        );
      }
      b.addSphere(0, 0.62, 0, 1.15, 0.28, 0.75, "#fbbf24", 2.4, 28, 18);

      // 3. Invading Naegleria fowleri amoeboid trophozoites ascending through cribriform foramina (region 3)
      for (const [tx, ty, tz] of [
        [0.42, 0.32, 0.2],
        [-0.38, -0.25, 0.22],
        [0.12, 0.18, 0.25],
      ]) {
        addFLABullsEyeNucleus(b, tx, ty, tz, 0.12, 3);
        b.addSphere(tx, ty, tz, 0.24, 0.18, 0.18, "#22d3ee", 3.4, 18, 14);
      }

      // 4. Nasal olfactory mucosa below & hemorrhagic necrosis above (region 4.4 -> cuttable)
      b.addSphere(0, -0.58, 0, 1.35, 0.22, 1.05, "#f43f5e", 4.4, 28, 16);
    }
  }

  return b.toBufferGeometry();
}

export function FreeLivingAmoebae3DViewer({
  speciesCode,
  onClose,
}: FreeLivingAmoebae3DViewerProps) {
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
                <span className="text-slate-300">Translucidez de Pared / Ectoplasma</span>
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
