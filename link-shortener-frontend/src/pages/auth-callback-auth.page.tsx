import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useUserStore } from '../store/userStore';
import { authService } from '../services/authService';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const loginWithToken = async () => {
      try {
        localStorage.setItem('access_token', token);
        const user = await authService.getMe();
        setUser(user);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('خطا در واکشی اطلاعات کاربر:', error);
        localStorage.removeItem('access_token');
        navigate('/login', { replace: true });
      }
    };

    loginWithToken();
  }, [searchParams, navigate, setUser]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2, fontWeight: 500 }}>
        در حال ورود به حساب کاربری شما...
      </Typography>
    </Box>
  );
}
