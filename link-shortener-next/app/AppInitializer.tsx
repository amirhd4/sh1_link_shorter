'use client';

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading, isLoading } = useUserStore();

  // اگر قبلا خطای احراز هویت رخ داده، اصلاً درخواست جدیدی نساز تا صفحه ریدایرکت شود
  const hasAuthFailed = typeof window !== "undefined" && sessionStorage.getItem("auth_failed") === "true";

  const { isLoading: queryLoading, isSuccess, isError, data } = useQuery({
    queryKey: ["me"],
    queryFn: authService.getMe,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !hasAuthFailed, // 👈 اگر خطا خورده بودیم، دیگر درخواست me اجرا نخواهد شد
  });

  useEffect(() => {
    // پاک کردن پرچم در صورت لاگین موفق یا بالا آمدن تمیز صفحه لاگین
    if (isSuccess && data) {
      sessionStorage.removeItem("auth_failed");
      setUser(data);
    }

    if (isError) {
      setUser(null);
    }

    if (!queryLoading) {
      setIsLoading(false);
    }
  }, [queryLoading, isSuccess, isError, data, setUser, setIsLoading]);

  if (isLoading || queryLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}