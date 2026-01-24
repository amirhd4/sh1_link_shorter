import './globals.css'
import type {Metadata, Viewport} from 'next'
import Script from 'next/script'
import ClientProviders from './providers'
import localFont from 'next/font/local'

const vazirmatn = localFont({
  src: [
    {
      path: '../public/fonts/Vazirmatn-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Vazirmatn-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-vazirmatn',
  display: 'swap',
})

/* =======================
   Metadata (معادل <head>)
   ======================= */
export function generateViewport(): Viewport {
  return {
    themeColor: "#000000",
  };
}
export const metadata: Metadata = {
  title: 'لِس (l1s) | کوتاه‌کننده لینک',
  description: 'سرویس کوتاه‌کننده لینک سریع، امن و حرفه‌ای',
  applicationName: 'l1s',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  metadataBase: new URL('https://l1s.ir'),
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body>
        {/* ========= Schema.org: WebSite ========= */}
        <Script
          id="schema-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'لِس',
              url: 'https://l1s.ir/',
              description:
                'سرویس کوتاه‌کننده لینک سریع، امن و حرفه‌ای',
              potentialAction: {
                '@type': 'SearchAction',
                target:
                  'https://a.l1s.ir/?q={search_term_string}',
                'query-input':
                  'required name=search_term_string',
              },
            }),
          }}
        />

        {/* ========= Schema.org: Organization ========= */}
        <Script
          id="schema-organization"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'لِس',
              url: 'https://l1s.ir',
              logo: 'https://a.l1s.ir/favicon.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+989960074607',
                contactType: 'customer support',
              },
            }),
          }}
        />

        {/* ========= NoScript ========= */}
        <noscript>
          برای استفاده بهتر از سرویس کوتاه‌کننده لینک لِس (l1s)
          لطفاً جاوااسکریپت را فعال کنید.
        </noscript>

        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
