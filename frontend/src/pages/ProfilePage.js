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
    Chip,
    Skeleton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api';
import { toPersianDate } from '../utils/dateFormatter';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();

    // State for personal info form
    const [infoFormData, setInfoFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone_number: user?.phone_number || '',
    });
    const [infoLoading, setInfoLoading] = useState(false);
    const [infoSuccess, setInfoSuccess] = useState('');
    const [infoError, setInfoError] = useState('');

    // State for password change form
    const [passwordFormData, setPasswordFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // State for subscription stats
    const [stats, setStats] = useState({ total_links: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

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

    const handleInfoFormChange = (e) => setInfoFormData({ ...infoFormData, [e.target.name]: e.target.value });
    const handlePasswordFormChange = (e) => setPasswordFormData({ ...passwordFormData, [e.target.name]: e.target.value });

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setInfoLoading(true);
        setInfoSuccess('');
        setInfoError('');
        try {
            await api.patch('/auth/users/me', infoFormData);
            setInfoSuccess('اطلاعات پروفایل با موفقیت بروزرسانی شد!');
            await refreshUser();
        } catch (error) {
            setInfoError('خطا در بروزرسانی پروفایل. لطفاً دوباره تلاش کنید.');
        } finally {
            setInfoLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordSuccess('');
        setPasswordError('');

        if (passwordFormData.new_password !== passwordFormData.confirm_password) {
            setPasswordError('رمز عبور جدید و تکرار آن یکسان نیستند.');
            setPasswordLoading(false);
            return;
        }

        try {
            await api.post('/auth/users/me/change-password', {
                current_password: passwordFormData.current_password,
                new_password: passwordFormData.new_password,
            });
            setPasswordSuccess('رمز عبور با موفقیت تغییر کرد!');
            setPasswordFormData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            setPasswordError(error.response?.data?.detail || 'خطا در تغییر رمز عبور.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const linkLimit = user.plan?.link_limit_per_month || 0;
    const usagePercentage = linkLimit > 0 ? (stats.total_links / linkLimit) * 100 : 0;

    return (
        <>
            <Typography variant="h4" gutterBottom>پروفایل و مدیریت اشتراک</Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    {/* Personal Information Form */}
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>اطلاعات شخصی</Typography>
                        <Box component="form" onSubmit={handleInfoSubmit} noValidate>
                            {infoSuccess && <Alert severity="success" sx={{ mb: 2 }}>{infoSuccess}</Alert>}
                            {infoError && <Alert severity="error" sx={{ mb: 2 }}>{infoError}</Alert>}
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField label="نام" name="first_name" defaultValue={infoFormData.first_name} onChange={handleInfoFormChange} fullWidth />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField label="نام خانوادگی" name="last_name" defaultValue={infoFormData.last_name} onChange={handleInfoFormChange} fullWidth />
                                </Grid>
                                <Grid item xs={12}><TextField label="شماره تلفن" name="phone_number" defaultValue={infoFormData.phone_number} onChange={handleInfoFormChange} fullWidth /></Grid>
                                <Grid item xs={12}><TextField label="آدرس ایمیل" name="email" value={user.email} fullWidth disabled /></Grid>
                            </Grid>
                            <Box sx={{ position: 'relative', mt: 3 }}><Button type="submit" variant="contained" disabled={infoLoading}>ذخیره تغییرات</Button>{infoLoading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50px', mt: '-12px' }} />}</Box>
                        </Box>
                    </Paper>

                    {/* Change Password Form */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>تغییر رمز عبور</Typography>
                        <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
                             {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
                             {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
                            <Grid container spacing={2}>
                                <Grid item xs={12}><TextField label="رمز عبور فعلی" name="current_password" type="password" value={passwordFormData.current_password} onChange={handlePasswordFormChange} fullWidth required /></Grid>
                                <Grid item xs={12} sm={6}><TextField label="رمز عبور جدید" name="new_password" type="password" value={passwordFormData.new_password} onChange={handlePasswordFormChange} fullWidth required /></Grid>
                                <Grid item xs={12} sm={6}><TextField label="تکرار رمز عبور جدید" name="confirm_password" type="password" value={passwordFormData.confirm_password} onChange={handlePasswordFormChange} fullWidth required /></Grid>
                            </Grid>
                            <Box sx={{ position: 'relative', mt: 3 }}><Button type="submit" variant="outlined" disabled={passwordLoading}>تغییر رمز عبور</Button>{passwordLoading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '60px', mt: '-12px' }} />}</Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Subscription Status Card */}
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>وضعیت اشتراک</Typography>
                        <Card variant="outlined">
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h5">پلن {user.plan?.name}</Typography>
                                    <Chip label="فعال" color="success" size="small" />
                                </Box>
                                <Typography color="text.secondary">تاریخ انقضا: {toPersianDate(user.subscription_end_date)}</Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">میزان استفاده از لینک‌ها</Typography>
                                        <Typography variant="body2" color="text.secondary">{statsLoading ? '...' : `${stats.total_links.toLocaleString('fa-IR')} / ${linkLimit.toLocaleString('fa-IR')}`}</Typography>
                                    </Box>
                                    {statsLoading ? <Skeleton variant="rectangular" height={10} sx={{ borderRadius: 5 }}/> : <LinearProgress variant="determinate" value={usagePercentage} sx={{ height: 10, borderRadius: 5 }} />}
                                </Box>
                                {user.plan?.name === 'Free' && (<Button component={RouterLink} to="/pricing" variant="contained" color="primary" sx={{ mt: 3, width: '100%' }}>ارتقا به پلن حرفه‌ای</Button>)}
                            </CardContent>
                        </Card>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
}