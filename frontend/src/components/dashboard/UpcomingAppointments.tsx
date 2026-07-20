import { CalendarClock, Video, MapPin, Clock } from 'lucide-react';
import type { Appointment } from '../../types/health';
import { WidgetCard, SectionHeader, EmptyState, StatusBadge } from './DashboardShared';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}

const typeIcon: Record<string, React.ElementType> = {
  telemedicine: Video,
  in_person: MapPin,
  follow_up: CalendarClock,
};

const typeColors: Record<string, string> = {
  telemedicine: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  in_person: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  follow_up: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
};

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <WidgetCard>
      <div className="mb-4">
        <SectionHeader
          title="Upcoming Appointments"
          subtitle={`${appointments.length} scheduled`}
          action={
            <a
              href="/telemedicine"
              className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              Book New →
            </a>
          }
        />
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={40} />}
          title="No upcoming appointments"
          description="Schedule a consultation with a doctor"
          action={
            <a
              href="/telemedicine"
              className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-medium text-white hover:bg-teal-700"
            >
              Book Appointment
            </a>
          }
        />
      ) : (
        <ul className="space-y-3">
          {appointments.map((appt) => {
            const { date, time } = formatDateTime(appt.scheduledAt);
            const TypeIcon = typeIcon[appt.type] || CalendarClock;
            const iconClass = typeColors[appt.type] || 'bg-slate-100 text-slate-600';

            return (
              <li
                key={appt._id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className={`flex-shrink-0 rounded-xl p-2 ${iconClass}`}>
                  <TypeIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {appt.doctorName ?? 'Doctor TBD'}
                    </p>
                    <StatusBadge status={appt.status} />
                  </div>
                  {appt.doctorSpecialty && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {appt.doctorSpecialty}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Clock size={10} />
                      {date} at {time}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      · {appt.durationMinutes} min
                    </span>
                  </div>
                  {appt.meetingLink && (
                    <a
                      href={appt.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <Video size={10} />
                      Join Meeting
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}
