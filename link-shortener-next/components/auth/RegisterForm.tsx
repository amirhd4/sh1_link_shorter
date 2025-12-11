import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import type { RegisterCredentials } from '@/types/auth';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Link as MuiLink,
  Paper,
  InputAdornment,
  IconButton,
  Stack,
  Snackbar
} from '@mui/material';
import Link from "next/link";
import {useRouter} from "next/router";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import {Turnstile} from "@marsidev/react-turnstile";
import config from "../../config";


const registerSchema = z.object({
  email: z.string().email('آدرس ایمیل معتبر نیست.'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.'),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: any) => authService.register(credentials),
    onSuccess: (data) =>
  navigate.push({
    pathname: '/email-sent',
    query: {
      email: data.email, // ⬅️ اینجا از 'query' استفاده می‌کنیم
    },
  }),
  });

  const onSubmit = (data: RegisterFormInputs) => {
      if (!captchaToken && !config.debug) {
        // alert("لطفاً کپچا را کامل کنید 🛡️");
        setSnackbarMessage("لطفاً کپچا را کامل کنید 🛡️");
        return;
      }
      registerMutation.mutate({
      ...data,
      captcha_token: captchaToken!,
    });

  };

  return (
    <Paper
      elevation={12}
      sx={{
        p: { xs: 4, sm: 6 },
        borderRadius: 4,
        maxWidth: 480,
        mx: 'auto',
        mt: { xs: 4, sm: 6 },
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        boxShadow: '0 14px 50px rgba(124,58,237,0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, textAlign: 'center', color: '#6d28d9' }}>
          ثبت‌نام جدید
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, color: '#5b21b6' }}>
          حساب کاربری خود را ایجاد کنید و از امکانات سایت لذت ببرید
        </Typography>

        <Stack spacing={2}>
          {registerMutation.isError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              خطا در ثبت‌نام. ممکن است این ایمیل قبلاً استفاده شده باشد.
            </Alert>
          )}

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label="آدرس ایمیل"
                error={!!errors.email}
                helperText={errors.email?.message}
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">📧</InputAdornment>
                }}
                sx={{
                  background: '#fff',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#a855f7' },
                    '&.Mui-focused fieldset': { borderColor: '#9333ea', borderWidth: 2 },
                  },
                }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label="رمز عبور"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">🔒</InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(prev => !prev)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: '#fff',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#a855f7' },
                    '&.Mui-focused fieldset': { borderColor: '#9333ea', borderWidth: 2 },
                  },
                }}
              />
            )}
          />
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => setCaptchaToken(null)}
              options={{ theme: "light", size: "normal" }}
              onExpire={() => setCaptchaToken(null)}
            />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={registerMutation.isPending}
            sx={{
              mt: 2,
              py: 1.8,
              borderRadius: 50,
              fontWeight: 700,
              fontSize: '1rem',
              background: 'linear-gradient(90deg, #a855f7, #d946ef)',
              color: '#fff',
              boxShadow: '0 12px 36px rgba(168,85,247,0.25)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 16px 48px rgba(168,85,247,0.35)',
                background: 'linear-gradient(90deg, #9333ea, #d946ef)',
              },
            }}
          >
            {registerMutation.isPending ? 'در حال ایجاد حساب...' : 'ثبت‌نام'}
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center', color: '#4b5563' }}>
            حساب کاربری دارید؟{' '}
            <MuiLink component={Link} href="/login" sx={{ color: '#9333ea', fontWeight: 600 }}>
              وارد شوید
            </MuiLink>
          </Typography>

          <Typography variant="body2" sx={{ textAlign: 'center', color: '#4b5563' }}>
            ثبت‌نام با شماره موبایل{' '}
            <MuiLink component={Link} href="/register-otp" sx={{ color: '#6b21a8', fontWeight: 600 }}>
              ادامه
            </MuiLink>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}
