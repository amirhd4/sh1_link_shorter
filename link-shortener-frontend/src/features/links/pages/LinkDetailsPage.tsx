import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Grid,
    IconButton,
    Tooltip,
    Snackbar,
    Link as MuiLink,
    Divider,
    Button,
    Skeleton
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import MouseIcon from '@mui/icons-material/Mouse';
import config from '../../../config';

/**
 * کامپوننت جداگانه برای نمایش نمودار آمار کلیک‌ها
 */
function ClicksChart({ shortCode }: { shortCode: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['link-stats', shortCode],
    queryFn: () => linkService.getLinkStats(shortCode),
  });

  // نمایش اسکلت لودینگ برای تجربه کاربری بهتر
  if (isLoading) {
    return <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 1 }} />;
  }

  if (isError) {
    return <Alert severity="warning" sx={{ mt: 2 }}>آمار کلیک‌ها در حال حاضر در دسترس نیست.</Alert>;
  }

  // فرمت کردن داده‌ها برای نمایش در نمودار
  const chartData = data?.clicks_last_7_days.map(item => ({
      name: new Date(item.date).toLocaleDateString('fa-IR', { weekday: 'short', day: 'numeric' }),
      'تعداد کلیک': item.clicks,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <RechartsTooltip />
        <Legend />
        <Bar dataKey="تعداد کلیک" fill="#1976d2" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * صفحه اصلی برای نمایش جزئیات کامل و آمار یک لینک
 */
export function LinkDetailsPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);

  const { data: link, isLoading, isError } = useQuery({
    queryKey: ['link-details', shortCode],
    queryFn: () => linkService.getLinkDetails(shortCode!),
    enabled: !!shortCode,
  });

  const fullShortUrl = `${config.backendBaseUrlOrigin}/${link?.short_code}`;
  const qrCodeUrl = `${config.backendBaseUrl}/links/${link?.short_code}/qr`;

  const handleCopyToClipboard = () => {
    if (!fullShortUrl) return;
    navigator.clipboard.writeText(fullShortUrl).then(() => {
      setSnackbarOpen(true);
    });
  };

  if (isLoading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  if (isError || !link) {
    return <Alert severity="error" sx={{ m: 2 }}>لینک مورد نظر یافت نشد.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        آمار و جزئیات لینک
      </Typography>

      <Grid container spacing={3}>
        {/* ستون اصلی اطلاعات و نمودار */}
        <Grid size={{xs:12, md:8 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

            <Box>
              <Typography variant="h6" gutterBottom>لینک کوتاه شما</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <MuiLink href={fullShortUrl} target="_blank" rel="noopener noreferrer" sx={{ flexGrow: 1, direction: 'ltr', textAlign: 'left', fontWeight: 'bold' }}>
                  {fullShortUrl.replace(/^https?:\/\//, '')}
                </MuiLink>
                <Tooltip title="کپی کردن لینک">
                  <IconButton onClick={handleCopyToClipboard} size="small">
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body1" color="text.secondary">هدایت می‌شود به:</Typography>
              <Typography variant="body2" sx={{ direction: 'ltr', textAlign: 'left', wordBreak: 'break-all', mt: 1 }}>
                {link.long_url}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>آمار بازدید در ۷ روز گذشته</Typography>
              <ClicksChart shortCode={link.short_code} />
            </Box>

          </Paper>
        </Grid>

        {/* ستون کناری برای QR کد و آمار کلی */}
        <Grid size={{xs:12, md:4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
                <QrCode2Icon color="primary" sx={{ fontSize: 40 }}/>
                <Typography variant="h6" gutterBottom>کد QR</Typography>
                <Box
                  component="img"
                  src={qrCodeUrl}
                  alt="QR Code"
                  sx={{ width: '100%', maxWidth: 200, height: 'auto', mt: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                />
                 <Button variant="outlined" sx={{ mt: 2 }} href={qrCodeUrl} download={`qr-${link.short_code}.png`}>
                    دانلود QR کد
                </Button>
            </Box>
            <Divider />
            <Box>
                <MouseIcon color="primary" sx={{ fontSize: 40 }}/>
                <Typography variant="h6">مجموع کلیک‌ها</Typography>
                <Typography variant="h3" component="p" fontWeight="bold">{link.clicks.toLocaleString('fa-IR')}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="لینک کوتاه در کلیپ‌بورد کپی شد!"
      />
    </Box>
  );
}