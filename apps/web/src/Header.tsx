'use client';

import { useRouter } from 'next/navigation';

import Sidebar from './Sidebar';

export default function Header() {
  const router = useRouter();

  return (
    <header className="bg-background sticky top-0 z-50 flex h-16 w-[360px] items-center justify-between p-2 shadow-sm">
      <div
        className="font-barcode hover:text-accent cursor-pointer text-5xl transition-colors"
        onClick={() => router.push('/')}
      >
        SINGCODE
      </div>

      <Sidebar />
    </header>
  );
}
