import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'AI Lead Strategies',
  description: 'Unified platform for lead generation and customer engagement - LeadSite.AI, LeadSite.IO, ClientContact.IO, Tackle.IO, VideoSite.IO',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
