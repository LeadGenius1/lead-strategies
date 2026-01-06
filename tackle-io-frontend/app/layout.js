import './globals.css'

export const metadata = {
  title: 'Tackle.IO - Enterprise Lead Generation Platform',
  description: 'API-powered lead generation with white-label solutions, video capabilities, and enterprise features. Manage 10,000+ leads with NASA Control precision.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>{children}</body>
    </html>
  )
}

