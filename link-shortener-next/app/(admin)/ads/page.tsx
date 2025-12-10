import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getAds, createAd, updateAd, deleteAd } from '../../../services/admin';
import type { Ad, AdCreate, AdUpdate } from '../../../types';

export function AdManagementPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState<AdCreate>({
    title: '',
    media_type: '',
    media_url: '',
    target_url: '',
    is_active: true,
    duration: 5,
  });

  // === Fetch Ads ===
  const fetchAds = async () => {
    try {
      const adsData = await getAds();
      if (Array.isArray(adsData)) {
        setAds(adsData);
      } else {
        console.error('Unexpected ads data:', adsData);
        setAds([]);
      }
    } catch {
      setError('Failed to fetch ads.');
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // === Handle Delete ===
  const handleDelete = async (adId: number) => {
    if (window.confirm('آیا از حذف این تبلیغ مطمئنی؟')) {
      try {
        await deleteAd(adId);
        await fetchAds();
      } catch {
        setError('خطا در حذف تبلیغ.');
      }
    }
  };

  // === Handle Form Changes ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // === Open Create Modal ===
  const handleOpenCreate = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      media_type: '',
      media_url: '',
      target_url: '',
      is_active: true,
      duration: 5,
    });
    setOpen(true);
  };

  // === Open Edit Modal ===
  const handleOpenEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      media_type: ad.media_type,
      media_url: ad.media_url,
      target_url: ad.target_url || '',
      is_active: ad.is_active,
      duration: ad.duration,
    });
    setOpen(true);
  };

  // === Submit (Create or Update) ===
  const handleSubmit = async () => {
    try {
      if (editingAd) {
        // Update mode
        const updated: AdUpdate = formData;
        await updateAd(editingAd.id, updated);
      } else {
        // Create mode
        await createAd(formData);
      }
      setOpen(false);
      await fetchAds();
    } catch {
      setError('خطا در ذخیره تبلیغ.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        مدیریت تبلیغات
      </Typography>

      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleOpenCreate}>
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
              <TableCell>مدت (ثانیه)</TableCell>
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
                <TableCell>{ad.duration}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenEdit(ad)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDelete(ad.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  تبلیغی وجود ندارد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* === Dialog (Create / Edit) === */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingAd ? 'ویرایش تبلیغ' : 'ایجاد تبلیغ جدید'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="عنوان"
            name="title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="نوع رسانه"
            name="media_type"
            fullWidth
            value={formData.media_type}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="آدرس رسانه (media_url)"
            name="media_url"
            fullWidth
            value={formData.media_url}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="آدرس هدف (اختیاری)"
            name="target_url"
            fullWidth
            value={formData.target_url}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="مدت نمایش (ثانیه)"
            name="duration"
            type="number"
            fullWidth
            value={formData.duration}
            onChange={handleChange}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={handleChange}
                name="is_active"
              />
            }
            label="فعال"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {editingAd ? 'ذخیره تغییرات' : 'ایجاد'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
