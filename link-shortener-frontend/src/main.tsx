import React, { Suspense } from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App.tsx'
import theme from './styles/theme.ts'
import './i18n.ts'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import rtlPlugin from 'stylis-plugin-rtl'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './lib/queryClient.ts'
import { HelmetProvider } from 'react-helmet-async'

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
})

if (typeof window !== "undefined") {
  const root = document.getElementById('root')
  if (root) {
    hydrateRoot(
      root,
      <React.StrictMode>
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
              <CssBaseline />
              <HelmetProvider>
                <Suspense fallback={<div>بارگیری...</div>}>
                  <App />
                </Suspense>
              </HelmetProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </CacheProvider>
      </React.StrictMode>
    )
  }
}
