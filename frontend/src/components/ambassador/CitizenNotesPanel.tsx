import { useState } from 'react';
import { X } from 'lucide-react';
import { WidgetCard, SectionHeader, Skeleton } from '../dashboard/DashboardShared';
import { useCitizenNotes, useAddAmbassadorNote } from '../../hooks/useAmbassador';
import { CATEGORY_LABELS } from './categoryLabels';
import type { CitizenRow, NoteCategory } from '../../types/ambassador';

export default function CitizenNotesPanel({
  citizen,
  onClose,
}: {
  citizen: CitizenRow;
  onClose?: () => void;
}) {
  const { data: notes, isLoading } = useCitizenNotes(citizen._id);
  const addNote = useAddAmbassadorNote();
  const [category, setCategory] = useState<NoteCategory>('visit');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!note.trim()) return;
    addNote.mutate(
      { citizenId: citizen._id, category, note: note.trim() },
      { onSuccess: () => setNote('') }
    );
  };

  return (
    <WidgetCard>
      <div className="flex items-center justify-between">
        <SectionHeader title={citizen.name} subtitle={citizen.email} />
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close panel" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as NoteCategory)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Log a field note…"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={addNote.isPending || !note.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {addNote.isPending ? 'Saving…' : 'Add Note'}
        </button>
      </div>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : !notes || notes.length === 0 ? (
          <p className="text-xs text-slate-400">No notes logged yet.</p>
        ) : (
          notes.map((n) => (
            <div key={n._id} className="rounded-lg border border-slate-100 p-2 text-xs dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{CATEGORY_LABELS[n.category]}</span>
                <span>{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{n.note}</p>
            </div>
          ))
        )}
      </div>
    </WidgetCard>
  );
}
