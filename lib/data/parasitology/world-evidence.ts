/**
 * EVIDENCIA EPIDEMIOLÓGICA INTERNACIONAL & AMÉRICA LATINA
 * Fuente oficial: Organización Panamericana de la Salud (OPS) / OMS
 * Centros para el Control y la Prevención de Enfermedades (CDC)
 * Ministerios de Salud de América Latina y publicaciones indexadas (PLOS NTDs, Lancet ID)
 *
 * NOTA DE RIGOR EPIDEMIOLÓGICO:
 * La ausencia de datos en un país no certifica la ausencia del patógeno, salvo en casos
 * formalmente evaluados y certificados por comités de expertos de la OMS/OPS.
 */

export type WorldEvidenceCategory =
  | "endemico_alta_carga"
  | "endemico_focos_regionales"
  | "interrupcion_eliminacion"
  | "vigilancia_casos_importados"
  | "libre_sin_transmision";

export interface WorldParasiteInfo {
  id: string;
  name: string;
  commonName: string;
  group: string;
  whoCategory: string; // e.g., "ETD Prioritaria OMS 2030"
  description: string;
}

export interface WorldParasiteRecord {
  countryCode: string; // ISO 3166-1 alpha-3 (e.g. "BOL", "CHL", "BRA", "PER")
  countryName: string;
  countryNameEs: string;
  isLatAm: boolean;
  parasiteId: string;
  speciesName: string;
  evidenceCategory: WorldEvidenceCategory;
  evidenceLabel: string;
  epidemiologicalStatus: string;
  casesOrPrevalence: string;
  vectorsOrIntermediateHosts?: string;
  keyRegionsOrEndemicAreas: string;
  publicHealthMeasures: string;
  limitations: string;
  source: string;
  sourceUrl?: string;
  referenceYear: string;
}

export const WORLD_DOCUMENTED_PARASITES: WorldParasiteInfo[] = [
  {
    id: "p13-trypanosoma-cruzi",
    name: "Trypanosoma cruzi",
    commonName: "Enfermedad de Chagas",
    group: "Protozoo flagelado hemotisular",
    whoCategory: "ETD Prioritaria OMS (Hoja de ruta 2030)",
    description: "Zoonosis parasitaria exclusiva del continente americano en su transmisión vectorial natural, con casos crónicos e importados por migración en Europa y Norteamérica."
  },
  {
    id: "p01-plasmodium-spp",
    name: "Plasmodium spp.",
    commonName: "Malaria / Paludismo (P. falciparum, P. vivax)",
    group: "Protozoo apicomplejo hemotisular",
    whoCategory: "Enfermedad de Alta Carga Global (Estratégica OMS)",
    description: "Infección parasitaria transmitida por mosquitos Anopheles. P. falciparum predomina en África subsahariana y P. vivax en América Latina y Asia."
  },
  {
    id: "p07-leishmania-spp",
    name: "Leishmania spp.",
    commonName: "Leishmaniasis (Cutánea, Mucocutánea y Visceral)",
    group: "Protozoo flagelado hemoflagelado",
    whoCategory: "ETD Prioritaria OMS (Meta de eliminación 2030)",
    description: "Transmitida por flebótomos (Lutzomyia en el Nuevo Mundo, Phlebotomus en el Viejo Mundo). Causa desde úlceras cutáneas desfigurantes hasta leishmaniasis visceral mortal."
  },
  {
    id: "p25-taenia-solium",
    name: "Taenia solium",
    commonName: "Neurocisticercosis y Teniasis",
    group: "Platelminto cestodo",
    whoCategory: "ETD Prioritaria de Transmisión por Alimentos OMS",
    description: "Causa principal del 30% al 50% de las epilepsias adquiridas del adulto en áreas endémicas rurales de América Latina, África y Asia."
  },
  {
    id: "p27-echinococcus-granulosus",
    name: "Echinococcus granulosus sensu lato",
    commonName: "Equinococosis Quística / Hidatidosis",
    group: "Platelminto cestodo ciclozoonótico",
    whoCategory: "Zoonosis Desatendida OMS / OPS",
    description: "Zoonosis mantenida por el ciclo perro-ganado ovino/bovino. Endémica en el Cono Sur americano, cuenca mediterránea y Asia central."
  },
  {
    id: "p21-schistosoma-mansoni",
    name: "Schistosoma mansoni / haematobium",
    commonName: "Esquistosomiasis / Bilharziasis",
    group: "Platelminto trematodo intravascular",
    whoCategory: "ETD Prioritaria OMS con metas de quimioterapia preventiva",
    description: "Helmintiasis transmitida por contacto con agua dulce infestada con caracoles Biomphalaria/Bulinus. Endémica en Brasil, Caribe y África subsahariana."
  },
  {
    id: "p20-fasciola-hepatica",
    name: "Fasciola hepatica",
    commonName: "Fascioliasis hepática",
    group: "Platelminto trematodo hepatobiliar",
    whoCategory: "Trematodiasis de transmisión alimentaria OMS",
    description: "Zoonosis de rumiantes que afecta al ser humano al ingerir plantas acuáticas con metacercarias. El Altiplano boliviano-peruano posee las mayores prevalencias mundiales."
  },
  {
    id: "p32-ascaris-lumbricoides",
    name: "Ascaris lumbricoides & Geohelmintos",
    commonName: "Geohelmintiasis (STH - Ascaris, Trichuris, Anquilostomas)",
    group: "Nematodos intestinales transmitidos por el suelo",
    whoCategory: "ETD Prioritaria de Cobertura Masiva OMS",
    description: "Afecta a más de 1.500 millones de personas a nivel mundial, asociada a pobreza, saneamiento deficitario y desnutrición infantil."
  }
];

