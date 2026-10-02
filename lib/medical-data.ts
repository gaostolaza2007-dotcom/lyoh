export interface Flashcard {
  id: string;
  question: string;
  subheading: string;
  imageAlt: string;
  diagramType: "heart" | "brachial" | "skull" | "circle_of_willis";
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  highYieldPearl: string;
  system: string;
}

export const ANATOMY_FLASHCARDS: Flashcard[] = [
  {
    id: "card-1",
    question: "¿Qué estructura anatómica se lesiona con mayor frecuencia en una fractura del cuello quirúrgico del húmero?",
    subheading: "Anatomía del Miembro Superior - Lesiones Nerviosas",
    imageAlt: "Diagrama del húmero proximal y paquete vasculonervioso",
    diagramType: "brachial",
    options: [
      { id: "opt-1", text: "Nervio Axilar (Circunflejo) y Arteria Circunfleja Humeral Posterior", isCorrect: true },
      { id: "opt-2", text: "Nervio Radial y Arteria Braquial Profunda", isCorrect: false },
      { id: "opt-3", text: "Nervio Mediano y Arteria Braquial", isCorrect: false },
      { id: "opt-4", text: "Nervio Musculocutáneo", isCorrect: false },
    ],
    explanation: "El nervio axilar y la arteria circunfleja humeral posterior discurren íntimamente adosados al cuello quirúrgico del húmero atravesando el espacio cuadrangular (cuadrilátero de Velpeau). Su lesión provoca atrofia del deltoides y pérdida de sensibilidad sobre la cara lateral del hombro.",
    highYieldPearl: "Regla mnemotécnica del húmero: 'ARM' (Axilar en cuello quirúrgico, Radial en diáfisis/canal de torsión, Mediano en supracondílea).",
    system: "Sistema Musculoesquelético",
  },
  {
    id: "card-2",
    question: "¿Cuál de las siguientes arterias es la rama terminal principal de la arteria coronaria izquierda que irriga el ápex y el tabique interventricular anterior?",
    subheading: "Anatomía Cardiovascular - Irrigación Miocárdica",
    imageAlt: "Diagrama de la circulación coronaria arterial",
    diagramType: "heart",
    options: [
      { id: "opt-a", text: "Arteria Circunfleja", isCorrect: false },
      { id: "opt-b", text: "Arteria Descendente Anterior Izquierda (DAI)", isCorrect: true },
      { id: "opt-c", text: "Arteria Coronaria Derecha", isCorrect: false },
      { id: "opt-d", text: "Arteria Marginal Obtusa", isCorrect: false },
    ],
    explanation: "La Arteria Descendente Anterior Izquierda (DAI o LAD por sus siglas en inglés) desciende por el surco interventricular anterior hacia el vértice del corazón, irrigando los dos tercios anteriores del tabique interventricular y la pared anterior del ventrículo izquierdo. Es el vaso más frecuentemente ocluido en infartos agudos de miocardio.",
    highYieldPearl: "La DAI es conocida clínicamente como la 'arteria viuda' (widow-maker) por la gravedad de su oclusión.",
    system: "Sistema Cardiovascular",
  },
  {
    id: "card-3",
    question: "¿A través de qué agujero de la base del cráneo abandona la cavidad craneal el nervio mandibular (V3)?",
    subheading: "Neuroanatomía - Pares Craneales y Base de Cráneo",
    imageAlt: "Base de cráneo y orificios endocraneales",
    diagramType: "skull",
    options: [
      { id: "opt-1", text: "Agujero Redondo Mayor (Foramen Rotundum)", isCorrect: false },
      { id: "opt-2", text: "Agujero Oval", isCorrect: true },
      { id: "opt-3", text: "Agujero Espinoso (Redondo Menor)", isCorrect: false },
      { id: "opt-4", text: "Conducto Auditivo Interno", isCorrect: false },
    ],
    explanation: "El nervio mandibular (tercera rama del trigémino, V3) sale de la fosa craneal media hacia la fosa infratemporal a través del agujero oval. V1 pasa por la fisura orbitaria superior y V2 por el agujero redondo.",
    highYieldPearl: "Mnemotecnia trigeminal: Standing Room Only (SRO) -> V1: Superior orbital fissure, V2: Rotundum, V3: Ovale.",
    system: "Neuroanatomía",
  }
];

export type { Microbe, MicrobeTaxonomy, MicrobeReference, ReferenceLink } from "./data/microbiology";
export { MICROBIOLOGY_DATA, MICROBIOLOGY_REFERENCES, matchesMicrobeSearch, normalizeSearch } from "./data/microbiology";


export interface HistologyPin {
  id: string;
  xPercent: number; // Porcentaje relativo para responsividad en móvil y PC
  yPercent: number;
  label: string;
  structure: string;
  tissueType: string;
  staining: string;
  description: string;
  clinicalSignificance: string;
  histologicalHallmark: string;
}

