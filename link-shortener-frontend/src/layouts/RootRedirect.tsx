import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export function RootRedirect() {
  const { user } = useUserStore();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}