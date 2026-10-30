export type CatedraDocId = "CAT-20" | "CAT-21";

export interface ContrastSourceRef {
  title: string;
  url: string;
  note?: string;
}

export interface CatedraUnitMeta {
  id: string; // ej. "HEP-02", "VAS-01"
  documentId: CatedraDocId;
  pagesPdf: number[];
  title: string;
  systemId: "hepatobiliar" | "cardiovascular";
  targetSection: string;
  objective: string;
  interactionDescription: string;
  studentDecisionPrompt: string;
  feedbackCriteria: string;
  limitsAndReview: string;
  hasModel: boolean;
  stage: 1 | 2 | 3;
  contrastSources: ContrastSourceRef[];
  isPendingStage2?: boolean;
}
