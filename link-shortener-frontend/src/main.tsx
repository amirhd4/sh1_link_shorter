import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import theme from './styles/theme.ts';
import './i18n.ts';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './lib/queryClient.ts';


const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* فعال‌سازی پلاگین RTL برای استایل‌ها */}
    <CacheProvider value={cacheRtl}>
      {/* اعمال تم سراسری MUI */}
      <ThemeProvider theme={theme}>
        {/* اتصال کتابخانه وضعیت سرور */}
        <QueryClientProvider client={queryClient}>
          {/* ریست کردن استایل‌های پیش‌فرض مرورگر */}
          <CssBaseline />
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);