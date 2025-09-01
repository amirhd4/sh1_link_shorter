import { useEffect } from 'react';
import { useUserStore } from './store/userStore';
import { authService } from './services/authService';
import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';

// این کامپوننت فرزندان خود (کل برنامه) را دریافت می‌کند
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading, isLoading } = useUserStore();
  const token = localStorage.getItem('access_token');

  // استفاده از TanStack Query برای واکشی اطلاعات کاربر
  // این کوئری فقط زمانی اجرا می‌شود که توکن وجود داشته باشد
  const { isSuccess, isError, data } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled: !!token, // مهم: فقط اگر توکن وجود دارد، کوئری را فعال کن
    retry: 1, // در صورت خطا (مثلا توکن منقضی شده) فقط یک بار تلاش کن
  });

  useEffect(() => {
    if (!token) {
      // اگر توکنی وجود ندارد، بارگذاری تمام شده است و کاربری وجود ندارد
      setIsLoading(false);
      return;
    }

    if (isSuccess && data) {
      // اگر واکشی موفق بود، اطلاعات کاربر را در استور قرار بده
      setUser(data);
      setIsLoading(false);
    }

    if (isError) {
      // اگر واکشی با خطا مواجه شد (توکن نامعتبر)
      localStorage.removeItem('access_token');
      setUser(null);
      setIsLoading(false);
    }
  }, [isSuccess, isError, data, token, setUser, setIsLoading]);

  // تا زمانی که در حال بررسی توکن و واکشی اطلاعات هستیم، یک لودر نمایش می‌دهیم
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // پس از اتمام بارگذاری، کل برنامه را نمایش می‌دهیم
  return <>{children}</>;
}