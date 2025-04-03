'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/lib/store/useAuthStore';

export default function Header() {
  // login
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-background sticky top-0 z-50 flex h-16 w-full items-center justify-between p-4">
      <Image src="/logo.png" alt="logo" width={64} height={64} onClick={() => router.push('/')} />

      <div onClick={() => handleLogout()}>로그아웃</div>
      <User className="cursor-pointer" onClick={() => router.push('/login')} />
    </header>
  );
}
