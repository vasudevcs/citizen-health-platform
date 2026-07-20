import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { navigationConfig } from '../../config/navigationConfig';
import { useSidebar } from '../../contexts/SidebarContext';
import type { Role } from '../../types/auth';
import type { NavItem } from '../../config/navigationConfig';

interface SidebarProps {
  role: Role;
}

function groupBySection(items: NavItem[]) {
  const sections = new Map<string, NavItem[]>();
  items.forEach((item: NavItem) => {
    const key = item.section || 'General';
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key)!.push(item);
  });
  return Array.from(sections.entries());
}

export function Sidebar({ role }: SidebarProps) {
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const items = navigationConfig[role];
  const sections = groupBySection(items);

  return (
    <aside
      aria-label="Primary"
      className={`hidden flex-shrink-0 flex-col border-r border-slate-200 bg-slate-50 py-4 transition-[width] duration-200 dark:border-slate-700 dark:bg-slate-900 md:flex ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      <nav className="flex-1 overflow-y-auto">
        {sections.map(([section, sectionItems]) => (
          <div key={section} className="mb-2">
            {!isCollapsed && (
              <p className="mb-1 px-4 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                {section}
              </p>
            )}
            {sectionItems.map((item: NavItem) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 border-r-[3px] px-4 py-2 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-600 ${
                      isActive
                        ? 'border-teal-700 bg-teal-50 font-medium text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                        : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon size={17} aria-hidden="true" className="flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="mx-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
      >
        {isCollapsed ? <ChevronsRight size={16} aria-hidden="true" /> : <ChevronsLeft size={16} aria-hidden="true" />}
        {!isCollapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
