import { useState } from 'react';
import { Users, ShieldCheck, ShieldOff } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../dashboard/DashboardShared';
import { useAdminUsers, useSetUserActive } from '../../hooks/useAdmin';

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const { data, isLoading } = useAdminUsers(1, role || undefined, search || undefined);
  const setActive = useSetUserActive();

  return (
    <WidgetCard>
      <SectionHeader title="User Management" subtitle="Search, filter, and manage account access" />
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="flex-1 min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="">All roles</option>
          <option value="citizen">Citizen</option>
          <option value="doctor">Doctor</option>
          <option value="ambassador">Ambassador</option>
          <option value="researcher">Researcher</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !data || data.data.length === 0 ? (
          <EmptyState icon={<Users size={32} />} title="No users found" />
        ) : (
          data.data.map((u) => (
            <div
              key={u._id}
              className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800 dark:text-slate-200">{u.name}</p>
                <p className="truncate text-xs text-slate-400">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {u.role}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {u.isActive ? 'Active' : 'Deactivated'}
                </span>
                <button
                  type="button"
                  onClick={() => setActive.mutate({ id: u._id, isActive: !u.isActive })}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {u.isActive ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </WidgetCard>
  );
}
