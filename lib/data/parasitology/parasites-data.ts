import { ParasiteCard, ParasiteGroup, AnatomicLocalization } from "./types";
import { TAENIA_SOLIUM_CARD } from "./taenia-solium";
import { PARASITE_CARDS } from "../microbiology/parasites";

/**
 * Mapeo de grupos taxonómicos desde el catálogo previo hacia la taxonomía estándar
 */
function mapGroup(typeBadge: string): ParasiteGroup {
  const lower = typeBadge.toLowerCase();
  if (lower.includes("cestodo")) return "Cestodos";
  if (lower.includes("nematodo")) return "Nematodos";
  if (lower.includes("trematodo")) return "Trematodos";
  if (lower.includes("apicomplejo") || lower.includes("esporozoario")) return "Protozoos apicomplejos";
  if (lower.includes("flagelado")) return "Protozoos flagelados";
  if (lower.includes("ameba") || lower.includes("ameboide")) return "Protozoos ameboides";
  if (lower.includes("ciliado")) return "Protozoos ciliados";
  if (lower.includes("ectoparásito") || lower.includes("ácaro") || lower.includes("piojo")) return "Ectoparásitos";
  return "Protozoos flagelados";
}

/**
 * Detección preliminar de localizaciones anatómicas a partir del texto clínico
 */
function inferLocalization(name: string, clinical: string, stain: string): AnatomicLocalization[] {
  const locs: AnatomicLocalization[] = [];
  const text = `${name} ${clinical} ${stain}`.toLowerCase();
  
  if (text.includes("intestino delgado") || text.includes("duodeno") || text.includes("yeyuno") || text.includes("esteatorrea") || text.includes("ascaris") || text.includes("giardia")) {
    locs.push("Intestino delgado");
  }
  if (text.includes("colon") || text.includes("recto") || text.includes("disentería") || text.includes("apéndice") || text.includes("enterobius") || text.includes("trichuris") || text.includes("histolytica")) {
    locs.push("Intestino grueso");
  }
  if (text.includes("hígado") || text.includes("biliar") || text.includes("hepátic") || text.includes("fasciola") || text.includes("absceso hepático") || text.includes("hidatidosis") || text.includes("echinococcus")) {
    locs.push("Hígado y vías biliares");
  }
  if (text.includes("cerebro") || text.includes("snc") || text.includes("mening") || text.includes("encefal") || text.includes("neurocisticercosis") || text.includes("naegleria") || text.includes("acanthamoeba")) {
    locs.push("Sistema nervioso central (SNC)");
  }
  if (text.includes("músculo") || text.includes("miocard") || text.includes("subcutáneo") || text.includes("chagas") || text.includes("trichinella")) {
    locs.push("Musculatura y tejido subcutáneo");
  }
  if (text.includes("eritrocit") || text.includes("sangre") || text.includes("malaria") || text.includes("plasmodium") || text.includes("babesia") || text.includes("leishmania visceral")) {
    locs.push("Sangre y sistema reticuloendotelial");
  }
  if (text.includes("pulmón") || text.includes("pulmon") || text.includes("respirat") || text.includes("loeffler") || text.includes("quiste hidatídico pulmonar")) {
    locs.push("Vías respiratorias y pulmón");
  }
  if (text.includes("vaginal") || text.includes("urogenital") || text.includes("orina") || text.includes("haematobium") || text.includes("trichomonas")) {
    locs.push("Tracto urogenital");
  }
  if (text.includes("ojo") || text.includes("ocular") || text.includes("queratitis") || text.includes("larva migrans ocular")) {
    locs.push("Ojo");
  }
  if (text.includes("piel") || text.includes("escabiosis") || text.includes("sarna") || text.includes("pediculosis") || text.includes("leishmania cutánea") || text.includes("larva migrans cutánea")) {
    locs.push("Piel y anexos");
  }

  // Fallback si no hubo coincidencia
  if (locs.length === 0) {
    locs.push("Intestino delgado");
  }

  return locs;
}

/**
 * Genera el catálogo completo de 35 especies, vinculando la ficha maestra de T. solium
 * y estructurando las 34 especies complementarias con su nivel de contenido (parcial o pendiente).
 */
