import './globals.css'
import Script from 'next/script'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata = {
  title: 'Client Contact AI - Multi-Channel Outreach Platform | AI Lead Strategies',
  description: 'Manage all your social media and communication channels from one powerful AI-driven dashboard. Connect with leads across 22+ platforms including LinkedIn, Instagram, Facebook, Twitter, Email, SMS and more.',
  keywords: 'multi-channel outreach, social media management, unified inbox, AI marketing, lead generation, omnichannel marketing',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetBrainsMono.variable}`}>
      <body style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
        {children}
        <Script src="https://code.iconify.design/2/2.2.1/iconify.min.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}

