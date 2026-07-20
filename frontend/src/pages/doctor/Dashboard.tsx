import { type ReactNode } from 'react';
import { CalendarClock, Users, CheckCircle2, Inbox, Clock } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton, StatusBadge } from '../../components/dashboard/DashboardShared';
import { useAuth } from '../../hooks/useAuth';
import { useDoctorDashboard } from '../../hooks/useDoctor';
import { Link } from 'react-router-dom';

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <WidgetCard>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-teal-50 dark:bg-teal-900/30 p-2.5 text-teal-600 dark:text-teal-400">{icon}</div>
        <div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </WidgetCard>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useDoctorDashboard();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Welcome, Dr. {user?.name}</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Here's what's on your schedule today.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Today" value={data?.stats.todayCount ?? 0} icon={<CalendarClock size={18} />} />
          <StatCard label="Open requests" value={data?.stats.pendingRequestsInPool ?? 0} icon={<Inbox size={18} />} />
          <StatCard label="This week" value={data?.stats.weekCount ?? 0} icon={<Clock size={18} />} />
          <StatCard label="Total patients" value={data?.stats.totalPatients ?? 0} icon={<Users size={18} />} />
          <StatCard label="Completed" value={data?.stats.completedConsultations ?? 0} icon={<CheckCircle2 size={18} />} />
        </div>
      )}

      <WidgetCard>
        <SectionHeader
          title="Today's appointments"
          action={<Link to="/doctor/appointments" className="text-xs font-medium text-teal-600 hover:text-teal-700">View all</Link>}
        />
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
          ) : !data || data.todayAppointments.length === 0 ? (
            <EmptyState icon={<CalendarClock size={32} />} title="No appointments today" description="Enjoy the quiet — new requests will show up here." />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.todayAppointments.map((a) => (
                <li key={a._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {typeof a.citizen === 'object' ? a.citizen.name : 'Patient'} · {a.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </WidgetCard>
    </div>
  );
}
