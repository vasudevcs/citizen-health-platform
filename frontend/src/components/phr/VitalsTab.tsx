import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Activity } from 'lucide-react';
import { useVitalHistory, useAddVital } from '../../hooks/useCitizen';
import type { VitalType } from '../../types/health';
import { WidgetCard, SectionHeader, EmptyState } from '../dashboard/DashboardShared';
import { BloodPressureChart, BloodSugarChart, HeartRateChart } from '../dashboard/HealthCharts';

const VITAL_OPTIONS: { label: string; value: VitalType }[] = [
  { label: 'Blood Pressure', value: 'blood_pressure' },
  { label: 'Blood Sugar', value: 'blood_sugar' },
  { label: 'Heart Rate', value: 'heart_rate' },
  { label: 'Weight', value: 'weight' },
  { label: 'BMI', value: 'bmi' },
  { label: 'Oxygen Saturation (SpO2)', value: 'oxygen_saturation' },
  { label: 'Sleep', value: 'sleep' },
  { label: 'Activity (Steps)', value: 'activity' },
];

const vitalSchema = z.object({
  type: z.string(),
  primary: z.number().min(0, "Must be positive"),
  secondary: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

type VitalFormData = z.infer<typeof vitalSchema>;

export default function VitalsTab() {
  const [selectedType, setSelectedType] = useState<VitalType>('blood_pressure');
  const [isAdding, setIsAdding] = useState(false);

  const { data: history = [] } = useVitalHistory(selectedType, 30);
  const addVital = useAddVital();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<VitalFormData>({
    resolver: zodResolver(vitalSchema),
    defaultValues: { type: selectedType, unit: 'mmHg' }
  });

  const watchType = watch('type') as VitalType;

  const onSubmit = (data: VitalFormData) => {
    addVital.mutate({
      type: data.type as VitalType,
      value: { primary: data.primary, secondary: data.secondary },
      unit: data.unit,
      notes: data.notes,
    }, {
      onSuccess: () => {
        setIsAdding(false);
        reset();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as VitalType)}
          className="rounded-lg border-slate-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {VITAL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <Plus size={16} />
          {isAdding ? 'Cancel' : 'Add Vital'}
        </button>
      </div>

      {isAdding && (
        <WidgetCard className="bg-slate-50 dark:bg-slate-800/50">
          <SectionHeader title="Log New Vital" />
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Vital Type</label>
                <select
                  {...register('type')}
                  onChange={(e) => {
                    register('type').onChange(e);
                    const units: Record<string, string> = {
                      blood_pressure: 'mmHg', blood_sugar: 'mg/dL', heart_rate: 'bpm',
                      weight: 'kg', bmi: 'kg/m²', oxygen_saturation: '%', sleep: 'hrs', activity: 'steps'
                    };
                    reset({ type: e.target.value, unit: units[e.target.value] || '' });
                  }}
                  className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {VITAL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Value {watchType === 'blood_pressure' && '(Systolic)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('primary', { valueAsNumber: true })}
                    className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    placeholder="e.g. 120"
                  />
                  {errors.primary && <span className="text-xs text-red-500">{errors.primary.message}</span>}
                </div>
                {watchType === 'blood_pressure' && (
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Diastolic</label>
                    <input
                      type="number"
                      step="any"
                      {...register('secondary', { valueAsNumber: true })}
                      className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      placeholder="e.g. 80"
                    />
                  </div>
                )}
                <div className="w-24">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    {...register('unit')}
                    className="w-full rounded-md border-slate-300 py-2 px-3 text-sm bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full rounded-md border-slate-300 py-2 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholder="Any additional context..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addVital.isPending}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {addVital.isPending ? 'Saving...' : 'Save Vital'}
              </button>
            </div>
          </form>
        </WidgetCard>
      )}

      {/* Chart View */}
      {selectedType === 'blood_pressure' && <BloodPressureChart data={history} />}
      {selectedType === 'blood_sugar' && <BloodSugarChart data={history} />}
      {selectedType === 'heart_rate' && <HeartRateChart data={history} />}
      
      {/* Fallback list for other vitals */}
      {selectedType !== 'blood_pressure' && selectedType !== 'blood_sugar' && selectedType !== 'heart_rate' && (
        <WidgetCard>
          <SectionHeader title={`${VITAL_OPTIONS.find(o => o.value === selectedType)?.label} History`} />
          {history.length === 0 ? (
            <EmptyState icon={<Activity size={40} />} title="No data recorded" />
          ) : (
            <div className="mt-4 space-y-2">
              {history.map(item => (
                <div key={item._id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg dark:border-slate-700">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.value.primary} {item.unit}
                    </span>
                    {item.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.notes}</p>}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(item.recordedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </WidgetCard>
      )}
    </div>
  );
}
