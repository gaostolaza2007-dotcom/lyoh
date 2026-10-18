/**
 * TIPOS Y DEFINICIONES DE DATOS PARA EL MÓDULO DE PARASITOLOGÍA - MEDSTUDY
 * Fuente de datos compartida y normalizada para los 7 apartados del módulo.
 */

export type ParasiteGroup = 
  | "Cestodos" 
  | "Trematodos" 
  | "Nematodos" 
  | "Protozoos apicomplejos" 
  | "Protozoos flagelados" 
  | "Protozoos ameboides" 
  | "Protozoos ciliados"
  | "Ectoparásitos";

export type AnatomicLocalization = 
  | "Intestino delgado" 
  | "Intestino grueso" 
  | "Hígado y vías biliares" 
  | "Sistema nervioso central (SNC)" 
  | "Musculatura y tejido subcutáneo" 
  | "Sangre y sistema reticuloendotelial" 
  | "Vías respiratorias y pulmón" 
  | "Tracto urogenital" 
  | "Ojo"
  | "Piel y anexos";

export type ParasiteStage = 
  | "Adulto" 
  | "Larva / Cisticerco" 
  | "Huevo" 
  | "Quiste" 
  | "Trofozoíto" 
  | "Ooquiste" 
  | "Ectoparásito adulto"
  | "Ninfa / Estadio inmaduro";

export type ContentStatus = "disponible" | "parcial" | "pendiente";

export interface HostInfo {
  definitive: string[];
  intermediate: string[];
  accidental?: string[];
  reservoir?: string[];
}

export interface DiagnosticMethod {
  name: string;
  sampleType: string;
  sensitivitySpecificity?: string;
  indication: string;
  limitations: string;
}

export interface ParasiteCard {
  id: string;
  code: string; // Ej: P25
  scientificName: string;
  commonNames: string[];
  group: ParasiteGroup;
  status: ContentStatus;
  statusNote?: string;
  hosts: HostInfo;
  localization: AnatomicLocalization[];
  transmissionRoutes: string[];
  infectiveForms: string[];
  diagnosticForms: string[];
  clinicalSummary: {
    syndromes: string[];
    incubationPeriod?: string;
    keySymptoms: string[];
    severeComplications: string[];
  };
  diagnosticMethods: DiagnosticMethod[];
  treatmentFirstLine: string;
  preventionControl: string[];
  has3DModel: boolean;
  hasMicroscopy: boolean;
  hasLifeCycle: boolean;
  hasGeography: boolean;
  hasCases: boolean;
  reviewDate: string;
  reviewer: string;
  sources: {
    title: string;
    organization: string;
    url?: string;
    accessedDate?: string;
  }[];
}

export type MicroscopyImageType = 
  | "microfotografia_real" 
  | "ilustracion_cientifica" 
  | "render_esquematico"
  | "pendiente";

export interface MicroscopyEntry {
  id: string;
  parasiteId: string;
  speciesName: string;
  stageName: string;
  imageType: MicroscopyImageType;
  sampleType: string;
  stainTechnique: string;
  magnification?: string;
  approximateSize: string;
  identifiableFeatures: string[];
  imageUrl?: string;
  svgDiagramId?: string;
  provenance: string;
  license: string;
  attribution: string;
  notes?: string;
  diagnosticRelevance: string;
}

export interface ComparisonFeature {
  label: string;
  valueA: string;
  valueB: string;
  isDistinctive?: boolean;
}

export interface ComparisonEntry {
  id: string;
  title: string;
  formA: {
    speciesName: string;
    stage: string;
    group: string;
  };
  formB: {
    speciesName: string;
    stage: string;
    group: string;
  };
  clinicalScenario: string;
  features: {
    sizeAndShape: { a: string; b: string; distinctive: boolean };
    wallAndCovering: { a: string; b: string; distinctive: boolean };
    internalContent: { a: string; b: string; distinctive: boolean };
    distinctiveStructures: { a: string; b: string; distinctive: boolean };
  };
  similarities: string[];
  criticalDifferences: string[];
  diagnosticLimitations: string;
  confirmatoryTests: string[];
  pitfalls: string[];
  sources: string[];
}

export type GeographicEvidenceType = 
  | "notificacion_obligatoria_minsal" 
  | "decomiso_matadero_oficial" 
  | "estudio_seroprevalencia" 
  | "caso_importado_documentado" 
  | "estudio_epidemiologico_regional"
  | "sin_datos_especificos";

export interface GeographicEntry {
  id: string;
  parasiteId: string;
  speciesName: string;
  territory: string;
  regionChile?: string;
  geographicPrecision: string;
  coordinates?: { lat: number; lng: number };
  evidenceType: GeographicEvidenceType;
  evidenceLabel: string;
  periodOrDate: string;
  casesCountOrPrevalence?: string;
  source: string;
  sourceUrl?: string;
  limitations: string;
  notes: string;
}

export interface LifeCycleStage {
  stepNumber: number;
  title: string;
  hostType: "Hospedador Definitivo" | "Hospedador Intermediario" | "Hospedador Accidental" | "Medio Ambiente";
  hostName: string;
  anatomicalLocation: string;
  biologicalTransformation: string;
  transmissionRoute?: string;
  isInfectiveStage?: boolean;
  infectiveStageName?: string;
  isDiagnosticStage?: boolean;
  diagnosticStageName?: string;
  clinicalSignificance?: string;
  relatedResourceId?: string;
}

export interface LifeCycle {
  parasiteId: string;
  speciesName: string;
  cycleType: "Ciclo indirecto (heteroxénico)" | "Ciclo directo (monoxénico)";
  summary: string;
  stages: LifeCycleStage[];
  differencesBetweenFormsNote: string;
  sources: { title: string; url?: string }[];
}

export type ExerciseCategory = 
  | "reconocimiento_estructuras" 
  | "comparacion_morfologica" 
  | "ordenamiento_ciclo" 
  | "seleccion_diagnostica" 
  | "caso_clinico_simulado";

export interface ExerciseOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ParasitologyExercise {
  id: string;
  title: string;
  category: ExerciseCategory;
  categoryLabel: string;
  isSimulatedCase: boolean;
  difficulty: "Básico" | "Intermedio" | "Avanzado";
  clinicalContext?: string;
  question: string;
  relatedSpeciesId?: string;
  options: ExerciseOption[];
  generalFeedback: string;
  diagnosticPearl: string;
  clinicalWarning?: string;
  source: string;
}
