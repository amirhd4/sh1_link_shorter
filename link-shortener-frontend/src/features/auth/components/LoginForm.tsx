import { useState } from 'react'; // <<<< ایمپورت useState
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, Typography, Alert, Link as MuiLink, Grid, Divider } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/authService';
import { useUserStore } from '../../../store/userStore';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import type { LoginCredentials } from '../../../types/auth';
import { GoogleLoginButton } from './GoogleLoginButton';

const loginSchema = z.object({
  email: z.string().email('آدرس ایمیل معتبر نیست.'),
  password: z.string().min(1, 'رمز عبور نمی‌تواند خالی باشد.'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useUserStore();

  // ۱. تعریف state برای مدیریت نمایش خطای تایید ایمیل <<<<
  const [verificationError, setVerificationError] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { control, handleSubmit, getValues, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async (data) => {
      localStorage.setItem('access_token', data.access_token);
      try {
        const user = await authService.getMe();
        setUser(user);
        navigate('/dashboard');
      } catch (error) {
        console.error("خطا در واکشی اطلاعات کاربر پس از ورود:", error);
      }
    },
    onError: (error: any) => {
      // بررسی می‌کنیم که آیا خطا به دلیل تایید نشدن ایمیل است یا خیر
      if (error.response?.status === 403 && error.response?.data?.detail.includes("Email not verified")) {
        setVerificationError(true);
      } else {
        setVerificationError(false);
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: authService.resendVerificationEmail,
    onSuccess: () => {
      setResendSuccess(true);
      setVerificationError(false); // مخفی کردن پیام خطای اولیه
    }
  });

  // ۲. تعریف تابع برای ارسال مجدد لینک <<<<
  const handleResend = () => {
    const email = getValues("email"); // دریافت ایمیل وارد شده در فرم
    if (email) {
      resendMutation.mutate(email);
    }
  };

  const onSubmit = (data: LoginFormInputs) => {
    setVerificationError(false);
    setResendSuccess(false);
    loginMutation.mutate(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Typography component="h1" variant="h5">
        ورود به حساب کاربری
      </Typography>

      {searchParams.get('registered') && (
        <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
          ثبت‌نام شما با موفقیت انجام شد! لطفاً ایمیل خود را برای فعال‌سازی حساب بررسی کنید.
        </Alert>
      )}

      {resendSuccess && (
         <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            ایمیل فعال‌سازی مجدداً برای شما ارسال شد.
        </Alert>
      )}

      {loginMutation.isError && !verificationError && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            ایمیل یا رمز عبور اشتباه است.
          </Alert>
      )}

      {/* ۳. قرار دادن JSX در محل مناسب <<<< */}
      {verificationError && (
        <Alert severity="warning" sx={{mt: 2, width: '100%' }}>
            ایمیل شما هنوز تایید نشده است.
            <Button
              onClick={handleResend}
              disabled={resendMutation.isPending}
              size="small"
            >
              {resendMutation.isPending ? "در حال ارسال..." : "ارسال مجدد لینک"}
            </Button>
        </Alert>
      )}

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField {...field} margin="normal" required fullWidth label="آدرس ایمیل" autoComplete="email" autoFocus error={!!errors.email} helperText={errors.email?.message} />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField {...field} margin="normal" required fullWidth label="رمز عبور" type="password" autoComplete="current-password" error={!!errors.password} helperText={errors.password?.message} />
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

      <Divider sx={{ my: 2 }}>یا</Divider>
      <GoogleLoginButton />

      <Grid container>
        <Grid>
          <MuiLink component={RouterLink} to="/forgot-password" variant="body2">
            رمز عبور خود را فراموش کرده‌اید؟
          </MuiLink>
        </Grid>
        <Grid>
          <MuiLink component={RouterLink} to="/register" variant="body2">
            {"حساب کاربری ندارید؟ ثبت‌نام کنید"}
          </MuiLink>
        </Grid>
      </Grid>
    </Box>
  );
}