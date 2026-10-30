import {
  Activity,
  Dna,
  ShieldAlert,
  HeartPulse,
  Layers,
  Microscope,
  Flame,
  FlaskConical,
  LucideIcon
} from "lucide-react";

export interface CatedraUnitItem {
  id: string; // ej: "HEP-02"
  code: string; // ej: "HEP-02"
  shortTitle: string; // Título breve para selector
  fullTitle: string; // Título descriptivo completo
  classReference: string; // ej: "Cátedra 20 · Pág. 4"
  is3DModel?: boolean;
}

export interface PendingUnitItem {
  id: string;
  code: string;
  title: string;
  classReference: string;
  note: string;
}

export interface CatedraThemeGroup {
  id: string;
  numberPrefix: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  availableUnits: CatedraUnitItem[];
  pendingUnits?: PendingUnitItem[];
}

export const HEPATOBILIAR_THEMES: CatedraThemeGroup[] = [
  {
    id: "dano-hepatico",
    numberPrefix: "1",
    title: "Daño hepático",
    description: "Hepatitis aguda, cronicidad, fibrosis, ictericia y laboratorio.",
    icon: Activity,
    badge: "3 actividades",
    availableUnits: [
      {
        id: "HEP-02",
        code: "HEP-02",
        shortTitle: "Hepatitis aguda",
        fullTitle: "Evolución clínica y fases de la hepatitis aguda",
        classReference: "Cátedra 20 · Pág. 4"
      },
      {
        id: "HEP-03",
        code: "HEP-03",
        shortTitle: "Cronicidad y fibrosis",
        fullTitle: "Infección crónica, fibrosis y progresión a cirrosis",
        classReference: "Cátedra 20 · Págs. 5-8, 15"
      },
      {
        id: "HEP-04",
        code: "HEP-04",
        shortTitle: "Ictericia y laboratorio",
        fullTitle: "Ictericia, coluria, acolia y pruebas de función hepática",
        classReference: "Cátedra 20 · Pág. 9"
      }
    ]
  },
  {
    id: "virus-marcadores",
    numberPrefix: "2",
    title: "Virus y marcadores",
    description: "Comparación de hepatitis, marcadores de VHB, VHD, VHC, VEB y CMV.",
    icon: Dna,
    badge: "5 actividades",
    availableUnits: [
      {
        id: "HEP-05",
        code: "HEP-05",
        shortTitle: "Hepatitis A y E",
        fullTitle: "Hepatitis A y E: transmisión y comparación",
        classReference: "Cátedra 20 · Págs. 11-12"
      },
      {
        id: "HEP-06",
        code: "HEP-06",
        shortTitle: "Marcadores de Hepatitis B",
        fullTitle: "Hepatitis B y significado de sus marcadores serológicos",
        classReference: "Cátedra 20 · Pág. 13"
      },
      {
        id: "HEP-07",
        code: "HEP-07",
        shortTitle: "Hepatitis D y dependencia",
        fullTitle: "Hepatitis D y dependencia biológica de VHB",
        classReference: "Cátedra 20 · Pág. 14"
      },
      {
        id: "HEP-08",
        code: "HEP-08",
        shortTitle: "Hepatitis C y cronicidad",
        fullTitle: "Hepatitis C: anticuerpos, ARN y cronicidad",
        classReference: "Cátedra 20 · Pág. 15"
      },
      {
        id: "HEP-09",
        code: "HEP-09",
        shortTitle: "VEB y CMV en hígado",
        fullTitle: "VEB y CMV: afectación hepática por otros virus",
        classReference: "Cátedra 20 · Pág. 16"
      }
    ]
  },
  {
    id: "otros-agentes",
    numberPrefix: "3",
    title: "Otros agentes",
    description: "Infecciones bacterianas y parásitos hepáticos conforme estén disponibles.",
    icon: ShieldAlert,
    badge: "1 actividad disponible",
    availableUnits: [
      {
        id: "HEP-13",
        code: "HEP-13",
        shortTitle: "Abscesos e infección biliar",
        fullTitle: "Abscesos hepáticos e infección biliar bacteriana",
        classReference: "Cátedra 20 · Pág. 24"
      }
    ],
    pendingUnits: [
      {
        id: "HEP-01",
        code: "HEP-01",
        title: "Funciones y vascularización del hígado",
        classReference: "Cátedra 20 · Pág. 2",
        note: "Explorador anatómico de circulación portal y arterial"
      },
      {
        id: "HEP-10",
        code: "HEP-10",
        title: "Inmunoensayos: ELISA y CMIA en laboratorio",
        classReference: "Cátedra 20 · Págs. 17-18",
        note: "Esquema interactivo por pasos de captura y señal"
      },
      {
        id: "HEP-11",
        code: "HEP-11",
        title: "Fasciola hepatica: migración y fase biliar",
        classReference: "Cátedra 20 · Págs. 20-21",
        note: "Recorrido anatómico de fase migratoria y biliar"
      },
      {
        id: "HEP-12",
        code: "HEP-12",
        title: "Echinococcus granulosus e hidatidosis hepática",
        classReference: "Cátedra 20 · Págs. 22-23",
        note: "Modelo anatómico de quiste hidatídico y capas"
      },
      {
        id: "MOR-01",
        code: "MOR-01",
        title: "Atlas de morfología: Fasciola, hidátide e histología",
        classReference: "Cátedra 20 · Págs. 6-8, 21, 23",
        note: "Comparador morfológico e histológico especializado"
      }
    ]
  }
];

