import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useDashboard } from '../../hooks/useCitizen';
import { useAuth } from '../../hooks/useAuth';
import { DashboardSkeleton } from '../../components/dashboard/DashboardShared';
import { HealthScoreRing } from '../../components/dashboard/HealthScoreRing';
import { VitalWidget } from '../../components/dashboard/VitalWidgets';
import { BloodPressureChart, BloodSugarChart, HeartRateChart } from '../../components/dashboard/HealthCharts';
import { MedicationReminder } from '../../components/dashboard/MedicationReminder';
import { UpcomingAppointments } from '../../components/dashboard/UpcomingAppointments';
import { RecentLabReports } from '../../components/dashboard/RecentLabReports';
import { AIRecommendations } from '../../components/dashboard/AIRecommendations';
import { QuickActions, EmergencyContact } from '../../components/dashboard/QuickActions';
import { NotificationsPanel } from '../../components/dashboard/NotificationsPanel';
import { HealthTimeline } from '../../components/dashboard/HealthTimeline';
import type { VitalType } from '../../types/health';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle size={48} className="mb-4 text-red-400" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          Unable to load dashboard
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {(error as Error)?.message || 'Something went wrong. Please try again.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-6 flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  // If no backend data yet, show demo mode with empty data
  const dashboardData = data ?? {
    healthScore: { score: 0, category: 'Fair' as const },
    vitals: {},
    trends: { bloodPressure: [], bloodSugar: [], heartRate: [], weight: [] },
    upcomingAppointments: [],
    medications: [],
    recentLabReports: [],
    notifications: [],
  };

  const vitalTypes: VitalType[] = [
    'blood_pressure',
    'blood_sugar',
    'bmi',
    'heart_rate',
    'weight',
    'oxygen_saturation',
    'sleep',
    'activity',
  ];

  const hasHighBP = !!(
    dashboardData.vitals.blood_pressure?.value?.primary &&
    dashboardData.vitals.blood_pressure.value.primary > 130
  );

  const hasLowSleep = !!(
    dashboardData.vitals.sleep?.value?.primary &&
    dashboardData.vitals.sleep.value.primary < 6
  );

  const hasLowActivity = !!(
    dashboardData.vitals.activity?.value?.primary &&
    dashboardData.vitals.activity.value.primary < 3000
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Here's your health overview for today,{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Health Score + Quick Actions ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Health Score */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-600 to-teal-800 p-6 shadow-sm dark:border-teal-700 lg:col-span-1">
          <h2 className="mb-1 text-sm font-semibold text-teal-100">Overall Health Score</h2>
          <p className="mb-5 text-xs text-teal-200">Updated based on your latest vitals</p>
          <div className="flex justify-center">
            <HealthScoreRing data={dashboardData.healthScore} />
          </div>
        </div>

        {/* Quick Actions + Emergency */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <QuickActions />
          <EmergencyContact />
        </div>
      </div>

      {/* ── Vital Widgets Grid ────────────────────────────────────────────────── */}
      <section aria-label="Vital Signs">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Vital Signs
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {vitalTypes.map((type) => (
            <VitalWidget
              key={type}
              type={type}
              vital={dashboardData.vitals[type]}
            />
          ))}
        </div>
      </section>

      {/* ── Charts Row ───────────────────────────────────────────────────────── */}
      <section aria-label="Health Trends">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          30-Day Trends
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <BloodPressureChart data={dashboardData.trends.bloodPressure} />
          <BloodSugarChart data={dashboardData.trends.bloodSugar} />
          <HeartRateChart data={dashboardData.trends.heartRate} />
        </div>
      </section>

      {/* ── Main Panel Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left column — 2/3 width */}
        <div className="space-y-4 xl:col-span-2">
          <MedicationReminder medications={dashboardData.medications} />
          <UpcomingAppointments appointments={dashboardData.upcomingAppointments} />
          <RecentLabReports reports={dashboardData.recentLabReports} />
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-4">
          <AIRecommendations
            healthScore={dashboardData.healthScore}
            hasHighBP={hasHighBP}
            hasLowSleep={hasLowSleep}
            hasLowActivity={hasLowActivity}
          />
          <NotificationsPanel notifications={dashboardData.notifications} />
          <HealthTimeline data={dashboardData} />
        </div>
      </div>
    </motion.div>
  );
}
