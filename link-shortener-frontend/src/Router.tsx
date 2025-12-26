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
import { ForgotPasswordPage } from './pages/forgot-password-to-remove.page.tsx';
import { ResetPasswordPage } from './pages/reset-password-to-remove.page.tsx';
import { VerifyEmailPage } from './pages/verify-email-to-remove.page.tsx';
import { EmailSentPage } from './pages/email-sent-to-remove.page.tsx';
import { AuthCallbackPage } from "./pages/auth-callback-to-remove-auth.page.tsx";
import { LoginOtpPage } from './pages/login-otp.page.tsx';
import { RegisterOtpPage } from "./pages/register-otp.page.tsx";
import {ApiPage} from "./features/api/pages/ApiPage.tsx";
import {DomainsManager} from "./pages/domains-manager.page.tsx";
import AdRedirectPage from "./pages/[shortCode]/[domainId]/ad.tsx";
import PasswordProtectedPage from "./pages/[shortCode]/[domainId]/password-protected.tsx";
import LinkShortenerPage from "./pages/link-shortener.page.tsx";
import FreeUrlShortenerPage from "./pages/free-url-shortener.page.tsx";
import BestUrlShortenerPage from "./pages/best-url-shortener.page.tsx";
import ApiUrlShortenerPage from "./pages/url-shortener.page.tsx";
import ShortUrlGeneratorPage from "./pages/short-url-generator.page.tsx";
import FaqPage from "./pages/faq.page.tsx";

const router = createBrowserRouter([
  // --- روت‌های عمومی ---
  {
    element: <PublicLayout />,
    children: [
      //   Page for seo
      { path: '/link-shortener', element: <LinkShortenerPage /> },
      { path: '/free-url-shortener', element: <FreeUrlShortenerPage /> },
      { path: '/best-url-shortener', element: <BestUrlShortenerPage /> },
      { path: '/url-shortener', element: <ApiUrlShortenerPage /> },
      { path: '/short-url-generator', element: <ShortUrlGeneratorPage /> },
      { path: '/faq', element: <FaqPage /> },

      { path: '/home', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password-to-remove', element: <ForgotPasswordPage /> },
      { path: '/reset-password-to-remove', element: <ResetPasswordPage /> },
      { path: '/email-sent-to-remove', element: <EmailSentPage /> },
      { path: '/verify-email-to-remove', element: <VerifyEmailPage /> },
      { path: '/auth/callback', element: <AuthCallbackPage /> },
      { path: '/login-otp', element: <LoginOtpPage /> },
      { path: '/register-otp', element: <RegisterOtpPage /> },
      { path: '/:domainId/:shortCode/ad', element: <AdRedirectPage /> },
      { path: '/password/:domainId/:shortCode', element: <PasswordProtectedPage /> },
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
