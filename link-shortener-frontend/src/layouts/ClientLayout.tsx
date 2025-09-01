import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { Header } from '../components/organisms/Header';
import { Sidebar } from '../components/organisms/Sidebar';

export function ClientLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuClick={handleSidebarToggle} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarToggle} />

      {/* محتوای اصلی صفحه */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* برای ایجاد فاصله از زیر هدر */}
        <Outlet /> {/* کامپوننت‌های فرزند (صفحات) در اینجا رندر می‌شوند */}
      </Box>
    </Box>
  );
}