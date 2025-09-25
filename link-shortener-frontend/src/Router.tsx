import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { AdminRoute } from './layouts/AdminRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { ClientLayout } from './layouts/ClientLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/home.page.tsx';
import { LoginPage } from './pages/login.page.tsx';
import { RegisterPage } from './pages/register.page.tsx';

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
import { ForgotPasswordPage } from './pages/forgot-password.page.tsx';
import { ResetPasswordPage } from './pages/reset-password.page.tsx';
import { VerifyEmailPage } from './pages/verify-email.page.tsx';
import { EmailSentPage } from './pages/email-sent.page.tsx';
import { AuthCallbackPage } from "./pages/auth-callback-auth.page.tsx";
import { LoginOtpPage } from './pages/login-otp.page.tsx';
import { RegisterOtpPage } from "./pages/register-otp.page.tsx";


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
          // { index: true, element: <Navigate to="/dashboard" replace /> }, // هدایت از / به داشبورد
          { index: true, element: <HomePage /> },
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