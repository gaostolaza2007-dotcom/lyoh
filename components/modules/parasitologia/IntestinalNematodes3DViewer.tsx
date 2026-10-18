"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ============================================================================
// INTESTINAL NEMATODES 3D VIEWER (P19 Ascaris, P20 Enterobius, P21 Trichuris, P22 Strongyloides)
// Hyper-realistic procedural 3D models with 4 stages per species,
// histological cut-plane, analytical normals, and unified Atlas HUD.
// ============================================================================

export type IntestinalNematodeSpeciesCode = "p19" | "p20" | "p21" | "p22";
type ShaderMode = "biological" | "giemsa" | "sem" | "xray";

interface RegionMeta {
  id: number;
  name: string;
  shortName: string;
  subtitle: string;
  color: string;
  description: string;
  clinicalNote: string;
  focusTarget: [number, number, number];
  focusDistance: number;
  labelPoint: [number, number, number];
}

interface StageMeta {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  sizeMicrons: string;
  summary: string;
  microscopyTip: string;
  defaultTarget: [number, number, number];
  defaultCameraPos: [number, number, number];
  regions: RegionMeta[];
}

interface SpeciesMeta {
  code: IntestinalNematodeSpeciesCode;
  scientificName: string;
  commonName: string;
  groupBadge: string;
  stainLabel: string;
  stages: StageMeta[];
}

