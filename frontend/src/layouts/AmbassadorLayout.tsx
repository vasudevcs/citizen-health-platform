import { Suspense } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { LayoutSkeleton } from '../components/layout/LayoutSkeleton';
import { useNotifications } from '../hooks/useNotifications';

export default function AmbassadorLayout() {
  const { notifications, markAllRead } = useNotifications();

  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <AppShell role="ambassador" notifications={notifications} onMarkAllRead={markAllRead} />
    </Suspense>
  );
}
