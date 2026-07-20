import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Skeleton } from '../dashboard/DashboardShared';
import { useDemographics } from '../../hooks/useResearch';

export default function DemographicsPanel() {
  const { data, isLoading } = useDemographics();
  if (isLoading || !data) return <Skeleton className="h-48 w-full" />;

  const ageData = Object.entries(data.ageBrackets).map(([bracket, count]) => ({ bracket, count }));

  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Sample size: {data.sampleSize} citizens</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={ageData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Smokers: {data.smokerCount} · Male: {data.genders.male ?? 0} · Female: {data.genders.female ?? 0}
      </p>
    </div>
  );
}
