import type { Role } from '../types/auth';
import {
  LayoutDashboard,
  FileText,
  LineChart,
  ShieldAlert,
  Stethoscope,
  Brain,
  Users,
  BookOpen,
  Settings,
  CalendarClock,
  ClipboardList,
  Activity,
  NotebookPen,
  BarChart3,
  FileBarChart,
  UserCog,
  Flag,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  section?: string; // groups items under a sidebar-label
}

// Adding a nav item for a role means editing this object only - nothing
// hardcoded in Sidebar/TopNav/MobileDrawer components themselves.
export const navigationConfig: Record<Role, NavItem[]> = {
  citizen: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, section: 'Overview' },
    { id: 'phr', label: 'Health Records', path: '/phr', icon: FileText, section: 'Overview' },
    { id: 'analytics', label: 'Analytics', path: '/analytics', icon: LineChart, section: 'Overview' },
    { id: 'risk', label: 'Risk Assessment', path: '/risk-assessment', icon: ShieldAlert, section: 'Overview' },
    { id: 'tele', label: 'Telemedicine', path: '/telemedicine', icon: Stethoscope, section: 'Care' },
    { id: 'mental', label: 'Mental Wellbeing', path: '/mental-wellbeing', icon: Brain, section: 'Care' },
    { id: 'community', label: 'Community', path: '/community', icon: Users, section: 'Engage' },
    { id: 'education', label: 'Health Education', path: '/education', icon: BookOpen, section: 'Engage' },
    { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, section: 'Account' },
  ],
  doctor: [
    { id: 'dashboard', label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard, section: 'Overview' },
    { id: 'appointments', label: 'Appointments', path: '/doctor/appointments', icon: CalendarClock, section: 'Practice' },
    { id: 'patients', label: 'Patients', path: '/doctor/patients', icon: Users, section: 'Practice' },
    { id: 'prescriptions', label: 'Prescriptions', path: '/doctor/prescriptions', icon: ClipboardList, section: 'Practice' },
    { id: 'availability', label: 'Availability', path: '/doctor/availability', icon: CalendarClock, section: 'Practice' },
    { id: 'settings', label: 'Settings', path: '/doctor/settings', icon: Settings, section: 'Account' },
  ],
  // NOTE: "Screening Camps" / "Health Surveys" were listed here previously
  // with no matching routes. Citizens, Notes, and Activity now have
  // dedicated pages (previously inline on a single Dashboard page).
  ambassador: [
    { id: 'dashboard', label: 'Dashboard', path: '/ambassador/dashboard', icon: LayoutDashboard, section: 'Overview' },
    { id: 'citizens', label: 'Citizens', path: '/ambassador/citizens', icon: Users, section: 'Outreach' },
    { id: 'notes', label: 'Notes', path: '/ambassador/notes', icon: NotebookPen, section: 'Outreach' },
    { id: 'activity', label: 'Activity', path: '/ambassador/activity', icon: Activity, section: 'Outreach' },
    { id: 'settings', label: 'Settings', path: '/ambassador/settings', icon: Settings, section: 'Account' },
  ],
  // NOTE: "Datasets" was listed here previously with no matching route —
  // Population Analytics and Reports & Insights now have dedicated pages.
  researcher: [
    { id: 'dashboard', label: 'Dashboard', path: '/research/dashboard', icon: LayoutDashboard, section: 'Overview' },
    { id: 'analytics', label: 'Population Analytics', path: '/research/analytics', icon: BarChart3, section: 'Research' },
    { id: 'reports', label: 'Reports & Insights', path: '/research/reports', icon: FileBarChart, section: 'Research' },
    { id: 'settings', label: 'Settings', path: '/research/settings', icon: Settings, section: 'Account' },
  ],
  // NOTE: Doctor Approval / Ambassador Approval / Content CMS / Audit Logs
  // were listed here previously but had no matching routes and still don't.
  // User Management, Moderation, and Analytics now have dedicated pages
  // (see /admin/users, /admin/moderation, /admin/analytics below).
  admin: [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, section: 'Overview' },
    { id: 'users', label: 'User Management', path: '/admin/users', icon: UserCog, section: 'Administration' },
    { id: 'moderation', label: 'Moderation', path: '/admin/moderation', icon: Flag, section: 'Administration' },
    { id: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: BarChart3, section: 'Administration' },
    { id: 'settings', label: 'Settings', path: '/admin/settings', icon: Settings, section: 'Account' },
  ],
};

export const roleLabels: Record<Role, string> = {
  citizen: 'Citizen',
  doctor: 'Doctor',
  ambassador: 'Health Ambassador',
  researcher: 'Researcher',
  admin: 'Administrator',
};

// Settings is a role-agnostic module (backend: /api/settings, any authenticated
// role) but is mounted under each role's own route prefix so ProtectedRoute's
// per-role gating still applies. Centralized here so nothing hardcodes '/settings'.
export const settingsPath: Record<Role, string> = {
  citizen: '/settings',
  doctor: '/doctor/settings',
  ambassador: '/ambassador/settings',
  researcher: '/research/settings',
  admin: '/admin/settings',
};

// Each role's dashboard route — used by RootRedirect and the Breadcrumb's
// "Home" link so neither hardcodes a citizen-only path for other roles.
export const dashboardPath: Record<Role, string> = {
  citizen: '/dashboard',
  doctor: '/doctor/dashboard',
  ambassador: '/ambassador/dashboard',
  researcher: '/research/dashboard',
  admin: '/admin/dashboard',
};
