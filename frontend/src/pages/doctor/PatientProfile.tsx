import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Pill, HeartPulse, CalendarClock, ShieldOff, Plus } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton, StatusBadge } from '../../components/dashboard/DashboardShared';
import { usePatientProfile } from '../../hooks/useDoctor';
import PrescribeForm from '../../components/doctor/PrescribeForm';

const VITAL_LABELS: Record<string, string> = {
  blood_pressure: 'Blood Pressure',
  blood_sugar: 'Blood Sugar',
  bmi: 'BMI',
  heart_rate: 'Heart Rate',
  weight: 'Weight',
  oxygen_saturation: 'SpO2',
  sleep: 'Sleep',
  activity: 'Activity',
  temperature: 'Temperature',
};

export default function DoctorPatientProfile() {
  const { citizenId } = useParams<{ citizenId: string }>();
  const { data, isLoading, isError } = usePatientProfile(citizenId);
  const [showPrescribe, setShowPrescribe] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <WidgetCard>
        <EmptyState
          icon={<ShieldOff size={32} />}
          title="Can't view this patient"
          description="You don't have an appointment relationship with this patient, or they no longer exist."
        />
      </WidgetCard>
    );
  }

  const { citizen, vitals, sharedLabReports, activeMedications, appointmentHistory } = data;
  const vitalEntries = Object.entries(vitals);

  return (
    <div className="space-y-6 pb-8">
      <Link to="/doctor/patients" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400">
        <ArrowLeft size={14} /> Back to patients
      </Link>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 text-base font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
            {citizen.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{citizen.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{citizen.email}{citizen.phone ? ` · ${citizen.phone}` : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setShowPrescribe((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
        >
          <Plus size={15} /> New Prescription
        </button>
      </div>

      {showPrescribe && citizenId && (
        <PrescribeForm citizenId={citizenId} onDone={() => setShowPrescribe(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetCard>
          <SectionHeader title="Latest vitals" subtitle="From the patient's own logged records" />
          <div className="mt-4">
            {vitalEntries.length === 0 ? (
              <EmptyState icon={<HeartPulse size={28} />} title="No vitals logged" description="Nothing recorded yet." />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {vitalEntries.map(([type, v]) => (
                  <div key={type} className="rounded-lg border border-slate-100 dark:border-slate-700 p-3">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{VITAL_LABELS[type] || type}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {v.value.primary}
                      {v.value.secondary ? `/${v.value.secondary}` : ''} <span className="text-xs font-normal text-slate-400">{v.unit}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">{new Date(v.recordedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </WidgetCard>

        <WidgetCard>
          <SectionHeader title="Shared lab reports" subtitle="Only reports the patient marked as shared" />
          <div className="mt-4">
            {sharedLabReports.length === 0 ? (
              <EmptyState icon={<FileText size={28} />} title="No shared lab reports" description="The patient hasn't shared any reports yet." />
            ) : (
              <ul className="space-y-2">
                {sharedLabReports.map((r) => (
                  <li key={r._id} className="rounded-lg border border-slate-100 dark:border-slate-700 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.title}</p>
                      <span className="text-[11px] text-slate-400">{new Date(r.conductedAt).toLocaleDateString()}</span>
                    </div>
                    {r.results.length > 0 && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {r.results.map((res) => `${res.parameter}: ${res.value}${res.unit || ''}`).join(' · ')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </WidgetCard>

        <WidgetCard>
          <SectionHeader title="Active medications" />
          <div className="mt-4">
            {activeMedications.length === 0 ? (
              <EmptyState icon={<Pill size={28} />} title="No active medications" description="Nothing currently prescribed." />
            ) : (
              <ul className="space-y-2">
                {activeMedications.map((m) => (
                  <li key={m._id} className="rounded-lg border border-slate-100 dark:border-slate-700 p-3">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{m.name} — {m.dosage}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.frequency}{m.prescribedBy ? ` · prescribed by ${m.prescribedBy}` : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </WidgetCard>

        <WidgetCard>
          <SectionHeader title="Appointment history with you" />
          <div className="mt-4">
            {appointmentHistory.length === 0 ? (
              <EmptyState icon={<CalendarClock size={28} />} title="No history yet" description="No past appointments." />
            ) : (
              <ul className="space-y-2">
                {appointmentHistory.map((a) => (
                  <li key={a._id} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700 p-3">
                    <div>
                      <p className="text-sm text-slate-800 dark:text-slate-100 capitalize">{a.type.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(a.scheduledAt).toLocaleString()}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
