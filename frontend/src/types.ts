export interface Section {
  id: string;
  name: string;
  sort_order: number;
  created: string;
  updated: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  sort_order: number;
  section: string;
  created: string;
  updated: string;
}

export interface LinkFormData {
  title: string;
  url: string;
  icon: string;
  section: string;
}

export interface SectionFormData {
  name: string;
}
