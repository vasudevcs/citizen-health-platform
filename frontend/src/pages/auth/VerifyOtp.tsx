import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function VerifyOtp() {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    setError(null);
    try {
      await authService.verifyOtp({ identifier, otp, purpose: 'verify' });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or expired OTP.');
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="mb-1 text-lg font-medium text-slate-800">Verify your account</h1>
      <p className="mb-5 text-xs text-slate-400">
        Enter the email/phone you registered with and the OTP you received.
      </p>

      {error && <p className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      {success && (
        <p className="mb-3 rounded bg-green-50 px-3 py-2 text-xs text-green-700">
          Account verified! Redirecting to login...
        </p>
      )}

      <div className="space-y-3">
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email or phone"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          placeholder="6-digit OTP"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-center text-sm tracking-widest"
        />
        <button
          onClick={handleVerify}
          disabled={otp.length !== 6 || !identifier}
          className="w-full rounded-md bg-teal-700 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
