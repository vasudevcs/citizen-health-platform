import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { navigationConfig, roleLabels } from '../../config/navigationConfig';
import { useSidebar } from '../../contexts/SidebarContext';
import type { Role } from '../../types/auth';

interface MobileDrawerProps {
  role: Role;
}

export function MobileDrawer({ role }: MobileDrawerProps) {
  const { isMobileOpen, closeMobile } = useSidebar();
  const items = navigationConfig[role];
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Move focus into the drawer when it opens (basic focus management)
  useEffect(() => {
    if (isMobileOpen) closeButtonRef.current?.focus();
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isMobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${roleLabels[role]} navigation`}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white py-4 shadow-xl dark:bg-slate-900 md:hidden"
          >
            <div className="mb-2 flex items-center justify-between px-4">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Menu</p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMobile}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 border-r-[3px] px-4 py-2.5 text-sm ${
                        isActive
                          ? 'border-teal-700 bg-teal-50 font-medium text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                          : 'border-transparent text-slate-600 dark:text-slate-300'
                      }`
                    }
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
