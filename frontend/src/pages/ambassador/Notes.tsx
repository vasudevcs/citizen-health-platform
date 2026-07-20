import { useNavigate, useParams } from 'react-router-dom';
import { NotebookPen } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import CitizenDirectoryList from '../../components/ambassador/CitizenDirectoryList';
import CitizenNotesPanel from '../../components/ambassador/CitizenNotesPanel';
import { useAmbassadorCitizen } from '../../hooks/useAmbassador';

export default function AmbassadorNotes() {
  const { citizenId } = useParams<{ citizenId: string }>();
  const navigate = useNavigate();
  const { data: citizen, isLoading, isError } = useAmbassadorCitizen(citizenId);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Field Notes</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Log and review field notes for a citizen.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WidgetCard>
          <SectionHeader title="Select a Citizen" />
          <div className="mt-3">
            <CitizenDirectoryList
              onSelect={(c) => navigate(`/ambassador/notes/${c._id}`)}
              selectedId={citizenId}
            />
          </div>
        </WidgetCard>

        {!citizenId ? (
          <WidgetCard>
            <EmptyState icon={<NotebookPen size={40} />} title="Select a citizen" description="Choose a citizen from the list to view or log field notes." />
          </WidgetCard>
        ) : isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : isError || !citizen ? (
          <WidgetCard>
            <EmptyState title="Citizen not found" description="This citizen may no longer exist." />
          </WidgetCard>
        ) : (
          <CitizenNotesPanel citizen={citizen} onClose={() => navigate('/ambassador/notes')} />
        )}
      </div>
    </div>
  );
}
