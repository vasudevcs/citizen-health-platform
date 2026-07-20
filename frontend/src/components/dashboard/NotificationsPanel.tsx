import { Bell, Clock, Info, Calendar, FlaskConical, Pill, AlertCircle, Heart } from 'lucide-react';
import type { AppNotification, NotificationType } from '../../types/health';
import { WidgetCard, SectionHeader, EmptyState } from './DashboardShared';

interface NotificationsPanelProps {
  notifications: AppNotification[];
}

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  appointment: {
    icon: Calendar,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  medication: {
    icon: Pill,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  lab_report: {
    icon: FlaskConical,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
  },
  health_alert: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
  },
  system: {
    icon: Info,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-700',
  },
  telemedicine: {
    icon: Calendar,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-100 dark:bg-teal-900/30',
  },
  community: {
    icon: Info,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  wellbeing: {
    icon: Heart,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
  },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <WidgetCard>
      <div className="mb-4 flex items-center justify-between">
        <SectionHeader
          title="Recent Notifications"
          subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        />
        {unread > 0 && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={40} />}
          title="No notifications"
          description="We'll notify you about appointments, medications, and health alerts."
        />
      ) : (
        <ul className="space-y-2">
          {notifications.slice(0, 6).map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.system;
            const Icon = config.icon;

            return (
              <li
                key={notif._id}
                className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${
                  !notif.isRead
                    ? 'bg-teal-50 dark:bg-teal-900/10'
                    : 'bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div className={`flex-shrink-0 rounded-lg p-1.5 ${config.bg}`}>
                  <Icon size={14} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {notif.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {notif.message}
                  </p>
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock size={9} />
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>
                {!notif.isRead && (
                  <div className="mt-1.5 flex-shrink-0 h-2 w-2 rounded-full bg-teal-500" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}
