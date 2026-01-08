import './globals.css'
import Script from 'next/script'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'LeadSite.IO - Website + Email Lead Generation Platform',
  description: 'Professional lead generation with website integration and email campaigns. Manage 100+ leads with Aether UI precision.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <body style={{ fontFamily: 'var(--font-inter)' }}>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  )
}

