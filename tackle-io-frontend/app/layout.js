import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata = {
  title: 'Tackle.IO - Enterprise Lead Generation Platform',
  description: 'API-powered lead generation with white-label solutions, video capabilities, and enterprise features. Manage 10,000+ leads with NASA Control precision.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <body style={{ fontFamily: 'var(--font-inter)' }}>{children}</body>
    </html>
  )
}

