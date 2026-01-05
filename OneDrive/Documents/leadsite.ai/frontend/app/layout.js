import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Lead Strategies | ONE PLATFORM INFINITE REVENUE',
  description: 'The Only Growth Engine You\'ll Ever Need - Multi-channel outreach, AI-powered lead generation, and complete marketing automation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden`}>
        {/* Ambient Space Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="stars absolute w-[1px] h-[1px] bg-transparent rounded-full opacity-50"></div>
          <div className="absolute inset-0 bg-grid opacity-30"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-glow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
