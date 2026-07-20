import UserManagement from '../../components/admin/UserManagement';

export default function AdminUsers() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Search, filter, and manage account access across all roles.
        </p>
      </div>

      <UserManagement />
    </div>
  );
}
