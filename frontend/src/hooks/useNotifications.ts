import { useEffect, useState } from 'react';
import api from '../services/api';
import type { NotificationItem } from '../components/layout/NotificationDropdown';

// Fetches the current user's notifications. Marking-all-read calls a stub
// endpoint for now; wire up optimistic updates when the Notifications
// module (backend) lands.
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/notifications/me')
      .then(({ data }) => {
        if (!cancelled) setNotifications(data.notifications || []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    api.put('/notifications/mark-all-read').catch(() => undefined);
  };

  return { notifications, isLoading, markAllRead };
}
