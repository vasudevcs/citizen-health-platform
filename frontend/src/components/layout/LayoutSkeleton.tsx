export function LayoutSkeleton() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Loading content">
      <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="hidden w-56 flex-shrink-0 space-y-2 border-r border-slate-200 p-4 dark:border-slate-700 md:block">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  );
}
