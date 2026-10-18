"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ============================================================================
// HOOKWORMS & FOODBORNE NEMATODES 3D VIEWER
// (P23 Ancylostoma duodenale, P24 Necator americanus, P32 Trichinella spiralis, P33 Anisakis simplex)
// Hyper-realistic procedural 3D models with 4 stages per species,
// histological cut-plane, analytical normals, and unified Atlas HUD.
// ============================================================================

export type HookwormFoodNematodeSpeciesCode = "p23" | "p24" | "p32" | "p33";
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
  code: HookwormFoodNematodeSpeciesCode;
  scientificName: string;
  commonName: string;
  groupBadge: string;
  stainLabel: string;
  stages: StageMeta[];
}

const SPECIES_META: Record<HookwormFoodNematodeSpeciesCode, SpeciesMeta> = {
  p23: {
    code: "p23",
    scientificName: "Ancylostoma duodenale",
    commonName: "Uncinaria del Viejo Mundo",
    groupBadge: "Geohelminto Hematófago · Strongylida",
    stainLabel: "Lugol / Harada-Mori",
    stages: [
      {
        id: "buccal_teeth",
        name: "Cápsula Bucal Quitinoide con 2 Pares de Dientes Ventrales Curvos",
        shortName: "1. Cápsula Bucal (4 Dientes)",
        badge: "Morfología Diferencial Patognomónica",
        sizeMicrons: "Cápsula cefálica 180–250 µm",
        summary:
          "El rasgo anatómico definitivo que distingue al adulto de Ancylostoma duodenale de Necator americanus es su gran cápsula bucal subglobular quitinosa armada en su borde ventral con DOS PARES DE DIENTES puntiagudos curvados en forma de gancho (un par externo grande y un par interno menor), conectados a un esófago muscular claviforme de succión y glándulas cefálicas anticoagulantes.",
        microscopyTip:
          "Activa el Corte Histológico para seccionar el collar cefálico y examinar el interior de la cápsula bucal, los 4 dientes ventrales y el esófago claviforme.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 3.9],
        regions: [
          {
            id: 1,
            name: "Extremo Cefálico Curvado en 'C' y Collar Cuticular",
            shortName: "Cabeza en 'C' y Collar",
            subtitle: "Incurvación dorsal suave siguiendo la curva general del cuerpo",
            color: "#fda4af",
            description:
              "El extremo anterior de Ancylostoma duodenale se curva suavemente en el mismo sentido que el resto del cuerpo adoptando forma de letra 'C' (a diferencia del gancho dorsal abrupto en 'S' de Necator).",
            clinicalNote:
              "A diferencia de Necator americanus (que solo infecta por vía percutánea), las larvas L3 de Ancylostoma duodenale infectan tanto por vía PERCUTÁNEA como por vía ORAL (agua o verduras contaminadas, produciendo el Síndrome de Wakana con prurito faríngeo, tos, disfonía y náuseas).",
            focusTarget: [-0.25, 0.45, 0.35],
            focusDistance: 2.3,
            labelPoint: [-0.65, 0.82, 0.45],
          },
          {
            id: 2,
            name: "Dos Pares de Dientes Ventrales Quitinoides Ganchudos (4 Dientes)",
            shortName: "2 Pares de Dientes Ventrales",
            subtitle: "Par externo grande con proceso basal y par mediano interno menor",
            color: "#fef08a",
            description:
              "En el margen ventral (superior en vista bucal) de la abertura oral sobresalen cuatro dientes quitinosos triangulares muy afilados y curvados hacia el interior de la cavidad bucal.",
            clinicalNote:
              "Regla mnemotécnica clásica: Ancylostoma duodenale tiene DIENTES (4 dientes en 2 pares); Necator americanus tiene PLACAS cortantes semilunares.",
            focusTarget: [-0.72, 0.25, 0.0],
            focusDistance: 1.8,
            labelPoint: [-0.95, 0.65, 0.15],
          },
          {
            id: 3,
            name: "Cavidad Bucal Infundibuliforme y Lancetas Profundas",
            shortName: "Cavidad Bucal + Lancetas",
            subtitle: "Copa quitinosa rígida que aspira y tritura un tapón de mucosa yeyunal",
            color: "#f59e0b",
            description:
              "Amplia cámara bucal tapizada de quitina dura con un par de pequeñas lancetas triangulares en su fondo próximas a la entrada del esófago para desgarrar los capilares de la vellosidad intestinal aspirada.",
            clinicalNote:
              "Las glándulas cefálicas y esofágicas secretan potentes péptidos anticoagulantes (AcAP5 y AcAPc2, inhibidores directos de los factores Xa y VIIa/TF) que impiden la coagulación mientras el gusano succiona sangre.",
            focusTarget: [-0.45, 0.0, 0.0],
            focusDistance: 1.9,
            labelPoint: [-0.55, -0.58, 0.2],
          },
          {
            id: 4,
            name: "Esófago Muscular Claviforme (Bomba de Succión Hematófaga)",
            shortName: "Esófago Claviforme",
            subtitle: "Faringe muscular en forma de maza que bombea sangre a alta frecuencia",
            color: "#e11d48",
            description:
              "Poderoso esófago muscular ensanchado posteriormente en forma de clava o maza que actúa como una bomba aspirante-impelente capaz de contraerse 120–200 veces por minuto.",
            clinicalNote:
              "Cada adulto de Ancylostoma duodenale causa una pérdida hemática de 0.15 a 0.26 mL de sangre por día (hasta 5–8 veces más que Necator americanus), provocando anemia ferropénica microcítica hipocrómica más precoz y severa.",
            focusTarget: [0.55, -0.05, 0.0],
            focusDistance: 2.2,
            labelPoint: [0.85, 0.55, 0.15],
          },
        ],
      },
      {
        id: "hookworm_egg",
        name: "Huevo de Uncinaria: Cáscara Hialina Delgada y 4–8 Blastómeros (60 × 40 µm)",
        shortName: "2. Huevo (4–8 Blastómeros)",
        badge: "Forma Diagnóstica en Heces Frescas",
        sizeMicrons: "60–75 × 36–40 µm",
        summary:
          "Huevo ovalado elipsoidal de extremos anchamente redondeados, provisto de una cáscara hialina MUY DELGADA, lisa, transparente e incolora (de un solo contorno fino). En heces recién emitidas contiene una mórula central de 4 a 8 blastómeros grisáceos rodeada por un amplio espacio claro hialino. Los huevos de A. duodenale y N. americanus son morfológicamente indistinguibles al microscopio.",
        microscopyTip:
          "Activa el Corte Histológico para abrir la fina cáscara hialina y ver en 3D los blastómeros segmentados y el amplio espacio claro perivitelino.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 3.8],
        regions: [
          {
            id: 1,
            name: "Cáscara Hialina Fina, Lisa e Incolora (Indistinguible entre Especies)",
            shortName: "Cáscara Hialina Delgada",
            subtitle: "Pared transparente de un solo contorno (no teñida por bilis)",
            color: "#e0f2fe",
            description:
              "Cubierta ovular sumamente delgada (~1 µm), totalmente transparente e incolora en solución salina, de contorno perfectamente ovalado y simétrico.",
            clinicalNote:
              "Dado que los huevos de Ancylostoma duodenale y Necator americanus son idénticos al microscopio óptico, en el informe coproparasitológico se reportan como 'Huevos de Uncinaria' (para identificar la especie se requiere cultivo de Harada-Mori para obtener larvas L3 o PCR).",
            focusTarget: [0.0, 0.45, 0.35],
            focusDistance: 2.2,
            labelPoint: [-0.65, 0.78, 0.4],
          },
          {
            id: 2,
            name: "Mórula de 4 a 8 Blastómeros Esféricos Centrales",
            shortName: "4–8 Blastómeros",
            subtitle: "Segmentación embrionaria temprana típica en heces frescas",
            color: "#fcd34d",
            description:
              "En el momento de ser evacuados con las heces, el cigoto ya ha sufrido las primeras divisiones mitóticas mostrando de 4 a 8 (o hasta 16) células blastoméricas granulosas bien delimitadas.",
            clinicalNote:
              "En muestras con estreñimiento o retraso en el transporte (> 12–24 h a temperatura ambiente) la mórula continúa dividiéndose hasta formar una larva L1 rabditoide dentro del huevo.",
            focusTarget: [0.0, 0.0, 0.0],
            focusDistance: 2.0,
            labelPoint: [0.55, 0.42, 0.25],
          },
          {
            id: 3,
            name: "Amplio Espacio Claro Perivitelino (Entre Blastómeros y Cáscara)",
            shortName: "Espacio Claro Hialino",
            subtitle: "Zona transparente ancha que separa la mórula de la pared",
            color: "#bae6fd",
            description:
              "Entre la mórula de blastómeros y la cáscara hialina existe siempre un espacio claro y transparente muy evidente en toda la periferia, especialmente en ambos polos.",
            clinicalNote:
              "Permite diferenciar el huevo de uncinaria del huevo decorticado de Ascaris (cuya pared es mucho más gruesa) y del huevo de Trichostrongylus (que es más largo, > 85 µm, con un polo aguzado y > 32 blastómeros).",
            focusTarget: [0.65, 0.0, 0.0],
            focusDistance: 2.1,
            labelPoint: [0.95, -0.35, 0.2],
          },
          {
            id: 4,
            name: "Riesgo de Eclosión en Muestra Tardía (> 24–48 h → Larva L1)",
            shortName: "Eclosión Tardía in Vitro",
            subtitle: "Si eclosiona en el frasco debe diferenciarse de Strongyloides",
            color: "#fb923c",
            description:
              "Polo del huevo por donde eclosiona la larva rabditoide L1 tras 24–48 horas a temperatura cálida.",
            clinicalNote:
              "Si la muestra de heces no se fija ni refrigera y se examina al día siguiente, los huevos de uncinaria pueden haber eclosionado liberando larvas L1 rabditoides, que se distinguen de Strongyloides por su cavidad bucal LARGA y primordio genital PEQUEÑO.",
            focusTarget: [-0.75, 0.0, 0.0],
            focusDistance: 2.1,
            labelPoint: [-0.95, -0.45, 0.2],
          },
        ],
      },
      {
        id: "copulatory_bursa",
        name: "Adultos: Macho con Bolsa Copulatriz Acampanada (Espículas Libres) y Hembra",
        shortName: "3. Adultos y Bolsa Copulatriz",
        badge: "Dimorfismo Sexual · Costilla Dorsal Tripartita",
        sizeMicrons: "Hembra 10–13 mm · Macho 8–11 mm",
        summary:
          "Nematodos cilíndricos de color blanco-rosado o rojizo (por la sangre ingerida), ligeramente mayores que Necator. La hembra (10–13 mm) tiene la cola cónica terminada en una diminuta espina mucronada y la vulva en el tercio posterior. El macho (8–11 mm) posee en su extremo caudal una amplia bolsa copulatriz membranosa acampanada sostenida por costillas (con rayo dorsal tripartito en la punta) y 2 espículas copulatrices divergentes NO fusionadas.",
        microscopyTip:
          "Enfoca la bolsa copulatriz del macho para observar las costillas musculares y las 2 espículas copulatrices separadas en sus puntas.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.4, 4.4],
        regions: [
          {
            id: 1,
            name: "Hembra Adulta en 'C' (10–13 mm, Vulva Posterior y Espina Caudal)",
            shortName: "Hembra Adulta (10–13 mm)",
            subtitle: "Oviposición de 25.000–30.000 huevos/día; capacidad de hipobiosis",
            color: "#fda4af",
            description:
              "Cuerpo cilíndrico curvado en una suave 'C', con vulva ubicada en el tercio posterior del cuerpo y punta de la cola provista de una pequeña espina o mucrón terminal.",
            clinicalNote:
              "Las larvas L3 de Ancylostoma duodenale tienen la capacidad biológica única de entrar en latencia o arresto del desarrollo (HIPOBIOSIS) durante 6 a 9 meses en el músculo o pared intestinal humana para sincronizar su maduración con la estación lluviosa.",
            focusTarget: [-0.15, 0.35, 0.1],
            focusDistance: 2.5,
            labelPoint: [-0.35, 0.82, 0.2],
          },
          {
            id: 2,
            name: "Bolsa Copulatriz Acampanada del Macho (Ancha y Membranosa)",
            shortName: "Bolsa Copulatriz (Macho)",
            subtitle: "Campana cuticular translúcida sostenida por rayos/costillas musculares",
            color: "#fde68a",
            description:
              "Expansión cuticular caudal en forma de paraguas o campana más ancha que larga, sostenida por costillas musculares dispuestas como los dedos de una mano; la costilla dorsal sólo se divide en su tercio distal en tres pequeñas puntas (tripartita).",
            clinicalNote:
              "La bolsa copulatriz en el extremo posterior del macho es la firma anatómica del orden Strongylida (uncinarias y estrongílidos) y permite abrazar la vulva de la hembra durante la cópula.",
            focusTarget: [0.95, -0.35, 0.15],
            focusDistance: 2.0,
            labelPoint: [1.18, 0.15, 0.25],
          },
          {
            id: 3,
            name: "Dos Espículas Copulatrices Libres y Divergentes (No Fusionadas)",
            shortName: "2 Espículas Libres (Sin Arpón)",
            subtitle: "Puntas simples separadas (a diferencia de las fusionadas de Necator)",
            color: "#f59e0b",
            description:
              "Dos largas cerdas quitinosas copulatrices de ~2 mm que emergen de la cloaca dentro de la bolsa copulatriz; sus extremos distales permanecen separados y terminan en puntas simples sin anzuelo.",
            clinicalNote:
              "En A. duodenale las 2 espículas son divergentes y libres en la punta; en N. americanus las 2 espículas están fusionadas distalmente formando una punta de arpón.",
            focusTarget: [1.12, -0.42, 0.15],
            focusDistance: 1.9,
            labelPoint: [1.28, -0.78, 0.25],
          },
          {
            id: 4,
            name: "Tubo Digestivo Repleto de Sangre y Asas Uterinas",
            shortName: "Intestino con Sangre + Úteros",
            subtitle: "Coloración pardo-rojiza por digestión de hemoglobina del huésped",
            color: "#be123c",
            description:
              "Al seccionar la cutícula se visualiza el intestino rectilíneo teñido de rojo oscuro por los eritrocitos lisados y los túbulos ovárico-uterinos enrollados.",
            clinicalNote:
              "La vida media de un adulto de A. duodenale en el intestino humano es de 1 a 3 años (aunque por hipobiosis larvaria la infección puede manifestarse muchos meses después de abandonar la zona endémica).",
            focusTarget: [-0.35, 0.15, 0.0],
            focusDistance: 2.2,
            labelPoint: [-0.55, -0.45, 0.2],
          },
        ],
      },
      {
        id: "mucosal_hematophagy",
        name: "Hematofagia Yeyunal: Mordedura de Vellosidad y Anemia Ferropénica (0.20 mL/día)",
        shortName: "4. Hematofagia y Anemia",
        badge: "Fisiopatología · Anticoagulantes AcAP",
        sizeMicrons: "Campo histológico 300 µm",
        summary:
          "Vista 3D de la patogenia expoliatriz: el gusano adulto succiona profundamente una vellosidad de la mucosa duodenal/yeyunal dentro de su cápsula bucal, la desgarra con sus 4 dientes ventrales e inyecta anticoagulantes (AcAP inhibidores de FXa/FVIIa). Además de los 0.20 mL de sangre que ingiere por día, al cambiar de sitio deja úlceras que continúan sangrando hacia la luz intestinal.",
        microscopyTip:
          "Observa la vellosidad intestinal atrapada dentro de la cápsula bucal con dientes y la úlcera adyacente que sigue sangrando por efecto de los anticoagulantes parasitarios.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.5, 4.4],
        regions: [
          {
            id: 1,
            name: "Extremo Cefálico de Ancylostoma Mordiendo un Tapón de Vellosidad",
            shortName: "Mordedura de Vellosidad",
            subtitle: "Aspiración mecánica y corte por los 2 pares de dientes ventrales",
            color: "#fda4af",
            description:
              "La cápsula bucal engloba por completo el ápice de una vellosidad yeyunal; los 4 dientes ventrales se clavan en la lámina propia mientras el esófago claviforme ejerce presión negativa.",
            clinicalNote:
              "Cada gusano cambia de sitio de fijación en la mucosa de 4 a 6 veces al día para buscar nuevos lechos capilares.",
            focusTarget: [-0.25, 0.25, 0.1],
            focusDistance: 2.2,
            labelPoint: [-0.45, 0.78, 0.2],
          },
          {
            id: 2,
            name: "Secreción de Anticoagulantes (AcAP5/AcAPc2) y Hemorragia Capilar",
            shortName: "Anticoagulantes AcAP (Anti-FXa)",
            subtitle: "Inhibición directa de la cascada de coagulación y agregación plaquetaria",
            color: "#e11d48",
            description:
              "Las glándulas cefálicas vierten inhibidores específicos del Factor Xa (AcAP5), del complejo Factor VIIa/Factor Tisular (AcAPc2) e inhibidores de integrinas plaquetarias GPIIb/IIIa, además de metaloproteasas que digieren el tejido.",
            clinicalNote:
              "Estos anticoagulantes de Ancylostoma son tan potentes que se han investigado farmacológicamente como modelos antitrombóticos (NAPc2).",
            focusTarget: [-0.15, -0.05, 0.15],
            focusDistance: 2.0,
            labelPoint: [-0.35, -0.58, 0.25],
          },
          {
            id: 3,
            name: "Úlcera Mucosa Previa con Sangrado Residual Persistente",
            shortName: "Úlcera Residual Sangrante",
            subtitle: "Multiplica la pérdida de hierro más allá de lo que ingiere el parásito",
            color: "#be123c",
            description:
              "Vellosidad contigua denudada y ulcerada donde el gusano estuvo fijado horas antes; debido a la impregnación tisular con anticoagulantes AcAP, los capilares rotos siguen rezumando sangre hacia la luz intestinal.",
            clinicalNote:
              "Explica por qué la pérdida total de sangre fecal supera ampliamente el volumen bombeado por el esófago del parásito, llevando a anemia ferropénica severa (Hb < 5–7 g/dL), hipoalbuminemia con edemas (anasarca), cardiomegalia hiperdinámica y pica (geofagia).",
            focusTarget: [0.65, -0.15, 0.2],
            focusDistance: 2.2,
            labelPoint: [0.85, 0.55, 0.3],
          },
          {
            id: 4,
            name: "Eritrocitos Extravasados y Depleción de Hierro Corporal",
            shortName: "Eritrocitos Extravasados",
            subtitle: "Anemia microcítica hipocrómica con ferritina sérica muy baja",
            color: "#dc2626",
            description:
              "Abundantes glóbulos rojos libres en la luz intestinal y atravesando el tubo digestivo del nematodo.",
            clinicalNote:
              "El tratamiento requiere dos pilares simultáneos: (1) antihelmíntico (albendazol 400 mg dosis única o mebendazol 100 mg c/12 h por 3 días) y (2) suplementación oral con sulfato ferroso para reponer los depósitos de ferritina.",
            focusTarget: [0.45, 0.15, 0.3],
            focusDistance: 2.2,
            labelPoint: [0.75, -0.55, 0.4],
          },
        ],
      },
    ],
  },
  p24: {
    code: "p24",
    scientificName: "Necator americanus",
    commonName: "Uncinaria del Nuevo Mundo",
    groupBadge: "Geohelminto Hematófago · Strongylida",
    stainLabel: "Lugol / Harada-Mori",
    stages: [
      {
        id: "cutting_plates",
        name: "Cápsula Bucal con 1 Par de Placas Cortantes Semilunares Ventrales",
        shortName: "1. Cápsula Bucal (Placas Cortantes)",
        badge: "Morfología Diferencial · Sin Dientes Ventrales",
        sizeMicrons: "Cápsula cefálica 140–180 µm",
        summary:
          "A diferencia de Ancylostoma duodenale (que posee 4 dientes puntiagudos), la cápsula bucal globular de Necator americanus está armada en su margen ventral con UN PAR DE PLACAS CORTANTES SEMILUNARES (láminas quitinosas curvas continuas como cuchillas de media luna), además de un cono dorsal mediano y lancetas profundas en el fondo de la cápsula. Su cabeza se dobla abruptamente hacia el dorso en gancho.",
        microscopyTip:
          "Activa el Corte Histológico para observar las dos anchas láminas cortantes semilunares ventrales y el cono dorsal en el fondo de la cápsula.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 3.9],
        regions: [
          {
            id: 1,
            name: "Incurvación Cefálica Dorsal Abrupta en Gancho ('Hookworm')",
            shortName: "Curvatura Dorsal en Gancho",
            subtitle: "Extremo anterior doblado 90° hacia el dorso en sentido opuesto al cuerpo",
            color: "#fda4af",
            description:
              "El extremo cefálico de Necator americanus presenta una flexión dorsal cerrada en forma de gancho o anzuelo, contraria a la curvatura ventral del resto del cuerpo (dando al gusano silueta en 'S').",
            clinicalNote:
              "Es la uncinaria predominante en el continente americano (regiones tropicales y subtropicales), África subsahariana y el sudeste asiático, responsable del > 80% de las infecciones humanas por uncinarias en el mundo.",
            focusTarget: [-0.2, 0.45, 0.25],
            focusDistance: 2.3,
            labelPoint: [-0.55, 0.85, 0.35],
          },
          {
            id: 2,
            name: "Un Par de Placas Cortantes Semilunares Ventrales (2 Láminas)",
            shortName: "Placas Cortantes Semilunares",
            subtitle: "Cuchillas quitinosas curvas sin puntas dentadas",
            color: "#fef08a",
            description:
              "En el borde ventral de la boca destacan dos anchas láminas quitinosas translúcidas de borde libre curvo y liso en media luna (placas cortantes), que actúan como guillotinas sobre la mucosa intestinal.",
            clinicalNote:
              "¡Clave de examen! Placas cortantes semilunares = Necator americanus; 2 pares de dientes puntiagudos = Ancylostoma duodenale; 3 pares de dientes = Ancylostoma caninum; 1 par de dientes grandes = Ancylostoma braziliense.",
            focusTarget: [-0.72, 0.2, 0.0],
            focusDistance: 1.8,
            labelPoint: [-0.98, 0.58, 0.15],
          },
          {
            id: 3,
            name: "Cono Dorsal Mediano y Lancetas Triangulares Subventrales",
            shortName: "Cono Dorsal + Lancetas",
            subtitle: "Estructuras incisivas en el fondo de la cavidad bucal globular",
            color: "#f59e0b",
            description:
              "En el interior de la cápsula bucal globular más pequeña se proyecta un diente o cono dorsal mediano acompañado en la base por dos lancetas subventrales profundas.",
            clinicalNote:
              "Permiten incidir los capilares de la lámina propia una vez que las placas semilunares han pinzado la vellosidad.",
            focusTarget: [-0.45, -0.05, 0.0],
            focusDistance: 1.9,
            labelPoint: [-0.55, -0.58, 0.2],
          },
          {
            id: 4,
            name: "Esófago Muscular Claviforme (Succión de 0.03 mL de Sangre/Día)",
            shortName: "Esófago Claviforme",
            subtitle: "Menor expoliación sanguínea diaria por individuo que A. duodenale",
            color: "#e11d48",
            description:
              "Faringe muscular en forma de maza seguida del intestino tubular.",
            clinicalNote:
              "Cada adulto de Necator americanus consume ~0.03 mL de sangre/día (frente a 0.20 mL/día de A. duodenale), por lo que requiere cargas parasitarias algo mayores (> 40–100 gusanos) para desencadenar anemia ferropénica clínica, pero su longevidad en el intestino es mayor (3 a 5 años o más).",
            focusTarget: [0.55, -0.05, 0.0],
            focusDistance: 2.2,
            labelPoint: [0.85, 0.55, 0.15],
          },
        ],
      },
      {
        id: "larvae_hookworm",
        name: "Larvas de Uncinaria: Rabditoide L1 (Boca Larga) vs Filariforme L3 Envainada (Cola Puntiaguda)",
        shortName: "2. Larvas L1 (Boca Larga) y L3 (Envainada)",
        badge: "Diferencial Clave frente a Strongyloides",
        sizeMicrons: "L1: 250–300 µm · L3: 600–700 µm",
        summary:
          "Comparación diagnóstica 3D indispensable en el laboratorio: arriba, la larva rabditoide L1 de uncinaria se distingue de Strongyloides por tener una CAVIDAD BUCAL LARGA (~15 µm) y un primordio genital DIMINUTO; abajo, la larva filariforme infectante L3 conserva una VAINA CUTICULAR estriada, tiene esófago corto (1/4 del cuerpo, relación 1:3) y termina en una COLA PUNTIAGUDA afilada.",
        microscopyTip:
          "Usa el Corte Histológico para comparar el canal bucal largo de la L1 y la vaina cuticular externa + cola puntiaguda de la L3.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 4.4],
        regions: [
          {
            id: 1,
            name: "Larva Rabditoide L1: Cavidad Bucal LARGA (~15 µm) y Primordio Diminuto",
            shortName: "L1: Cavidad Bucal Larga",
            subtitle: "Vestíbulo bucal tubular tan largo como el diámetro de la cabeza",
            color: "#fef08a",
            description:
              "En la larva rabditoide L1 de las uncinarias, el tubo o vestíbulo bucal anterior es largo y estrecho (~15 µm, igual al ancho corporal) con paredes quitinosas paralelas bien visibles antes de llegar al esófago rabditoide, y su primordio genital es diminuto.",
            clinicalNote:
              "¡Contraste directo con Strongyloides stercoralis! Uncinaria L1 = Boca LARGA + Primordio genital PEQUEÑO; Strongyloides L1 = Boca CORTA (3 µm) + Primordio genital GRANDE.",
            focusTarget: [-0.95, 0.45, 0.0],
            focusDistance: 2.1,
            labelPoint: [-1.1, 0.92, 0.15],
          },
          {
            id: 2,
            name: "Larva Filariforme L3 ENVAINADA (Vaina Cuticular Retenida de L2)",
            shortName: "L3: Vaina Cuticular Externa",
            subtitle: "Funda transparente estriada que sobresale en cabeza y cola",
            color: "#bae6fd",
            description:
              "Al mudar de L2 a L3 en el suelo o en cultivo de Harada-Mori, la larva filariforme de uncinaria NO se desprende de su cutícula antigua, quedando envuelta dentro de una vaina hialina protectora con estriaciones transversales marcadas.",
            clinicalNote:
              "La presencia de VAINA cuticular distingue de inmediato a la larva L3 de uncinaria de la larva L3 de Strongyloides stercoralis (que carece de vaina).",
            focusTarget: [0.0, -0.35, 0.0],
            focusDistance: 2.3,
            labelPoint: [-0.15, -0.85, 0.2],
          },
          {
            id: 3,
            name: "Esófago Filariforme de 1/4 de Longitud Corporal (Relación 1:3)",
            shortName: "Esófago Corto (1/4 del Cuerpo)",
            subtitle: "Ocupa ~25% de la larva L3 (frente al 50% en Strongyloides)",
            color: "#fb7185",
            description:
              "Dentro de la larva L3 de uncinaria, el esófago cilíndrico ocupa únicamente la cuarta parte anterior del cuerpo (relación esófago:intestino de 1:3).",
            clinicalNote:
              "Además, en el cultivo de Harada-Mori la L3 de Necator americanus muestra una constricción marcada en la unión esofagointestinal y estriaciones transversales prominentes en la vaina caudal.",
            focusTarget: [-0.85, -0.35, 0.0],
            focusDistance: 2.1,
            labelPoint: [-1.15, -0.05, 0.15],
          },
          {
            id: 4,
            name: "Extremo Caudal PUNTIAGUDO Afilado en L3 (Sin Muesca)",
            shortName: "Cola Puntiaguda (Sin Muesca)",
            subtitle: "Termina en punta aguda dentro de la vaina (vs cola bífida en Strongyloides)",
            color: "#38bdf8",
            description:
              "Tanto la cola de la larva L3 como la funda de la vaina que la recubre se afilan hasta terminar en una punta cónica aguda perfecta, sin escotadura ni bifurcación.",
            clinicalNote:
              "Uncinaria L3 = Envainada + Esófago 1/4 + Cola PUNTIAGUDA; Strongyloides L3 = Sin vaina + Esófago 1/2 + Cola MELLADA/BÍFIDA.",
            focusTarget: [1.35, -0.35, 0.0],
            focusDistance: 1.9,
            labelPoint: [1.48, 0.15, 0.15],
          },
        ],
      },
      {
        id: "skin_penetration",
        name: "Penetración Percutánea Exclusiva de Larva L3 ('Mazamorra' / Ground Itch)",
        shortName: "3. Penetración Cutánea (Mazamorra)",
        badge: "Puerta de Entrada Percutánea Exclusiva",
        sizeMicrons: "Campo dérmico 250 µm",
        summary:
          "A diferencia de Ancylostoma duodenale (percutánea y oral), Necator americanus infecta al ser humano EXCLUSIVAMENTE por penetración percutánea activa. La larva filariforme L3 en el barro húmedo es atraída por el calor y el CO2 de los pies descalzos, se desprende de su vaina y penetra por los folículos pilosos o fisuras interdigitales causando una dermatitis maculopapulovesicular intensamente pruriginosa ('mazamorra' o 'sabañón tropical').",
        microscopyTip:
          "Observa la larva L3 abandonando su vaina transparente sobre la epidermis y penetrando hacia el capilar dérmico para iniciar el ciclo de Loos.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.5, 4.4],
        regions: [
          {
            id: 1,
            name: "Larva Filariforme L3 Penetrando la Epidermis Interdigital",
            shortName: "Larva L3 en Penetración",
            subtitle: "Secreción de hialuronidasa y metaloproteasas para invadir la dermis",
            color: "#fef08a",
            description:
              "La larva L3 perfora el estrato córneo y la epidermis interdigital o maleolar guiada por termotropismo positivo y ácidos grasos de la piel humana.",
            clinicalNote:
              "A diferencia de las uncinarias zoonóticas de perros y gatos (Ancylostoma braziliense y A. caninum, que no pueden atravesar la membrana basal humana y quedan atrapadas reptando en la epidermis causando Larva Migrans Cutánea), Necator americanus sí atraviesa la dermis y entra en los vasos hacia el pulmón.",
            focusTarget: [-0.15, 0.25, 0.1],
            focusDistance: 2.2,
            labelPoint: [-0.35, 0.82, 0.2],
          },
          {
            id: 2,
            name: "Vaina Cuticular Abandonada (Exuviación en la Superficie Cutánea)",
            shortName: "Vaina Abandonada",
            subtitle: "Desprendimiento de la cutícula de L2 al iniciar la invasión",
            color: "#bae6fd",
            description:
              "Funda cuticular vacía y translúcida que queda adherida sobre el estrato córneo superficial cuando la larva L3 emerge para penetrar la piel.",
            clinicalNote:
              "El uso de calzado cerrado en zonas rurales cafetaleras y agrícolas interrumpe por completo la transmisión de Necator americanus.",
            focusTarget: [-0.75, 0.55, 0.15],
            focusDistance: 2.1,
            labelPoint: [-1.05, 0.88, 0.25],
          },
          {
            id: 3,
            name: "Dermatitis Papulovesicular Pruriginosa ('Mazamorra' / Ground Itch)",
            shortName: "Lesión de 'Mazamorra'",
            subtitle: "Eritema, edema, vesículas e infiltrado eosinofílico en dermis papilar",
            color: "#fb7185",
            description:
              "Reacción inflamatoria local de hipersensibilidad en los espacios interdigitales de los pies caracterizada por máculas, pápulas y vesículas pruriginosas que duran 1 a 2 semanas.",
            clinicalNote:
              "Conocida popularmente como 'mazamorra', 'sabañón de los cafetales' o 'ground itch'; el rascado frecuente favorece la piodermitis secundaria por Streptococcus pyogenes o Staphylococcus aureus.",
            focusTarget: [0.35, 0.15, 0.25],
            focusDistance: 2.2,
            labelPoint: [0.65, 0.68, 0.35],
          },
          {
            id: 4,
            name: "Invasión de Vénula Dérmica (Inicio del Ciclo Cardiopulmonar de Loos)",
            shortName: "Ingreso a Vénula (Ciclo de Loos)",
            subtitle: "Vénulas → Corazón derecho → Alvéolos pulmonares → Faringe → Yeyuno",
            color: "#e11d48",
            description:
              "En 24–48 horas la larva L3 alcanza las vénulas o vasos linfáticos de la dermis profunda y viaja por la circulación venosa hasta los capilares pulmonares, donde rompe hacia el alvéolo, asciende a la epiglotis y es deglutida.",
            clinicalNote:
              "El periodo prepatente desde la penetración cutánea hasta la aparición de huevos en las heces es de 6 a 8 semanas.",
            focusTarget: [0.55, -0.35, 0.05],
            focusDistance: 2.2,
            labelPoint: [0.85, -0.72, 0.2],
          },
        ],
      },
      {
        id: "adults_s_hook",
        name: "Adultos en 'S' con Curvatura Dorsal y Bolsa Copulatriz (Espículas en Arpón)",
        shortName: "4. Adultos en 'S' (Espículas en Arpón)",
        badge: "Espículas Fusionadas en Anzuelo",
        sizeMicrons: "Hembra 9–11 mm · Macho 7–9 mm",
        summary:
          "Los adultos de Necator americanus son más pequeños y esbeltos que A. duodenale y adoptan una postura en doble curva ('S') por el gancho dorsal de su cabeza. En la hembra la vulva se abre hacia la mitad anterior del cuerpo y la cola carece de espina terminal. En el macho la bolsa copulatriz es más larga y redondeada, con costilla dorsal profundamente bipartita y 2 espículas que se FUSIONAN en su extremo distal formando una punta de arpón o anzuelo.",
        microscopyTip:
          "Observa la postura en 'S' con el gancho cefálico dorsal y enfoca las 2 espículas del macho fusionadas en una punta de arpón.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.4, 4.3],
        regions: [
          {
            id: 1,
            name: "Cuerpo en 'S' con Gancho Cefálico Dorsal y Vulva Media/Anterior",
            shortName: "Postura en 'S' (Gancho Dorsal)",
            subtitle: "Hembra de 9–11 mm sin espina caudal; pone 5.000–10.000 huevos/día",
            color: "#fda4af",
            description:
              "El cuerpo describe una curva en 'S' porque el extremo cefálico se dobla bruscamente hacia el dorso mientras el extremo caudal se curva suavemente hacia el vientre.",
            clinicalNote:
              "A diferencia de A. duodenale (cuya cola femenina tiene espina terminal y vulva posterior), la hembra de N. americanus tiene la punta caudal cónica roma SIN espina y la vulva situada cerca de la mitad anterior del cuerpo.",
            focusTarget: [-0.85, 0.35, 0.0],
            focusDistance: 2.3,
            labelPoint: [-1.1, 0.82, 0.15],
          },
          {
            id: 2,
            name: "Bolsa Copulatriz del Macho (Costilla Dorsal Profundamente Bipartita)",
            shortName: "Bolsa Copulatriz (Bipartita)",
            subtitle: "Campana más larga que ancha con rayo dorsal dividido desde la base",
            color: "#fde68a",
            description:
              "Bolsa copulatriz cerrada y alargada cuya costilla dorsal está dividida profundamente desde su base en dos ramas que a su vez son bidigitadas (bipartita).",
            clinicalNote:
              "Criterio taxonómico clásico de confirmación cuando se recuperan adultos tras el tratamiento antihelmíntico.",
            focusTarget: [0.85, -0.3, 0.15],
            focusDistance: 2.0,
            labelPoint: [1.08, 0.25, 0.25],
          },
          {
            id: 3,
            name: "Dos Espículas Copulatrices Fusionadas Distalmente en Punta de Arpón",
            shortName: "Espículas Fusionadas en Arpón",
            subtitle: "Terminan unidas en un anzuelo o espolón retrógrado único",
            color: "#f59e0b",
            description:
              "Las dos cerdas espiculares corren paralelas y en su extremo distal se sueldan entre sí terminando en una punta única provista de una lengüeta retrógrada como un arpón o anzuelo de pesca.",
            clinicalNote:
              "¡Sello morfológico exclusivo del macho de Necator americanus! (En Ancylostoma duodenale las 2 espículas están separadas y no tienen arpón).",
            focusTarget: [1.15, -0.38, 0.15],
            focusDistance: 1.8,
            labelPoint: [1.32, -0.75, 0.25],
          },
          {
            id: 4,
            name: "Tubo Digestivo y Longevidad Crónica (3 a 5 Años)",
            shortName: "Intestino y Longevidad (3–5 años)",
            subtitle: "Sin hipobiosis larvaria pero con mayor supervivencia como adulto",
            color: "#be123c",
            description:
              "Intestino tubular pigmentado de hemina y órganos reproductores internos visibles al activar el Corte Histológico.",
            clinicalNote:
              "Necator americanus NO realiza hipobiosis (arresto larvario), pero sus adultos viven de 3 a 5 años (hasta 15 años en casos documentados).",
            focusTarget: [0.0, 0.15, 0.0],
            focusDistance: 2.2,
            labelPoint: [0.05, -0.52, 0.2],
          },
        ],
      },
    ],
  },
  p32: {
    code: "p32",
    scientificName: "Trichinella spiralis",
    commonName: "Triquina",
    groupBadge: "Nematodo Tisular Zoonótico · Trichinellida",
    stainLabel: "H&E / Triquinoscopia",
    stages: [
      {
        id: "nurse_cell_cyst",
        name: "Complejo Célula Nodriza–Larva L1 Enquistada en Espiral en Músculo Estriado",
        shortName: "1. Célula Nodriza + Larva L1",
        badge: "Forma Infectante (Carne de Cerdo / Jabalí)",
        sizeMicrons: "Quiste 400 × 250 µm · Larva 1 mm",
        summary:
          "Estadio infectante y diagnóstico patognomónico en biopsia muscular: la larva L1 invade una célula muscular esquelética estriada y, mediante proteínas secretadas por su esticosoma (TSL-1 / p43), reprograma el genoma del miocito transformándolo en una 'Célula Nodriza' (Nurse Cell) con núcleos hipertrofiados, rodeada por una cápsula colágena en forma de limón y una red capilar angiogénica, dentro de la cual la larva L1 permanece enrollada en espiral.",
        microscopyTip:
          "Activa el Corte Histológico para abrir la cápsula colágena en limón y ver la larva L1 enrollada en espiral junto a los núcleos hipertrofiados de la célula nodriza.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.4, 4.1],
        regions: [
          {
            id: 1,
            name: "Larva Infectante L1 Enrollada en Espiral (con Esticosoma Interno)",
            shortName: "Larva L1 en Espiral",
            subtitle: "2.5 a 3.5 vueltas de tirabuzón dentro de la célula nodriza",
            color: "#fde047",
            description:
              "Larva de ~1 mm de longitud enrollada sobre sí misma en espiral compacta como la cuerda de un reloj, provista en su interior de un esticosoma de esticocitos.",
            clinicalNote:
              "La infección humana se adquiere al ingerir carne cruda, mal cocida o embutidos artesanales (chorizos, salames, jamón crudo) de cerdo o jabalí que contienen estas larvas L1 viables (Trichinella spiralis NO resiste bien la congelación prolongada a -15 °C por 20 días, aunque la especie ártica Trichinella nativa sí resiste la congelación).",
            focusTarget: [0.0, 0.05, 0.05],
            focusDistance: 2.0,
            labelPoint: [0.05, 0.72, 0.2],
          },
          {
            id: 2,
            name: "Sarcoplasma Basófilo y Núcleos Hipertrofiados de la Célula Nodriza",
            shortName: "Núcleos de Célula Nodriza",
            subtitle: "Miocito estriado desdiferenciado por factores de transcripción parasitarios",
            color: "#a855f7",
            description:
              "La fibra muscular invadida pierde sus miofibrillas de actina/miosina y sus estriaciones; sus núcleos se desplazan al centro, aumentan de tamaño y desarrollan grandes nucléolos formando la Célula Nodriza que nutre a la larva durante años.",
            clinicalNote:
              "Trichinella spiralis es el único parásito intracelular pluricelular del ser humano: modifica la expresión génica del miocito huésped como si fuera un virus oncogénico benigno.",
            focusTarget: [-0.45, 0.0, 0.0],
            focusDistance: 2.1,
            labelPoint: [-0.75, 0.55, 0.2],
          },
          {
            id: 3,
            name: "Cápsula Colágena Hialina en 'Limón' y Fibra Muscular Estriada",
            shortName: "Cápsula en Limón + Músculo",
            subtitle: "Pared de colágeno tipos IV y VI alineada con el eje de la miofibrilla",
            color: "#f43f5e",
            description:
              "Cápsula elipsoidal translúcida en forma de limón cuyos polos siguen la dirección longitudinal de los haces de músculo esquelético estriado hipóxicos o muy activos (diafragma, maseteros, lengua, intercostales, músculos extraoculares, deltoides).",
            clinicalNote:
              "A partir de los 6 a 18 meses los polos del quiste comienzan a calcificarse (calcificación distrófica bipolar), aunque la larva interna puede seguir viva durante 5 a 10 años.",
            focusTarget: [0.75, 0.15, 0.2],
            focusDistance: 2.3,
            labelPoint: [1.05, 0.65, 0.3],
          },
          {
            id: 4,
            name: "Plexo Venoso Angiogénico Pericapsular (Inducido por VEGF)",
            shortName: "Red Capilar Angiogénica",
            subtitle: "Neovascularización inducida por la larva para asegurar aporte de nutrientes",
            color: "#e11d48",
            description:
              "Cesta de capilares sanguíneos neoformados que envuelve estrechamente el exterior de la cápsula colágena, inducida por la secreción de factor de crecimiento endotelial vascular (VEGF) en la célula nodriza.",
            clinicalNote:
              "Garantiza el intercambio metabólico de la larva y explica el intenso dolor muscular (mialgias incapacitantes al respirar, masticar o mover los ojos) y la respuesta serológica IgG/IgE.",
            focusTarget: [0.0, -0.42, 0.3],
            focusDistance: 2.2,
            labelPoint: [0.15, -0.78, 0.4],
          },
        ],
      },
      {
        id: "viviparous_female",
        name: "Hembra Adulta Intestinal Vivípara (Parto Directo de Larvas Recién Nacidas — Sin Huevos)",
        shortName: "2. Hembra Vivípara (Sin Huevos)",
        badge: "Fase Enteral (1ª Semana) · Vivípara",
        sizeMicrons: "Hembra 3.0–3.5 mm · Macho 1.5 mm",
        summary:
          "Tras digerirse la carne en el estómago por pepsina y HCl, las larvas L1 invaden el epitelio del duodeno/yeyuno y en solo 36–48 horas mudan 4 veces hasta adultos. La hembra (3 mm) posee un esticosoma anterior y es VIVÍPARA: nunca pone huevos al exterior, sino que pare directamente unas 1.500 'Larvas Recién Nacidas' (LRN de 100 µm) a través de su vulva anterior directamente hacia la lámina propia y vasos linfáticos/mesentéricos.",
        microscopyTip:
          "Activa el Corte Histológico para ver el esticosoma anterior y el útero lleno de embriones posteriores y larvas móviles anteriores saliendo por la vulva.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.4, 4.3],
        regions: [
          {
            id: 1,
            name: "Cuerpo de la Hembra Adulta Intestinal (3.0–3.5 mm × 60 µm)",
            shortName: "Hembra Adulta (3 mm)",
            subtitle: "Vive enhebrada en un sincitio de enterocitos yeyunales durante 4–6 semanas",
            color: "#fda4af",
            description:
              "Pequeño nematodo filiforme (el doble de largo que el macho de 1.5 mm, el cual carece de espícula y tiene dos apéndices cónicos o papilas copulatrices caudales).",
            clinicalNote:
              "¡En la triquinosis los exámenes coproparasitológicos de heces son SIEMPRE NEGATIVOS para huevos porque Trichinella es vivípara! Además, el mismo individuo humano actúa primero como huésped definitivo (adultos en intestino) y luego como huésped intermediario (larvas en músculo).",
            focusTarget: [0.1, 0.25, 0.1],
            focusDistance: 2.4,
            labelPoint: [0.15, 0.78, 0.2],
          },
          {
            id: 2,
            name: "Esticosoma Anterior (Esticocitos α y β alrededor del Esófago)",
            shortName: "Esticosoma Anterior",
            subtitle: "Parentesco filogenético directo con Trichuris trichiura (Trichinellida)",
            color: "#f59e0b",
            description:
              "Hilera longitudinal de células glandulares gigantes (esticocitos) que rodean el esófago capilar en la mitad anterior del cuerpo.",
            clinicalNote:
              "Si se administra albendazol o mebendazol durante los primeros 3 a 7 días post-ingesta (fase intestinal diarreica), se eliminan las hembras adultas ANTES de que paran larvas al torrente sanguíneo, previniendo la invasión muscular.",
            focusTarget: [-0.95, 0.05, 0.0],
            focusDistance: 2.0,
            labelPoint: [-1.15, 0.65, 0.15],
          },
          {
            id: 3,
            name: "Útero Vivíparo (Embriones Posteriores y Larvas Móviles Anteriores)",
            shortName: "Útero con Larvas Vivas",
            subtitle: "Desarrollo embrionario completo dentro del útero materno",
            color: "#fde047",
            description:
              "Al seccionar la mitad posterior de la hembra se observa el ovario caudal, óvulos en segmentación en el fondo uterino y decenas de larvas recién nacidas completamente formadas y desenrolladas avanzando hacia la vagina anterior.",
            clinicalNote:
              "Cada hembra pare entre 500 y 1.500 larvas recién nacidas a partir del 5º–6º día post-infección durante 2 a 4 semanas antes de ser expulsada por la inmunidad mucosa.",
            focusTarget: [0.55, 0.05, 0.0],
            focusDistance: 2.1,
            labelPoint: [0.85, 0.62, 0.15],
          },
          {
            id: 4,
            name: "Parto Directo de Larva Recién Nacida (100 × 6 µm) por la Vulva Anterior",
            shortName: "Parto de Larva Recién Nacida",
            subtitle: "Vulva situada a nivel del tercio anterior (región del esticosoma)",
            color: "#38bdf8",
            description:
              "Las larvas recién nacidas (LRN), dotadas de un diminuto estilete bucal anterior, emergen por la vulva situada en el quinto anterior de la madre e invaden inmediatamente los vasos quilíferos y capilares de la lámina propia.",
            clinicalNote:
              "Desde la lámina propia viajan por el conducto torácico y la vena porta hacia las cavidades cardíacas y la circulación arterial sistémica.",
            focusTarget: [-0.45, -0.25, 0.2],
            focusDistance: 2.0,
            labelPoint: [-0.55, -0.72, 0.3],
          },
        ],
      },
      {
        id: "systemic_migration",
        name: "Fase Parenteral: Miocarditis Eosinofílica, Edema Periorbitario y Encefalitis",
        shortName: "3. Miocarditis y Fase Sistémica",
        badge: "Tríada Clínica · Complicación Letal",
        sizeMicrons: "Larva migratoria 100 µm",
        summary:
          "A partir de la 2ª semana post-infección las larvas recién nacidas se diseminan por vía arterial produciendo una vasculitis eosinofílica sistémica caracterizada por la tríada clásica: FIEBRE + EDEMA PERIORBITARIO BILATERAL + MIALGIAS INTENSAS + EOSINOFILIA MASIVA (30–70%). Cuando las larvas atraviesan el miocardio o el SNC no logran formar células nodrizas ni enquistarse, pero desencadenan una miocarditis eosinofílica necrotizante (principal causa de muerte).",
        microscopyTip:
          "Observa las larvas recién nacidas atravesando las fibras miocárdicas estriadas sin poder enquistarse, rodeadas de necrosis y eosinófilos.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.5, 4.4],
        regions: [
          {
            id: 1,
            name: "Larva Recién Nacida (100 µm) Atrapada en Tránsito por el Miocardio",
            shortName: "Larva en Miocardio (Sin Quiste)",
            subtitle: "En el músculo cardíaco la larva NO puede formar célula nodriza",
            color: "#fde047",
            description:
              "Las larvas recién nacidas perforan los capilares coronarios e invaden los cardiomiocitos estriados, pero al carecer el miocardio de células satélite reprogramables, la larva muere o reingresa a la circulación dejando un rastro necrótico.",
            clinicalNote:
              "¡Pregunta clásica de examen! En el corazón NUNCA se encuentran quistes de Trichinella, pero la miocarditis eosinofílica y las arritmias/insuficiencia cardíaca entre la 3ª y 6ª semana son la primera causa de mortalidad en la triquinosis grave.",
            focusTarget: [0.0, 0.15, 0.15],
            focusDistance: 2.1,
            labelPoint: [-0.15, 0.78, 0.25],
          },
          {
            id: 2,
            name: "Vasculitis Capilar (Causa de Edema Periorbitario y Hemorragias en Astilla)",
            shortName: "Vasculitis (Edema Bipalpebral)",
            subtitle: "Fuga endotelial mediada por histamina, bradicinina y proteína básica mayor",
            color: "#e11d48",
            description:
              "Capilar microcirculatorio edematoso con disrupción endotelial por el paso de larvas y microtrombos eosinofílicos.",
            clinicalNote:
              "La fuga capilar explica el signo clínico más temprano y característico de la fase invasiva: el edema periorbitario y facial bilateral simétrico ('enfermedad de las cabezas hinchadas'), chemosis conjuntival y las hemorragias subungueales en astilla.",
            focusTarget: [-0.75, -0.2, 0.2],
            focusDistance: 2.2,
            labelPoint: [-1.0, -0.62, 0.3],
          },
          {
            id: 3,
            name: "Cardiomiocitos Ramificados con Discos Intercalares y Focos de Necrosis",
            shortName: "Fibras Miocárdicas Necróticas",
            subtitle: "Elevación sérica de Troponina, CPK-MB, CPK total, LDH y Aldolasa",
            color: "#fb7185",
            description:
              "Fibras musculares cardíacas ramificadas mostrando pérdida focal de estriaciones y necrosis miocitolítica alrededor del trayecto larvario.",
            clinicalNote:
              "En todo paciente con triquinosis grave (miocarditis o neurotriquinosis) es obligatorio asociar CORTICOSTEROIDES sistémicos (prednisona 40–60 mg/día) junto con el albendazol para frenar la reacción inflamatoria eosinofílica contra las larvas en destrucción.",
            focusTarget: [0.65, 0.15, 0.1],
            focusDistance: 2.3,
            labelPoint: [0.95, 0.68, 0.2],
          },
          {
            id: 4,
            name: "Infiltrado Masivo de Eosinófilos (Eosinofilia Periférica 30–70%)",
            shortName: "Infiltrado Eosinofílico Masivo",
            subtitle: "Una de las leucocitosis con eosinofilia más altas de la medicina",
            color: "#c084fc",
            description:
              "Acumulación densa de eosinófilos bilobulados liberando proteína básica mayor (MBP) y proteína catiónica eosinofílica (ECP) que dañan tanto a la larva como al endotelio y miocardio vecino.",
            clinicalNote:
              "Una caída brusca y súbita de la eosinofilia periférica en un paciente crítico (sin haber recibido corticoides) es un signo ominoso de agotamiento medular y mal pronóstico.",
            focusTarget: [0.45, -0.35, 0.3],
            focusDistance: 2.2,
            labelPoint: [0.75, -0.72, 0.4],
          },
        ],
      },
      {
        id: "trichinoscopy_calcified",
        name: "Triquinoscopia por Compresión Muscular y Quistes Calcificados",
        shortName: "4. Triquinoscopia y Calcificación",
        badge: "Control Bromatológico · Digestión Artificial",
        sizeMicrons: "Campo de compresión 800 µm",
        summary:
          "Vista microscópica de diagnóstico bromatológico y biopsia muscular: entre las dos placas de vidrio del compresor de triquinoscopia se observan múltiples quistes en forma de limón alineados entre los haces de músculo estriado (pilares del diafragma). Algunos quistes son recientes y translúcidos con la larva L1 activa en espiral, mientras que otros muestran calcificación distrófica bipolar en ambos polos.",
        microscopyTip:
          "Compara el quiste viable translúcido (izquierda) con el quiste con calcificación distrófica blanquecina en ambos polos (derecha).",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.45, 4.5],
        regions: [
          {
            id: 1,
            name: "Haces Paralelos de Músculo Esquelético Estriado Comprimido (Diafragma)",
            shortName: "Haces de Músculo Estriado",
            subtitle: "Pilares del diafragma, base de la lengua y maseteros",
            color: "#e11d48",
            description:
              "Fibras musculares esqueléticas multinucleadas comprimidas entre las láminas de vidrio del triquinoscopio mostrando estriaciones transversales y desplazamiento fusiforme alrededor de los quistes.",
            clinicalNote:
              "En el control sanitario veterinario de mataderos, el método de referencia actual es la DIGESTIÓN ARTIFICIAL enzimática (HCl + pepsina a 45 °C) de muestras de los pilares del diafragma, que es mucho más sensible que la triquinoscopia óptica y detecta también especies no encapsuladas como Trichinella pseudospiralis.",
            focusTarget: [0.0, 0.45, 0.0],
            focusDistance: 2.5,
            labelPoint: [0.0, 0.88, 0.15],
          },
          {
            id: 2,
            name: "Quiste Viable Reciente con Larva L1 Enrollada (Izquierda)",
            shortName: "Quiste Viable (Larva Activa)",
            subtitle: "Cápsula colágena transparente formada a partir de la 3ª–4ª semana",
            color: "#fde047",
            description:
              "Complejo célula nodriza-larva completamente formado y translúcido a través del cual se distingue con claridad la larva L1 enrollada en espiral.",
            clinicalNote:
              "En el paciente humano el diagnóstico suele confirmarse de forma no invasiva mediante serología ELISA IgG + confirmación por Western blot contra antígenos excretores/secretores (ES) de los esticocitos (positiviza en la 3ª–4ª semana).",
            focusTarget: [-0.75, 0.0, 0.1],
            focusDistance: 2.1,
            labelPoint: [-0.95, 0.58, 0.2],
          },
          {
            id: 3,
            name: "Calcificación Distrófica Bipolar y Total del Quiste (Derecha)",
            shortName: "Calcificación Bipolar del Quiste",
            subtitle: "Depósito de sales de fosfato y carbonato de calcio desde los polos (6–18 meses)",
            color: "#f8fafc",
            description:
              "Quiste antiguo que muestra depósitos calcáreos opacos y blanquecinos iniciándose característicamente en ambos conos polares de la cápsula en limón hasta envolver todo el quiste.",
            clinicalNote:
              "Los quistes calcificados antiguos pueden ser hallazgos incidentales en radiografías de partes blandas o biopsias musculares años después de un brote epidémico.",
            focusTarget: [0.75, 0.0, 0.1],
            focusDistance: 2.1,
            labelPoint: [0.95, 0.58, 0.2],
          },
          {
            id: 4,
            name: "Infiltrado Pericapsular Crónico y Atrofia Miofibrilar Focal",
            shortName: "Reacción Pericapsular",
            subtitle: "Linfocitos, macrófagos e histiocitos en los polos del quiste",
            color: "#c084fc",
            description:
              "Cúmulos de células inflamatorias mononucleares y eosinófilos residuales congregados en ambos polos vasculares del quiste.",
            clinicalNote:
              "Para inactivar con seguridad las larvas de T. spiralis en la carne de cerdo durante la cocción doméstica, el centro de la pieza debe alcanzar al menos 71 °C (hasta que desaparezca por completo el color rosado).",
            focusTarget: [0.0, -0.45, 0.15],
            focusDistance: 2.3,
            labelPoint: [0.05, -0.82, 0.25],
          },
        ],
      },
    ],
  },
  p33: {
    code: "p33",
    scientificName: "Anisakis simplex",
    commonName: "Anisakis (Nematodo del Pescado Crudo)",
    groupBadge: "Nematodo Zoonótico Marino · Ascaridida",
    stainLabel: "H&E / Endoscopia",
    stages: [
      {
        id: "l3_larva_anatomy",
        name: "Larva Infectante Marina L3: Diente Perforador, Ventrículo Oblicuo y Mucrón Caudal",
        shortName: "1. Larva L3 (Diente y Ventrículo)",
        badge: "Forma Infectante en Pescado y Cefalópodos",
        sizeMicrons: "20–30 mm × 0.4–0.6 mm",
        summary:
          "El ser humano es un huésped paraténico accidental al ingerir pescado marino o calamar crudo/poco cocinado (sushi, sashimi, ceviche, boquerones en vinagre) que alberga la larva L3 de Anisakis simplex. Sus tres sellos morfológicos de identificación son: (1) un DIENTE PERFORADOR quitinoso larval en la cabeza, (2) un esófago con un largo VENTRÍCULO GLANDULAR de unión oblicua con el intestino (sin ciego) y (3) una espina terminal en la cola llamada MUCRÓN CAUDAL.",
        microscopyTip:
          "Activa el Corte Histológico para ver dentro de la larva L3 el preventrículo muscular, el largo ventrículo glandular blanco con su unión oblicua al intestino y el diente perforador anterior.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.4, 4.3],
        regions: [
          {
            id: 1,
            name: "Cuerpo Cilíndrico Enrollado en Espiral Plana (20–30 mm)",
            shortName: "Cuerpo Larva L3 (20–30 mm)",
            subtitle: "Cutícula estriada transversalmente de color blanco-rosado nacarado",
            color: "#fef3c7",
            description:
              "Larva robusta visible a simple vista (2 a 3 cm de largo), que en el músculo o peritoneo del pescado suele encontrarse enrollada en una espiral plana como un resorte de reloj.",
            clinicalNote:
              "En el ser humano la larva L3 NUNCA alcanza el estadio adulto ni pone huevos (los huéspedes definitivos naturales son mamíferos marinos como ballenas, delfines y cachalotes).",
            focusTarget: [0.1, 0.35, 0.1],
            focusDistance: 2.5,
            labelPoint: [0.15, 0.82, 0.2],
          },
          {
            id: 2,
            name: "Esófago Muscular (Preventrículo) y Ventrículo Glandular de Unión Oblicua",
            shortName: "Ventrículo Glandular Oblicuo",
            subtitle: "Sin ciego intestinal ni apéndice ventricular (distingue de Pseudoterranova)",
            color: "#f8fafc",
            description:
              "Detrás del esófago muscular anterior (preventrículo) se halla un órgano glandular blanquecino opaco muy largo llamado ventrículo (cuerpo de sigmoide), cuya unión posterior con el intestino es característicamente OBLICUA y carece de ciegos o apéndices.",
            clinicalNote:
              "¡Clave taxonómica de laboratorio! Anisakis simplex tiene unión ventriculointestinal oblicua SIN ciego intestinal; Pseudoterranova decipiens (gusano del bacalao) tiene un ciego intestinal anterior; Contracaecum e Hysterothylacium tienen tanto ciego intestinal como apéndice ventricular.",
            focusTarget: [-0.65, 0.15, 0.0],
            focusDistance: 2.0,
            labelPoint: [-0.75, 0.72, 0.15],
          },
          {
            id: 3,
            name: "Diente Perforador Larval Quitinizado (Ventral) y Poro Excretor Cefálico",
            shortName: "Diente Perforador Cefálico",
            subtitle: "Lanceta triangular ventral entre los esbozos labiales trilobulados",
            color: "#f59e0b",
            description:
              "En el ápice cefálico, rodeado por tres esbozos labiales bilobulados aún inmaduros, sobresale un agudo diente perforador quitinoso ventral junto al poro de la glándula excretora (célula de Renette).",
            clinicalNote:
              "Con este diente perforador y potentes proteasas secretadas por el ventrículo y la glándula excretora, la larva L3 penetra activamente la mucosa gástrica o ileal humana.",
            focusTarget: [-1.45, -0.05, 0.0],
            focusDistance: 1.8,
            labelPoint: [-1.62, 0.45, 0.15],
          },
          {
            id: 4,
            name: "Mucrón Caudal (Espina Cuticular Terminal en la Punta de la Cola)",
            shortName: "Mucrón Caudal (Espina)",
            subtitle: "Proyección cónica aguda en el extremo redondeado de la cola (Anisakis tipo I)",
            color: "#fbbf24",
            description:
              "El extremo posterior de la larva L3 es corto y cónico-redondeado y remata en su vértice en una pequeña espina cilíndrica o cónica refringente: el mucrón caudal.",
            clinicalNote:
              "La presencia del mucrón caudal confirma que se trata de una larva L3 de Anisakis tipo I (complejo Anisakis simplex / A. pegreffii).",
            focusTarget: [1.35, -0.35, 0.1],
            focusDistance: 1.9,
            labelPoint: [1.52, 0.15, 0.2],
          },
        ],
      },
      {
        id: "gastric_endoscopy",
        name: "Anisakiasis Gástrica Aguda: Larva L3 Clavada en Mucosa (Extracción Endoscópica)",
        shortName: "2. Endoscopia Gástrica (Extracción)",
        badge: "Urgencia Endoscópica (1–8 h Post-Ingesta)",
        sizeMicrons: "Vista endoscópica 3 cm",
        summary:
          "Cuadro clínico clásico: entre 1 y 8 horas después de comer pescado crudo o marinado (ceviche, sushi, boquerones en vinagre), el paciente presenta epigastralgia súbita terebrante, náuseas y vómitos que simulan un abdomen agudo o úlcera perforada. La gastroscopia de urgencia revela la larva L3 viva clavada por su cabeza en la mucosa gástrica edematosa y permite su extracción con pinza (curación inmediata).",
        microscopyTip:
          "Observa la larva L3 blanquecina clavada en el flemón edematoso de la mucosa gástrica y la pinza endoscópica sujetándola por el cuello para extraerla íntegra.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.55, 4.4],
        regions: [
          {
            id: 1,
            name: "Larva L3 Viva Clavada en la Mucosa de la Curvatura Mayor Gástrica",
            shortName: "Larva L3 Clavada en Estómago",
            subtitle: "Extremo cefálico enterrado en la submucosa y cuerpo agitado en la luz",
            color: "#fef3c7",
            description:
              "Gusano filiforme blanco-translúcido de 2.5 cm cuyo tercio anterior ha perforado la mucosa gástrica mientras el resto de su cuerpo con el mucrón caudal se mueve vigorosamente en la cavidad del estómago.",
            clinicalNote:
              "Si no se realiza endoscopia en las primeras 24–72 horas, la larva puede penetrar por completo en la pared gástrica o avanzar hacia el íleon terminal produciendo anisakiasis intestinal (5–7 días post-ingesta) que simula apendicitis aguda o enfermedad de Crohn obstructiva.",
            focusTarget: [-0.1, 0.25, 0.15],
            focusDistance: 2.2,
            labelPoint: [-0.35, 0.82, 0.25],
          },
          {
            id: 2,
            name: "Rodete Edematoso y Flemón Eosinofílico con Microhemorragia",
            shortName: "Úlcera y Edema Mucoso",
            subtitle: "Reacción inflamatoria aguda en el punto de penetración del diente larval",
            color: "#e11d48",
            description:
              "Elevación pseudotumoral edematosa e hiperémica de la mucosa gástrica con erosión central sangrante alrededor del cuello de la larva.",
            clinicalNote:
              "En estudios baritados o TC abdominal se observa engrosamiento parietal circunferencial ('signo del hilo' en íleon) y ascitis eosinofílica reactiva.",
            focusTarget: [-0.25, -0.25, 0.2],
            focusDistance: 2.2,
            labelPoint: [-0.55, -0.68, 0.3],
          },
          {
            id: 3,
            name: "Pinza de Extracción Endoscópica (Tratamiento Definitivo Inmediato)",
            shortName: "Pinza Endoscópica",
            subtitle: "Debe traccionarse cerca de la cabeza para no romper la larva dentro de la pared",
            color: "#94a3b8",
            description:
              "Pinza metálica de biopsia/cuerpo extraño introducida por el canal de trabajo del gastroscopio sujetando firmemente el cuello de la larva junto a la mucosa.",
            clinicalNote:
              "La extracción endoscópica completa de la larva produce el alivio instantáneo del dolor epigástrico sin necesidad de cirugía; debe revisarse todo el estómago y duodeno porque en el 10–15% de los casos hay más de una larva.",
            focusTarget: [0.55, 0.45, 0.15],
            focusDistance: 2.2,
            labelPoint: [0.85, 0.85, 0.25],
          },
          {
            id: 4,
            name: "Pliegues Gástricos Engrosados (Gastritis Aguda Erosiva)",
            shortName: "Pliegues Gástricos Edematosos",
            subtitle: "Hiperperistaltismo gástrico y espasmo pilórico reflejo",
            color: "#fda4af",
            description:
              "Rugosidades de la mucosa del cuerpo y antro gástrico engrosadas por el edema submucoso.",
            clinicalNote:
              "Prevención bromatológica normativa: congelación del pescado destinado a consumo crudo o marinado a -20 °C durante al menos 24–72 horas (o -35 °C por 15 horas), o cocción > 60 °C por al menos 1 minuto. El vinagre, el limón del ceviche, el ahumado en frío y la salazón suave NO matan a la larva de Anisakis.",
            focusTarget: [0.75, -0.3, 0.1],
            focusDistance: 2.4,
            labelPoint: [1.0, -0.68, 0.2],
          },
        ],
      },
      {
        id: "y_lateral_chords",
        name: "Corte Histológico Transversal: Cordones Laterales en 'Y' y Musculatura Polimiaria",
        shortName: "3. Corte Transversal (Cordones en 'Y')",
        badge: "Anatomía Patológica · Diagnóstico en Biopsia",
        sizeMicrons: "Diámetro transversal 400–600 µm",
        summary:
          "Cuando la larva invade el íleon o forma un granuloma eosinofílico submucoso que se reseca quirúrgicamente (por sospecha de apendicitis, Crohn o tumor GIST), el patólogo identifica Anisakis simplex en el corte transversal histológico por cuatro estructuras inconfundibles: (1) CORDONES EPIDÉRMICOS LATERALES EN FORMA DE 'Y' (o mariposa), (2) musculatura polimiaria alta, (3) intestino con luz trirradiada y (4) gran célula excretora de Renette en media luna.",
        microscopyTip:
          "Examina la simetría interna del corte transversal de la larva: busca los dos cordones epidérmicos laterales bilobulados en 'Y' y la célula de Renette ventral.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.35, 4.1],
        regions: [
          {
            id: 1,
            name: "Cordones Epidérmicos Laterales en Forma de 'Y' o Mariposa (Patognomónicos)",
            shortName: "Cordones Laterales en 'Y'",
            subtitle: "Tallo estrecho en la hipodermis que se bifurca en dos lóbulos hacia el pseudoceloma",
            color: "#fbbf24",
            description:
              "A las 3 y a las 9 en punto del corte transversal de la larva se proyectan hacia la cavidad corporal dos prominentes cordones epidérmicos laterales nucleados con silueta en letra 'Y' o alas de mariposa.",
            clinicalNote:
              "¡Dato clave de Anatomía Patológica! Los cordones laterales en forma de 'Y' (junto con la ausencia de alas cuticulares laterales externas) confirman Anisakis simplex en cortes histológicos y lo diferencian de Pseudoterranova (cuyos cordones laterales tienen forma de mariposa ancha con base gruesa) y de Ascaris.",
            focusTarget: [-0.62, 0.05, 0.15],
            focusDistance: 1.9,
            labelPoint: [-0.95, 0.55, 0.25],
          },
          {
            id: 2,
            name: "Capa Muscular Somática Polimiaria-Celomiaria Alta y Cutícula sin Alas",
            shortName: "Musculatura Polimiaria",
            subtitle: "60 a 90 células musculares altas por cuadrante divididas por los cordones",
            color: "#f43f5e",
            description:
              "Debajo de la cutícula multiestratificada se dispone un anillo de numerosas células musculares somáticas altas y estrechas (disposición polimiaria-celomiaria) agrupadas en cuatro cuadrantes.",
            clinicalNote:
              "Incluso cuando la larva lleva días muerta y degenerando en el centro de un absceso eosinofílico ileal, la cutícula y el contorno de los cordones laterales y músculos permiten el diagnóstico.",
            focusTarget: [0.0, 0.65, 0.1],
            focusDistance: 2.1,
            labelPoint: [0.1, 0.98, 0.2],
          },
          {
            id: 3,
            name: "Intestino de Luz Trirradiada y Célula Excretora Ventral de Renette",
            shortName: "Intestino + Célula de Renette",
            subtitle: "Epitelio intestinal alto (60–80 células) y glándula en banana ventral",
            color: "#38bdf8",
            description:
              "En el centro se sitúa el intestino revestido por una sola capa de células cilíndricas altas con borde en cepillo que delimitan una luz estrellada o trirradiada en 'Y', acompañado ventralmente por la gran célula excretora de Renette en forma de banana o media luna.",
            clinicalNote:
              "La célula excretora de Renette y el ventrículo producen los principales antígenos excretores/secretores (Ani s 1, Ani s 7) implicados tanto en la invasión tisular como en la alergia mediada por IgE.",
            focusTarget: [0.05, -0.15, 0.15],
            focusDistance: 1.9,
            labelPoint: [0.65, -0.45, 0.25],
          },
          {
            id: 4,
            name: "Granuloma / Flemón Eosinofílico Submucoso Perilarvario",
            shortName: "Granuloma Eosinofílico",
            subtitle: "Manguito denso de eosinófilos, histiocitos y cristales de Charcot-Leyden",
            color: "#c084fc",
            description:
              "Anillo concéntrico de tejido submucoso humano intensamente infiltrado por miles de eosinófilos degranulados, neutrófilos y macrófagos epitelioides que encapsulan a la larva.",
            clinicalNote:
              "En las formas intestinales no complicadas (sin perforación ni necrosis isquémica), el cuadro suele autolimitarse con manejo conservador (hidratación, descompresión nasogástrica y albendazol 400 mg c/12 h por 3–5 días) porque la larva muere en 1–2 semanas.",
            focusTarget: [0.85, 0.35, 0.0],
            focusDistance: 2.3,
            labelPoint: [1.12, 0.72, 0.15],
          },
        ],
      },
      {
        id: "allergy_ige",
        name: "Anisakiasis Gastroalérgica: Alérgenos Termoestables (Ani s 1 / Ani s 4) y Anafilaxia IgE",
        shortName: "4. Alergia IgE (Ani s 1 / Ani s 4)",
        badge: "Hipersensibilidad Tipo I · Urticaria y Anafilaxia",
        sizeMicrons: "Escala celular-molecular",
        summary:
          "En pacientes previamente sensibilizados por infecciones previas (a menudo subclínicas), Anisakis simplex desencadena cuadros de urticaria aguda/crónica, angioedema o shock anafiláctico tras comer pescado. Mientras los antígenos excretores/secretores principales (Ani s 1, Ani s 7) requieren que la larva penetre viva unas horas, existen alérgenos termoestables y resistentes a pepsina (Ani s 4, tropomiosina Ani s 3) capaces de provocar reacciones incluso con pescado cocinado o congelado en pacientes hiperreactivos.",
        microscopyTip:
          "Observa la liberación de glicoproteínas alergénicas Ani s 1 / Ani s 4 entrecruzando las moléculas de IgE en los receptores FcεRI del mastocito en desgranulación.",
        defaultTarget: [0, 0, 0],
        defaultCameraPos: [0, 0.45, 4.3],
        regions: [
          {
            id: 1,
            name: "Alérgenos de Anisakis simplex (Ani s 1, Ani s 4, Ani s 7)",
            shortName: "Alérgenos Ani s 1 / Ani s 4",
            subtitle: "Glicoproteínas secretoras e inhibidores de proteasas termoestables",
            color: "#fde047",
            description:
              "Moléculas antigénicas secretadas por la glándula excretora y el ventrículo larval: Ani s 1 (24 kDa, alérgeno mayor específico), Ani s 4 (9 kDa, inhibidor de cisteína-proteasa resistente al calor y a la pepsina) y Ani s 2/Ani s 3 (paramiosina/tropomiosina con reactividad cruzada con ácaros y crustáceos).",
            clinicalNote:
              "¡Diagnóstico diferencial alergológico crucial! Muchos pacientes diagnosticados erróneamente de 'alergia al pescado' tienen Prick test e IgE negativos para proteínas de merluza/atún, pero IgE específica altísima contra Anisakis simplex (CAP / ISAC para rAni s 1).",
            focusTarget: [-0.85, 0.35, 0.15],
            focusDistance: 2.1,
            labelPoint: [-1.05, 0.78, 0.25],
          },
          {
            id: 2,
            name: "Entrecruzamiento de IgE Específica sobre Receptores FcεRI",
            shortName: "Complejos IgE – FcεRI",
            subtitle: "Puentes antigénicos bivalentes en la membrana del mastocito",
            color: "#38bdf8",
            description:
              "Anticuerpos IgE específicos anti-Anisakis en forma de 'Y' anclados a los receptores de alta afinidad FcεRI que se entrecruzan al unirse al alérgeno Ani s 1, disparando la cascada de tirosina-quinasas intracelulares (Syk).",
            clinicalNote:
              "En la 'Anisakiasis Gastroalérgica' clásica, la breve parasitación gástrica de una larva viva actúa como una inyección parenteral de alérgenos excretados que dispara urticaria generalizada, broncoespasmo o anafilaxia 2 a 6 horas tras la comida.",
            focusTarget: [-0.2, 0.32, 0.35],
            focusDistance: 1.9,
            labelPoint: [-0.2, 0.85, 0.45],
          },
          {
            id: 3,
            name: "Mastocito en Desgranulación Explosiva (Histamina y Triptasa)",
            shortName: "Mastocito en Desgranulación",
            subtitle: "Exocitosis masiva de gránulos preformados y leucotrienos",
            color: "#a855f7",
            description:
              "Célula cebada (mastocito) mucosa y conectiva liberando al espacio extracelular cientos de gránulos ricos en histamina, triptasa sérica, factor activador de plaquetas (PAF), prostaglandina D2 y leucotrienos (LTC4/LTD4).",
            clinicalNote:
              "La elevación de la triptasa sérica durante el episodio agudo junto con la eosinofilia y la visualización o IgE anti-Anisakis confirma la anafilaxia inducida por Anisakis.",
            focusTarget: [0.15, -0.05, 0.0],
            focusDistance: 2.2,
            labelPoint: [0.55, 0.65, 0.2],
          },
          {
            id: 4,
            name: "Vasodilatación Capilar, Angioedema y Shock Anafiláctico",
            shortName: "Vasodilatación y Anafilaxia",
            subtitle: "Hipotensión, edema de glotis, broncoespasmo y habones urticariales",
            color: "#e11d48",
            description:
              "Microvasculatura dérmica y sistémica dilatada con aumento brusco de la permeabilidad endotelial por acción de la histamina sobre receptores H1/H2.",
            clinicalNote:
              "El tratamiento de emergencia de la reacción anafiláctica es ADRENALINA intramuscular (0.3–0.5 mg en cara anterolateral del muslo), antihistamínicos H1/H2 y corticoides, seguido de gastroscopia si persiste dolor epigástrico y recomendación de consumir solo pescado ultracongelado o de piscifactoría libre de Anisakis.",
            focusTarget: [0.75, -0.42, 0.15],
            focusDistance: 2.2,
            labelPoint: [0.98, -0.78, 0.25],
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
    N = perturbNormalAnalytical(N, vLocalPos, 14.0, 0.14);

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
      float sss = pow(clamp(dot(V, -L1) + 0.5, 0.0, 1.0), 2.2) * 0.35;
      finalColor = baseCol * (0.28 + diff1 * 0.72 + diff2) + baseCol * sss + vec3(1.0, 0.98, 0.94) * spec + baseCol * fresnel * 0.28;
      if (cuttable > 0.2) {
        alpha = mix(0.96, 0.24, uTranslucency);
      }
    } else if (uShaderMode == 1) {
      vec3 stainTint = mix(baseCol, vec3(0.76, 0.38, 0.48), 0.22);
      float edge = smoothstep(0.0, 0.85, fresnel);
      finalColor = mix(stainTint * (0.65 + diff1 * 0.42), vec3(0.32, 0.12, 0.22), edge * 0.55) + vec3(spec * 0.22);
      if (cuttable > 0.2) {
        alpha = mix(0.92, 0.25, uTranslucency);
      }
    } else if (uShaderMode == 2) {
      float gray = dot(baseCol, vec3(0.299, 0.587, 0.114));
      vec3 semBase = vec3(0.82, 0.78, 0.70) * (0.32 + 0.68 * gray);
      float semRim = pow(1.0 - max(dot(N, V), 0.0), 2.1);
      finalColor = semBase * (0.25 + diff1 * 0.55) + vec3(0.96, 0.93, 0.84) * semRim * 0.85 + vec3(spec * 0.28);
      alpha = 1.0;
    } else {
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
// P23: ANCYLOSTOMA DUODENALE BUILDERS
// ============================================================================

function buildP23BuccalTeeth(acc: MeshAcc) {
  // 1. INTERNAL MUSCULAR CLAVIFORM ESOPHAGUS emitted FIRST (Region 4, 4.0)
  acc.addTube(
    [
      [-0.25, 0.0, 0.0],
      [0.35, -0.05, 0.0],
      [1.15, -0.10, 0.0],
    ],
    (t) => 0.14 + Math.sin(t * Math.PI * 0.85) * 0.16,
    "#e11d48",
    4.0,
    36,
    16
  );

  // 2. DEEP CHITINOUS BUCCAL CAVITY CUP & DEEP LANCETS (Region 3, 3.0)
  const cupGeom = new THREE.CylinderGeometry(0.42, 0.24, 0.65, 28, 12, true);
  cupGeom.rotateZ(Math.PI / 2);
  cupGeom.translate(-0.55, 0.02, 0);
  acc.addGeometry(cupGeom, "#f59e0b", 3.0);
  // Deep triangular lancets at base of buccal cavity
  acc.addTube(
    [
      [-0.32, -0.15, -0.10],
      [-0.48, -0.04, -0.05],
    ],
    (t) => 0.05 * (1 - t * 0.8),
    "#fbbf24",
    3.0,
    10,
    8
  );
  acc.addTube(
    [
      [-0.32, -0.15, 0.10],
      [-0.48, -0.04, 0.05],
    ],
    (t) => 0.05 * (1 - t * 0.8),
    "#fbbf24",
    3.0,
    10,
    8
  );

  // 3. PATHOGNOMONIC 2 PAIRS OF CURVED VENTRAL CHITINOUS TEETH (4 TEETH, Region 2, 2.0)
  // Outer large pair (z = -0.22, +0.22) and inner smaller pair (z = -0.08, +0.08)
  const toothOffsets: [number, number][] = [
    [-0.24, 1.0],
    [-0.085, 0.78],
    [0.085, 0.78],
    [0.24, 1.0],
  ];
  toothOffsets.forEach(([zOff, scale]) => {
    const toothPts: [number, number, number][] = [
      [-0.86, 0.36, zOff],
      [-0.78, 0.22, zOff * 0.92],
      [-0.64, 0.08, zOff * 0.82],
    ];
    acc.addTube(
      toothPts,
      (t) => 0.068 * scale * Math.pow(1.0 - t, 0.75) + 0.006,
      "#fef08a",
      2.0,
      16,
      10
    );
  });

  // 4. OUTER CEPHALIC CUTICULAR COLLAR & ANTERIOR BODY (Region 1, 1.6 - cuttable)
  acc.addTube(
    [
      [-0.88, 0.04, 0],
      [-0.25, 0.0, 0],
      [0.55, -0.06, 0],
      [1.35, -0.14, 0],
    ],
    (t) => 0.48 + t * 0.08,
    "#fda4af",
    1.6,
    44,
    22,
    false
  );
}

function buildP23HookwormEgg(acc: MeshAcc) {
  // 1. MORULA OF 6 WELL-DEFINED BLASTOMERES emitted FIRST (Region 2, 2.0)
  const blastomereCenters: [number, number, number][] = [
    [-0.26, 0.16, 0.12],
    [0.26, 0.16, -0.10],
    [-0.24, -0.16, -0.12],
    [0.24, -0.16, 0.12],
    [0.0, 0.22, -0.16],
    [0.0, -0.20, 0.16],
  ];
  blastomereCenters.forEach(([bx, by, bz], idx) => {
    acc.addSphere(
      [bx, by, bz],
      [0.26, 0.24, 0.25],
      idx % 2 === 0 ? "#fcd34d" : "#fbbf24",
      2.0,
      22,
      16
    );
    // Blastomere nucleus
    acc.addSphere([bx * 1.05, by * 1.05, bz * 1.05], [0.08, 0.08, 0.08], "#92400e", 2.0, 12, 10);
  });

  // 2. CLEAR PERIVITELLINE SPACE MARKERS AT POLES (Region 3, 3.0 / Region 4, 4.0)
  acc.addSphere([0.75, 0, 0], [0.16, 0.28, 0.28], "#bae6fd", 3.0, 16, 12);
  acc.addSphere([-0.75, 0, 0], [0.16, 0.28, 0.28], "#fb923c", 4.0, 16, 12);

  // 3. THIN SINGLE-CONTOURED HYALINE OVAL SHELL (Region 1, 1.6 - cuttable)
  acc.addSphere([0, 0, 0], [1.14, 0.76, 0.74], "#e0f2fe", 1.6, 44, 32);
}

function buildP23CopulatoryBursa(acc: MeshAcc) {
  // 1. FEMALE ADULT CURVED IN SOFT "C" (Region 1, 1.6 - cuttable)
  const femPts: [number, number, number][] = [];
  for (let i = 0; i <= 44; i++) {
    const t = i / 44;
    const ang = (t - 0.5) * Math.PI * 0.72;
    femPts.push([
      Math.sin(ang) * 1.35 - 0.15,
      Math.cos(ang) * 0.65 - 0.22,
      -0.15,
    ]);
  }
  // Internal digestive tract & ovaries (Region 4, 4.0)
  acc.addTube(femPts.slice(3, 41), () => 0.065, "#be123c", 4.0, 40, 10);
  acc.addTube(
    femPts,
    (t) => 0.16 * Math.sin(Math.pow(t, 0.35) * Math.PI * 0.94 + 0.06),
    "#fda4af",
    1.6,
    48,
    16
  );

  // 2. MALE ADULT WITH UMBRELLA-LIKE COPULATORY BURSA (Region 2, 2.0)
  const malePts: [number, number, number][] = [
    [-1.15, -0.35, 0.22],
    [-0.35, -0.25, 0.25],
    [0.35, -0.28, 0.22],
    [0.85, -0.35, 0.18],
  ];
  acc.addTube(malePts, () => 0.135, "#fecdd3", 2.0, 32, 14);

  // Flared campanulate copulatory bursa at male tail (x = 0.85 to 1.28)
  const bursaCone = new THREE.ConeGeometry(0.36, 0.48, 24, 12, true);
  bursaCone.rotateZ(Math.PI / 2);
  bursaCone.translate(1.02, -0.35, 0.18);
  acc.addGeometry(bursaCone, "#fde68a", 2.0);
  // Muscular bursal rays (ribs)
  for (let r = -2; r <= 2; r++) {
    const ang = r * 0.42;
    acc.addTube(
      [
        [0.82, -0.35, 0.18],
        [1.22, -0.35 + Math.sin(ang) * 0.32, 0.18 + Math.cos(ang) * 0.28 - 0.18],
      ],
      () => 0.022,
      "#f59e0b",
      2.0,
      12,
      8
    );
  }

  // 3. TWO FREE DIVERGENT COPULATORY SPICULES (NOT FUSED, Region 3, 3.0)
  acc.addTube(
    [
      [0.82, -0.35, 0.18],
      [1.36, -0.26, 0.24],
    ],
    (t) => 0.022 * (1.0 - t * 0.55),
    "#f59e0b",
    3.0,
    16,
    8
  );
  acc.addTube(
    [
      [0.82, -0.35, 0.18],
      [1.36, -0.46, 0.12],
    ],
    (t) => 0.022 * (1.0 - t * 0.55),
    "#f59e0b",
    3.0,
    16,
    8
  );
}

function buildP23MucosalHematophagy(acc: MeshAcc) {
  // 1. JEJUNAL VILLUS BITTEN & ASPIRATED INTO BUCCAL CAPSULE (Region 2, 2.0)
  const villusPts: [number, number, number][] = [
    [-0.35, -0.68, 0.1],
    [-0.30, -0.22, 0.12],
    [-0.25, 0.18, 0.10],
  ];
  acc.addTube(villusPts, (t) => 0.28 * (1.0 - t * 0.35), "#fb7185", 2.0, 24, 14);
  // Villus capillary loop
  acc.addTube(villusPts, () => 0.09, "#e11d48", 2.0, 20, 10);

  // 2. ANCYLOSTOMA CEPHALIC END CLAMPING VILLUS WITH TEETH (Region 1, 1.0)
  const wormPts: [number, number, number][] = [
    [-0.25, 0.15, 0.10],
    [-0.45, 0.52, 0.12],
    [-0.95, 0.72, 0.08],
    [-1.45, 0.55, 0.0],
  ];
  acc.addTube(wormPts, (t) => 0.26 - t * 0.06, "#fda4af", 1.0, 32, 16);
  // Teeth at mouth rim
  acc.addSphere([-0.15, 0.12, 0.22], [0.06, 0.09, 0.05], "#fef08a", 1.0, 10, 8);
  acc.addSphere([-0.35, 0.12, 0.22], [0.06, 0.09, 0.05], "#fef08a", 1.0, 10, 8);

  // 3. PREVIOUS BITE SITE ULCER CONTINUING TO BLEED (Region 3, 3.6)
  const ulcVillusPts: [number, number, number][] = [
    [0.65, -0.68, 0.15],
    [0.65, -0.15, 0.18],
  ];
  acc.addTube(ulcVillusPts, () => 0.28, "#be123c", 3.6, 20, 14);

  // 4. EXTRAVASATED ERYTHROCYTES STREAMING FROM BOTH SITES (Region 4, 4.0)
  const rbcCoords: [number, number, number][] = [
    [0.58, 0.08, 0.25],
    [0.72, 0.24, 0.28],
    [0.48, 0.35, 0.22],
    [0.65, 0.48, 0.18],
    [-0.05, 0.02, 0.28],
    [0.12, -0.12, 0.32],
  ];
  rbcCoords.forEach(([rx, ry, rz], idx) => {
    acc.addSphere([rx, ry, rz], [0.12, 0.045, 0.12], "#dc2626", 4.0, 14, 10, [0.4, idx * 0.5, 0.3]);
  });
}

// ============================================================================
// P24: NECATOR AMERICANUS BUILDERS
// ============================================================================

function buildP24CuttingPlates(acc: MeshAcc) {
  // 1. INTERNAL MUSCULAR CLAVIFORM ESOPHAGUS emitted FIRST (Region 4, 4.0)
  acc.addTube(
    [
      [-0.25, 0.0, 0],
      [0.35, -0.06, 0],
      [1.15, -0.12, 0],
    ],
    (t) => 0.13 + Math.sin(t * Math.PI * 0.85) * 0.15,
    "#e11d48",
    4.0,
    36,
    16
  );

  // 2. GLOBULAR BUCCAL CAVITY, DORSAL MEDIAN CONE & DEEP LANCETS (Region 3, 3.0)
  const cupGeom = new THREE.SphereGeometry(0.42, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.72);
  cupGeom.rotateZ(-Math.PI / 2);
  cupGeom.translate(-0.48, 0.02, 0);
  acc.addGeometry(cupGeom, "#f59e0b", 3.0);
  // Dorsal median cone & subventral lancets inside buccal capsule
  acc.addTube(
    [
      [-0.38, -0.22, 0],
      [-0.58, -0.06, 0],
    ],
    (t) => 0.075 * (1.0 - t * 0.75),
    "#fbbf24",
    3.0,
    12,
    10
  );

  // 3. PATHOGNOMONIC 1 PAIR OF SEMILUNAR VENTRAL CUTTING PLATES (Region 2, 2.0)
  // Smooth crescentic chitinous blades (NO pointed teeth!)
  const createPlate = (zSide: number) => {
    const platePts: [number, number, number][] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const ang = t * Math.PI * 0.85;
      platePts.push([
        -0.76 + Math.sin(ang) * 0.08,
        0.32 - t * 0.28,
        zSide * (0.04 + Math.sin(ang) * 0.22),
      ]);
    }
    acc.addTube(platePts, (t) => 0.075 * Math.sin(t * Math.PI * 0.9 + 0.1), "#fef08a", 2.0, 20, 10);
  };
  createPlate(-1);
  createPlate(1);

  // 4. OUTER CEPHALIC HOOD WITH ABRUPT DORSAL HOOK CURVATURE (Region 1, 1.6 - cuttable)
  acc.addTube(
    [
      [-0.78, 0.12, 0],
      [-0.35, 0.02, 0],
      [0.35, -0.06, 0],
      [1.25, -0.15, 0],
    ],
    (t) => 0.44 + t * 0.06,
    "#fda4af",
    1.6,
    44,
    20,
    false
  );
}

function buildP24LarvaeHookworm(acc: MeshAcc) {
  // TOP: RHABDITIFORM LARVA L1 (y = +0.42) — LONG BUCCAL CANAL & TINY GENITAL PRIMORDIUM
  const l1Pts: [number, number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    l1Pts.push([
      -1.25 + t * 2.4,
      0.42 + Math.sin(t * Math.PI * 1.5) * 0.12,
      0,
    ]);
  }
  // LONG narrow buccal canal (Region 1, 1.0)
  acc.addTube(l1Pts.slice(0, 7), () => 0.038, "#fef08a", 1.0, 14, 10);
  // Rhabditoid esophagus with bulb
  acc.addTube(l1Pts.slice(7, 15), () => 0.068, "#fb7185", 1.0, 16, 10);
  acc.addSphere([l1Pts[15][0], l1Pts[15][1], 0], [0.095, 0.095, 0.095], "#e11d48", 1.0, 16, 12);
  // Tiny inconspicuous genital primordium
  acc.addSphere([l1Pts[25][0], l1Pts[25][1] - 0.05, 0], [0.045, 0.032, 0.032], "#eab308", 1.0, 10, 8);
  // Outer cuticle of L1 (Region 1, 1.6 - cuttable)
  acc.addTube(
    l1Pts,
    (t) => 0.14 * Math.sin(Math.pow(t, 0.35) * Math.PI * 0.94 + 0.06),
    "#fde68a",
    1.6,
    44,
    14
  );

  // BOTTOM: SHEATHED FILARIFORM LARVA L3 (y = -0.35) — 1:3 ESOPHAGUS & POINTED TAIL
  const l3Pts: [number, number, number][] = [];
  for (let i = 0; i <= 52; i++) {
    const t = i / 52;
    l3Pts.push([
      -1.52 + t * 3.04,
      -0.35 + Math.sin(t * Math.PI * 2.0) * 0.14,
      0,
    ]);
  }
  // Short cylindrical esophagus (1/4 of body length, Region 3, 3.0)
  acc.addTube(l3Pts.slice(2, 15), () => 0.062, "#fb7185", 3.0, 20, 10);
  // Intestine (remaining 3/4) + SHARP POINTED TAIL TIP (Region 4, 4.0)
  acc.addTube(
    l3Pts.slice(15, 50),
    (t) => 0.065 * Math.pow(1.0 - t, 0.65) + 0.005,
    "#38bdf8",
    4.0,
    36,
    10
  );
  // Outer retained cuticular sheath (Region 2, 2.6 - cuttable)
  acc.addTube(
    l3Pts,
    (t) => {
      if (t < 0.08) return 0.05 + (t / 0.08) * 0.08;
      if (t < 0.82) return 0.13;
      const s = (t - 0.82) / 0.18;
      return 0.13 * Math.pow(1.0 - s, 1.35) + 0.004;
    },
    "#bae6fd",
    2.6,
    56,
    16
  );
}

function buildP24SkinPenetration(acc: MeshAcc) {
  // 1. EPIDERMIS WITH ERYTHEMATOUS PAPULOVESICULAR "MAZAMORRA" LESION (Region 3, 3.0)
  const skinBox = new THREE.BoxGeometry(2.8, 0.35, 1.6);
  skinBox.translate(0, 0.12, 0);
  acc.addGeometry(skinBox, "#fda4af", 3.6);
  acc.addSphere([0.35, 0.25, 0.25], [0.42, 0.18, 0.38], "#fb7185", 3.0, 22, 16);

  // 2. SHED CUTICULAR SHEATH LEFT ON SKIN SURFACE (Region 2, 2.0)
  const sheathPts: [number, number, number][] = [
    [-1.25, 0.65, 0.15],
    [-0.85, 0.52, 0.12],
    [-0.45, 0.38, 0.10],
  ];
  acc.addTube(sheathPts, () => 0.075, "#bae6fd", 2.0, 24, 12);

  // 3. INFECTIVE L3 LARVA PENETRATING DERMIS (Region 1, 1.0)
  const larvaPts: [number, number, number][] = [
    [-0.45, 0.38, 0.10],
    [-0.15, 0.18, 0.08],
    [0.12, -0.08, 0.06],
    [0.45, -0.32, 0.05],
  ];
  acc.addTube(
    larvaPts,
    (t) => 0.085 * Math.sin(t * Math.PI * 0.85 + 0.15),
    "#fef08a",
    1.0,
    32,
    12
  );

  // 4. DERMAL VENULE ENTERED TO START LOOS CYCLE (Region 4, 4.0)
  const venPts: [number, number, number][] = [
    [-1.35, -0.42, 0.0],
    [0.0, -0.35, 0.05],
    [1.35, -0.42, 0.0],
  ];
  acc.addTube(venPts, () => 0.20, "#e11d48", 4.0, 32, 14);
}

function buildP24AdultsSHook(acc: MeshAcc) {
  // 1. S-SHAPED ADULT WITH ABRUPT DORSAL CEPHALIC HOOK (Region 1, 1.6 - cuttable)
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    if (t < 0.22) {
      // Sharp dorsal hook at anterior end
      const s = t / 0.22;
      const ang = (1.0 - s) * Math.PI * 0.85;
      pts.push([
        -0.85 - Math.sin(ang) * 0.35,
        0.22 + (1.0 - Math.cos(ang)) * 0.32,
        0,
      ]);
    } else {
      const s = (t - 0.22) / 0.78;
      pts.push([
        -0.85 + s * 1.75,
        0.22 - Math.sin(s * Math.PI) * 0.45,
        0,
      ]);
    }
  }
  // Internal digestive tract (Region 4, 4.0)
  acc.addTube(pts.slice(4, 44), () => 0.065, "#be123c", 4.0, 40, 10);
  acc.addTube(pts, () => 0.15, "#fda4af", 1.6, 52, 16);

  // 2. ELONGATED COPULATORY BURSA WITH BIPARTITE DORSAL RAY (Region 2, 2.0)
  const bursaCone = new THREE.ConeGeometry(0.32, 0.54, 24, 12, true);
  bursaCone.rotateZ(Math.PI / 2);
  bursaCone.translate(1.02, 0.18, 0.05);
  acc.addGeometry(bursaCone, "#fde68a", 2.0);

  // 3. TWO COPULATORY SPICULES FUSED DISTALLY INTO A BARBED HARPOON TIP (Region 3, 3.0)
  acc.addTube(
    [
      [0.82, 0.21, 0.05],
      [1.32, 0.18, 0.05],
    ],
    () => 0.022,
    "#f59e0b",
    3.0,
    14,
    8
  );
  acc.addTube(
    [
      [0.82, 0.15, 0.05],
      [1.32, 0.18, 0.05],
    ],
    () => 0.022,
    "#f59e0b",
    3.0,
    14,
    8
  );
  // Barbed harpoon hook at fused tip (1.32, 0.18, 0.05)
  acc.addTube(
    [
      [1.34, 0.18, 0.05],
      [1.22, 0.27, 0.05],
    ],
    (t) => 0.026 * (1.0 - t * 0.6),
    "#fbbf24",
    3.0,
    10,
    8
  );
}

// ============================================================================
// P32: TRICHINELLA SPIRALIS BUILDERS
// ============================================================================

function buildP32NurseCellCyst(acc: MeshAcc) {
  // 1. INTERNAL COILED L1 LARVA IN 3 SPIRAL TURNS emitted FIRST (Region 1, 1.0)
  const larvaPts: [number, number, number][] = [];
  for (let i = 0; i <= 72; i++) {
    const t = i / 72;
    const ang = t * Math.PI * 5.8;
    const r = 0.34 * Math.sin(t * Math.PI * 0.85 + 0.15);
    larvaPts.push([
      (t - 0.5) * 0.72,
      Math.sin(ang) * r,
      Math.cos(ang) * r,
    ]);
  }
  acc.addTube(
    larvaPts,
    (t) => 0.095 * Math.sin(Math.pow(t, 0.35) * Math.PI * 0.92 + 0.08),
    "#fde047",
    1.0,
    72,
    14
  );

  // 2. HYPERTROPHIED NURSE CELL NUCLEI IN BASOPHILIC SARCOPLASM (Region 2, 2.0)
  const nucCoords: [number, number, number][] = [
    [-0.52, 0.12, 0.12],
    [0.52, -0.10, 0.12],
    [-0.38, -0.18, -0.14],
    [0.42, 0.16, -0.12],
  ];
  nucCoords.forEach(([nx, ny, nz]) => {
    acc.addSphere([nx, ny, nz], [0.14, 0.11, 0.11], "#a855f7", 2.0, 16, 12);
    acc.addSphere([nx, ny, nz], [0.05, 0.05, 0.05], "#f3e8ff", 2.0, 10, 8);
  });

  // 3. LEMON-SHAPED COLLAGENOUS CAPSULE & STRIATED MUSCLE FIBER (Region 3, 3.6 - cuttable)
  const cystGeom = new THREE.SphereGeometry(1, 48, 36);
  const pos = cystGeom.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // Lemon shape with tapered poles along X
    const taper = Math.pow(Math.max(0.05, 1.0 - x * x * 0.55), 0.45);
    pos.setXYZ(i, x * 1.18, y * 0.68 * taper, z * 0.66 * taper);
  }
  acc.addGeometry(cystGeom, "#fda4af", 3.6);

  // Striated skeletal muscle fiber poles extending left and right
  acc.addTube(
    [
      [-1.75, 0, 0],
      [-1.05, 0, 0],
    ],
    (t) => 0.34 + t * 0.12,
    "#f43f5e",
    3.6,
    20,
    16
  );
  acc.addTube(
    [
      [1.05, 0, 0],
      [1.75, 0, 0],
    ],
    (t) => 0.46 - t * 0.12,
    "#f43f5e",
    3.6,
    20,
    16
  );

  // 4. PERICAPSULAR ANGIOGENIC VENOUS RETE (Region 4, 4.0)
  for (let v = 0; v < 3; v++) {
    const vPts: [number, number, number][] = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const x = -0.95 + t * 1.9;
      const env = Math.sin(t * Math.PI) * 0.68;
      const ang = t * Math.PI * 2.5 + v * 2.1;
      vPts.push([x, Math.sin(ang) * env, Math.cos(ang) * env]);
    }
    acc.addTube(vPts, () => 0.035, "#e11d48", 4.0, 32, 8);
  }
}

function buildP32ViviparousFemale(acc: MeshAcc) {
  const femPts: [number, number, number][] = [];
  for (let i = 0; i <= 52; i++) {
    const t = i / 52;
    femPts.push([
      -1.55 + t * 3.1,
      Math.sin(t * Math.PI * 1.4) * 0.22,
      0,
    ]);
  }

  // 1. ANTERIOR STICHOSOME (Row of stichocytes, Region 2, 2.0)
  for (let i = 3; i <= 22; i += 2) {
    const p = femPts[i];
    acc.addSphere([p[0], p[1], p[2]], [0.068, 0.062, 0.062], "#f59e0b", 2.0, 12, 10);
  }

  // 2. VIVIPAROUS UTERUS WITH POSTERIOR EMBRYOS & ANTERIOR MOTILE LARVAE (Region 3, 3.0)
  // Posterior embryos
  for (let i = 38; i <= 48; i += 2) {
    const p = femPts[i];
    acc.addSphere([p[0], p[1], p[2]], [0.075, 0.065, 0.065], "#fde68a", 3.0, 12, 10);
  }
  // Uncoiled newborn larvae inside anterior uterus ready for birth
  for (let l = 0; l < 4; l++) {
    const baseIdx = 23 + l * 3;
    const p1 = femPts[baseIdx];
    const p2 = femPts[baseIdx + 3];
    acc.addTube(
      [
        [p1[0], p1[1] + (l % 2 === 0 ? 0.04 : -0.04), 0.03],
        [p2[0], p2[1] + (l % 2 === 0 ? -0.04 : 0.04), -0.03],
      ],
      () => 0.032,
      "#fde047",
      3.0,
      14,
      8
    );
  }

  // 3. LIVE NEWBORN LARVA (100 µm) EMERGING DIRECTLY FROM ANTERIOR VULVA (Region 4, 4.0)
  const birthPts: [number, number, number][] = [
    [-0.45, 0.14, 0.05],
    [-0.48, -0.12, 0.16],
    [-0.35, -0.35, 0.24],
    [-0.12, -0.45, 0.28],
  ];
  acc.addTube(
    birthPts,
    (t) => 0.045 * Math.sin(t * Math.PI * 0.85 + 0.15),
    "#38bdf8",
    4.0,
    24,
    10
  );

  // 4. OUTER FEMALE CUTICLE (Region 1, 1.6 - cuttable)
  acc.addTube(
    femPts,
    (t) => 0.08 + Math.sin(Math.pow(t, 0.45) * Math.PI * 0.92 + 0.08) * 0.12,
    "#fda4af",
    1.6,
    56,
    18
  );
}

function buildP32SystemicMigration(acc: MeshAcc) {
  // 1. BRANCHING STRIATED CARDIOMYOCYTES WITH NECROSIS (Region 3, 3.6)
  acc.addTube(
    [
      [-1.4, 0.28, -0.1],
      [0.0, 0.22, 0.0],
      [1.4, 0.32, -0.05],
    ],
    () => 0.22,
    "#fb7185",
    3.6,
    32,
    14
  );
  acc.addTube(
    [
      [-0.2, 0.22, 0.0],
      [0.65, -0.15, 0.12],
      [1.35, -0.25, 0.10],
    ],
    () => 0.19,
    "#f43f5e",
    3.6,
    28,
    14
  );

  // 2. NEWBORN LARVA MIGRATING THROUGH MYOCARDIUM WITHOUT ENCYSTING (Region 1, 1.0)
  const lPts: [number, number, number][] = [
    [-0.55, -0.15, 0.18],
    [-0.15, 0.12, 0.15],
    [0.25, 0.25, 0.12],
    [0.58, 0.08, 0.18],
  ];
  acc.addTube(lPts, () => 0.072, "#fde047", 1.0, 32, 12);

  // 3. INFLAMED MICROVASCULAR CAPILLARY (Region 2, 2.6)
  acc.addTube(
    [
      [-1.35, -0.35, 0.15],
      [0.0, -0.28, 0.20],
      [1.25, -0.42, 0.15],
    ],
    () => 0.18,
    "#e11d48",
    2.6,
    28,
    14
  );

  // 4. MASSIVE EOSINOPHILIC INFILTRATE (Region 4, 4.0)
  const eosPos: [number, number, number][] = [
    [0.35, -0.32, 0.35],
    [0.62, -0.38, 0.28],
    [-0.25, 0.42, 0.22],
    [0.15, -0.05, 0.32],
  ];
  eosPos.forEach(([ex, ey, ez]) => {
    acc.addSphere([ex, ey, ez], [0.13, 0.12, 0.13], "#c084fc", 4.0, 14, 12);
  });
}

function buildP32Trichinoscopy(acc: MeshAcc) {
  // 1. PARALLEL STRIATED MUSCLE BUNDLES (Region 1, 1.6)
  const yRows = [-0.62, 0.0, 0.62];
  yRows.forEach((y) => {
    acc.addTube(
      [
        [-1.65, y, -0.12],
        [0.0, y, -0.12],
        [1.65, y, -0.12],
      ],
      () => 0.22,
      "#e11d48",
      1.6,
      32,
      14
    );
  });

  // 2. LEFT: VIABLE TRANSLUCENT NURSE-CELL CYST WITH COILED LARVA (Region 2, 2.6)
  const lPts: [number, number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const ang = t * Math.PI * 4.5;
    const r = 0.18 * Math.sin(t * Math.PI * 0.85 + 0.15);
    lPts.push([-0.75 + (t - 0.5) * 0.35, Math.sin(ang) * r, 0.12 + Math.cos(ang) * r]);
  }
  acc.addTube(lPts, () => 0.055, "#fde047", 2.0, 44, 10);
  acc.addSphere([-0.75, 0, 0.12], [0.52, 0.32, 0.30], "#fda4af", 2.6, 28, 20);

  // 3. RIGHT: BIPOLAR / CALCIFIED CYST (Region 3, 3.6)
  acc.addSphere([0.75, 0, 0.12], [0.52, 0.32, 0.30], "#f8fafc", 3.6, 28, 20);
  // Calcified chalky polar cones
  acc.addSphere([0.32, 0, 0.12], [0.18, 0.16, 0.16], "#e2e8f0", 3.0, 16, 12);
  acc.addSphere([1.18, 0, 0.12], [0.18, 0.16, 0.16], "#e2e8f0", 3.0, 16, 12);

  // 4. PERICAPSULAR INFLAMMATORY CELLS (Region 4, 4.0)
  acc.addSphere([-0.15, -0.38, 0.15], [0.12, 0.10, 0.12], "#c084fc", 4.0, 12, 10);
  acc.addSphere([0.15, -0.42, 0.15], [0.12, 0.10, 0.12], "#c084fc", 4.0, 12, 10);
}

// ============================================================================
// P33: ANISAKIS SIMPLEX BUILDERS
// ============================================================================

function buildP33LarvaAnatomy(acc: MeshAcc) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 56; i++) {
    const t = i / 56;
    pts.push([
      -1.52 + t * 2.95,
      Math.sin(t * Math.PI * 1.5) * 0.32,
      Math.cos(t * Math.PI * 1.2) * 0.12,
    ]);
  }

  // 1. INTERNAL MUSCULAR PREVENTRICULUS & OBLIQUE GLANDULAR VENTRICULUS emitted FIRST (Region 2, 2.0)
  // Muscular preventriculus (esophagus)
  acc.addTube(pts.slice(2, 14), () => 0.085, "#fb7185", 2.0, 20, 12);
  // Opaque white long glandular ventriculus (characteristic of Anisakis)
  acc.addTube(pts.slice(14, 26), () => 0.105, "#f8fafc", 2.0, 24, 14);
  // Oblique junction & intestine (no cecum!)
  acc.addTube(pts.slice(26, 53), () => 0.09, "#f59e0b", 2.0, 32, 12);

  // 2. ANTERIOR CHITINOUS BORING TOOTH & LIP ANLAGEN (Region 3, 3.0)
  const head = pts[0];
  acc.addSphere([head[0], head[1], head[2]], [0.12, 0.13, 0.13], "#fcd34d", 3.0, 16, 12);
  // Sharp ventral boring tooth
  acc.addTube(
    [
      [head[0] - 0.06, head[1] - 0.04, head[2]],
      [head[0] - 0.22, head[1] - 0.08, head[2]],
    ],
    (t) => 0.042 * (1.0 - t * 0.85),
    "#f59e0b",
    3.0,
    12,
    8
  );

  // 3. POSTERIOR CAUDAL MUCRON SPINE (Region 4, 4.0)
  const tail = pts[56];
  acc.addTube(
    [
      [tail[0], tail[1], tail[2]],
      [tail[0] + 0.20, tail[1] - 0.06, tail[2]],
    ],
    (t) => 0.038 * (1.0 - t * 0.85),
    "#fbbf24",
    4.0,
    12,
    8
  );

  // 4. OUTER STRIATED CUTICLE OF L3 LARVA (Region 1, 1.6 - cuttable)
  acc.addTube(
    pts,
    (t) => {
      if (t < 0.08) return 0.11 + (t / 0.08) * 0.09;
      if (t < 0.92) return 0.20;
      return 0.20 * (1.0 - ((t - 0.92) / 0.08) * 0.55);
    },
    "#fef3c7",
    1.6,
    60,
    18
  );
}

