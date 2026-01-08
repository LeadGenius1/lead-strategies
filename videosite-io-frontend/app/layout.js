import './globals.css'
import Navigation from '../components/Navigation'
import { Cinzel, Manrope } from 'next/font/google'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata = {
  title: 'VideoSite.IO - Video-First Lead Generation Platform',
  description: 'AI-powered video campaigns, video landing pages, and interactive video funnels',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`scroll-smooth ${cinzel.variable} ${manrope.variable}`}>
      <body className="antialiased selection:bg-gold-500 selection:text-void" style={{ fontFamily: 'var(--font-manrope)' }}>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}



