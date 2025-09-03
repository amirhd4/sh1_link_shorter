import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/authService';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';

const schema = z.object({ /* ... schema from ChangePasswordForm ... */ });

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({ mutationFn: authService.resetPassword });

  const onSubmit = (data: any) => {
    if (token) {
      mutation.mutate({ token, new_password: data.new_password });
    }
  };

  if (!token) {
    return <Alert severity="error">لینک بازیابی نامعتبر است یا منقضی شده.</Alert>;
  }
  if (mutation.isSuccess) {
    return (
      <Alert severity="success">
        رمز عبور شما با موفقیت تغییر کرد.
        <Button component={RouterLink} to="/login" sx={{ml: 2}}>ورود به حساب</Button>
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5">تنظیم رمز عبور جدید</Typography>
      {/* ... فیلدهای new_password و confirm_password مشابه ChangePasswordForm ... */}
      {mutation.isError && <Alert severity="error">لینک شما نامعتبر یا منقضی شده است.</Alert>}
      <Button type="submit" fullWidth variant="contained" disabled={mutation.isPending}>
        ثبت رمز جدید
      </Button>
    </Box>
  );
}