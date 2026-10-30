/**
 * Catálogo extensible del Simulador de Preparación Microscópica de LYOH.
 * Separado del motor de distribución y del visor interactivo para que añadir
 * nuevos elementos en el futuro solo requiera incorporar su registro y recursos.
 */

export type SimulatorElementCategory =
  | "parasite-forms"
  | "lookalikes-artifacts"
  | "preparation-components";

export interface SimulatorCategoryDefinition {
  id: SimulatorElementCategory;
  title: string;
  subtitle: string;
  badgeColor: string;
}

export interface SimulatorSpecimenVariant {
  variantId: string;
  label: string;
  /** Imagen extraída de forma no generativa para el montaje educativo */
  cutoutSrc: string;
  /** Microfotografía original conservada intacta */
  originalSrc: string;
  cutoutWidthPx: number;
  cutoutHeightPx: number;
  originalWidthPx: number;
  originalHeightPx: number;
  /** Tamaño base ilustrativo en la lámina de 1800 × 1350 px a zoom 1.00× */
  stageBaseSizePx: number;
  preparation: string;
  stain: string;
  magnification: string | null;
  sourceInstitution: string;
  sourceAuthor: string;
  sourceUrl: string;
  sourceFigure: string;
  reuseStatus: "public-domain" | "open-license";
  licenseLabel: string;
  attributionText: string;
  extractionNote: string;
  checkedOn: string;
}

export interface SimulatorCatalogElement {
  id: string;
  category: SimulatorElementCategory;
  name: string;
  scientificName: string | null;
  stageFormLabel: string;
  /** Advertencia taxonómica o de etapa (ej. quiste vs huevo, Taenia spp.) */
  stageWarning: string | null;
  thumbnailSrc: string;
  defaultInitialCount: number;
  maxCountPerElement: number;
  /** Rango de variación de escala ilustrativa por ejemplar (ej. [0.94, 1.06]) */
  scaleJitterRange: [number, number];
  /** Radio mínimo de separación en la lámina para evitar superposiciones artificiales */
  collisionRadiusPx: number;
  /** Criterios observables para distinguir este elemento al explorarlo */
  observableCriteria: string[];
  /** Qué confusiones frecuentes provoca o sufre */
  commonConfusions: string;
  /** Límites de interpretación en una fotografía plana */
  interpretationLimits: string;
  /** Justificación documentada de su proporción relativa en el simulador */
  proportionNote: string;
  /** ID de comparación relacionada en el Comparador Microscópico (si aplica) */
  relatedComparisonId: string | null;
  /** Slug de ficha en el Atlas de Parásitos (si aplica) */
  relatedParasiteSlug: string | null;
  variants: SimulatorSpecimenVariant[];
}

export interface SimulatorAmbientDetritusAsset {
  id: string;
  label: string;
  cutoutSrc: string;
  originalSrc: string;
  stageBaseSizePx: number;
  sourceInstitution: string;
  sourceUrl: string;
  sourceFigure: string;
}

export const SIMULATOR_LIMITS = {
  MAX_TOTAL_ELEMENTS: 40,
  MAX_PER_ELEMENT_DEFAULT: 10,
  STAGE_WIDTH_PX: 1800,
  STAGE_HEIGHT_PX: 1350,
  MAX_USEFUL_DIGITAL_ZOOM: 2.5,
} as const;

export const SIMULATOR_CATEGORIES: SimulatorCategoryDefinition[] = [
  {
    id: "parasite-forms",
    title: "Formas parasitarias",
    subtitle: "Huevos de helmintos y quistes de protozoos documentados en referencias",
    badgeColor: "emerald",
  },
  {
    id: "lookalikes-artifacts",
    title: "Elementos semejantes y artefactos",
    subtitle: "Estructuras no parasitarias que pueden simular formas diagnósticas",
    badgeColor: "amber",
  },
  {
    id: "preparation-components",
    title: "Otros componentes de la preparación",
    subtitle: "Material vegetal y restos habituales del contexto coprológico",
    badgeColor: "cyan",
  },
];

