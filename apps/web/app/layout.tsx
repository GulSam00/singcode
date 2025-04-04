import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import { MessageDialog } from '@/components/messageDialog';

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
                  // classNames: {
                  //   toast:
                  //     'group toast group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border group-[.toast]:shadow-lg',
                  //   title: 'text-foreground font-semibold text-sm',
                  //   description: 'text-muted-foreground text-sm',
                  //   success:
                  //     'group-[.toast]:bg-green-500 group-[.toast]:text-white group-[.toast]:border-green-500',
                  //   error:
                  //     'group-[.toast]:bg-destructive group-[.toast]:text-white group-[.toast]:border-destructive',
                  // },
                }}
              />

              <MessageDialog />
            </AuthProvider>
          </QueryProvider>
        </ErrorWrapper>
      </body>
    </html>
  );
}
