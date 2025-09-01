import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const token = localStorage.getItem('access_token');

  // اگر توکن وجود ندارد، کاربر را به صفحه ورود هدایت کن
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // در غیر این صورت، کامپوننت فرزند (صفحه مورد نظر) را نمایش بده
  return <Outlet />;
}