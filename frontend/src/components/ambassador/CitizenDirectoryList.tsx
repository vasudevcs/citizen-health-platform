import { useState } from 'react';
import { Users } from 'lucide-react';
import { EmptyState, Skeleton } from '../dashboard/DashboardShared';
import { useAmbassadorCitizens } from '../../hooks/useAmbassador';
import type { CitizenRow } from '../../types/ambassador';

export default function CitizenDirectoryList({
  onSelect,
  selectedId,
  maxHeightClassName = 'max-h-96',
}: {
  onSelect: (citizen: CitizenRow) => void;
  selectedId?: string;
  maxHeightClassName?: string;
}) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAmbassadorCitizens(1, search || undefined);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search citizens…"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />
      <div className={`mt-3 space-y-2 overflow-y-auto ${maxHeightClassName}`}>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !data || data.data.length === 0 ? (
          <EmptyState icon={<Users size={32} />} title="No citizens found" />
        ) : (
          data.data.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => onSelect(c)}
              className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-sm transition-colors ${
                selectedId === c._id
                  ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                  : 'border-slate-100 hover:border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">{c.name}</p>
                <p className="text-xs text-slate-400">{c.email}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
