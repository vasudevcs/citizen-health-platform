import { Sparkles, ArrowRight, Brain, Dumbbell, Apple, Moon } from 'lucide-react';
import { WidgetCard, SectionHeader } from './DashboardShared';
import type { HealthScore } from '../../types/health';

interface AIRecommendationsProps {
  healthScore: HealthScore;
  hasLowSleep?: boolean;
  hasHighBP?: boolean;
  hasLowActivity?: boolean;
}

interface Recommendation {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const priorityColors = {
  high: 'border-l-4 border-red-400',
  medium: 'border-l-4 border-amber-400',
  low: 'border-l-4 border-emerald-400',
};

export function AIRecommendations({
  healthScore,
  hasLowSleep = false,
  hasHighBP = false,
  hasLowActivity = false,
}: AIRecommendationsProps) {
  const recs: Recommendation[] = [];

  if (hasHighBP) {
    recs.push({
      icon: Brain,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      title: 'Manage Blood Pressure',
      description: 'Consider reducing salt intake and practicing stress-relief exercises like deep breathing or meditation.',
      priority: 'high',
    });
  }

  if (hasLowSleep) {
    recs.push({
      icon: Moon,
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      title: 'Improve Sleep Quality',
      description: 'Aim for 7–9 hours of sleep. Maintain a consistent sleep schedule and avoid screens 1 hour before bed.',
      priority: 'medium',
    });
  }

  if (hasLowActivity) {
    recs.push({
      icon: Dumbbell,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      title: 'Increase Physical Activity',
      description: 'Try to reach 10,000 steps daily. Even a 30-minute walk makes a significant difference.',
      priority: 'medium',
    });
  }

  if (healthScore.score >= 70) {
    recs.push({
      icon: Apple,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: 'Maintain Balanced Diet',
      description: 'Keep up your healthy habits. Include more colorful vegetables and reduce processed food consumption.',
      priority: 'low',
    });
  }

  // Default recommendation
  if (recs.length === 0) {
    recs.push({
      icon: Sparkles,
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      title: 'Keep Logging Your Vitals',
      description: 'AI-powered recommendations improve as you log more health data. Start by adding your daily readings.',
      priority: 'low',
    });
  }

  return (
    <WidgetCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-teal-600 dark:text-teal-400" />
            <SectionHeader title="AI Health Insights" />
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Personalized recommendations based on your data
          </p>
        </div>
        <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          AI Preview
        </span>
      </div>

      <ul className="space-y-3">
        {recs.slice(0, 3).map((rec, i) => {
          const Icon = rec.icon;
          return (
            <li
              key={i}
              className={`rounded-r-xl bg-slate-50 p-3 dark:bg-slate-800/60 ${priorityColors[rec.priority]}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 rounded-lg p-1.5 ${rec.iconBg}`}>
                  <Icon size={15} className={rec.iconColor} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{rec.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {rec.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-xl border border-dashed border-teal-300 bg-teal-50 p-3 dark:border-teal-700 dark:bg-teal-900/10">
        <p className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400">
          <Sparkles size={12} />
          Full AI analysis with GPT-4 integration coming in Phase 18.
          <ArrowRight size={12} />
        </p>
      </div>
    </WidgetCard>
  );
}
