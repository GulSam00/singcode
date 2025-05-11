import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Toaster } from 'sonner';

import ErrorWrapper from '@/ErrorWrapper';
import Footer from '@/Footer';
import Header from '@/Header';
import AuthProvider from '@/auth';
import LoadingOverlay from '@/components/LoadingOverlay';
import MessageDialog from '@/components/messageDialog';
import '@/globals.css';
import { PostHogProvider } from '@/posthog';
import QueryProvider from '@/query';

export const metadata: Metadata = {
  title: 'Singcode - 간편하게 노래를 저장하세요!',
  description: '노래방만 가면 뭐 부를지 고민한다면?',
  openGraph: {
    title: 'Singcode - 간편하게 노래를 저장하세요!',
    description: '노래방만 가면 뭐 부를지 고민한다면?',
    url: 'https://singcode.vercel.app/',
    siteName: 'Singcode',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G0D5K3CWNL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G0D5K3CWNL');
          `}
        </Script>

        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:6385056,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      </head>
      <body className="m-0 flex h-[100dvh] w-full justify-center">
        <QueryProvider>
          <AuthProvider>
            <PostHogProvider>
              <ErrorWrapper>
                <div className="relative flex h-full w-[360px] flex-col">
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
              </ErrorWrapper>
            </PostHogProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