const SPECIES_META: Record<IntestinalNematodeSpeciesCode, SpeciesMeta> = {
  p19: {
    code: "p19",
    scientificName: "Ascaris lumbricoides",
    commonName: "Áscaris / Lombriz Intestinal Gigante",
    groupBadge: "Geohelminto Nematodo · Ascaridida",
    stainLabel: "Lugol / Kato-Katz",
    stages: [
      {
        id: "egg_fertile",
        name: "Huevo Fértil Corticado Mamelonado (60 × 45 µm)",
        shortName: "1. Huevo Fértil Mamelonado",
        badge: "Forma Diagnóstica e Infectante (con L1/L2)",
        sizeMicrons: "55–75 × 35–50 µm",
        summary:
          "Huevo ovalado o redondeado con tres capas concéntricas: una cubierta externa albuminoide groseramente mamelonada teñida de pardo-dorado por pigmentos biliares, una gruesa capa media quitinosa hialina (resistencia mecánica) y una membrana interna lipídica de ascarósidos (impermeable a desinfectantes). En el suelo húmedo desarrolla la larva infectante L1/L2.",
        microscopyTip:
          "Activa el 'Corte Histológico / Sección 3D' para abrir la corteza albuminoide mamelonada y la capa quitinosa y observar la larva infectante enrollada en su interior.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 3.8],
        regions: [
          {
            id: 1,
            name: "Cubierta Albuminoide Mamelonada Externa (Teñida por Bilis)",
            shortName: "Capa Mamelonada",
            subtitle: "Mamelones redondeados prominentes de mucopolisacáridos",
            color: "#b45309",
            description:
              "Capa externa rugosa con múltiples protuberancias redondeadas (mamelones) secretada por la pared uterina y teñida de color pardo-dorado por los pigmentos biliares fecales (estercobilina).",
            clinicalNote:
              "Su relieve mamelonado permite identificar el huevo de Ascaris de inmediato a bajo aumento (10x) en examen directo con solución salina o Lugol y en frotis grueso de Kato-Katz.",
            focusTarget: [-0.45, 0.35, 0.45],
            focusDistance: 2.3,
            labelPoint: [-0.85, 0.65, 0.55],
          },
          {
            id: 2,
            name: "Capa Media Quitinosa Hialina y Capa Interna de Ascarósidos",
            shortName: "Capa Quitinosa + Ascarósidos",
            subtitle: "Barrera mecánica y química de extrema resistencia",
            color: "#fde68a",
            description:
              "Debajo de la corteza mamelonada se halla una gruesa pared quitinosa-proteica hialina (resistencia estructural) tapizada internamente por una membrana lipídica de glicolípidos (ascarósidos) totalmente impermeable.",
            clinicalNote:
              "La capa de ascarósidos hace que los huevos de Ascaris sobrevivan años en el suelo y resistan el formol al 10%, ácidos fuertes y el cloro habitual del agua potable.",
            focusTarget: [0.4, 0.25, 0.15],
            focusDistance: 2.2,
            labelPoint: [0.78, 0.52, 0.2],
          },
          {
            id: 3,
            name: "Larva Infectante Enrollada (L1 / L2 Rabditoide Interna)",
            shortName: "Larva L1/L2 Interna",
            subtitle: "Embrión larvado tras 2–4 semanas de geoembrionación",
            color: "#fbbf24",
            description:
              "En heces recién emitidas contiene un blastómero esférico central con espacios polares claros; tras 2–4 semanas en suelo sombreado y húmedo (22–30 °C) desarrolla una larva rabditoide L1 que muda a L2/L3 infectante dentro del huevo.",
            clinicalNote:
              "Ascaris NO transmite infección de persona a persona directa: el huevo recién eliminado en heces no es infectante hasta cumplir su maduración en el suelo (geohelminto).",
            focusTarget: [0.0, -0.05, 0.1],
            focusDistance: 2.0,
            labelPoint: [0.05, -0.45, 0.35],
          },
          {
            id: 4,
            name: "Espacios Polares Hialinos y Gránulos Biliares Fecales",
            shortName: "Espacios Polares",
            subtitle: "Cámara semilunar entre el embrión y la membrana interna",
            color: "#92400e",
            description:
              "Cámaras polares claras situadas entre la membrana vitelina/ascarósida y la masa embrionaria o larva en movimiento.",
            clinicalNote:
              "Ayudan a distinguir huevos fértiles viables (con retracción polar nítida) de los huevos infértiles cuyos gránulos ocupan desorganizadamente toda la cavidad.",
            focusTarget: [0.0, 0.72, 0.0],
            focusDistance: 2.2,
            labelPoint: [-0.25, 0.95, 0.0],
          },
        ],
      },
      {
        id: "egg_differential",
        name: "Diferencial: Huevo Fértil Decorticado vs Huevo Infértil Elongado",
        shortName: "2. Decorticado vs Infértil",
        badge: "Diagnóstico Diferencial Coproparasitológico",
        sizeMicrons: "60 × 45 µm vs 90 × 43 µm",
        summary:
          "Comparación 3D lado a lado: a la izquierda, un huevo fértil decorticado (que perdió su capa albuminoide mamelonada pero conserva su gruesa pared quitinosa lisa y su embrión/larva interna); a la derecha, un huevo infértil alargado en tonel (85–90 µm) con cubierta fina irregular y relleno de gránulos refringentes amorfos de lecitina.",
        microscopyTip:
          "Usa el Corte Histológico para comparar la pared quitinosa gruesa del huevo decorticado frente a la pared delgada y el relleno granular desorganizado del huevo infértil.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.4, 4.3],
        regions: [
          {
            id: 1,
            name: "Huevo Fértil Decorticado (60 × 45 µm, Pared Quitinosa Lisa)",
            shortName: "Huevo Fértil Decorticado",
            subtitle: "Sin capa mamelonada pero con pared quitinosa gruesa y embrión",
            color: "#fcd34d",
            description:
              "En el 5–10% de los casos el huevo fértil pierde su capa albuminoide mamelonada externa, mostrando únicamente su gruesa pared quitinosa hialina lisa de doble contorno y su blastómero o larva central.",
            clinicalNote:
              "¡Trampa diagnóstica clásica! No debe confundirse con un huevo de uncinaria (Ancylostoma/Necator): el huevo decorticado de Ascaris tiene una pared quitinosa mucho más gruesa (3–4 µm) que la fina cáscara hialina de las uncinarias.",
            focusTarget: [-1.05, 0.1, 0.1],
            focusDistance: 2.4,
            labelPoint: [-1.15, 0.85, 0.2],
          },
          {
            id: 2,
            name: "Huevo Infértil Elongado en Tonel (85–90 × 43 µm)",
            shortName: "Huevo Infértil Elongado",
            subtitle: "Más largo y estrecho, producido por hembras no fecundadas",
            color: "#b45309",
            description:
              "Huevo no fecundado mucho más largo y estrecho (hasta 90 µm), de contorno abarrilado o irregular, con una capa albuminoide delgada y mamelones escasos o distorsionados.",
            clinicalNote:
              "Se observa cuando la paciente alberga exclusivamente hembras vírgenes o al inicio/final de la oviposición. No es infectante, pero confirma infección activa por hembras adultas de Ascaris.",
            focusTarget: [1.0, 0.1, 0.1],
            focusDistance: 2.5,
            labelPoint: [1.1, 0.95, 0.2],
          },
          {
            id: 3,
            name: "Gránulos de Lecitina Refringentes Desorganizados (Interior Infértil)",
            shortName: "Gránulos de Lecitina",
            subtitle: "Masa vitelina amorfa que ocupa toda la cavidad del huevo infértil",
            color: "#f59e0b",
            description:
              "En lugar de un blastómero esférico bien delimitado o una larva, el interior del huevo infértil está completamente lleno de glóbulos lipídicos y gránulos de lecitina gruesos y refringentes sin organización celular.",
            clinicalNote:
              "Por su menor densidad lipídica y mayor peso específico, los huevos infértiles NO flotan bien en sulfato de zinc (método de Faust) y se detectan mejor por sedimentación (Ritchie) o Kato-Katz.",
            focusTarget: [1.0, -0.1, 0.15],
            focusDistance: 2.2,
            labelPoint: [1.05, -0.65, 0.3],
          },
          {
            id: 4,
            name: "Embrión / Larva Viable del Huevo Fértil Decorticado",
            shortName: "Embrión Viable",
            subtitle: "Capacidad infectante intacta pese a perder la corteza externa",
            color: "#fef08a",
            description:
              "El embrión o larva L1/L2 en el interior del huevo decorticado conserva intacta su viabilidad y capacidad infectante gracias a que la capa quitinosa y la membrana de ascarósidos permanecen íntegras.",
            clinicalNote:
              "Ambos tipos de huevos fértiles (corticados y decorticados) se contabilizan juntos al calcular los huevos por gramo de heces (hpg) para clasificar la intensidad de la ascariasis.",
            focusTarget: [-1.05, -0.1, 0.15],
            focusDistance: 2.2,
            labelPoint: [-1.1, -0.68, 0.3],
          },
        ],
      },
      {
        id: "adults_lips",
        name: "Adultos Macroscópicos (Hembra 30 cm / Macho) y 3 Labios Cefálicos",
        shortName: "3. Adultos y 3 Labios",
        badge: "Nematodo Intestinal Mayor del Ser Humano",
        sizeMicrons: "Hembra 20–35 cm · Macho 15–30 cm",
        summary:
          "El nematodo intestinal de mayor tamaño en humanos, de color rosado-cremoso nacarado. El extremo anterior posee 3 labios carnosos prominentes (1 dorsal y 2 ventrolaterales). La hembra mide hasta 35 cm con cola recta cónica y úteros dobles con 27 millones de huevos; el macho es menor y presenta el extremo posterior curvado ventralmente con 2 espículas copulatrices.",
        microscopyTip:
          "Desliza el Corte Histológico para abrir la cutícula y la capa muscular polimiaria de la hembra y ver el tubo digestivo y las asas uterinas repletas de huevos.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.5, 4.5],
        regions: [
          {
            id: 1,
            name: "Hembra Adulta Cilíndrica Rosado-Cremosa (20–35 cm, Cola Recta)",
            shortName: "Hembra Adulta (30 cm)",
            subtitle: "Cutícula colágena estriada, líneas laterales y musculatura polimiaria",
            color: "#fda4af",
            description:
              "Cuerpo cilíndrico fusiforme de color rosado nacarado en vida, con finas estriaciones transversales cuticulares, dos líneas laterales blanquecinas visibles y extremo posterior recto y cónico.",
            clinicalNote:
              "Habita libre en la luz del yeyuno manteniéndose contra el peristaltismo gracias a su tono muscular. Los antihelmínticos como pamoato de pirantel producen parálisis espástica y la piperazina parálisis flácida para su expulsión sin migración errática.",
            focusTarget: [-0.2, 0.45, 0.2],
            focusDistance: 2.8,
            labelPoint: [-0.55, 0.85, 0.35],
          },
          {
            id: 2,
            name: "Tres Labios Cefálicos Trilobulados (1 Dorsal y 2 Ventrolaterales)",
            shortName: "3 Labios Cefálicos",
            subtitle: "Bordes denticulados finos y papilas sensoriales gemelas",
            color: "#fb7185",
            description:
              "El extremo cefálico de Ascaris está coronado por tres labios carnosos dispuestos en tríada simétrica: un labio dorsal ancho con dos papilas dobles y dos labios ventrolaterales, cada uno con bordes internos finamente denticulados.",
            clinicalNote:
              "Cuando un gusano adulto es expulsado por boca, nariz o ano, la visualización con lupa de los 3 labios cefálicos confirma de inmediato Ascaris lumbricoides y descarta lombrices de tierra u otros artefactos.",
            focusTarget: [-1.45, 0.05, 0.15],
            focusDistance: 2.0,
            labelPoint: [-1.65, 0.55, 0.25],
          },
          {
            id: 3,
            name: "Tubo Digestivo y Asas Uterinas Didelfas (200.000 Huevos/Día)",
            shortName: "Úteros y Tubo Digestivo",
            subtitle: "Ovarios filiformes enrollados y úteros dobles llenos de huevos",
            color: "#fef08a",
            description:
              "Al seccionar el pseudoceloma de la hembra se observa el esófago muscular, el intestino aplanado y los dos largos tubos ovárico-uterinos (aparato reproductor didelfo) enrollados alrededor del intestino.",
            clinicalNote:
              "Cada hembra adulta deposita aproximadamente 200.000 huevos diarios, lo que explica la altísima sensibilidad del examen directo de heces incluso en infecciones leves.",
            focusTarget: [0.1, 0.2, 0.0],
            focusDistance: 2.3,
            labelPoint: [0.35, 0.65, 0.2],
          },
          {
            id: 4,
            name: "Macho Adulto (15–30 cm): Extremo Caudal Curvado y 2 Espículas",
            shortName: "Macho (Cola Curvada + 2 Espículas)",
            subtitle: "Extremo posterior enrollado ventralmente sin bolsa copulatriz",
            color: "#f43f5e",
            description:
              "El macho adulto es más delgado y corto que la hembra y se distingue macroscópicamente porque su extremo caudal está incurvado ventralmente en forma de bastón o gancho, del cual emergen 2 espículas copulatrices quitinosas subiguales.",
            clinicalNote:
              "La fiebre alta, anestésicos o ciertos fármacos pueden estimular a los adultos (especialmente machos) a migrar erráticamente hacia el colédoco (colangitis/pancreatitis ascaridiana), conducto de Wirsung o apéndice.",
            focusTarget: [0.65, -0.55, 0.3],
            focusDistance: 2.4,
            labelPoint: [0.95, -0.85, 0.45],
          },
        ],
      },
      {
        id: "loffler_lung",
        name: "Síndrome de Löffler: Migración Larvaria Alveolar Pulmonar (L3/L4)",
        shortName: "4. Síndrome de Löffler (Pulmón)",
        badge: "Ciclo de Loos · Neumonitis Eosinofílica",
        sizeMicrons: "Larva pulmonar 1.2–1.8 mm",
        summary:
          "Durante el ciclo de Loos (8–14 días post-ingestión del huevo embrionado), las larvas L3 viajan por vía porta-hígado-corazón derecho hasta los capilares pulmonares, rompen la membrana alveolocapilar hacia la luz alveolar donde mudan a L4 y desencadenan una neumonitis eosinofílica transitoria (Síndrome de Löffler) con cristales de Charcot-Leyden.",
        microscopyTip:
          "Observa la larva L3/L4 emergiendo del capilar pulmonar roto hacia el alvéolo rodeada de eosinófilos bilobulados y cristales bipiramidales de Charcot-Leyden.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.5, 4.4],
        regions: [
          {
            id: 1,
            name: "Larva Pulmonar L3/L4 de Ascaris (con Alas Laterales)",
            shortName: "Larva L3/L4 Pulmonar",
            subtitle: "Ruptura del capilar y ascenso por el árbol traqueobronquial",
            color: "#fde047",
            description:
              "Larva de 1.5 mm provista de alas cuticulares laterales prominentes que perfora la pared capilar y alveolar, crece y muda a L4 en el alvéolo antes de ascender por los bronquios hasta la faringe para ser deglutida.",
            clinicalNote:
              "Durante esta fase pulmonar (primeras 2–3 semanas post-infección), los exámenes coproparasitológicos de heces son NEGATIVOS porque los gusanos aún no han llegado al intestino ni han alcanzado la madurez sexual (periodo prepatente de 60–75 días).",
            focusTarget: [0.0, 0.25, 0.15],
            focusDistance: 2.2,
            labelPoint: [0.05, 0.85, 0.25],
          },
          {
            id: 2,
            name: "Pared Alveolar Pulmonar y Capilar Roto (Microhemorragia)",
            shortName: "Alvéolo y Microhemorragia",
            subtitle: "Extravasación de eritrocitos al espacio alveolar",
            color: "#e11d48",
            description:
              "Tabique interalveolar edematoso con disrupción endotelial y epitelial por el paso mecánico y enzimático de la larva, causando microhemorragias intraalveolares.",
            clinicalNote:
              "Explica la tos seca o con expectoración hemoptoica, disnea, sibilancias e infiltrados pulmonares migratorios y fugaces en la radiografía de tórax que desaparecen espontáneamente en 1–2 semanas.",
            focusTarget: [-0.85, -0.2, 0.2],
            focusDistance: 2.4,
            labelPoint: [-1.1, -0.55, 0.3],
          },
          {
            id: 3,
            name: "Infiltrado de Eosinófilos y Cristales de Charcot-Leyden",
            shortName: "Eosinófilos + Charcot-Leyden",
            subtitle: " Cristales bipiramidales hexagonales de galectina-10 (CLC)",
            color: "#c084fc",
            description:
              "Denso infiltrado de granulocitos eosinófilos de núcleo bilobulado y gránulos rojizos junto con agujas bipiramidales hexagonales brillantes de Charcot-Leyden formadas por la cristalización de galectina-10 eosinofílica.",
            clinicalNote:
              "El Síndrome de Löffler cursa con eosinofilia periférica marcada (20–60%) e IgE sérica muy elevada; en el esputo pueden hallarse cristales de Charcot-Leyden, eosinófilos y ocasionalmente larvas de Ascaris.",
            focusTarget: [0.8, 0.1, 0.3],
            focusDistance: 2.2,
            labelPoint: [1.05, 0.45, 0.4],
          },
          {
            id: 4,
            name: "Exudado Mucoso Bronquiolar (Espiral de Curschmann)",
            shortName: "Moco Bronquiolar",
            subtitle: "Hipersecreción mucosa inducida por citoquinas Th2 (IL-4, IL-5, IL-13)",
            color: "#38bdf8",
            description:
              "Moco espeso rico en mucina MUC5AC dentro de la luz alveolar y bronquiolar que atrapa restos celulares y transporta las larvas hacia la glotis mediante la escalera mucociliar.",
            clinicalNote:
              "No se recomienda dar albendazol durante la fase pulmonar aguda intensa de Löffler para evitar una reacción inflamatoria masiva por muerte sincrónica de larvas en el parénquima pulmonar; se trata con broncodilatadores/corticoides si hay broncoespasmo severo y se desparasita tras resolverse el cuadro respiratorio.",
            focusTarget: [0.2, -0.45, -0.3],
            focusDistance: 2.4,
            labelPoint: [0.35, -0.8, -0.35],
          },
        ],
      },
    ],
  },
  p20: {
    code: "p20",
    scientificName: "Enterobius vermicularis",
    commonName: "Oxiuro (Pinworm)",
    groupBadge: "Nematodo Intestinal · Oxyurida",
    stainLabel: "Test de Graham (Cinta Adhesiva)",
    stages: [
      {
        id: "egg_d_shaped",
        name: "Huevo Asimétrico Planoconvexo en 'D' con Larva (55 × 25 µm)",
        shortName: "1. Huevo en 'D' (Planoconvexo)",
        badge: "Forma Diagnóstica e Infectante (4–6 h)",
        sizeMicrons: "50–60 × 20–30 µm",
        summary:
          "Huevo translúcido, incoloro y característicamente asimétrico en forma de letra 'D' (planoconvexo: un lado aplanado y el otro fuertemente convexo), con doble membrana hialina lisa. Es depositado ya embrionado en los pliegues perianales y contiene una larva giriniforme o enrollada que se vuelve infectante en apenas 4 a 6 horas a temperatura corporal.",
        microscopyTip:
          "Activa el Corte Histológico para seccionar la doble cubierta hialina en 'D' y examinar la larva plegada en su interior.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.4, 3.8],
        regions: [
          {
            id: 1,
            name: "Cubierta Hialina Asimétrica en 'D' (Cara Plana y Cara Convexa)",
            shortName: "Cáscara en 'D' Planoconvexa",
            subtitle: "Doble pared transparente incolora (no teñida por bilis)",
            color: "#e0f2fe",
            description:
              "Cubierta externa proteica-quitinosa lisa, transparente e incolora que presenta una geometría planoconvexa inconfundible: el borde dorsal es arqueado/convexo y el borde ventral es recto/aplanado, dándole silueta de letra 'D'.",
            clinicalNote:
              "Al ser depositados por la hembra directamente en la piel perianal (fuera de la luz colónica), los huevos de Enterobius NUNCA están teñidos por pigmentos biliares (son incoloros/hialinos) y rara vez (< 5%) aparecen en el examen coproparasitológico seriado de heces.",
            focusTarget: [0.0, 0.45, 0.3],
            focusDistance: 2.2,
            labelPoint: [-0.65, 0.75, 0.4],
          },
          {
            id: 2,
            name: "Larva Embrionada Plegada (Larva Giriniforme / L1-L2)",
            shortName: "Larva Interna (Infectante en 4–6 h)",
            subtitle: "Embrión reniforme o larva vermiforme móvil dentro del huevo",
            color: "#fef08a",
            description:
              "En el momento de la postura nocturna contiene un embrión giriniforme (en forma de renacuajo) que en solo 4 a 6 horas a la temperatura de la región perianal se transforma en una larva L1/L2 vermiforme plegada e infectante.",
            clinicalNote:
              "Esta rapidísima embrionación (4–6 h sin requerir suelo) explica la autoinfección mano-boca (rascado anal nocturno → uñas → boca), el contagio intrafamiliar en camas/ropa interior y la inhalación de huevos suspendidos en el polvo doméstico.",
            focusTarget: [0.0, 0.05, 0.0],
            focusDistance: 2.0,
            labelPoint: [0.55, 0.35, 0.25],
          },
          {
            id: 3,
            name: "Membrana Lipoidea Embrionaria Interna y Cámara Clara",
            shortName: "Membrana Lipoidea Interna",
            subtitle: "Doble contorno refringente al microscopio óptico",
            color: "#bae6fd",
            description:
              "Delgada capa interna lipídica que rodea directamente a la larva y crea el característico doble contorno refringente cuando se cierra el diafragma del condensador del microscopio.",
            clinicalNote:
              "Al ser translúcidos, los huevos de Enterobius se buscan con el condensador bajo y poca luz (objetivo 10x y 40x); el exceso de iluminación puede hacerlos pasar inadvertidos.",
            focusTarget: [0.45, 0.1, 0.2],
            focusDistance: 2.1,
            labelPoint: [0.85, -0.15, 0.3],
          },
          {
            id: 4,
            name: "Cinta Adhesiva Transparente de Celofán (Método de Graham)",
            shortName: "Cinta de Graham",
            subtitle: "Superficie adhesiva engomada aplicada en pliegues perianales",
            color: "#94a3b8",
            description:
              "Tira de cinta adhesiva transparente (Scotch tape) adherida sobre el portaobjetos de vidrio que captura los huevos pegajosos adheridos a la piel perianal mediante la matriz albuminoide uterina.",
            clinicalNote:
              "El Test de Graham debe tomarse por la mañana ANTES de defecar y antes del baño o aseo genital, durante 3 a 5 días consecutivos (alcanza > 90–95% de sensibilidad).",
            focusTarget: [0.0, -0.5, 0.0],
            focusDistance: 2.5,
            labelPoint: [-0.6, -0.7, 0.2],
          },
        ],
      },
      {
        id: "female_bulb",
        name: "Hembra Adulta Grávida: Alas Cefálicas, Bulbo Esofágico y Cola en Alfiler",
        shortName: "2. Hembra Adulta (Bulbo y Alas)",
        badge: "Morfología Patognomónica del Adulto",
        sizeMicrons: "8–13 mm × 0.4 mm",
        summary:
          "Gusano pequeño blanquecino fusiforme ('alfilerillo'). En su extremo anterior destaca la expansión cuticular estriada bilateral llamada alas cefálicas y un esófago muscular terminado en un gran bulbo esofágico esférico retroesofágico con aparato valvular. Su tercio posterior se afila en una cola larga y puntiaguda como un alfiler (oxyuris) y sus úteros están repletos de 11.000 huevos en 'D'.",
        microscopyTip:
          "Activa el Corte Histológico para ver en el interior de la hembra el bulbo esofágico esférico valvular y los úteros repletos de huevos planoconvexos en 'D'.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 4.3],
        regions: [
          {
            id: 1,
            name: "Cuerpo Fusiforme Blanquecino y Cola Larga Afilada ('Pinworm')",
            shortName: "Cuerpo y Cola en Alfiler",
            subtitle: "Tercio posterior adelgazado en punta fina transparente",
            color: "#f8fafc",
            description:
              "La hembra mide de 8 a 13 mm de longitud, es de color blanco nacarado brillante y su tercio caudal se estrecha progresivamente formando una punta hialina muy aguda similar a un alfiler.",
            clinicalNote:
              "Los padres suelen observar los pequeños gusanos blancos móviles de ~1 cm en la región perianal de los niños 2 a 3 horas después de que se duermen o sobre la superficie de las heces.",
            focusTarget: [0.95, 0.0, 0.0],
            focusDistance: 2.3,
            labelPoint: [1.35, 0.45, 0.15],
          },
          {
            id: 2,
            name: "Bulbo Esofágico Esférico Posterior (con Aparato Valvular)",
            shortName: "Bulbo Esofágico Esférico",
            subtitle: "Estructura patognomónica de Oxyurida precedida por un istmo",
            color: "#f43f5e",
            description:
              "El esófago muscular cilíndrico sufre una constricción (istmo) e inmediatamente se dilata en una esfera muscular prominente (bulbo esofágico) provista en su centro de un aparato valvular quitinoso trirradiado.",
            clinicalNote:
              "El bulbo esofágico esférico junto con las alas cefálicas permite identificar con certeza absoluta un adulto de Enterobius vermicularis incluso en cortes histológicos de apéndice cecal.",
            focusTarget: [-1.1, 0.0, 0.0],
            focusDistance: 2.0,
            labelPoint: [-1.1, 0.68, 0.15],
          },
          {
            id: 3,
            name: "Úteros Grávidos Distendidos (~11.000 Huevos en 'D')",
            shortName: "Úteros con Huevos en 'D'",
            subtitle: "Doble saco uterino que comprime el resto de órganos",
            color: "#bae6fd",
            description:
              "En la hembra grávida los dos úteros se dilatan masivamente hasta ocupar casi toda la cavidad corporal desde detrás del bulbo esofágico hasta el inicio de la cola, albergando unos 11.000 huevos planoconvexos.",
            clinicalNote:
              "Cuando la hembra queda completamente grávida, se desprende de la mucosa cecal y migra activamente por el colon hacia el margen anal durante la noche para depositar todos sus huevos en una sola tanda y luego morir.",
            focusTarget: [0.05, 0.0, 0.0],
            focusDistance: 2.2,
            labelPoint: [0.1, 0.72, 0.15],
          },
          {
            id: 4,
            name: "Alas Cefálicas (Expansiones Cuticulares Cervicales Estriadas)",
            shortName: "Alas Cefálicas",
            subtitle: "Aletas vesiculares transparentes a ambos lados de la boca",
            color: "#38bdf8",
            description:
              "Dos expansiones vesiculares simétricas y estriadas de la cutícula que flanquean el extremo cefálico dorsal y ventralmente, rodeando la boca trilabiada.",
            clinicalNote:
              "En cortes transversales histológicos (por ejemplo, en apendicitis o granulomas ectópicos peritoneales/vaginales), las dos crestas o espinas cuticulares laterales y las alas cefálicas son la firma histológica de Enterobius.",
            focusTarget: [-1.55, 0.0, 0.0],
            focusDistance: 1.9,
            labelPoint: [-1.65, -0.55, 0.15],
          },
        ],
      },
      {
        id: "graham_test",
        name: "Test de Graham: Oviposición Nocturna Perianal en Pliegues Cutáneos",
        shortName: "3. Oviposición Perianal (Graham)",
        badge: "Patogenia del Prurito Anal Nocturno",
        sizeMicrons: "Campo perianal 400 µm",
        summary:
          "Representación 3D del fenómeno clínico clave: la hembra grávida emerge por el esfínter anal durante el sueño, repta sobre los pliegues radiados perianales y deposita hileras de huevos en 'D' envueltos en una matriz albuminoide adherente e irritante que desencadena prurito anal e intranquilidad nocturna (bruxismo, insomnio, vulvovaginitis en niñas).",
        microscopyTip:
          "Observa la hembra depositando racimos de huevos planoconvexos sobre los pliegues epidérmicos y cómo la cinta adhesiva de Graham los captura.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.65, 4.4],
        regions: [
          {
            id: 1,
            name: "Hembra Grávida Reptando en Pliegues Perianales Nocturnos",
            shortName: "Hembra en Oviposición",
            subtitle: "Migración nocturna inducida por relajación del esfínter y menor temperatura",
            color: "#f8fafc",
            description:
              "La hembra emerge a través del ano, estimulada por el descenso de temperatura y la relajación muscular nocturna del huésped, y expulsa miles de huevos mediante contracciones uterinas o al desintegrarse por el rascado.",
            clinicalNote:
              "En niñas pequeñas, la hembra migratoria puede desviarse hacia el introito vaginal, uretra, útero, trompas de Falopio e incluso peritoneo pélvico, causando vulvovaginitis pruriginosa, flujo leucorreico o infecciones urinarias recurrentes por arrastre de coliformes.",
            focusTarget: [-0.35, 0.25, 0.1],
            focusDistance: 2.5,
            labelPoint: [-0.55, 0.78, 0.2],
          },
          {
            id: 2,
            name: "Racimos de Huevos en 'D' Adheridos con Matriz Albuminoide Irritante",
            shortName: "Racimos de Huevos en 'D'",
            subtitle: "Sustancia cementante proteica hipersensibilizante",
            color: "#7dd3fc",
            description:
              "Los huevos son secretados junto con una sustancia gelatinosa albuminoide uterina que los pega firmemente a la piel y al vello perianal y actúa como potente alérgeno local.",
            clinicalNote:
              "El prurito anal nocturno intenso NO se debe solo al movimiento mecánico del gusano, sino principalmente a una reacción de hipersensibilidad local frente a las secreciones uterinas adhesivas de la hembra.",
            focusTarget: [0.55, 0.1, 0.25],
            focusDistance: 2.2,
            labelPoint: [0.75, 0.62, 0.35],
          },
          {
            id: 3,
            name: "Pliegues Epidérmicos Perianales con Excoriaciones por Rascado",
            shortName: "Piel Perianal Excoriada",
            subtitle: "Puerta de entrada para sobreinfección bacteriana secundaria",
            color: "#fda4af",
            description:
              "Epidermis queratinizada de los pliegues radiados perianales mostrando eritema, edema y microfisuras por el rascado nocturno inconsciente.",
            clinicalNote:
              "El tratamiento de la enterobiasis (albendazol 400 mg o mebendazol 100 mg o pamoato de pirantel) SIEMPRE debe repetirse a las 2 semanas (porque los fármacos matan a los adultos pero no a los huevos embrionados) y administrarse a todo el grupo familiar simultáneamente.",
            focusTarget: [-0.2, -0.35, 0.2],
            focusDistance: 2.4,
            labelPoint: [-0.45, -0.75, 0.35],
          },
          {
            id: 4,
            name: "Lámina de Cinta Adhesiva Transparente (Captura de Graham)",
            shortName: "Captura en Cinta Adhesiva",
            subtitle: "Método diagnóstico de elección (> 90% sensibilidad en 3 muestras)",
            color: "#cbd5e1",
            description:
              "Superficie transparente de la cinta de celofán presionada sobre los pliegues perianales utilizando el extremo de un bajalenguas o tubo de ensayo antes de ser extendida sobre el portaobjetos.",
            clinicalNote:
              "Nunca se debe usar cinta esmerilada u opaca (Magic tape), ya que impide el paso de la luz del microscopio; debe ser cinta de celofán totalmente transparente.",
            focusTarget: [0.6, 0.45, 0.0],
            focusDistance: 2.4,
            labelPoint: [0.95, 0.85, 0.0],
          },
        ],
      },
      {
        id: "male_adult",
        name: "Macho Adulto (2–5 mm): Cola Curvada en Interrogación y 1 Espícula",
        shortName: "4. Macho Adulto (2–5 mm)",
        badge: "Dimorfismo Sexual · Raro en Muestras",
        sizeMicrons: "2–5 mm × 0.15–0.2 mm",
        summary:
          "El macho adulto de Enterobius vermicularis mide apenas 2 a 5 mm (menos de la mitad que la hembra). Comparte las alas cefálicas y el bulbo esofágico esférico anterior, pero su extremo posterior está truncado y fuertemente curvado ventralmente en forma de signo de interrogación ('?'), con alas caudales papilares y una única espícula copulatriz terminal.",
        microscopyTip:
          "Examina la curvatura ventral del extremo caudal y la espícula copulatriz única terminal (sin gubernáculo).",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 3.9],
        regions: [
          {
            id: 1,
            name: "Cuerpo Cilíndrico Pequeño (2–5 mm) Curvado en '?'",
            shortName: "Cuerpo del Macho (2–5 mm)",
            subtitle: "Muere en el ciego poco después de la cópula",
            color: "#e2e8f0",
            description:
              "Gusano mucho más corto y delgado que la hembra, con el tercio posterior arrollado hacia la cara ventral adoptando silueta de bastón o signo de interrogación.",
            clinicalNote:
              "Rara vez se observa en la región perianal porque los machos permanecen en la mucosa cecal/ileocecal y suelen morir y ser digeridos tras fecundar a las hembras.",
            focusTarget: [0.0, 0.15, 0.0],
            focusDistance: 2.3,
            labelPoint: [0.0, 0.72, 0.15],
          },
          {
            id: 2,
            name: "Alas Cefálicas, Bulbo Esofágico Esférico y Testículo Único",
            shortName: "Bulbo Esofágico + Testículo",
            subtitle: "Morfología cefálica idéntica a la hembra y tubo testicular monórquico",
            color: "#fb7185",
            description:
              "Presenta las mismas alas cefálicas bilaterales y el bulbo esofágico esférico valvular en el extremo anterior, seguidos en el pseudoceloma por el intestino y un tubo testicular único reflejado.",
            clinicalNote:
              "Confirma que el bulbo esofágico esférico es constante en ambos sexos de E. vermicularis.",
            focusTarget: [-0.85, 0.15, 0.0],
            focusDistance: 2.1,
            labelPoint: [-1.05, 0.68, 0.15],
          },
          {
            id: 3,
            name: "Espícula Copulatriz Única Terminal (70 µm, Sin Gubernáculo)",
            shortName: "Espícula Copulatriz Única",
            subtitle: " Aguja quitinosa curva flanqueada por alas caudales y papilas",
            color: "#f59e0b",
            description:
              "Del extremo cloacal subterminal emerge una única espícula copulatriz quitinosa ligeramente curvada de ~70 µm de longitud, desprovista de gubernáculo y rodeada por una pequeña expansión alar caudal con papilas.",
            clinicalNote:
              "Poseer 1 sola espícula copulatriz (al igual que Trichuris, pero sin vaina espinosa) lo diferencia de Ascaris y las uncinarias, que poseen 2 espículas.",
            focusTarget: [0.65, -0.35, 0.1],
            focusDistance: 1.9,
            labelPoint: [0.95, -0.55, 0.2],
          },
          {
            id: 4,
            name: "Crestas Cuticulares Laterales Prismáticas",
            shortName: "Crestas Laterales",
            subtitle: "Engrosamientos alares longitudinales a lo largo de los cordones laterales",
            color: "#38bdf8",
            description:
              "A lo largo de ambos flancos laterales del cuerpo corre una cresta cuticular triangular saliente que en los cortes transversales histológicos aparece como dos espinas laterales simétricas.",
            clinicalNote:
              "Signo diagnóstico clave para el patólogo al examinar cortes transversales de apéndices cecales resecados quirúrgicamente.",
            focusTarget: [0.1, -0.05, 0.25],
            focusDistance: 2.1,
            labelPoint: [-0.25, -0.55, 0.35],
          },
        ],
      },
    ],
  },
  p21: {
    code: "p21",
    scientificName: "Trichuris trichiura",
    commonName: "Tricocéfalo / Gusano Látigo (Whipworm)",
    groupBadge: "Geohelminto Nematodo · Trichinellida",
    stainLabel: "Lugol / Kato-Katz",
    stages: [
      {
        id: "egg_barrel",
        name: "Huevo en 'Barril' o 'Limón' con Tapones Mucosos Bipolares (52 × 22 µm)",
        shortName: "1. Huevo en Barril (Tapones Bipolares)",
        badge: "Forma Diagnóstica Patognomónica",
        sizeMicrons: "50–55 × 22–24 µm",
        summary:
          "Uno de los huevos más inconfundibles de la parasitología médica: tiene forma de barril, tonel o balón de rugby (o bandeja con asas), con una gruesa cáscara triple teñida de pardo-dorado intenso por la bilis y dos tapones mucosos hialinos refringentes que sobresalen en ambos polos. Sale sin embrionar en las heces y desarrolla la larva L1 infectante tras 2–4 semanas en el suelo.",
        microscopyTip:
          "Activa el Corte Histológico para seccionar la cáscara pardo-dorada y ver cómo se insertan los dos tapones mucosos polares y la masa ovular central.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 3.8],
        regions: [
          {
            id: 1,
            name: "Cáscara Triple en 'Barril' o 'Balón de Rugby' (Pardo-Dorada)",
            shortName: "Pared en Barril (Pardo-Dorada)",
            subtitle: "Cubierta lisa gruesa intensamente teñida por pigmentos biliares",
            color: "#b45309",
            description:
              "Pared lisa pero gruesa formada por tres capas (vitelina externa, quitinosa media y lipídica interna) que adquiere un color marrón-caoba o dorado brillante en el tránsito colónico.",
            clinicalNote:
              "Su silueta elipsoidal simétrica en barril es tan característica que un solo huevo en el frotis permite el diagnóstico definitivo de tricuriasis.",
            focusTarget: [0.0, 0.35, 0.3],
            focusDistance: 2.2,
            labelPoint: [-0.55, 0.68, 0.4],
          },
          {
            id: 2,
            name: "Tapones Mucosos Bipolares Hialinos Refringentes (Prominentes)",
            shortName: "Tapones Bipolares Hialinos",
            subtitle: "Opérculos mucoides translúcidos en ambos polos del huevo",
            color: "#e0f2fe",
            description:
              "En ambos extremos polares la capa quitinosa se interrumpe y aloja dos tapones mucopolisacáridos incoloros, translúcidos y refringentes que sobresalen como los tapones de un tonel.",
            clinicalNote:
              "Al ser ingerido el huevo embrionado, las enzimas digestivas en el íleon terminal y ciego disuelven estos tapones mucosos polares para que la larva L1 eclosione por uno de los polos (diferenciar de Capillaria philippinensis cuyos tapones son aplanados y la cáscara es estriada).",
            focusTarget: [0.92, 0.0, 0.0],
            focusDistance: 2.0,
            labelPoint: [1.18, 0.42, 0.15],
          },
          {
            id: 3,
            name: "Célula Ovular / Blastómero Central Sin Segmentar (o Larva L1 en Suelo)",
            shortName: "Embrión Central",
            subtitle: "Inmaduro en heces frescas; desarrolla larva L1 en 2–4 semanas en suelo",
            color: "#fde68a",
            description:
              "En heces recién emitidas el interior contiene una masa cigótica granulosa única sin segmentar; solo tras permanecer 15 a 30 días en tierra cálida, húmeda y sombreada se forma la larva L1 infectante.",
            clinicalNote:
              "Al igual que Ascaris, Trichuris es un geohelminto estricto: no hay transmisión directa persona a persona ni autoinfección; a menudo coexisten ambos parásitos por compartir el mismo mecanismo fecal-tierra-oral.",
            focusTarget: [0.0, 0.0, 0.0],
            focusDistance: 2.0,
            labelPoint: [0.05, -0.58, 0.25],
          },
          {
            id: 4,
            name: "Anillo Collarín Polar (Inserción Quitino-Mucosa)",
            shortName: "Collarín Polar",
            subtitle: "Reborde quitinoso engrosado que abraza la base de cada tapón",
            color: "#78350f",
            description:
              "Reborde anular oscuro donde termina la cáscara marrón quitinosa y se engarza cada tapón mucoso polar.",
            clinicalNote:
              "Destaca nítidamente tanto en examen en fresco como en el frotis de Kato-Katz aclarado con glicerina-verde de malaquita.",
            focusTarget: [-0.92, 0.0, 0.0],
            focusDistance: 2.0,
            labelPoint: [-1.18, -0.38, 0.15],
          },
        ],
      },
      {
        id: "adults_whipworm",
        name: "Adultos en 'Látigo' (Esticosoma Capilar Anterior y Cola en Cuerda de Reloj)",
        shortName: "2. Adultos en Látigo (Esticosoma)",
        badge: "3/5 Anteriores Capilares · 2/5 Posteriores Gruesos",
        sizeMicrons: "30–50 mm de longitud",
        summary:
          "El nombre 'tricocéfalo' (cabeza de pelo) y 'gusano látigo' se debe a que sus 3/5 anteriores son finísimos como un cabello y albergan el esófago rodeado por una fila de células glandulares gigantes (esticosoma de esticocitos), mientras que sus 2/5 posteriores son gruesos y carnosos ('mango del látigo') y contienen el intestino y los órganos reproductores. El macho enrolla su cola en espiral y posee una vaina espicular espinosa.",
        microscopyTip:
          "Activa el Corte Histológico para descubrir el esticosoma (collar de esticocitos) en la porción fina y el útero lleno de huevos en barril en el mango posterior.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.45, 4.5],
        regions: [
          {
            id: 1,
            name: "Porción Anterior Filiforme Capilar (3/5 del Cuerpo — 'Cuerda del Látigo')",
            shortName: "3/5 Anteriores Capilares",
            subtitle: "Extremo cefálico fino como un hilo con lanceta bucal diminuta",
            color: "#fef3c7",
            description:
              "Los tres quintos anteriores del gusano son extremadamente delgados (< 100 µm de diámetro), desprovistos de labios y dotados en la punta de una diminuta lanceta estilete para horadar el epitelio colónico.",
            clinicalNote:
              "Por algo se denominó originalmente Trichocephalus ('cabeza de pelo'): esta porción capilar vive permanentemente cosida dentro de la mucosa del ciego y colon ascendente.",
            focusTarget: [-0.95, 0.25, 0.0],
            focusDistance: 2.3,
            labelPoint: [-1.25, 0.72, 0.15],
          },
          {
            id: 2,
            name: "Esticosoma (Fila Longitudinal de Esticocitos Glandulares)",
            shortName: "Esticosoma (Esticocitos)",
            subtitle: "Órgano glandular característico de Trichinellida (Trichuris y Trichinella)",
            color: "#f59e0b",
            description:
              "El esófago capilar está rodeado por una hilera única en 'collar de perlas' de grandes células glandulares secretoras llamadas esticocitos, cuyo conjunto forma el esticosoma.",
            clinicalNote:
              "Los esticocitos secretan la proteína formadora de poros TT47 y enzimas líticas que licúan las paredes de los enterocitos colónicos para crear un túnel sincitial del cual se alimenta el parásito.",
            focusTarget: [-0.55, 0.15, 0.0],
            focusDistance: 2.0,
            labelPoint: [-0.55, -0.45, 0.2],
          },
          {
            id: 3,
            name: "Porción Posterior Carnosa ('Mango del Látigo', 2/5 del Cuerpo) con Útero",
            shortName: "Mango Posterior + Útero",
            subtitle: "Hembra de extremo caudal recto/romo con útero lleno de huevos en barril",
            color: "#fda4af",
            description:
              "Los dos quintos posteriores del cuerpo se ensanchan bruscamente formando el 'mango del látigo' (1.5 mm de grosor), que en la hembra termina en un extremo recto redondeado y aloja el intestino y el útero repleto de huevos en barril.",
            clinicalNote:
              "Esta porción gruesa cuelga libre en la luz del ciego para permitir la cópula y la liberación de 3.000 a 20.000 huevos diarios a la corriente fecal.",
            focusTarget: [0.85, 0.25, 0.0],
            focusDistance: 2.3,
            labelPoint: [1.05, 0.78, 0.15],
          },
          {
            id: 4,
            name: "Macho Adulto: Cola en 'Cuerda de Reloj' y Vaina Espicular Espinosa",
            shortName: "Macho (Vaina Espinosa)",
            subtitle: "Espiral caudal de 360° con 1 espícula dentro de vaina cubierta de espinas",
            color: "#fb7185",
            description:
              "El extremo posterior grueso del macho está enrollado ventralmente en espiral completa como la cuerda de un reloj y presenta una larga espícula copulatriz única envuelta por una vaina prepucial eversible tapizada de espinas retrógradas.",
            clinicalNote:
              "La vaina espicular espinosa eversible en el extremo caudal en espiral es el rasgo morfológico definitivo del macho de Trichuris trichiura.",
            focusTarget: [0.8, -0.55, 0.25],
            focusDistance: 2.2,
            labelPoint: [1.1, -0.85, 0.35],
          },
        ],
      },
      {
        id: "colonic_tunnel",
        name: "Enhebrado Epitelial Sincitial en Mucosa Cecal (Proteína TT47)",
        shortName: "3. Túnel Sincitial en Mucosa",
        badge: "Histopatología Colónica · Enhebrado",
        sizeMicrons: "Corte histológico 250 µm",
        summary:
          "Vista histológica 3D del modo de fijación único de Trichuris trichiura: el extremo anterior capilar (con su esticosoma interno) se 'enhebra' como una aguja de coser a través de los enterocitos superficiales del ciego, fusionándolos mediante la proteína formadora de poros TT47 en un túnel sincitial intracelular, mientras el extremo posterior grueso pende hacia la luz colónica.",
        microscopyTip:
          "Observa cómo la porción anterior fina atraviesa varios enterocitos formando un túnel sincitial mientras la parte gruesa sobresale a la luz.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.55, 4.4],
        regions: [
          {
            id: 1,
            name: "Extremo Anterior Capilar Enhebrado (con Esticosoma Visible)",
            shortName: "Extremo Capilar Enhebrado",
            subtitle: "Fijación mecánica profunda que impide el arrastre peristáltico",
            color: "#fde68a",
            description:
              "La porción filiforme anterior entra y sale serpenteando dentro del epitelio mucoso colónico como un hilo cosido en una tela, exponiendo su hilera interna de esticocitos al cortar.",
            clinicalNote:
              "Este anclaje intraepitelial profundo explica por qué Trichuris es mucho más difícil de erradicar con dosis única de albendazol que Ascaris, requiriendo esquemas de 3 a 5 días de mebendazol o albendazol (o combinación con ivermectina).",
            focusTarget: [-0.35, 0.05, 0.1],
            focusDistance: 2.2,
            labelPoint: [-0.55, 0.65, 0.2],
          },
          {
            id: 2,
            name: "Túnel Sincitial Epitelial Inducido por Proteína TT47",
            shortName: "Túnel Sincitial (TT47)",
            subtitle: "Fusión de membranas laterales de enterocitos de criptas colónicas",
            color: "#fda4af",
            description:
              "La proteína secretada TT47 (de 47 kDa) inserta poros conductivos de iones en las membranas lipídicas de los enterocitos adyacentes, fusionándolos en un sincitio epitelial continuo que rodea el cuerpo anterior del gusano.",
            clinicalNote:
              "El parásito ingiere restos celulares licuados, líquido intersticial y eritrocitos extravasados (~0.005 mL de sangre/día por gusano, provocando anemia ferropénica cuando hay > 800 gusanos).",
            focusTarget: [-0.65, -0.1, 0.25],
            focusDistance: 2.2,
            labelPoint: [-0.95, -0.5, 0.35],
          },
          {
            id: 3,
            name: "Extremo Posterior Grueso Libre en la Luz del Ciego",
            shortName: "Extremo Posterior en Luz Cecal",
            subtitle: "Porción reproductora colgante que libera huevos en barril",
            color: "#f43f5e",
            description:
              "Los 2/5 posteriores carnosos emergen del túnel epitelial hacia la luz del ciego y colon ascendente, moviéndose libremente y depositando huevos con tapones bipolares.",
            clinicalNote:
              "En la colonoscopia se visualiza como pequeños gusanos blancos cuyo extremo grueso se agita en la luz colónica mientras su cabeza permanece clavada en la mucosa hiperémica.",
            focusTarget: [0.85, 0.45, 0.1],
            focusDistance: 2.4,
            labelPoint: [1.05, 0.85, 0.2],
          },
          {
            id: 4,
            name: "Microhemorragia Petequial e Infiltrado de Eosinófilos y Mastocitos",
            shortName: "Microhemorragia y Mastocitos",
            subtitle: "Desgranulación mediada por IgE e hiperperistaltismo reflejo",
            color: "#e11d48",
            description:
              "En la lámina propia subyacente se producen microhemorragias petequiales, infiltración por eosinófilos y mastocitos mucosos e irritación de las terminaciones nerviosas entéricas.",
            clinicalNote:
              "La inflamación local de los plexos nerviosos submucosos en el colon y recto genera tenesmo constante y pujo disentérico (Síndrome Disentérico por Trichuris).",
            focusTarget: [0.05, -0.35, 0.3],
            focusDistance: 2.3,
            labelPoint: [0.25, -0.75, 0.4],
          },
        ],
      },
      {
        id: "rectal_prolapse",
        name: "Prolapso Rectal por Tricuriasis Masiva Infantil",
        shortName: "4. Prolapso Rectal (Clínica)",
        badge: "Complicación Clásica · Disentería y Tenesmo",
        sizeMicrons: "Vista macro-microscópica",
        summary:
          "Complicación clínica patognomónica de la tricuriasis masiva en niños desnutridos: la invasión de cientos de tricocéfalos hasta la mucosa rectal produce proctitis edematosa sangrante, hipotonía de los músculos pélvicos y pujo/tenesmo incesante, provocando la eversión de la mucosa rectal (prolapso rectal) tapizada de gusanos blancos visibles a simple vista.",
        microscopyTip:
          "Observa los anillos edematosos de la mucosa rectal prolapsada con múltiples tricocéfalos blancos adheridos y huevos en barril en el moco sanguinolento.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.55, 4.4],
        regions: [
          {
            id: 1,
            name: "Mucosa Rectal Prolapsada, Edematosa y Friable",
            shortName: "Mucosa Rectal Prolapsada",
            subtitle: "Eversión de pliegues rectales congestivos por tenesmo crónico",
            color: "#e11d48",
            description:
              "Rodete concéntrico de mucosa rectal evertida, intensamente hiperémica, edematosa y friable con ulceraciones puntiformes sangrantes.",
            clinicalNote:
              "El prolapso rectal en un niño de zona endémica con diarrea mucosanguinolenta crónica, anemia microcítica y dedos en palillo de tambor (acropaquia) obliga a descartar en primer lugar tricuriasis masiva.",
            focusTarget: [0.0, 0.0, 0.2],
            focusDistance: 2.5,
            labelPoint: [-0.75, 0.65, 0.35],
          },
          {
            id: 2,
            name: "Múltiples Tricocéfalos Adultos Blancos Adheridos a la Mucosa Expuesta",
            shortName: "Tricocéfalos en Mucosa",
            subtitle: "Observación directa de los gusanos en látigo sobre el prolapso",
            color: "#fef3c7",
            description:
              "Decenas de cuerpos posteriores blanquecinos de T. trichiura destacan sobre el fondo rojo intenso de la mucosa rectal evertida mientras sus extremos anteriores siguen enhebrados en el epitelio.",
            clinicalNote:
              "Permite el diagnóstico clínico visual inmediato en urgencias pediátricas incluso antes de procesar la muestra de heces.",
            focusTarget: [0.45, 0.35, 0.45],
            focusDistance: 2.2,
            labelPoint: [0.75, 0.78, 0.55],
          },
          {
            id: 3,
            name: "Exudado Mucosanguinolento con Huevos en Barril",
            shortName: "Moco Sanguinolento + Huevos",
            subtitle: "Disentería trichiuriásica rica en proteínas y eritrocitos",
            color: "#b45309",
            description:
              "Moco espeso teñido de sangre fresca que recubre la mucosa prolapsada y contiene abundantes huevos en barril con tapones bipolares.",
            clinicalNote:
              "La enteropatía perdedora de proteínas, la anorexia mediada por TNF-α y el sangrado crónico conducen a retraso severo del crecimiento pondoestatural (stunting) y déficit cognitivo reversible tras la desparasitación.",
            focusTarget: [-0.45, -0.3, 0.55],
            focusDistance: 2.2,
            labelPoint: [-0.7, -0.68, 0.65],
          },
          {
            id: 4,
            name: "Cristales de Charcot-Leyden y Eosinófilos en el Exudado",
            shortName: "Cristales de Charcot-Leyden",
            subtitle: "Marcador citológico de colitis eosinofílica parasitaria",
            color: "#c084fc",
            description:
              "Cristales bipiramidales hexagonales procedentes de la lisis de los eosinófilos reclutados en la mucosa rectal inflamada.",
            clinicalNote:
              "Diferencia la disentería por Trichuris trichiura de la disentería bacilar por Shigella (donde predominan polimorfonucleares neutrófilos sin cristales de Charcot-Leyden).",
            focusTarget: [0.55, -0.35, 0.45],
            focusDistance: 2.2,
            labelPoint: [0.8, -0.72, 0.55],
          },
        ],
      },
    ],
  },
  p22: {
    code: "p22",
    scientificName: "Strongyloides stercoralis",
    commonName: "Estrongiloides",
    groupBadge: "Geohelminto Facultativo · Autoinfección",
    stainLabel: "Baermann / Placa de Agar",
    stages: [
      {
        id: "rhabditiform_l1",
        name: "Larva Rabditoide Diagnóstica (L1 en Heces: Boca Corta y Primordio Grande)",
        shortName: "1. Larva Rabditoide L1 (Diagnóstica)",
        badge: "Forma Diagnóstica en Heces Frescas",
        sizeMicrons: "200–300 × 16 µm",
        summary:
          "¡En Strongyloides stercoralis los huevos eclosionan dentro de la mucosa duodenal, por lo que en las heces frescas se observan LARVAS RABDITOIDES (L1) móviles y no huevos! Sus dos claves diagnósticas para diferenciarla de las uncinarias son: (1) una cavidad o cápsula bucal MUY CORTA (3–4 µm) y (2) un primordio genital GRANDE y prominente a mitad del cuerpo, además de su esófago rabditoide con bulbo posterior.",
        microscopyTip:
          "Activa el Corte Histológico para medir en el interior de la larva L1 su cavidad bucal cortísima, el esófago rabditoide con istmo y bulbo, y el gran primordio genital.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 4.1],
        regions: [
          {
            id: 1,
            name: "Cutícula Hialina de la Larva Rabditoide L1 (200–300 µm)",
            shortName: "Cuerpo Larva L1 (En Heces)",
            subtitle: "Larva activa recién eclosionada que emerge en las deposiciones",
            color: "#e2e8f0",
            description:
              "Larva corta y robusta de 200 a 300 µm de longitud por 16 µm de ancho con movimiento serpenteante vigoroso que se aísla mediante concentración de Baermann o cultivo en placa de agar nutritivo (método de Arakaki/Koga).",
            clinicalNote:
              "Un examen coproparasitológico simple tiene baja sensibilidad (< 30%) porque la excreción larvaria es escasa e intermitente; el cultivo en placa de agar (donde las larvas dejan surcos de colonias bacterianas al reptar) y el método de Baermann son los métodos parasitológicos de elección.",
            focusTarget: [0.2, 0.25, 0.15],
            focusDistance: 2.3,
            labelPoint: [0.35, 0.72, 0.25],
          },
          {
            id: 2,
            name: "Cavidad Bucal MUY CORTA (3–4 µm) y Esófago Rabditoide con Bulbo",
            shortName: "Cavidad Bucal Corta + Esófago Rabditoide",
            subtitle: "Canal bucal < 1/3 del diámetro cefálico (vs largo en uncinarias)",
            color: "#f43f5e",
            description:
              "El vestíbulo o cavidad bucal anterior mide apenas 3–4 µm (es más corto que el ancho del extremo cefálico) y se continúa con el esófago muscular rabditoide compuesto por cuerpo cilíndrico (procorpus), estrechamiento (istmo) y bulbo valvular posterior.",
            clinicalNote:
              "¡Criterio diferencial de oro! En la larva rabditoide de Strongyloides la cavidad bucal es CORTA; en la larva rabditoide de Ancylostoma/Necator la cavidad bucal es LARGA (tan larga como el diámetro del cuerpo).",
            focusTarget: [-1.15, 0.05, 0.0],
            focusDistance: 1.9,
            labelPoint: [-1.25, 0.65, 0.15],
          },
          {
            id: 3,
            name: "Primordio Genital GRANDE y Prominente (Semilunar)",
            shortName: "Primordio Genital Grande",
            subtitle: "Paquete celular refringente de 25–35 µm entre intestino y pared ventral",
            color: "#eab308",
            description:
              "Hacia la mitad posterior del cuerpo, adosado entre la pared ventral y el tubo intestinal, destaca un paquete refringente grande y bien visible de células germinales: el primordio genital.",
            clinicalNote:
              "Segundo criterio diferencial de oro: Strongyloides tiene cavidad bucal CORTA + primordio genital GRANDE; las uncinarias tienen cavidad bucal LARGA + primordio genital PEQUEÑO/inconspicuo.",
            focusTarget: [0.15, -0.1, 0.0],
            focusDistance: 1.9,
            labelPoint: [0.15, -0.62, 0.2],
          },
          {
            id: 4,
            name: "Intestino Tubular y Cola Cónica Aguda (Sin Muesca en L1)",
            shortName: "Intestino y Cola Cónica (L1)",
            subtitle: "En el estadio L1 la cola es puntiaguda (la muesca aparece en L3)",
            color: "#38bdf8",
            description:
              "El intestino medio tapizado de gránulos nutritivos termina en el ano subterminal y una cola cónica aguzada.",
            clinicalNote:
              "Si la muestra de heces se deja a temperatura ambiente más de 24–48 horas, las larvas rabditoides L1 pueden mudar a larvas filariformes L3 infectantes dentro del envase (¡riesgo biológico de infección percutánea para el personal de laboratorio!).",
            focusTarget: [1.15, -0.05, 0.0],
            focusDistance: 2.1,
            labelPoint: [1.3, -0.52, 0.15],
          },
        ],
      },
      {
        id: "filariform_l3",
        name: "Larva Filariforme Infectante (L3: Esófago Largo 1:1 y Cola Mellada/Bífida)",
        shortName: "2. Larva Filariforme L3 (Cola Bífida)",
        badge: "Forma Infectante Percutánea y Autoinfectante",
        sizeMicrons: "500–600 × 15 µm",
        summary:
          "Estadio infectante que penetra la piel humana descalza desde el suelo o causa autoinfección endógena. Es más larga y esbelta (500–600 µm), carece de vaina cuticular y presenta dos rasgos patognomónicos: (1) un esófago cilíndrico filariforme MUY LARGO que ocupa casi el 50% de la longitud corporal (relación esófago:intestino 1:1) y (2) el extremo de la cola MELLADO o BÍFIDO (en muesca o tridente).",
        microscopyTip:
          "Activa el Corte Histológico para comprobar que el esófago cilíndrico ocupa la mitad del cuerpo (1:1) y enfoca la punta caudal para ver la muesca bífida.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 4.3],
        regions: [
          {
            id: 1,
            name: "Cuerpo Esbelto Sin Vaina de la Larva Filariforme L3 (500–600 µm)",
            shortName: "Cuerpo Esbelto (Sin Vaina)",
            subtitle: "Termotropismo e hidrotropismo positivos para penetración cutánea",
            color: "#cbd5e1",
            description:
              "Larva muy estilizada y veloz, desprovista de vaina externa (a diferencia de la L3 envainada de las uncinarias), capaz de secretar metaloproteasas (strongylocina) para atravesar la piel intacta o la mucosa colónica.",
            clinicalNote:
              "Al penetrar la piel (pies) produce la dermatitis pruriginosa 'ground itch' y, en infecciones crónicas por autoinfección perianal, los trayectos serpiginosos urticariformes de migración ultrarrápida (5–15 cm/hora) patognomónicos llamados 'Larva Currens'.",
            focusTarget: [0.0, 0.25, 0.1],
            focusDistance: 2.4,
            labelPoint: [0.05, 0.72, 0.2],
          },
          {
            id: 2,
            name: "Esófago Filariforme Cilíndrico Muy Largo (50% del Cuerpo — Relación 1:1)",
            shortName: "Esófago Largo (Relación 1:1)",
            subtitle: "Sin bulbo posterior; ocupa casi la mitad anterior de la larva",
            color: "#fb7185",
            description:
              "El esófago pierde su bulbo rabditoide y se transforma en un tubo muscular cilíndrico rectilíneo que se extiende hasta casi la mitad de la longitud total de la larva (relación esófago:intestino de 1:1).",
            clinicalNote:
              "En las larvas filariformes L3 de uncinarias (Ancylostoma/Necator) el esófago ocupa solo 1/4 de la longitud corporal (relación 1:3), mientras que en Strongyloides ocupa la mitad (1:1).",
            focusTarget: [-0.7, 0.0, 0.0],
            focusDistance: 2.2,
            labelPoint: [-0.85, 0.62, 0.15],
          },
          {
            id: 3,
            name: "Intestino Posterior (50% de la Longitud Corporal)",
            shortName: "Intestino (Mitad Posterior)",
            subtitle: "Se extiende desde la unión esofagointestinal media hasta el ano",
            color: "#38bdf8",
            description:
              "Tubo intestinal rectilíneo que ocupa la mitad caudal de la larva L3.",
            clinicalNote:
              "La larva filariforme L3 es un estadio de no-alimentación (boca cerrada) diseñado exclusivamente para localizar e invadir al huésped.",
            focusTarget: [0.55, 0.0, 0.0],
            focusDistance: 2.2,
            labelPoint: [0.6, -0.58, 0.15],
          },
          {
            id: 4,
            name: "Extremo Caudal MELLADO o BÍFIDO Patognomónico (Cola en Muesca)",
            shortName: "Cola Mellada / Bífida",
            subtitle: "Punta truncada con escotadura en 'V' o tridente (vs puntiaguda en uncinaria)",
            color: "#fbbf24",
            description:
              "En lugar de terminar en una punta aguda simple, el extremo de la cola de la L3 de Strongyloides presenta una muesca o bifurcación microscópica característica en forma de 'V' invertida o corona diminuta.",
            clinicalNote:
              "La 'cola mellada/bífida' a 40x es el signo definitivo para confirmar una larva filariforme L3 de Strongyloides stercoralis frente a la cola puntiaguda envainada de Necator o Ancylostoma.",
            focusTarget: [1.5, -0.05, 0.0],
            focusDistance: 1.8,
            labelPoint: [1.62, 0.45, 0.15],
          },
        ],
      },
      {
        id: "parthenogenetic_female",
        name: "Hembra Adulta Parásita Partenogenética en Cripta Duodenal (2.2 mm)",
        shortName: "3. Hembra Partenogenética",
        badge: "Sin Machos Parásitos · Eclosión In Situ",
        sizeMicrons: "2.0–2.5 mm × 40 µm",
        summary:
          "En el intestino humano SOLO existen hembras adultas parásitas filiformes transparentes (no hay machos parásitos). Viven enhebradas en las criptas de Lieberkühn del duodeno y yeyuno proximal y se reproducen por partenogénesis mitótica: depositan huevos de cáscara fina en fila india dentro de la mucosa que eclosionan inmediatamente in situ liberando larvas L1 a la luz intestinal.",
        microscopyTip:
          "Usa el Corte Histológico para observar la fila de huevos embrionados dentro del útero de la hembra y las larvas L1 eclosionando dentro de la cripta duodenal.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.5, 4.4],
        regions: [
          {
            id: 1,
            name: "Hembra Adulta Parásita Filiforme Partenogenética (2.2 mm)",
            shortName: "Hembra Partenogenética",
            subtitle: "Reproducción clonal sin fecundación masculina en mucosa duodenal",
            color: "#f8fafc",
            description:
              "Nematodo diminuto y casi transparente de apenas 2.2 mm de largo por 40 µm de diámetro que habita en túneles labrados entre los enterocitos de las criptas duodenales.",
            clinicalNote:
              "Los adultos de vida libre (machos y hembras rabditoides) solo existen fuera del cuerpo humano en el suelo cálido (ciclo indirecto heterogónico), nunca dentro del intestino humano.",
            focusTarget: [-0.2, 0.15, 0.1],
            focusDistance: 2.3,
            labelPoint: [-0.35, 0.72, 0.2],
          },
          {
            id: 2,
            name: "Útero con Huevos en Fila India (Eclosión Inmediata en la Mucosa)",
            shortName: "Huevos en Fila India (In Situ)",
            subtitle: "Huevos ovalados de cáscara hialina que eclosionan antes de llegar a heces",
            color: "#fde047",
            description:
              "El útero contiene una sola hilera de 6 a 12 huevos elipsoidales de pared muy fina ya embrionados, los cuales son depositados dentro del epitelio de la cripta duodenal donde eclosionan de inmediato.",
            clinicalNote:
              "Por esta eclosión submucosa/intraepitelial inmediata, en las heces del paciente solo salen larvas rabditoides L1 (los huevos solo se ven en aspirado duodenal o diarreas hiperperistálticas masivas).",
            focusTarget: [0.35, 0.05, 0.15],
            focusDistance: 2.1,
            labelPoint: [0.55, 0.62, 0.25],
          },
          {
            id: 3,
            name: "Larvas L1 Rabditoides Emergiendo hacia la Luz Duodenal",
            shortName: "Eclosión de Larvas L1",
            subtitle: "Paso de las larvas recién nacidas desde la cripta a la luz intestinal",
            color: "#38bdf8",
            description:
              "Las larvas rabditoides L1 recién nacidas perforan el epitelio de la cripta de Lieberkühn para alcanzar la luz del duodeno y ser arrastradas con el contenido intestinal.",
            clinicalNote:
              "Una pequeña fracción de estas larvas L1 puede mudar prematuramente a L3 filariforme antes de salir por el ano, generando el ciclo de autoinfección interna o externa que perpetúa la parasitosis durante 30 a 50 años.",
            focusTarget: [0.75, 0.35, 0.2],
            focusDistance: 2.2,
            labelPoint: [1.0, 0.78, 0.3],
          },
          {
            id: 4,
            name: "Cripta Duodenal de Lieberkühn (Duodenitis Crónica Eosinofílica)",
            shortName: "Cripta Duodenal",
            subtitle: "Atrofia vellositaria y dolor epigástrico pseudoulceroso",
            color: "#fda4af",
            description:
              "Epitelio glandular duodenal con edema de la lámina propia, hiperplasia de criptas, atrofia parcial de vellosidades e infiltrado eosinofílico.",
            clinicalNote:
              "Clínicamente simula una enfermedad ulcerosa péptica (epigastralgia urente que paradójicamente empeora con la ingesta de alimentos), malabsorción o duodenitis eosinofílica.",
            focusTarget: [-0.65, -0.25, 0.2],
            focusDistance: 2.4,
            labelPoint: [-0.9, -0.68, 0.3],
          },
        ],
      },
      {
        id: "hyperinfection",
        name: "Síndrome de Hiperinfección y Sepsis por Bacilos Gramnegativos (Corticoides / HTLV-1)",
        shortName: "4. Hiperinfección Diseminada",
        badge: "Emergencia Médica · Mortalidad > 60–80%",
        sizeMicrons: "Campo histológico 200 µm",
        summary:
          "Cuando un portador crónico (incluso tras décadas asintomático) recibe corticosteroides sistémicos o está coinfectado por el retrovirus HTLV-1, se dispara la transformación masiva de larvas L1 a L3 filariformes dentro del colon. Miles de larvas L3 perforan la pared intestinal hacia la sangre arrastrando en su cutícula bacilos Gramnegativos entéricos (E. coli, Klebsiella), causando bacteriemia, meningitis y hemorragia alveolar pulmonar.",
        microscopyTip:
          "Observa las larvas L3 filariformes atravesando la pared colónica y el endotelio capilar con bacilos Gramnegativos adheridos a su superficie.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.5, 4.4],
        regions: [
          {
            id: 1,
            name: "Larvas Filariformes L3 Autoinfectantes Perforando la Pared Colónica",
            shortName: "Invasión Masiva de L3",
            subtitle: "Aceleración del cambio L1 → L3 inducida por metabolitos esteroideos",
            color: "#fef08a",
            description:
              "Múltiples larvas filariformes L3 de cola bífida penetran transmuralmente la mucosa, submucosa y vénulas mesentéricas del colon e íleon.",
            clinicalNote:
              "Los corticosteroides no solo suprimen los eosinófilos y la respuesta Th2 (IL-5), sino que además actúan directamente sobre receptores nucleares tipo ecdisteroide (DAF-12) del parásito acelerando la muda de L1 a L3 infectante.",
            focusTarget: [0.0, 0.15, 0.15],
            focusDistance: 2.2,
            labelPoint: [-0.15, 0.78, 0.25],
          },
          {
            id: 2,
            name: "Bacilos Gramnegativos Entéricos (E. coli, Klebsiella) Adheridos a la Larva",
            shortName: "Arrastre de Bacilos Gram(-)",
            subtitle: "Causa de sepsis y meningitis polimicrobiana recurrente",
            color: "#22c55e",
            description:
              "Bacterias entéricas de la microbiota colónica adheridas a la cutícula larvaria o contenidas en el tubo digestivo de la larva L3 son transportadas directamente al torrente sanguíneo, pulmones y meninges.",
            clinicalNote:
              "¡Perla clínica crítica! Todo paciente inmunodeprimido o bajo corticoides que desarrolle bacteriemia o meningitis inexplicable por Escherichia coli, Klebsiella o Enterococcus faecalis debe ser evaluado urgentemente para hiperinfección por Strongyloides.",
            focusTarget: [0.25, 0.2, 0.3],
            focusDistance: 1.9,
            labelPoint: [0.65, 0.65, 0.4],
          },
          {
            id: 3,
            name: "Pared Intestinal Ulcerada y Endotelio Vascular Mesentérico",
            shortName: "Vasculitis y Úlcera Transmural",
            subtitle: "Íleo paralítico, enteropatía necrotizante y púrpura periumbilical",
            color: "#e11d48",
            description:
              "Submucosa edematosa y pared venular perforada por el paso de las larvas hacia la circulación portal y sistémica.",
            clinicalNote:
              "La migración masiva de larvas a los plexos dérmicos abdominales produce la 'púrpura en huella de pulgar' periumbilical patognomónica de la estrongiloidiasis diseminada.",
            focusTarget: [-0.75, -0.2, 0.2],
            focusDistance: 2.3,
            labelPoint: [-1.0, -0.62, 0.3],
          },
          {
            id: 4,
            name: "Ausencia Paradójica de Eosinofilia (Efecto Corticoide / HTLV-1)",
            shortName: "Eosinopenia Paradójica",
            subtitle: "Falsa normalidad del hemograma durante la fase más letal",
            color: "#a855f7",
            description:
              "Escasos leucocitos apoptóticos en el tejido: durante la hiperinfección por corticoides o coinfección con HTLV-1 (que desvía la respuesta hacia IFN-γ Th1), la eosinofilia periférica suele DESAPARECER.",
            clinicalNote:
              "La ausencia de eosinofilia NO descarta hiperinfección por Strongyloides (de hecho, la eosinopenia en hiperinfección es signo de mal pronóstico). Antes de iniciar corticoides o trasplante en pacientes de áreas endémicas se debe cribar con serología IgG ELISA y/o desparasitar profilácticamente con IVERMECTINA (fármaco de primera elección).",
            focusTarget: [0.85, -0.25, 0.2],
            focusDistance: 2.3,
            labelPoint: [1.05, -0.65, 0.3],
          },
        ],
      },
    ],
  },
};

