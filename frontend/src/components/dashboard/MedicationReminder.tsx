import { CheckCircle2, Clock, Pill, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Medication } from '../../types/health';
import { citizenApi } from '../../services/citizenService';
import { WidgetCard, SectionHeader, EmptyState } from './DashboardShared';
import { citizenKeys } from '../../hooks/useCitizen';

interface MedicationReminderProps {
  medications: Medication[];
}

function isTakenToday(takenDates: string[]): boolean {
  const today = new Date().toDateString();
  return takenDates.some((d) => new Date(d).toDateString() === today);
}

export function MedicationReminder({ medications }: MedicationReminderProps) {
  const qc = useQueryClient();

  const markTaken = useMutation({
    mutationFn: citizenApi.markMedicationTaken,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: citizenKeys.medications });
      qc.invalidateQueries({ queryKey: citizenKeys.dashboard });
    },
  });

  const pendingCount = medications.filter((m) => !isTakenToday(m.takenDates)).length;

  return (
    <WidgetCard>
      <div className="flex items-center justify-between mb-4">
        <SectionHeader
          title="Medication Reminders"
          subtitle={`${pendingCount} pending today`}
        />
        <div className={`rounded-full p-2 ${pendingCount > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
          <Pill size={18} className={pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'} />
        </div>
      </div>

      {medications.length === 0 ? (
        <EmptyState
          icon={<Pill size={40} />}
          title="No active medications"
          description="Your prescriptions will appear here"
        />
      ) : (
        <ul className="space-y-3">
          {medications.map((med) => {
            const taken = isTakenToday(med.takenDates);
            return (
              <li
                key={med._id}
                className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                  taken
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`rounded-full p-1.5 flex-shrink-0 ${taken ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    {taken ? (
                      <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {med.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {med.dosage} · {med.frequency}
                    </p>
                    {med.times.length > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <Clock size={10} className="text-slate-400" />
                        <span className="text-[11px] text-slate-400">{med.times.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {!taken && (
                  <button
                    type="button"
                    onClick={() => markTaken.mutate(med._id)}
                    disabled={markTaken.isPending}
                    className="ml-2 flex-shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                  >
                    Mark Taken
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}
