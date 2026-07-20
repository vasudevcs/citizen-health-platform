// ─── Mental Wellbeing ─────────────────────────────────────────────────────────

export type MoodLevel = 'great' | 'good' | 'okay' | 'low' | 'struggling';

export interface MoodEntry {
  _id: string;
  citizen: string;
  mood: MoodLevel;
  score: number;
  stressLevel?: number;
  sleepHours?: number;
  triggers: string[];
  note?: string;
  recordedAt: string;
  createdAt: string;
}

export interface AddMoodEntryPayload {
  mood: MoodLevel;
  score: number;
  stressLevel?: number;
  sleepHours?: number;
  triggers?: string[];
  note?: string;
}

export interface WellbeingSummary {
  latestMood: MoodLevel | null;
  latestScore: number | null;
  latestAt: string | null;
  sevenDayAverageScore: number | null;
  checkInsThisWeek: number;
  streakDays: number;
}

export type WellbeingResourceCategory = 'exercise' | 'article';

export interface WellbeingResource {
  id: string;
  category: WellbeingResourceCategory;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface CrisisContact {
  name: string;
  contact: string;
  available: string;
}

export interface WellbeingResourcesResponse {
  resources: WellbeingResource[];
  crisisContacts: CrisisContact[];
}
