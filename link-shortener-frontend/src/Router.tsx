import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { AdminRoute } from './layouts/AdminRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { ClientLayout } from './layouts/ClientLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './features/showcase/pages/HomePage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';

// Client (User) Pages
import { LinksDashboard } from './features/client-dashboard/components/LinksDashboard';
import { ProfilePage } from './features/profile/pages/ProfilePage';
import { PlansPage } from './features/billing/pages/PlansPage';
import { BillingHistoryPage } from './features/billing/pages/BillingHistoryPage';
import { LinkDetailsPage } from './features/links/pages/LinkDetailsPage';
import { PaymentStatusPage } from './features/billing/pages/PaymentStatusPage';

// Admin Pages
import { AdminDashboardPage } from './features/admin-dashboard/pages/AdminDashboardPage';
import { UserManagementPage } from './features/admin-dashboard/pages/UserManagementPage';
import { LinkManagementPage } from './features/admin-dashboard/pages/LinkManagementPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';
import { VerifyEmailPage } from './features/auth/pages/VerifyEmailPage';
import { EmailSentPage } from './features/auth/pages/EmailSentPage';
import {AuthCallbackPage} from "./features/auth/pages/AuthCallbackPage.tsx";
import { LoginOtpPage } from './features/auth/pages/LoginOtpPage.tsx';
import {RegisterOtpPage} from "./features/auth/pages/RegisterOtpPage.tsx";




const router = createBrowserRouter([
  // --- گروه روت‌های عمومی ---
  // این مسیرها برای هر بازدیدکننده‌ای قابل دسترس هستند
  {
    element: <PublicLayout />,
    children: [
      { path: '/home', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/email-sent', element: <EmailSentPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/auth/callback', element: <AuthCallbackPage /> },
      { path: '/login-otp', element: <LoginOtpPage /> },
      { path: '/register-otp', element: <RegisterOtpPage /> },
    ],
  },

  // --- گروه روت‌های خصوصی و محافظت شده ---
  // برای دسترسی به این مسیرها، کاربر باید حتما لاگین کرده باشد
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      // --- روت‌های داشبورد کلاینت ---
      {
        element: <ClientLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> }, // هدایت از / به داشبورد
          { path: 'dashboard', element: <LinksDashboard /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'plans', element: <PlansPage /> },
          { path: 'billing', element: <BillingHistoryPage /> },
          { path: 'links/:shortCode', element: <LinkDetailsPage /> },
        ],
      },

      // --- روت‌های داشبورد ادمین (محافظت دو مرحله‌ای) ---
      {
        path: 'admin',
        element: <AdminRoute />, // مرحله دوم: بررسی نقش ادمین
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="/admin/dashboard" replace /> },
              { path: 'dashboard', element: <AdminDashboardPage /> },
              { path: 'users', element: <UserManagementPage /> },
              { path: 'links', element: <LinkManagementPage /> },
            ],
          },
        ],
      },
    ],
  },

  // --- روت‌های بدون Layout خاص (مانند بازگشت از درگاه پرداخت) ---
  {
    path: '/payment/success',
    element: <PaymentStatusPage />,
  },
  {
    path: '/payment/failure',
    element: <PaymentStatusPage />,
  },

  // --- روت Catch-all برای هدایت مسیرهای ناموجود ---
  // این روت همیشه باید در آخر قرار گیرد
  {
    path: '*',
    element: <Navigate to="/home" replace />,
  },
],
{ basename: '/pages' }
);

/**
 * کامپوننت اصلی که RouterProvider را برای کل برنامه فراهم می‌کند.
 */
export function AppRouter() {
  return <RouterProvider router={router}/>;
}