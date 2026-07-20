import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wellbeingApi } from '../services/wellbeingService';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const wellbeingKeys = {
  moodHistory: (days: number) => ['wellbeing', 'mood', days] as const,
  summary: ['wellbeing', 'summary'] as const,
  resources: ['wellbeing', 'resources'] as const,
};

// ─── Mood History ─────────────────────────────────────────────────────────────
export function useMoodHistory(days = 30) {
  return useQuery({
    queryKey: wellbeingKeys.moodHistory(days),
    queryFn: () => wellbeingApi.getMoodHistory(days),
    staleTime: 60_000,
  });
}

// ─── Summary widget ───────────────────────────────────────────────────────────
export function useWellbeingSummary() {
  return useQuery({
    queryKey: wellbeingKeys.summary,
    queryFn: wellbeingApi.getSummary,
    staleTime: 60_000,
  });
}

// ─── Add mood entry ───────────────────────────────────────────────────────────
export function useAddMoodEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: wellbeingApi.addMoodEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wellbeing'] });
    },
  });
}

// ─── Resources (static, long stale time) ─────────────────────────────────────
export function useWellbeingResources() {
  return useQuery({
    queryKey: wellbeingKeys.resources,
    queryFn: wellbeingApi.getResources,
    staleTime: 10 * 60_000,
  });
}
