import { MessageSquareWarning } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../dashboard/DashboardShared';
import { useFlaggedPosts, useRestorePost } from '../../hooks/useAdmin';

export default function ModerationQueue() {
  const { data, isLoading } = useFlaggedPosts();
  const restore = useRestorePost();

  return (
    <WidgetCard>
      <SectionHeader title="Moderation Queue" subtitle="Removed community posts" />
      <div className="mt-3 space-y-2">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState icon={<MessageSquareWarning size={32} />} title="Nothing flagged" description="No removed posts pending review." />
        ) : (
          data.map((p) => (
            <div key={p._id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{p.body}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">{p.author.name} · {p.category}</span>
                <button
                  type="button"
                  onClick={() => restore.mutate(p._id)}
                  className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Restore
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </WidgetCard>
  );
}
