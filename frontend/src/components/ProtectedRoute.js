import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import DashboardLayout from './DashboardLayout';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        // اگر بررسی تمام شد و کاربری وجود نداشت، به صفحه لاگین هدایت کن
        return <Navigate to="/login" replace />;
    }

    // اگر کاربر لاگین کرده بود، لایوت اصلی را با صفحات داخلی نمایش بده
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
}