function buildP33GastricEndoscopy(acc: MeshAcc) {
  // 1. HYPERTROPHIC GASTRIC RUGAE & MUCOSA (Region 4, 4.6)
  for (let r = -1; r <= 1; r++) {
    acc.addTube(
      [
        [-1.55, -0.38, r * 0.42],
        [0.0, -0.32, r * 0.42 + 0.08],
        [1.55, -0.38, r * 0.42],
      ],
      () => 0.26,
      "#fda4af",
      4.6,
      28,
      14
    );
  }

  // 2. EDEMATOUS EOSINOPHILIC PHLEGMON MOUND AT PENETRATION SITE (Region 2, 2.6)
  acc.addSphere([-0.25, -0.22, 0.15], [0.55, 0.26, 0.48], "#e11d48", 2.6, 26, 18);

  // 3. LIVE L3 ANISAKIS LARVA BURROWING INTO GASTRIC WALL (Region 1, 1.0)
  const larvaPts: [number, number, number][] = [
    [-0.28, -0.32, 0.15],
    [-0.22, 0.05, 0.18],
    [-0.05, 0.42, 0.15],
    [-0.38, 0.72, 0.05],
    [0.15, 0.85, -0.05],
  ];
  acc.addTube(larvaPts, () => 0.12, "#fef3c7", 1.0, 44, 14);

  // 4. ENDOSCOPIC BIOPSY FORCEPS GRASPING THE LARVA (Region 3, 3.0)
  acc.addTube(
    [
      [1.35, 0.75, 0.15],
      [0.45, 0.42, 0.15],
    ],
    () => 0.09,
    "#94a3b8",
    3.0,
    20,
    12
  );
  // Open forceps jaws grasping neck
  acc.addTube(
    [
      [0.45, 0.42, 0.15],
      [0.05, 0.35, 0.22],
    ],
    () => 0.045,
    "#cbd5e1",
    3.0,
    12,
    8
  );
  acc.addTube(
    [
      [0.45, 0.42, 0.15],
      [0.05, 0.48, 0.08],
    ],
    () => 0.045,
    "#cbd5e1",
    3.0,
    12,
    8
  );
}

