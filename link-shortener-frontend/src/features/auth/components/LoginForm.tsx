import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Typography, Alert, Link } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/authService';
import { useUserStore } from '../../../store/userStore';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import type { LoginCredentials } from '../../../types/auth';


const loginSchema = z.object({
  email: z.string().email('آدرس ایمیل معتبر نیست.'),
  password: z.string().min(1, 'رمز عبور نمی‌تواند خالی باشد.'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {

  const [searchParams] = useSearchParams();
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
    // تایپ صریح برای credentials
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async (data) => {
      // 1. ذخیره توکن در حافظه محلی
      localStorage.setItem('access_token', data.access_token);

      try {
        // 2. واکشی اطلاعات کامل و صحیح کاربر از سرور
        const user = await authService.getMe();

        // 3. ذخیره اطلاعات کامل کاربر در استور Zustand
        // اکنون تایپ user با تایپ مورد انتظار setUser کاملاً مطابقت دارد
        setUser(user);

        // 4. هدایت کاربر به صفحه داشبورد
        navigate('/dashboard');
      } catch (error) {
          loginMutation.reset(); // ریست کردن وضعیت خطا
          console.error("خطا در واکشی اطلاعات کاربر پس از ورود:", error);
          // می‌توانید در اینجا یک پیام خطا در UI نمایش دهید
      }
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

        {searchParams.get('registered') && (
        <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
          ثبت‌نام شما با موفقیت انجام شد! اکنون می‌توانید وارد شوید.
        </Alert>
      )}

      {loginMutation.isError && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
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

        <Link component={RouterLink} to="/register" variant="body2">
        {"حساب کاربری ندارید؟ ثبت‌نام کنید"}
      </Link>
    </Box>
  );
}