import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  email: z.string().email('آدرس ایمیل معتبر نیست.'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.'),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      // پس از ثبت‌نام موفق، کاربر را به صفحه ورود هدایت می‌کنیم
      navigate('/login');
    },
  });

  const onSubmit = (data: RegisterFormInputs) => {
    registerMutation.mutate(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Typography component="h1" variant="h5">
        ایجاد حساب کاربری جدید
      </Typography>

      {registerMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            خطا در ثبت‌نام. ممکن است این ایمیل قبلاً استفاده شده باشد.
          </Alert>
      )}

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            label="آدرس ایمیل"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            label="رمز عبور"
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        )}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? 'در حال ایجاد حساب...' : 'ثبت‌نام'}
      </Button>
    </Box>
  );
}