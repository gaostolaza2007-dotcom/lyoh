import { GeographicEntry } from "./types";

/**
 * DATOS DE DISTRIBUCIÓN GEOGRÁFICA DE PARASITOLOGÍA MÉDICA
 * Foco inicial: Chile (datos oficiales MINSAL, ISP, SAG y estudios universitarios)
 * junto con contexto epidemiológico global.
 *
 * NOTA DE RIGOR: No se asume ausencia de parásito por ausencia de datos.
 * Se distingue presencia autóctona documentada, casos importados y seroprevalencia.
 */
export const GEOGRAPHIC_ENTRIES: GeographicEntry[] = [
  {
    id: "geo-ts-chile-araucania",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    territory: "Chile",
    regionChile: "Región de La Araucanía (IX Región)",
    geographicPrecision: "Zonas rurales con crianza porcina no tecnificada",
    coordinates: { lat: -38.7359, lng: -72.5904 },
    evidenceType: "estudio_seroprevalencia",
    evidenceLabel: "Seroprevalencia humana y estudios porcinos rurales",
    periodOrDate: "2015 – 2022 (Estudios epidemiológicos y vigilancia SAG)",
    casesCountOrPrevalence: "Seroprevalencia porcina en faena no tecnificada estimada entre 1.5% y 4.8% en comunidades rurales estudiadas.",
    source: "MINSAL Chile / SAG / Universidad de La Frontera (Estudios parasitológicos en comunidades rurales)",
    sourceUrl: "https://epi.minsal.cl/",
    limitations: "Existe subnotificación de teniasis intestinal por automedicación o curso asintomático. La vigilancia en mataderos no detecta el faenamiento domiciliario clandestino.",
    notes: "La crianza de cerdos a traspatio con acceso a letrinas o defecación abierta representa el eslabón epidemiológico clave para la persistencia del ciclo biológico."
  },
  {
    id: "geo-ts-chile-maule",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    territory: "Chile",
    regionChile: "Región del Maule (VII Región)",
    geographicPrecision: "Provincias de Talca, Linares y Cauquenes (sectores agrícolas)",
    coordinates: { lat: -35.4264, lng: -71.6554 },
    evidenceType: "estudio_epidemiologico_regional",
    evidenceLabel: "Registro de casos de neurocisticercosis y teniasis en hospitales regionales",
    periodOrDate: "2016 – 2023",
    casesCountOrPrevalence: "Casos esporádicos anuales de neurocisticercosis atendidos en el Hospital Regional de Talca (1 a 4 casos anuales confirmados por neuroimagen y serología).",
    source: "Servicio de Salud Maule / Sociedad Chilena de Infectología (SOCHINF)",
    sourceUrl: "https://www.sochinf.cl/",
    limitations: "Parte de los casos corresponden a infecciones adquiridas décadas antes debido al prolongado periodo de latencia de los quistes parenquimatosos.",
    notes: "Chile ha reducido sustancialmente la transmisión autóctona en las últimas cuatro décadas gracias al saneamiento básico y la inspección de carnes, pero persisten focos rurales de microtransmisión."
  },
  {
    id: "geo-ts-chile-metropolitana",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    territory: "Chile",
    regionChile: "Región Metropolitana de Santiago",
    geographicPrecision: "Centros terciarios de referencia neuroquirúrgica (Hospital del Salvador, Instituto de Neurocirugía Asenjo, HCUCH)",
    coordinates: { lat: -33.4489, lng: -70.6693 },
    evidenceType: "caso_importado_documentado",
    evidenceLabel: "Casos diagnosticados en centros terciarios (autóctonos antiguos e importados)",
    periodOrDate: "2018 – 2024",
    casesCountOrPrevalence: "Aproximadamente 60-70% de los nuevos diagnósticos de neurocisticercosis en Santiago corresponden a casos importados de países endémicos de la región (Perú, Bolivia, Centroamérica).",
    source: "Instituto de Salud Pública de Chile (ISP) / Sección Parasitología",
    sourceUrl: "https://www.ispch.cl/",
    limitations: "La procedencia geográfica reportada en fichas clínicas hospitalarias no siempre distingue con precisión entre infección en país de origen o viaje previo.",
    notes: "La presencia de migrantes portadores de T. solium intestinal asintomática subraya la importancia del tamizaje y tratamiento para prevenir la transmisión secundaria a convivientes."
  },
  {
    id: "geo-ts-chile-los-lagos",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    territory: "Chile",
    regionChile: "Región de Los Lagos (X Región)",
    geographicPrecision: "Provincia de Osorno y Chiloé rural",
    coordinates: { lat: -41.4693, lng: -72.9424 },
    evidenceType: "decomiso_matadero_oficial",
    evidenceLabel: "Decomisos de canales porcinas por cisticercosis en inspección médico-veterinaria",
    periodOrDate: "2017 – 2022",
    casesCountOrPrevalence: "Tasa de decomiso oficial en mataderos industriales autorizados SAG < 0.05% de las canales porcinas inspeccionadas.",
    source: "Servicio Agrícola y Ganadero (SAG) · Boletines de Sanidad Animal",
    sourceUrl: "https://www.sag.gob.cl/",
    limitations: "La baja tasa en plantas faenadoras industriales refleja la alta bioseguridad de planteles tecnificados, contrastando con la falta de datos sobre faena no formal.",
    notes: "Los planteles porcinos tecnificados de Chile con alimentación balanceada en confinamiento están libres de cisticercosis."
  },
  {
    id: "geo-ts-global-latam",
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    territory: "América Latina (Global)",
    geographicPrecision: "Zonas andinas y mesoamericanas (Perú, Bolivia, México, Guatemala, Colombia)",
    coordinates: { lat: -9.1899, lng: -75.0152 },
    evidenceType: "estudio_seroprevalencia",
    evidenceLabel: "Zonas de alta endemicidad reconocida por OPS/OMS",
    periodOrDate: "2015 – 2023",
    casesCountOrPrevalence: "Causa principal del 30% al 50% de las epilepsias adquiridas del adulto en comunidades endémicas de la sierra andina.",
    source: "Organización Panamericana de la Salud (OPS) / OMS",
    sourceUrl: "https://www.paho.org/",
    limitations: "Heterogeneidad metodológica entre países; falta de registros unificados de neurocisticercosis en zonas rurales remotas.",
    notes: "T. solium está clasificada por la OMS dentro del grupo prioritario de Enfermedades Tropicales Desatendidas (ETD) con metas de control para 2030."
  },
  {
    id: "geo-eg-chile-sur",
    parasiteId: "p27-echinococcus-granulosus",
    speciesName: "Echinococcus granulosus sensu lato",
    territory: "Chile",
    regionChile: "Regiones del Sur y Austral (Araucanía, Los Ríos, Los Lagos, Aysén, Magallanes)",
    geographicPrecision: "Zonas ganaderas ovinas y rurales",
    coordinates: { lat: -45.5712, lng: -72.0685 },
    evidenceType: "notificacion_obligatoria_minsal",
    evidenceLabel: "Hidatidosis humana (Enfermedad de Notificación Obligatoria - ENO)",
    periodOrDate: "2020 – 2023",
    casesCountOrPrevalence: "Tasa de incidencia nacional de ~1.5 a 2.0 por 100.000 hab.; en Aysén y Magallanes supera los 20 por 100.000 hab.",
    source: "Departamento de Epidemiología MINSAL · Notificación Diaria ENO",
    sourceUrl: "https://epi.minsal.cl/",
    limitations: "Existe un retardo diagnóstico considerable debido al crecimiento lento asintomático del quiste hidatídico durante años.",
    notes: "Zoonosis de altísima relevancia en Chile mantenida por el ciclo perro-oveja y la práctica rural de alimentar perros con vísceras crudas infectadas con quistes."
  },
  {
    id: "geo-tc-chile-norte",
    parasiteId: "p13-trypanosoma-cruzi",
    speciesName: "Trypanosoma cruzi",
    territory: "Chile",
    regionChile: "Norte Grande y Norte Chico (Arica hasta Región del Libertador Bernardo O'Higgins)",
    geographicPrecision: "Histórica zona de presencia del vector Triatoma infestans ('vinchuca')",
    coordinates: { lat: -29.9533, lng: -71.3395 },
    evidenceType: "notificacion_obligatoria_minsal",
    evidenceLabel: "Enfermedad de Chagas (Vigilancia vectorial y tamizaje en bancos de sangre / gestantes)",
    periodOrDate: "1999 – 2023 (Certificación de interrupción de transmisión vectorial intradomiciliaria en 1999)",
    casesCountOrPrevalence: "Transmisión vectorial intradomiciliaria interrumpida oficialmente en 1999. Vigilancia activa enfocada en vía congénita transplacentaria.",
    source: "MINSAL Chile / OPS / Instituto de Salud Pública (ISP)",
    sourceUrl: "https://epi.minsal.cl/",
    limitations: "Presencia persistente de vectores silvestres (Triatoma spinolai y T. infestans silvestre) en pedregales y pircas.",
    notes: "Todo banco de sangre en Chile tamiza obligatoriamente el 100% de los donantes para Chagas con ELISA/ChLIA."
  }
];
