// ─── Health Education ───────────────────────────────────────────────────────

export type EducationCategory =
  | 'nutrition'
  | 'chronic-disease'
  | 'maternal-health'
  | 'preventive-care'
  | 'first-aid';

export type EducationContentType = 'article' | 'video' | 'guide';

export interface EducationContentItem {
  id: string;
  category: EducationCategory;
  type: EducationContentType;
  title: string;
  description: string;
  durationMinutes: number;
  body?: string;
}

export interface EducationCategoryOption {
  value: EducationCategory;
  label: string;
}

export interface EducationLibrary {
  items: EducationContentItem[];
  categories: EducationCategoryOption[];
}

export interface EducationProgressSummary {
  completedIds: string[];
  bookmarkedIds: string[];
  completedCount: number;
  totalCount: number;
}

export interface ProgressUpdatePayload {
  completed?: boolean;
  bookmarked?: boolean;
}
