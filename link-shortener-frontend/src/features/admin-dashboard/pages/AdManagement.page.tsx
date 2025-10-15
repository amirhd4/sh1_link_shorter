import { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getAds, deleteAd } from '../../../services/admin.ts';
import { Ad } from '../../../types';

export function AdManagementPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = async () => {
    try {
      const adsData = await getAds();
      setAds(adsData);
    } catch (err) {
      setError('Failed to fetch ads.');
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async (adId: number) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await deleteAd(adId);
        fetchAds(); // Refresh the list
      } catch (err) {
        setError('Failed to delete ad.');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        مدیریت تبلیغات
      </Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }}>
        ایجاد تبلیغ جدید
      </Button>
      {error && <Typography color="error">{error}</Typography>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شناسه</TableCell>
              <TableCell>عنوان</TableCell>
              <TableCell>نوع</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>{ad.id}</TableCell>
                <TableCell>{ad.title}</TableCell>
                <TableCell>{ad.media_type}</TableCell>
                <TableCell>{ad.is_active ? 'فعال' : 'غیرفعال'}</TableCell>
                <TableCell>
                  <IconButton color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDelete(ad.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
