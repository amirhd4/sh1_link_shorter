"use client";

import ClientProtectedLayout from "./ClientProtectedLayout";
import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Header } from "@/components/organisms/Header";
import { Sidebar } from "@/components/organisms/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarToggle = () => setSidebarOpen(!isSidebarOpen);

  return (
    <ClientProtectedLayout>
      <Box sx={{ display: "flex", bgcolor: "#f9fafb", minHeight: "100vh" }}>
        <Header onMenuClick={handleSidebarToggle} />
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarToggle} />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ClientProtectedLayout>
  );
}
