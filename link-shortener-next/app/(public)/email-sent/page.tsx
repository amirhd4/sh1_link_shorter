import { Box, Typography, Alert, Button } from '@mui/material';
import { useSearchParams } from 'next/navigation';

export function EmailSentPage() {
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  return (
    <Box textAlign="center">
      <Alert severity="success">
        <Typography variant="h5">ایمیل ارسال شد!</Typography>
        <Typography sx={{ mt: 2 }}>
          یک ایمیل حاوی لینک فعال‌سازی به آدرس <b>{email || 'شما'}</b> ارسال شد.
          <br/>
          لطفاً برای تکمیل ثبت‌نام، روی لینک موجود در آن کلیک کنید.
        </Typography>
      </Alert>
      {/* می‌توانید دکمه "ارسال مجدد" را در اینجا اضافه کنید */}
    </Box>
  );
}