// ============================================================================
// SHADERS (Analytical normals — zero #extension directives)
// ============================================================================

const VERTEX_SHADER = `
  attribute float aRegionId;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  varying vec3 vColor;
  varying float vRegionId;

  void main() {
    vRegionId = aRegionId;
    vColor = color;
    vLocalPos = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  varying vec3 vColor;
  varying float vRegionId;

  uniform vec3 uCameraPos;
  uniform float uTime;
  uniform float uTranslucency;
  uniform float uClipY;
  uniform float uSelectedRegion;
  uniform float uHoverRegion;
  uniform int uShaderMode;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p *= 2.05;
      a *= 0.5;
    }
    return v;
  }

  vec3 perturbNormalAnalytical(vec3 N, vec3 pos, float scale, float strength) {
    vec3 up = abs(N.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 T = normalize(cross(up, N));
    vec3 B = cross(N, T);
    float eps = 0.035;
    float h0 = fbm(pos * scale);
    float hx = fbm((pos + T * eps) * scale);
    float hy = fbm((pos + B * eps) * scale);
    vec2 grad = vec2(hx - h0, hy - h0) / eps;
    return normalize(N - (T * grad.x + B * grad.y) * strength);
  }

  void main() {
    float cuttable = fract(vRegionId);
    float baseRegion = floor(vRegionId + 0.05);

    if (cuttable > 0.2 && (vLocalPos.y - vLocalPos.z * 0.45) > uClipY) {
      discard;
    }

    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) {
      N = -N;
    }

    vec3 V = normalize(uCameraPos - vWorldPos);
    float microScale = 14.0;
    float bumpStrength = 0.14;
    N = perturbNormalAnalytical(N, vLocalPos, microScale, bumpStrength);

    vec3 L1 = normalize(vec3(0.65, 0.8, 0.55));
    vec3 L2 = normalize(vec3(-0.6, -0.35, 0.65));
    float diff1 = max(dot(N, L1), 0.0);
    float diff2 = max(dot(N, L2), 0.0) * 0.4;
    vec3 H = normalize(L1 + V);
    float spec = pow(max(dot(N, H), 0.0), 42.0) * 0.42;
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);

    float microTex = fbm(vLocalPos * 11.0);
    vec3 baseCol = vColor * (0.9 + 0.2 * microTex);

    vec3 finalColor = baseCol;
    float alpha = 1.0;

    if (uShaderMode == 0) {
      // Biological SSS + wet specular
      float sss = pow(clamp(dot(V, -L1) + 0.5, 0.0, 1.0), 2.2) * 0.35;
      finalColor = baseCol * (0.28 + diff1 * 0.72 + diff2) + baseCol * sss + vec3(1.0, 0.98, 0.94) * spec + baseCol * fresnel * 0.28;
      if (cuttable > 0.2) {
        alpha = mix(0.96, 0.24, uTranslucency);
      }
    } else if (uShaderMode == 1) {
      // Lugol / Kato-Katz / Graham bright-field microscopy
      vec3 stainTint = mix(baseCol, vec3(0.72, 0.46, 0.18), 0.22);
      float edge = smoothstep(0.0, 0.85, fresnel);
      finalColor = mix(stainTint * (0.65 + diff1 * 0.42), vec3(0.28, 0.16, 0.06), edge * 0.55) + vec3(spec * 0.22);
      if (cuttable > 0.2) {
        alpha = mix(0.92, 0.25, uTranslucency);
      }
    } else if (uShaderMode == 2) {
      // SEM gold-palladium sputter
      float gray = dot(baseCol, vec3(0.299, 0.587, 0.114));
      vec3 semBase = vec3(0.82, 0.78, 0.70) * (0.32 + 0.68 * gray);
      float semRim = pow(1.0 - max(dot(N, V), 0.0), 2.1);
      finalColor = semBase * (0.25 + diff1 * 0.55) + vec3(0.96, 0.93, 0.84) * semRim * 0.85 + vec3(spec * 0.28);
      alpha = 1.0;
    } else {
      // X-Ray / Phase contrast
      float rim = pow(1.0 - max(dot(N, V), 0.0), 1.8);
      finalColor = mix(vec3(0.04, 0.12, 0.22), baseCol * 1.35 + vec3(0.25, 0.55, 0.85), rim * 0.85 + 0.15);
      alpha = mix(0.28, 0.85, rim);
    }

    if (!gl_FrontFacing && cuttable > 0.2 && uClipY < 2.2) {
      finalColor = mix(finalColor, vec3(0.92, 0.42, 0.35), 0.28);
    }

    bool isSelected = abs(baseRegion - uSelectedRegion) < 0.25;
    bool isHovered = abs(baseRegion - uHoverRegion) < 0.25;
    if (isSelected) {
      finalColor += vec3(0.16, 0.22, 0.28) * (0.55 + 0.45 * sin(uTime * 4.5));
      finalColor = mix(finalColor, vColor * 1.25, 0.25);
    } else if (isHovered) {
      finalColor += vec3(0.10, 0.14, 0.18);
    }

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ============================================================================
// GEOMETRY BUILDER UTILITIES
// ============================================================================

class MeshAcc {
  positions: number[] = [];
  normals: number[] = [];
  colors: number[] = [];
  regionIds: number[] = [];
  indices: number[] = [];

  addGeometry(
    geom: THREE.BufferGeometry,
    colorHex: string,
    regionId: number,
    matrix?: THREE.Matrix4
  ) {
    const g = geom.clone();
    if (matrix) g.applyMatrix4(matrix);
    g.computeVertexNormals();

    const pos = g.getAttribute("position");
    const norm = g.getAttribute("normal");
    const col = new THREE.Color(colorHex);
    const baseVertex = this.positions.length / 3;

    for (let i = 0; i < pos.count; i++) {
      this.positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      this.normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
      this.colors.push(col.r, col.g, col.b);
      this.regionIds.push(regionId);
    }

    const idx = g.getIndex();
    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        this.indices.push(baseVertex + idx.getX(i));
      }
    } else {
      for (let i = 0; i < pos.count; i++) {
        this.indices.push(baseVertex + i);
      }
    }
    g.dispose();
  }

  addSphere(
    center: [number, number, number],
    radii: [number, number, number],
    colorHex: string,
    regionId: number,
    segs = 28,
    rings = 20,
    rotEuler?: [number, number, number]
  ) {
    const g = new THREE.SphereGeometry(1, segs, rings);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    if (rotEuler) q.setFromEuler(new THREE.Euler(rotEuler[0], rotEuler[1], rotEuler[2]));
    m.compose(
      new THREE.Vector3(center[0], center[1], center[2]),
      q,
      new THREE.Vector3(radii[0], radii[1], radii[2])
    );
    this.addGeometry(g, colorHex, regionId, m);
    g.dispose();
  }

  addTube(
    points: [number, number, number][],
    radiusFn: (t: number) => number,
    colorHex: string,
    regionId: number,
    tubularSegs = 48,
    radialSegs = 14,
    closed = true
  ) {
    const vecs = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(vecs);
    const frames = curve.computeFrenetFrames(tubularSegs, false);
    const col = new THREE.Color(colorHex);
    const baseVertex = this.positions.length / 3;

    for (let i = 0; i <= tubularSegs; i++) {
      const t = i / tubularSegs;
      const pt = curve.getPointAt(t);
      const r = radiusFn(t);
      const N = frames.normals[i];
      const B = frames.binormals[i];

      for (let j = 0; j <= radialSegs; j++) {
        const v = (j / radialSegs) * Math.PI * 2;
        const cos = Math.cos(v);
        const sin = Math.sin(v);
        const nx = cos * N.x + sin * B.x;
        const ny = cos * N.y + sin * B.y;
        const nz = cos * N.z + sin * B.z;

        this.positions.push(pt.x + r * nx, pt.y + r * ny, pt.z + r * nz);
        this.normals.push(nx, ny, nz);
        this.colors.push(col.r, col.g, col.b);
        this.regionIds.push(regionId);
      }
    }

    const stride = radialSegs + 1;
    for (let i = 0; i < tubularSegs; i++) {
      for (let j = 0; j < radialSegs; j++) {
        const a = baseVertex + i * stride + j;
        const b = baseVertex + (i + 1) * stride + j;
        const c = baseVertex + (i + 1) * stride + (j + 1);
        const d = baseVertex + i * stride + (j + 1);
        this.indices.push(a, b, d, b, c, d);
      }
    }

    if (closed) {
      const startPt = curve.getPointAt(0);
      const endPt = curve.getPointAt(1);
      this.addSphere([startPt.x, startPt.y, startPt.z], [radiusFn(0), radiusFn(0), radiusFn(0)], colorHex, regionId, 10, 8);
      this.addSphere([endPt.x, endPt.y, endPt.z], [radiusFn(1), radiusFn(1), radiusFn(1)], colorHex, regionId, 10, 8);
    }
  }

  toBufferGeometry(): THREE.BufferGeometry {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
    geom.setAttribute("normal", new THREE.Float32BufferAttribute(this.normals, 3));
    geom.setAttribute("color", new THREE.Float32BufferAttribute(this.colors, 3));
    geom.setAttribute("aRegionId", new THREE.Float32BufferAttribute(this.regionIds, 1));
    geom.setIndex(this.indices);
    return geom;
  }
}

// ============================================================================
// P19: ASCARIS LUMBRICOIDES BUILDERS
// ============================================================================

function buildP19FertileEgg(acc: MeshAcc) {
  // 1. INTERNAL COILED L1/L2 LARVA emitted FIRST (Region 3, 3.0)
  const larvaPts: [number, number, number][] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const ang = t * Math.PI * 3.4;
    const r = 0.34 - t * 0.08;
    larvaPts.push([
      Math.cos(ang) * r,
      (t - 0.5) * 0.82,
      Math.sin(ang) * r * 0.85,
    ]);
  }
  acc.addTube(
    larvaPts,
    (t) => 0.13 * Math.sin(Math.pow(t, 0.35) * Math.PI * 0.94 + 0.06),
    "#fde047",
    3.0,
    56,
    14
  );
  // Esophageal bulb inside larva
  acc.addSphere([larvaPts[6][0], larvaPts[6][1], larvaPts[6][2]], [0.11, 0.11, 0.11], "#f59e0b", 3.0, 14, 12);

  // 2. POLAR CLEAR CRESCENTS (Region 4, 4.0)
  acc.addSphere([0, 0.68, 0], [0.36, 0.12, 0.34], "#fef3c7", 4.0, 18, 12);
  acc.addSphere([0, -0.68, 0], [0.36, 0.12, 0.34], "#fef3c7", 4.0, 18, 12);

  // 3. INNER HYALINE CHITINOUS & ASCAROSIDE SHELL (Region 2, 2.6 - cuttable)
  acc.addSphere([0, 0, 0], [0.74, 0.96, 0.72], "#fde68a", 2.6, 36, 28);

  // 4. OUTER COARSELY MAMMILLATED ALBUMINOID COAT (Region 1, 1.6 - cuttable)
  const shellGeom = new THREE.SphereGeometry(1, 56, 42);
  const pos = shellGeom.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // Mammillated bumps using multi-frequency cosine domes
    const bump =
      Math.pow(Math.abs(Math.sin(x * 8.5) * Math.cos(y * 9.5) * Math.sin(z * 8.5)), 0.55) * 0.12 +
      Math.pow(Math.abs(Math.cos(x * 13.0 + 1.1) * Math.sin(y * 12.0)), 0.7) * 0.06;
    const rx = (0.86 + bump) * x;
    const ry = (1.12 + bump) * y;
    const rz = (0.84 + bump) * z;
    pos.setXYZ(i, rx, ry, rz);
  }
  acc.addGeometry(shellGeom, "#b45309", 1.6);

  // Discrete golden-brown mammillated nodules around surface for realistic silhouette
  const rings = 9;
  for (let r = 1; r < rings; r++) {
    const phi = (r / rings) * Math.PI;
    const count = Math.max(6, Math.round(Math.sin(phi) * 16));
    for (let k = 0; k < count; k++) {
      const theta = (k / count) * Math.PI * 2 + (r % 2) * 0.22;
      const mx = 0.88 * Math.sin(phi) * Math.cos(theta);
      const my = 1.14 * Math.cos(phi);
      const mz = 0.86 * Math.sin(phi) * Math.sin(theta);
      acc.addSphere([mx, my, mz], [0.15, 0.14, 0.15], "#92400e", 1.6, 12, 10);
    }
  }
}

function buildP19DifferentialEggs(acc: MeshAcc) {
  // LEFT: DECORTICATED FERTILE EGG (-1.05, 0, 0)
  // Internal viable larva/blastomere (Region 4, 4.0)
  const larvaPts: [number, number, number][] = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const ang = t * Math.PI * 2.8;
    larvaPts.push([
      -1.05 + Math.cos(ang) * 0.25,
      (t - 0.5) * 0.65,
      Math.sin(ang) * 0.24,
    ]);
  }
  acc.addTube(larvaPts, (t) => 0.11 * Math.sin(t * Math.PI * 0.9 + 0.1), "#fef08a", 4.0, 40, 12);
  acc.addSphere([-1.05, 0, 0], [0.42, 0.52, 0.40], "#fde047", 4.0, 22, 18);

  // Smooth thick hyaline chitinous wall of decorticated fertile egg (Region 1, 1.6 - cuttable)
  acc.addSphere([-1.05, 0, 0], [0.68, 0.88, 0.66], "#fcd34d", 1.6, 36, 28);
  acc.addSphere([-1.05, 0, 0], [0.60, 0.80, 0.58], "#fef3c7", 1.6, 32, 24);

  // RIGHT: ELONGATED INFERTILE EGG (+1.0, 0, 0)
  // Disorganized refractile lecithin granules filling the entire cavity (Region 3, 3.0)
  for (let i = 0; i < 42; i++) {
    const gx = 1.0 + (Math.sin(i * 7.3) * 0.42);
    const gy = ((i / 41) - 0.5) * 1.95 + Math.cos(i * 3.7) * 0.08;
    const gz = Math.cos(i * 11.1) * 0.38;
    const rad = 0.11 + (i % 4) * 0.035;
    acc.addSphere([gx, gy, gz], [rad, rad * 1.1, rad], i % 2 === 0 ? "#f59e0b" : "#fde68a", 3.0, 12, 10);
  }

  // Barrel-like elongated thin irregular outer shell of infertile egg (Region 2, 2.6 - cuttable)
  const infGeom = new THREE.SphereGeometry(1, 44, 34);
  const pos = infGeom.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const barrel = 1.0 + 0.12 * (1.0 - y * y);
    const irr = Math.sin(x * 9.0) * Math.cos(y * 11.0) * 0.05;
    pos.setXYZ(
      i,
      1.0 + x * (0.64 * barrel + irr),
      y * (1.28 + irr),
      z * (0.62 * barrel + irr)
    );
  }
  acc.addGeometry(infGeom, "#b45309", 2.6);
}

function buildP19AdultsAndLips(acc: MeshAcc) {
  // Adult female curve (arch from [-1.45, 0.05, 0.15] to [1.45, 0.15, -0.2])
  const femPts: [number, number, number][] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const x = -1.45 + t * 2.95;
    const y = Math.sin(t * Math.PI) * 0.58;
    const z = Math.cos(t * Math.PI * 1.4) * 0.22;
    femPts.push([x, y, z]);
  }

  // 1. INTERNAL DIGESTIVE TRACT & DIDELPHIC UTERINE COILS emitted FIRST (Region 3, 3.0)
  acc.addTube(
    femPts,
    (t) => 0.085 * Math.sin(Math.pow(t, 0.4) * Math.PI * 0.92 + 0.08),
    "#f59e0b",
    3.0,
    48,
    12
  );
  // Convoluted twin uterine tubes coiled around intestine
  for (let u = 0; u < 2; u++) {
    const utPts: [number, number, number][] = [];
    for (let i = 6; i <= 42; i++) {
      const t = i / 48;
      const base = femPts[i];
      const ang = t * Math.PI * 10 + u * Math.PI;
      utPts.push([
        base[0],
        base[1] + Math.sin(ang) * 0.13,
        base[2] + Math.cos(ang) * 0.13,
      ]);
    }
    acc.addTube(utPts, () => 0.055, "#fef08a", 3.0, 64, 10);
  }

  // 2. THREE CEPHALIC LIPS AT ANTERIOR END (Region 2, 2.0)
  // 1 Dorsal lip + 2 Ventrolateral lips
  const head = femPts[0];
  const lipAngles = [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3];
  lipAngles.forEach((ang) => {
    const lx = head[0] - 0.10;
    const ly = head[1] + Math.sin(ang) * 0.11;
    const lz = head[2] + Math.cos(ang) * 0.11;
    acc.addSphere([lx, ly, lz], [0.13, 0.10, 0.10], "#fb7185", 2.0, 18, 14);
    // Sensory papillae
    acc.addSphere([lx - 0.09, ly * 1.05, lz * 1.05], [0.028, 0.028, 0.028], "#fef08a", 2.0, 10, 8);
  });

  // 3. SMALLER MALE ADULT WITH CURVED VENTRAL TAIL & 2 SPICULES (Region 4, 4.0)
  const malePts: [number, number, number][] = [];
  for (let i = 0; i <= 44; i++) {
    const t = i / 44;
    if (t < 0.72) {
      const s = t / 0.72;
      malePts.push([-1.15 + s * 1.85, -0.45 - Math.sin(s * Math.PI) * 0.18, 0.32]);
    } else {
      const s = (t - 0.72) / 0.28;
      const hookAng = s * Math.PI * 1.35;
      malePts.push([
        0.70 + Math.sin(hookAng) * 0.34,
        -0.45 - (1 - Math.cos(hookAng)) * 0.32,
        0.32 + s * 0.08,
      ]);
    }
  }
  acc.addTube(
    malePts,
    (t) => 0.17 * Math.sin(Math.pow(t, 0.45) * Math.PI * 0.94 + 0.06),
    "#fda4af",
    4.0,
    56,
    14
  );
  // 2 Chitinous copulatory spicules protruding from male cloaca
  const tailTip = malePts[39];
  acc.addTube(
    [
      [tailTip[0], tailTip[1], tailTip[2] - 0.03],
      [tailTip[0] - 0.16, tailTip[1] + 0.12, tailTip[2] - 0.05],
    ],
    (t) => 0.024 * (1.1 - t * 0.7),
    "#f59e0b",
    4.0,
    14,
    8
  );
  acc.addTube(
    [
      [tailTip[0], tailTip[1], tailTip[2] + 0.03],
      [tailTip[0] - 0.16, tailTip[1] + 0.12, tailTip[2] + 0.05],
    ],
    (t) => 0.024 * (1.1 - t * 0.7),
    "#f59e0b",
    4.0,
    14,
    8
  );

  // 4. OUTER CUTICLE OF GIANT FEMALE (Region 1, 1.6 - cuttable)
  acc.addTube(
    femPts,
    (t) => 0.29 * Math.sin(Math.pow(t, 0.45) * Math.PI * 0.94 + 0.06),
    "#fecdd3",
    1.6,
    64,
    20
  );
}

function buildP19LofflerLung(acc: MeshAcc) {
  // 1. MOLTING L3/L4 LARVA BREAKING OUT OF CAPILLARY INTO ALVEOLUS (Region 1, 1.0)
  const larvaPts: [number, number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    larvaPts.push([
      -0.65 + t * 1.35 + Math.sin(t * Math.PI * 2.5) * 0.18,
      -0.35 + t * 0.95 + Math.cos(t * Math.PI * 2.0) * 0.16,
      Math.sin(t * Math.PI * 2.2) * 0.22,
    ]);
  }
  acc.addTube(
    larvaPts,
    (t) => 0.13 * Math.sin(Math.pow(t, 0.45) * Math.PI * 0.94 + 0.06),
    "#fde047",
    1.0,
    48,
    14
  );

  // 2. EOSINOPHILS & BIPYRAMIDAL CHARCOT-LEYDEN CRYSTALS (Region 3, 3.0)
  const eosCoords: [number, number, number][] = [
    [0.65, 0.22, 0.35],
    [0.92, -0.08, 0.22],
    [-0.45, 0.42, 0.32],
    [0.35, -0.42, 0.42],
  ];
  eosCoords.forEach(([ex, ey, ez]) => {
    acc.addSphere([ex, ey, ez], [0.16, 0.15, 0.16], "#f472b6", 3.0, 16, 12);
    // Bilobed nucleus
    acc.addSphere([ex - 0.05, ey + 0.02, ez + 0.05], [0.06, 0.07, 0.06], "#581c87", 3.0, 10, 8);
    acc.addSphere([ex + 0.05, ey - 0.02, ez + 0.05], [0.06, 0.07, 0.06], "#581c87", 3.0, 10, 8);
  });

  // Charcot-Leyden bipyramidal hexagonal crystals
  const crystalPositions: [[number, number, number], [number, number, number]][] = [
    [[0.82, 0.08, 0.32], [0.3, 0.5, 0.4]],
    [[0.52, 0.48, 0.15], [-0.4, 0.2, 0.7]],
    [[-0.25, 0.58, 0.28], [0.2, -0.3, 0.9]],
  ];
  crystalPositions.forEach(([cPos, cRot]) => {
    const cone1 = new THREE.ConeGeometry(0.085, 0.36, 6);
    const cone2 = new THREE.ConeGeometry(0.085, 0.36, 6);
    cone1.translate(0, 0.18, 0);
    cone2.rotateX(Math.PI);
    cone2.translate(0, -0.18, 0);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(cPos[0], cPos[1], cPos[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(cRot[0], cRot[1], cRot[2])),
      new THREE.Vector3(1, 1, 1)
    );
    acc.addGeometry(cone1, "#c084fc", 3.0, m);
    acc.addGeometry(cone2, "#c084fc", 3.0, m);
  });

  // 3. RUPTURED ALVEOLAR-CAPILLARY SEPTUM & RBC MICROHEMORRHAGE (Region 2, 2.6)
  const capPts: [number, number, number][] = [
    [-1.4, -0.55, 0.1],
    [-0.75, -0.35, 0.15],
    [-0.05, -0.42, 0.12],
    [0.85, -0.65, 0.05],
  ];
  acc.addTube(capPts, () => 0.22, "#e11d48", 2.6, 32, 14);
  // Extravasated biconcave RBCs
  const rbcPos: [number, number, number][] = [
    [-0.55, -0.12, 0.28],
    [-0.25, -0.18, 0.35],
    [-0.82, -0.05, 0.18],
  ];
  rbcPos.forEach(([rx, ry, rz]) => {
    acc.addSphere([rx, ry, rz], [0.13, 0.05, 0.13], "#dc2626", 2.0, 16, 12, [0.4, 0.2, 0.3]);
  });

  // Alveolar cup wall (Region 2, 2.6 - cuttable)
  const alvGeom = new THREE.SphereGeometry(1.55, 36, 28, 0, Math.PI * 2, Math.PI * 0.25, Math.PI * 0.75);
  acc.addGeometry(alvGeom, "#fda4af", 2.6);

  // 4. BRONCHIOLAR MUCUS PLUG / CURSCHMANN SPIRAL (Region 4, 4.6)
  const mucPts: [number, number, number][] = [];
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    mucPts.push([
      -0.3 + t * 0.9,
      -0.48 + Math.sin(t * Math.PI * 4) * 0.08,
      -0.32 + Math.cos(t * Math.PI * 4) * 0.08,
    ]);
  }
  acc.addTube(mucPts, () => 0.075, "#38bdf8", 4.6, 32, 10);
}

// ============================================================================
// P20: ENTEROBIUS VERMICULARIS BUILDERS
// ============================================================================

function buildP20EggDShaped(acc: MeshAcc) {
  // 1. INTERNAL FOLDED TADPOLE / VERMIFORM LARVA emitted FIRST (Region 2, 2.0)
  const larvaPts: [number, number, number][] = [
    [-0.72, -0.08, 0.0],
    [-0.35, -0.14, 0.04],
    [0.25, -0.12, 0.02],
    [0.68, 0.05, 0.0],
    [0.35, 0.26, -0.03],
    [-0.25, 0.24, 0.02],
    [-0.58, 0.12, 0.0],
  ];
  acc.addTube(
    larvaPts,
    (t) => 0.15 * Math.sin(Math.pow(t, 0.35) * Math.PI * 0.92 + 0.08),
    "#fef08a",
    2.0,
    48,
    14
  );

  // 2. INNER EMBRYONIC LIPOID MEMBRANE (Region 3, 3.6 - cuttable)
  const createDShapeGeom = (scaleX: number, scaleY: number, scaleZ: number) => {
    const g = new THREE.SphereGeometry(1, 48, 36);
    const pos = g.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      // Planoconvex "D" shape: flatten ventral side (y < 0) and arch dorsal side (y > 0)
      if (y < 0) {
        y = y * 0.28 - 0.06 * (1.0 - x * x);
      } else {
        y = Math.pow(y, 0.85) * 0.92;
      }
      pos.setXYZ(i, x * scaleX, y * scaleY, z * scaleZ);
    }
    return g;
  };

  acc.addGeometry(createDShapeGeom(1.06, 0.72, 0.64), "#bae6fd", 3.6);

  // 3. OUTER HYALINE PLANOCONVEX D-SHAPED SHELL (Region 1, 1.6 - cuttable)
  acc.addGeometry(createDShapeGeom(1.18, 0.82, 0.74), "#e0f2fe", 1.6);

  // 4. GRAHAM TRANSPARENT ADHESIVE TAPE STRIP BELOW (Region 4, 4.0)
  const tape = new THREE.BoxGeometry(2.8, 0.06, 1.5);
  tape.translate(0, -0.42, 0);
  acc.addGeometry(tape, "#94a3b8", 4.0);
}

function buildP20FemaleAdult(acc: MeshAcc) {
  // Body curve along X from -1.65 (head) to +1.65 (pointed pin tail)
  const bodyPts: [number, number, number][] = [];
  for (let i = 0; i <= 56; i++) {
    const t = i / 56;
    const x = -1.65 + t * 3.3;
    const y = Math.sin(t * Math.PI * 1.2) * 0.08;
    bodyPts.push([x, y, 0]);
  }

  // 1. INTERNAL ESOPHAGEAL BULB & EGG-PACKED UTERI emitted FIRST
  // Cylindrical muscular procorpus + isthmus + SPHERICAL ESOPHAGEAL BULB (Region 2, 2.0)
  acc.addTube(
    [
      [-1.60, 0.02, 0],
      [-1.32, 0.04, 0],
      [-1.22, 0.04, 0],
    ],
    (t) => (t > 0.78 ? 0.045 : 0.085),
    "#fb7185",
    2.0,
    24,
    12
  );
  // Pathognomonic SPHERICAL ESOPHAGEAL BULB at x = -1.08
  acc.addSphere([-1.08, 0.04, 0], [0.16, 0.16, 0.16], "#f43f5e", 2.0, 24, 20);
  // Valvular apparatus inside bulb
  acc.addSphere([-1.08, 0.04, 0], [0.07, 0.07, 0.07], "#fef08a", 2.0, 12, 10);

  // Gravid uteri packed with 3D D-shaped eggs (Region 3, 3.0)
  for (let i = 0; i < 38; i++) {
    const t = i / 37;
    const ex = -0.82 + t * 1.45;
    const radial = (1.0 - Math.pow((t - 0.45) * 1.6, 2)) * 0.14;
    const ang = i * 2.4;
    const ey = 0.05 + Math.sin(ang) * Math.max(0.03, radial);
    const ez = Math.cos(ang) * Math.max(0.03, radial);
    acc.addSphere([ex, ey, ez], [0.065, 0.038, 0.042], "#bae6fd", 3.0, 10, 8, [0, ang * 0.3, 0.2]);
  }

  // 2. CEPHALIC ALAE (Bilateral cervical cuticular expansions, Region 4, 4.0)
  acc.addSphere([-1.45, 0.18, 0], [0.24, 0.07, 0.04], "#38bdf8", 4.0, 18, 12);
  acc.addSphere([-1.45, -0.14, 0], [0.24, 0.07, 0.04], "#38bdf8", 4.0, 18, 12);

  // 3. OUTER FUSIFORM CUTICLE & LONG POINTED PIN TAIL (Region 1, 1.6 - cuttable)
  acc.addTube(
    bodyPts,
    (t) => {
      if (t < 0.15) return 0.09 + (t / 0.15) * 0.17;
      if (t < 0.65) return 0.26 - ((t - 0.15) / 0.5) * 0.04;
      // Pin-like long pointed tail (posterior 1/3)
      const s = (t - 0.65) / 0.35;
      return 0.22 * Math.pow(1.0 - s, 1.45) + 0.008;
    },
    "#f8fafc",
    1.6,
    64,
    20
  );
}

function buildP20GrahamTest(acc: MeshAcc) {
  // 1. PERIANAL EPIDERMAL FOLDS (Region 3, 3.6)
  for (let f = -2; f <= 2; f++) {
    const foldPts: [number, number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      foldPts.push([
        -1.5 + t * 3.0,
        -0.42 + Math.cos(t * Math.PI * 2) * 0.06,
        f * 0.36 + Math.sin(t * Math.PI) * 0.08,
      ]);
    }
    acc.addTube(foldPts, () => 0.22, f % 2 === 0 ? "#fda4af" : "#fb7185", 3.6, 28, 12);
  }

  // 2. GRAVID FEMALE CRAWLING & OVIPOSITING AT NIGHT (Region 1, 1.0)
  const wormPts: [number, number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    wormPts.push([
      -1.35 + t * 2.1,
      -0.08 + Math.sin(t * Math.PI * 2.5) * 0.12,
      -0.25 + Math.cos(t * Math.PI * 2.0) * 0.28,
    ]);
  }
  acc.addTube(
    wormPts,
    (t) => (t < 0.68 ? 0.16 * Math.sin(t * Math.PI * 0.8 + 0.3) : 0.14 * Math.pow(1 - (t - 0.68) / 0.32, 1.4) + 0.01),
    "#f8fafc",
    1.0,
    48,
    14
  );

  // 3. CLUSTERS OF D-SHAPED EGGS DEPOSITED IN ALBUMINOID TRAIL (Region 2, 2.6)
  for (let i = 0; i < 24; i++) {
    const ex = 0.25 + (i % 6) * 0.18 + Math.sin(i * 2.1) * 0.05;
    const ey = 0.02 + (i % 3) * 0.14;
    const ez = -0.15 + Math.floor(i / 6) * 0.18;
    acc.addSphere([ex, ey, ez], [0.095, 0.055, 0.062], "#7dd3fc", 2.6, 14, 10, [0.1, i * 0.5, 0]);
    acc.addSphere([ex, ey, ez], [0.055, 0.03, 0.035], "#fef08a", 2.0, 10, 8);
  }

  // 4. GRAHAM TRANSPARENT CELLOPHANE TAPE STRIP CAPTURING EGGS (Region 4, 4.6)
  const tapePts: [number, number, number][] = [
    [-0.4, 0.52, 0.0],
    [0.35, 0.32, 0.0],
    [1.15, 0.45, 0.0],
  ];
  acc.addTube(tapePts, () => 0.04, "#cbd5e1", 4.6, 20, 8);
  const tapeSheet = new THREE.BoxGeometry(1.65, 0.04, 1.15);
  tapeSheet.rotateZ(-0.12);
  tapeSheet.translate(0.55, 0.38, 0.05);
  acc.addGeometry(tapeSheet, "#cbd5e1", 4.6);
}

function buildP20MaleAdult(acc: MeshAcc) {
  // Curved "?" shaped body (Region 1, 1.6 - cuttable)
  const malePts: [number, number, number][] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    if (t < 0.62) {
      const s = t / 0.62;
      malePts.push([-1.25 + s * 1.75, 0.15 + Math.sin(s * Math.PI) * 0.12, 0]);
    } else {
      const s = (t - 0.62) / 0.38;
      const ang = s * Math.PI * 1.45;
      malePts.push([
        0.50 + Math.sin(ang) * 0.42,
        0.15 - (1.0 - Math.cos(ang)) * 0.38,
        0,
      ]);
    }
  }

  // 1. INTERNAL ESOPHAGEAL BULB & TESTIS emitted FIRST (Region 2, 2.0)
  acc.addTube(
    [
      [-1.20, 0.15, 0],
      [-0.95, 0.18, 0],
    ],
    () => 0.065,
    "#fb7185",
    2.0,
    16,
    10
  );
  acc.addSphere([-0.82, 0.19, 0], [0.13, 0.13, 0.13], "#f43f5e", 2.0, 20, 16);
  // Single tubular testis
  acc.addTube(malePts.slice(12, 42), () => 0.06, "#fde047", 2.0, 36, 10);

  // Cephalic alae
  acc.addSphere([-1.10, 0.31, 0], [0.18, 0.055, 0.035], "#38bdf8", 2.0, 14, 10);
  acc.addSphere([-1.10, 0.01, 0], [0.18, 0.055, 0.035], "#38bdf8", 2.0, 14, 10);

  // 2. SINGLE TERMINAL COPULATORY SPICULE (Region 3, 3.0)
  const tailEnd = malePts[48];
  acc.addTube(
    [
      [tailEnd[0], tailEnd[1], 0],
      [tailEnd[0] - 0.24, tailEnd[1] + 0.14, 0],
    ],
    (t) => 0.032 * (1.0 - t * 0.75),
    "#f59e0b",
    3.0,
    16,
    10
  );

  // 3. LATERAL CUTICULAR CRESTS (Region 4, 4.0)
  const crestPts = malePts.slice(8, 38).map(([x, y]): [number, number, number] => [x, y, 0.17]);
  acc.addTube(crestPts, () => 0.028, "#38bdf8", 4.0, 32, 8);

  // 4. OUTER MALE CUTICLE (Region 1, 1.6 - cuttable)
  acc.addTube(
    malePts,
    (t) => 0.17 * Math.sin(Math.pow(t, 0.35) * Math.PI * 0.92 + 0.08),
    "#e2e8f0",
    1.6,
    56,
    18
  );
}

// ============================================================================
// P21: TRICHURIS TRICHIURA BUILDERS
// ============================================================================

function buildP21BarrelEgg(acc: MeshAcc) {
  // 1. UNSEGMENTED CENTRAL OVULAR BLASTOMERE MASS emitted FIRST (Region 3, 3.0)
  acc.addSphere([0, 0, 0], [0.64, 0.48, 0.48], "#fde68a", 3.0, 28, 22);
  for (let i = 0; i < 18; i++) {
    const gx = Math.sin(i * 4.1) * 0.42;
    const gy = Math.cos(i * 5.7) * 0.28;
    const gz = Math.sin(i * 8.3) * 0.28;
    acc.addSphere([gx, gy, gz], [0.11, 0.10, 0.10], "#f59e0b", 3.0, 12, 10);
  }

  // 2. BIPOLAR REFRACTILE HYALINE MUCOID PLUGS (Region 2, 2.0)
  acc.addSphere([-1.05, 0, 0], [0.24, 0.22, 0.22], "#e0f2fe", 2.0, 22, 18);
  acc.addSphere([1.05, 0, 0], [0.24, 0.22, 0.22], "#e0f2fe", 2.0, 22, 18);

  // 3. POLAR COLLAR RINGS AROUND PLUG BASES (Region 4, 4.0)
  const torusL = new THREE.TorusGeometry(0.23, 0.055, 14, 28);
  torusL.rotateY(Math.PI / 2);
  torusL.translate(-0.88, 0, 0);
  acc.addGeometry(torusL, "#78350f", 4.0);

  const torusR = new THREE.TorusGeometry(0.23, 0.055, 14, 28);
  torusR.rotateY(Math.PI / 2);
  torusR.translate(0.88, 0, 0);
  acc.addGeometry(torusR, "#78350f", 4.0);

  // 4. OUTER GOLDEN-BROWN BARREL-SHAPED TRIPLE SHELL (Region 1, 1.6 - cuttable)
  const barrelGeom = new THREE.SphereGeometry(1, 48, 36);
  const pos = barrelGeom.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // Barrel / lemon shape truncated at both X poles
    const xClamped = Math.max(-0.88, Math.min(0.88, x * 1.05));
    const bulge = 1.0 + 0.14 * (1.0 - x * x);
    pos.setXYZ(i, xClamped, y * 0.68 * bulge, z * 0.68 * bulge);
  }
  acc.addGeometry(barrelGeom, "#b45309", 1.6);
}

function buildP21WhipwormAdults(acc: MeshAcc) {
  // Female Whipworm curve: Anterior 3/5 capillary thin, Posterior 2/5 thick handle
  const femPts: [number, number, number][] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    if (t < 0.6) {
      const s = t / 0.6;
      femPts.push([
        -1.55 + s * 1.75,
        0.18 + Math.sin(s * Math.PI * 3.0) * 0.22,
        Math.cos(s * Math.PI * 2.0) * 0.12,
      ]);
    } else {
      const s = (t - 0.6) / 0.4;
      femPts.push([
        0.20 + s * 1.25,
        0.18 + Math.sin(s * Math.PI) * 0.15,
        0,
      ]);
    }
  }

  // 1. INTERNAL STICHOSOME (Single-file row of giant stichocytes along anterior 3/5, Region 2, 2.0)
  for (let i = 3; i <= 35; i += 2) {
    const p = femPts[i];
    acc.addSphere([p[0], p[1], p[2]], [0.052, 0.048, 0.048], "#f59e0b", 2.0, 12, 10);
  }

  // 2. INTERNAL UTERUS PACKED WITH BARREL EGGS IN POSTERIOR HANDLE (Region 3, 3.0)
  for (let i = 38; i <= 56; i++) {
    const p = femPts[i];
    const ang = i * 1.9;
    acc.addSphere(
      [p[0], p[1] + Math.sin(ang) * 0.08, p[2] + Math.cos(ang) * 0.08],
      [0.065, 0.038, 0.038],
      "#b45309",
      3.0,
      10,
      8
    );
  }
  // Outer thick posterior handle of female (Region 3, 3.6 - cuttable)
  acc.addTube(
    femPts.slice(34),
    (t) => 0.08 + Math.sin(Math.pow(t, 0.35) * Math.PI * 0.92 + 0.08) * 0.19,
    "#fda4af",
    3.6,
    32,
    18
  );

  // 3. ANTERIOR 3/5 CAPILLARY CORD OF FEMALE (Region 1, 1.6 - cuttable)
  acc.addTube(
    femPts.slice(0, 36),
    (t) => 0.048 + t * 0.035,
    "#fef3c7",
    1.6,
    44,
    12
  );

  // 4. MALE POSTERIOR WATCH-SPRING COIL + SPINOSE SPICULAR SHEATH (Region 4, 4.0)
  const malePts: [number, number, number][] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const ang = t * Math.PI * 2.35;
    const r = 0.38 - t * 0.18;
    malePts.push([
      0.72 + Math.cos(ang) * r,
      -0.52 + Math.sin(ang) * r,
      0.22 + t * 0.12,
    ]);
  }
  acc.addTube(malePts, () => 0.13, "#fb7185", 4.0, 48, 14);
  // Eversible spinose spicular sheath + single spicule at center of coil
  const tip = malePts[48];
  acc.addTube(
    [
      [tip[0], tip[1], tip[2]],
      [tip[0] - 0.25, tip[1] + 0.15, tip[2] + 0.05],
    ],
    () => 0.042,
    "#fde68a",
    4.0,
    16,
    10
  );
  acc.addTube(
    [
      [tip[0] - 0.18, tip[1] + 0.11, tip[2] + 0.04],
      [tip[0] - 0.36, tip[1] + 0.22, tip[2] + 0.08],
    ],
    () => 0.018,
    "#b45309",
    4.0,
    12,
    8
  );
}

function buildP21ColonicTunnel(acc: MeshAcc) {
  // 1. SYNCYTIAL EPITHELIAL TUNNEL OF COLONIC ENTEROCYTES (Region 2, 2.6 - cuttable)
  for (let i = 0; i < 8; i++) {
    const cx = -1.35 + i * 0.32;
    acc.addSphere([cx, -0.15, 0.12], [0.22, 0.32, 0.28], "#fda4af", 2.6, 18, 14);
    // Enterocyte nuclei pushed basally
    acc.addSphere([cx, -0.34, 0.12], [0.07, 0.09, 0.07], "#881337", 2.0, 10, 8);
  }

  // 2. THREADED CAPILLARY ANTERIOR END WITH STICHOSOME (Region 1, 1.0)
  const antPts: [number, number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    antPts.push([
      -1.45 + t * 1.85,
      -0.06 + Math.sin(t * Math.PI * 3.5) * 0.16,
      0.12 + Math.cos(t * Math.PI * 3.5) * 0.08,
    ]);
  }
  acc.addTube(antPts, () => 0.072, "#fef3c7", 1.0, 44, 12);
  for (let i = 4; i <= 36; i += 3) {
    const p = antPts[i];
    acc.addSphere([p[0], p[1], p[2]], [0.055, 0.055, 0.055], "#f59e0b", 1.0, 10, 8);
  }

  // 3. THICK POSTERIOR BODY HANGING FREELY INTO CECAL LUMEN (Region 3, 3.0)
  const postPts: [number, number, number][] = [
    [0.40, -0.02, 0.12],
    [0.72, 0.28, 0.10],
    [1.05, 0.55, 0.05],
    [1.32, 0.38, 0.0],
  ];
  acc.addTube(
    postPts,
    (t) => 0.08 + Math.sin(Math.pow(t, 0.35) * Math.PI * 0.9 + 0.1) * 0.18,
    "#f43f5e",
    3.0,
    32,
    16
  );

  // 4. LAMINA PROPRIA MICROHEMORRHAGE & EOSINOPHILS/MAST CELLS (Region 4, 4.0)
  const cellPos: [number, number, number][] = [
    [-0.55, -0.48, 0.25],
    [-0.05, -0.45, 0.32],
    [0.35, -0.42, 0.28],
    [-0.95, -0.46, 0.22],
  ];
  cellPos.forEach(([x, y, z], idx) => {
    acc.addSphere([x, y, z], [0.11, 0.09, 0.11], idx % 2 === 0 ? "#e11d48" : "#c084fc", 4.0, 12, 10);
  });
}

function buildP21RectalProlapse(acc: MeshAcc) {
  // 1. EDEMATOUS PROLAPSED RECTAL MUCOSAL RINGS (Region 1, 1.6 - cuttable)
  const ring1 = new THREE.TorusGeometry(0.95, 0.36, 24, 48);
  acc.addGeometry(ring1, "#e11d48", 1.6);
  const ring2 = new THREE.TorusGeometry(0.52, 0.28, 22, 40);
  ring2.translate(0, 0, 0.18);
  acc.addGeometry(ring2, "#be123c", 1.6);

  // 2. MULTIPLE WHITE WHIPWORMS ATTACHED TO PROLAPSED MUCOSA (Region 2, 2.0)
  const angles = [0.3, 1.15, 2.1, 3.05, 4.1, 5.2];
  angles.forEach((ang, idx) => {
    const r = 0.85;
    const bx = Math.cos(ang) * r;
    const by = Math.sin(ang) * r;
    const wPts: [number, number, number][] = [
      [bx * 0.85, by * 0.85, 0.25],
      [bx * 1.05, by * 1.05, 0.45],
      [bx * 1.18 + (idx % 2 === 0 ? 0.15 : -0.15), by * 1.12, 0.55],
    ];
    acc.addTube(wPts, (t) => 0.045 + t * 0.085, "#fef3c7", 2.0, 20, 12);
  });

  // 3. BLOODY MUCUS EXUDATE WITH BARREL EGGS (Region 3, 3.0)
  const eggCoords: [number, number, number][] = [
    [-0.45, -0.32, 0.52],
    [-0.25, -0.45, 0.48],
    [0.35, -0.38, 0.52],
  ];
  eggCoords.forEach(([ex, ey, ez]) => {
    acc.addSphere([ex, ey, ez], [0.11, 0.065, 0.065], "#b45309", 3.0, 14, 10);
    acc.addSphere([ex - 0.11, ey, ez], [0.03, 0.028, 0.028], "#e0f2fe", 3.0, 8, 8);
    acc.addSphere([ex + 0.11, ey, ez], [0.03, 0.028, 0.028], "#e0f2fe", 3.0, 8, 8);
  });

  // 4. CHARCOT-LEYDEN CRYSTALS IN EXUDATE (Region 4, 4.0)
  const c1 = new THREE.ConeGeometry(0.06, 0.24, 6);
  const c2 = new THREE.ConeGeometry(0.06, 0.24, 6);
  c1.translate(0, 0.12, 0);
  c2.rotateX(Math.PI);
  c2.translate(0, -0.12, 0);
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(0.55, -0.35, 0.48),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0.4, 0.6)),
    new THREE.Vector3(1, 1, 1)
  );
  acc.addGeometry(c1, "#c084fc", 4.0, m);
  acc.addGeometry(c2, "#c084fc", 4.0, m);
}

// ============================================================================
// P22: STRONGYLOIDES STERCORALIS BUILDERS
// ============================================================================

function buildP22RhabditiformL1(acc: MeshAcc) {
  // Larva curve from [-1.45, 0, 0] to [+1.45, 0, 0]
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 52; i++) {
    const t = i / 52;
    pts.push([
      -1.45 + t * 2.9,
      Math.sin(t * Math.PI * 1.6) * 0.22,
      Math.cos(t * Math.PI * 1.2) * 0.08,
    ]);
  }

  // 1. VERY SHORT BUCCAL CAVITY + RHABDITOID ESOPHAGUS WITH BULB emitted FIRST (Region 2, 2.0)
  // Short buccal canal at very tip (-1.44 to -1.38)
  acc.addTube([pts[0], pts[2]], () => 0.035, "#fef08a", 2.0, 8, 8);
  // Procorpus + narrow isthmus
  acc.addTube(
    pts.slice(2, 13),
    (t) => (t < 0.72 ? 0.085 : 0.045),
    "#f43f5e",
    2.0,
    20,
    12
  );
  // Posterior rhabditoid valvular bulb
  const bulbPt = pts[14];
  acc.addSphere([bulbPt[0], bulbPt[1], bulbPt[2]], [0.125, 0.115, 0.115], "#e11d48", 2.0, 20, 16);

  // 2. LARGE PROMINENT CRESCENTIC GENITAL PRIMORDIUM (Region 3, 3.0)
  const gpPt = pts[28];
  acc.addSphere(
    [gpPt[0], gpPt[1] - 0.085, gpPt[2] + 0.02],
    [0.22, 0.095, 0.10],
    "#eab308",
    3.0,
    20,
    14
  );

  // 3. TUBULAR INTESTINE & POINTED CONICAL TAIL (Region 4, 4.0)
  acc.addTube(
    pts.slice(15, 48),
    (t) => 0.078 * (1.0 - t * 0.45),
    "#38bdf8",
    4.0,
    36,
    12
  );

  // 4. OUTER TRANSLUCENT CUTICLE OF L1 LARVA (Region 1, 1.6 - cuttable)
  acc.addTube(
    pts,
    (t) => {
      if (t < 0.12) return 0.07 + (t / 0.12) * 0.13;
      if (t < 0.78) return 0.20;
      const s = (t - 0.78) / 0.22;
      return 0.20 * Math.pow(1.0 - s, 1.25) + 0.01;
    },
    "#e2e8f0",
    1.6,
    60,
    18
  );
}

function buildP22FilariformL3(acc: MeshAcc) {
  // Slender S-curve from [-1.62, 0, 0] to [+1.58, 0, 0]
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    pts.push([
      -1.62 + t * 3.20,
      Math.sin(t * Math.PI * 2.0) * 0.24,
      Math.cos(t * Math.PI * 1.5) * 0.08,
    ]);
  }

  // 1. LONG CYLINDRICAL FILARIFORM ESOPHAGUS (50% of body length — 1:1 ratio, Region 2, 2.0)
  acc.addTube(pts.slice(1, 30), () => 0.068, "#fb7185", 2.0, 36, 12);

  // 2. POSTERIOR INTESTINE (Remaining 50% of body length, Region 3, 3.0)
  acc.addTube(pts.slice(30, 56), (t) => 0.068 * (1.0 - t * 0.35), "#38bdf8", 3.0, 36, 12);

  // 3. PATHOGNOMONIC NOTCHED / BIFID TAIL TIP (Region 4, 4.0)
  const tailBase = pts[58];
  const tailEnd = pts[60];
  // Bifid fork (two distinct prongs forming a V-notch at the tail tip)
  acc.addTube(
    [
      [tailBase[0], tailBase[1], tailBase[2]],
      [tailEnd[0] + 0.12, tailEnd[1] + 0.065, tailEnd[2]],
    ],
    (t) => 0.045 * (1.0 - t * 0.55),
    "#fbbf24",
    4.0,
    12,
    10
  );
  acc.addTube(
    [
      [tailBase[0], tailBase[1], tailBase[2]],
      [tailEnd[0] + 0.12, tailEnd[1] - 0.065, tailEnd[2]],
    ],
    (t) => 0.045 * (1.0 - t * 0.55),
    "#fbbf24",
    4.0,
    12,
    10
  );

  // 4. OUTER SLENDER UNSHEATHED CUTICLE OF L3 (Region 1, 1.6 - cuttable)
  acc.addTube(
    pts.slice(0, 59),
    (t) => {
      if (t < 0.08) return 0.06 + (t / 0.08) * 0.075;
      if (t < 0.88) return 0.135;
      return 0.135 * (1.0 - ((t - 0.88) / 0.12) * 0.45);
    },
    "#cbd5e1",
    1.6,
    60,
    16
  );
}

function buildP22ParthenogeneticFemale(acc: MeshAcc) {
  // 1. DUODENAL CRYPT OF LIEBERKÜHN (Region 4, 4.6 - cuttable)
  const cryptPts: [number, number, number][] = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const ang = (t - 0.5) * Math.PI * 1.4;
    cryptPts.push([
      Math.sin(ang) * 1.25,
      -0.38 + (1.0 - Math.cos(ang)) * 0.35,
      -0.18,
    ]);
  }
  acc.addTube(cryptPts, () => 0.28, "#fda4af", 4.6, 36, 14);

  // 2. PARTHENOGENETIC ADULT FEMALE THREADED IN MUCOSA (Region 1, 1.6 - cuttable)
  const femPts: [number, number, number][] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    femPts.push([
      -1.45 + t * 2.9,
      0.02 + Math.sin(t * Math.PI * 2.2) * 0.24,
      0.12 + Math.cos(t * Math.PI * 2.2) * 0.08,
    ]);
  }
  // Cylindrical esophagus + single-file embryonated eggs inside uterus (Region 2, 2.0)
  acc.addTube(femPts.slice(1, 16), () => 0.055, "#fb7185", 2.0, 20, 10);
  for (let i = 18; i <= 40; i += 3) {
    const p = femPts[i];
    acc.addSphere([p[0], p[1], p[2]], [0.095, 0.062, 0.062], "#fde047", 2.0, 14, 10);
  }
  acc.addTube(femPts, () => 0.135, "#f8fafc", 1.6, 52, 16);

  // 3. HATCHING L1 RHABDITIFORM LARVAE EMERGING INTO DUODENAL LUMEN (Region 3, 3.0)
  const l1Pts: [number, number, number][] = [
    [0.55, 0.18, 0.18],
    [0.75, 0.42, 0.22],
    [0.98, 0.58, 0.18],
    [1.18, 0.48, 0.12],
  ];
  acc.addTube(l1Pts, (t) => 0.055 * Math.sin(t * Math.PI * 0.85 + 0.15), "#38bdf8", 3.0, 24, 10);
}

function buildP22Hyperinfection(acc: MeshAcc) {
  // 1. ULCERATED COLONIC WALL & MESENTERIC VENULE ENDOTHELIUM (Region 3, 3.6 - cuttable)
  const vesselPts: [number, number, number][] = [
    [-1.45, -0.25, 0.0],
    [0.0, -0.18, 0.05],
    [1.45, -0.28, 0.0],
  ];
  acc.addTube(vesselPts, () => 0.34, "#e11d48", 3.6, 36, 16);

  // 2. INVASIVE AUTOINFECTIVE L3 LARVAE PENETRATING TRANSMURALLY (Region 1, 1.0)
  const l3Paths: [number, number, number][][] = [
    [
      [-0.65, 0.65, 0.25],
      [-0.25, 0.22, 0.18],
      [0.05, -0.15, 0.08],
      [0.45, -0.22, 0.05],
    ],
    [
      [0.25, 0.72, -0.15],
      [0.45, 0.25, -0.05],
      [0.75, -0.18, 0.05],
    ],
  ];
  l3Paths.forEach((path) => {
    acc.addTube(path, () => 0.085, "#fef08a", 1.0, 32, 12);
  });

  // 3. PIGGYBACKING ENTERIC GRAM-NEGATIVE BACILLI (E. coli / Klebsiella) ON LARVA (Region 2, 2.0)
  const bacilliCoords: [number, number, number][] = [
    [-0.22, 0.24, 0.27],
    [-0.12, 0.12, 0.24],
    [0.02, -0.05, 0.18],
    [0.28, -0.16, 0.15],
    [0.48, 0.28, 0.05],
    [0.62, 0.02, 0.12],
  ];
  bacilliCoords.forEach(([bx, by, bz], idx) => {
    acc.addSphere([bx, by, bz], [0.075, 0.032, 0.032], "#22c55e", 2.0, 12, 10, [0.2, idx * 0.6, 0.4]);
  });

  // 4. SUPPRESSED / APOPTOTIC LEUKOCYTES (Region 4, 4.0)
  acc.addSphere([0.85, -0.25, 0.22], [0.13, 0.12, 0.13], "#a855f7", 4.0, 14, 12);
  acc.addSphere([-0.85, -0.22, 0.25], [0.12, 0.11, 0.12], "#a855f7", 4.0, 14, 12);
}

function buildStageGeometry(speciesCode: IntestinalNematodeSpeciesCode, stageId: string): THREE.BufferGeometry {
  const acc = new MeshAcc();

  if (speciesCode === "p19") {
    if (stageId === "egg_fertile") buildP19FertileEgg(acc);
    else if (stageId === "egg_differential") buildP19DifferentialEggs(acc);
    else if (stageId === "adults_lips") buildP19AdultsAndLips(acc);
    else buildP19LofflerLung(acc);
  } else if (speciesCode === "p20") {
    if (stageId === "egg_d_shaped") buildP20EggDShaped(acc);
    else if (stageId === "female_bulb") buildP20FemaleAdult(acc);
    else if (stageId === "graham_test") buildP20GrahamTest(acc);
    else buildP20MaleAdult(acc);
  } else if (speciesCode === "p21") {
    if (stageId === "egg_barrel") buildP21BarrelEgg(acc);
    else if (stageId === "adults_whipworm") buildP21WhipwormAdults(acc);
    else if (stageId === "colonic_tunnel") buildP21ColonicTunnel(acc);
    else buildP21RectalProlapse(acc);
  } else {
    if (stageId === "rhabditiform_l1") buildP22RhabditiformL1(acc);
    else if (stageId === "filariform_l3") buildP22FilariformL3(acc);
    else if (stageId === "parthenogenetic_female") buildP22ParthenogeneticFemale(acc);
    else buildP22Hyperinfection(acc);
  }

  return acc.toBufferGeometry();
}

// ============================================================================
// MAIN REACT COMPONENT (Unified Atlas HUD & Layout)
// ============================================================================

export interface IntestinalNematodes3DViewerProps {
  speciesCode: IntestinalNematodeSpeciesCode;
  onClose?: () => void;
}

export default function IntestinalNematodes3DViewer({
  speciesCode,
  onClose,
}: IntestinalNematodes3DViewerProps) {
  const speciesMeta = SPECIES_META[speciesCode] ?? SPECIES_META.p19;

  const [stageId, setStageId] = useState<string>(speciesMeta.stages[0].id);
  const [selectedRegion, setSelectedRegion] = useState<number>(1);
  const [hoveredRegion, setHoveredRegion] = useState<number>(0);
  const [shaderMode, setShaderMode] = useState<ShaderMode>("biological");
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [translucency, setTranslucency] = useState<number>(0.22);
  const [clipSection, setClipSection] = useState<number>(0.0);
  const [motility, setMotility] = useState<number>(0.35);
  const [stageMenuOpen, setStageMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setStageId(speciesMeta.stages[0].id);
    setSelectedRegion(1);
    setClipSection(0.0);
  }, [speciesCode, speciesMeta]);

  const stageMeta = useMemo(
    () => speciesMeta.stages.find((s) => s.id === stageId) ?? speciesMeta.stages[0],
    [speciesMeta, stageId]
  );

  const activeRegionMeta = useMemo(
    () => stageMeta.regions.find((r) => r.id === selectedRegion) ?? stageMeta.regions[0],
    [stageMeta, selectedRegion]
  );

  const mountRef = useRef<HTMLDivElement | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const desiredCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...stageMeta.defaultCameraPos));
  const desiredTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(...stageMeta.defaultTarget));
  const isAnimatingCamRef = useRef<boolean>(false);
  const motilityRef = useRef<number>(motility);
  motilityRef.current = motility;

  const [labelCoords, setLabelCoords] = useState<
    Record<number, { x: number; y: number; ax: number; ay: number; visible: boolean }>
  >({});

  // Setup Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(...stageMeta.defaultCameraPos);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.3;
    controls.maxDistance = 9.0;
    controlsRef.current = controls;

    const geom = buildStageGeometry(speciesMeta.code, stageMeta.id);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      vertexColors: true,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
      uniforms: {
        uCameraPos: { value: camera.position.clone() },
        uTime: { value: 0 },
        uTranslucency: { value: translucency },
        uClipY: { value: 2.5 - clipSection * 3.8 },
        uSelectedRegion: { value: selectedRegion },
        uHoverRegion: { value: 0 },
        uShaderMode: { value: 0 },
      },
    });
    materialRef.current = mat;

    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);
    meshRef.current = mesh;

    // Raycasting for click & hover
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const getHitRegion = (ev: MouseEvent): number => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(mesh, false);
      if (intersects.length > 0 && intersects[0].face) {
        const regAttr = mesh.geometry.getAttribute("aRegionId");
        const raw = regAttr.getX(intersects[0].face.a);
        return Math.floor(raw + 0.05);
      }
      return 0;
    };

    const onPointerDown = (ev: MouseEvent) => {
      downX = ev.clientX;
      downY = ev.clientY;
    };

    const onPointerUp = (ev: MouseEvent) => {
      if (Math.hypot(ev.clientX - downX, ev.clientY - downY) > 6) return;
      const rId = getHitRegion(ev);
      if (rId >= 1 && rId <= 4) {
        setSelectedRegion(rId);
      }
    };

    const onPointerMove = (ev: MouseEvent) => {
      const rId = getHitRegion(ev);
      setHoveredRegion(rId);
      if (materialRef.current) {
        materialRef.current.uniforms.uHoverRegion.value = rId;
      }
      renderer.domElement.style.cursor = rId > 0 ? "pointer" : "grab";
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = t;
        materialRef.current.uniforms.uCameraPos.value.copy(camera.position);
      }

      if (meshRef.current) {
        const m = motilityRef.current;
        meshRef.current.rotation.y = Math.sin(t * 0.7) * 0.08 * m;
        meshRef.current.rotation.z = Math.cos(t * 0.9) * 0.04 * m;
        meshRef.current.position.y = Math.sin(t * 1.3) * 0.03 * m;
      }

      if (isAnimatingCamRef.current) {
        camera.position.lerp(desiredCamPosRef.current, 0.09);
        controls.target.lerp(desiredTargetRef.current, 0.09);
        if (camera.position.distanceTo(desiredCamPosRef.current) < 0.03) {
          isAnimatingCamRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      // Update 2D projected coordinates for SVG leader lines
      if (meshRef.current && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const nextCoords: Record<number, { x: number; y: number; ax: number; ay: number; visible: boolean }> = {};
        stageMeta.regions.forEach((reg) => {
          const anchor = new THREE.Vector3(...reg.focusTarget).applyMatrix4(meshRef.current!.matrixWorld);
          const pill = new THREE.Vector3(...reg.labelPoint).applyMatrix4(meshRef.current!.matrixWorld);
          anchor.project(camera);
          pill.project(camera);
          nextCoords[reg.id] = {
            ax: (anchor.x * 0.5 + 0.5) * w,
            ay: (-anchor.y * 0.5 + 0.5) * h,
            x: Math.max(75, Math.min(w - 75, (pill.x * 0.5 + 0.5) * w)),
            y: Math.max(54, Math.min(h - 54, (-pill.y * 0.5 + 0.5) * h)),
            visible: anchor.z < 1 && pill.z < 1,
          };
        });
        setLabelCoords(nextCoords);
      }
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frameId);
      geom.dispose();
      mat.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speciesMeta.code, stageMeta.id]);

  // Sync shader uniforms when React state updates
  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTranslucency.value = translucency;
    materialRef.current.uniforms.uClipY.value = 2.5 - clipSection * 3.8;
    materialRef.current.uniforms.uSelectedRegion.value = selectedRegion;
    const modeIdx =
      shaderMode === "biological" ? 0 : shaderMode === "giemsa" ? 1 : shaderMode === "sem" ? 2 : 3;
    materialRef.current.uniforms.uShaderMode.value = modeIdx;
    materialRef.current.depthWrite = translucency < 0.55 && shaderMode !== "xray";
  }, [translucency, clipSection, selectedRegion, shaderMode]);

  const handleFocusRegion = (reg: RegionMeta) => {
    setSelectedRegion(reg.id);
    const target = new THREE.Vector3(...reg.focusTarget);
    const dir = new THREE.Vector3(reg.labelPoint[0], reg.labelPoint[1] + 0.25, reg.labelPoint[2] + 1.1).normalize();
    desiredTargetRef.current.copy(target);
    desiredCamPosRef.current.copy(target).addScaledVector(dir, reg.focusDistance);
    isAnimatingCamRef.current = true;
  };

  const handleResetView = () => {
    desiredTargetRef.current.set(...stageMeta.defaultTarget);
    desiredCamPosRef.current.set(...stageMeta.defaultCameraPos);
    isAnimatingCamRef.current = true;
  };

  const isBrightField = shaderMode === "giemsa";

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* PROTAGONIST 3D VIEWPORT */}
      <div
        className={`relative w-full h-[58vh] min-h-[430px] max-h-[670px] rounded-2xl overflow-hidden border transition-colors duration-300 ${
          isBrightField
            ? "bg-[#faf7f2] border-amber-300/70 shadow-inner"
            : "bg-slate-950 border-slate-800/90 shadow-2xl"
        }`}
      >
        {/* WebGL Canvas Mount */}
        <div ref={mountRef} className="w-full h-full" />

        {/* SVG Leader Lines & Floating Region Pills */}
        {showLabels && (
          <svg className="pointer-events-none absolute inset-0 w-full h-full z-10">
            {stageMeta.regions.map((reg) => {
              const c = labelCoords[reg.id];
              if (!c || !c.visible) return null;
              const isSel = selectedRegion === reg.id;
              return (
                <g key={reg.id}>
                  <line
                    x1={c.ax}
                    y1={c.ay}
                    x2={c.x}
                    y2={c.y}
                    stroke={isSel ? reg.color : isBrightField ? "#78350f" : "#64748b"}
                    strokeWidth={isSel ? 2.2 : 1.2}
                    strokeDasharray={isSel ? "none" : "3 3"}
                    opacity={isSel ? 0.95 : 0.65}
                  />
                  <circle
                    cx={c.ax}
                    cy={c.ay}
                    r={isSel ? 4.5 : 3}
                    fill={reg.color}
                    stroke="#0f172a"
                    strokeWidth={1.2}
                  />
                </g>
              );
            })}
          </svg>
        )}

        {showLabels &&
          stageMeta.regions.map((reg) => {
            const c = labelCoords[reg.id];
            if (!c || !c.visible) return null;
            const isSel = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => handleFocusRegion(reg)}
                style={{ left: `${c.x}px`, top: `${c.y}px` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border backdrop-blur-md ${
                  isSel
                    ? "bg-slate-900/95 text-white border-amber-400 shadow-lg scale-105"
                    : isBrightField
                    ? "bg-white/90 text-slate-800 border-amber-900/20 hover:bg-amber-50"
                    : "bg-slate-900/75 text-slate-200 border-slate-700/80 hover:border-slate-500"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: reg.color }}
                />
                <span className="truncate max-w-[165px]">{reg.shortName}</span>
              </button>
            );
          })}

        {/* TOP COMPACT HUD BAR */}
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* Stage Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setStageMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700/80 backdrop-blur-md shadow-lg"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Elegir forma: {stageMeta.shortName}</span>
                <span className="text-slate-400 text-[10px]">▼</span>
              </button>

              {stageMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-80 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl p-1.5 z-50">
                  {speciesMeta.stages.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setStageId(st.id);
                        setSelectedRegion(1);
                        setStageMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                        st.id === stageMeta.id
                          ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40"
                          : "text-slate-200 hover:bg-slate-800/90"
                      }`}
                    >
                      <span className="font-bold">{st.shortName}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{st.badge}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Focus Active Region Button */}
            <button
              onClick={() => handleFocusRegion(activeRegionMeta)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-medium backdrop-blur-md transition"
            >
              Enfocar: {activeRegionMeta.shortName}
            </button>

            {/* Reset General View */}
            <button
              onClick={handleResetView}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-medium backdrop-blur-md transition"
            >
              Vista general
            </button>
          </div>

          {/* Right Controls: 4 Shader Modes + Toggle Markers + Close */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-0.5 backdrop-blur-md">
              {(
                [
                  { id: "biological", label: "Biológico" },
                  { id: "giemsa", label: speciesMeta.stainLabel },
                  { id: "sem", label: "SEM" },
                  { id: "xray", label: "Rayos X" },
                ] as { id: ShaderMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setShaderMode(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    shaderMode === m.id
                      ? "bg-emerald-500 text-slate-950 shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowLabels((v) => !v)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-medium backdrop-blur-md"
            >
              {showLabels ? "Ocultar marcadores" : "Mostrar marcadores"}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-xl bg-slate-900/90 hover:bg-rose-950/90 text-slate-300 hover:text-rose-200 border border-slate-700/80 flex items-center justify-center text-xs font-bold backdrop-blur-md"
                title="Cerrar visor 3D"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* BOTTOM COMPACT HUD BAR */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-end justify-between gap-2 pointer-events-none">
          <div className="bg-slate-900/85 border border-slate-700/80 rounded-xl px-3 py-2 backdrop-blur-md max-w-md pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {speciesMeta.groupBadge}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{stageMeta.sizeMicrons}</span>
            </div>
            <p className="text-xs font-bold text-white mt-1">
              <span className="italic">{speciesMeta.scientificName}</span> — {stageMeta.name}
            </p>
          </div>

          <div className="bg-slate-900/85 border border-slate-700/80 rounded-xl px-3 py-1.5 backdrop-blur-md flex items-center gap-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-1 bg-emerald-400 rounded-full" />
              <span className="font-mono">{stageMeta.sizeMicrons}</span>
            </div>
            <span className="text-slate-500">|</span>
            <span>Arrastra para rotar · Scroll para zoom</span>
          </div>
        </div>
      </div>

      {/* EXTERNAL CONTROL PANEL & CLINICAL / MORPHOLOGICAL DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 5 cols: 3 Sliders + 4 Region Cards */}
        <div className="lg:col-span-5 flex flex-col gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span className="font-semibold">Translucidez</span>
                <span className="font-mono text-emerald-400">{Math.round(translucency * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.88}
                step={0.02}
                value={translucency}
                onChange={(e) => setTranslucency(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span className="font-semibold text-amber-300">Corte Histológico / Sección 3D</span>
                <span className="font-mono text-amber-400">{Math.round(clipSection * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={clipSection}
                onChange={(e) => setClipSection(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span className="font-semibold">Motilidad</span>
                <span className="font-mono text-sky-400">{Math.round(motility * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={motility}
                onChange={(e) => setMotility(parseFloat(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Regiones Anatómicas Interactivas ({stageMeta.regions.length})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stageMeta.regions.map((reg) => {
              const isSel = selectedRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => handleFocusRegion(reg)}
                  className={`text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1 ${
                    isSel
                      ? "bg-slate-800/95 border-amber-400/80 shadow-md"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: reg.color }}
                    />
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {reg.shortName}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{reg.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 cols: Active Region Details & Microscopy Tip */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activeRegionMeta.color }}
                />
                <h4 className="text-sm font-bold text-white">{activeRegionMeta.name}</h4>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {stageMeta.badge}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
              {activeRegionMeta.description}
            </p>

            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-1">
                Correlación Clínica y Diagnóstica
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                {activeRegionMeta.clinicalNote}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <div className="text-[11px] font-semibold text-emerald-400">
              Resumen de Estadio ({stageMeta.shortName})
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{stageMeta.summary}</p>
            <p className="text-[11px] text-sky-300 mt-1">💡 {stageMeta.microscopyTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
