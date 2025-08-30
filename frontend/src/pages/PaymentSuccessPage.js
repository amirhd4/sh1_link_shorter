import React, { useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PaymentSuccessPage() {
    const { refreshUser } = useAuth();

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    return (
        <Box textAlign="center" mt={5}>
            <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main' }} />
            <Typography variant="h4" gutterBottom>پرداخت موفقیت‌آمیز بود!</Typography>
            <Typography color="text.secondary">اشتراک شما با موفقیت فعال شد. به دنیای حرفه‌ای‌ها خوش آمدید.</Typography>
            <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>
                بازگشت به داشبورد
            </Button>
        </Box>
    );
}