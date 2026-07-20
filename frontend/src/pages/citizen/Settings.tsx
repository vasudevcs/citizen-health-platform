import { useEffect, useState } from 'react';
import { WidgetCard, SectionHeader, Skeleton } from '../../components/dashboard/DashboardShared';
import { useProfile, useUpdateProfile, useChangePassword, useUpdatePreferences } from '../../hooks/useSettings';

function ProfileSection() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone);
    }
  }, [profile]);

  const handleSave = () => {
    setMessage('');
    updateProfile.mutate(
      { name, email, phone },
      {
        onSuccess: () => setMessage('Profile updated.'),
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          setMessage(msg || 'Could not update profile.');
        },
      }
    );
  };

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <WidgetCard>
      <SectionHeader title="Profile" />
      <div className="mt-3 space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
        {message && <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </WidgetCard>
  );
}

function PasswordSection() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSave = () => {
    setMessage('');
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setMessage('Password updated successfully.');
          setCurrentPassword('');
          setNewPassword('');
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          setMessage(msg || 'Could not update password.');
        },
      }
    );
  };

  return (
    <WidgetCard>
      <SectionHeader title="Change Password" />
      <div className="mt-3 space-y-3">
        <input
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          type="password"
          placeholder="Current password"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          placeholder="New password (min 8 characters)"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        {message && <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={changePassword.isPending || currentPassword.length === 0 || newPassword.length < 8}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {changePassword.isPending ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </WidgetCard>
  );
}

function PreferencesSection() {
  const { data: profile } = useProfile();
  const updatePreferences = useUpdatePreferences();
  const prefs = profile?.preferences;

  if (!prefs) return null;

  return (
    <WidgetCard>
      <SectionHeader title="Notification Preferences" />
      <div className="mt-3 space-y-3">
        <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
          Email notifications
          <input
            type="checkbox"
            checked={prefs.emailNotifications}
            onChange={(e) => updatePreferences.mutate({ emailNotifications: e.target.checked })}
            className="h-4 w-4 rounded accent-indigo-600"
          />
        </label>
        <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
          SMS notifications
          <input
            type="checkbox"
            checked={prefs.smsNotifications}
            onChange={(e) => updatePreferences.mutate({ smsNotifications: e.target.checked })}
            className="h-4 w-4 rounded accent-indigo-600"
          />
        </label>
      </div>
    </WidgetCard>
  );
}

export default function Settings() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Manage your profile, security, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <ProfileSection />
          <PasswordSection />
        </div>
        <PreferencesSection />
      </div>
    </div>
  );
}
