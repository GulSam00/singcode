'use client';

import { MessageCircleQuestion } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import Sidebar from './Sidebar';

export default function Header() {
  const router = useRouter();
  const handleClickContact = () => {
    const contactUrl = 'https://walla.my/survey/K79c5bC6alDqc1qiaaES';
    window.open(contactUrl, '_blank');
  };

  return (
    <header className="bg-background sticky top-0 z-50 flex h-16 w-full max-w-md items-center justify-between p-2 shadow-sm">
      <div
        className="font-barcode hover:text-accent cursor-pointer text-5xl transition-colors"
        onClick={() => router.push('/')}
      >
        SINGCODE
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="justify-start" onClick={() => handleClickContact()}>
          <MessageCircleQuestion className="h-4 w-4" />
          문의
        </Button>

        <Sidebar />
      </div>
    </header>
  );
}
