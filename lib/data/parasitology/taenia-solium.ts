import { ParasiteCard } from "./types";

/**
 * FICHA MAESTRA DE REFERENCIA: TAENIA SOLIUM
 * Elaborada en base a lineamientos de CDC DPDx, OMS/OPS y MINSAL Chile.
 * Fuente primaria oficial: https://www.cdc.gov/dpdx/taeniasis/index.html y https://www.cdc.gov/dpdx/cysticercosis/index.html
 */
export const TAENIA_SOLIUM_CARD: ParasiteCard = {
  id: "p25-taenia-solium",
  code: "P25",
  scientificName: "Taenia solium",
  commonNames: ["Solitaria del cerdo", "Tenuria armada", "Cestodo porcino"],
  group: "Cestodos",
  status: "disponible",
  statusNote: "Ficha maestra completa y documentada con fuentes oficiales de salud pública.",
  hosts: {
    definitive: ["Humano (Homo sapiens) — alberga el estróbilo adulto en el lumen del intestino delgado."],
    intermediate: ["Cerdo doméstico y silvestre (Sus scrofa) — alberga los metacestodos (Cysticercus cellulosae) en tejidos musculares y vísceras."],
    accidental: ["Humano (Homo sapiens) — al ingerir huevos embrionados se convierte en hospedador intermediario accidental, desarrollando cisticercosis tisular o neurocisticercosis."],
  },
  localization: [
    "Intestino delgado",
    "Sistema nervioso central (SNC)",
    "Musculatura y tejido subcutáneo",
    "Ojo"
  ],
  transmissionRoutes: [
    "Teniasis: Ingestión de carne de cerdo cruda o insuficientemente cocida infectada con cisticercos viables (Cysticercus cellulosae).",
    "Cisticercosis humana: Ingestión fecal-oral de huevos viables eliminados en las heces de un portador humano de Taenia solium (agua o alimentos contaminados, hortalizas de regadío con aguas servidas, o autoinfección ano-mano-boca)."
  ],
  infectiveForms: [
    "Para teniasis intestinal: Cisticerco invaginado viable (Cysticercus cellulosae) presente en el tejido porcino.",
    "Para cisticercosis / neurocisticercosis: Huevo embrionado que contiene la oncosfera hexacanta, excretado en las heces humanas."
  ],
  diagnosticForms: [
    "Teniasis: Proglótides grávidos expulsados (morfología con 7 a 13 ramas uterinas principales por lado) y huevos esféricos radiados en heces.",
    "Neurocisticercosis: Quistes viables (vesiculares), en degeneración (coloidales/granulares) o calcificados observados por Resonancia Magnética (RM) y Tomografía Computarizada (TC); detección serológica de anticuerpos por electroinmunotransferencia (EITB / Western blot)."
  ],
  clinicalSummary: {
    syndromes: [
      "Teniasis intestinal (frecuentemente asintomática o paucisintomática)",
      "Neurocisticercosis parenquimatosa (crisis epilépticas, cefalea)",
      "Neurocisticercosis extraparenquimatosa (hidrocefalia, aracnoiditis basilar)",
      "Cisticercosis muscular y subcutánea (nódulos indoloros)",
      "Cisticercosis ocular (uveítis, desprendimiento de retina)"
    ],
    incubationPeriod: "Teniasis: 2 a 3 meses para el desarrollo del adulto maduro. Neurocisticercosis: meses a varias décadas antes del inicio de síntomas neurológicos.",
    keySymptoms: [
      "Eliminación pasiva de proglótides en la deposición o ropa interior",
      "Molestia o dolor abdominal inespecífico, náuseas, apetito variable",
      "En neurocisticercosis: crisis epilépticas focales o generalizadas de inicio en el adulto, cefalea progresiva, hipertensión endocraneana"
    ],
    severeComplications: [
      "Status epiléptico o hipertensión intracraneal mortal en neurocisticercosis racemosa o ventricular",
      "Aracnoiditis inflamatoria y accidentes cerebrovasculares isquémicos por vasculitis adyacente al quiste",
      "Pérdida de visión por cisticercosis intraocular"
    ]
  },
  diagnosticMethods: [
    {
      name: "Examen coproparasitológico seriado (Teleman / flotación)",
      sampleType: "Heces frescas (3 muestras seriadas en días alternos)",
      sensitivitySpecificity: "Sensibilidad coprológica moderada (~40-60%); microscopía óptica NO distingue huevos de T. solium de T. saginata.",
      indication: "Sospecha de teniasis intestinal o tamizaje del entorno de un paciente con neurocisticercosis.",
      limitations: "No diagnostica neurocisticercosis. Los huevos son intermitentes. Requiere reportarse estrictamente como 'Huevos de Taenia sp.'."
    },
    {
      name: "Aclaramiento y tinción de proglótides con tinta china o lactofenol",
      sampleType: "Proglótide grávido entero recuperado de heces",
      sensitivitySpecificity: "Excelente especificidad para diferenciar T. solium (7-13 ramas uterinas primarias) de T. saginata (15-30 ramas).",
      indication: "Diferenciación de especie ante la expulsión espontánea de segmentos del gusano.",
      limitations: "Requiere un proglótide grávido íntegro; los proglótides inmaduros carecen de ramificaciones diagnósticas."
    },
    {
      name: "Resonancia Magnética (RM) y Tomografía Computarizada (TC) de encéfalo",
      sampleType: "Neuroimagen contrastada",
      sensitivitySpecificity: "RM: Gold standard para quistes intraventriculares y vesiculares con escólex visible (signo del punto en el hoyo). TC: máxima sensibilidad para calcificaciones.",
      indication: "Paciente con crisis epilépticas nuevas, déficit focal o signos de hipertensión endocraneana en zona endémica o con antecedentes epidemiológicos.",
      limitations: "Costo y disponibilidad; requiere correlación con criterios diagnósticos de Del Brutto."
    },
    {
      name: "Inmunoelectrotransferencia ligada a enzimas (EITB / Western Blot)",
      sampleType: "Suero o líquido cefalorraquídeo (LCR)",
      sensitivitySpecificity: "Sensibilidad > 98% en pacientes con quistes múltiples viables; menor (~50-60%) en lesión única o quistes calcificados.",
      indication: "Confirmación serológica de cisticercosis humana.",
      limitations: "Reactividad en suero indica exposición previa o infección activa pero no localiza los quistes; falsos negativos en lesiones únicas calcificadas."
    }
  ],
  treatmentFirstLine: "Teniasis intestinal: Praziquantel (5-10 mg/kg dosis única oral) o Niclosamida (2 g oral dosis única con laxante posterior). Neurocisticercosis: Esquema individualizado según ubicación y viabilidad; típicamente Albendazol (15 mg/kg/día por 10-14 días) o Praziquantel + Albendazol, SIEMPRE acompañado de corticosteroides (Dexametasona o Prednisona) para modular la respuesta inflamatoria antes y durante el parasiticida, y antiepilépticos si hay crisis.",
  preventionControl: [
    "Inspección veterinaria estricta de carnes en mataderos autorizados y decomiso de carcasas infectadas ('carne cisticercosa').",
    "Cocción completa de la carne de cerdo (temperatura interna mínima de 63°C a 71°C en el centro del corte).",
    "Adecuado saneamiento básico, disposición de excretas y prohibición del uso de aguas residuales no tratadas para riego agrícola.",
    "Lavado riguroso de manos con agua y jabón antes de comer y tras usar el inodoro.",
    "Tratamiento oportuno de todo portador humano de Taenia solium para cortar la fuente de huevos infectantes para cerdos y humanos.",
    "Educación sanitaria a criadores de cerdos en áreas rurales evitando la crianza libre o coprófaga."
  ],
  has3DModel: true,
  hasMicroscopy: true,
  hasLifeCycle: true,
  hasGeography: true,
  hasCases: true,
  reviewDate: "2026-10-15",
  reviewer: "Comité Editorial MedStudy · Parasitología Médica",
  sources: [
    {
      title: "CDC DPDx · Laboratory Identification of Parasitic Diseases of Public Health Concern: Taeniasis",
      organization: "Centers for Disease Control and Prevention (CDC, EE. UU.)",
      url: "https://www.cdc.gov/dpdx/taeniasis/index.html",
      accessedDate: "2026-10"
    },
    {
      title: "CDC DPDx · Laboratory Identification of Parasitic Diseases: Cysticercosis",
      organization: "Centers for Disease Control and Prevention (CDC, EE. UU.)",
      url: "https://www.cdc.gov/dpdx/cysticercosis/index.html",
      accessedDate: "2026-10"
    },
    {
      title: "WHO Guidelines on management of Taenia solium neurocysticercosis",
      organization: "Organización Mundial de la Salud (OMS)",
      url: "https://www.who.int/publications/i/item/9789240032231",
      accessedDate: "2026-10"
    },
    {
      title: "Cisticercosis y Teniasis: Situación epidemiológica y normativa de vigilancia",
      organization: "Departamento de Epidemiología, Ministerio de Salud de Chile (MINSAL)",
      url: "https://epi.minsal.cl/",
      accessedDate: "2026-10"
    }
  ]
};
