export interface CorrectionsResponse {
    ecfr_corrections: Correction[];
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

interface CFRReferenceInCorrection {
  cfr_reference: string;
  hierarchy: CFRHierarchy;
}

export interface CfrReference {
    cfr_reference: string;
    hierarchy: Hierarchy;
}

interface CFRHierarchy {
  title: string;
  subtitle?: string;
  chapter: string;
  part?: string;
  subpart?: string;
  subject_group?: string;
  section?: string;
}

export interface Hierarchy {
    title: string;
    subtitle: string;
    part: string;
    subpart: string;
    section: string;
}







