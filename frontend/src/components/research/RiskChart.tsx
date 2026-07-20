import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Skeleton } from '../dashboard/DashboardShared';
import { useRiskDistribution } from '../../hooks/useResearch';

const RISK_COLORS: Record<string, string> = {
  low: '#10b981',
  moderate: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export default function RiskChart() {
  const { data, isLoading } = useRiskDistribution();
  if (isLoading || !data) return <Skeleton className="h-64 w-full" />;

  const chartData = Object.entries(data).map(([condition, levels]) => ({
    condition: condition.charAt(0).toUpperCase() + condition.slice(1),
    ...levels,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis dataKey="condition" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {Object.keys(RISK_COLORS).map((level) => (
          <Bar key={level} dataKey={level} stackId="a" fill={RISK_COLORS[level]} name={level} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
