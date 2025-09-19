import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../../services/authService';
import type { RegisterCredentials } from '../../../types/auth';
import {TextField, Button, Box, Typography, Alert, Link, Paper, type LinkProps} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type {ReactNode} from "react";

const registerSchema = z.object({
  email: z.string().email('آدرس ایمیل معتبر نیست.'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.'),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

function MuiLink(props: {
    component: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>,
    to: string,
    variant: string,
    sx: { color: string },
    children: ReactNode
}) {
    return null;
}

export function RegisterForm() {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
    onSuccess: (data) => navigate('/email-sent', { state: { email: data.email } }),
  });

  const onSubmit = (data: RegisterFormInputs) => registerMutation.mutate(data);

  return (
    <Paper
      elevation={8}
      sx={{
        p: { xs: 4, sm: 6 },
        borderRadius: 3,
        maxWidth: 450,
        mx: 'auto',
        mt: { xs: 4, sm: 6 },
        background: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center', color: '#6b21a8' }}>
          ایجاد حساب کاربری جدید
        </Typography>

        {registerMutation.isError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
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
              variant="outlined"
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
              margin="normal"
              required
              fullWidth
              label="رمز عبور"
              type="password"
              error={!!errors.password}
              helperText={errors.password?.message}
              variant="outlined"
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

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={registerMutation.isPending}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.8,
            borderRadius: 50,
            fontWeight: 600,
            fontSize: '1rem',
            background: 'linear-gradient(90deg, #a855f7, #d946ef)',
            color: '#fff',
            boxShadow: '0 6px 20px rgba(168, 85, 247, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px) scale(1.02)',
              boxShadow: '0 10px 30px rgba(168, 85, 247, 0.5)',
              background: 'linear-gradient(90deg, #9333ea, #d946ef)',
            },
          }}
        >
          {registerMutation.isPending ? 'در حال ایجاد حساب...' : 'ثبت‌نام'}
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center', color: '#4b5563' }}>
          حساب کاربری دارید؟{' '}
          <Link component={RouterLink} to="/login" sx={{ color: '#9333ea', fontWeight: 600 }}>
            وارد شوید
          </Link>
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#4b5563' }}>
          ورود با شماره{' '}
          <Link component={RouterLink} to="/register-otp" variant="body2" sx={{ color: '#6b21a8' }}>
            ثبت‌نام با شماره موبایل
          </Link>
        </Typography>

          

      </Box>
    </Paper>
  );
}
