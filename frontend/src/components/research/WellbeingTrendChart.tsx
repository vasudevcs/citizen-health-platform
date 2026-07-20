import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Skeleton } from '../dashboard/DashboardShared';
import { useWellbeingTrend } from '../../hooks/useResearch';

export default function WellbeingTrendChart() {
  const { data, isLoading } = useWellbeingTrend(30);
  if (isLoading) return <Skeleton className="h-56 w-full" />;
  if (!data || data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">No mood-tracking data available yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Line type="monotone" dataKey="averageScore" stroke="#6366f1" strokeWidth={2} dot={false} name="Avg mood score" />
      </LineChart>
    </ResponsiveContainer>
  );
}
