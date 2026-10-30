/**
 * DATOS DEL COMPARADOR EDUCATIVO DE IDENTIFICACIÓN MICROSCÓPICA
 * Parasitología Médica · LYOH
 *
 * Diseñado para el entrenamiento visual de estudiantes de Tecnología Médica y carreras afines
 * en la diferenciación entre formas parasitarias reales y pseudoparásitos/artefactos semejantes.
 *
 * Todas las microfotografías corresponden a especímenes reales documentados en CDC DPDx.
 * No incluye imágenes generadas por IA ni ilustraciones artificiales.
 */

export interface MicroscopicMarker {
  id: string;
  number: number;
  x: number; // Porcentaje horizontal (0 - 100) respecto al archivo original
  y: number; // Porcentaje vertical (0 - 100) respecto al archivo original
  title: string;
  descriptionPhoto: string; // Rasgo visible específicamente en esta fotografía
  descriptionGeneral: string; // Fundamento biológico general según la literatura
}

export interface CatalogReference {
  pdfId: string;
  label: string;
  relationType: "exact_card" | "group_example";
  note?: string;
}

export interface MicroscopicImageSpec {
  id: string;
  role: "parasite" | "artifact";
  roleLabel: string;
  organismName: string;
  taxonomicGroup: string;
  stageOrNature: string;
  sampleType: string;
  preparationTechnique: string;
  stain: string;
  magnification: string;
  scaleAvailable: boolean;
  scaleText: string;
  calibration: null;
  documentedSize: string;
  specimenMeasurementNote?: string;
  originalWidthPx: number;
  originalHeightPx: number;
  maxUsefulZoom: number;
  alt: string;
  authorship: string;
  contributor?: string;
  sourcePageUrl: string;
  sourceFileUrl: string;
  sourceFigure: string;
  localSrc: string;
  reuseConditions: string;
  rightsStatus: "permitted";
  checkedOn: string;
  licenseStatus: "Public Domain (U.S. Gov / CDC)" | "Public Health Courtesy";
  catalogReferences: CatalogReference[];
  markers: MicroscopicMarker[];
}

export interface MicroscopicComparison {
  id: string;
  title: string;
  shortTitle: string;
  learningObjective: string;
  parasiteName: string;
  artifactName: string;
  clinicalScenario: string;
  explorationHints: string[];
  confusionReason: string[];
  differentiationKeys: string[];
  diagnosticLimitations: string[];
  parasiteImage: MicroscopicImageSpec;
  artifactImage: MicroscopicImageSpec;
  caseReferenceUrl?: string;
  caseReferenceNote?: string;
  pedagogicalDisclaimer: string;
  evidenceStatus: "supported";
  specialistReview: {
    status: "not-reviewed";
    reviewedOn: null;
    scope: string;
  };
  reviewStatus: string;
}