function buildP33YLateralChords(acc: MeshAcc) {
  // Transverse histological cylinder of Anisakis larva in submucosa
  // 1. OUTER SUBMUCOSAL EOSINOPHILIC GRANULOMA CUFF (Region 4, 4.6 - cuttable)
  const cuff = new THREE.CylinderGeometry(1.28, 1.28, 0.45, 40, 8, true);
  cuff.rotateX(Math.PI / 2);
  acc.addGeometry(cuff, "#c084fc", 4.6);

  // 2. POLYMYARIAN SOMATIC MUSCLE RING & CUTICLE (Region 2, 2.0)
  const muscRing = new THREE.TorusGeometry(0.76, 0.14, 20, 48);
  acc.addGeometry(muscRing, "#f43f5e", 2.0);

  // 3. PATHOGNOMONIC Y-SHAPED LATERAL EPIDERMAL CHORDS (Left & Right, Region 1, 1.0)
  const buildYChord = (dir: number) => {
    // Stem from lateral wall
    acc.addTube(
      [
        [dir * 0.72, 0, 0],
        [dir * 0.52, 0, 0],
      ],
      () => 0.065,
      "#fbbf24",
      1.0,
      10,
      10
    );
    // Upper and lower lobes of the "Y"
    acc.addSphere([dir * 0.42, 0.14, 0], [0.13, 0.09, 0.15], "#fbbf24", 1.0, 16, 12);
    acc.addSphere([dir * 0.42, -0.14, 0], [0.13, 0.09, 0.15], "#fbbf24", 1.0, 16, 12);
  };
  buildYChord(-1);
  buildYChord(1);

  // 4. CENTRAL TRIRADIATE INTESTINE & BANANA-SHAPED VENTRAL RENETTE CELL (Region 3, 3.0)
  acc.addSphere([0, 0.12, 0], [0.28, 0.26, 0.22], "#38bdf8", 3.0, 24, 18);
  // Banana-shaped ventral Renette excretory gland cell
  const renPts: [number, number, number][] = [
    [-0.26, -0.26, 0],
    [0.0, -0.36, 0],
    [0.26, -0.26, 0],
  ];
  acc.addTube(renPts, (t) => 0.11 * Math.sin(t * Math.PI * 0.85 + 0.15), "#0284c7", 3.0, 20, 12);
}

