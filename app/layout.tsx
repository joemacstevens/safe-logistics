import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeLogistics - Trade Show Logistics Management",
  description: "AI-powered logistics assistant for coordinating safe storage and transport across trade shows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-display">
        {children}
      </body>
    </html>
  );
}
