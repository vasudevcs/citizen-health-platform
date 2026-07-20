import api from './api';
import type { PlatformStats, PaginatedUsers, FlaggedPost } from '../types/admin';

export const adminApi = {
  getStats: async (): Promise<PlatformStats> => {
    const { data } = await api.get('/admin/stats');
    return data.data;
  },

  listUsers: async (params: { page?: number; limit?: number; role?: string; search?: string }): Promise<PaginatedUsers> => {
    const { data } = await api.get('/admin/users', { params });
    return { data: data.data, pagination: data.pagination };
  },

  setUserActive: async (id: string, isActive: boolean) => {
    const { data } = await api.patch(`/admin/users/${id}/status`, { isActive });
    return data.data;
  },

  listFlaggedPosts: async (): Promise<FlaggedPost[]> => {
    const { data } = await api.get('/admin/community/flagged');
    return data.data;
  },

  restorePost: async (id: string) => {
    const { data } = await api.patch(`/admin/community/${id}/restore`);
    return data.data;
  },

  exportUsersCsv: async (): Promise<Blob> => {
    const response = await api.get('/admin/reports/users.csv', { responseType: 'blob' });
    return response.data;
  },
};
