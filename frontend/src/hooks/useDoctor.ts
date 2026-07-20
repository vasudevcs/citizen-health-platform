import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '../services/doctorService';
import type { AppointmentStatusFilter, DoctorAvailability } from '../types/doctor';

export const doctorKeys = {
  dashboard: ['doctor', 'dashboard'] as const,
  appointments: (status?: AppointmentStatusFilter) => ['doctor', 'appointments', status ?? 'all'] as const,
  patients: ['doctor', 'patients'] as const,
  patientProfile: (id: string) => ['doctor', 'patients', id] as const,
  prescriptions: (citizenId?: string) => ['doctor', 'prescriptions', citizenId ?? 'all'] as const,
  availability: ['doctor', 'availability'] as const,
};

// ─── Dashboard ──────────────────────────────────────────────────────────────
export function useDoctorDashboard() {
  return useQuery({
    queryKey: doctorKeys.dashboard,
    queryFn: doctorApi.getDashboard,
    staleTime: 30_000,
  });
}

// ─── Appointments ─────────────────────────────────────────────────────────────
export function useDoctorAppointments(status?: AppointmentStatusFilter) {
  return useQuery({
    queryKey: doctorKeys.appointments(status),
    queryFn: () => doctorApi.getAppointments(status),
    staleTime: 15_000,
  });
}

function useInvalidateAppointments() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['doctor', 'appointments'] });
    qc.invalidateQueries({ queryKey: doctorKeys.dashboard });
    qc.invalidateQueries({ queryKey: doctorKeys.patients });
  };
}

export function useConfirmAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({ mutationFn: doctorApi.confirmAppointment, onSuccess: invalidate });
}

export function useCancelAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({ mutationFn: doctorApi.cancelAppointment, onSuccess: invalidate });
}

export function useCompleteAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({ mutationFn: doctorApi.completeAppointment, onSuccess: invalidate });
}

// ─── Patients ─────────────────────────────────────────────────────────────────
export function usePatients() {
  return useQuery({
    queryKey: doctorKeys.patients,
    queryFn: doctorApi.getPatients,
    staleTime: 60_000,
  });
}

export function usePatientProfile(citizenId: string | undefined) {
  return useQuery({
    queryKey: doctorKeys.patientProfile(citizenId ?? ''),
    queryFn: () => doctorApi.getPatientProfile(citizenId as string),
    enabled: !!citizenId,
    staleTime: 30_000,
  });
}

// ─── Prescriptions ────────────────────────────────────────────────────────────
export function usePrescriptions(citizenId?: string) {
  return useQuery({
    queryKey: doctorKeys.prescriptions(citizenId),
    queryFn: () => doctorApi.getPrescriptions(citizenId),
    staleTime: 30_000,
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: doctorApi.createPrescription,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['doctor', 'prescriptions'] });
      qc.invalidateQueries({ queryKey: doctorKeys.patientProfile(variables.citizenId) });
    },
  });
}

// ─── Availability ─────────────────────────────────────────────────────────────
export function useDoctorAvailability() {
  return useQuery({
    queryKey: doctorKeys.availability,
    queryFn: doctorApi.getAvailability,
    staleTime: 60_000,
  });
}

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DoctorAvailability) => doctorApi.updateAvailability(payload),
    onSuccess: (data) => qc.setQueryData(doctorKeys.availability, data),
  });
}
