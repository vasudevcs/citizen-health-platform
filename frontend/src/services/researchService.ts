import api from './api';
import type { ResearchOverview, RiskDistribution, Demographics, WellbeingTrendPoint } from '../types/research';

export const researchApi = {
  getOverview: async (): Promise<ResearchOverview> => {
    const { data } = await api.get('/research/overview');
    return data.data;
  },
  getRiskDistribution: async (): Promise<RiskDistribution> => {
    const { data } = await api.get('/research/risk-distribution');
    return data.data;
  },
  getDemographics: async (): Promise<Demographics> => {
    const { data } = await api.get('/research/demographics');
    return data.data;
  },
  getWellbeingTrend: async (days = 30): Promise<WellbeingTrendPoint[]> => {
    const { data } = await api.get('/research/wellbeing-trend', { params: { days } });
    return data.data;
  },
};
