// ─── Settings ───────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UpdatePreferencesPayload {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
}
