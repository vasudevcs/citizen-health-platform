import { motion } from 'framer-motion';
import type { HealthScore } from '../../types/health';

interface HealthScoreRingProps {
  data: HealthScore;
}

const categoryConfig = {
  Excellent: { color: '#10B981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', desc: 'Your health is in excellent shape!' },
  Good: { color: '#3B82F6', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', desc: 'Keep up the good work!' },
  Fair: { color: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', desc: 'Some areas need attention.' },
  Poor: { color: '#EF4444', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', desc: 'Please consult a doctor.' },
};

export function HealthScoreRing({ data }: HealthScoreRingProps) {
  const { score, category } = data;
  const config = categoryConfig[category];

  // SVG ring parameters
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background track */}
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-700"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-slate-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
        </div>
      </div>

      <div className={`mt-4 rounded-xl px-4 py-2 ${config.bg}`}>
        <p className={`text-sm font-semibold ${config.text}`}>{category}</p>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">{config.desc}</p>
    </div>
  );
}
