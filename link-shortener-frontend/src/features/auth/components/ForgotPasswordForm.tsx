import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/authService'; // متد جدید را باید اضافه کنیم

const schema = z.object({ email: z.string().email('آدرس ایمیل معتبر نیست.') });

export function ForgotPasswordForm() {
  const { control, handleSubmit } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: authService.forgotPassword,
  });

  const onSubmit = (data: { email: string }) => {
    mutation.mutate(data.email);
  };

  if (mutation.isSuccess) {
    return <Alert severity="success">اگر ایمیل شما در سیستم موجود باشد، لینک بازیابی رمز عبور برایتان ارسال شد.</Alert>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography component="h1" variant="h5">بازیابی رمز عبور</Typography>
      <Controller name="email" control={control} render={({ field, fieldState }) => (
          <TextField {...field} margin="normal" required fullWidth label="آدرس ایمیل" error={!!fieldState.error} helperText={fieldState.error?.message} />
        )}
      />
      {mutation.isError && <Alert severity="error">خطایی رخ داد. لطفاً دوباره تلاش کنید.</Alert>}
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }} disabled={mutation.isPending}>
        ارسال لینک بازیابی
      </Button>
    </Box>
  );
}