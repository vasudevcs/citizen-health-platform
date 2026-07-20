import { Suspense } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { LayoutSkeleton } from '../components/layout/LayoutSkeleton';
import { useNotifications } from '../hooks/useNotifications';

export default function AdminLayout() {
  const { notifications, markAllRead } = useNotifications();

  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <AppShell role="admin" notifications={notifications} onMarkAllRead={markAllRead} />
    </Suspense>
  );
}
