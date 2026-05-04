"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Toolbar } from "@mui/material";
import { Header } from "@/components/organisms/Header";
import { AdminSidebar } from "@/components/organisms/AdminSidebar";
import { useUserStore } from "@/store/userStore";

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
}

export default function AdminProtectedLayout({ children }: AdminProtectedLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useUserStore();
  const router = useRouter();

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // بررسی دسترسی کاربر
  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace("/login");
      else if (user.role !== "admin") router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Header onMenuClick={handleSidebarToggle} />
      <AdminSidebar isOpen={isSidebarOpen} onClose={handleSidebarToggle} />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
