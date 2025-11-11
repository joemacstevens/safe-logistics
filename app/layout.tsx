import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Safe Logistics - Next.js + Supabase",
  description: "Next.js application with Supabase integration, ready to deploy on Vercel",
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
