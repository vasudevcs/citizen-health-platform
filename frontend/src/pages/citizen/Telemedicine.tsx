import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Video, Clock, X } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import { StatusBadge } from '../../components/dashboard/DashboardShared';
import { useAppointments, useBookAppointment } from '../../hooks/useCitizen';
import CallRoom from '../../components/telemedicine/CallRoom';
import type { Appointment } from '../../types/health';

// A call is joinable from 10 minutes before its scheduled time up to 2 hours after
const JOIN_WINDOW_BEFORE_MS = 10 * 60 * 1000;
const JOIN_WINDOW_AFTER_MS = 2 * 60 * 60 * 1000;

const bookingSchema = z.object({
  scheduledAt: z.string().min(1, 'Pick a date and time'),
  doctorSpecialty: z.string().optional(),
  notes: z.string().max(500).optional(),
});
type BookingFormData = z.infer<typeof bookingSchema>;

function isJoinable(appt: Appointment) {
  if (appt.status === 'cancelled' || appt.status === 'completed' || appt.status === 'no_show') return false;
  const start = new Date(appt.scheduledAt).getTime();
  const now = Date.now();
  return now >= start - JOIN_WINDOW_BEFORE_MS && now <= start + JOIN_WINDOW_AFTER_MS;
}

export default function Telemedicine() {
  const { data: appointments = [], isLoading } = useAppointments(true);
  const bookAppointment = useBookAppointment();
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({ resolver: zodResolver(bookingSchema) });

  const telemedAppointments = useMemo(
    () => appointments.filter((a) => a.type === 'telemedicine').sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
    [appointments]
  );

  const onSubmit = (data: BookingFormData) => {
    bookAppointment.mutate(
      {
        type: 'telemedicine',
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        doctorSpecialty: data.doctorSpecialty || undefined,
        notes: data.notes || undefined,
      },
      { onSuccess: () => { reset(); setShowBooking(false); } }
    );
  };

  if (activeCallId) {
    const appt = telemedAppointments.find((a) => a._id === activeCallId);
    return (
      <div className="space-y-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Telemedicine Session</h1>
            {appt && (
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Scheduled {new Date(appt.scheduledAt).toLocaleString()}
                {appt.doctorSpecialty ? ` · ${appt.doctorSpecialty}` : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => setActiveCallId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            <X size={14} /> Close
          </button>
        </div>
        <CallRoom appointmentId={activeCallId} onLeave={() => setActiveCallId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Telemedicine</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Consult with doctors online and manage your virtual appointments.
          </p>
        </div>
        <button
          onClick={() => setShowBooking((s) => !s)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
        >
          {showBooking ? 'Cancel' : 'Book a Visit'}
        </button>
      </div>

      {showBooking && (
        <WidgetCard>
          <SectionHeader
            title="Book a telemedicine visit"
            subtitle="Requests start as pending until a doctor confirms — you'll see the updated status here."
          />
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Date &amp; time</label>
              <input
                type="datetime-local"
                {...register('scheduledAt')}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.scheduledAt && <p className="mt-1 text-xs text-red-500">{errors.scheduledAt.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Preferred specialty (optional)</label>
              <input
                type="text"
                placeholder="e.g. General Physician"
                {...register('doctorSpecialty')}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Reason for visit (optional)</label>
              <textarea
                rows={2}
                {...register('notes')}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Briefly describe what you'd like to discuss"
              />
            </div>
            {bookAppointment.isError && (
              <p className="sm:col-span-2 text-xs text-red-500">Couldn't book the appointment. Please try again.</p>
            )}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={bookAppointment.isPending}
                className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60 transition-colors"
              >
                {bookAppointment.isPending ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </WidgetCard>
      )}

      <WidgetCard>
        <SectionHeader title="Upcoming telemedicine appointments" />
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : telemedAppointments.length === 0 ? (
            <EmptyState
              icon={<Video size={32} />}
              title="No telemedicine visits scheduled"
              description="Book a visit above to consult a doctor virtually."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {telemedAppointments.map((appt) => {
                const joinable = isJoinable(appt);
                return (
                  <li key={appt._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {appt.doctorName || appt.doctorSpecialty || 'General Consultation'}
                        </p>
                        <StatusBadge status={appt.status} />
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock size={12} /> {new Date(appt.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveCallId(appt._id)}
                      disabled={!joinable}
                      className={`flex-shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                        joinable
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                      }`}
                    >
                      {joinable ? 'Join Call' : 'Not yet open'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </WidgetCard>

      <WidgetCard>
        <SectionHeader title="Find a Doctor" />
        <div className="mt-4 flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <Stethoscope className="text-slate-400 mb-2" size={32} />
          <p className="text-sm text-slate-500">
            A doctor directory will appear here once the Doctor Portal module is built.
          </p>
        </div>
      </WidgetCard>
    </div>
  );
}
