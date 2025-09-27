import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'

// context برای Helmet (مدیریت تگ‌های <head>)
const helmetContext: Record<string, any> = {}

export async function prerender({ url }: { url: string }) {
  // رندر سروری اپلیکیشن
  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  )

  // استخراج متاها و تگ‌های head از helmet
  const { helmet } = helmetContext

  return {
    html: appHtml,
    head: `
      ${helmet.title?.toString() || ''}
      ${helmet.meta?.toString() || ''}
      ${helmet.link?.toString() || ''}
    `,
    // می‌تونی لینک‌های جدید برای کرال اتومات اضافه کنی
    // links: new Set(['/extra-route']),
    // داده‌های اولیه برای کلاینت
    // data: { foo: 'bar' }
  }
}