export const SIMULATOR_CATALOG: SimulatorCatalogElement[] = [
  {
    id: "taenia-egg",
    category: "parasite-forms",
    name: "Huevos de Taenia spp.",
    scientificName: "Taenia spp.",
    stageFormLabel: "Huevo (embrióforo radiado con oncosfera)",
    stageWarning:
      "Se identifica como Taenia spp.: los huevos de T. solium, T. saginata y T. asiatica son morfológicamente indistinguibles entre sí al microscopio óptico.",
    thumbnailSrc: "/images/parasitology/simulador/especimenes/taenia_var1.png",
    defaultInitialCount: 2,
    maxCountPerElement: 10,
    scaleJitterRange: [0.95, 1.05],
    collisionRadiusPx: 62,
    observableCriteria: [
      "Cubierta gruesa y prismática (embrióforo) con estriaciones radiales continuas y uniformes.",
      "Contorno esférico a subesférico muy regular.",
      "Oncosfera interna (embrión hexacanto) donde pueden distinguirse ganchos refringentes según el plano focal del ejemplar.",
    ],
    commonConfusions:
      "Puede confundirse con granos de polen redondeados de exina ornamentada o con gotas de grasa de borde grueso refringente.",
    interpretationLimits:
      "La morfología del huevo solo permite informar Taenia spp.; la diferenciación de especie requiere examen de proglótides grávidas o escólex. En algunos planos focales los 6 ganchos no se ven simultáneamente.",
    proportionNote:
      "Proporción relativa ilustrativa (~96–108 px en lámina): en literatura mide 30–35 µm, menor que el huevo fértil de Ascaris lumbricoides y mayor que el quiste de Giardia duodenalis.",
    relatedComparisonId: "comp-taenia-vs-polen",
    relatedParasiteSlug: "taenia-solium",
    variants: [
      {
        variantId: "taenia-var-1",
        label: "Ejemplar 1 · Huevo de Taenia spp. con ganchos visibles (Fig. E)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/taenia_var1.png",
        originalSrc: "/images/parasitology/simulador/originales/taenia_egg1.jpg",
        cutoutWidthPx: 218,
        cutoutHeightPx: 218,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 104,
        preparation: "Montaje húmedo sin teñir (obtenido de proglótide adulta)",
        stain: "Sin tinción (unstained)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/taeniasis/index.html",
        sourceFigure: "Figure E (Taenia_egg1.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx; su uso no implica respaldo institucional del CDC.",
        extractionNote:
          "Separación de contorno no generativa a partir de Taenia_egg1.jpg conservando intactos el embrióforo y la oncosfera para el montaje educativo.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "taenia-var-2",
        label: "Ejemplar 2 · Huevo de Taenia spp. en montaje húmedo (Fig. B)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/taenia_var2.png",
        originalSrc: "/images/parasitology/simulador/originales/taenia_egg_b.jpg",
        cutoutWidthPx: 130,
        cutoutHeightPx: 130,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 100,
        preparation: "Montaje húmedo sin teñir (wet mount)",
        stain: "Sin tinción (unstained)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/taeniasis/index.html",
        sourceFigure: "Figure B (Taenia_egg.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de Taenia_egg.jpg conservando el original intacto.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "taenia-var-3",
        label: "Ejemplar 3 · Huevo de Taenia spp. en montaje húmedo a 400× (Fig. A)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/taenia_var3.png",
        originalSrc: "/images/parasitology/simulador/originales/taenia_eggs_wtmt_400x.jpg",
        cutoutWidthPx: 72,
        cutoutHeightPx: 72,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 96,
        preparation: "Montaje húmedo sin teñir (wet mount)",
        stain: "Sin tinción (unstained)",
        magnification: "400×",
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/taeniasis/index.html",
        sourceFigure: "Figure A (Taenia_eggs_wtmt_400x.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa del ejemplar inferior derecho de Taenia_eggs_wtmt_400x.jpg.",
        checkedOn: "2026-10-24",
      },
    ],
  },
  {
    id: "ascaris-fertile-egg",
    category: "parasite-forms",
    name: "Huevos fértiles corticados de Ascaris lumbricoides",
    scientificName: "Ascaris lumbricoides",
    stageFormLabel: "Huevo fértil corticado (mamelonado)",
    stageWarning:
      "Corresponde exclusivamente a la forma fértil corticada; A. lumbricoides también puede presentar huevos decorticados (sin capa mamelonada) o huevos infértiles más alargados.",
    thumbnailSrc: "/images/parasitology/simulador/especimenes/ascaris_var1.png",
    defaultInitialCount: 2,
    maxCountPerElement: 10,
    scaleJitterRange: [0.95, 1.05],
    collisionRadiusPx: 78,
    observableCriteria: [
      "Cubierta externa albuminosa con mamelones redondeados y ondulados característicos.",
      "Pared interna gruesa, lisa y continua que delimita claramente la cámara ovular.",
      "Masa embrionaria central redondeada (o en segmentación inicial) separada de la pared por un espacio claro.",
    ],
    commonConfusions:
      "Se confunde con granos de polen ornamentados (cuyas proyecciones suelen ser espinosas o agudas) y con células parenquimatosas vegetales.",
    interpretationLimits:
      "Los criterios de la cubierta mamelonada no se aplican a huevos decorticados ni a huevos infértiles de la misma especie.",
    proportionNote:
      "Proporción relativa ilustrativa (~130–142 px en lámina): en literatura mide 45–75 µm, siendo visiblemente mayor que el huevo de Taenia spp. (30–35 µm) y que el quiste de Giardia (10–14 µm).",
    relatedComparisonId: "comp-ascaris-vs-polen",
    relatedParasiteSlug: "ascaris-lumbricoides",
    variants: [
      {
        variantId: "ascaris-var-1",
        label: "Ejemplar 1 · Huevo fértil corticado en montaje húmedo (Fig. D)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/ascaris_var1.png",
        originalSrc: "/images/parasitology/simulador/originales/ascaris_fertile_bam1.jpg",
        cutoutWidthPx: 140,
        cutoutHeightPx: 140,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 134,
        preparation: "Montaje húmedo fecal sin teñir (unstained wet mount)",
        stain: "Sin tinción (unstained)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/ascariasis/index.html",
        sourceFigure: "Figure D (Ascaris_fertile_BAM1.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de Ascaris_fertile_BAM1.jpg conservando los mamelones periféricos.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "ascaris-var-2",
        label: "Ejemplar 2 · Huevo fértil corticado en desarrollo temprano (Fig. A)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/ascaris_var2.png",
        originalSrc: "/images/parasitology/simulador/originales/ascaris_egg_fert_embryo.jpg",
        cutoutWidthPx: 202,
        cutoutHeightPx: 202,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 140,
        preparation: "Montaje húmedo fecal sin teñir (unstained wet mount)",
        stain: "Sin tinción (unstained)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/ascariasis/index.html",
        sourceFigure: "Figure A (Ascaris_egg_fert_embryo.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de Ascaris_egg_fert_embryo.jpg.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "ascaris-var-3",
        label: "Ejemplar 3 · Huevo fértil corticado en montaje húmedo (Fig. F)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/ascaris_var3.png",
        originalSrc: "/images/parasitology/simulador/originales/ascaris_egg_fert_200x.jpg",
        cutoutWidthPx: 126,
        cutoutHeightPx: 126,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 130,
        preparation: "Montaje húmedo fecal sin teñir (unstained wet mount)",
        stain: "Sin tinción (unstained)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/ascariasis/index.html",
        sourceFigure: "Figure F (Ascaris_egg_fert_200x.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de Ascaris_egg_fert_200x.jpg.",
        checkedOn: "2026-10-24",
      },
    ],
  },
  {
    id: "giardia-cyst",
    category: "parasite-forms",
    name: "Quistes de Giardia duodenalis",
    scientificName: "Giardia duodenalis",
    stageFormLabel: "Quiste de protozoo flagelado (no es un huevo)",
    stageWarning:
      "Forma de resistencia protozoaria (quiste), no huevo de helminto. Estos ejemplares provienen de montajes teñidos con solución de Lugol (yodo).",
    thumbnailSrc: "/images/parasitology/simulador/especimenes/giardia_var1.png",
    defaultInitialCount: 1,
    maxCountPerElement: 10,
    scaleJitterRange: [0.95, 1.05],
    collisionRadiusPx: 50,
    observableCriteria: [
      "Contorno elipsoidal/ovalado con pared quística lisa y discreto espacio claro de retracción citoplasmática.",
      "Presencia de núcleos redondeados (2 a 4 según el plano focal) agrupados hacia un polo.",
      "Trazos lineales o fibrillas longitudinales internas (axostilo y cuerpos medianos).",
    ],
    commonConfusions:
      "Se confunde frecuentemente con levaduras ovaladas y esporas fúngicas en montajes con yodo, las cuales carecen de núcleos con cariosoma y de fibrillas longitudinales.",
    interpretationLimits:
      "En un único plano focal suelen apreciarse 2 de los 4 núcleos del quiste maduro; su ausencia parcial en una foto no los descarta.",
    proportionNote:
      "Proporción relativa ilustrativa (~78–84 px en lámina): en literatura mide 10–14 µm de largo, menor que los huevos de Taenia spp. y Ascaris lumbricoides.",
    relatedComparisonId: "comp-giardia-vs-levaduras",
    relatedParasiteSlug: "giardia-lamblia",
    variants: [
      {
        variantId: "giardia-var-1",
        label: "Ejemplar 1 · Quiste de G. duodenalis con núcleos y fibrillas visibles (Fig. A)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/giardia_var1.png",
        originalSrc: "/images/parasitology/simulador/originales/giardia_cyst_wtmt.jpg",
        cutoutWidthPx: 110,
        cutoutHeightPx: 110,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 82,
        preparation: "Montaje húmedo teñido con yodo (wet mount stained with iodine)",
        stain: "Solución de Lugol (yodo)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/giardiasis/index.html",
        sourceFigure: "Figure A (Giardia_cyst_wtmt.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de Giardia_cyst_wtmt.jpg.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "giardia-var-2",
        label: "Ejemplar 2 · Quiste de G. duodenalis en montaje con yodo (Fig. B)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/giardia_var2.png",
        originalSrc: "/images/parasitology/simulador/originales/giardia_cyst_wtmt2.jpg",
        cutoutWidthPx: 100,
        cutoutHeightPx: 100,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 78,
        preparation: "Montaje húmedo teñido con yodo (wet mount stained with iodine)",
        stain: "Solución de Lugol (yodo)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/giardiasis/index.html",
        sourceFigure: "Figure B (Giardia_cyst_wtmt2.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de Giardia_cyst_wtmt2.jpg.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "giardia-var-3",
        label: "Ejemplar 3 · Quiste de G. duodenalis en montaje con yodo (Fig. C)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/giardia_var3.png",
        originalSrc: "/images/parasitology/simulador/originales/giardia_cyst_wtmt3.jpg",
        cutoutWidthPx: 114,
        cutoutHeightPx: 114,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 84,
        preparation: "Montaje húmedo teñido con yodo (wet mount stained with iodine)",
        stain: "Solución de Lugol (yodo)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/giardiasis/index.html",
        sourceFigure: "Figure C (Giardia_cyst_wtmt3.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de Giardia_cyst_wtmt3.jpg.",
        checkedOn: "2026-10-24",
      },
    ],
  },
  {
    id: "fat-droplets",
    category: "lookalikes-artifacts",
    name: "Gotas de grasa (glóbulos lipídicos)",
    scientificName: null,
    stageFormLabel: "Artefacto lipídico coprológico (pseudoparásito)",
    stageWarning:
      "Los glóbulos lipídicos en heces fueron erróneamente descritos en literatura informal como un supuesto protozoo («Urbanorum spp.»); el análisis con Sudán IV, luz polarizada y etanol demostró que son estructuras lipídicas/colesterol.",
    thumbnailSrc: "/images/parasitology/simulador/especimenes/fat_var2.png",
    defaultInitialCount: 3,
    maxCountPerElement: 12,
    scaleJitterRange: [0.78, 1.22],
    collisionRadiusPx: 54,
    observableCriteria: [
      "Contorno esférico o globular altamente refringente con variación marcada de diámetro entre unas gotas y otras.",
      "Ausencia total de embrióforo estriado, ganchos internos, núcleos verdaderos, cariosoma o axostilo.",
      "Interior homogéneo, hialino (en solución salina) o granuloso-amorfo amarillento/anaranjado (en solución de Lugol).",
    ],
    commonConfusions:
      "Las gotas pequeñas pueden simular quistes de protozoos; los glóbulos lipídicos grandes o coalescentes en Lugol han sido confundidos con huevos o supuestos protozoos.",
    interpretationLimits:
      "La combinación en una misma vista de ejemplares procedentes de solución salina y de Lugol responde a un montaje didáctico para comparar su aspecto sin recolorear las fotografías originales.",
    proportionNote:
      "Proporción relativa ilustrativa (~74–112 px en lámina con variación amplia de tamaño): a diferencia de los huevos parasitarios de tamaño constante, las gotas de grasa varían ampliamente de diámetro.",
    relatedComparisonId: null,
    relatedParasiteSlug: null,
    variants: [
      {
        variantId: "fat-var-1",
        label: "Ejemplar 1 · Gota lipídica hialina en frotis directo con solución salina (Fig. 1A)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/fat_var1.png",
        originalSrc: "/images/parasitology/simulador/originales/pmc12051917_fig1.jpg",
        cutoutWidthPx: 104,
        cutoutHeightPx: 100,
        originalWidthPx: 625,
        originalHeightPx: 687,
        stageBaseSizePx: 88,
        preparation: "Frotis fecal directo con solución salina (direct smear in saline)",
        stain: "Sin tinción (solución salina)",
        magnification: "40× (objetivo documentado en fuente)",
        sourceInstitution: "Memórias do Instituto Oswaldo Cruz / PubMed Central (PMC12051917)",
        sourceAuthor: "Echeverry DF, Sarria MA, Palma GI (2025)",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12051917/",
        sourceFigure: "Figure 1A (doi: 10.1590/0074-02760240144)",
        reuseStatus: "open-license",
        licenseLabel: "Creative Commons Attribution License (CC BY 4.0)",
        attributionText:
          "Echeverry DF, Sarria MA, Palma GI. Lessons from the 'Urbanorum spp.' controversy. Mem Inst Oswaldo Cruz. 2025;120:e240144 (CC BY 4.0).",
        extractionNote:
          "Separación de contorno no generativa del glóbulo lipídico en solución salina de la Figura 1A (PMC12051917), conservando el archivo original completo.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "fat-var-2",
        label: "Ejemplar 2 · Estructura lipídica tras concentración con sulfato de zinc (Fig. 1C)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/fat_var2.png",
        originalSrc: "/images/parasitology/simulador/originales/pmc12051917_fig1.jpg",
        cutoutWidthPx: 118,
        cutoutHeightPx: 118,
        originalWidthPx: 625,
        originalHeightPx: 687,
        stageBaseSizePx: 98,
        preparation: "Solución salina tras concentración con sulfato de zinc",
        stain: "Sin tinción (solución salina)",
        magnification: "40× (objetivo documentado en fuente)",
        sourceInstitution: "Memórias do Instituto Oswaldo Cruz / PubMed Central (PMC12051917)",
        sourceAuthor: "Echeverry DF, Sarria MA, Palma GI (2025)",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12051917/",
        sourceFigure: "Figure 1C (doi: 10.1590/0074-02760240144)",
        reuseStatus: "open-license",
        licenseLabel: "Creative Commons Attribution License (CC BY 4.0)",
        attributionText:
          "Echeverry DF, Sarria MA, Palma GI. Mem Inst Oswaldo Cruz. 2025;120:e240144 (CC BY 4.0).",
        extractionNote:
          "Separación de contorno no generativa de la estructura lipídica de la Figura 1C (PMC12051917).",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "fat-var-3",
        label: "Ejemplar 3 · Glóbulo lipídico en frotis directo con solución de Lugol (Fig. 1B)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/fat_var3.png",
        originalSrc: "/images/parasitology/simulador/originales/pmc12051917_fig1.jpg",
        cutoutWidthPx: 110,
        cutoutHeightPx: 110,
        originalWidthPx: 625,
        originalHeightPx: 687,
        stageBaseSizePx: 94,
        preparation: "Frotis fecal directo con solución de Lugol (yodo)",
        stain: "Solución de Lugol (yodo)",
        magnification: "40× (objetivo documentado en fuente)",
        sourceInstitution: "Memórias do Instituto Oswaldo Cruz / PubMed Central (PMC12051917)",
        sourceAuthor: "Echeverry DF, Sarria MA, Palma GI (2025)",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12051917/",
        sourceFigure: "Figure 1B (doi: 10.1590/0074-02760240144)",
        reuseStatus: "open-license",
        licenseLabel: "Creative Commons Attribution License (CC BY 4.0)",
        attributionText:
          "Echeverry DF, Sarria MA, Palma GI. Mem Inst Oswaldo Cruz. 2025;120:e240144 (CC BY 4.0).",
        extractionNote:
          "Separación de contorno no generativa del glóbulo lipídico teñido con Lugol de la Figura 1B (PMC12051917).",
        checkedOn: "2026-10-24",
      },
    ],
  },
  {
    id: "pollen-grains",
    category: "lookalikes-artifacts",
    name: "Granos de polen",
    scientificName: null,
    stageFormLabel: "Artefacto vegetal (grano de polen)",
    stageWarning:
      "La morfología del polen varía enormemente según la especie botánica: algunos granos imitan huevos mamelonados de Ascaris y otros imitan el embrióforo estriado de Taenia spp.",
    thumbnailSrc: "/images/parasitology/simulador/especimenes/pollen_var1.png",
    defaultInitialCount: 2,
    maxCountPerElement: 10,
    scaleJitterRange: [0.92, 1.08],
    collisionRadiusPx: 62,
    observableCriteria: [
      "Pared vegetal (exina) con ornamentaciones periféricas que pueden ser espinosas/agudas (polen_WA1) o simular estriaciones (pollen_HB2).",
      "Ausencia de oncosfera con ganchos refringentes y ausencia de cámara ovular interna lisa tipo Ascaris.",
      "Contenido interno vegetal denso, reticulado o vacío sin organización embrionaria parasitaria.",
    ],
    commonConfusions:
      "Confusión documentada con huevos fértiles de Ascaris lumbricoides y con huevos de Taenia spp. (ej. Caso 169 de CDC DPDx).",
    interpretationLimits:
      "El ejemplar pollen_HB2 proviene de un frotis teñido con tricrómico; su inclusión junto a elementos en montaje húmedo forma parte de un montaje didáctico.",
    proportionNote:
      "Proporción relativa ilustrativa (~96–116 px en lámina): permite observar con nitidez las espinas de la exina y el reborde periférico.",
    relatedComparisonId: "comp-taenia-vs-polen",
    relatedParasiteSlug: null,
    variants: [
      {
        variantId: "pollen-var-1",
        label: "Ejemplar 1 · Grano de polen con exina espinosa en montaje húmedo (pollen_WA1)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/pollen_var1.png",
        originalSrc: "/images/parasitology/simulador/originales/pollen_wa1.jpg",
        cutoutWidthPx: 188,
        cutoutHeightPx: 188,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 114,
        preparation: "Montaje húmedo fecal concentrado",
        stain: "No especificada en la fuente",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
        sourceFigure: "Figure A (pollen_WA1.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de pollen_WA1.jpg.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "pollen-var-2",
        label: "Ejemplar 2 · Grano de polen ovalado en montaje húmedo concentrado (pollen_HB1)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/pollen_var2.png",
        originalSrc: "/images/parasitology/simulador/originales/pollen_hb1.jpg",
        cutoutWidthPx: 114,
        cutoutHeightPx: 114,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 102,
        preparation: "Montaje húmedo fecal concentrado (concentrated wet mount)",
        stain: "Sin tinción",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
        sourceFigure: "Figure C (pollen_HB1.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de pollen_HB1.jpg.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "pollen-var-3",
        label: "Ejemplar 3 · Grano de polen pseudoestriado semejante a Taenia (pollen_HB2)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/pollen_var3.png",
        originalSrc: "/images/parasitology/simulador/originales/pollen_hb2.jpg",
        cutoutWidthPx: 98,
        cutoutHeightPx: 98,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 96,
        preparation: "Frotis fecal teñido con tricrómico (montaje didáctico)",
        stain: "Tinción tricrómica (trichrome stain)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
        sourceFigure: "Figure D (pollen_HB2.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de pollen_HB2.jpg (se conserva su tinción original sin recolorear).",
        checkedOn: "2026-10-24",
      },
    ],
  },
  {
    id: "yeast-cells",
    category: "lookalikes-artifacts",
    name: "Levaduras y esporas fúngicas",
    scientificName: null,
    stageFormLabel: "Célula de levadura / espora fúngica en heces",
    stageWarning:
      "La observación en montaje húmedo no permite identificar género o especie fúngica (no atribuir a Candida spp. sin cultivo o pruebas específicas).",
    thumbnailSrc: "/images/parasitology/simulador/especimenes/yeast_var1.png",
    defaultInitialCount: 3,
    maxCountPerElement: 12,
    scaleJitterRange: [0.9, 1.08],
    collisionRadiusPx: 42,
    observableCriteria: [
      "Células ovaladas pequeñas con pared continua e interior denso o con vacuola/inclusión excéntrica.",
      "Ausencia de núcleos verdaderos con cariosoma y ausencia de fibrillas longitudinales (axostilo) o cuerpos medianos.",
    ],
    commonConfusions:
      "Confusión frecuente con quistes de Giardia duodenalis o de otros protozoos intestinales pequeños en montajes con yodo.",
    interpretationLimits:
      "La gemación no es obligatoria en cada célula individual observada.",
    proportionNote:
      "Proporción relativa ilustrativa (~56–68 px en lámina): menor tamaño relativo frente al quiste de Giardia duodenalis y a los huevos de helmintos.",
    relatedComparisonId: "comp-giardia-vs-levaduras",
    relatedParasiteSlug: null,
    variants: [
      {
        variantId: "yeast-var-1",
        label: "Ejemplar 1 · Célula de levadura en montaje concentrado con yodo (yeast_wtmt1 A)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/yeast_var1.png",
        originalSrc: "/images/parasitology/simulador/originales/yeast_wtmt1.jpg",
        cutoutWidthPx: 80,
        cutoutHeightPx: 80,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 60,
        preparation: "Montaje húmedo concentrado teñido con yodo",
        stain: "Solución de Lugol (yodo)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
        sourceFigure: "Figure A, cuadrante superior derecho (yeast_wtmt1.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa de la primera célula de levadura de yeast_wtmt1.jpg.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "yeast-var-2",
        label: "Ejemplar 2 · Célula de levadura en montaje concentrado con yodo (yeast_wtmt1 B)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/yeast_var2.png",
        originalSrc: "/images/parasitology/simulador/originales/yeast_wtmt1.jpg",
        cutoutWidthPx: 74,
        cutoutHeightPx: 74,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 56,
        preparation: "Montaje húmedo concentrado teñido con yodo",
        stain: "Solución de Lugol (yodo)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
        sourceFigure: "Figure A, cuadrante inferior izquierdo (yeast_wtmt1.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa de la segunda célula de levadura de yeast_wtmt1.jpg.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "yeast-var-3",
        label: "Ejemplar 3 · Espora fúngica en montaje húmedo concentrado (artifact-giardia1)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/yeast_var3.png",
        originalSrc: "/images/parasitology/simulador/originales/artifact_giardia1.jpg",
        cutoutWidthPx: 108,
        cutoutHeightPx: 108,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 68,
        preparation: "Montaje húmedo fecal concentrado",
        stain: "Montaje húmedo",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
        sourceFigure: "Figure D (artifact-giardia1.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa a partir de artifact-giardia1.jpg.",
        checkedOn: "2026-10-24",
      },
    ],
  },
  {
    id: "plant-fibers",
    category: "preparation-components",
    name: "Fibras, pelos y células vegetales",
    scientificName: null,
    stageFormLabel: "Componente vegetal de tránsito digestivo",
    stageWarning:
      "Los pelos vegetales alargados suelen confundirse con larvas de Strongyloides stercoralis o uncinarias; las células vegetales grandes pueden confundirse con huevos de helmintos.",
    thumbnailSrc: "/images/parasitology/simulador/especimenes/plant_var1.png",
    defaultInitialCount: 2,
    maxCountPerElement: 10,
    scaleJitterRange: [0.9, 1.1],
    collisionRadiusPx: 82,
    observableCriteria: [
      "En fibras/pelos vegetales (plant_hair_HB1/HB2): pared celulósica rígida y muy refringente, canal central vacío sin esófago ni primordio genital, y un extremo frecuentemente truncado o quebrado.",
      "En células parenquimatosas vegetales (plant_cell1): compartimentación interna poliédrica o sacular sin embrión único organizado.",
    ],
    commonConfusions:
      "Los pelos vegetales imitan larvas rabditoides de nematodos; las células vegetales redondeadas imitan huevos de helmintos a bajo aumento.",
    interpretationLimits:
      "Forman parte habitual del sedimento coprológico normal y aportan contexto visual realista alrededor de las formas parasitarias.",
    proportionNote:
      "Proporción relativa ilustrativa (~145–230 px en lámina): las fibras y células vegetales suelen superar en longitud a los huevos de helmintos.",
    relatedComparisonId: null,
    relatedParasiteSlug: null,
    variants: [
      {
        variantId: "plant-var-1",
        label: "Ejemplar 1 · Pelo/fibra vegetal recta en montaje húmedo (plant_hair_HB1)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/plant_var1.png",
        originalSrc: "/images/parasitology/simulador/originales/plant_hair_hb1.jpg",
        cutoutWidthPx: 370,
        cutoutHeightPx: 157,
        originalWidthPx: 398,
        originalHeightPx: 300,
        stageBaseSizePx: 230,
        preparation: "Montaje húmedo fecal concentrado (concentrated wet mount)",
        stain: "Sin tinción (unstained)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
        sourceFigure: "Figure C (plant_hair_HB1.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa del pelo vegetal de plant_hair_HB1.jpg.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "plant-var-2",
        label: "Ejemplar 2 · Fibra vegetal curvada en montaje húmedo (plant_hair_HB2)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/plant_var2.png",
        originalSrc: "/images/parasitology/simulador/originales/plant_hair_hb2.jpg",
        cutoutWidthPx: 268,
        cutoutHeightPx: 297,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 215,
        preparation: "Montaje húmedo fecal concentrado (concentrated wet mount)",
        stain: "Sin tinción (unstained)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
        sourceFigure: "Figure D (plant_hair_HB2.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa de la fibra vegetal de plant_hair_HB2.jpg.",
        checkedOn: "2026-10-24",
      },
      {
        variantId: "plant-var-3",
        label: "Ejemplar 3 · Célula parenquimatosa vegetal compartimentada (plant_cell1)",
        cutoutSrc: "/images/parasitology/simulador/especimenes/plant_var3.png",
        originalSrc: "/images/parasitology/simulador/originales/plant_cell1.jpg",
        cutoutWidthPx: 164,
        cutoutHeightPx: 164,
        originalWidthPx: 300,
        originalHeightPx: 300,
        stageBaseSizePx: 150,
        preparation: "Montaje húmedo fecal concentrado (concentrated wet mount)",
        stain: "Sin tinción (unstained)",
        magnification: null,
        sourceInstitution: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
        sourceAuthor: "CDC / DPDx",
        sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
        sourceFigure: "Figure A (plant_cell1.jpg)",
        reuseStatus: "public-domain",
        licenseLabel: "Dominio público federal (EE. UU. HHS / CDC)",
        attributionText:
          "Fuente: CDC / Division of Parasitic Diseases and Malaria (DPDx). Material disponible gratuitamente en cdc.gov/dpdx.",
        extractionNote:
          "Separación de contorno no generativa de la célula vegetal de plant_cell1.jpg.",
        checkedOn: "2026-10-24",
      },
    ],
  },
];

