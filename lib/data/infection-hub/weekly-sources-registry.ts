/**
 * REGISTRO CENTRALIZADO DE FUENTES DOCUMENTALES DE CÁTEDRA (19 PDFs REALES)
 * 
 * Basado estrictamente en los 19 documentos oficiales del curso «Agentes Infecciosos»
 * (Tecnología Médica, Facultad de Medicina CAS-UDD, inventario_fuentes.json).
 * 
 * Registra títulos reales, autores, números de páginas verificados y temáticas,
 * sin inventar fechas de cátedra ni números de página de referencia cuando no están cotejados.
 * Los documentos no están publicados para descarga directa libre por propiedad intelectual.
 */

export type HubSectionKey = "fundamentos" | "metabolismo_cultivo" | "control_antimicrobianos" | "cuerpo_humano";

export interface WeeklyDocumentSource {
  id: string; // "doc-01" .. "doc-19"
  docNumber: number; // 1 .. 19
  code: string; // ej. "DOC-01", "DOC-18"
  fileName: string; // Nombre real del archivo PDF
  title: string; // Título real de la clase
  author?: string; // Docente a cargo
  totalPages: number; // Número real de páginas
  deliveryDate: string; // "No especificada" si no consta en las diapositivas
  pageVerificationStatus: "verificado_completo" | "fuente_pendiente_de_cotejo";
  assignedSections: HubSectionKey[];
  primarySubject: string;
  referencedTopics: string[];
  referencedAgentCodes: string[];
  downloadNotice: string;
  notes?: string;
}

