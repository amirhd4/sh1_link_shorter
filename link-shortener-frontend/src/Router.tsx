import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { AdminRoute } from './layouts/AdminRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { ClientLayout } from './layouts/ClientLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { HomePage } from './pages/home.page.tsx';
import { AdManagementPage } from './features/admin-dashboard/pages/AdManagement.page.tsx';
import { AdStatsPage } from './features/admin-dashboard/pages/AdStats.page.tsx';
import { LoginPage } from './pages/login.page.tsx';
import { RegisterPage } from './pages/register.page.tsx';
import { LinksDashboard } from './features/client-dashboard/components/LinksDashboard';
import { ProfilePage } from './features/profile/pages/ProfilePage';
import { PlansPage } from './features/billing/pages/PlansPage';
import { BillingHistoryPage } from './features/billing/pages/BillingHistoryPage';
import { LinkDetailsPage } from './features/links/pages/LinkDetailsPage';
import { PaymentStatusPage } from './features/billing/pages/PaymentStatusPage';
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
import {ApiPage} from "./features/api/pages/ApiPage.tsx";
import {DomainsManager} from "./pages/domains-manager.page.tsx";
import AdRedirectPage from "./pages/[domainId]/[shortCode]/ad.tsx";

const router = createBrowserRouter([
  // --- روت‌های عمومی ---
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
      { path: '/:domainId/:shortCode/ad', element: <AdRedirectPage /> },
    ],
  },

  // --- روت‌های محافظت‌شده ---
  {
    path: '/',
    element: <ProtectedRoute />, // بررسی لاگین
    children: [
      // مسیر کلاینت
      {
        element: <ClientLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <LinksDashboard /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'plans', element: <PlansPage /> },
          { path: 'billing', element: <BillingHistoryPage /> },
          { path: 'links/:shortCode/:domainId', element: <LinkDetailsPage /> },
          { path: 'api', element: <ApiPage /> },
          { path: 'domains', element: <DomainsManager /> }
        ],
      },
      // مسیر ادمین
      {
        path: 'admin',
        element: <AdminRoute />, // بررسی نقش ادمین
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <AdminDashboardPage /> },
              { path: 'users', element: <UserManagementPage /> },
              { path: 'links', element: <LinkManagementPage /> },
              { path: 'ads', element: <AdManagementPage /> },
              { path: 'stats', element: <AdStatsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // --- مسیرهای بدون Layout ---
  { path: '/payment/success', element: <PaymentStatusPage /> },
  { path: '/payment/failure', element: <PaymentStatusPage /> },

  // --- مسیر catch-all ---
  { path: '*', element: <Navigate to="/home" replace /> },
],
{ basename: '/pages' });

export function AppRouter() {
  return <RouterProvider router={router} />;
}
