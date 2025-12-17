'use client';

import React, { Suspense, useEffect } from 'react'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import rtlPlugin from 'stylis-plugin-rtl'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '@/styles/theme'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from '@/lib/queryClient'
import { HelmetProvider } from 'react-helmet-async'

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
})

export default function Providers({ children }: { children: React.ReactNode }) {

  // Service Worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/pages/sw.js')
          .then(reg => console.log('SW registered', reg))
          .catch(err => console.log('SW reg failed', err))
      })
    }
  }, [])

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <HelmetProvider>
            <Suspense fallback={<div>بارگیری...</div>}>
              {children}
            </Suspense>
          </HelmetProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}
