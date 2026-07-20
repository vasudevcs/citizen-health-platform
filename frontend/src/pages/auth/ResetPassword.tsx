import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from '../../validations/authSchemas';
import { authService } from '../../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await authService.resetPassword(token, values.password);
      navigate('/login');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Reset link is invalid or expired.');
    }
  };

  if (!token) {
    return (
      <div className="mx-auto mt-16 max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-red-600">
        Missing or invalid reset link.
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="mb-1 text-lg font-medium text-slate-800">Set new password</h1>
      <p className="mb-5 text-xs text-slate-400">Choose a strong new password.</p>

      {serverError && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-red-700">{serverError}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            type="password"
            {...register('password')}
            placeholder="New password"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            {...register('confirmPassword')}
            placeholder="Confirm password"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {isSubmitting ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}
