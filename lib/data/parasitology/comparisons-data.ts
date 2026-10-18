import { ComparisonEntry } from "./types";

/**
 * PARES COMPARATIVOS DE IDENTIFICACIÓN PARASITOLÓGICA
 * Diseñados para correlación morfológica lado a lado en escritorio y vertical en celular.
 * Basados en criterios CDC DPDx y manuales estándar de parasitología médica.
 */
export const COMPARISON_ENTRIES: ComparisonEntry[] = [
  {
    id: "comp-ts-vs-tsa",
    title: "Taenia solium vs Taenia saginata: Diferenciación de especie y riesgo clínico",
    formA: {
      speciesName: "Taenia solium",
      stage: "Escólex y Proglótide grávido",
      group: "Cestodo (Solitaria del cerdo)"
    },
    formB: {
      speciesName: "Taenia saginata",
      stage: "Escólex y Proglótide grávido",
      group: "Cestodo (Solitaria del vacuno)"
    },
    clinicalScenario: "Paciente que consulta por expulsión espontánea de segmentos blancos planos en la ropa interior o deposición. La diferenciación de especie es URGENTE porque la teniasis por T. solium conlleva riesgo de cisticercosis humana en el paciente y sus convivientes por autoinfección fecal-oral.",
    features: {
      sizeAndShape: {
        a: "Estróbilo adulto de 2 a 7 metros. Proglótide grávido mide 10-12 mm × 5-6 mm (cuadrangular).",
        b: "Estróbilo adulto de 4 a 12 metros (más largo y grueso). Proglótide grávido mide 16-20 mm × 4-7 mm (más alargado y rectangular).",
        distinctive: true
      },
      wallAndCovering: {
        a: "Tegumento de grosor intermedio; musculatura moderada; suele expulsarse pasivamente junto a las heces en cadenas cortas.",
        b: "Tegumento con gruesa capa muscular; motilidad activa muy intensa; se desplaza activamente a través del esfínter anal hacia la piel perineal.",
        distinctive: true
      },
      internalContent: {
        a: "Útero con 7 a 13 ramas primarias laterales gruesas a cada lado del tallo central (dendríticas o poco ramificadas).",
        b: "Útero con 15 a 30 ramas primarias laterales delgadas a cada lado del tallo central, profusamente dicotómicas (ramificadas en Y).",
        distinctive: true
      },
      distinctiveStructures: {
        a: "Escólex ARMADO: 4 ventosas + rostelo prominente con doble corona de 22 a 32 ganchos quitinosos.",
        b: "Escólex INERME: 4 ventosas circulares; carece de rostelo y no posee ganchos en ninguna etapa.",
        distinctive: true
      }
    },
    similarities: [
      "Ambos son cestodos parásitos del intestino delgado humano.",
      "Sus huevos son idénticos bajo microscopía óptica convencional (31-43 µm, esféricos, embrióforo radiado con oncosfera hexacanta).",
      "Ambos responden al tratamiento con praziquantel o niclosamida."
    ],
    criticalDifferences: [
      "Número de ramas uterinas en proglótide grávido teñido: 7-13 en T. solium frente a 15-30 en T. saginata.",
      "Armadura del escólex: T. solium posee corona de ganchos; T. saginata es inerme.",
      "Potencial zoonótico inverso: Los huevos de T. solium causan cisticercosis humana (incluyendo neurocisticercosis potencialmente letal); los huevos de T. saginata NO son infectantes para el ser humano."
    ],
    diagnosticLimitations: "La microscopía coproparasitológica óptica que detecta huevos NO puede distinguir la especie. Debe informarse como 'Huevos de Taenia sp.'. La diferenciación requiere inyección de tinta china en el proglótide, recuperación del escólex o PCR / coproantígenos de referencia.",
    confirmatoryTests: [
      "Inyección de tinta china o diafanización con lactofenol de proglótides grávidos enteros para recuento de ramas uterinas.",
      "PCR multiplex o secuenciación de genes mitocondriales (cox1) en centros de referencia (ISP / CDC).",
      "Coproantígeno ELISA específico de especie donde esté validado."
    ],
    pitfalls: [
      "Creer que el coproparasitológico descarta T. solium si solo dice 'Taenia sp.'.",
      "Confundir la ingesta de carne de cerdo infectada (que causa teniasis) con la ingesta de huevos (que causa cisticercosis).",
      "Intentar contar ramas uterinas en proglótides inmaduros que aún no han desarrollado el útero grávido."
    ],
    sources: [
      "CDC DPDx · Laboratory Identification: Taeniasis (2024)",
      "World Health Organization (WHO) · Taeniasis/Cysticercosis Guidelines (2021)"
    ]
  },
  {
    id: "comp-ts-vs-hn",
    title: "Taenia solium (Huevo) vs Hymenolepis nana (Huevo)",
    formA: {
      speciesName: "Taenia solium (o Taenia sp.)",
      stage: "Huevo",
      group: "Cestodo ciclo heteroxénico"
    },
    formB: {
      speciesName: "Hymenolepis nana",
      stage: "Huevo",
      group: "Cestodo ciclo monoxénico / autoinfeccioso"
    },
    clinicalScenario: "Detección de huevos esféricos con embrión hexacanto en examen coproparasitológico directo o de concentración en un paciente en edad escolar con diarrea o dolor abdominal.",
    features: {
      sizeAndShape: {
        a: "31 a 43 µm de diámetro. Esférico a ligeramente subesférico.",
        b: "45 a 55 µm de diámetro (notoriamente más grande). Esférico a ovalado hialino.",
        distinctive: true
      },
      wallAndCovering: {
        a: "Embrióforo marrón oscuro o amarillento, muy grueso, con estriaciones radiales transversales evidentes (aspecto de rueda de carreta). La membrana vitelina externa suele perderse en heces.",
        b: "Cubierta externa lisa, incolora, transparente y delgada; separada de la oncosfera por un espacio claro amplio.",
        distinctive: true
      },
      internalContent: {
        a: "Oncosfera interna hexacanta (con 3 pares de ganchos birrefringentes) rodeada directamente por el embrióforo.",
        b: "Oncosfera interna central rodeada por una membrana interna con dos engrosamientos o mamelones polares opuestos.",
        distinctive: true
      },
      distinctiveStructures: {
        a: "Carece de filamentos polares. Embrióforo estriado radiado característico.",
        b: "Presencia de 4 a 8 filamentos polares ondulantes refringentes que emergen de los polos de la membrana interna hacia el espacio claro.",
        distinctive: true
      }
    },
    similarities: [
      "Ambos contienen una oncosfera con 6 ganchos embriónicos (embrión hexacanto).",
      "Ambos se transmiten por vía fecal-oral mediante ingestión de huevos eliminados en las heces.",
      "Ambos responden al praziquantel, aunque H. nana requiere dosis mayores o repetidas debido a las formas tisulares en las vellosidades."
    ],
    criticalDifferences: [
      "La presencia de filamentos polares es exclusiva y patognomónica de Hymenolepis nana.",
      "El embrióforo grueso estriado radialmente es exclusivo de Taenia.",
      "H. nana es el cestodo humano más pequeño (adulto mide 1-4 cm frente a 2-7 metros de T. solium)."
    ],
    diagnosticLimitations: "En muestras mal conservadas o con artefactos fecales adheridos, los filamentos polares de H. nana pueden ser difíciles de enfocar si no se sube el condensador o no se usa aumento 400x.",
    confirmatoryTests: [
      "Examen microscópico a 400x con diafragma cerrado y ajuste micrométrico fino para visualizar filamentos polares.",
      "Concentración por flotación (Sheather o sulfato de zinc)."
    ],
    pitfalls: [
      "Confundir huevos de Hymenolepis diminuta (más grandes, 70-85 µm, sin filamentos polares) con H. nana.",
      "Asumir que un huevo con cubierta radiada es H. nana: el patrón radiado pertenece a la familia Taeniidae."
    ],
    sources: [
      "CDC DPDx · Hymenolepiasis (2023)",
      "Garcia LS. Diagnostic Medical Parasitology, 6th Edition."
    ]
  },
  {
    id: "comp-eh-vs-ec",
    title: "Entamoeba histolytica vs Entamoeba coli: Patógeno invasor vs Comensal inocuo",
    formA: {
      speciesName: "Entamoeba histolytica",
      stage: "Quiste",
      group: "Ameba patógena invasora"
    },
    formB: {
      speciesName: "Entamoeba coli",
      stage: "Quiste",
      group: "Ameba comensal no patógena"
    },
    clinicalScenario: "Hallazgo de quistes amebianos en coproparasitológico de rutina. Diferenciación crítica para evitar tratamientos antibióticos/amebicidas innecesarios con metronidazol en portadores de amebas comensales inocuas.",
    features: {
      sizeAndShape: {
        a: "10 a 15 µm de diámetro (habitualmente 12-14 µm). Esférico regular.",
        b: "15 a 25 µm de diámetro (habitualmente más grande, hasta 30 µm). Esférico u ovalado.",
        distinctive: true
      },
      wallAndCovering: {
        a: "Pared quística fina, lisa y refringente.",
        b: "Pared quística ligeramente más gruesa y refringente.",
        distinctive: false
      },
      internalContent: {
        a: "Quiste maduro posee típicamente hasta 4 núcleos. Cariosoma central pequeño, fino y simétrico. Cromatina periférica uniforme y fina.",
        b: "Quiste maduro posee típicamente hasta 8 núcleos (ocasionalmente 16). Cariosoma excéntrico, grande e irregular. Cromatina periférica gruesa e irregular.",
        distinctive: true
      },
      distinctiveStructures: {
        a: "Cuerpos o barras cromatoidales con extremos romos y redondeados (en forma de cigarro o habano), presentes en quistes inmaduros.",
        b: "Barras cromatoidales astilladas, con extremos puntiagudos, dentados o deshilachados (en forma de astilla).",
        distinctive: true
      }
    },
    similarities: [
      "Ambos son protozoos que colonizan el colon humano.",
      "Ambos forman quistes esféricos tetranucleados en etapas tempranas de maduración.",
      "Ambos se adquieren por vía fecal-oral mediante agua o alimentos contaminados con quistes."
    ],
    criticalDifferences: [
      "Número de núcleos en quiste maduro: máximo 4 en E. histolytica vs hasta 8 en E. coli.",
      "Posición del cariosoma: céntrico y fino en E. histolytica vs excéntrico y tosco en E. coli.",
      "Morfología de barras cromatoidales: romas redondeadas en E. histolytica vs astilladas en E. coli.",
      "Poder patógeno: E. histolytica es invasora (causa úlceras en botón de camisa y absceso hepático amebiano); E. coli es estrictamente comensal inocua y NO requiere tratamiento."
    ],
    diagnosticLimitations: "Microscopía óptica NO puede distinguir Entamoeba histolytica de Entamoeba dispar o Entamoeba moshkovskii (amebas comensales morfológicamente idénticas). El diagnóstico de certeza de E. histolytica requiere detección de antígeno fecal o PCR multiplex.",
    confirmatoryTests: [
      "Detección de adhesina lectina Gal/GalNAc específica de E. histolytica por ELISA fecal.",
      "PCR en tiempo real para ADN de E. histolytica.",
      "Tinción de tricrómico o hematoxilina férrica para visualización óptima de cromatina nuclear."
    ],
    pitfalls: [
      "Tratar a un paciente asintomático por encontrar quistes de E. coli.",
      "Confundir leucocitos polimorfonucleares en heces diarreicas con quistes amebianos (los leucocitos tienen núcleos polilobulados irregulares sin cariosoma).",
      "Reportar 'Entamoeba histolytica' en base a microscopía óptica sin aclarar el complejo 'E. histolytica / E. dispar'."
    ],
    sources: [
      "CDC DPDx · Amebiasis (2024)",
      "World Health Organization · Amoebiasis Weekly Epidemiological Record"
    ]
  }
];
