import api from './api';
import type { AuthUser } from '../types/auth';
import type { UpdateProfilePayload, ChangePasswordPayload, UpdatePreferencesPayload, UserPreferences } from '../types/settings';

export const settingsApi = {
  getProfile: async (): Promise<AuthUser> => {
    const { data } = await api.get('/settings/profile');
    return data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    const { data } = await api.patch('/settings/profile', payload);
    return data.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const { data } = await api.patch('/settings/password', payload);
    return data;
  },

  updatePreferences: async (payload: UpdatePreferencesPayload): Promise<UserPreferences> => {
    const { data } = await api.patch('/settings/preferences', payload);
    return data.data;
  },
};
