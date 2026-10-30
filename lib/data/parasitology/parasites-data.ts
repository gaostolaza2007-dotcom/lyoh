import { ParasiteCard, ParasiteGroup, AnatomicLocalization } from "./types";
import { TAENIA_SOLIUM_CARD } from "./taenia-solium";
import { PARASITE_CARDS } from "../microbiology/parasites";
import { hasParasite3DModel } from "./models-registry";

/**
 * ESPECIFICACIÓN DOCUMENTAL RIGUROSA Y EXPLÍCITA DE LAS 35 ESPECIES DEL ATLAS DE PARÁSITOS
 * 
 * Basada en fuentes primarias institucionales: CDC DPDx, OMS, ISP Chile y MINSAL.
 * No utiliza inferencias automáticas, heurísticas de texto ni valores predeterminados.
 * Fecha de revisión documental: 2026-10-20.
 */

interface ExplicitSpeciesData {
  group: ParasiteGroup;
  localization: AnatomicLocalization[];
  commonNames: string[];
  status: "disponible" | "parcial" | "pendiente";
  statusNote: string;
  hosts: {
    definitive: string[];
    intermediate: string[];
    accidental?: string[];
    reservoir?: string[];
  };
  transmissionRoutes: string[];
  infectiveForms: string[];
  diagnosticForms: string[];
  clinicalSummary: {
    syndromes: string[];
    keySymptoms: string[];
    severeComplications: string[];
  };
  diagnosticMethods: {
    name: string;
    sampleType: string;
    indication: string;
    limitations: string;
    sensitivitySpecificity?: string;
  }[];
  treatmentFirstLine: string;
  preventionControl: string[];
  sources: {
    title: string;
    organization: string;
    url?: string;
    accessedDate?: string;
  }[];
  hasMicroscopy?: boolean;
  hasGeography?: boolean;
  hasCases?: boolean;
}

