import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import LoadingOverlay from '@/components/LoadingOverlay';
import MessageDialog from '@/components/messageDialog';

import ErrorWrapper from './ErrorWrapper';
import Footer from './Footer';
import Header from './Header';
import AuthProvider from './auth';
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
            <AuthProvider>
              <div className="bg-secondary relative flex h-full w-[360px] flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>

              <Toaster
                duration={2000}
                position="top-center"
                toastOptions={{
                  style: {
                    maxWidth: '360px',
                  },
                }}
              />

              <MessageDialog />
              <LoadingOverlay />
              <Analytics />
              <SpeedInsights />
            </AuthProvider>
          </QueryProvider>
        </ErrorWrapper>
      </body>
    </html>
  );
}
