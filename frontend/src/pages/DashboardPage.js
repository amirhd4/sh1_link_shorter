import React from 'react';
import { Typography, Grid, Paper } from '@mui/material';
import StatWidget from '../components/StatWidget';
import BarChartIcon from '@mui/icons-material/BarChart';
import PublicIcon from '@mui/icons-material/Public';
import AdsClickIcon from '@mui/icons-material/AdsClick';

export default function DashboardPage() {
    // این داده‌ها در آینده از API خوانده می‌شوند
    const stats = {
        totalClicks: 1408,
        topCountry: 'ایران',
        topReferrer: 'Twitter',
    };

    return (
        <>
            <Typography variant="h4" gutterBottom>
                کابین خلبان شما
            </Typography>
            <Grid container spacing={3}>
                {/* بخش ویجت‌های آمار */}
                <Grid item xs={12} sm={4}>
                    <StatWidget title="مجموع کلیک‌ها (۳۰ روز)" value={stats.totalClicks} icon={<BarChartIcon fontSize="large" />} />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatWidget title="کشور برتر" value={stats.topCountry} icon={<PublicIcon fontSize="large" />} />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatWidget title="منبع ارجاع برتر" value={stats.topReferrer} icon={<AdsClickIcon fontSize="large" />} />
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