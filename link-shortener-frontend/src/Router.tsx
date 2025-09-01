import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { LinksDashboard } from './features/client-dashboard/components/LinksDashboard';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { ClientLayout } from './layouts/ClientLayout';
import { ProfilePage } from './features/profile/pages/ProfilePage.tsx';


const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />, // 1. ابتدا بررسی می‌کند کاربر توکن دارد یا نه
    children: [
      {
        element: <ClientLayout />, // 2. اگر توکن داشت، Layout را نمایش می‌دهد
        children: [
          {
            path: 'dashboard', // مسیر: /dashboard
            element: <LinksDashboard />,
          },
          {
             path: 'my-links', // مسیر نمونه جدید
             element: <div>صفحه لینک‌های من</div>,
          },
            {
            path: 'profile', // <<<< روت جدید
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}