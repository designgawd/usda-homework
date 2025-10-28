export interface CfrReference {
    cfr_reference: string;
    hierarchy: Hierarchy;
}

export interface Hierarchy {
    title: string;
    subtitle: string;
    part: string;
    subpart: string;
    section: string;
}

export interface Correction {
  id: number;
  cfr_references: CFRReferenceInCorrection[];
  corrective_action: string;
  error_corrected: string;
  error_occurred: string;
  fr_citation: string;
  position: number;
  display_in_toc: boolean;
  title: number;
  year: number;
  last_modified: string;
}

export interface CorrectionsResponse {
    ecfr_corrections: Correction[];
}

interface CFRHierarchy {
  title: string;          // always a string in corrections
  subtitle?: string;
  chapter: string;
  part?: string;
  subpart?: string;
  subject_group?: string;
  section?: string;
}

interface CFRReferenceInCorrection {
  cfr_reference: string;
  hierarchy: CFRHierarchy;
}