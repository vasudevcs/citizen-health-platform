import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Video, User, Check, X, CheckCircle2 } from 'lucide-react';
import { WidgetCard, EmptyState, Skeleton, StatusBadge } from '../../components/dashboard/DashboardShared';
import {
  useDoctorAppointments,
  useConfirmAppointment,
  useCancelAppointment,
  useCompleteAppointment,
} from '../../hooks/useDoctor';
import CallRoom from '../../components/telemedicine/CallRoom';
import type { AppointmentStatusFilter, DoctorAppointment } from '../../types/doctor';

const TABS: { label: string; value: AppointmentStatusFilter }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

function patientName(a: DoctorAppointment) {
  return typeof a.citizen === 'object' ? a.citizen.name : 'Patient';
}

export default function DoctorAppointments() {
  const [tab, setTab] = useState<AppointmentStatusFilter>('pending');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const { data: appointments = [], isLoading } = useDoctorAppointments(tab);

  const confirmMut = useConfirmAppointment();
  const cancelMut = useCancelAppointment();
  const completeMut = useCompleteAppointment();

  if (activeCallId) {
    return (
      <div className="space-y-4 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Telemedicine Session</h1>
          <button
            onClick={() => setActiveCallId(null)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            Close
          </button>
        </div>
        <CallRoom appointmentId={activeCallId} onLeave={() => setActiveCallId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Appointments</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Manage requests and your confirmed schedule.</p>
      </div>

      <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === t.value ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <WidgetCard>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
        ) : appointments.length === 0 ? (
          <EmptyState icon={<CalendarClock size={32} />} title={`No ${tab} appointments`} description="Nothing here right now." />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {appointments.map((a) => (
              <li key={a._id} className="flex items-center justify-between gap-3 py-3.5">
                <div className="min-w-0 flex items-center gap-3">
                  <div className="rounded-full bg-slate-100 dark:bg-slate-700 p-2 text-slate-500">
                    {a.type === 'telemedicine' ? <Video size={16} /> : <User size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{patientName(a)}</p>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {a.type.replace('_', ' ')} · {new Date(a.scheduledAt).toLocaleString()}
                      {a.doctorSpecialty ? ` · ${a.doctorSpecialty}` : ''}
                    </p>
                    {a.notes && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">"{a.notes}"</p>}
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  {tab === 'pending' && (
                    <>
                      <button
                        onClick={() => confirmMut.mutate(a._id)}
                        disabled={confirmMut.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                      >
                        <Check size={13} /> Confirm
                      </button>
                      <button
                        onClick={() => cancelMut.mutate(a._id)}
                        disabled={cancelMut.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-60"
                      >
                        <X size={13} /> Decline
                      </button>
                    </>
                  )}
                  {tab === 'confirmed' && (
                    <>
                      {a.type === 'telemedicine' && (
                        <button
                          onClick={() => setActiveCallId(a._id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                        >
                          <Video size={13} /> Join
                        </button>
                      )}
                      <button
                        onClick={() => completeMut.mutate(a._id)}
                        disabled={completeMut.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-60"
                      >
                        <CheckCircle2 size={13} /> Mark complete
                      </button>
                      <button
                        onClick={() => cancelMut.mutate(a._id)}
                        disabled={cancelMut.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-60"
                      >
                        <X size={13} /> Cancel
                      </button>
                    </>
                  )}
                  {typeof a.citizen === 'object' && (tab === 'confirmed' || tab === 'completed') && (
                    <Link
                      to={`/doctor/patients/${a.citizen._id}`}
                      className="text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      View patient
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>
    </div>
  );
}
