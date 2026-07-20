import {
  Activity,
  Droplets,
  Heart,
  Scale,
  Wind,
  Moon,
  Footprints,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { HealthVital, VitalType } from '../../types/health';
import { WidgetCard } from './DashboardShared';

// ─── Config per vital type ────────────────────────────────────────────────────
const vitalConfig: Record<
  VitalType,
  {
    label: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    unit: string;
    format: (v: HealthVital['value']) => string;
    normalRange?: string;
    getStatus: (v: HealthVital['value']) => 'normal' | 'warning' | 'danger';
  }
> = {
  blood_pressure: {
    label: 'Blood Pressure',
    icon: Activity,
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    unit: 'mmHg',
    format: (v) => `${v.primary ?? '--'}/${v.secondary ?? '--'}`,
    normalRange: '120/80',
    getStatus: (v) => {
      if (!v.primary) return 'normal';
      if (v.primary > 140 || (v.secondary ?? 0) > 90) return 'danger';
      if (v.primary > 130 || (v.secondary ?? 0) > 85) return 'warning';
      return 'normal';
    },
  },
  blood_sugar: {
    label: 'Blood Sugar',
    icon: Droplets,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    unit: 'mg/dL',
    format: (v) => `${v.primary ?? '--'}`,
    normalRange: '70–100',
    getStatus: (v) => {
      if (!v.primary) return 'normal';
      if (v.primary > 200 || v.primary < 70) return 'danger';
      if (v.primary > 126) return 'warning';
      return 'normal';
    },
  },
  bmi: {
    label: 'BMI',
    icon: Scale,
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    unit: 'kg/m²',
    format: (v) => `${v.primary?.toFixed(1) ?? '--'}`,
    normalRange: '18.5–24.9',
    getStatus: (v) => {
      if (!v.primary) return 'normal';
      if (v.primary < 18.5 || v.primary >= 30) return 'danger';
      if (v.primary >= 25) return 'warning';
      return 'normal';
    },
  },
  heart_rate: {
    label: 'Heart Rate',
    icon: Heart,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    unit: 'bpm',
    format: (v) => `${v.primary ?? '--'}`,
    normalRange: '60–100',
    getStatus: (v) => {
      if (!v.primary) return 'normal';
      if (v.primary > 100 || v.primary < 50) return 'danger';
      if (v.primary > 90 || v.primary < 60) return 'warning';
      return 'normal';
    },
  },
  weight: {
    label: 'Weight',
    icon: Scale,
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    unit: 'kg',
    format: (v) => `${v.primary?.toFixed(1) ?? '--'}`,
    getStatus: () => 'normal',
  },
  oxygen_saturation: {
    label: 'SpO₂',
    icon: Wind,
    iconBg: 'bg-sky-100 dark:bg-sky-900/30',
    iconColor: 'text-sky-600 dark:text-sky-400',
    unit: '%',
    format: (v) => `${v.primary ?? '--'}`,
    normalRange: '95–100',
    getStatus: (v) => {
      if (!v.primary) return 'normal';
      if (v.primary < 90) return 'danger';
      if (v.primary < 95) return 'warning';
      return 'normal';
    },
  },
  sleep: {
    label: 'Sleep',
    icon: Moon,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    unit: 'hrs',
    format: (v) => `${v.primary?.toFixed(1) ?? '--'}`,
    normalRange: '7–9 hrs',
    getStatus: (v) => {
      if (!v.primary) return 'normal';
      if (v.primary < 5 || v.primary > 10) return 'warning';
      return 'normal';
    },
  },
  activity: {
    label: 'Steps Today',
    icon: Footprints,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    unit: 'steps',
    format: (v) => v.primary ? v.primary.toLocaleString() : '--',
    normalRange: '10,000 goal',
    getStatus: (v) => {
      if (!v.primary) return 'normal';
      if (v.primary < 3000) return 'warning';
      return 'normal';
    },
  },
};

const statusColors = {
  normal: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
};

// ─── Single Vital Widget ──────────────────────────────────────────────────────
interface VitalWidgetProps {
  type: VitalType;
  vital?: HealthVital;
  trend?: 'up' | 'down' | 'stable';
}

export function VitalWidget({ type, vital, trend = 'stable' }: VitalWidgetProps) {
  const config = vitalConfig[type];
  const Icon = config.icon;
  const status = vital ? config.getStatus(vital.value) : 'normal';
  const displayValue = vital ? config.format(vital.value) : '--';
  const lastRecorded = vital
    ? new Date(vital.recordedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    : 'No data';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <WidgetCard hover>
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${config.iconBg}`}>
          <Icon size={20} className={config.iconColor} />
        </div>
        <TrendIcon
          size={16}
          className={
            trend === 'stable' ? 'text-slate-400' : trend === 'up' ? 'text-rose-500' : 'text-emerald-500'
          }
        />
      </div>

      <div className="mt-3">
        <p className={`text-2xl font-bold ${statusColors[status]}`}>
          {displayValue}
          {vital && (
            <span className="ml-1 text-sm font-normal text-slate-400">{config.unit}</span>
          )}
        </p>
        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          {config.label}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between">
        {config.normalRange && (
          <span className="text-[11px] text-slate-400">Normal: {config.normalRange}</span>
        )}
        <span className="text-[11px] text-slate-400">{lastRecorded}</span>
      </div>
    </WidgetCard>
  );
}
