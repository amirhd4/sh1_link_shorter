import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export function AdminRoute() {
  const token = localStorage.getItem('access_token');
  const { user } = useUserStore();

  // اگر کاربر لاگین نکرده، هدایت به صفحه home
  if (!token) {
    return <Navigate to="/home" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // در غیر این صورت، نمایش کامپوننت‌های فرزند ادمین
  return <Outlet />;
}
