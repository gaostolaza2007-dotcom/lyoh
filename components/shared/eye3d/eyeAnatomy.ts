/**
 * CATÁLOGO ANATÓMICO Y PEDAGÓGICO DE ESTRUCTURAS DEL OJO HUMANO (OD)
 *
 * Cada estructura cuenta con identificación de capa, rol óptico/biológico,
 * relaciones espaciales y coordenadas para marcadores tridimensionales.
 */

export type EyeLayerGroupId =
  | "tunica_fibrosa"
  | "tunica_vascular"
  | "tunica_interna"
  | "medios_camaras"
  | "nervio_optico";

export interface EyeLayerGroup {
  id: EyeLayerGroupId;
  name: string;
  shortName: string;
  description: string;
  colorBadge: string;
}

export const EYE_LAYER_GROUPS: EyeLayerGroup[] = [
  {
    id: "tunica_fibrosa",
    name: "Túnica Externa (Fibrosa)",
    shortName: "Túnica Fibrosa",
    description: "Capa protectora y continente exterior del globo ocular, constituida por la córnea anterior transparente y la esclera posterior opaca.",
    colorBadge: "bg-sky-500/15 border-sky-500/30 text-sky-300",
  },
  {
    id: "tunica_vascular",
    name: "Túnica Media (Vascular / Úvea)",
    shortName: "Úvea Vascular",
    description: "Capa nutricia y muscular intraocular conformada por el iris anterior, el cuerpo ciliar intermedio y la coroides posterior.",
    colorBadge: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  },
  {
    id: "tunica_interna",
    name: "Túnica Interna (Sensorial / Retina)",
    shortName: "Retina y Fondo",
    description: "Tejido neurosensorial fotorreceptor que realiza la fototransducción y origina las fibras del nervio óptico.",
    colorBadge: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  },
  {
    id: "medios_camaras",
    name: "Medios Refringentes y Cámaras",
    shortName: "Medios y Espacios",
    description: "Elementos ópticos transparentes que transmiten, enfocan y refractan los haces luminosos hacia el plano retiniano.",
    colorBadge: "bg-teal-500/15 border-teal-500/30 text-teal-300",
  },
  {
    id: "nervio_optico",
    name: "Vía de Salida (Nervio Óptico)",
    shortName: "Nervio Óptico",
    description: "Haz de axones mielinizados de células ganglionares que transmite la información visual desde la lámina cribosa hacia el quiasma óptico.",
    colorBadge: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
  },
];

export interface EyeStructureInfo {
  id: string;
  name: string;
  latinName?: string;
  groupId: EyeLayerGroupId;
  categoryLabel: string;
  location: string;
  functionDesc: string;
  relations: string;
  visualColorNote: string;
  isConventionalColor?: boolean;
  markerPos: [number, number, number]; // [x, y, z] en mm
  layerToggleKey: string;
}

