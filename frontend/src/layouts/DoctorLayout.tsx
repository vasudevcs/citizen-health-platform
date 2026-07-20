import { Suspense } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { LayoutSkeleton } from '../components/layout/LayoutSkeleton';
import { useNotifications } from '../hooks/useNotifications';

export default function DoctorLayout() {
  const { notifications, markAllRead } = useNotifications();

  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <AppShell role="doctor" notifications={notifications} onMarkAllRead={markAllRead} />
    </Suspense>
  );
}
