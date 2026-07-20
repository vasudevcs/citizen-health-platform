import { useMemo, useState, type ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { AlertTriangle, HeartPulse, Droplet, Activity, Scale, Info, ChevronRight } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import { useRunRiskAssessment, useRiskAssessmentHistory } from '../../hooks/useCitizen';
import type { RiskCondition, RiskConditionResult, RiskLevel } from '../../types/health';

// ─── Form schema ────────────────────────────────────────────────────────────
const profileSchema = z.object({
  age: z.number({ invalid_type_error: 'Age is required' }).int().min(1, 'Enter a valid age').max(120, 'Enter a valid age'),
  gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: 'Select a gender' }) }),
  smoker: z.boolean(),
  familyHistory: z.object({
    diabetes: z.boolean(),
    hypertension: z.boolean(),
    cardiovascular: z.boolean(),
    obesity: z.boolean(),
  }),
});
type ProfileFormData = z.infer<typeof profileSchema>;

// ─── Static display config (labels/icons only — thresholds live server-side) ──
const CONDITION_META: Record<RiskCondition, { label: string; icon: ReactNode }> = {
  diabetes: { label: 'Diabetes', icon: <Droplet size={18} /> },
  hypertension: { label: 'Hypertension', icon: <HeartPulse size={18} /> },
  cardiovascular: { label: 'Cardiovascular Disease', icon: <Activity size={18} /> },
  obesity: { label: 'Obesity', icon: <Scale size={18} /> },
};
const CONDITION_ORDER: RiskCondition[] = ['diabetes', 'hypertension', 'cardiovascular', 'obesity'];

const LEVEL_STYLES: Record<RiskLevel, { bar: string; badge: string }> = {
  low: { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  moderate: { bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  high: { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  critical: { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

function ConditionCard({ condition, result }: { condition: RiskCondition; result: RiskConditionResult }) {
  const meta = CONDITION_META[condition];
  const style = LEVEL_STYLES[result.level];

  return (
    <WidgetCard>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          {meta.icon}
          <h3 className="text-sm font-semibold">{meta.label}</h3>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${style.badge}`}>
          {result.level}
        </span>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Risk score</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{result.score}/100</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.score}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full ${style.bar}`}
          />
        </div>
      </div>

      {result.factors.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Contributing factors</p>
          <ul className="space-y-1">
            {result.factors.map((f, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <ChevronRight size={13} className="mt-0.5 flex-shrink-0 text-slate-400" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Recommendations</p>
        <ul className="space-y-1">
          {result.recommendations.map((r, i) => (
            <li key={i} className="flex gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <ChevronRight size={13} className="mt-0.5 flex-shrink-0 text-teal-500" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </WidgetCard>
  );
}

export default function RiskAssessment() {
  const [showForm, setShowForm] = useState(true);
  const runAssessment = useRunRiskAssessment();
  const history = useRiskAssessmentHistory(10);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      smoker: false,
      familyHistory: { diabetes: false, hypertension: false, cardiovascular: false, obesity: false },
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    runAssessment.mutate(data, { onSuccess: () => setShowForm(false) });
  };

  // trend chart: score per condition across past assessments (oldest -> newest)
  const trendData = useMemo(() => {
    const rows = [...(history.data ?? [])].reverse();
    return rows.map((h) => ({
      date: new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      diabetes: h.conditions.diabetes.score,
      hypertension: h.conditions.hypertension.score,
      cardiovascular: h.conditions.cardiovascular.score,
      obesity: h.conditions.obesity.score,
    }));
  }, [history.data]);

  const result = runAssessment.data;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Disease Risk Assessment</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          A rule-based screening across four conditions, using your latest recorded vitals plus a few quick questions.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-300">
        <Info size={15} className="mt-0.5 flex-shrink-0" />
        <p>This is an informational screening tool, not a medical diagnosis. Discuss any high or critical results with a doctor.</p>
      </div>

      {/* Profile form */}
      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <WidgetCard>
              <SectionHeader title="Quick profile" subtitle="Used only to compute this assessment — not stored on your account profile." />
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Age</label>
                    <input
                      type="number"
                      {...register('age', { valueAsNumber: true })}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. 42"
                    />
                    {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Gender</label>
                    <select
                      {...register('gender')}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      defaultValue=""
                    >
                      <option value="" disabled>Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <input type="checkbox" {...register('smoker')} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                  I currently smoke
                </label>

                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">Family history of:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CONDITION_ORDER.map((c) => (
                      <Controller
                        key={c}
                        name={`familyHistory.${c}`}
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            {CONDITION_META[c].label}
                          </label>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {runAssessment.isError && (
                  <p className="text-xs text-red-500">
                    Couldn't run the assessment. Please check your connection and try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={runAssessment.isPending}
                  className="w-full sm:w-auto rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60 transition-colors"
                >
                  {runAssessment.isPending ? 'Analyzing…' : 'Run Risk Assessment'}
                </button>
              </form>
            </WidgetCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionHeader
              title="Latest results"
              subtitle={`Generated ${new Date(result.createdAt).toLocaleString()} · engine ${result.engineVersion}`}
            />
            <button
              onClick={() => setShowForm((s) => !s)}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex-shrink-0"
            >
              {showForm ? 'Hide form' : 'Retake assessment'}
            </button>
          </div>

          {!result.hasVitalsData && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
              <p>No vitals on file yet — this assessment is based only on your profile answers. Log vitals in Personal Health Records for a more accurate score.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONDITION_ORDER.map((c) => (
              <ConditionCard key={c} condition={c} result={result.conditions[c]} />
            ))}
          </div>
        </div>
      )}

      {/* History trend */}
      <WidgetCard>
        <SectionHeader title="Risk score history" subtitle="How your scores have moved across past assessments" />
        <div className="h-56 mt-4">
          {history.isLoading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : trendData.length < 2 ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              <EmptyState
                icon={<Activity size={32} />}
                title="Not enough history yet"
                description="Run at least two assessments over time to see a trend line."
              />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="diabetes" name="Diabetes" stroke="#0d9488" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="hypertension" name="Hypertension" stroke="#dc2626" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="cardiovascular" name="Cardiovascular" stroke="#7c3aed" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="obesity" name="Obesity" stroke="#ea580c" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </WidgetCard>
    </div>
  );
}
