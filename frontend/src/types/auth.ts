export type Role = 'citizen' | 'doctor' | 'ambassador' | 'researcher' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  isVerified: boolean;
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface OtpSendPayload {
  identifier: string;
  purpose: 'login' | 'verify' | 'reset';
}

export interface OtpVerifyPayload extends OtpSendPayload {
  otp: string;
}
