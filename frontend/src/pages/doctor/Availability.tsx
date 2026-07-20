import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { WidgetCard, SectionHeader, Skeleton } from '../../components/dashboard/DashboardShared';
import { useDoctorAvailability, useUpdateAvailability } from '../../hooks/useDoctor';
import type { AvailabilitySlot } from '../../types/doctor';

const DAYS: { value: AvailabilitySlot['day']; label: string }[] = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
];

export default function DoctorAvailability() {
  const { data, isLoading } = useDoctorAvailability();
  const updateAvailability = useUpdateAvailability();

  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    if (data) {
      setSpecialty(data.specialty || '');
      setBio(data.bio || '');
      setSlots(data.availability || []);
    }
  }, [data]);

  const addSlot = () => setSlots((s) => [...s, { day: 'mon', startTime: '09:00', endTime: '17:00' }]);
  const removeSlot = (i: number) => setSlots((s) => s.filter((_, idx) => idx !== i));
  const updateSlot = (i: number, patch: Partial<AvailabilitySlot>) =>
    setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, ...patch } : slot)));

  const handleSave = () => {
    updateAvailability.mutate({ specialty, bio, availability: slots });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Availability</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Your profile and weekly consultation hours.</p>
      </div>

      <WidgetCard>
        <SectionHeader title="Profile" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Specialty</label>
            <input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. General Physician"
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A short note patients will see"
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </WidgetCard>

      <WidgetCard>
        <SectionHeader
          title="Weekly hours"
          action={
            <button onClick={addSlot} className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
              <Plus size={13} /> Add slot
            </button>
          }
        />
        <div className="mt-4 space-y-2">
          {slots.length === 0 ? (
            <p className="text-sm text-slate-400">No hours set yet — add a slot to let patients know when you're available.</p>
          ) : (
            slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <select
                  value={slot.day}
                  onChange={(e) => updateSlot(i, { day: e.target.value as AvailabilitySlot['day'] })}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(i, { startTime: e.target.value })}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(i, { endTime: e.target.value })}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button onClick={() => removeSlot(i)} className="text-slate-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {updateAvailability.isError && <p className="mt-3 text-xs text-red-500">Couldn't save. Please try again.</p>}
        {updateAvailability.isSuccess && <p className="mt-3 text-xs text-emerald-600">Saved.</p>}

        <button
          onClick={handleSave}
          disabled={updateAvailability.isPending}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60 transition-colors"
        >
          <Save size={14} /> {updateAvailability.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </WidgetCard>
    </div>
  );
}
