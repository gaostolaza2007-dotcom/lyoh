import { LifeCycle } from "./types";

/**
 * CICLOS DE VIDA DETALLADOS POR ETAPAS
 * Referencia principal: CDC DPDx (Life Cycle of Taenia solium & Cysticercosis).
 * Permite seleccionar cada fase interactiva y examinar hospedador, ubicación,
 * transformación, vía de transmisión, formas infectantes y diagnósticas.
 */
export const TAENIA_SOLIUM_LIFE_CYCLE: LifeCycle = {
  parasiteId: "p25-taenia-solium",
  speciesName: "Taenia solium",
  cycleType: "Ciclo indirecto (heteroxénico)",
  summary: "Ciclo heteroxénico que involucra obligatoriamente al humano como hospedador definitivo para la teniasis intestinal y al cerdo como hospedador intermediario para la cisticercosis porcina. Crucialmente, el ser humano también puede actuar como hospedador intermediario accidental si ingiere huevos embrionados, desarrollando cisticercosis humana / neurocisticercosis.",
  differencesBetweenFormsNote: "REGLA CLÍNICA DE ORO: Comer carne de cerdo con cisticercos produce TENIASIS INTESTINAL (solitaria adulta en el intestino). Ingerir huevos de Taenia solium provenientes de heces humanas produce CISTICERCOSIS / NEUROCISTICERCOSIS (quistes en cerebro y tejidos). Comer carne de cerdo NO causa neurocisticercosis de forma directa.",
  sources: [
    {
      title: "CDC DPDx · Taeniasis Life Cycle Diagram",
      url: "https://www.cdc.gov/dpdx/taeniasis/index.html"
    },
    {
      title: "CDC DPDx · Cysticercosis Life Cycle Diagram",
      url: "https://www.cdc.gov/dpdx/cysticercosis/index.html"
    }
  ],
  stages: [
    {
      stepNumber: 1,
      title: "1. Adulto en el intestino delgado humano y excreción de huevos",
      hostType: "Hospedador Definitivo",
      hostName: "Humano (Homo sapiens)",
      anatomicalLocation: "Lumen del yeyuno e íleon superior",
      biologicalTransformation: "El estróbilo adulto (2-7 m de longitud, con 800-1000 proglótides) vive fijado a la mucosa por el escólex. Diariamente se desprenden proglótides grávidos terminales repletos de decenas de miles de huevos embrionados, que se eliminan con las deposiciones.",
      transmissionRoute: "Excreción fecal de proglótides y huevos libres al medio ambiente.",
      isInfectiveStage: false,
      isDiagnosticStage: true,
      diagnosticStageName: "Proglótides grávidos y huevos esféricos radiados en examen coproparasitológico.",
      clinicalSignificance: "Teniasis intestinal generalmente asintomática; el paciente es la fuente epidemiológica activa y peligrosa de huevos infectantes para sí mismo y sus convivientes.",
      relatedResourceId: "micro-ts-proglottid"
    },
    {
      stepNumber: 2,
      title: "2. Ingestión de huevos por el cerdo (o por el humano accidentalmente)",
      hostType: "Hospedador Intermediario",
      hostName: "Cerdo (Sus scrofa) u Humano (accidental)",
      anatomicalLocation: "Medio ambiente exterior (suelo, agua, hortalizas) hacia el tracto digestivo",
      biologicalTransformation: "Los cerdos en crianza libre ingieren heces humanas o alimentos contaminados con huevos. Los humanos ingieren huevos por contaminación fecal-oral (agua sin tratar, verduras crudas o manos contaminadas).",
      transmissionRoute: "Vía digestiva fecal-oral.",
      isInfectiveStage: true,
      infectiveStageName: "Huevo embrionado con oncosfera hexacanta (forma infectante para cisticercosis).",
      isDiagnosticStage: false,
      clinicalSignificance: "Punto crítico de intervención de salud pública: el saneamiento básico y lavado de manos rompen esta transmisión.",
      relatedResourceId: "micro-ts-egg"
    },
    {
      stepNumber: 3,
      title: "3. Eclosión y penetración de la oncosfera en la mucosa intestinal",
      hostType: "Hospedador Intermediario",
      hostName: "Cerdo u Humano",
      anatomicalLocation: "Estómago y duodeno hacia la pared intestinal",
      biologicalTransformation: "El jugo gástrico y las sales biliares disuelven el embrióforo radiado. La oncosfera (embrión hexacanto) se activa, despliega sus 6 ganchos quitinosos y penetra activamente la mucosa intestinal alcanzando vénulas mesentéricas y vasos linfáticos.",
      transmissionRoute: "Invasión vascular post-eclosión.",
      isInfectiveStage: false,
      isDiagnosticStage: false,
      clinicalSignificance: "Etapa microscópica silente; la oncosfera utiliza secreciones líticas y movimientos de sus ganchos para atravesar la barrera epitelial.",
      relatedResourceId: "taenia-egg-schema"
    },
    {
      stepNumber: 4,
      title: "4. Diseminación hematógena y tropismo tisular",
      hostType: "Hospedador Intermediario",
      hostName: "Cerdo u Humano",
      anatomicalLocation: "Circulación venosa portal, corazón derecho, pulmones y circulación arterial sistémica",
      biologicalTransformation: "Las oncosferas viajan por el torrente sanguíneo hacia tejidos con alta perfusión vascular: músculo esquelético, miocardio, tejido celular subcutáneo y el encéfalo (a través de la barrera hematoencefálica).",
      transmissionRoute: "Diseminación hematógena sistémica.",
      isInfectiveStage: false,
      isDiagnosticStage: false,
      clinicalSignificance: "En el humano, el neurotropismo determina la gravedad clínica: el encéfalo es una de las localizaciones predilectas debido a su rica vascularización.",
      relatedResourceId: "cysticercus-schema"
    },
    {
      stepNumber: 5,
      title: "5. Enquistamiento como Cysticercus cellulosae (Cisticercosis)",
      hostType: "Hospedador Intermediario",
      hostName: "Músculo del cerdo / Encéfalo y tejidos del humano",
      anatomicalLocation: "Cerebro (cortex, ventrículos, espacio subaracnoideo), músculos estriados, ojo",
      biologicalTransformation: "En 60 a 70 días, la oncosfera se transforma en un metacestodo vesicular blanquecino de 5-10 mm con líquido interno y un escólex invaginado provisto de ganchos: Cysticercus cellulosae.",
      transmissionRoute: "Permanencia tisular viable durante meses o años.",
      isInfectiveStage: true,
      infectiveStageName: "Cysticercus cellulosae viable en carne porcina (forma infectante para teniasis humana).",
      isDiagnosticStage: true,
      diagnosticStageName: "Quiste con escólex en Resonancia Magnética (RM) / Tomografía (TC) de cerebro; biopsia de nódulos.",
      clinicalSignificance: "En cerdos: 'carne granillenta' decomisable. En humanos: Neurocisticercosis con crisis epilépticas, hipertensión endocraneana o hidrocefalia obstructiva.",
      relatedResourceId: "micro-ts-cyst"
    },
    {
      stepNumber: 6,
      title: "6. Carnivorismo: Ingestión de cisticercos y fijación del adulto (Teniasis)",
      hostType: "Hospedador Definitivo",
      hostName: "Humano (Homo sapiens)",
      anatomicalLocation: "Estómago hacia el yeyuno superior",
      biologicalTransformation: "El ser humano ingiere carne de cerdo infectada cruda o mal cocida. Los jugos gástricos estimulan la evaginación del escólex. Con sus 4 ventosas y doble corona de ganchos se ancla firmemente a la mucosa del yeyuno y comienza a generar proglótides. En 2-3 meses alcanza la madurez reproductiva, cerrando el ciclo.",
      transmissionRoute: "Carnivorismo de carne porcina infectada.",
      isInfectiveStage: false,
      isDiagnosticStage: false,
      clinicalSignificance: "Origina exclusivamente TENIASIS INTESTINAL (no neurocisticercosis). El gusano puede vivir varios años produciendo huevos diariamente.",
      relatedResourceId: "micro-ts-scolex"
    }
  ]
};

export const LIFE_CYCLES_LIST: LifeCycle[] = [
  TAENIA_SOLIUM_LIFE_CYCLE,
];
