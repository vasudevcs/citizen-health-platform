import { useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useAuth } from '../../hooks/useAuth';
import { roleLabels, settingsPath } from '../../config/navigationConfig';

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useClickOutside(ref, () => setIsOpen(false), isOpen);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-medium">
          {initials}
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
            <span className="mt-1.5 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
              {roleLabels[user.role]}
            </span>
          </div>
          <Link
            to={settingsPath[user.role]}
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
          >
            <Settings size={14} aria-hidden="true" /> Settings
          </Link>
          <button
            role="menuitem"
            onClick={() => logout()}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={14} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
