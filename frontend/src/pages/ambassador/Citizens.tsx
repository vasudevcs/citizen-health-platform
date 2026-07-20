import { useNavigate } from 'react-router-dom';
import { WidgetCard, SectionHeader } from '../../components/dashboard/DashboardShared';
import CitizenDirectoryList from '../../components/ambassador/CitizenDirectoryList';

export default function AmbassadorCitizens() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Citizen Directory</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Search citizens and open their field-note history.
        </p>
      </div>

      <WidgetCard>
        <SectionHeader title="All Citizens" />
        <div className="mt-3">
          <CitizenDirectoryList
            onSelect={(citizen) => navigate(`/ambassador/notes/${citizen._id}`)}
            maxHeightClassName="max-h-[32rem]"
          />
        </div>
      </WidgetCard>
    </div>
  );
}
