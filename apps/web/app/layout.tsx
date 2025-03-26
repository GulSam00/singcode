import type { Metadata } from 'next';

import ErrorWrapper from './ErrorWrapper';
import Footer from './footer';
import './globals.css';
import QueryProvider from './query';

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
  );
}
