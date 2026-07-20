import { Link } from 'react-router-dom';
import { Users, CalendarClock, Activity, BarChart3, FileBarChart } from 'lucide-react';
import { WidgetCard, SectionHeader, Skeleton } from '../../components/dashboard/DashboardShared';
import { useAuth } from '../../hooks/useAuth';
import { useResearchOverview } from '../../hooks/useResearch';

export default function ResearcherDashboard() {
  const { user } = useAuth();
  const { data: overview, isLoading } = useResearchOverview();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Research Portal</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Welcome {user?.name} — anonymized population-level health trends.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
        ) : (
          <>
            <WidgetCard>
              <div className="flex items-center gap-3">
                <Users size={18} className="text-indigo-600" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Citizens in Platform</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{overview?.citizenCount}</p>
                </div>
              </div>
            </WidgetCard>
            <WidgetCard>
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-indigo-600" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Risk Assessments</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{overview?.assessmentCount}</p>
                </div>
              </div>
            </WidgetCard>
            <WidgetCard>
              <div className="flex items-center gap-3">
                <CalendarClock size={18} className="text-indigo-600" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Telemedicine Appointments</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{overview?.appointmentCount}</p>
                </div>
              </div>
            </WidgetCard>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/research/analytics">
          <WidgetCard hover>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <BarChart3 size={18} />
              </div>
              <SectionHeader title="Population Analytics" subtitle="Risk distribution and demographics" />
            </div>
          </WidgetCard>
        </Link>
        <Link to="/research/reports">
          <WidgetCard hover>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <FileBarChart size={18} />
              </div>
              <SectionHeader title="Reports & Insights" subtitle="Wellbeing trends and summary insights" />
            </div>
          </WidgetCard>
        </Link>
      </div>
    </div>
  );
}
