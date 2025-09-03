import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useUserStore } from '../../../store/userStore';
import { authService } from '../../../services/authService';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  useEffect(() => {
    const token = searchParams.get('token');

    const loginWithToken = async (authToken: string) => {
      localStorage.setItem('access_token', authToken);
      try {
        const user = await authService.getMe();
        setUser(user);
        navigate('/dashboard');
      } catch (error) {
        navigate('/login');
      }
    };

    if (token) {
      loginWithToken(token);
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>در حال ورود به حساب کاربری شما...</Typography>
    </Box>
  );
}