import api from './api';
import type {
  MoodEntry,
  AddMoodEntryPayload,
  WellbeingSummary,
  WellbeingResourcesResponse,
} from '../types/wellbeing';

export const wellbeingApi = {
  getMoodHistory: async (days = 30): Promise<MoodEntry[]> => {
    const { data } = await api.get('/wellbeing/mood', { params: { days } });
    return data.data;
  },

  addMoodEntry: async (payload: AddMoodEntryPayload): Promise<MoodEntry> => {
    const { data } = await api.post('/wellbeing/mood', payload);
    return data.data;
  },

  getSummary: async (): Promise<WellbeingSummary> => {
    const { data } = await api.get('/wellbeing/summary');
    return data.data;
  },

  getResources: async (): Promise<WellbeingResourcesResponse> => {
    const { data } = await api.get('/wellbeing/resources');
    return data.data;
  },
};
