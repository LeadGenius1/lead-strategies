import './globals.css'
import Navigation from '../components/Navigation'

export const metadata = {
  title: 'LeadSite.AI - Email Campaigns & Lead Management',
  description: 'Automate your email campaigns and manage leads efficiently',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}

