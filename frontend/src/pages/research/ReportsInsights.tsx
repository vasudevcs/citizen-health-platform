import { WidgetCard, SectionHeader, Skeleton } from '../../components/dashboard/DashboardShared';
import WellbeingTrendChart from '../../components/research/WellbeingTrendChart';
import { useResearchOverview, useDemographics, useWellbeingTrend } from '../../hooks/useResearch';

function InsightsSummary() {
  const { data: overview, isLoading: overviewLoading } = useResearchOverview();
  const { data: demographics, isLoading: demoLoading } = useDemographics();
  const { data: trend, isLoading: trendLoading } = useWellbeingTrend(30);

  if (overviewLoading || demoLoading || trendLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  const latestAvg = trend && trend.length > 0 ? trend[trend.length - 1].averageScore : null;
  const firstAvg = trend && trend.length > 0 ? trend[0].averageScore : null;
  const trendDirection =
    latestAvg != null && firstAvg != null
      ? latestAvg > firstAvg
        ? 'improved'
        : latestAvg < firstAvg
          ? 'declined'
          : 'held steady'
      : null;

  const insights: string[] = [];
  if (overview) {
    insights.push(
      `${overview.citizenCount} citizens are enrolled, with ${overview.assessmentCount} disease risk assessments completed to date.`
    );
  }
  if (demographics) {
    insights.push(
      `The most recent risk-assessment sample covers ${demographics.sampleSize} citizens, ${demographics.smokerCount} of whom reported smoking.`
    );
  }
  if (trendDirection) {
    insights.push(`Population average mood score has ${trendDirection} over the last 30 days.`);
  }

  return (
    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
      {insights.map((line, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-indigo-500">•</span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ReportsInsights() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reports & Insights</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Summary insights and wellbeing trends derived from platform-wide data.
        </p>
      </div>

      <WidgetCard>
        <SectionHeader title="Key Insights" />
        <div className="mt-3">
          <InsightsSummary />
        </div>
      </WidgetCard>

      <WidgetCard>
        <SectionHeader title="Population Mood Trend" subtitle="Last 30 days, daily average" />
        <div className="mt-3"><WellbeingTrendChart /></div>
      </WidgetCard>
    </div>
  );
}
