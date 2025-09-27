import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export function ProtectedRoute() {
  const token = localStorage.getItem('access_token');
  const { user } = useUserStore();

  // اگر توکن وجود ندارد، کاربر را به صفحه home هدایت کن
  if (!token) {
    return <Navigate to="/home" replace />;
  }

  // // اگر کاربر ادمین است، او را به داشبورد ادمین هدایت کن
  // if (user?.role === 'admin') {
  //   return <Navigate to="/admin/dashboard" replace />;
  // }

  // در غیر این صورت، کاربر کلاینت است → نمایش کامپوننت‌های فرزند
  return <Outlet />;
}
