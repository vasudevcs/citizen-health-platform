import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Video, FileText, CheckCircle2, Circle, Bookmark, GraduationCap } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import { useEducationContent, useEducationProgress, useUpdateProgress } from '../../hooks/useEducation';
import type { EducationCategory, EducationContentItem } from '../../types/education';

const TYPE_ICON: Record<string, ReactElement> = {
  article: <FileText size={16} />,
  video: <Video size={16} />,
  guide: <BookOpen size={16} />,
};

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{completed} of {total} completed</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ContentCard({
  item,
  completed,
  bookmarked,
}: {
  item: EducationContentItem;
  completed: boolean;
  bookmarked: boolean;
}) {
  const updateProgress = useUpdateProgress();

  return (
    <WidgetCard hover>
      <div className="flex items-start justify-between gap-3">
        <Link to={`/education/${item.id}`} className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {TYPE_ICON[item.type]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">{item.title}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {item.durationMinutes} min · {item.type}
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => updateProgress.mutate({ id: item.id, payload: { bookmarked: !bookmarked } })}
          className={`flex-shrink-0 rounded-full p-1.5 ${
            bookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500 dark:text-slate-600'
          }`}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => updateProgress.mutate({ id: item.id, payload: { completed: !completed } })}
        className={`mt-3 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          completed
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
            : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
        }`}
      >
        {completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
        {completed ? 'Completed' : 'Mark as complete'}
      </button>
    </WidgetCard>
  );
}

export default function Education() {
  const [category, setCategory] = useState<EducationCategory | 'all'>('all');
  const { data: library, isLoading } = useEducationContent(category === 'all' ? undefined : category);
  const { data: progress, isLoading: progressLoading } = useEducationProgress();

  const completedSet = useMemo(() => new Set(progress?.completedIds ?? []), [progress]);
  const bookmarkedSet = useMemo(() => new Set(progress?.bookmarkedIds ?? []), [progress]);

  const categoryOptions = library?.categories ?? [];
  const items = library?.items ?? [];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Health Education</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Learn about nutrition, chronic conditions, preventive care, and more.
        </p>
      </div>

      <WidgetCard>
        <SectionHeader title="Your Learning Progress" />
        <div className="mt-3">
          {progressLoading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <ProgressBar completed={progress?.completedCount ?? 0} total={progress?.totalCount ?? 0} />
          )}
        </div>
      </WidgetCard>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            category === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          All
        </button>
        {categoryOptions.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              category === c.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <WidgetCard>
          <EmptyState icon={<GraduationCap size={40} />} title="No content in this category" />
        </WidgetCard>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              completed={completedSet.has(item.id)}
              bookmarked={bookmarkedSet.has(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
