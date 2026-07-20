// ─── Admin ──────────────────────────────────────────────────────────────────

export interface PlatformStats {
  totalUsers: number;
  roleCounts: Record<string, number>;
  newUsersThisWeek: number;
  totalAppointments: number;
  upcomingAppointments: number;
  totalCommunityPosts: number;
  flaggedCommunityPosts: number;
  riskAssessmentsRun: number;
}

export interface AdminUserRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PaginatedUsers {
  data: AdminUserRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface FlaggedPost {
  _id: string;
  title: string;
  body: string;
  category: string;
  author: { _id: string; name: string; role: string };
  updatedAt: string;
}
