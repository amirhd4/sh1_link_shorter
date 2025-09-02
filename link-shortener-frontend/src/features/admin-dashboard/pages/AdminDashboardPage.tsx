import { useQuery } from '@tanstack/react-query';
import { Grid, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { adminService } from '../../../services/adminService';
import { StatCard } from '../components/StatCard';

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        داشبورد ادمین - نمای کلی سیستم
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="تعداد کل کاربران" value={stats?.total_users ?? 0} icon={<PeopleIcon fontSize="inherit" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="تعداد کل لینک‌ها" value={stats?.total_links ?? 0} icon={<LinkIcon fontSize="inherit" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="مجموع کل کلیک‌ها" value={stats?.total_clicks ?? 0} icon={<MouseIcon fontSize="inherit" />} />
        </Grid>
      </Grid>
    </Box>
  );
}