export const WORLD_PARASITE_RECORDS: WorldParasiteRecord[] = [
  // =========================================================================
  // TRYPANOSOMA CRUZI (CHAGAS)
  // =========================================================================
  {
    countryCode: "BOL",
    countryName: "Bolivia",
    countryNameEs: "Bolivia",
    isLatAm: true,
    parasiteId: "p13-trypanosoma-cruzi",
    speciesName: "Trypanosoma cruzi",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Máxima seroprevalencia mundial (Gran Chaco)",
    epidemiologicalStatus: "Endemia crítica con transmisión vectorial y congénita activa",
    casesOrPrevalence: "Seroprevalencia nacional estimada entre 6% y 10%; en zonas rurales del Gran Chaco (Chuquisaca, Tarija, Santa Cruz) supera el 20-35% en adultos.",
    vectorsOrIntermediateHosts: "Triatoma infestans ('vinchuca' domiciliaria y silvestre)",
    keyRegionsOrEndemicAreas: "Departamentos de Tarija, Chuquisaca, Cochabamba y Santa Cruz (Área chaqueña y valles interandinos)",
    publicHealthMeasures: "Tamizaje prenatal obligatorio nacional, tratamiento con benznidazol/nifurtimox y rociado residual de insecticidas en viviendas rurales.",
    limitations: "Infraestructura precaria en zonas rurales dispersas, con presencia de vinchucas silvestres que recolonizan las viviendas tratadas.",
    source: "OPS/OMS · Programa Nacional de Chagas de Bolivia · CDC",
    sourceUrl: "https://www.paho.org/es/temas/enfermedad-chagas",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "ARG",
    countryName: "Argentina",
    countryNameEs: "Argentina",
    isLatAm: true,
    parasiteId: "p13-trypanosoma-cruzi",
    speciesName: "Trypanosoma cruzi",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Endemia activa en región norte (Gran Chaco)",
    epidemiologicalStatus: "Transmisión vectorial activa en provincias del norte; certificación de interrupción en provincias centrales y sur",
    casesOrPrevalence: "Estimado de 1.5 millones de personas infectadas en Argentina (~300.000 con cardiopatía chagásica activa).",
    vectorsOrIntermediateHosts: "Triatoma infestans",
    keyRegionsOrEndemicAreas: "Provincias de Santiago del Estero, Chaco, Formosa, Salta, San Juan y Catamarca",
    publicHealthMeasures: "Tamizaje universal en donantes de sangre y embarazadas (Ley 26.281), vigilancia serológica de recién nacidos de madres seropositivas.",
    limitations: "Subnotificación de Chagas crónico asintomático y dispersión de comunidades originarias en el monte chaqueño.",
    source: "Ministerio de Salud de la Nación Argentina / OPS",
    sourceUrl: "https://www.argentina.gob.ar/salud/chagas",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "BRA",
    countryName: "Brazil",
    countryNameEs: "Brasil",
    isLatAm: true,
    parasiteId: "p13-trypanosoma-cruzi",
    speciesName: "Trypanosoma cruzi",
    evidenceCategory: "endemico_focos_regionales",
    evidenceLabel: "Transmisión oral en Amazonía y Chagas crónico",
    epidemiologicalStatus: "Interrupción de T. infestans domiciliario (2006); emergencia de brotes de transmisión oral por açaí y caña de azúcar en Amazonía",
    casesOrPrevalence: "Alrededor de 1.0 a 1.2 millones de portadores crónicos; 150-350 casos agudos anuales por transmisión oral en Pará, Amapá y Amazonas.",
    vectorsOrIntermediateHosts: "Panstrongylus megistus, Rhodnius prolixus, Triatoma brasiliensis",
    keyRegionsOrEndemicAreas: "Región Norte (Amazonía: Pará, Amapá) para transmisión oral; Minas Gerais, Bahia y Goiás para Chagas crónico",
    publicHealthMeasures: "Pasteurización y buenas prácticas en la pulpa de açaí, tamizaje serológico en 100% de hemocentros.",
    limitations: "La transmisión oral en selva tropical ocurre de forma esporádica e impredecible por contaminación accidental de alimentos.",
    source: "Ministério da Saúde do Brasil · Secretaria de Vigilância em Saúde",
    sourceUrl: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/doenca-de-chagas",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "CHL",
    countryName: "Chile",
    countryNameEs: "Chile",
    isLatAm: true,
    parasiteId: "p13-trypanosoma-cruzi",
    speciesName: "Trypanosoma cruzi",
    evidenceCategory: "interrupcion_eliminacion",
    evidenceLabel: "Interrupción vectorial certificada OPS 1999",
    epidemiologicalStatus: "Sin transmisión vectorial intradomiciliaria desde 1999; vigilancia focalizada en tamizaje gestacional (transmisión vertical) y donantes",
    casesOrPrevalence: "Seroprevalencia nacional en bancos de sangre < 0.25%. Casos notificados corresponden a infección adquirida previo a 1999 o transmisión congénita.",
    vectorsOrIntermediateHosts: "Triatoma infestans (intradomiciliario interrumpido), Mepraia spinolai y M. gajardoi (silvestres)",
    keyRegionsOrEndemicAreas: "Norte Grande hasta O'Higgins (Regiones XV, I, II, III, IV, V, RM y VI)",
    publicHealthMeasures: "Tamizaje obligatorio al 100% de donantes de sangre y en el control prenatal primario; tratamiento gratuito a recién nacidos.",
    limitations: "Presencia constante de vinchucas silvestres (Mepraia) en quebradas y pircas, sin adaptación al interior de la vivienda urbana.",
    source: "MINSAL Chile · Departamento de Epidemiología / ISP",
    sourceUrl: "https://epi.minsal.cl/",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "PER",
    countryName: "Peru",
    countryNameEs: "Perú",
    isLatAm: true,
    parasiteId: "p13-trypanosoma-cruzi",
    speciesName: "Trypanosoma cruzi",
    evidenceCategory: "endemico_focos_regionales",
    evidenceLabel: "Focos endémicos en sur andino (Arequipa/Moquegua)",
    epidemiologicalStatus: "Endemia focal en valles áridos del sur y focos selváticos en la cuenca del Marañón",
    casesOrPrevalence: "Infestación domiciliaria urbana por T. infestans en Arequipa y Moquegua; prevalencias del 1% al 3% en zonas periurbanas históricas.",
    vectorsOrIntermediateHosts: "Triatoma infestans (sur), Panstrongylus herreri (norte selva)",
    keyRegionsOrEndemicAreas: "Departamentos de Arequipa, Moquegua, Tacna, Ica, Cajamarca y Amazonas",
    publicHealthMeasures: "Campañas masivas de rociado en distritos periurbanos de Arequipa, tamizaje en bancos de sangre.",
    limitations: "Rápida expansión de asentamientos precarios en cerros y torrenteras de Arequipa que dificultan el rociado completo.",
    source: "MINSA Perú · Centro Nacional de Epidemiología (CDC Perú) / OPS",
    sourceUrl: "https://www.dge.gob.pe/",
    referenceYear: "2023"
  },
  {
    countryCode: "COL",
    countryName: "Colombia",
    countryNameEs: "Colombia",
    isLatAm: true,
    parasiteId: "p13-trypanosoma-cruzi",
    speciesName: "Trypanosoma cruzi",
    evidenceCategory: "endemico_focos_regionales",
    evidenceLabel: "Vigilancia en llanos y cordillera oriental",
    epidemiologicalStatus: "Transmisión vectorial por Rhodnius prolixus y brotes de transmisión oral",
    casesOrPrevalence: "Aproximadamente 430.000 portadores crónicos; certificación de corte vectorial en más de 60 municipios andinos.",
    vectorsOrIntermediateHosts: "Rhodnius prolixus (asociado a palmeras de Attalea), Triatoma dimidiata",
    keyRegionsOrEndemicAreas: "Departamentos de Casanare, Arauca, Boyacá, Santander, Norte de Santander y Cundinamarca",
    publicHealthMeasures: "Certificación municipal de interrupción vectorial domiciliaria y tamizaje materno-infantil.",
    limitations: "Poblaciones de vectores asociadas a palmas silvestres que vuelan hacia viviendas cercanas atraídas por la luz.",
    source: "Instituto Nacional de Salud (INS) Colombia / OPS",
    sourceUrl: "https://www.ins.gov.co/",
    referenceYear: "2023"
  },
  {
    countryCode: "MEX",
    countryName: "Mexico",
    countryNameEs: "México",
    isLatAm: true,
    parasiteId: "p13-trypanosoma-cruzi",
    speciesName: "Trypanosoma cruzi",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Amplia diversidad vectorial y alta carga en sur",
    epidemiologicalStatus: "Transmisión vectorial activa con más de 30 especies de triatóminos",
    casesOrPrevalence: "Estimado de 1.1 a 1.8 millones de personas infectadas; seroprevalencia de 1.5% a 4% en zonas rurales del Golfo y Pacífico.",
    vectorsOrIntermediateHosts: "Triatoma dimidiata, Triatoma barberi, Triatoma phyllosoma, Meccus pallidipennis",
    keyRegionsOrEndemicAreas: "Estados de Veracruz, Oaxaca, Chiapas, Yucatán, Morelos, Guerrero y Jalisco",
    publicHealthMeasures: "Tamizaje obligatorio en bancos de sangre (desde 2007), control vectorial en áreas prioritarias.",
    limitations: "Gran diversidad de vectores con comportamiento tanto doméstico como peridoméstico y silvestre.",
    source: "Secretaría de Salud de México · CENAPRECE / OPS",
    sourceUrl: "https://www.gob.mx/salud/cenaprece",
    referenceYear: "2023"
  },
  {
    countryCode: "USA",
    countryName: "United States",
    countryNameEs: "Estados Unidos",
    isLatAm: false,
    parasiteId: "p13-trypanosoma-cruzi",
    speciesName: "Trypanosoma cruzi",
    evidenceCategory: "vigilancia_casos_importados",
    evidenceLabel: "Casos importados por migración y ciclos silvestres",
    epidemiologicalStatus: "Más de 300.000 portadores crónicos por migración desde América Latina; casos autóctonos muy raros en el sur",
    casesOrPrevalence: "Estimado de 300.000 a 350.000 personas con Chagas crónico; tamizaje sanguíneo detecta ~1 de cada 27.500 donantes.",
    vectorsOrIntermediateHosts: "Triatoma sanguisuga, Triatoma gerstaeckeri (vectores silvestres de baja defecación en la picadura)",
    keyRegionsOrEndemicAreas: "Casos crónicos en California, Texas, Florida y Nueva York; vectores silvestres en Texas, Arizona y Nuevo México",
    publicHealthMeasures: "Tamizaje universal de donantes de sangre y órganos por la FDA desde 2007; acceso a benznidazol mediante el CDC.",
    limitations: "Falta de programas sistemáticos de tamizaje prenatal para Chagas en la mayoría de los estados.",
    source: "Centers for Disease Control and Prevention (CDC) / FDA",
    sourceUrl: "https://www.cdc.gov/parasites/chagas/",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "ESP",
    countryName: "Spain",
    countryNameEs: "España",
    isLatAm: false,
    parasiteId: "p13-trypanosoma-cruzi",
    speciesName: "Trypanosoma cruzi",
    evidenceCategory: "vigilancia_casos_importados",
    evidenceLabel: "Mayor carga de Chagas crónico en Europa",
    epidemiologicalStatus: "Sin vectores autóctonos; vigilancia estricta de transmisión vertical, transfusional y en donación de órganos",
    casesOrPrevalence: "Estimado de 50.000 a 70.000 personas de origen latinoamericano viviendo con Chagas crónico en España.",
    vectorsOrIntermediateHosts: "Sin vectores biológicos en Europa (no hay triatóminos)",
    keyRegionsOrEndemicAreas: "Comunidades de Madrid, Cataluña, Comunidad Valenciana, Murcia y Andalucía",
    publicHealthMeasures: "Cribado sistemático en bancos de sangre (Real Decreto 1088/2005) y protocolos de cribado gestacional en comunidades autónomas.",
    limitations: "Población no diagnosticada que no accede a consultas especializadas por falta de síntomas iniciales.",
    source: "Ministerio de Sanidad de España · Instituto de Salud Carlos III",
    sourceUrl: "https://www.isciii.es/",
    referenceYear: "2023 - 2024"
  },

  // =========================================================================
  // PLASMODIUM SPP. (MALARIA / PALUDISMO)
  // =========================================================================
  {
    countryCode: "BRA",
    countryName: "Brazil",
    countryNameEs: "Brasil",
    isLatAm: true,
    parasiteId: "p01-plasmodium-spp",
    speciesName: "Plasmodium vivax / P. falciparum",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Alta carga en cuenca amazónica (99% nacional)",
    epidemiologicalStatus: "Endemia amazónica activa; 85% P. vivax y 15% P. falciparum",
    casesOrPrevalence: "Aproximadamente 130.000 a 150.000 casos anuales reportados por SIVEP-Malária, concentrados en poblaciones indígenas y minería ilegal.",
    vectorsOrIntermediateHosts: "Anopheles darlingi, Anopheles albitarsis",
    keyRegionsOrEndemicAreas: "Estados de Amazonas, Roraima, Pará, Acre, Amapá y Rondônia",
    publicHealthMeasures: "Diagnóstico rápido y microscopía gratuita en puestos de salud fluviales, tratamiento con artemisininas y tafenoquina/primaquina.",
    limitations: "La minería informal y campamentos selváticos móviles generan brotes intensos de difícil cobertura sanitaria.",
    source: "Ministério da Saúde do Brasil · SIVEP-Malária / OPS",
    sourceUrl: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/m/malaria",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "VEN",
    countryName: "Venezuela",
    countryNameEs: "Venezuela",
    isLatAm: true,
    parasiteId: "p01-plasmodium-spp",
    speciesName: "Plasmodium vivax / P. falciparum",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Foco hiperendémico en el Arco Minero del Orinoco",
    epidemiologicalStatus: "Mayor foco de transmisión de malaria en América Latina durante la última década",
    casesOrPrevalence: "Históricamente más de 200.000 a 400.000 casos anuales entre 2017-2022; reducción reciente por intervenciones con apoyo de OPS/Global Fund.",
    vectorsOrIntermediateHosts: "Anopheles darlingi",
    keyRegionsOrEndemicAreas: "Estado Bolívar (Sifontes, Gran Sabana), Amazonas y Sucre",
    publicHealthMeasures: "Distribución masiva de mosquiteros tratados con insecticida y pruebas rápidas con apoyo internacional.",
    limitations: "Inestabilidad socioeconómica y minería informal en zonas de selva virgen con migración transfronteriza a Brasil y Guyana.",
    source: "OPS/OMS · Reporte Mundial sobre la Malaria 2023",
    sourceUrl: "https://www.who.int/teams/global-malaria-programme/reports/world-malaria-report-2023",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "PER",
    countryName: "Peru",
    countryNameEs: "Perú",
    isLatAm: true,
    parasiteId: "p01-plasmodium-spp",
    speciesName: "Plasmodium vivax / P. falciparum",
    evidenceCategory: "endemico_focos_regionales",
    evidenceLabel: "Foco principal en Loreto (Selva Amazónica)",
    epidemiologicalStatus: "Más del 85% de los casos nacionales ocurren en Loreto; P. vivax representa > 80% de los diagnósticos",
    casesOrPrevalence: "Entre 20.000 y 35.000 casos anuales confirmados por gota gruesa y PDR.",
    vectorsOrIntermediateHosts: "Anopheles darlingi, Anopheles benarrochi",
    keyRegionsOrEndemicAreas: "Departamento de Loreto (cuencas del río Pastaza, Corrientes, Tigre y Marañón)",
    publicHealthMeasures: "Plan 'Malaria Cero' en Loreto con promotores comunitarios fluviales de salud indígena.",
    limitations: "Extensas distancias de navegación fluvial y recaídas tardías por hipnozoítos de P. vivax.",
    source: "MINSA Perú · Centro Nacional de Epidemiología / OPS",
    sourceUrl: "https://www.dge.gob.pe/",
    referenceYear: "2023"
  },
  {
    countryCode: "COL",
    countryName: "Colombia",
    countryNameEs: "Colombia",
    isLatAm: true,
    parasiteId: "p01-plasmodium-spp",
    speciesName: "Plasmodium vivax / P. falciparum",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Endemia en costa Pacífica y Bajo Cauca",
    epidemiologicalStatus: "Transmisión persistente en selva pacífica y zonas auríferas",
    casesOrPrevalence: "Entre 60.000 y 85.000 casos anuales reportados al SIVIGILA; P. vivax (~60%) y P. falciparum (~40%).",
    vectorsOrIntermediateHosts: "Anopheles darlingi, Anopheles nuneztovari, Anopheles albimanus",
    keyRegionsOrEndemicAreas: "Departamentos de Chocó, Antioquia (Bajo Cauca), Nariño, Córdoba y Valle del Cauca",
    publicHealthMeasures: "Diagnóstico microscópico en red de puestos de salud locales, mosquiteros con insecticida.",
    limitations: "Conflicto armado en zonas remotas de Chocó y Nariño que dificulta el acceso continuo de brigadas sanitarias.",
    source: "Instituto Nacional de Salud (INS) Colombia · SIVIGILA",
    sourceUrl: "https://www.ins.gov.co/",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "ARG",
    countryName: "Argentina",
    countryNameEs: "Argentina",
    isLatAm: true,
    parasiteId: "p01-plasmodium-spp",
    speciesName: "Plasmodium spp.",
    evidenceCategory: "interrupcion_eliminacion",
    evidenceLabel: "Certificada Libre de Malaria por OMS (2019)",
    epidemiologicalStatus: "Eliminación completa de la transmisión autóctona certificada oficialmente por la OMS en mayo de 2019",
    casesOrPrevalence: "Cero casos autóctonos desde 2011; solo se registran casos importados en viajeros con tratamiento temprano.",
    vectorsOrIntermediateHosts: "Anopheles pseudopunctipennis (vector histórico presente)",
    keyRegionsOrEndemicAreas: "Zonas históricas del Noroeste (Salta, Jujuy, Tucumán)",
    publicHealthMeasures: "Vigilancia de casos febriles importados y capacidad diagnóstica en centros fronterizos para evitar la reintroducción.",
    limitations: "Riesgo de reintroducción desde países vecinos si decae la sospecha clínica ante fiebre en viajeros.",
    source: "Organización Mundial de la Salud (OMS) / Ministerio de Salud de Argentina",
    sourceUrl: "https://www.who.int/es/news/item/11-06-2019-algeria-and-argentina-certified-malaria-free-by-who",
    referenceYear: "2019 - 2024"
  },
  {
    countryCode: "CHL",
    countryName: "Chile",
    countryNameEs: "Chile",
    isLatAm: true,
    parasiteId: "p01-plasmodium-spp",
    speciesName: "Plasmodium spp.",
    evidenceCategory: "libre_sin_transmision",
    evidenceLabel: "País libre de malaria autóctona desde 1945",
    epidemiologicalStatus: "Sin transmisión autóctona desde la campaña de erradicación liderada por el Dr. Juan Noé en 1945",
    casesOrPrevalence: "100% de los casos confirmados son importados en viajeros internacionales o migrantes (15 a 35 casos anuales).",
    vectorsOrIntermediateHosts: "Anopheles pseudopunctipennis históricamente en valles de Arica; sin transmisión activa",
    keyRegionsOrEndemicAreas: "Diagnósticos en centros de referencia de Santiago, Arica, Iquique y Antofagasta",
    publicHealthMeasures: "Notificación inmediata obligatoria (ENO), confirmación por ISP mediante microscopía y PCR, stock de antimaláricos garantizado.",
    limitations: "Demoras diagnósticas cuando el viajero no refiere el antecedente epidemiológico en los servicios de urgencia.",
    source: "ISP Chile · MINSAL / SOCHINF",
    sourceUrl: "https://www.ispch.cl/",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "NGA",
    countryName: "Nigeria",
    countryNameEs: "Nigeria",
    isLatAm: false,
    parasiteId: "p01-plasmodium-spp",
    speciesName: "Plasmodium falciparum",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Mayor carga de morbilidad y mortalidad mundial (27%)",
    epidemiologicalStatus: "Hiperendemia crítica; representa el 27% de todos los casos de malaria del mundo y el 31% de las muertes",
    casesOrPrevalence: "Más de 66 millones de casos anuales estimados por OMS; más de 190.000 defunciones anuales, principalmente niños < 5 años.",
    vectorsOrIntermediateHosts: "Anopheles gambiae s.s., Anopheles coluzzii, Anopheles funestus",
    keyRegionsOrEndemicAreas: "Todo el territorio nacional (estados del norte, delta del Níger y áreas periurbanas)",
    publicHealthMeasures: "Introducción de vacunas RTS,S y R21, quimioprevención estacional y mosquiteros tratados con piretroides/PBO.",
    limitations: "Resistencia creciente de vectores a piretroides y mutaciones que escapan a los test de diagnóstico rápido (deleción pfhrp2/3).",
    source: "World Health Organization (WHO) · World Malaria Report 2023",
    sourceUrl: "https://www.who.int/publications/i/item/9789240086173",
    referenceYear: "2023 - 2024"
  },

  // =========================================================================
  // LEISHMANIA SPP.
  // =========================================================================
  {
    countryCode: "BRA",
    countryName: "Brazil",
    countryNameEs: "Brasil",
    isLatAm: true,
    parasiteId: "p07-leishmania-spp",
    speciesName: "Leishmania braziliensis / L. infantum",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Mayor carga de leishmaniasis cutánea y visceral de América",
    epidemiologicalStatus: "Endemia nacional con formas cutáneas, mucocutáneas graves y visceral zoonótica canina",
    casesOrPrevalence: "15.000 a 20.000 casos anuales de leishmaniasis tegumentaria; 2.500 a 3.500 casos de leishmaniasis visceral con letalidad del 7-9%.",
    vectorsOrIntermediateHosts: "Lutzomyia longipalpis (visceral), Lutzomyia whitmani, L. intermedia (tegumentaria)",
    keyRegionsOrEndemicAreas: "Maranhão, Bahia, Ceará, Minas Gerais y Pará",
    publicHealthMeasures: "Tratamiento con antimoniato de meglumina y anfotericina B liposomal; control serológico y eutanasia/vacunación de reservorios caninos.",
    limitations: "Urbanización de L. longipalpis en grandes ciudades y toxicidad de los tratamientos leishmanicidas clásicos.",
    source: "Ministério da Saúde do Brasil / OPS",
    sourceUrl: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/l/leishmaniose-visceral",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "PER",
    countryName: "Peru",
    countryNameEs: "Perú",
    isLatAm: true,
    parasiteId: "p07-leishmania-spp",
    speciesName: "Leishmania braziliensis / L. peruviana",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Formas andinas (Uta) y de selva (Espundia)",
    epidemiologicalStatus: "Leishmaniasis cutánea andina (Uta por L. peruviana) y mucocutánea destructiva de selva (Espundia por L. braziliensis)",
    casesOrPrevalence: "Aproximadamente 6.000 a 8.000 casos anuales de leishmaniasis tegumentaria notificados al Centro de Epidemiología.",
    vectorsOrIntermediateHosts: "Lutzomyia peruensis, Lutzomyia verrucarum, Lutzomyia tejadai",
    keyRegionsOrEndemicAreas: "Cuzco (La Convención), Madre de Dios, Huánuco, Junín, San Martín y valles occidentales andinos",
    publicHealthMeasures: "Diagnóstico parasitológico en centros de salud rurales, distribución de estibogluconato de sodio.",
    limitations: "Deserción al tratamiento por dolorosas inyecciones intramusculares diarias durante 20 a 28 días.",
    source: "MINSA Perú · CDC Perú / Instituto de Medicina Tropical Alexander von Humboldt",
    sourceUrl: "https://www.dge.gob.pe/",
    referenceYear: "2023"
  },
  {
    countryCode: "IND",
    countryName: "India",
    countryNameEs: "India",
    isLatAm: false,
    parasiteId: "p07-leishmania-spp",
    speciesName: "Leishmania donovani",
    evidenceCategory: "interrupcion_eliminacion",
    evidenceLabel: "Meta histórica de eliminación del Kala-Azar (<1/10.000)",
    epidemiologicalStatus: "Éxito histórico del programa de eliminación de leishmaniasis visceral; reducción >98% de casos respecto a los años 90",
    casesOrPrevalence: "Reducción de más de 30.000 casos anuales a menos de 600 casos en 2023 en toda la India.",
    vectorsOrIntermediateHosts: "Phlebotomus argentipes (vector antropófilo estricto)",
    keyRegionsOrEndemicAreas: "Estados de Bihar, Jharkhand, Bengala Occidental y Uttar Pradesh",
    publicHealthMeasures: "Tratamiento con dosis única de anfotericina B liposomal (AmBisome), rociado residual en casas de barro y compensación económica al paciente.",
    limitations: "Riesgo de rebrote a partir de pacientes con leishmaniasis dérmica post-kala-azar (PKDL), que actúan como reservorios dérmicos.",
    source: "World Health Organization (WHO) / National Vector Borne Disease Control Programme (NVBDCP)",
    sourceUrl: "https://www.who.int/news/item/31-10-2023-india-eliminates-visceral-leishmaniasis-as-a-public-health-problem",
    referenceYear: "2023 - 2024"
  },

  // =========================================================================
  // TAENIA SOLIUM (CISTICERCOSIS & TENIASIS)
  // =========================================================================
  {
    countryCode: "PER",
    countryName: "Peru",
    countryNameEs: "Perú",
    isLatAm: true,
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Sierra andina hiperendémica y foco de investigación",
    epidemiologicalStatus: "Causa principal de epilepsia secundaria del adulto en la sierra peruana; prevalencia porcina elevada en zonas rurales",
    casesOrPrevalence: "Seroprevalencia humana de 10% a 24% en comunidades rurales de la sierra; hasta 35% de los cerdos de crianza rústica infectados.",
    vectorsOrIntermediateHosts: "Cerdo doméstico (hospedero intermediario con cisticercosis)",
    keyRegionsOrEndemicAreas: "Departamentos de Cuzco, Cajamarca, Junín, Puno, Huancavelica y Piura rural",
    publicHealthMeasures: "Ensayos pioneros de eliminación con quimioterapia masiva (niclosamida), vacunación porcina (TSOL18) y oxfendazol.",
    limitations: "Prácticas de faenamiento domiciliario clandestino en festividades patronales que eluden la inspección médico-veterinaria.",
    source: "Grupo de Trabajo en Cisticercosis en Perú / Universidad Peruana Cayetano Heredia / OMS",
    sourceUrl: "https://www.who.int/teams/control-of-neglected-tropical-diseases/taeniasis-cysticercosis",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "MEX",
    countryName: "Mexico",
    countryNameEs: "México",
    isLatAm: true,
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    evidenceCategory: "endemico_focos_regionales",
    evidenceLabel: "Reducción histórica pero persistencia en bolsas rurales",
    epidemiologicalStatus: "Reducción sustancial en áreas urbanas tecnificadas; persistencia en comunidades agrícolas del centro y sur",
    casesOrPrevalence: "Decomisos oficiales en mataderos tecnificados < 0.1%, pero neuroimagen en hospitales terciarios sigue detectando casos parenquimatosos crónicos.",
    vectorsOrIntermediateHosts: "Cerdo doméstico criado a traspatio",
    keyRegionsOrEndemicAreas: "Estados de Puebla, Oaxaca, Michoacán, Guerrero e Hidalgo",
    publicHealthMeasures: "Inspección sanitaria federal TIF de carnes, saneamiento básico rural y educación para la salud.",
    limitations: "Cisticercosis humana de diagnóstico muy tardío debido a que las calcificaciones parenquimatosas generan convulsiones años tras la infección.",
    source: "Instituto Nacional de Neurología y Neurocirugía de México / Secretaría de Salud",
    sourceUrl: "https://www.gob.mx/salud",
    referenceYear: "2023"
  },

  // =========================================================================
  // ECHINOCOCCUS GRANULOSUS (HIDATIDOSIS)
  // =========================================================================
  {
    countryCode: "ARG",
    countryName: "Argentina",
    countryNameEs: "Argentina",
    isLatAm: true,
    parasiteId: "p27-echinococcus-granulosus",
    speciesName: "Echinococcus granulosus sensu lato",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Hiperendemia en Patagonia y zonas ovinas",
    epidemiologicalStatus: "Zoonosis de altísima relevancia sanitaria en provincias patagónicas con crianza extensiva de ovejas",
    casesOrPrevalence: "Tasas de incidencia quirúrgica que superan los 25 a 40 casos por 100.000 habitantes en zonas rurales de Río Negro y Neuquén.",
    vectorsOrIntermediateHosts: "Perro doméstico (hospedero definitivo) y ganado ovino/caprino (hospederos intermediarios)",
    keyRegionsOrEndemicAreas: "Provincias de Río Negro, Chubut, Neuquén, Santa Cruz y Tierra del Fuego",
    publicHealthMeasures: "Desparasitación sistemática periódica de perros con praziquantel, ecografía de pesquisa escolar y vacuna ovina EG95.",
    limitations: "La costumbre rural arraigada de alimentar a los perros de pastoreo con vísceras crudas infectadas con quistes.",
    source: "Ministerio de Salud de Argentina · Programa Nacional de Hidatidosis / OPS",
    sourceUrl: "https://www.argentina.gob.ar/salud/hidatidosis",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "CHL",
    countryName: "Chile",
    countryNameEs: "Chile",
    isLatAm: true,
    parasiteId: "p27-echinococcus-granulosus",
    speciesName: "Echinococcus granulosus sensu lato",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "ENO de alta prioridad en regiones del sur (Aysén/Magallanes)",
    epidemiologicalStatus: "Incidencia quirúrgica humana nacional de 1.5 a 2.0 por 100.000 hab., elevándose a más de 20 por 100.000 hab. en el extremo sur",
    casesOrPrevalence: "Entre 350 y 500 intervenciones quirúrgicas anuales en hospitales públicos chilenos; decomisos en mataderos SAG en ovinos y bovinos.",
    vectorsOrIntermediateHosts: "Perro de trabajo rural y oveja/vaca",
    keyRegionsOrEndemicAreas: "Regiones de Aysén (XI), Magallanes (XII), La Araucanía (IX), Los Lagos (X) y Biobío (VIII)",
    publicHealthMeasures: "Notificación obligatoria diaria (ENO), desparasitación canina por municipios y SAG, tamizaje ecográfico en zonas rurales.",
    limitations: "Crecimiento muy lento del quiste (1 a 5 cm por año) que retrasa el diagnóstico clínico hasta la adultez.",
    source: "MINSAL Chile · Departamento de Epidemiología / SAG / SOCHINF",
    sourceUrl: "https://epi.minsal.cl/",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "URY",
    countryName: "Uruguay",
    countryNameEs: "Uruguay",
    isLatAm: true,
    parasiteId: "p27-echinococcus-granulosus",
    speciesName: "Echinococcus granulosus sensu lato",
    evidenceCategory: "endemico_focos_regionales",
    evidenceLabel: "Éxito sostenido de la Comisión de Zoonosis",
    epidemiologicalStatus: "Reducción drástica de la incidencia humana en las últimas tres décadas gracias al programa de dosificación canina",
    casesOrPrevalence: "Incidencia humana reducida a menos de 1.0 por 100.000 hab.; persiste vigilancia activa en faena ovina.",
    vectorsOrIntermediateHosts: "Perro y ganado ovino",
    keyRegionsOrEndemicAreas: "Departamentos del norte y centro ganadero (Tacuarembó, Salto, Artigas, Durazno)",
    publicHealthMeasures: "Patente y registro canino con pastillas de praziquantel entregadas trimestralmente; ecografía escolar masiva.",
    limitations: "Riesgo de rebrote si se debilita el control de la faena clandestina en estancias rurales.",
    source: "Comisión Nacional de Zoonosis de Uruguay / OPS",
    sourceUrl: "https://www.zoonosis.gub.uy/",
    referenceYear: "2023"
  },

  // =========================================================================
  // SCHISTOSOMA (ESQUISTOSOMIASIS)
  // =========================================================================
  {
    countryCode: "BRA",
    countryName: "Brazil",
    countryNameEs: "Brasil",
    isLatAm: true,
    parasiteId: "p21-schistosoma-mansoni",
    speciesName: "Schistosoma mansoni",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Único gran foco endémico de Schistosoma en América",
    epidemiologicalStatus: "Endemia histórica en el Nordeste y Minas Gerais asociada a caracoles dulceacuícolas Biomphalaria",
    casesOrPrevalence: "Aproximadamente 1.5 millones de personas infectadas en Brasil; formas hepatoesplénicas graves con hipertensión portal.",
    vectorsOrIntermediateHosts: "Caracoles acuáticos Biomphalaria glabrata, B. tenagophila y B. straminea",
    keyRegionsOrEndemicAreas: "Estados de Minas Gerais, Bahia, Pernambuco, Sergipe y Alagoas",
    publicHealthMeasures: "Programa de Control de la Esquistosomiasis (PCE) con praziquantel en comunidades focales y saneamiento.",
    limitations: "Presencia ubicua de caracoles intermediarios en represas, ríos lentos y canales de regadío.",
    source: "Ministério da Saúde do Brasil · PCE / OPS",
    sourceUrl: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/e/esquistossomose",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "EGY",
    countryName: "Egypt",
    countryNameEs: "Egipto",
    isLatAm: false,
    parasiteId: "p21-schistosoma-mansoni",
    speciesName: "Schistosoma mansoni / S. haematobium",
    evidenceCategory: "interrupcion_eliminacion",
    evidenceLabel: "Éxito histórico de eliminación en la cuenca del Nilo",
    epidemiologicalStatus: "País emblemático que redujo la prevalencia histórica del 40% al 60% a menos del 0.2% en 2023",
    casesOrPrevalence: "Prevalencia nacional < 0.2% en distritos prioritarios; certificación de interrupción en proceso con la OMS.",
    vectorsOrIntermediateHosts: "Bulinus truncatus (S. haematobium) y Biomphalaria alexandrina (S. mansoni)",
    keyRegionsOrEndemicAreas: "Delta del Nilo y Alto Egipto",
    publicHealthMeasures: "Administración masiva de praziquantel durante décadas, molluscicidas y saneamiento rural canalizado.",
    limitations: "Vigilancia de pequeños bolsones residuales en canales de irrigación campesinos.",
    source: "World Health Organization (WHO) / Ministry of Health of Egypt",
    sourceUrl: "https://www.who.int/news/item/18-09-2023-egypt-becomes-first-country-to-achieve-who-validation-for-eliminating-rubella-and-measles",
    referenceYear: "2023"
  },

  // =========================================================================
  // FASCIOLA HEPATICA
  // =========================================================================
  {
    countryCode: "BOL",
    countryName: "Bolivia",
    countryNameEs: "Bolivia",
    isLatAm: true,
    parasiteId: "p20-fasciola-hepatica",
    speciesName: "Fasciola hepatica",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Máxima hiperendemia mundial humana (Altiplano Norte)",
    epidemiologicalStatus: "Zona hiperendémica única en el mundo: prevalencia infantil de hasta 65% a 72% en comunidades del Lago Titicaca",
    casesOrPrevalence: "Afecta a miles de niños aimaras en el Altiplano boliviano con anemia severa, hepatomegalia y retardo pondoestatural.",
    vectorsOrIntermediateHosts: "Caracoles dulceacuícolas anfibios Galba truncatula (Lymnaeidae)",
    keyRegionsOrEndemicAreas: "Altiplano Norte (Provincias de Omasuyos, Los Andes, Ingavi, Manco Kapac, La Paz)",
    publicHealthMeasures: "Campañas masivas escolares con triclabendazol en comprimidos donados por Novartis/OMS.",
    limitations: "Consumo cultural de plantas acuáticas crudas ('kellu kellu') e ingesta de agua no hervida en pozos con ganado.",
    source: "OPS/OMS · Universidad de Valencia (Prof. Mas-Coma) · Ministerio de Salud de Bolivia",
    sourceUrl: "https://www.paho.org/",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "PER",
    countryName: "Peru",
    countryNameEs: "Perú",
    isLatAm: true,
    parasiteId: "p20-fasciola-hepatica",
    speciesName: "Fasciola hepatica",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Hiperendemia en valles interandinos (Cajamarca/Mantaro)",
    epidemiologicalStatus: "Focos hiperendémicos humanos de alta prevalencia en ganado lechero y población escolar",
    casesOrPrevalence: "Prevalencia en escolares de 10% a 30% en el Valle del Mantaro y Cajamarca; infección ganadera > 60%.",
    vectorsOrIntermediateHosts: "Lymnaea viatrix / Galba truncatula",
    keyRegionsOrEndemicAreas: "Cajamarca, Valle del Mantaro (Junín), Cuzco y Arequipa rural",
    publicHealthMeasures: "Tratamiento con triclabendazol humano garantizado por el MINSA en centros de salud andinos.",
    limitations: "Consumo de emolientes, jugos de alfalfa y ensaladas de berros crudos en mercados tradicionales.",
    source: "MINSA Perú · Universidad Peruana Cayetano Heredia / OPS",
    sourceUrl: "https://www.dge.gob.pe/",
    referenceYear: "2023"
  },
  {
    countryCode: "CHL",
    countryName: "Chile",
    countryNameEs: "Chile",
    isLatAm: true,
    parasiteId: "p20-fasciola-hepatica",
    speciesName: "Fasciola hepatica",
    evidenceCategory: "endemico_focos_regionales",
    evidenceLabel: "Focos agrícolas en valle central y decomisos SAG",
    epidemiologicalStatus: "Endemia veterinaria extendida con casos humanos esporádicos ligados a ingesta de berros silvestres",
    casesOrPrevalence: "Aproximadamente 20 a 50 casos humanos anuales diagnosticados en hospitales; decomisos en mataderos SAG en bovinos (hasta 25%).",
    vectorsOrIntermediateHosts: "Galba viatrix / Lymnaea truncatula",
    keyRegionsOrEndemicAreas: "Regiones de O'Higgins (VI), Maule (VII), Ñuble (XVI), Biobío (VIII) y Araucanía (IX)",
    publicHealthMeasures: "Inspección de carnes y vísceras en mataderos por SAG; educación sanitaria contra el consumo de berros silvestres.",
    limitations: "Subnotificación de cuadros biliares crónicos tratados como litiasis vesicular común.",
    source: "MINSAL / SAG Chile / SOCHINF",
    sourceUrl: "https://epi.minsal.cl/",
    referenceYear: "2023 - 2024"
  },

  // =========================================================================
  // GEOHELMINTOS (ASCARIS, TRICHURIS, ANQUILOSTOMAS)
  // =========================================================================
  {
    countryCode: "HTI",
    countryName: "Haiti",
    countryNameEs: "Haití",
    isLatAm: true,
    parasiteId: "p32-ascaris-lumbricoides",
    speciesName: "Ascaris lumbricoides / T. trichiura",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Hiperendemia crítica y desnutrición infantil",
    epidemiologicalStatus: "Mayor carga de geohelmintiasis y filariasis linfática del Caribe",
    casesOrPrevalence: "Prevalencia en escolares > 50-70% en comunas rurales y barrios precarios sin redes de saneamiento.",
    vectorsOrIntermediateHosts: "Suelo contaminado con heces fecales (transmisión fecal-oral y percutánea)",
    keyRegionsOrEndemicAreas: "Todo el país (Departamentos Oeste, Artibonite, Norte y Sur)",
    publicHealthMeasures: "Campañas de desparasitación masiva con albendazol coordinadas por OPS/OMS y ONGs.",
    limitations: "Crisis institucional crónica, inundaciones periódicas y falta de infraestructura de agua potable.",
    source: "OPS/OMS · Ministère de la Santé Publique et de la Population (MSPP)",
    sourceUrl: "https://www.paho.org/",
    referenceYear: "2023 - 2024"
  },
  {
    countryCode: "GTM",
    countryName: "Guatemala",
    countryNameEs: "Guatemala",
    isLatAm: true,
    parasiteId: "p32-ascaris-lumbricoides",
    speciesName: "Ascaris lumbricoides / Trichuris",
    evidenceCategory: "endemico_alta_carga",
    evidenceLabel: "Alta prevalencia en Altiplano indígena",
    epidemiologicalStatus: "Endemia persistente en comunidades indígenas con alta prevalencia de desnutrición crónica infantil",
    casesOrPrevalence: "Seroprevalencia y exámenes coproparasitológicos positivos en 35% a 55% de escolares en comunidades del altiplano.",
    vectorsOrIntermediateHosts: "Suelo y agua contaminada",
    keyRegionsOrEndemicAreas: "Departamentos de Huehuetenango, Quiché, Alta Verapaz y San Marcos",
    publicHealthMeasures: "Campañas escolares bianuales de desparasitación con albendazol promovidas por el Ministerio de Salud.",
    limitations: "Dispersión comunitaria, letrinización incompleta y barreras idiomáticas en idiomas mayas.",
    source: "Ministerio de Salud Pública y Asistencia Social de Guatemala / OPS",
    sourceUrl: "https://www.mspas.gob.gt/",
    referenceYear: "2023"
  }
];

// Helper: obtener registros para un parásito dado
export function getWorldRecordsForParasite(parasiteId: string): WorldParasiteRecord[] {
  return WORLD_PARASITE_RECORDS.filter((r) => r.parasiteId === parasiteId);
}

// Helper: obtener registros para un país dado
export function getWorldRecordsForCountry(countryCode: string): WorldParasiteRecord[] {
  return WORLD_PARASITE_RECORDS.filter((r) => r.countryCode === countryCode);
}

// Helper: obtener registro específico país-parásito
export function getWorldRecord(countryCode: string, parasiteId: string): WorldParasiteRecord | undefined {
  return WORLD_PARASITE_RECORDS.find((r) => r.countryCode === countryCode && r.parasiteId === parasiteId);
}
