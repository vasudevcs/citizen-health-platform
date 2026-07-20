import { Link } from 'react-router-dom';
import { Users, ClipboardList, TrendingUp, Activity as ActivityIcon } from 'lucide-react';
import { WidgetCard, SectionHeader, Skeleton } from '../../components/dashboard/DashboardShared';
import { useAuth } from '../../hooks/useAuth';
import { useAmbassadorStats } from '../../hooks/useAmbassador';

export default function AmbassadorDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useAmbassadorStats();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Ambassador Portal</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Welcome {user?.name} — citizen outreach and field notes.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
        ) : (
          <>
            <WidgetCard>
              <div className="flex items-center gap-3">
                <ClipboardList size={18} className="text-indigo-600" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Notes</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats?.totalNotes ?? '—'}</p>
                </div>
              </div>
            </WidgetCard>
            <WidgetCard>
              <div className="flex items-center gap-3">
                <TrendingUp size={18} className="text-indigo-600" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Notes This Week</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats?.notesThisWeek ?? '—'}</p>
                </div>
              </div>
            </WidgetCard>
            <WidgetCard>
              <div className="flex items-center gap-3">
                <Users size={18} className="text-indigo-600" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Citizens Reached</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats?.citizensReached ?? '—'}</p>
                </div>
              </div>
            </WidgetCard>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/ambassador/citizens">
          <WidgetCard hover>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Users size={18} />
              </div>
              <SectionHeader title="Citizen Directory" subtitle="Search citizens and open their notes" />
            </div>
          </WidgetCard>
        </Link>
        <Link to="/ambassador/activity">
          <WidgetCard hover>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <ActivityIcon size={18} />
              </div>
              <SectionHeader title="Recent Activity" subtitle="Your field-note history across all citizens" />
            </div>
          </WidgetCard>
        </Link>
      </div>
    </div>
  );
}
