import { WidgetCard, SectionHeader } from '../../components/dashboard/DashboardShared';
import RiskChart from '../../components/research/RiskChart';
import DemographicsPanel from '../../components/research/DemographicsPanel';

export default function PopulationAnalytics() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Population Analytics</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Anonymized, aggregate-only view of risk levels and demographics across the platform.
        </p>
      </div>

      <WidgetCard>
        <SectionHeader title="Risk-Level Distribution by Condition" />
        <div className="mt-3"><RiskChart /></div>
      </WidgetCard>

      <WidgetCard>
        <SectionHeader title="Age Distribution" />
        <div className="mt-3"><DemographicsPanel /></div>
      </WidgetCard>
    </div>
  );
}
