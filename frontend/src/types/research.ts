// ─── Research ───────────────────────────────────────────────────────────────

export interface ResearchOverview {
  citizenCount: number;
  assessmentCount: number;
  appointmentCount: number;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskDistribution {
  diabetes: Record<RiskLevel, number>;
  hypertension: Record<RiskLevel, number>;
  cardiovascular: Record<RiskLevel, number>;
  obesity: Record<RiskLevel, number>;
}

export interface Demographics {
  sampleSize: number;
  ageBrackets: Record<string, number>;
  genders: Record<string, number>;
  smokerCount: number;
}

export interface WellbeingTrendPoint {
  date: string;
  averageScore: number;
  entries: number;
}
