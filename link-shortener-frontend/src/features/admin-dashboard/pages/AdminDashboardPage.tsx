import { useQuery } from '@tanstack/react-query';
import { Grid, Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { adminService } from '../../../services/adminService';
import { StatCard } from '../components/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';
import MouseIcon from '@mui/icons-material/Mouse';


export function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['system-stats'],
    queryFn: adminService.getSystemStats,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">خطا در دریافت آمار سیستم.</Alert>;

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
          <StatCard title="تعداد کل کاربران" value={stats?.total_users ?? 0} icon={<PeopleIcon fontSize="inherit" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md:4 }}>
          <StatCard title="تعداد کل لینک‌ها" value={stats?.total_links ?? 0} icon={<LinkIcon fontSize="inherit" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md:4 }}>
          <StatCard title="مجموع کل کلیک‌ها" value={stats?.total_clicks ?? 0} icon={<MouseIcon fontSize="inherit" />} />
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