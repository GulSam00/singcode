'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Sidebar from './Sidebar';

export default function Header() {
  const router = useRouter();

  return (
    <header className="bg-background sticky top-0 z-50 flex h-16 w-[360px] items-center justify-between p-4 shadow-sm">
      <Image src="/logo.png" alt="logo" width={64} height={64} onClick={() => router.push('/')} />

      <Sidebar />
    </header>
  );
}
