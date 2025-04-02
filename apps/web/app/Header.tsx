'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Header() {
  // login
  const router = useRouter();

  return (
    <header className="bg-background sticky top-0 z-50 flex h-16 w-full items-center justify-between p-4">
      <Image src="/logo.png" alt="logo" width={64} height={64} onClick={() => router.push('/')} />
      <User className="cursor-pointer" onClick={() => router.push('/login')} />
    </header>
  );
}
