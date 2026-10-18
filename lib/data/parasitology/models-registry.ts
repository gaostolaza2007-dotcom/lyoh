/**
 * REGISTRO CENTRALIZADO DE MODELOS 3D DE PARASITOLOGÍA - MEDSTUDY
 * 
 * Asocia de forma unívoca cada identificador estable de parásito con la disponibilidad
 * de su modelo 3D validado, tipo de renderizado y metadatos morfológicos.
 * 
 * Permite incorporar modelos especie por especie en sucesivas tandas sin modificar
 * la arquitectura de navegación ni la estructura de fichas del Atlas.
 */

export interface Parasite3DConfig {
  parasiteId: string;
  speciesName: string;
  hasModel: boolean;
  modelType?: "procedural_threejs" | "gltf" | "volumetric";
  stagesCount?: number;
  badgeLabel?: string;
  availableStages?: string[];
  statusNote: string;
}

export const PARASITE_3D_REGISTRY: Record<string, Parasite3DConfig> = {
  "micro-4": {
    parasiteId: "micro-4",
    speciesName: "Plasmodium falciparum",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 2,
    badgeLabel: "Disponible · 2 Formas sanguíneas",
    availableStages: [
      "Trofozoíto en anillo dentro de un eritrocito",
      "Gametocito maduro con forma de media luna"
    ],
    statusNote: "Reconstrucción 3D educativa interactiva de formas sanguíneas (trofozoíto en anillo y gametocito maduro)."
  },
  "p01": {
    parasiteId: "p01",
    speciesName: "Plasmodium falciparum",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 2,
    badgeLabel: "Disponible · 2 Formas sanguíneas",
    availableStages: [
      "Trofozoíto en anillo dentro de un eritrocito",
      "Gametocito maduro con forma de media luna"
    ],
    statusNote: "Reconstrucción 3D educativa interactiva de formas sanguíneas (trofozoíto en anillo y gametocito maduro)."
  },
  "micro-6": {
    parasiteId: "micro-6",
    speciesName: "Giardia duodenalis",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 2,
    badgeLabel: "Disponible · 2 Formas evolutivas",
    availableStages: [
      "Trofozoíto piriforme binucleado (disco ventral, 2 núcleos con cariosoma y 4 pares de flagelos)",
      "Quiste ovalado tetranucleado (pared hialina, halo de retracción, 4 núcleos y fibrillas)"
    ],
    statusNote: "Reconstrucción 3D educativa interactiva de trofozoíto piriforme y quiste tetranucleado."
  },
  "p02": {
    parasiteId: "p02",
    speciesName: "Giardia duodenalis",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 2,
    badgeLabel: "Disponible · 2 Formas evolutivas",
    availableStages: [
      "Trofozoíto piriforme binucleado",
      "Quiste ovalado tetranucleado"
    ],
    statusNote: "Reconstrucción 3D educativa interactiva de trofozoíto piriforme y quiste tetranucleado."
  },
  "p03": {
    parasiteId: "p03",
    speciesName: "Plasmodium vivax",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Formas evolutivas",
    availableStages: [
      "Trofozoíto ameboide en reticulocito agrandado (1.5–2×) con granulaciones de Schüffner",
      "Esquizonte maduro (16 merozoítos 3D, pigmento hemozoína pardo-dorado y gránulos de Schüffner)",
      "Gametocito redondo compacto (ocupa casi todo el reticulocito agrandado)",
      "Hipnozoíto hepático durmiente (4–5 µm con membrana vacuolar UIS4+ dentro del hepatocito)"
    ],
    statusNote: "Reconstrucción 3D hiperrealista de las 4 formas de Plasmodium vivax con corte histológico intraeritrocitario e intrahepático."
  },
  "p04": {
    parasiteId: "p04",
    speciesName: "Plasmodium ovale",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Formas evolutivas",
    availableStages: [
      "Trofozoíto compacto en eritrocito ovalado con bordes fimbriados (deshilachados) y puntos de James",
      "Esquizonte maduro (8 merozoítos grandes en roseta laxa dentro de eritrocito oval fimbriado)",
      "Gametocito ovalado con punteado de James prominente",
      "Hipnozoíto hepático durmiente (estadio latente intrahepático responsable de recaídas)"
    ],
    statusNote: "Reconstrucción 3D hiperrealista de las 4 formas de Plasmodium ovale (curtisi / wallikeri) con eritrocitos fimbriados y corte histológico 3D."
  },
  "p05": {
    parasiteId: "p05",
    speciesName: "Plasmodium malariae",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Formas evolutivas",
    availableStages: [
      "Trofozoíto «en banda» ecuatorial en eritrocito normocítico/microcítico senescente (sin puntos de Schüffner)",
      "Esquizonte en roseta «cabeza de margarita» (8–10 merozoítos simétricos rodeando masa central de hemozoína negra)",
      "Gametocito compacto redondo con pigmento hemozoína negro grueso abundante",
      "Anillo en «ojo de pájaro» (cromatina central dentro de la vacuola) y trofozoíto en cesta"
    ],
    statusNote: "Reconstrucción 3D hiperrealista de las 4 formas sanguíneas diagnósticas de Plasmodium malariae con corte histológico 3D."
  },
  "p06": {
    parasiteId: "p06",
    speciesName: "Toxocara canis",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Huevo embrionado infectante (85 × 75 µm, cáscara alveolada «en pelota de golf» y larva L3 enrollada en su interior)",
      "Granuloma eosinofílico hepático — Larva Migrans Visceral (larva L3 de 400 × 20 µm, eosinófilos y cristales de Charcot-Leyden)",
      "Granuloma retiniano posterior — Larva Migrans Ocular (pseudorretinoblastoma con pliegue de tracción vítrea y larva subretiniana)",
      "Adulto canino (10–18 cm, extremo anterior con 3 labios, amplias alas cervicales lanceoladas y esófago con ventrículo)"
    ],
    statusNote: "Reconstrucción 3D de Toxocara canis en fase de desarrollo."
  },
  "p07": {
    parasiteId: "p07",
    speciesName: "Entamoeba histolytica",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Trofozoíto hematófago invasivo (20–40 µm, pseudópodo hialino digitiforme, núcleo en «ojo de buey» y eritrofagocitosis patognomónica)",
      "Quiste maduro tetranucleado (12–15 µm, 4 núcleos con cariosoma central y barras cromatoidales en «habano» de extremos romos)",
      "Úlcera colónica en «botón de camisa» o matraz (cuello mucoso estrecho, cavidad submucosa socavada e invasión venular portal)",
      "Diagnóstico diferencial 3D: Quiste de E. histolytica (≤4 núcleos, barras romas) vs. Entamoeba coli (8 núcleos excéntricos, barras astilladas)"
    ],
    statusNote: "Reconstrucción 3D de Entamoeba histolytica en fase de desarrollo."
  },
  "p08": {
    parasiteId: "p08",
    speciesName: "Cryptosporidium parvum",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Ooquiste esporulado de pared gruesa (4–6 µm, ácido-alcohol resistente, 4 esporozoítos desnudos SIN esporoquistes y cuerpo residual)",
      "Meronte epicelular en borde en cepillo (localización intracelular pero extracitoplasmática con orgánulo alimentador electrodenso)",
      "Ooquiste de pared delgada autoinfectante (desenquistamiento in situ intraluminal vs. ooquiste de pared gruesa excretado)",
      "Campo diagnóstico Kinyoun / DFA (ooquistes magenta brillante de 4–6 µm, control FITC y diferenciación con levaduras azules)"
    ],
    statusNote: "Reconstrucción 3D de Cryptosporidium parvum en fase de desarrollo."
  },
  "p09": {
    parasiteId: "p09",
    speciesName: "Cyclospora cayetanensis",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Ooquiste no esporulado recién excretado (8–10 µm, mórula central de glóbulos refringentes no inmediatamente infectante)",
      "Ooquiste esporulado infectante (madurado en el ambiente: 2 esporoquistes ovales × 2 esporozoítos cada uno)",
      "Autofluorescencia UV patognomónica (anillo azul-neón a 330–365 nm y verde-menta a 450–490 nm sin colorantes)",
      "Tinción ácido-alcohol resistente variable en Kinyoun (ooquistes rojo rubí, rosados moteados y «ooquistes fantasma» vítreos)"
    ],
    statusNote: "Reconstrucción 3D de Cyclospora cayetanensis en fase de desarrollo."
  },
  "p10": {
    parasiteId: "p10",
    speciesName: "Cystoisospora belli",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Ooquiste inmaduro recién excretado (20–33 × 10–19 µm, forma elipsoidal en «balón de rugby» con 1 esporoblasto central único)",
      "Ooquiste maduro esporulado infectante (2 esporoquistes × 4 esporozoítos falciformes cada uno = 8 esporozoítos)",
      "Ooquiste en división (2 esporoblastos gemelos AAR+) acompañado de cristales bipiramidales de Charcot-Leyden",
      "Biopsia duodenal (esquizogonia intracitoplasmática profunda en enterocito e infiltrado de eosinófilos en lámina propia)"
    ],
    statusNote: "Reconstrucción 3D de Cystoisospora belli en fase de desarrollo."
  },
  "p11": {
    parasiteId: "p11",
    speciesName: "Toxoplasma gondii",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Taquizoíto en media luna (6 × 2 µm, complejo apical 3D con conoide, roptrias claviformes, micronemas, apicoplasto y núcleo)",
      "Quiste tisular cerebral/muscular (50–100 µm, pared PAS+ argirófila repleta de cientos de bradizoítos latentes)",
      "Roseta intracelular de taquizoítos por endodiogenia en vacuola parasitófora de macrófago («caballo de Troya»)",
      "Ooquiste fecal felino esporulado (10–12 µm, 2 esporoquistes × 4 esporozoítos excretado por el hospedador definitivo felino)"
    ],
    statusNote: "Reconstrucción 3D de Toxoplasma gondii en fase de desarrollo."
  },
  "p12": {
    parasiteId: "p12",
    speciesName: "Trichomonas vaginalis",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Trofozoíto piriforme (10–23 µm, único estadio sin quiste: 4 flagelos anteriores, membrana ondulante corta 1/2 cuerpo, axostilo saliente e hidrogenosomas)",
      "Trofozoíto ameboide citopático adherido a célula escamosa vaginal (adhesinas AP65 y lipofosfoglicano LPG)",
      "«Cérvix en fresa» (colpitis macularis con hemorragias petequiales subepiteliales, microburbujas de H2 y neutrófilos PMN)",
      "Fisión binaria longitudinal (criptopleuromitosis con huso extranuclear paradesmosis y 2 axostilos hijos)"
    ],
    statusNote: "Reconstrucción 3D de Trichomonas vaginalis en fase de desarrollo."
  },
  "p13": {
    parasiteId: "p13",
    speciesName: "Trypanosoma cruzi",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Tripomastigote sanguíneo en «C» o «S» (20 µm, cinetoplasto subterminal gigante que abomba el extremo posterior)",
      "Nido de amastigotes intracelulares (pseudoquiste en miocardiocito estriado con amastigotes de 2–4 µm y cinetoplasto en barra)",
      "Epimastigote replicativo en intestino medio de triatomino/vinchuca (cinetoplasto ANTERIOR al núcleo central)",
      "Tripomastigote metacíclico infectante (forma delgada en deyecciones del vector con cubierta gp82)"
    ],
    statusNote: "Reconstrucción 3D de Trypanosoma cruzi en fase de desarrollo."
  },
  "p14": {
    parasiteId: "p14",
    speciesName: "Leishmania donovani",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Macrófago esplénico/medular con cuerpos de Leishman-Donovan (amastigotes de 2–4 µm con «doble punto»: núcleo + cinetoplasto en bastón)",
      "Promastigote metacíclico flagelado (15–20 µm, cinetoplasto anterior extremo y largo flagelo libre sin membrana ondulante)",
      "Roseta de promastigotes en cultivo NNN (agrupación radial con los flagelos entrelazados en el centro)",
      "Frotis de aspirado de médula ósea en Giemsa (amastigotes extracelulares, plasmocito rK39+ y eritrocito de referencia)"
    ],
    statusNote: "Reconstrucción 3D de Leishmania donovani en fase de desarrollo."
  },
  "p15": {
    parasiteId: "p15",
    speciesName: "Leishmania braziliensis",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Úlcera cutánea indurada «en sacabocados» (macrófagos dérmicos en el borde activo con amastigotes de L. Viannia braziliensis)",
      "Leishmaniasis mucocutánea «Espundia» (perforación del tabique nasal cartilaginoso, células de Langhans y amastigotes pauciparasitarios)",
      "Promastigote Peripilaria del subgénero Viannia (fijación al píloro/íleon del flebótomo Lutzomyia y partículas de Leishmaniavirus LRV1)",
      "Impronta diagnóstica del borde ulceroso en Giemsa (vacuola macrofágica con amastigotes periféricos y linfocito Th1)"
    ],
    statusNote: "Reconstrucción 3D de Leishmania (Viannia) braziliensis en fase de desarrollo."
  },
  "p16": {
    parasiteId: "p16",
    speciesName: "Babesia microti",
    hasModel: false,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "En desarrollo · Próximamente",
    availableStages: [
      "Tétrada intraeritrocitaria en «Cruz de Malta» patognomónica (4 merozoítos piriformes unidos por sus ápices SIN hemozoína)",
      "Trofozoítos en anillo pleomórficos vacuolados y agrupación de merozoítos extracelulares libres",
      "Trofozoítos piriformes pareados en «V» («en pera gemela» dentro del eritrocito normocítico)",
      "Invasión directa del eritrocito por esporozoíto de garrapata Ixodes (ausencia total de fase exoeritrocitaria hepática)"
    ],
    statusNote: "Reconstrucción 3D de Babesia microti en fase de desarrollo."
  },
  "p25-taenia-solium": {
    parasiteId: "p25-taenia-solium",
    speciesName: "Taenia solium",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Estadios",
    availableStages: [
      "Escólex armado (rostelo, ventosas y doble corona de ganchos)",
      "Huevo embrionado (embrióforo radiado y oncosfera)",
      "Cisticerco (Cysticercus cellulosae con escólex invaginado)",
      "Estróbilo adulto (cadena estrobilada progresiva)"
    ],
    statusNote: "Modelo 3D multi-estadio disponible y validado."
  },
  "p25": {
    parasiteId: "p25",
    speciesName: "Taenia solium",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Estadios",
    availableStages: [
      "Escólex armado",
      "Huevo embrionado",
      "Cisticerco",
      "Estróbilo adulto"
    ],
    statusNote: "Modelo 3D multi-estadio disponible y validado."
  },
  "p26": {
    parasiteId: "p26",
    speciesName: "Taenia saginata",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Estadios",
    availableStages: [
      "Estróbilo adulto y Escólex inerme (ovario bilobulado y 15–20+ ramas uterinas dicotómicas)",
      "Escólex inerme cuadrangular (4 ventosas acetabulares, sin rostelo ni ganchos)",
      "Huevo embrionado (embrióforo radiado y oncosfera hexacanta)",
      "Cisticerco bovino (Cysticercus bovis con escólex invaginado inerme)"
    ],
    statusNote: "Reconstrucción 3D educativa interactiva de los 4 estadios de Taenia saginata."
  },
  "p26-taenia-saginata": {
    parasiteId: "p26-taenia-saginata",
    speciesName: "Taenia saginata",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Estadios",
    availableStages: [
      "Estróbilo adulto y Escólex inerme",
      "Escólex inerme cuadrangular",
      "Huevo embrionado",
      "Cisticerco bovino (Cysticercus bovis)"
    ],
    statusNote: "Reconstrucción 3D educativa interactiva de los 4 estadios de Taenia saginata."
  },
  "p27": {
    parasiteId: "p27",
    speciesName: "Echinococcus granulosus sensu lato",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Formas evolutivas",
    availableStages: [
      "Quiste hidatídico unilocular (periquiste, cutícula anhista PAS+, membrana germinativa, vesículas prolígeras, vesículas hijas y arena hidatídica)",
      "Adulto diminuto de 3 proglótides (2–7 mm: escólex armado + inmadura, madura y grávida terminal)",
      "Protoescólex invaginado y arena hidatídica (corona de ganchos, corpúsculos calcáreos y ganchos libres)",
      "Huevo embrionado (embrióforo radiado y oncosfera hexacanta)"
    ],
    statusNote: "Reconstrucción 3D educativa interactiva de las 4 formas de Echinococcus granulosus sensu lato."
  },
  "p27-echinococcus-granulosus": {
    parasiteId: "p27-echinococcus-granulosus",
    speciesName: "Echinococcus granulosus sensu lato",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Formas evolutivas",
    availableStages: [
      "Quiste hidatídico unilocular",
      "Adulto diminuto de 3 proglótides (2–7 mm)",
      "Protoescólex invaginado y arena hidatídica",
      "Huevo embrionado"
    ],
    statusNote: "Reconstrucción 3D educativa interactiva de las 4 formas de Echinococcus granulosus sensu lato."
  },
  "p34": {
    parasiteId: "p34",
    speciesName: "Sarcoptes scabiei var hominis",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Formas evolutivas",
    availableStages: [
      "Hembra adulta grávida (300–450 µm, idiosoma en forma de tortuga, escamas triangulares dorsales, 14 espinas cónicas, epímeros I fusionados en Y, ventosas en patas I–II, cerdas largas en III–IV y huevo gigante intrauterino 3D)",
      "Surco acarino en estrato córneo (galería epidérmica serpiginosa con hembra en el extremo ciego «signo del ala delta», fila de huevos de 150 µm y escíbalos fecales)",
      "Macho adulto (200–240 µm, ambulacros con ventosa en patas I, II y IV, cerda larga solo en pata III y aparato copulador ventral)",
      "Larva hexápoda y Huevo embrionado (larva de 3 pares de patas junto a huevo ovalado de 150 × 100 µm con embrión 3D interno)"
    ],
    statusNote: "Reconstrucción 3D hiperrealista de las 4 formas de Sarcoptes scabiei var. hominis con órganos internos, huevo intrauterino gigante y galería epidérmica al activar el corte histológico."
  },
  "p34-sarcoptes-scabiei": {
    parasiteId: "p34-sarcoptes-scabiei",
    speciesName: "Sarcoptes scabiei var hominis",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Formas evolutivas",
    availableStages: [
      "Hembra adulta grávida (300–450 × 250–350 µm)",
      "Surco acarino en estrato córneo (Raspado / Dermatoscopía)",
      "Macho adulto (200–240 × 150–200 µm)",
      "Larva hexápoda (6 patas) y Huevo embrionado (150 × 100 µm)"
    ],
    statusNote: "Reconstrucción 3D hiperrealista de las 4 formas de Sarcoptes scabiei var. hominis."
  },
  "p35": {
    parasiteId: "p35",
    speciesName: "Pediculus humanus capitis",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Formas evolutivas",
    availableStages: [
      "Hembra adulta grávida (2.4–3.3 mm, ápice bífido en W con gonópodos y huevos intrauterinos 3D en corte histológico)",
      "Macho adulto (2.0–2.6 mm, 1.er par de patas robusto, ápice redondeado y edeago quitinoso)",
      "Liendre viable adherida al cabello (0.8 mm, vaina de cemento, opérculo con aerópilos y embrión 3D interno)",
      "Ninfa hematófaga juvenil (1.1–2.0 mm, estadio hemimetábolo con mesenterón ingurgitado)"
    ],
    statusNote: "Reconstrucción 3D educativa interactiva de las 4 formas de Pediculus humanus capitis con órganos y huevos internos 3D al activar el corte histológico."
  },
  "p35-pediculus-humanus-capitis": {
    parasiteId: "p35-pediculus-humanus-capitis",
    speciesName: "Pediculus humanus capitis",
    hasModel: true,
    modelType: "procedural_threejs",
    stagesCount: 4,
    badgeLabel: "Disponible · 4 Formas evolutivas",
    availableStages: [
      "Hembra adulta grávida (2.4–3.3 mm)",
      "Macho adulto (2.0–2.6 mm)",
      "Liendre viable adherida al cabello (0.8 × 0.3 mm)",
      "Ninfa hematófaga juvenil (1.1–2.0 mm)"
    ],
    statusNote: "Reconstrucción 3D educativa interactiva de las 4 formas de Pediculus humanus capitis."
  }
};

