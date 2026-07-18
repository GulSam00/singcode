import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import { Toaster } from 'sonner';

import ErrorWrapper from '@/ErrorWrapper';
import Footer from '@/Footer';
import Header from '@/Header';
import AuthProvider from '@/auth';
import MessageDialog from '@/components/MessageDialog';
import PWARegister from '@/components/PWARegister';
import PromotionBanner from '@/components/PromotionBanner';
import '@/globals.css';
// import { PostHogProvider } from '@/posthog';
import QueryProvider from '@/query';

const isDevelopment = process.env.NODE_ENV === 'development';

export const metadata: Metadata = {
  title: 'Singcode - 노래방 번호 검색',
  description: 'Singcode에서 빠르고 편하게 노래방 번호 검색하세요. J-POP 검색도 지원합니다.',
  openGraph: {
    title: 'Singcode - 노래방 번호 검색',
    description: 'Singcode에서 빠르고 편하게 노래방 번호 검색하세요. J-POP 검색도 지원합니다.',
    url: 'https://www.singcode.kr',
    siteName: 'Singcode',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Singcode 썸네일 이미지',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Singcode - 노래방 번호 검색',
    description: 'Singcode에서 빠르고 편하게 노래방 번호 검색하세요. J-POP 검색도 지원합니다.',
    images: ['/icons/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const MonitoringScripts = () => {
    if (isDevelopment) return null;

    return (
      <>
        {/* 구글 애널리틱스 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3KPK2T7ZT7"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3KPK2T7ZT7');
          `}
        </Script>

        {/* 홈페이지 분석 */}
        {/* <Script id="hotjar" strategy="lazyOnload">
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
        </Script> */}
      </>
    );
  };

  const MonitoringComponent = () => {
    if (isDevelopment) return null;

    return (
      <>
        <Analytics />
        <SpeedInsights />
      </>
    );
  };

  const AppContent = () => (
    <ErrorWrapper>
      <div className="relative flex h-full w-full max-w-md flex-col">
        <Header />
        <div className="h-full p-4">{children}</div>

        <div className="pointer-events-none fixed bottom-10 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-1 pb-1">
          <div className="pointer-events-auto">
            <PromotionBanner />
          </div>
        </div>

        <Footer />
      </div>

      <Toaster
        closeButton
        duration={2000}
        position="top-center"
        toastOptions={{
          style: {
            maxWidth: '360px',
          },
        }}
      />

      <MessageDialog />
      <MonitoringComponent />
      <PWARegister />
    </ErrorWrapper>
  );

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <MonitoringScripts />
        <meta name="theme-color" content="#1a1a2e" />
        <meta name="naver-site-verification" content="85db7c6070d2f26d08e995cdab5a70caac28e80d" />
      </head>
      <body className="m-0 flex h-dvh w-full justify-center">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
