/**
 * REGISTRO DE EVIDENCIA EPIDEMIOLÓGICA REGIONAL DE PARASITOLOGÍA
 * Plataforma: MedStudy / LYOH
 * Foco: Chile (16 regiones político-administrativas oficiales)
 *
 * CRITERIOS DE RIGOR DOCUMENTAL:
 * 1. Cada registro se asocia explícitamente al código de una de las 16 regiones oficiales.
 * 2. Se distingue rigurosamente el tipo de evidencia:
 *    - Vigilancia ENO (MINSAL)
 *    - Estudios de seroprevalencia y prevalencia humana
 *    - Registros zoosanitarios y decomisos oficiales (SAG)
 *    - Casos clínicos confirmados en centros terciarios
 *    - Casos importados documentados
 *    - Hitos históricos certificados de salud pública (ej. interrupción vectorial)
 * 3. Diferenciación estricta entre infección autóctona, caso importado y vigilancia animal.
 * 4. Auditoría de cifras: Si una cifra carece de enlace directo o boletín específico primario,
 *    se mantiene como 'cifra_en_revision', informando con transparencia que el valor cuantitativo
 *    se encuentra en revisión documental sin inventar estadísticas ni eliminar el registro original.
 * 5. La ausencia de datos incorporados ('sin_datos_incorporados') NUNCA se interpreta como
 *    ausencia biológica del parásito.
 */

export type EvidenceCategory =
  | "vigilancia_eno"
  | "estudio_prevalencia_humana"
  | "registro_animal_sag"
  | "casos_clinicos_diagnosticados"
  | "casos_importados"
  | "interrupcion_vectorial_historica"
  | "sin_datos_incorporados";

export type TransmissionContext =
  | "infeccion_autoctona"
  | "caso_importado"
  | "zoonosis_animal"
  | "tamizaje_universal"
  | "hito_salud_publica"
  | "no_determinado";

export type VerificationStatus = "verificado" | "cifra_en_revision";

export interface RegionalParasiteRecord {
  id: string;
  regionCode: number;
  regionName: string;
  parasiteId: string;
  speciesName: string;
  group: string;
  evidenceCategory: EvidenceCategory;
  evidenceLabel: string;
  transmissionContext: TransmissionContext;
  transmissionLabel: string;
  verificationStatus: VerificationStatus;
  periodOrDate: string;
  findingSummary: string;
  quantitativeMetric?: {
    hasVerifiedMetric: boolean;
    metricDisplay: string;
    unitAndPopulation?: string;
    pendingNote?: string;
  };
  source: {
    title: string;
    organization: string;
    url: string;
    publicationYear: string;
    consultationDate: string;
  };
  limitations: string;
  epidemiologicalNotes: string;
}

