import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
