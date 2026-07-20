import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardPath } from '../config/navigationConfig';

/**
 * Root redirect — sends users to the correct dashboard based on role,
 * or to /login if unauthenticated.
 */
export default function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={dashboardPath[user.role] ?? '/login'} replace />;
}
