import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ambassadorApi } from '../services/ambassadorService';
import type { NoteCategory } from '../types/ambassador';

export const ambassadorKeys = {
  citizens: (page: number, search?: string) => ['ambassador', 'citizens', page, search ?? ''] as const,
  notes: (citizenId: string) => ['ambassador', 'notes', citizenId] as const,
  stats: ['ambassador', 'stats'] as const,
};

export function useAmbassadorCitizens(page = 1, search?: string) {
  return useQuery({
    queryKey: ambassadorKeys.citizens(page, search),
    queryFn: () => ambassadorApi.listCitizens({ page, limit: 20, search }),
    staleTime: 30_000,
  });
}

export function useAmbassadorCitizen(citizenId: string | undefined) {
  return useQuery({
    queryKey: ['ambassador', 'citizen', citizenId ?? ''],
    queryFn: () => ambassadorApi.getCitizen(citizenId as string),
    enabled: !!citizenId,
    staleTime: 30_000,
  });
}

export function useCitizenNotes(citizenId: string | undefined) {
  return useQuery({
    queryKey: ambassadorKeys.notes(citizenId ?? ''),
    queryFn: () => ambassadorApi.listNotesForCitizen(citizenId as string),
    enabled: !!citizenId,
    staleTime: 15_000,
  });
}

export function useAddAmbassadorNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { citizenId: string; category: NoteCategory; note: string }) => ambassadorApi.addNote(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ambassadorKeys.notes(variables.citizenId) });
      qc.invalidateQueries({ queryKey: ambassadorKeys.stats });
      qc.invalidateQueries({ queryKey: ['ambassador', 'activity'] });
    },
  });
}

export function useAmbassadorStats() {
  return useQuery({ queryKey: ambassadorKeys.stats, queryFn: ambassadorApi.getStats, staleTime: 30_000 });
}

export function useAmbassadorActivity(limit = 50) {
  return useQuery({
    queryKey: ['ambassador', 'activity', limit],
    queryFn: () => ambassadorApi.getActivity(limit),
    staleTime: 15_000,
  });
}
