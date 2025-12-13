"use client";

import { useEffect } from 'react';
import { useSearchParams } from "next/navigation";
import {useRouter} from "next/router";

import { Box, CircularProgress, Typography } from '@mui/material';
import { useUserStore } from '@/store/userStore';
import { authService } from '@/services/authService';

export function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const navigate = useRouter();
  const { setUser } = useUserStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
        navigate.push({
            pathname: '/login',
            query: {
                replace: true
            },
        }).then(r => null);
      return;
    }

    const loginWithToken = async () => {
      try {
        localStorage.setItem('access_token', token);
        document.cookie = `access_token=${token}; path=/`;
        const user = await authService.getMe();
        setUser(user);
        await navigate.push({
            pathname: '/dashboard',
            query: {
                replace: true
            }
        });
      } catch (error) {
        console.error('خطا در واکشی اطلاعات کاربر:', error);
        localStorage.removeItem('access_token');
        await navigate.push({
            pathname: '/login',
            query: {
                replace: true
            }
        });
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
