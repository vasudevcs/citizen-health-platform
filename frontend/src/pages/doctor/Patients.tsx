import { Link } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { WidgetCard, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import { usePatients } from '../../hooks/useDoctor';

export default function DoctorPatients() {
  const { data: patients = [], isLoading } = usePatients();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Patients</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Patients you've had at least one appointment with. Records shown respect each patient's own sharing settings.
        </p>
      </div>

      <WidgetCard>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
        ) : patients.length === 0 ? (
          <EmptyState icon={<Users size={32} />} title="No patients yet" description="Confirm an appointment to add a patient to your list." />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {patients.map((p) => (
              <li key={p._id}>
                <Link
                  to={`/doctor/patients/${p._id}`}
                  className="flex items-center justify-between gap-3 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                      {p.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : '—'}
                      </p>
                      <p className="text-[11px] text-slate-400">{p.visitCount} visit{p.visitCount === 1 ? '' : 's'}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>
    </div>
  );
}
