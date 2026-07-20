import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Brain, Flame, CalendarCheck, BookOpen, Video, Phone } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import {
  useMoodHistory,
  useWellbeingSummary,
  useAddMoodEntry,
  useWellbeingResources,
} from '../../hooks/useWellbeing';
import type { MoodLevel, MoodEntry } from '../../types/wellbeing';

const MOOD_OPTIONS: { value: MoodLevel; label: string; emoji: string; score: number }[] = [
  { value: 'great', label: 'Great', emoji: '😄', score: 9 },
  { value: 'good', label: 'Good', emoji: '🙂', score: 7 },
  { value: 'okay', label: 'Okay', emoji: '😐', score: 5 },
  { value: 'low', label: 'Low', emoji: '😕', score: 3 },
  { value: 'struggling', label: 'Struggling', emoji: '😞', score: 2 },
];

function toChartPoints(entries: MoodEntry[]) {
  return entries.map((e) => ({
    date: new Date(e.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: e.score,
  }));
}

// ─── Mood check-in widget ──────────────────────────────────────────────────
function MoodCheckIn() {
  const [selected, setSelected] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState('');
  const addMood = useAddMoodEntry();

  const handleSubmit = () => {
    if (!selected) return;
    const preset = MOOD_OPTIONS.find((m) => m.value === selected)!;
    addMood.mutate(
      { mood: selected, score: preset.score, note: note.trim() || undefined, triggers: [] },
      {
        onSuccess: () => {
          setSelected(null);
          setNote('');
        },
      }
    );
  };

  return (
    <WidgetCard>
      <SectionHeader title="How are you feeling today?" subtitle="A quick daily check-in helps track your wellbeing over time." />
      <div className="mt-4 grid grid-cols-5 gap-2">
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setSelected(m.value)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-colors ${
              selected === m.value
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <span className="text-xl">{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-4 space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={2}
            placeholder="Anything on your mind? (optional)"
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={addMood.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {addMood.isPending ? 'Saving…' : 'Save check-in'}
          </button>
        </div>
      )}
    </WidgetCard>
  );
}

// ─── Summary stats row ──────────────────────────────────────────────────────
function SummaryStats() {
  const { data, isLoading } = useWellbeingSummary();

  const stats = [
    {
      icon: <Brain size={18} />,
      label: '7-Day Avg Score',
      value: data?.sevenDayAverageScore != null ? `${data.sevenDayAverageScore}/10` : '—',
    },
    {
      icon: <Flame size={18} />,
      label: 'Check-in Streak',
      value: data ? `${data.streakDays} day${data.streakDays === 1 ? '' : 's'}` : '—',
    },
    {
      icon: <CalendarCheck size={18} />,
      label: 'Check-ins This Week',
      value: data ? `${data.checkInsThisWeek}` : '—',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <WidgetCard key={s.label}>
          {isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          )}
        </WidgetCard>
      ))}
    </div>
  );
}

// ─── Trend chart ────────────────────────────────────────────────────────────
function MoodTrend() {
  const { data, isLoading } = useMoodHistory(30);
  const points = useMemo(() => (data ? toChartPoints(data) : []), [data]);

  return (
    <WidgetCard>
      <SectionHeader title="Mood Trend" subtitle="Last 30 days" />
      <div className="mt-4 h-56">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-lg" />
        ) : points.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
            <EmptyState icon={<Brain size={40} />} title="No check-ins yet" description="Log your first mood check-in to start your trend." />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="currentColor" className="text-slate-400" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="currentColor" className="text-slate-400" />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }} labelStyle={{ fontWeight: 600 }} />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </WidgetCard>
  );
}

// ─── Resources + crisis support ─────────────────────────────────────────────
function ResourcesAndSupport() {
  const { data, isLoading } = useWellbeingResources();

  return (
    <div className="space-y-4">
      <WidgetCard>
        <SectionHeader title="Resources & Exercises" subtitle="Short practices and reading to support your wellbeing" />
        <div className="mt-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
          ) : (
            data?.resources.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  {r.category === 'exercise' ? <Video size={16} /> : <BookOpen size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{r.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{r.description}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {r.durationMinutes} min · {r.category}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </WidgetCard>

      <WidgetCard className="border-red-100 dark:border-red-900/40">
        <SectionHeader title="Need to talk to someone now?" subtitle="Free, confidential support is available 24/7" />
        <div className="mt-4 space-y-2">
          {data?.crisisContacts.map((c) => (
            <div key={c.name} className="flex items-center gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <Phone size={16} className="flex-shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{c.name}</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">{c.contact} · {c.available}</p>
              </div>
            </div>
          ))}
        </div>
      </WidgetCard>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function MentalWellbeing() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mental Wellbeing</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Track your mood and access mental health resources.
        </p>
      </div>

      <MoodCheckIn />
      <SummaryStats />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MoodTrend />
        </div>
        <div>
          <ResourcesAndSupport />
        </div>
      </div>
    </div>
  );
}
