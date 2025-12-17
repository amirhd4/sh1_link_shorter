"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading, isLoading } = useUserStore();

  const token = typeof document !== "undefined"
  ? document.cookie.includes("access_token")
  : false;


  const { isSuccess, isError, data } = useQuery({
    queryKey: ["me"],
    queryFn: authService.getMe,   // سرور جواب role را هم دهد
    enabled: token,
    retry: 1,
  });

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (isSuccess && data) {
      setUser(data);        // اینجا role را هم ست می‌کنی
      setIsLoading(false);

      // document.cookie = `role=${data.role}; path=/;`;
    }

    if (isError) {
      localStorage.removeItem("access_token");
      document.cookie = "access_token=; Max-Age=0; path=/";
      document.cookie = "role=; Max-Age=0; path=/";
      setUser(null);
      setIsLoading(false);
    }
  }, [isSuccess, isError, data, token]);

  if (isLoading) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
