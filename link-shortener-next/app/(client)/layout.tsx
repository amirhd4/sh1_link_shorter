"use client";

import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Header } from "@/components/organisms/Header";
import { Sidebar } from "@/components/organisms/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <Box sx={{ display: "flex", bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
