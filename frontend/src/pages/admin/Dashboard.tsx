import { Link } from 'react-router-dom';
import { Users, MessageSquareWarning, Activity, CalendarClock, UserCog, Flag, BarChart3 } from 'lucide-react';
import { WidgetCard, SectionHeader, Skeleton } from '../../components/dashboard/DashboardShared';
import StatCard from '../../components/admin/StatCard';
import { usePlatformStats } from '../../hooks/useAdmin';

export default function AdminDashboard() {
  const { data: stats, isLoading } = usePlatformStats();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Platform-wide stats, user management, and content moderation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
        ) : (
          <>
            <StatCard icon={<Users size={18} />} label="Total Users" value={stats?.totalUsers ?? 0} />
            <StatCard icon={<CalendarClock size={18} />} label="Upcoming Appointments" value={stats?.upcomingAppointments ?? 0} />
            <StatCard icon={<MessageSquareWarning size={18} />} label="Flagged Posts" value={stats?.flaggedCommunityPosts ?? 0} />
            <StatCard icon={<Activity size={18} />} label="Risk Assessments Run" value={stats?.riskAssessmentsRun ?? 0} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/admin/users">
          <WidgetCard hover>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <UserCog size={18} />
              </div>
              <SectionHeader title="User Management" subtitle="Search, filter, activate/deactivate accounts" />
            </div>
          </WidgetCard>
        </Link>
        <Link to="/admin/moderation">
          <WidgetCard hover>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Flag size={18} />
              </div>
              <SectionHeader title="Moderation" subtitle={`${stats?.flaggedCommunityPosts ?? 0} posts pending review`} />
            </div>
          </WidgetCard>
        </Link>
        <Link to="/admin/analytics">
          <WidgetCard hover>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <BarChart3 size={18} />
              </div>
              <SectionHeader title="Analytics" subtitle="Role breakdown and CSV export" />
            </div>
          </WidgetCard>
        </Link>
      </div>
    </div>
  );
}
