import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Paper,
  Stack,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { Turnstile } from '@marsidev/react-turnstile';
import {useState} from "react";


const schema = z.object({
  email: z.string().email('آدرس ایمیل معتبر نیست.'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: { email: string; captcha_token: string }) =>
      authService.forgotPassword(data.email, data.captcha_token),
    onError: () => setSnackbarMessage('مشکلی رخ داد. لطفاً دوباره تلاش کنید.'),
    onSuccess: () =>
      setSnackbarMessage(
        'در صورت وجود حساب، لینک بازیابی برای شما ارسال شد.'
      ),
  });

  const onSubmit = (data: FormValues) => {
    if (!captchaToken) {
      setSnackbarMessage('لطفاً کپچا را کامل کنید 🛡️');
      return;
    }
    mutation.mutate({ ...data, captcha_token: captchaToken });
  };

  return (
    <>
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          maxWidth: 520,
          mx: 'auto',
          mt: { xs: 4, sm: 6 },
          background: 'linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)',
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)',
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, mb: 1, textAlign: 'center', color: '#4c1d95' }}
          >
            بازیابی رمز عبور
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', mb: 3, color: '#6b7280' }}
          >
            آدرس ایمیلی که هنگام ثبت‌نام استفاده کرده‌اید را وارد کنید.
            در صورتی که ایمیل در سیستم باشد، لینک بازیابی ارسال خواهد شد.
          </Typography>

          <Stack spacing={2}>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="آدرس ایمیل"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  variant="outlined"
                  sx={{
                    background: '#fff',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#c084fc' },
                      '&.Mui-focused fieldset': { borderColor: '#7c3aed', borderWidth: 2 },
                    },
                  }}
                />
              )}
            />

            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => setCaptchaToken(null)}
              options={{ theme: 'light', size: 'normal' }}
              onExpire={() => setCaptchaToken(null)}
            />

            {mutation.isError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                مشکلی رخ داد. لطفاً دوباره تلاش کنید یا بعداً مراجعه کنید.
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={mutation.isPending}
              sx={{
                mt: 1,
                py: 1.4,
                borderRadius: 50,
                fontWeight: 700,
                fontSize: '1rem',
                background: 'linear-gradient(90deg, #7c3aed, #d946ef)',
                color: '#fff',
                boxShadow: '0 8px 26px rgba(124,58,237,0.18)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(124,58,237,0.22)',
                },
              }}
            >
              {mutation.isPending ? (
                <CircularProgress size={18} thickness={5} color="inherit" />
              ) : (
                'ارسال لینک بازیابی'
              )}
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </>
  );
}
