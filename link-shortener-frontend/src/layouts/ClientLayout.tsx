// ClientLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { Header } from '../components/organisms/Header';
import { Sidebar } from '../components/organisms/Sidebar';

export function ClientLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarToggle = () => setSidebarOpen(!isSidebarOpen);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Header onMenuClick={handleSidebarToggle} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarToggle} />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
