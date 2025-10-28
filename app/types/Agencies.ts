import { Correction } from "./Corrections";


export interface CfrReference {
  title: number;
  chapter: string;
  corrections?: Correction[];
}

export interface Agency {
  id: string;
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
  children: Agency[];
  cfr_references: CfrReference[];
  correctionCount: number;
}

export interface AgenciesResponse {
    agencies: Agency[];
}

export type Order = 'asc' | 'desc';

export type SortableAgencyKeys = keyof Omit<Agency, 'children' | 'slug' | 'display_name' | 'sortable_name' | 'id'>;