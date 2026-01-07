// app/ClientProviders.tsx
'use client'

import { ReactNode, useState, useEffect } from 'react'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import rtlPlugin from 'stylis-plugin-rtl'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from '@/styles/theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
})

const AppInitializer = dynamic(() => import('./AppInitializer'), { ssr: false })

export default function ClientProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => setMounted(true), [])

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
