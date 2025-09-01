import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/authService';
import { useUserStore } from '../../../store/userStore';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('آدرس ایمیل معتبر نیست.'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // 1. ذخیره توکن
      localStorage.setItem('access_token', data.access_token);
      // 2. واکشی و ذخیره اطلاعات کاربر (در یک برنامه واقعی)
      //    این کار می‌تواند با یک کوئری دیگر برای /auth/users/me انجام شود.
      //    برای سادگی، فعلاً از ایمیل استفاده می‌کنیم.
      setUser({ id: 0, email: 'user@example.com' });
      // 3. هدایت به داشبورد
      navigate('/dashboard');
    },
  });

  const onSubmit = (data: LoginFormInputs) => {
    loginMutation.mutate(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Typography component="h1" variant="h5">
        ورود به حساب کاربری
      </Typography>

      {loginMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            ایمیل یا رمز عبور اشتباه است.
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
            id="email"
            label="آدرس ایمیل"
            autoComplete="email"
            autoFocus
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
            id="password"
            autoComplete="current-password"
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
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'در حال ورود...' : 'ورود'}
      </Button>
    </Box>
  );
}