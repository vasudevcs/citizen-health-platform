import api from './api';
import type {
  EducationLibrary,
  EducationContentItem,
  EducationProgressSummary,
  ProgressUpdatePayload,
  EducationCategory,
} from '../types/education';

export const educationApi = {
  listContent: async (category?: EducationCategory): Promise<EducationLibrary> => {
    const { data } = await api.get('/education/content', { params: category ? { category } : {} });
    return data.data;
  },

  getContent: async (id: string): Promise<EducationContentItem> => {
    const { data } = await api.get(`/education/content/${id}`);
    return data.data;
  },

  getProgress: async (): Promise<EducationProgressSummary> => {
    const { data } = await api.get('/education/progress');
    return data.data;
  },

  updateProgress: async (id: string, payload: ProgressUpdatePayload) => {
    const { data } = await api.patch(`/education/content/${id}/progress`, payload);
    return data.data;
  },
};
