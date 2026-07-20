import { useQuery } from '@tanstack/react-query';
import { researchApi } from '../services/researchService';

export function useResearchOverview() {
  return useQuery({ queryKey: ['research', 'overview'], queryFn: researchApi.getOverview, staleTime: 60_000 });
}

export function useRiskDistribution() {
  return useQuery({ queryKey: ['research', 'risk-distribution'], queryFn: researchApi.getRiskDistribution, staleTime: 60_000 });
}

export function useDemographics() {
  return useQuery({ queryKey: ['research', 'demographics'], queryFn: researchApi.getDemographics, staleTime: 60_000 });
}

export function useWellbeingTrend(days = 30) {
  return useQuery({
    queryKey: ['research', 'wellbeing-trend', days],
    queryFn: () => researchApi.getWellbeingTrend(days),
    staleTime: 60_000,
  });
}
