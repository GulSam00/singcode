import type { Metadata } from 'next'
import QueryProvider from './query'
import ErrorWrapper from '@/errorWrapper'
import Footer from './footer'

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
      <body className="m-0 flex h-[100dvh] w-full justify-center">
        <ErrorWrapper>
          <QueryProvider>
            <div className="bg-secondary flex h-full w-[360px] flex-col">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </QueryProvider>
        </ErrorWrapper>
      </body>
    </html>
  )
}
