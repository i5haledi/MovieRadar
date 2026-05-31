import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MovieRadar",
  description: "Browse upcoming theatrical movie releases powered by TMDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

