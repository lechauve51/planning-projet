export type Granularity = "week" | "month" | "quarter" | "half-year" | "year";

export interface TimelineConfig {
  startDate: string; // ISO
  endDate: string; // ISO
  granularity: Granularity;
  step: number; // ex 1 mois, 1 trimestre
  cardSplitUnit: "none" | "year" | "half-year" | "quarter" | "month";
  cardSplitSize: number; // ex 1 an par carte, 2 ans par carte
  labelFormat?: string;
  snapMode?: "cell" | "subCell";
}

export interface Project {
  id: string;
  code?: string;
  name: string;
  groupId: string;
  startDate: string; // ISO
  endDate: string; // ISO
  row: number; // placement vertical
  colorOverride?: string;
}

export interface Group {
  id: string;
  name: string;
  color: string;
}

export interface TimelineCell {
  start: Date;
  end: Date;
  label: string;
  index: number;
}

export interface TimelineCard {
  title: string;
  cellsRange: { startIndex: number; endIndex: number };
  cells: TimelineCell[];
}

export interface Planning {
  id: string;
  name: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  timelineConfig: TimelineConfig;
  projects: Project[];
  groups: Group[];
}

