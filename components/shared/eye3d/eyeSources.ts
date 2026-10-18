/**
 * FUENTES BIBLIOGRÁFICAS Y DOCUMENTACIÓN ANATÓMICA DEL MODELO 3D
 */

export interface EyeSourceReference {
  id: string;
  citation: string;
  title: string;
  publication: string;
  url?: string;
  relevance: string;
}

export const EYE_ANATOMICAL_SOURCES: EyeSourceReference[] = [
  {
    id: "liou-brennan-1997",
    citation: "Liou HL, Brennan NA (1997)",
    title: "Anatomically accurate, finite model eye for optical modeling",
    publication: "Journal of the Optical Society of America A, 14(8):1684-1695",
    url: "https://pubmed.ncbi.nlm.nih.gov/9248060/",
    relevance: "Parámetros del dioptrio ocular: curvaturas corneal anterior (7.77 mm) y posterior (6.40 mm), profundidad de cámara anterior (3.16 mm), espesor del cristalino (4.0 mm) y radio de curvatura retiniano (12.0 mm).",
  },
  {
    id: "webvision-kolb-retina",
    citation: "Kolb H (Webvision)",
    title: "Part XIII: Facts and Figures concerning the human retina",
    publication: "Webvision: The Organization of the Retina and Visual System, University of Utah",
    url: "https://webvision.med.utah.edu/book/part-xiii-facts-and-figures-concerning-the-human-retina/",
    relevance: "Dimensiones del disco óptico (1.86 × 1.75 mm), distancia de fóvea al margen del disco (3.4 mm / 11.8°), diámetro foveal (1.5 mm) y perfil de espesores de la retina desde el centro a la ora serrata.",
  },
  {
    id: "statpearls-cornea",
    citation: "Sridhar MS / StatPearls (2023)",
    title: "Anatomy of the Cornea and Ocular Surface",
    publication: "StatPearls Publishing, NCBI Bookshelf",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK560667/",
    relevance: "Diámetros corneales horizontal (11.5 - 12.0 mm) y vertical (10.5 - 11.0 mm), espesor corneal central (520-550 µm) y transición limbar con la esclera.",
  },
  {
    id: "statpearls-ciliary",
    citation: "StatPearls Publishing (2023)",
    title: "Anatomy, Head and Neck, Eye Ciliary Body and Muscles",
    publication: "StatPearls Publishing, NCBI Bookshelf",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK542302/",
    relevance: "Extensión del cuerpo ciliar (5-6 mm), división funcional entre pars plicata anterior (~2 mm, 70-80 procesos ciliares) y pars plana posterior (~4 mm hasta ora serrata).",
  },
  {
    id: "statpearls-lens",
    citation: "StatPearls Publishing (2023)",
    title: "Anatomy, Head and Neck: Eye Lens",
    publication: "StatPearls Publishing, NCBI Bookshelf",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK541098/",
    relevance: "Geometría biconvexa del cristalino, diámetro ecuatorial adulto (9.0 - 10.0 mm), espesor anteroposterior y fijación por la zónula ciliar.",
  },
  {
    id: "statpearls-optic-nerve",
    citation: "StatPearls Publishing (2023)",
    title: "Anatomy, Head and Neck: Eye Optic Nerve (CN II)",
    publication: "StatPearls Publishing, NCBI Bookshelf",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK538202/",
    relevance: "Diámetro en la cabeza del nervio (1.5 - 1.8 mm) y ensanchamiento retrobulbar mielinizado (3.5 - 4.0 mm) tras la lámina cribosa escleral.",
  },
];