export const WEEKLY_SOURCES_REGISTRY: WeeklyDocumentSource[] = [
  {
    id: "doc-01",
    docNumber: 1,
    code: "DOC-01",
    fileName: "1. Interacción humano-patógeno I Bacterias y virus_.pdf",
    title: "Interacción humano-patógeno I: Bacterias y virus",
    author: "TM. Felipe Córdova Lagos",
    totalPages: 34,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["fundamentos"],
    primarySubject: "Interacción huésped-patógeno, colonización vs infección, factores de virulencia bacterianos y ciclos replicativos virales",
    referencedTopics: ["Colonización vs infección", "Cadena de transmisión", "Factores de adherencia y cápsulas", "Ciclos lítico y lisogénico"],
    referencedAgentCodes: ["B01", "B02", "B03", "V01", "V08"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-02",
    docNumber: 2,
    code: "DOC-02",
    fileName: "2. Interacción humano-patógeno II Hongos y parásitos.pdf",
    title: "Interacción humano-patógeno II: Hongos y parásitos",
    author: "TM. Felipe Córdova Lagos",
    totalPages: 15,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["fundamentos"],
    primarySubject: "Mecanismos de transmisión, dimorfismo fúngico, ciclos biológicos parasitarios y evasión de respuesta inmune",
    referencedTopics: ["Vías de transmisión directa e indirecta", "Dimorfismo térmico fúngico", "Ciclos monoxénicos y heteroxénicos", "Evasión antigénica parasitaria"],
    referencedAgentCodes: ["H01", "H03", "H13", "P01", "P02", "P13"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-03",
    docNumber: 3,
    code: "DOC-03",
    fileName: "3. Morfología y taxonomía bacteriana.pdf",
    title: "Morfología y taxonomía bacteriana",
    author: "T.M. Gonzalo Soto Ojeda",
    totalPages: 37,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["fundamentos"],
    primarySubject: "Formas y agrupaciones bacterianas, estructura de pared celular Gram positiva y Gram negativa, tinción de Gram",
    referencedTopics: ["Cocos, bacilos y espirilos", "Pared celular y peptidoglicano", "Membrana externa y lipopolisacárido (LPS)", "Tinción diferencial de Gram"],
    referencedAgentCodes: ["B01", "B03", "B06", "B10", "B21"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-04",
    docNumber: 4,
    code: "DOC-04",
    fileName: "4. Morfología y taxonomía de los virus.pdf",
    title: "Morfología y taxonomía de los virus",
    author: "T.M. Gonzalo Soto Ojeda",
    totalPages: 34,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["fundamentos"],
    primarySubject: "Estructura del virión, cápside helicoidal e icosaédrica, envoltura lipídica, genomas virales y taxonomía",
    referencedTopics: ["Morfología y simetría viral", "Virus desnudos vs envueltos", "Clasificación Baltimore", "Tropismo celular"],
    referencedAgentCodes: ["V02", "V04", "V08", "V09", "V14", "V26"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-05",
    docNumber: 5,
    code: "DOC-05",
    fileName: "5. Morfología y taxonomía de los hongos.pdf",
    title: "Morfología y taxonomía de los hongos",
    author: "T.M. Gonzalo Soto Ojeda",
    totalPages: 37,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["fundamentos"],
    primarySubject: "Estructuras vegetativas y reproductivas fúngicas, levaduras, mohos filamentosos y criterios taxonómicos",
    referencedTopics: ["Pared celular fúngica (quitina, glucanos)", "Levaduras y pseudohifas", "Mohos e hifas septadas", "Esporas y conidios"],
    referencedAgentCodes: ["H01", "H03", "H09", "H21", "H28"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-06",
    docNumber: 6,
    code: "DOC-06",
    fileName: "6. Morfología y taxonomía de los parásitos.pdf",
    title: "Morfología y taxonomía de los parásitos",
    author: "T.M. Gonzalo Soto Ojeda",
    totalPages: 35,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["fundamentos"],
    primarySubject: "Generalidades de parásitos de importancia clínica, protozoos, helmintos y artrópodos vectores",
    referencedTopics: ["Interacción parásito-hospedero", "Protozoos intestinales y tisulares", "Nematodos, cestodos y trematodos", "Formas diagnósticas"],
    referencedAgentCodes: ["P01", "P02", "P07", "P11", "P19", "P25"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-07",
    docNumber: 7,
    code: "DOC-07",
    fileName: "7. Metabolismo bacteriano.pdf",
    title: "Metabolismo de bacterias, virus, hongos y parásitos",
    author: "T.M. Gonzalo Soto Ojeda",
    totalPages: 28,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["metabolismo_cultivo"],
    primarySubject: "Requerimientos bioenergéticos y nutricionales, respiración celular, fermentación y diseño de medios de cultivo",
    referencedTopics: ["Respiración aerobia vs anaerobia", "Vías de fermentación bacteriana", "Requerimientos de oxígeno y catalasa", "Medios nutritivos de aislamiento"],
    referencedAgentCodes: ["B01", "B02", "B10", "B18", "B20", "B32"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-08",
    docNumber: 8,
    code: "DOC-08",
    fileName: "8. Fisiología, estructuras y función bacteriana.pdf",
    title: "Fisiología, estructura y función celular en bacterias",
    author: "T.M. Gonzalo Soto Ojeda",
    totalPages: 30,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["metabolismo_cultivo"],
    primarySubject: "Estructuras celulares bacterianas, curva de crecimiento en cultivo cerrado, esporogénesis y biopelículas",
    referencedTopics: ["Fases de crecimiento (Lag, Log, Estacionaria, Muerte)", "Estructura de la endospora bacteriana", "Flagelos, fimbrias y cápsula", "Formación de biofilm"],
    referencedAgentCodes: ["B03", "B04", "B10", "B14", "B32"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-09",
    docNumber: 9,
    code: "DOC-09",
    fileName: "9. Métodos para eliminar microorganismos.pdf",
    title: "Métodos para eliminar microorganismos",
    author: "TM Sara Morales R.",
    totalPages: 28,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["control_antimicrobianos"],
    primarySubject: "Procedimientos de esterilización, desinfección, niveles de Spaulding y uso de antisépticos en atención de salud",
    referencedTopics: ["Esterilización por calor húmedo (autoclave)", "Desinfección de alto, intermedio y bajo nivel", "Niveles de Spaulding (crítico, semicrítico, no crítico)", "Antisepsia cutánea y lavado clínico"],
    referencedAgentCodes: ["B02", "B03", "B32", "B33"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-10",
    docNumber: 10,
    code: "DOC-10",
    fileName: "10-Antimicrobianos.pdf",
    title: "Antimicrobianos",
    author: "TM Sara Morales R.",
    totalPages: 39,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["control_antimicrobianos"],
    primarySubject: "Familias de antimicrobianos, dianas terapéuticas, mecanismos moleculares de resistencia e interpretación de susceptibilidad",
    referencedTopics: ["Inhibición de pared celular y PBPs", "Inhibición ribosomal 30S y 50S", "Mecanismos de resistencia enzimática (BLEE, carbapenemasas)", "Estudios de susceptibilidad y antibiograma"],
    referencedAgentCodes: ["B01", "B02", "B03", "B09", "B10", "B11", "B13"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-11",
    docNumber: 11,
    code: "DOC-11",
    fileName: "11- Clase Microbiota-Microbioma.pdf",
    title: "Microbiota y Microbioma",
    author: "TM Sara Morales R.",
    totalPages: 34,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["cuerpo_humano"],
    primarySubject: "Microbiota comensal en humanos, colonización neonatal, nichos corporales y diferenciación con infección",
    referencedTopics: ["Colonización vs infección", "Microbiota por nicho anatómico", "Funciones metabólicas e inmunes del microbioma", "Factores de disbiosis"],
    referencedAgentCodes: ["B03", "B04", "B10", "H03", "H33"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-12",
    docNumber: 12,
    code: "DOC-12",
    fileName: "12. Infección de piel y tejidos blandos.pdf",
    title: "Infección de la piel y tejidos blandos",
    author: "TM Sara Morales R.",
    totalPages: 29,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["cuerpo_humano"],
    primarySubject: "Infecciones bacterianas y micóticas de la piel, celulitis, erisipela, fascitis necrotizante y prevención",
    referencedTopics: ["Patología por S. aureus y S. pyogenes", "Celulitis vs erisipela", "Infecciones de heridas quirúrgicas", "Toma de muestras cutáneas"],
    referencedAgentCodes: ["B02", "B03", "B06", "H28", "H33"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-13",
    docNumber: 13,
    code: "DOC-13",
    fileName: "13. Infecciones del sistema respiratorio superior.pdf",
    title: "Infecciones del sistema respiratorio superior",
    author: "TM. Felipe Córdova Lagos",
    totalPages: 25,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["cuerpo_humano"],
    primarySubject: "Anatomía de vías respiratorias superiores, rinitis, sinusitis, otitis media y faringoamigdalitis aguda",
    referencedTopics: ["Faringitis estreptocócica y criterios de Centor", "Infecciones virales respiratorias altas", "Hisopado faríngeo y cultivo", "Complicaciones postestreptocócicas"],
    referencedAgentCodes: ["B01", "B06", "B23", "V08", "V09", "V17"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-14",
    docNumber: 14,
    code: "DOC-14",
    fileName: "14. Infecciones del sistema respiratorio inferior.pdf",
    title: "Infecciones del sistema respiratorio inferior",
    author: "TM. Felipe Córdova Lagos",
    totalPages: 18,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["cuerpo_humano"],
    primarySubject: "Neumonía adquirida en la comunidad (NAC) típica y atípica, bronquitis aguda y criterios de calidad de esputo",
    referencedTopics: ["Neumonía por S. pneumoniae", "Patógenos respiratorios atípicos (Mycoplasma, Legionella)", "Criterios citológicos de Murray-Washington", "Pruebas de antígeno urinario"],
    referencedAgentCodes: ["B01", "B23", "B27", "B28", "B29", "V02", "V05"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-15",
    docNumber: 15,
    code: "DOC-15",
    fileName: "15. Rol del TM de Morfo en Inf. respiratorias.pdf",
    title: "Rol del Tecnólogo Médico de Morfofisiopatología y Citodiagnóstico en Infecciones Respiratorias",
    author: "TM. María José Rojas",
    totalPages: 32,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["cuerpo_humano"],
    primarySubject: "Manejo y procesamiento citológico e histopatológico de muestras respiratorias, tinciones especiales y control de calidad",
    referencedTopics: ["Conservación y fijación de biopsias y cepillados", "Tinciones especiales (Grocott, Ziehl-Neelsen, PAS)", "Citodiagnóstico de infecciones oportunistas", "Bioseguridad en el laboratorio de anatomía patológica"],
    referencedAgentCodes: ["B27", "H12", "V08", "V16"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-16",
    docNumber: 16,
    code: "DOC-16",
    fileName: "16-Infección del tracto urinario (ITU).pdf",
    title: "Infección del tracto urinario (ITU)",
    author: "TM Sara Morales R.",
    totalPages: 30,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["cuerpo_humano"],
    primarySubject: "Epidemiología de las ITU, cistitis, pielonefritis, factores de virulencia de uropatógenos y metodología del urocultivo",
    referencedTopics: ["Vía de infección ascendente", "Factores de patogenicidad de UPEC", "Toma de muestra de orina de segundo chorro", "Interpretación cuantitativa de urocultivo (criterios de Kass)"],
    referencedAgentCodes: ["B05", "B08", "B10", "B11", "B14"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-17",
    docNumber: 17,
    code: "DOC-17",
    fileName: "17-Infecciones de transmisión sexual(ITS).pdf",
    title: "Infecciones de Transmisión Sexual (ITS)",
    author: "TM Sara Morales R.",
    totalPages: 37,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["cuerpo_humano"],
    primarySubject: "Procesos infectocontagiosos de transmisión sexual, secreción uretral, cervicitis, úlceras genitales y diagnóstico",
    referencedTopics: ["Gonococo y clamidia: diagnóstico por NAAT y Thayer-Martin", "Sífilis (Treponema pallidum) y serología treponémica/no treponémica", "Herpes genital (VHS-1 y VHS-2)", "Virus del papiloma humano y lesiones verrugosas"],
    referencedAgentCodes: ["B22", "B30", "B31", "V14", "V15", "V19"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-18",
    docNumber: 18,
    code: "DOC-18",
    fileName: "18. Infecciones gastrointestinales.pdf",
    title: "Infecciones gastrointestinales",
    author: "T.M. Gonzalo Soto Ojeda",
    totalPages: 37,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["cuerpo_humano"],
    primarySubject: "Gastroenteritis bacterianas y virales, mecanismos enteroinvasivos y enterotoxigénicos, coprocultivo y detección molecular",
    referencedTopics: ["Diarrea acuosa vs disentería inflamatoria", "Salmonella enterica, Shigella sonnei y Campylobacter jejuni", "Escherichia coli diarreogénica (ETEC, STEC, EPEC)", "Rotavirus A y gastroenteritis viral pediátrica"],
    referencedAgentCodes: ["B10", "B16", "B17", "B18", "B19", "B20", "V26", "V27"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-19",
    docNumber: 19,
    code: "DOC-19",
    fileName: "19. Infecciones gastrointestinales por otros agentes infecciosos.pdf",
    title: "Infecciones gastrointestinales por otros agentes infecciosos",
    author: "T.M. Gonzalo Soto Ojeda",
    totalPages: 32,
    deliveryDate: "No especificada",
    pageVerificationStatus: "fuente_pendiente_de_cotejo",
    assignedSections: ["cuerpo_humano"],
    primarySubject: "Infecciones gastrointestinales por hongos y parásitos entéricos, protozoos, helmintos y examen coproparasitológico",
    referencedTopics: ["Candidiasis digestiva", "Protozoosis: Giardia duodenalis, Entamoeba histolytica, Cryptosporidium", "Helmintiasis: Ascaris lumbricoides, Enterobius vermicularis, Taenia solium", "Métodos de concentración y diagnóstico coproparasitológico"],
    referencedAgentCodes: ["H03", "P02", "P07", "P08", "P19", "P20", "P25"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-20",
    docNumber: 20,
    code: "DOC-20",
    fileName: "20. Infecciones hepáticas.pdf",
    title: "Infecciones hepáticas",
    author: "TM. Felipe Córdova Lagos",
    totalPages: 25,
    deliveryDate: "Carga Canvas: 26/10/2026",
    pageVerificationStatus: "verificado_completo",
    assignedSections: ["cuerpo_humano"],
    primarySubject: "Hepatitis virales (VHA a VHE), marcadores serológicos de VHB, cronicidad en VHC, parasitosis hepatobiliares y abscesos hepáticos",
    referencedTopics: ["Fases de hepatitis aguda e ictericia", "Marcadores serológicos y moleculares de hepatitis B", "Diagnóstico de hepatitis C (Anti-VHC y ARN)", "Fasciola hepatica y Echinococcus granulosus"],
    referencedAgentCodes: ["V21", "V22", "V23", "V24", "V25", "V17", "V18", "P21", "P26"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  },
  {
    id: "doc-21",
    docNumber: 21,
    code: "DOC-21",
    fileName: "21. Infecciones intravasculares.pdf",
    title: "Infecciones intravasculares",
    author: "TM. Felipe Córdova Lagos",
    totalPages: 26,
    deliveryDate: "Carga Canvas: 26/10/2026",
    pageVerificationStatus: "verificado_completo",
    assignedSections: ["cuerpo_humano", "fundamentos"],
    primarySubject: "Bacteriemia, sepsis y shock séptico, endocarditis infecciosa, infecciones asociadas a catéteres, parasitismo hemático (Chagas y malaria) y shock tóxico",
    referencedTopics: ["Bacteriemia vs Sepsis vs Shock", "Endocarditis y vegetaciones valvulares", "Catéteres vasculares y biofilm", "Chagas (Trypanosoma cruzi) y fases", "Malaria (Plasmodium spp.) en sangre periférica", "Superantígenos y toxina Shiga"],
    referencedAgentCodes: ["B03", "B04", "B06", "B08", "B10", "P01", "P03"],
    downloadNotice: "Documento de cátedra interna UDD. No disponible para descarga directa por protección de derechos institucionales."
  }
];

/**
 * Normaliza claves de apartado para evitar desacoples de nomenclatura.
 */
function normalizeSectionKey(key: string): HubSectionKey | "all" {
  if (key === "metabolismo") return "metabolismo_cultivo";
  if (key === "control") return "control_antimicrobianos";
  if (key === "cuerpo-humano") return "cuerpo_humano";
  return key as any;
}

/**
 * Helper para obtener los documentos asignados a un apartado formativo específico.
 */
export function getSourcesForSection(sectionKey: string | "all"): WeeklyDocumentSource[] {
  const normalized = normalizeSectionKey(sectionKey);
  if (normalized === "all") {
    return WEEKLY_SOURCES_REGISTRY;
  }
  return WEEKLY_SOURCES_REGISTRY.filter((s) => s.assignedSections.includes(normalized as HubSectionKey));
}

/**
 * Helper para buscar documentos por texto libre en título, autor, temáticas o nombre de archivo.
 */
export function searchSources(query: string): WeeklyDocumentSource[] {
  if (!query || !query.trim()) return WEEKLY_SOURCES_REGISTRY;
  const q = query.toLowerCase().trim();
  return WEEKLY_SOURCES_REGISTRY.filter((s) =>
    s.title.toLowerCase().includes(q) ||
    s.fileName.toLowerCase().includes(q) ||
    (s.author && s.author.toLowerCase().includes(q)) ||
    s.primarySubject.toLowerCase().includes(q) ||
    s.referencedTopics.some((t) => t.toLowerCase().includes(q)) ||
    s.referencedAgentCodes.some((c) => c.toLowerCase().includes(q))
  );
}

/**
 * Helper para obtener un documento por su código estable o número de orden.
 */
export function getSourceByCode(codeOrId: string): WeeklyDocumentSource | undefined {
  const clean = codeOrId.toLowerCase().trim();
  return WEEKLY_SOURCES_REGISTRY.find(
    (s) => s.id.toLowerCase() === clean || s.code.toLowerCase() === clean
  );
}
