import { ParasitologyExercise } from "./types";

/**
 * CASOS Y EJERCICIOS EDUCATIVOS DE PARASITOLOGÍA
 * Diseñados para autoevaluación formativa interactiva.
 * Identificados explícitamente como casos simulados y ejercicios pedagógicos.
 */
export const PARASITOLOGY_EXERCISES: ParasitologyExercise[] = [
  {
    id: "ej-01-reconocimiento-scolex",
    title: "Ejercicio 1: Reconocimiento estructural de cestodos",
    category: "reconocimiento_estructuras",
    categoryLabel: "Reconocimiento de estructuras",
    isSimulatedCase: false,
    difficulty: "Básico",
    question: "Durante la inspección microscópica del órgano de fijación anterior (escólex) de un cestodo intestinal recuperado de un paciente, observas 4 ventosas circulares y, en el ápice, un rostelo prominente provisto de una doble corona de ganchos quitinosos. ¿A qué especie corresponde este hallazgo morfológico?",
    relatedSpeciesId: "p25-taenia-solium",
    options: [
      {
        id: "opt-a",
        text: "Taenia solium (escólex armado)",
        isCorrect: true,
        explanation: "Correcto. Taenia solium se caracteriza inequívocamente por su escólex armado: cuenta con 4 ventosas hemisféricas y un rostelo saliente con una doble hilera concéntrica de 22 a 32 ganchos quitinosos."
      },
      {
        id: "opt-b",
        text: "Taenia saginata (escólex inerme)",
        isCorrect: false,
        explanation: "Incorrecto. Taenia saginata posee un escólex cuadrangular con 4 ventosas pero es estrictamente inerme: carece por completo de rostelo y no tiene corona de ganchos."
      },
      {
        id: "opt-c",
        text: "Diphyllobothrium latum",
        isCorrect: false,
        explanation: "Incorrecto. Diphyllobothrium latum (cestodo de los peces) carece de ventosas circulares y ganchos; su órgano de fijación presenta dos hendiduras longitudinales de succión llamadas bothrias."
      },
      {
        id: "opt-d",
        text: "Hymenolepis diminuta",
        isCorrect: false,
        explanation: "Incorrecto. Hymenolepis diminuta es inerme y su escólex es rudimentario, a diferencia de Hymenolepis nana que sí posee rostelo armado pero es de dimensiones microscópicas mucho menores."
      }
    ],
    generalFeedback: "La presencia de rostelo con ganchos quitinosos es el rasgo definitorio del escólex armado de Taenia solium, elemento fundamental para su anclaje a la mucosa del yeyuno.",
    diagnosticPearl: "Mnemotecnia médica: Taenia Solium = 'Sol con rayos' (rostelo con ganchos que asemejan los rayos del sol). Taenia Saginata = 'Sola' o 'Sin armas' (inerme, sin ganchos).",
    source: "CDC DPDx - Laboratory Identification of Parasites: Taeniasis (2023); OPS Cestodiasis humanas."
  },
  {
    id: "ej-02-comparacion-proglotides",
    title: "Ejercicio 2: Comparación de proglótides grávidos",
    category: "comparacion_morfologica",
    categoryLabel: "Comparación de formas parecidas",
    isSimulatedCase: false,
    difficulty: "Intermedio",
    question: "Un tecnólogo médico realiza una inyección de tinta china en el poro genital de un proglótide grávido expulsado por un paciente. Al examinarlo bajo la lupa diagnóstica, cuenta 9 ramas uterinas principales a cada lado del tallo medial central. ¿Cuál es la conclusión diagnóstica y su implicancia clínica?",
    relatedSpeciesId: "p25-taenia-solium",
    options: [
      {
        id: "opt-a",
        text: "Diagnóstico: Taenia solium. Implicancia: El paciente excreta huevos infectantes para humanos y debe tamizarse a los contactos intradomiciliarios por riesgo de cisticercosis.",
        isCorrect: true,
        explanation: "Correcto. El rango de 7 a 13 ramas uterinas principales laterales por lado es patognomónico de Taenia solium. Dado que los portadores de T. solium pueden infectar a sus convivientes o autoinfectarse por vía fecal-oral causando neurocisticercosis, el caso exige tratamiento inmediato con precauciones y estudio del entorno."
      },
      {
        id: "opt-b",
        text: "Diagnóstico: Taenia saginata. Implicancia: No existe riesgo de cisticercosis en contactos, solo requiere tenicida ambulatorio.",
        isCorrect: false,
        explanation: "Incorrecto. Taenia saginata presenta entre 15 y 30 ramas uterinas principales laterales, profusamente dicotómicas. Un recuento de 9 ramas descarta T. saginata."
      },
      {
        id: "opt-c",
        text: "Diagnóstico no concluyente. Implicancia: Se requiere esperar un examen coproparasitológico para contar huevos.",
        isCorrect: false,
        explanation: "Incorrecto. La morfología del proglótide grávido con tinta china es concluyente. Por el contrario, el examen coproparasitológico NO permite distinguir T. solium de T. saginata porque los huevos son indistinguibles."
      },
      {
        id: "opt-d",
        text: "Diagnóstico: Dipylidium caninum. Implicancia: El paciente adquirió la infección por ingestión de pulgas de perros.",
        isCorrect: false,
        explanation: "Incorrecto. Los proglótides de Dipylidium caninum tienen aspecto de 'semilla de pepino' o grano de arroz, con dos poros genitales laterales bilaterales y paquetes de cápsulas ovígeras en su interior, no un útero con ramas ramificadas."
      }
    ],
    generalFeedback: "El recuento de ramas uterinas en proglótides grávidos diafanizados es el método estándar de oro en parasitología morfológica para clasificar la especie de Taenia.",
    diagnosticPearl: "Regla del 14: Menos de 14 ramas uterinas (7-13) = Taenia solium. 14 o más ramas uterinas (15-30) = Taenia saginata.",
    source: "CDC DPDx - Laboratory Identification of Parasitic Diseases of Public Health Concern (Taeniasis diagnosis, 2023)."
  },
  {
    id: "ej-03-ordenamiento-ciclo",
    title: "Ejercicio 3: Ordenamiento secuencial del ciclo de la cisticercosis humana",
    category: "ordenamiento_ciclo",
    categoryLabel: "Ordenamiento de ciclos de vida",
    isSimulatedCase: false,
    difficulty: "Intermedio",
    question: "Ordena cronológicamente la secuencia biológica que culmina en NEUROCISTICERCOSIS en un ser humano:",
    relatedSpeciesId: "p25-taenia-solium",
    options: [
      {
        id: "opt-seq-correct",
        text: "1. Ingestión de huevos viables eliminados en heces humanas -> 2. Eclosión y liberación de la oncosfera en duodeno -> 3. Penetración activa de la mucosa intestinal y paso a vénulas mesentéricas -> 4. Diseminación hematógena cruzando la barrera hematoencefálica -> 5. Enquistamiento como Cysticercus cellulosae en parénquima cerebral.",
        isCorrect: true,
        explanation: "Secuencia exacta y correcta. La neurocisticercosis requiere la ingesta de huevos de origen fecal humano, cuya oncosfera migra por vía sanguínea al SNC donde se enquista como larva (cisticerco)."
      },
      {
        id: "opt-seq-wrong1",
        text: "1. Ingestión de carne de cerdo con cisticercos -> 2. El cisticerco migra desde el estómago al cerebro -> 3. Enquistamiento cerebral.",
        isCorrect: false,
        explanation: "Error conceptual grave. La ingestión de cisticercos en carne de cerdo produce TENIASIS INTESTINAL (la solitaria adulta en el intestino). El cisticerco ingerido nunca migra al cerebro del comensal."
      },
      {
        id: "opt-seq-wrong2",
        text: "1. Picadura del mosquito intermediario -> 2. Inyección de larvas filiformes -> 3. Migración a ventrículos cerebrales.",
        isCorrect: false,
        explanation: "Incorrecto. T. solium no tiene transmisión vectorial por artrópodos; su transmisión es oral fecal/carnívora."
      },
      {
        id: "opt-seq-wrong3",
        text: "1. Inhalación de esporas -> 2. Colonización pulmonar -> 3. Embolia séptica cerebral.",
        isCorrect: false,
        explanation: "Incorrecto. Esta secuencia corresponde a micosis fúngicas (ej. Criptococosis), no a helmintos cestodos."
      }
    ],
    generalFeedback: "Para padecer cisticercosis humana o neurocisticercosis, el ser humano debe actuar como hospedador intermediario accidental al ingerir huevos embrionados (vía fecal-oral), nunca carne con cisticercos.",
    diagnosticPearl: "El portador de teniasis intestinal es quien contagia la cisticercosis (a través de sus heces), incluso a vegetarianos estrictos mediante hortalizas o manipuladores de alimentos infectados.",
    source: "OMS / OPS - Control y prevención de la teniasis y neurocisticercosis por Taenia solium (2020)."
  },
  {
    id: "ej-04-seleccion-diagnostica",
    title: "Ejercicio 4: Selección razonada de métodos diagnósticos",
    category: "seleccion_diagnostica",
    categoryLabel: "Selección razonada de métodos diagnósticos",
    isSimulatedCase: true,
    difficulty: "Avanzado",
    clinicalContext: "[Caso educativo simulado] Paciente de 34 años, agricultor de zona rural, consulta en el servicio de urgencias por una primera crisis epiléptica tónico-clónica generalizada. No tiene antecedentes médicos previos.",
    question: "¿Por qué un examen coproparasitológico negativo NO descarta neurocisticercosis en este paciente, y qué batería diagnóstica debe solicitarse prioritariamente?",
    relatedSpeciesId: "p25-taenia-solium",
    options: [
      {
        id: "opt-a",
        text: "Porque la neurocisticercosis es causada por la fase larvaria tisular, mientras que el coproparasitológico solo busca adultos en el lumen intestinal (presentes en menos del 25% de los pacientes con cisticercosis). Estudio prioritario: Resonancia Magnética (RM) o TC cerebral contrastada + Serología EITB (Western blot).",
        isCorrect: true,
        explanation: "Correcto y completo. La neurocisticercosis es una parasitosis tisular. Un coproparasitológico negativo es la regla en la gran mayoría de pacientes con neurocisticercosis (solo una minoría tiene teniasis concomitante por autoinfección). El estudio de elección es la neuroimagen (RM cerebral de preferencia, o TC) complementada con serología por Western Blot (EITB)."
      },
      {
        id: "opt-b",
        text: "Porque el coproparasitológico solo es útil si se solicita con tinción de Ziehl-Neelsen para buscar ooquistes ácido-alcohol resistentes.",
        isCorrect: false,
        explanation: "Incorrecto. Ziehl-Neelsen modificada se utiliza para coccidios intestinales (Cryptosporidium, Cyclospora, Cystoisospora), no para Taenia ni para cisticercosis."
      },
      {
        id: "opt-c",
        text: "Porque se requiere una biopsia cerebral inmediata antes de cualquier estudio de imágenes.",
        isCorrect: false,
        explanation: "Incorrecto. La biopsia cerebral es invasiva y solo se reserva para casos excepcionales con dudas diagnósticas tumorales. La neuroimagen no invasiva (RM/TC) suele ser diagnóstica por sí sola según los criterios de Del Brutto."
      },
      {
        id: "opt-d",
        text: "Porque los huevos de Taenia solo se detectan en orina durante la noche.",
        isCorrect: false,
        explanation: "Incorrecto. Los huevos de Taenia no se excretan en orina (eso corresponde a Schistosoma haematobium)."
      }
    ],
    generalFeedback: "Diferenciar la biología de la infección intestinal (detectable en heces) de la infección tisular parenquimatosa (detectable por imágenes y serología) es un objetivo fundamental de la formación médica.",
    diagnosticPearl: "En neuroimagen, el 'signo del punto en el hoyo' (quiste con nódulo mural excéntrico que representa el escólex) es patognomónico de neurocisticercosis en RM.",
    source: "Del Brutto OH, et al. Diagnostic criteria for human neurocysticercosis: 2017 revised consensus guidelines. J Neurol Sci 2017."
  },
  {
    id: "ej-05-caso-clinico",
    title: "Ejercicio 5: Interpretación de caso clínico simulado",
    category: "caso_clinico_simulado",
    categoryLabel: "Interpretación de casos breves",
    isSimulatedCase: true,
    difficulty: "Avanzado",
    clinicalContext: "[Caso educativo simulado] Paciente de 28 años refiere que desde hace 3 semanas observa la salida de 'fragmentos blancos como fideos planos' en sus deposiciones que se mueven de forma activa en la taza del inodoro. Trae al consultorio un frasco con dos segmentos. Tras aclaramiento con tinta china, se cuentan 22 ramas uterinas laterales a cada lado del tronco central. El paciente vive en Temuco y consume asados de vacuno con frecuencia.",
    question: "Con base en la morfología observada y el cuadro clínico, ¿cuál es el diagnóstico definitivo, el tratamiento de elección y la indicación sobre el riesgo de cisticercosis?",
    relatedSpeciesId: "p26-taenia-saginata",
    options: [
      {
        id: "opt-a",
        text: "Diagnóstico: Teniasis por Taenia saginata. Tratamiento: Praziquantel 5-10 mg/kg dosis única oral. Riesgo: Tranquilizar al paciente informando que Taenia saginata NO produce cisticercosis humana.",
        isCorrect: true,
        explanation: "Respuesta correcta y completa. El recuento de 22 ramas uterinas principales (> 14) junto con la marcada motilidad activa confirman Taenia saginata (adquirida por carne de vacuno con cisticercos). El tratamiento de primera línea es Praziquantel oral en dosis única. A diferencia de T. solium, T. saginata no causa cisticercosis en humanos, lo que brinda gran tranquilidad clínica al paciente y su familia."
      },
      {
        id: "opt-b",
        text: "Diagnóstico: Neurocisticercosis por Taenia solium. Tratamiento: Hospitalización urgente para iniciar corticoides y albendazol endovenoso.",
        isCorrect: false,
        explanation: "Incorrecto. La morfología con 22 ramas corresponde a T. saginata, no a T. solium. Además el paciente no presenta síntomas neurológicos ni se diagnostica neurocisticercosis por fragmentos en heces."
      },
      {
        id: "opt-c",
        text: "Diagnóstico: Ascariasis intestinal. Tratamiento: Mebendazol 100 mg cada 12 horas por 3 días.",
        isCorrect: false,
        explanation: "Incorrecto. Ascaris lumbricoides es un nematodo cilíndrico de 15 a 35 cm, no plano ni segmentado en proglótides con ramas uterinas."
      },
      {
        id: "opt-d",
        text: "Diagnóstico: Teniasis por Taenia solium. Tratamiento: Cirugía laparoscópica abdominal exploratoria.",
        isCorrect: false,
        explanation: "Incorrecto. Las 22 ramas uterinas descartan T. solium. La teniasis intestinal se trata médicamente por vía oral, nunca con cirugía abdominal salvo complicaciones mecánicas excepcionales."
      }
    ],
    generalFeedback: "Este caso ilustra cómo el recuento de ramas uterinas permite resolver la incertidumbre clínica y evitar alarmas innecesarias sobre cisticercosis cuando el agente es Taenia saginata.",
    diagnosticPearl: "Taenia saginata suele ser más sintomática en cuanto a la sensación de migración del proglótide por el ano debido a su poderosa musculatura, mientras que T. solium se elimina pasivamente sin tanta motilidad independiente.",
    clinicalWarning: "Ejercicio formativo para desarrollo de criterio clínico. En la práctica real, verifique siempre las guías terapéuticas locales y contraindicaciones farmacológicas en embarazadas.",
    source: "MINSAL Chile - Norma General Técnica sobre Vigilancia y Control de Teniasis y Cisticercosis; CDC DPDx."
  }
];
