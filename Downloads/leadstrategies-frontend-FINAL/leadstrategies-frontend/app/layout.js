import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'AI Lead Strategies',
  description: 'Unified platform for lead generation and customer engagement - LeadSite.AI, LeadSite.IO, ClientContact.IO, Tackle.IO, VideoSite.IO',
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
