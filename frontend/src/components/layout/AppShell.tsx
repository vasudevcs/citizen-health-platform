import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';
import { Breadcrumb } from './Breadcrumb';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { SidebarProvider } from '../../contexts/SidebarContext';
import type { Role } from '../../types/auth';
import type { NotificationItem } from './NotificationDropdown';

interface AppShellProps {
  role: Role;
  notifications?: NotificationItem[];
  onMarkAllRead?: () => void;
}

// One shell, parameterized by role. Each role's <Route element={<RoleLayout />}>
// wraps its child routes in this exact structure - see layouts/*.tsx for the
// thin per-role exports used directly in the router.
export function AppShell({ role, notifications = [], onMarkAllRead }: AppShellProps) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col bg-white dark:bg-slate-950">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-teal-700 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to main content
        </a>

        <TopNav notifications={notifications} onMarkAllRead={onMarkAllRead} />

        <div className="flex min-h-0 flex-1">
          <Sidebar role={role} />
          <MobileDrawer role={role} />

          <div className="flex min-h-0 flex-1 flex-col">
            <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6" tabIndex={-1}>
              <Breadcrumb role={role} />
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <Outlet />
                </PageTransition>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
