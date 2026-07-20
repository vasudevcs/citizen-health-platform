import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../services/settingsService';
import type { UpdateProfilePayload, ChangePasswordPayload, UpdatePreferencesPayload } from '../types/settings';

export function useProfile() {
  return useQuery({ queryKey: ['settings', 'profile'], queryFn: settingsApi.getProfile, staleTime: 60_000 });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => settingsApi.updateProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings', 'profile'] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => settingsApi.changePassword(payload),
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePreferencesPayload) => settingsApi.updatePreferences(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings', 'profile'] }),
  });
}