function buildP33AllergyIgE(acc: MeshAcc) {
  // 1. DEGRANULATING MAST CELL (Region 3, 3.6 - cuttable)
  acc.addSphere([0.15, -0.05, 0], [0.68, 0.62, 0.64], "#a855f7", 3.6, 36, 28);
  // Mast cell nucleus & intracellular histamine granules
  acc.addSphere([0.15, -0.05, 0], [0.28, 0.26, 0.28], "#581c87", 3.0, 20, 16);
  for (let g = 0; g < 18; g++) {
    const ang = g * 1.7;
    const r = 0.48 + (g % 3) * 0.18;
    acc.addSphere(
      [0.15 + Math.cos(ang) * r, -0.05 + Math.sin(ang) * r * 0.8, Math.sin(g * 2.3) * 0.35],
      [0.075, 0.075, 0.075],
      "#d8b4fe",
      3.0,
      12,
      10
    );
  }

  // 2. Y-SHAPED IgE ANTIBODIES CROSS-LINKED ON MAST CELL SURFACE (Region 2, 2.0)
  const igeAngles = [0.6, 1.2, 1.9, 2.5];
  igeAngles.forEach((ang) => {
    const bx = 0.15 + Math.cos(ang) * 0.66;
    const by = -0.05 + Math.sin(ang) * 0.60;
    const nx = Math.cos(ang);
    const ny = Math.sin(ang);
    acc.addTube(
      [
        [bx, by, 0.15],
        [bx + nx * 0.16, by + ny * 0.16, 0.15],
      ],
      () => 0.032,
      "#38bdf8",
      2.0,
      8,
      8
    );
    acc.addTube(
      [
        [bx + nx * 0.16, by + ny * 0.16, 0.15],
        [bx + nx * 0.28 - ny * 0.09, by + ny * 0.28 + nx * 0.09, 0.15],
      ],
      () => 0.026,
      "#38bdf8",
      2.0,
      8,
      8
    );
    acc.addTube(
      [
        [bx + nx * 0.16, by + ny * 0.16, 0.15],
        [bx + nx * 0.28 + ny * 0.09, by + ny * 0.28 - nx * 0.09, 0.15],
      ],
      () => 0.026,
      "#38bdf8",
      2.0,
      8,
      8
    );
  });

  // 3. THERMOSTABLE ANISAKIS ALLERGENS Ani s 1 / Ani s 4 (Region 1, 1.0)
  const allergenCoords: [number, number, number][] = [
    [-0.85, 0.35, 0.15],
    [-0.55, 0.58, 0.18],
    [-0.22, 0.72, 0.15],
    [-0.95, 0.05, 0.22],
  ];
  allergenCoords.forEach(([ax, ay, az]) => {
    acc.addSphere([ax, ay, az], [0.12, 0.09, 0.10], "#fde047", 1.0, 16, 12);
  });

  // 4. DILATED TARGET CAPILLARY (URTICARIA / ANAPHYLAXIS, Region 4, 4.0)
  acc.addTube(
    [
      [-1.2, -0.65, 0.1],
      [0.2, -0.58, 0.15],
      [1.35, -0.45, 0.1],
    ],
    () => 0.22,
    "#e11d48",
    4.0,
    28,
    14
  );
}

