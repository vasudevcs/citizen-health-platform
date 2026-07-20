import { createContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authService } from '../services/authService';
import { tokenStore } from '../services/tokenStore';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  loginWithOtp: (identifier: string, otp: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try silent refresh (httpOnly cookie) to restore session after reload
  useEffect(() => {
    (async () => {
      try {
        const { data } = await authService.refreshToken();
        tokenStore.set(data.accessToken);
        setUser(data.user);
      } catch {
        tokenStore.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();

    const handleForcedLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await authService.login(payload);
    tokenStore.set(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithOtp = useCallback(async (identifier: string, otp: string) => {
    const { data } = await authService.verifyOtp({ identifier, otp, purpose: 'login' });
    tokenStore.set(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await authService.register(payload);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, loginWithOtp, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
