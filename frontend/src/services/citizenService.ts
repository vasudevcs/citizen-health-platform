import api from './api';
import type {
  DashboardData,
  HealthVital,
  VitalType,
  Medication,
  Appointment,
  LabReport,
  CreateLabReportPayload,
  RiskAssessmentProfile,
  RiskAssessmentResult,
  RiskAssessmentHistoryEntry,
  BookAppointmentPayload,
  AppointmentChatMessage,
} from '../types/health';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const citizenApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await api.get('/citizens/dashboard');
    return data.data;
  },

  getVitalHistory: async (type: VitalType, days = 30): Promise<HealthVital[]> => {
    const { data } = await api.get(`/citizens/vitals/${type}`, { params: { days } });
    return data.data;
  },

  addVital: async (payload: {
    type: VitalType;
    value: { primary?: number; secondary?: number; label?: string };
    unit?: string;
    notes?: string;
    recordedAt?: string;
  }): Promise<HealthVital> => {
    const { data } = await api.post('/citizens/vitals', payload);
    return data.data;
  },

  getMedications: async (): Promise<Medication[]> => {
    const { data } = await api.get('/citizens/medications');
    return data.data;
  },

  addMedication: async (payload: Omit<Medication, '_id' | 'citizen' | 'takenDates' | 'createdAt'>): Promise<Medication> => {
    const { data } = await api.post('/citizens/medications', payload);
    return data.data;
  },

  markMedicationTaken: async (id: string): Promise<Medication> => {
    const { data } = await api.patch(`/citizens/medications/${id}/taken`);
    return data.data;
  },

  getAppointments: async (upcoming = false): Promise<Appointment[]> => {
    const { data } = await api.get('/citizens/appointments', { params: { upcoming } });
    return data.data;
  },

  bookAppointment: async (payload: BookAppointmentPayload): Promise<Appointment> => {
    const { data } = await api.post('/citizens/appointments', payload);
    return data.data;
  },

  getAppointmentChat: async (appointmentId: string): Promise<AppointmentChatMessage[]> => {
    const { data } = await api.get(`/citizens/appointments/${appointmentId}/chat`);
    return data.data;
  },

  getLabReports: async (): Promise<LabReport[]> => {
    const { data } = await api.get('/citizens/lab-reports');
    return data.data;
  },

  createLabReport: async (payload: CreateLabReportPayload): Promise<LabReport> => {
    const { data } = await api.post('/citizens/lab-reports', payload);
    return data.data;
  },

  runRiskAssessment: async (payload: RiskAssessmentProfile): Promise<RiskAssessmentResult> => {
    const { data } = await api.post('/citizens/risk-assessment', payload);
    return data.data;
  },

  getRiskAssessmentHistory: async (limit = 10): Promise<RiskAssessmentHistoryEntry[]> => {
    const { data } = await api.get('/citizens/risk-assessment/history', { params: { limit } });
    return data.data;
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationApi = {
  getMyNotifications: async () => {
    const { data } = await api.get('/notifications/me');
    return data;
  },

  markAllRead: async () => {
    await api.put('/notifications/mark-all-read');
  },

  markOneRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },
};
