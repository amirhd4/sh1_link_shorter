import './globals.css'
// import { Geist, Geist_Mono } from 'next/font/google'
import ClientProviders from './providers'
import localFont from 'next/font/local'

const myFont = localFont({
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
  variable: '--font-my',
  display: 'swap',
})

// const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
// const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa">
      <body dir="rtl" className="{myFont.variable}">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
