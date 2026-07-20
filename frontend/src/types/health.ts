// ─── Health Vitals ────────────────────────────────────────────────────────────

export type VitalType =
  | 'blood_pressure'
  | 'blood_sugar'
  | 'bmi'
  | 'heart_rate'
  | 'weight'
  | 'oxygen_saturation'
  | 'sleep'
  | 'activity';

export interface VitalValue {
  primary?: number;
  secondary?: number;
  label?: string;
}

export interface HealthVital {
  _id: string;
  citizen: string;
  type: VitalType;
  value: VitalValue;
  unit?: string;
  notes?: string;
  recordedAt: string;
  createdAt: string;
}

// ─── Health Score ─────────────────────────────────────────────────────────────

export interface HealthScore {
  score: number;
  category: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

// ─── Medication ───────────────────────────────────────────────────────────────

export interface Medication {
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
  takenDates: string[];
  createdAt: string;
}

// ─── Appointment ──────────────────────────────────────────────────────────────

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type AppointmentType = 'in_person' | 'telemedicine' | 'follow_up';

export interface AppointmentChatMessage {
  sender: string;
  senderRole: 'citizen' | 'doctor';
  text: string;
  sentAt: string;
}

export interface Appointment {
  _id: string;
  citizen: string;
  doctor?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  scheduledAt: string;
  durationMinutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  meetingLink?: string;
  chatMessages?: AppointmentChatMessage[];
  createdAt: string;
}

export interface BookAppointmentPayload {
  type: AppointmentType;
  scheduledAt: string;
  durationMinutes?: number;
  doctorSpecialty?: string;
  notes?: string;
}

// ─── Lab Report ───────────────────────────────────────────────────────────────

export type LabResultStatus = 'normal' | 'low' | 'high' | 'critical';

export interface LabResult {
  parameter: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: LabResultStatus;
}

export interface LabReport {
  _id: string;
  citizen: string;
  title: string;
  lab?: string;
  conductedAt: string;
  results: LabResult[];
  fileUrl?: string;
  notes?: string;
  isSharedWithDoctor: boolean;
  createdAt: string;
}

export interface CreateLabReportPayload {
  title: string;
  lab?: string;
  conductedAt: string;
  notes?: string;
  isSharedWithDoctor: boolean;
  file?: {
    fileName: string;
    fileType: string;
    fileData: string; // raw base64, no data-URL prefix
  };
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'appointment'
  | 'medication'
  | 'lab_report'
  | 'health_alert'
  | 'system'
  | 'telemedicine'
  | 'community'
  | 'wellbeing';

export interface AppNotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface VitalTrendPoint {
  _id: string;
  value: VitalValue;
  recordedAt: string;
}

export interface DashboardData {
  healthScore: HealthScore;
  vitals: Partial<Record<VitalType, HealthVital>>;
  trends: {
    bloodPressure: VitalTrendPoint[];
    bloodSugar: VitalTrendPoint[];
    heartRate: VitalTrendPoint[];
    weight: VitalTrendPoint[];
  };
  upcomingAppointments: Appointment[];
  medications: Medication[];
  recentLabReports: LabReport[];
  notifications: AppNotification[];
}

// ─── Risk Assessment ──────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type RiskCondition = 'diabetes' | 'hypertension' | 'cardiovascular' | 'obesity';

export interface RiskConditionResult {
  score: number; // 0-100, higher = worse
  level: RiskLevel;
  factors: string[];
  recommendations: string[];
}

export interface RiskFamilyHistory {
  diabetes: boolean;
  hypertension: boolean;
  cardiovascular: boolean;
  obesity: boolean;
}

export interface RiskAssessmentProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  smoker: boolean;
  familyHistory: RiskFamilyHistory;
}

export interface RiskAssessmentResult {
  id: string;
  engineVersion: string;
  hasVitalsData: boolean;
  createdAt: string;
  conditions: Record<RiskCondition, RiskConditionResult>;
}

export interface RiskAssessmentHistoryEntry {
  _id: string;
  engineVersion: string;
  createdAt: string;
  conditions: Record<RiskCondition, RiskConditionResult>;
}