export const CARDIOVASCULAR_THEMES: CatedraThemeGroup[] = [
  {
    id: "respuesta-infeccion",
    numberPrefix: "1",
    title: "Respuesta a la infección",
    description: "Microorganismos en sangre, respuesta inflamatoria sistémica y sepsis.",
    icon: HeartPulse,
    badge: "2 actividades",
    availableUnits: [
      {
        id: "VAS-01",
        code: "VAS-01",
        shortTitle: "Microorganismos y respuesta",
        fullTitle: "Bacteriemia, fungemia, viremia, parasitemia y sepsis",
        classReference: "Cátedra 21 · Págs. 3-4, 6, 8"
      },
      {
        id: "VAS-03",
        code: "VAS-03",
        shortTitle: "Sepsis y shock séptico",
        fullTitle: "Sepsis y shock séptico distributivo",
        classReference: "Cátedra 21 · Pág. 8"
      }
    ],
    pendingUnits: [
      {
        id: "VAS-02",
        code: "VAS-02",
        title: "Puertas de entrada y diseminación por sangre",
        classReference: "Cátedra 21 · Págs. 6-7",
        note: "Modelo de recorrido vascular y puertas de entrada"
      }
    ]
  },
  {
    id: "endocarditis-cateteres",
    numberPrefix: "2",
    title: "Endocarditis y catéteres",
    description: "Biofilm en dispositivos intravasculares, colonización y afección endocárdica.",
    icon: Layers,
    badge: "2 actividades · Modelo 3D",
    availableUnits: [
      {
        id: "VAS-05",
        code: "VAS-05",
        shortTitle: "Catéteres y biofilm (3D)",
        fullTitle: "Catéteres vasculares y formación de biofilm",
        classReference: "Cátedra 21 · Págs. 11-13",
        is3DModel: true
      },
      {
        id: "VAS-06",
        code: "VAS-06",
        shortTitle: "Agentes en endocardio y catéteres",
        fullTitle: "Agentes relacionados con sangre, endocardio y catéteres",
        classReference: "Cátedra 21 · Pág. 14"
      }
    ],
    pendingUnits: [
      {
        id: "VAS-04",
        code: "VAS-04",
        title: "Endocarditis, vegetaciones y émbolos",
        classReference: "Cátedra 21 · Págs. 9-10, 24",
        note: "Modelo valvular de vegetación y embolización"
      }
    ]
  },
  {
    id: "parasitos-sanguineos",
    numberPrefix: "3",
    title: "Parásitos sanguíneos",
    description: "Frotis, transmisión y fases clínicas de parásitos hemáticos.",
    icon: Microscope,
    badge: "2 actividades",
    availableUnits: [
      {
        id: "VAS-07",
        code: "VAS-07",
        shortTitle: "Enfermedad de Chagas",
        fullTitle: "Chagas (Trypanosoma cruzi): transmisión, fases y detección",
        classReference: "Cátedra 21 · Págs. 15-16, 25"
      },
      {
        id: "VAS-08",
        code: "VAS-08",
        shortTitle: "Malaria",
        fullTitle: "Malaria (Plasmodium spp.): formas sanguíneas y detección",
        classReference: "Cátedra 21 · Págs. 17-18, 25"
      }
    ]
  },
  {
    id: "toxinas-dano-vascular",
    numberPrefix: "4",
    title: "Toxinas y daño vascular",
    description: "Superantígenos bacterianos, toxina Shiga y daño endotelial.",
    icon: Flame,
    badge: "2 actividades",
    availableUnits: [
      {
        id: "VAS-09",
        code: "VAS-09",
        shortTitle: "Shock tóxico",
        fullTitle: "Shock tóxico y superantígenos bacterianos",
        classReference: "Cátedra 21 · Pág. 20"
      },
      {
        id: "VAS-10",
        code: "VAS-10",
        shortTitle: "Síndrome hemolítico urémico",
        fullTitle: "Síndrome hemolítico urémico y toxina Shiga (STEC)",
        classReference: "Cátedra 21 · Pág. 21"
      }
    ]
  },
  {
    id: "diagnostico-laboratorio",
    numberPrefix: "5",
    title: "Diagnóstico y laboratorio",
    description: "Procesamiento de hemocultivos y correlación de métodos diagnósticos.",
    icon: FlaskConical,
    badge: "2 actividades",
    availableUnits: [
      {
        id: "VAS-11",
        code: "VAS-11",
        shortTitle: "Hemocultivo y etapas",
        fullTitle: "Hemocultivo y etapas del estudio microbiológico",
        classReference: "Cátedra 21 · Pág. 23"
      },
      {
        id: "VAS-12",
        code: "VAS-12",
        shortTitle: "Métodos diagnósticos",
        fullTitle: "Qué método de estudio aporta cada evidencia clínica",
        classReference: "Cátedra 21 · Págs. 24-25"
      }
    ]
  }
];

export function getThemeGroupsByTopic(topic: "hepatobiliar" | "cardiovascular"): CatedraThemeGroup[] {
  return topic === "hepatobiliar" ? HEPATOBILIAR_THEMES : CARDIOVASCULAR_THEMES;
}

export function findGroupByUnitId(unitId: string): {
  topic: "hepatobiliar" | "cardiovascular";
  group: CatedraThemeGroup;
  unit: CatedraUnitItem;
} | null {
  for (const group of HEPATOBILIAR_THEMES) {
    const unit = group.availableUnits.find((u) => u.id === unitId);
    if (unit) {
      return { topic: "hepatobiliar", group, unit };
    }
  }
  for (const group of CARDIOVASCULAR_THEMES) {
    const unit = group.availableUnits.find((u) => u.id === unitId);
    if (unit) {
      return { topic: "cardiovascular", group, unit };
    }
  }
  return null;
}
