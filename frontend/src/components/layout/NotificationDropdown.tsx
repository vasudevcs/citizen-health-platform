import { useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
}

export function NotificationDropdown({ notifications, onMarkAllRead }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useClickOutside(ref, () => setIsOpen(false), isOpen);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <Bell size={16} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-800 dark:text-slate-100">Notifications</span>
            {unreadCount > 0 && onMarkAllRead && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-teal-700 hover:underline dark:text-teal-400"
              >
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-slate-400">No notifications yet</li>
            )}
            {notifications.map((n) => (
              <li
                key={n.id}
                role="menuitem"
                className={`border-b border-slate-50 px-4 py-2.5 text-xs last:border-b-0 dark:border-slate-700/50 ${
                  n.isRead ? 'text-slate-500 dark:text-slate-400' : 'bg-teal-50/50 text-slate-800 dark:bg-teal-900/10 dark:text-slate-100'
                }`}
              >
                <p className="font-medium">{n.title}</p>
                <p className="mt-0.5 text-slate-400 dark:text-slate-500">{n.message}</p>
                <p className="mt-1 text-[10px] text-slate-300 dark:text-slate-600">{n.createdAt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
