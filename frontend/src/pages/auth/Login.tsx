import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { loginSchema, LoginFormValues } from '../../validations/authSchemas';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

type Mode = 'password' | 'otp';

export default function Login() {
  const [mode, setMode] = useState<Mode>('otp');
  const [otpSent, setOtpSent] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const { login, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onPasswordSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      navigate('/');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleSendOtp = async () => {
    setServerError(null);
    try {
      await authService.sendOtp({ identifier, purpose: 'login' });
      setOtpSent(true);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Could not send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    setServerError(null);
    try {
      await loginWithOtp(identifier, otp);
      navigate('/');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Invalid OTP.');
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="mb-1 text-lg font-medium text-slate-800">Sign in</h1>
      <p className="mb-5 text-xs text-slate-400">Access your Citizen Health account</p>

      <div className="mb-5 flex gap-1 rounded-md bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('otp')}
          className={`flex-1 rounded px-3 py-1.5 text-xs font-medium ${
            mode === 'otp' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
          }`}
        >
          Mobile OTP
        </button>
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`flex-1 rounded px-3 py-1.5 text-xs font-medium ${
            mode === 'password' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
          }`}
        >
          Password
        </button>
      </div>

      {serverError && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-red-700">{serverError}</p>
      )}

      {mode === 'password' ? (
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-slate-600">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-teal-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-slate-600">Email or phone</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email or mobile number"
              disabled={otpSent}
            />
          </div>

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={!identifier}
              className="w-full rounded-md bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
            >
              Send OTP
            </button>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs text-slate-600">Enter 6-digit OTP</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-center text-sm tracking-widest"
                  placeholder="••••••"
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6}
                className="w-full rounded-md bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
              >
                Verify & sign in
              </button>
              <button
                onClick={handleSendOtp}
                className="w-full text-xs text-slate-500 hover:underline"
              >
                Resend OTP
              </button>
            </>
          )}
        </div>
      )}

      <p className="mt-5 text-center text-xs text-slate-500">
        No account?{' '}
        <Link to="/register" className="text-teal-700 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