export const EYE_STRUCTURES: EyeStructureInfo[] = [
  // --- TÚNICA EXTERNA (FIBROSA) ---
  {
    id: "cornea",
    name: "Córnea",
    latinName: "Cornea",
    groupId: "tunica_fibrosa",
    categoryLabel: "Túnica Externa (Fibrosa)",
    location: "Sexto anterior del globo ocular. Sobresale con mayor curvatura que la esclera (radio anterior ~7.8 mm).",
    functionDesc: "Principal dioptrio refractivo del ojo humano (~43 dioptrías, cerca de dos tercios del poder óptico total) y barrera física protectora transparente.",
    relations: "Se continúa periféricamente con la esclera a través del limbo esclerocorneal; limita posteriormente la cámara anterior que contiene humor acuoso.",
    visualColorNote: "Transparente con leve brillo de Fresnel corneal y reflexión especular suave.",
    markerPos: [0, -1.5, 11.5],
    layerToggleKey: "cornea",
  },
  {
    id: "esclera",
    name: "Esclera",
    latinName: "Sclera",
    groupId: "tunica_fibrosa",
    categoryLabel: "Túnica Externa (Fibrosa)",
    location: "Cinco sextos posteriores del globo ocular, envolviendo todo el contenido intraocular hasta el nervio óptico.",
    functionDesc: "Mantiene la presión intraocular y la forma esferoide del globo; ofrece inserción a los seis músculos extraoculares.",
    relations: "Se une anteriormente a la córnea en el limbo; por dentro está tapizada por la coroides a través de la lámina fusca; perforada posteriormente por el canal escleral (lámina cribosa).",
    visualColorNote: "Blanco nacarado opaco con acabado fibroso mate.",
    markerPos: [7.5, -3.5, -2.0],
    layerToggleKey: "esclera",
  },
  {
    id: "limbo",
    name: "Limbo esclerocorneal",
    latinName: "Limbus corneae",
    groupId: "tunica_fibrosa",
    categoryLabel: "Túnica Externa (Transición)",
    location: "Zona anular de 1.0 a 1.5 mm de ancho que marca la transición continua entre la córnea transparente y la esclera opaca.",
    functionDesc: "Alberga las células madre del epitelio corneal (limbales) y contiene en su profundidad el aparato de drenaje del humor acuoso (red trabecular y canal de Schlemm).",
    relations: "Unión entre córnea y esclera; coincide internamente con el ángulo iridocorneal.",
    visualColorNote: "Borde de transición suave entre transparencia y blanco escleral.",
    markerPos: [4.8, -2.2, 7.5],
    layerToggleKey: "cornea",
  },

  // --- TÚNICA MEDIA (VASCULAR / ÚVEA) ---
  {
    id: "iris",
    name: "Iris y abertura pupilar",
    latinName: "Iris",
    groupId: "tunica_vascular",
    categoryLabel: "Túnica Media (Úvea anterior)",
    location: "Diafragma circular vertical interpuesto entre la cámara anterior y el cristalino, suspendido en el humor acuoso.",
    functionDesc: "Regula dinámicamente la entrada de luz mediante sus músculos esfínter (constricción parasimpática) y dilatador (midriasis simpática). La pupila es un orificio real central.",
    relations: "Su raíz se inserta en el cuerpo ciliar; su borde pupilar libre descansa sutilmente sobre la cápsula anterior del cristalino.",
    visualColorNote: "Marrón biológico de referencia con trabéculas estromales radiales y collarete pupilar (existen variantes genéticas naturales: azul, verde, avellana).",
    markerPos: [2.5, -1.8, 8.0],
    layerToggleKey: "iris",
  },
  {
    id: "cuerpo_ciliar",
    name: "Cuerpo ciliar",
    latinName: "Corpus ciliare",
    groupId: "tunica_vascular",
    categoryLabel: "Túnica Media (Úvea intermedia)",
    location: "Banda anular de 5 a 6 mm de longitud situada detrás del iris, extendiéndose hacia atrás hasta la ora serrata.",
    functionDesc: "Sus procesos ciliares (pars plicata) secretan activamente el humor acuoso; el músculo ciliar relaja la zónula para permitir la acomodación del cristalino.",
    relations: "Anteriormente se une a la raíz del iris y al espolón escleral; posteriormente se continúa sin interrupción con la coroides a nivel de la ora serrata.",
    visualColorNote: "Pardo rojizo oscuro con pliegues radiales (procesos ciliares) modelados en relieve.",
    markerPos: [4.9, -1.5, 5.2],
    layerToggleKey: "cuerpo_ciliar",
  },
  {
    id: "zonula",
    name: "Zónula ciliar (de Zinn)",
    latinName: "Zonula ciliaris",
    groupId: "medios_camaras",
    categoryLabel: "Aparato suspensorio",
    location: "Conjunto de finas fibras elásticas acelulares que cruzan la cámara posterior desde los procesos ciliares hasta el ecuador del cristalino.",
    functionDesc: "Mantiene suspendido el cristalino y transmite la tensión del músculo ciliar modificando la convexidad del cristalino.",
    relations: "Inserta en los valles ciliar y la cápsula pericristaliniana ecuatorial anterior y posterior.",
    visualColorNote: "Fibras traslúcidas finas iridiscentes agrupadas radialmente.",
    markerPos: [4.0, 1.2, 6.2],
    layerToggleKey: "zonula",
  },
  {
    id: "coroides",
    name: "Coroides",
    latinName: "Choroidea",
    groupId: "tunica_vascular",
    categoryLabel: "Túnica Media (Úvea posterior)",
    location: "Capa vascular delgada (~0.25 mm) interpuesta entre la esclera y la retina, desde el nervio óptico hasta la ora serrata.",
    functionDesc: "Proporciona irrigación, oxígeno y nutrición a los fotorreceptores y al epitelio pigmentario retiniano (EPR); absorbe la luz dispersa impidiendo reflejos internos.",
    relations: "Externa a la retina e interna a la esclera; se continúa anteriormente con el cuerpo ciliar.",
    visualColorNote: "Marrón chocolate rojizo oscuro de alta pigmentación melanocítica.",
    markerPos: [7.2, 2.0, -5.0],
    layerToggleKey: "coroides",
  },

  // --- TÚNICA INTERNA (RETINA Y FONDO) ---
  {
    id: "retina",
    name: "Retina neural y EPR",
    latinName: "Retina",
    groupId: "tunica_interna",
    categoryLabel: "Túnica Interna (Sensorial)",
    location: "Capa más interna de los dos tercios posteriores del globo ocular, que termina anteriormente en un borde festoneado llamado ora serrata.",
    functionDesc: "Convierte los fotones luminosos en potenciales bioeléctricos (fototransducción) procesados por fotorreceptores, células bipolares y células ganglionares.",
    relations: "Tapiza la cara interna de la coroides; su cara interna está en contacto directo con la membrana hialoidea del cuerpo vítreo.",
    visualColorNote: "Tono beige crema convencional para permitir su clara diferenciación visual frente a la coroides subyacente.",
    isConventionalColor: true,
    markerPos: [6.4, 1.8, -5.0],
    layerToggleKey: "retina",
  },
  {
    id: "disco_optico",
    name: "Disco óptico (Papila)",
    latinName: "Discus nervi optici",
    groupId: "tunica_interna",
    categoryLabel: "Fondo de ojo (Topografía nasal)",
    location: "Situado aproximadamente 3.4 mm en posición nasal y 0.8 mm superior respecto al polo posterior del ojo derecho (OD).",
    functionDesc: "Zona de salida de los axones ganglionares que forman el nervio óptico y punto de entrada de los vasos centrales de la retina. Constituye el punto ciego fisiológico al carecer de fotorreceptores.",
    relations: "Perfora esclera y coroides a través del canal escleral (lámina cribosa); presenta una excavación fisiológica central pálida.",
    visualColorNote: "Óvalo rosado-anaranjado (~1.8 × 1.7 mm) con centro blanquecino (excavación).",
    markerPos: [3.4, 0.8, -11.4],
    layerToggleKey: "retina",
  },
  {
    id: "macula",
    name: "Mácula lútea y Fóvea central",
    latinName: "Macula lutea / Fovea centralis",
    groupId: "tunica_interna",
    categoryLabel: "Fondo de ojo (Topografía temporal)",
    location: "Situada temporalmente (~4 mm lateral al centro del disco óptico) y ligeramente inferior, centrada en el eje visual.",
    functionDesc: "Responsable de la máxima agudeza visual central, visión de detalles finos y percepción del color diurno gracias a una altísima concentración exclusiva de conos en la foveola.",
    relations: "Depresión foveal en el espesor retiniano, carente de vasos superficiales (zona avascular foveal).",
    visualColorNote: "Área amarillenta (~3 mm) con pequeña depresión central foveal (~1.5 mm).",
    markerPos: [-1.2, -0.4, -11.8],
    layerToggleKey: "retina",
  },

  // --- MEDIOS REFRINGENTES Y CÁMARAS ---
  {
    id: "cristalino",
    name: "Cristalino",
    latinName: "Lens crystallina",
    groupId: "medios_camaras",
    categoryLabel: "Medio refringente dinámico",
    location: "Lente biconvexa suspendida detrás del iris y delante del cuerpo vítreo por las fibras de la zónula.",
    functionDesc: "Ajusta dinámicamente el enfoque de objetos cercanos mediante la contracción ciliar (acomodación), cuya amplitud máxima disminuye fisiológicamente con la edad hasta la presbicia.",
    relations: "Su cara anterior contacta el borde pupilar del iris; su cara posterior reposa en la fosa hialoidea del vítreo.",
    visualColorNote: "Cuerpo transparente biconvexo con sutil reflejo refractivo ámbar.",
    markerPos: [0.0, -1.0, 6.4],
    layerToggleKey: "cristalino",
  },
  {
    id: "camara_anterior",
    name: "Cámara anterior (Humor acuoso)",
    latinName: "Camera anterior bulbi",
    groupId: "medios_camaras",
    categoryLabel: "Cámara hidro-óptica",
    location: "Espacio entre la cara posterior de la córnea y la cara anterior del iris y del centro del cristalino (~3.16 mm de profundidad axial).",
    functionDesc: "Ocupada por humor acuoso continuamente renovado que nutre tejidos avasculares (córnea y cristalino) y mantiene la presión intraocular normal (10-21 mmHg).",
    relations: "Comunica con la cámara posterior a través del orificio pupilar; drena en su periferia por el ángulo iridocorneal.",
    visualColorNote: "Volumen acuoso translúcido con suave tinte cian convencional para su legibilidad tridimensional.",
    isConventionalColor: true,
    markerPos: [0.0, -1.0, 9.8],
    layerToggleKey: "camaras",
  },
  {
    id: "camara_posterior",
    name: "Cámara posterior",
    latinName: "Camera posterior bulbi",
    groupId: "medios_camaras",
    categoryLabel: "Cámara hidro-óptica",
    location: "Espacio estrecho en forma de hendidura anular entre la cara posterior del iris y la cara anterior del cristalino, zónula y procesos ciliares.",
    functionDesc: "Sitio donde los procesos ciliares producen y secretan inicialmente el humor acuoso antes de que fluya por la pupila hacia la cámara anterior. No debe confundirse con la cavidad vítrea.",
    relations: "Limitada por el epitelio pigmentado del iris, procesos ciliares y zónula.",
    visualColorNote: "Hendidura acuosa translúcida diferenciada de la cavidad vítrea.",
    markerPos: [2.8, -1.0, 7.0],
    layerToggleKey: "camaras",
  },
  {
    id: "vitreo",
    name: "Cavidad y cuerpo vítreo",
    latinName: "Corpus vitreum",
    groupId: "medios_camaras",
    categoryLabel: "Medio refringente estático",
    location: "Ocupa los cuatro quintos posteriores del globo ocular, entre el cristalino y la retina (~4 ml de volumen).",
    functionDesc: "Gel transparente viscoelástico (99% agua, colágeno tipo II y ácido hialurónico) que mantiene la retina adosada a la coroides y transmite la luz sin dispersión.",
    relations: "Presenta la fosa patelar anterior para el cristalino; adherido firmemente a la base del vítreo (ora serrata) y al margen del disco óptico.",
    visualColorNote: "Masa gelatinosa translúcida con tono celeste sutil convencional para visualización de su volumen.",
    isConventionalColor: true,
    markerPos: [0.0, -2.5, -3.5],
    layerToggleKey: "vitreo",
  },

  // --- NERVIO ÓPTICO ---
  {
    id: "nervio_optico",
    name: "Nervio óptico (Segmento retrobulbar)",
    latinName: "Nervus opticus (Pars orbitalis)",
    groupId: "nervio_optico",
    categoryLabel: "Vía visual aferente",
    location: "Emerge del polo posterior en cuadrante nasal (~3.4 mm nasal, 0.8 mm superior) y se dirige hacia el ápice orbitario.",
    functionDesc: "Conduce aproximadamente 1.2 millones de fibras nerviosas aferentes que transportan los estímulos visuales hacia el núcleo geniculado lateral y centros reflejos.",
    relations: "Envuelto por las tres meninges (piamadre, aracnoides y duramadre) continuas con las del encéfalo; la duramadre se fusiona con la esclera externa.",
    visualColorNote: "Cilindro blanco nacarado con vaina dural externa y haz central de axones.",
    markerPos: [3.4, 1.8, -16.0],
    layerToggleKey: "nervio_optico",
  },
];