/**
 * Consulta la configuración de modelo 3D para un parásito según su ID estable
 */
export function getParasite3DConfig(parasiteId: string): Parasite3DConfig | null {
  const norm = parasiteId.toLowerCase().trim();
  if (PARASITE_3D_REGISTRY[norm]) {
    return PARASITE_3D_REGISTRY[norm];
  }
  if (norm === "micro-4" || norm === "p01" || norm.includes("falciparum")) {
    return PARASITE_3D_REGISTRY["micro-4"];
  }
  if (norm === "micro-6" || norm === "p02" || norm.includes("giardia") || norm.includes("duodenalis") || norm.includes("lamblia")) {
    return PARASITE_3D_REGISTRY["micro-6"];
  }
  if (norm === "p03" || norm.includes("vivax")) {
    return PARASITE_3D_REGISTRY["p03"];
  }
  if (norm === "p04" || norm.includes("ovale")) {
    return PARASITE_3D_REGISTRY["p04"];
  }
  if (norm === "p05" || norm.includes("malariae")) {
    return PARASITE_3D_REGISTRY["p05"];
  }
  if (norm === "p06" || norm.includes("toxocara")) {
    return PARASITE_3D_REGISTRY["p06"];
  }
  if (norm === "p07" || norm.includes("histolytica")) {
    return PARASITE_3D_REGISTRY["p07"];
  }
  if (norm === "p08" || norm.includes("cryptosporidium")) {
    return PARASITE_3D_REGISTRY["p08"];
  }
  if (norm === "p09" || norm.includes("cyclospora")) {
    return PARASITE_3D_REGISTRY["p09"];
  }
  if (norm === "p10" || norm.includes("cystoisospora") || norm.includes("isospora")) {
    return PARASITE_3D_REGISTRY["p10"];
  }
  if (norm === "p11" || norm.includes("toxoplasma")) {
    return PARASITE_3D_REGISTRY["p11"];
  }
  if (norm === "p12" || norm.includes("trichomonas")) {
    return PARASITE_3D_REGISTRY["p12"];
  }
  if (norm === "p13" || norm.includes("cruzi") || norm.includes("trypanosoma")) {
    return PARASITE_3D_REGISTRY["p13"];
  }
  if (norm === "p14" || norm.includes("donovani") || norm.includes("infantum")) {
    return PARASITE_3D_REGISTRY["p14"];
  }
  if (norm === "p15" || norm.includes("braziliensis") || norm.includes("viannia")) {
    return PARASITE_3D_REGISTRY["p15"];
  }
  if (norm === "p16" || norm.includes("babesia")) {
    return PARASITE_3D_REGISTRY["p16"];
  }
  if (norm === "p25-taenia-solium" || norm === "p25" || norm.includes("taenia-solium") || norm.includes("solium")) {
    return PARASITE_3D_REGISTRY["p25-taenia-solium"];
  }
  if (norm === "p26" || norm === "p26-taenia-saginata" || norm.includes("taenia-saginata") || norm.includes("saginata")) {
    return PARASITE_3D_REGISTRY["p26"];
  }
  if (norm === "p27" || norm === "p27-echinococcus-granulosus" || norm.includes("echinococcus") || norm.includes("granulosus")) {
    return PARASITE_3D_REGISTRY["p27"];
  }
  if (norm === "p34" || norm === "p34-sarcoptes-scabiei" || norm.includes("sarcoptes") || norm.includes("scabiei")) {
    return PARASITE_3D_REGISTRY["p34"];
  }
  if (norm === "p35" || norm === "p35-pediculus-humanus-capitis" || norm.includes("pediculus") || norm.includes("capitis")) {
    return PARASITE_3D_REGISTRY["p35"];
  }
  return null;
}

/**
 * Determina de forma segura y estricta si una especie cuenta con un modelo 3D disponible
 */
export function hasParasite3DModel(parasiteId: string): boolean {
  const cfg = getParasite3DConfig(parasiteId);
  return Boolean(cfg?.hasModel);
}
