import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab } from '@mui/material';
import { getAdStatsPerLink, getAdStatsPerUser } from '../../../services/admin.ts';
import type {AdStatsPerLink, AdStatsPerUser} from "../../../types";


export function AdStatsPage() {
  const [statsLink, setStatsLink] = useState<AdStatsPerLink[]>([]);
  const [statsUser, setStatsUser] = useState<AdStatsPerUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      if (tabIndex === 0) {
        const linkStats = await getAdStatsPerLink();
        // ✅ مطمئن شو که خروجی واقعا آرایه است
        if (Array.isArray(linkStats)) {
          setStatsLink(linkStats);
        } else {
          console.warn('Unexpected linkStats data:', linkStats);
          setStatsLink([]); // مقدار پیش‌فرض امن
        }
      } else {
        const userStats = await getAdStatsPerUser();
        if (Array.isArray(userStats)) {
          setStatsUser(userStats);
        } else {
          console.warn('Unexpected userStats data:', userStats);
          setStatsUser([]);
        }
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch statistics.');
      // ✅ در صورت خطا هم state‌هارو ریست کن تا map ارور نده
      setStatsLink([]);
      setStatsUser([]);
    }
  };

  fetchStats();
}, [tabIndex]);


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        آمار تبلیغات
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="ad stats tabs">
          <Tab label="آمار بر اساس لینک" />
          <Tab label="آمار بر اساس کاربر" />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>کد کوتاه</TableCell>
                <TableCell>URL اصلی</TableCell>
                <TableCell>مجموع بازدیدها</TableCell>
                <TableCell>مجموع امتیازات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statsLink.map((stat) => (
                <TableRow key={stat.short_code}>
                  <TableCell>{stat.short_code}</TableCell>
                  <TableCell>{stat.long_url}</TableCell>
                  <TableCell>{stat.total_views}</TableCell>
                  <TableCell>{stat.total_points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabIndex === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>شناسه کاربر</TableCell>
                <TableCell>ایمیل کاربر</TableCell>
                <TableCell>مجموع بازدیدها</TableCell>
                <TableCell>مجموع امتیازات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statsUser.map((stat) => (
                <TableRow key={stat.user_id}>
                  <TableCell>{stat.user_id}</TableCell>
                  <TableCell>{stat.user_email}</TableCell>
                  <TableCell>{stat.total_views}</TableCell>
                  <TableCell>{stat.total_points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
