import { useMemo, useState, type ReactNode } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Moon, Droplet } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import { useVitalHistory } from '../../hooks/useCitizen';
import type { HealthVital } from '../../types/health';

// ─── Range selector ─────────────────────────────────────────────────────────
const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

function toChartPoints(records: HealthVital[]) {
  return records.map((r) => ({
    date: new Date(r.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    primary: r.value.primary ?? null,
  }));
}

// ─── Reusable trend card ────────────────────────────────────────────────────
function TrendCard({
  title,
  icon,
  data,
  isLoading,
  unit,
  color,
  emptyHint,
}: {
  title: string;
  icon: ReactNode;
  data?: HealthVital[];
  isLoading: boolean;
  unit?: string;
  color: string;
  emptyHint: string;
}) {
  const points = useMemo(() => (data ? toChartPoints(data) : []), [data]);

  return (
    <WidgetCard>
      <SectionHeader title={title} subtitle={unit ? `Measured in ${unit}` : undefined} />
      <div className="h-48 mt-4">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-lg" />
        ) : points.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <EmptyState icon={icon} title="No data yet" description={emptyHint} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="currentColor" className="text-slate-400" />
              <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-slate-400" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="primary" stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </WidgetCard>
  );
}

export default function Analytics() {
  const [days, setDays] = useState(30);

  const activity = useVitalHistory('activity', days);
  const sleep = useVitalHistory('sleep', days);
  const bloodSugar = useVitalHistory('blood_sugar', days);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Health Analytics</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Trends across your logged vitals, based on your Personal Health Records.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                days === r.days
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TrendCard
          title="Activity Trends"
          icon={<Activity size={32} />}
          data={activity.data}
          isLoading={activity.isLoading}
          unit="steps"
          color="#0d9488"
          emptyHint="Log an activity vital in Personal Health Records to see trends here."
        />
        <TrendCard
          title="Sleep Quality"
          icon={<Moon size={32} />}
          data={sleep.data}
          isLoading={sleep.isLoading}
          unit="hours"
          color="#6366f1"
          emptyHint="Log sleep hours in Personal Health Records to track quality over time."
        />
        <TrendCard
          title="Metabolic Health"
          icon={<Droplet size={32} />}
          data={bloodSugar.data}
          isLoading={bloodSugar.isLoading}
          unit="mg/dL blood sugar"
          color="#ea580c"
          emptyHint="Log a blood sugar reading in Personal Health Records to track metabolic health."
        />
      </div>
    </div>
  );
}
