import api from './api';
import type {
  LoginPayload,
  LoginResponse,
  OtpSendPayload,
  OtpVerifyPayload,
  RegisterPayload,
  AuthUser,
} from '../types/auth';

export const authService = {
  register: (payload: RegisterPayload) => api.post('/auth/register', payload),

  login: (payload: LoginPayload) => api.post<LoginResponse>('/auth/login', payload),

  sendOtp: (payload: OtpSendPayload) => api.post('/auth/otp/send', payload),

  verifyOtp: (payload: OtpVerifyPayload) => api.post<LoginResponse>('/auth/otp/verify', payload),

  refreshToken: () => api.post<LoginResponse>('/auth/refresh-token'),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  getMe: () => api.get<{ success: boolean; user: AuthUser }>('/auth/me'),
};
