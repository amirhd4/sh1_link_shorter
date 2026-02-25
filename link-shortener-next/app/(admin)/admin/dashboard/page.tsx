"use client";

import { useQuery } from '@tanstack/react-query';
import { Grid, Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { adminService } from '@/services/adminService';
import { StatCard } from '@/components/admin-dashboard/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';
import MouseIcon from '@mui/icons-material/Mouse';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'; // برای تیکت
import WebAssetIcon from '@mui/icons-material/WebAsset'; // برای بیو لینک
import {useEffect} from "react";


export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['system-stats'],
    queryFn: adminService.getSystemStats,
  });

    useEffect(() => {
    document.title = "میز کار ادمین";
  }, []);

  const { data: adStats, isLoading: isAdStatsLoading, isError: isAdStatsError } = useQuery({
    queryKey: ['ad-system-stats'],
    queryFn: adminService.getAdSystemStats,
  });

  if (isLoading || isAdStatsLoading) return <CircularProgress />;
  if (isError || isAdStatsError) return <Alert severity="error">خطا در دریافت آمار سیستم.</Alert>;

  // فرمت کردن داده برای نمودار
  const chartData = stats?.new_users_last_7_days.map(item => ({
      name: new Date(item.date).toLocaleDateString('fa-IR', { day: 'numeric', month: 'short' }),
      'کاربران جدید': item.count,
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        داشبورد ادمین - نمای کلی سیستم
      </Typography>
      <Grid container spacing={3}>

        <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="تعداد کل تیکت ها" value={stats?.total_tickets ?? 0} icon={<ConfirmationNumberIcon fontSize="inherit" />} />
        </Grid>

        <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="تعداد کل کاربران" value={stats?.total_users ?? 0} icon={<PeopleIcon fontSize="inherit" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md:4 }}>
          <StatCard title="تعداد کل لینک‌ها" value={stats?.total_links ?? 0} icon={<LinkIcon fontSize="inherit" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md:4 }}>
          <StatCard title="مجموع کل کلیک‌ها" value={stats?.total_clicks ?? 0} icon={<MouseIcon fontSize="inherit" />} />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md:4 }}>ل
          <StatCard title="تعداد کل صفحات بیو" value={stats?.total_bios ?? 0} icon={<WebAssetIcon fontSize="inherit" />} />
        </Grid>

        <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="بازدید کل تبلیغات" value={adStats?.total_ad_views ?? 0} icon={<VisibilityIcon fontSize="inherit" />} color="info.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md:4 }}>
          <StatCard title="بازدید یکتای تبلیغات" value={adStats?.total_unique_ad_views ?? 0} icon={<VerifiedUserIcon fontSize="inherit" />} color="warning.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md:4 }}>
          <StatCard title="کل امتیازات داده‌شده" value={adStats?.total_points_rewarded ?? 0} icon={<MonetizationOnIcon fontSize="inherit" />} color="success.main" />
        </Grid>
      </Grid>
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>کاربران جدید ثبت‌نام شده (۷ روز گذشته)</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="کاربران جدید" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}