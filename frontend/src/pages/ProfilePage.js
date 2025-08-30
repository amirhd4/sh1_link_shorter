import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Typography, Paper, Box, CircularProgress, Card, CardContent, LinearProgress } from '@mui/material';

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return <CircularProgress />;
    }

    const linksUsed = 5; // مثال
    const linkLimit = user.plan?.link_limit_per_month || 50;
    const usagePercentage = (linksUsed / linkLimit) * 100;

    return (
        <>
            <Typography variant="h4" gutterBottom>پروفایل شما</Typography>
            <Card>
                <CardContent>
                    <Typography variant="h6">ایمیل: {user.email}</Typography>
                    <Typography variant="h6">پلن فعلی: {user.plan?.name || 'N/A'}</Typography>
                    <Typography color="text.secondary">
                        اشتراک شما در تاریخ {user.subscription_end_date} منقضی می‌شود.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography>استفاده از لینک ماهانه: {linksUsed} / {linkLimit}</Typography>
                        <LinearProgress variant="determinate" value={usagePercentage} />
                    </Box>
                </CardContent>
            </Card>
        </>
    );
}