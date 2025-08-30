import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Skeleton } from '@mui/material';
import StatWidget from '../components/StatWidget';
import api from '../api';



export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <>
            <Typography variant="h4" gutterBottom>
                کابین خلبان شما
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    {loading ? <Skeleton variant="rounded" height={100} /> : <StatWidget title="تعداد کل لینک‌ها" value={stats.total_links} />}
                </Grid>
                <Grid item xs={12} sm={6}>
                    {loading ? <Skeleton variant="rounded" height={100} /> : <StatWidget title="تعداد کل کلیک‌ها" value={stats.total_clicks} />}
                </Grid>

                {/* بخش نمودار اصلی */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6">روند کلیک‌ها</Typography>
                        {/* در اینجا کامپوننت نمودار قرار خواهد گرفت */}
                    </Paper>
                </Grid>

                {/* بخش قرار دادن تبلیغ */}
                <Grid item xs={12} md={6}>
                     <Paper elevation={1} sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                        <Typography variant="body2" color="text.secondary">
                            فضای تبلیغات
                        </Typography>
                        <Typography variant="h6">
                           سرویس خود را در اینجا تبلیغ کنید!
                        </Typography>
                     </Paper>
                </Grid>

                 {/* ویجت ارتقا به پلن بالاتر (مطابق با سند) */}
                <Grid item xs={12} md={6}>
                     <Paper elevation={3} sx={{ p: 2, textAlign: 'center', border: '1px dashed grey' }}>
                        <Typography variant="h6">
                           لینک‌های خود را در کمپین‌ها گروه‌بندی کنید!
                        </Typography>
                         <Typography variant="body2" color="text.secondary">
                           برای ردیابی عملکرد ترکیبی، به پلن حرفه‌ای ارتقا دهید.
                        </Typography>
                     </Paper>
                </Grid>
            </Grid>
        </>
    );
}