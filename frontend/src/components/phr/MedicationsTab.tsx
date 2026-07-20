import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pill, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMedications } from '../../hooks/useCitizen';
import { citizenApi } from '../../services/citizenService';
import { citizenKeys } from '../../hooks/useCitizen';
import { WidgetCard, SectionHeader, EmptyState } from '../dashboard/DashboardShared';

const medicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  times: z.string().optional(), // Comma-separated
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  instructions: z.string().optional(),
  prescribedBy: z.string().optional(),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

export default function MedicationsTab() {
  const [isAdding, setIsAdding] = useState(false);
  const { data: medications = [], isLoading } = useMedications();
  const qc = useQueryClient();

  const addMedication = useMutation({
    mutationFn: citizenApi.addMedication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: citizenKeys.medications });
      qc.invalidateQueries({ queryKey: citizenKeys.dashboard });
      setIsAdding(false);
      reset();
    },
  });

  const markTaken = useMutation({
    mutationFn: citizenApi.markMedicationTaken,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: citizenKeys.medications });
      qc.invalidateQueries({ queryKey: citizenKeys.dashboard });
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = (data: MedicationFormData) => {
    addMedication.mutate({
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      times: data.times ? data.times.split(',').map(t => t.trim()).filter(Boolean) : [],
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      instructions: data.instructions,
      isActive: true,
      prescribedBy: data.prescribedBy,
    });
  };

  const isTakenToday = (takenDates: string[]): boolean => {
    const today = new Date().toDateString();
    return takenDates.some((d) => new Date(d).toDateString() === today);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          <Plus size={16} />
          {isAdding ? 'Cancel' : 'Add Medication'}
        </button>
      </div>

      {isAdding && (
        <WidgetCard className="bg-slate-50 dark:bg-slate-800/50">
          <SectionHeader title="Add New Medication" />
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Medication Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. Lisinopril"
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
                <input
                  type="text"
                  {...register('dosage')}
                  className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. 10mg"
                />
                {errors.dosage && <span className="text-xs text-red-500">{errors.dosage.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                <input
                  type="text"
                  {...register('frequency')}
                  className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. Twice daily"
                />
                {errors.frequency && <span className="text-xs text-red-500">{errors.frequency.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Times (comma-separated)</label>
                <input
                  type="text"
                  {...register('times')}
                  className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. 08:00, 20:00"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                {errors.startDate && <span className="text-xs text-red-500">{errors.startDate.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prescribed By</label>
                <input
                  type="text"
                  {...register('prescribedBy')}
                  className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. Dr. Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
              <textarea
                {...register('instructions')}
                rows={2}
                className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholder="e.g. Take with food"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addMedication.isPending}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {addMedication.isPending ? 'Saving...' : 'Save Medication'}
              </button>
            </div>
          </form>
        </WidgetCard>
      )}

      {/* Medication List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-slate-500">Loading medications...</p>
        ) : medications.length === 0 ? (
          <div className="col-span-full">
            <WidgetCard>
              <EmptyState icon={<Pill size={40} />} title="No medications found" description="Add your first medication above." />
            </WidgetCard>
          </div>
        ) : (
          medications.map(med => {
            const taken = isTakenToday(med.takenDates);
            return (
              <WidgetCard key={med._id} className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${taken ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <Pill size={20} className={taken ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{med.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{med.dosage}</p>
                    </div>
                  </div>
                  {taken ? (
                     <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : (
                     <AlertCircle size={20} className="text-amber-500" />
                  )}
                </div>
                
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-grow">
                  <p><span className="font-medium text-slate-700 dark:text-slate-300">Frequency:</span> {med.frequency}</p>
                  {med.times && med.times.length > 0 && (
                    <p className="flex items-center gap-1 mt-1">
                      <Clock size={14} /> {med.times.join(', ')}
                    </p>
                  )}
                  {med.instructions && (
                    <p className="mt-2 text-xs italic">"{med.instructions}"</p>
                  )}
                </div>

                {!taken && (
                  <button
                    onClick={() => markTaken.mutate(med._id)}
                    disabled={markTaken.isPending}
                    className="w-full mt-auto py-2 rounded-md bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/40 transition-colors"
                  >
                    Mark as Taken
                  </button>
                )}
                {taken && (
                  <div className="w-full mt-auto py-2 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 rounded-md">
                    Taken Today
                  </div>
                )}
              </WidgetCard>
            )
          })
        )}
      </div>
    </div>
  );
}
