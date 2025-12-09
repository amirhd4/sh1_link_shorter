"use client";

import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Header } from "@/components/organisms/Header";
import { AdminSidebar } from "@/components/organisms/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <Box sx={{ display: "flex" }}>
      <Header onMenuClick={toggleSidebar} />
      <AdminSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