export const ALL_PARASITES: ParasiteCard[] = PARASITE_CARDS.map((p) => {
  // Caso de referencia completa: Taenia solium
  if (p.name.toLowerCase().includes("taenia solium")) {
    return TAENIA_SOLIUM_CARD;
  }

  const group = mapGroup(p.typeBadge || "");
  const locs = inferLocalization(p.name, p.clinicalPresentation, p.stainOrGenetics || "");

  // Marcas de disponibilidad en los otros submódulos de Parasitología
  const isFalciparum = p.name.toLowerCase().includes("plasmodium falciparum") || p.id === "micro-4";
  const isGiardia = p.name.toLowerCase().includes("giardia") || p.id === "micro-6" || p.id === "p02";
  const isVivax = p.name.toLowerCase().includes("plasmodium vivax") || p.id === "p03";
  const isOvale = p.name.toLowerCase().includes("plasmodium ovale") || p.id === "p04";
  const isMalariae = p.name.toLowerCase().includes("plasmodium malariae") || p.id === "p05";
  const isSaginata = p.name.includes("saginata");
  const isNana = p.name.includes("nana");
  const isHistolytica = p.name.includes("histolytica");
  const isEchinococcus = p.name.includes("Echinococcus");
  const isFasciola = p.name.includes("Fasciola");
  const isTrichinella = p.name.includes("Trichinella");
  const isSarcoptes = p.name.toLowerCase().includes("sarcoptes") || p.id === "p34";
  const isPediculus = p.name.toLowerCase().includes("pediculus") || p.id === "p35";

  const hasMicroscopy = isSaginata || isNana || isHistolytica;
  const hasGeography = isEchinococcus || isFasciola || isTrichinella;
  const hasCases = isSaginata || isNana;

  return {
    id: p.id,
    code: p.pdfId || p.id.toUpperCase(),
    scientificName: p.name,
    commonNames: p.aliases || [],
    group: group,
    status: "parcial" as const,
    statusNote: isFalciparum
      ? "Ficha clínica con reconstrucción 3D interactiva de formas sanguíneas (trofozoíto en anillo intraeritrocitario y gametocito maduro en media luna) verificada con CDC DPDx Malaria."
      : isGiardia
      ? "Ficha clínica con reconstrucción 3D interactiva de sus 2 formas evolutivas (trofozoíto piriforme binucleado con disco ventral y quiste ovalado tetranucleado) verificada con CDC DPDx Giardiasis."
      : isVivax
      ? "Ficha clínica con reconstrucción 3D hiperrealista de sus 4 formas evolutivas (trofozoíto ameboide en reticulocito agrandado con puntos de Schüffner, esquizonte maduro de 16 merozoítos, gametocito redondo compacto e hipnozoíto hepático durmiente) verificada con CDC DPDx Malaria."
      : isOvale
      ? "Ficha clínica con reconstrucción 3D hiperrealista de sus 4 formas evolutivas (trofozoíto compacto en eritrocito ovalado con extremos fimbriados y puntos de James, esquizonte de 8 merozoítos, gametocito ovalado e hipnozoíto hepático) verificada con CDC DPDx Malaria."
      : isMalariae
      ? "Ficha clínica con reconstrucción 3D hiperrealista de sus 4 formas sanguíneas diagnósticas (trofozoíto ecuatorial «en banda», esquizonte en roseta «cabeza de margarita» con pigmento central negro, gametocito compacto y anillo en «ojo de pájaro») verificada con CDC DPDx Malaria."
      : isSaginata
      ? "Ficha clínica con reconstrucción 3D interactiva de sus 4 estadios (estróbilo adulto, escólex inerme con 4 ventosas, huevo embrionado y Cysticercus bovis) verificada con CDC DPDx Taeniasis."
      : isEchinococcus
      ? "Ficha clínica con reconstrucción 3D interactiva de sus 4 formas evolutivas (quiste hidatídico unilocular con capa laminar PAS+, adulto diminuto de 3 proglótides, protoescólex invaginado con arena hidatídica y huevo embrionado) verificada con CDC DPDx Echinococcosis."
      : isSarcoptes
      ? "Ficha clínica con reconstrucción 3D hiperrealista de sus 4 formas evolutivas y diagnósticas (hembra adulta grávida con huevo gigante intrauterino 3D, surco acarino en estrato córneo con huevos y escíbalos, macho adulto con ventosas en el 4.º par de patas y larva hexápoda con huevo embrionado) verificada con CDC DPDx Scabies."
      : isPediculus
      ? "Ficha clínica con reconstrucción 3D interactiva de sus 4 formas evolutivas (hembra adulta grávida con huevos intrauterinos 3D, macho adulto con edeago quitinoso, liendre viable adherida al tallo piloso con embrión interno y ninfa hematófaga) verificada con CDC DPDx Pediculosis."
      : "Ficha clínica resumida. La monografía exhaustiva multidimensional con fuentes primarias directas se encuentra en desarrollo.",
    hosts: isFalciparum || isVivax || isOvale || isMalariae
      ? {
          definitive: ["Mosquito hembra del género Anopheles (ciclo esporogónico sexual en el intestino medio y glándulas salivales)."],
          intermediate: [
            isVivax || isOvale
              ? "Ser humano (esquizogonia exoeritrocitaria hepática con formación de hipnozoítos durmientes y ciclo eritrocitario asexual)."
              : "Ser humano (esquizogonia exoeritrocitaria hepática primaria sin hipnozoítos y ciclo eritrocitario asexual)."
          ],
        }
      : isGiardia
      ? {
          definitive: ["Ser humano y diversos mamíferos según ensamblaje genético (ciclo monoxénico directo)."],
          intermediate: ["No posee hospedador intermediario (ciclo directo fecal-oral)."],
        }
      : isSaginata
      ? {
          definitive: ["Ser humano (único hospedador definitivo; aloja el cestodo adulto en el yeyuno)."],
          intermediate: ["Ganado bovino (Bos taurus / Bos indicus), que desarrolla Cysticercus bovis en su musculatura estriada."],
        }
      : isEchinococcus
      ? {
          definitive: ["Perro doméstico (Canis lupus familiaris) y otros cánidos silvestres (alojan miles de adultos diminutos de 2–7 mm en el intestino delgado)."],
          intermediate: ["Ganado ovino, bovino, caprino, porcino y camélidos (desarrollan quistes hidatídicos viscerales fértiles)."],
          accidental: ["Ser humano (hospedador intermediario accidental «fondo de saco» tras ingerir huevos excretados por cánidos; desarrolla hidatidosis quística hepática o pulmonar)."],
        }
      : isSarcoptes
      ? {
          definitive: ["Ser humano (Homo sapiens), hospedador específico obligado de la variedad Sarcoptes scabiei var. hominis (ectoparásito permanente del estrato córneo epidérmico)."],
          intermediate: ["No posee hospedador intermediario (ciclo completo de huevo → larva hexápoda → protoninfa → tritoninfa → adulto sobre e intraepidérmico en un mismo individuo)."],
          accidental: ["Las variedades animales (ej. var. canis) pueden penetrar temporalmente la piel humana causando dermatitis pruriginosa autolimitada sin excavar surcos ni reproducirse de forma sostenida."],
        }
      : isPediculus
      ? {
          definitive: ["Ser humano (Homo sapiens), único hospedador específico obligado (ectoparásito permanente estenoxeno del cuero cabelludo)."],
          intermediate: ["No posee hospedador intermediario ni reservorios animales (ciclo hemimetábolo directo en el cabello humano)."],
        }
      : {
          definitive: ["Humano y/u otros vertebrados según ciclo epidemiológico."],
          intermediate: ["Variable según especie (consultar ciclo específico)."],
          accidental: ["Humano en zoonosis accidentales."],
        },
    localization: locs,
    transmissionRoutes: [p.transmission],
    infectiveForms: isFalciparum || isVivax || isOvale || isMalariae
      ? [
          "Esporozoítos fusiformes móviles inoculados por la hembra de Anopheles durante la picadura (para el ser humano).",
          "En transmisión no vectorial (transfusional, congénita o por agujas): trofozoítos/merozoítos intraeritrocitarios (carecen de fase de hipnozoíto hepático)."
        ]
      : isGiardia
      ? ["Quiste maduro tetranucleado ingerido en agua, alimentos o por vía fecal-oral directa (resiste la cloración habitual y sobrevive meses en agua fría)."]
      : isSaginata
      ? [
          "Para el ser humano (teniasis): Cisticerco viable (Cysticercus bovis) ingerido en carne bovina cruda o insuficientemente cocida.",
          "Para el ganado bovino (cisticercosis bovina): Huevo embrionado con oncosfera hexacanta eliminado en heces humanas (no causa cisticercosis en humanos)."
        ]
      : isEchinococcus
      ? [
          "Para el ser humano y ganado (hidatidosis / equinococosis quística): Huevo embrionado (30–37 µm) con oncosfera hexacanta eliminado en heces de perros infectados (agua, verduras, tierra o pelaje canino).",
          "Para el perro u otros cánidos (equinococosis intestinal): Protoescólices viables contenidos en quistes hidatídicos al ingerir vísceras crudas de ganado."
        ]
      : isSarcoptes
      ? [
          "Hembra adulta recién fecundada (y en menor medida ninfas/larvas errantes) transmitida por contacto cutáneo directo y prolongado piel con piel (incluyendo contacto familiar y sexual).",
          "En la sarna costrosa (noruega), transmisión altamente eficiente incluso por contacto breve o a través de fómites (ropa de cama, prendas, tapicería) debido a la presencia de miles a millones de ácaros en las escamas hiperqueratósicas."
        ]
      : isPediculus
      ? [
          "Adultos móviles (hembra grávida o macho) y ninfas hematófagas transmitidos principalmente por contacto directo cabeza con cabeza (no saltan ni vuelan; se desplazan hasta 23 cm/min aferrándose al cabello).",
          "De forma secundaria e infrecuente, formas móviles o liendres viables recientes en fómites compartidos (peines, cepillos, gorros o almohadas)."
        ]
      : ["Ver ciclo biológico correspondiente."],
    diagnosticForms: isFalciparum
      ? [
          "Trofozoítos en anillo (citoplasma fino, 1 o 2 puntos de cromatina, formas appliqué/accolé y multiparasitismo en eritrocitos normocíticos).",
          "Gametocitos maduros con morfología característica en media luna (falciformes) en frotis sanguíneo teñido con Giemsa."
        ]
      : isVivax
      ? [
          "Trofozoítos marcadamente ameboides (pseudópodos citoplasmáticos tenues con gran vacuola) dentro de reticulocitos agrandados (1.5–2×) y deformables con fino punteado eosinofílico de Schüffner.",
          "Esquizontes maduros grandes que contienen 12 a 24 merozoítos (promedio 16) rodeando pigmento hemozoína pardo-dorado coalescente, y gametocitos esféricos/ovales compactos que llenan el eritrocito agrandado."
        ]
      : isOvale
      ? [
          "Trofozoítos en anillo robustos y compactos (no ameboides) en eritrocitos discretamente agrandados, de contorno ovalado o elipsoidal con extremos fimbriados (deshilachados en flecos) y punteado de James (Schüffner grueso y precoz).",
          "Esquizontes maduros con 6 a 12 merozoítos grandes (promedio 8) dispuestos alrededor de pigmento pardo oscuro, y gametocitos redondos/ovalados en hematíes fimbriados."
        ]
      : isMalariae
      ? [
          "Trofozoítos maduros con configuración ecuatorial «en banda» a través de eritrocitos normocíticos o microcíticos senescentes (sin agrandamiento celular ni granulaciones de Schüffner) y anillos gruesos en «ojo de pájaro».",
          "Esquizontes maduros en «roseta» o «cabeza de margarita» con 6 a 12 merozoítos (típicamente 8–10) dispuestos simétricamente alrededor de un grumo central compacto de hemozoína negra gruesa."
        ]
      : isGiardia
      ? [
          "Quistes ovalados (8–19 µm × 7–10 µm, promedio 11–14 µm) con pared hialina lisa, citoplasma retraído, 4 núcleos anteriores y fibrillas longitudinales en heces formadas o diarreicas.",
          "Trofozoítos piriformes binucleados (10–20 µm × 5–15 µm) con simetría bilateral, disco ventral adhesivo, cuerpos medianos y 4 pares de flagelos en heces líquidas o contenido duodenal."
        ]
      : isSaginata
      ? [
          "Proglótides grávidas rectangulares (16–20 mm × 5–7 mm) con 15 a 20 (hasta 30) ramas uterinas laterales dicotómicas por lado, que reptan activamente a través del esfínter anal.",
          "Escólex inerme cuadrangular (1.5–2.0 mm) con 4 ventosas acetabulares musculares y ausencia total de rostelo y de ganchos.",
          "Huevos esféricos (31–43 µm) con embrióforo radiado y oncosfera hexacanta (morfológicamente indistinguibles de Taenia solium al microscopio óptico)."
        ]
      : isEchinococcus
      ? [
          "Quiste hidatídico unilocular en hígado (65–70%) o pulmón (20–25%) con pared trilaminar: periquiste fibroso del hospedador, membrana laminar acelular hialina intensamente PAS-positiva y capa germinativa nucleada con vesículas prolígeras y vesículas hijas.",
          "Arena hidatídica (sedimento microscópico patognomónico): protoescólices invaginados (100–200 µm) con doble corona de 30–36 ganchos rostelares, corpúsculos calcáreos birrefringentes y ganchos libres sueltos en forma de daga (22–40 µm).",
          "En el hospedador definitivo canino: cestodo adulto diminuto (2–7 mm) compuesto exclusivamente por escólex armado y 3 proglótides (1 inmadura, 1 madura y 1 grávida terminal)."
        ]
      : isSarcoptes
      ? [
          "Hembra adulta (300–450 × 250–350 µm) e idiosoma globoso «en forma de tortuga» con estriaciones transversales finas, escamas triangulares dorsales, 14 espinas cónicas posterodorsales, epímeros I fusionados en «Y», ventosas acampanadas pediculadas en patas I–II y cerdas largas en patas III–IV.",
          "Macho adulto (200–240 × 150–200 µm) con ambulacros pediculados y ventosa en los pares de patas I, II y IV (solo el par III termina en cerda larga) y aparato copulador ventral entre las coxas IV; larva hexápoda (110–140 µm) provista únicamente de 3 pares de patas.",
          "Huevos ovalados grandes (150 × 100 µm) de cáscara hialina fina en distintos estadios embrionarios y escíbalos (bolas fecales pardo-amarillentas oscuras) alineados dentro del surco acarino en el estrato córneo."
        ]
      : isPediculus
      ? [
          "Adultos ápteros dorsoventralmente aplanados (hembra 2.4–3.3 mm con ápice abdominal bífido en W y gonópodos; macho 2.0–2.6 mm con ápice redondeado y edeago quitinoso), cabeza más angosta que el tórax con antenas de 5 artejos y 3 pares de patas prensiles con garra tarsal y espolón tibial oponible.",
          "Ninfas hematófagas juveniles (3 estadios hemimetábolos de 1.1 a 2.0 mm) observadas desplazándose sobre el cuero cabelludo (regiones retroauricular y occipital).",
          "Liendres viables (0.8 × 0.3 mm) ovoides, translúcidas a color caramelo, con opérculo abovedado provisto de aerópilos, firmemente cementadas al tallo piloso a ≤6 mm del cuero cabelludo (las cáscaras blancas vacías a >1 cm indican infestación antigua o tratada)."
        ]
      : ["Muestra microscópica, serológica o molecular según indicación."],
    clinicalSummary: {
      syndromes: [p.clinicalPresentation],
      keySymptoms: [p.examPearl],
      severeComplications: p.virulenceFactors || ["Complicaciones según estadio e inmunocompetencia."],
    },
    diagnosticMethods: isFalciparum || isVivax || isOvale || isMalariae
      ? [
          {
            name: "Frotis sanguíneo fino y gota gruesa con tinción de Giemsa a pH 7.2 (estándar de oro parasitológico)",
            sampleType: "Sangre periférica capilar o venosa con EDTA (toma seriada cada 6–12 h si la primera es negativa)",
            indication: isVivax
              ? "Identificación de reticulocitos agrandados (1.5–2×) con granulaciones de Schüffner, trofozoítos ameboides y esquizontes de 12–24 merozoítos"
              : isOvale
              ? "Identificación de eritrocitos ovalados con extremos fimbriados, punteado de James prominente y esquizontes de ~8 merozoítos"
              : isMalariae
              ? "Identificación de trofozoítos en banda ecuatorial, esquizontes en margarita (6–12 merozoítos con pigmento central) y ausencia de puntos de Schüffner"
              : "Sospecha clínica de malaria en todo paciente con fiebre y antecedente de viaje o residencia en área endémica",
            limitations: isVivax || isOvale
              ? "La tinción a pH ácido (<7.0) puede ocultar los puntos de Schüffner/James; los hipnozoítos hepáticos son microscópicamente indetectables en sangre periférica."
              : isMalariae
              ? "Las parasitemias crónicas de P. malariae suelen ser muy bajas (<0.01%), requiriendo examen exhaustivo de gota gruesa o PCR."
              : "Los trofozoítos maduros y esquizontes suelen secuestrarse en la microvasculatura profunda; en sangre periférica predominan anillos y gametocitos.",
          },
          {
            name: "Pruebas inmunocromatográficas rápidas (pLDH / aldolasa / HRP-2), PCR específica y tamizaje cuantitativo de G6PD",
            sampleType: "Sangre total con EDTA",
            indication: isVivax || isOvale
              ? "Confirmación de especie (especialmente P. ovale curtisi vs P. ovale wallikeri) y determinación obligatoria de actividad de G6PD antes de prescribir primaquina o tafenoquina para cura radical antirrecaída"
              : "Apoyo diagnóstico rápido o confirmación molecular en parasitemias submicroscópicas o infecciones mixtas",
            limitations: "Las RDT basadas únicamente en HRP-2 solo detectan P. falciparum y tienen menor sensibilidad para P. vivax, P. ovale y P. malariae.",
          }
        ]
      : isGiardia
      ? [
          {
            name: "Examen coproparasitológico seriado (montaje húmedo con Lugol, concentración y tinción permanente de Tricrómico)",
            sampleType: "Heces frescas o preservadas (3 muestras seriadas en días alternos)",
            indication: "Diarrea aguda o prolongada, meteorismo, esteatorrea o síndrome de malabsorción intestinal",
            limitations: "La excreción de quistes es intermitente; una sola muestra negativa no descarta giardiasis.",
          },
          {
            name: "Inmunofluorescencia directa (DFA), inmunoensayo enzimático de coproantígenos (EIA) y paneles moleculares (NAAT/PCR)",
            sampleType: "Heces",
            indication: "Confirmación de alta sensibilidad o tamizaje simultáneo con Cryptosporidium spp.",
            limitations: "Mayor costo que la microscopía convencional; no evalúan viabilidad parasitaria postratamiento inmediato.",
          }
        ]
      : isSaginata
      ? [
          {
            name: "Examen macroscópico y microscópico de proglótides grávidas (aclaramiento o tinción con carmín de Semichon / tinta china)",
            sampleType: "Proglótides expulsadas espontáneamente o recuperadas en heces (fijadas en etanol 70% o formol)",
            indication: "Diferenciación específica entre Taenia saginata (≥15 ramas uterinas dicotómicas, ovario bilobulado, esfínter vaginal) y Taenia solium (7–13 ramas dendríticas, ovario trilobulado)",
            limitations: "Manipular siempre con bioseguridad hasta descartar Taenia solium (cuyos huevos sí causan neurocisticercosis).",
          },
          {
            name: "Examen coproparasitológico seriado (concentración) y técnica de cinta adhesiva perianal (método de Graham)",
            sampleType: "Heces seriadas e impronta perianal",
            indication: "Detección de huevos de Taenia spp. (la impronta perianal aumenta la sensibilidad en T. saginata por la migración activa de las proglótides)",
            limitations: "Los huevos por sí solos solo permiten informar «Taenia sp.», no distinguen la especie sin proglótides o PCR.",
          }
        ]
      : isEchinococcus
      ? [
          {
            name: "Ecografía abdominal (clasificación OMS-IWGE CE1–CE5), Tomografía Computarizada (TC) y Resonancia Magnética",
            sampleType: "Estudio por imágenes de hígado, tórax u otros parénquimas",
            indication: "Pilar diagnóstico primario para estadificar actividad biológica del quiste (CE1 unilocular con arena hidatídica, CE2 multivesicular con vesículas hijas, CE3 con desprendimiento laminar «signo del camalote», CE4–CE5 inactivos/calcificados)",
            limitations: "Quistes simples pequeños (CL) requieren diagnóstico diferencial con quistes biliares simples o neoplasias quísticas.",
          },
          {
            name: "Serología escalonada (ELISA IgG de tamizaje e Inmunoblot / Western Blot confirmatorio) e histopatología PAS de pieza quirúrgica o líquido de PAIR",
            sampleType: "Suero; pieza quirúrgica o aspirado obtenido exclusivamente bajo protocolo PAIR con cobertura de albendazol",
            indication: "Confirmación inmunológica e identificación patognomónica de la membrana laminar acelular intensamente PAS-positiva, protoescólices y ganchos libres",
            limitations: "CONTRAINDICADA la punción diagnóstica a ciegas por riesgo de shock anafiláctico letal y siembra peritoneal/pleural secundaria; los quistes pulmonares o intactos calcificados pueden ser seronegativos.",
          }
        ]
      : isSarcoptes
      ? [
          {
            name: "Acarotest / Raspado epidérmico de surcos acarinos intactos con aceite mineral o KOH al 10% (estándar parasitológico de confirmación)",
            sampleType: "Escamas del techo completo de surcos acarinos o pápulas perladas no excoriadas (pliegues interdigitales, cara flexora de muñecas, codos, bordes laterales de manos/pies, aréolas o genitales)",
            indication: "Confirmación directa patognomónica al observar bajo microscopía óptica (10× / 40×) cualquiera de los elementos de la tríada: adultos/larvas de S. scabiei, huevos ovalados (150 × 100 µm) o escíbalos fecales",
            limitations: "En la escabiosis clásica el paciente aloja solo 10–15 hembras adultas en toda la piel, por lo que la sensibilidad de un raspado aislado es <50% (un resultado negativo NO descarta sarna). El aceite mineral preserva mejor los escíbalos fecales que el KOH.",
          },
          {
            name: "Dermatoscopía de epiluminiscencia (10×) y Prueba de la tinta del surco (Burrow Ink Test)",
            sampleType: "Inspección in vivo no invasiva de surcos serpiginosos (2–15 mm)",
            indication: "Identificación inmediata en consulta del «signo del ala delta» o «avión a reacción con estela» (triángulo pigmentado marrón oscuro del gnatosoma y patas anteriores de la hembra al final de la galería blanquecina con huevos y heces)",
            limitations: "Menos sensible en pieles muy pigmentadas o lesiones intensamente excoriadas o impetiginizadas.",
          }
        ]
      : isPediculus
      ? [
          {
            name: "Peinado en húmedo sistematizado con lendrera metálica de dientes finos (≤0.2–0.3 mm) e inspección de regiones retroauricular y occipital",
            sampleType: "Cabello acondicionado/húmedo y especímenes recolectados",
            indication: "Estándar de oro clínico para confirmar infestación activa (requiere hallar al menos una ninfa o adulto vivo móvil; el peinado en húmedo es 3–4 veces más sensible que la inspección visual en seco)",
            limitations: "El hallazgo aislado de liendres sin formas móviles, especialmente si están a >6–10 mm del cuero cabelludo, no confirma infestación activa y no justifica retratamiento pediculicida.",
          },
          {
            name: "Entomoscopía / Dermatoscopía capilar y montaje microscópico aclarado con KOH al 10% o lactofenol",
            sampleType: "Adultos, ninfas o tallos pilosos con liendres adheridas",
            indication: "Confirmación morfológica de especie (diferenciación frente a Pthirus pubis) y evaluación de viabilidad ovular (embrión con mancha ocular intacto vs. liendre eclosionada sin opérculo o pseudoliendres/moldes queratínicos)",
            limitations: "P. humanus capitis y P. humanus corporis son morfológicamente casi idénticos al microscopio y se distinguen por su nicho ecológico (cuero cabelludo vs. costuras de la ropa).",
          }
        ]
      : [
          {
            name: "Examen de rutina / Ficha microbiológica",
            sampleType: "Heces / Sangre / Tejido según sospecha",
            indication: "Cuadro clínico compatible con " + p.name,
            limitations: "Requiere correlación con antecedentes epidemiológicos.",
          }
        ],
    treatmentFirstLine: p.firstLineTreatment,
    preventionControl: isFalciparum || isVivax || isOvale || isMalariae
      ? [
          "Quimioprofilaxis específica al viajar a zonas endémicas y uso de mosquiteros impregnados con insecticida de larga duración (LLINs) y repelentes tópicos.",
          isVivax || isOvale
            ? "Cura radical obligatoria (esquizonticida sanguíneo + primaquina por 14 días o tafenoquina dosis única previo descarte de deficiencia de G6PD) para erradicar los hipnozoítos hepáticos y evitar recaídas tardías."
            : "Diagnóstico precoz y tratamiento completo supervisado con esquizonticidas sanguíneos (cloroquina o ACT según sensibilidad regional) y tamizaje de donantes en bancos de sangre."
        ]
      : isGiardia
      ? [
          "Potabilización mediante filtración (poro ≤1 µm) o ebullición del agua; los quistes de Giardia son resistentes a la cloración estándar.",
          "Lavado estricto de manos e higiene fecal-oral en hogares, jardines infantiles y manipuladores de alimentos."
        ]
      : isSaginata
      ? [
          "Cocción completa de la carne vacuna (temperatura interna ≥63–71 °C) o congelación prolongada (-20 °C durante al menos 7–10 días) para inactivar Cysticercus bovis.",
          "Inspección médico-veterinaria en mataderos y saneamiento ambiental de aguas residuales para evitar la contaminación de pasturas bovinas."
        ]
      : isEchinococcus
      ? [
          "Interrupción del ciclo perro-oveja: prohibición absoluta de alimentar perros con vísceras crudas (achuras) en faenas domiciliarias o rurales y control veterinario en mataderos.",
          "Desparasitación periódica de perros rurales y pastores con praziquantel (cada 45 días), vacunación ovina (EG95) y lavado riguroso de manos y hortalizas."
        ]
      : isSarcoptes
      ? [
          "Tratamiento simultáneo y sincrónico del caso índice y de TODOS los convivientes y contactos estrechos/sexuales (incluso si están asintomáticos, ya que la primo-infestación tiene un período de incubación inmunológico de 2 a 6 semanas sin prurito). Repetir la 2.ª dosis al día 7–14 (permetrina tópica 5% de cuello a pies por 8–14 h o ivermectina oral 200 µg/kg, ya que no son 100% ovicidas).",
          "Lavado de ropa interior, pijamas, sábanas y toallas utilizadas en las 72 h previas con agua caliente (≥50–60 °C) y secadora caliente, o aislamiento en bolsa plástica cerrada por 3 a 7 días (el ácaro sobrevive solo 48–72 h fuera de la piel humana). En sarna costrosa, aislamiento de contacto estricto y terapia combinada (ivermectina oral multidosis + permetrina tópica + queratolítico)."
        ]
      : isPediculus
      ? [
          "Revisión simultánea de convivientes familiares y tratamiento sincrónico de todos los casos con formas móviles activas (aplicar 2.ª dosis al día 7–10 con pediculicidas no ovicidas como permetrina 1% o dimeticona, acompañado de lendrera húmeda).",
          "Evitar el contacto directo cabeza con cabeza y el uso compartido de peines, cepillos o gorros; lavar ropa de cama y gorros a ≥55–60 °C (los adultos mueren en 24–48 h fuera del cuero cabelludo; no se recomienda fumigar ambientes ni excluir al niño de la escuela)."
        ]
      : [
          "Higiene de manos y agua potable tratada.",
          "Cocción adecuada de alimentos y control sanitario de vectores/reservorios."
        ],
    has3DModel:
      isFalciparum ||
      isGiardia ||
      isVivax ||
      isOvale ||
      isMalariae ||
      isSaginata ||
      isEchinococcus ||
      isSarcoptes ||
      isPediculus,
    hasMicroscopy,
    hasLifeCycle: false,
    hasGeography,
    hasCases,
    reviewDate: "2026-10-17",
    reviewer: "MedStudy Parasitología - Equipo Editorial",
    sources: isFalciparum || isVivax || isOvale || isMalariae
      ? [
          {
            title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Malaria (Plasmodium spp.)",
            organization: "Centers for Disease Control and Prevention (CDC)",
            url: "https://www.cdc.gov/dpdx/malaria/index.html",
          },
          {
            title: isVivax
              ? "CDC DPDx Bench Aid: Laboratory Diagnosis of Malaria — Plasmodium vivax"
              : isOvale
              ? "CDC DPDx Bench Aid: Laboratory Diagnosis of Malaria — Plasmodium ovale"
              : isMalariae
              ? "CDC DPDx Bench Aid: Laboratory Diagnosis of Malaria — Plasmodium malariae"
              : "CDC DPDx Bench Aid: Laboratory Diagnosis of Plasmodium falciparum",
            organization: "CDC Division of Parasitic Diseases and Malaria",
            url: isVivax
              ? "https://www.cdc.gov/dpdx/resources/pdf/benchAids/malaria/Pvivax_benchaidV2.pdf"
              : isOvale
              ? "https://www.cdc.gov/dpdx/resources/pdf/benchAids/malaria/Povale_benchaidV2.pdf"
              : isMalariae
              ? "https://www.cdc.gov/dpdx/resources/pdf/benchAids/malaria/Pmalariae_benchaidV2.pdf"
              : "https://www.cdc.gov/dpdx/resources/pdf/benchAids/malaria/Pfalciparum_benchaidV2.pdf",
          },
          {
            title: "WHO Guidelines for Malaria & Vigilancia de Malaria MINSAL - ISP Chile",
            organization: "World Health Organization / Ministerio de Salud de Chile",
            url: "https://www.who.int/teams/global-malaria-programme/guidelines-for-malaria",
          }
        ]
      : isGiardia
      ? [
          {
            title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Giardiasis (Giardia duodenalis)",
            organization: "Centers for Disease Control and Prevention (CDC)",
            url: "https://www.cdc.gov/dpdx/giardiasis/index.html",
          },
          {
            title: "CDC DPDx Bench Aid: Laboratory Diagnosis of Giardiasis — Giardia duodenalis",
            organization: "CDC Division of Parasitic Diseases and Malaria",
            url: "https://www.cdc.gov/dpdx/resources/pdf/benchAids/Giardia_benchaid.pdf",
          }
        ]
      : isSaginata
      ? [
          {
            title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Taeniasis (Taenia saginata & Taenia solium)",
            organization: "Centers for Disease Control and Prevention (CDC)",
            url: "https://www.cdc.gov/dpdx/taeniasis/index.html",
          },
          {
            title: "CDC DPDx Bench Aid: Taenia saginata vs. Taenia solium Differential Diagnosis",
            organization: "CDC Division of Parasitic Diseases and Malaria",
            url: "https://www.cdc.gov/dpdx/taeniasis/index.html",
          }
        ]
      : isEchinococcus
      ? [
          {
            title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Echinococcosis (Echinococcus granulosus sensu lato)",
            organization: "Centers for Disease Control and Prevention (CDC)",
            url: "https://www.cdc.gov/dpdx/echinococcosis/index.html",
          },
          {
            title: "WHO Informal Working Group on Echinococcosis (WHO-IWGE): International classification of ultrasound images in cystic echinococcosis",
            organization: "World Health Organization / Acta Tropica",
            url: "https://www.who.int/news-room/fact-sheets/detail/echinococcosis",
          },
          {
            title: "Guías Clínicas y Vigilancia de Hidatidosis / Equinococosis Quística MINSAL - ISP Chile",
            organization: "Ministerio de Salud de Chile / ISP",
            url: "https://www.ispch.gob.cl",
          }
        ]
      : isSarcoptes
      ? [
          {
            title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Scabies (Sarcoptes scabiei var. hominis)",
            organization: "Centers for Disease Control and Prevention (CDC)",
            url: "https://www.cdc.gov/dpdx/scabies/index.html",
          },
          {
            title: "Arlian LG, Morgan MS. A review of Sarcoptes scabiei: past, present and future.",
            organization: "Parasites & Vectors (2017) 10:297",
            url: "https://pubmed.ncbi.nlm.nih.gov/28633664/",
          },
          {
            title: "Guía Clínica de Sarna (Escabiosis) y Pediculosis - Ministerio de Salud de Chile (MINSAL)",
            organization: "MINSAL / ISP Chile",
            url: "https://www.minsal.cl",
          }
        ]
      : isPediculus
      ? [
          {
            title: "CDC DPDx - Laboratory Identification of Parasites of Public Health Concern: Pediculosis (Pediculus humanus capitis & P. humanus corporis)",
            organization: "Centers for Disease Control and Prevention (CDC)",
            url: "https://www.cdc.gov/dpdx/pediculosis/index.html",
          },
          {
            title: "CDC - Clinical Overview of Head Lice (Pediculus humanus var. capitis)",
            organization: "CDC Division of Parasitic Diseases and Malaria",
            url: "https://www.cdc.gov/lice/hcp/clinical-overview/head-lice.html",
          },
          {
            title: "Guía Clínica de Sarna y Pediculosis - Ministerio de Salud de Chile (MINSAL)",
            organization: "MINSAL / ISP Chile",
            url: "https://www.minsal.cl",
          }
        ]
      : [
          {
            title: "CDC Parasites - Laboratory Identification of Parasites of Public Health Concern (DPDx)",
            organization: "CDC",
            url: "https://www.cdc.gov/dpdx/",
          },
          {
            title: "Control de las parasitosis y guías clínicas MINSAL Chile",
            organization: "MINSAL / ISP Chile",
            url: "https://www.ispch.gob.cl",
          }
        ],
  };
});
