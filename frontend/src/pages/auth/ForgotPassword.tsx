import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from '../../validations/authSchemas';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    await authService.forgotPassword(values.email);
    setSent(true); // always show success - avoid account enumeration
  };

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="mb-1 text-lg font-medium text-slate-800">Reset your password</h1>
      <p className="mb-5 text-xs text-slate-400">
        Enter your email and we'll send you a reset link.
      </p>

      {sent ? (
        <p className="rounded bg-green-50 px-3 py-2 text-xs text-green-700">
          If an account with that email exists, a reset link has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <input
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-xs text-slate-500">
        <Link to="/login" className="text-teal-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
