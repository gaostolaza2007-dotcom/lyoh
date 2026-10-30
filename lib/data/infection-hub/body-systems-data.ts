import { RegionId } from "@/components/MedStudyAnatomy";

export interface SystemInfection {
  id: string;
  syndrome: string;
  relatedAgents: {
    name: string;
    stableId?: string; // id o pdfId en MICROBIOLOGY_DATA si existe
    taxonomicGroup: "bacteria" | "virus" | "hongo" | "parasito";
    role: "etiologia_principal" | "etiologia_secundaria" | "oportunista";
  }[];
  clinicalManifestations: string;
  transmission: string;
  specimens: string; // Tipo de muestra biológica requerida
  identificationMethods: string; // Gram, cultivo, PCR, serología, etc.
  prevention: string;
  sourceDoc?: {
    title: string;
    classCode?: string;
    pages?: string;
  };
  reviewStatus: "revisado_fuente" | "contenido_en_preparacion";
}

export interface BodySystemDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  colorScheme: {
    accent: string;
    border: string;
    bg: string;
    text: string;
  };
  // Relación explícita con las regiones de microbiota del explorador 3D / catálogo
  microbiomeRegionIds: RegionId[];
  // Diferenciación fisiológica obligatoria
  hasResidentMicrobiome: boolean;
  sterilityAndPhysiologicalContext: string;
  infections: SystemInfection[];
}