export const HISTOLOGY_SLIDES = [
  {
    id: "slide-glomerulo",
    title: "Corteza Renal: Glomérulo y Nefrona Proximal",
    organ: "Riñón",
    staining: "Hematoxilina y Eosina (H&E) 400x",
    imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&auto=format&fit=crop&q=80",
    abstract: "Microfotografía óptica de la corteza renal humana donde se observa un corpúsculo renal de Malpighi rodeado por túbulos contorneados proximales y distales.",
    pins: [
      {
        id: "pin-1",
        xPercent: 50,
        yPercent: 48,
        label: "Ovillo Capilar Glomerular",
        structure: "Capilares fenestrados y células mesangiales",
        tissueType: "Endotelio vascular especializado",
        staining: "H&E",
        description: "Red capilar de alta presión anastomótica derivada de la arteriola aferente donde tiene lugar la ultrafiltración plasmática primaria.",
        clinicalSignificance: "En glomerulonefritis proliferativa o nefropatía diabética, el mesangio prolifera y sintetiza matriz extracelular (nódulos de Kimmelstiel-Wilson).",
        histologicalHallmark: "Células mesangiales intraglomerulares con núcleos densos y podocitos que envuelven los capilares."
      },
      {
        id: "pin-2",
        xPercent: 32,
        yPercent: 35,
        label: "Espacio Urinario de Bowman",
        structure: "Espacio capsular entre hojas visceral y parietal",
        tissueType: "Cavidad de recepción de ultrafiltrado",
        staining: "H&E",
        description: "Espacio en forma de semiluna que recibe el ultrafiltrado glomerular antes de drenar directamente al túbulo contorneado proximal.",
        clinicalSignificance: "El borramiento del espacio urinario por proliferación de células epiteliales parietales y monocitos forma 'semilunas celulares' patognomónicas de glomerulonefritis rápidamente progresiva (GNRP).",
        histologicalHallmark: "Espacio ópticamente claro rodeado periféricamente por el epitelio plano simple de la cápsula parietal."
      },
      {
        id: "pin-3",
        xPercent: 74,
        yPercent: 68,
        label: "Túbulo Contorneado Proximal",
        structure: "Epitelio cúbico simple con ribete en cepillo",
        tissueType: "Epitelio tubular renal reabsortivo",
        staining: "H&E",
        description: "Responsable de la reabsorción activa del 65-70% del agua, sodio y 100% de la glucosa y aminoácidos filtrados.",
        clinicalSignificance: "Es el segmento más vulnerable a necrosis tubular aguda isquémica o nefrotóxica por su altísima tasa metabólica de bombas Na+/K+ ATPasas.",
        histologicalHallmark: "Citoplasma marcadamente acidófilo (rosado intenso) debido a la gran abundancia mitocondrial y luz tubular irregular por microvellosidades apicales."
      }
    ]
  }
];

export interface PathwayElement {
  id: string;
  name: string;
  category: "substrate" | "enzyme" | "cofactor" | "product";
  formula: string;
  description: string;
  deltaG: string;
  correctSlotIndex?: number;
}

export const BIOCHEMISTRY_ELEMENTS: PathwayElement[] = [
  {
    id: "elem-glucosa",
    name: "D-Glucosa",
    category: "substrate",
    formula: "C6H12O6",
    description: "Sustrato inicial de la glucólisis, hexosa fosforilada en el carbono 6 para atraparla dentro del citosol celular.",
    deltaG: "0.0 kJ/mol",
    correctSlotIndex: 0,
  },
  {
    id: "elem-hexocinasa",
    name: "Hexocinasa / Glucocinasa",
    category: "enzyme",
    formula: "EC 2.7.1.1",
    description: "Enzima limitante del paso 1: transfiere un grupo fosfato desde el ATP a la glucosa generando Glucosa-6-Fosfato.",
    deltaG: "-16.7 kJ/mol (Irreversible)",
    correctSlotIndex: 1,
  },
  {
    id: "elem-g6p",
    name: "Glucosa-6-Fosfato (G6P)",
    category: "product",
    formula: "C6H11O9P",
    description: "Punto de encrucijada metabólica entre glucólisis, glucogenogénesis y la vía de las pentosas fosfato.",
    deltaG: "-16.7 kJ/mol",
    correctSlotIndex: 2,
  },
  {
    id: "elem-pfk1",
    name: "Fosfofructocinasa-1 (PFK-1)",
    category: "enzyme",
    formula: "EC 2.7.1.11",
    description: "Enzima marcapasos clave de la glucólisis. Regulada positivamente por Fructosa-2,6-bisfosfato y AMP, inhibida por ATP y Citrato.",
    deltaG: "-14.2 kJ/mol (Comprometido)",
    correctSlotIndex: 3,
  },
  {
    id: "elem-f16bp",
    name: "Fructosa-1,6-Bisfosfato",
    category: "product",
    formula: "C6H10O12P2",
    description: "Intermediario simétrico que es escindido por la Aldolasa en dos triosas fosfato (DHAP y G3P).",
    deltaG: "-14.2 kJ/mol",
    correctSlotIndex: 4,
  },
  {
    id: "elem-piruvato",
    name: "Piruvato",
    category: "product",
    formula: "C3H3O3-",
    description: "Producto final de la glucólisis aeróbica. Ingresa a la matriz mitocondrial para ser transformado en Acetil-CoA por el complejo PDH.",
    deltaG: "-31.4 kJ/mol",
    correctSlotIndex: 5,
  }
];