const EXPLICIT_SPECIES_DATA: Record<string, ExplicitSpeciesData> = {
  "micro-4": {
    group: "Protozoos apicomplejos",
    localization: ["Sangre y sistema reticuloendotelial", "Hígado y vías biliares", "Sistema nervioso central (SNC)"],
    commonNames: ["P. falciparum"],
    status: "disponible",
    statusNote: "Ficha clínica con reconstrucción 3D interactiva de formas sanguíneas (trofozoíto en anillo intraeritrocitario y gametocito maduro en media luna) verificada con CDC DPDx Malaria.",
    hosts: {
      definitive: ["Mosquito hembra del género Anopheles (ciclo sexual esporogónico en intestino y glándulas salivales)."],
      intermediate: ["Ser humano (esquizogonia exoeritrocitaria hepática primaria asintomática sin hipnozoítos y ciclo asexual patogénico en eritrocitos)."],
    },
    transmissionRoutes: ["Picadura de mosquito Anopheles hembra; infrecuentemente por transfusión de sangre, punción accidental o vía congénita transplacentaria."],
    infectiveForms: [
      "Esporozoítos móviles inoculados por la saliva de la hembra de Anopheles al alimentarse.",
      "Trofozoítos y merozoítos intraeritrocitarios viables en transmisión no vectorial (transfusional o punción)."
    ],
    diagnosticForms: [
      "Trofozoítos jóvenes en anillo (citoplasma fino, 1 o 2 gránulos de cromatina, frecuentes formas acoladas/appliqué y multiparasitismo en hematíes normocíticos).",
      "Gametocitos maduros falciformes o en media luna patognomónicos en frotis o gota gruesa teñidos con Giemsa."
    ],
    clinicalSummary: {
      syndromes: ["Malaria falciparum (paludismo terciano maligno)", "Malaria grave complicada"],
      keySymptoms: ["Accesos febriles irregulares o continuos con calofríos intensos, diaforesis profusa, cefalea intensa, postración, anemia hemolítica y esplenomegalia progresiva."],
      severeComplications: [
        "Malaria cerebral (encefalopatía difusa aguda con coma profundo, convulsiones generalizadas y alta letalidad)",
        "Acidosis metabólica láctica grave (respiración acidótica profunda de Kussmaul)",
        "Síndrome de distrés respiratorio agudo (SDRA) y edema pulmonar agudo no cardiogénico",
        "Insuficiencia renal aguda (necrosis tubular aguda o fiebre hemoglobinúrica / «blackwater fever»)",
        "Anemia severa normocítica normocrómica por lisis eritrocitaria masiva y diseritropoyesis",
        "Coagulación intravascular diseminada (CID), hipoglicemia severa y shock distributivo («malaria álgida»)"
      ],
    },
    diagnosticMethods: [
      {
        name: "Frotis sanguíneo fino y gota gruesa con tinción de Giemsa a pH 7.2 (estándar de oro parasitológico)",
        sampleType: "Sangre periférica capilar o venosa con EDTA (toma seriada cada 6–12 h)",
        indication: "Sospecha clínica de malaria en paciente febril con antecedente de viaje o residencia en zona endémica",
        limitations: "Los trofozoítos maduros y esquizontes suelen estar secuestrados en microvasculatura profunda y no se observan en sangre periférica.",
      },
      {
        name: "Pruebas de diagnóstico rápido (RDT) basadas en detección de antígeno HRP-2 y pan-pLDH / aldolasa",
        sampleType: "Sangre total capilar o venosa",
        indication: "Diagnóstico inicial rápido en urgencias o puntos de atención primaria sin microscopista calificado",
        limitations: "HRP-2 puede persistir positivo hasta 4–5 semanas tras tratamiento exitoso; mutaciones con deleción del gen pfhrp2/3 pueden dar falsos negativos.",
      },
      {
        name: "PCR cuantitativa y multiplex para especies de Plasmodium",
        sampleType: "Sangre total con EDTA",
        indication: "Identificación de especie, parasitemias submicroscópicas e infecciones mixtas",
        limitations: "Mayor costo y tiempo de respuesta que la microscopía; requiere infraestructura molecular especializada.",
      }
    ],
    treatmentFirstLine: "Malaria no complicada: Terapia combinada basada en artemisinina (ACT: arteméter-lumefantrina o artesunato-amodiaquina). Malaria grave: Artesunato intravenoso inmediato (2.4 mg/kg a las 0, 12 y 24 h, luego diario) seguido de ciclo completo de ACT oral.",
    preventionControl: [
      "Uso de mosquiteros impregnados con insecticida de acción prolongada (LLIN) y repelentes cutáneos con DEET o icaridina en áreas endémicas.",
      "Quimioprofilaxis oral para viajeros según resistencia geográfica (atovacuona-proguanil, doxiciclina o mefloquina).",
      "Control de vectores Anopheles mediante rociado residual intradomiciliario y drenaje de criaderos.",
      "Tamizaje serológico y molecular obligatorio de donantes en bancos de sangre."
    ],
    hasMicroscopy: true,
    hasGeography: true,
    hasCases: true,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Malaria (Plasmodium spp.)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/malaria/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "WHO Guidelines for Malaria",
        organization: "World Health Organization (WHO)",
        url: "https://www.who.int/teams/global-malaria-programme/guidelines-for-malaria",
        accessedDate: "2026-10-20"
      },
      {
        title: "Circular de Vigilancia Epidemiológica de Malaria - Departamento de Epidemiología",
        organization: "Ministerio de Salud de Chile (MINSAL) / ISP Chile",
        url: "https://epi.minsal.cl/",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "micro-6": {
    group: "Protozoos flagelados",
    localization: ["Intestino delgado"],
    commonNames: ["Giardia lamblia", "G. lamblia", "Giardia intestinalis"],
    status: "disponible",
    statusNote: "Ficha clínica con reconstrucción 3D interactiva de sus 2 formas evolutivas (trofozoíto piriforme binucleado con disco ventral y quiste ovalado tetranucleado) verificada con CDC DPDx Giardiasis.",
    hosts: {
      definitive: ["Ser humano y mamíferos domésticos y silvestres (ensamblajes genéticos A y B zoonóticos en humanos; ensamblajes C–G propios de cánidos, félidos y rumiantes)."],
      intermediate: ["No posee hospedador intermediario (ciclo monoxénico directo fecal-oral)."],
    },
    transmissionRoutes: ["Ingestión fecal-oral de quistes viables en agua de consumo no tratada o recreacional, alimentos contaminados o fómites, y contacto interpersonal directo (guarderías, prácticas sexuales oro-anales)."],
    infectiveForms: [
      "Quiste maduro tetranucleado esferoide/ovalado (dosis infectante baja: 10 a 25 quistes; pared quística de alta resistencia que sobrevive meses en agua fría y resiste la cloración convencional)."
    ],
    diagnosticForms: [
      "Quistes ovalados (8–14 × 7–10 µm) con pared hialina lisa de doble contorno, citoplasma retraído, 4 núcleos anteriores y fibrillas axonémicas visibles en heces pastosas o formadas.",
      "Trofozoítos piriformes binucleados móviles (10–20 × 5–15 µm) con simetría bilateral, disco ventral cóncavo suctorio y 4 pares de flagelos en heces líquidas diarreicas o aspirado duodenal."
    ],
    clinicalSummary: {
      syndromes: ["Giardiasis aguda autolimitada", "Giardiasis crónica con malabsorción", "Infección asintomática de portador"],
      keySymptoms: ["Diarrea pastosa o acuosa, esteatorreica, amarillenta y de olor fétido (sin sangre ni moco pus), dolor cólico epigástrico posprandial, meteorismo, flatulencia fétida, eructos con olor a azufre y anorexia."],
      severeComplications: [
        "Síndrome de malabsorción intestinal crónica con esteatorrea persistente y pérdida ponderal significativa",
        "Desnutrición calórico-proteica severa y retraso del crecimiento pondoestatural en niños menores de 5 años",
        "Déficit secundario de disacaridasas (intolerancia transitoria adquirida a la lactosa por daño en ribete en cepillo)",
        "Hipovitaminosis A, B12 y deficiencia de zinc y folato por atrofia vellositaria parcial",
        "Síndrome de intestino irritable posinfeccioso y fatiga crónica prolongada"
      ],
    },
    diagnosticMethods: [
      {
        name: "Examen coproparasitológico seriado (3 muestras en días alternos) con concentración (Teleman o Faust) y tinción de Lugol / Tricrómico",
        sampleType: "Heces frescas o fijadas en formalina / SAF",
        indication: "Diarrea prolongada, esteatorrea, sospecha de malabsorción o tamizaje escolar",
        limitations: "La excreción de quistes es marcadamente intermitente; una sola muestra negativa no descarta la infección (sensibilidad sube de ~50% a >90% con 3 muestras).",
      },
      {
        name: "Inmunoensayo enzimático (ELISA) o inmunocromatografía de detección de coproantígenos de Giardia",
        sampleType: "Heces frescas o refrigeradas",
        indication: "Confirmación de alta sensibilidad y cribado en brotes institucionales",
        limitations: "No evalúa la viabilidad parasitaria inmediata posratamiento; costo superior al examen microscópico.",
      },
      {
        name: "Paneles moleculares de PCR multiplex gastrointestinal",
        sampleType: "Heces sin preservantes tóxicos para ADN",
        indication: "Diagnóstico diferencial de diarrea infecciosa refractaria o coinfecciones",
        limitations: "Disponibilidad limitada en atención primaria.",
      }
    ],
    treatmentFirstLine: "Tinidazol (dosis única oral de 2 g en adultos, 50 mg/kg en niños) o Metronidazol (250–500 mg cada 8 h por 5 a 7 días). Alternativa: Nitazoxanida oral (500 mg cada 12 h por 3 días).",
    preventionControl: [
      "Filtración del agua con filtros certificados de poro ≤1 µm o ebullición enérgica por ≥1 minuto (los quistes son resistentes a los niveles habituales de cloro).",
      "Lavado riguroso de manos con agua y jabón antes de comer, preparar alimentos y después de ir al baño o mudar pañales.",
      "Lavado exhaustivo de frutas y verduras de consumo crudo con agua segura.",
      "Manejo de contactos y exclusión temporal de manipuladores de alimentos sintomáticos."
    ],
    hasMicroscopy: true,
    hasGeography: true,
    hasCases: true,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Giardiasis (Giardia duodenalis)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/giardiasis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Guía para el Diagnóstico Coproparasitológico de Giardiasis y Coccidios",
        organization: "Instituto de Salud Pública de Chile (ISP Chile)",
        url: "https://www.ispch.gob.cl",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p03": {
    group: "Protozoos apicomplejos",
    localization: ["Hígado y vías biliares", "Sangre y sistema reticuloendotelial"],
    commonNames: ["P. vivax"],
    status: "disponible",
    statusNote: "Ficha clínica con reconstrucción 3D hiperrealista de sus 4 formas evolutivas (trofozoíto ameboide en reticulocito con puntos de Schüffner, esquizonte de 16 merozoítos, gametocito redondo e hipnozoíto hepático) verificada con CDC DPDx Malaria.",
    hosts: {
      definitive: ["Mosquito hembra del género Anopheles (ciclo esporogónico sexual)."],
      intermediate: ["Ser humano (esquizogonia hepática primaria con formación de hipnozoítos durmientes y ciclo eritrocitario asexual en reticulocitos)."],
    },
    transmissionRoutes: ["Picadura de mosquito Anopheles hembra infectado; transmisión transfusional de sangre o trasplante de órganos."],
    infectiveForms: [
      "Esporozoítos inoculados por Anopheles durante la picadura.",
      "Trofozoítos y merozoítos en transmisión sanguínea o congénita (carecen de fase de hipnozoíto)."
    ],
    diagnosticForms: [
      "Trofozoítos marcadamente ameboides con vacuolas irregulares dentro de reticulocitos agrandados (1.5–2×) y deformados, con fino punteado eosinofílico de Schüffner.",
      "Esquizontes maduros con 12 a 24 merozoítos (promedio 16) y cúmulos de pigmento hemozoína pardo-dorado.",
      "Gametocitos redondeados u ovoides compactos que llenan el reticulocito agrandado."
    ],
    clinicalSummary: {
      syndromes: ["Malaria vivax (paludismo terciano benigno recurrente)", "Malaria grave por P. vivax"],
      keySymptoms: ["Accesos febriles paroxísticos cada 48 horas (calofrío con temblor involuntario, pico febril de 40 °C, diaforesis profusa), cefalea holocraneana, mialgias, anemia y esplenomegalia palpable."],
      severeComplications: [
        "Rotura esplénica aguda subcapsular o peritoneal secundaria a esplenomegalia congestiva friable (urgencia quirúrgica)",
        "Anemia hemolítica severa por destrucción de reticulocitos y hematíes no parasitados con diseritropoyesis",
        "Recaídas palúdicas periódicas crónicas por reactivación de hipnozoítos hepáticos durmientes con desnutrición y caquexia",
        "Síndrome de distrés respiratorio agudo (SDRA) y trombocitopenia profunda con sangrado mucosal",
        "Falla renal aguda o disfunción hepática con ictericia severa"
      ],
    },
    diagnosticMethods: [
      {
        name: "Frotis sanguíneo fino y gota gruesa con tinción Giemsa a pH 7.2",
        sampleType: "Sangre capilar periférica o venosa con EDTA",
        indication: "Confirmación diagnóstica inmediata en paciente con sospecha de malaria",
        limitations: "La tinción a pH ácido (<7.0) puede ocultar los puntos de Schüffner; los hipnozoítos hepáticos son microscópicamente indetectables en sangre periférica.",
      },
      {
        name: "Pruebas rápidas de diagnóstico (RDT) pan-pLDH y determinación cuantitativa de G6PD",
        sampleType: "Sangre total",
        indication: "Confirmación rápida y descarte obligatorio de deficiencia de G6PD antes de pautar 8-aminoquinolinas",
        limitations: "RDT no cuantifica la parasitemia con precisión; los test cualitativos de G6PD pueden clasificar erróneamente a mujeres heterocigotas.",
      }
    ],
    treatmentFirstLine: "Fase sanguínea: Cloroquina oral (dosis total de 25 mg base/kg en 3 días) o ACT en áreas con cloroquino-resistencia. Cura radical antirrecaída (hipnozoítos): Primaquina oral (0.5 mg/kg/día por 14 días) o Tafenoquina dosis única (300 mg), SIEMPRE tras confirmar actividad enzimática normal de G6PD.",
    preventionControl: [
      "Cura radical supervisada para destruir los hipnozoítos hepáticos y cortar la cadena de transmisión y recaídas.",
      "Protección vectorial con mosquiteros tratados con insecticida de larga duración y repelentes con DEET.",
      "Tamizaje de donantes de sangre en zonas endémicas."
    ],
    hasMicroscopy: true,
    hasGeography: true,
    hasCases: true,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Malaria (Plasmodium vivax)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/malaria/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "WHO Guidelines for Malaria: Radical cure of Plasmodium vivax and Plasmodium ovale",
        organization: "World Health Organization (WHO)",
        url: "https://www.who.int/teams/global-malaria-programme/guidelines-for-malaria",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p04": {
    group: "Protozoos apicomplejos",
    localization: ["Hígado y vías biliares", "Sangre y sistema reticuloendotelial"],
    commonNames: ["P. ovale", "Plasmodium ovale curtisi", "Plasmodium ovale wallikeri"],
    status: "disponible",
    statusNote: "Ficha clínica con reconstrucción 3D hiperrealista de sus 4 formas evolutivas (trofozoíto en eritrocito oval fimbriado con puntos de James, esquizonte de 8 merozoítos, gametocito e hipnozoíto) verificada con CDC DPDx Malaria.",
    hosts: {
      definitive: ["Mosquito hembra del género Anopheles."],
      intermediate: ["Ser humano (esquizogonia hepática con formación de hipnozoítos latentes y ciclo eritrocitario asexual)."],
    },
    transmissionRoutes: ["Picadura de mosquito Anopheles hembra; transmisión transfusional infrecuente."],
    infectiveForms: [
      "Esporozoítos inoculados por Anopheles durante la hematofagia.",
      "Formas intraeritrocitarias en caso de transfusión de hemoderivados."
    ],
    diagnosticForms: [
      "Trofozoítos robustos y compactos en eritrocitos discretamente agrandados de forma ovalada, con extremos fimbriados (deshilachados) y granulaciones prominentes de James.",
      "Esquizontes maduros con 6 a 12 merozoítos grandes (promedio 8) en roseta laxa alrededor de pigmento pardo oscuro."
    ],
    clinicalSummary: {
      syndromes: ["Malaria terciana benigna por P. ovale"],
      keySymptoms: ["Accesos febriles cada 48 horas de intensidad típicamente más leve que P. falciparum, calofríos, diaforesis, cefalea, mialgias, anemia moderada y esplenomegalia."],
      severeComplications: [
        "Recaídas clínicas tardías tras meses o años de latencia hepática por reactivación de hipnozoítos durmientes",
        "Anemia hemolítica secundaria moderada a severa",
        "Esplenomegalia reactiva dolorosa con riesgo infrecuente de infarto esplénico"
      ],
    },
    diagnosticMethods: [
      {
        name: "Frotis fino y gota gruesa con tinción Giemsa a pH 7.2",
        sampleType: "Sangre total capilar o con EDTA",
        indication: "Identificación de eritrocitos ovalados con extremos fimbriados y esquizontes de ~8 merozoítos",
        limitations: "Puede confundirse morfológicamente con P. vivax; la parasitemia suele ser baja (<1%).",
      },
      {
        name: "PCR específica de especie y dosificación cuantitativa de G6PD",
        sampleType: "Sangre total",
        indication: "Diferenciación entre subespecies (P. ovale curtisi vs P. ovale wallikeri) y evaluación previa a primaquina",
        limitations: "Disponibilidad restringida a laboratorios de referencia.",
      }
    ],
    treatmentFirstLine: "Tratamiento esquizonticida sanguíneo con Cloroquina oral (o ACT según guías locales), SEGUIDO obligatoriamente de Primaquina oral (0.5 mg/kg/día por 14 días) para cura radical de hipnozoítos hepáticos tras confirmar actividad normal de G6PD.",
    preventionControl: [
      "Cura radical con primaquina para prevenir recaídas retardadas.",
      "Uso de mosquiteros tratados con insecticida y repelentes tópicos en áreas endémicas (África subsahariana y Pacífico occidental).",
      "Quimioprofilaxis en viajeros."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Malaria (Plasmodium ovale)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/malaria/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p05": {
    group: "Protozoos apicomplejos",
    localization: ["Sangre y sistema reticuloendotelial"],
    commonNames: ["P. malariae"],
    status: "disponible",
    statusNote: "Ficha clínica con reconstrucción 3D hiperrealista de sus 4 formas diagnósticas (trofozoíto en banda ecuatorial, esquizonte en roseta margarita de 8 merozoítos, gametocito compacto y anillo en ojo de pájaro) verificada con CDC DPDx Malaria.",
    hosts: {
      definitive: ["Mosquito hembra del género Anopheles."],
      intermediate: ["Ser humano (esquizogonia hepática primaria sin formación de hipnozoítos y ciclo asexual eritrocitario en hematíes senescentes)."],
    },
    transmissionRoutes: ["Picadura de mosquito Anopheles hembra; transmisión transfusional por persistencia asintomática prolongada en sangre."],
    infectiveForms: [
      "Esporozoítos inoculados por Anopheles durante la picadura.",
      "Trofozoítos y esquizontes en transfusiones de sangre no tamizada."
    ],
    diagnosticForms: [
      "Trofozoítos maduros que forman una «banda» ecuatorial continua a través del eritrocito normocítico o microcítico senescente, y anillos gruesos en «ojo de pájaro».",
      "Esquizontes maduros simétricos en «roseta» o «cabeza de margarita» con 6 a 12 merozoítos (típicamente 8) rodeando un cúmulo central de hemozoína negra gruesa."
    ],
    clinicalSummary: {
      syndromes: ["Malaria cuartana (paroxismos febriles cada 72 horas)", "Parasitemia crónica silente de bajo nivel"],
      keySymptoms: ["Accesos febriles periódicos cada 72 horas (días 1, 4, 7...), calofríos intensos, cefalea, mialgias, anemia y esplenomegalia progresiva."],
      severeComplications: [
        "Síndrome nefrótico cuartano por glomerulonefritis membranoproliferativa mediada por depósito crónico de inmunocomplejos (a menudo refractaria a antipalúdicos y corticoides)",
        "Anemia crónica insidiosa por parasitación silente prolongada durante décadas",
        "Esplenomegalia malárica hiperreactiva con pancitopenia"
      ],
    },
    diagnosticMethods: [
      {
        name: "Gota gruesa y frotis fino teñidos con Giemsa a pH 7.2",
        sampleType: "Sangre total venosa o capilar",
        indication: "Examen minucioso de frotis fino en busca de trofozoítos en banda y esquizontes en margarita",
        limitations: "Las parasitemias suelen ser sumamente bajas (<0.01%); se requiere observar gran cantidad de campos de gota gruesa.",
      },
      {
        name: "PCR específica para ADN de Plasmodium malariae",
        sampleType: "Sangre total con EDTA",
        indication: "Confirmación en parasitemias submicroscópicas y tamizaje en bancos de sangre",
        limitations: "Requiere laboratorio molecular.",
      }
    ],
    treatmentFirstLine: "Cloroquina oral (régimen estándar de 3 días: 25 mg base/kg en total). No requiere primaquina para cura radical ya que carece de hipnozoítos hepáticos.",
    preventionControl: [
      "Tamizaje estricto de donantes de sangre con historia epidemiológica de residencia en zonas endémicas (puede persistir hasta 40–50 años en sangre).",
      "Protección contra picaduras de Anopheles mediante mosquiteros tratados con insecticida y repelentes.",
      "Diagnóstico precoz y tratamiento completo."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Malaria (Plasmodium malariae)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/malaria/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p06": {
    group: "Nematodos",
    localization: ["Ojo", "Hígado y vías biliares", "Vías respiratorias y pulmón", "Sistema nervioso central (SNC)"],
    commonNames: ["T. canis", "Toxocara canina"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Toxocariasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Perros domésticos (Canis lupus familiaris) y cánidos silvestres (alojan gusanos adultos en intestino delgado y excretan huevos no embrionados en sus heces)."],
      intermediate: ["No posee hospedador intermediario obligado; roedores y aves actúan como hospedadores paraténicos."],
      accidental: ["Ser humano (hospedador accidental paraténico en el que las larvas eclosionan pero no maduran a adultos, realizando migración tisular visceral y ocular)."],
    },
    transmissionRoutes: ["Ingestión inadvertida de huevos embrionados viables presentes en suelo o arena contaminada con heces de perros (geofagia o pica en niños), consumo de vegetales crudos mal lavados o ingestión de vísceras crudas de hospedadores paraténicos."],
    infectiveForms: [
      "Huevos embrionados que contienen la larva de tercer estadio (L3), madurados en el suelo durante 2 a 4 semanas tras ser excretados."
    ],
    diagnosticForms: [
      "Serología ELISA con antígenos de excreción-secreción de larva L3 (TES-Ag) confirmada por Western blot específico.",
      "Observación oftalmoscópica directa de granuloma retiniano posterior o periférico con bandas de tracción vítrea en fondo de ojo (el coproparasitario humano es SIEMPRE negativo, ya que el ser humano no alberga adultos ni elimina huevos).",
      "Hallazgo de larvas L3 en cortes histopatológicos de biopsia tisular hepática o pulmonar."
    ],
    clinicalSummary: {
      syndromes: ["Síndrome de Larva Migrans Visceral (LMV)", "Larva Migrans Ocular (LMO)", "Toxocariasis encubierta / asintomática", "Neurotoxocariasis"],
      keySymptoms: ["En LMV: fiebre prolongada, hepatomegalia blanda dolorosa, tos espasmódica, sibilancias asmáticas y marcada hipereosinofilia periférica persistente (>30–50%). En LMO: disminución unilateral de la agudeza visual, leucocoria y estrabismo en escolares sin eosinofilia."],
      severeComplications: [
        "Pérdida visual unilateral irreversible o ceguera por granuloma macular, desprendimiento traccional de retina o endoftalmitis eosinofílica (simula clínicamente un retinoblastoma infantil)",
        "Meningoencefalitis eosinofílica o crisis convulsivas refractarias por invasión larvaria del sistema nervioso central (neurotoxocariasis)",
        "Miocarditis eosinofílica con insuficiencia cardíaca congestiva o arritmias potencialmente mortales",
        "Insuficiencia respiratoria aguda secundaria a neumonitis eosinofílica difusa con infiltrados pulmonares migratorios"
      ],
    },
    diagnosticMethods: [
      {
        name: "Serología TES-ELISA de tamizaje y confirmación por Western Blot",
        sampleType: "Suero (o humor acuoso/vítreo en casos de LMO)",
        indication: "Sospecha de larva migrans visceral ante hipereosinofilia inexplicada y hepatomegalia, o cuadro ocular sospechoso",
        limitations: "En la forma ocular los títulos serológicos séricos pueden ser muy bajos o negativos; el coproparasitario NO tiene utilidad diagnóstica.",
      },
      {
        name: "Examen oftalmológico bajo midriasis (biomicroscopía y oftalmoscopía indirecta)",
        sampleType: "Inspección ocular clínica in vivo",
        indication: "Leucocoria, estrabismo, uveítis unilateral o pérdida de visión en niños",
        limitations: "Diagnóstico diferencial crítico con retinoblastoma para evitar enucleaciones innecesarias.",
      },
      {
        name: "Hemograma completo con recuento absoluto de eosinófilos",
        sampleType: "Sangre total con EDTA",
        indication: "Evaluación inicial de sospecha de LMV",
        limitations: "Inespecífico por sí solo; en LMO la eosinofilia suele ser normal.",
      }
    ],
    treatmentFirstLine: "LMV: Albendazol oral (400 mg cada 12 h en adultos o 15 mg/kg/día en niños en 2 tomas por 5 a 14 días); en compromiso pulmonar, cardíaco o neurológico severo añadir corticoides sistémicos (prednisona 0.5–1 mg/kg/día). LMO: Manejo multidisciplinario con corticoides perioculares/sistémicos y vitrectomía quirúrgica si hay tracción retiniana (el uso de antihelmínticos requiere cautela para no exacerbar la inflamación ocular tras la muerte larvaria).",
    preventionControl: [
      "Desparasitación veterinaria regular de cachorros y perras reproductoras a partir de las 2 semanas de vida.",
      "Recolección y disposición sanitaria inmediata de las deyecciones caninas en parques y aceras públicas.",
      "Protección y cercado de areneros y áreas de juego infantil en plazas y colegios para impedir el acceso de perros.",
      "Lavado riguroso de manos tras manipular tierra o jugar con mascotas y corrección de la geofagia (pica) en niños pequeños."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Toxocariasis (Toxocara canis / T. cati)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/toxocariasis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Vigilancia de Zoonosis Parasitarias: Toxocariasis",
        organization: "Instituto de Salud Pública de Chile (ISP Chile)",
        url: "https://www.ispch.gob.cl",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p07": {
    group: "Protozoos ameboides",
    localization: ["Intestino grueso", "Hígado y vías biliares"],
    commonNames: ["E. histolytica"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Amebiasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (principal hospedador natural y reservorio epidemiológico; coloniza la mucosa colónica)."],
      intermediate: ["No posee hospedador intermediario (ciclo monoxénico directo fecal-oral)."],
    },
    transmissionRoutes: ["Ingestión de quistes maduros viables a través de agua o alimentos contaminados con materias fecales, manipulación antihigiénica de alimentos o prácticas sexuales orales-anales."],
    infectiveForms: [
      "Quiste esférico tetranucleado maduro resistente al ácido gástrico y a la cloración del agua."
    ],
    diagnosticForms: [
      "Trofozoítos invasivos hematófagos (20–40 µm) con pseudópodo hialino digitiforme unidireccional, núcleo con cariosoma central fino y eritrocitos fagocitados patognomónicos en citoplasma en heces frescas diarreicas.",
      "Quistes esféricos maduros (10–16 µm) con 1 a 4 núcleos y barras cromatoidales con extremos romos redondeados («en habano») en heces formadas.",
      "Detección de adhesina Gal/GalNAc por ELISA o PCR específica en heces para diferenciarla de la ameba comensal Entamoeba dispar.",
      "Serología IgG positiva por ELISA y ecografía o TC abdominal en absceso hepático amebiano."
    ],
    clinicalSummary: {
      syndromes: ["Colitis amebiana disentérica aguda", "Colitis amebiana fulminante necrosante", "Ameboma colónico", "Absceso hepático amebiano (AHA)"],
      keySymptoms: ["Diarrea sanguinolenta con abundante moco («jalea de grosella»), cólicos intensos, pujo y tenesmo rectal. En AHA: fiebre en agujas, dolor exquisito en hipocondrio derecho irradiado al hombro, hepatomegalia dolorosa a la percusión y astenia."],
      severeComplications: [
        "Rotura de absceso hepático amebiano hacia cavidad peritoneal (peritonitis aguda séptica grave), cavidad pleural/bronquios (fístula hepatobronquial con vómica de «pasta de anchoas») o pericardio (taponamiento cardíaco mortal)",
        "Megacolon tóxico fulminante con necrosis colónica transmural y perforación intestinal múltiple",
        "Ameboma inflamatorio estenosante del ciego o colon que simula adenocarcinoma colorrectal",
        "Diseminación hematógena metastásica a cerebro con abscesos cerebrales amebianos necróticos"
      ],
    },
    diagnosticMethods: [
      {
        name: "Detección de antígeno de adhesina Gal/GalNAc en heces por ELISA o PCR en tiempo real",
        sampleType: "Heces frescas sin conservantes tóxicos",
        indication: "Diferenciación obligatoria entre Entamoeba histolytica (patógena invasiva) y Entamoeba dispar (comensal avirulenta morfológicamente idéntica)",
        limitations: "Requiere laboratorio especializado; la microscopía óptica sola no puede diferenciarlas salvo eritrofagocitosis visible.",
      },
      {
        name: "Examen coproparasitológico directo en fresco seriado (3 muestras)",
        sampleType: "Heces diarreicas recién emitidas (<30 minutos)",
        indication: "Visualización de trofozoítos ameboides con eritrofagocitosis activa",
        limitations: "Baja sensibilidad; los trofozoítos se lisan rápidamente tras la evacuación.",
      },
      {
        name: "Ecografía abdominal / TC con contraste y serología IgG anti-amebiana",
        sampleType: "Imágenes hepáticas y suero",
        indication: "Diagnóstico de absceso hepático amebiano",
        limitations: "La serología puede permanecer positiva meses o años tras un episodio previo curado.",
      }
    ],
    treatmentFirstLine: "Enfermedad invasiva o absceso hepático: Amebicida tisular (Metronidazol 500–750 mg cada 8 h por 7 a 10 días o Tinidazol 2 g/día por 3 a 5 días) SEGUIDO obligatoriamente de un amebicida luminal (Paromomicina 25–35 mg/kg/día dividido en 3 dosis por 7 días o Furoato de diloxanida) para erradicar la colonización quística.",
    preventionControl: [
      "Potabilización y ebullición del agua de consumo (los quistes son destruidos por calentamiento a >60 °C pero resisten concentraciones estándar de cloro).",
      "Lavado estricto de manos e higiene fecal-oral rigurosa en manipuladores de alimentos.",
      "Prácticas sexuales seguras (uso de barreras de látex para evitar contacto oro-anal directo)."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Amebiasis (Entamoeba histolytica)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/amebiasis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Normativa de Diagnóstico y Vigilancia de Parasitosis Intestinales",
        organization: "Instituto de Salud Pública de Chile (ISP Chile)",
        url: "https://www.ispch.gob.cl",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p08": {
    group: "Protozoos apicomplejos",
    localization: ["Intestino delgado", "Hígado y vías biliares", "Vías respiratorias y pulmón"],
    commonNames: ["C. parvum"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Cryptosporidiosis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano y ganado vacuno (especialmente terneros neonatos; ciclo enteroepitelial sexual y asexual completo en el ribete en cepillo)."],
      intermediate: ["No posee hospedador intermediario (ciclo monoxénico epicelular)."],
    },
    transmissionRoutes: ["Ingestión de agua contaminada recreacional (piscinas, lagos) o de consumo, alimentos contaminados, contacto fecal-oral directo de persona a persona o zoonótico por contacto con terneros infectados."],
    infectiveForms: [
      "Ooquiste esporulado de pared gruesa (4–6 µm) que contiene 4 esporozoítos desnudos; totalmente resistente al cloro habitual y con capacidad de sobrevida ambiental prolongada."
    ],
    diagnosticForms: [
      "Ooquistes esféricos pequeños (4–6 µm) intensamente ácido-alcohol resistentes (AAR+) teñidos de color fucsia-magenta brillante con tinción de Ziehl-Neelsen modificada o Kinyoun.",
      "Inmunofluorescencia directa (DFA) con anticuerpos monoclonales marcados con FITC (fluorescencia verde brillante en pared quística).",
      "PCR multiplex para detección de ADN de Cryptosporidium."
    ],
    clinicalSummary: {
      syndromes: ["Gastroenteritis aguda acuosa en inmunocompetentes", "Diarrea crónica caquectizante refractaria en inmunodeprimidos (VIH con CD4 <100 cél/µL)", "Criptosporidiosis biliar (colangiopatía esclerosante)", "Criptosporidiosis respiratoria"],
      keySymptoms: ["Diarrea acuosa abundante, dolor abdominal cólico periumbilical, náuseas, vómitos, anorexia marcada, febrícula y pérdida de peso rápida."],
      severeComplications: [
        "Deshidratación hipovolémica severa y colapso circulatorio por diarrea coleriforme masiva (>10 a 20 L/día en pacientes con SIDA avanzado)",
        "Colangitis esclerosante asociada a SIDA y estenosis de la ampolla de Vater con pancreatitis aguda",
        "Síndrome de emaciación crónica caquectizante extrema (wasting syndrome) con malabsorción lipídica masiva",
        "Neumonitis intersticial criptosporidiásica por invasión de epitelio bronquial en pacientes gravemente inmunodeprimidos"
      ],
    },
    diagnosticMethods: [
      {
        name: "Tinción de Ziehl-Neelsen modificada o Kinyoun en muestra fecal concentrada",
        sampleType: "Heces frescas o preservadas",
        indication: "Cribado de diarrea acuosa refractaria o estudio en pacientes inmunosuprimidos",
        limitations: "Los ooquistes miden apenas 4–6 µm y pueden confundirse con levaduras si no se realiza tinción ácido-alcohol resistente.",
      },
      {
        name: "Inmunofluorescencia directa (DFA) con anticuerpos monoclonales",
        sampleType: "Heces fijadas en formalina o SAF",
        indication: "Estándar de oro de confirmación de alta sensibilidad y especificidad (>98%)",
        limitations: "Requiere microscopio de fluorescencia y reactivos de mayor costo.",
      },
      {
        name: "PCR cuantitativa y multiplex",
        sampleType: "Heces",
        indication: "Diferenciación de especie (C. parvum vs C. hominis) en estudios epidemiológicos",
        limitations: "Disponibilidad restringida a centros de referencia.",
      }
    ],
    treatmentFirstLine: "Pacientes inmunocompetentes: Nitazoxanida oral (500 mg cada 12 h en adultos por 3 días) junto a soporte hidroelectrolítico enérgico. Pacientes con VIH/SIDA: Inicio inmediato o ajuste de Terapia Antirretroviral de Gran Actividad (TARV) para reconstituir los linfocitos CD4 >100 cél/µL (la restauración inmune es la única medida comprobadamente curativa).",
    preventionControl: [
      "Filtración del agua con filtros absolutos de poro ≤1 µm o ebullición por ≥1 minuto (el cloro de piscinas NO inactiva los ooquistes).",
      "Evitar tragar agua en piscinas de uso público, parques acuáticos o lagos.",
      "Uso de guantes y lavado cuidadoso de manos tras el contacto con terneros o animales de granja con diarrea.",
      "Higiene fecal-oral estricta en guarderías infantiles y hospitales."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Cryptosporidiosis (Cryptosporidium parvum / C. hominis)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/cryptosporidiosis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Detección de Coccidios Intestinales en Muestras Fecales",
        organization: "Instituto de Salud Pública de Chile (ISP Chile)",
        url: "https://www.ispch.gob.cl",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p09": {
    group: "Protozoos apicomplejos",
    localization: ["Intestino delgado", "Hígado y vías biliares"],
    commonNames: ["C. cayetanensis"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Cyclosporiasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (único hospedador conocido; ciclo sexual y asexual en enterocitos de duodeno y yeyuno)."],
      intermediate: ["No posee hospedador intermediario; la esporulación ocurre en el medio ambiente durante 1 a 2 semanas."],
    },
    transmissionRoutes: ["Ingestión de agua contaminada o consumo de alimentos frescos contaminados (frutas blandas como frambuesas o moras, albahaca, cilantro o lechugas regadas con aguas servidas)."],
    infectiveForms: [
      "Ooquiste maduro esporulado que contiene 2 esporoquistes (con 2 esporozoítos cada uno = 4 esporozoítos en total); los ooquistes recién excretados no son inmediatamente infectantes."
    ],
    diagnosticForms: [
      "Ooquistes esféricos (8–10 µm, el doble de tamaño que Cryptosporidium) con tinción ácido-alcohol resistente variable en Kinyoun (algunos rosa pálido, otros rojo rubí intenso y otros translúcidos «fantasmas»).",
      "Autofluorescencia azul neón patognomónica bajo microscopía de fluorescencia ultravioleta a 330–365 nm (sin necesidad de tinción).",
      "Detección de ADN por PCR en tiempo real."
    ],
    clinicalSummary: {
      syndromes: ["Ciclosporiasis gastrointestinal aguda", "Diarrea acuosa prolongada o recidivante", "Fatiga posinfecciosa"],
      keySymptoms: ["Diarrea acuosa explosiva prolongada (duración típica de 3 a 7 semanas si no se trata), astenia profunda, cólicos abdominales, flatulencia, náuseas, anorexia y pérdida de peso notable."],
      severeComplications: [
        "Deshidratación hipovolémica severa y desequilibrio hidroelectrolítico en ancianos o niños",
        "Pérdida ponderal caquectizante severa por diarrea prolongada en pacientes inmunocomprometidos",
        "Colecistitis alitiásica acalculosa reactiva por invasión epitelial de la vesícula biliar",
        "Artritis reactiva o síndrome de Guillain-Barré posinfeccioso"
      ],
    },
    diagnosticMethods: [
      {
        name: "Tinción de Ziehl-Neelsen modificada o Kinyoun en muestra fecal concentrada",
        sampleType: "Heces fijadas o frescas",
        indication: "Diarrea prolongada de varias semanas tras viajes o consumo de bayas/hortalizas",
        limitations: "La tinción es marcadamente variable entre ooquistes; requiere micrometría para diferenciarlo de Cryptosporidium (8–10 µm vs 4–6 µm).",
      },
      {
        name: "Microscopía de epifluorescencia UV (330–365 nm)",
        sampleType: "Heces en fresco o suspensión salina",
        indication: "Identificación rápida por autofluorescencia azul-brillante",
        limitations: "Requiere microscopio provisto de lámpara UV.",
      },
      {
        name: "PCR multiplex para enteropatógenos",
        sampleType: "Heces",
        indication: "Confirmación en brotes alimentarios epidemiológicos",
        limitations: "Costo y disponibilidad.",
      }
    ],
    treatmentFirstLine: "Trimetoprim-Sulfametoxazol (TMP-SMX: 160/800 mg cada 12 h por 7 a 10 días en adultos; en niños 5 mg/kg de TMP cada 12 h). En pacientes alérgicos a sulfas: Ciprofloxacino oral o Nitazoxanida (con menor tasa de curación).",
    preventionControl: [
      "Lavado y desinfección minuciosa de frutas y verduras frescas de hoja antes de su consumo.",
      "Consumo exclusivo de agua potable tratada o hervida.",
      "Control higiénico-sanitario en faenas de recolección agrícola y uso de agua segura para riego."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Cyclosporiasis (Cyclospora cayetanensis)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/cyclosporiasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p10": {
    group: "Protozoos apicomplejos",
    localization: ["Intestino delgado", "Hígado y vías biliares"],
    commonNames: ["Isospora belli", "C. belli"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Cystoisosporiasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (único hospedador definitivo y natural; ciclo sexual y asexual en enterocitos de duodeno distal y yeyuno)."],
      intermediate: ["No posee hospedador intermediario (ciclo monoxénico)."],
    },
    transmissionRoutes: ["Ingestión de ooquistes maduros esporulados a través de agua o alimentos contaminados con materias fecales humanas."],
    infectiveForms: [
      "Ooquiste maduro esporulado que contiene 2 esporoquistes con 4 esporozoítos cada uno (total de 8 esporozoítos)."
    ],
    diagnosticForms: [
      "Ooquistes elipsoidales grandes (20–33 × 10–19 µm, con aspecto característico de «balón de rugby») con pared hialina lisa de doble contorno e intensamente ácido-alcohol resistentes (AAR+) en tinción de Kinyoun.",
      "Presencia de cristales bipiramidales de Charcot-Leyden en el examen microscópico de heces asociada a eosinofilia periférica.",
      "Autofluorescencia amarilla/azul bajo epifluorescencia UV."
    ],
    clinicalSummary: {
      syndromes: ["Cistoisosporiasis aguda acuosa", "Diarrea crónica emaciante en pacientes con SIDA"],
      keySymptoms: ["Diarrea acuosa prolongada, dolor cólico periumbilical, esteatorrea, náuseas, astenia, pérdida de peso marcada y eosinofilia periférica (un marcador hematológico distintivo frente a otros protozoos intestinales)."],
      severeComplications: [
        "Deshidratación hipovolémica severa y choque en pacientes con inmunodepresión celular avanzada",
        "Síndrome de malabsorción intestinal crónica grave con emaciación y desnutrición calórico-proteica extrema",
        "Colangitis alitiásica acalculosa por compromiso de la vía biliar en pacientes con VIH/SIDA",
        "Infección extraintestinal diseminada (ganglios linfáticos mesentéricos, bazo e hígado) en pacientes severamente inmunocomprometidos"
      ],
    },
    diagnosticMethods: [
      {
        name: "Tinción de Kinyoun o Ziehl-Neelsen modificada en frotis fecal concentrado",
        sampleType: "Heces seriadas (concentración por Teleman)",
        indication: "Estudio de diarrea acuosa subaguda o crónica en pacientes con VIH u otra inmunodeficiencia",
        limitations: "La excreción de ooquistes puede ser escasa e intermitente; se requieren muestras seriadas.",
      },
      {
        name: "Examen coproparasitológico directo con Lugol y luz UV",
        sampleType: "Heces frescas",
        indication: "Identificación rápida por morfología ovalada grande (20–33 µm) y autofluorescencia",
        limitations: "Menor sensibilidad que las técnicas de tinción permanente.",
      }
    ],
    treatmentFirstLine: "Trimetoprim-Sulfametoxazol (TMP-SMX: 160/800 mg cada 6 h por 10 días, luego cada 12 h por 3 semanas). En pacientes con VIH avanzado se requiere profilaxis secundaria continua con TMP-SMX hasta alcanzar reconstitución inmune con CD4 >200 cél/µL. Alternativa: Pirimetamina más ácido folínico.",
    preventionControl: [
      "Consumo de agua potable tratada o hervida.",
      "Lavado riguroso de manos y alimentos crudos.",
      "Saneamiento básico y disposición higiénica de excretas humanas."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Cystoisosporiasis (Cystoisospora belli)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/cystoisosporiasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p11": {
    group: "Protozoos apicomplejos",
    localization: ["Sistema nervioso central (SNC)", "Ojo", "Musculatura y tejido subcutáneo", "Sangre y sistema reticuloendotelial"],
    commonNames: ["T. gondii"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Toxoplasmosis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Felinos domésticos (Felis catus) y salvajes (únicos hospedadores donde se completa el ciclo sexual enteroepitelial y se excretan ooquistes no esporulados)."],
      intermediate: ["Aves y mamíferos, incluyendo al ser humano, roedores, cerdos, ovejas y vacas (alojan taquizoítos proliferativos en fase aguda y quistes tisulares con bradizoítos en cerebro y músculos en fase crónica)."],
    },
    transmissionRoutes: ["Ingestión de quistes tisulares con bradizoítos en carne cruda o mal cocida (cerdo, cordero), ingestión de ooquistes esporulados en agua, tierra o verduras contaminadas con heces felinas, transmisión transplacentaria congénita al feto, o trasplante de órganos."],
    infectiveForms: [
      "Quistes tisulares viables con cientos de bradizoítos resistentes a la pepsina.",
      "Ooquistes maduros esporulados (con 2 esporoquistes × 4 esporozoítos = 8 esporozoítos) en suelo o agua.",
      "Taquizoítos móviles en transmisión congénita vertical o accidentes de laboratorio."
    ],
    diagnosticForms: [
      "Serología escalonada: IgG e IgM anti-Toxoplasma por quimioluminiscencia o ELISA; prueba de avidez de IgG (alta avidez descarta infección adquirida en las últimas 12–16 semanas).",
      "Reacción en cadena de la polimerasa (PCR) para ADN del gen B1 de Toxoplasma en líquido amniótico (semana ≥18 de gestación), LCR o humor acuoso.",
      "Resonancia magnética cerebral con gadolinio (múltiples lesiones nodulares en diana con realce en anillo y edema perilesional en ganglios basales).",
      "Fondo de ojo con oftalmoscopía indirecta: foco blanco-amarillento algodonoso de retinocoroiditis necrosante activa en «faro en la niebla» adyacente a cicatriz retiniana antigua."
    ],
    clinicalSummary: {
      syndromes: ["Toxoplasmosis aguda adquirida en inmunocompetentes (síndrome mononucleósico)", "Toxoplasmosis congénita", "Encefalitis toxoplásmica por reactivación en inmunodeprimidos (VIH con CD4 <100 cél/µL)", "Toxoplasmosis ocular (retinocoroiditis necrosante)"],
      keySymptoms: ["En inmunocompetentes: linfadenopatía cervical o nucal indolora móvil, astenia, fiebre moderada y mialgias. En reactivación en VIH: cefalea progresiva, convulsiones focales, confusión y déficits neurológicos motores. En ocular: disminución de agudeza visual, escotomas, miodesopsias («moscas volantes») y dolor ocular."],
      severeComplications: [
        "Encefalitis toxoplásmica necrosante multifocal con edema cerebral masivo, herniación uncal y coma en pacientes con SIDA avanzado",
        "Tétrada de Sabin en toxoplasmosis congénita severa (hidrocefalia obstructiva, calcificaciones intracraneales difusas, retinocoroiditis bilateral y convulsiones)",
        "Pérdida visual irreversible o ceguera por necrosis retiniana foveal macular o desprendimiento traccional de retina",
        "Neumonitis intersticial difusa o miocarditis necrotizante en receptores de trasplante de órganos sólidos o médula ósea"
      ],
    },
    diagnosticMethods: [
      {
        name: "Perfil serológico IgG, IgM y prueba de avidez de IgG",
        sampleType: "Suero",
        indication: "Tamizaje prenatal en gestantes y confirmación de primoinfección reciente",
        limitations: "En pacientes con SIDA avanzado la IgM puede ser negativa en reactivaciones cerebrales.",
      },
      {
        name: "PCR específica para Toxoplasma gondii",
        sampleType: "Líquido amniótico (tras semana 18), LCR, humor acuoso o sangre",
        indication: "Diagnóstico prenatal de toxoplasmosis congénita y confirmación en sospecha de encefalitis o compromiso ocular",
        limitations: "Una PCR negativa en LCR no excluye totalmente el diagnóstico de encefalitis.",
      },
      {
        name: "Resonancia Magnética cerebral con contraste (gadolinio)",
        sampleType: "Neuroimagen cerebral",
        indication: "Sospecha de toxoplasmosis cerebral en pacientes inmunocomprometidos",
        limitations: "Puede simular linfoma primario del SNC (requiere diagnóstico diferencial con SPECT / PET o prueba terapéutica).",
      }
    ],
    treatmentFirstLine: "Encefalitis o infección aguda sintomática: Pirimetamina (dosis de carga 100–200 mg, luego 50–75 mg/día) MÁS Sulfadiazina (1–1.5 g cada 6 h) MÁS Ácido folínico (leucovorina 10–25 mg/día para prevenir mielosupresión). Alternativa: Trimetoprim-Sulfametoxazol IV/oral. Gestantes en primoinfección antes de semana 18: Espiramicina oral (3 g/día); tras confirmación fetal cambiar a pirimetamina-sulfadiazina tras la semana 18.",
    preventionControl: [
      "Cocción completa de toda carne de consumo (temperatura interna ≥66–71 °C) o congelación prolongada a -20 °C por ≥3 días.",
      "Mujeres gestantes seronegativas: evitar manipular bandejas de gatos o realizar labores de jardinería sin guantes; lavado meticuloso de vegetales crudos.",
      "Limpieza diaria de las cajas sanitarias de gatos (los ooquistes tardan 24 a 48 h en esporular y volverse infectantes).",
      "Quimioprofilaxis primaria con TMP-SMX en pacientes con VIH con CD4 <100 cél/µL y serología IgG positiva."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Toxoplasmosis (Toxoplasma gondii)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/toxoplasmosis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Guía Clínica Perinatal: Detección y Manejo de Toxoplasmosis en el Embarazo",
        organization: "Ministerio de Salud de Chile (MINSAL)",
        url: "https://diprece.minsal.cl",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p12": {
    group: "Protozoos flagelados",
    localization: ["Tracto urogenital"],
    commonNames: ["T. vaginalis"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Trichomoniasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (único hospedador natural y reservorio conocido; coloniza epitelio escamoso estratificado genital femenino y uretra/próstata masculina)."],
      intermediate: ["No posee hospedador intermediario (transmisión venérea directa de persona a persona)."],
    },
    transmissionRoutes: ["Contacto sexual directo (vaginal, vulvar o uretral); infrecuente transmisión perinatal vertical durante el parto vaginal."],
    infectiveForms: [
      "Trofozoíto flagelado móvil (carece totalmente de forma quística; lábil a la desecación pero viable en secreciones húmedas genitales)."
    ],
    diagnosticForms: [
      "Trofozoíto piriforme móvil (10–30 × 7–10 µm) con 4 flagelos anteriores libres, axostilo saliente posterior y membrana ondulante que recorre la mitad del cuerpo, con movimiento espasmódico rotatorio en examen en fresco.",
      "Pruebas de amplificación de ácidos nucleicos (NAAT / PCR) de máxima sensibilidad.",
      "Pruebas rápidas de detección antigénica por inmunocromatografía en exudado vaginal."
    ],
    clinicalSummary: {
      syndromes: ["Vulvovaginitis tricomoniásica", "Uretritis no gonocócica en varones", "Infección urogenital asintomática (presente en >70% de personas infectadas)"],
      keySymptoms: ["En mujeres: leucorrea abundante fluida de color amarillo-verdoso, espumosa y fétida, prurito y ardor vulvar intenso, disuria, dispareunia y «cuello uterino en fresa» (colpitis macular con petequias punteadas). En varones: secreción uretral matinal escasa serosa, prurito intrauretral y disuria leve."],
      severeComplications: [
        "Rotura prematura de membranas, parto pretérmino y recién nacidos con bajo peso al nacer en gestantes infectadas",
        "Aumento significativo (2 a 3 veces mayor) en el riesgo de adquisición y transmisión del virus de inmunodeficiencia humana (VIH) y VHS-2",
        "Enfermedad inflamatoria pélvica (EPI) por ascenso microbiano hacia endometrio y trompas uterinas",
        "Prostatitis crónica, epididimitis e infertilidad secundaria por reducción de la viabilidad y motilidad espermática en varones"
      ],
    },
    diagnosticMethods: [
      {
        name: "Prueba de amplificación de ácidos nucleicos (NAAT / PCR en orina o hisopado)",
        sampleType: "Exudado vaginal, endocervical o primera fracción de orina",
        indication: "Estándar de oro diagnóstico de máxima sensibilidad (>98%) y especificidad",
        limitations: "Mayor costo que la microscopía; requiere plataforma molecular.",
      },
      {
        name: "Examen en fresco con solución salina de secreción vaginal (montaje húmedo)",
        sampleType: "Secreción de fondo de saco vaginal posterior recién obtenida",
        indication: "Evaluación inmediata en consulta ginecológica",
        limitations: "Sensibilidad modesta (50–60%); los trofozoítos pierden movilidad rápidamente a temperatura ambiente.",
      }
    ],
    treatmentFirstLine: "Metronidazol oral (500 mg cada 12 h por 7 días en mujeres; 2 g dosis única oral en varones o pauta de 7 días). Alternativa: Tinidazol (2 g dosis única oral). Es IMPRESCINDIBLE el tratamiento sincrónico simultáneo de todas las parejas sexuales para prevenir la reinfección.",
    preventionControl: [
      "Uso consistente y correcto del preservativo de látex en todas las relaciones sexuales.",
      "Tratamiento simultáneo obligatorio de todas las parejas sexuales recientes, con abstinencia hasta completar la medicación.",
      "Tamizaje rutinario de tricomoniasis en mujeres con VIH o en control ginecológico de alto riesgo."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Trichomoniasis (Trichomonas vaginalis)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/trichomoniasis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "CDC STI Treatment Guidelines: Trichomoniasis",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/std/treatment-guidelines/trichomoniasis.htm",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p13": {
    group: "Protozoos flagelados",
    localization: ["Musculatura y tejido subcutáneo", "Intestino grueso", "Sangre y sistema reticuloendotelial", "Sistema nervioso central (SNC)"],
    commonNames: ["T. cruzi"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx American Trypanosomiasis y MINSAL Chile. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Mamíferos, incluyendo al ser humano, perros, gatos, roedores y marsupiales (alojan amastigotes intracelulares replicativos y tripomastigotes sanguíneos)."],
      intermediate: ["Insectos triatominos hematófagos (vinchucas: Triatoma infestans, Rhodnius prolixus, Panstrongylus megistus; en su intestino se multiplican los epimastigotes y se diferencian a tripomastigotes metacíclicos)."],
    },
    transmissionRoutes: ["Contaminación de la herida de picadura o mucosas con heces/deyecciones de triatominos; transmisión oral por ingestión de jugos/alimentos contaminados con vinchucas trituradas (brotes agudos); transmisión vertical congénita; transfusiones sanguíneas o trasplante de órganos."],
    infectiveForms: [
      "Tripomastigotes metacíclicos excretados en las deyecciones del triatomino al alimentarse.",
      "Tripomastigotes sanguíneos en transmisión transfusional o congénita transplacentaria."
    ],
    diagnosticForms: [
      "En fase aguda/congénita: visualización microscópica directa de tripomastigotes sanguíneos móviles (forma de C o S, kinetoplasto voluminoso posterior y membrana ondulante) en frotis/gota gruesa teñida con Giemsa o micrométodo de Strout/tubo de microhematocrito.",
      "PCR en tiempo real para ADN de kinetoplasto de T. cruzi en fase aguda o congénita.",
      "En fase crónica: serología positiva para IgG anti-T. cruzi mediante dos pruebas con principios o antígenos diferentes (ELISA e IFI / Quimioluminiscencia)."
    ],
    clinicalSummary: {
      syndromes: ["Enfermedad de Chagas aguda (chagoma de inoculación o signo de Romaña)", "Fase crónica indeterminada o latente", "Fase crónica cardíaca (miocardiopatía chagásica)", "Fase crónica digestiva (megacolon y megaesófago)"],
      keySymptoms: ["En fase aguda: edema bipalpebral unilateral indoloro con adenopatía preauricular (signo de Romaña), chagoma cutáneo, fiebre prolongada, hepatoesplenomegalia y miocarditis aguda. En fase crónica cardíaca: palpitaciones, presíncope, síncope, disnea de esfuerzo e insuficiencia cardíaca congestiva. En digestiva: constipación pertinaz de semanas y disfagia progresiva."],
      severeComplications: [
        "Miocardiopatía chagásica dilatada crónica con aneurisma apical del ventrículo izquierdo (foco trombogénico mayor de accidentes cerebrovasculares cardioembólicos)",
        "Arritmias ventriculares malignas complejas (taquicardia ventricular sostenida, fibrilación ventricular) y muerte súbita",
        "Trastornos de la conducción avanzados: Bloqueo completo de rama derecha (BCRD) con hemibloqueo anterior izquierdo (HBAI) y bloqueo AV completo",
        "Vólvulo de sigmoides isquémico y fecaloma gigante obstructivo en megacolon chagásico",
        "Reactivación del SNC con meningoencefalitis necrotizante o miocarditis fulminante en pacientes con VIH o receptores de trasplante"
      ],
    },
    diagnosticMethods: [
      {
        name: "Micrométodo de Strout o concentración por microhematocrito y PCR en sangre",
        sampleType: "Sangre total venosa o de cordón umbilical",
        indication: "Diagnóstico urgente en fase aguda, transmisión congénita neonatal o sospecha de reactivación",
        limitations: "En la fase crónica la parasitemia es indetectable por microscopía directa.",
      },
      {
        name: "Serología IgG pareada (2 ensayos con antígenos diferentes: ELISA + IFI o Quimioluminiscencia)",
        sampleType: "Suero",
        indication: "Estándar normativo OMS/OPS obligatorio para confirmar o descartar infección en fase crónica",
        limitations: "Ambas pruebas deben concordar; si discordantes, se requiere una tercera técnica dirimente (Inmunoblot).",
      },
      {
        name: "Electrocardiograma de 12 derivaciones y ecocardiograma transtorácico",
        sampleType: "Evaluación cardiovascular",
        indication: "Estadificación y seguimiento de todo paciente con serología positiva",
        limitations: "Detecta daño ya establecido; no evalúa viabilidad parasitaria.",
      }
    ],
    treatmentFirstLine: "Benznidazol oral (5 a 7 mg/kg/día dividido en 2 dosis por 60 días) o Nifurtimox (8 a 10 mg/kg/día dividido en 3 dosis por 60 a 90 días). Indicación obligatoria en fase aguda, congénita, niños/adolescentes, accidentes de laboratorio y reactivaciones; en fase crónica en adultos evaluar caso a caso según guías clínicas.",
    preventionControl: [
      "Control vectorial domiciliario de Triatoma infestans con rociado residual de insecticidas piretroides y mejora de viviendas rurales.",
      "Tamizaje serológico universal obligatorio de donantes de sangre y órganos sólidos en países endémicos.",
      "Cribado serológico de todas las mujeres embarazadas en zonas de riesgo y seguimiento neonatal sistemático con PCR/micrométodo.",
      "Educación sanitaria y buenas prácticas de higiene en la manipulación y procesamiento de alimentos en zonas de riesgo oral."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: American Trypanosomiasis (Trypanosoma cruzi)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/trypanosomiasisAmerican/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Norma Técnica para el Control y la Vigilancia de la Enfermedad de Chagas",
        organization: "Ministerio de Salud de Chile (MINSAL)",
        url: "https://diprece.minsal.cl",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p14": {
    group: "Protozoos flagelados",
    localization: ["Sangre y sistema reticuloendotelial", "Hígado y vías biliares", "Piel y anexos"],
    commonNames: ["L. donovani"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Leishmaniasis y OMS. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (en ciclo antroponótico clásico de L. donovani sensu stricto en el subcontinente indio y cuerno de África; amastigotes en macrófagos del sistema reticuloendotelial)."],
      intermediate: ["Dípteros flebótomos hembra del género Phlebotomus (desarrollo de promastigotes procíclicos y metacíclicos en el intestino)."],
      reservoir: ["Perros domésticos y cánidos silvestres en especies del complejo donovani como L. infantum."],
    },
    transmissionRoutes: ["Picadura de flebótomos hembra infectados durante su alimentación sanguínea crepuscular o nocturna; transmisión por uso compartido de jeringas en usuarios de drogas parenterales o vía congénita."],
    infectiveForms: [
      "Promastigotes metacíclicos flagelados inoculados en la dermis por la probóscide del flebótomo."
    ],
    diagnosticForms: [
      "Amastigotes intracelulares diminutos (2–4 µm) con núcleo redondo y kinetoplasto baciliforme en forma de barra (cuerpos de Leishman-Donovan) dentro de macrófagos o monocitos en aspirado de médula ósea, bazo o ganglios teñidos con Giemsa.",
      "Prueba rápida inmunocromatográfica de detección de anticuerpos rK39 en suero.",
      "PCR específica para ADN de Leishmania donovani."
    ],
    clinicalSummary: {
      syndromes: ["Leishmaniasis visceral clásica (Kala-azar)", "Leishmaniasis dérmica post-kala-azar (PKDL)", "Coinfección Leishmania-VIH"],
      keySymptoms: ["Fiebre remitente o en picos dobles diarios prolongada («fiebre dromedaria»), esplenomegalia masiva indolora («bazo gigante»), hepatomegalia blanda, palidez cutánea extrema, astenia, emaciación caquéctica e hiperpigmentación grisácea de la piel."],
      severeComplications: [
        "Mortalidad >95% en casos no tratados por caquexia extrema y falla multiorgánica progresiva",
        "Pancitopenia severa con anemia hemolítica profunda, neutropenia crítica e inmunosupresión secundaria con sepsis bacteriana fulminante o tuberculosis",
        "Diátesis hemorrágica severa con epistaxis masiva, melena o hemorragia pulmonar por trombocitopenia e insuficiencia hepática",
        "Leishmaniasis dérmica post-kala-azar (PKDL) con máculas, placas y nódulos desfigurantes cargados de parásitos que actúan como reservorio"
      ],
    },
    diagnosticMethods: [
      {
        name: "Punción y aspirado de médula ósea (o punción esplénica) con tinción de Giemsa",
        sampleType: "Médula ósea o aspirado esplénico",
        indication: "Estándar parasitológico de oro para demostración microscópica de amastigotes",
        limitations: "La punción esplénica tiene mayor sensibilidad (>95%) pero riesgo de hemorragia mortal; la punción medular es más segura (sensibilidad ~70–85%).",
      },
      {
        name: "Prueba rápida inmunocromatográfica rK39 en tira reactiva",
        sampleType: "Suero o sangre total",
        indication: "Diagnóstico inicial rápido en áreas endémicas del subcontinente indio y África",
        limitations: "Menor sensibilidad en pacientes con coinfección por VIH o en África oriental; permanece positiva años tras la curación.",
      },
      {
        name: "PCR específica para kinetoplasto de Leishmania",
        sampleType: "Sangre total con EDTA o aspirado medular",
        indication: "Confirmación en pacientes seronegativos, coinfectados con VIH o monitorización de recidivas",
        limitations: "Disponibilidad limitada en zonas rurales de bajos recursos.",
      }
    ],
    treatmentFirstLine: "Anfotericina B liposomal intravenosa (dosis total acumulada de 10 a 20 mg/kg en pautas escalonadas o monodosis de 10 mg/kg en el subcontinente indio según directrices OMS). Alternativas: Miltefosina oral o antimoniales pentavalentes (antimoniato de meglumina) en áreas sin resistencia.",
    preventionControl: [
      "Control de flebótomos mediante rociado residual de insecticidas en interiores y peridomicilios.",
      "Uso de mosquiteros de malla fina tratados con insecticida de acción prolongada.",
      "Diagnóstico precoz y tratamiento activo de casos humanos para eliminar la fuente antroponótica de parásitos.",
      "Vigilancia epidemiológica y control de reservorios caninos en áreas de L. infantum."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Leishmaniasis (Leishmania donovani)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/leishmaniasis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Control of the Leishmaniases - WHO Technical Report Series 949",
        organization: "World Health Organization (WHO)",
        url: "https://www.who.int/publications/i/item/9789241209496",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p15": {
    group: "Protozoos flagelados",
    localization: ["Piel y anexos", "Vías respiratorias y pulmón"],
    commonNames: ["L. braziliensis", "Leishmania (Viannia) braziliensis"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Leishmaniasis y OPS. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Mamíferos silvestres selváticos (roedores, marsupiales, osos hormigueros) y ser humano como hospedador accidental."],
      intermediate: ["Flebótomos hembra del género Lutzomyia (subgéneros Psychodopygus y Lutzomyia; desarrollo peripilórico en el intestino)."],
    },
    transmissionRoutes: ["Picadura de flebótomos Lutzomyia infectados en áreas boscosas o selváticas húmedas de las Américas."],
    infectiveForms: [
      "Promastigotes metacíclicos flagelados inoculados en la piel durante la picadura del flebótomo."
    ],
    diagnosticForms: [
      "Amastigotes intracelulares (2–4 µm) en frotis por raspado del borde activo de la úlcera cutánea o biopsia de mucosa teñidos con Giemsa.",
      "Aislamiento de promastigotes en cultivo de medio bifásico NNN / Schneider.",
      "PCR en tiempo real específica para el subgénero Viannia.",
      "Prueba cutánea de leishmanina (intradermorreacción de Montenegro) positiva (induración ≥5 mm a las 48–72 h)."
    ],
    clinicalSummary: {
      syndromes: ["Leishmaniasis cutánea localizada (úlcera indolora de fondo granulomatoso)", "Leishmaniasis mucocutánea o mucosa (espundia)"],
      keySymptoms: ["Úlcera redondeada u ovalada de bordes elevados, indurados y eritematosos en «cráter volcánico» con fondo granulomatoso limpio en piel expuesta. Meses o años tras la cicatrización primaria: congestión nasal persistente, rinorrea sanguinolenta, costras y destrucción destructiva progresiva del tabique nasal."],
      severeComplications: [
        "Destrucción osteocartilaginosa masiva y mutilante del tabique nasal, alas nasales, paladar blando, faringe y laringe («nariz de tapir» o «boca de fiera») con desfiguración facial irreversible",
        "Obstrucción crítica de la vía aérea superior por infiltración y edema laríngeo con riesgo de asfixia aguda que requiere traqueostomía de urgencia",
        "Sobreinfección bacteriana secundaria severa y neumonía aspirativa recurrente por disfagia",
        "Disfonía permanente o afonía completa por destrucción de las cuerdas vocales"
      ],
    },
    diagnosticMethods: [
      {
        name: "Frotis directo por raspado o impronta del borde activo de la úlcera con tinción de Giemsa",
        sampleType: "Raspado de lesión cutánea o biopsia de mucosa",
        indication: "Estudio inicial de úlcera cutánea sospechosa en pacientes con nexo epidemiológico",
        limitations: "En lesiones mucosas crónicas la carga parasitaria es extremadamente baja y la microscopía suele ser negativa (<30%).",
      },
      {
        name: "PCR específica para subgénero Viannia / Leishmania braziliensis",
        sampleType: "Biopsia tisular o hisopado de la lesión en medio de lisis",
        indication: "Estándar de oro de alta sensibilidad en leishmaniasis mucosa",
        limitations: "Requiere infraestructura de laboratorio molecular.",
      },
      {
        name: "Intradermorreacción de Montenegro (leishmanina)",
        sampleType: "Inyección intradérmica en antebrazo (lectura a 48–72 h)",
        indication: "Evaluación de respuesta inmune celular tardía (positiva en >90% de formas mucosas)",
        limitations: "No distingue entre infección pasada y activa; no identifica especie.",
      }
    ],
    treatmentFirstLine: "Tratamiento sistémico obligatorio para prevenir o tratar el compromiso mucoso: Antimoniato de meglumina o Estibogluconato de sodio (20 mg Sb5+/kg/día IV o IM por 20 a 30 días continuos). Alternativas de rescate: Anfotericina B liposomal (dosis acumulada 20–40 mg/kg) o Miltefosina oral.",
    preventionControl: [
      "Uso de repelentes (DEET), ropa protectora de manga larga impregnada con permetrina y mosquiteros de malla fina.",
      "Evitar actividades al aire libre al atardecer y anochecer en zonas boscosas o selváticas endémicas.",
      "Tratamiento médico precoz y completo de la úlcera cutánea inicial para evitar la diseminación metastásica mucosa tardía."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Leishmaniasis (Leishmania braziliensis)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/leishmaniasis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Manual de Procedimientos para la Vigilancia y Control de las Leishmaniasis en las Américas",
        organization: "Organización Panamericana de la Salud (OPS/OMS)",
        url: "https://www.paho.org",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p16": {
    group: "Protozoos apicomplejos",
    localization: ["Sangre y sistema reticuloendotelial"],
    commonNames: ["B. microti"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Babesiosis. Clasificación taxonómica corregida a Protozoos apicomplejos. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Garrapatas de cuerpo duro del género Ixodes (principalmente Ixodes scapularis en Norteamérica; ciclo sexual y esporogónico con transmisión transestadial)."],
      intermediate: ["Ratón de patas blancas (Peromyscus leucopus; reservorio natural silvestre) y ser humano (hospedador intermediario accidental que aloja trofozoítos y merozoítos intraeritrocitarios)."],
    },
    transmissionRoutes: ["Picadura de ninfa o hembra adulta de la garrapata Ixodes scapularis fijada durante ≥36 a 48 h; transfusión de concentrados eritrocitarios de donantes infectados o transmisión congénita."],
    infectiveForms: [
      "Esporozoítos inoculados por la saliva de la garrapata Ixodes durante la hematofagia prolongada.",
      "Trofozoítos y merozoítos en concentrados de hematíes transfundidos."
    ],
    diagnosticForms: [
      "Trofozoítos intraeritrocitarios en anillo pleomórficos (1.5–2.5 µm) teñidos con Giemsa, con citoplasma fino y vacuola (simulan P. falciparum pero sin hemozoína ni gametocitos).",
      "Tétradas de merozoítos unidas por sus ápices formando una «cruz de Malta» patognomónica.",
      "PCR en tiempo real específica para ADN ribosomal 18S de Babesia microti.",
      "Serología IgG positiva por inmunofluorescencia indirecta (IFI)."
    ],
    clinicalSummary: {
      syndromes: ["Babesiosis asintomática o subclínica", "Babesiosis aguda pseudogripal con anemia hemolítica", "Babesiosis grave fulminante en pacientes asplénicos o inmunodeprimidos"],
      keySymptoms: ["Fiebre remitente o irregular con calofríos intensos, diaforesis nocturna copiosa («empapa la cama»), astenia profunda, cefalea, mialgias, ictericia flavínica hemolítica, hemoglobinuria colúrica («orina oscura») y esplenomegalia."],
      severeComplications: [
        "Anemia hemolítica intravascular fulminante con caída precipitada del hematocrito e insuficiencia renal aguda por necrosis tubular aguda mioglobinúrica/hemoglobinúrica",
        "Síndrome de distrés respiratorio agudo no cardiogénico (SDRA) con hipoxemia refractaria severa",
        "Coagulación intravascular diseminada (CID) y shock hemodinámico distributivo",
        "Rotura esplénica espontánea secundaria a infartos esplénicos y congestión reticuloendotelial masiva",
        "Fallo multiorgánico fulminante y muerte en pacientes esplenectomizados, ancianos o con linfoma"
      ],
    },
    diagnosticMethods: [
      {
        name: "Frotis sanguíneo fino y gota gruesa con tinción Giemsa o Wright",
        sampleType: "Sangre total venosa o capilar con EDTA",
        indication: "Paciente con fiebre, antecedentes de picadura de garrapata o viaje a zona endémica y anemia hemolítica",
        limitations: "Puede confundirse con Plasmodium falciparum en anillos jóvenes; buscar tétradas en cruz de Malta y ausencia de pigmento hemozoína.",
      },
      {
        name: "Reacción en cadena de la polimerasa (PCR) específica en sangre periférica",
        sampleType: "Sangre total con EDTA",
        indication: "Método de elección para confirmación diagnóstica en parasitemias bajas y monitorización posratamiento",
        limitations: "Requiere laboratorio molecular especializado.",
      },
      {
        name: "Serología por Inmunofluorescencia Indirecta (IFI IgG)",
        sampleType: "Suero",
        indication: "Apoyo diagnóstico retrospectivo o tamizaje serológico (títulos ≥1:64)",
        limitations: "Puede presentar reactividad cruzada con otras especies de Babesia.",
      }
    ],
    treatmentFirstLine: "Cuadros leves a moderados: Atovacuona oral (750 mg cada 12 h) MÁS Azitromicina oral (500 mg el día 1, luego 250 mg/día) por 7 a 10 días. Cuadros graves o asplénicos: Clindamicina intravenosa (300 a 600 mg cada 6 h) MÁS Quinina oral/IV (650 mg cada 8 h), junto a exanguinotransfusión urgente si parasitemia ≥10% o hemólisis severa con fallo orgánico.",
    preventionControl: [
      "Prevención de picaduras de garrapatas en zonas boscosas o matorrales (ropa clara, pantalones por dentro de calcetines, repelentes con DEET o permetrina en ropa).",
      "Revisión corporal minuciosa y extracción precoz de garrapatas adheridas con pinzas finas (la transmisión suele requerir >36 h de fijación).",
      "Tamizaje serológico y molecular sistemático de donantes de sangre en bancos de sangre de áreas endémicas (noreste y medio oeste de EE. UU.)."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Babesiosis (Babesia microti)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/babesiosis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Clinical Overview of Babesiosis",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/babesiosis/hcp/clinical-overview/",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p17": {
    group: "Protozoos ameboides",
    localization: ["Ojo", "Sistema nervioso central (SNC)", "Piel y anexos"],
    commonNames: ["Acanthamoeba"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Free-Living Amebic Infections. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Amebas anfizoicas de vida libre (presentes en agua dulce, grifos, piscinas, soluciones de lentes de contacto caseras y polvo ambiental; no requieren hospedador para completar su ciclo)."],
      intermediate: ["No posee hospedador intermediario."],
      accidental: ["Ser humano (hospedador accidental oportunista)."],
    },
    transmissionRoutes: ["Inoculación ocular directa por uso de lentes de contacto contaminados o lavado de estuches con agua de grifo; inhalación de quistes a través de vías respiratorias o entrada por lesiones cutáneas ulceradas."],
    infectiveForms: [
      "Trofozoítos con acantópodos espinosos y quistes poliédricos o estrellados de doble pared con poros (exoquiste arrugado y endoquiste estrellado) altamente resistentes a la desecación y desinfectantes habituales."
    ],
    diagnosticForms: [
      "Quistes poliédricos estrellados de doble pared (10–25 µm) o trofozoítos con acantópodos en raspado corneal, biopsia cutánea o LCR.",
      "Cultivo en placas de agar no nutritivo con césped de Escherichia coli (aparición de surcos o huellas de desplazamiento de las amebas).",
      "Microscopía confocal in vivo de la córnea (observación directa de quistes hiperrefringentes estrellados en estroma corneal).",
      "PCR en tiempo real en raspado corneal o tejido cerebral."
    ],
    clinicalSummary: {
      syndromes: ["Queratitis por Acanthamoeba (en usuarios de lentes de contacto)", "Encefalitis amebiana granulomatosa (EAG) en inmunodeprimidos", "Acanthamoebiasis cutánea diseminada"],
      keySymptoms: ["En queratitis: dolor ocular exquisito desproporcionado a los hallazgos iniciales, fotofobia intensa, sensación de cuerpo extraño, epífora, infiltrado corneal epitelial y posterior infiltrado estromal en anillo («infiltrado anular de queratitis»). En EAG: cefalea progresiva, cambios de personalidad, fiebre, déficits neurológicos focales y signos meníngeos."],
      severeComplications: [
        "Pérdida visual severa irreversible o ceguera por necrosis estromal corneal completa, perforación ocular y endoftalmitis que requiere queratoplastia penetrante terapéutica de urgencia",
        "Encefalitis amebiana granulomatosa (EAG) subaguda o crónica casi invariablemente mortal por necrosis licuefactiva cerebral masiva e hipertensión endocraneana refractaria en inmunosuprimidos",
        "Nódulos y úlceras cutáneas metastásicas crónicas refractarias al tratamiento"
      ],
    },
    diagnosticMethods: [
      {
        name: "Microscopía confocal in vivo y raspado corneal con tinciones fluorescentes (blanco de calcoflúor) o Giemsa",
        sampleType: "Raspado del epitelio/estroma corneal",
        indication: "Queratitis dolorosa refractaria a antibióticos y antivirales en usuario de lentes de contacto",
        limitations: "Requiere entrenamiento experto para identificar los quistes de doble pared.",
      },
      {
        name: "Cultivo en agar no nutritivo con suspensión bacteriana de E. coli",
        sampleType: "Raspado corneal, líquido de estuche de lentes o biopsia",
        indication: "Aislamiento y confirmación de viabilidad amebiana",
        limitations: "El crecimiento puede tardar hasta 7–14 días.",
      },
      {
        name: "PCR en tiempo real específica para Acanthamoeba",
        sampleType: "Muestras corneales o tejido cerebral",
        indication: "Confirmación molecular rápida y de alta sensibilidad",
        limitations: "Requiere laboratorio molecular.",
      }
    ],
    treatmentFirstLine: "Queratitis: Terapia tópica combinada intensiva prolongada (meses) con biguanidas: Polihexametilén biguanida (PHMB al 0.02%) o Clorhexidina (al 0.02%) asociada a Diamidinas (Propamidina o Brolene al 0.1%). EAG sistémica: Combinación multifarmacológica de rescate con Miltefosina oral, Voriconazol, Trimetoprim-Sulfametoxazol, Fluconazol y Rifampicina.",
    preventionControl: [
      "Higiene estricta en el uso y mantenimiento de lentes de contacto: NUNCA usar agua de grifo ni saliva para lavar o conservar los lentes o estuches.",
      "Retirar los lentes de contacto antes de nadar en piscinas, lagos, jacuzzis o ducharse.",
      "Reemplazo periódico mensual de los estuches portalentes y desinfección con soluciones comerciales autorizadas."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Free Living Amebic Infections",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/freeLivingAmebic/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p18": {
    group: "Protozoos ameboides",
    localization: ["Sistema nervioso central (SNC)"],
    commonNames: ["N. fowleri"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Free-Living Amebic Infections. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ameba termófila anfizoica de vida libre (prospera en aguas dulces cálidas naturales a 35–46 °C, lagos, ríos, aguas termales y piscinas con cloración deficiente)."],
      intermediate: ["No posee hospedador intermediario."],
      accidental: ["Ser humano (hospedador accidental terminal en el que penetra por la cavidad nasal)."],
    },
    transmissionRoutes: ["Entrada forzada de agua dulce templada contaminada por la cavidad nasal al nadar, bucear o realizar irrigaciones nasales con agua no estéril, con penetración del neuroepitelio olfatorio."],
    infectiveForms: [
      "Trofozoítos ameboides móviles termófilos (con pseudópodos lobopodiales redondeados llamados lobópodos) que penetran a través de la lámina cribosa del etmoides siguiendo los axones del nervio olfatorio."
    ],
    diagnosticForms: [
      "Observación inmediata en fresco de trofozoítos ameboides móviles (10–20 µm) en Líquido Cefalorraquídeo (LCR) centrifugado (movimiento direccional rápido y núcleo con nucleolo central gigante).",
      "PCR en tiempo real específica para ADN de Naegleria fowleri en LCR o tejido cerebral.",
      "Cultivo en agar no nutritivo con césped bacteriano a 42 °C (prueba de termotolerancia diferencial).",
      "Inmunofluorescencia directa con anticuerpos específicos."
    ],
    clinicalSummary: {
      syndromes: ["Meningoencefalitis amebiana primaria (MAP) hiperaguda fulminante"],
      keySymptoms: ["Inicio abrupto de cefalea frontal bifrontal severa, fiebre elevada en espigas (>39–40 °C), náuseas, vómitos explosivos, rigidez de nuca precoz, anosmia, parosmia o alteraciones del olfato y gusto, letargia y coma rápido."],
      severeComplications: [
        "Meningoencefalitis necrotizante hemorrágica masiva fulminante del parénquima cerebral con destrucción extensa de los bulbos olfatorios y corteza frontal",
        "Hipertensión endocraneana refractaria severa con edema cerebral difuso y herniación uncal / amigdalina cerebelosa mortal",
        "Letalidad >97% con fallecimiento del paciente en un lapso de 3 a 7 días tras el inicio de los síntomas"
      ],
    },
    diagnosticMethods: [
      {
        name: "Examen en fresco de LCR recién obtenido y centrifugado bajo microscopía óptica",
        sampleType: "Líquido cefalorraquídeo recién extraído (NO refrigerar; la refrigeración inmoviliza los trofozoítos)",
        indication: "Urgencia máxima ante sospecha de meningoencefalitis purulenta con antecedentes de natación reciente en agua dulce cálida",
        limitations: "Los trofozoítos se confunden fácilmente con leucocitos polimorfonucleares si no se observa su motilidad ameboide activa.",
      },
      {
        name: "PCR en tiempo real multiplex para amebas de vida libre en LCR",
        sampleType: "LCR",
        indication: "Confirmación molecular urgente y de alta especificidad",
        limitations: "No debe demorar el inicio inmediato del tratamiento empírico de rescate.",
      }
    ],
    treatmentFirstLine: "Emergencia médica que requiere protocolo multimodal urgente: Miltefosina oral/entérica combinada con Anfotericina B intravenosa e intratecal a dosis plenas, MÁS Rifampicina oral/IV, Fluconazol o Voriconazol, Azitromicina y Dexametasona, acompañado de control neurocrítico intensivo de la presión intracraneal con hipotermia terapéutica inducida.",
    preventionControl: [
      "Evitar nadar, bucear o sumergir la cabeza en aguas dulces templadas naturales, lagos termales o piscinas sin control sanitario de cloro.",
      "Utilizar pinzas nasales o mantener la cabeza fuera del agua en actividades acuáticas recreativas en agua dulce cálida.",
      "Utilizar EXCLUSIVAMENTE agua destilada, estéril o previamente hervida para irrigaciones o lavados nasales (dispositivos tipo lota / Neti pot)."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Naegleria fowleri",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/freeLivingAmebic/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Primary Amebic Meningoencephalitis (PAM) - Clinical Guidance",
        organization: "CDC Division of Parasitic Diseases",
        url: "https://www.cdc.gov/naegleria/hcp/clinical-guidance/",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p19": {
    group: "Nematodos",
    localization: ["Intestino delgado", "Vías respiratorias y pulmón", "Hígado y vías biliares"],
    commonNames: ["Ascaris", "Lombriz intestinal"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Ascariasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (único hospedador definitivo natural; aloja nemátodos adultos cilíndricos de 15 a 35 cm en el lumen del yeyuno e íleon)."],
      intermediate: ["No posee hospedador intermediario (geohelmintiasis con maduración embrionaria obligatoria en la tierra)."],
    },
    transmissionRoutes: ["Ingestión fecal-oral de huevos embrionados con larva L3 presentes en tierra, agua, verduras o frutas contaminadas con excretas humanas utilizadas como fertilizante."],
    infectiveForms: [
      "Huevo embrionado con larva de tercer estadio (L3) en su interior, madurado en suelo sombreado y húmedo durante 2 a 4 semanas."
    ],
    diagnosticForms: [
      "Huevos fecundados redondeados u ovalados (45–75 × 35–50 µm) con cáscara gruesa de triple capa y cubierta externa mamelonada parduzca por pigmentos biliares (y huevos decorticados o infecundados alargados de 85–95 µm) en examen coprológico.",
      "Expulsión espontánea macroscópica de gusanos adultos cilíndricos blanco-rosados (hembras 20–35 cm, machos 15–30 cm con cola curvada) por ano, boca o fosas nasales.",
      "Visualización ecográfica de imágenes tubulares lineales paralelas con doble contorno («signo de las vías de tren») en la vía biliar principal o conducto de Wirsung."
    ],
    clinicalSummary: {
      syndromes: ["Fase pulmonar: Neumonitis eosinofílica (Síndrome de Loeffler)", "Fase intestinal: Ascariasis luminal", "Ascariasis errática obstructiva biliar y pancreática", "Suboclusión u oclusión intestinal mecánica"],
      keySymptoms: ["En fase pulmonar: tos seca irritativa, disnea, sibilancias asmáticas, febrícula y eosinofilia periférica marcada. En fase intestinal: dolor abdominal cólico difuso o periumbilical, distensión, anorexia y expulsión de gusanos adultos por vía oral o anal."],
      severeComplications: [
        "Obstrucción intestinal mecánica aguda por ovillo («madeja») de helmintos en íleon distal en niños pequeños (urgencia quirúrgica con riesgo de necrosis e isquemia intestinal)",
        "Migración errática biliar con colangitis piógena aguda supurativa, colecistitis alitiásica, abscesos hepáticos múltiples y pancreatitis aguda obstructiva por impactación en el colédoco o conducto de Wirsung",
        "Perforación intestinal con peritonitis estercorácea química y bacteriana",
        "Asfixia mecánica por migración retrógrada de adultos a la vía aérea alta (laringe y árbol traqueobronquial) inducida por anestesia o fiebre"
      ],
    },
    diagnosticMethods: [
      {
        name: "Examen coproparasitológico directo y por concentración (Teleman / sedimentación)",
        sampleType: "Heces seriadas",
        indication: "Detección de huevos característicos de Ascaris en fase intestinal",
        limitations: "En la fase pulmonar precoz de Loeffler (días 1–14) el coproparasitario es NEGATIVO porque los gusanos aún no maduraron a adultos en el intestino.",
      },
      {
        name: "Ecografía abdominal hepatobiliar y de asas intestinales",
        sampleType: "Ecografía abdominal de alta resolución",
        indication: "Sospecha de colangitis obstructiva, ictericia obstructiva o masa abdominal palpable en niños",
        limitations: "Operador-dependiente; requiere diferenciación con cálculos biliares.",
      }
    ],
    treatmentFirstLine: "Albendazol (400 mg dosis única oral en adultos y niños >1 año) o Mebendazol (100 mg cada 12 h por 3 días o 500 mg dosis única). En suboclusión intestinal: suspender la vía oral, sonda nasogástrica descompresiva, piperazina (si disponible) o tratamiento conservador; cirugía urgente si hay signos peritoneales o perforación.",
    preventionControl: [
      "Saneamiento ambiental integral y prohibición del uso de aguas residuales o heces humanas no tratadas como fertilizante agrícola.",
      "Lavado meticuloso de manos con agua y jabón antes de comer y tras el contacto con tierra.",
      "Lavado y cocción adecuada de vegetales y hortalizas de cultivo a ras de suelo.",
      "Campañas escolares de desparasitación masiva periódica en áreas endémicas con alta prevalencia."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Ascariasis (Ascaris lumbricoides)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/ascariasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p20": {
    group: "Nematodos",
    localization: ["Intestino grueso", "Piel y anexos", "Tracto urogenital"],
    commonNames: ["Oxiuro", "Oxiuros"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Enterobiasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (único hospedador natural; aloja adultos diminutos de 8 a 13 mm en el ciego, apéndice y colon ascendente)."],
      intermediate: ["No posee hospedador intermediario (ciclo monoxénico directo ano-mano-boca sin paso por la tierra)."],
    },
    transmissionRoutes: ["Vía fecal-oral directa ano-mano-boca tras el rascado perianal (autoinfección externa), fómites contaminados (ropa de cama, pijamas, juguetes), inhalación de polvo ambiental con huevos y deglución posterior, o retroinfección larvaria."],
    infectiveForms: [
      "Huevos embrionados que contienen la larva desarrollada; se vuelven infectantes en solo 4 a 6 horas tras la oviposición perianal nocturna."
    ],
    diagnosticForms: [
      "Huevos hialinos translúcidos asimétricos (50–60 × 20–30 µm) aplanados en una de sus caras («en forma de letra D» o grano de arroz) recolectados mediante cinta adhesiva perianal transparente (técnica de Graham).",
      "Visualización directa de hembras adultas grávidas blanquecinas filiformes (8–13 mm) con extremo posterior aguzado reptando en los márgenes perianales o en la superficie de las heces durante la noche."
    ],
    clinicalSummary: {
      syndromes: ["Enterobiasis u oxiuriasis perianal", "Vulvovaginitis infantil enterobiásica", "Apendicitis o peritonitis granulomatosa errática"],
      keySymptoms: ["Prurito anal intenso de predominio nocturno (que coincide con la migración y oviposición de la hembra), sueño intranquilo, irritabilidad, insomnio, bruxismo nocturno y prurito vulvar en niñas."],
      severeComplications: [
        "Apendicitis aguda por obstrucción mecánica de la luz apendicular por amasijos de oxiuros adultos",
        "Salpingitis granulomatosa, peritonitis pélvica o endometritis por migración retrógrada errática a través de la vagina y trompas de Falopio",
        "Vulvovaginitis infantil recurrente con leucorrea pruriginosa e infecciones urinarias de repetición",
        "Sobreinfección bacteriana secundaria perianal excoriada (impétigo perianal, celulitis o eccema sobreinfectado por rascado crónico)"
      ],
    },
    diagnosticMethods: [
      {
        name: "Técnica de la cinta adhesiva transparente perianal (Método de Graham)",
        sampleType: "Impronta perianal matinal obtenida antes de levantarse y defecar o asearse (5 a 7 días consecutivos)",
        indication: "Estándar de oro para confirmar enterobiasis",
        limitations: "El examen coprológico convencional seriado detecta <5% de los casos (las hembras no ovopositan en la luz intestinal sino en la piel perianal).",
      },
      {
        name: "Inspección visual macroscópica nocturna perianal",
        sampleType: "Observación directa de márgenes perianales 2–3 h después de acostarse",
        indication: "Confirmación directa de hembras adultas móviles en niños con prurito nocturno",
        limitations: "Sensibilidad variable; requiere visualización activa.",
      }
    ],
    treatmentFirstLine: "Albendazol (400 mg dosis única oral en adultos y niños >1 año) o Mebendazol (100 mg dosis única) o Pamoato de pirantel (11 mg/kg dosis única). Es IMPRESCINDIBLE REPETIR EXACTAMENTE LA MISMA DOSIS A LOS 14 DÍAS (para destruir las larvas nacidas de huevos que no fueron afectados por la primera dosis) y TRATAR SIMULTÁNEAMENTE A TODO EL GRUPO FAMILIAR CONVIVIENTE.",
    preventionControl: [
      "Tratamiento simultáneo y sincronizado de todos los convivientes del hogar con segunda dosis al día 14.",
      "Corte y cepillado regular de uñas de las manos para evitar retención de huevos por rascado.",
      "Lavado con agua caliente de sábanas, toallas y ropa interior sin sacudirlas para evitar dispersar los huevos en el polvo ambiental.",
      "Ducha matinal para retirar huevos depositados en la región perianal durante la noche."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Enterobiasis (Enterobius vermicularis)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/enterobiasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p21": {
    group: "Nematodos",
    localization: ["Intestino grueso"],
    commonNames: ["Tricocéfalo", "Tricuro"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Trichuriasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (único hospedador natural; aloja adultos de 3 a 5 cm con porción anterior filiforme enclavada en la mucosa del ciego y colon ascendente)."],
      intermediate: ["No posee hospedador intermediario (geohelmintiasis que requiere maduración ambiental de los huevos en suelo húmedo)."],
    },
    transmissionRoutes: ["Ingestión fecal-oral de huevos embrionados con larva viable en suelo, agua o alimentos contaminados con materias fecales humanas."],
    infectiveForms: [
      "Huevo embrionado con larva en su interior, madurado en suelo cálido y sombreado durante 3 a 4 semanas."
    ],
    diagnosticForms: [
      "Huevos con aspecto patognomónico en «barril» o «limón» (50–55 × 20–25 µm), con cubierta parda gruesa y dos tapones mucosos hialinos polares birrefringentes transparentes en examen coprológico.",
      "Adultos con morfología «en látigo» (porción anterior capilar muy fina que representa los 3/5 del cuerpo y extremo posterior engrosado) visualizados en mucosa rectal prolapsada o colonoscopía."
    ],
    clinicalSummary: {
      syndromes: ["Tricocefalosis leve asintomática", "Colitis tricuriana crónica", "Síndrome disentérico tricuriano infantil masivo"],
      keySymptoms: ["En infecciones masivas infantiles: diarrea mucosa sanguinolenta crónica («disentería tricuriana»), dolor abdominal espasmódico en fosa ilíaca derecha, pujo, tenesmo rectal continuo, distensión abdominal y palidez cutánea acentuada."],
      severeComplications: [
        "Prolapso rectal completo recurrente por tenesmo intenso y relajación del tono del esfínter anal en niños con parasitación masiva (los gusanos se observan enclavados en la mucosa rectal evertida)",
        "Anemia ferropénica severa microcítica hipocrómica descompensada por expoliación hemática continua (pérdida de ~0.005 mL de sangre por gusano/día)",
        "Desnutrición calórico-proteica grave con retraso severo del crecimiento pondoestatural e hipoalbuminemia",
        "Deterioro del neurodesarrollo cognitivo infantil y dedos en «palillo de tambor» (hipocratismo digital reversible tras el tratamiento)"
      ],
    },
    diagnosticMethods: [
      {
        name: "Examen coproparasitológico directo y por concentración cuantitativa (Kato-Katz)",
        sampleType: "Heces",
        indication: "Identificación de huevos en barril con tapones polares y cuantificación de carga parasitaria (huevos por gramo de heces)",
        limitations: "En infecciones muy leves los huevos pueden ser escasos; la técnica cuantitativa permite evaluar la intensidad de la infección.",
      },
      {
        name: "Rectosigmoidoscopía / Colonoscopía",
        sampleType: "Inspección endoscópica de mucosa de colon y ciego",
        indication: "Estudio de disentería crónica o sospecha de masa inflamatoria",
        limitations: "Procedimiento invasivo reservado para casos complejos.",
      }
    ],
    treatmentFirstLine: "Mebendazol (100 mg cada 12 h por 3 días o 500 mg dosis única oral) o Albendazol (400 mg diarios por 3 días consecutivos; las pautas de 3 días son significativamente más eficaces que dosis únicas para Trichuris). Alternativa en parasitación masiva: combinación con Ivermectina (200 µg/kg/día por 3 días).",
    preventionControl: [
      "Saneamiento ambiental básico y prohibición del uso de aguas residuales o heces humanas como abono.",
      "Lavado estricto de manos con agua y jabón antes de comer y tras el contacto con tierra.",
      "Lavado riguroso y cocción de verduras de hoja y hortalizas de huerto.",
      "Campañas escolares de desparasitación comunitaria masiva en zonas de alta endemicidad."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Trichuriasis (Trichuris trichiura)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/trichuriasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p22": {
    group: "Nematodos",
    localization: ["Intestino delgado", "Vías respiratorias y pulmón", "Piel y anexos"],
    commonNames: ["Estrongiloides", "S. stercoralis"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Strongyloidiasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano, perros y primates (hembra partenogenética parásita de 2 mm alojada en la mucosa del duodeno y yeyuno)."],
      intermediate: ["No posee hospedador intermediario (nematodo facultativo con ciclo de vida libre en suelo y ciclo parasitario con capacidad única de autoinfección interna sostenida)."],
    },
    transmissionRoutes: ["Penetración transcutánea activa de larvas filariformes L3 desde suelo contaminado; autoinfección interna (las larvas rabditoides maduran a filariformes en la luz intestinal y reatraviesan la pared intestinal o piel perianal manteniendo la infección durante décadas)."],
    infectiveForms: [
      "Larva filariforme (L3) móvil con esófago cilíndrico largo que ocupa la mitad del cuerpo y extremo posterior con cola bifurcada o mellada («en muesca»)."
    ],
    diagnosticForms: [
      "Larvas rabditoides (L1) móviles (200–300 µm) con esófago rabditiforme corto (con bulbo) y primordio genital prominente en heces recién emitidas.",
      "Método de cultivo en placa de agar nutritivo de Koga o técnica de Baermann (detección de surcos bacterianos dejados por las larvas al reptar).",
      "Serología IgG por ELISA de alta sensibilidad (>90%) para cribado.",
      "Identificación de larvas filariformes L3 en esputo o lavado broncoalveolar en síndrome de hiperinfección."
    ],
    clinicalSummary: {
      syndromes: ["Estrongiloidiasis crónica intestinal no complicada", "Larva currens cutánea", "Síndrome de hiperinfección estrongiloidiásica", "Estrongiloidiasis diseminada en inmunodeprimidos"],
      keySymptoms: ["Dolor epigástrico que simula úlcera péptica (aliviado o empeorado por alimentos), diarrea acuosa intermitente, pirosis, lesiones serpiginosas eritematosas urticarianas fugaces de avance rápido en glúteos y muslos («larva currens»: hasta 5–10 cm/hora) y marcada eosinofilia periférica fluctuante."],
      severeComplications: [
        "Síndrome de hiperinfección y estrongiloidiasis diseminada en pacientes inmunocomprometidos (especialmente bajo corticoterapia sistémica, infección por HTLV-1, neoplasias hematológicas o trasplantes) con invasión larvaria masiva de todos los órganos",
        "Sepsis bacteriana fulminante por translocación de enterobacterias gramnegativas (E. coli, Klebsiella, Enterococcus) transportadas mecánicamente por las larvas filariformes desde la luz intestinal",
        "Meningitis bacteriana secundaria o recurrente por bacilos gramnegativos entéricos",
        "Hemorragia alveolar masiva difusa con insuficiencia respiratoria aguda catastrófica y síndrome de distrés respiratorio (SDRA)",
        "Íleo paralítico obstructivo mecánico y enteropatía pierde-proteínas severa con letalidad >60–80% en casos diseminados"
      ],
    },
    diagnosticMethods: [
      {
        name: "Técnica de Baermann y cultivo en placa de agar de Koga en muestras fecales seriadas",
        sampleType: "Heces frescas sin refrigerar (3 a 5 muestras)",
        indication: "Estándar de oro parasitológico directo para detectar larvas vivas móviles",
        limitations: "El examen coprológico simple de rutina tiene muy baja sensibilidad (~30%) porque la eliminación de larvas es baja e intermitente en fase crónica.",
      },
      {
        name: "Serología IgG anti-Strongyloides por ELISA",
        sampleType: "Suero",
        indication: "Tamizaje obligatorio en todo paciente que vaya a iniciar corticoterapia sistémica, inmunosupresores, quimioterapia o biológicos con antecedente epidemiológico",
        limitations: "Puede presentar reactividad cruzada con filarias u otros nematodos; no distingue infección activa de recientemente tratada.",
      },
      {
        name: "Examen microscópico de esputo / lavado broncoalveolar",
        sampleType: "Muestra respiratoria",
        indication: "Sospecha de hiperinfección o infiltrados pulmonares en paciente inmunodeprimido",
        limitations: "Solo es positivo en casos de hiperinfección o diseminación.",
      }
    ],
    treatmentFirstLine: "Ivermectina oral (200 µg/kg/día en 2 dosis en días consecutivos o dosis única repetida a las 2 semanas). En síndrome de hiperinfección o estrongiloidiasis diseminada: Ivermectina 200 µg/kg/día diaria hasta la resolución clínica y negatividad de larvas durante al menos 2 semanas consecutivas, asociada a reducción de corticoides y cobertura antibiótica de amplio espectro contra enterobacterias.",
    preventionControl: [
      "Tamizaje serológico y desparasitación preventiva obligatoria antes de iniciar corticoides sistémicos o terapias inmunosupresoras en personas con historia de estancia en áreas endémicas.",
      "Uso obligatorio de calzado cerrado en zonas rurales o suelos húmedos contaminados.",
      "Saneamiento ambiental integral y eliminación higiénica de excretas.",
      "Manejo con precauciones de contacto ante heces o esputo de pacientes con hiperinfección (altamente infectantes)."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Strongyloidiasis (Strongyloides stercoralis)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/strongyloidiasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p23": {
    group: "Nematodos",
    localization: ["Intestino delgado", "Vías respiratorias y pulmón", "Piel y anexos"],
    commonNames: ["Anquilostoma", "A. duodenale"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Hookworm. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (único hospedador natural principal; aloja adultos cilíndricos de 8 a 13 mm provistos de 2 pares de dientes quitinosos curvados en la cápsula bucal en duodeno y yeyuno)."],
      intermediate: ["No posee hospedador intermediario (geohelmintiasis obligada con maduración en tierra)."],
    },
    transmissionRoutes: ["Penetración percutánea activa de larvas filariformes L3 desde suelo contaminado al caminar descalzo; opcionalmente por ingestión oral directa de larvas L3 en alimentos o agua (vía propia de A. duodenale)."],
    infectiveForms: [
      "Larva filariforme de tercer estadio (L3) móvil presente en tierra húmeda y cálida."
    ],
    diagnosticForms: [
      "Huevos ovalados o elipsoidales (55–65 × 35–45 µm) de cáscara hialina muy delgada y transparente que contienen una mórula con 4 a 8 blastómeros en heces frescas (morfológicamente indistinguibles de Necator americanus).",
      "Gusanos adultos expulsados o recuperados tras tratamiento, caracterizados por cápsula bucal prominente con dos pares de dientes ventrales quitinosos puntiagudos."
    ],
    clinicalSummary: {
      syndromes: ["Dermatitis por penetración («picor del suelo»)", "Fase pulmonar: Neumonitis de Loeffler", "Anquilostomiasis intestinal / Anemia uncinariásica"],
      keySymptoms: ["Prurito cutáneo intenso con pápulas eritematosas en sitio de entrada (pies o tobillos), tos y sibilancias respiratorias transitorias, epigastralgia tipo úlcera péptica, diarrea, astenia extrema, palidez cutánea de porcelana y pica (geofagia en niños)."],
      severeComplications: [
        "Anemia microcítica hipocrómica ferropénica severa descompensada por hematofagia masiva y laceración mucosa continua (pérdida de hasta 0.15–0.26 mL de sangre/gusano/día)",
        "Insuficiencia cardíaca congestiva de alto gasto con miocardiopatía anémica severa y cardiomegalia",
        "Hipoalbuminemia grave con anasarca o edema periférico secundario a enteropatía pierde-proteínas",
        "Retardo pondoestatural severo y deterioro marcado del desarrollo neurocognitivo y rendimiento escolar en niños",
        "Riesgo de muerte perinatal y bajo peso al nacer en gestantes infectadas"
      ],
    },
    diagnosticMethods: [
      {
        name: "Examen coproparasitológico directo y cuantitativo (técnica de Kato-Katz)",
        sampleType: "Heces frescas recién recolectadas",
        indication: "Detección de huevos de uncinarias y cuantificación de carga parasitaria",
        limitations: "Los huevos son indistinguibles de los de Necator americanus; en heces dejadas a temperatura ambiente las larvas eclosionan simulando Strongyloides.",
      },
      {
        name: "Hemograma completo con constantes corpusculares y ferritina sérica",
        sampleType: "Sangre total con EDTA y suero",
        indication: "Evaluación de la severidad de la anemia ferropénica asociada",
        limitations: "Inespecífico para etiología parasitaria.",
      }
    ],
    treatmentFirstLine: "Albendazol (400 mg dosis única oral en adultos y niños >1 año) o Mebendazol (100 mg cada 12 h por 3 días o 500 mg dosis única), ASOCIADO obligatoriamente a suplementación oral de Sulfato ferroso (hierro elemental 200 mg/día) y soporte nutricional hasta normalizar depósitos de ferritina.",
    preventionControl: [
      "Uso regular y obligatorio de calzado cerrado que impida el contacto directo de la piel con la tierra.",
      "Saneamiento básico y construcción de letrinas sanitarias higiénicas.",
      "Prohibición estricta del uso de heces humanas frescas como abono agrícola.",
      "Tratamiento antihelmíntico comunitario masivo en áreas de alta prevalencia."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Hookworm (Ancylostoma duodenale / Necator americanus)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/hookworm/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p24": {
    group: "Nematodos",
    localization: ["Intestino delgado", "Vías respiratorias y pulmón", "Piel y anexos"],
    commonNames: ["N. americanus", "Uncinaria"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Hookworm. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (único hospedador natural; aloja adultos cilíndricos de 7 a 11 mm provistos de placas cortantes semilunares de quitina en la cápsula bucal en yeyuno y duodeno)."],
      intermediate: ["No posee hospedador intermediario (geohelmintiasis obligada)."],
    },
    transmissionRoutes: ["Penetración transcutánea activa obligatoria de larvas filariformes L3 presentes en suelo húmedo o arena contaminada (no se transmite por vía oral directa a diferencia de A. duodenale)."],
    infectiveForms: [
      "Larva filariforme de tercer estadio (L3) móvil con cutícula protectora."
    ],
    diagnosticForms: [
      "Huevos ovalados de cáscara hialina transparente delgada (55–75 × 35–45 µm) con masa de blastómeros (4–8 células) en heces frescas.",
      "Gusanos adultos con extremo anterior marcadamente curvado dorsalmente (aspecto en anzuelo) y cápsula bucal provista de un par de placas cortantes semilunares ventrales."
    ],
    clinicalSummary: {
      syndromes: ["Dermatitis prurítica por penetración («picazón de tierra»)", "Neumonitis eosinofílica de Loeffler", "Uncinariasis intestinal y anemia ferropénica"],
      keySymptoms: ["Erupción papular pruriginosa eritematosa en pies («sarna de los mineros»), síntomas respiratorios leves transitorios, dolor abdominal posprandial, astenia, mareos, palidez mucocutánea marcada y fatiga extrema."],
      severeComplications: [
        "Anemia ferropénica crónica moderada a severa (pérdida de 0.03–0.05 mL de sangre por gusano/día)",
        "Hipoalbuminemia y edema periférico maleolar en pacientes con cargas parasitarias elevadas y déficit nutricional",
        "Caquexia uncinariásica e insuficiencia cardíaca de gasto elevado",
        "Retraso del crecimiento ponderal y déficit de atención y desarrollo escolar en niños"
      ],
    },
    diagnosticMethods: [
      {
        name: "Coproparasitológico seriado directo y cuantitativo (Kato-Katz)",
        sampleType: "Heces frescas",
        indication: "Identificación de huevos de uncinaria y estimación de la carga de gusanos",
        limitations: "Indistinguible al microscopio óptico de los huevos de Ancylostoma duodenale.",
      },
      {
        name: "Evaluación hematológica (hemoglobina, hematocrito, ferritina y recuento reticulocitario)",
        sampleType: "Sangre total",
        indication: "Valoración del déficit férrico asociado",
        limitations: "Prueba complementaria no parasitológica.",
      }
    ],
    treatmentFirstLine: "Albendazol (400 mg dosis única oral en adultos y niños >1 año) o Mebendazol (100 mg cada 12 h por 3 días o 500 mg dosis única), complementado con administración de Sulfato ferroso oral por al menos 3 meses para reponer depósitos medulares.",
    preventionControl: [
      "Uso de calzado cerrado en suelos rurales, plantaciones y zonas tropicales húmedas.",
      "Saneamiento ambiental básico, construcción de letrinas sanitarias y disposición segura de excretas.",
      "Programas comunitarios periódicos de desparasitación antihelmíntica escolar."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Hookworm (Necator americanus)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/hookworm/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p26": {
    group: "Cestodos",
    localization: ["Intestino delgado"],
    commonNames: ["T. saginata", "Solitaria bovina", "Tenia inerme"],
    status: "disponible",
    statusNote: "Ficha clínica con reconstrucción 3D interactiva de sus 4 estadios (estróbilo adulto, escólex inerme cuadrangular con 4 ventosas, huevo embrionado y Cysticercus bovis) verificada con CDC DPDx Taeniasis.",
    hosts: {
      definitive: ["Ser humano (único hospedador definitivo natural; aloja el cestodo adulto de 4 a 10 metros en el yeyuno)."],
      intermediate: ["Ganado bovino (Bos taurus, Bos indicus; aloja la fase larvaria Cysticercus bovis en tejido muscular estriado tras ingerir huevos)."],
    },
    transmissionRoutes: ["Ingestión de carne bovina cruda o insuficientemente cocinada que contiene cisticercos vivos (Cysticercus bovis)."],
    infectiveForms: [
      "Para el ser humano (teniasis adulta): Cisticerco viable (Cysticercus bovis) en carne de res.",
      "Para el ganado bovino (cisticercosis bovina): Huevo embrionado esférico con embrióforo radiado eliminado en heces humanas (el ser humano NO desarrolla cisticercosis por T. saginata)."
    ],
    diagnosticForms: [
      "Proglótides grávidas expulsadas espontáneamente (16–20 × 5–7 mm), cuadrangulares, con >15 a 30 ramas uterinas laterales principales dicotómicas por lado y motilidad activa a través del ano.",
      "Escólex cuadrangular inerme (1.5–2 mm) provisto de 4 ventosas prominentes, SIN rostelo ni ganchos.",
      "Huevos esféricos (31–43 µm) con embrióforo grueso estriado radialmente y oncosfera con 6 ganchos (oncosfera hexacanta) al examen coprológico o método de Graham (indistinguibles de T. solium)."
    ],
    clinicalSummary: {
      syndromes: ["Teniasis intestinal por Taenia saginata"],
      keySymptoms: ["Eliminación activa y espontánea de proglótides móviles individuales que reptan a través del esfínter anal durante el día (provocando sensación de prurito perianal y angustia), dolor epigástrico vago, náuseas, meteorismo y cambios en el apetito."],
      severeComplications: [
        "Obstrucción intestinal mecánica aguda o suboclusión ileocecal por apelotonamiento de proglótides o fragmentos estrobilares (infrecuente)",
        "Migración errática retrógrada intraluminal de proglótides hacia la ampolla de Vater con colangitis aguda obstructiva o pancreatitis aguda",
        "Apendicitis aguda por penetración e impactación de una proglótide en la luz apendicular",
        "Traumatismo psicológico severo y fobia social por la salida activa diurna de proglótides reptantes en la ropa interior"
      ],
    },
    diagnosticMethods: [
      {
        name: "Identificación macroscópica y microscópica de proglótides grávidas (inyección de tinta china o aclaramiento con ácido acético)",
        sampleType: "Proglótides expulsadas recuperadas por el paciente",
        indication: "Diferenciación específica entre Taenia saginata (≥15 ramas dicotómicas) y Taenia solium (7–13 ramas dendríticas)",
        limitations: "Manipular siempre con precaución de bioseguridad hasta confirmar que no corresponde a T. solium.",
      },
      {
        name: "Técnica de la cinta perianal adhesiva (Método de Graham) y coproparasitológico",
        sampleType: "Impronta perianal matinal o heces",
        indication: "Búsqueda de huevos de Taenia spp.",
        limitations: "El huevo solo permite diagnóstico de género «Taenia sp.»; no permite diferenciar especie.",
      }
    ],
    treatmentFirstLine: "Praziquantel (dosis única oral de 5 a 10 mg/kg) o Niclosamida (dosis única oral de 2 g masticada en adultos, 50 mg/kg en niños). Se recomienda verificar la eliminación del escólex para certificar la curación definitiva.",
    preventionControl: [
      "Cocción completa de la carne vacuna (temperatura interna ≥63–71 °C) o congelación prolongada a -20 °C por al menos 7 a 10 días para inactivar los cisticercos.",
      "Inspección médico-veterinaria rigurosa de canales vacunas en mataderos autorizados.",
      "Saneamiento ambiental integral para impedir la contaminación fecal humana de pasturas y fuentes de agua del ganado."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Taeniasis (Taenia saginata / Taenia solium)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/taeniasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p27": {
    group: "Cestodos",
    localization: ["Hígado y vías biliares", "Vías respiratorias y pulmón", "Sistema nervioso central (SNC)", "Musculatura y tejido subcutáneo"],
    commonNames: ["E. granulosus", "Echinococcus granulosus"],
    status: "disponible",
    statusNote: "Ficha clínica con reconstrucción 3D interactiva de sus 4 formas evolutivas (quiste hidatídico unilocular con capas periquística, laminar PAS+ y germinativa, adulto diminuto de 3 proglótides, protoescólex invaginado con corona de ganchos y huevo embrionado) verificada con CDC DPDx Echinococcosis.",
    hosts: {
      definitive: ["Perro doméstico (Canis lupus familiaris) y otros cánidos (alojan miles de cestodos adultos diminutos de 2–7 mm en el intestino delgado y excretan huevos en sus heces)."],
      intermediate: ["Ganado ovino, bovino, caprino, porcino y camélidos (alojan quistes hidatídicos uniloculares fértiles en sus vísceras)."],
      accidental: ["Ser humano (hospedador intermediario accidental «fondo de saco» tras ingerir huevos excretados por cánidos; desarrolla hidatidosis quística hepática o pulmonar)."],
    },
    transmissionRoutes: ["Ingestión fecal-oral de huevos viables procedentes de heces de perros infectados por contacto directo con su pelaje, ingestión de hortalizas o agua contaminada, o geofagia."],
    infectiveForms: [
      "Para el ser humano y ganado: Huevo embrionado esférico (30–37 µm) con embrióforo radiado y oncosfera hexacanta eliminado en heces caninas.",
      "Para el perro: Protoescólices viables contenidos en quistes hidatídicos al ingerir vísceras crudas (achuras) de ganado infectado."
    ],
    diagnosticForms: [
      "Quiste hidatídico unilocular caracterizado en ecografía abdominal (clasificación OMS-IWGE CE1–CE5) o TC/RM con pared trilaminar (periquiste, cutícula laminar acelular intensamente PAS-positiva y capa germinativa interna).",
      "Arena hidatídica en examen microscópico de líquido quístico: protoescólices invaginados con doble corona de ganchos rostelares birrefringentes y ganchos libres sueltos en forma de daga (22–40 µm).",
      "Serología IgG por ELISA confirmada por Western Blot (detección de bandas de 8, 16 o 21 kDa contra antígeno 5 y antígeno B)."
    ],
    clinicalSummary: {
      syndromes: ["Hidatidosis quística hepática (65–70%)", "Hidatidosis quística pulmonar (20–25%)", "Hidatidosis quística en otras localizaciones (bazo, hueso, riñón, cerebro)"],
      keySymptoms: ["En quistes hepáticos: dolor sordo y sensación de masa o pesadez en hipocondrio derecho, hepatomegalia indolora, náuseas y compresión biliar con ictericia obstructiva. En quistes pulmonares: dolor torácico, tos seca, disnea, hemoptisis y vómica hidatídica (expulsión de líquido salino con fragmentos de membranas)."],
      severeComplications: [
        "Choque anafiláctico agudo potencialmente mortal por rotura traumática o espontánea del quiste hidatídico hacia peritoneo, pleura o torrente circulatorio",
        "Hidatidosis secundaria diseminada peritoneal o pleural por siembra masiva de miles de protoescólices viables tras la rotura",
        "Compresión extrínseca biliar o vascular con cirrosis biliar secundaria, colangitis bacteriana supurativa aguda e hipertensión portal presinusoidal",
        "Fístula bronquioquística con asfixia mecánica y ahogamiento por inundación bronquial con líquido y membranas (vómica)",
        "Fracturas patológicas espontáneas e invalidez en hidatidosis ósea (de difícil tratamiento)"
      ],
    },
    diagnosticMethods: [
      {
        name: "Ecografía abdominal estandarizada bajo clasificación OMS-IWGE (CE1 a CE5)",
        sampleType: "Imagen ecográfica hepática/abdominal",
        indication: "Pilar diagnóstico de primera línea para detección y estadificación biológica del quiste hidatídico",
        limitations: "Requiere entrenamiento ecográfico específico en la clasificación OMS (CE1/CE2 activos fértiles vs CE4/CE5 calcificados inactivos).",
      },
      {
        name: "Tomografía Computarizada (TC) de tórax y abdomen con contraste y Resonancia Magnética",
        sampleType: "Estudio por imágenes de corte tomográfico",
        indication: "Evaluación anatómica prequirúrgica, quistes pulmonares u óseos y detección de vesículas hijas",
        limitations: "Costo superior y exposición a radiación ionizante.",
      },
      {
        name: "Serología IgG anti-hidatídica por ELISA confirmada por Western Blot (arco quinto)",
        sampleType: "Suero",
        indication: "Confirmación inmunológica de sospecha imagenológica",
        limitations: "CONTRAINDICADA LA PUNCIÓN DIAGNÓSTICA A CIEGAS por riesgo letal de anafilaxia y siembra peritoneal; quistes pulmonares o intactos calcificados pueden dar falsos negativos serológicos.",
      }
    ],
    treatmentFirstLine: "Manejo individualizado según estadio OMS-IWGE: 1) Quistes activos fértiles (CE1, CE2, CE3a): Terapia antiparasitaria con Albendazol oral (10–15 mg/kg/día dividido en 2 dosis con alimentos grasos por 3 a 6 meses) MÁS intervención percutánea PAIR (Punción, Aspiración, Inyección de escolicida [NaCl hipertónico 20%] y Reaspiración) o cirugía conservadora abierta/laparoscópica bajo cobertura de albendazol. 2) Quistes inactivos totalmente calcificados (CE4, CE5): Observación clínica e imagenológica seriada («watch and wait»).",
    preventionControl: [
      "Interrupción del ciclo biológico: prohibición absoluta de alimentar perros con vísceras crudas de faenamiento domiciliario o mataderos.",
      "Desparasitación sistemática periódica de perros rurales con Praziquantel (cada 45 días) en áreas endémicas.",
      "Control estricto e inspección higiénico-veterinaria de mataderos y faenas de ganado.",
      "Lavado riguroso de manos tras el contacto con perros y lavado cuidadoso de verduras de huerto.",
      "Vacunación ovina con antígeno recombinante EG95 en programas de control pecuario."
    ],
    hasMicroscopy: false,
    hasGeography: true,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Echinococcosis (Echinococcus granulosus)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/echinococcosis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "WHO-IWGE International classification of ultrasound images in cystic echinococcosis",
        organization: "World Health Organization (WHO) / Acta Tropica",
        url: "https://www.who.int/news-room/fact-sheets/detail/echinococcosis",
        accessedDate: "2026-10-20"
      },
      {
        title: "Guía Clínica para el Diagnóstico y Tratamiento de la Hidatidosis / Equinococosis Quística",
        organization: "Ministerio de Salud de Chile (MINSAL) / ISP Chile",
        url: "https://diprece.minsal.cl",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p28": {
    group: "Cestodos",
    localization: ["Intestino delgado"],
    commonNames: ["H. nana", "Tenia enana", "Rodentolepis nana"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Hymenolepiasis. Localización anatómica corregida exclusivamente a Intestino delgado. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano y roedores (Mus musculus, Rattus norvegicus; alojan el cestodo adulto diminuto de 15 a 45 mm en la mucosa del íleon y yeyuno)."],
      intermediate: ["No posee hospedador intermediario obligatorio (único cestodo que puede completar su ciclo monoxénico directo en un solo individuo; escarabajos de la harina Tribolium o pulgas pueden actuar como intermediarios accidentales)."],
    },
    transmissionRoutes: ["Ingestión fecal-oral de huevos viables por manos contaminadas, agua o alimentos; autoinfección interna (los huevos eclosionan dentro de la luz del intestino delgado y las oncosferas penetran las vellosidades intestinales, transformándose en cisticercoides y luego en adultos sin salir al exterior, perpetuando miles de parásitos durante años)."],
    infectiveForms: [
      "Huevo embrionado maduro inmediatamente infectante al ser eliminado en las heces.",
      "Cisticercoide en vellosidades intestinales en la autoinfección interna."
    ],
    diagnosticForms: [
      "Huevos ovalados o esféricos (30–47 µm) con cubierta externa hialina transparente delgada, membrana interna con dos mamelones o engrosamientos polares de los que nacen de 4 a 8 filamentos polares ondulantes refringentes y oncosfera con 6 ganchos (hexacanta).",
      "Cestodo adulto diminuto (15–45 mm × 0.5–1 mm) con escólex subesférico provisto de 4 ventosas y rostelo retráctil armado con una corona de 20 a 30 ganchos."
    ],
    clinicalSummary: {
      syndromes: ["Himenolepiasis intestinal leve o moderada", "Hiperinfección masiva por autoinfección interna en niños o inmunocomprometidos"],
      keySymptoms: ["En infecciones leves es asintomática. En parasitaciones masivas infantiles: dolor abdominal cólico periumbilical difuso, diarrea mucosa recurrente, meteorismo, anorexia, pérdida de peso, irritabilidad y prurito nasal/anal."],
      severeComplications: [
        "Síndrome de hiperinfección autoinfectiva interna masiva (con presencia de miles a decenas de miles de cestodos en el yeyuno e íleon)",
        "Deshidratación hipovolémica y desbalance hidroelectrolítico por enteritis mucosa crónica en niños pequeños",
        "Desnutrición calórico-proteica grave con retraso del crecimiento pondoestatural e hipoalbuminemia",
        "Crisis convulsivas y alteraciones neurológicas reactivas a toxinas o respuesta alérgica en escolares con cargas parasitarias extremas",
        "Enteropatía exudativa con pérdida de proteínas y dolor abdominal crónico severo"
      ],
    },
    diagnosticMethods: [
      {
        name: "Examen coproparasitológico seriado directo y por concentración (Teleman o flotación con sulfato de zinc)",
        sampleType: "Heces seriadas (3 muestras)",
        indication: "Estudio de enteritis en niños y detección de huevos de Hymenolepis nana con filamentos polares",
        limitations: "Requiere observación microscópica cuidadosa a 40× para distinguir los filamentos polares patognomónicos frente a Hymenolepis diminuta (que carece de filamentos polares).",
      }
    ],
    treatmentFirstLine: "Praziquantel (dosis única oral de 25 mg/kg; se requiere dosis mayor que para Taenia para penetrar y destruir los cisticercoides tisulares en las vellosidades). Se recomienda repetir una segunda dosis idéntica a los 7–10 días para eliminar los adultos derivados de cisticercoides que pudieran haber sobrevivido. Alternativa: Nitazoxanida oral por 3 días.",
    preventionControl: [
      "Higiene rigurosa de manos con agua y jabón antes de comer y tras usar el sanitario o mudar pañales.",
      "Control sanitario de roedores domésticos y plagas de insectos de granos y harinas (Tribolium spp.).",
      "Educación sanitaria infantil en jardines infantiles y colegios para evitar la autoinfección fecal-oral.",
      "Consumo de agua potable y lavado exhaustivo de vegetales crudos."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Hymenolepiasis (Hymenolepis nana)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/hymenolepiasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p29": {
    group: "Trematodos",
    localization: ["Hígado y vías biliares"],
    commonNames: ["F. hepatica", "Duela del hígado", "Pirihuín"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Fascioliasis e ISP Chile. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Rumiantes herbívoros (ovejas, vacas, cabras) y ser humano (hospedador definitivo accidental; aloja distomas adultos en los conductos biliares intra y extrahepáticos)."],
      intermediate: ["Caracoles dulceacuícolas anfibios de la familia Lymnaeidae (género Galba / Lymnaea; en su interior ocurre el ciclo de miracidio → esporoquiste → redias → cercarias)."],
    },
    transmissionRoutes: ["Ingestión de plantas acuáticas o semiacuáticas crudas de recolección silvestre que transportan metacercarias enquistadas (especialmente berros de agua dulce, Nasturtium officinale) o consumo de agua no tratada de acequias o vertientes."],
    infectiveForms: [
      "Metacercarias viables enquistadas esféricas fuertemente adheridas a los tallos y hojas de berros u otras plantas acuáticas."
    ],
    diagnosticForms: [
      "Huevos operculados elipsoidales grandes (130–150 × 60–90 µm), de color pardo-dorado amarillento con cáscara lisa y opérculo tenue en un polo, no embrionados en examen coprológico o sedimento de bilis.",
      "Serología IgG específica por ELISA de alta sensibilidad y confirmación por Western Blot (anticuerpos anti-Fasciola detectables en la fase aguda invasiva precoz, semanas antes de la aparición de huevos en heces).",
      "Visualización por TC o ecografía de trayectos lineales o ramificados hipodensos tortuosos («túneles de migración ameboides») en el parénquima hepático.",
      "Extracción de trematodos adultos planos en forma de hoja (20–30 × 13 mm) con cono cefálico distintivo mediante CPRE o cirugía biliar."
    ],
    clinicalSummary: {
      syndromes: ["Fascioliasis aguda o invasiva hepática parenquimatosa", "Fascioliasis crónica o de estado obstructiva biliar", "Fascioliasis ectópica errática"],
      keySymptoms: ["En fase aguda migratoria: fiebre prolongada en agujas, dolor exquisito en hipocondrio derecho y epigastrio, hepatomegalia dolorosa a la percusión, marcada hipereosinofilia periférica (>40–60%) e hipergammaglobulinemia. En fase crónica biliar: dolor cólico biliar intermitente, ictericia obstructiva fluctuante, colangitis y coluria."],
      severeComplications: [
        "Cirrosis biliar secundaria y colangitis bacteriana supurativa aguda de repetición por estasis y obstrucción mecánica de conductos biliares",
        "Hemobilia masiva con melena y anemia aguda severa secundaria a erosión de vasos arteriales intrahepáticos por las espinas cuticulares del parásito",
        "Abscesos hepáticos múltiples y fístulas bilioperitoneales en la fase aguda de migración parenquimatosa",
        "Rotura subcapsular hepática con hemoperitoneo masivo de urgencia quirúrgica",
        "Localización ectópica errática de parásitos en pared abdominal, pulmones, ojo o encéfalo"
      ],
    },
    diagnosticMethods: [
      {
        name: "Serología ELISA IgG anti-Fasciola y Western Blot",
        sampleType: "Suero",
        indication: "Pilar diagnóstico de elección en la fase aguda migratoria (los huevos en heces solo aparecen tras 3–4 meses de la infección)",
        limitations: "En la fase crónica la serología puede declinar; requiere correlación con antecedentes epidemiológicos de ingesta de berros.",
      },
      {
        name: "Examen coproparasitológico por sedimentación (Técnica de Telemann modificada o sedimentación rápida de Lumbreras)",
        sampleType: "Heces seriadas (o aspirado duodenal/bilis)",
        indication: "Fase crónica biliar para visualización de huevos operculados gigantes",
        limitations: "En la fase aguda es 100% negativo; descartar falso parasitismo («pasajeros») por ingesta previa de hígado vacuno u ovino cocido infectado.",
      },
      {
        name: "Tomografía Computarizada abdominal con contraste",
        sampleType: "TC abdominal",
        indication: "Demostración de trayectos hipodensos serpiginosos de migración y microabscesos subcapsulares",
        limitations: "Costo y radiación.",
      }
    ],
    treatmentFirstLine: "Triclabendazol oral (10 mg/kg en dosis única oral administrada con alimentos grasos; en infecciones severas se pauta 20 mg/kg dividido en 2 dosis separadas por 12–24 h). ¡ATENCIÓN CLÍNICA CRÍTICA: Praziquantel NO es eficaz contra Fasciola hepatica y no debe ser utilizado!",
    preventionControl: [
      "Prohibición absoluta del consumo de berros de agua dulce (Nasturtium officinale) silvestres o de recolección en acequias y cursos de agua donde pastoree ganado.",
      "Cultivo controlado de berros en viveros comerciales con agua potable libre de caracoles Lymnaea.",
      "Control veterinario y tratamiento periódico del ganado rumiante infectado.",
      "Drenaje y control de poblaciones de caracoles dulceacuícolas en zonas de pastoreo."
    ],
    hasMicroscopy: false,
    hasGeography: true,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Fascioliasis (Fasciola hepatica)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/fascioliasis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Vigilancia de Fascioliasis en Chile - Instituto de Salud Pública",
        organization: "Instituto de Salud Pública de Chile (ISP Chile)",
        url: "https://www.ispch.gob.cl",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p30": {
    group: "Trematodos",
    localization: ["Intestino grueso", "Hígado y vías biliares", "Sangre y sistema reticuloendotelial", "Vías respiratorias y pulmón"],
    commonNames: ["S. mansoni", "Esquistosoma"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Schistosomiasis. Localización anatómica corregida a vénulas mesentéricas e intestino grueso/hígado. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (hospedador definitivo natural; parejas de adultos viven en las vénulas mesentéricas inferiores y plexo hemorroidal del colon y recto)."],
      intermediate: ["Caracoles dulceacuícolas acuáticos del género Biomphalaria (donde se desarrollan esporoquistes y cercarias)."],
    },
    transmissionRoutes: ["Penetración cutánea activa de cercarias nadadoras biforcadas (furcocercarias) durante el baño, lavado o contacto con agua dulce estancada o de curso lento contaminada."],
    infectiveForms: [
      "Cercarias de cola bífida (furcocercarias) que nadan activamente y penetran la piel intacta en pocos minutos."
    ],
    diagnosticForms: [
      "Huevos alargados grandes (114–180 × 45–70 µm) provistos de una espina lateral prominente y puntiaguda característica cerca del polo posterior, con miracidio viable en examen coprológico o biopsia rectal.",
      "Detección de antígenos circulantes (CCA en orina o CAA en suero) por tiras reactivas rápidas.",
      "Biopsia de mucosa rectal o fragmento de pólipo colónico aclarado en fresco (impronta rectal).",
      "Ecografía hepática con patrón ecográfico patognomónico de fibrosis periportal en «tallo de pipa» de Symmers."
    ],
    clinicalSummary: {
      syndromes: ["Dermatitis cercariana aguda («picazón del nadador»)", "Esquistosomiasis aguda toxémica (Fiebre de Katayama)", "Esquistosomiasis intestinal crónica", "Esquistosomiasis hepatoesplénica con hipertensión portal"],
      keySymptoms: ["En fase aguda: fiebre alta, calofríos, tos seca, diarrea, erupción urticariana, adenopatías e hipereosinofilia marcada 2 a 8 semanas tras el contacto. En fase hepatoesplénica crónica: esplenomegalia masiva congestiva, hepatomegalia con lóbulo izquierdo prominente y lóbulo derecho retraído, telangiectasias y ascitis sin insuficiencia hepatocelular primaria grave."],
      severeComplications: [
        "Hemorragia digestiva alta masiva exanguinante por rotura de várices esofágicas secundarias a hipertensión portal presinusoidal grave",
        "Fibrosis periportal presinusoidal de Symmers con marcada esplenomegalia congestiva e hiperesplenismo (pancitopenia severa)",
        "Cor pulmonale esquistosomiásico e hipertensión arterial pulmonar secundaria a la embolización retrógrada masiva de huevos a la vasculatura pulmonar por colaterales portosistémicas",
        "Glomerulopatía membranoproliferativa o esclerosante mediada por inmunocomplejos circulantes",
        "Esquistosomiasis medular o cerebral por embolización ectópica de huevos con paraplejía espástica"
      ],
    },
    diagnosticMethods: [
      {
        name: "Examen coproparasitológico cuantitativo por técnica de Kato-Katz",
        sampleType: "Heces frescas (múltiples muestras de 41.7 mg tamizadas)",
        indication: "Detección de huevos con espina lateral prominente y cuantificación de intensidad de infección (huevos/gramo)",
        limitations: "En infecciones crónicas de baja carga puede ser falsamente negativo; se complementa con biopsia rectal.",
      },
      {
        name: "Biopsia de mucosa de la válvula rectal (raspado o pinza endoscópica)",
        sampleType: "Tejido rectal prensado entre porta y cubreobjetos sin teñir",
        indication: "Sospecha de esquistosomiasis crónica con coproparasitarios negativos",
        limitations: "Procedimiento endoscópico.",
      },
      {
        name: "Prueba rápida en tira reactiva de antígeno catódico circulante (POC-CCA) en orina",
        sampleType: "Orina fresca",
        indication: "Tamizaje poblacional rápido y evaluación de respuesta terapéutica",
        limitations: "Menor sensibilidad en infecciones de muy baja carga.",
      }
    ],
    treatmentFirstLine: "Praziquantel oral (40 mg/kg dividido en 2 dosis en un solo día, administrado con alimentos). En fase aguda (Fiebre de Katayama) se requiere asociar corticoides sistémicos (prednisona) para suprimir la intensa reacción de hipersensibilidad alérgica.",
    preventionControl: [
      "Evitar el baño, vadeo o contacto dérmico con aguas dulces estancadas o canales de riego en áreas endémicas (África subsahariana, Brasil, Caribe).",
      "Control biológico y químico de caracoles dulceacuícolas del género Biomphalaria.",
      "Saneamiento ambiental básico y tratamiento masivo quimioprofiláctico comunitario con Praziquantel en poblaciones ribereñas."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Schistosomiasis (Schistosoma mansoni)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/schistosomiasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p31": {
    group: "Trematodos",
    localization: ["Tracto urogenital"],
    commonNames: ["S. haematobium"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Schistosomiasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Ser humano (hospedador definitivo natural; parejas de gusanos adultos residen en el plexo venoso vesical y pélvico perivesical)."],
      intermediate: ["Caracoles dulceacuícolas acuáticos del género Bulinus."],
    },
    transmissionRoutes: ["Penetración transcutánea activa de cercarias furcocercarias nadadoras desde agua dulce estancada."],
    infectiveForms: [
      "Cercarias de cola bifurcada liberadas por caracoles Bulinus que penetran la piel humana."
    ],
    diagnosticForms: [
      "Huevos elipsoidales alargados grandes (110–170 × 40–70 µm) provistos de una espina terminal recta y afilada en el extremo posterior, con miracidio viable en orina centrifugada o filtrada.",
      "Cistoscopía con visualización de «parches arenosos» calcificados (sandy patches) en la mucosa vesical, úlceras o pólipos vesicales y biopsia vesical."
    ],
    clinicalSummary: {
      syndromes: ["Esquistosomiasis urogenital / vesical", "Esquistosomiasis genital femenina y masculina"],
      keySymptoms: ["Hematuria terminal microscópica o franca macroscópica (signo cardinal temprano), disuria, polaquiuria, dolor suprapúbico y proteinuria. En mujeres: lesiones ulceradas sangrantes vulvovaginales y dispareunia; en varones: hemospermia."],
      severeComplications: [
        "Carcinoma epidermoide de células escamosas de vejiga urinaria (carcinógeno biológico Grupo 1 reconocido por la IARC/OMS por inflamación crónica metaplásica)",
        "Uropatía obstructiva bilateral con hidrouréter, hidronefrosis retrógrada e insuficiencia renal crónica terminal",
        "Calcificación distrófica completa de la pared vesical («vejiga de porcelana») con fibrosis parietal y retracción irreversible del detrusor",
        "Esquistosomiasis genital con lesiones mucosas cervicales y vulvares que multiplican de 3 a 4 veces el riesgo de transmisión y adquisición del VIH, dolor pélvico crónico e infertilidad"
      ],
    },
    diagnosticMethods: [
      {
        name: "Filtración o centrifugación de orina con membrana de policarbonato o examen microscópico de sedimento",
        sampleType: "Orina completa recolectada entre las 10:00 y las 14:00 h (pico circadiano de eliminación de huevos tras ejercicio leve)",
        indication: "Estándar parasitológico de oro para demostración y cuantificación de huevos con espina terminal",
        limitations: "La excreción de huevos puede ser intermitente; requiere recolección en horario específico.",
      },
      {
        name: "Cistoscopía y biopsia vesical de lesiones de mucosa",
        sampleType: "Biopsia de pared vesical",
        indication: "Casos de hematuria persistente con orina negativa o sospecha de neoplasia vesical",
        limitations: "Procedimiento urológico invasivo.",
      },
      {
        name: "Detección de microhematuria con tiras reactivas y ecografía urológica",
        sampleType: "Orina y ecografía de vejiga y riñones",
        indication: "Cribado escolar poblacional en zonas endémicas y detección de hidronefrosis",
        limitations: "Inespecífica por sí sola.",
      }
    ],
    treatmentFirstLine: "Praziquantel oral (40 mg/kg en dosis única oral administrada tras las comidas; en casos crónicos severos puede dividirse en 2 dosis separadas por 4 h). Evaluación urológica de seguimiento para descartar estenosis ureteral residual o malignidad.",
    preventionControl: [
      "Evitar el baño y contacto dérmico con aguas dulces estancadas en áreas endémicas (África y Oriente Medio).",
      "Control de caracoles del género Bulinus en fuentes de agua dulce.",
      "Campañas escolares masivas de administración anual de Praziquantel en áreas endémicas.",
      "Saneamiento básico y provisión de letrinas para evitar la micción en cuerpos de agua."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Schistosomiasis (Schistosoma haematobium)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/schistosomiasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p32": {
    group: "Nematodos",
    localization: ["Musculatura y tejido subcutáneo", "Intestino delgado"],
    commonNames: ["T. spiralis", "Triquina"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Trichinellosis e ISP Chile. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Mamíferos carnívoros y omnívoros, cerdos domésticos, jabalíes, osos y ser humano (el mismo hospedador actúa primero como definitivo al albergar adultos en el intestino delgado y luego como intermediario al alojar larvas enquistadas en sus músculos)."],
      intermediate: ["Mismo hospedador que el definitivo (ciclo autoheteroxénico)."],
    },
    transmissionRoutes: ["Ingestión de carne cruda o insuficientemente cocinada de cerdo doméstico o animales de caza silvestre (jabalí, puma, oso) que contiene larvas viables enquistadas en células nodriza musculares."],
    infectiveForms: [
      "Larvas L1 encapsuladas viables en células nodriza en tejido muscular estriado esquelético."
    ],
    diagnosticForms: [
      "Serología IgG específica anti-Trichinella por ELISA confirmada por Western Blot (anticuerpos detectables a partir de la 2.ª o 3.ª semana de infección).",
      "Biopsia de músculo estriado esquelético (deltoides o bíceps) con triquinoscopía por compresión o digestión artificial con pepsina/HCl (observación de larvas espiraladas dentro de cápsulas colágenas fusiformes).",
      "Hipereosinofilia periférica masiva (>30–70%) asociada a elevación marcada de enzimas musculares séricas (CPK, LDH, aldolasa)."
    ],
    clinicalSummary: {
      syndromes: ["Fase entérica inicial (gastrointestinal)", "Fase de invasión muscular sistémica aguda (triquinosis clásica)", "Fase crónica de enquistamiento muscular"],
      keySymptoms: ["Diarrea y cólicos abdominales precoces (días 1–3); seguido a los 7–14 días por la tríada clásica: 1) fiebre elevada continua, 2) edema bipalpebral y facial bilateral indoloro («facies abotagada»), y 3) mialgias intensas incapacitantes (músculos oculares, maseteros, lengua, diafragma), asociadas a hemorragias en astilla subungueales e inyección conjuntival."],
      severeComplications: [
        "Miocarditis triquinósica aguda con necrosis miofibrilar, arritmias ventriculares malignas e insuficiencia cardíaca congestiva aguda (principal causa de muerte)",
        "Meningoencefalitis triquinósica con convulsiones, signos de focalidad neurológica y coma por microinfartos y vasculitis larvaria",
        "Insuficiencia respiratoria hipoxémica aguda por inflamación y necrosis severa de la musculatura diafragmática e intercostal",
        "Eventos tromboembólicos venosos o arteriales secundarios a vasculitis sistémica difusa y reposo forzado"
      ],
    },
    diagnosticMethods: [
      {
        name: "Serología ELISA IgG anti-Trichinella y Western Blot confirmatorio",
        sampleType: "Suero (muestra pareada aguda y convaleciente)",
        indication: "Pilar diagnóstico de confirmación en brotes de consumo de carne de cerdo o jabalí",
        limitations: "En la primera semana suele ser negativa (período de ventana inmunológica); repetir a las 2–3 semanas si alta sospecha.",
      },
      {
        name: "Biopsia muscular (deltoides) con compresión entre cristales (triquinoscopía) o digestión péptica",
        sampleType: "Tejido muscular estriado esquelético (~1 gramo)",
        indication: "Confirmación parasitológica directa en casos dudosos o médico-legales",
        limitations: "Procedimiento invasivo; puede dar falso negativo si la biopsia no incluye tejido parasitado.",
      },
      {
        name: "Marcadores biológicos: Hemograma completo y Creatina Fosfocinasa (CPK)",
        sampleType: "Sangre venosa",
        indication: "Alerta precoz: marcada hipereosinofilia (>30–60%) junto a elevación de CPK y LDH orienta fuertemente al diagnóstico",
        limitations: "Pruebas inespecíficas.",
      }
    ],
    treatmentFirstLine: "Albendazol oral (400 mg cada 12 h en adultos o 15 mg/kg/día dividido en 2 dosis por 10 a 14 días) o Mebendazol (200–400 mg cada 8 h por 3 días, luego 400–500 mg cada 8 h por 10 días). En presencia de síntomas sistémicos severos, compromiso miocárdico o neurológico: ASOCIAR obligatoriamente Corticoides sistémicos (Prednisona 0.5–1 mg/kg/día) para suprimir la intensa reacción inflamatoria alérgica.",
    preventionControl: [
      "Cocción completa de toda carne de cerdo y animales silvestres de caza (temperatura interna ≥71 °C en todo el grosor del corte hasta que la carne no quede rosada).",
      "¡ATENCIÓN! La congelación doméstica habitual NO elimina de forma fiable todas las especies de Trichinella (Trichinella nativa en osos y jabalíes es resistente a la congelación prolongada a -20 °C).",
      "Control veterinario oficial de faenas de cerdo y análisis triquinoscópico obligatorio de carnes antes de su consumo o comercialización.",
      "Prohibición de alimentar cerdos con basuras o carroña y control estricto de roedores en granjas porcinas."
    ],
    hasMicroscopy: false,
    hasGeography: true,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Trichinellosis (Trichinella spiralis)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/trichinellosis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Normativa de Vigilancia de Triquinosis en Chile",
        organization: "Ministerio de Salud de Chile (MINSAL) / ISP Chile",
        url: "https://epi.minsal.cl",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p33": {
    group: "Nematodos",
    localization: ["Intestino delgado"],
    commonNames: ["Anisakis", "Gusano del arenque"],
    status: "parcial",
    statusNote: "Ficha clínica estructurada y verificada documentalmente con CDC DPDx Anisakiasis. Modelo 3D programado para la siguiente tanda.",
    hosts: {
      definitive: ["Mamíferos marinos (cetáceos: ballenas, delfines; pinnípedos: focas, leones marinos; alojan adultos maduros en el estómago)."],
      intermediate: ["Primer intermediario: crustáceos marinos planctónicos (krill). Segundo intermediario / paraténico: peces teleósteos y cefalópodos marinos (merluza, salmón, arenque, caballa, calamar)."],
      accidental: ["Ser humano (hospedador accidental terminal que interrumpe el ciclo al ingerir larvas L3; las larvas no maduran a adultos en el tracto humano)."],
    },
    transmissionRoutes: ["Ingestión de larvas vivas de tercer estadio (L3) presentes en músculo o vísceras de pescado marino o calamar consumido crudo, marinado, en salmuera, ahumado en frío o insuficientemente cocinado (sushi, sashimi, ceviche, boquerones en vinagre)."],
    infectiveForms: [
      "Larva L3 viva de Anisakis (18–36 mm × 0.5–1 mm), cilíndrica, blanquecina, provista de un diente perforador cuticular anterior y poro excretor."
    ],
    diagnosticForms: [
      "Visualización y extracción directa de la larva L3 viva enclavada en la mucosa gástrica o duodenal mediante endoscopía digestiva alta (técnica diagnóstica y terapéutica definitiva).",
      "Detección de anticuerpos séricos específicos IgE e IgG anti-Anisakis simplex por ELISA / ImmunoCAP.",
      "Identificación de granuloma eosinofílico transmural con sección de la larva en corte histopatológico de pieza quirúrgica intestinal."
    ],
    clinicalSummary: {
      syndromes: ["Anisakiasis gástrica aguda", "Anisakiasis intestinal aguda o subaguda", "Anisakiasis alérgica o anafilaxia por pescado"],
      keySymptoms: ["En anisakiasis gástrica: dolor epigástrico intenso y lancinante de inicio súbito (pocas horas tras la ingesta de pescado crudo), náuseas, vómitos incoercibles y febrícula. En intestinal: dolor abdominal en fosa ilíaca derecha que simula apendicitis aguda. En alérgica: urticaria aguda, angioedema y prurito."],
      severeComplications: [
        "Perforación transmural gástrica o intestinal con peritonitis aguda química o purulenta de resolución quirúrgica inmediata",
        "Obstrucción intestinal mecánica aguda secundaria a granuloma eosinofílico estenosante transmural en íleon terminal",
        "Choque anafiláctico agudo mediado por IgE con colapso cardiovascular y edema laríngeo agudo por sensibilización frente a alérgenos termoestables de Anisakis (puede desencadenarse incluso tras consumir pescado cocinado o congelado en individuos sensibilizados)",
        "Cuadros de abdomen agudo que llevan a laparotomías de urgencia imprevistas"
      ],
    },
    diagnosticMethods: [
      {
        name: "Endoscopía Digestiva Alta (EDA) de urgencia con pinza de biopsia",
        sampleType: "Inspección endoscópica de mucosa gástrica y duodenal",
        indication: "Epigastralgia aguda violenta tras ingesta de pescado crudo dentro de las 12 a 24 h previas",
        limitations: "Permite el diagnóstico definitivo y la curación inmediata al extraer la larva visible con la pinza; pierde utilidad si la larva ya migró hacia el intestino delgado.",
      },
      {
        name: "Determinación de IgE e IgG específica anti-Anisakis por fluoroinmunoensayo (ImmunoCAP)",
        sampleType: "Suero",
        indication: "Reacciones alérgicas o sospecha de anisakiasis intestinal no accesible por endoscopía",
        limitations: "Puede presentar reactividad cruzada con otros nematodos (Ascaris) o crustáceos/ácaros.",
      }
    ],
    treatmentFirstLine: "Extracción endoscópica mecánica inmediata de la larva mediante pinza de biopsia bajo endoscopía digestiva alta (EDA), lo que resuelve el cuadro clínico instantáneamente. En formas intestinales no resecables endoscópicamente: manejo sintomático conservador con corticoides y albendazol (400 mg cada 12 h por 6 a 21 días); cirugía si hay obstrucción o perforación intestinal.",
    preventionControl: [
      "Congelación previa obligatoria de todo pescado destinado a consumo crudo o semicocinado a una temperatura interna de ≤ -20 °C durante al menos 24 a 48 h (o ≤ -35 °C por ≥15 h) para destruir todas las larvas.",
      "Cocción completa del pescado a temperatura interna superior a 60–63 °C en todo el grosor durante al menos 1 minuto.",
      "Evisceración rápida del pescado fresco capturado para evitar la migración de las larvas desde las vísceras hacia la masa muscular.",
      "En pacientes con anafilaxia alérgica confirmada por Anisakis: evitar totalmente el consumo de pescado marino o consumir pescado de acuicultura."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Anisakiasis (Anisakis spp.)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/anisakiasis/index.html",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p34": {
    group: "Ectoparásitos",
    localization: ["Piel y anexos"],
    commonNames: ["Sarcoptes scabiei", "Ácaro de la sarna", "Sarcoptes scabiei var. hominis"],
    status: "disponible",
    statusNote: "Ficha clínica con reconstrucción 3D hiperrealista de sus 4 formas evolutivas y diagnósticas (hembra adulta grávida con huevo intrauterino 3D, surco acarino en estrato córneo con huevos y escíbalos, macho adulto y larva hexápoda) verificada con CDC DPDx Scabies.",
    hosts: {
      definitive: ["Ser humano (Homo sapiens), hospedador específico obligado de la variedad Sarcoptes scabiei var. hominis (ectoparásito permanente del estrato córneo epidérmico)."],
      intermediate: ["No posee hospedador intermediario (ciclo biológico hemimetábolo directo intraepidérmico: huevo → larva hexápoda → protoninfa → tritoninfa → adulto en la piel humana)."],
      accidental: ["Variedades animales (ej. var. canis de perros) pueden penetrar temporalmente la piel humana causando dermatitis pruriginosa transitoria autolimitada sin excavar surcos ni reproducirse de forma sostenida."],
    },
    transmissionRoutes: ["Contacto cutáneo directo y prolongado piel con piel (relaciones sexuales, contacto familiar estrecho o dormir en la misma cama); en la sarna costrosa (noruega) altamente eficiente a través de fómites (ropa de cama, prendas, tapicería) por la presencia de millones de ácaros."],
    infectiveForms: [
      "Hembra adulta recién fecundada o ninfas móviles transferidas por contacto cutáneo estrecho.",
      "En sarna costrosa: escamas epidérmicas desprendidas cargadas de ácaros y huevos viables."
    ],
    diagnosticForms: [
      "Hembras adultas (300–450 × 250–350 µm) de contorno globoso redondeado en «tortuga», estriaciones transversales dorsales, 14 espinas cónicas y ventosas pedunculadas en patas anteriores I y II.",
      "Huevos ovalados grandes (150 × 100 µm) de cáscara hialina lisa transparentes en distintos estadios embrionarios.",
      "Escíbalos fecales (bolitas fecales pardo-amarillentas oscuras alineadas patognomónicas) recuperados en el raspado epidérmico con aceite mineral (Acarotest).",
      "Dermatoscopía de epiluminiscencia (10×): identificación patognomónica del «signo del ala delta» o «avión a reacción» (triángulo pigmentado de la cabeza del ácaro al final de la línea serpiginosa del surco)."
    ],
    clinicalSummary: {
      syndromes: ["Escabiosis clásica o típica", "Sarna costrosa o noruega (hiperqueratósica masiva)", "Nódulos escabióticos posinfecciosos"],
      keySymptoms: ["Prurito cutáneo generalizado de predominio nocturno intolerable (respetando cara y cabeza en adultos), lesiones polimorfas: surcos acarinos serpiginosos (2–15 mm) con vesícula perlada terminal en sitios de predilección (pliegues interdigitales de manos, flexura de muñecas, codos, pliegues axilares anteriores, aréolas mamarias, ombligo, surco subglúteo y genitales masculinos en escroto/pene)."],
      severeComplications: [
        "Sarna costrosa (noruega) con hiperqueratosis masiva psoriasiforme y fisurada que alberga cientos de miles a millones de ácaros en pacientes inmunodeprimidos (VIH, trasplante, desnutrición, demencia) con alto riesgo de brotes institucionales",
        "Sobreinfección bacteriana secundaria grave por Streptococcus pyogenes y Staphylococcus aureus con impétigo ampollar, ectima, celulitis y linfangitis",
        "Glomerulonefritis aguda postestreptocócica secundaria a la impetiginización bacteriana de las lesiones escabióticas",
        "Bacteriemia secundaria y shock séptico de foco cutáneo bacteriano",
        "Eczematización severa e hipersensibilidad alérgica persistente («prurito escabiótico residual» que puede durar semanas tras el tratamiento exitoso)"
      ],
    },
    diagnosticMethods: [
      {
        name: "Acarotest / Raspado epidérmico de surco acarino no excoriado con aceite mineral o KOH al 10%",
        sampleType: "Escamas de techo de surco o vesícula perlada (pliegues interdigitales o muñecas)",
        indication: "Confirmación parasitológica directa de certeza",
        limitations: "En la sarna clásica el paciente aloja solo 10–15 ácaros en toda la piel; la sensibilidad de un raspado aislado es <50% (un resultado negativo NO excluye sarna).",
      },
      {
        name: "Dermatoscopía de epiluminiscencia (10×)",
        sampleType: "Inspección in vivo no invasiva de lesiones",
        indication: "Búsqueda del signo del ala delta (cabeza y patas anteriores del ácaro)",
        limitations: "Requiere dermatoscopio y experiencia clínica; menor sensibilidad en pieles oscuras o muy excoriadas.",
      }
    ],
    treatmentFirstLine: "Permetrina tópica en crema al 5% aplicada desde el cuello hasta la punta de los dedos de los pies (cubriendo pliegues, genitales y bajo las uñas) por 8 a 14 h antes de lavarse, O Ivermectina oral (dosis única de 200 µg/kg tomada con alimentos). ES IMPRESCINDIBLE REPETIR EL TRATAMIENTO A LOS 7 A 14 DÍAS (ninguno es 100% ovicida) Y TRATAR SINCRÓNICAMENTE A TODOS LOS CONTACTOS ESTRECHOS Y CONVIVIENTES AUNQUE ESTÉN ASINTOMÁTICOS. En sarna costrosa: terapia combinada obligatoria (Ivermectina oral múltiple + Permetrina tópica diaria + queratolíticos tópicos con vaselina salicilada).",
    preventionControl: [
      "Tratamiento simultáneo y sincrónico de TODOS los contactos estrechos y miembros del hogar.",
      "Lavado de toda la ropa interior, prendas de vestir, toallas y sábanas usadas en los 3 días previos con agua caliente (≥50–60 °C) y secado a alta temperatura.",
      "Aislamiento en bolsas plásticas herméticas selladas durante al menos 4 a 7 días de textiles que no puedan lavarse a máquina (el ácaro muere por deshidratación en 48–72 h fuera de la piel humana).",
      "Aislamiento estricto de contacto de casos de sarna costrosa en hospitales o residencias de ancianos."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Scabies (Sarcoptes scabiei var. hominis)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/scabies/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Guía Clínica de Sarna (Escabiosis) y Pediculosis",
        organization: "Ministerio de Salud de Chile (MINSAL) / ISP Chile",
        url: "https://www.minsal.cl",
        accessedDate: "2026-10-20"
      }
    ]
  },

  "p35": {
    group: "Ectoparásitos",
    localization: ["Piel y anexos"],
    commonNames: ["Piojo de la cabeza", "Pediculus humanus var. capitis"],
    status: "disponible",
    statusNote: "Ficha clínica con reconstrucción 3D interactiva de sus 4 formas evolutivas (hembra adulta grávida con huevos intrauterinos 3D, macho adulto con edeago quitinoso, liendre viable adherida al tallo piloso con embrión y ninfa hematófaga) verificada con CDC DPDx Pediculosis.",
    hosts: {
      definitive: ["Ser humano (Homo sapiens), único hospedador específico obligado (ectoparásito permanente estenoxeno hematófago estricto del cuero cabelludo humano)."],
      intermediate: ["No posee hospedador intermediario ni reservorios animales (ciclo hemimetábolo directo: huevo / liendre → 3 estadios ninfales → adultos en el cabello)."],
    },
    transmissionRoutes: ["Contacto directo cabeza con cabeza (los piojos no saltan ni vuelan, pero se desplazan ágilmente aferrándose al tallo del pelo); de forma secundaria e infrecuente mediante fómites compartidos recientes (peines, cepillos de pelo, gorros, almohadas)."],
    infectiveForms: [
      "Adultos móviles (hembra o macho) y ninfas hematófagas vivas transferidas entre cabezas."
    ],
    diagnosticForms: [
      "Visualización directa de adultos móviles ápteros dorsoventralmente aplanados (2.0–3.3 mm) o ninfas vivas en el cuero cabelludo (especialmente en regiones retroauricular y occipital) mediante peinado en húmedo con lendrera metálica.",
      "Liendres viables ovoides translúcidas o de color caramelo (0.8 × 0.3 mm) cementadas firmemente con un manguito de quitina al tallo piloso a ≤6 mm del cuero cabelludo con opérculo abovedado intacto.",
      "Microscopía o dermatoscopía capilar (tricoscopía) para evaluar viabilidad ovular (embrión con mancha ocular vs liendre vacía blanquecina eclosionada)."
    ],
    clinicalSummary: {
      syndromes: ["Pediculosis capitis activa", "Infestación tratada / inactiva"],
      keySymptoms: ["Prurito persistente del cuero cabelludo de predominio retroauricular y occipital por sensibilización a la saliva del piojo, excoriaciones por rascado, sensación de cosquilleo o movimiento en el cabello e irritabilidad."],
      severeComplications: [
        "Sobreinfección bacteriana secundaria severa por rascado crónico e impetiginización excoriada (Staphylococcus aureus o Streptococcus pyogenes) con costras melicéricas y foliculitis",
        "Plica polónica (tricoma: aglomeración purulenta fétida irreductible de tallos pilosos, secreción costrosa, liendres y piojos que requiere corte radical de cabello)",
        "Linfadenitis reactiva dolorosa en cadenas ganglionares occipitales y cervicales posteriores",
        "Dermatitis eccematosa de nuca («reacción eccematosa escabio-pediculósica») por hipersensibilidad alérgica a deyecciones y saliva del parásito"
      ],
    },
    diagnosticMethods: [
      {
        name: "Peinado en húmedo sistematizado con lendrera metálica de púas finas (espacio interdental ≤0.2–0.3 mm)",
        sampleType: "Cabello húmedo acondicionado con bálsamo/acondicionador capilar",
        indication: "Estándar de oro clínico de máxima sensibilidad para detectar infestación activa (3–4 veces más sensible que la inspección visual en seco)",
        limitations: "El hallazgo aislado de liendres vacías o alejadas a >6–10 mm del cuero cabelludo indica infestación antigua o tratada y NO justifica retratamiento pediculicida.",
      },
      {
        name: "Dermatoscopía capilar (Tricoscopía) y examen microscópico",
        sampleType: "Tallo piloso con liendre adherida o espécimen recolectado",
        indication: "Diferenciación entre liendre viable (con embrión pigmentado) vs vainas queratínicas o pseudoliendres (caspa, cilindros de laca)",
        limitations: "Requiere dermatoscopio o microscopio.",
      }
    ],
    treatmentFirstLine: "Pediculicida tópico de primera línea: Permetrina tópica en loción al 1% o Dimeticona al 4% (agente físico asfixiante que no induce resistencia) aplicada en cabello seco durante el tiempo indicado por el fabricante, seguido de enjuague y peinado minucioso con lendrera metálica. ES OBLIGATORIO REPETIR EXACTAMENTE LA MISMA APLICACIÓN AL DÍA 7–10 (para destruir las ninfas que hayan eclosionado de huevos sobrevivientes, ya que los pediculicidas no son 100% ovicidas). Alternativa oral: Ivermectina (200 µg/kg) en casos refractarios.",
    preventionControl: [
      "Revisión periódica de la cabeza de los niños con lendrera metálica húmeda.",
      "Evitar el contacto directo cabeza con cabeza en juegos escolares o deportes.",
      "No compartir gorros, cepillos, peines, audífonos de diadema o toallas.",
      "Desinfección de peines y cepillos sumergiéndolos en agua caliente (>60 °C) durante 10 minutos.",
      "No se recomienda la exclusión escolar sistemática del niño ni fumigaciones ambientales innecesarias (los piojos mueren en 24–48 h fuera de la cabeza humana)."
    ],
    hasMicroscopy: false,
    hasGeography: false,
    hasCases: false,
    sources: [
      {
        title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Pediculosis (Pediculus humanus capitis)",
        organization: "Centers for Disease Control and Prevention (CDC)",
        url: "https://www.cdc.gov/dpdx/pediculosis/index.html",
        accessedDate: "2026-10-20"
      },
      {
        title: "Guía Clínica de Sarna y Pediculosis",
        organization: "Ministerio de Salud de Chile (MINSAL) / ISP Chile",
        url: "https://www.minsal.cl",
        accessedDate: "2026-10-20"
      }
    ]
  }
};

/**
 * Genera el catálogo completo de 35 especies, vinculando la ficha de Taenia solium
 * y utilizando los datos estructurados explícitos verificados documentalmente para cada una de las demás 34 especies.
 */
export const ALL_PARASITES: ParasiteCard[] = PARASITE_CARDS.map((p) => {
  // Caso de referencia completa: Taenia solium
  if (p.name.toLowerCase().includes("taenia solium")) {
    return TAENIA_SOLIUM_CARD;
  }

  const explicit = EXPLICIT_SPECIES_DATA[p.id];
  if (!explicit) {
    throw new Error(`Falta especificación explícita para el parásito ID: ${p.id} (${p.name})`);
  }

  const has3D = hasParasite3DModel(p.id);

  return {
    id: p.id,
    code: p.pdfId || p.id.toUpperCase(),
    scientificName: p.name,
    commonNames: explicit.commonNames,
    group: explicit.group,
    status: explicit.status,
    statusNote: explicit.statusNote,
    hosts: explicit.hosts,
    localization: explicit.localization,
    transmissionRoutes: explicit.transmissionRoutes,
    infectiveForms: explicit.infectiveForms,
    diagnosticForms: explicit.diagnosticForms,
    clinicalSummary: {
      syndromes: explicit.clinicalSummary.syndromes,
      keySymptoms: explicit.clinicalSummary.keySymptoms,
      severeComplications: explicit.clinicalSummary.severeComplications,
    },
    diagnosticMethods: explicit.diagnosticMethods,
    treatmentFirstLine: explicit.treatmentFirstLine,
    preventionControl: explicit.preventionControl,
    has3DModel: has3D,
    hasMicroscopy: Boolean(explicit.hasMicroscopy),
    hasLifeCycle: false,
    hasGeography: Boolean(explicit.hasGeography),
    hasCases: Boolean(explicit.hasCases),
    reviewDate: "2026-10-20",
    reviewer: "Verificación documental (CDC DPDx / ISP Chile / MINSAL)",
    sources: explicit.sources,
  };
});
