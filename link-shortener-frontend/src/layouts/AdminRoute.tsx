import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export function AdminRoute() {
  const { user } = useUserStore();

  // اگر کاربر نقش ادمین ندارد، او را به داشبورد خودش هدایت کن
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // در غیر این صورت، کامپوننت‌های فرزند (صفحات ادمین) را نمایش بده
  return <Outlet />;
}