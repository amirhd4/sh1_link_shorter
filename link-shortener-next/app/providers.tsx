'use client'

import { ReactNode, useState, useEffect } from 'react'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import rtlPlugin from 'stylis-plugin-rtl'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from '@/styles/theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppInitializer from "@/app/AppInitializer";

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
})

export default function ClientProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // 👈 استاندارد Next.js برای ساخت QueryClient در کامپوننت‌های کلاینت
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: false,
      },
    },
  }))

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AppInitializer>{children}</AppInitializer>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}