'use client';

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading, isLoading } = useUserStore();

  // همیشه query فعال است، چون توکن HttpOnly به سرور فرستاده می‌شود
  const { isLoading: queryLoading, isSuccess, isError, data } = useQuery({
    queryKey: ["me"],
    queryFn: authService.getMe,
    retry: false,
    refetchOnWindowFocus: false,

  });

  useEffect(() => {
    if (queryLoading) return; // هنوز loading است

    if (isSuccess && data) {
      setUser(data);
    }

    if (isError) {
      setUser(null);
    }

    setIsLoading(false);
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
