import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { LinksDashboard } from './features/client-dashboard/components/LinksDashboard';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { ClientLayout } from './layouts/ClientLayout';
import { ProfilePage } from './features/profile/pages/ProfilePage';
import { HomePage } from './features/showcase/pages/HomePage';
import { PublicLayout } from './layouts/PublicLayout'; // <<<< ایمپورت
import { PaymentStatusPage } from './features/billing/pages/PaymentStatusPage';
import { PlansPage } from './features/billing/pages/PlansPage';
import { LinkDetailsPage } from './features/links/pages/LinkDetailsPage';
import { AdminRoute } from './layouts/AdminRoute';
import {AdminLayout} from "./layouts/AdminLayout.tsx";
import { LinkManagementPage } from './features/admin-dashboard/pages/LinkManagementPage.tsx';
import { UserManagementPage } from './features/admin-dashboard/pages/UserManagementPage.tsx';
import {AdminDashboardPage} from "./features/admin-dashboard/pages/AdminDashboardPage.tsx";

const router = createBrowserRouter([
  // گروه روت‌های عمومی (برای کاربرانی که لاگین نکرده‌اند)
  {
    element: <PublicLayout />,
    children: [
      { path: '/home', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // گروه روت‌های خصوصی و محافظت شده (برای کاربران لاگین کرده)
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <ClientLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <LinksDashboard /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'plans', element: <PlansPage /> },
          { path: 'my-links', element: <div>صفحه لینک‌های من</div>, },
          { path: 'links/:shortCode', element: <LinkDetailsPage />, },
        ],
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: 'links', element: <LinkManagementPage /> },
              { path: 'users', element: <UserManagementPage /> },
              { path: 'dashboard', element: <AdminDashboardPage /> },
              { path: 'dashboard', element: <div>داشبورد ادمین</div> }
            ],
          },
        ],
      },
    ],
  },

  // روت‌های بدون Layout خاص
  { path: '/payment/success', element: <PaymentStatusPage /> },
  { path: '/payment/failure', element: <PaymentStatusPage /> },

  // یک روت برای هندل کردن تمام مسیرهای ناموجود
  { path: '*', element: <Navigate to="/home" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}