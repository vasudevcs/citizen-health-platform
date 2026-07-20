import ModerationQueue from '../../components/admin/ModerationQueue';

export default function AdminModeration() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Moderation</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Review and restore removed community posts.
        </p>
      </div>

      <ModerationQueue />
    </div>
  );
}
