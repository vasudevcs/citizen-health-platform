import { Link } from 'react-router-dom';
import { Activity as ActivityIcon } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import { useAmbassadorActivity } from '../../hooks/useAmbassador';
import { CATEGORY_LABELS } from '../../components/ambassador/categoryLabels';

export default function AmbassadorActivity() {
  const { data: activity, isLoading } = useAmbassadorActivity(50);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Your field notes across all citizens, most recent first.
        </p>
      </div>

      <WidgetCard>
        <SectionHeader title="Activity Feed" />
        <div className="mt-3 space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
          ) : !activity || activity.length === 0 ? (
            <EmptyState icon={<ActivityIcon size={32} />} title="No activity yet" description="Notes you log for citizens will show up here." />
          ) : (
            activity.map((entry) => (
              <Link
                key={entry._id}
                to={`/ambassador/notes/${entry.citizen._id}`}
                className="block rounded-lg border border-slate-100 p-3 text-sm hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{entry.citizen.name}</span>
                  <span className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {CATEGORY_LABELS[entry.category]}
                  </span>
                </div>
                <p className="mt-1.5 text-slate-600 dark:text-slate-400">{entry.note}</p>
              </Link>
            ))
          )}
        </div>
      </WidgetCard>
    </div>
  );
}
