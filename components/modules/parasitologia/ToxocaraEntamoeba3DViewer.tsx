"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Sparkles,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  Info,
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

export interface ToxocaraEntamoeba3DViewerProps {
  speciesCode: "p06" | "p07";
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
  code: "p06" | "p07";
  scientificName: string;
  commonName: string;
  taxonomyBadge: string;
  stainLabel: string;
  stages: Record<StageId, StageMeta>;
}

const SPECIES_CONFIG: Record<"p06" | "p07", SpeciesMeta> = {
  p06: {
    code: "p06",
    scientificName: "Toxocara canis",
    commonName: "Larva Migrans Visceral (LMV) y Ocular (LMO)",
    taxonomyBadge: "P06 · Nematodo Ascaridida Zoonótico",
    stainLabel: "Montaje Copro / H&E",
    stages: {
      stage1: {
        id: "stage1",
        label: "Huevo Embrionado Infectante (85 × 75 µm)",
        shortName: "1. Huevo Embrionado (Suelo)",
        subtitle: "Cáscara gruesa alveolada («pelota de golf») con larva L3 infectante enrollada en su interior",
        sizeRange: "80 – 90 × 75 µm",
        scaleMicrons: 25,
        defaultTranslucency: 52,
        defaultCut: 0,
        defaultMotility: 35,
        defaultCameraPos: [0.2, 0.35, 3.8],
        summary:
          "El huevo de Toxocara canis excretado en las heces de cachorros y perros infectados es subglobular (85 × 75 µm), de color pardo-dorado oscuro, con una gruesa cubierta proteica externa densamente alveolada o escrobiculada («aspecto de pelota de golf»). En el suelo húmedo y sombreado embriona en 2 a 4 semanas hasta contener la larva infectante (L2/L3), capaz de resistir años en parques y areneros.",
        diagnosticPearl:
          "El ser humano se infecta al ingerir estos huevos embrionados del suelo (geofagia en niños, manos u hortalizas contaminadas), pero NUNCA elimina huevos en sus heces porque la larva no madura a adulto en el intestino humano.",
        regions: [
          {
            id: 1,
            name: "Cubierta Externa Alveolada (Escrobiculada)",
            shortLabel: "Cáscara alveolada",
            category: "Pared Ovular Protectora",
            colorBio: "#b47b38",
            colorGiemsa: "#8c5220",
            anchor: [-0.95, 0.72, 0.45],
            cameraPos: [-1.8, 1.2, 2.5],
            lookAt: [-0.5, 0.4, 0.2],
            description:
              "Capa mamilonada o alveolada externa rica en proteínas curtidas por quinonas, provista de depresiones cóncavas regulares que le confieren su aspecto patognomónico de pelota de golf.",
            microscopy:
              "En muestras de suelo o heces caninas se observa una superficie reticulada pardo-dorada muy refringente que lo diferencia de Ascaris lumbricoides (mamelonado grueso).",
            clinical:
              "Confiere resistencia extrema a la desecación, desinfectantes comunes y bajas temperaturas, manteniendo la viabilidad larvaria por años en tierra y areneros infantiles.",
            threeDNote:
              "Modelada con relieve geométrico de alvéolos cóncavos 3D y perturbación analítica de normales; el corte histológico secciona su mitad superior.",
          },
          {
            id: 2,
            name: "Capa Ascarósido Lipídica e Hialina Interna",
            shortLabel: "Membrana lipídica",
            category: "Barrera de Permeabilidad",
            colorBio: "#e8d5b5",
            colorGiemsa: "#d4b483",
            anchor: [0.92, 0.58, 0.35],
            cameraPos: [1.8, 1.0, 2.5],
            lookAt: [0.5, 0.3, 0.1],
            description:
              "Membrana vitelina y capa lipídica de ascarósidos situada bajo la cáscara alveolada, responsable de la impermeabilidad química a agentes tóxicos.",
            microscopy:
              "Se visualiza como un anillo claro y refringente entre la cubierta alveolada parda y la cavidad perivitelina donde se mueve la larva.",
            clinical:
              "Las sales biliares, el CO2 y las enzimas pancreáticas del duodeno humano disuelven selectivamente esta barrera, induciendo la eclosión de la larva L3.",
            threeDNote:
              "Representada como una túnica interna nacarada concéntrica expuesta en el borde de sección histológica.",
          },
          {
            id: 3,
            name: "Larva Infectante L3 Enrollada Intraovular",
            shortLabel: "Larva L3 interna",
            category: "Estadio Infectante Humano",
            colorBio: "#f5ebd6",
            colorGiemsa: "#c084fc",
            anchor: [0.05, 0.08, 0.42],
            cameraPos: [0.15, 0.25, 2.3],
            lookAt: [0.0, 0.0, 0.15],
            description:
              "Larva rabditoide/filariforme de tercer estadio (L3, ~400 × 20 µm) dispuesta en múltiples espirales apretadas dentro de la cavidad ovular.",
            microscopy:
              "En huevos embrionados maduros se distingue la larva móvil plegada sobre sí misma con esófago muscular anterior y extremo caudal afilado.",
            clinical:
              "Es la única forma infectante para el ser humano. Al eclosionar en el duodeno, perfora la pared intestinal y alcanza el hígado por la circulación portal en 24 h.",
            threeDNote:
              "Emitida primero en el buffer 3D con tubo digestivo interno y motilidad helicoidal; totalmente expuesta al deslizar «Corte Histológico».",
          },
          {
            id: 4,
            name: "Esófago Rabditiforme y Gránulos Secretorios (TES)",
            shortLabel: "Esófago y glándulas TES",
            category: "Aparato de Invasión",
            colorBio: "#38bdf8",
            colorGiemsa: "#6366f1",
            anchor: [-0.35, -0.32, 0.38],
            cameraPos: [-0.9, -0.6, 2.3],
            lookAt: [-0.25, -0.2, 0.15],
            description:
              "Porción esofágica muscular y glándulas esofágicas dorsales/subventrales productoras de los antígenos de excreción-secreción de Toxocara (TES).",
            microscopy:
              "Región anterior más densa y refringente del cuerpo larvario con primordio esofágico y ventrículo glandular.",
            clinical:
              "Los antígenos glicoproteicos TES permiten a la larva penetrar tejidos y constituyen la diana del diagnóstico serológico humano (ELISA IgG anti-TES y Western Blot).",
            threeDNote:
              "Visible por transparencia dentro del tercio anterior de la larva enrollada.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Granuloma Eosinofílico Hepático — Larva Migrans Visceral (LMV)",
        shortName: "2. Granuloma Visceral (LMV)",
        subtitle: "Larva L3 (400 × 20 µm) atrapada en granuloma hepático con eosinófilos y cristales de Charcot-Leyden",
        sizeRange: "Larva 400 × 20 µm · Granuloma 1–3 mm",
        scaleMicrons: 100,
        defaultTranslucency: 48,
        defaultCut: 0,
        defaultMotility: 40,
        defaultCameraPos: [0.25, 0.45, 4.1],
        summary:
          "En el hospedador paraténico accidental humano, las larvas L3 de Toxocara canis no completan su ciclo pulmonar-intestinal y migran erráticamente por el hígado, pulmones, miocardio y SNC (Larva Migrans Visceral, LMV). La intensa respuesta inmune Th2 mediada por IL-5 e IgE genera granulomas eosinofílicos necrotizantes con cristales bipiramidales de Charcot-Leyden alrededor de la larva.",
        diagnosticPearl:
          "Sospechar LMV en niños de 1 a 5 años con antecedente de geofagia/contacto con cachorros que presentan fiebre, hepatomegalia, sibilancias y leucocitosis con HIPEREOSINOFILIA marcada (>30–50%). Diagnóstico: ELISA IgG anti-TES + Western Blot.",
        regions: [
          {
            id: 1,
            name: "Larva L3 Migratoria con Alas Cervicales Estrechas",
            shortLabel: "Larva L3 en centro",
            category: "Parásito Tisular",
            colorBio: "#fef3c7",
            colorGiemsa: "#a855f7",
            anchor: [0.0, 0.05, 0.35],
            cameraPos: [0.1, 0.2, 2.3],
            lookAt: [0.0, 0.0, 0.1],
            description:
              "Larva de ~400 µm de longitud por 18–21 µm de diámetro con cutícula estriada, dos alas laterales estrechas a lo largo del cuerpo y esófago con ventrículo.",
            microscopy:
              "En cortes histológicos seriados (H&E) el hallazgo patognomónico es la sección transversal o longitudinal de la larva con sus dos crestas alares laterales a nivel del intestino.",
            clinical:
              "La larva secreta una cubierta externa de mucinas (TES-120) que muda y desprende cuando es atacada por eosinófilos, permitiéndole escapar y continuar migrando durante meses o años.",
            threeDNote:
              "Modelada en 3D en el centro del granuloma con ondulación serpentiforme activa.",
          },
          {
            id: 2,
            name: "Corona de Eosinófilos Degranulantes e Histiocitos Epitelioides",
            shortLabel: "Infiltrado eosinofílico",
            category: "Respuesta Inmune Th2",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.85, 0.55, 0.4],
            cameraPos: [-1.7, 1.0, 2.6],
            lookAt: [-0.45, 0.3, 0.1],
            description:
              "Denso manto celular inflamatorio compuesto por eosinófilos bilobulados cargados de proteína básica mayor (MBP), macrófagos epitelioides y células gigantes multinucleadas.",
            microscopy:
              "En tinción H&E destaca una marea de gránulos citoplasmáticos rojo-anaranjados brillantes rodeando un centro de necrosis fibrinoide eosinofílica.",
            clinical:
              "La liberación masiva de MBP y neurotoxina derivada del eosinófilo causa el daño tisular en hígado, pulmón (síndrome de Löffler) y miocardio.",
            threeDNote:
              "Representados como esferas celulares granuladas alrededor del túnel necrótico central.",
          },
          {
            id: 3,
            name: "Cristales Bipiramidales de Charcot-Leyden (Galectina-10)",
            shortLabel: "Cristales Charcot-Leyden",
            category: "Marcador Histopatológico",
            colorBio: "#fbbf24",
            colorGiemsa: "#ec4899",
            anchor: [0.75, -0.35, 0.42],
            cameraPos: [1.6, -0.6, 2.5],
            lookAt: [0.4, -0.2, 0.15],
            description:
              "Cristales hexagonales bipiramidales en forma de aguja o brújula formados por la cristalización de la galectina-10 (lisofosfolipasa) de los eosinófilos lisados.",
            microscopy:
              "Estructuras cristalinas aciculares birrefringentes, intensamente eosinofílicas en H&E y rojo-púrpura en tricrómico, inmersas en el detritus necrótico del granuloma.",
            clinical:
              "Su presencia en biopsia hepática o esputo orienta fuertemente a una infección helmíntica tisular invasiva con destrucción eosinofílica.",
            threeDNote:
              "Modelados como bipirámides geométricas facetadas brillantes dispuestas en el núcleo del granuloma.",
          },
          {
            id: 4,
            name: "Cápsula Fibrosa Periférica y Parénquima Hepático",
            shortLabel: "Cápsula granulomatosa",
            category: "Contención Tisular",
            colorBio: "#a855f7",
            colorGiemsa: "#64748b",
            anchor: [1.05, 0.65, 0.2],
            cameraPos: [2.1, 1.1, 2.8],
            lookAt: [0.5, 0.3, 0.0],
            description:
              "Envoltura concéntrica de fibroblastos, fibras colágenas y linfocitos T CD4+ que delimita el granuloma frente a los hepatocitos adyacentes.",
            microscopy:
              "En ecografía o TC abdominal, los múltiples granulomas hepáticos se observan como pequeñas lesiones hipodensas/hipoecoicas mal definidas de aspecto pseudometastásico.",
            clinical:
              "Con el tiempo el granuloma fibrosa y calcifica, atrapando definitivamente a la larva o dejando cicatrices en los rastros de migración.",
            threeDNote:
              "Envoltura semitransparente externa que se abre con el control de «Corte Histológico» para mostrar la larva y los cristales internos.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Larva Migrans Ocular (LMO) — Granuloma Retiniano Posterior",
        shortName: "3. Granuloma Ocular (LMO)",
        subtitle: "Granuloma coriorretiniano blanquecino con pliegue de tracción vítrea y larva subretiniana",
        sizeRange: "Lesión retiniana 1–2 DD (Larva ~400 µm)",
        scaleMicrons: 250,
        defaultTranslucency: 42,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.15, 0.55, 4.0],
        summary:
          "La Larva Migrans Ocular (LMO) ocurre típicamente en niños mayores (5–14 años) o adultos jóvenes que ingieren una baja carga de huevos embrionados. Una única larva alcanza la arteria central de la retina o las arterias ciliares cortas posteriores, formando un granuloma retiniano elevado en el polo posterior o periferia que simula un retinoblastoma maligno (pseudorretinoblastoma con leucocoria).",
        diagnosticPearl:
          "A diferencia de la LMV, en la LMO NO suele haber eosinofilia periférica ni hepatomegalia, y la serología sérica puede tener títulos bajos (confirmar con ELISA en humor vítreo/acuoso y fondo de ojo). Tratamiento: corticoides sistémicos/perioculares PRIMERO para controlar la inflamación retiniana + albendazol.",
        regions: [
          {
            id: 1,
            name: "Granuloma Coriorretiniano Sobreelevado (Pseudorretinoblastoma)",
            shortLabel: "Granuloma macular",
            category: "Lesión del Polo Posterior",
            colorBio: "#f8fafc",
            colorGiemsa: "#e2e8f0",
            anchor: [0.0, 0.22, 0.45],
            cameraPos: [0.1, 0.6, 2.5],
            lookAt: [0.0, 0.15, 0.15],
            description:
              "Masa inflamatoria subretiniana e intrarretiniana blanco-amarillenta densa localizada en la mácula o adyacente al disco óptico.",
            microscopy:
              "Compuesta por tejido fibroglial denso, eosinófilos y exudado fibrinoso que envuelve a la larva de T. canis en el espacio subretiniano.",
            clinical:
              "Es una causa crítica de leucocoria («pupila blanca»), estrabismo y pérdida visual unilateral indolora en niños; exige diagnóstico diferencial estricto con retinoblastoma para evitar enucleaciones innecesarias.",
            threeDNote:
              "Cúpula translúcida sobre el lecho coroideo/retiniano; al activar el corte histológico se observa la larva L3 en su interior.",
          },
          {
            id: 2,
            name: "Larva L3 Subretiniana en el Núcleo del Granuloma",
            shortLabel: "Larva subretiniana",
            category: "Agente Etiológico",
            colorBio: "#fde047",
            colorGiemsa: "#c084fc",
            anchor: [-0.08, 0.08, 0.15],
            cameraPos: [-0.3, 0.4, 2.2],
            lookAt: [0.0, 0.05, 0.05],
            description:
              "Única larva de Toxocara canis alojada en el centro del granuloma retiniano.",
            microscopy:
              "Rara vez visible directamente en oftalmoscopía salvo cuando migra viva en el espacio subretiniano; detectable por OCT de alta resolución o ultrasonido ocular.",
            clinical:
              "La muerte súbita de la larva desencadena una tormenta inflamatoria intraocular devastadora (endamoftalmitis por Toxocara), por lo que el manejo antiinflamatorio esteroideo es prioritario.",
            threeDNote:
              "Modelada dentro del domo granulomatoso y revelada mediante transparencia o corte 3D.",
          },
          {
            id: 3,
            name: "Banda de Tracción Vitreorretiniana y Pliegue Falciforme",
            shortLabel: "Pliegue de tracción",
            category: "Secuela Mecánica",
            colorBio: "#93c5fd",
            colorGiemsa: "#6366f1",
            anchor: [0.95, 0.35, 0.25],
            cameraPos: [1.9, 0.8, 2.6],
            lookAt: [0.5, 0.2, 0.1],
            description:
              "Cordón fibroso contráctil de organización vítrea que se extiende desde el granuloma hacia el disco óptico o la pars plana periférica, traccionando la retina neurosensorial.",
            microscopy:
              "Proliferación miofibroblástica y glial a lo largo de la hialoides posterior que levanta un pliegue retiniano radial.",
            clinical:
              "Provoca ectopia macular, metamorfopsia y desprendimiento de retina traccional o regmatógeno secundario, principal causa de ceguera permanente en la LMO.",
            threeDNote:
              "Representado como bandas tensas nacaradas que conectan la cúpula granulomatosa con el disco óptico.",
          },
          {
            id: 4,
            name: "Lecho Retiniano Neurosensorial y Vasos Retinianos",
            shortLabel: "Retina y vasos",
            category: "Tejido Hospedador",
            colorBio: "#e11d48",
            colorGiemsa: "#be123c",
            anchor: [-1.05, -0.25, 0.35],
            cameraPos: [-2.0, 0.4, 2.6],
            lookAt: [-0.5, -0.1, 0.1],
            description:
              "Fondo de ojo cóncavo con epitelio pigmentario, retina neurosensorial y arcadas vasculares retinianas que convergen hacia la papila óptica.",
            microscopy:
              "Los vasos retinianos muestran envainamiento perivascular inflamatorio (vasculitis retiniana) e infiltrado subretiniano.",
            clinical:
              "La fotocoagulación láser o la vitrectomía pars plana se reservan para desprendimientos traccionales o larvas móviles extramaculares.",
            threeDNote:
              "Copa cóncava posterior con relieve vascular 3D que sirve de asiento anatómico al granuloma.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Adulto Canino con Alas Cervicales Lanceoladas (10–18 cm)",
        shortName: "4. Adulto (Hospedador Canino)",
        subtitle: "Extremo anterior con 3 labios carnosos, amplias alas cervicales en punta de lanza y esófago con ventrículo",
        sizeRange: "Macho 4–10 cm · Hembra 6–18 cm",
        scaleMicrons: 2000,
        defaultTranslucency: 38,
        defaultCut: 0,
        defaultMotility: 30,
        defaultCameraPos: [0.2, 0.4, 4.2],
        summary:
          "El adulto de Toxocara canis habita exclusivamente el intestino delgado del perro y otros cánidos (especialmente cachorros <6 meses infectados por vía transplacentaria y lactogénica). Posee en su extremo anterior dos prominentes alas cervicales estrechas y alargadas («en punta de lanza» o flecha), tres labios carnosos y un esófago muscular terminado en un ventrículo glandular posterior.",
        diagnosticPearl:
          "Diferenciación con Toxocara cati: T. canis tiene alas cervicales largas y estrechas (aspecto de lanza), mientras que T. cati tiene alas cervicales muy anchas y cortas con borde posterior abrupto («aspecto de cabeza de cobra»).",
        regions: [
          {
            id: 1,
            name: "Alas Cervicales Lanceoladas (Estrechas y Alargadas)",
            shortLabel: "Alas cervicales",
            category: "Carácter Taxonómico Clave",
            colorBio: "#fde68a",
            colorGiemsa: "#c084fc",
            anchor: [-0.95, 0.55, 0.35],
            cameraPos: [-1.8, 0.9, 2.5],
            lookAt: [-0.6, 0.3, 0.1],
            description:
              "Par de expansiones cuticulares laterales hialinas, largas y gradualmente ahusadas (2–2.5 mm × 0.2 mm) situadas en los flancos del extremo cefálico.",
            microscopy:
              "Con lupa estereoscópica o microscopía a bajo aumento presentan estriaciones transversales finas y silueta lanceolada simétrica.",
            clinical:
              "Permiten identificar con certeza adultos expulsados por cachorros o ocasionalmente vomitados/eliminados por mascotas convivientes del paciente.",
            threeDNote:
              "Modeladas como aletas cuticulares semitransparentes bilaterales a ambos lados del segmento anterior.",
          },
          {
            id: 2,
            name: "Tres Labios Cefálicos Carnosos (1 Dorsal y 2 Subventrales)",
            shortLabel: "Tres labios bucales",
            category: "Extremo Anterior Ascaridida",
            colorBio: "#f59e0b",
            colorGiemsa: "#9333ea",
            anchor: [-1.35, 0.25, 0.15],
            cameraPos: [-2.2, 0.5, 2.2],
            lookAt: [-1.1, 0.15, 0.0],
            description:
              "Aparato bucal trilabiado típico del orden Ascaridida, provisto de papilas sensoriales labiales y bordes denticulados finos.",
            microscopy:
              "En vista frontal o apical forman un trébol simétrico con un labio dorsal ancho y dos labios lateroventrales.",
            clinical:
              "Permite al nematodo adulto mantenerse orientado contra el peristaltismo en el lumen yeyunal del cachorro sin fijarse a la mucosa.",
            threeDNote:
              "Tres lóbulos esferoidales esculpidos en el polo cefálico anterior.",
          },
          {
            id: 3,
            name: "Esófago Muscular Claviforme y Ventrículo Glandular",
            shortLabel: "Esófago y ventrículo",
            category: "Tracto Digestivo Interno",
            colorBio: "#38bdf8",
            colorGiemsa: "#4f46e5",
            anchor: [-0.35, 0.15, 0.25],
            cameraPos: [-0.8, 0.5, 2.4],
            lookAt: [-0.25, 0.1, 0.05],
            description:
              "Esófago cilíndrico muscular que culmina en un bulbo o ventrículo glandular posterior intercalado antes del intestino medio (rasgo diferencial del género Toxocara frente a Ascaris).",
            microscopy:
              "Al aclarar el ejemplar con lactofenol se distingue nítidamente la constricción y el ventrículo glandular entre el esófago y el intestino.",
            clinical:
              "Bombea el quimo intestinal del hospedador canino para sostener la enorme demanda metabólica de la oviposición.",
            threeDNote:
              "Tubo interno con bulbo ventricular visible por transparencia o al seccionar la cutícula con «Corte Histológico».",
          },
          {
            id: 4,
            name: "Asas Uterinas Grávidas (200.000 huevos/día)",
            shortLabel: "Útero grávido",
            category: "Aparato Reproductor",
            colorBio: "#f43f5e",
            colorGiemsa: "#db2777",
            anchor: [0.85, -0.15, 0.3],
            cameraPos: [1.7, 0.2, 2.6],
            lookAt: [0.5, -0.1, 0.1],
            description:
              "Sistema genital femenino didelfo con ovarios filiformes y úteros tubulares repletos de millones de huevos subglobulares.",
            microscopy:
              "Ocupa los dos tercios posteriores de la cavidad pseudocelómica de la hembra adulta.",
            clinical:
              "Una sola hembra deposita hasta 200.000 huevos diarios en las heces del cachorro; por ello la desparasitación sistemática de cachorros desde las 2 semanas de vida es el pilar de la prevención.",
            threeDNote:
              "Cordones helicoidales internos cargados de microesferas ovulares expuestos al abrir el cuerpo con el corte histológico.",
          },
        ],
      },
    },
  },
  p07: {
    code: "p07",
    scientificName: "Entamoeba histolytica",
    commonName: "Amebiasis Invasiva (Colitis Disentérica y Absceso Hepático)",
    taxonomyBadge: "P07 · Protozoo Ameboide Sarcodino",
    stainLabel: "Tinción Tricrómico / Lugol",
    stages: {
      stage1: {
        id: "stage1",
        label: "Trofozoíto Hematófago Invasivo (20–40 µm) — Eritrofagocitosis",
        shortName: "1. Trofozoíto Hematófago",
        subtitle: "Pseudópodo ectoplásmico hialino digitiforme, núcleo en «ojo de buey» y eritrocitos fagocitados",
        sizeRange: "15 – 60 µm (promedio 20–30 µm)",
        scaleMicrons: 10,
        defaultTranslucency: 58,
        defaultCut: 0,
        defaultMotility: 55,
        defaultCameraPos: [0.2, 0.35, 3.8],
        summary:
          "El trofozoíto invasivo de Entamoeba histolytica presenta diferenciación nítida entre un ectoplasma externo hialino (que emite pseudópodos digitiformes explosivos unidireccionales) y un endoplasma finamente granuloso. Su único núcleo esférico muestra un cariosoma pequeño puntiforme estrictamente central y cromatina periférica fina uniformemente distribuida en «rueda de carreta» u «ojo de buey». El hallazgo de eritrocitos ingeridos en el endoplasma (eritrofagocitosis) es patognomónico de E. histolytica invasiva frente a la comensal E. dispar.",
        diagnosticPearl:
          "E. histolytica, E. dispar y E. moshkovskii son morfológicamente IDÉNTICAS en estadio de quiste; solo la presencia de trofozoítos con ERITROFAGOCITOSIS en heces disentéricas frescas (o PCR / antígeno específico de lectina Gal/GalNAc) confirma E. histolytica al microscopio.",
        regions: [
          {
            id: 1,
            name: "Núcleo Vesicular en «Ojo de Buey» (Cariosoma Central Puntiforme)",
            shortLabel: "Núcleo cariosoma central",
            category: "Criterio Nuclear Diagnóstico",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.35, 0.18, 0.25],
            cameraPos: [-1.1, 0.5, 2.2],
            lookAt: [-0.25, 0.1, 0.1],
            description:
              "Núcleo único esférico (4–6 µm) con membrana nuclear tapizada por gránulos de cromatina periférica finos y equidistantes, un cariosoma diminuto compacto en el centro exacto y finas fibrillas acromáticas radiales.",
            microscopy:
              "En tinción tricrómico de Gomori-Wheatley o hematoxilina férrica el cariosoma central y el anillo de cromatina periférica se tiñen de rojo-púrpura/negro nítido.",
            clinical:
              "Lo diferencia de Entamoeba coli (cariosoma grande y excéntrico con cromatina periférica irregular en grumos) y de Endolimax nana (cariosoma enorme en «mancha de tinta»).",
            threeDNote:
              "Modelado en 3D con anillo de cuentas de cromatina periférica, radios acromáticos y cariosoma central; completamente expuesto al activar «Corte Histológico».",
          },
          {
            id: 2,
            name: "Eritrocitos Fagocitados en Endoplasma (Eritrofagocitosis)",
            shortLabel: "Eritrocitos ingeridos",
            category: "Hallazgo Patognomónico",
            colorBio: "#ef4444",
            colorGiemsa: "#be123c",
            anchor: [0.42, -0.08, 0.3],
            cameraPos: [1.3, 0.1, 2.3],
            lookAt: [0.3, -0.05, 0.1],
            description:
              "Glóbulos rojos humanos intactos y parcialmente digeridos contenidos dentro de vacuolas fagocíticas del endoplasma granuloso (ausencia de bacterias gruesas).",
            microscopy:
              "En tricrómico se tiñen de color rojo rubí brillante o verde-azulado oscuro de 2 a 7 µm según su grado de digestión enzimática.",
            clinical:
              "Es el único marcador microscópico directo que confirma capacidad invasiva tisular (E. histolytica sensu stricto) y obliga a tratamiento secuencial (metronidazol/tinidazol + amebicida luminal).",
            threeDNote:
              "Discos bicóncavos 3D en distintos tamaños de digestión dentro de vacuolas fagocíticas internas.",
          },
          {
            id: 3,
            name: "Pseudópodo Ectoplásmico Hialino Digitiforme",
            shortLabel: "Pseudópodo hialino",
            category: "Locomoción y Adhesión",
            colorBio: "#67e8f9",
            colorGiemsa: "#0284c7",
            anchor: [1.18, 0.15, 0.2],
            cameraPos: [2.1, 0.4, 2.5],
            lookAt: [0.7, 0.1, 0.05],
            description:
              "Proyección lobular anterior transparente de ectoplasma rico en actomiosina que se extiende de forma rápida y direccional («como una babosa»).",
            microscopy:
              "En examen en fresco de moco sanguinolento a 37 °C se observa la transición brusca entre el ectoplasma cristalino del pseudópodo y el endoplasma finamente granulado.",
            clinical:
              "Expresa en su superficie la lectina de adherencia inhibible por galactosa/N-acetilgalactosamina (Gal/GalNAc), que se une al epitelio colónico antes de liberar amebaporos y cisteína-proteasas.",
            threeDNote:
              "Prolongación hialina anterior con deformación ameboide progresiva en tiempo real.",
          },
          {
            id: 4,
            name: "Endoplasma Finamente Granuloso y Vesículas de Amebaporos",
            shortLabel: "Endoplasma y amebaporos",
            category: "Maquinaria Citolítica",
            colorBio: "#fda4af",
            colorGiemsa: "#9f1239",
            anchor: [-0.55, -0.35, 0.35],
            cameraPos: [-1.4, -0.6, 2.4],
            lookAt: [-0.3, -0.2, 0.1],
            description:
              "Citoplasma interno de aspecto «en vidrio esmerilado» limpio (sin restos fecales ni bacterias) rico en mitosomas y gránulos citolíticos de amebaporos A, B y C.",
            microscopy:
              "En tinción tricrómico presenta coloración verde-azulada o gris-verdosa uniforme y limpia.",
            clinical:
              "Los péptidos formadores de poros (amebaporos) y las cisteína-proteasas (EhCP1, EhCP5) lisan por contacto a los enterocitos, neutrófilos y hepatocitos («el nombre histolytica significa literalmente destructor de tejidos»).",
            threeDNote:
              "Matriz interna translúcida con gránulos citolíticos 3D visibles en el corte transversal.",
          },
        ],
      },
      stage2: {
        id: "stage2",
        label: "Quiste Maduro Tetranucleado (12–15 µm) — Barras de Extremos Romos",
        shortName: "2. Quiste Maduro (4 Núcleos)",
        subtitle: "Esférico con 4 núcleos de cariosoma central y cuerpos cromatoidales en «habano» de bordes redondeados",
        sizeRange: "10 – 20 µm (promedio 12–15 µm)",
        scaleMicrons: 5,
        defaultTranslucency: 54,
        defaultCut: 0,
        defaultMotility: 20,
        defaultCameraPos: [0.2, 0.35, 3.6],
        summary:
          "El quiste maduro es la forma infectante y de resistencia ambiental de Entamoeba histolytica, excretada en heces formadas. Es rigurosamente esférico (12–15 µm), rodeado por una pared quística quitinosa refringente, y contiene exactamente 4 núcleos vesiculares con cariosoma central puntiforme (nunca más de 4, lo que lo diferencia de E. coli que tiene 8) y barras cromatoidales ribonucleoproteicas gruesas con extremos redondeados/romos («en forma de habano o salchicha»).",
        diagnosticPearl:
          "Diferenciación clave de quistes: E. histolytica/dispar tiene ≤4 núcleos + barras cromatoidales de extremos ROMOS (redondeados); Entamoeba coli mide 15–25 µm, tiene ≥5 (hasta 8) núcleos de cariosoma excéntrico y barras cromatoidales en «astilla de madera» con extremos puntiagudos.",
        regions: [
          {
            id: 1,
            name: "Cuatro Núcleos Vesiculares con Cariosoma Central",
            shortLabel: "4 núcleos (cariosoma central)",
            category: "Diagnóstico Nuclear",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [-0.35, 0.35, 0.3],
            cameraPos: [-1.1, 0.8, 2.2],
            lookAt: [-0.2, 0.2, 0.1],
            description:
              "Cuatro núcleos esféricos (2–3 µm cada uno) dispuestos en distintos planos focales del quiste maduro, cada uno con cariosoma central puntiforme y cromatina periférica uniforme.",
            microscopy:
              "En montaje con solución de Lugol se tiñen de pardo-amarillento brillante; al mover el tornillo micrométrico se cuentan hasta 4 núcleos (nunca 8).",
            clinical:
              "Tras ser ingerido, el quiste tetranucleado sufre desenquistamiento en el íleon terminal originando una ameba metacística que se divide en 8 trofozoítos uninucleados.",
            threeDNote:
              "Cuatro núcleos 3D completos con anillo de cromatina periférica y cariosoma central dispuestos tetraédricamente en el interior del quiste.",
          },
          {
            id: 2,
            name: "Barras Cromatoidales en «Habano» de Extremos Romos",
            shortLabel: "Barras extremos romos",
            category: "Criterio Diferencial Patognomónico",
            colorBio: "#e11d48",
            colorGiemsa: "#be123c",
            anchor: [0.35, -0.15, 0.32],
            cameraPos: [1.2, -0.3, 2.2],
            lookAt: [0.2, -0.1, 0.1],
            description:
              "Agregados cristalinos de ribosomas dispuestos en bastones cilíndricos gruesos con ambos extremos suavemente redondeados o romos.",
            microscopy:
              "En tinción tricrómico destacan como bastones rojo-escarlata intenso sobre el citoplasma verde-azulado; en solución salina son refringentes (no se tiñen con Lugol).",
            clinical:
              "Sus extremos romos permiten diferenciar al complejo E. histolytica/dispar de E. coli (cuyos cuerpos cromatoidales tienen extremos astillados o filosos).",
            threeDNote:
              "Modeladas como cápsulas cilíndricas de extremos hemisféricos romos en el citoplasma quístico.",
          },
          {
            id: 3,
            name: "Pared Quística Quitinosa Refringente",
            shortLabel: "Pared quística",
            category: "Resistencia Ambiental",
            colorBio: "#94a3b8",
            colorGiemsa: "#64748b",
            anchor: [-0.85, 0.55, 0.25],
            cameraPos: [-1.7, 1.0, 2.5],
            lookAt: [-0.4, 0.3, 0.1],
            description:
              "Cubierta esférica rígida e incolora de ~125 nm de grosor compuesta por microfibrillas de quitina y lectinas fijadoras de quitina (Jacob y Jessie).",
            microscopy:
              "Se observa como un halo liso, uniforme y altamente refringente alrededor del citoplasma.",
            clinical:
              "Confiere resistencia al pH ácido gástrico y a las concentraciones habituales de cloro del agua potable, sobreviviendo semanas en ambientes húmedos y bajo las uñas.",
            threeDNote:
              "Esfera externa translúcida que se secciona limpiamente al deslizar «Corte Histológico».",
          },
          {
            id: 4,
            name: "Vacuola de Glucógeno Residual (Yodófila)",
            shortLabel: "Vacuola de glucógeno",
            category: "Reserva Energética",
            colorBio: "#d97706",
            colorGiemsa: "#b45309",
            anchor: [0.15, 0.45, -0.25],
            cameraPos: [0.8, 1.0, -2.1],
            lookAt: [0.1, 0.25, -0.1],
            description:
              "Depósito citoplasmático de glucógeno muy prominente en prequistes y quistes inmaduros (1–2 núcleos) que se consume progresivamente al madurar el quiste.",
            microscopy:
              "Con tinción de Lugol adquiere un color caoba o pardo-rojizo intenso característico; en tricrómico aparece como un espacio vacuolar claro.",
            clinical:
              "Proporciona la energía glucolítica necesaria para la supervivencia ambiental y el desenquistamiento intestinal.",
            threeDNote:
              "Esfera ambarina translúcida situada entre los núcleos y las barras cromatoidales.",
          },
        ],
      },
      stage3: {
        id: "stage3",
        label: "Úlcera Colónica en «Botón de Camisa» o Matraz (Histopatología)",
        shortName: "3. Úlcera en Botón de Camisa",
        subtitle: "Cuello estrecho en mucosa colónica con amplia socavación lateral necrótica en la submucosa",
        sizeRange: "Lesión mucosa 2–10 mm (Trofozoítos 25 µm)",
        scaleMicrons: 500,
        defaultTranslucency: 45,
        defaultCut: 0,
        defaultMotility: 35,
        defaultCameraPos: [0.15, 0.55, 4.3],
        summary:
          "La lesión anatomopatológica clásica de la colitis amebiana invasiva (predominante en ciego y colon ascendente/rectosigmoides) es la «úlcera en botón de camisa» o «en matraz» (flask-shaped ulcer). Los trofozoítos perforan focalmente el epitelio y la muscularis mucosae formando un orificio de entrada estrecho, pero al llegar a la submucosa laxa se expanden lateralmente destruyendo el tejido y socavando la mucosa adyacente relativamente conservada.",
        diagnosticPearl:
          "En colonoscopía se observan úlceras discretas con bordes sobreelevados y exudado amarillento separadas por mucosa de aspecto normal (a diferencia de la colitis ulcerosa idiopática donde la inflamación es continua). Las biopsias deben tomarse del BORDE de la úlcera (teñir con PAS) donde residen los trofozoítos.",
        regions: [
          {
            id: 1,
            name: "Cuello Mucoso Estrecho (Criptas de Lieberkühn y Muscularis Mucosae)",
            shortLabel: "Cuello mucoso estrecho",
            category: "Puerta de Entrada",
            colorBio: "#f472b6",
            colorGiemsa: "#db2777",
            anchor: [0.0, 0.72, 0.35],
            cameraPos: [0.1, 1.3, 2.5],
            lookAt: [0.0, 0.5, 0.1],
            description:
              "Brecha focal estrecha a través del epitelio cilíndrico colónico y la lámina muscular de la mucosa por donde penetran inicialmente los trofozoítos.",
            microscopy:
              "La mucosa colónica vecina al cuello ulceroso muestra arquitectura glandular sorprendentemente preservada con escaso infiltrado neutrofílico.",
            clinical:
              "Explica por qué los raspados superficiales pueden ser falsamente negativos si no se alcanza el borde socavado de la lesión.",
            threeDNote:
              "Abertura superior estrecha flanqueada por columnas de criptas mucosas colónicas 3D.",
          },
          {
            id: 2,
            name: "Cavidad Submucosa Socavada en «Matraz» (Necrosis Licuefactiva)",
            shortLabel: "Cavidad en matraz",
            category: "Arquitectura Patognomónica",
            colorBio: "#fbbf24",
            colorGiemsa: "#d97706",
            anchor: [0.0, -0.15, 0.3],
            cameraPos: [0.2, 0.1, 2.6],
            lookAt: [0.0, -0.1, 0.05],
            description:
              "Amplia cámara necrótica de base ancha en la submucosa rellena de restos celulares eosinofílicos acelulares, fibrina y mucina («pus en pasta de anchoas»).",
            microscopy:
              "Escasez llamativa de neutrófilos intactos debido a que los trofozoítos de E. histolytica lisan a los polimorfonucleares al contacto.",
            clinical:
              "Si la necrosis atraviesa la muscular propia hacia la serosa, provoca perforación colónica fulminante, peritonitis o ameboma (masa pseudotumoral granulomatosa).",
            threeDNote:
              "Cavidad acampanada submucosa expuesta en sección transversal 3D.",
          },
          {
            id: 3,
            name: "Frente de Invasión de Trofozoítos Hematófagos (PAS+)",
            shortLabel: "Frente de trofozoítos",
            category: "Zona Diagnóstica de Biopsia",
            colorBio: "#a855f7",
            colorGiemsa: "#9333ea",
            anchor: [-0.82, -0.28, 0.35],
            cameraPos: [-1.7, -0.2, 2.5],
            lookAt: [-0.5, -0.2, 0.1],
            description:
              "Agrupación de trofozoítos invasivos con eritrocitos fagocitados situados exactamente en la interfase entre el tejido necrótico y la submucosa viable.",
            microscopy:
              "En H&E pueden confundirse con macrófagos grandes; la tinción de Ácido Peryódico de Schiff (PAS) tiñe intensamente de magenta el glucógeno citoplasmático de los trofozoítos.",
            clinical:
              "Desde este borde submucoso los trofozoítos invaden las vénulas mesentéricas superiores y viajan por la vena porta hasta el lóbulo derecho del hígado.",
            threeDNote:
              "Trofozoítos 3D con núcleo y eritrocitos internos alineados en las paredes laterales del matraz.",
          },
          {
            id: 4,
            name: "Invasión Venular Portal (Vía al Absceso Hepático Amebiano)",
            shortLabel: "Invasión venular portal",
            category: "Diseminación Extraintestinal",
            colorBio: "#ef4444",
            colorGiemsa: "#b91c1c",
            anchor: [0.85, -0.58, 0.25],
            cameraPos: [1.8, -0.6, 2.5],
            lookAt: [0.5, -0.45, 0.05],
            description:
              "Vénulas submucosas tributarias del sistema portal erosionadas por las cisteína-proteasas amebianas con trofozoítos intravasculares.",
            microscopy:
              "Trombosis venular focal y presencia de trofozoítos en la luz vascular submucosa.",
            clinical:
              "Origina el Absceso Hepático Amebiano (AHA): lesión única en el lóbulo hepático derecho (80%), más frecuente en varones adultos, con fiebre en agujas y dolor en hipocondrio derecho (A menudo SIN diarrea concomitante).",
            threeDNote:
              "Vaso venoso basal en la base de la submucosa con trofozoítos penetrando su pared.",
          },
        ],
      },
      stage4: {
        id: "stage4",
        label: "Absceso Hepático Amebiano (AHA) y Diagnóstico Diferencial E. coli",
        shortName: "4. Quiste Inmaduro / E. coli (Diferencial)",
        subtitle: "Comparación tridimensional directa: Prequiste con vacuola de glucógeno vs. Quiste de Entamoeba coli (8 núcleos)",
        sizeRange: "E. histolytica 12–15 µm (≤4n) vs E. coli 15–25 µm (8n)",
        scaleMicrons: 10,
        defaultTranslucency: 55,
        defaultCut: 0,
        defaultMotility: 25,
        defaultCameraPos: [0.1, 0.4, 4.1],
        summary:
          "El desafío diario en microscopía coproparasitológica es no confundir los quistes del patógeno Entamoeba histolytica (que exige tratamiento) con la ameba comensal no patógena Entamoeba coli (que no requiere tratamiento). Esta vista comparativa lado a lado muestra a la izquierda el quiste de E. histolytica (12–15 µm, ≤4 núcleos de cariosoma central, barras de extremos romos) y a la derecha el quiste de E. coli (15–25 µm, 8 núcleos de cariosoma excéntrico y cromatina periférica gruesa irregular, y barras cromatoidales astilladas en punta).",
        diagnosticPearl:
          "Regla de oro del laboratorio: Cualquier quiste de Entamoeba con MÁS de 4 núcleos (5 a 8 núcleos) y barras cromatoidales en «astilla de escoba» es Entamoeba coli (comensal inocuo, marcador de contaminación fecal-oral, NO tratar). Para erradicar los quistes luminales de E. histolytica tras el metronidazol, SIEMPRE administrar paromomicina, yodoquinol o furoato de diloxanida.",
        regions: [
          {
            id: 1,
            name: "Quiste de E. histolytica (Izquierda: 12–15 µm, 4 Núcleos Centrales)",
            shortLabel: "E. histolytica (4 núcleos)",
            category: "Especie Patógena",
            colorBio: "#38bdf8",
            colorGiemsa: "#0284c7",
            anchor: [-0.95, 0.25, 0.3],
            cameraPos: [-1.8, 0.5, 2.5],
            lookAt: [-0.85, 0.1, 0.0],
            description:
              "Quiste más pequeño (12–15 µm) con máximo 4 núcleos de cariosoma central puntiforme y cromatina periférica fina uniforme.",
            microscopy:
              "Al microscopio es necesario confirmar con inmunoensayo de antígeno específico (lectina Gal/GalNAc en heces frescas) o PCR para distinguirlo de E. dispar.",
            clinical:
              "Todo portador confirmado de E. histolytica debe recibir un amebicida luminal (paromomicina) para evitar que evolucione a colitis invasiva o absceso hepático y cortar la transmisión.",
            threeDNote:
              "Esfera izquierda con 4 núcleos simétricos y barras en habano de bordes redondeados.",
          },
          {
            id: 2,
            name: "Barras Cromatoidales de Extremos Romos (E. histolytica)",
            shortLabel: "Barras romas (E. histolytica)",
            category: "Criterio de E. histolytica",
            colorBio: "#f43f5e",
            colorGiemsa: "#e11d48",
            anchor: [-0.85, -0.25, 0.35],
            cameraPos: [-1.6, -0.4, 2.3],
            lookAt: [-0.85, -0.15, 0.1],
            description:
              "Cuerpos cromatoidales cilíndricos con extremos lisos y hemisféricos («en cigarro habano»).",
            microscopy:
              "Frecuentes en quistes inmaduros (1–2 núcleos) y maduros jóvenes teñidos con tricrómico o hematoxilina férrica.",
            clinical:
              "Hallazgo morfológico clásico de pregunta de examen para identificar E. histolytica/dispar.",
            threeDNote:
              "Cápsulas rojas de bordes redondeados dentro del quiste izquierdo.",
          },
          {
            id: 3,
            name: "Quiste de Entamoeba coli (Derecha: 15–25 µm, 8 Núcleos Excéntricos)",
            shortLabel: "E. coli (8 núcleos excéntricos)",
            category: "Comensal No Patógeno",
            colorBio: "#a855f7",
            colorGiemsa: "#7e22ce",
            anchor: [0.95, 0.35, 0.35],
            cameraPos: [1.9, 0.6, 2.6],
            lookAt: [0.85, 0.15, 0.0],
            description:
              "Quiste de mayor diámetro (15–25 µm) que contiene 8 núcleos en su estado maduro, cada uno con cariosoma grande EXCÉNTRICO y cromatina periférica gruesa y desigual.",
            microscopy:
              "En montaje con Lugol se cuentan fácilmente 5, 6, 7 u 8 núcleos distribuidos en distintos planos focales.",
            clinical:
              "Entamoeba coli es un comensal estricto del colon humano; NO invade tejidos ni requiere tratamiento antiparasitario, aunque indica ingestión de agua o alimentos con contaminación fecal.",
            threeDNote:
              "Esfera derecha ~1.4× más grande con 8 núcleos de cariosoma desplazado lateralmente.",
          },
          {
            id: 4,
            name: "Barras Cromatoidales Astilladas en Punta (Entamoeba coli)",
            shortLabel: "Barras astilladas (E. coli)",
            category: "Criterio de E. coli",
            colorBio: "#fbbf24",
            colorGiemsa: "#d97706",
            anchor: [0.92, -0.32, 0.38],
            cameraPos: [1.8, -0.5, 2.4],
            lookAt: [0.85, -0.2, 0.1],
            description:
              "Cuerpos cromatoidales delgados y fasciculados con extremos irregulares, aguzados o deshilachados («en astilla de madera» o «escoba rota»).",
            microscopy:
              "En tricrómico se observan como haces de agujas o astillas puntiagudas cruzadas en el citoplasma.",
            clinical:
              "Distinción morfológica definitiva frente a las barras de extremos romos de E. histolytica.",
            threeDNote:
              "Modelados como haces de husos biconos puntiagudos dentro del quiste derecho.",
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

    // Gentle organic motility wave
    float wave = sin(pos.x * 3.8 + pos.y * 2.9 + uTime * 2.4) * 0.016 * uMotility;
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
    float frac = fract(vRegionId); // frac > 0.2 marks outer shell that gets cut in histological section

    if (uCutPercent > 0.01 && frac > 0.2) {
      float cutPlane = mix(1.45, -0.55, uCutPercent);
      if (vLocalPos.z + vLocalPos.y * 0.35 > cutPlane) {
        discard;
      }
    }

    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(vViewPos);
    N = perturbNormalAnalytical(N, vLocalPos, 11.0, 0.08);

    vec3 L1 = normalize(vec3(2.4, 3.2, 2.8));
    vec3 L2 = normalize(vec3(-2.5, -1.5, 1.8));
    float diff1 = max(dot(N, L1), 0.0);
    float diff2 = max(dot(N, L2), 0.0) * 0.35;
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.6);

    vec3 baseCol = vColor;
    vec3 finalCol = baseCol;
    float alpha = 1.0;

    if (uShaderMode == 0) {
      // Biological SSS
      float sss = pow(max(dot(-L1, V), 0.0), 2.2) * 0.4;
      vec3 spec = vec3(1.0, 0.97, 0.92) * pow(max(dot(reflect(-L1, N), V), 0.0), 28.0) * 0.35;
      finalCol = baseCol * (0.28 + diff1 * 0.72 + diff2) + baseCol * sss + spec + vec3(0.18, 0.24, 0.3) * fresnel * 0.35;
      if (frac > 0.2) {
        alpha = mix(0.96, 0.32, uTranslucency);
      }
    } else if (uShaderMode == 1) {
      // Brightfield Tricrómico / Lugol / H&E
      vec3 stainShift = mix(baseCol, vec3(baseCol.r * 0.9, baseCol.g * 0.58, baseCol.b * 1.15), 0.45);
      finalCol = stainShift * (0.48 + diff1 * 0.52) + vec3(0.95, 0.9, 0.98) * fresnel * 0.25;
      if (frac > 0.2) {
        alpha = mix(0.92, 0.28, uTranslucency);
      }
    } else if (uShaderMode == 2) {
      // SEM
      float lum = dot(baseCol, vec3(0.299, 0.587, 0.114));
      float micro = noise3D(vLocalPos * 24.0) * 0.18;
      vec3 semBase = vec3(0.52 + lum * 0.28 + micro);
      finalCol = semBase * (0.22 + diff1 * 0.58) + vec3(0.88, 0.92, 0.96) * fresnel * 0.72;
      alpha = frac > 0.2 ? mix(0.98, 0.5, uTranslucency * 0.5) : 1.0;
    } else {
      // X-Ray
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

/**
 * Geometry builder helper with explicit emission order (internal organs first, outer shells second)
 */
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

        let nx = Math.sin(phi) * Math.cos(theta);
        let ny = Math.cos(phi);
        let nz = Math.sin(phi) * Math.sin(theta);

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
    radialSeg = 16
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
 * Helper to add a bull's-eye vesicular nucleus (central karyosome + spoke-like peripheral chromatin)
 * or eccentric karyosome nucleus (for Entamoeba coli).
 */
function addEntamoebaNucleus(
  b: BioMeshBuilder,
  cx: number,
  cy: number,
  cz: number,
  radius: number,
  regionId: number,
  eccentric = false
) {
  // 1. Central (or eccentric) karyosome
  const kx = eccentric ? cx + radius * 0.36 : cx;
  const ky = eccentric ? cy + radius * 0.22 : cy;
  const kr = eccentric ? radius * 0.26 : radius * 0.17;
  b.addSphere(kx, ky, cz, kr, kr, kr, "#581c87", regionId, 14, 12);

  // 2. Peripheral chromatin beads along nuclear rim
  const beadCount = eccentric ? 10 : 14;
  for (let i = 0; i < beadCount; i++) {
    const ang = (i / beadCount) * Math.PI * 2;
    const bx = cx + Math.cos(ang) * radius * 0.84;
    const by = cy + Math.sin(ang) * radius * 0.84;
    const br = eccentric ? radius * (0.11 + (i % 3) * 0.04) : radius * 0.095;
    b.addSphere(bx, by, cz, br, br, br, "#7e22ce", regionId, 10, 8);
  }

  // 3. Translucent nuclear envelope
  b.addSphere(cx, cy, cz, radius, radius, radius, "#c084fc", regionId + 0.3, 18, 14);
}

function buildStageGeometry(speciesCode: "p06" | "p07", stageId: StageId): THREE.BufferGeometry {
  const b = new BioMeshBuilder();

  if (speciesCode === "p06") {
    if (stageId === "stage1") {
      // P06 Stage 1: Toxocara canis Embryonated Egg (golf-ball pitted shell + coiled L3 larva inside)
      // Emit internal coiled L3 larva FIRST (region 3 & 4)
      const larvaPts: [number, number, number][] = [];
      const larvaRadii: number[] = [];
      const steps = 85;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ang = t * Math.PI * 5.2;
        const rOrbit = 0.48 - t * 0.14 + Math.sin(t * Math.PI * 2) * 0.08;
        const lx = Math.cos(ang) * rOrbit;
        const ly = Math.sin(ang) * rOrbit * 0.82 + Math.cos(ang * 0.5) * 0.22;
        const lz = Math.sin(ang * 1.5) * 0.32;
        larvaPts.push([lx, ly, lz]);
        const taper = t < 0.08 ? 0.5 + t * 6.0 : t > 0.85 ? (1.0 - t) * 6.5 : 1.0;
        larvaRadii.push(Math.max(0.025, 0.115 * taper));
      }
      // Esophageal anterior segment (region 4)
      b.addTube(larvaPts.slice(0, 26), larvaRadii.slice(0, 26), "#38bdf8", 4, 16);
      // Coiled body of L3 larva (region 3)
      b.addTube(larvaPts.slice(25), larvaRadii.slice(25), "#fef3c7", 3, 16);

      // Inner lipid ascaroside layer (region 2.4 -> cuttable shell)
      b.addSphere(0, 0, 0, 0.92, 0.84, 0.84, "#e8d5b5", 2.4, 32, 24);

      // Outer golf-ball pitted proteinaceous shell (region 1.4 -> cuttable shell)
      b.addSphere(0, 0, 0, 1.16, 1.05, 1.05, "#b47b38", 1.4, 48, 36, (px, py, pz) => {
        const pit =
          Math.sin(px * 14.0) * Math.sin(py * 14.0) * Math.sin(pz * 14.0) * 0.045 -
          Math.abs(Math.cos(px * 19.0 + py * 17.0) * Math.sin(pz * 18.0)) * 0.035;
        const len = Math.hypot(px, py, pz) || 1;
        return [px + (px / len) * pit, py + (py / len) * pit, pz + (pz / len) * pit];
      });
    } else if (stageId === "stage2") {
      // P06 Stage 2: Hepatic Eosinophilic Granuloma (Visceral Larva Migrans)
      // 1. Migrating L3 larva in the center (region 1)
      const pts: [number, number, number][] = [];
      const rads: number[] = [];
      for (let i = 0; i <= 50; i++) {
        const t = (i / 50) * 2 - 1;
        pts.push([
          t * 0.95,
          Math.sin(t * 4.2) * 0.26,
          Math.cos(t * 3.5) * 0.18 + 0.12,
        ]);
        const taper = 1.0 - Math.pow(Math.abs(t), 3.2) * 0.75;
        rads.push(0.095 * taper);
      }
      b.addTube(pts, rads, "#fef3c7", 1, 16);

      // 2. Charcot-Leyden bipyramidal crystals (region 3)
      const crystalCoords: [number, number, number, number][] = [
        [0.45, -0.28, 0.28, 0.4],
        [-0.42, 0.32, 0.25, -0.5],
        [0.15, -0.42, -0.15, 0.8],
        [-0.55, -0.22, 0.18, 0.2],
        [0.58, 0.25, 0.12, -0.3],
      ];
      for (const [cx, cy, cz, rot] of crystalCoords) {
        const cPts: [number, number, number][] = [
          [cx - Math.cos(rot) * 0.24, cy - Math.sin(rot) * 0.24, cz],
          [cx, cy, cz],
          [cx + Math.cos(rot) * 0.24, cy + Math.sin(rot) * 0.24, cz],
        ];
        b.addTube(cPts, [0.008, 0.068, 0.008], "#fbbf24", 3, 6);
      }

      // 3. Degranulating eosinophils (bilobed nuclei + red granules, region 2)
      for (let i = 0; i < 26; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 26);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 0.68 + (i % 3) * 0.14;
        const ex = r * Math.sin(phi) * Math.cos(theta);
        const ey = r * Math.cos(phi) * 0.85;
        const ez = r * Math.sin(phi) * Math.sin(theta) * 0.85;
        b.addSphere(ex, ey, ez, 0.12, 0.11, 0.11, "#f43f5e", 2, 12, 10);
      }

      // 4. Outer fibrous granuloma capsule (region 4.4 -> cuttable shell)
      b.addSphere(0, 0, 0, 1.35, 1.15, 1.15, "#a855f7", 4.4, 36, 28, (px, py, pz) => {
        const d = Math.sin(px * 6) * Math.cos(py * 6) * 0.05;
        return [px + d, py + d, pz + d];
      });
    } else if (stageId === "stage3") {
      // P06 Stage 3: Ocular Larva Migrans (OLM Retinal Granuloma + traction fold)
      // 1. Subretinal larva inside granuloma (region 2)
      const lPts: [number, number, number][] = [];
      const lRads: number[] = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const a = t * Math.PI * 2.6;
        lPts.push([
          -0.1 + Math.cos(a) * 0.34,
          0.08 + Math.sin(a * 1.5) * 0.14,
          0.08 + Math.sin(a) * 0.25,
        ]);
        lRads.push(0.068 * (1 - Math.pow(Math.abs(t - 0.5) * 1.8, 2) * 0.6));
      }
      b.addTube(lPts, lRads, "#fde047", 2, 14);

      // 2. Concave retinal/choroidal cup & retinal blood vessels (region 4)
      b.addSphere(0, -0.35, -0.15, 1.65, 0.42, 1.45, "#e11d48", 4, 36, 20, (px, py, pz) => {
        const cup = (px * px + pz * pz) * 0.16;
        return [px, py + cup, pz];
      });
      // Retinal vessels
      b.addTube(
        [
          [1.2, -0.05, 0.0],
          [0.5, -0.15, 0.18],
          [-0.2, -0.18, 0.25],
          [-1.1, -0.05, 0.45],
        ],
        [0.045, 0.038, 0.032, 0.022],
        "#991b1b",
        4,
        10
      );

      // 3. Vitreoretinal traction fold band (region 3)
      b.addTube(
        [
          [0.05, 0.24, 0.15],
          [0.55, 0.32, 0.18],
          [1.15, 0.18, 0.05],
        ],
        [0.14, 0.09, 0.16],
        "#93c5fd",
        3,
        14
      );

      // 4. Elevated chorioretinal granuloma dome (region 1.4 -> cuttable shell)
      b.addSphere(-0.08, 0.12, 0.1, 0.78, 0.56, 0.72, "#f8fafc", 1.4, 32, 24);
    } else {
      // P06 Stage 4: Adult Toxocara canis anterior & gravid body (Lanceolate cervical alae + 3 lips + esophagus + gravid uterus)
      // 1. Internal muscular esophagus & glandular ventriculus (region 3)
      b.addTube(
        [
          [-1.32, 0.22, 0.0],
          [-0.85, 0.18, 0.0],
          [-0.38, 0.12, 0.0],
        ],
        [0.08, 0.13, 0.15],
        "#38bdf8",
        3,
        16
      );
      // Ventriculus bulb
      b.addSphere(-0.22, 0.1, 0.0, 0.2, 0.17, 0.17, "#0284c7", 3, 18, 14);

      // 2. Internal gravid uterine coils filled with eggs (region 4)
      const uPts: [number, number, number][] = [];
      const uRads: number[] = [];
      for (let i = 0; i <= 45; i++) {
        const t = i / 45;
        const x = -0.05 + t * 1.45;
        const a = t * Math.PI * 6.0;
        uPts.push([x, -0.08 + Math.sin(a) * 0.18, Math.cos(a) * 0.18]);
        uRads.push(0.085);
      }
      b.addTube(uPts, uRads, "#f43f5e", 4, 14);

      // 3. Three fleshy cephalic lips (1 dorsal, 2 subventral, region 2)
      b.addSphere(-1.42, 0.32, 0.0, 0.14, 0.12, 0.14, "#f59e0b", 2, 16, 12);
      b.addSphere(-1.42, 0.15, 0.13, 0.13, 0.11, 0.12, "#f59e0b", 2, 16, 12);
      b.addSphere(-1.42, 0.15, -0.13, 0.13, 0.11, 0.12, "#f59e0b", 2, 16, 12);

      // 4. Broad lanceolate cervical alae (lateral fins, region 1)
      b.addSphere(-0.82, 0.18, 0.36, 0.52, 0.045, 0.22, "#fde68a", 1, 24, 14);
      b.addSphere(-0.82, 0.18, -0.36, 0.52, 0.045, 0.22, "#fde68a", 1, 24, 14);

      // 5. Outer striated nematode cuticle (region 1.4 -> cuttable shell)
      const bodyPts: [number, number, number][] = [];
      const bodyRads: number[] = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const x = -1.35 + t * 2.85;
        const y = 0.22 - Math.sin(t * Math.PI) * 0.32;
        bodyPts.push([x, y, 0.0]);
        const r = t < 0.15 ? 0.22 + t * 1.1 : 0.38;
        bodyRads.push(r);
      }
      b.addTube(bodyPts, bodyRads, "#fef3c7", 1.4, 28);
    }
  } else {
    // P07: Entamoeba histolytica
    if (stageId === "stage1") {
      // P07 Stage 1: Invasive Hematophagous Trophozoite (bull's-eye nucleus + ingested RBCs + hyaline pseudopod)
      // 1. Bull's-eye nucleus (region 1)
      addEntamoebaNucleus(b, -0.38, 0.16, 0.05, 0.36, 1, false);

      // 2. Phagocytosed erythrocytes in stages of digestion (region 2)
      const rbcConfigs: [number, number, number, number][] = [
        [0.38, -0.06, 0.18, 0.22],
        [0.12, -0.34, 0.12, 0.19],
        [0.48, 0.26, -0.08, 0.17],
        [-0.08, 0.38, 0.15, 0.15],
        [0.24, 0.08, -0.22, 0.21],
        [-0.52, -0.25, 0.14, 0.16],
      ];
      for (const [rx, ry, rz, rScale] of rbcConfigs) {
        b.addSphere(rx, ry, rz, rScale, rScale * 0.55, rScale, "#ef4444", 2, 18, 14, (px, py, pz) => {
          const dx = px - rx;
          const dz = pz - rz;
          const dist2 = (dx * dx + dz * dz) / (rScale * rScale);
          const dimple = (1.0 - Math.min(1.0, dist2)) * rScale * 0.32;
          const sign = py >= ry ? -1 : 1;
          return [px, py + sign * dimple, pz];
        });
      }

      // 3. Finely granular endoplasm & amebapore vesicles (region 4.4 -> cuttable inner matrix)
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const gx = Math.cos(ang) * 0.55;
        const gy = Math.sin(ang) * 0.42;
        const gz = ((i % 3) - 1) * 0.18;
        b.addSphere(gx, gy, gz, 0.065, 0.065, 0.065, "#fda4af", 4, 10, 8);
      }

      // 4. Hyaline finger-like ectoplasmic pseudopod (region 3)
      b.addTube(
        [
          [0.55, 0.04, 0.0],
          [0.98, 0.12, 0.06],
          [1.38, 0.18, 0.08],
          [1.62, 0.15, 0.04],
        ],
        [0.48, 0.34, 0.25, 0.14],
        "#67e8f9",
        3.4,
        22
      );

      // 5. Outer pleomorphic trophozoite membrane (region 4.4 -> cuttable shell)
      b.addSphere(-0.08, 0.0, 0.0, 1.05, 0.78, 0.74, "#fda4af", 4.4, 40, 30, (px, py, pz) => {
        const lobe =
          Math.sin(px * 3.2 + py * 2.5) * 0.09 +
          Math.cos(py * 4.0 - pz * 3.0) * 0.07;
        return [px + lobe, py + lobe * 0.8, pz + lobe * 0.6];
      });
    } else if (stageId === "stage2") {
      // P07 Stage 2: Mature Quadrinucleate Cyst (4 central-karyosome nuclei + blunt cigar-shaped chromatoid bars)
      // 1. Four vesicular nuclei with central karyosomes (region 1)
      const nucCenters: [number, number, number][] = [
        [-0.36, 0.36, 0.24],
        [0.38, 0.32, -0.22],
        [-0.32, -0.34, -0.26],
        [0.34, -0.36, 0.26],
      ];
      for (const [nx, ny, nz] of nucCenters) {
        addEntamoebaNucleus(b, nx, ny, nz, 0.24, 1, false);
      }

      // 2. Blunt-ended cigar-shaped chromatoid bars (region 2)
      b.addTube(
        [
          [-0.25, -0.05, 0.22],
          [0.08, -0.12, 0.26],
          [0.42, -0.18, 0.22],
        ],
        [0.12, 0.135, 0.12],
        "#e11d48",
        2,
        16
      );
      b.addSphere(-0.25, -0.05, 0.22, 0.12, 0.12, 0.12, "#e11d48", 2, 14, 12);
      b.addSphere(0.42, -0.18, 0.22, 0.12, 0.12, 0.12, "#e11d48", 2, 14, 12);

      b.addTube(
        [
          [-0.38, 0.08, -0.12],
          [0.02, 0.18, -0.05],
          [0.32, 0.05, -0.14],
        ],
        [0.105, 0.12, 0.105],
        "#e11d48",
        2,
        16
      );
      b.addSphere(-0.38, 0.08, -0.12, 0.105, 0.105, 0.105, "#e11d48", 2, 14, 12);
      b.addSphere(0.32, 0.05, -0.14, 0.105, 0.105, 0.105, "#e11d48", 2, 14, 12);

      // 3. Iodophilic glycogen vacuole (region 4)
      b.addSphere(0.08, 0.35, -0.12, 0.26, 0.22, 0.22, "#d97706", 4, 18, 14);

      // 4. Outer chitinous cyst wall (region 3.4 -> cuttable shell)
      b.addSphere(0, 0, 0, 1.08, 1.08, 1.08, "#94a3b8", 3.4, 42, 32);
    } else if (stageId === "stage3") {
      // P07 Stage 3: Flask-Shaped Colonic Ulcer (Úlcera en botón de camisa)
      // 1. Invading hematophagous trophozoites along the undermined lateral edges (region 3)
      const trophCoords: [number, number, number][] = [
        [-0.78, -0.25, 0.22],
        [-0.65, -0.45, 0.15],
        [0.76, -0.28, 0.2],
        [0.64, -0.48, 0.12],
        [-0.45, -0.58, 0.25],
        [0.42, -0.56, 0.22],
      ];
      for (const [tx, ty, tz] of trophCoords) {
        b.addSphere(tx, ty, tz, 0.15, 0.12, 0.12, "#a855f7", 3, 14, 12);
        b.addSphere(tx + 0.04, ty, tz + 0.05, 0.05, 0.05, 0.05, "#ef4444", 3, 8, 8);
      }

      // 2. Submucosal portal venule at the base with intravascular invasion (region 4)
      b.addTube(
        [
          [-1.25, -0.72, 0.0],
          [0.0, -0.68, 0.12],
          [1.25, -0.72, 0.0],
        ],
        [0.13, 0.14, 0.13],
        "#ef4444",
        4,
        16
      );

      // 3. Narrow mucosal neck & colonic crypts (region 1)
      for (const side of [-1, 1]) {
        b.addSphere(side * 0.78, 0.65, 0.0, 0.56, 0.28, 0.65, "#f472b6", 1, 24, 18);
      }

      // 4. Flask-shaped necrotic submucosal cavity & surrounding submucosa (region 2.4 -> cuttable shell)
      b.addSphere(0, -0.18, 0.0, 1.05, 0.58, 0.68, "#fbbf24", 2.4, 34, 24);
    } else {
      // P07 Stage 4: Side-by-side Differential: E. histolytica cyst (left, 4n, blunt bars) vs E. coli cyst (right, 8n, splintered bars)
      // LEFT: E. histolytica cyst (x = -0.88)
      const ehNucs: [number, number, number][] = [
        [-1.08, 0.26, 0.16],
        [-0.68, 0.24, -0.14],
        [-1.05, -0.18, -0.16],
        [-0.68, -0.22, 0.16],
      ];
      for (const [nx, ny, nz] of ehNucs) {
        addEntamoebaNucleus(b, nx, ny, nz, 0.15, 1, false);
      }
      // Blunt chromatoid bar in E. histolytica (region 2)
      b.addTube(
        [
          [-1.05, -0.05, 0.18],
          [-0.68, -0.12, 0.18],
        ],
        [0.085, 0.085],
        "#f43f5e",
        2,
        14
      );
      b.addSphere(-1.05, -0.05, 0.18, 0.085, 0.085, 0.085, "#f43f5e", 2, 12, 10);
      b.addSphere(-0.68, -0.12, 0.18, 0.085, 0.085, 0.085, "#f43f5e", 2, 12, 10);
      // Outer shell of E. histolytica
      b.addSphere(-0.88, 0.02, 0.0, 0.68, 0.68, 0.68, "#38bdf8", 1.4, 32, 24);

      // RIGHT: Entamoeba coli cyst (x = +0.88, larger, 8 eccentric nuclei + splintered pointed bars)
      const ecNucs: [number, number, number][] = [
        [0.58, 0.42, 0.22],
        [1.15, 0.42, 0.18],
        [0.55, 0.12, -0.28],
        [1.18, 0.12, -0.24],
        [0.62, -0.18, 0.28],
        [1.14, -0.18, 0.24],
        [0.68, -0.44, -0.18],
        [1.08, -0.44, -0.14],
      ];
      for (const [nx, ny, nz] of ecNucs) {
        addEntamoebaNucleus(b, nx, ny, nz, 0.14, 3, true);
      }
      // Splintered pointed chromatoid bars in E. coli (region 4)
      b.addTube(
        [
          [0.52, -0.25, 0.22],
          [0.88, -0.18, 0.25],
          [1.24, -0.12, 0.22],
        ],
        [0.008, 0.075, 0.008],
        "#fbbf24",
        4,
        10
      );
      b.addTube(
        [
          [0.56, -0.12, 0.24],
          [0.88, -0.22, 0.26],
          [1.2, -0.32, 0.24],
        ],
        [0.008, 0.068, 0.008],
        "#fbbf24",
        4,
        10
      );
      // Outer shell of E. coli
      b.addSphere(0.88, 0.02, 0.0, 0.92, 0.92, 0.92, "#a855f7", 3.4, 34, 26);
    }
  }

  return b.toBufferGeometry();
}

export function ToxocaraEntamoeba3DViewer({
  speciesCode,
  onClose,
}: ToxocaraEntamoeba3DViewerProps) {
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
  const meshRef = useRef<THREE.Mesh | null>(null);
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
    meshRef.current = mesh;

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;

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

      // Update projected markers
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
            {/* Stage selector dropdown */}
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

            {/* Quick focus / overview buttons */}
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

          {/* Right HUD: 4 Shader modes + Markers toggle + Close */}
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

            {/* Dynamic scale bar */}
            <div className="flex flex-col items-end px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800">
              <div className="text-[10px] font-mono text-cyan-300">
                {stageMeta.scaleMicrons >= 1000
                  ? `${(stageMeta.scaleMicrons / 1000).toFixed(1)} mm`
                  : `${stageMeta.scaleMicrons} µm`}
              </div>
              <div
                className="h-1 bg-cyan-400 rounded-full mt-0.5 transition-all"
                style={{ width: `${scaleBarPx}px` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* EXTERNAL BOTTOM PANEL: 3 SLIDERS + REGION GRID + CLINICAL CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left column: Sliders + Regions */}
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

            {/* Translucency */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Translucidez de Pared / Cutícula</span>
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

            {/* Histological Cut */}
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

            {/* Motility */}
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

          {/* Regions selector grid */}
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

        {/* Right column: Detailed Clinical & Microscopy Card */}
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
