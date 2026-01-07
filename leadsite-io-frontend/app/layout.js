import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'LeadSite.IO - Website + Email Lead Generation Platform',
  description: 'Professional lead generation with website integration and email campaigns. Manage 100+ leads with Aether UI precision.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  )
}