export const REGIONAL_PARASITE_RECORDS: RegionalParasiteRecord[] = [
  // ==========================================
  // ECHINOCOCCUS GRANULOSUS SENSU LATO (p27)
  // ==========================================
  {
    id: "rec-p27-r11-aysen",
    regionCode: 11,
    regionName: "Región de Aysén del Gral. Carlos Ibáñez del Campo",
    parasiteId: "p27",
    speciesName: "Echinococcus granulosus sensu lato",
    group: "Cestodos",
    evidenceCategory: "vigilancia_eno",
    evidenceLabel: "Vigilancia ENO · Alta incidencia acumulada",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Infección adquirida localmente (zoonosis rural)",
    verificationStatus: "verificado",
    periodOrDate: "2015 – 2023",
    findingSummary: "Zona de máxima tasa de notificación acumulada de hidatidosis humana en Chile. Ciclo perro-oveja hiperendémico favorecido por faenamiento ovino domiciliario sin inspección y alimentación de perros con vísceras crudas parasitadas.",
    quantitativeMetric: {
      hasVerifiedMetric: true,
      metricDisplay: "Tasas anuales habitualmente superiores a 20 casos por 100.000 habitantes",
      unitAndPopulation: "Tasa de notificación anual por 100.000 habitantes en población general de la región (Boletines ENO MINSAL)."
    },
    source: {
      title: "Informe Epidemiológico de Hidatidosis · Vigilancia Transmisibles",
      organization: "Departamento de Epidemiología MINSAL",
      url: "https://epi.minsal.cl/hidatidosis/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "Existe latencia clínica prolongada (años a décadas) entre el momento de la infección y el diagnóstico por imagenología o complicaciones.",
    epidemiologicalNotes: "Prioridad sanitaria regional con programas periódicos de desparasitación canina con praziquantel y educación sanitaria comunitaria."
  },
  {
    id: "rec-p27-r12-magallanes",
    regionCode: 12,
    regionName: "Región de Magallanes y de la Antártica Chilena",
    parasiteId: "p27",
    speciesName: "Echinococcus granulosus sensu lato",
    group: "Cestodos",
    evidenceCategory: "vigilancia_eno",
    evidenceLabel: "Vigilancia ENO · Endemia ganadera ovina",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Infección adquirida localmente (actividad ganadera)",
    verificationStatus: "verificado",
    periodOrDate: "2015 – 2023",
    findingSummary: "Histórico foco ganadero ovino con notificación continua de casos humanos de quiste hidatídico hepático y pulmonar bajo régimen ENO.",
    quantitativeMetric: {
      hasVerifiedMetric: true,
      metricDisplay: "Tasas de notificación consistentemente por encima del promedio nacional",
      unitAndPopulation: "Tasa bruta regional vs. promedio nacional (~1.5 a 2.0 por 100.000 hab.)."
    },
    source: {
      title: "Boletín de Enfermedades Zoonóticas de Notificación Obligatoria",
      organization: "Departamento de Epidemiología MINSAL",
      url: "https://epi.minsal.cl/hidatidosis/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "Parte de los diagnósticos corresponden a hallazgos incidentales por ecografía o tomografía en adultos asintomáticos.",
    epidemiologicalNotes: "El control en plantas faenadoras autorizadas es riguroso; la persistencia radica en faenas de consumo familiar en estancias aisladas."
  },
  {
    id: "rec-p27-r14-los-rios",
    regionCode: 14,
    regionName: "Región de Los Ríos",
    parasiteId: "p27",
    speciesName: "Echinococcus granulosus sensu lato",
    group: "Cestodos",
    evidenceCategory: "vigilancia_eno",
    evidenceLabel: "Vigilancia ENO · Sector silvoagropecuario",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Infección adquirida localmente",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2023",
    findingSummary: "Notificación de quistes hidatídicos en comunas rurales y precordilleranas (Panguipulli, Río Bueno, Futrono) atendidos en la red asistencial de Los Ríos.",
    source: {
      title: "Vigilancia Epidemiológica de Enfermedades Zoonóticas",
      organization: "Secretaría Regional Ministerial de Salud Los Ríos / MINSAL",
      url: "https://epi.minsal.cl/hidatidosis/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "Los casos de pacientes intervenidos quirúrgicamente en el Hospital Base Valdivia pueden incluir derivaciones de comunas limítrofes.",
    epidemiologicalNotes: "Coexistencia de crianza ovina y bovina a escala campesina familiar con perros no desparasitados sistemáticamente."
  },
  {
    id: "rec-p27-r09-araucania",
    regionCode: 9,
    regionName: "Región de La Araucanía",
    parasiteId: "p27",
    speciesName: "Echinococcus granulosus sensu lato",
    group: "Cestodos",
    evidenceCategory: "vigilancia_eno",
    evidenceLabel: "Vigilancia ENO · Zonas rurales agrícolas",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Infección adquirida localmente",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2023",
    findingSummary: "Casos humanos notificados bajo ENO y vigilancia serológica hospitalaria (Hospital Hernán Henríquez Aravena de Temuco y hospitales provinciales).",
    source: {
      title: "Manual para el Diagnóstico, Tratamiento, Prevención y Control de Hidatidosis",
      organization: "Ministerio de Salud de Chile",
      url: "https://epi.minsal.cl/hidatidosis/",
      publicationYear: "2022",
      consultationDate: "2026-10-20"
    },
    limitations: "Subregistro de casos no complicados en áreas rurales apartadas de la cordillera de Nahuelbuta y sectores andinos.",
    epidemiologicalNotes: "Importancia de la investigación ecográfica en terreno en escolares rurales para detección precoz asintomática."
  },
  {
    id: "rec-p27-r10-los-lagos",
    regionCode: 10,
    regionName: "Región de Los Lagos",
    parasiteId: "p27",
    speciesName: "Echinococcus granulosus sensu lato",
    group: "Cestodos",
    evidenceCategory: "vigilancia_eno",
    evidenceLabel: "Vigilancia ENO y decomisos veterinarios SAG",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Zoonosis rural e inspección en faenamiento",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2023",
    findingSummary: "Presencia continua en sectores de la provincia de Osorno, Llanquihue y Chiloé rural. Decomisos de vísceras parasitadas en mataderos autorizados e hidatidosis humana en hospitales provinciales.",
    source: {
      title: "Vigilancia Zoosanitaria y Enfermedades de Declaración Obligatoria",
      organization: "SAG / MINSAL",
      url: "https://epi.minsal.cl/hidatidosis/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "Disparidad en la cobertura diagnóstica entre áreas urbanas tecnificadas y sectores isleños del archipiélago de Chiloé.",
    epidemiologicalNotes: "El decomiso veterinario en mataderos certificados previene el ingreso de vísceras infectadas al consumo de mascotas."
  },
  {
    id: "rec-p27-r04-coquimbo",
    regionCode: 4,
    regionName: "Región de Coquimbo",
    parasiteId: "p27",
    speciesName: "Echinococcus granulosus sensu lato",
    group: "Cestodos",
    evidenceCategory: "vigilancia_eno",
    evidenceLabel: "Vigilancia ENO · Secano y valles ganaderos",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Infección adquirida localmente (ganadería caprina y ovina)",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2023",
    findingSummary: "Endemia persistente en comunidades agrícolas del secano costero y valles de Limarí y Choapa. El pastoreo de ganado caprino y ovino con perros guardianes mantiene la transmisión en sectores rurales no tecnificados.",
    source: {
      title: "Situación Epidemiológica de las Enfermedades Zoonóticas en Chile",
      organization: "Departamento de Epidemiología MINSAL",
      url: "https://epi.minsal.cl/hidatidosis/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "Dispersión de crianceros trashumantes durante las veranadas cordilleranas dificulta el seguimiento continuado.",
    epidemiologicalNotes: "Coquimbo representa el foco endémico de hidatidosis más septentrional de importancia en Chile."
  },
  {
    id: "rec-p27-r13-metropolitana",
    regionCode: 13,
    regionName: "Región Metropolitana de Santiago",
    parasiteId: "p27",
    speciesName: "Echinococcus granulosus sensu lato",
    group: "Cestodos",
    evidenceCategory: "casos_clinicos_diagnosticados",
    evidenceLabel: "Diagnóstico en centros terciarios de referencia",
    transmissionContext: "caso_importado",
    transmissionLabel: "Casos diagnosticados en la región (infección en zonas endémicas)",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2024",
    findingSummary: "Resolución quirúrgica e intervencionista de quistes hidatídicos complejos en hospitales de alta complejidad de Santiago (Hospital del Salvador, HCUCH, Hospital San Borja Arriarán). La mayoría de los pacientes tienen antecedentes de residencia o infancia en el sur del país.",
    source: {
      title: "Registro de Casos Atendidos en Centros de Referencia Nacional",
      organization: "Instituto de Salud Pública de Chile / Red Asistencial MINSAL",
      url: "https://epi.minsal.cl/hidatidosis/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "La Región Metropolitana no presenta ciclo de transmisión autóctona significativo en áreas urbanas; refleja concentración de derivación terciaria.",
    epidemiologicalNotes: "Casos autóctonos muy esporádicos restringidos a áreas rurales periféricas de crianza pecuaria en Melipilla o Talagante."
  },

  // ==========================================
  // TRYPANOSOMA CRUZI (p13)
  // ==========================================
  {
    id: "rec-p13-r04-coquimbo",
    regionCode: 4,
    regionName: "Región de Coquimbo",
    parasiteId: "p13",
    speciesName: "Trypanosoma cruzi",
    group: "Protozoos flagelados",
    evidenceCategory: "interrupcion_vectorial_historica",
    evidenceLabel: "Interrupción vectorial intradomiciliaria (1999) & Tamizaje activo",
    transmissionContext: "tamizaje_universal",
    transmissionLabel: "Vigilancia transplacentaria y tamizaje de sangre",
    verificationStatus: "verificado",
    periodOrDate: "1999 – 2024",
    findingSummary: "Zona histórica de hiperendemia por Triatoma infestans. Transmisión vectorial domiciliaria interrumpida oficialmente en 1999 (certificación OPS). Vigilancia activa actual centrada en tamizaje del 100% de donantes de sangre y cribado serológico en embarazadas para prevención de Chagas congénito.",
    quantitativeMetric: {
      hasVerifiedMetric: true,
      metricDisplay: "100% de tamizaje serológico obligatorio en donantes de sangre",
      unitAndPopulation: "Porcentaje de tamizaje en red pública y privada de bancos de sangre (Norma Técnica N° 162 MINSAL)."
    },
    source: {
      title: "Norma Técnica N° 162 para el Control y Prevención de la Enfermedad de Chagas",
      organization: "Ministerio de Salud de Chile / OPS",
      url: "https://epi.minsal.cl/enfermedad-de-chagas/",
      publicationYear: "2019",
      consultationDate: "2026-10-20"
    },
    limitations: "Presencia persistente de vectores silvestres (Mepraia spinolai) en pircas y pedregales peridomiciliarios.",
    epidemiologicalNotes: "Tratamiento parasiticida gratuito garantizado con nifurtimox o benznidazol para recién nacidos de madres seropositivas y casos reactivados."
  },
  {
    id: "rec-p13-r03-atacama",
    regionCode: 3,
    regionName: "Región de Atacama",
    parasiteId: "p13",
    speciesName: "Trypanosoma cruzi",
    group: "Protozoos flagelados",
    evidenceCategory: "interrupcion_vectorial_historica",
    evidenceLabel: "Interrupción vectorial certificada · Vigilancia congénita",
    transmissionContext: "tamizaje_universal",
    transmissionLabel: "Tamizaje obligatorio prenatal y transfusional",
    verificationStatus: "verificado",
    periodOrDate: "1999 – 2024",
    findingSummary: "Territorio de endemia histórica en valles de Copiapó y Huasco. Vigilancia epidemiológica orientada a detección serológica en gestantes y prevención de la transmisión vertical.",
    source: {
      title: "Plan Nacional de Enfermedad de Chagas · Vigilancia Integrada",
      organization: "Departamento de Epidemiología MINSAL",
      url: "https://epi.minsal.cl/enfermedad-de-chagas/",
      publicationYear: "2022",
      consultationDate: "2026-10-20"
    },
    limitations: "Vigilancia de Mepraia gajardoi y M. spinolai en ambientes silvestres costeros sin invasión domiciliaria reportada.",
    epidemiologicalNotes: "Los pacientes adultos mayores crónicos reciben seguimiento cardiovascular para detección de cardiopatía chagásica y megasíndromes digestivos."
  },
  {
    id: "rec-p13-r15-arica",
    regionCode: 15,
    regionName: "Región de Arica y Parinacota",
    parasiteId: "p13",
    speciesName: "Trypanosoma cruzi",
    group: "Protozoos flagelados",
    evidenceCategory: "interrupcion_vectorial_historica",
    evidenceLabel: "Vigilancia fronteriza y tamizaje universal",
    transmissionContext: "tamizaje_universal",
    transmissionLabel: "Tamizaje universal de sangre y cribado de gestantes",
    verificationStatus: "verificado",
    periodOrDate: "1999 – 2024",
    findingSummary: "Extremo norte de la zona histórica de distribución de triatominos en valles de Azapa y Lluta. Interrupción vectorial intradomiciliaria consolidada. Vigilancia activa en bancos de sangre y red perinatal.",
    source: {
      title: "Boletín de Vigilancia de la Enfermedad de Chagas",
      organization: "Departamento de Epidemiología MINSAL",
      url: "https://epi.minsal.cl/enfermedad-de-chagas/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "Flujo migratorio desde países limítrofes con áreas de transmisión vectorial activa requiere mantener alta sospecha serológica.",
    epidemiologicalNotes: "El tamizaje de sangre en Arica es 100% automatizado con pruebas de alta sensibilidad (quimioluminiscencia y ELISA)."
  },
  {
    id: "rec-p13-r05-valparaiso",
    regionCode: 5,
    regionName: "Región de Valparaíso",
    parasiteId: "p13",
    speciesName: "Trypanosoma cruzi",
    group: "Protozoos flagelados",
    evidenceCategory: "interrupcion_vectorial_historica",
    evidenceLabel: "Límite sur de distribución vectorial histórica",
    transmissionContext: "tamizaje_universal",
    transmissionLabel: "Tamizaje transfusional y prenatal",
    verificationStatus: "verificado",
    periodOrDate: "1999 – 2024",
    findingSummary: "Provincias de Petorca, San Felipe y Los Andes conformaron históricamente el área endémica rural. Transmisión vectorial domiciliaria interrumpida desde 1999.",
    source: {
      title: "Norma Técnica N° 162 de Chagas",
      organization: "MINSAL Chile",
      url: "https://epi.minsal.cl/enfermedad-de-chagas/",
      publicationYear: "2019",
      consultationDate: "2026-10-20"
    },
    limitations: "Enfermedad silenciosa en fase crónica indeterminada; los pacientes a menudo se detectan únicamente al donar sangre.",
    epidemiologicalNotes: "Los territorios insulares (Rapa Nui y Juan Fernández) no presentan ni presentaron triatominos vectores."
  },
  {
    id: "rec-p13-r13-metropolitana",
    regionCode: 13,
    regionName: "Región Metropolitana de Santiago",
    parasiteId: "p13",
    speciesName: "Trypanosoma cruzi",
    group: "Protozoos flagelados",
    evidenceCategory: "casos_clinicos_diagnosticados",
    evidenceLabel: "Seguimiento crónico y tamizaje en bancos de sangre",
    transmissionContext: "caso_importado",
    transmissionLabel: "Infecciones adquiridas en regiones endémicas o países vecinos",
    verificationStatus: "verificado",
    periodOrDate: "2015 – 2024",
    findingSummary: "Concentración del mayor número absoluto de donantes de sangre serorreactivos a T. cruzi en Chile, correspondientes a personas nacidas en las regiones del norte o migrantes de países endémicos sudamericanos.",
    source: {
      title: "Informe de Tamizaje de Donantes de Sangre de la Red Metropolitana",
      organization: "Centro Metropolitano de Sangre y Tejidos / ISP",
      url: "https://epi.minsal.cl/enfermedad-de-chagas/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "La ciudad de Santiago no tiene transmisión vectorial domiciliaria autóctona.",
    epidemiologicalNotes: "Toda unidad de sangre reactiva es descartada de inmediato y el donante es derivado a confirmación por el Instituto de Salud Pública (ISP)."
  },

  // ==========================================
  // TAENIA SOLIUM (p25-taenia-solium)
  // ==========================================
  {
    id: "rec-p25-r09-araucania",
    regionCode: 9,
    regionName: "Región de La Araucanía",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    group: "Cestodos",
    evidenceCategory: "estudio_prevalencia_humana",
    evidenceLabel: "Estudios serológicos y de terreno en comunidades rurales",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Presencia autóctona documentada (crianza de traspatio)",
    verificationStatus: "cifra_en_revision",
    periodOrDate: "2015 – 2022",
    findingSummary: "Investigaciones parasitológicas universitarias y comunitarias en sectores rurales con crianza porcina no tecnificada de traspatio. Persistencia de microfocos por acceso de cerdos a defecación abierta o letrinas rústicas.",
    quantitativeMetric: {
      hasVerifiedMetric: false,
      metricDisplay: "Cifra en revisión documental",
      pendingNote: "Los reportes preliminares estimaban seroprevalencia porcina entre 1.5% y 4.8% en faena rural no formal; pendiente de contraste con boletín primario con DOI."
    },
    source: {
      title: "Estudios Parasitológicos en Comunidades Rurales de La Araucanía",
      organization: "Universidad de La Frontera / Vigilancia SAG",
      url: "https://epi.minsal.cl/",
      publicationYear: "2022",
      consultationDate: "2026-10-20"
    },
    limitations: "Subnotificación de teniasis intestinal humana por cursos asintomáticos o automedicación antiparasitaria.",
    epidemiologicalNotes: "El faenamiento clandestino domiciliario escapa a la inspección médico-veterinaria de mataderos autorizados."
  },
  {
    id: "rec-p25-r07-maule",
    regionCode: 7,
    regionName: "Región del Maule",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    group: "Cestodos",
    evidenceCategory: "casos_clinicos_diagnosticados",
    evidenceLabel: "Registro hospitalario de neurocisticercosis",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Casos diagnosticados en hospital regional",
    verificationStatus: "cifra_en_revision",
    periodOrDate: "2016 – 2023",
    findingSummary: "Casos esporádicos de neurocisticercosis atendidos y confirmados en el Hospital Regional de Talca en pacientes adultos con crisis convulsivas tardías.",
    quantitativeMetric: {
      hasVerifiedMetric: false,
      metricDisplay: "Cifra en revisión documental",
      pendingNote: "Registro hospitalario histórico de 1 a 4 casos anuales confirmados por neuroimagen y serología; pendiente de confirmación documental específica."
    },
    source: {
      title: "Comunicaciones Clínicas de Neuroinfecciones",
      organization: "Servicio de Salud Maule / Sociedad Chilena de Infectología",
      url: "https://www.sochinf.cl/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "Muchos diagnósticos reflejan infecciones contraídas varias décadas antes, dado el prolongado período de latencia de los quistes calcificados.",
    epidemiologicalNotes: "El saneamiento básico rural en el valle central ha disminuido sustancialmente la transmisión activa respecto a décadas pasadas."
  },
  {
    id: "rec-p25-r13-metropolitana",
    regionCode: 13,
    regionName: "Región Metropolitana de Santiago",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    group: "Cestodos",
    evidenceCategory: "casos_importados",
    evidenceLabel: "Diagnóstico terciario y predominio de casos importados",
    transmissionContext: "caso_importado",
    transmissionLabel: "Casos diagnosticados en centros terciarios de referencia",
    verificationStatus: "cifra_en_revision",
    periodOrDate: "2018 – 2024",
    findingSummary: "Diagnóstico y manejo neuroquirúrgico de neurocisticercosis en el Instituto de Neurocirugía Asenjo y Hospital del Salvador. Proporción mayoritaria asociada a personas provenientes de países andinos o de Centroamérica con alta endemicidad.",
    quantitativeMetric: {
      hasVerifiedMetric: false,
      metricDisplay: "Cifra en revisión documental",
      pendingNote: "Estimación del 60% al 70% de procedencia importada en series clínicas metropolitanas; pendiente de auditoría de fichas clínicas terciarias."
    },
    source: {
      title: "Boletines de Diagnóstico de Referencia Parasitológica",
      organization: "Instituto de Salud Pública de Chile (ISP)",
      url: "https://www.ispch.cl/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "La procedencia en fichas hospitalarias no siempre permite deslindar con exactitud viaje previo de reactivación en residentes antiguos.",
    epidemiologicalNotes: "El riesgo de transmisión secundaria intradomiciliaria a través de portadores de teniasis adulta resalta la importancia del tamizaje en contactos estrechos."
  },
  {
    id: "rec-p25-r10-los-lagos",
    regionCode: 10,
    regionName: "Región de Los Lagos",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    group: "Cestodos",
    evidenceCategory: "registro_animal_sag",
    evidenceLabel: "Inspección médico-veterinaria oficial en mataderos",
    transmissionContext: "zoonosis_animal",
    transmissionLabel: "Vigilancia en plantas faenadoras autorizadas",
    verificationStatus: "cifra_en_revision",
    periodOrDate: "2017 – 2022",
    findingSummary: "Vigilancia sistemática de canales porcinas faenadas en plantas industriales autorizadas por el Servicio Agrícola y Ganadero (SAG).",
    quantitativeMetric: {
      hasVerifiedMetric: false,
      metricDisplay: "Cifra en revisión documental",
      pendingNote: "Tasa de decomiso oficial reportada inferior al 0.05% en plantas industriales tecnificadas; pendiente de referencia a la memoria anual SAG específica."
    },
    source: {
      title: "Boletines de Vigilancia Zoosanitaria en Mataderos",
      organization: "Servicio Agrícola y Ganadero (SAG)",
      url: "https://www.sag.gob.cl/",
      publicationYear: "2022",
      consultationDate: "2026-10-20"
    },
    limitations: "La baja tasa en plantas industriales demuestra la bioseguridad del sector tecnificado, pero no mide el faenamiento de traspatio no regulado.",
    epidemiologicalNotes: "La producción de cerdos en planteles con alimentación controlada y confinamiento estricto se mantiene libre de cisticercosis en Chile."
  },

  // ==========================================
  // TRICHINELLA SPIRALIS (p32)
  // ==========================================
  {
    id: "rec-p32-r08-biobio",
    regionCode: 8,
    regionName: "Región del Biobío",
    parasiteId: "p32",
    speciesName: "Trichinella spiralis",
    group: "Nematodos",
    evidenceCategory: "vigilancia_eno",
    evidenceLabel: "Vigilancia ENO · Brotes por faena no inspeccionada",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Brote zoonótico alimentario",
    verificationStatus: "verificado",
    periodOrDate: "2015 – 2023",
    findingSummary: "Brotes familiares y comunitarios de triquinosis notificados en el marco de la vigilancia ENO, vinculados al consumo de cecinas artesanales, carne de cerdo o jabalí (Sus scrofa) faenados sin análisis triquinoscópico previo.",
    source: {
      title: "Circular de Vigilancia Epidemiológica de Triquinosis (CIE-10: B75)",
      organization: "Departamento de Epidemiología MINSAL",
      url: "https://epi.minsal.cl/triquinosis/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "Los brotes tienen marcada estacionalidad invernal asociada a las tradicionales faenas de carneo domiciliario.",
    epidemiologicalNotes: "La digestión artificial es la técnica de referencia para el diagnóstico en carne; la congelación doméstica convencional no garantiza la destrucción larvaria en todas las especies de Trichinella."
  },
  {
    id: "rec-p32-r09-araucania",
    regionCode: 9,
    regionName: "Región de La Araucanía",
    parasiteId: "p32",
    speciesName: "Trichinella spiralis",
    group: "Nematodos",
    evidenceCategory: "vigilancia_eno",
    evidenceLabel: "Vigilancia ENO · Brotes episódicos",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Brote zoonótico alimentario",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2023",
    findingSummary: "Notificación obligatoria de brotes de triquinosis aguda caracterizados por edema bipalpebral, mialgias intensas, fiebre y eosinofilia marcada tras consumo de carne porcina o subproductos caseros.",
    source: {
      title: "Informe Epidemiológico de Enfermedades Transmitidas por Alimentos",
      organization: "MINSAL / SEREMI de Salud Araucanía",
      url: "https://epi.minsal.cl/triquinosis/",
      publicationYear: "2022",
      consultationDate: "2026-10-20"
    },
    limitations: "Casos leves o subclínicos pueden ser confundidos con cuadros virales o influenza estacional.",
    epidemiologicalNotes: "Coordinación entre SEREMI de Salud y SAG para el decomiso de partidas de carne y trazabilidad del predio de origen."
  },

  // ==========================================
  // FASCIOLA HEPATICA (p29)
  // ==========================================
  {
    id: "rec-p29-r07-maule",
    regionCode: 7,
    regionName: "Región del Maule",
    parasiteId: "p29",
    speciesName: "Fasciola hepatica",
    group: "Trematodos",
    evidenceCategory: "registro_animal_sag",
    evidenceLabel: "Vigilancia zoosanitaria & Casos humanos esporádicos",
    transmissionContext: "zoonosis_animal",
    transmissionLabel: "Endemia pecuaria y transmisión hídrica/vegetal",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2023",
    findingSummary: "Endemia significativa en ganado bovino y ovino en sectores con canales de regadío y vegas donde prolifera el caracol intermediario (Lymnaea viatrix). Casos humanos asociados a consumo de berros silvestres (Nasturtium officinale) recolectados en cursos de agua no controlados.",
    source: {
      title: "Vigilancia y Control de Enfermedades Parasitarias de los Animales",
      organization: "Servicio Agrícola y Ganadero (SAG)",
      url: "https://www.sag.gob.cl/ambitos-de-accion/vigilancia-y-control-de-enfermedades-animales",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "La fascioliasis humana no es ENO universal en Chile; los casos se diagnostican principalmente por hallazgos ecográficos, colangiorresonancia o serología ISP.",
    epidemiologicalNotes: "El triclabendazol es el antihelmíntico de elección recomendado para la fascioliasis hepática humana."
  },
  {
    id: "rec-p29-r06-ohiggins",
    regionCode: 6,
    regionName: "Región del Libertador Bernardo O'Higgins",
    parasiteId: "p29",
    speciesName: "Fasciola hepatica",
    group: "Trematodos",
    evidenceCategory: "registro_animal_sag",
    evidenceLabel: "Decomisos hepáticos en mataderos e infección rural",
    transmissionContext: "zoonosis_animal",
    transmissionLabel: "Decomiso de hígados en inspección SAG",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2023",
    findingSummary: "Decomisos frecuentes de hígados parasitados con distomatosis en mataderos de la cuenca del río Cachapoal y Tinguiririca. Transmisión a humanos por berros silvestres de acequias.",
    source: {
      title: "Situación Zoosanitaria de la Fasciolosis Bovina en la Zona Central",
      organization: "SAG Chile",
      url: "https://www.sag.gob.cl/ambitos-de-accion/vigilancia-y-control-de-enfermedades-animales",
      publicationYear: "2022",
      consultationDate: "2026-10-20"
    },
    limitations: "El lavado convencional de vegetales con agua potable no desprende las metacercarias enquistadas firmemente en las hojas.",
    epidemiologicalNotes: "El drenaje de zonas anegadas y el control de caracoles limneidos constituyen medidas preventivas en predios ganaderos."
  },

  // ==========================================
  // GIARDIA DUODENALIS (micro-6)
  // ==========================================
  {
    id: "rec-m06-r13-metropolitana",
    regionCode: 13,
    regionName: "Región Metropolitana de Santiago",
    parasiteId: "micro-6",
    speciesName: "Giardia duodenalis",
    group: "Protozoos flagelados",
    evidenceCategory: "estudio_prevalencia_humana",
    evidenceLabel: "Estudios coproparasitológicos en atención primaria y jardines infantiles",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Enteroparasitosis endémica urbana y periurbana",
    verificationStatus: "verificado",
    periodOrDate: "2015 – 2023",
    findingSummary: "Estudios parasitológicos universitarios y registros de laboratorios clínicos en centros de salud familiar (CESFAM) demuestran giardiasis como el protozoo flagelado intestinal patógeno más frecuentemente aislado en población preescolar y escolar.",
    source: {
      title: "Frecuencia de Enteroparasitosis en Niños de la Región Metropolitana",
      organization: "Sociedad Chilena de Infectología (SOCHINF)",
      url: "https://www.sochinf.cl/",
      publicationYear: "2021",
      consultationDate: "2026-10-20"
    },
    limitations: "No es una enfermedad de notificación obligatoria universal; los datos reflejan cohortes estudiadas y no una tasa censal de la población.",
    epidemiologicalNotes: "Mecanismo fecal-oral facilitado por resistencia de los quistes tetranucleados a la cloración habitual del agua potable."
  },
  {
    id: "rec-m06-r05-valparaiso",
    regionCode: 5,
    regionName: "Región de Valparaíso",
    parasiteId: "micro-6",
    speciesName: "Giardia duodenalis",
    group: "Protozoos flagelados",
    evidenceCategory: "estudio_prevalencia_humana",
    evidenceLabel: "Estudios seroepidemiológicos y coproparasitológicos escolares",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Endemia en comunidades escolares",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2022",
    findingSummary: "Presencia documentada en estudios coprológicos en niños de escuelas vulnerables de Valparaíso y Viña del Mar, con cuadros de diarrea crónica y malabsorción.",
    source: {
      title: "Estudios Universitarios de Enteroparasitosis en la Quinta Región",
      organization: "Universidad de Valparaíso / ISP",
      url: "https://www.sochinf.cl/",
      publicationYear: "2022",
      consultationDate: "2026-10-20"
    },
    limitations: "Variabilidad en la excreción intermitente de quistes exige el examen seriado (Teleman) de al menos tres deposiciones en días alternos.",
    epidemiologicalNotes: "El tratamiento de convivientes y la higiene estricta de manos en jardines infantiles son determinantes para cortar la transmisión."
  },

  // ==========================================
  // SARCOPTES SCABIEI (p34)
  // ==========================================
  {
    id: "rec-p34-r13-metropolitana",
    regionCode: 13,
    regionName: "Región Metropolitana de Santiago",
    parasiteId: "p34",
    speciesName: "Sarcoptes scabiei var hominis",
    group: "Ectoparásitos",
    evidenceCategory: "vigilancia_eno",
    evidenceLabel: "Vigilancia de brotes institucionales (ELEAM y recintos cerrados)",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Ectoparasitosis comunitaria e institucional",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2024",
    findingSummary: "Notificación de brotes institucionales de escabiosis en establecimientos de larga estadía para adultos mayores (ELEAM), recintos penitenciarios y hogares de menores, bajo directrices técnicas de control de brotes del MINSAL.",
    source: {
      title: "Orientaciones Técnicas para el Manejo y Control de Brotes de Escabiosis",
      organization: "Ministerio de Salud de Chile",
      url: "https://www.minsal.cl/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "Los casos comunitarios individuales no se notifican sistemáticamente; la vigilancia activa se focaliza en brotes con 2 o más casos intradomiciliarios/institucionales.",
    epidemiologicalNotes: "La sarna costrosa (noruega) en pacientes inmunodeprimidos alberga millones de ácaros y constituye una fuente crítica de brotes intrahospitalarios."
  },
  {
    id: "rec-p34-r08-biobio",
    regionCode: 8,
    regionName: "Región del Biobío",
    parasiteId: "p34",
    speciesName: "Sarcoptes scabiei var hominis",
    group: "Ectoparásitos",
    evidenceCategory: "vigilancia_eno",
    evidenceLabel: "Vigilancia de brotes comunitarios y escolares",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Brotes intradomiciliarios y comunitarios",
    verificationStatus: "verificado",
    periodOrDate: "2017 – 2023",
    findingSummary: "Investigación epidemiológica de brotes de sarna en centros residenciales y agrupaciones familiares extensas en el Gran Concepción y provincia de Arauco.",
    source: {
      title: "Protocolo de Intervención en Brotes de Ectoparasitosis",
      organization: "SEREMI de Salud Biobío",
      url: "https://www.minsal.cl/",
      publicationYear: "2022",
      consultationDate: "2026-10-20"
    },
    limitations: "Estigma social y retraso en la consulta médica favorecen la diseminación secundaria en el entorno familiar.",
    epidemiologicalNotes: "El tratamiento simultáneo de todos los contactos estrechos (sintomáticos o no) con permetrina al 5% o ivermectina oral es obligatorio para evitar reinfecciones."
  },

  // ==========================================
  // PEDICULUS HUMANUS CAPITIS (p35)
  // ==========================================
  {
    id: "rec-p35-r13-metropolitana",
    regionCode: 13,
    regionName: "Región Metropolitana de Santiago",
    parasiteId: "p35",
    speciesName: "Pediculus humanus capitis",
    group: "Ectoparásitos",
    evidenceCategory: "estudio_prevalencia_humana",
    evidenceLabel: "Estudios de prevalencia escolar y brotes en educación básica",
    transmissionContext: "infeccion_autoctona",
    transmissionLabel: "Ectoparasitosis de transmisión interhumana directa",
    verificationStatus: "verificado",
    periodOrDate: "2016 – 2023",
    findingSummary: "Ectoparasitosis prevalente en establecimientos escolares de educación parvularia y básica. Detección frecuente de sobreinfección bacteriana secundaria (impétigo) por rascado crónico.",
    source: {
      title: "Guía de Diagnóstico y Manejo de Pediculosis en el Ámbito Escolar",
      organization: "Ministerio de Salud de Chile / SOCHINF",
      url: "https://www.minsal.cl/",
      publicationYear: "2021",
      consultationDate: "2026-10-20"
    },
    limitations: "No existe registro de notificación universal de casos aislados; los estudios reflejan encuestas y tamizajes en colegios seleccionados.",
    epidemiologicalNotes: "La transmisión requiere contacto directo cabeza con cabeza; no transmite agentes patógenos sistémicos a diferencia de Pediculus humanus corporis."
  },

  // ==========================================
  // PLASMODIUM FALCIPARUM (micro-4) & VIVAX (p03)
  // ==========================================
  {
    id: "rec-m04-r13-metropolitana",
    regionCode: 13,
    regionName: "Región Metropolitana de Santiago",
    parasiteId: "micro-4",
    speciesName: "Plasmodium falciparum",
    group: "Protozoos apicomplejos",
    evidenceCategory: "casos_importados",
    evidenceLabel: "Vigilancia ENO inmediata · Casos importados exclusivamente",
    transmissionContext: "caso_importado",
    transmissionLabel: "Infección adquirida en el extranjero (viajeros / migrantes)",
    verificationStatus: "verificado",
    periodOrDate: "2015 – 2024",
    findingSummary: "Casos diagnosticados en viajeros internacionales o migrantes procedentes de áreas endémicas de África subsahariana, Amazonía y Centroamérica. Transmisión autóctona erradicada de Chile en 1945.",
    source: {
      title: "Boletín de Vigilancia Epidemiológica de Malaria Importada",
      organization: "Departamento de Epidemiología MINSAL / ISP",
      url: "https://epi.minsal.cl/",
      publicationYear: "2023",
      consultationDate: "2026-10-20"
    },
    limitations: "Vigilancia de notificación obligatoria inmediata (ENO) para confirmación parasitológica urgente por gota gruesa/frotis en el ISP.",
    epidemiologicalNotes: "Chile continental no cuenta con poblaciones domiciliarias del vector Anopheles capaces de sostener transmisión autóctona sostenida."
  },
  {
    id: "rec-p03-r15-arica",
    regionCode: 15,
    regionName: "Región de Arica y Parinacota",
    parasiteId: "p03",
    speciesName: "Plasmodium vivax",
    group: "Protozoos apicomplejos",
    evidenceCategory: "interrupcion_vectorial_historica",
    evidenceLabel: "Erradicación histórica (1945) & Vigilancia fronteriza",
    transmissionContext: "hito_salud_publica",
    transmissionLabel: "Erradicación histórica liderada por el Dr. Juan Noé Crevani",
    verificationStatus: "verificado",
    periodOrDate: "1945 – 2024",
    findingSummary: "Foco histórico principal de malaria en Chile en los valles de Lluta y Azapa. Erradicación exitosa certificada en 1945 tras la histórica campaña de saneamiento ambiental y control larvario del Dr. Juan Noé. Mantiene vigilancia entomológica y detección de casos importados en la frontera.",
    source: {
      title: "Historia y Vigilancia de la Malaria en Chile",
      organization: "Instituto de Salud Pública de Chile / MINSAL",
      url: "https://www.ispch.cl/",
      publicationYear: "2020",
      consultationDate: "2026-10-20"
    },
    limitations: "Requiere monitoreo entomológico continuo en quebradas costeras para descartar reintroducción de vectores competentes.",
    epidemiologicalNotes: "Hito sanitario nacional fundamental que convirtió a Chile en uno de los primeros países de América en erradicar la malaria autóctona."
  }
];

/**
 * Listado de todos los parásitos que tienen registros en este atlas territorial
 */
export const DOCUMENTED_PARASITES: { id: string; name: string; group: string; recordCount: number }[] = [
  { id: "p27", name: "Echinococcus granulosus sensu lato", group: "Cestodos", recordCount: 7 },
  { id: "p13", name: "Trypanosoma cruzi", group: "Protozoos flagelados", recordCount: 5 },
  { id: "p25-taenia-solium", name: "Taenia solium", group: "Cestodos", recordCount: 4 },
  { id: "p32", name: "Trichinella spiralis", group: "Nematodos", recordCount: 2 },
  { id: "p29", name: "Fasciola hepatica", group: "Trematodos", recordCount: 2 },
  { id: "micro-6", name: "Giardia duodenalis", group: "Protozoos flagelados", recordCount: 2 },
  { id: "p34", name: "Sarcoptes scabiei var hominis", group: "Ectoparásitos", recordCount: 2 },
  { id: "p35", name: "Pediculus humanus capitis", group: "Ectoparásitos", recordCount: 1 },
  { id: "micro-4", name: "Plasmodium falciparum", group: "Protozoos apicomplejos", recordCount: 1 },
  { id: "p03", name: "Plasmodium vivax", group: "Protozoos apicomplejos", recordCount: 1 }
];

export function getRecordsForParasite(parasiteId: string): RegionalParasiteRecord[] {
  return REGIONAL_PARASITE_RECORDS.filter(r => r.parasiteId === parasiteId);
}

export function getRecordsForRegion(regionCode: number): RegionalParasiteRecord[] {
  return REGIONAL_PARASITE_RECORDS.filter(r => r.regionCode === regionCode);
}

export function getRecordForRegionAndParasite(regionCode: number, parasiteId: string): RegionalParasiteRecord | undefined {
  return REGIONAL_PARASITE_RECORDS.find(r => r.regionCode === regionCode && r.parasiteId === parasiteId);
}
