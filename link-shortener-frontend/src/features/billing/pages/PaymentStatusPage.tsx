import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

export function PaymentStatusPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const isSuccess = location.pathname.includes('success');

  useEffect(() => {
    // اگر پرداخت موفق بود، اطلاعات کاربر را دوباره واکشی می‌کنیم تا پلن جدید او نمایش داده شود
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  }, [isSuccess, queryClient]);

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      {isSuccess ? (
        <Alert severity="success">
          <Typography variant="h5">پرداخت موفق</Typography>
          <Typography>پلن شما با موفقیت فعال شد. از امکانات جدید لذت ببرید!</Typography>
        </Alert>
      ) : (
        <Alert severity="error">
          <Typography variant="h5">پرداخت ناموفق</Typography>
          <Typography>متاسفانه در فرآیند پرداخت خطایی رخ داد. لطفاً دوباره تلاش کنید.</Typography>
        </Alert>
      )}
      <Button component={RouterLink} to="/dashboard" variant="contained" sx={{ mt: 4 }}>
        بازگشت به داشبورد
      </Button>
    </Box>
  );
}