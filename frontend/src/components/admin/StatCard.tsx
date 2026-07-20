import type { ReactNode } from 'react';
import { WidgetCard } from '../dashboard/DashboardShared';

export default function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <WidgetCard>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </WidgetCard>
  );
}
