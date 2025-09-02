import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { LinksDashboard } from './features/client-dashboard/components/LinksDashboard';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { ClientLayout } from './layouts/ClientLayout';
import { ProfilePage } from './features/profile/pages/ProfilePage.tsx';
import { AdminRoute } from './layouts/AdminRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { UserManagementPage } from './features/admin-dashboard/pages/UserManagementPage';
import { PlansPage } from './features/billing/pages/PlansPage';
import { PaymentStatusPage } from './features/billing/pages/PaymentStatusPage';
import { LinkDetailsPage } from './features/links/pages/LinkDetailsPage';
import { LinkManagementPage } from './features/admin-dashboard/pages/LinkManagementPage';


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
          path: '/payment/success',
          element: <PaymentStatusPage />,
        },
        {
          path: '/payment/failure',
          element: <PaymentStatusPage />,
        },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <ClientLayout />,
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
        {
          path: 'plans',
          element: <PlansPage />,
        },
        {
          path: 'links/:shortCode',
          element: <LinkDetailsPage />,
        },
        ],
      },
        {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />, // ۲. اگر ادمین بود، Layout ادمین را نمایش می‌دهد
            children: [
              { path: 'links', element: <LinkManagementPage /> },
              { path: 'users', element: <UserManagementPage /> },
              { path: 'dashboard', element: <div>داشبورد ادمین</div> }
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}