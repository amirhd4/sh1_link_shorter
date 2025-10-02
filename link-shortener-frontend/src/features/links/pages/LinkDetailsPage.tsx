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
import PublicIcon from '@mui/icons-material/Public';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import config from '../../../config';
import type { AdvancedLinkStats } from '../../../types/api';

/**
 * نمودار کلیک ۷ روزه
 */
function ClicksChart({ stats }: { stats: AdvancedLinkStats }) {
  const chartData = stats.clicks_last_7_days.map(item => ({
    name: new Date(item.date).toLocaleDateString('fa-IR', { weekday: 'short', day: 'numeric' }),
    'تعداد کلیک': item.clicks
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
 * جزئیات لینک + آمار پیشرفته
 */
export function LinkDetailsPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);

  const { data: linkDetails, isLoading, isError } = useQuery({
    queryKey: ['link-details', shortCode],
    queryFn: () => linkService.getLinkDetails(shortCode!),
    enabled: !!shortCode
  });

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['link-analytics', shortCode],
    queryFn: () => linkService.getLinkStats(shortCode!),
    enabled: !!shortCode
  });

  const fullShortUrl = `${config.backendBaseUrlOrigin}/${linkDetails?.short_code}`;
  const qrCodeUrl = `${config.backendBaseUrl}/links/${linkDetails?.short_code}/qr`;

  const handleCopyToClipboard = () => {
    if (!fullShortUrl) return;
    navigator.clipboard.writeText(fullShortUrl).then(() => setSnackbarOpen(true));
  };

  if (isLoading || isAnalyticsLoading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  if (isError || !linkDetails || !analytics) {
    return <Alert severity="error" sx={{ m: 2 }}>لینک مورد نظر یافت نشد.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>آمار و جزئیات لینک</Typography>

      <Grid container spacing={3}>
        {/* ستون اصلی */}
        <Grid size={{xs: 12, md: 8}}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* لینک کوتاه */}
            <Box>
              <Typography variant="h6" gutterBottom>لینک کوتاه شما</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <MuiLink href={fullShortUrl} target="_blank" rel="noopener noreferrer" sx={{ flexGrow: 1, direction: 'ltr', textAlign: 'left', fontWeight: 'bold' }}>
                  {fullShortUrl.replace(/^https?:\/\//, '')}
                </MuiLink>
                <Tooltip title="کپی کردن لینک">
                  <IconButton onClick={handleCopyToClipboard} size="small"><ContentCopyIcon /></IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider />

            {/* لینک مقصد */}
            <Box>
              <Typography variant="body1" color="text.secondary">هدایت می‌شود به:</Typography>
              <Typography variant="body2" sx={{ direction: 'ltr', textAlign: 'left', wordBreak: 'break-all', mt: 1 }}>
                {linkDetails.long_url}
              </Typography>
            </Box>

            <Divider />

            {/* نمودار کلیک */}
            <Box>
              <Typography variant="h6" gutterBottom>آمار بازدید در ۷ روز گذشته</Typography>
              <ClicksChart stats={analytics} />
            </Box>
          </Paper>
        </Grid>

        {/* ستون جانبی */}
        <Grid size={{xs: 12, md: 4}}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
            {/* QR */}
            <Box textAlign="center">
              <QrCode2Icon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">کد QR</Typography>
              <Box component="img" src={qrCodeUrl} alt="QR Code" sx={{ width: '100%', maxWidth: 200, mt: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }} />
              <Button variant="outlined" sx={{ mt: 2 }} href={qrCodeUrl} download={`qr-${linkDetails.short_code}.png`}>
                دانلود QR کد
              </Button>
            </Box>

            <Divider />

            {/* کلیک‌ها */}
            <Box textAlign="center">
              <MouseIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">مجموع کلیک‌ها</Typography>
              <Typography variant="h3" fontWeight="bold">{analytics.total_clicks.toLocaleString('fa-IR')}</Typography>
            </Box>

            {/* کلیک بات‌ها */}
            <Box textAlign="center">
              <SmartToyIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">کلیک بات‌ها</Typography>
              <Typography variant="h4">{analytics.bot_clicks.toLocaleString('fa-IR')}</Typography>
            </Box>

            {/* آی‌پی یونیک */}
            <Box textAlign="center">
              <PublicIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">IP یونیک</Typography>
              <Typography variant="h4">{analytics.unique_ips.toLocaleString('fa-IR')}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* جدول کشورها */}
      <Box mt={4}>
      <Typography variant="h6" gutterBottom>توزیع جغرافیایی کلیک‌ها</Typography>
      <Paper sx={{ p: 2 }}>
        {analytics.geos.length > 0 ? (
          <Grid container spacing={2}>
            {analytics.geos.map((g, idx) => (
              <Grid key={idx} size={{xs: 12, sm: 6, md: 4, lg:3 }}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {g.country || 'نامشخص'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {g.region || 'ناشناخته'} {g.city ? `- ${g.city}` : ''}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold" mt={1}>
                    {g.clicks.toLocaleString('fa-IR')}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">داده‌ای موجود نیست.</Typography>
        )}
      </Paper>
    </Box>


        {/* جدول ارجاع‌دهنده‌ها */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>ارجاع‌دهنده‌ها (Referrers)</Typography>
          <Paper sx={{ p: 2 }}>
            {analytics.top_referrers.length > 0 ? (
              analytics.top_referrers.map((r, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2">{r.referer || 'نامشخص'}</Typography>
                  <Typography variant="body2" fontWeight="bold">{r.clicks}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">داده‌ای موجود نیست.</Typography>
            )}
          </Paper>
        </Box>

        {/* جدول مرورگرها / دستگاه‌ها */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>مرورگرها / دستگاه‌ها (User Agents)</Typography>
          <Paper sx={{ p: 2 }}>
            {analytics.user_agents.length > 0 ? (
              analytics.user_agents.map((ua, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2">{ua.user_agent}</Typography>
                  <Typography variant="body2" fontWeight="bold">{ua.clicks}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">داده‌ای موجود نیست.</Typography>
            )}
          </Paper>
        </Box>


      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="لینک کوتاه در کلیپ‌بورد کپی شد!"
      />
    </Box>
  );
}
