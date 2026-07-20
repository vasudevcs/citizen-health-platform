import api from './api';
import type {
  DoctorDashboardData,
  DoctorAppointment,
  PatientListEntry,
  PatientProfile,
  CreatePrescriptionPayload,
  DoctorMedication,
  DoctorAvailability,
  AppointmentStatusFilter,
} from '../types/doctor';

export const doctorApi = {
  getDashboard: async (): Promise<DoctorDashboardData> => {
    const { data } = await api.get('/doctors/dashboard');
    return data.data;
  },

  getAppointments: async (status?: AppointmentStatusFilter): Promise<DoctorAppointment[]> => {
    const { data } = await api.get('/doctors/appointments', { params: status ? { status } : {} });
    return data.data;
  },

  confirmAppointment: async (id: string): Promise<DoctorAppointment> => {
    const { data } = await api.patch(`/doctors/appointments/${id}/confirm`);
    return data.data;
  },

  cancelAppointment: async (id: string): Promise<DoctorAppointment> => {
    const { data } = await api.patch(`/doctors/appointments/${id}/cancel`);
    return data.data;
  },

  completeAppointment: async (id: string): Promise<DoctorAppointment> => {
    const { data } = await api.patch(`/doctors/appointments/${id}/complete`);
    return data.data;
  },

  getPatients: async (): Promise<PatientListEntry[]> => {
    const { data } = await api.get('/doctors/patients');
    return data.data;
  },

  getPatientProfile: async (citizenId: string): Promise<PatientProfile> => {
    const { data } = await api.get(`/doctors/patients/${citizenId}`);
    return data.data;
  },

  getPrescriptions: async (citizenId?: string): Promise<DoctorMedication[]> => {
    const { data } = await api.get('/doctors/prescriptions', { params: citizenId ? { citizenId } : {} });
    return data.data;
  },

  createPrescription: async (payload: CreatePrescriptionPayload): Promise<DoctorMedication> => {
    const { data } = await api.post('/doctors/prescriptions', payload);
    return data.data;
  },

  getAvailability: async (): Promise<DoctorAvailability> => {
    const { data } = await api.get('/doctors/availability');
    return data.data;
  },

  updateAvailability: async (payload: DoctorAvailability): Promise<DoctorAvailability> => {
    const { data } = await api.put('/doctors/availability', payload);
    return data.data;
  },
};
