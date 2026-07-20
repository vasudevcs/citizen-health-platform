import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { navigationConfig, dashboardPath } from '../../config/navigationConfig';
import type { Role } from '../../types/auth';

interface BreadcrumbProps {
  role: Role;
}

// Finds the matching nav item for the current path and renders
// Home > Section > Page. Falls back to a humanized path segment
// if the route isn't in the nav config (e.g. detail pages like /doctor/:id).
export function Breadcrumb({ role }: BreadcrumbProps) {
  const location = useLocation();
  const navItems = navigationConfig[role];
  const match = navItems.find((item) => location.pathname.startsWith(item.path));

  const trail: { label: string; path?: string }[] = [{ label: 'Home', path: dashboardPath[role] }];
  if (match) {
    if (match.section) trail.push({ label: match.section });
    trail.push({ label: match.label, path: match.path });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
      {trail.map((crumb, idx) => {
        const isLast = idx === trail.length - 1;
        return (
          <span key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight size={12} aria-hidden="true" />}
            {crumb.path && !isLast ? (
              <Link to={crumb.path} className="hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-slate-800 dark:text-slate-200' : ''} aria-current={isLast ? 'page' : undefined}>
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
