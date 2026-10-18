import { MicroscopyEntry } from "./types";

/**
 * REGISTROS DEL ATLAS MICROSCÓPICO DE PARASITOLOGÍA
 * Fuentes oficiales: CDC Public Health Image Library (PHIL) / DPDx (Dominio público federal de EE. UU.).
 * Diferenciación explícita de licencias, tipos de visualización, escala y rasgos diagnósticos.
 */
export const MICROSCOPY_ENTRIES: MicroscopyEntry[] = [
  {
    id: "micro-ts-egg",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium / Taenia saginata",
    stageName: "Huevo embrionado (estadio diagnóstico / infectante según especie)",
    imageType: "microfotografia_real",
    sampleType: "Heces humanas (preparación directa con solución salina / lugol o sedimento concentrado)",
    stainTechnique: "Microscopía óptica de campo claro (examen en fresco con lugol parasitológico)",
    magnification: "400x (objetivo de gran aumento)",
    approximateSize: "31 a 43 µm de diámetro (promedio: 35 µm)",
    identifiableFeatures: [
      "Morfología redondeada u ovalada regular con coloración castaño-amarillenta.",
      "Embrióforo grueso de doble contorno con estriaciones radiales transversales muy evidentes.",
      "Oncosfera interna (embrión hexacanto) provista de 3 pares (6 en total) de ganchos refringentes.",
      "Imposible de distinguir microscópicamente de los huevos de Taenia saginata o Taenia asiatica."
    ],
    svgDiagramId: "taenia-egg-schema",
    provenance: "CDC Public Health Image Library (PHIL) / DPDx Parasite Image Directory",
    license: "Dominio Público (Public Domain - U.S. Federal Government work)",
    attribution: "CDC / Dr. Mae Melvin; Division of Parasitic Diseases (DPDx)",
    diagnosticRelevance: "Confirma teniasis intestinal en el paciente, pero NO permite determinar si la especie es T. solium o T. saginata. Si es T. solium, el paciente excreta huevos infectantes que pueden causar cisticercosis en él o en sus contactos.",
    notes: "Se debe reportar en el laboratorio clínico estrictamente como 'Huevos de Taenia sp.'."
  },
  {
    id: "micro-ts-proglottid",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    stageName: "Proglótide grávido maduro (estadio diagnóstico diferencial)",
    imageType: "microfotografia_real",
    sampleType: "Proglótide expulsado espontáneamente o recuperado post-tratamiento",
    stainTechnique: "Inyección de tinta china en el poro genital o diafanización con lactofenol de Amann",
    magnification: "10x a 40x (estereomicroscopio o lupa diagnóstica)",
    approximateSize: "Longitud: 10 a 12 mm; Ancho: 5 a 6 mm (aspecto cuadrangular o ligeramente rectangular)",
    identifiableFeatures: [
      "Tallo o tronco uterino longitudinal central bien pigmentado.",
      "7 a 13 ramas uterinas principales laterales a cada lado del tronco central (ramas más gruesas y espaciadas).",
      "Poro genital único lateral, distribuido de forma irregularmente alterna entre segmentos contiguos.",
      "Diferencia diagnóstica categórica frente a Taenia saginata (que posee 15 a 30 ramas finas y dicotómicas)."
    ],
    svgDiagramId: "taenia-solium-proglottid-schema",
    provenance: "CDC / DPDx Diagnostic Identification Tool",
    license: "Dominio Público (Public Domain - U.S. Government)",
    attribution: "CDC / DPDx Parasitic Diseases Branch",
    diagnosticRelevance: "Método de certeza morfológica para identificar Taenia solium y diferenciarla de T. saginata a partir de proglótides grávidos.",
    notes: "Manipular con extrema precaución biológica: los proglótides grávidos de T. solium contienen decenas de miles de huevos infectantes para el personal de laboratorio."
  },
  {
    id: "micro-ts-scolex",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    stageName: "Escólex fijador (órgano cefálico de adhesión)",
    imageType: "microfotografia_real",
    sampleType: "Gusano adulto entero recuperado tras tratamiento tenicida y purgante salino",
    stainTechnique: "Fijación en formalina al 10% y tinción con carmín acético o montaje transparente",
    magnification: "40x a 100x",
    approximateSize: "Diámetro: 0.6 a 1.0 mm (aproximadamente tamaño de una cabeza de alfiler)",
    identifiableFeatures: [
      "Forma piriforme o subglobular con 4 ventosas hemisféricas prominentes de succión.",
      "Rostelo apical saliente prominente armado con una doble corona de 22 a 32 ganchos quitinosos de tamaño alternante (ganchos grandes de 160-180 µm y ganchos pequeños de 110-140 µm).",
      "Cuello no segmentado estrecho que constituye la zona proliferativa generadora de proglótides."
    ],
    svgDiagramId: "taenia-scolex-schema",
    provenance: "CDC / Dr. George Healy; Public Health Image Library",
    license: "Dominio Público (Public Domain - U.S. Federal Government)",
    attribution: "CDC / DPDx",
    diagnosticRelevance: "Distingue inequívocamente el escólex armado de T. solium del escólex inerme (sin rostelo ni ganchos) de T. saginata.",
    notes: "Raras veces recuperado en la práctica clínica ambulatoria actual debido a que los tenicidas modernos (praziquantel) digieren parcialmente el estróbilo."
  },
  {
    id: "micro-ts-cyst",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    stageName: "Cysticercus cellulosae (metacestodo / forma larvaria vesicular)",
    imageType: "microfotografia_real",
    sampleType: "Biopsia de nódulo subcutáneo, músculo esquelético o pieza quirúrgica cerebral",
    stainTechnique: "Tinción de Hematoxilina y Eosina (H&E) en corte histopatológico",
    magnification: "40x a 200x",
    approximateSize: "Vesícula macroscópica de 5 a 10 mm de diámetro; membrana fina de unos 100 µm",
    identifiableFeatures: [
      "Vesícula ovalada transparente llena de líquido quístico claro.",
      "Escólex único invaginado hacia el interior de la vesícula con sus 4 ventosas y corona de ganchos birrefringentes en cortes adecuados.",
      "Pared quística trilaminar festoneada (capa tegumentaria externa, capa celular intermedia y capa reticular profunda).",
      "Respuesta del hospedador: cápsula colágena fibrosa con infiltrado linfoplasmocitario y eosinófilos cuando el quiste entra en fase degenerativa."
    ],
    svgDiagramId: "cysticercus-schema",
    provenance: "CDC Public Health Image Library (PHIL) #1168",
    license: "Dominio Público (Public Domain)",
    attribution: "CDC / Dr. Mae Melvin",
    diagnosticRelevance: "Demostración histológica patognomónica de cisticercosis en cortes de tejido.",
    notes: "En neuroimagen (RM), la visualización del escólex excéntrico hiperintenso dentro de la vesícula ('signo del punto en el hoyo') es patognomónico."
  },
  {
    id: "micro-tsa-proglottid",
    parasiteId: "p26-taenia-saginata",
    speciesName: "Taenia saginata",
    stageName: "Proglótide grávido maduro (comparativa diferencial)",
    imageType: "microfotografia_real",
    sampleType: "Proglótide móvil eliminado activamente a través del esfínter anal",
    stainTechnique: "Diafanización con lactofenol / inyección de tinta china",
    magnification: "10x a 40x",
    approximateSize: "Longitud: 16 a 20 mm; Ancho: 4 a 7 mm (claramente más alargado que T. solium)",
    identifiableFeatures: [
      "Tronco uterino medial delgado.",
      "15 a 30 ramas uterinas principales laterales a cada lado, profusamente dicotómicas y ramificadas.",
      "Musculatura vigorosa que le confiere motilidad activa independiente fuera de la defecación."
    ],
    svgDiagramId: "taenia-saginata-proglottid-schema",
    provenance: "CDC DPDx Image Library",
    license: "Dominio Público (Public Domain)",
    attribution: "CDC / DPDx",
    diagnosticRelevance: "Permite descartar con certeza Taenia solium ante proglótides con más de 15 ramas uterinas, reduciendo la alarma de riesgo de cisticercosis humana.",
    notes: "T. saginata no causa cisticercosis humana por ingestión de huevos."
  },
  {
    id: "micro-hn-egg",
    parasiteId: "p28-hymenolepis-nana",
    speciesName: "Hymenolepis nana",
    stageName: "Huevo embrionado (diagnóstico diferencial de huevos de cestodos)",
    imageType: "microfotografia_real",
    sampleType: "Heces humanas (examen coproparasitológico directo con lugol)",
    stainTechnique: "Microscopía óptica de campo claro",
    magnification: "400x",
    approximateSize: "45 a 55 µm de diámetro (claramente mayor que el huevo de Taenia)",
    identifiableFeatures: [
      "Forma esférica u ovalada con cáscara externa incolora muy delgada y transparente.",
      "Espacio claro amplio entre la membrana externa y la membrana interna de la oncosfera.",
      "Presencia diagnóstica de filamentos polares ondulantes (4 a 8 filamentos) que se originan en los mamelones polares de la membrana interna.",
      "Oncosfera central con 3 pares de ganchos finos."
    ],
    svgDiagramId: "hymenolepis-egg-schema",
    provenance: "CDC DPDx Image Directory",
    license: "Dominio Público (Public Domain)",
    attribution: "CDC / Dr. Mae Melvin",
    diagnosticRelevance: "Diferenciación inmediata frente a huevos de Taenia sp. gracias a los filamentos polares y su cubierta delgada incolora.",
    notes: "Cestodo de ciclo directo capaz de autoinfección interna en niños."
  }
];
