import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "AI Lead Strategies - One Platform, Infinite Revenue",
  description: "Automated B2B Marketing Ecosystem. Lead generation, website building, omnichannel outreach, and enterprise sales automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden min-h-screen">
        {/* AETHER ambient space background */}
        <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
          <div className="aether-stars absolute w-px h-px rounded-full opacity-50" />
          <div className="absolute inset-0 aether-bg-grid opacity-30" />
          <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] aether-glow-blob" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] aether-glow-blob aether-glow-blob-delay" />
        </div>
        <AuthProvider>
          <div className="relative z-10 min-h-screen">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