export const MICROSCOPIC_COMPARISONS: MicroscopicComparison[] = [
  {
    id: "comp-taenia-vs-polen",
    title: "Huevo de Taenia spp. frente a grano de polen",
    shortTitle: "Taenia spp. vs Polen",
    learningObjective:
      "Distinguir la arquitectura del embrióforo radiado y la oncosfera hexacanta de Taenia spp. frente a granos de polen con ornamentación periférica semejante.",
    parasiteName: "Taenia spp. (Huevo)",
    artifactName: "Grano de polen vegetal (Artefacto)",
    clinicalScenario:
      "Paciente con sintomatología gastrointestinal inespecífica o frotis coproparasitológico de control. En el examen microscópico se observa una estructura redondeada con reborde de aspecto estriado que plantea duda entre un huevo de cestodo y un artefacto vegetal.",
    explorationHints: [
      "Acércate al borde periférico de ambas muestras: observa si las líneas radiales atraviesan un anillo grueso y uniforme o si forman un reborde irregular de pared vegetal.",
      "Desplaza cada muestra hacia el centro y explora su interior con zoom digital: busca si existen pequeñas estructuras alargadas y refringentes (ganchos) dentro de la masa interna.",
      "Revisa la ficha de preparación debajo de cada visor: ten presente que una muestra no está teñida y la otra tiene tinción tricrómica, por lo que el color del fondo y del objeto no es el criterio diferencial."
    ],
    confusionReason: [
      "Ambos elementos pueden presentar contorno esférico o subesférico en preparaciones microscópicas.",
      "En determinados planos focales, las ornamentaciones, poros o surcos de la exina del polen simulan las estriaciones radiales transversales del embrióforo de Taenia.",
      "La coloración en el microscopio depende de la preparación y tinción empleada (o de la impregnación biliar en heces), lo que puede inducir a error si solo se juzga el aspecto general."
    ],
    differentiationKeys: [
      "Ganchos de la oncosfera: El huevo de Taenia contiene un embrión hexacanto (6 ganchos quitinosos refractiles; en el plano focal de esta microfotografía se distinguen 4 con claridad). El grano de polen carece de ganchos y de embrión helmíntico.",
      "Cubierta y estriaciones: En Taenia, el embrióforo es un anillo grueso de bloques prismáticos queratinizados con estriación radial regular. En el polen, las marcas corresponden a la pared botánica (exina) sin bloques de queratina.",
      "Independencia del color respecto a la identidad: La microfotografía del polen corresponde a un frotis teñido con tricrómico y la del huevo a un montaje húmedo sin teñir. El color refleja la técnica, no la naturaleza parasitaria."
    ],
    diagnosticLimitations: [
      "La morfología microscópica del huevo NO permite diferenciar entre Taenia solium y Taenia saginata (ni de otros miembros de Taeniidae). Debe informarse como 'Huevo de Taenia spp.'.",
      "En el Caso 169 de CDC DPDx se documentó un grano de polen de 10–12 µm confundido con Taenia; esa medida corresponde únicamente a ese espécimen y no a todos los pólenes.",
      "En una fotografía de plano focal único pueden no verse los 6 ganchos simultáneamente; en el microscopio real la ausencia aparente en un solo plano exige recorrer la profundidad con el micrométrico antes de descartar."
    ],
    caseReferenceUrl: "https://www.cdc.gov/dpdx/monthlycasestudies/2005/case169.html",
    caseReferenceNote:
      "Caso mensual CDC DPDx #169 (2005): documenta un grano de polen de 10–12 µm remitido por sospecha de huevo de Taenia (informado finalmente como sin parásitos).",
    parasiteImage: {
      id: "taenia-egg-cdc-1",
      role: "parasite",
      roleLabel: "Forma parasitaria",
      organismName: "Taenia spp.",
      taxonomicGroup: "Cestodo · Familia Taeniidae",
      stageOrNature: "Huevo (embrióforo con oncosfera)",
      sampleType: "Proglótide grávido de adulto disecado",
      preparationTechnique: "Montaje húmedo (wet mount)",
      stain: "Sin tinción (unstained)",
      magnification: "No especificado en la leyenda de la figura (galería indica 400× en montajes equivalentes)",
      scaleAvailable: false,
      scaleText: "Escala no disponible",
      calibration: null,
      documentedSize: "30–35 µm de diámetro según texto general de galería CDC DPDx",
      specimenMeasurementNote: "Sin medición individual calibrada para este ejemplar.",
      originalWidthPx: 300,
      originalHeightPx: 300,
      maxUsefulZoom: 2.5,
      alt: "Microfotografía de huevo de Taenia spp. en montaje húmedo sin teñir, mostrando embrióforo grueso estriado radialmente y cuatro ganchos visibles en la oncosfera central.",
      authorship: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
      sourcePageUrl: "https://www.cdc.gov/dpdx/taeniasis/",
      sourceFileUrl: "https://www.cdc.gov/dpdx/taeniasis/images/1/Taenia_egg1.jpg",
      sourceFigure: "Figure E (Taenia_egg1.jpg)",
      localSrc: "/images/parasitology/comparador/taenia_egg1.jpg",
      reuseConditions:
        "Dominio público (material de agencia federal de EE.UU. / CDC DPDx). Disponible gratuitamente en el sitio de CDC. Su uso requiere atribución a CDC DPDx, conservar la integridad diagnóstica y declarar que no implica respaldo institucional.",
      rightsStatus: "permitted",
      checkedOn: "2026-10-24",
      licenseStatus: "Public Domain (U.S. Gov / CDC)",
      catalogReferences: [
        {
          pdfId: "P25",
          label: "Taenia solium",
          relationType: "group_example",
          note: "Ejemplo de especie del grupo (huevos indistinguibles por microscopía óptica)"
        },
        {
          pdfId: "P26",
          label: "Taenia saginata",
          relationType: "group_example",
          note: "Ejemplo de especie del grupo (huevos indistinguibles por microscopía óptica)"
        }
      ],
      markers: [
        {
          id: "m-t1",
          number: 1,
          x: 46,
          y: 23,
          title: "Embrióforo grueso con estriaciones radiales",
          descriptionPhoto:
            "Anillo periférico grueso de tono pardo-ámbar atravesado por finas estriaciones radiales regulares en todo su perímetro.",
          descriptionGeneral:
            "El embrióforo de Taenia spp. está formado por bloques prismáticos queratinizados adyacentes que le dan su aspecto radiado característico."
        },
        {
          id: "m-t2",
          number: 2,
          x: 44,
          y: 45,
          title: "Ganchos de la oncosfera visibles en este plano",
          descriptionPhoto:
            "En el cuadrante centro-izquierdo de la oncosfera se distinguen cuatro ganchos alargados y refringentes con sus extremos engrosados.",
          descriptionGeneral:
            "La oncosfera (embrión hexacanto) posee seis ganchos en total; en una captura de un único plano focal suelen enfocarse claramente entre dos y cuatro."
        },
        {
          id: "m-t3",
          number: 3,
          x: 58,
          y: 66,
          title: "Límite interno de la oncosfera y cápsula externa",
          descriptionPhoto:
            "Contorno circular nítido que delimita la masa embrionaria interna respecto del embrióforo, rodeado por restos hialinos de la membrana externa.",
          descriptionGeneral:
            "La membrana vitelina externa es frágil y frecuentemente se pierde al liberarse los huevos en el lumen intestinal."
        }
      ]
    },
    artifactImage: {
      id: "pollen-hb2-cdc",
      role: "artifact",
      roleLabel: "Elemento semejante",
      organismName: "Grano de polen vegetal",
      taxonomicGroup: "Elemento botánico (Artefacto en muestra fecal)",
      stageOrNature: "Grano de polen",
      sampleType: "Muestra fecal",
      preparationTechnique: "Frotis fecal teñido",
      stain: "Tinción tricrómica (trichrome stain)",
      magnification: "No especificado en la fuente",
      scaleAvailable: false,
      scaleText: "Escala no disponible",
      calibration: null,
      documentedSize: "No especificada para este ejemplar (el Caso 169 de CDC documentó 10–12 µm en otro espécimen de polen)",
      specimenMeasurementNote: "El dato de 10–12 µm pertenece al ejemplar del Caso 169, no a todo el polen vegetal.",
      originalWidthPx: 300,
      originalHeightPx: 300,
      maxUsefulZoom: 2.5,
      alt: "Microfotografía de un grano de polen en frotis fecal con tinción tricrómica, con borde aparentemente estriado en este plano focal pero sin ganchos internos.",
      authorship: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
      sourcePageUrl: "https://www.cdc.gov/dpdx/artifacts/",
      sourceFileUrl: "https://www.cdc.gov/dpdx/artifacts/images/3/pollen_HB2.jpg",
      sourceFigure: "Figure D (pollen_HB2.jpg)",
      localSrc: "/images/parasitology/comparador/pollen_hb2.jpg",
      reuseConditions:
        "Dominio público (CDC DPDx). Disponible gratuitamente en el sitio de CDC. Requiere atribución a CDC DPDx y declaración de ausencia de respaldo institucional.",
      rightsStatus: "permitted",
      checkedOn: "2026-10-24",
      licenseStatus: "Public Domain (U.S. Gov / CDC)",
      catalogReferences: [],
      markers: [
        {
          id: "m-p1",
          number: 1,
          x: 49,
          y: 32,
          title: "Cubierta vegetal (exina) con pseudomarcas radiales",
          descriptionPhoto:
            "En este plano de enfoque, la pared del grano muestra divisiones transversales periféricas que imitan el embrióforo de Taenia, pero presenta una muesca o abertura lateral izquierda.",
          descriptionGeneral:
            "La exina de diversos pólenes posee columelas y aberturas germinativas que, vistas en corte óptico, pueden parecer estriaciones helmínticas."
        },
        {
          id: "m-p2",
          number: 2,
          x: 49,
          y: 46,
          title: "Interior sin oncosfera ni ganchos refringentes",
          descriptionPhoto:
            "El centro del grano muestra contenido homogéneo con un pliegue oscuro diagonal, sin rastro de ganchos quitinosos.",
          descriptionGeneral:
            "Los granos de polen contienen citoplasma vegetativo/generativo vegetal y carecen de estructuras embrionarias animales."
        }
      ]
    },
    pedagogicalDisclaimer:
      "Herramienta educativa de entrenamiento visual con imágenes de referencia. No utilizar para diagnóstico de muestras de pacientes.",
    evidenceStatus: "supported",
    specialistReview: {
      status: "not-reviewed",
      reviewedOn: null,
      scope: "Pendiente de revisión por la coordinadora de Parasitología."
    },
    reviewStatus: "Evidencia documental verificada en CDC DPDx · Pendiente de revisión por especialista."
  },
  {
    id: "comp-ascaris-vs-polen",
    title: "Huevo fértil corticado de Ascaris lumbricoides frente a grano de polen",
    shortTitle: "Ascaris lumbricoides vs Polen",
    learningObjective:
      "Diferenciar la cubierta mamelonada y el contenido embrionario del huevo fértil corticado de Ascaris lumbricoides frente a granos de polen con ornamentación superficial espinosa.",
    parasiteName: "Ascaris lumbricoides (Huevo fértil corticado)",
    artifactName: "Grano de polen vegetal (Artefacto)",
    clinicalScenario:
      "Examen coproparasitológico en montaje húmedo donde se observa un elemento ovalado de cubierta gruesa y ornamentada, frecuente motivo de confusión entre huevos fértiles de nematodos y polen en tránsito intestinal.",
    explorationHints: [
      "Amplía el contorno exterior de ambas muestras: compara si las salientes del borde son ondulaciones redondeadas y romas o si terminan en puntas cónicas agudas.",
      "Observa inmediatamente debajo de la capa externa: busca en cuál de las dos imágenes se distingue una cáscara interna continua y lisa separada del centro.",
      "Compara el centro de cada elemento: ¿hay una masa celular esférica bien delimitada con un espacio libre alrededor o un relleno granular continuo?"
    ],
    confusionReason: [
      "Ambos elementos tienen forma redondeada a ovalada y una superficie externa marcadamente ornamentada que destaca en el montaje húmedo.",
      "En preparaciones fecales concentradas, el polen puede presentar coloración parduzca similar a la capa albuminoidea teñida por pigmentos biliares.",
      "La propia galería de artefactos de CDC DPDx documenta en la leyenda de esta imagen (pollen_WA1.jpg) su gran similitud superficial con el huevo fértil de Ascaris lumbricoides."
    ],
    differentiationKeys: [
      "Ornamentación de la cubierta: El huevo fértil corticado de Ascaris presenta mamelones gruesos, redondeados y de cimas romas. Este grano de polen exhibe estructuras similares a espinas cónicas puntiagudas en su capa externa.",
      "Capas de la pared: En Ascaris se distingue una gruesa cáscara interna hialina y lisa por debajo de la capa mamelonada externa. En el grano de polen no se observa esa doble cubierta helmíntica.",
      "Contenido interno: El huevo fértil de Ascaris muestra una masa embrionaria central redondeada (óvulo fecundado sin segmentar) separada de la pared por un pequeño espacio claro; el polen muestra un interior granular uniforme."
    ],
    diagnosticLimitations: [
      "Esta comparación corresponde exclusivamente al huevo FÉRTIL CORTICADO de Ascaris lumbricoides. Los huevos decorticados carecen de la capa mamelonada externa y presentan una cubierta lisa que requiere otra comparación diferencial.",
      "Los huevos infértiles de Ascaris son más alargados (85–95 µm), tienen cubierta más delgada e irregular y su interior está lleno de gránulos refringentes desorganizados.",
      "Los rasgos del polen aquí descritos pertenecen a este espécimen concreto; no existen reglas morfológicas únicas para todos los pólenes vegetales."
    ],
    parasiteImage: {
      id: "ascaris-fertile-cdc-bam1",
      role: "parasite",
      roleLabel: "Forma parasitaria",
      organismName: "Ascaris lumbricoides",
      taxonomicGroup: "Nematodo intestinal · Orden Ascaridida",
      stageOrNature: "Huevo fértil corticado (mamelonado)",
      sampleType: "Muestra de heces humanas",
      preparationTechnique: "Montaje húmedo (wet mount)",
      stain: "Sin tinción (unstained)",
      magnification: "No especificado en la leyenda de esta figura (figuras contiguas de la serie indican 200×)",
      scaleAvailable: false,
      scaleText: "Escala no disponible",
      calibration: null,
      documentedSize: "45–75 µm de longitud (rango general documentado en galería CDC DPDx para huevos fértiles)",
      specimenMeasurementNote: "Sin escala calibrada individual en la imagen.",
      originalWidthPx: 300,
      originalHeightPx: 300,
      maxUsefulZoom: 2.5,
      alt: "Microfotografía de huevo fértil corticado de Ascaris lumbricoides en montaje húmedo no teñido, con cubierta externa mamelonada redondeada, cáscara interna gruesa y masa celular central redondeada.",
      authorship: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
      contributor: "Serie BAM",
      sourcePageUrl: "https://www.cdc.gov/dpdx/ascariasis/",
      sourceFileUrl: "https://www.cdc.gov/dpdx/ascariasis/images/2/Ascaris_fertile_BAM1.jpg",
      sourceFigure: "Figure D (Ascaris_fertile_BAM1.jpg)",
      localSrc: "/images/parasitology/comparador/ascaris_fertile_bam1.jpg",
      reuseConditions:
        "Dominio público (CDC DPDx). Disponible gratuitamente en el sitio de CDC. Requiere atribución a CDC DPDx, conservar la integridad de la imagen y declarar ausencia de respaldo institucional.",
      rightsStatus: "permitted",
      checkedOn: "2026-10-24",
      licenseStatus: "Public Domain (U.S. Gov / CDC)",
      catalogReferences: [
        {
          pdfId: "P19",
          label: "Ascaris lumbricoides",
          relationType: "exact_card",
          note: "Ficha oficial del catálogo de Microbiología LYOH"
        }
      ],
      markers: [
        {
          id: "m-a1",
          number: 1,
          x: 47,
          y: 29,
          title: "Cubierta externa corticada con mamelones redondeados",
          descriptionPhoto:
            "Borde externo formado por protuberancias anchas, onduladas y de extremo romo que rodean todo el huevo.",
          descriptionGeneral:
            "Capa albuminoidea externa secretada en el útero de la hembra y teñida naturalmente por pigmentos biliares en el intestino."
        },
        {
          id: "m-a2",
          number: 2,
          x: 33,
          y: 47,
          title: "Cáscara interna gruesa y continua",
          descriptionPhoto:
            "Anillo refringente liso y bien delimitado ubicado entre los mamelones externos y la célula central.",
          descriptionGeneral:
            "Cubierta quitinosa y lipídica que confiere gran resistencia mecánica y química al huevo en el ambiente."
        },
        {
          id: "m-a3",
          number: 3,
          x: 47,
          y: 49,
          title: "Masa embrionaria central sin segmentar",
          descriptionPhoto:
            "Célula germinal esférica, densa y bien circunscrita en el centro, separada de la cáscara interna por un estrecho espacio claro.",
          descriptionGeneral:
            "En heces recién emitidas el huevo fértil contiene una sola célula aún no embrionada."
        }
      ]
    },
    artifactImage: {
      id: "pollen-wa1-cdc",
      role: "artifact",
      roleLabel: "Elemento semejante",
      organismName: "Grano de polen vegetal",
      taxonomicGroup: "Elemento botánico (Artefacto en muestra fecal)",
      stageOrNature: "Grano de polen en montaje fecal",
      sampleType: "Muestra fecal concentrada",
      preparationTechnique: "Montaje húmedo concentrado (concentrated wet mount)",
      stain: "No especificada en la leyenda",
      magnification: "No especificado en la fuente",
      scaleAvailable: false,
      scaleText: "Escala no disponible",
      calibration: null,
      documentedSize: "No especificada en la fuente para este espécimen",
      specimenMeasurementNote: "Las dimensiones de los pólenes varían ampliamente según la planta de origen.",
      originalWidthPx: 300,
      originalHeightPx: 300,
      maxUsefulZoom: 2.5,
      alt: "Microfotografía de grano de polen en montaje húmedo concentrado de heces, con proyecciones externas puntiagudas tipo espina y contenido granular.",
      authorship: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
      contributor: "Washington State Public Health Laboratories",
      sourcePageUrl: "https://www.cdc.gov/dpdx/artifacts/",
      sourceFileUrl: "https://www.cdc.gov/dpdx/artifacts/images/3/pollen_WA1.jpg",
      sourceFigure: "Figure A (pollen_WA1.jpg)",
      localSrc: "/images/parasitology/comparador/pollen_wa1.jpg",
      reuseConditions:
        "Material publicado en CDC DPDx con crédito a Washington State Public Health Laboratories. Se conserva atribución expresa, procedencia gratuita en CDC y aviso de no respaldo institucional.",
      rightsStatus: "permitted",
      checkedOn: "2026-10-24",
      licenseStatus: "Public Health Courtesy",
      catalogReferences: [],
      markers: [
        {
          id: "m-pa1",
          number: 1,
          x: 46,
          y: 20,
          title: "Proyecciones externas puntiagudas (tipo espina)",
          descriptionPhoto:
            "En la periferia del grano sobresalen puntas cónicas breves y agudas, distintas de las ondas redondeadas de Ascaris.",
          descriptionGeneral:
            "La leyenda oficial de CDC DPDx señala estas estructuras espinosas ('spine-like structures') como el rasgo clave para separarlo del huevo de Ascaris."
        },
        {
          id: "m-pa2",
          number: 2,
          x: 51,
          y: 46,
          title: "Contenido interno granular continuo",
          descriptionPhoto:
            "El centro presenta granulación reticulada que ocupa toda la cavidad sin formar un óvulo retraído ni mostrar cáscara quitinosa interna.",
          descriptionGeneral:
            "Corresponde a la estructura interna del grano de polen y al relieve de su exina proyectado en el plano focal."
        }
      ]
    },
    pedagogicalDisclaimer:
      "Herramienta educativa de entrenamiento visual con imágenes de referencia. No utilizar para diagnóstico de muestras de pacientes.",
    evidenceStatus: "supported",
    specialistReview: {
      status: "not-reviewed",
      reviewedOn: null,
      scope: "Pendiente de revisión por la coordinadora de Parasitología."
    },
    reviewStatus: "Evidencia documental verificada en CDC DPDx · Pendiente de revisión por especialista."
  },
  {
    id: "comp-giardia-vs-levaduras",
    title: "Quiste de Giardia duodenalis frente a levaduras en frotis fecal",
    shortTitle: "Giardia duodenalis vs Levaduras",
    learningObjective:
      "Reconocer las estructuras internas visibles (núcleos y fibrillas) del quiste de Giardia duodenalis frente a células de levadura en montajes húmedos teñidos con yodo.",
    parasiteName: "Giardia duodenalis (Quiste)",
    artifactName: "Levaduras en muestra fecal",
    clinicalScenario:
      "Montaje húmedo teñido con solución de yodo (Lugol) donde se observan pequeños cuerpos ovalados amarillentos. Es fundamental distinguir un quiste de protozoo flagelado de levaduras habituales en las heces.",
    explorationHints: [
      "En la primera muestra, amplía el polo superior izquierdo del quiste: busca pequeños círculos bien definidos que corresponden a los núcleos.",
      "Recorre el eje central del quiste de Giardia y compáralo con el interior de las dos células grandes de levadura de la segunda imagen (ubicadas arriba a la derecha y abajo a la izquierda): ¿en cuál se observan trazos fibrilares longitudinales?",
      "Observa el contorno de la pared: compara la fina separación entre pared y citoplasma en el quiste frente a la pared gruesa y el relleno denso de las levaduras."
    ],
    confusionReason: [
      "Tanto los quistes de Giardia duodenalis como las levaduras tienen forma ovalada o elipsoidal y dimensiones que pueden superponerse.",
      "Ambos elementos adquieren tonalidades amarillentas a pardas en montajes húmedos teñidos con yodo.",
      "En observación rápida a bajo aumento, el contorno refringente de las levaduras puede confundirse con la pared quística de un protozoo."
    ],
    differentiationKeys: [
      "Estructuras internas visibles: En el quiste de Giardia se distinguen núcleos circulares (dos son claramente visibles en el polo superior izquierdo de esta fotografía) y fibrillas longitudinales internas. Las levaduras carecen de núcleos múltiples de este tipo y de fibrillas o axostilo.",
      "Pared y citoplasma: El quiste de Giardia muestra una pared lisa bien definida con un tenue halo claro subyacente; las levaduras de la segunda fotografía presentan una pared refringente gruesa con interior denso y granulado uniforme.",
      "Terminología y biología: Giardia duodenalis es un protozoo y su forma de resistencia es un QUISTE (nunca debe llamarse 'huevo de Giardia'). La gemación puede orientar hacia levaduras cuando está presente, pero no es obligatoria ni aparece en todos los ejemplares."
    ],
    diagnosticLimitations: [
      "En un único plano focal pueden no apreciarse los 4 núcleos de un quiste maduro de Giardia (en esta imagen se distinguen dos núcleos en el polo anterior y las fibrillas centrales).",
      "La ausencia de gemación no descarta que un elemento sea una levadura; en la fotografía seleccionada las levaduras no muestran gemación evidente y aun así se diferencian por la ausencia de estructuras internas de Giardia.",
      "La observación en montaje con yodo no permite identificar la especie de levadura; tampoco sustituye a tinciones permanentes (como tricrómico) o pruebas inmunológicas cuando la morfología es dudosa."
    ],
    parasiteImage: {
      id: "giardia-cyst-cdc-wtmt1",
      role: "parasite",
      roleLabel: "Forma parasitaria",
      organismName: "Giardia duodenalis",
      taxonomicGroup: "Protozoo flagelado · Orden Diplomonadida",
      stageOrNature: "Quiste",
      sampleType: "Muestra fecal",
      preparationTechnique: "Montaje húmedo (wet mount)",
      stain: "Teñido con yodo (iodine stain)",
      magnification: "No especificado en la fuente",
      scaleAvailable: false,
      scaleText: "Escala no disponible",
      calibration: null,
      documentedSize: "8–19 µm de longitud, promedio 10–14 µm (según texto general de galería CDC DPDx)",
      specimenMeasurementNote: "Sin escala calibrada individual en la fotografía.",
      originalWidthPx: 300,
      originalHeightPx: 300,
      maxUsefulZoom: 2.5,
      alt: "Microfotografía de quiste ovalado de Giardia duodenalis en montaje húmedo con yodo, donde se aprecian dos núcleos en el polo superior izquierdo, fibrillas longitudinales centrales y pared quística lisa.",
      authorship: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
      sourcePageUrl: "https://www.cdc.gov/dpdx/giardiasis/",
      sourceFileUrl: "https://www.cdc.gov/dpdx/giardiasis/images/1/Giardia_cyst_wtmt.jpg",
      sourceFigure: "Figure A (Giardia_cyst_wtmt.jpg)",
      localSrc: "/images/parasitology/comparador/giardia_cyst_wtmt.jpg",
      reuseConditions:
        "Dominio público (CDC DPDx). Disponible gratuitamente en el sitio de CDC. Requiere atribución a CDC DPDx, conservar la integridad diagnóstica y declarar ausencia de respaldo institucional.",
      rightsStatus: "permitted",
      checkedOn: "2026-10-24",
      licenseStatus: "Public Domain (U.S. Gov / CDC)",
      catalogReferences: [
        {
          pdfId: "P02",
          label: "Giardia duodenalis",
          relationType: "exact_card",
          note: "Ficha oficial del catálogo de Microbiología LYOH"
        }
      ],
      markers: [
        {
          id: "m-g1",
          number: 1,
          x: 43,
          y: 45,
          title: "Núcleos visibles en el polo anterior",
          descriptionPhoto:
            "Se distinguen claramente dos cuerpos circulares contiguos con cariosoma en el extremo superior izquierdo del quiste.",
          descriptionGeneral:
            "Los quistes de Giardia duodenalis tienen de 2 (inmaduros) a 4 (maduros) núcleos; según el plano de enfoque se visualizan parcial o totalmente."
        },
        {
          id: "m-g2",
          number: 2,
          x: 50,
          y: 53,
          title: "Fibrillas longitudinales internas (axostilo)",
          descriptionPhoto:
            "Trazos lineales y curvados en la región media e inferior derecha del citoplasma del quiste.",
          descriptionGeneral:
            "Corresponden a los axonemas intracitoplasmáticos y cuerpos medios propios de la arquitectura interna de Giardia."
        },
        {
          id: "m-g3",
          number: 3,
          x: 56,
          y: 45,
          title: "Pared quística lisa y definida",
          descriptionPhoto:
            "Contorno ovalado uniforme con un delgado espacio claro entre la pared y el citoplasma teñido con yodo.",
          descriptionGeneral:
            "En montajes húmedos y tinciones es frecuente observar una leve retracción del citoplasma respecto de la pared quística."
        }
      ]
    },
    artifactImage: {
      id: "yeast-cdc-wtmt1",
      role: "artifact",
      roleLabel: "Elemento semejante",
      organismName: "Levaduras en heces",
      taxonomicGroup: "Elemento fúngico (Artefacto / comensal en examen parasitológico)",
      stageOrNature: "Células de levadura",
      sampleType: "Muestra fecal concentrada",
      preparationTechnique: "Montaje húmedo concentrado (concentrated wet mount)",
      stain: "Teñido con yodo (iodine stain)",
      magnification: "No especificado en la fuente",
      scaleAvailable: false,
      scaleText: "Escala no disponible",
      calibration: null,
      documentedSize: "No especificada en la fuente para estos ejemplares",
      specimenMeasurementNote: "No debe identificarse especie fúngica solo por esta preparación.",
      originalWidthPx: 300,
      originalHeightPx: 300,
      maxUsefulZoom: 2.5,
      alt: "Microfotografía de levaduras en montaje húmedo concentrado de heces teñido con yodo, mostrando dos células ovaladas principales de pared gruesa e interior granular sin núcleos ni fibrillas de Giardia.",
      authorship: "Division of Parasitic Diseases and Malaria (DPDx), CDC",
      sourcePageUrl: "https://www.cdc.gov/dpdx/artifacts/",
      sourceFileUrl: "https://www.cdc.gov/dpdx/artifacts/images/2/yeast_wtmt1.jpg",
      sourceFigure: "Figure A (yeast_wtmt1.jpg)",
      localSrc: "/images/parasitology/comparador/yeast_wtmt1.jpg",
      reuseConditions:
        "Dominio público (CDC DPDx). Disponible gratuitamente en el sitio de CDC. Requiere atribución a CDC DPDx y declaración de ausencia de respaldo institucional.",
      rightsStatus: "permitted",
      checkedOn: "2026-10-24",
      licenseStatus: "Public Domain (U.S. Gov / CDC)",
      catalogReferences: [],
      markers: [
        {
          id: "m-y1",
          number: 1,
          x: 75,
          y: 17,
          title: "Pared celular fúngica gruesa y refringente",
          descriptionPhoto:
            "En la célula ovalada del cuadrante superior derecho se aprecia una cubierta continua de borde grueso con halo refringente externo.",
          descriptionGeneral:
            "La pared de las levaduras es rígida y uniforme, sin las estructuras fibrilares internas de un quiste de protozoo."
        },
        {
          id: "m-y2",
          number: 2,
          x: 25,
          y: 72,
          title: "Interior denso sin núcleos ni fibrillas de Giardia",
          descriptionPhoto:
            "En la célula ovalada del cuadrante inferior izquierdo el interior se ve granulado y homogéneo, sin núcleos en pares ni trazos longitudinales.",
          descriptionGeneral:
            "Aunque algunas levaduras pueden presentar gemación como pista adicional, no es obligatoria ni aparece en estas células; la diferenciación aquí se basa en la ausencia de arquitectura interna de Giardia."
        }
      ]
    },
    pedagogicalDisclaimer:
      "Herramienta educativa de entrenamiento visual con imágenes de referencia. No utilizar para diagnóstico de muestras de pacientes.",
    evidenceStatus: "supported",
    specialistReview: {
      status: "not-reviewed",
      reviewedOn: null,
      scope: "Pendiente de revisión por la coordinadora de Parasitología."
    },
    reviewStatus: "Evidencia documental verificada en CDC DPDx · Pendiente de revisión por especialista."
  }
];
