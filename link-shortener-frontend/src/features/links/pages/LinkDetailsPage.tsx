import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { linkService } from '../../../services/linkService';
import { Box, Typography, Paper, CircularProgress, Alert, Grid, Card, CardContent } from '@mui/material';

export function LinkDetailsPage() {
  const { shortCode } = useParams<{ shortCode: string }>();

  const { data: link, isLoading, isError } = useQuery({
    queryKey: ['link-details', shortCode],
    queryFn: () => linkService.getLinkDetails(shortCode!),
    enabled: !!shortCode,
  });

  if (isLoading) return <CircularProgress />;
  if (isError || !link) return <Alert severity="error">لینک مورد نظر یافت نشد.</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        آمار و جزئیات لینک: {link.short_code}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1"><b>آدرس اصلی:</b> {link.long_url}</Typography>
        <Typography variant="body1"><b>تاریخ ایجاد:</b> {new Date(link.created_at).toLocaleString('fa-IR')}</Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">مجموع کلیک‌ها</Typography>
                <Typography variant="h3">{link.clicks.toLocaleString('fa-IR')}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}