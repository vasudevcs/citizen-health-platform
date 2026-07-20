import { Clock, Activity, Pill, FlaskConical, CalendarCheck } from 'lucide-react';
import type { DashboardData } from '../../types/health';
import { WidgetCard, SectionHeader, EmptyState } from './DashboardShared';

interface HealthTimelineProps {
  data: DashboardData;
}

interface TimelineEvent {
  id: string;
  type: 'vital' | 'appointment' | 'medication' | 'lab';
  title: string;
  subtitle: string;
  date: Date;
  color: string;
  icon: React.ElementType;
}

function buildTimeline(data: DashboardData): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // From vitals
  Object.entries(data.vitals).forEach(([type, vital]) => {
    if (vital) {
      const labels: Record<string, string> = {
        blood_pressure: 'Blood Pressure Logged',
        blood_sugar: 'Blood Sugar Logged',
        heart_rate: 'Heart Rate Logged',
        weight: 'Weight Logged',
        bmi: 'BMI Recorded',
        oxygen_saturation: 'SpO₂ Logged',
        sleep: 'Sleep Tracked',
        activity: 'Activity Logged',
      };
      events.push({
        id: `vital-${type}`,
        type: 'vital',
        title: labels[type] || 'Vital Logged',
        subtitle: vital.value.primary ? `${vital.value.primary} ${vital.unit ?? ''}` : '',
        date: new Date(vital.recordedAt),
        color: 'bg-teal-100 dark:bg-teal-900/30',
        icon: Activity,
      });
    }
  });

  // From medications (start dates)
  data.medications.forEach((med) => {
    events.push({
      id: `med-${med._id}`,
      type: 'medication',
      title: `${med.name} Started`,
      subtitle: `${med.dosage} · ${med.frequency}`,
      date: new Date(med.startDate),
      color: 'bg-amber-100 dark:bg-amber-900/30',
      icon: Pill,
    });
  });

  // From lab reports
  data.recentLabReports.forEach((report) => {
    events.push({
      id: `lab-${report._id}`,
      type: 'lab',
      title: report.title,
      subtitle: report.lab ?? 'Lab Report',
      date: new Date(report.conductedAt),
      color: 'bg-violet-100 dark:bg-violet-900/30',
      icon: FlaskConical,
    });
  });

  // From appointments (completed ones inferred from past)
  data.upcomingAppointments.forEach((appt) => {
    events.push({
      id: `appt-${appt._id}`,
      type: 'appointment',
      title: `Appointment with ${appt.doctorName ?? 'Doctor'}`,
      subtitle: appt.doctorSpecialty ?? appt.type,
      date: new Date(appt.scheduledAt),
      color: 'bg-blue-100 dark:bg-blue-900/30',
      icon: CalendarCheck,
    });
  });

  // Sort descending
  return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);
}

function formatEventDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function HealthTimeline({ data }: HealthTimelineProps) {
  const events = buildTimeline(data);

  return (
    <WidgetCard>
      <div className="mb-4">
        <SectionHeader title="Health Timeline" subtitle="Recent health activity" />
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<Clock size={40} />}
          title="No timeline events yet"
          description="Your health activity will appear here as you log data"
        />
      ) : (
        <ol className="relative ml-3 border-l border-slate-200 dark:border-slate-700">
          {events.map((event, idx) => {
            const Icon = event.icon;
            return (
              <li key={event.id} className={`mb-5 ml-5 ${idx === events.length - 1 ? '' : ''}`}>
                <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${event.color}`}>
                  <Icon size={12} className="text-slate-700 dark:text-slate-300" />
                </span>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800/40">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {event.title}
                  </p>
                  {event.subtitle && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{event.subtitle}</p>
                  )}
                  <time className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock size={9} />
                    {formatEventDate(event.date)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </WidgetCard>
  );
}
