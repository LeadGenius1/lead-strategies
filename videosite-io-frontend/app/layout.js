import './globals.css'
import Navigation from '../components/Navigation'

export const metadata = {
  title: 'VideoSite.IO - Video-First Lead Generation Platform',
  description: 'AI-powered video campaigns, video landing pages, and interactive video funnels',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-gold-500 selection:text-void font-sans">
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}

