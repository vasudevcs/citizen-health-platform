import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { NotificationDropdown, NotificationItem } from './NotificationDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';

interface TopNavProps {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
}

export function TopNav({ notifications, onMarkAllRead }: TopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const { openMobile } = useSidebar();

  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-4 bg-teal-700 px-4 text-white sm:px-6">
      <button
        type="button"
        onClick={openMobile}
        aria-label="Open navigation menu"
        className="-ml-1 flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 md:hidden"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className="flex-1">
        <p className="text-sm font-medium leading-tight">Citizen Health Platform</p>
        <p className="hidden text-[11px] leading-tight text-white/70 sm:block">
          National Digital Health & Wellbeing Mission
        </p>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {theme === 'light' ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
      </button>

      <NotificationDropdown notifications={notifications} onMarkAllRead={onMarkAllRead} />
      <UserProfileDropdown />
    </header>
  );
}
