import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/authService';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authService.verifyEmail, // متد جدید در سرویس
  });

  useEffect(() => {
    if (token) {
      mutation.mutate(token);
    } else {
      navigate('/login'); // اگر توکن نبود، به لاگین هدایت کن
    }
  }, [token]);

  return (
    <Box textAlign="center">
      {mutation.isPending && <CircularProgress />}
      {mutation.isError && <Alert severity="error">لینک تایید نامعتبر یا منقضی شده است.</Alert>}
      {mutation.isSuccess && (
        <Alert severity="success">
          <Typography variant="h5">ایمیل شما با موفقیت تایید شد!</Typography>
          <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 2 }}>
            ورود به حساب کاربری
          </Button>
        </Alert>
      )}
    </Box>
  );
}