import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, Users, MessageSquare, ShieldAlert } from 'lucide-react';
import { WidgetCard, SectionHeader, Skeleton } from '../../components/dashboard/DashboardShared';
import StatCard from '../../components/admin/StatCard';
import { usePlatformStats } from '../../hooks/useAdmin';
import { adminApi } from '../../services/adminService';

function RoleBreakdownChart() {
  const { data: stats, isLoading } = usePlatformStats();
  if (isLoading || !stats) return <Skeleton className="h-64 w-full" />;

  const chartData = Object.entries(stats.roleCounts).map(([role, count]) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1),
    count,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis dataKey="role" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ExportUsersButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setError('');
    setIsExporting(true);
    try {
      const blob = await adminApi.exportUsersCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'users-report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not export the report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        <Download size={16} />
        {isExporting ? 'Exporting…' : 'Export Users CSV'}
      </button>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default function AdminAnalytics() {
  const { data: stats, isLoading } = usePlatformStats();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Platform-wide breakdowns and exportable reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
        ) : (
          <>
            <StatCard icon={<Users size={18} />} label="New Users This Week" value={stats?.newUsersThisWeek ?? 0} />
            <StatCard icon={<MessageSquare size={18} />} label="Total Community Posts" value={stats?.totalCommunityPosts ?? 0} />
            <StatCard icon={<ShieldAlert size={18} />} label="Risk Assessments Run" value={stats?.riskAssessmentsRun ?? 0} />
          </>
        )}
      </div>

      <WidgetCard>
        <SectionHeader title="Users by Role" />
        <div className="mt-3"><RoleBreakdownChart /></div>
      </WidgetCard>

      <WidgetCard>
        <SectionHeader title="Reports" subtitle="Download a full user list as CSV" />
        <div className="mt-3"><ExportUsersButton /></div>
      </WidgetCard>
    </div>
  );
}
