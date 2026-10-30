export interface TopicSource {
  documentTitle: string;
  classNumber: string;
  classDate?: string;
  pages?: string;
}

export interface HubTopic {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  bulletPoints: string[];
  clinicalSignificance: string;
  relatedAgentKeys: string[]; // id o pdfId de MICROBIOLOGY_DATA para enlazar fichas
  source: TopicSource;
  status: "revisado" | "en_preparacion";
}

export interface HubSection {
  id: "fundamentos" | "metabolismo_cultivo" | "control_antimicrobianos";
  title: string;
  shortTitle: string;
  badge: string;
  colorScheme: {
    accent: string;
    border: string;
    bg: string;
    text: string;
  };
  overview: string;
  topics: HubTopic[];
}

export const COURSE_SECTIONS_DATA: Record<string, HubSection> = {
  fundamentos: {
    id: "fundamentos",
    title: "1. Fundamentos de la Infección",
    shortTitle: "Fundamentos",
    badge: "Bases Clínicas y Patogenia",
    colorScheme: {
      accent: "#38bdf8",
      border: "border-sky-500/30",
      bg: "bg-sky-500/10",
      text: "text-sky-400"
    },
    overview: "Estudio de las bases biológicas que rigen la interacción huésped-microorganismo: conceptos de patogenicidad, factores de virulencia, mecanismos de evasión inmune y la cadena de transmisión epidemiológica.",
    topics: [
      {
        id: "fund-patogenia-vs-colonizacion",
        title: "Colonización, Infección y Enfermedad Infecciosa",
        subtitle: "Diferenciación conceptual fundamental en microbiología médica",
        summary: "La presencia de microorganismos en superficies epiteliales no es sinónimo de daño. Se distingue estrictamente entre colonización comensal, presencia transitoria, infección subclínica y enfermedad infecciosa manifiesta con daño tisular.",
        bulletPoints: [
          "Colonización: Establecimiento y multiplicación de microorganismos en un nicho anatómico sin provocar respuesta inflamatoria perjudicial ni daño tisular para el huésped.",
          "Patógeno primario: Microorganismo capaz de causar enfermedad en individuos inmunocompetentes con dosis infectivas relativamente bajas.",
          "Patógeno oportunista: Microorganismo con bajo poder patógeno intrínseco que sólo ocasiona enfermedad cuando se alteran las defensas locales o sistémicas del huésped (ej. inmunosupresión, catéteres, disbiosis por antibióticos).",
          "Dosis infectiva 50 (DI50): Número de microorganismos necesarios para causar infección en el 50% de los individuos expuestos."
        ],
        clinicalSignificance: "Previene el error común de tratar con antibióticos la colonización comensal en orofaringe, uretra distal o piel sana, reduciendo la presión de selección de resistencia.",
        relatedAgentKeys: ["b03", "micro-5", "B18"],
        source: {
          documentTitle: "1. Interacción humano-patógeno I: Bacterias y virus",
          classNumber: "DOC-01",
          classDate: "Cotejo de aula verificado",
          pages: "Págs. 14-18 (TM. Felipe Córdova Lagos)"
        },
        status: "revisado"
      },
      {
        id: "fund-factores-virulencia",
        title: "Factores de Virulencia y Patogenia Molecular",
        subtitle: "Estrategias de adherencia, evasión inmunológica y daño tisular",
        summary: "Los determinantes de virulencia son moléculas producidas por el agente que facilitan su colonización, superación de las barreras del huésped y destrucción de tejidos.",
        bulletPoints: [
          "Adherencia: Fimbrias (pili), adhesinas no fímbricas y cápsulas que reconocen receptores celulares específicos con tropismo tisular marcado.",
          "Evasión de la fagocitosis: Cápsulas polisacáridas (S. pneumoniae, N. meningitidis) que impiden el depósito de opsoninas y C3b del complemento; proteasas de IgA secretora.",
          "Supervivencia intracelular: Bloqueo de la fusión fagosoma-lisosoma o escape hacia el citoplasma (M. tuberculosis, Listeria monocytogenes).",
          "Biopelículas (Biofilms): Consorcios microbianos incluidos en una matriz de exopolisacáridos que confieren resistencia mecánica al flujo y protección frente a fagocitos y antibióticos."
        ],
        clinicalSignificance: "La cápsula bacteriana es la base del diseño de vacunas conjugadas altamente eficaces frente a neumococo y meningococo.",
        relatedAgentKeys: ["micro-1", "B02", "B20", "micro-5"],
        source: {
          documentTitle: "1. Interacción humano-patógeno I: Bacterias y virus",
          classNumber: "DOC-01",
          classDate: "Cotejo de aula verificado",
          pages: "Págs. 14-18 (TM. Felipe Córdova Lagos)"
        },
        status: "revisado"
      },
      {
        id: "fund-toxinas-bacterianas",
        title: "Exotoxinas vs. Endotoxinas (LPS)",
        subtitle: "Mecanismos bioquímicos de toxicidad directa y mediada por citocinas",
        summary: "Las toxinas constituyen los principales efectores de daño en múltiples infecciones bacterianas, clasificándose según su estructura, origen y termoestabilidad.",
        bulletPoints: [
          "Endotoxina (LPS / Lípido A): Componente estructural exclusivo de la membrana externa de bacterias Gram negativas. Es liberado tras lisis bacteriana, se une al receptor TLR4 de macrófagos y desencadena una cascada masiva de TNF-alfa, IL-1 e IL-6 que causa hipotensión refractaria y shock séptico.",
          "Exotoxinas: Proteínas solubles sintetizadas y activamente secretadas por bacterias Gram positivas y Gram negativas. Típicamente termolábiles y de alta potencia letal.",
          "Toxinas A-B: La subunidad B se une al receptor celular y permite la internalización de la subunidad A con actividad enzimática tóxica (ej. toxina diftérica, toxina colérica, toxina Shiga).",
          "Superantígenos: Moléculas que unen de forma inespecífica el CMH-II con el receptor TCR sin procesamiento antigénico previo, activando hasta el 20% de los linfocitos T y causando síndrome de shock tóxico (TSST-1 de S. aureus)."
        ],
        clinicalSignificance: "El uso de antibióticos bactericidas en infecciones por Gram negativos de alta carga puede exacerbar transitoriamente la liberación de endotoxinas, requiriendo monitorización hemodinámica estricta.",
        relatedAgentKeys: ["b03", "B09", "B13", "B18"],
        source: {
          documentTitle: "3. Morfología y taxonomía bacteriana",
          classNumber: "DOC-03",
          classDate: "Cotejo de aula pendiente",
          pages: "Fuente pendiente de cotejo"
        },
        status: "revisado"
      }
    ]
  },
  metabolismo_cultivo: {
    id: "metabolismo_cultivo",
    title: "2. Metabolismo, Crecimiento y Cultivo",
    shortTitle: "Metabolismo y Cultivo",
    badge: "Fisiología y Diagnóstico en Laboratorio",
    colorScheme: {
      accent: "#a855f7",
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
      text: "text-purple-400"
    },
    overview: "Fisiología bacteriana, bioenergética según requerimientos gaseosos, cinética del crecimiento en sistemas cerrados y fundamentos de los medios de cultivo y pruebas bioquímicas utilizados en el laboratorio clínico.",
    topics: [
      {
        id: "meta-respiracion-oxigeno",
        title: "Requerimientos de Oxígeno y Bioenergética",
        subtitle: "Clasificación metabólica y enzimas de destoxificación",
        summary: "La presencia de oxígeno condiciona las rutas catabólicas bacterianas y la necesidad de enzimas protectoras frente a especies reactivas de oxígeno (superóxido dismutasa, catalasa y peroxidasa).",
        bulletPoints: [
          "Aerobios estrictos: Requieren O2 molecular como aceptor terminal de electrones; poseen catalasa y superóxido dismutasa (ej. Mycobacterium tuberculosis, Pseudomonas aeruginosa).",
          "Anaerobios estrictos: El O2 resulta letal por carencia de enzimas antioxidantes; obtienen energía por fermentación o respiración anaerobia (ej. Clostridioides difficile, Bacteroides fragilis).",
          "Anaerobios facultativos: Utilizan O2 cuando está disponible mediante respiración aerobia, pero pueden crecer por fermentación en su ausencia (ej. Enterobacterias, Staphylococcus).",
          "Microaerófilos: Requieren concentraciones reducidas de O2 (2% a 10%) y niveles elevados de CO2 para su desarrollo óptimo (ej. Campylobacter jejuni, Helicobacter pylori)."
        ],
        clinicalSignificance: "Explica la necesidad de medios de transporte especiales y jarras anaeróbicas herméticas con generadores químicos para el aislamiento de anaerobios de abscesos profundos.",
        relatedAgentKeys: ["micro-5", "B18", "B14", "B15"],
        source: {
          documentTitle: "7. Metabolismo de bacterias, virus, hongos y parásitos",
          classNumber: "DOC-07",
          classDate: "Cotejo de aula pendiente",
          pages: "Fuente pendiente de cotejo"
        },
        status: "revisado"
      },
      {
        id: "meta-curva-crecimiento",
        title: "Cinética de la Curva de Crecimiento Bacteriano",
        subtitle: "Las 4 fases del ciclo celular en cultivo líquido discontinuo",
        summary: "En un sistema cerrado con volumen y nutrientes finitos, una población bacteriana sigue una curva temporal reproducible con 4 fases de alta relevancia diagnóstica y terapéutica.",
        bulletPoints: [
          "1. Fase de adaptación o latencia (Lag): No hay división neta; síntesis activa de enzimas, ARN y proteínas necesarias para metabolizar el nuevo medio ambiente.",
          "2. Fase exponencial o logarítmica (Log): Multiplicación a velocidad máxima constante con tiempo de duplicación característico; las bacterias se encuentran en su estado metabólicamente más uniforme y son máximamente susceptibles a antimicrobianos betalactámicos.",
          "3. Fase estacionaria: La tasa de división se iguala con la tasa de muerte celular debido a la depleción de nutrientes esenciales y la acumulación de metabolitos ácidos/tóxicos; inicio de esporulación en especies competentes.",
          "4. Fase de declinación o muerte: La lisis y muerte celular superan a la replicación de forma logarítmica descendente."
        ],
        clinicalSignificance: "Los antibióticos bactericidas que inhiben la síntesis de pared (como penicilinas y cefalosporinas) sólo son eficaces sobre poblaciones bacterianas en fase logarítmica activa.",
        relatedAgentKeys: ["b03", "B09"],
        source: {
          documentTitle: "8. Fisiología, estructura y función celular en bacterias",
          classNumber: "DOC-08",
          classDate: "Cotejo de aula pendiente",
          pages: "Fuente pendiente de cotejo"
        },
        status: "revisado"
      },
      {
        id: "meta-medios-cultivo-bioquimica",
        title: "Medios de Cultivo y Pruebas Bioquímicas en el Laboratorio",
        subtitle: "Principios de selección, diferenciación e identificación fenotípica",
        summary: "Los medios de cultivo incorporan nutrientes específicos e indicadores cromogénicos o inhibidores para aislar y diferenciar patógenos a partir de muestras clínicas polimicrobianas.",
        bulletPoints: [
          "Agar Sangre de cordero al 5%: Medio enriquecido y diferencial; permite clasificar estreptococos según hemólisis: alfa (halo verdoso / lisis parcial), beta (halo transparente / lisis completa) y gamma (sin hemólisis).",
          "Agar Chocolate: Agar sangre desnaturalizado por calentamiento que libera factores X (hemina) y V (NAD), indispensables para el desarrollo de Haemophilus influenzae y Neisseria.",
          "Agar MacConkey: Medio selectivo y diferencial para Gram negativos entéricos; contiene sales biliares y cristal violeta que inhiben Gram positivos; el indicador rojo neutro diferencia fermentadores de lactosa (colonias rosadas como E. coli) de no fermentadores (colonias incoloras como Salmonella y Shigella).",
          "Prueba de la Catalasa (H2O2 al 3%): Formación inmediata de burbujas de O2 que diferencia rápidamente Staphylococcus (+) de Streptococcus (-).",
          "Prueba de la Coagulasa: Capacidad de coagular plasma citratado que diferencia a Staphylococcus aureus (coagulasa positivo) de estafilococos coagulasa negativos comensales."
        ],
        clinicalSignificance: "Constituye la columna vertebral del diagnóstico bacteriológico clásico de confirmación y el paso previo indispensable para el montaje del antibiograma.",
        relatedAgentKeys: ["micro-1", "B04", "B09", "B12", "b03"],
        source: {
          documentTitle: "7. Metabolismo de bacterias, virus, hongos y parásitos",
          classNumber: "DOC-07",
          classDate: "Cotejo de aula pendiente",
          pages: "Fuente pendiente de cotejo"
        },
        status: "revisado"
      }
    ]
  },
  control_antimicrobianos: {
    id: "control_antimicrobianos",
    title: "3. Control y Antimicrobianos",
    shortTitle: "Control y Fármacos",
    badge: "Esterilización, Farmacología y Resistencia",
    colorScheme: {
      accent: "#f59e0b",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      text: "text-amber-400"
    },
    overview: "Mecanismos de control físico y químico para prevención de infecciones intrahospitalarias, familias farmacológicas de antimicrobianos según diana molecular y los mecanismos de resistencia bacteriana de mayor relevancia médica.",
    topics: [
      {
        id: "ctrl-esterilizacion-desinfeccion",
        title: "Esterilización, Desinfección y Antisepsia",
        subtitle: "Destrucción microbiana según niveles de Spaulding en el entorno clínico",
        summary: "La correcta selección del método de control depende del riesgo de infección del instrumental y de la viabilidad de esporas bacterianas resistentes.",
        bulletPoints: [
          "Esterilización: Destrucción total de toda forma de vida microbiana, incluyendo esporas bacterianas. El estándar hospitalario es el calor húmedo en autoclave (121 °C por 20 min a 1 atm de sobrepresión); para materiales termosensibles se emplea óxido de etileno o plasma de peróxido de hidrógeno.",
          "Desinfección de Alto Nivel (DAN): Destruye todos los microorganismos excepto un número elevado de esporas bacterianas (glutaraldehído al 2%, ácido peracético); aplicada a instrumental semicrítico como endoscopios.",
          "Desinfección de Nivel Intermedio y Bajo: Inactiva bacterias vegetativas, hongos y la mayoría de los virus (alcohol al 70%, hipoclorito de sodio al 0.1-0.5%, amonios cuaternarios); para superficies de contacto.",
          "Antisepsia: Aplicación de agentes químicos no tóxicos sobre tejidos vivos (piel o mucosas) para reducir la carga microbiana antes de procedimientos invasivos (clorhexidina al 2% en alcohol o povidona yodada)."
        ],
        clinicalSignificance: "El alcohol gel no esteriliza ni inactiva las esporas de Clostridioides difficile, siendo obligatorio el lavado con agua y jabón corriente ante pacientes con diarrea asociada a antibióticos.",
        relatedAgentKeys: ["B18", "b03", "micro-5"],
        source: {
          documentTitle: "9. Métodos para eliminar microorganismos",
          classNumber: "DOC-09",
          classDate: "Cotejo de aula pendiente",
          pages: "Fuente pendiente de cotejo"
        },
        status: "revisado"
      },
      {
        id: "ctrl-familias-antimicrobianas",
        title: "Familias de Antimicrobianos y Dianas Celulares",
        subtitle: "Clasificación farmacodinámica y espectro de acción",
        summary: "Los antibióticos aprovechan diferencias estructurales entre la célula procariota y eucariota para ejercer toxicidad selectiva sobre dianas metabólicas esenciales.",
        bulletPoints: [
          "Inhibidores de pared celular (Bactericidas): Betalactámicos (penicilinas, cefalosporinas, carbapenémicos) que se unen a las PBP e inhiben la transpeptidación del peptidoglicano; Glicopéptidos (vancomicina) que bloquean la adición de D-Ala-D-Ala en Gram positivos.",
          "Inhibidores de síntesis proteica (Subunidad 30S): Aminoglucósidos (gentamicina, amikacina) con acción bactericida dependiente de concentración; Tetraciclinas (doxiciclina) bacteriostáticas.",
          "Inhibidores de síntesis proteica (Subunidad 50S): Macrólidos (claritromicina, azitromicina) y Lincosamidas (clindamicina), bacteriostáticos que bloquean la translocación del péptido naciente.",
          "Inhibidores de la replicación del ADN: Fluoroquinolonas (ciprofloxacino, levofloxacino) que inhiben la ADN girasa (topoisomerasa II) y topoisomerasa IV.",
          "Inhibidores de la síntesis del folato: Trimetoprim-Sulfametoxazol (Cotrimoxazol), inhibición sinérgica secuencial de la síntesis de tetrahidrofolato."
        ],
        clinicalSignificance: "Los betalactámicos no tienen actividad sobre bacterias atípicas carentes de pared celular de peptidoglicano clásico como Mycoplasma pneumoniae o Chlamydia trachomatis.",
        relatedAgentKeys: ["micro-1", "b03", "B09", "B17", "B08"],
        source: {
          documentTitle: "10-Antimicrobianos",
          classNumber: "DOC-10",
          classDate: "Cotejo de aula pendiente",
          pages: "Fuente pendiente de cotejo"
        },
        status: "revisado"
      },
      {
        id: "ctrl-mecanismos-resistencia",
        title: "Mecanismos de Resistencia Bacteriana a Antimicrobianos",
        subtitle: "Las 4 estrategias moleculares de evasión a los fármacos",
        summary: "La resistencia antimicrobiana emerge por mutaciones cromosómicas espontáneas o adquisición de plásmidos y transposones mediante transferencia genética horizontal.",
        bulletPoints: [
          "1. Inactivación enzimática: Betalactamasas clásicas, Betalactamasas de Espectro Extendido (BLEE, inactivan cefalosporinas de 3.ª generación) y Carbapenemasas (KPC, NDM, OXA-48, confieren resistencia a casi todos los betalactámicos).",
          "2. Modificación del sitio blanco (diana): Gen mecA en Staphylococcus aureus resistente a meticilina (SAMR / MRSA) que codifica una PBP2a con bajísima afinidad por betalactámicos; genes vanA en Enterococcus con sustitución de D-Ala-D-Ala por D-Ala-D-Lac resistente a vancomicina.",
          "3. Bombas de eflujo activo: Complejos de transporte de membrana que expulsan activamente el antibiótico al medio extracelular (resistencia a tetraciclinas, fluoroquinolonas y macrólidos).",
          "4. Disminución de la permeabilidad de membrana: Pérdida o cierre de porinas específicas en la membrana externa de Gram negativos (ej. pérdida de OprD en Pseudomonas aeruginosa frente a carbapenémicos)."
        ],
        clinicalSignificance: "Identificar fenotipos BLEE o carbapenemasas en el laboratorio alerta de inmediato al comité de infecciones IAAS para aplicar aislamiento de contacto estricto.",
        relatedAgentKeys: ["b03", "B10", "micro-5", "B22"],
        source: {
          documentTitle: "10-Antimicrobianos",
          classNumber: "DOC-10",
          classDate: "Cotejo de aula pendiente",
          pages: "Fuente pendiente de cotejo"
        },
        status: "revisado"
      }
    ]
  }
};