export const SIMULATOR_AMBIENT_DETRITUS: SimulatorAmbientDetritusAsset[] = [
  {
    id: "detritus-1",
    label: "Fragmento amorfo de sedimento coprológico (Taenia_eggs_wtmt_400x)",
    cutoutSrc: "/images/parasitology/simulador/especimenes/detritus_1.png",
    originalSrc: "/images/parasitology/simulador/originales/taenia_eggs_wtmt_400x.jpg",
    stageBaseSizePx: 92,
    sourceInstitution: "CDC / DPDx",
    sourceUrl: "https://www.cdc.gov/dpdx/taeniasis/index.html",
    sourceFigure: "Figure A (Taenia_eggs_wtmt_400x.jpg)",
  },
  {
    id: "detritus-2",
    label: "Resto celular hialino de montaje húmedo (plant_hair_HB1)",
    cutoutSrc: "/images/parasitology/simulador/especimenes/detritus_2.png",
    originalSrc: "/images/parasitology/simulador/originales/plant_hair_hb1.jpg",
    stageBaseSizePx: 72,
    sourceInstitution: "CDC / DPDx",
    sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
    sourceFigure: "Figure C (plant_hair_HB1.jpg)",
  },
  {
    id: "detritus-3",
    label: "Agregado floculento de sedimento fecal (Ascaris_egg_fert_200x)",
    cutoutSrc: "/images/parasitology/simulador/especimenes/detritus_3.png",
    originalSrc: "/images/parasitology/simulador/originales/ascaris_egg_fert_200x.jpg",
    stageBaseSizePx: 108,
    sourceInstitution: "CDC / DPDx",
    sourceUrl: "https://www.cdc.gov/dpdx/ascariasis/index.html",
    sourceFigure: "Figure F (Ascaris_egg_fert_200x.jpg)",
  },
  {
    id: "detritus-4",
    label: "Detritus fino de montaje húmedo (pollen_HB1)",
    cutoutSrc: "/images/parasitology/simulador/especimenes/detritus_4.png",
    originalSrc: "/images/parasitology/simulador/originales/pollen_hb1.jpg",
    stageBaseSizePx: 88,
    sourceInstitution: "CDC / DPDx",
    sourceUrl: "https://www.cdc.gov/dpdx/artifacts/index.html",
    sourceFigure: "Figure C (pollen_HB1.jpg)",
  },
];

export function getCatalogElementById(elementId: string): SimulatorCatalogElement | undefined {
  return SIMULATOR_CATALOG.find((el) => el.id === elementId);
}
