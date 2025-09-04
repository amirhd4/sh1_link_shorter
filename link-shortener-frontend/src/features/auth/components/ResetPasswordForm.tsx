import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/authService';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';

// اسکیمای کامل و صحیح برای این فرم
const resetPasswordSchema = z.object({
  new_password: z.string().min(6, 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: "رمز عبور جدید و تکرار آن مطابقت ندارند.",
  path: ["confirm_password"], // نمایش خطا زیر فیلد تکرار رمز
});

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  const mutation = useMutation({
    mutationFn: authService.resetPassword,
  });

  const onSubmit = (data: ResetPasswordFormInputs) => {
    if (token) {
      mutation.mutate({ token, new_password: data.new_password });
    }
  };

  if (!token) {
    return <Alert severity="error">لینک بازیابی نامعتبر است یا منقضی شده.</Alert>;
  }

  if (mutation.isSuccess) {
    return (
      <Alert severity="success" sx={{ textAlign: 'center' }}>
        <Typography variant="h5">رمز عبور شما با موفقیت تغییر کرد!</Typography>
        <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 2 }}>
          بازگشت به صفحه ورود
        </Button>
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" component="h1" gutterBottom>
        تنظیم رمز عبور جدید
      </Typography>

      {mutation.isError && <Alert severity="error" sx={{ my: 2 }}>لینک شما نامعتبر یا منقضی شده است.</Alert>}

      <Controller
        name="new_password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            margin="normal"
            required
            fullWidth
            label="رمز عبور جدید"
            error={!!errors.new_password}
            helperText={errors.new_password?.message}
          />
        )}
      />
      <Controller
        name="confirm_password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            margin="normal"
            required
            fullWidth
            label="تکرار رمز عبور جدید"
            error={!!errors.confirm_password}
            helperText={errors.confirm_password?.message}
          />
        )}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'در حال ثبت...' : 'ثبت رمز جدید'}
      </Button>
    </Box>
  );
}