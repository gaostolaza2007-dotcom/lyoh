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

export interface FlagellatesHemoparasites3DViewerProps {
  speciesCode: "p12" | "p13" | "p14" | "p15" | "p16";
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
  code: "p12" | "p13" | "p14" | "p15" | "p16";
  scientificName: string;
  commonName: string;
  taxonomyBadge: string;
  stainLabel: string;
  stages: Record<StageId, StageMeta>;
}

const SPECIES_CONFIG: Record<"p12" | "p13" | "p14" | "p15" | "p16", SpeciesMeta> = {
  p12: {
    code: "p12",
    scientificName: "Trichomonas vaginalis",
    commonName: "Tricomoniasis Urogenital (ITS No Viral más Prevalente)",
    taxonomyBadge: "P12 · Protozoo Parabasálido Flagelado (Sin Quiste)",
    stainLabel: "Fresco Salino / Giemsa",
    stages: {
      stage1: {
        id: "stage1",
        label: "Trofozoíto Piriforme (10–23 µm) — Axostilo, Hidrogenosomas y Membrana Ondulante",
        shortName: "1. Trofozoíto Piriforme (Único Estadio)",
        subtitle: "4 flagelos anteriores libres, membrana ondulante corta (1/2 cuerpo), axostilo saliente e hidrogenosomas",
        sizeRange: "10 – 23 × 7 – 12 µm",
        scaleMicrons: 5,
        defaultTranslucency: 54,
        defaultCut: 0,
        defaultMotility: 60,
        defaultCameraPos: [0.2, 0.35, 3.8],
        summary:
          "Trichomonas vaginalis posee ÚNICAMENTE el estadio de trofozoíto (carece por completo de forma quística, razón por la cual se transmite exclusivamente por contacto sexual directo en secreciones húmedas). Tiene cuerpo piriforme con 4 flagelos anteriores libres, un 5.º flagelo recurrente bordeando una membrana ondulante corta (que solo recorre la mitad o dos tercios del cuerpo, sin flagelo libre posterior), un axostilo microtubular hialino que sobresale como espina caudal y filas de hidrogenosomas anaerobios.",
        diagnosticPearl:
          "En el examen al fresco de flujo vaginal, T. vaginalis se identifica por su movimiento espasmódico/bamboleante («jerky motility») impulsado por su membrana ondulante corta. La prueba de mayor sensibilidad (>95%) es la amplificación molecular (NAAT/PCR); tratar SIEMPRE al paciente y a su(s) pareja(s) sexuales con metronidazol o tinidazol.",
        regions: [
          {
            id: 1,
            name: "Cuatro Flagelos Anteriores Libres y Complejo Pelta-Complejo Basal",
            shortLabel: "4 flagelos anteriores",
            category: "Aparato Mastigonte Anterior",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [-1.25, 0.45, 0.25],
            cameraPos: [-2.1, 0.8, 2.3],
            lookAt: [-0.9, 0.25, 0.0],
            description:
              "Haz de 4 flagelos locomotores libres que emergen de los cuerpos basales (blefaroplastos) en el polo anterior redondeado del trofozoíto.",
            microscopy:
              "En microscopía de contraste de fases baten como un látigo coordinado generando rotación y avance brusco.",
            clinical:
              "Permiten al protozoo desplazarse a través del moco cervical y uretral.",
            threeDNote:
              "Cuatro filamentos helicoidales emergiendo del polo anterior.",
          },
          {
            id: 2,
            name: "Membrana Ondulante Corta (1/2 del Cuerpo) y Costa Estriada",
            shortLabel: "Membrana ondulante corta",
            category: "Sello Diferencial de Especie",
            colorBio: "#a855f7",
            colorGiemsa: "#9333ea",
            anchor: [-0.15, 0.62, 0.2],
            cameraPos: [-0.4, 1.2, 2.3],
            lookAt: [-0.1, 0.4, 0.0],
            description:
              "Aleta membranosa dorsal sostenida en su base por una varilla fibrosa contráctil llamada «costa» y recorrida por el 5.º flagelo recurrente, que termina a mitad del cuerpo SIN extremo libre posterior.",
            microscopy:
              "Diferencia taxonómica clave: en Trichomonas vaginalis la membrana ondulante mide solo la mitad del cuerpo, mientras que en Pentatrichomonas hominis (intestinal) recorre todo el cuerpo y termina en flagelo libre.",
            clinical:
              "Su ondulación continua es el signo visual inmediato en el examen en fresco en suero fisiológico.",
            threeDNote:
              "Cresta sinuosa dorsal con cordón basal (costa) que recorre los dos tercios anteriores.",
          },
          {
            id: 3,
            name: "Axostilo Microtubular Hialino y Espina Caudal Protruyente",
            shortLabel: "Axostilo y espina caudal",
            category: "Citoesqueleto Axial",
            colorBio: "#38bdf8",
            colorGiemsa: "#4f46e5",
            anchor: [0.95, -0.05, 0.15],
            cameraPos: [1.9, 0.2, 2.3],
            lookAt: [0.5, 0.0, 0.0],
            description:
              "Tubo rígido de láminas de microtúbulos que envuelve al núcleo en su extremo anterior (capítulo), atraviesa longitudinalmente todo el parásito y emerge por el polo posterior como una púa afilada.",
            microscopy:
              "Claramente visible como un eje refringente que sobresale por la cola del trofozoíto.",
            clinical:
              "Participa en el anclaje mecánico e irritación traumática puntual sobre el epitelio escamoso vaginal y exocervical.",
            threeDNote:
              "Eje interno azul cristalino que atraviesa el cuerpo y sobresale en punta posterior; expuesto en todo su trayecto con «Corte Histológico».",
          },
          {
            id: 4,
            name: "Hidrogenosomas Paracostales/Paraxostilares y Núcleo Vesicular Anterior",
            shortLabel: "Hidrogenosomas (diana metronidazol)",
            category: "Metabolismo Anaerobio y Diana Farmacológica",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.28, 0.08, 0.32],
            cameraPos: [-0.9, 0.3, 2.2],
            lookAt: [-0.2, 0.05, 0.1],
            description:
              "T. vaginalis carece de mitocondrias; en su lugar posee filas dobles de gránulos densos llamados HIDROGENOSOMAS (alineados junto a la costa y el axostilo) que producen ATP e hidrógeno molecular (H2) mediante la piruvato:ferredoxina oxidorreductasa (PFOR).",
            microscopy:
              "En Giemsa o tricrómico se observan como hileras de gránulos cromáticos rojizos paracostales y paraxostilares junto al núcleo ovoide anterior.",
            clinical:
              "La ferredoxina de los hidrogenosomas reduce el grupo nitro del METRONIDAZOL y TINIDAZOL generando radicales libres citotóxicos que fragmentan el ADN parasitario.",
            threeDNote:
              "Doble hilera de esferas coralinas internas flanqueando el axostilo y el núcleo anterior.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Trofozoíto Ameboide Citopático Adherido a Célula Epitelial Vaginal",
        shortName: "2. Forma Ameboide Citopática",
        subtitle: "Transformación aplanada con pseudópodos, adhesinas AP65 y lisis por contacto del epitelio escamoso",
        sizeRange: "Trofozoíto 15–25 µm sobre célula escamosa (50 µm)",
        scaleMicrons: 10,
        defaultTranslucency: 48,
        defaultCut: 0,
        defaultMotility: 40,
        defaultCameraPos: [0.15, 0.5, 4.1],
        summary:
          "Pocos minutos después de contactar el epitelio escamoso vaginal o exocervical, el trofozoíto piriforme de T. vaginalis sufre una drástica transformación morfológica: se aplana y despliega como una forma AMEBOIDE adherente que maximiza su superficie de contacto mediante lipofosfoglicano (LPG) y adhesinas (AP65, AP51, AP33), secretando cisteína-proteasas y porinas que lisan la célula epitelial.",
        diagnosticPearl:
          "En citología cervicovaginal de Papanicolaou los trofozoítos ameboides se observan como estructuras piriformes/ovales gris-azuladas con núcleo pálido elíptico adheridas a las células escamosas, a menudo rodeadas de halos inflamatorios («cañones de escopeta» de PMN).",
        regions: [
          {
            id: 1,
            name: "Trofozoíto Aplanado en Conformación Ameboide Adherente",
            shortLabel: "Trofozoíto ameboide",
            category: "Plasticidad Citoesquelética",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [0.0, 0.25, 0.35],
            cameraPos: [0.1, 0.7, 2.3],
            lookAt: [0.0, 0.15, 0.1],
            description:
              "El parásito remodela su actina y emite lamelipodios basales para abrazar íntimamente la membrana de la célula epitelial vaginal.",
            microscopy:
              "Conserva sus 4 flagelos anteriores, su núcleo anterior y sus hidrogenosomas internos.",
            clinical:
              "La adherencia estrecha crea un microambiente intercelular ácido donde las hidrolasas parasitarias perforan la célula huésped.",
            threeDNote:
              "Cuerpo ameboide extendido sobre la célula epitelial; el corte histológico muestra su núcleo e hidrogenosomas internos.",
          },
          {
            id: 2,
            name: "Interfase de Adhesinas (AP65/AP51) y Lipofosfoglicano (LPG)",
            shortLabel: "Placa de adhesinas AP65",
            category: "Factor de Virulencia",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [0.25, -0.05, 0.35],
            cameraPos: [1.1, 0.2, 2.2],
            lookAt: [0.15, -0.05, 0.1],
            description:
              "Zona de interdigitación membranosa donde las proteínas de adhesión reguladas por hierro (AP65) y las cisteína-proteasas (CP30) degradan la laminina y fibronectina.",
            microscopy:
              "Microscopía electrónica de barrido muestra microvellosidades parasitarias ancladas a la superficie escamosa.",
            clinical:
              "Durante la menstruación el hierro hemoglobínico sobreexpresa las adhesinas AP65, exacerbando los síntomas de vaginitis.",
            threeDNote:
              "Disco de contacto rojo-coral entre la base del trofozoíto y el epitelio.",
          },
          {
            id: 3,
            name: "Célula Epitelial Escamosa Vaginal en Citólisis",
            shortLabel: "Célula escamosa vaginal",
            category: "Epitelio Huésped",
            colorBio: "#f472b6",
            colorGiemsa: "#db2777",
            anchor: [-0.85, -0.25, 0.3],
            cameraPos: [-1.8, 0.1, 2.5],
            lookAt: [-0.4, -0.2, 0.0],
            description:
              "Célula poligonal pavimentosa del epitelio vaginal que pierde su glucógeno intracelular (lo que agota a los lactobacilos de Döderlein y eleva el pH vaginal a >4.5, típicamente 5.0–6.0).",
            microscopy:
              "Muestra vacuolización perinuclear y erosión de bordes citoplasmáticos.",
            clinical:
              "La destrucción epitelial duplica o triplica el riesgo de adquisición y transmisión del VIH y se asocia con rotura prematura de membranas y parto prematuro en gestantes.",
            threeDNote:
              "Lámina celular poligonal rosada con núcleo central bajo el parásito.",
          },
          {
            id: 4,
            name: "Endosimbionte Viral ARN (Trichomonasvirus TVV) e Hidrogenosomas",
            shortLabel: "Hidrogenosomas y TVV",
            category: "Hiperinflamación TLR3",
            colorBio: "#fbbf24",
            colorGiemsa: "#d97706",
            anchor: [-0.25, 0.28, 0.25],
            cameraPos: [-0.9, 0.6, 2.2],
            lookAt: [-0.15, 0.2, 0.05],
            description:
              "Muchas cepas de T. vaginalis portan virus de ARN bicatenario (Trichomonasvirus) junto a sus hidrogenosomas.",
            microscopy:
              "Al lisarse los trofozoítos durante el tratamiento con metronidazol, liberan ARN viral que activa el receptor TLR3 del epitelio.",
            clinical:
              "Amplifica la tormenta de IL-8 y el reclutamiento masivo de neutrófilos responsables de la leucorrea purulenta.",
            threeDNote:
              "Gránulos dorados y coralinos en el interior del trofozoíto ameboide.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "«Cérvix en Fresa» (Colpitis Macularis) y Exudado Espumoso (pH > 4.5)",
        shortName: "3. Cérvix en Fresa (Clínica)",
        subtitle: "Hemorragias petequiales subepiteliales puntiformes, leucorrea espumosa por H2 y abundantes PMN",
        sizeRange: "Microhemorragias 0.5–2 mm · Trofozoítos 15 µm",
        scaleMicrons: 100,
        defaultTranslucency: 45,
        defaultCut: 0,
        defaultMotility: 45,
        defaultCameraPos: [0.15, 0.5, 4.2],
        summary:
          "En la mucosa exocervical y vaginal, la acción citolítica de Trichomonas vaginalis adelgaza focalmente el epitelio escamoso sobre las papilas dérmicas hiperémicas, generando hemorragias puntiformes subepiteliales conocidas como «cérvix en fresa» o colpitis macularis (visible a simple vista en 2–5% pero hasta en 45% por colposcopía). El gas hidrógeno (H2) producido por los hidrogenosomas crea las microburbujas de la clásica leucorrea amarillo-verdosa espumosa con pH > 4.5.",
        diagnosticPearl:
          "¿Por qué el flujo de la tricomoniasis es ESPUMOSO? Porque los hidrogenosomas del parásito fermentan carbohidratos liberando gas HIDRÓGENO molecular (H2) en la secreción vaginal.",
        regions: [
          {
            id: 1,
            name: "Máculas Eritematosas Puntiformes Subepiteliales («Cérvix en Fresa»)",
            shortLabel: "Puntos hemorrágicos (Fresa)",
            category: "Signo Clínico Patognomónico",
            colorBio: "#e11d48",
            colorGiemsa: "#be123c",
            anchor: [-0.45, 0.15, 0.35],
            cameraPos: [-1.2, 0.5, 2.4],
            lookAt: [-0.35, 0.05, 0.1],
            description:
              "Asas capilares subepiteliales dilatadas y microhemorragias papilares expuestas por la denudación focal del epitelio exocervical.",
            microscopy:
              "En colposcopía con filtro verde o tras aplicar Lugol (test de Schiller) aparecen como un punteado macular difuso característico.",
            clinical:
              "Explica la dispareunia, el sangrado postcoital (sinusorragia) y el prurito vulvovaginal urente.",
            threeDNote:
              "Domos capilares rojo carmín emergiendo en la superficie mucosa.",
          },
          {
            id: 2,
            name: "Microburbujas de Gas Hidrógeno (H2) — Leucorrea Espumosa",
            shortLabel: "Microburbujas de H2",
            category: "Bioquímica de Hidrogenosomas",
            colorBio: "#a3e635",
            colorGiemsa: "#84cc16",
            anchor: [0.55, 0.45, 0.3],
            cameraPos: [1.4, 0.8, 2.4],
            lookAt: [0.4, 0.3, 0.05],
            description:
              "Burbujas gaseosas de H2 y CO2 atrapadas en el exudado mucopurulento amarillo-verdoso con pH alcalinizado (>4.5).",
            microscopy:
              "Observables macroscópicamente en el espéculo vaginal y microscópicamente en el montaje en fresco.",
            clinical:
              "La prueba de aminas con KOH al 10% (whiff test) puede ser positiva por coinfección frecuente con vaginosis bacteriana.",
            threeDNote:
              "Esferas translúcidas amarillo-verdosas flotando sobre el epitelio.",
          },
          {
            id: 3,
            name: "Trofozoítos Flagelados Móviles en el Exudado",
            shortLabel: "Trofozoítos activos",
            category: "Agente Etiológico",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [0.05, 0.32, 0.35],
            cameraPos: [0.2, 0.7, 2.3],
            lookAt: [0.0, 0.2, 0.1],
            description:
              "Trofozoítos piriformes nadando activamente entre las células descamadas y los leucocitos.",
            microscopy:
              "El examen al fresco debe leerse en los primeros 10–15 minutos tras la toma porque al enfriarse los trofozoítos pierden motilidad y se redondean, pareciendo leucocitos.",
            clinical:
              "En el varón suele ser asintomática (70–80%) o causar uretritis no gonocócica, epididimitis o prostatitis.",
            threeDNote:
              "Trofozoítos 3D con flagelos y axostilo sobre las erosiones.",
          },
          {
            id: 4,
            name: "Infiltrado Masivo de Neutrófilos Polimorfonucleares (PMN)",
            shortLabel: "Neutrófilos (PMN)",
            category: "Respuesta Inflamatoria IL-8",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.85, 0.28, 0.25],
            cameraPos: [-1.7, 0.6, 2.4],
            lookAt: [-0.6, 0.15, 0.05],
            description:
              "Abundantes leucocitos neutrófilos multilobulados atraídos por la secreción de IL-8 y leucotrieno B4 del propio parásito.",
            microscopy:
              "En el frotis vaginal en fresco la relación PMN : célula epitelial es muy elevada (>1:1), a diferencia de la vaginosis bacteriana pura donde escasean los PMN.",
            clinical:
              "Los neutrófilos intentan destruir a T. vaginalis mediante trogocitosis («mordisqueo celular» en enjambre) dado que el parásito es demasiado grande para ser fagocitado por un solo PMN.",
            threeDNote:
              "Células esféricas con núcleo trilobulado interno expuestas en el corte 3D.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Fisión Binaria Longitudinal con Duplicación de Axostilo y Mastigonte",
        shortName: "4. Fisión Binaria Longitudinal",
        subtitle: "Multiplicación asexual por mitosis criptopleuromitótica con huso extranuclear y 2 axostilos",
        sizeRange: "20 – 28 µm",
        scaleMicrons: 5,
        defaultTranslucency: 55,
        defaultCut: 0,
        defaultMotility: 45,
        defaultCameraPos: [0.15, 0.35, 3.8],
        summary:
          "Trichomonas vaginalis se reproduce exclusivamente por fisión binaria longitudinal (mitosis cerrada criptopleuromitótica en la que la envoltura nuclear nunca desaparece y el huso mitótico llamado «paradesmosis» se forma por fuera del núcleo entre los dos complejos de atractóforos).",
        diagnosticPearl:
          "Ante fracaso terapéutico con metronidazol dosis única (tras descartar reinfección por pareja no tratada), existe un 5–10% de cepas con resistencia aeróbica leve que responden a Metronidazol 500 mg cada 12 h por 7 días o Tinidazol en dosis altas.",
        regions: [
          {
            id: 1,
            name: "Dos Núcleos Hijos Unidos por el Huso Extranuclear (Paradesmosis)",
            shortLabel: "2 núcleos y paradesmosis",
            category: "Criptopleuromitosis",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.0, 0.25, 0.32],
            cameraPos: [0.0, 0.6, 2.2],
            lookAt: [0.0, 0.15, 0.1],
            description:
              "Par de núcleos vesiculares en separación conectados por un grueso haz de microtúbulos citoplasmáticos (paradesmosis) sin ruptura de la membrana nuclear.",
            microscopy:
              "Visible en cultivos axénicos de Diamond o tinciones de Giemsa/hierro-hematoxilina.",
            clinical:
              "Permite tiempos de duplicación poblacional de apenas 4 a 6 horas en el tracto urogenital.",
            threeDNote:
              "Dos núcleos púrpuras unidos por una barra microtubular dorsal; expuestos al deslizar «Corte Histológico».",
          },
          {
            id: 2,
            name: "Dos Axostilos Hialinos Divergentes",
            shortLabel: "2 axostilos hijos",
            category: "Duplicación Citoesquelética",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [0.35, -0.35, 0.25],
            cameraPos: [1.1, -0.5, 2.3],
            lookAt: [0.2, -0.25, 0.05],
            description:
              "El axostilo materno se reabsorbe parcialmente mientras se ensamblan de novo dos nuevos axostilos tubulares para las células hijas.",
            microscopy:
              "Dos espinas caudales emergiendo del polo posterior bilobulado.",
            clinical:
              "El paclitaxel o benzimidazoles experimentales alteran este ensamblaje microtubular.",
            threeDNote:
              "Dos varillas cristalinas cruzadas en «V» en el interior del cuerpo en división.",
          },
          {
            id: 3,
            name: "Dos Aparatos Mastigontes y Dos Membranas Ondulantes",
            shortLabel: "2 membranas ondulantes",
            category: "Segregación Flagelar",
            colorBio: "#22d3ee",
            colorGiemsa: "#06b6d4",
            anchor: [-0.65, 0.55, 0.25],
            cameraPos: [-1.5, 0.9, 2.3],
            lookAt: [-0.4, 0.35, 0.0],
            description:
              "Cada célula hija hereda la mitad de los flagelos anteriores y completa los 4 flagelos más su propia membrana ondulante y costa.",
            microscopy:
              "Aspecto de trofozoíto ancho en forma de corazón con doble penacho flagelar anterior.",
            clinical:
              "Asegura que ambas células hijas sean inmediatamente móviles y citopáticas tras la citocinesis.",
            threeDNote:
              "Dos penachos flagelares anteriores y dos crestas ondulantes laterales.",
          },
          {
            id: 4,
            name: "Población Duplicada de Hidrogenosomas",
            shortLabel: "Hidrogenosomas en fisión",
            category: "Segregación de Organelos",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.35, -0.05, 0.32],
            cameraPos: [-1.1, 0.1, 2.2],
            lookAt: [-0.25, 0.0, 0.1],
            description:
              "Los hidrogenosomas se dividen por fisión ecuatorial (similar a las mitocondrias) y se reparten a lo largo de las dos nuevas costas.",
            microscopy:
              "Cuatro filas de gránulos cromáticos internos.",
            clinical:
              "Mantiene la capacidad fermentativa anaerobia en toda la progenie.",
            threeDNote:
              "Filas de esferas rojas internas en ambos hemisferios celulares.",
          },
        ],
      },
    },
  },
  p13: {
    code: "p13",
    scientificName: "Trypanosoma cruzi",
    commonName: "Enfermedad de Chagas (Tripanosomiasis Americana)",
    taxonomyBadge: "P13 · Kinetoplástido Hemotisular (Stercoraria)",
    stainLabel: "Tinción Giemsa / H&E",
    stages: {
      stage1: {
        id: "stage1",
        label: "Tripomastigote Sanguíneo en «C» o «S» (20 µm) — Cinetoplasto Subterminal Gigante",
        shortName: "1. Tripomastigote Sanguíneo",
        subtitle: "Forma extracelular circulante en «C» con enorme cinetoplasto subterminal que abomba la cola",
        sizeRange: "16 – 22 µm",
        scaleMicrons: 5,
        defaultTranslucency: 54,
        defaultCut: 0,
        defaultMotility: 55,
        defaultCameraPos: [0.2, 0.35, 3.8],
        summary:
          "El tripomastigote sanguíneo de Trypanosoma cruzi es la forma extracelular circulante (NO se multiplica en la sangre) diagnóstica de la fase aguda de la enfermedad de Chagas. En el frotis teñido con Giemsa adopta una silueta curva en «C» o «S» inconfundible y se caracteriza por su ENORME CINETOPLASTO subterminal posterior (que abomba la membrana como una cabeza de alfiler), núcleo central alargado, membrana ondulante estrecha con pocas ondas y flagelo libre anterior.",
        diagnosticPearl:
          "Diferenciación con Trypanosoma brucei (enfermedad del sueño africana) y Trypanosoma rangeli: T. cruzi tiene un cinetoplasto subterminal GIGANTE que deforma el extremo posterior y forma en «C», mientras que T. brucei tiene un cinetoplasto diminuto y se divide activamente en sangre.",
        regions: [
          {
            id: 1,
            name: "Cinetoplasto Subterminal Voluminoso («en Cesta», ADN Mitocondrial kDNA)",
            shortLabel: "Cinetoplasto gigante",
            category: "Sello Patognomónico de T. cruzi",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [0.88, -0.58, 0.25],
            cameraPos: [1.8, -0.8, 2.3],
            lookAt: [0.65, -0.45, 0.05],
            description:
              "Disco gigante (1.2 µm) de ADN mitocondrial concatenado (miles de minicírculos y decenas de maxicírculos de kDNA) situado dentro de la única mitocondria ramificada, justo delante del extremo posterior puntiagudo.",
            microscopy:
              "En Giemsa se tiñe de color rojo-rubí o violeta negruzco intensísimo y es tan grande que hace protrusión en el contorno posterior del parásito.",
            clinical:
              "Los minicírculos del cinetoplasto (330 pb) son la diana de máxima sensibilidad para la PCR diagnóstica en Chagas agudo, congénito y reactivación postrasplante.",
            threeDNote:
              "Gran esfera discoide rubí en el polo posterior de la «C», expuesta al activar «Corte Histológico».",
          },
          {
            id: 2,
            name: "Núcleo Central Vesicular Alargado",
            shortLabel: "Núcleo central",
            category: "Núcleo Eucariota",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.28, 0.12, 0.28],
            cameraPos: [-1.1, 0.3, 2.2],
            lookAt: [-0.2, 0.05, 0.05],
            description:
              "Núcleo elipsoidal situado a mitad del cuerpo fusiforme curvo del tripomastigote.",
            microscopy:
              "Se tiñe de color púrpura rosado en Giemsa en el centro de la curvatura en «C».",
            clinical:
              "A diferencia de T. brucei, el tripomastigote sanguíneo de T. cruzi está detenido en fase G0/G1 y debe invadir una célula muscular, nerviosa o macrófago para transformarse en amastigote y dividirse.",
            threeDNote:
              "Elipsoide púrpura en el ecuador del cuerpo en «C».",
          },
          {
            id: 3,
            name: "Membrana Ondulante Estrecha (2–3 Ondulaciones) y Flagelo Libre Anterior",
            shortLabel: "Membrana ondulante y flagelo",
            category: "Aparato Locomotor y Trans-sialidasas",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [-0.05, 0.65, 0.2],
            cameraPos: [0.1, 1.3, 2.4],
            lookAt: [0.0, 0.4, 0.0],
            description:
              "El flagelo nace junto al cinetoplasto posterior, recorre todo el borde convexo formando una membrana ondulante estrecha y emerge libre por el extremo anterior.",
            microscopy:
              "En examen en fresco de sangre periférica o capa leucocitaria (método de Strout / microhematocrito) el movimiento serpentiforme agita a los eritrocitos vecinos.",
            clinical:
              "Su superficie está densamente cubierta por mucinas y TRANS-SIALIDASAS que roban ácido siálico de las células humanas para inactivar el complemento.",
            threeDNote:
              "Aleta sinuosa a lo largo del dorso convexo que se prolonga en el látigo flagelar anterior.",
          },
          {
            id: 4,
            name: "Eritrocitos Normocíticos Circundantes (Frotis Sanguíneo)",
            shortLabel: "Eritrocitos vecinos",
            category: "Referencia Hematológica",
            colorBio: "#ef4444",
            colorGiemsa: "#e11d48",
            anchor: [0.95, 0.42, -0.2],
            cameraPos: [1.9, 0.8, 2.4],
            lookAt: [0.5, 0.2, -0.1],
            description:
              "Glóbulos rojos humanos (7.5 µm) que sirven de referencia de escala junto al tripomastigote extracelular.",
            microscopy:
              "El diagnóstico en fase aguda (primeras 4–8 semanas o Chagas congénito al nacer) se realiza por visualización directa en gota fresca, Strout, microhematocrito o PCR.",
            clinical:
              "El tratamiento tripanocida con BENZNIDAZOL (o Nifurtimox) logra tasas de curación >80–95% en la fase aguda y en la infección congénita.",
            threeDNote:
              "Discos bicóncavos eritrocitarios flanqueando al tripomastigote en «C».",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Nido de Amastigotes Intracelulares (Pseudoquiste) en Miocardiocito",
        shortName: "2. Nido de Amastigotes (Corazón)",
        subtitle: "Fibra muscular cardíaca estriada repleta de amastigotes redondos (2–4 µm) con núcleo y cinetoplasto en barra",
        sizeRange: "Amastigote 2–4 µm · Nido 30–60 µm",
        scaleMicrons: 10,
        defaultTranslucency: 48,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.15, 0.45, 4.1],
        summary:
          "Tras invadir los miocardiocitos, células musculares lisas del esófago/colon o células gliales, el tripomastigote escapa de la vacuola hacia el citosol y se transforma en AMASTIGOTE: forma esférica u ovoide de 2 a 4 µm desprovista de flagelo libre externo, que se multiplica por fisión binaria formando densos «nidos de amastigotes» (pseudoquistes) que destruyen el sistema de conducción cardíaco y los plexos mientéricos de Auerbach.",
        diagnosticPearl:
          "En biopsia endomiocárdica o cerebral (H&E / Giemsa), los amastigotes de T. cruzi y Leishmania se diferencian de Histoplasma y Toxoplasma porque cada amastigote muestra DOS estructuras cromáticas internas: un núcleo esférico y un CINETOPLASTO en forma de barra o bastón intensamente teñido.",
        regions: [
          {
            id: 1,
            name: "Amastigotes Intracelulares en División (2–4 µm)",
            shortLabel: "Amastigotes (2–4 µm)",
            category: "Forma Replicativa Intracelular",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [0.05, 0.12, 0.35],
            cameraPos: [0.2, 0.4, 2.2],
            lookAt: [0.0, 0.05, 0.1],
            description:
              "Decenas de cuerpos redondos u ovales de 2–4 µm libres en el sarcoplasma del miocardiocito (sin pared quística verdadera, por lo que se denomina «pseudoquiste»).",
            microscopy:
              "En Giemsa o H&E de alta resolución se observa dentro de cada amastigote el par diagnóstico: núcleo redondo + cinetoplasto en barra.",
            clinical:
              "Antes de romper el miocardiocito, los amastigotes se re-diferencian sincrónicamente en tripomastigotes flagelados que salen a la sangre e invaden fibras vecinas.",
            threeDNote:
              "Racimo tridimensional de amastigotes dentro de la fibra miocárdica, cada uno con su barra de cinetoplasto interna expuesta en el corte.",
          },
          {
            id: 2,
            name: "Cinetoplasto en Barra (Bastón) y Núcleo de cada Amastigote",
            shortLabel: "Cinetoplasto en barra",
            category: "Criterio Histopatológico Diferencial",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [-0.25, -0.05, 0.38],
            cameraPos: [-0.8, 0.1, 2.0],
            lookAt: [-0.2, -0.05, 0.15],
            description:
              "En el estadio amastigote, el cinetoplasto adopta una geometría de bastón o barra ligeramente curvada adyacente al núcleo esférico y al corto flagelo interno.",
            microscopy:
              "La visualización del cinetoplasto en barra descarta de inmediato Histoplasma capsulatum (que tiene halo claro y gemación sin cinetoplasto) y Toxoplasma gondii.",
            clinical:
              "Fundamental en el diagnóstico de reactivación chagásica en trasplantados cardíacos o pacientes con VIH (chagoma cerebral).",
            threeDNote:
              "Barras rojo-rubí junto a los núcleos violetas dentro de los amastigotes.",
          },
          {
            id: 3,
            name: "Miofibrillas Estriadas Cardíacas Desplazadas y Destruidas",
            shortLabel: "Sarcómeros cardíacos",
            category: "Patogenia de la Miocardiopatía Chagásica",
            colorBio: "#fb7185",
            colorGiemsa: "#e11d48",
            anchor: [-1.05, 0.25, 0.25],
            cameraPos: [-2.0, 0.6, 2.5],
            lookAt: [-0.6, 0.1, 0.0],
            description:
              "Fibra muscular estriada del miocardio (y del sistema excitoconductor de His-Purkinje) cuyas miofibrillas son desplazadas y lisadas por el crecimiento del nido.",
            microscopy:
              "Al romperse el pseudoquiste se desencadena una miocarditis linfomonocitaria difusa con fibrosis reparativa.",
            clinical:
              "En la fase crónica (20–30% de los infectados tras 10–30 años) causa Miocardiopatía Chagásica Dilatada con bloqueo completo de rama derecha + hemibloqueo anterior izquierdo, aneurisma apical del VI y muerte súbita.",
            threeDNote:
              "Cilindro muscular estriado envolviendo la cavidad del nido; seccionable con «Corte Histológico».",
          },
          {
            id: 4,
            name: "Destrucción de Plexos Mientéricos de Auerbach (Megacolon / Megaesófago)",
            shortLabel: "Denervación autonómica",
            category: "Forma Digestiva Crónica",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [1.05, -0.25, 0.25],
            cameraPos: [2.0, -0.3, 2.5],
            lookAt: [0.6, -0.15, 0.0],
            description:
              "En cepas del Cono Sur (TcI / TcII / TcV/VI), la destrucción de neuronas ganglionares parasimpáticas de los plexos de Auerbach en esófago y colon sigmoide produce acalasia chagásica y megacolon.",
            microscopy:
              "Pérdida >80% de las neuronas mientéricas con infiltrado inflamatorio periganglionar.",
            clinical:
              "Causa disfagia progresiva (megaesófago) y constipación crónica severa complicada con vólvulo de sigmoides (megacolon chagásico).",
            threeDNote:
              "Filete nervioso autonómico adyacente al haz muscular.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Epimastigote Replicativo en Intestino de Triatomino (Vinchuca) + Metacíclico",
        shortName: "3. Epimastigote (Vector Vinchuca)",
        subtitle: "Estadio multiplicativo en el intestino medio del vector con cinetoplasto ANTERIOR al núcleo",
        sizeRange: "20 – 30 µm",
        scaleMicrons: 5,
        defaultTranslucency: 55,
        defaultCut: 0,
        defaultMotility: 50,
        defaultCameraPos: [0.15, 0.35, 3.8],
        summary:
          "Cuando el insecto triatomino hematófago (Triatoma infestans «vinchuca», Rhodnius prolixus o Panstrongylus megistus) ingiere sangre con tripomastigotes, estos se transforman en el intestino medio del insecto en EPIMASTIGOTES fusiformes que se multiplican activamente. En el epimastigote, el cinetoplasto se sitúa DELANTE (anterior/yuxtanuclear) del núcleo. Luego, en el recto del insecto se diferencian en tripomastigotes metacíclicos infectantes eliminados en las DEYECCIONES.",
        diagnosticPearl:
          "La transmisión vectorial de T. cruzi NO ocurre por la saliva de la picadura (es transmisión «Estercoraria»): la vinchuca defeca mientras pica y el paciente al rascarse introduce los tripomastigotes metacíclicos de las heces en la herida o en la conjuntiva ocular (Signo de Romaña).",
        regions: [
          {
            id: 1,
            name: "Cinetoplasto Yuxtanuclear ANTERior al Núcleo (Sello del Epimastigote)",
            shortLabel: "Cinetoplasto anterior al núcleo",
            category: "Morfología de Kinetoplástidos",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [-0.28, 0.18, 0.25],
            cameraPos: [-1.0, 0.4, 2.2],
            lookAt: [-0.2, 0.1, 0.05],
            description:
              "Disco de kDNA situado inmediatamente por delante del núcleo central (epi = encima/delante de).",
            microscopy:
              "Diferencia clave frente al tripomastigote (donde el cinetoplasto está en el extremo posterior detrás del núcleo) y al promastigote (donde está en la punta anterior extrema).",
            clinical:
              "El epimastigote es también la forma que crece en medios de cultivo acelulares (LIT / NNN) y en el xenodiagnóstico.",
            threeDNote:
              "Barra discoide rubí situada justo delante del núcleo central.",
          },
          {
            id: 2,
            name: "Núcleo Central Esférico/Ovoide",
            shortLabel: "Núcleo central",
            category: "Núcleo Eucariota",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.18, 0.05, 0.28],
            cameraPos: [0.8, 0.2, 2.2],
            lookAt: [0.1, 0.0, 0.05],
            description:
              "Núcleo activo en mitosis situado en el tercio medio-posterior del huso celular.",
            microscopy:
              "Teñido de violeta en Giemsa inmediatamente detrás del cinetoplasto.",
            clinical:
              "Sostiene la multiplicación indefinida del parásito en el tubo digestivo de la vinchuca durante toda la vida del insecto.",
            threeDNote:
              "Esfera púrpura expuesta al abrir el cuerpo con «Corte Histológico».",
          },
          {
            id: 3,
            name: "Membrana Ondulante Corta Anterior y Flagelo Libre",
            shortLabel: "Membrana ondulante anterior",
            category: "Aparato Flagelar",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [-0.85, 0.38, 0.2],
            cameraPos: [-1.7, 0.7, 2.3],
            lookAt: [-0.6, 0.2, 0.0],
            description:
              "Dado que el cinetoplasto y el cuerpo basal están delante del núcleo, la membrana ondulante recorre únicamente la mitad anterior del cuerpo antes de emerger como flagelo libre.",
            microscopy:
              "Cresta ondulante restringida al segmento prenuclear.",
            clinical:
              "Permite al epimastigote adherirse a las membranas perimicrovellositarias del intestino del triatomino antes de la metaciclogénesis en la ampolla rectal.",
            threeDNote:
              "Aleta dorsal en la mitad izquierda (anterior) del huso.",
          },
          {
            id: 4,
            name: "Cuerpo Fusiforme Rectilíneo y Reservosomas Posteriores",
            shortLabel: "Cuerpo fusiforme y reservosomas",
            category: "Organelos de Reserva",
            colorBio: "#fbbf24",
            colorGiemsa: "#d97706",
            anchor: [0.78, -0.05, 0.22],
            cameraPos: [1.7, 0.1, 2.3],
            lookAt: [0.55, 0.0, 0.0],
            description:
              "En el extremo posterior del epimastigote se acumulan los «reservosomas» ricos en cruzipaína y lípidos que proveen la energía para transformarse en tripomastigote metacíclico.",
            microscopy:
              "Silueta recta y alargada en huso (a diferencia de la forma curva en «C» del tripomastigote sanguíneo).",
            clinical:
              "La transmisión oral por ingestión de jugos de frutas (açaí, caña, guayaba) contaminados con triatominos triturados y sus metacíclicos causa brotes de Chagas agudo grave con miocarditis fulminante.",
            threeDNote:
              "Vesículas doradas en el polo posterior derecho dentro de la película fusiforme.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Diagnóstico en Fase Crónica (Doble Serología IgG) vs Fase Aguda",
        shortName: "4. Metacíclico Infectante / Serología",
        subtitle: "Tripomastigote metacíclico delgado de las heces de la vinchuca (forma infectante para el humano)",
        sizeRange: "17 – 22 µm",
        scaleMicrons: 5,
        defaultTranslucency: 52,
        defaultCut: 0,
        defaultMotility: 60,
        defaultCameraPos: [0.2, 0.35, 3.8],
        summary:
          "En la ampolla rectal del triatomino, el epimastigote se transforma en el TRIPOMASTIGOTE METACÍCLICO: forma delgada, muy móvil y resistente al complemento que constituye la FORMA INFECTANTE para el ser humano (vía vectorial por deyecciones, vía oral alimentaria) junto con los tripomastigotes sanguíneos (vía transplacentaria congénita, transfusional y trasplante). En la fase crónica la parasitemia es submicroscópica, por lo que el diagnóstico se basa en DOS pruebas serológicas IgG de principios distintos (ej. ELISA + IFI o Quimioluminiscencia).",
        diagnosticPearl:
          "Algoritmo diagnóstico MINSAL / OMS: En Fase Aguda y Chagas Congénito (<9 meses de vida) → Parasitológico directo (microhematocrito/Strout) y PCR (porque la IgG materna cruza la placenta). En Fase Crónica (>9 meses y adultos) → Doble serología IgG concordante.",
        regions: [
          {
            id: 1,
            name: "Tripomastigote Metacíclico Delgado (Forma Infectante en Heces del Vector)",
            shortLabel: "Tripomastigote metacíclico",
            category: "Forma Infectante",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [0.0, 0.15, 0.25],
            cameraPos: [0.1, 0.5, 2.3],
            lookAt: [0.0, 0.1, 0.05],
            description:
              "Forma estilizada y sumamente activa que expresa la glicoproteína de superficie gp82 (que resiste la digestión gástrica en la transmisión oral e induce movilización de Ca2+ en la célula huésped).",
            microscopy:
              "Cuerpo sinuoso delgado con cinetoplasto subterminal redondo muy prominente.",
            clinical:
              "Penetra mucosas intactas (conjuntiva ocular causando el complejo oftalmoganglionar o Signo de Romaña: edema bipalpebral unilateral indoloro violáceo con dacrioadenitis y adenopatía preauricular) o excoriaciones cutáneas (chagoma de inoculación).",
            threeDNote:
              "Cuerpo serpentiforme estilizado en «S» con estructuras internas expuestas al corte.",
          },
          {
            id: 2,
            name: "Cinetoplasto Subterminal Posterior",
            shortLabel: "Cinetoplasto posterior",
            category: "Genoma Mitocondrial",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [0.95, -0.35, 0.25],
            cameraPos: [1.8, -0.5, 2.2],
            lookAt: [0.7, -0.25, 0.05],
            description:
              "Tras la metaciclogénesis el cinetoplasto ha migrado nuevamente desde la posición anterior hacia el extremo posterior subterminal.",
            microscopy:
              "Punto rubí subterminal prominente.",
            clinical:
              "Confirma la finalización de la diferenciación infectante en el recto de la vinchuca.",
            threeDNote:
              "Esfera rubí en el segmento caudal.",
          },
          {
            id: 3,
            name: "Cubierta de Glicoproteínas gp82 / gp90 y Mucinas (Antígenos Diagnósticos)",
            shortLabel: "Cubierta antigénica gp82",
            category: "Diana Serológica IgG",
            colorBio: "#fde047",
            colorGiemsa: "#d97706",
            anchor: [-0.75, 0.28, 0.25],
            cameraPos: [-1.6, 0.6, 2.3],
            lookAt: [-0.5, 0.15, 0.05],
            description:
              "Denso glicocálix de mucinas ancladas por GPI y proteínas SAPA / trans-sialidasas.",
            microscopy:
              "Detectado por inmunofluorescencia indirecta (IFI) y ensayos ELISA de antígenos recombinantes.",
            clinical:
              "En toda mujer embarazada procedente o residente en área endémica es obligatorio el tamizaje serológico IgG para detectar y curar precozmente el Chagas congénito en el recién nacido.",
            threeDNote:
              "Halo superficial dorado a lo largo del flagelo y la membrana ondulante.",
          },
          {
            id: 4,
            name: "Núcleo Compacto Reconfigurado",
            shortLabel: "Núcleo compacto",
            category: "Regulación Epigenética",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.05, 0.05, 0.28],
            cameraPos: [0.2, 0.3, 2.1],
            lookAt: [0.0, 0.0, 0.05],
            description:
              "Núcleo con heterocromatina condensada adaptada para la supervivencia extracelular.",
            microscopy:
              "Situado en la curvatura media del cuerpo en «S».",
            clinical:
              "Se descondensa únicamente tras invadir el citoplasma de la célula humana.",
            threeDNote:
              "Núcleo púrpura central.",
          },
        ],
      },
    },
  },
  p14: {
    code: "p14",
    scientificName: "Leishmania donovani / Leishmania infantum",
    commonName: "Leishmaniasis Visceral (Kala-Azar)",
    taxonomyBadge: "P14 · Kinetoplástido Intramacrofágico del Sistema Reticuloendotelial",
    stainLabel: "Tinción Giemsa (Médula / Bazo)",
    stages: {
      stage1: {
        id: "stage1",
        label: "Macrófago Esplénico / Medular con Cuerpos de Leishman-Donovan (Amastigotes)",
        shortName: "1. Amastigotes en Macrófago (LD)",
        subtitle: "Macrófago distendido por decenas de amastigotes ovales (2–4 µm) con «doble punto» (núcleo + cinetoplasto)",
        sizeRange: "Amastigote 2–4 µm · Macrófago 25–40 µm",
        scaleMicrons: 5,
        defaultTranslucency: 50,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.15, 0.4, 3.9],
        summary:
          "En el hospedador humano, Leishmania donovani (Antiguo Mundo) y Leishmania infantum / chagasi (América y Cuenca Mediterránea) son parásitos intracelulares obligados que residen y se multiplican exclusivamente dentro de los FAGOLISOSOMAS de los macrófagos de bazo, hígado (células de Kupffer), médula ósea y ganglios linfáticos. Los amastigotes intracelulares (2–4 µm), llamados clásicamente «Cuerpos de Leishman-Donovan», se identifican en Giemsa por su signo del «DOBLE PUNTO»: un núcleo esférico excéntrico y un cinetoplasto en bastón intensamente teñido.",
        diagnosticPearl:
          "Cuadro clásico de Kala-Azar («fiebre negra»): fiebre prolongada en agujas (a menudo con doble pico diario), ESPLENOMEGALIA masiva gigante, hepatomegalia, hiperpigmentación cutánea, pérdida de peso y PANCITOPENIA (anemia, leucopenia y trombocitopenia) con hipergammaglobulinemia policlonal. Tratamiento de 1.ª línea: Anfotericina B Liposomal.",
        regions: [
          {
            id: 1,
            name: "Cuerpos de Leishman-Donovan (Amastigotes de 2–4 µm con «Doble Punto»)",
            shortLabel: "Cuerpos Leishman-Donovan",
            category: "Forma Diagnóstica en Aspirado",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [0.18, 0.15, 0.35],
            cameraPos: [0.9, 0.4, 2.2],
            lookAt: [0.1, 0.1, 0.1],
            description:
              "Cuerpos ovoides de 2 a 4 µm con citoplasma azul pálido en Giemsa que contienen un núcleo redondo (rojo-púrpura) y un cinetoplasto tangencial en forma de barra corta (rojo rubí oscuro).",
            microscopy:
              "El hallazgo de este binomio «núcleo + cinetoplasto en bastón» dentro de histiocitos de médula ósea o bazo es el estándar de oro parasitológico.",
            clinical:
              "La hiperplasia masiva de macrófagos parasitados produce esplenomegalia gigante e hiperesplenismo con pancitopenia grave y riesgo de hemorragia o sepsis bacteriana.",
            threeDNote:
              "Amastigotes 3D con núcleo y barra de cinetoplasto internos visibles al deslizar «Corte Histológico».",
          },
          {
            id: 2,
            name: "Cinetoplasto en Bastón y Bolsillo Flagelar Interno",
            shortLabel: "Cinetoplasto en bastón",
            category: "Diferenciación frente a Histoplasma",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [0.35, -0.12, 0.38],
            cameraPos: [1.1, -0.2, 2.0],
            lookAt: [0.25, -0.1, 0.15],
            description:
              "Estructura mitocondrial de kDNA en forma de barra asociada a un rudimento flagelar corto que no sobresale de la superficie celular.",
            microscopy:
              "Permite distinguir con certeza Leishmania de Histoplasma capsulatum (levadura de 2–4 µm que también llena macrófagos medulares y esplénicos pero CARECE de cinetoplasto y se tiñe con Grocott/PAS).",
            clinical:
              "El kDNA es amplificado por PCR en sangre periférica o aspirado medular con sensibilidad >95%.",
            threeDNote:
              "Bastones rubí internos dentro de cada amastigote.",
          },
          {
            id: 3,
            name: "Vacuola Parasitófora Fagolisosomal Acidificada (pH 4.5–5.0)",
            shortLabel: "Fagolisosoma",
            category: "Supervivencia Intramacrofágica",
            colorBio: "#38bdf8",
            colorGiemsa: "#6366f1",
            anchor: [0.22, 0.55, 0.3],
            cameraPos: [1.1, 1.0, 2.4],
            lookAt: [0.15, 0.3, 0.05],
            description:
              "A diferencia de Toxoplasma (que evita la fusión lisosomal) y T. cruzi (que escapa al citosol), Leishmania SOBREVIVE y se multiplica DENTRO del fagolisosoma fusionado ácido.",
            microscopy:
              "Gran vacuola clara que desplaza el núcleo del macrófago hacia la periferia.",
            clinical:
              "El amastigote resiste las hidrolasas ácidas y el estallido oxidativo gracias a su metaloproteasa gp63, lipofosfoglicano (LPG) y tripanotión reductasa.",
            threeDNote:
              "Cámara vacuolar translúcida dentro del macrófago.",
          },
          {
            id: 4,
            name: "Núcleo Desplazado y Membrana del Macrófago Esplénico / Medular",
            shortLabel: "Macrófago huésped",
            category: "Sistema Reticuloendotelial",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.72, -0.15, 0.25],
            cameraPos: [-1.6, -0.2, 2.4],
            lookAt: [-0.45, -0.1, 0.05],
            description:
              "Histiocito tisular del bazo, médula ósea o hígado (célula de Kupffer).",
            microscopy:
              "El aspirado de médula ósea (cresta ilíaca/esternón) tiene una sensibilidad del 70–85% y es mucho más seguro que la punción esplénica (95% de sensibilidad pero riesgo de hemorragia letal si hay trombocitopenia).",
            clinical:
              "La Anfotericina B Liposomal es captada selectivamente por estos mismos macrófagos del sistema reticuloendotelial, alcanzando concentraciones terapéuticas máximas justo donde reside el parásito.",
            threeDNote:
              "Núcleo reniforme izquierdo y membrana externa del macrófago seccionable en 3D.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Promastigote Metacíclico Flagelado (15–20 µm) — Vector Flebótomo y Cultivo",
        shortName: "2. Promastigote (Vector / Cultivo)",
        subtitle: "Forma fusiforme móvil con cinetoplasto ANTERIOR extremo y largo flagelo libre anterior (sin membrana ondulante)",
        sizeRange: "15 – 20 × 1.5 – 3.5 µm (flagelo 15–20 µm)",
        scaleMicrons: 5,
        defaultTranslucency: 54,
        defaultCut: 0,
        defaultMotility: 55,
        defaultCameraPos: [0.2, 0.35, 3.8],
        summary:
          "En el tubo digestivo de la hembra del flebótomo vector (género Lutzomyia en América, género Phlebotomus en Europa/Asia/África) y en los medios de cultivo a 25 °C (NNN, Schneider), Leishmania adopta la forma de PROMASTIGOTE: célula fusiforme alargada cuyo cinetoplasto se ubica en el extremo ANTERIOR (delante del núcleo), de donde emerge un largo flagelo libre anterior SIN membrana ondulante. Es la forma INFECTANTE inoculada en la piel por la picadura del flebótomo.",
        diagnosticPearl:
          "En Leishmania infantum (América Latina y Mediterráneo), el PERRO doméstico es el principal reservorio urbano y periurbano. El promastigote es la forma infectante inoculada por el flebótomo; el amastigote es la única forma presente en los tejidos humanos.",
        regions: [
          {
            id: 1,
            name: "Flagelo Libre Anterior Largo (Sin Membrana Ondulante)",
            shortLabel: "Flagelo anterior libre",
            category: "Morfología Promastigote",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [-1.35, 0.25, 0.15],
            cameraPos: [-2.2, 0.6, 2.3],
            lookAt: [-0.9, 0.1, 0.0],
            description:
              "Flagelo único tan largo como el propio cuerpo celular que emerge directamente por la punta anterior y tracciona al parásito hacia adelante.",
            microscopy:
              "Carece por completo de membrana ondulante (lo que lo distingue inmediatamente de los epimastigotes y tripomastigotes de Trypanosoma).",
            clinical:
              "Permite al promastigote metacíclico migrar hacia la válvula estomodeal y probóscide del flebótomo para ser regurgitado durante la picadura.",
            threeDNote:
              "Látigo flagelar emergiendo del bolsillo flagelar en el polo izquierdo (anterior).",
          },
          {
            id: 2,
            name: "Cinetoplasto Anterior Extremo (kDNA)",
            shortLabel: "Cinetoplasto anterior",
            category: "Criterio Taxonómico (Pro = Delante)",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [-0.65, 0.05, 0.25],
            cameraPos: [-1.4, 0.3, 2.1],
            lookAt: [-0.55, 0.0, 0.05],
            description:
              "Bastón de ADN mitocondrial situado en el tercio anterior del cuerpo, muy cerca de la base del flagelo y lejos del núcleo central.",
            microscopy:
              "Se tiñe de rojo rubí oscuro en Giemsa en la proa del huso celular.",
            clinical:
              "Define morfológicamente al estadio promastigote en cultivos diagnósticos de aspirado medular o biopsia sembrados en medio NNN (Novy-MacNeal-Nicolle).",
            threeDNote:
              "Barra rubí anterior expuesta al deslizar «Corte Histológico».",
          },
          {
            id: 3,
            name: "Núcleo Central Ovoide",
            shortLabel: "Núcleo central",
            category: "Núcleo Eucariota",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.05, 0.02, 0.28],
            cameraPos: [0.3, 0.3, 2.1],
            lookAt: [0.0, 0.0, 0.05],
            description:
              "Núcleo vesicular situado en la región ecuatorial del cuerpo fusiforme.",
            microscopy:
              "Coloración púrpura en Giemsa.",
            clinical:
              "Al ingresar al macrófago humano a 37 °C y pH 5.0, reprograma su expresión génica en pocas horas para retraer el flagelo y convertirse en amastigote.",
            threeDNote:
              "Elipsoide púrpura en el centro del huso.",
          },
          {
            id: 4,
            name: "Glicocálix de Lipofosfoglicano (LPG) y Metaloproteasa gp63 (Leishmanolisina)",
            shortLabel: "Cubierta LPG y gp63",
            category: "Evasión del Complemento y Opsonización",
            colorBio: "#fde047",
            colorGiemsa: "#d97706",
            anchor: [0.68, 0.15, 0.25],
            cameraPos: [1.5, 0.4, 2.3],
            lookAt: [0.45, 0.05, 0.0],
            description:
              "La metaloproteasa de zinc gp63 cliva el componente C3b del complemento convirtiéndolo en iC3b inactivo.",
            microscopy:
              "Al quedar recubierto de iC3b sin lisarse, el promastigote se une a los receptores CR1/CR3 del macrófago para entrar silenciosamente sin disparar el estallido respiratorio.",
            clinical:
              "Clásico ejemplo de «opsonización silenciosa» explotada por un parásito intracelular.",
            threeDNote:
              "Película fusiforme dorada que envuelve el cuerpo celular.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Roseta de Promastigotes en Cultivo NNN (Flagelos Convergentes)",
        shortName: "3. Roseta en Cultivo NNN",
        subtitle: "Agrupación radial característica en cultivos diagnósticos con los flagelos entrelazados en el centro",
        sizeRange: "Roseta 25–40 µm",
        scaleMicrons: 10,
        defaultTranslucency: 52,
        defaultCut: 0,
        defaultMotility: 45,
        defaultCameraPos: [0.15, 0.4, 4.0],
        summary:
          "Cuando se inocula un aspirado de médula ósea o biopsia esplénica en medio bifásico NNN (agar sangre de conejo) a 24–26 °C, los amastigotes se transforman en promastigotes que al multiplicarse por fisión longitudinal forman características «ROSETAS» estrelladas con todos sus flagelos dirigidos y entrelazados hacia el centro común.",
        diagnosticPearl:
          "En las rosetas de promastigotes de Leishmania en cultivo, los polos ANTERIORES flagelados apuntan hacia el centro de la estrella; en las rosetas de taquizoítos de Toxoplasma dentro de la célula, los polos apicales apuntan hacia afuera.",
        regions: [
          {
            id: 1,
            name: "Centro de Flagelos Entrelazados de la Roseta",
            shortLabel: "Núcleo de flagelos",
            category: "Agregación en Cultivo",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [0.0, 0.0, 0.3],
            cameraPos: [0.1, 0.2, 2.2],
            lookAt: [0.0, 0.0, 0.05],
            description:
              "Punto central donde convergen y se entrelazan los flagelos anteriores de 6 a 12 promastigotes en multiplicación clonal.",
            microscopy:
              "Imagen en «rueda de fuegos artificiales» o estrella móvil en el líquido de condensación del tubo NNN a los 5–14 días de incubación.",
            clinical:
              "Confirma la viabilidad parasitaria y permite aislar la cepa para tipificación de especie e isoenzimas.",
            threeDNote:
              "Penacho central de filamentos cian convergentes.",
          },
          {
            id: 2,
            name: "Cuerpos Fusiformes de Promastigotes Radiantes",
            shortLabel: "Promastigotes radiales",
            category: "Multiplicación Clonal",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [0.75, 0.45, 0.25],
            cameraPos: [1.7, 0.8, 2.4],
            lookAt: [0.45, 0.25, 0.0],
            description:
              "Cuerpos fusiformes orientados radialmente con sus polos posteriores hacia la periferia.",
            microscopy:
              "Cada individuo muestra su cinetoplasto próximo al centro flagelar y su núcleo a mitad del cuerpo.",
            clinical:
              "El cultivo aumenta la sensibilidad diagnóstica en pacientes coinfectados con VIH.",
            threeDNote:
              "Ocho promastigotes 3D dispuestos en estrella tridimensional.",
          },
          {
            id: 3,
            name: "Anillo de Cinetoplastos Anteriores",
            shortLabel: "Cinetoplastos en corona",
            category: "Organelos Internos",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [-0.38, 0.22, 0.28],
            cameraPos: [-1.1, 0.5, 2.2],
            lookAt: [-0.25, 0.15, 0.05],
            description:
              "Al estar todos los polos anteriores orientados hacia el centro, los cinetoplastos forman una corona concéntrica interna alrededor del nudo flagelar.",
            microscopy:
              "En Giemsa destaca como un círculo de puntos rubí rodeando el centro de la roseta.",
            clinical:
              "Sello citológico inconfundible en frotis de cultivo.",
            threeDNote:
              "Corona de barras rubí internas expuesta al activar «Corte Histológico».",
          },
          {
            id: 4,
            name: "Núcleos Eucariotas en Corona Externa",
            shortLabel: "Núcleos periféricos",
            category: "Organelos Internos",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.72, -0.35, 0.25],
            cameraPos: [-1.6, -0.5, 2.3],
            lookAt: [-0.45, -0.2, 0.0],
            description:
              "Núcleos centrales de cada promastigote formando un segundo anillo más externo.",
            microscopy:
              "Teñidos de violeta en Giemsa.",
            clinical:
              "Demuestra la polaridad constante de la organización celular kinetoplástida.",
            threeDNote:
              "Esferas púrpuras en la mitad de cada radio de la roseta.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Frotis de Aspirado de Médula Ósea + Antígeno rK39 (Kala-Azar)",
        shortName: "4. Frotis Medular / rK39",
        subtitle: "Amastigotes intra y extracelulares liberados de un macrófago roto junto a eritrocitos y plasmocitos",
        sizeRange: "Amastigotes 2–4 µm · Eritrocito 7.5 µm",
        scaleMicrons: 5,
        defaultTranslucency: 48,
        defaultCut: 0,
        defaultMotility: 20,
        defaultCameraPos: [0.1, 0.45, 4.0],
        summary:
          "En los extendidos de aspirado de médula ósea o bazo teñidos con Giemsa es muy frecuente que al realizar el frotis algunos macrófagos hiperdistendidos se rompan mecánicamente, esparciendo decenas de cuerpos de Leishman-Donovan libres alrededor del núcleo desnudo del macrófago junto a células plasmáticas productoras de IgG (responsables de la positividad del test inmunocromatográfico rápido rK39).",
        diagnosticPearl:
          "La prueba rápida inmunocromatográfica de anticuerpos anti-rK39 (antígeno kinesina recombinante de 39 aminoácidos) en suero tiene >90–95% de sensibilidad y especificidad para Leishmaniasis Visceral activa en inmunocompetentes.",
        regions: [
          {
            id: 1,
            name: "Enjambre de Amastigotes Libres con Núcleo + Cinetoplasto («Doble Punto»)",
            shortLabel: "Amastigotes extracelulares",
            category: "Frotis de Médula Ósea",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [-0.25, 0.18, 0.3],
            cameraPos: [-0.9, 0.5, 2.2],
            lookAt: [-0.15, 0.1, 0.05],
            description:
              "Amastigotes ovoides de 2–4 µm liberados al extender el aspirado medular sobre el portaobjetos.",
            microscopy:
              "En los amastigotes extracelulares se aprecia con máxima nitidez el citoplasma azul claro, el núcleo púrpura y el cinetoplasto en bastón oscuro.",
            clinical:
              "Siempre deben confirmarse identificando claramente ambos elementos (núcleo y cinetoplasto) para no confundirlos con plaquetas sobrepuestas.",
            threeDNote:
              "Ocho amastigotes 3D con doble estructura interna expuesta al corte.",
          },
          {
            id: 2,
            name: "Núcleo del Histiocito Medular Roto",
            shortLabel: "Núcleo histiocitario",
            category: "Referencia Celular",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.85, 0.05, 0.2],
            cameraPos: [-1.7, 0.3, 2.4],
            lookAt: [-0.6, 0.0, 0.0],
            description:
              "Gran núcleo esponjoso del macrófago medular rodeado de restos de su citoplasma desgarrado.",
            microscopy:
              "Los amastigotes suelen encontrarse agrupados como un halo inmediato alrededor de este núcleo.",
            clinical:
              "Indica alta carga parasitaria medular.",
            threeDNote:
              "Esfera nuclear violeta a la izquierda del campo.",
          },
          {
            id: 3,
            name: "Célula Plasmática (Hipergammaglobulinemia Policlonal y Test rK39+)",
            shortLabel: "Plasmocito (IgG / rK39+)",
            category: "Correlación Inmunológica",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [0.75, 0.25, 0.25],
            cameraPos: [1.6, 0.6, 2.4],
            lookAt: [0.5, 0.15, 0.0],
            description:
              "Plasmocito con núcleo excéntrico en «rueda de carro» y halo perinuclear claro de Golgi que secreta cantidades masivas de IgG no protectora.",
            microscopy:
              "Plasmocitosis medular reactiva marcada (>10%) típica del Kala-Azar.",
            clinical:
              "Produce inversión del cociente albúmina/globulina y positividad de los anticuerpos anti-rK39.",
            threeDNote:
              "Célula ovoide azul a la derecha con núcleo excéntrico interno.",
          },
          {
            id: 4,
            name: "Eritrocito de Referencia (Anemia Normocítica del Kala-Azar)",
            shortLabel: "Eritrocito (7.5 µm)",
            category: "Escala Morfométrica",
            colorBio: "#ef4444",
            colorGiemsa: "#e11d48",
            anchor: [0.35, -0.42, 0.2],
            cameraPos: [1.1, -0.6, 2.3],
            lookAt: [0.25, -0.3, 0.0],
            description:
              "Glóbulo rojo de 7.5 µm que permite comprobar que cada amastigote mide apenas un tercio a la mitad del diámetro de un eritrocito.",
            microscopy:
              "Referencia interna obligatoria de tamaño en hematopatología.",
            clinical:
              "Tras la curación del Kala-Azar por L. donovani, un 5–15% de los pacientes pueden desarrollar meses después la Leishmaniasis Dérmica Post-Kala-Azar (PKDL), que actúa como reservorio humano.",
            threeDNote:
              "Disco bicóncavo rojo en la parte inferior derecha.",
          },
        ],
      },
    },
  },
  p15: {
    code: "p15",
    scientificName: "Leishmania (Viannia) braziliensis",
    commonName: "Leishmaniasis Cutánea y Mucocutánea Americana («Espundia»)",
    taxonomyBadge: "P15 · Kinetoplástido Subgénero Viannia (Peripylaria)",
    stainLabel: "Tinción Giemsa / Biopsia H&E",
    stages: {
      stage1: {
        id: "stage1",
        label: "Úlcera Cutánea Indurada («en Sacabocados») con Macrófagos Dérmicos",
        shortName: "1. Úlcera Cutánea y Amastigotes",
        subtitle: "Borde sobreelevado indurado («en cráter») donde se toma el raspado/biopsia con amastigotes intrahistiocitarios",
        sizeRange: "Úlcera 1–5 cm · Amastigotes 2–4 µm",
        scaleMicrons: 10,
        defaultTranslucency: 48,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.15, 0.45, 4.1],
        summary:
          "Leishmania (Viannia) braziliensis es el principal agente de la Leishmaniasis Cutánea y Mucocutánea en Sudamérica y Centroamérica. Tras la picadura del flebótomo Lutzomyia en zonas selváticas o cafeteras, se forma una pápula que se ulcera dando lugar a una ÚLCERA INDOLORA redondeada con bordes gruesos sobreelevados e indurados («en cráter o sacabocados») y fondo granulomatoso limpio. La muestra diagnóstica SIEMPRE debe tomarse del BORDE activo indurado (nunca del centro necrótico).",
        diagnosticPearl:
          "Regla de toma de muestra en Leishmaniasis Cutánea: Realizar raspado dérmico, aspirado con aguja fina o biopsia punch en el BORDE INDURADO ACTIVO de la úlcera (libre de sobreinfección bacteriana), donde residen los macrófagos dérmicos con amastigotes.",
        regions: [
          {
            id: 1,
            name: "Borde Sobreelevado Indurado («en Cráter», Sitio de Toma de Muestra)",
            shortLabel: "Borde indurado activo",
            category: "Semiología Dermatológica",
            colorBio: "#f472b6",
            colorGiemsa: "#db2777",
            anchor: [-0.88, 0.45, 0.3],
            cameraPos: [-1.8, 0.9, 2.5],
            lookAt: [-0.5, 0.25, 0.05],
            description:
              "Rodete epidérmico y dérmico violáceo infiltrado por linfocitos, células plasmáticas y macrófagos parasitados, con hiperplasia pseudoepiteliomatosa.",
            microscopy:
              "Zona de mayor rendimiento diagnóstico para el frotis directo con Giemsa, cultivo y PCR del subgénero Viannia.",
            clinical:
              "Puede acompañarse de linfangitis nodular ascendente regional (que simula esporotricosis) e indolora.",
            threeDNote:
              "Anillo periférico elevado que enmarca el lecho ulceroso; seccionable en 3D.",
          },
          {
            id: 2,
            name: "Macrófagos Dérmicos con Amastigotes de L. (Viannia) braziliensis",
            shortLabel: "Amastigotes dérmicos",
            category: "Diagnóstico Parasitológico",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [-0.62, -0.05, 0.35],
            cameraPos: [-1.4, 0.1, 2.2],
            lookAt: [-0.5, -0.05, 0.1],
            description:
              "Histiocitos en la dermis papilar y reticular del borde ulceroso que contienen amastigotes ovoides de 2–4 µm con núcleo y cinetoplasto en bastón.",
            microscopy:
              "En L. braziliensis la carga parasitaria suele ser menor (pauciparasitaria) que en L. mexicana o L. amazonensis, por lo que la PCR (kDNA / hsp70) es fundamental cuando el frotis directo es negativo.",
            clinical:
              "A diferencia de las especies del Viejo Mundo, las lesiones por L. braziliensis requieren SIEMPRE tratamiento sistémico para prevenir la diseminación mucosa tardía.",
            threeDNote:
              "Macrófagos en la pared del cráter con amastigotes 3D visibles al deslizar «Corte Histológico».",
          },
          {
            id: 3,
            name: "Fondo Granulomatoso Limpio de la Úlcera (Cráter Central)",
            shortLabel: "Fondo granulomatoso",
            category: "Morfología de la Lesión",
            colorBio: "#ef4444",
            colorGiemsa: "#be123c",
            anchor: [0.0, -0.25, 0.3],
            cameraPos: [0.1, 0.1, 2.4],
            lookAt: [0.0, -0.2, 0.05],
            description:
              "Base de tejido de granulación rojizo, habitualmente indolora y sin pus franco salvo sobreinfección bacteriana secundaria.",
            microscopy:
              "Rica en fibrina y neutrófilos superficiales, pero pobre en amastigotes intactos (por eso no se debe tomar el frotis del centro).",
            clinical:
              "Si cicatriza espontáneamente tras meses, deja una cicatriz atrófica deprimida «en papel de cigarrillo» con bordes hiperpigmentados.",
            threeDNote:
              "Depresión cóncava central rojiza.",
          },
          {
            id: 4,
            name: "Endosimbionte Leishmaniavirus (LRV1) y Diseminación Linfática/Hemática",
            shortLabel: "Diseminación mucosa (LRV1)",
            category: "Factor de Riesgo de Espundia",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [0.82, -0.35, 0.25],
            cameraPos: [1.7, -0.4, 2.4],
            lookAt: [0.55, -0.25, 0.0],
            description:
              "Muchas cepas de L. (Viannia) braziliensis y L. guyanensis albergan el virus de ARN bicatenario Leishmaniavirus 1 (LRV1), que estimula TLR3 y promueve la metástasis de macrófagos infectados hacia la mucosa nasofaríngea.",
            microscopy:
              "Vía linfática y hematógena temprana hacia el cartílago septal nasal.",
            clinical:
              "Explica por qué entre el 2% y el 10% de los pacientes desarrollan Leishmaniasis Mucocutánea («Espundia») meses o hasta décadas después de haber cicatrizado la úlcera cutánea inicial.",
            threeDNote:
              "Vaso linfático basal en la dermis profunda.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Leishmaniasis Mucocutánea («Espundia») — Destrucción del Tabique Nasal",
        shortName: "2. Espundia (Mucocutánea)",
        subtitle: "Granuloma necrotizante de mucosa y cartílago septal nasal («nariz de tapir») con escasos amastigotes",
        sizeRange: "Granuloma mucoso · Amastigotes 2–4 µm",
        scaleMicrons: 50,
        defaultTranslucency: 46,
        defaultCut: 0,
        defaultMotility: 20,
        defaultCameraPos: [0.15, 0.45, 4.1],
        summary:
          "La Leishmaniasis Mucocutánea («Espundia») es la complicación metastásica destructiva característica de Leishmania (Viannia) braziliensis. Meses o años después de la lesión cutánea, los amastigotes latentes en la mucosa nasal desencadenan una reacción inflamatoria hiperérgica mediada por TNF-α e IFN-γ que perfora y destruye el tabique nasal cartilaginoso (hundiéndose la punta nasal: «nariz de tapir o de camello»), el paladar blando («cruz de la espundia»), la faringe y la laringe.",
        diagnosticPearl:
          "En la Espundia existe una paradoja inmunoparasitológica: la reacción inflamatoria destructiva es ENORME (intradermorreacción de Montenegro intensamente positiva), pero la cantidad de amastigotes en el tejido es MUY ESCASA, por lo que el diagnóstico requiere biopsia mucosa con PCR para subgénero Viannia.",
        regions: [
          {
            id: 1,
            name: "Cartílago Hialino del Tabique Nasal con Perforación y Pericondritis",
            shortLabel: "Perforación del tabique",
            category: "Secuela Anatomoclínica",
            colorBio: "#67e8f9",
            colorGiemsa: "#0284c7",
            anchor: [0.0, 0.15, 0.3],
            cameraPos: [0.1, 0.5, 2.4],
            lookAt: [0.0, 0.1, 0.05],
            description:
              "Lámina de cartílago septal nasal erosionada y perforada por la necrosis granulomatosa de la mucosa respiratoria suprayacente (respetando los huesos propios de la nariz).",
            microscopy:
              "Condrólisis inflamatoria rodeada de tejido de granulación hiperplásico.",
            clinical:
              "Comienza con congestión nasal crónica, epistaxis y costras, evolucionando a perforación septal, caída de la columela («nariz de tapir»), disfonía y disfagia con riesgo de broncoaspiración.",
            threeDNote:
              "Placa cartilaginosa central azul-hialina con perforación fenestrada.",
          },
          {
            id: 2,
            name: "Granuloma Hiperérgico Linfoplasmocitario e Histiocitario (TNF-α alto)",
            shortLabel: "Granuloma mucoso",
            category: "Inmunopatología Th1/Th17",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.75, 0.25, 0.35],
            cameraPos: [-1.6, 0.6, 2.4],
            lookAt: [-0.45, 0.15, 0.05],
            description:
              "Infiltrado denso de linfocitos T CD4+/CD8+ productores de TNF-α e IFN-γ, células plasmáticas, histiocitos epitelioides y necrosis fibrinoide.",
            microscopy:
              "Aspecto polipoide o vegetante en el paladar («cruz palatina de Escomel») y tabique nasal.",
            clinical:
              "Exige diagnóstico diferencial con paracoccidioidomicosis, rinoescleroma, lepra lepromatosa, granulomatosis con poliangeítis y linfoma NK/T nasal.",
            threeDNote:
              "Masas nodulares granulomatosas flanqueando el cartílago septal.",
          },
          {
            id: 3,
            name: "Amastigotes Pauciparasitarios Intracelulares (Diana de PCR Viannia)",
            shortLabel: "Amastigotes escasos (PCR+)",
            category: "Confirmación Etiológica",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [-0.62, 0.12, 0.35],
            cameraPos: [-1.3, 0.3, 2.1],
            lookAt: [-0.5, 0.1, 0.1],
            description:
              "Escasos amastigotes de 2–4 µm con núcleo y cinetoplasto en barra alojados en el interior de los histiocitos profundos del granuloma.",
            microscopy:
              "El frotis directo de mucosa tiene baja sensibilidad (<30%); la PCR de biopsia mucosa para kDNA de Viannia alcanza >90% de sensibilidad.",
            clinical:
              "Tratamiento de la forma mucocutánea: Anfotericina B Liposomal (de elección) o antimoniales pentavalentes (antimoniato de meglumina / estibogluconato sódico) + pentoxifilina o miltefosina según guía regional.",
            threeDNote:
              "Amastigotes 3D revelados en el interior del granuloma al activar «Corte Histológico».",
          },
          {
            id: 4,
            name: "Células Gigantes Multinucleadas de Langhans",
            shortLabel: "Células de Langhans",
            category: "Arquitectura Granulomatosa",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.75, -0.15, 0.3],
            cameraPos: [1.6, -0.2, 2.4],
            lookAt: [0.5, -0.1, 0.05],
            description:
              "Grandes células sincitiales con núcleos dispuestos en herradura periférica formadas por la fusión de macrófagos activados.",
            microscopy:
              "Típicas de la respuesta crónica de hipersensibilidad retardada (Tipo IV).",
            clinical:
              "Reflejan la incapacidad del huésped para erradicar completamente los últimos amastigotes pese a una respuesta celular exacerbada.",
            threeDNote:
              "Célula gigante derecha con corona interna de núcleos púrpuras.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Promastigote Peripilaria (Subgénero Viannia) en Intestino Posterior de Lutzomyia",
        shortName: "3. Promastigote (Subgénero Viannia)",
        subtitle: "Desarrollo exclusivo en el intestino posterior (píloro/íleon) del flebótomo antes de migrar a la probóscide",
        sizeRange: "14 – 20 µm",
        scaleMicrons: 5,
        defaultTranslucency: 55,
        defaultCut: 0,
        defaultMotility: 55,
        defaultCameraPos: [0.2, 0.35, 3.8],
        summary:
          "El criterio taxonómico biológico que define al subgénero Viannia (L. braziliensis, L. panamensis, L. guyanensis, L. peruviana) frente al subgénero Leishmania (L. mexicana, L. amazonensis, L. donovani, L. infantum) es su comportamiento en el vector Lutzomyia: las especies del subgénero Viannia son PERIPILARIAS (se adhieren y multiplican primero en el intestino posterior —triángulo pilórico e íleon— antes de migrar hacia adelante), mientras que el subgénero Leishmania es Suprapilaria.",
        diagnosticPearl:
          "Clasificación de Lainson & Shaw: Subgénero Viannia = Peripylaria (desarrollo en intestino posterior + medio del flebótomo, exclusivo del Nuevo Mundo y con riesgo de leishmaniasis mucocutánea); Subgénero Leishmania = Suprapylaria (solo en intestino medio y anterior).",
        regions: [
          {
            id: 1,
            name: "Flagelo Anterior con Hemidesmosomas de Anclaje al Epitelio Pilórico",
            shortLabel: "Flagelo de anclaje pilórico",
            category: "Biología Peripilaria (Viannia)",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [-1.25, 0.25, 0.2],
            cameraPos: [-2.1, 0.6, 2.3],
            lookAt: [-0.8, 0.15, 0.0],
            description:
              "El flagelo del promastigote de L. (V.) braziliensis forma uniones tipo hemidesmosoma con la cutícula del triángulo pilórico (intestino posterior) de la hembra de Lutzomyia.",
            microscopy:
              "Estadio paramastigote y promastigote nectomonado adherido a la pared intestinal del vector.",
            clinical:
              "Tras desprenderse, migra hacia el intestino anterior convirtiéndose en promastigote metacíclico infectante.",
            threeDNote:
              "Flagelo anterior anclado a una placa cuticular pilórica.",
          },
          {
            id: 2,
            name: "Cinetoplasto Anterior Rico en Minicírculos Específicos de Viannia",
            shortLabel: "Cinetoplasto (kDNA Viannia)",
            category: "Diana Molecular PCR",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [-0.55, 0.08, 0.25],
            cameraPos: [-1.3, 0.3, 2.1],
            lookAt: [-0.45, 0.05, 0.05],
            description:
              "Red de ADN de cinetoplasto cuyas secuencias conservadas permiten diferenciar en pocas horas el subgénero Viannia del subgénero Leishmania mediante PCR.",
            microscopy:
              "Barra intensamente basófila/rubí en el polo anterior.",
            clinical:
              "Identificar que el paciente está infectado por una especie del subgénero Viannia obliga a seguimiento otorrinolaringológico de la mucosa nasal.",
            threeDNote:
              "Disco rubí anterior expuesto en sección 3D.",
          },
          {
            id: 3,
            name: "Núcleo Central y Cuerpo Fusiforme Estilizado",
            shortLabel: "Núcleo y cuerpo fusiforme",
            category: "Morfología Promastigote",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.15, 0.05, 0.28],
            cameraPos: [0.6, 0.3, 2.1],
            lookAt: [0.1, 0.0, 0.05],
            description:
              "Cuerpo alargado de 15–20 µm con núcleo central.",
            microscopy:
              "Indistinguible al microscopio óptico de otras especies de Leishmania (requiere PCR, MALDI-TOF o anticuerpos monoclonales para definir especie).",
            clinical:
              "Crece de forma más lenta y exigente en cultivo in vitro que L. mexicana o L. major.",
            threeDNote:
              "Núcleo central púrpura dentro de la película fusiforme.",
          },
          {
            id: 4,
            name: "Partículas Virales Intracitoplasmáticas de Leishmaniavirus (LRV1)",
            shortLabel: "Cápsides de LRV1",
            category: "Endosimbionte Viral de Virulencia",
            colorBio: "#4ade80",
            colorGiemsa: "#16a34a",
            anchor: [0.65, -0.05, 0.25],
            cameraPos: [1.5, 0.1, 2.2],
            lookAt: [0.45, -0.05, 0.05],
            description:
              "Totivirus icosaédrico de ARN de doble cadena (LRV1) presente en el citoplasma de cepas amazónicas y andinas de L. braziliensis y L. guyanensis.",
            microscopy:
              "Partículas virales de 32–40 nm en el citosol posterior.",
            clinical:
              "Se asocia con mayor tasa de fracaso terapéutico a los antimoniales pentavalentes y mayor incidencia de metástasis mucocutánea.",
            threeDNote:
              "Esférulas verdes esmeralda en el tercio posterior del promastigote.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Frotis por Impronta / Raspado del Borde de la Úlcera (Giemsa)",
        shortName: "4. Impronta de Borde Ulceroso",
        subtitle: "Macrófago tisular con vacuola parasitófora y amastigotes periféricos con núcleo + cinetoplasto",
        sizeRange: "Amastigotes 2.5 × 1.8 µm",
        scaleMicrons: 5,
        defaultTranslucency: 52,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.15, 0.4, 3.8],
        summary:
          "En el frotis por impronta (aposición de biopsia sobre portaobjetos) o raspado con bisturí del borde de la úlcera cutánea teñido con Giemsa, los amastigotes de Leishmania braziliensis suelen disponerse adosados a la periferia interna de la vacuola parasitófora del macrófago dérmico, mostrando claramente su núcleo redondo y su cinetoplasto en bastón perpendicular.",
        diagnosticPearl:
          "La Intradermorreacción de Montenegro (leishmanina) mide la hipersensibilidad celular retardada (positiva ≥5 mm a las 48–72 h): es POSITIVA en la leishmaniasis cutánea localizada y mucocutánea (espundia), pero es NEGATIVA en la leishmaniasis cutánea difusa anérgica y durante el Kala-Azar activo.",
        regions: [
          {
            id: 1,
            name: "Amastigotes Adosados al Borde de la Vacuola Parasitófora",
            shortLabel: "Amastigotes periféricos",
            category: "Citología Diagnóstica",
            colorBio: "#fde047",
            colorGiemsa: "#a855f7",
            anchor: [0.25, 0.25, 0.35],
            cameraPos: [1.0, 0.6, 2.2],
            lookAt: [0.15, 0.15, 0.1],
            description:
              "Amastigotes ovoides de 2.5 µm alineados contra la membrana interna de la vacuola del macrófago.",
            microscopy:
              "Cada uno exhibe su citoplasma celeste, núcleo violáceo y barra de cinetoplasto más oscura.",
            clinical:
              "Su visualización confirma el diagnóstico en atención primaria en menos de 1 hora.",
            threeDNote:
              "Anillo de amastigotes 3D con núcleo y cinetoplasto internos dentro de la vacuola.",
          },
          {
            id: 2,
            name: "Cinetoplasto Perpendicular al Núcleo",
            shortLabel: "Cinetoplasto y núcleo",
            category: "Sello Microscópico",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [0.42, -0.15, 0.35],
            cameraPos: [1.2, -0.3, 2.1],
            lookAt: [0.3, -0.1, 0.1],
            description:
              "El cinetoplasto en bastón se dispone frecuentemente en ángulo recto o tangencial respecto al núcleo esférico.",
            microscopy:
              "Requiere objetivo de inmersión 100× para su identificación inequívoca.",
            clinical:
              "Diferencia la leishmaniasis cutánea de la esporotricosis (cuerpos en cigarro de Sporothrix schenckii sin cinetoplasto) y la cromoblastomicosis (células fumagoides).",
            threeDNote:
              "Barras rubí junto a las esferas nucleares dentro de cada amastigote.",
          },
          {
            id: 3,
            name: "Núcleo del Macrófago Dérmico",
            shortLabel: "Núcleo del macrófago",
            category: "Célula Huésped",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.65, -0.12, 0.25],
            cameraPos: [-1.5, -0.2, 2.3],
            lookAt: [-0.45, -0.1, 0.05],
            description:
              "Núcleo monocítico-macrofágico desplazado lateralmente por la vacuola.",
            microscopy:
              "Cromatina reticular violácea en Giemsa.",
            clinical:
              "La activación del macrófago por IFN-γ de los linfocitos Th1 induce la óxido nítrico sintasa inducible (iNOS) necesaria para destruir a los amastigotes.",
            threeDNote:
              "Masa reniforme púrpura a la izquierda.",
          },
          {
            id: 4,
            name: "Linfocito T CD4+ Th1 Efector Adyacente",
            shortLabel: "Linfocito Th1 (IFN-γ)",
            category: "Inmunidad Celular (Montenegro+)",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [0.95, -0.38, 0.25],
            cameraPos: [1.9, -0.5, 2.4],
            lookAt: [0.65, -0.25, 0.0],
            description:
              "Linfocito pequeño de núcleo redondo denso y escaso citoplasma basófilo en sinapsis inmunológica con el macrófago.",
            microscopy:
              "Abundantes linfocitos acompañan a los histiocitos en las improntas de lesiones ulceradas.",
            clinical:
              "Media la positividad de la prueba cutánea de Montenegro.",
            threeDNote:
              "Célula esférica azul en el polo inferior derecho.",
          },
        ],
      },
    },
  },
  p16: {
    code: "p16",
    scientificName: "Babesia microti",
    commonName: "Babesiosis Humana (Piroplasmosis Transmitida por Garrapatas Ixodes)",
    taxonomyBadge: "P16 · Apicomplejo Piroplasmida Intraeritrocitario (Sin Hemozoína)",
    stainLabel: "Frotis Giemsa (100×)",
    stages: {
      stage1: {
        id: "stage1",
        label: "Tétrada en «Cruz de Malta» Intraeritrocitaria (Patognomónica)",
        shortName: "1. Tétrada en Cruz de Malta",
        subtitle: "4 merozoítos piriformes unidos por sus extremos aguzados en cruz dentro del eritrocito (SIN hemozoína)",
        sizeRange: "Eritrocito 7.5 µm · Merozoítos 1.5–2.5 µm",
        scaleMicrons: 2,
        defaultTranslucency: 54,
        defaultCut: 0,
        defaultMotility: 30,
        defaultCameraPos: [0.2, 0.45, 3.7],
        summary:
          "Babesia microti es un protozoo apicomplejo intraeritrocitario transmitido por la garrapata de patas negras Ixodes scapularis (el mismo vector de Borrelia burgdorferi y Anaplasma phagocytophilum) o por transfusión sanguínea. Su hallazgo microscópico PATOGNOMÓNICO en el frotis teñido con Giemsa es la «TÉTRADA EN CRUZ DE MALTA»: cuatro merozoítos piriformes (en forma de pera o lágrima) nacidos por gemación simultánea que permanecen temporalmente unidos por sus puntas formando una cruz simétrica dentro de un eritrocito normocítico SIN pigmento hemozoína.",
        diagnosticPearl:
          "Cómo diferenciar Babesia microti de Plasmodium falciparum en el frotis de Giemsa: Babesia presenta (1) Tétradas en «Cruz de Malta», (2) AUSENCIA total de pigmento hemozoína, (3) anillos pleomórficos vacuolados de tamaño muy variable, y (4) merozoítos EXTRACELULARES libres fuera del eritrocito.",
        regions: [
          {
            id: 1,
            name: "Tétrada de 4 Merozoítos Piriformes en «Cruz de Malta»",
            shortLabel: "Tétrada en Cruz de Malta",
            category: "Hallazgo Patognomónico de Babesiosis",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [0.25, 0.25, 0.2],
            cameraPos: [0.9, 0.8, 2.1],
            lookAt: [0.1, 0.1, 0.05],
            description:
              "Cuatro merozoítos en forma de pera o lágrima dispuestos a 90° entre sí con sus extremos puntiagudos unidos en el centro de la cruz y sus polos redondeados con cromatina hacia afuera.",
            microscopy:
              "En Giemsa se observa el citoplasma azul celeste de los 4 brazos de la cruz con un gránulo de cromatina rojo-magenta en cada extremo distal.",
            clinical:
              "Aunque es menos frecuente que las formas en anillo, el hallazgo de una sola tétrada en Cruz de Malta confirma de forma definitiva Babesia spp. y descarta malaria.",
            threeDNote:
              "Cuatro cuerpos piriformes 3D dispuestos en cruz simétrica en el centro del eritrocito; expuestos al activar «Corte Histológico».",
          },
          {
            id: 2,
            name: "Puntos de Cromatina Nuclear en los 4 Polos de la Cruz",
            shortLabel: "4 núcleos (cromatina)",
            category: "División por Gemación Cuádruple",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [-0.35, 0.35, 0.22],
            cameraPos: [-1.1, 0.9, 2.1],
            lookAt: [-0.2, 0.2, 0.05],
            description:
              "Cada uno de los cuatro merozoítos hijos posee su propio núcleo compacto de cromatina situado hacia la base redondeada de la lágrima.",
            microscopy:
              "Se tiñen de color rojo rubí o púrpura intenso en Giemsa.",
            clinical:
              "Tras separarse, los 4 merozoítos lisan el eritrocito causando anemia hemolítica intravascular (con hemoglobinuria, ictericia, LDH elevada y haptoglobina indetectable).",
            threeDNote:
              "Esferas rubí alojadas dentro de cada uno de los 4 brazos piriformes.",
          },
          {
            id: 3,
            name: "Ausencia Total deVacuola Parasitófora, Hemozoína y Puntos de Schüffner",
            shortLabel: "Sin hemozoína ni Schüffner",
            category: "Criterio Diferencial con Malaria",
            colorBio: "#fde047",
            colorGiemsa: "#f59e0b",
            anchor: [0.0, 0.0, 0.25],
            cameraPos: [0.0, 0.5, 2.0],
            lookAt: [0.0, 0.0, 0.0],
            description:
              "Al invadir el eritrocito, Babesia disuelve inmediatamente su membrana vacuolar (reside libre en el citosol eritrocitario) y NO digiere la hemoglobina en cristales de hemozoína.",
            microscopy:
              "El citoplasma del eritrocito está completamente limpio de pigmento pardo/negro y carece de granulaciones de Schüffner o hendiduras de Maurer.",
            clinical:
              "Como Babesia no forma hemozoína ni depende de la misma vía de polimerización del grupo hemo, la CLOROQUINA es INEFICAZ. Tratamiento de elección: Atovacuona + Azitromicina (leve/moderada) o Clindamicina + Quinina (grave).",
            threeDNote:
              "Unión central limpia de los 4 ápices sin ningún cristal de pigmento.",
          },
          {
            id: 4,
            name: "Eritrocito Normocítico No Deformado (Asplenia = Riesgo Fulminante)",
            shortLabel: "Eritrocito normocítico",
            category: "Célula Huésped",
            colorBio: "#ef4444",
            colorGiemsa: "#e11d48",
            anchor: [-0.95, 0.0, 0.2],
            cameraPos: [-1.8, 0.5, 2.4],
            lookAt: [-0.4, 0.0, 0.0],
            description:
              "Glóbulo rojo maduro de tamaño normal (7.5 µm) que no sufre agrandamiento ni secuestro endotelial.",
            microscopy:
              "En pacientes esplenectomizados la parasitemia puede superar el 10–80% de los eritrocitos circulantes.",
            clinical:
              "El bazo es el órgano esencial que filtra los eritrocitos infectados por Babesia: en pacientes con ASPLENIA anatómica o funcional, mayores de 60 años o inmunodeprimidos (rituximab), la babesiosis es una emergencia médica potencialmente mortal con SDRA, CID y falla renal (indicación de exanguinotransfusión si parasitemia ≥10%).",
            threeDNote:
              "Disco bicóncavo eritrocitario cuya membrana superior se abre con «Corte Histológico».",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Trofozoítos en Anillo Pleomórficos + Merozoítos Extracelulares (vs. P. falciparum)",
        shortName: "2. Anillos y Formas Extracelulares",
        subtitle: "Anillos vacuolados de tamaño muy variable (1–3 µm) con 1–3 puntos de cromatina y formas libres fuera del hematíe",
        sizeRange: "Anillos 1.0 – 3.0 µm",
        scaleMicrons: 2,
        defaultTranslucency: 54,
        defaultCut: 0,
        defaultMotility: 35,
        defaultCameraPos: [0.2, 0.45, 3.8],
        summary:
          "El estadio más abundante en el frotis de un paciente con babesiosis son los TROFOZOÍTOS EN ANILLO, que imitan estrechamente a Plasmodium falciparum (multiparasitismo dentro de un mismo eritrocito y anillos finos). Sin embargo, los anillos de Babesia microti son marcadamente PLEOMÓRFICOS (varían desde anillos diminutos de 1 µm hasta anillos grandes ovales o ameboides de 3 µm con vacuola central blanca prominente y 1 a 3 puntos de cromatina) y se acompañan de grupos de merozoítos EXTRACELULARES.",
        diagnosticPearl:
          "En un frotis con anillos intraeritrocitarios, el hallazgo de anillos de tamaño muy desigual con vacuola central blanca refringente y racimos de parásitos EXTRACELULARES fuera de los glóbulos rojos orienta a Babesia microti.",
        regions: [
          {
            id: 1,
            name: "Anillos Pleomórficos Vacuolados (Multiparasitismo Intraeritrocitario)",
            shortLabel: "Anillos pleomórficos",
            category: "Morfología Predominante",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [-0.28, 0.15, 0.2],
            cameraPos: [-1.0, 0.7, 2.2],
            lookAt: [-0.2, 0.1, 0.0],
            description:
              "Dos o tres anillos de diámetros muy diferentes dentro de un mismo eritrocito, cada uno con un centro vacuolar blanco muy pronunciado.",
            microscopy:
              "A diferencia de los anillos uniformes de P. falciparum, los de Babesia varían en forma (redondos, ovalados, en raqueta o piriformes).",
            clinical:
              "Siempre interrogar por viajes o residencia en zonas endémicas de garrapatas Ixodes (Noreste y Medio Oeste de EE. UU. o Europa) o antecedente de transfusión de concentrado de hematíes.",
            threeDNote:
              "Tres anillos toroidales de distinto calibre y forma dentro del eritrocito.",
          },
          {
            id: 2,
            name: "Puntos de Cromatina Múltiples (1 a 3 por Anillo)",
            shortLabel: "Puntos de cromatina",
            category: "Cromatina Nuclear",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [0.32, 0.18, 0.22],
            cameraPos: [1.1, 0.7, 2.2],
            lookAt: [0.2, 0.1, 0.0],
            description:
              "Gránulos de cromatina rojo-magenta dispuestos en el borde del anillo citoplasmático.",
            microscopy:
              "Pueden observarse anillos con dos o tres masas de cromatina que preceden a la gemación.",
            clinical:
              "En casos de parasitemia baja (<1%), la PCR en tiempo real (gen 18S rRNA) es el método confirmatorio más sensible.",
            threeDNote:
              "Esferas rubí sobre el borde de cada anillo.",
          },
          {
            id: 3,
            name: "Agrupación de Merozoítos Extracelulares Libres en el Plasma",
            shortLabel: "Merozoítos extracelulares",
            category: "Signo Diferencial frente a Malaria",
            colorBio: "#22d3ee",
            colorGiemsa: "#6366f1",
            anchor: [1.18, 0.25, 0.2],
            cameraPos: [2.1, 0.6, 2.4],
            lookAt: [0.8, 0.15, 0.0],
            description:
              "Anillos y merozoítos piriformes con halo citoplasmático azul y punto de cromatina situados por fuera de los eritrocitos en el plasma.",
            microscopy:
              "Muy frecuentes en babesiosis con parasitemia moderada/alta; raros en malaria salvo lisis artefactual de esquizontes.",
            clinical:
              "Reflejan el ciclo continuo y asincrónico de lisis eritrocitaria y reinvasión.",
            threeDNote:
              "Racimo de merozoítos 3D flotando en el exterior derecho del eritrocito.",
          },
          {
            id: 4,
            name: "Eritrocito Hospedador sin Pigmento Malárico",
            shortLabel: "Eritrocito huésped",
            category: "Célula Sanguínea",
            colorBio: "#ef4444",
            colorGiemsa: "#e11d48",
            anchor: [-0.85, -0.15, 0.2],
            cameraPos: [-1.7, 0.3, 2.4],
            lookAt: [-0.4, -0.1, 0.0],
            description:
              "Glóbulo rojo normocítico y normocrómico.",
            microscopy:
              "Sin alteraciones de tamaño ni punteado.",
            clinical:
              "Babesia microti es la causa más frecuente en EE. UU. de infección parasitaria transmitida por transfusión sanguínea.",
            threeDNote:
              "Disco bicóncavo seccionable con «Corte Histológico».",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Trofozoítos Piriformes Pareados («en Pera Gemela» en Ángulo)",
        shortName: "3. Formas Piriformes Pareadas",
        subtitle: "Dos trofozoítos en forma de lágrima unidos por su extremo agudo formando una «V»",
        sizeRange: "2.0 – 3.0 × 1.5 µm",
        scaleMicrons: 2,
        defaultTranslucency: 54,
        defaultCut: 0,
        defaultMotility: 30,
        defaultCameraPos: [0.2, 0.45, 3.7],
        summary:
          "Además de la tétrada en Cruz de Malta, Babesia se divide por gemación binaria originando dos trofozoítos piriformes («en forma de pera o lágrima», de donde proviene el nombre taxonómico Piroplasmida = «plasma en forma de pera») unidos transitoriamente por sus extremos puntiagudos en ángulo agudo u obtuso («en V»).",
        diagnosticPearl:
          "El orden Piroplasmida recibe su nombre literalmente de estas formas en «pera» (pirum = pera) pareadas dentro del eritrocito.",
        regions: [
          {
            id: 1,
            name: "Par de Trofozoítos Piriformes Divergentes en «V»",
            shortLabel: "Pares piriformes en V",
            category: "Gemación Binaria Piroplasmida",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [-0.15, 0.18, 0.2],
            cameraPos: [-0.7, 0.8, 2.1],
            lookAt: [-0.1, 0.1, 0.0],
            description:
              "Dos cuerpos en forma de gota o pera simétricos cuyos ápices delgados convergen en un puente citoplasmático común.",
            microscopy:
              "Sumamente característicos de Babesia microti y Babesia divergens (la especie europea transmitida por Ixodes ricinus que causa cuadros fulminantes en esplenectomizados).",
            clinical:
              "Su observación en paciente con fiebre y hemólisis tras caminata en bosque o área rural confirma piroplasmosis.",
            threeDNote:
              "Dos cuerpos piriformes 3D unidos en ángulo dentro del eritrocito.",
          },
          {
            id: 2,
            name: "Complejo Apical Anterior en la Punta de cada Pera",
            shortLabel: "Ápices con roptrias",
            category: "Aparato de Invasión",
            colorBio: "#22d3ee",
            colorGiemsa: "#6366f1",
            anchor: [0.0, -0.15, 0.22],
            cameraPos: [0.0, 0.3, 2.0],
            lookAt: [0.0, -0.1, 0.05],
            description:
              "El extremo aguzado de cada trofozoíto piriforme contiene el anillo polar, roptrias y micronemas listos para invadir un nuevo eritrocito tras la lisis.",
            microscopy:
              "Punto de unión de la díada o tétrada.",
            clinical:
              "La azitromicina inhibe el apicoplasto de estos merozoítos mientras la atovacuona bloquea el transporte electrónico mitocondrial (citocromo bc1).",
            threeDNote:
              "Vértices cian convergentes en la base de la «V».",
          },
          {
            id: 3,
            name: "Núcleos Esféricos en el Polo Redondeado Distal",
            shortLabel: "Núcleos distales",
            category: "Cromatina Nuclear",
            colorBio: "#f43f5e",
            colorGiemsa: "#be123c",
            anchor: [0.35, 0.28, 0.22],
            cameraPos: [1.1, 0.8, 2.1],
            lookAt: [0.25, 0.2, 0.05],
            description:
              "Masa de cromatina situada en el extremo ancho de cada una de las dos peras.",
            microscopy:
              "Teñida de rojo-púrpura en Giemsa.",
            clinical:
              "Permite distinguirlos de cuerpos de Howell-Jolly (los cuales son esferas únicas densas sin citoplasma azul).",
            threeDNote:
              "Esferas rubí internas visibles al activar «Corte Histológico».",
          },
          {
            id: 4,
            name: "Membrana Eritrocitaria Intacta",
            shortLabel: "Eritrocito huésped",
            category: "Célula Huésped",
            colorBio: "#ef4444",
            colorGiemsa: "#e11d48",
            anchor: [-0.95, 0.0, 0.2],
            cameraPos: [-1.8, 0.5, 2.4],
            lookAt: [-0.4, 0.0, 0.0],
            description:
              "Eritrocito normocítico que alberga el par piriforme.",
            microscopy:
              "Contorno liso y coloración eosinofílica normal.",
            clinical:
              "Aproximadamente el 20% de los pacientes con babesiosis transmitida por Ixodes scapularis presentan coinfección simultánea con Enfermedad de Lyme (Borrelia burgdorferi) o Anaplasmosis.",
            threeDNote:
              "Disco bicóncavo eritrocitario.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Invasión Directa del Eritrocito por Esporozoíto (Sin Fase Hepática)",
        shortName: "4. Invasión por Esporozoíto",
        subtitle: "El esporozoíto inoculado por la ninfa de Ixodes invade DIRECTAMENTE el eritrocito (sin fase en hígado ni gametocitos)",
        sizeRange: "Esporozoíto 2.5 × 1.2 µm · Eritrocito 7.5 µm",
        scaleMicrons: 2,
        defaultTranslucency: 52,
        defaultCut: 0,
        defaultMotility: 45,
        defaultCameraPos: [0.15, 0.45, 3.8],
        summary:
          "Una diferencia biológica fundamental entre Babesia y Plasmodium es que los esporozoítos de Babesia microti inoculados por la ninfa de la garrapata Ixodes scapularis (que tiene el tamaño de una semilla de amapola y requiere estar adherida ≥36–48 h para transmitir) invaden DIRECTAMENTE los eritrocitos humanos, SIN pasar por ninguna fase exoeritrocitaria hepática y sin formar gametocitos en media luna.",
        diagnosticPearl:
          "Como Babesia NO tiene fase hepática ni hipnozoítos, nunca requiere primaquina; pero la ninfa de Ixodes requiere 36 a 48 horas de fijación cutánea para madurar e inocular los esporozoítos salivales, por lo que revisar la piel y retirar garrapatas en <24 h previene la infección.",
        regions: [
          {
            id: 1,
            name: "Esporozoíto Piriforme Invadiendo Directamente el Eritrocito",
            shortLabel: "Esporozoíto invasor",
            category: "Forma Infectante Vectorial",
            colorBio: "#22d3ee",
            colorGiemsa: "#0284c7",
            anchor: [-0.75, 0.35, 0.25],
            cameraPos: [-1.6, 0.8, 2.3],
            lookAt: [-0.5, 0.2, 0.05],
            description:
              "Esporozoíto salival de Babesia microti penetrando la membrana del glóbulo rojo mediante su complejo apical.",
            microscopy:
              "Forma piriforme pequeña con roptrias y micronemas anteriores.",
            clinical:
              "Ausencia total de esquizogonia hepática preeritrocitaria.",
            threeDNote:
              "Esporozoíto penetrando el borde izquierdo del eritrocito con depresión membranosa de entrada.",
          },
          {
            id: 2,
            name: "Disolución Inmediata de la Membrana Vacuolar (Vida Libre en Citosol)",
            shortLabel: "Disolución vacuolar",
            category: "Biología Intracelular Única",
            colorBio: "#fde047",
            colorGiemsa: "#f59e0b",
            anchor: [-0.25, 0.15, 0.25],
            cameraPos: [-0.8, 0.6, 2.1],
            lookAt: [-0.15, 0.1, 0.05],
            description:
              "Apenas termina de entrar al eritrocito, el parásito descarga sus roptrias para desintegrar la membrana de la vacuola parasitófora.",
            microscopy:
              "En microscopía electrónica el trofozoíto de Babesia está en contacto directo con la hemoglobina del citosol eritrocitario.",
            clinical:
              "Le permite captar nutrientes directamente sin construir redes de hendiduras de Maurer.",
            threeDNote:
              "Halo de vesículas doradas alrededor del trofozoíto recién internalizado.",
          },
          {
            id: 3,
            name: "Trofozoíto Intraeritrocitario Joven en Diferenciación",
            shortLabel: "Trofozoíto establecido",
            category: "Ciclo Asexual Eritrocitario",
            colorBio: "#38bdf8",
            colorGiemsa: "#6366f1",
            anchor: [0.35, 0.12, 0.2],
            cameraPos: [1.1, 0.6, 2.2],
            lookAt: [0.25, 0.05, 0.0],
            description:
              "Trofozoíto en anillo establecido dentro del eritrocito que iniciará la gemación binaria o en tétrada.",
            microscopy:
              "Anillo azul con punto de cromatina rubí.",
            clinical:
              "Responsable de la transmisión por transfusión sanguínea (los trofozoítos sobreviven hasta 35–42 días en bolsas de glóbulos rojos refrigeradas a 4 °C).",
            threeDNote:
              "Anillo 3D con núcleo interno en el hemisferio derecho del eritrocito.",
          },
          {
            id: 4,
            name: "Eritrocito Humano Hospedador",
            shortLabel: "Eritrocito humano",
            category: "Única Célula Diana en Humanos",
            colorBio: "#ef4444",
            colorGiemsa: "#e11d48",
            anchor: [0.0, -0.25, 0.25],
            cameraPos: [0.0, -0.5, 2.4],
            lookAt: [0.0, -0.15, 0.0],
            description:
              "El eritrocito es la única célula que Babesia microti infecta en el organismo humano.",
            microscopy:
              "Disco bicóncavo de 7.5 µm.",
            clinical:
              "El reservorio natural en la naturaleza es el ratón de patas blancas (Peromyscus leucopus); el ser humano es un hospedador accidental.",
            threeDNote:
              "Disco bicóncavo que se abre con «Corte Histológico».",
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

    float wave = sin(pos.x * 4.2 + pos.y * 3.1 + uTime * 2.8) * 0.016 * uMotility;
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
    N = perturbNormalAnalytical(N, vLocalPos, 11.5, 0.075);

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
      vec3 stainShift = mix(baseCol, vec3(baseCol.r * 0.95, baseCol.g * 0.5, baseCol.b * 1.15), 0.45);
      finalCol = stainShift * (0.5 + diff1 * 0.5) + vec3(0.95, 0.88, 0.96) * fresnel * 0.25;
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
 * Helper to emit an intracellular amastigote with both spherical nucleus and rod-shaped kinetoplast inside
 */
function addAmastigoteWithKinetoplast(
  b: BioMeshBuilder,
  cx: number,
  cy: number,
  cz: number,
  scale: number,
  bodyRegion: number,
  kinetoRegion: number
) {
  // Spherical eccentric nucleus
  b.addSphere(cx - scale * 0.22, cy + scale * 0.12, cz, scale * 0.42, scale * 0.38, scale * 0.38, "#a855f7", bodyRegion, 12, 10);
  // Rod-shaped kinetoplast bar
  b.addTube(
    [
      [cx + scale * 0.12, cy - scale * 0.25, cz + scale * 0.1],
      [cx + scale * 0.38, cy + scale * 0.18, cz + scale * 0.1],
    ],
    [scale * 0.13, scale * 0.13],
    "#f43f5e",
    kinetoRegion,
    10
  );
  // Outer amastigote membrane
  b.addSphere(cx, cy, cz, scale, scale * 0.82, scale * 0.82, "#fde047", bodyRegion + 0.4, 16, 12);
}

/**
 * Helper to emit a biconcave erythrocyte (cuttable top half)
 */
function addErythrocyte(
  b: BioMeshBuilder,
  cx: number,
  cy: number,
  cz: number,
  radius: number,
  regionTag: number
) {
  b.addSphere(cx, cy, cz, radius, radius * 0.38, radius, "#ef4444", regionTag, 38, 26, (px, py, pz) => {
    const dx = px - cx;
    const dz = pz - cz;
    const r2 = (dx * dx + dz * dz) / (radius * radius);
    const dimple = (1.0 - Math.min(1.0, r2)) * radius * 0.24;
    const sign = py >= cy ? -1 : 1;
    return [px, py + sign * dimple, pz];
  });
}

function buildStageGeometry(
  speciesCode: "p12" | "p13" | "p14" | "p15" | "p16",
  stageId: StageId
): THREE.BufferGeometry {
  const b = new BioMeshBuilder();

  if (speciesCode === "p12") {
    // P12: Trichomonas vaginalis
    if (stageId === "stage1") {
      // Stage 1: Pyriform Trophozoite (axostyle, anterior nucleus, hydrogenosomes, short undulating membrane, 4 anterior flagella)
      // 1. Internal hyaline Axostyle running full length and protruding posteriorly (region 3)
      b.addTube(
        [
          [-0.85, 0.08, 0.0],
          [-0.2, 0.02, 0.0],
          [0.55, -0.04, 0.0],
          [1.38, -0.08, 0.0],
        ],
        [0.14, 0.095, 0.065, 0.015],
        "#38bdf8",
        3,
        16
      );

      // 2. Anterior ovoid vesicular nucleus & rows of paracostal/paraxostylar Hydrogenosomes (region 4)
      b.addSphere(-0.42, 0.14, 0.05, 0.28, 0.2, 0.2, "#a855f7", 4, 20, 14);
      for (let i = 0; i < 12; i++) {
        const hx = -0.65 + i * 0.11;
        const hy = i % 2 === 0 ? 0.32 - i * 0.015 : -0.12 - (i % 3) * 0.04;
        const hz = (i % 2 === 0 ? 1 : -1) * 0.12;
        b.addSphere(hx, hy, hz, 0.06, 0.06, 0.06, "#f43f5e", 4, 10, 8);
      }

      // 3. Four free Anterior Flagella (region 1)
      for (let f = 0; f < 4; f++) {
        const spread = (f - 1.5) * 0.18;
        const pts: [number, number, number][] = [];
        for (let s = 0; s <= 16; s++) {
          const t = s / 16;
          pts.push([
            -0.88 - t * 0.78,
            0.22 + spread * t + Math.sin(t * Math.PI * 2.5 + f) * 0.12,
            spread * 0.8 + Math.cos(t * Math.PI * 2 + f) * 0.08,
          ]);
        }
        b.addTube(pts, Array(17).fill(0.022), "#22d3ee", 1, 8);
      }

      // 4. Short Undulating Membrane (1/2 to 2/3 body length, NO free posterior flagellum) & Costa (region 2)
      const umPts: [number, number, number][] = [];
      const umRads: number[] = [];
      for (let s = 0; s <= 22; s++) {
        const t = s / 22;
        const ux = -0.82 + t * 1.15; // stops at x = +0.33 (2/3 of body)
        const uy = 0.45 + Math.sin(t * Math.PI * 4.0) * 0.12 - t * 0.12;
        const uz = Math.cos(t * Math.PI * 4.0) * 0.08;
        umPts.push([ux, uy, uz]);
        umRads.push(0.055 * (1 - Math.pow(t - 0.5, 2)));
      }
      b.addTube(umPts, umRads, "#a855f7", 2, 12);

      // 5. Pyriform teardrop body (region 1.4 -> cuttable shell)
      b.addSphere(-0.1, 0.05, 0.0, 0.92, 0.56, 0.52, "#67e8f9", 1.4, 36, 26, (px, py, pz) => {
        // Taper toward right (+x) posterior pole
        const taper = px > 0 ? Math.max(0.25, 1.0 - px * 0.65) : 1.0;
        return [px, py * taper, pz * taper];
      });
    } else if (stageId === "stage2") {
      // Stage 2: Flattened Amoeboid Cytopathic Trophozoite adhered to Vaginal Squamous Epithelial Cell
      // 1. Internal nucleus & hydrogenosomes inside amoeboid trophozoite (region 4)
      b.addSphere(-0.22, 0.28, 0.05, 0.24, 0.14, 0.22, "#a855f7", 4, 18, 14);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        b.addSphere(Math.cos(a) * 0.35, 0.22, Math.sin(a) * 0.32, 0.055, 0.055, 0.055, "#fbbf24", 4, 10, 8);
      }

      // 2. AP65/LPG Adhesin contact interface (region 2)
      b.addSphere(0.05, 0.02, 0.0, 0.72, 0.08, 0.65, "#f43f5e", 2, 24, 14);

      // 3. Vaginal squamous epithelial cell undergoing cytolysis (region 3)
      b.addSphere(0.0, -0.22, 0.0, 1.45, 0.2, 1.25, "#f472b6", 3, 32, 18);
      b.addSphere(-0.35, -0.18, 0.1, 0.25, 0.12, 0.22, "#be185d", 3, 16, 12);

      // 4. Flattened amoeboid trophozoite with pseudopods & anterior flagella (region 1.4 -> cuttable)
      for (let f = 0; f < 4; f++) {
        b.addTube(
          [
            [-0.75, 0.24, (f - 1.5) * 0.12],
            [-1.25, 0.35 + (f - 1.5) * 0.1, (f - 1.5) * 0.22],
          ],
          [0.022, 0.018],
          "#22d3ee",
          1,
          8
        );
      }
      b.addSphere(0.0, 0.24, 0.0, 0.85, 0.24, 0.75, "#22d3ee", 1.4, 34, 22, (px, py, pz) => {
        const pseudo = Math.sin(px * 5) * Math.cos(pz * 5) * 0.08;
        return [px + pseudo, py, pz + pseudo];
      });
    } else if (stageId === "stage3") {
      // Stage 3: Strawberry Cervix (Colpitis Macularis) + H2 frothy microbubbles + PMNs + Trophozoites
      // Exocervical mucosa base with punctate capillary hemorrhages (region 1)
      b.addSphere(0, -0.38, 0, 1.55, 0.24, 1.35, "#fda4af", 1, 32, 18);
      const macules: [number, number][] = [
        [-0.55, 0.25],
        [0.45, -0.25],
        [-0.15, -0.35],
        [0.65, 0.3],
        [-0.75, -0.2],
      ];
      for (const [mx, mz] of macules) {
        b.addSphere(mx, -0.14, mz, 0.24, 0.12, 0.24, "#e11d48", 1, 18, 12);
      }

      // Trophozoites swimming in exudate (region 3)
      b.addSphere(0.05, 0.28, 0.15, 0.38, 0.22, 0.22, "#22d3ee", 3.4, 20, 14);
      b.addTube(
        [
          [0.35, 0.28, 0.15],
          [0.62, 0.25, 0.15],
        ],
        [0.04, 0.01],
        "#38bdf8",
        3,
        10
      );

      // Multilobed PMN neutrophils (region 4.4)
      for (const [nx, nz] of [
        [-0.82, 0.15],
        [0.25, -0.25],
      ]) {
        b.addSphere(nx - 0.08, 0.24, nz, 0.09, 0.09, 0.09, "#581c87", 4, 10, 8);
        b.addSphere(nx + 0.08, 0.26, nz, 0.09, 0.09, 0.09, "#581c87", 4, 10, 8);
        b.addSphere(nx, 0.16, nz + 0.06, 0.09, 0.09, 0.09, "#581c87", 4, 10, 8);
        b.addSphere(nx, 0.22, nz, 0.26, 0.24, 0.26, "#a855f7", 4.4, 20, 14);
      }

      // Frothy H2 gas microbubbles (region 2.4)
      for (const [bx, by, bz, br] of [
        [0.58, 0.42, 0.18, 0.22],
        [0.82, 0.28, -0.05, 0.16],
        [-0.35, 0.45, -0.18, 0.18],
      ]) {
        b.addSphere(bx, by, bz, br, br, br, "#a3e635", 2.4, 18, 14);
      }
    } else {
      // Stage 4: Longitudinal Binary Fission (2 nuclei + paradesmosis spindle + 2 axostyles + 2 undulating membranes)
      // 1. Two daughter nuclei linked by extranuclear paradesmosis spindle (region 1)
      b.addSphere(-0.28, 0.24, 0.18, 0.22, 0.18, 0.18, "#a855f7", 1, 18, 14);
      b.addSphere(0.28, 0.24, -0.18, 0.22, 0.18, 0.18, "#a855f7", 1, 18, 14);
      b.addTube(
        [
          [-0.32, 0.34, 0.18],
          [0.32, 0.34, -0.18],
        ],
        [0.045, 0.045],
        "#e879f9",
        1,
        12
      );

      // 2. Two diverging daughter Axostyles (region 2)
      b.addTube(
        [
          [-0.28, 0.35, 0.18],
          [-0.18, -0.25, 0.12],
          [-0.35, -0.95, 0.08],
        ],
        [0.09, 0.06, 0.015],
        "#38bdf8",
        2,
        12
      );
      b.addTube(
        [
          [0.28, 0.35, -0.18],
          [0.18, -0.25, -0.12],
          [0.35, -0.95, -0.08],
        ],
        [0.09, 0.06, 0.015],
        "#38bdf8",
        2,
        12
      );

      // 3. Duplicated Hydrogenosome rows (region 4)
      for (const side of [-1, 1]) {
        for (let i = 0; i < 6; i++) {
          b.addSphere(side * 0.32, 0.18 - i * 0.11, side * 0.1, 0.055, 0.055, 0.055, "#f43f5e", 4, 10, 8);
        }
      }

      // 4. Two anterior mastigont tufts & undulating membranes (region 3) + dividing heart-shaped body (region 3.4)
      for (const side of [-1, 1]) {
        b.addTube(
          [
            [side * 0.45, 0.62, 0.0],
            [side * 0.72, 1.05, 0.1],
          ],
          [0.025, 0.018],
          "#22d3ee",
          3,
          8
        );
      }
      b.addSphere(0, 0.0, 0, 0.88, 0.78, 0.58, "#67e8f9", 3.4, 34, 24);
    }
  } else if (speciesCode === "p13") {
    // P13: Trypanosoma cruzi
    if (stageId === "stage1") {
      // Stage 1: C-shaped Blood Trypomastigote with Giant Subterminal Kinetoplast
      // 1. Giant subterminal basket kinetoplast at posterior end (region 1)
      b.addSphere(0.86, -0.56, 0.0, 0.24, 0.22, 0.22, "#f43f5e", 1, 20, 16);

      // 2. Central elongated nucleus (region 2)
      b.addSphere(-0.28, 0.1, 0.0, 0.2, 0.32, 0.2, "#a855f7", 2, 20, 16);

      // 3. Narrow undulating membrane & free anterior flagellum (region 3)
      const flagPts: [number, number, number][] = [];
      const flagRads: number[] = [];
      for (let i = 0; i <= 36; i++) {
        const t = i / 36;
        const ang = -Math.PI * 0.35 + t * Math.PI * 1.35;
        const r = 0.88 + Math.sin(t * Math.PI * 5.0) * 0.08;
        if (t <= 0.78) {
          flagPts.push([Math.cos(ang) * r, Math.sin(ang) * r * 0.78, Math.sin(t * Math.PI * 4) * 0.08]);
          flagRads.push(0.05);
        } else {
          const ext = (t - 0.78) / 0.22;
          flagPts.push([-0.68 - ext * 0.75, 0.58 + ext * 0.32, Math.sin(ext * Math.PI * 2) * 0.1]);
          flagRads.push(0.022);
        }
      }
      b.addTube(flagPts, flagRads, "#22d3ee", 3, 12);

      // 4. Surrounding normocytic erythrocytes (region 4)
      addErythrocyte(b, 0.95, 0.42, -0.35, 0.55, 4);
      addErythrocyte(b, -0.95, -0.48, -0.3, 0.55, 4);

      // 5. C-shaped trypomastigote body (region 3.4 -> cuttable shell)
      const cPts: [number, number, number][] = [];
      const cRads: number[] = [];
      for (let i = 0; i <= 32; i++) {
        const t = i / 32; // 0 = pointed posterior tip near kinetoplast, 1 = anterior tip
        const ang = -Math.PI * 0.38 + t * Math.PI * 1.12;
        cPts.push([Math.cos(ang) * 0.74, Math.sin(ang) * 0.62, 0.0]);
        // Bulge at subterminal kinetoplast (t ~ 0.12)
        const bulge = Math.exp(-Math.pow((t - 0.12) * 9.0, 2)) * 0.11;
        const baseR = 0.22 * Math.sin(Math.pow(t, 0.7) * Math.PI) + bulge;
        cRads.push(Math.max(0.025, baseR));
      }
      b.addTube(cPts, cRads, "#38bdf8", 3.4, 22);
    } else if (stageId === "stage2") {
      // Stage 2: Intracellular Amastigote Nest (Pseudocyst) inside Striated Cardiomyocyte
      // 1. Dozens of intracellular amastigotes with nucleus + rod kinetoplast (region 1 & 2)
      for (let i = 0; i < 18; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 18);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = i < 5 ? 0.24 : 0.55;
        addAmastigoteWithKinetoplast(
          b,
          r * Math.sin(phi) * Math.cos(theta) * 1.15,
          r * Math.cos(phi) * 0.75,
          r * Math.sin(phi) * Math.sin(theta) * 0.75,
          0.19,
          1,
          2
        );
      }

      // 2. Autonomic Auerbach nerve fiber adjacent (region 4)
      b.addTube(
        [
          [-1.35, -0.58, 0.15],
          [0.0, -0.52, 0.22],
          [1.35, -0.58, 0.15],
        ],
        [0.065, 0.08, 0.065],
        "#38bdf8",
        4,
        12
      );

      // 3. Striated myocardial muscle fiber enclosing the pseudocyst (region 3.4 -> cuttable shell)
      b.addSphere(0, 0, 0, 1.45, 0.82, 0.82, "#fb7185", 3.4, 38, 26, (px, py, pz) => {
        const striation = Math.sin(px * 22.0) * 0.02;
        return [px, py + striation, pz + striation];
      });
    } else if (stageId === "stage3") {
      // Stage 3: Replicative Epimastigote in Triatomine midgut (kinetoplast ANTERIOR to nucleus)
      // 1. Anterior juxtanuclear Kinetoplast (region 1)
      b.addTube(
        [
          [-0.28, 0.12, 0.0],
          [-0.28, -0.12, 0.0],
        ],
        [0.14, 0.14],
        "#f43f5e",
        1,
        14
      );

      // 2. Central spherical/ovoid Nucleus behind kinetoplast (region 2)
      b.addSphere(0.18, 0.0, 0.0, 0.26, 0.22, 0.22, "#a855f7", 2, 20, 16);

      // 3. Posterior Reservosomes (region 4)
      for (let i = 0; i < 6; i++) {
        b.addSphere(0.65 + (i % 3) * 0.16, ((i % 2) - 0.5) * 0.14, 0.0, 0.08, 0.08, 0.08, "#fbbf24", 4, 12, 10);
      }

      // 4. Short anterior undulating membrane & free flagellum (region 3)
      b.addTube(
        [
          [-0.28, 0.22, 0.0],
          [-0.68, 0.32, 0.06],
          [-1.12, 0.22, -0.05],
          [-1.65, 0.35, 0.08],
        ],
        [0.055, 0.05, 0.03, 0.018],
        "#22d3ee",
        3,
        12
      );

      // 5. Straight spindle-shaped epimastigote body (region 4.4 -> cuttable)
      b.addTube(
        [
          [-1.18, 0.0, 0.0],
          [-0.45, 0.0, 0.0],
          [0.25, 0.0, 0.0],
          [1.22, 0.0, 0.0],
        ],
        [0.04, 0.28, 0.3, 0.04],
        "#38bdf8",
        4.4,
        24
      );
    } else {
      // Stage 4: Slender Infective S-shaped Metacyclic Trypomastigote
      b.addSphere(0.95, -0.35, 0.0, 0.2, 0.18, 0.18, "#f43f5e", 2, 18, 14);
      b.addSphere(0.05, 0.02, 0.0, 0.22, 0.16, 0.16, "#a855f7", 4, 18, 14);

      const sPts: [number, number, number][] = [];
      const sRads: number[] = [];
      const gpPts: [number, number, number][] = [];
      for (let i = 0; i <= 34; i++) {
        const t = i / 34;
        const x = 1.15 - t * 2.35;
        const y = Math.sin(t * Math.PI * 2.0) * 0.42;
        sPts.push([x, y, 0.0]);
        sRads.push(Math.max(0.025, 0.19 * Math.sin(t * Math.PI)));
        gpPts.push([x, y + 0.18, Math.sin(t * Math.PI * 5) * 0.07]);
      }
      b.addTube(gpPts, Array(35).fill(0.04), "#fde047", 3, 10);
      b.addTube(sPts, sRads, "#38bdf8", 1.4, 22);
    }
  } else if (speciesCode === "p14") {
    // P14: Leishmania donovani / L. infantum
    if (stageId === "stage1") {
      // Stage 1: Splenic/Bone Marrow Macrophage packed with Leishman-Donovan bodies (amastigotes)
      for (let i = 0; i < 16; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 16);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = i < 4 ? 0.22 : 0.48;
        addAmastigoteWithKinetoplast(
          b,
          0.18 + r * Math.sin(phi) * Math.cos(theta),
          0.05 + r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta),
          0.18,
          1,
          2
        );
      }
      // Acidified phagolysosomal vacuole (region 3.4 -> cuttable)
      b.addSphere(0.18, 0.05, 0.0, 0.78, 0.78, 0.74, "#38bdf8", 3.4, 28, 20);
      // Displaced macrophage nucleus (region 4)
      b.addSphere(-0.72, -0.12, 0.0, 0.32, 0.46, 0.36, "#a855f7", 4, 22, 16);
      // Outer macrophage membrane (region 4.4 -> cuttable)
      b.addSphere(0, 0, 0, 1.32, 1.06, 1.02, "#64748b", 4.4, 36, 26);
    } else if (stageId === "stage2") {
      // Stage 2: Motile Promastigote (anterior kinetoplast + long free anterior flagellum, NO undulating membrane)
      // 1. Extreme Anterior Kinetoplast (region 2)
      b.addTube(
        [
          [-0.65, 0.1, 0.0],
          [-0.65, -0.1, 0.0],
        ],
        [0.12, 0.12],
        "#f43f5e",
        2,
        14
      );
      // 2. Central ovoid Nucleus (region 3)
      b.addSphere(0.05, 0.0, 0.0, 0.25, 0.2, 0.2, "#a855f7", 3, 20, 16);
      // 3. Long free Anterior Flagellum (region 1)
      const fPts: [number, number, number][] = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        fPts.push([
          -0.88 - t * 0.95,
          Math.sin(t * Math.PI * 2.5) * 0.22,
          Math.cos(t * Math.PI * 2.5) * 0.1,
        ]);
      }
      b.addTube(fPts, Array(21).fill(0.028), "#22d3ee", 1, 10);
      // 4. Spindle body coated with LPG/gp63 (region 4.4 -> cuttable)
      b.addTube(
        [
          [-0.95, 0.0, 0.0],
          [-0.35, 0.0, 0.0],
          [0.35, 0.0, 0.0],
          [1.08, 0.0, 0.0],
        ],
        [0.05, 0.28, 0.26, 0.035],
        "#fde047",
        4.4,
        24
      );
    } else if (stageId === "stage3") {
      // Stage 3: Promastigote Rosette in NNN Culture (flagella intertwined at center)
      b.addSphere(0, 0, 0, 0.22, 0.22, 0.22, "#22d3ee", 1, 16, 12);
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        // Flagellum toward center (region 1)
        b.addTube(
          [
            [ca * 0.08, sa * 0.08, 0.0],
            [ca * 0.42, sa * 0.42, 0.0],
          ],
          [0.022, 0.028],
          "#22d3ee",
          1,
          8
        );
        // Anterior kinetoplast ring (region 3)
        b.addSphere(ca * 0.55, sa * 0.55, 0.0, 0.085, 0.085, 0.085, "#f43f5e", 3, 12, 10);
        // Nucleus outer ring (region 4)
        b.addSphere(ca * 0.85, sa * 0.85, 0.0, 0.12, 0.12, 0.12, "#a855f7", 4, 14, 12);
        // Spindle body (region 2.4 -> cuttable)
        b.addTube(
          [
            [ca * 0.42, sa * 0.42, 0.0],
            [ca * 0.82, sa * 0.82, 0.0],
            [ca * 1.28, sa * 1.28, 0.0],
          ],
          [0.06, 0.16, 0.03],
          "#fde047",
          2.4,
          16
        );
      }
    } else {
      // Stage 4: Bone Marrow Aspirate Giemsa Field (extracellular LD bodies + histiocyte nucleus + plasma cell + RBC)
      // Ruptured histiocyte nucleus (region 2)
      b.addSphere(-0.85, 0.05, 0.0, 0.36, 0.32, 0.28, "#a855f7", 2, 20, 14);
      // Swarm of extracellular Leishman-Donovan bodies (region 1)
      const ldCoords: [number, number, number][] = [
        [-0.28, 0.28, 0.12],
        [-0.12, -0.05, 0.18],
        [-0.38, -0.25, 0.08],
        [0.12, 0.32, 0.05],
        [0.08, 0.02, -0.12],
        [-0.18, 0.48, -0.05],
      ];
      for (const [lx, ly, lz] of ldCoords) {
        addAmastigoteWithKinetoplast(b, lx, ly, lz, 0.19, 1, 1);
      }
      // Plasma cell producing anti-rK39 IgG (region 3.4)
      b.addSphere(0.88, 0.28, 0.0, 0.18, 0.18, 0.18, "#4338ca", 3, 16, 12);
      b.addSphere(0.75, 0.22, 0.0, 0.42, 0.34, 0.32, "#38bdf8", 3.4, 22, 16);
      // Reference RBC (region 4)
      addErythrocyte(b, 0.35, -0.45, 0.0, 0.48, 4);
    }
  } else if (speciesCode === "p15") {
    // P15: Leishmania (Viannia) braziliensis
    if (stageId === "stage1") {
      // Stage 1: Indurated Cutaneous Ulcer border with dermal macrophages containing amastigotes
      // Ulcer crater floor (region 3)
      b.addSphere(0, -0.35, 0, 0.95, 0.22, 0.95, "#ef4444", 3, 28, 16);
      // Dermal macrophages in raised border containing amastigotes (region 2)
      for (const side of [-1, 1]) {
        addAmastigoteWithKinetoplast(b, side * 0.68, -0.02, 0.18, 0.16, 2, 2);
        addAmastigoteWithKinetoplast(b, side * 0.82, 0.12, -0.1, 0.16, 2, 2);
      }
      // Deep dermal lymphatic vessel (region 4)
      b.addTube(
        [
          [-1.15, -0.58, 0.0],
          [0.0, -0.52, 0.15],
          [1.15, -0.58, 0.0],
        ],
        [0.08, 0.09, 0.08],
        "#22d3ee",
        4,
        14
      );
      // Indurated raised crater border (region 1.4 -> cuttable)
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        b.addSphere(Math.cos(a) * 0.88, 0.12, Math.sin(a) * 0.88, 0.38, 0.36, 0.38, "#f472b6", 1.4, 18, 14);
      }
    } else if (stageId === "stage2") {
      // Stage 2: Mucocutaneous Leishmaniasis ("Espundia") — Perforated Nasal Septal Cartilage + Granuloma
      // Perforated hyaline nasal septal cartilage plate (region 1)
      b.addSphere(-0.48, 0.0, 0.0, 0.42, 0.68, 0.14, "#67e8f9", 1, 22, 16);
      b.addSphere(0.48, 0.0, 0.0, 0.42, 0.68, 0.14, "#67e8f9", 1, 22, 16);
      // Scarce amastigotes inside granuloma histiocytes (region 3)
      addAmastigoteWithKinetoplast(b, -0.62, 0.12, 0.25, 0.17, 3, 3);
      addAmastigoteWithKinetoplast(b, -0.45, -0.18, 0.22, 0.17, 3, 3);
      // Multinucleated Langhans giant cell (region 4.4)
      for (let k = 0; k < 6; k++) {
        const a = -0.8 + (k / 5) * 1.6;
        b.addSphere(0.75 + Math.cos(a) * 0.22, -0.15 + Math.sin(a) * 0.22, 0.18, 0.08, 0.08, 0.08, "#581c87", 4, 10, 8);
      }
      b.addSphere(0.75, -0.15, 0.15, 0.38, 0.36, 0.34, "#a855f7", 4.4, 22, 16);
      // Hyperergic mucosal granuloma mass (region 2.4 -> cuttable)
      b.addSphere(-0.62, 0.05, 0.2, 0.56, 0.52, 0.48, "#f43f5e", 2.4, 28, 20);
    } else if (stageId === "stage3") {
      // Stage 3: Peripylarian Viannia Promastigote attached to Lutzomyia hindgut (pylorus) + LRV1 virus particles
      // Pyloric hindgut cuticular plaque & attached flagellum (region 1)
      b.addSphere(-1.45, 0.18, 0.0, 0.14, 0.42, 0.42, "#0284c7", 1, 18, 14);
      b.addTube(
        [
          [-1.38, 0.18, 0.0],
          [-0.85, 0.08, 0.0],
        ],
        [0.045, 0.03],
        "#22d3ee",
        1,
        12
      );
      // Anterior Viannia kDNA kinetoplast (region 2)
      b.addSphere(-0.55, 0.04, 0.0, 0.12, 0.15, 0.12, "#f43f5e", 2, 14, 12);
      // Central Nucleus (region 3)
      b.addSphere(0.12, 0.0, 0.0, 0.24, 0.2, 0.2, "#a855f7", 3, 18, 14);
      // Leishmaniavirus 1 (LRV1) icosahedral dsRNA particles (region 4)
      for (let i = 0; i < 7; i++) {
        b.addSphere(0.55 + (i % 3) * 0.14, ((i % 2) - 0.5) * 0.14, 0.0, 0.065, 0.065, 0.065, "#4ade80", 4, 10, 8);
      }
      // Promastigote spindle body (region 3.4 -> cuttable)
      b.addTube(
        [
          [-0.88, 0.05, 0.0],
          [-0.25, 0.02, 0.0],
          [0.45, -0.02, 0.0],
          [1.12, -0.04, 0.0],
        ],
        [0.06, 0.26, 0.25, 0.04],
        "#fde047",
        3.4,
        24
      );
    } else {
      // Stage 4: Ulcer Border Impression Smear (macrophage vacuole with peripheral amastigotes + Th1 lymphocyte)
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        addAmastigoteWithKinetoplast(
          b,
          0.18 + Math.cos(ang) * 0.42,
          0.08 + Math.sin(ang) * 0.42,
          0.0,
          0.17,
          1,
          2
        );
      }
      b.addSphere(-0.68, -0.12, 0.0, 0.32, 0.44, 0.32, "#a855f7", 3, 20, 14);
      b.addSphere(0.96, -0.38, 0.15, 0.28, 0.28, 0.28, "#38bdf8", 4, 18, 14);
      b.addSphere(-0.08, 0.02, 0.0, 1.12, 0.92, 0.82, "#64748b", 1.4, 34, 24);
    }
  } else {
    // P16: Babesia microti
    if (stageId === "stage1") {
      // Stage 1: Intraerythrocytic "Maltese Cross" Tetrad (4 budding pyriform merozoites, NO hemozoin)
      // Central clean junction (region 3)
      b.addSphere(0, 0.02, 0, 0.11, 0.08, 0.11, "#fde047", 3, 14, 12);

      // Four pyriform arms at 90 degrees (region 1) + distal chromatin nuclei (region 2)
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        // Distal chromatin dot (region 2)
        b.addSphere(ca * 0.46, 0.04, sa * 0.46, 0.11, 0.09, 0.11, "#f43f5e", 2, 14, 12);
        // Pyriform teardrop arm (region 1.4 -> cuttable)
        b.addTube(
          [
            [ca * 0.06, 0.02, sa * 0.06],
            [ca * 0.28, 0.03, sa * 0.28],
            [ca * 0.56, 0.04, sa * 0.56],
          ],
          [0.035, 0.14, 0.18],
          "#38bdf8",
          1.4,
          16
        );
      }

      // Normocytic host erythrocyte without pigment or Schuffner dots (region 4.4 -> cuttable)
      addErythrocyte(b, 0, 0, 0, 1.28, 4.4);
    } else if (stageId === "stage2") {
      // Stage 2: Pleomorphic Vacuolated Rings + Extracellular Merozoite Cluster
      // Three pleomorphic rings of different sizes inside RBC (region 1 & 2)
      const rings: [number, number, number, number][] = [
        [-0.38, 0.05, 0.25, 0.28],
        [0.32, 0.05, -0.22, 0.2],
        [-0.08, 0.05, -0.36, 0.16],
      ];
      for (const [rx, ry, rz, rr] of rings) {
        const rPts: [number, number, number][] = [];
        for (let s = 0; s <= 20; s++) {
          const a = (s / 20) * Math.PI * 2;
          rPts.push([rx + Math.cos(a) * rr, ry, rz + Math.sin(a) * rr * 0.85]);
        }
        b.addTube(rPts, Array(21).fill(0.055), "#38bdf8", 1, 10);
        b.addSphere(rx + rr, ry + 0.04, rz, 0.085, 0.085, 0.085, "#f43f5e", 2, 12, 10);
      }

      // Extracellular merozoite cluster outside the RBC (region 3)
      for (const [ex, ey, ez] of [
        [1.18, 0.22, 0.15],
        [1.35, 0.05, -0.08],
        [1.12, -0.12, 0.22],
      ]) {
        b.addSphere(ex, ey, ez, 0.15, 0.12, 0.12, "#22d3ee", 3, 14, 12);
        b.addSphere(ex + 0.06, ey + 0.05, ez, 0.065, 0.065, 0.065, "#f43f5e", 3, 10, 8);
      }

      addErythrocyte(b, -0.12, 0, 0, 1.18, 4.4);
    } else if (stageId === "stage3") {
      // Stage 3: Paired Pyriform ("Twin Pear") Trophozoites joined in a V-angle
      b.addSphere(0, 0.02, 0.18, 0.09, 0.08, 0.09, "#22d3ee", 2, 12, 10);
      for (const side of [-1, 1]) {
        b.addSphere(side * 0.36, 0.05, -0.25, 0.12, 0.1, 0.12, "#f43f5e", 3, 14, 12);
        b.addTube(
          [
            [0.0, 0.02, 0.18],
            [side * 0.22, 0.04, -0.05],
            [side * 0.42, 0.05, -0.32],
          ],
          [0.04, 0.16, 0.22],
          "#38bdf8",
          1.4,
          16
        );
      }
      addErythrocyte(b, 0, 0, 0, 1.25, 4.4);
    } else {
      // Stage 4: Direct Sporozoite Invasion of Erythrocyte (No Hepatic Phase)
      // Invading pyriform sporozoite at left rim (region 1)
      b.addTube(
        [
          [-1.35, 0.35, 0.0],
          [-0.95, 0.2, 0.0],
          [-0.65, 0.08, 0.0],
        ],
        [0.16, 0.12, 0.04],
        "#22d3ee",
        1,
        14
      );
      // Dissolving vacuolar vesicles (region 2)
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.addSphere(-0.28 + Math.cos(a) * 0.22, 0.08, Math.sin(a) * 0.22, 0.06, 0.06, 0.06, "#fde047", 2, 10, 8);
      }
      // Established intraerythrocytic ring (region 3)
      const rPts: [number, number, number][] = [];
      for (let s = 0; s <= 20; s++) {
        const a = (s / 20) * Math.PI * 2;
        rPts.push([0.38 + Math.cos(a) * 0.25, 0.05, Math.sin(a) * 0.25]);
      }
      b.addTube(rPts, Array(21).fill(0.06), "#38bdf8", 3, 10);
      b.addSphere(0.62, 0.08, 0.0, 0.09, 0.09, 0.09, "#f43f5e", 3, 12, 10);

      addErythrocyte(b, 0.05, 0, 0, 1.25, 4.4);
    }
  }

  return b.toBufferGeometry();
}

export function FlagellatesHemoparasites3DViewer({
  speciesCode,
  onClose,
}: FlagellatesHemoparasites3DViewerProps) {
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
                <span className="text-slate-300">Translucidez de Membrana / Película</span>
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
