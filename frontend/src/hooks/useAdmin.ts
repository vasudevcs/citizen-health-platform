import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/adminService';

export const adminKeys = {
  stats: ['admin', 'stats'] as const,
  users: (page: number, role?: string, search?: string) => ['admin', 'users', page, role ?? 'all', search ?? ''] as const,
  flagged: ['admin', 'flagged'] as const,
};

export function usePlatformStats() {
  return useQuery({ queryKey: adminKeys.stats, queryFn: adminApi.getStats, staleTime: 30_000 });
}

export function useAdminUsers(page = 1, role?: string, search?: string) {
  return useQuery({
    queryKey: adminKeys.users(page, role, search),
    queryFn: () => adminApi.listUsers({ page, limit: 20, role, search }),
    staleTime: 15_000,
  });
}

export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.setUserActive(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}

export function useFlaggedPosts() {
  return useQuery({ queryKey: adminKeys.flagged, queryFn: adminApi.listFlaggedPosts, staleTime: 15_000 });
}

export function useRestorePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.restorePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.flagged }),
  });
}
