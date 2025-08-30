import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Typography,
    Paper,
    Box,
    CircularProgress,
    Card,
    CardContent,
    TextField,
    Button,
    Grid,
    Alert,
    LinearProgress,
    Divider,
    Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api';
import { toPersianDate } from '../utils/dateFormatter';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone_number: user?.phone_number || '',
    });
    const [stats, setStats] = useState({ total_links: 0 });
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                const response = await api.get('/stats/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setStatsLoading(false);
            }
        };
        if (user) {
            fetchStats();
        }
    }, [user]);

    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        try {
            await api.patch('/auth/users/me', formData);
            setSuccessMessage('اطلاعات پروفایل با موفقیت بروزرسانی شد!');
            await refreshUser();
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setLoading(false);
        }
    };

    const linkLimit = user.plan?.link_limit_per_month || 0;
    const usagePercentage = linkLimit > 0 ? (stats.total_links / linkLimit) * 100 : 0;

    return (
        <>
            <Typography variant="h4" gutterBottom>
                پروفایل و مدیریت اشتراک
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            اطلاعات شخصی
                        </Typography>
                        <Box component="form" onSubmit={handleFormSubmit} noValidate>
                            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField label="نام" name="first_name" defaultValue={formData.first_name} onChange={handleFormChange} fullWidth />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField label="نام خانوادگی" name="last_name" defaultValue={formData.last_name} onChange={handleFormChange} fullWidth />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="شماره تلفن" name="phone_number" defaultValue={formData.phone_number} onChange={handleFormChange} fullWidth />
                                </Grid>
                                <Grid item xs={12}>
                                     <TextField label="آدرس ایمیل" name="email" value={user.email} fullWidth disabled />
                                </Grid>
                            </Grid>
                            <Box sx={{ position: 'relative', mt: 3 }}>
                                <Button type="submit" variant="contained" disabled={loading}>
                                    ذخیره تغییرات
                                </Button>
                                {loading && (
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50px',
                                            marginTop: '-12px',
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            وضعیت اشتراک
                        </Typography>
                        <Card variant="outlined">
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h5">
                                        پلن {user.plan?.name === 'Free' ? 'رایگان' : 'حرفه‌ای'}
                                    </Typography>
                                    <Chip label="فعال" color="success" size="small" />
                                </Box>
                                <Typography color="text.secondary">
                                    تاریخ انقضا: {toPersianDate(user.subscription_end_date)}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">میزان استفاده از لینک‌ها</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {statsLoading ? '...' : stats.total_links.toLocaleString('fa-IR')} / {linkLimit.toLocaleString('fa-IR')}
                                        </Typography>
                                    </Box>
                                    {statsLoading ? (
                                        <Skeleton variant="rectangular" height={10} sx={{ borderRadius: 5 }}/>
                                    ) : (
                                        <LinearProgress variant="determinate" value={usagePercentage} sx={{ height: 10, borderRadius: 5 }} />
                                    )}
                                </Box>
                                {user.plan?.name === 'Free' && (
                                    <Button component={RouterLink} to="/pricing" variant="contained" color="primary" sx={{ mt: 3, width: '100%' }}>
                                        ارتقا به پلن حرفه‌ای
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
}