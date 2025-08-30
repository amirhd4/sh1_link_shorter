import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Typography, Paper, Box, CircularProgress, Card, CardContent, TextField, Button, Grid, Alert } from '@mui/material';
import api from '../api';
import { toPersianDate } from '../utils/dateFormatter';


export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone_number: user?.phone_number || '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    if (!user) return <CircularProgress />;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        try {
            await api.patch('/auth/users/me', formData);
            setSuccess('Profile updated successfully!');
            await refreshUser(); // اطلاعات کاربر را در کل برنامه بروز کن
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Typography variant="h4" gutterBottom>پروفایل و اشتراک</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>اطلاعات شخصی</Typography>
                        <Box component="form" onSubmit={handleSubmit}>
                            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                            <TextField label="نام" name="first_name" value={formData.first_name} onChange={handleChange} fullWidth margin="normal" />
                            <TextField label="نام خانوادگی" name="last_name" value={formData.last_name} onChange={handleChange} fullWidth margin="normal" />
                            <TextField label="شماره تلفن" name="phone_number" value={formData.phone_number} onChange={handleChange} fullWidth margin="normal" />
                            <Box sx={{ position: 'relative', mt: 2 }}>
                                <Button type="submit" variant="contained" disabled={loading}>
                                    ذخیره تغییرات
                                </Button>
                                {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-40px' }} />}
                            </Box>

                        </Box>
                    </Paper>
                </Grid>
                {/* بخش نمایش اطلاعات اشتراک */}
                <Grid item xs={12} md={6}>
                    {/* این بخش می‌تواند در آینده تکمیل‌تر شود */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6">پلن فعلی: {user.plan?.name || 'N/A'}</Typography>
                            <Typography color="text.secondary">
                                اشتراک شما در تاریخ {toPersianDate(user.subscription_end_date)} منقضی می‌شود.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}