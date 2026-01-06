import './globals.css'

export const metadata = {
  title: 'Client Contact AI - Multi-Channel Outreach Platform | AI Lead Strategies',
  description: 'Manage all your social media and communication channels from one powerful AI-driven dashboard. Connect with leads across 22+ platforms including LinkedIn, Instagram, Facebook, Twitter, Email, SMS and more.',
  keywords: 'multi-channel outreach, social media management, unified inbox, AI marketing, lead generation, omnichannel marketing',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <script src="https://code.iconify.design/2/2.2.1/iconify.min.js"></script>
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}