function buildStageGeometry(
  speciesCode: HookwormFoodNematodeSpeciesCode,
  stageId: string
): THREE.BufferGeometry {
  const acc = new MeshAcc();

  if (speciesCode === "p23") {
    if (stageId === "buccal_teeth") buildP23BuccalTeeth(acc);
    else if (stageId === "hookworm_egg") buildP23HookwormEgg(acc);
    else if (stageId === "copulatory_bursa") buildP23CopulatoryBursa(acc);
    else buildP23MucosalHematophagy(acc);
  } else if (speciesCode === "p24") {
    if (stageId === "cutting_plates") buildP24CuttingPlates(acc);
    else if (stageId === "larvae_hookworm") buildP24LarvaeHookworm(acc);
    else if (stageId === "skin_penetration") buildP24SkinPenetration(acc);
    else buildP24AdultsSHook(acc);
  } else if (speciesCode === "p32") {
    if (stageId === "nurse_cell_cyst") buildP32NurseCellCyst(acc);
    else if (stageId === "viviparous_female") buildP32ViviparousFemale(acc);
    else if (stageId === "systemic_migration") buildP32SystemicMigration(acc);
    else buildP32Trichinoscopy(acc);
  } else {
    if (stageId === "l3_larva_anatomy") buildP33LarvaAnatomy(acc);
    else if (stageId === "gastric_endoscopy") buildP33GastricEndoscopy(acc);
    else if (stageId === "y_lateral_chords") buildP33YLateralChords(acc);
    else buildP33AllergyIgE(acc);
  }

  return acc.toBufferGeometry();
}

// ============================================================================
// MAIN REACT COMPONENT (Unified Atlas HUD & Layout)
// ============================================================================

export interface HookwormsFoodNematodes3DViewerProps {
  speciesCode: HookwormFoodNematodeSpeciesCode;
  onClose?: () => void;
}

export default function HookwormsFoodNematodes3DViewer({
  speciesCode,
  onClose,
}: HookwormsFoodNematodes3DViewerProps) {
  const speciesMeta = SPECIES_META[speciesCode] ?? SPECIES_META.p23;

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
        <div ref={mountRef} className="w-full h-full" />

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

            <button
              onClick={() => handleFocusRegion(activeRegionMeta)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-medium backdrop-blur-md transition"
            >
              Enfocar: {activeRegionMeta.shortName}
            </button>

            <button
              onClick={handleResetView}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-medium backdrop-blur-md transition"
            >
              Vista general
            </button>
          </div>

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
