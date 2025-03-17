import type { Metadata } from 'next';
import QueryProvider from './query';

// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

export const metadata: Metadata = {
  title: 'Singcode',
  description: 'Singcode',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <body className={`${geistSans.variable} ${geistMono.variable}`}> */}
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
