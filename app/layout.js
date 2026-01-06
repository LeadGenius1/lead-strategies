import './globals.css'
import Navigation from '../components/Navigation'

export const metadata = {
  title: 'LeadSite.AI - Email Campaigns & Lead Management',
  description: 'Automate your email campaigns and manage leads efficiently',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth bg-[#030303]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="text-slate-400 antialiased selection:bg-white/10 selection:text-white relative overflow-x-hidden font-geist-mono">
        <script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          async
        ></script>
        <script
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

