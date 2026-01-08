import './globals.css'
import Navigation from '../components/Navigation'
import Script from 'next/script'
import { GeistSans, GeistMono } from 'geist/font'
import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata = {
  title: 'LeadSite.AI - Email Campaigns & Lead Management',
  description: 'Automate your email campaigns and manage leads efficiently',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`scroll-smooth bg-[#030303] ${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable}`}>
      <body className="text-slate-400 antialiased selection:bg-white/10 selection:text-white relative overflow-x-hidden" style={{ fontFamily: 'var(--font-geist-mono)' }}>
        <Script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          strategy="afterInteractive"
        />
        <Script
          id="unicorn-studio"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(){if(!window.UnicornStudio){window.UnicornStudio={isInitialized:!1};var i=document.createElement("script");i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js",i.onload=function(){window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)},(document.head || document.body).appendChild(i)}}();`,
          }}
        />
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}

