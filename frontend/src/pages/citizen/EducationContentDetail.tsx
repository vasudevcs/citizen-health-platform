import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Video, FileText, CheckCircle2, Circle, Bookmark } from 'lucide-react';
import { WidgetCard, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import { useEducationContentItem, useEducationProgress, useUpdateProgress } from '../../hooks/useEducation';

const TYPE_ICON = {
  article: <FileText size={16} />,
  video: <Video size={16} />,
  guide: <BookOpen size={16} />,
};

export default function EducationContentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading, isError } = useEducationContentItem(id);
  const { data: progress } = useEducationProgress();
  const updateProgress = useUpdateProgress();

  const completed = !!id && !!progress?.completedIds.includes(id);
  const bookmarked = !!id && !!progress?.bookmarkedIds.includes(id);

  if (isLoading) {
    return (
      <div className="space-y-4 pb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <WidgetCard>
        <EmptyState title="Content not found" description="This article may have been removed." />
      </WidgetCard>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <Link to="/education" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
        <ArrowLeft size={16} /> Back to Health Education
      </Link>

      <WidgetCard>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {TYPE_ICON[item.type]}
              <span>{item.type} · {item.durationMinutes} min</span>
            </div>
            <h1 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{item.title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
          </div>
          <button
            type="button"
            onClick={() => id && updateProgress.mutate({ id, payload: { bookmarked: !bookmarked } })}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            className={`flex-shrink-0 rounded-full p-1.5 ${
              bookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500 dark:text-slate-600'
            }`}
          >
            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {item.type === 'video' && (
          <div className="mt-4 flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400 dark:bg-slate-800">
            Video playback isn't available in this preview — the written walkthrough below covers the same steps.
          </div>
        )}

        <div className="prose prose-sm mt-4 max-w-none whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {item.body || 'Content for this item is coming soon.'}
        </div>

        <button
          type="button"
          onClick={() => id && updateProgress.mutate({ id, payload: { completed: !completed } })}
          className={`mt-6 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            completed
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
          }`}
        >
          {completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          {completed ? 'Completed' : 'Mark as complete'}
        </button>
      </WidgetCard>
    </div>
  );
}
