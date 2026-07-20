import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WidgetCard, SectionHeader } from '../dashboard/DashboardShared';
import { useCreatePrescription } from '../../hooks/useDoctor';

const schema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  instructions: z.string().max(500).optional(),
});
type FormData = z.infer<typeof schema>;

export default function PrescribeForm({ citizenId, onDone }: { citizenId: string; onDone: () => void }) {
  const createPrescription = useCreatePrescription();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    createPrescription.mutate(
      {
        citizenId,
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        instructions: data.instructions,
      },
      { onSuccess: () => { reset(); onDone(); } }
    );
  };

  return (
    <WidgetCard>
      <SectionHeader title="New prescription" subtitle="The patient will see this in their Medications list immediately." />
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Medication name</label>
          <input {...register('name')} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Metformin" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Dosage</label>
          <input {...register('dosage')} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. 500mg" />
          {errors.dosage && <p className="mt-1 text-xs text-red-500">{errors.dosage.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Frequency</label>
          <input {...register('frequency')} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Twice daily" />
          {errors.frequency && <p className="mt-1 text-xs text-red-500">{errors.frequency.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Start date</label>
            <input type="date" {...register('startDate')} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">End date (optional)</label>
            <input type="date" {...register('endDate')} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Instructions (optional)</label>
          <textarea rows={2} {...register('instructions')} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Take with food" />
        </div>
        {createPrescription.isError && (
          <p className="sm:col-span-2 text-xs text-red-500">Couldn't save the prescription. Please try again.</p>
        )}
        <div className="sm:col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={createPrescription.isPending}
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {createPrescription.isPending ? 'Saving…' : 'Save Prescription'}
          </button>
          <button type="button" onClick={onDone} className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400">
            Cancel
          </button>
        </div>
      </form>
    </WidgetCard>
  );
}
