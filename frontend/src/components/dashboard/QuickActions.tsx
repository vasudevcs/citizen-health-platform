import { 
  Plus, 
  FileText, 
  Stethoscope, 
  Activity, 
  Phone,
  AlertTriangle,
  CalendarPlus,
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';
import { WidgetCard, SectionHeader } from './DashboardShared';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'log-vital',
    label: 'Log Vitals',
    icon: Activity,
    href: '/phr?tab=vitals',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 hover:bg-teal-200 dark:bg-teal-900/30 dark:hover:bg-teal-900/50',
  },
  {
    id: 'book-appt',
    label: 'Book Appointment',
    icon: CalendarPlus,
    href: '/telemedicine',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50',
  },
  {
    id: 'upload-report',
    label: 'Upload Report',
    icon: Upload,
    href: '/phr?tab=reports',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50',
  },
  {
    id: 'consult-doctor',
    label: 'Consult Doctor',
    icon: Stethoscope,
    href: '/telemedicine',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50',
  },
  {
    id: 'add-medication',
    label: 'Add Medication',
    icon: Plus,
    href: '/phr?tab=medications',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50',
  },
  {
    id: 'health-records',
    label: 'Health Records',
    icon: FileText,
    href: '/phr',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50',
  },
];

export function QuickActions() {
  return (
    <WidgetCard>
      <div className="mb-4">
        <SectionHeader title="Quick Actions" subtitle="Common tasks at a glance" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.a
              key={action.id}
              href={action.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-colors ${action.bgColor}`}
            >
              <Icon size={22} className={`mb-1.5 ${action.color}`} />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                {action.label}
              </span>
            </motion.a>
          );
        })}
      </div>
    </WidgetCard>
  );
}

// ─── Emergency Contact ────────────────────────────────────────────────────────
export function EmergencyContact() {
  return (
    <WidgetCard className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-xl bg-red-100 p-2.5 dark:bg-red-900/30">
          <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-400">Emergency Contacts</h3>
          <div className="mt-2 space-y-2">
            <a
              href="tel:108"
              className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            >
              <Phone size={13} />
              Ambulance — 108
            </a>
            <a
              href="tel:104"
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 dark:bg-transparent dark:border-red-700 dark:text-red-400 transition-colors"
            >
              <Phone size={13} />
              Health Helpline — 104
            </a>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
