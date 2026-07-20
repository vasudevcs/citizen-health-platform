import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { registerSchema, RegisterFormValues } from '../../validations/authSchemas';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      setDone(true);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  if (done) {
    return (
      <div className="mx-auto mt-16 max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center">
        <h1 className="mb-2 text-lg font-medium text-slate-800">Check your email</h1>
        <p className="mb-4 text-xs text-slate-500">
          We've sent a verification OTP to your email address. Enter it to activate your account.
        </p>
        <button
          onClick={() => navigate('/verify-otp')}
          className="w-full rounded-md bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Enter OTP
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="mb-1 text-lg font-medium text-slate-800">Create your account</h1>
      <p className="mb-5 text-xs text-slate-400">Register as a citizen to access the platform</p>

      {serverError && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-red-700">{serverError}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-slate-600">Full name</label>
          <input
            {...register('name')}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-600">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-600">Phone</label>
          <input
            {...register('phone')}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="+91XXXXXXXXXX"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-600">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-600">Confirm password</label>
          <input
            type="password"
            {...register('confirmPassword')}
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
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="text-teal-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
