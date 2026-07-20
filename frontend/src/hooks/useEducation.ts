import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { educationApi } from '../services/educationService';
import type { EducationCategory, ProgressUpdatePayload } from '../types/education';

export const educationKeys = {
  content: (category?: EducationCategory) => ['education', 'content', category ?? 'all'] as const,
  contentItem: (id: string) => ['education', 'content-item', id] as const,
  progress: ['education', 'progress'] as const,
};

export function useEducationContent(category?: EducationCategory) {
  return useQuery({
    queryKey: educationKeys.content(category),
    queryFn: () => educationApi.listContent(category),
    staleTime: 10 * 60_000,
  });
}

export function useEducationContentItem(id: string | undefined) {
  return useQuery({
    queryKey: educationKeys.contentItem(id ?? ''),
    queryFn: () => educationApi.getContent(id as string),
    enabled: !!id,
    staleTime: 10 * 60_000,
  });
}

export function useEducationProgress() {
  return useQuery({
    queryKey: educationKeys.progress,
    queryFn: educationApi.getProgress,
    staleTime: 30_000,
  });
}

export function useUpdateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProgressUpdatePayload }) =>
      educationApi.updateProgress(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: educationKeys.progress });
    },
  });
}
