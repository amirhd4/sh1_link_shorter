"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab } from '@mui/material';
import { getAdStatsPerLink, getAdStatsPerUser } from '@/services/admin';
import type { AdStatsPerLink, AdStatsPerUser } from "@/types";

export default function AdStatsPage() {
  const [statsLink, setStatsLink] = useState<AdStatsPerLink[]>([]);
  const [statsUser, setStatsUser] = useState<AdStatsPerUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  // تنظیم عنوان صفحه فقط یک بار
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = "آمار تبلیغات";
    }
  }, []);

  // فراخوانی داده‌ها بر اساس tabIndex
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null); // ریست خطا قبل از fetch
        if (tabIndex === 0) {
          const linkStats = await getAdStatsPerLink();
          if (Array.isArray(linkStats)) {
            setStatsLink(linkStats);
          } else {
            console.warn('Unexpected linkStats data:', linkStats);
            setStatsLink([]);
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
                <TableCell>بازدیدهای منحصر به فرد</TableCell>
                <TableCell>مجموع امتیازات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statsLink.map((stat) => (
                <TableRow key={stat.short_code}>
                  <TableCell>{stat.short_code}</TableCell>
                  <TableCell>{stat.long_url}</TableCell>
                  <TableCell>{stat.total_views}</TableCell>
                  <TableCell>{stat.unique_views}</TableCell>
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
                <TableCell>کاربر</TableCell>
                <TableCell>مجموع بازدیدها</TableCell>
                <TableCell>بازدیدهای منحصر به فرد</TableCell>
                <TableCell>مجموع امتیازات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statsUser.map((stat) => (
                <TableRow key={stat.user_id}>
                  <TableCell>{stat.user_id}</TableCell>
                  <TableCell>{stat.user}</TableCell>
                  <TableCell>{stat.total_views}</TableCell>
                  <TableCell>{stat.unique_views}</TableCell>
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
