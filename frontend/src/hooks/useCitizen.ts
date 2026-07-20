import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citizenApi } from '../services/citizenService';
import type { VitalType } from '../types/health';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const citizenKeys = {
  dashboard: ['citizen', 'dashboard'] as const,
  vitalHistory: (type: VitalType, days: number) =>
    ['citizen', 'vitals', type, days] as const,
  medications: ['citizen', 'medications'] as const,
  appointments: (upcoming: boolean) => ['citizen', 'appointments', upcoming] as const,
  labReports: ['citizen', 'lab-reports'] as const,
  riskAssessmentHistory: (limit: number) => ['citizen', 'risk-assessment', 'history', limit] as const,
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: citizenKeys.dashboard,
    queryFn: citizenApi.getDashboard,
    staleTime: 60_000, // 1 min
    retry: 2,
  });
}

// ─── Vital History ────────────────────────────────────────────────────────────
export function useVitalHistory(type: VitalType, days = 30) {
  return useQuery({
    queryKey: citizenKeys.vitalHistory(type, days),
    queryFn: () => citizenApi.getVitalHistory(type, days),
    staleTime: 120_000,
  });
}

// ─── Add Vital ────────────────────────────────────────────────────────────────
export function useAddVital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: citizenApi.addVital,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: citizenKeys.dashboard });
    },
  });
}

// ─── Medications ──────────────────────────────────────────────────────────────
export function useMedications() {
  return useQuery({
    queryKey: citizenKeys.medications,
    queryFn: citizenApi.getMedications,
    staleTime: 60_000,
  });
}

export function useMarkMedicationTaken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: citizenApi.markMedicationTaken,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: citizenKeys.medications });
      qc.invalidateQueries({ queryKey: citizenKeys.dashboard });
    },
  });
}

// ─── Appointments ─────────────────────────────────────────────────────────────
export function useAppointments(upcoming = false) {
  return useQuery({
    queryKey: citizenKeys.appointments(upcoming),
    queryFn: () => citizenApi.getAppointments(upcoming),
    staleTime: 60_000,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: citizenApi.bookAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['citizen', 'appointments'] });
      qc.invalidateQueries({ queryKey: citizenKeys.dashboard });
    },
  });
}

// ─── Lab Reports ──────────────────────────────────────────────────────────────
export function useLabReports() {
  return useQuery({
    queryKey: citizenKeys.labReports,
    queryFn: citizenApi.getLabReports,
    staleTime: 120_000,
  });
}

export function useCreateLabReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: citizenApi.createLabReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: citizenKeys.labReports });
    },
  });
}

// ─── Risk Assessment ──────────────────────────────────────────────────────────
export function useRiskAssessmentHistory(limit = 10) {
  return useQuery({
    queryKey: citizenKeys.riskAssessmentHistory(limit),
    queryFn: () => citizenApi.getRiskAssessmentHistory(limit),
    staleTime: 60_000,
  });
}

export function useRunRiskAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: citizenApi.runRiskAssessment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['citizen', 'risk-assessment'] });
    },
  });
}
