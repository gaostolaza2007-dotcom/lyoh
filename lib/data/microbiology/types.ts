export type MicrobeTaxonomy = "Bacterias" | "Virus" | "Hongos" | "Parásitos";

export interface ReferenceLink {
  label: string;
  url: string;
}

export interface MicrobeReference {
  id: number;
  title: string;
  links: ReferenceLink[];
}

export interface Microbe {
  id: string;
  pdfId: string;
  page: number;
  name: string;
  aliases?: string[];
  taxonomy: MicrobeTaxonomy;
  typeBadge?: string;
  badgeColor: string;
  stainOrGenetics: string;
  transmission: string;
  clinicalPresentation: string;
  virulenceFactors: string[];
  firstLineTreatment: string;
  examPearl: string;
  sources: number[];
  riskLevel?: string;
  initialSelection?: boolean;
}