export const BODY_SYSTEMS_DATA: BodySystemDefinition[] = [
  {
    id: "gastrointestinal",
    name: "Sistema Gastrointestinal y Digestivo",
    shortName: "Digestivo",
    description: "Comprende desde la cavidad oral hasta el recto. Es el nicho con mayor biomasa y diversidad microbiana del cuerpo humano.",
    colorScheme: {
      accent: "#10b981",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400"
    },
    microbiomeRegionIds: ["mouth", "stomach", "small_intestine", "colon"],
    hasResidentMicrobiome: true,
    sterilityAndPhysiologicalContext: "El lumen gastrointestinal alberga microbiota comensal densa que madura el sistema inmune y produce ácidos grasos de cadena corta. Sin embargo, el peritoneo, la vía biliar proximal y la pared transmural profunda son fisiológicamente estériles.",
    infections: [
      {
        id: "inf-gea",
        syndrome: "Gastroenteritis aguda y diarrea inflamatoria / enteroinvasiva",
        relatedAgents: [
          { name: "Salmonella enterica serovar Enteritidis", stableId: "B16", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Shigella sonnei", stableId: "B17", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Campylobacter jejuni", stableId: "B18", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Escherichia coli", stableId: "B10", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Rotavirus A", stableId: "V26", taxonomicGroup: "virus", role: "etiologia_principal" }
        ],
        clinicalManifestations: "Diarrea acuosa o con mucosidad y estrías sanguinolentas (disentería), fiebre, cólicos abdominales intensos, náuseas, vómitos y deshidratación hidroelectrolítica.",
        transmission: "Fecal-oral mediante ingestión de agua o alimentos contaminados (aves mal cocidas, lácteos no pasteurizados, huevos) o contacto directo persona a persona.",
        specimens: "Deposición fresca no contaminada con orina, hisopado rectal con medio de transporte Cary-Blair.",
        identificationMethods: "Examen coprológico (leucocitos fecales, reacción inflamatoria), coprocultivo en medios selectivos y diferenciales (Agar MacConkey, Agar XLD, Agar SS, Campy-agar a 42 °C), paneles moleculares PCR múltiple entérica.",
        prevention: "Cocción completa de alimentos, consumo de agua potable, lavado estricto de manos, cadena de frío y vacunación infantil contra rotavirus.",
        sourceDoc: { title: "18. Infecciones gastrointestinales.pdf", classCode: "Doc 18", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-cdiff",
        syndrome: "Colitis pseudomembranosa asociada a antimicrobianos",
        relatedAgents: [
          { name: "Clostridioides difficile", stableId: "B32", taxonomicGroup: "bacteria", role: "etiologia_principal" }
        ],
        clinicalManifestations: "Diarrea profusa acuosa fétida tras uso reciente de antibióticos (clindamicina, cefalosporinas, fluoroquinolonas), leucocitosis marcada (>15.000/μL), dolor en hipogastrio, megacolon tóxico en cuadros graves.",
        transmission: "Ingestión de esporas bacterianas resistentes en ambientes hospitalarios o por manos del personal de salud.",
        specimens: "Deposición diarreica líquida no formada (las muestras sólidas no deben procesarse).",
        identificationMethods: "Detección combinada: glutamato deshidrogenasa (GDH) rápida más enzimoinmunoanálisis para toxinas A y B; confirmación por PCR para gen de toxina tcdB.",
        prevention: "Uso racional y restringido de antimicrobianos (PROA), lavado de manos con agua y jabón (el alcohol gel no destruye las esporas), aislamiento de contacto y desinfección con hipoclorito.",
        sourceDoc: { title: "18. Infecciones gastrointestinales.pdf", classCode: "Doc 18", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-hpylori",
        syndrome: "Gastritis crónica activa y enfermedad ulceropéptica",
        relatedAgents: [
          { name: "Helicobacter pylori", stableId: "B20", taxonomicGroup: "bacteria", role: "etiologia_principal" }
        ],
        clinicalManifestations: "Dispepsia ulcerosa, dolor urente epigástrico postprandial, saciedad precoz, pirosis; factor de riesgo etiológico mayor para adenocarcinoma gástrico y linfoma MALT.",
        transmission: "Fecal-oral y oral-oral, típicamente adquirida durante la infancia en contextos de hacinamiento.",
        specimens: "Biopsia de mucosa antral gástrica obtenida por endoscopía digestiva alta, muestra de aire espirado, deposición para antígeno.",
        identificationMethods: "Test rápido de ureasa en biopsia antral, histología con tinción de Giemsa/Warthin-Starry, prueba de urea en aire espirado con carbono-13/14, antígeno fecal monoclonal.",
        prevention: "Mejora de condiciones de saneamiento ambiental, agua potable y tratamiento antibiótico erradicador de primera línea guiado.",
        sourceDoc: { title: "18. Infecciones gastrointestinales.pdf", classCode: "Doc 18", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      }
    ]
  },
  {
    id: "respiratory",
    name: "Sistema Respiratorio",
    shortName: "Respiratorio",
    description: "Comprende vías aéreas superiores (fosas nasales, faringe) y vías inferiores (laringe, tráquea, árbol bronquial y alvéolos pulmonares).",
    colorScheme: {
      accent: "#06b6d4",
      border: "border-cyan-500/30",
      bg: "bg-cyan-500/10",
      text: "text-cyan-400"
    },
    microbiomeRegionIds: ["nose"],
    hasResidentMicrobiome: true,
    sterilityAndPhysiologicalContext: "El vestíbulo nasal anterior alberga microbiota comensal cutánea y mucosa (Staphylococcus, Corynebacterium). En marcado contraste, la tráquea distal, los bronquiolos y el parénquima alveolar son fisiológicamente estériles debido a la barrera mucociliar y el surfactante; la colonización en estas áreas indica fracaso defensivo.",
    infections: [
      {
        id: "inf-nac",
        syndrome: "Neumonía adquirida en la comunidad (NAC) típica y atípica",
        relatedAgents: [
          { name: "Streptococcus pneumoniae", stableId: "B01", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Haemophilus influenzae", stableId: "B23", taxonomicGroup: "bacteria", role: "etiologia_secundaria" },
          { name: "Mycoplasma pneumoniae", stableId: "B28", taxonomicGroup: "bacteria", role: "etiologia_secundaria" },
          { name: "Legionella pneumophila", stableId: "B29", taxonomicGroup: "bacteria", role: "etiologia_secundaria" }
        ],
        clinicalManifestations: "Fiebre con calofríos súbitos, tos productiva con esputo herrumbroso o mucopurulento, dolor pleurítico tipo puntada de costado, disnea, crépitos y condensación a la auscultación pulmonar.",
        transmission: "Inhalación de aerosoles respiratorios o microaspiración de secreciones orofaríngeas en pacientes con reflejo deglutorio o defensas comprometidas.",
        specimens: "Expectoración profunda representativa (criterios de Murray-Washington: <10 células epiteliales y >25 leucocitos por campo de 100x), aspirado traqueal, líquido pleural o hemocultivos.",
        identificationMethods: "Tinción de Gram de esputo (diplococos Gram positivos lanceolados para neumococo), cultivo en agar sangre con optoquina, antígeno urinario para S. pneumoniae y L. pneumophila serogrupo 1, PCR múltiple respiratoria.",
        prevention: "Vacunación antineumocócica conjugada y polisacárida en adultos mayores y grupos de riesgo, cesación tabáquica, vacuna anual contra la influenza.",
        sourceDoc: { title: "14. Infecciones del sistema respiratorio inferior.pdf", classCode: "Doc 14", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-faringo",
        syndrome: "Faringoamigdalitis aguda estreptocócica",
        relatedAgents: [
          { name: "Streptococcus pyogenes", stableId: "B06", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Virus de Epstein Barr", stableId: "V17", taxonomicGroup: "virus", role: "etiologia_secundaria" },
          { name: "Adenovirus humanos", stableId: "V08", taxonomicGroup: "virus", role: "etiologia_secundaria" }
        ],
        clinicalManifestations: "Odinofagia súbita intensa, hiperemia faríngea con exudado pultáceo amigdalino, adenopatías cervicales anteriores sensibles, fiebre alta, ausencia de tos y coriza (criterios de Centor).",
        transmission: "Gotitas respiratorias emitidas al toser, hablar o estornudar, contacto estrecho intradomiciliario o escolar.",
        specimens: "Tórula faríngea frotando enérgicamente ambas amígdalas y la pared faríngea posterior, evitando tocar lengua y mucosa yugal.",
        identificationMethods: "Test rápido de detección antigénica para Estreptococo grupo A (RADT) y cultivo en Agar Sangre de cordero al 5% (colonias betahemolíticas sensibles a bacitracina).",
        prevention: "Tratamiento antibiótico oportuno con penicilina o amoxicilina para prevenir la fiebre reumática aguda y complicaciones supurativas locales (absceso periamigdalino).",
        sourceDoc: { title: "13. Infecciones del sistema respiratorio superior.pdf", classCode: "Doc 13", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      }
    ]
  },
  {
    id: "tegumentary",
    name: "Sistema Tegumentario y Piel",
    shortName: "Piel y Anexos",
    description: "Cubre toda la superficie externa corporal, folículos pilosos, glándulas sebáceas/sudoríparas y el conducto auditivo externo.",
    colorScheme: {
      accent: "#a855f7",
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
      text: "text-purple-400"
    },
    microbiomeRegionIds: ["skin", "ear"],
    hasResidentMicrobiome: true,
    sterilityAndPhysiologicalContext: "El estrato córneo posee comunidades bacterianas y fúngicas adaptadas a microambientes específicos (Cutibacterium acnes en zonas sebáceas, Staphylococcus epidermidis en zonas secas, Corynebacterium en pliegues húmedos). La dermis profunda, la fascia y el tejido celular subcutáneo son estrictamente estériles.",
    infections: [
      {
        id: "inf-celulitis",
        syndrome: "Celulitis, erisipela e infecciones bacterianas dermoepidérmicas",
        relatedAgents: [
          { name: "Streptococcus pyogenes", stableId: "B06", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Staphylococcus aureus", stableId: "B03", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Pseudomonas aeruginosa", stableId: "B02", taxonomicGroup: "bacteria", role: "oportunista" }
        ],
        clinicalManifestations: "Eritema con calor local, aumento de volumen, dolor y bordes definidos (erisipela) o difusos (celulitis); presencia de linfangitis o flictenas en formas más severas.",
        transmission: "Inoculación directa tras pérdida de continuidad de la barrera cutánea (microtraumas, tiña pedis interdigital, úlceras por presión, picaduras).",
        specimens: "Punción-aspiración del borde de avance (bajo rendimiento) o biopsia de piel; hemocultivos en casos febriles o con compromiso sistémico.",
        identificationMethods: "Examen clínico, tinción de Gram y cultivo del pus o exudado purulento si existe herida abierta; hemocultivos seriados.",
        prevention: "Manejo adecuado y curación de heridas cutáneas, control de edemas en extremidades inferiores y tratamiento de micosis ungueales/interdigitales.",
        sourceDoc: { title: "12. Infección de piel y tejidos blandos.pdf", classCode: "Doc 12", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-otitis-ext",
        syndrome: "Otitis externa difusa y otitis externa maligna/necrotizante",
        relatedAgents: [
          { name: "Pseudomonas aeruginosa", stableId: "B02", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Staphylococcus aureus", stableId: "B03", taxonomicGroup: "bacteria", role: "etiologia_secundaria" }
        ],
        clinicalManifestations: "Otalgia intensa que se exacerba al traccionar el pabellón auricular o presionar el trago (signo del trago positivo), prurito, edema del conducto auditivo externo y otorrea.",
        transmission: "Humedad residual tras inmersión acuática repetida ('oído del nadador') o microtraumatismos con hisopos de algodón que alteran la película ceruminosa protectora.",
        specimens: "Secreción ótica aspirada del conducto auditivo externo.",
        identificationMethods: "Cultivo bacteriológico de secreción en agar sangre y agar MacConkey; antibiograma con foco en susceptibilidad antipseudomónica.",
        prevention: "Secado suave del conducto auditivo, evitar el uso de cotonitos dentro del meato auditivo, acidificación preventiva con gotas óticas en nadadores.",
        sourceDoc: { title: "12. Infección de piel y tejidos blandos.pdf", classCode: "Doc 12", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      }
    ]
  },
  {
    id: "urogenital",
    name: "Sistema Urogenital",
    shortName: "Urogenital",
    description: "Incluye genitales externos (vulva, pene, glande), mucosa vaginal, uretra distal, vejiga urinaria, uréteres y parénquima renal.",
    colorScheme: {
      accent: "#ec4899",
      border: "border-pink-500/30",
      bg: "bg-pink-500/10",
      text: "text-pink-400"
    },
    microbiomeRegionIds: ["vagina", "vulva", "urethra", "penis", "glans"],
    hasResidentMicrobiome: true,
    sterilityAndPhysiologicalContext: "La mucosa vaginal de mujeres en edad fértil está dominada por Lactobacillus productores de ácido láctico (pH < 4.5). La uretra distal y genitales externos tienen flora cutáneo-mucosa escasa. En contraposición, la orina vesical, uréteres y riñones son completamente estériles; el hallazgo de bacterias en vejiga o riñón constituye bacteriuria o infección.",
    infections: [
      {
        id: "inf-itu",
        syndrome: "Infección del tracto urinario baja (Cistitis aguda) y alta (Pielonefritis)",
        relatedAgents: [
          { name: "Escherichia coli", stableId: "B10", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Klebsiella pneumoniae", stableId: "B11", taxonomicGroup: "bacteria", role: "etiologia_secundaria" },
          { name: "Proteus mirabilis", stableId: "B14", taxonomicGroup: "bacteria", role: "etiologia_secundaria" },
          { name: "Staphylococcus saprophyticus", stableId: "B05", taxonomicGroup: "bacteria", role: "etiologia_secundaria" }
        ],
        clinicalManifestations: "Disuria dolorosa, polaquiuria, tenesmo vesical, dolor suprapúbico y orina turbia. Si asciende a pielonefritis: fiebre con calofríos, dolor en fosa lumbar y puñopercusión positiva.",
        transmission: "Vía ascendente desde la microbiota fecal periuretral colonizante que ingresa por el meato uretral y coloniza el urotelio vesical.",
        specimens: "Orina de segundo chorro de la mañana con aseo genital previo; orina por cateterismo estéril en pacientes sondados.",
        identificationMethods: "Sedimento urinario (leucocituria >5-10 por campo, piocitos, bacterias abundantes), tira reactiva de orina (esterasa leucocitaria y nitritos positivos) y urocultivo cuantitativo (recuento >100.000 UFC/mL de un único uropatógeno).",
        prevention: "Hidratación oral abundante, micción postcoital, higiene perineal de adelante hacia atrás, evitar retención urinaria prolongada.",
        sourceDoc: { title: "16-Infección del tracto urinario (ITU).pdf", classCode: "Doc 16", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-its",
        syndrome: "Uretritis, cervicitis y úlceras genitales de transmisión sexual",
        relatedAgents: [
          { name: "Neisseria gonorrhoeae", stableId: "B22", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Chlamydia trachomatis", stableId: "B30", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Treponema pallidum", stableId: "B31", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Virus herpes simple tipo 2", stableId: "V15", taxonomicGroup: "virus", role: "etiologia_principal" }
        ],
        clinicalManifestations: "Uretritis con secreción purulenta uretral matutina abundante y disuria intensa (gonococo); secreción mucosa transparente (clamidia); úlcera genital única e indolora de fondo limpio (chancro sifilítico); vesículas agrupadas dolorosas sobre base eritematosa (herpes genital).",
        transmission: "Contacto sexual directo mucocutáneo sin uso de método de barrera con una pareja infectada.",
        specimens: "Descarga uretral o endocervical, orina de primer chorro matinal, frotis del fondo de la úlcera para campo oscuro o PCR.",
        identificationMethods: "Tinción de Gram de secreción uretral (diplococos Gram negativos intracelulares en polimorfonucleares diagnósticos de gonorrea en hombres), cultivo en Agar Thayer-Martin enriquecido, amplificación de ácidos nucleicos (NAAT / PCR dúplex CT/NG), serología no treponémica (VDRL/RPR) y treponémica (FTA-ABS).",
        prevention: "Uso correcto y sistemático del preservativo, pesquisa precoz y tratamiento simultáneo de las parejas sexuales, notificación obligatoria ENO.",
        sourceDoc: { title: "17-Infecciones de transmisión sexual(ITS).pdf", classCode: "Doc 17", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      }
    ]
  },
  {
    id: "nervous_system",
    name: "Sistema Nervioso Central (SNC)",
    shortName: "Nervioso Central",
    description: "Comprende el encéfalo, médula espinal, meninges (duramadre, aracnoides, piamadre) y espacio subaracnoideo con líquido cefalorraquídeo.",
    colorScheme: {
      accent: "#f59e0b",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      text: "text-amber-400"
    },
    // No posee regiones en el catálogo de microbiota porque es estéril
    microbiomeRegionIds: [],
    hasResidentMicrobiome: false,
    sterilityAndPhysiologicalContext: "Sitio rigurosamente estéril y protegido por la barrera hematoencefálica y aracnoidea. NO posee microbiota residente habitual. Cualquier microorganismo detectado en el líquido cefalorraquídeo o tejido cerebral representa una infección patológica crítica que constituye una emergencia médica.",
    infections: [
      {
        id: "inf-meningitis",
        syndrome: "Meningitis bacteriana aguda y encefalitis infecciosa",
        relatedAgents: [
          { name: "Streptococcus pneumoniae", stableId: "B01", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Neisseria meningitidis", stableId: "B21", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Listeria monocytogenes", stableId: "B26", taxonomicGroup: "bacteria", role: "etiologia_secundaria" },
          { name: "Virus herpes simple tipo 1", stableId: "V14", taxonomicGroup: "virus", role: "etiologia_secundaria" }
        ],
        clinicalManifestations: "Tríada clásica de fiebre, rigidez de nuca y alteración del estado de conciencia o confusión mental; cefalea holocraneana severa, fotofobia, vómitos explosivos en proyectil y signos de Kernig y Brudzinski positivos.",
        transmission: "Diseminación hematógena secundaria a bacteriemia o infección respiratoria/ótica adyacente; o inoculación directa por trauma craneoencefálico o neurocirugía.",
        specimens: "Líquido cefalorraquídeo (LCR) obtenido por punción lumbar estéril a nivel de L3-L4 o L4-L5 antes de iniciar antibióticos (o de inmediato sin demorar el tratamiento empírico).",
        identificationMethods: "Análisis citoquímico del LCR (pleocitosis con predominio polimorfonuclear, proteinorraquia marcadamente elevada >100 mg/dL, glucorraquia baja <40% de la glicemia plasmática concomitante), tinción de Gram directa centrífuga y cultivo en agar sangre y agar chocolate, PCR múltiple de meningitis/encefalitis.",
        prevention: "Vacunación preventiva antimeningocócica y antineumocócica, quimioprofilaxis con rifampicina o ceftriaxona en contactos estrechos de casos por meningococo, pasteurización de alimentos contra Listeria.",
        sourceDoc: { title: "3. Morfología y taxonomía bacteriana.pdf", classCode: "Doc 03", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      }
    ]
  },
  {
    id: "cardiovascular",
    name: "Sangre y Sistema Cardiovascular",
    shortName: "Sangre y Cardiovascular",
    description: "Abarca el miocardio, endocardio valvular, pericardio, grandes vasos, circulación intravascular sanguínea y dispositivos intravasculares (catéteres).",
    colorScheme: {
      accent: "#ef4444",
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      text: "text-red-400"
    },
    // No posee regiones en el catálogo de microbiota porque es estéril
    microbiomeRegionIds: [],
    hasResidentMicrobiome: false,
    sterilityAndPhysiologicalContext: "El torrente circulatorio y el endotelio cardiovascular son estrictamente estériles en condiciones fisiológicas normales. Cualquier microorganismo viable detectado en sangre representa bacteriemia, fungemia, viremia o parasitemia. La respuesta sistémica desregulada del huésped ante la infección intravascular puede desencadenar sepsis, coagulopatía de consumo y shock séptico distributivo.",
    infections: [
      {
        id: "inf-endocarditis",
        syndrome: "Endocarditis infecciosa y vegetaciones valvulares",
        relatedAgents: [
          { name: "Staphylococcus aureus", stableId: "B03", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Streptococcus grupo viridans", stableId: undefined, taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Enterococcus faecalis", stableId: "B08", taxonomicGroup: "bacteria", role: "etiologia_secundaria" },
          { name: "Staphylococcus epidermidis", stableId: "B04", taxonomicGroup: "bacteria", role: "oportunista" }
        ],
        clinicalManifestations: "Fiebre prolongada de origen desconocido, aparición o modificación de soplos cardíacos, astenia, fenómenos embólicos sistémicos (manchas de Roth, lesiones de Janeway, nódulos de Osler).",
        transmission: "Bacteriemia transitoria secundaria a focos orales, cutáneos o procedimientos invasivos que permite la adherencia al endotelio valvular dañado.",
        specimens: "Hemocultivos seriados tomados por venopunción periférica estéril en sitios anatómicos independientes.",
        identificationMethods: "Hemocultivos automatizados con frascos aerobios/anaerobios, tinción de Gram, MALDI-TOF, antibiograma y ecocardiografía transtorácica/transesofágica (criterios de Duke).",
        prevention: "Profilaxis antibiótica pre-procedimiento en pacientes de alto riesgo y técnica aséptica rigurosa en accesos vasculares.",
        sourceDoc: { title: "21. Infecciones intravasculares.pdf", classCode: "DOC-21", pages: "Págs. 9-10, 24" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-cateter-bacteriemia",
        syndrome: "Bacteriemia asociada a catéteres intravasculares y biofilm",
        relatedAgents: [
          { name: "Staphylococcus epidermidis", stableId: "B04", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Staphylococcus aureus", stableId: "B03", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Candida albicans", stableId: "H03", taxonomicGroup: "hongo", role: "oportunista" }
        ],
        clinicalManifestations: "Fiebre o hipotermia sin otro foco evidente en paciente con vía venosa central o periférica, eritema/secreción purulenta en el sitio de inserción del catéter, escalofríos durante la infusión de fluidos.",
        transmission: "Colonización extraluminal por microbiota cutánea durante la inserción/manipulación, o intraluminal a través de conexiones y lúmenes contaminados con formación de biopelícula microbiana (biofilm).",
        specimens: "Hemocultivos periféricos pareados con hemocultivo extraído a través del lumen del catéter, y cultivo semicuantitativo de la punta del catéter tras su retiro (método de Maki).",
        identificationMethods: "Tiempo diferencial de positividad (DTP: hemocultivo a través del catéter positivo ≥2 horas antes que el periférico), hemocultivos cuantitativos y tinción de Gram.",
        prevention: "Higiene de manos estricta, preparación cutánea con clorhexidina alcohólica al 2%, barrera máxima durante la instalación, curaciones estériles y retiro precoz de vías no indispensables.",
        sourceDoc: { title: "21. Infecciones intravasculares.pdf", classCode: "DOC-21", pages: "Págs. 11-13" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-sepsis-shock",
        syndrome: "Sepsis y shock séptico distributivo",
        relatedAgents: [
          { name: "Escherichia coli", stableId: "B10", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Staphylococcus aureus", stableId: "B03", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Klebsiella pneumoniae", stableId: "B11", taxonomicGroup: "bacteria", role: "etiologia_secundaria" },
          { name: "Pseudomonas aeruginosa", stableId: "B02", taxonomicGroup: "bacteria", role: "etiologia_secundaria" }
        ],
        clinicalManifestations: "Disfunción orgánica potencialmente mortal causada por una respuesta desregulada del huésped a la infección: taquipnea, alteración de conciencia, oliguria, hipotensión persistente refractaria a volumen con requerimiento de vasopresores y lactato sérico >2 mmol/L (shock séptico).",
        transmission: "Diseminación hematógena a partir de cualquier foco infeccioso primario (pulmonar, urinario, abdominal, piel o catéteres).",
        specimens: "Hemocultivos periféricos seriados inmediatos antes de iniciar antimicrobianos, gasometría arterial y lactato sérico, hemograma con recuento de plaquetas, creatinina y bilirrubina.",
        identificationMethods: "Hemocultivos automatizados, detección molecular rápida directa de botella positiva por PCR múltiple / FilmArray para bacteriemia y sepsis.",
        prevention: "Identificación precoz del deterioro clínico (criterios qSOFA / SOFA), reanimación hemodinámica inmediata en la primera hora y administración oportuna de terapia antibiótica empírica de amplio espectro.",
        sourceDoc: { title: "21. Infecciones intravasculares.pdf", classCode: "DOC-21", pages: "Pág. 8" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-parasitosis-intravascular",
        syndrome: "Infecciones parasitarias intravasculares (Chagas y Malaria)",
        relatedAgents: [
          { name: "Trypanosoma cruzi", stableId: "P03", taxonomicGroup: "parasito", role: "etiologia_principal" },
          { name: "Plasmodium falciparum", stableId: "P01", taxonomicGroup: "parasito", role: "etiologia_principal" },
          { name: "Plasmodium vivax", stableId: undefined, taxonomicGroup: "parasito", role: "etiologia_principal" }
        ],
        clinicalManifestations: "Chagas agudo: parasitemia elevada, fiebre, chagoma de inoculación o signo de Romaña; fase crónica: miocardiopatía dilatada y megavísceras (megaesófago, megacolon). Malaria: accesos febriles paroxísticos cíclicos, escalofríos intensos, diaforesis profusa, anemia hemolítica e ictericia.",
        transmission: "T. cruzi: deyecciones de triatominos ('vinchucas') que penetran por la herida de picadura o mucosas, vía connatal transplacentaria o transfusional. Plasmodium: inoculación de esporozoítos por picadura de hembras de mosquitos Anopheles.",
        specimens: "Sangre periférica anticoagulada con EDTA (frotis sanguíneo fino y gota gruesa), serología para IgG.",
        identificationMethods: "Microscopía directa de gota gruesa y frotis teñido con Giemsa (trofozoítos anulares y gametocitos en malaria; tripomastigotes en Chagas agudo), pruebas rápidas de antígeno (RDT para HRP-2/pLDH) y serología ELISA/HAI para Chagas crónico.",
        prevention: "Control de vectores domiciliarios (insecticidas, mallas mosquiteras con repelente), tamizaje serológico obligatorio en bancos de sangre y control prenatal en gestantes.",
        sourceDoc: { title: "21. Infecciones intravasculares.pdf", classCode: "DOC-21", pages: "Págs. 15-18, 25" },
        reviewStatus: "revisado_fuente"
      }
    ]
  },
  {
    id: "hepatobiliar",
    name: "Hígado y Vías Biliares",
    shortName: "Hígado y Bilis",
    description: "Comprende el parénquima hepático (lóbulos derecho e izquierdo), circulación portal y arterial hepática, vesícula biliar y conductos biliares intra y extrahepáticos.",
    colorScheme: {
      accent: "#f59e0b",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      text: "text-amber-400"
    },
    microbiomeRegionIds: [],
    hasResidentMicrobiome: false,
    sterilityAndPhysiologicalContext: "El parénquima hepático, los sinusoides y la bilis vesicular son estrictamente estériles en condiciones fisiológicas. La sangre portal transporta nutrientes y antígenos derivados del tracto entérico hacia el hígado, donde las células de Kupffer reticuloendoteliales depuran bacterias. La disrupción de las defensas o la ascensión bacteriana retrógrada desde el duodeno a través del colédoco causa colecistitis, colangitis bacteriana supurada y abscesos hepáticos piógenos.",
    infections: [
      {
        id: "inf-hepatitis-aguda",
        syndrome: "Hepatitis viral aguda (VHA, VHE, VHB, VHC, VHD)",
        relatedAgents: [
          { name: "Virus de la hepatitis A", stableId: "V21", taxonomicGroup: "virus", role: "etiologia_principal" },
          { name: "Virus de la hepatitis B", stableId: "V22", taxonomicGroup: "virus", role: "etiologia_principal" },
          { name: "Virus de la hepatitis C", stableId: "V23", taxonomicGroup: "virus", role: "etiologia_principal" },
          { name: "Virus de la hepatitis E", stableId: "V25", taxonomicGroup: "virus", role: "etiologia_principal" },
          { name: "Virus de la hepatitis D", stableId: "V24", taxonomicGroup: "virus", role: "etiologia_secundaria" }
        ],
        clinicalManifestations: "Cuadro bifásico con período prodrómico inespecífico (astenia, adinamia, náuseas, vómitos, anorexia y febrícula) seguido por fase de estado con ictericia esclero-cutánea, coluria (orina oscura hipercrómica) y acolia (deposiciones blanquecinas hipocólicas) por colestasis.",
        transmission: "VHA y VHE: vía fecal-oral mediante agua o alimentos contaminados (mariscos crudos, carne porcina mal cocida en VHE). VHB, VHC y VHD: transmisión parenteral por sangre, vía sexual no protegida y transmisión vertical perinatal.",
        specimens: "Suero sanguíneo obtenido por venopunción para pruebas bioquímicas y serológicas.",
        identificationMethods: "Perfil bioquímico hepático (elevación masiva de transaminasas ALT/GPT y AST/GOT >10-20 veces el valor normal, aumento de bilirrubina total a expensas de la fracción directa), serología específica por ELISA/CMIA (IgM anti-VHA, HBsAg e IgM anti-HBc para VHB, Anti-VHC con confirmación por carga viral de ARN-VHC).",
        prevention: "Vacunación universal (vacuna anti-VHA y anti-VHB recombinante), saneamiento básico y agua potable, uso de preservativo y control riguroso de hemoderivados.",
        sourceDoc: { title: "20. Infecciones hepáticas.pdf", classCode: "DOC-20", pages: "Págs. 4, 9, 11-15" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-hepatitis-cronica",
        syndrome: "Hepatitis viral crónica, fibrosis y hepatocarcinoma",
        relatedAgents: [
          { name: "Virus de la hepatitis C", stableId: "V23", taxonomicGroup: "virus", role: "etiologia_principal" },
          { name: "Virus de la hepatitis B", stableId: "V22", taxonomicGroup: "virus", role: "etiologia_principal" },
          { name: "Virus de la hepatitis D", stableId: "V24", taxonomicGroup: "virus", role: "etiologia_secundaria" }
        ],
        clinicalManifestations: "Infección persistente con inflamación hepática por más de 6 meses. Generalmente asintomática o paucisintomática durante años; progresión insidiosa a fibrosis avanzada, cirrosis hepática descompensada (hipertensión portal, ascitis, várices esofágicas) y riesgo de carcinoma hepatocelular.",
        transmission: "Vía parenteral (transfusiones previas a tamizaje, uso de drogas inyectables, tatuajes sin asepsia), sexual y vertical.",
        specimens: "Suero sanguíneo para serología y biología molecular; biopsia hepática o elastografía (FibroScan) para estadificación de fibrosis.",
        identificationMethods: "Persistencia de HBsAg >6 meses (VHB) o ARN-VHC detectable en plasma por RT-PCR cuantitativa (VHC); monitoreo de carga viral de ADN/ARN y niveles de alfafetoproteína (AFP).",
        prevention: "Antivirales de acción directa (AAD) pan-genotípicos para erradicación curativa de VHC, terapia antiviral supresora para VHB (Tenofovir, Entecavir) y pesquisa ecográfica semestral de hepatocarcinoma en pacientes cirróticos.",
        sourceDoc: { title: "20. Infecciones hepáticas.pdf", classCode: "DOC-20", pages: "Págs. 5-8, 13, 15" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-absceso-biliar",
        syndrome: "Abscesos hepáticos piógenos e infecciones de la vía biliar (Colangitis / Colecistitis)",
        relatedAgents: [
          { name: "Escherichia coli", stableId: "B10", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Klebsiella pneumoniae", stableId: "B11", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Enterococcus faecalis", stableId: "B08", taxonomicGroup: "bacteria", role: "etiologia_secundaria" },
          { name: "Bacteroides fragilis", stableId: undefined, taxonomicGroup: "bacteria", role: "etiologia_secundaria" }
        ],
        clinicalManifestations: "Absceso hepático: fiebre en agujas con calofríos, dolor en hipocondrio derecho que se irradia a hombro ipsilateral, hepatomegalia sensible. Colangitis aguda: tríada de Charcot (fiebre intermitente, ictericia y dolor abdominal en hipocondrio derecho); progresión a pentada de Reynolds (con hipotensión y confusión mental) en colangitis supurada grave.",
        transmission: "Ascensión retrógrada bacteriana desde el duodeno facilitada por obstrucción biliar litiásica o tumoral; diseminación hematógena portal (pileflebitis por apendicitis o diverticulitis) o arterial sistémica.",
        specimens: "Pus aspirado del absceso guiado por ecografía o TAC, bilis obtenida por CPRE o drenaje quirúrgico, hemocultivos periféricos seriados.",
        identificationMethods: "Tinción de Gram de pus/bilis, cultivo bacteriológico aerobio y anaerobio con antibiograma; ecografía abdominal y tomografía computarizada.",
        prevention: "Resolución oportuna de la colelitiasis sintomática y descompresión biliar urgente de la vía biliar obstruida.",
        sourceDoc: { title: "20. Infecciones hepáticas.pdf", classCode: "DOC-20", pages: "Pág. 24" },
        reviewStatus: "revisado_fuente"
      },
      {
        id: "inf-parasitosis-hepatica",
        syndrome: "Parasitosis hepatobiliares (Fascioliasis e Hidatidosis)",
        relatedAgents: [
          { name: "Fasciola hepatica", stableId: "P21", taxonomicGroup: "parasito", role: "etiologia_principal" },
          { name: "Echinococcus granulosus sensu lato", stableId: "P26", taxonomicGroup: "parasito", role: "etiologia_principal" }
        ],
        clinicalManifestations: "Fascioliasis: fase aguda invasiva con fiebre, hepatomegalia dolorosa, hipereosinofilia marcada (>50%) por migración parenquimatosa; fase crónica obstructiva con cólico biliar e ictericia. Hidatidosis: masa quística hepática indolora de crecimiento lento, compresión vascular/biliar; riesgo de shock anafiláctico por rotura accidental del quiste hidatídico.",
        transmission: "Fasciola: consumo de plantas acuáticas crudas (berros de agua) contaminadas con metacercarias. Echinococcus: ingestión accidental de huevos embrionados eliminados en heces de perros infectados (huésped definitivo) por contacto estrecho o aguas contaminadas.",
        specimens: "Suero sanguíneo para serología; bilis o deposiciones para huevos de Fasciola en fase crónica (tras varias semanas). En hidatidosis está estrictamente contraindicada la punción diagnóstica directa del quiste por riesgo de anafilaxia y siembra peritoneal.",
        identificationMethods: "Serología ELISA y Western Blot para confirmación; ecografía hepática y TAC para visualizar quistes con arenilla hidatídica o vesículas hijas; examen coproparasitológico de sedimentación para huevos operculados de F. hepatica en fase biliar.",
        prevention: "No consumir berros silvestres sin cocción; desparasitación periódica de perros con praziquantel y prohibición absoluta de alimentar perros con vísceras crudas de ovinos/bovinos con quistes.",
        sourceDoc: { title: "20. Infecciones hepáticas.pdf", classCode: "DOC-20", pages: "Págs. 20-23" },
        reviewStatus: "revisado_fuente"
      }
    ]
  },
  {
    id: "sensory",
    name: "Sistema Sensorial (Ocular y Auditivo)",
    shortName: "Ojo y Oído",
    description: "Comprende el globo ocular y anexos (conjuntiva, córnea, glándula lagrimal) y el aparato auditivo (conducto auditivo externo, tímpano y oído medio).",
    colorScheme: {
      accent: "#38bdf8",
      border: "border-sky-500/30",
      bg: "bg-sky-500/10",
      text: "text-sky-400"
    },
    microbiomeRegionIds: ["eye", "ear"],
    hasResidentMicrobiome: true,
    sterilityAndPhysiologicalContext: "La superficie conjuntival externa y el meato auditivo externo poseen una microbiota comensal de baja densidad. En contraposición, las cámaras intraoculares anterior y vítrea, así como la cavidad del oído medio y trompa de Eustaquio proximal, son fisiológicamente estériles.",
    infections: [
      {
        id: "inf-conjuntivitis",
        syndrome: "Conjuntivitis aguda infecciosa y queratitis bacteriana / viral",
        relatedAgents: [
          { name: "Staphylococcus aureus", stableId: "B03", taxonomicGroup: "bacteria", role: "etiologia_principal" },
          { name: "Streptococcus pneumoniae", stableId: "B01", taxonomicGroup: "bacteria", role: "etiologia_secundaria" },
          { name: "Adenovirus humanos", stableId: "V08", taxonomicGroup: "virus", role: "etiologia_principal" },
          { name: "Pseudomonas aeruginosa", stableId: "B02", taxonomicGroup: "bacteria", role: "etiologia_secundaria" }
        ],
        clinicalManifestations: "Inyección conjuntival difusa, sensación de cuerpo extraño o arenilla, secreción purulenta con párpados aglutinados al despertar (bacteriana) o secreción serosa con quemosis y ganglio preauricular palpable (viral); dolor y fotofobia intensa si compromete córnea (queratitis).",
        transmission: "Inoculación manual directa por frotamiento de ojos, toallas compartidas, piscinas o uso inadecuado/prolongado de lentes de contacto.",
        specimens: "Raspado conjuntival o corneal realizado por especialista oftalmológico, secreción con tórula de dacrón.",
        identificationMethods: "Tinción de Gram directa y cultivo en agar chocolate y agar sangre; cultivo en placa de agar no nutritivo con E. coli si se sospecha queratitis amebiana; PCR para Adenovirus y VHS.",
        prevention: "Higiene y lavado de manos, no compartir toallas ni cosméticos oculares, desinfección estricta de lentes de contacto y retiro nocturno de los mismos.",
        sourceDoc: { title: "12. Infección de piel y tejidos blandos.pdf", classCode: "Doc 12", pages: "Fuente pendiente de cotejo" },
        reviewStatus: "revisado_fuente"
      }
    ]
  }
];

/**
 * Helper para obtener un sistema corporal por su identificador único.
 */
export function getBodySystemById(id: string): BodySystemDefinition | undefined {
  return BODY_SYSTEMS_DATA.find((s) => s.id === id);
}

/**
 * Helper para encontrar qué sistema(s) corresponden a una región del explorador 3D / catálogo de microbiota.
 */
export function getBodySystemsForRegion(regionId: RegionId): BodySystemDefinition[] {
  return BODY_SYSTEMS_DATA.filter((s) => s.microbiomeRegionIds.includes(regionId));
}
