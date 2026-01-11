import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Toaster } from 'sonner';

import ErrorWrapper from '@/ErrorWrapper';
import Footer from '@/Footer';
import Header from '@/Header';
import AuthProvider from '@/auth';
// import LoadingOverlay from '@/components/LoadingOverlay';
import MessageDialog from '@/components/messageDialog';
import '@/globals.css';
// import { PostHogProvider } from '@/posthog';
import QueryProvider from '@/query';

const isDevelopment = process.env.NODE_ENV === 'development';

export const metadata: Metadata = {
  title: 'Singcode - 당신의 노래방 메모장',
  description:
    '노래방만 가면 부르고 싶었던 노래가 기억 안 날 때? Singcode에서 검색하고 저장하면 걱정 끝!',
  openGraph: {
    title: 'Singcode - 노래방에서 부를 곡, 기억하지 말고 저장하세요',
    description: '노래방 갈 때마다 잊어버리는 곡번호? Singcode가 대신 기억할게요!',
    url: 'https://www.singcode.kr',
    siteName: 'Singcode',
    images: [
      {
        url: '/thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'Singcode 썸네일 이미지',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Singcode - 노래방에서 부를 곡, 기억하지 말고 저장하세요',
    description: '노래방 갈 때마다 잊어버리는 곡번호? Singcode가 대신 기억할게요!',
    images: ['/thumbnail.png'],
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
        <div className="h-full p-4 shadow-sm">{children}</div>

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
      {/* <LoadingOverlay /> */}
      <MonitoringComponent />
    </ErrorWrapper>
  );

  return (
    <html lang="ko">
      <head>
        <MonitoringScripts />
        <meta name="naver-site-verification" content="85db7c6070d2f26d08e995cdab5a70caac28e80d" />
      </head>
      <body className="m-0 flex h-dvh w-full justify-center">
        <QueryProvider>
          <AuthProvider>
            <AppContent />
            {/* {isDevelopment ? (
              <AppContent />
            ) : (
              <PostHogProvider>
                <AppContent />
              </PostHogProvider>
            )} */}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
