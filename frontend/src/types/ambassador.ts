// ─── Ambassador ─────────────────────────────────────────────────────────────

export interface CitizenRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PaginatedCitizens {
  data: CitizenRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export type NoteCategory = 'visit' | 'enrollment' | 'follow_up' | 'referral' | 'other';

export interface AmbassadorNote {
  _id: string;
  ambassador: { _id: string; name: string };
  citizen: string;
  category: NoteCategory;
  note: string;
  createdAt: string;
}

export interface AmbassadorActivityEntry {
  _id: string;
  ambassador: string;
  citizen: { _id: string; name: string; email: string };
  category: NoteCategory;
  note: string;
  createdAt: string;
}

export interface AmbassadorStats {
  totalNotes: number;
  notesThisWeek: number;
  citizensReached: number;
}
