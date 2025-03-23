import type { Metadata } from 'next'
import QueryProvider from './query'
import './globals.css'

export const metadata: Metadata = {
  title: 'Singcode',
  description: 'Singcode',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="text-primary bg-background">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
