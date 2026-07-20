import api from './api';
import type { PaginatedCitizens, CitizenRow, AmbassadorNote, AmbassadorActivityEntry, AmbassadorStats, NoteCategory } from '../types/ambassador';

export const ambassadorApi = {
  listCitizens: async (params: { page?: number; limit?: number; search?: string }): Promise<PaginatedCitizens> => {
    const { data } = await api.get('/ambassador/citizens', { params });
    return { data: data.data, pagination: data.pagination };
  },

  getCitizen: async (citizenId: string): Promise<CitizenRow> => {
    const { data } = await api.get(`/ambassador/citizens/${citizenId}`);
    return data.data;
  },

  listNotesForCitizen: async (citizenId: string): Promise<AmbassadorNote[]> => {
    const { data } = await api.get(`/ambassador/citizens/${citizenId}/notes`);
    return data.data;
  },

  addNote: async (payload: { citizenId: string; category: NoteCategory; note: string }): Promise<AmbassadorNote> => {
    const { data } = await api.post('/ambassador/notes', payload);
    return data.data;
  },

  getStats: async (): Promise<AmbassadorStats> => {
    const { data } = await api.get('/ambassador/stats');
    return data.data;
  },

  getActivity: async (limit = 50): Promise<AmbassadorActivityEntry[]> => {
    const { data } = await api.get('/ambassador/activity', { params: { limit } });
    return data.data;
  },
};
