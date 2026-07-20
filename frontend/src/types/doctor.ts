import type { Appointment, AppointmentType } from './health';

export interface PatientListEntry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  lastVisit: string | null;
  lastStatus: string | null;
  visitCount: number;
}

export interface DoctorVital {
  type: string;
  value: { primary?: number; secondary?: number; label?: string };
  unit?: string;
  recordedAt: string;
}

export interface DoctorLabReport {
  _id: string;
  title: string;
  lab?: string;
  conductedAt: string;
  results: { parameter: string; value: string; unit?: string; referenceRange?: string; status: string }[];
  fileUrl?: string;
  notes?: string;
}

export interface DoctorMedication {
  _id: string;
  citizen: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  instructions?: string;
  isActive: boolean;
  prescribedBy?: string;
  createdAt: string;
}

export interface PatientProfile {
  citizen: { _id: string; name: string; email: string; phone?: string; createdAt: string };
  vitals: Record<string, DoctorVital>;
  sharedLabReports: DoctorLabReport[];
  activeMedications: DoctorMedication[];
  appointmentHistory: Appointment[];
}

export interface DoctorAppointment extends Omit<Appointment, 'citizen'> {
  citizen: { _id: string; name: string; email: string; phone?: string } | string;
}

export interface DoctorDashboardData {
  todayAppointments: DoctorAppointment[];
  stats: {
    todayCount: number;
    pendingRequestsInPool: number;
    weekCount: number;
    totalPatients: number;
    completedConsultations: number;
  };
}

export interface CreatePrescriptionPayload {
  citizenId: string;
  name: string;
  dosage: string;
  frequency: string;
  times?: string[];
  startDate: string;
  endDate?: string;
  instructions?: string;
}

export interface AvailabilitySlot {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  startTime: string;
  endTime: string;
}

export interface DoctorAvailability {
  specialty?: string;
  bio?: string;
  availability: AvailabilitySlot[];
}

export type AppointmentStatusFilter = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type { AppointmentType };
